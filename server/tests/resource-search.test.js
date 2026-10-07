const test=require('node:test');
const assert=require('node:assert/strict');
const {createResourceSearch,queryText,ENDPOINT}=require('../src/modules/courses/resource-search.service');
const key=require('node:crypto').randomBytes(16).toString('hex');
const doc={title:'Learning documentation',url:'https://react.dev/learn',content:'Official learning reference.'};
const article={title:'Learning article',url:'https://www.freecodecamp.org/news/example/',content:'A learning tutorial.'};
const repo={title:'Learning repository',url:'https://github.com/example/learning',content:'A public indexed repository.'};
const ok=results=>new Response(JSON.stringify({results,answer:'THIS GENERATED ANSWER MUST NEVER BE USED'}));
function resultsFor(body){return body.include_domains.includes('github.com')?[repo]:body.include_domains.includes('freecodecamp.org')?[article]:[doc];}

test('React, SQL and Docker search the real API contract across all three supported types; no generated answer',async()=>{
 for(const query of ['React','SQL','Docker']){
 let calls=0;const service=createResourceSearch({key,fetchImpl:async(url,options)=>{
 calls++;assert.equal(url,ENDPOINT);assert.equal(options.headers.Authorization,`Bearer ${key}`);assert.equal(options.redirect,'error');
 const body=JSON.parse(options.body);assert.ok(body.query.startsWith(query+' '));assert.equal(body.search_depth,'basic');assert.equal(body.auto_parameters,false);assert.equal(body.max_results,3);assert.equal(body.include_answer,false);assert.equal(body.include_raw_content,false);assert.equal(body.include_domains_mode,'restrict');assert.deepEqual(body.exclude_domains,['youtube.com','youtu.be']);return ok(resultsFor(body));
 }});
 const result=await service.search(query);assert.equal(calls,3);assert.deepEqual(result.items.map(item=>item.type),['documentation','article','repository']);
 assert.equal(result.items[0].url,doc.url);assert.equal(result.items[1].title,article.title);assert.equal(result.items[2].source,'github.com');assert.equal(result.items[2].description,repo.content);assert.ok(result.retrievedAt);assert.equal(JSON.stringify(result).includes('GENERATED ANSWER'),false);assert.equal(JSON.stringify(result).includes(key),false);
 }
});
test('missing configuration and invalid topics cannot spend requests',async()=>{
 for(const input of ['', 'x', ['React'], 'x'.repeat(101), 'React\nSQL'])assert.throws(()=>queryText(input),e=>e.errorCode==='RESOURCE_QUERY_INVALID');
 for(const input of ['React','SQL','Docker'])await assert.rejects(createResourceSearch({key:'',fetchImpl:()=>assert.fail('must not fetch')}).search(input),e=>e.errorCode==='RESOURCE_CONFIG'&&e.message.includes('TAVILY_API_KEY')&&e.message.includes('restart'));
});
test('normalized repeated/concurrent searches are cached, original date preserved, expiry causes new retrieval',async()=>{
 let calls=0,clock=1000;const service=createResourceSearch({key,now:()=>clock,fetchImpl:async(url,options)=>{calls++;return ok(resultsFor(JSON.parse(options.body)));}});
 const [first,second]=await Promise.all([service.search('React Hooks'),service.search('react  hooks')]);assert.equal(calls,3);assert.equal(first.items.length,second.items.length);
 clock=2000;const cached=await service.search('REACT HOOKS');assert.equal(cached.cached,true);assert.equal(cached.retrievedAt,first.retrievedAt);assert.equal(calls,3);
 clock=901001;await service.search('React Hooks');assert.equal(calls,6);
});
test('only returned supported HTTPS URLs are shown; YouTube, fake hosts and non-repository links excluded',async()=>{
 const service=createResourceSearch({key,fetchImpl:async(url,options)=>{
 const body=JSON.parse(options.body),valid=resultsFor(body);
 return ok([...valid,{...valid[0],url:'https://youtube.com/watch?v=fake'},{...valid[0],url:'javascript:alert(1)'},{...valid[0],url:'https://react.dev.evil.example/learn'}]);}});
 const result=await service.search('React');assert.equal(result.items.length,3);
 const other=createResourceSearch({key,fetchImpl:async()=>ok([{...repo,url:'https://github.com/example/learning/issues'},{...repo,url:'https://github.com/topics/react'}])});assert.deepEqual((await other.search('React')).items,[]);
});
test('empty results are honest; malformed and oversized responses fail without fabricated links',async()=>{
 assert.deepEqual((await createResourceSearch({key,fetchImpl:async()=>ok([])}).search('Docker')).items,[]);
 for(const raw of ['not JSON',JSON.stringify({answer:'fake links'}),'x'.repeat(262145)])await assert.rejects(createResourceSearch({key,fetchImpl:async()=>new Response(raw)}).search('Docker'),e=>e.errorCode==='RESOURCE_INVALID_RESPONSE');
});
test('quota and auth errors are sanitized and shared across future skill searches',async()=>{
 for(const [status,code] of [[401,'RESOURCE_CONFIG'],[403,'RESOURCE_CONFIG'],[402,'RESOURCE_QUOTA'],[429,'RESOURCE_QUOTA'],[432,'RESOURCE_QUOTA'],[433,'RESOURCE_QUOTA']]){
 let calls=0;const service=createResourceSearch({key,fetchImpl:async()=>{calls++;return new Response(key,{status});}});
 await assert.rejects(service.search('React'),e=>e.errorCode===code&&!e.message.includes(key));
 const initial=calls;await assert.rejects(service.search('Docker'),e=>e.errorCode===code);assert.equal(calls,initial);
 }
});
test('network errors and request timeouts are safe and retryable',async()=>{
 await assert.rejects(createResourceSearch({key,fetchImpl:async()=>{throw new Error(key);}}).search('React'),e=>e.errorCode==='RESOURCE_PROVIDER'&&!e.message.includes(key));
 await assert.rejects(createResourceSearch({key,timeoutMs:10,fetchImpl:(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error(key))))}).search('React'),e=>e.errorCode==='RESOURCE_TIMEOUT');
});
test('resource route requires student access and does not change catalog access',async t=>{
 const express=require('express'),http=require('node:http');const User=require('../src/models/User'),sessions=require('../src/modules/auth/session.service'),resources=require('../src/modules/courses/resource-search.service'),courses=require('../src/modules/courses/course.service');const {signToken}=require('../src/utils/jwt');let role='student',calls=0;
 t.mock.method(User,'findById',async()=>({_id:'student-id',role,isActive:true,authVersion:0}));t.mock.method(sessions,'validateSession',async()=>({valid:true}));t.mock.method(resources,'search',async q=>{calls++;return {query:q,items:[]};});t.mock.method(courses,'list',async()=>({items:[]}));
 const app=express();app.use('/courses',require('../src/modules/courses/course.routes'));app.use((err,req,res,next)=>res.status(err.status||500).json({errorCode:err.errorCode}));const server=http.createServer(app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));const base=`http://127.0.0.1:${server.address().port}`;
 assert.equal((await fetch(`${base}/courses/resources?q=React`)).status,401);const headers={Authorization:`Bearer ${signToken({sub:'student-id',sid:'test',av:0})}`};for(role of ['recruiter','tpo'])assert.equal((await fetch(`${base}/courses/resources?q=React`,{headers})).status,403);assert.equal(calls,0);role='student';assert.equal((await fetch(`${base}/courses/resources?q=React`,{headers})).status,200);role='tpo';assert.equal((await fetch(`${base}/courses`,{headers})).status,200);
});
