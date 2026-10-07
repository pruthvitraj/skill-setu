const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createOpenRouterAdapter,ENDPOINT,FREE_MODEL}=require('../src/integrations/ai/openrouter');
const provider=require('../src/integrations/ai/learning-provider');
const env=require('../src/config/env');
const {validateAssignment}=require('../src/modules/skills/practice.service');
const {validateGeneratedRoadmap}=require('../src/modules/roadmap/roadmap.ai');
const key=()=>crypto.randomBytes(16).toString('hex');
const ok=value=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}));
const make=options=>createOpenRouterAdapter({key:key(),model:FREE_MODEL,...options});
function select(t){const old={aiProvider:env.aiProvider,openrouterKey:env.openrouterKey,openrouterModel:env.openrouterModel};Object.assign(env,{aiProvider:'openrouter',openrouterKey:key(),openrouterModel:FREE_MODEL});t.after(()=>Object.assign(env,old));}

test('free-only bearer request uses prompt JSON and no plugins or response_format',async()=>{
 const secret=key();const adapter=make({key:secret,fetchImpl:async(url,options)=>{
 assert.equal(url,ENDPOINT);assert.equal(options.headers.Authorization,`Bearer ${secret}`);
 const body=JSON.parse(options.body);assert.equal(body.model,FREE_MODEL);assert.equal(body.max_tokens,8192);assert.equal(body.stream,false);
 assert.match(body.messages[0].content,/single valid JSON object only/);
 for(const field of ['response_format','models','plugins','tools','route'])assert.equal(body[field],undefined);
 assert.deepEqual(body.provider,{allow_fallbacks:false,max_price:{prompt:0,completion:0}});return ok({valid:true});
 }});assert.deepEqual(await adapter.completeJson('system','synthetic',{maxTokens:99999}),{valid:true});
});
test('paid, alternate free, search and automatic model IDs are rejected before network',()=>{
 for(const model of [FREE_MODEL.replace(':free',''),'other/model:free',FREE_MODEL+':online','openrouter/free','openrouter/auto',''])
 assert.throws(()=>make({model,fetchImpl:()=>assert.fail('must not call')}),e=>e.errorCode==='AI_CONFIG');
});
test('malformed, truncated and incomplete output is rejected',async()=>{
 for(const envelope of [
 {choices:[{finish_reason:'stop',message:{content:'invalid'}}]},
 {choices:[{finish_reason:'length',message:{content:'{}'}}]},
 {choices:[{finish_reason:'error',message:{content:'{}'}}]},
 {choices:[{message:{content:'{}'}}]}, {error:{message:'private body'}}])
 await assert.rejects(make({fetchImpl:async()=>new Response(JSON.stringify(envelope))}).completeJson('s','u'),e=>e.errorCode==='AI_INVALID_RESPONSE');
});
test('auth and quota failures are safe and suppress repeated calls',async()=>{
 for(const [status,code] of [[401,'AI_AUTH'],[403,'AI_AUTH'],[402,'AI_QUOTA'],[429,'AI_QUOTA']]){
 let calls=0;const secret=key();const adapter=make({key:secret,fetchImpl:async()=>{calls++;return new Response(secret,{status});}});
 for(let n=0;n<2;n++)await assert.rejects(adapter.completeJson('s','u'),e=>e.errorCode===code&&e.status===503&&!e.message.includes(secret));assert.equal(calls,1);
 }
});
test('explicit OpenRouter selection retains existing assignment and roadmap validators',async t=>{
 select(t);const assignment={title:'Synthetic task',brief:'Use synthetic data.',objectives:['Practise'],deliverables:['Explanation'],rubric:[{criterion:'Correctness',weight:50},{criterion:'Clarity',weight:50}]};
 let generated=assignment;t.mock.method(global,'fetch',async url=>{assert.equal(url,ENDPOINT);return ok(generated);});
 const result=await provider.generateJson('s','u',validateAssignment);assert.equal(result.provider,'openrouter');assert.equal(result.model,FREE_MODEL);assert.deepEqual(result.content,assignment);
 generated={summary:'Synthetic roadmap.',gapAnalysis:[],items:[1,2,3,4,5].map(phase=>({phase,type:'practice',title:'Learn',description:'Practise safely.'}))};
 assert.equal((await provider.generateJson('s','u',validateGeneratedRoadmap)).content.items.length,5);
 generated={...assignment,rubric:[]};await assert.rejects(provider.generateJson('s','u',validateAssignment),e=>e.errorCode==='AI_INVALID_RESPONSE');
});
test('explicit OpenRouter failure cannot fall back to other providers',async t=>{
 select(t);let calls=0;t.mock.method(global,'fetch',async url=>{assert.equal(url,ENDPOINT);calls++;return new Response('',{status:429});});
 for(const validate of [validateGeneratedRoadmap,validateAssignment])await assert.rejects(provider.generateJson('s','u',validate),e=>e.errorCode==='AI_QUOTA');assert.equal(calls,1);
});
