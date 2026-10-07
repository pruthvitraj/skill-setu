const test = require('node:test');
const assert = require('node:assert/strict');
const { createNvidiaAdapter } = require('../src/integrations/ai/nvidia');
const { createRetrieval } = require('../src/integrations/ai/roadmap-research');
const { groundRoadmap } = require('../src/modules/roadmap/roadmap.ai');
const crypto = require('node:crypto');
const key = () => crypto.randomBytes(16).toString('hex');
const ok = content => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) }, finish_reason: 'stop' }] }));
const make = options => createNvidiaAdapter({ key: key(), ...options });

test('NVIDIA request uses fixed endpoint, configured model, server bearer and bounded tokens', async () => {
  const secret = key();
  const adapter = make({ key: secret, model: 'configured-model', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://integrate.api.nvidia.com/v1/chat/completions');
    assert.equal(options.headers.Authorization, `Bearer ${secret}`);
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'configured-model'); assert.equal(body.max_tokens, 8192);
    assert.equal(body.stream, false); assert.equal(options.signal.aborted, false);
    return ok({ valid: true });
  }});
  assert.deepEqual(await adapter.completeJson('system', 'user', { maxTokens: 99999 }), { valid: true });
});

test('missing/incorrectly wrapped keys fail before network access', async () => {
  for (const value of ['', ' Bearer wrong ', 'Bearer wrong']) {
    await assert.rejects(make({ key: value, fetchImpl: () => { throw new Error('must not call'); } }).completeJson('s','u'), e => e.errorCode === 'AI_CONFIG');
  }
});

test('401 and 403 are safe server errors and suppress subsequent calls', async () => {
  for (const status of [401,403]) {
    let calls=0;
    const secret=key();
    const adapter=make({ key: secret, fetchImpl: async()=>{calls++;return new Response(secret,{status});} });
    for(let i=0;i<2;i++) await assert.rejects(adapter.completeJson('s','u'), e => e.errorCode==='AI_AUTH' && e.status===503 && e.upstreamStatus===status && !e.message.includes(secret));
    assert.equal(calls,1);
  }
});

test('quota cooldown suppresses requests until it expires', async () => {
  let clock=0, calls=0;
  const adapter=make({now:()=>clock,quotaCooldownMs:3600000,fetchImpl:async()=>{calls++;return calls===1?new Response('',{status:429,headers:{'retry-after':'60'}}):ok({valid:true});}});
  for(let i=0;i<2;i++) await assert.rejects(adapter.completeJson('s','u'), e=>e.errorCode==='AI_QUOTA');
  assert.equal(calls,1);clock=3600001;
  assert.deepEqual(await adapter.completeJson('s','u'),{valid:true});assert.equal(calls,2);
});

test('provider failures, malformed/truncated/oversized JSON are classified', async () => {
  await assert.rejects(make({fetchImpl:async()=>new Response('',{status:502})}).completeJson('s','u'),e=>e.errorCode==='AI_PROVIDER');
  const envelopes=[{}, {choices:[{message:{content:'not JSON'}}]}, {choices:[{message:{content:'{}'},finish_reason:'length'}]}, {choices:[{message:{content:JSON.stringify({text:'x'.repeat(140000)})}}]}];
  for(const value of envelopes) await assert.rejects(make({fetchImpl:async()=>new Response(JSON.stringify(value))}).completeJson('s','u'),e=>e.errorCode==='AI_INVALID_RESPONSE');
});

test('timeout and connection errors cannot leak raw errors', async () => {
  const adapter=make({timeoutMs:100,fetchImpl:(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('private transport detail'))))});
  await assert.rejects(adapter.completeJson('s','u'),e=>e.errorCode==='AI_TIMEOUT' && !e.message.includes('private'));
  await assert.rejects(make({fetchImpl:async()=>{throw new Error('private transport detail');}}).completeJson('s','u'),e=>e.errorCode==='AI_PROVIDER' && !e.message.includes('private'));
});

test('retrieval uses only fixed official URLs, bounded text and actual fetch dates; cache retains original dates', async () => {
  let calls=0, clock=1000;
  const retrieval=createRetrieval({now:()=>clock,fetchImpl:async(url, options)=>{
    calls++; assert.match(url,/^https:\/\/(docs\.python\.org|www\.postgresql\.org|airflow\.apache\.org)\//); assert.equal(options.redirect,'error');
    return new Response('<main><script>unsafe instructions</script><p>'+ 'Documented learning concepts. '.repeat(30)+'</p></main>',{headers:{'content-type':'text/html'}});
  }});
  const first=await retrieval.retrieve('Data Engineer');
  assert.equal(first.status,'retrieved');assert.equal(first.sources.length,3);
  assert.ok(first.sources.every(source=>source.retrievedAt===new Date(1000).toISOString() && !source.excerpt.includes('unsafe')));
  clock=2000;const cached=await retrieval.retrieve('Data Engineer');assert.equal(calls,3);assert.equal(cached.sources[0].retrievedAt,first.sources[0].retrievedAt);
  const unknown=await retrieval.retrieve('custom role https://localhost/secret');assert.equal(unknown.status,'unavailable');assert.equal(calls,3);
});

test('failed retrieval never invents attribution', async () => {
  const retrieval=createRetrieval({fetchImpl:async()=>new Response('redirect',{status:302})});
  const result=await retrieval.retrieve('Cloud Engineer');assert.equal(result.status,'failed');assert.deepEqual(result.sources,[]);
});

test('researched guidance accepts only fetched source IDs/URLs; ungrounded guidance is explicit', () => {
  const content={source:'ai',summary:'Study official references.',gapAnalysis:[],items:[]};
  const fetched={status:'retrieved',attemptedAt:new Date().toISOString(),sources:[{id:'python',title:'Python',url:'https://docs.python.org/3/tutorial/',retrievedAt:new Date().toISOString(),excerpt:'real retrieved excerpt',contentHash:'digest'}]};
  const result=groundRoadmap(content,{usedSourceIds:['python']},fetched);assert.equal(result.guidanceKind,'researched');assert.equal(result.research.sources[0].excerpt,undefined);
  assert.throws(()=>groundRoadmap(content,{usedSourceIds:['fabricated']},fetched),/attribute/);
  assert.throws(()=>groundRoadmap({...content,summary:'Read https://invented.example/guide'},{usedSourceIds:['python']},fetched),/unverified/);
  const fallback=groundRoadmap(content,{}, {status:'failed',attemptedAt:fetched.attemptedAt,sources:[]});assert.equal(fallback.guidanceKind,'ungrounded');assert.deepEqual(fallback.research.sources,[]);
});
