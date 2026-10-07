const test=require('node:test');
const assert=require('node:assert/strict');
const {createYouTubeSearch,normalizeQuery,ENDPOINT,LIMIT}=require('../src/modules/courses/youtube.service');
const key=require('node:crypto').randomBytes(16).toString('hex');
const video={id:{kind:'youtube#video',videoId:'abcdefghijk'},snippet:{title:'React Hooks &amp; State',channelTitle:'Education Channel',thumbnails:{medium:{url:'https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg'}}}};
const playlist={id:{kind:'youtube#playlist',playlistId:'PL12345'},snippet:{title:'Learn React',channelTitle:'Education Channel',thumbnails:{default:{url:'https://i.ytimg.com/vi/abcdefghijk/default.jpg'}}}};
const ok=items=>new Response(JSON.stringify({items}),{headers:{'content-type':'application/json'}});

test('official search returns actual video/playlist metadata and bounded query',async()=>{
 const search=createYouTubeSearch({key,fetchImpl:async(input,options)=>{
 const url=new URL(input);assert.equal(url.origin+url.pathname,ENDPOINT);assert.equal(url.searchParams.get('key'),key);
 assert.equal(url.searchParams.get('q'),'React Hooks tutorial');assert.equal(url.searchParams.get('type'),'video,playlist');assert.equal(url.searchParams.get('maxResults'),String(LIMIT));assert.equal(options.redirect,'error');return ok([video,playlist]);
 }});
 const result=await search.search(' React  Hooks ');assert.equal(result.items.length,2);assert.equal(result.items[0].title,'React Hooks & State');assert.equal(result.items[0].channel,'Education Channel');assert.equal(result.items[0].thumbnail,video.snippet.thumbnails.medium.url);assert.equal(result.items[0].url,'https://www.youtube.com/watch?v=abcdefghijk');assert.equal(result.items[1].type,'playlist');assert.equal(result.items[1].url,'https://www.youtube.com/playlist?list=PL12345');assert.equal(JSON.stringify(result).includes(key),false);
});
test('invalid searches and missing key fail before retrieval',async()=>{
 for(const value of ['', 'a','x'.repeat(101),['React'],'React\nHooks',null])assert.throws(()=>normalizeQuery(value),e=>e.errorCode==='YOUTUBE_QUERY_INVALID');
 await assert.rejects(createYouTubeSearch({key:'',fetchImpl:()=>assert.fail('must not fetch')}).search('Docker'),e=>e.errorCode==='YOUTUBE_CONFIG');
});
test('repeated and simultaneous normalized searches use one request; cache expires',async()=>{
 let now=0,calls=0,release;const service=createYouTubeSearch({key,now:()=>now,fetchImpl:async()=>{calls++;if(calls===1)await new Promise(resolve=>{release=resolve;});return ok([video]);}});
 const a=service.search('React Hooks'),b=service.search('react  hooks');release();await Promise.all([a,b]);assert.equal(calls,1);
 now=1000;assert.equal((await service.search('REACT HOOKS')).cached,true);assert.equal(calls,1);now=900001;assert.equal((await service.search('React Hooks')).cached,false);assert.equal(calls,2);
});
test('quota failure is honest, does not leak key or repeatedly spend quota; cached data still works',async()=>{
 let calls=0,now=0;const service=createYouTubeSearch({key,now:()=>now,fetchImpl:async()=>{calls++;return calls===1?ok([video]):new Response(JSON.stringify({error:{message:key,errors:[{reason:'quotaExceeded'}]}}),{status:403});}});
 await service.search('React');for(const query of ['SQL joins','Docker'])await assert.rejects(service.search(query),e=>e.errorCode==='YOUTUBE_QUOTA'&&e.status===503&&!e.message.includes(key));assert.equal(calls,2);assert.equal((await service.search('React')).cached,true);
 now=3600001;await assert.rejects(service.search('Docker'),e=>e.errorCode==='YOUTUBE_QUOTA');assert.equal(calls,3);
});
test('key/access rejection suppresses further requests without logging provider details',async()=>{
 let calls=0;const service=createYouTubeSearch({key,fetchImpl:async()=>{calls++;return new Response(JSON.stringify({error:{message:key,errors:[{reason:'keyInvalid'}]}}),{status:400});}});
 for(const query of ['React','Docker'])await assert.rejects(service.search(query),e=>e.errorCode==='YOUTUBE_CONFIG'&&!e.message.includes(key));assert.equal(calls,1);
});
test('empty searches are real empty results; malformed, partial and oversized responses fail',async()=>{
 assert.deepEqual((await createYouTubeSearch({key,fetchImpl:async()=>ok([])}).search('Docker')).items,[]);
 for(const response of [new Response('not json'),ok([{id:{kind:'youtube#channel'}}]),new Response(JSON.stringify({error:{}})),new Response('x'.repeat(262145))])await assert.rejects(createYouTubeSearch({key,fetchImpl:async()=>response}).search('Docker'),e=>e.errorCode==='YOUTUBE_INVALID_RESPONSE');
});
test('thumbnail URLs are restricted, results capped and duplicate resources removed',async()=>{
 const unsafe={...video,snippet:{...video.snippet,thumbnails:{medium:{url:'https://malicious.example/img'}}}};
 const result=await createYouTubeSearch({key,fetchImpl:async()=>ok(Array(10).fill(unsafe))}).search('React');assert.equal(result.items.length,1);assert.equal(result.items[0].thumbnail,null);
});
test('timeouts and provider/network failures return safe retryable errors',async()=>{
 await assert.rejects(createYouTubeSearch({key,timeoutMs:10,fetchImpl:(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error(key))))}).search('Docker'),e=>e.errorCode==='YOUTUBE_TIMEOUT'&&!e.message.includes(key));
 await assert.rejects(createYouTubeSearch({key,fetchImpl:async()=>{throw new Error(key);}}).search('Docker'),e=>e.errorCode==='YOUTUBE_PROVIDER'&&!e.message.includes(key));
 await assert.rejects(createYouTubeSearch({key,fetchImpl:async()=>new Response(JSON.stringify({error:{message:key}}),{status:500})}).search('Docker'),e=>e.errorCode==='YOUTUBE_PROVIDER'&&!e.message.includes(key));
});

test('YouTube endpoint requires an authenticated student and leaves catalog routes available',async t=>{
 const express=require('express');const http=require('node:http');
 const User=require('../src/models/User');const sessions=require('../src/modules/auth/session.service');
 const youtube=require('../src/modules/courses/youtube.service');const courses=require('../src/modules/courses/course.service');
 const {signToken}=require('../src/utils/jwt');
 let role='student',searches=0;
 t.mock.method(User,'findById',async()=>({_id:'student-id',role,isActive:true,authVersion:0}));
 t.mock.method(sessions,'validateSession',async()=>({valid:true}));
 t.mock.method(youtube,'search',async q=>{searches++;return {query:q,items:[]};});
 t.mock.method(courses,'list',async()=>({items:[],pagination:{page:1,pages:1,total:0}}));
 const app=express();app.use('/courses',require('../src/modules/courses/course.routes'));
 app.use((err,req,res,next)=>res.status(err.status||500).json({errorCode:err.errorCode}));
 const server=http.createServer(app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 assert.equal((await fetch(`${base}/courses/youtube?q=React`)).status,401);
 const headers={Authorization:`Bearer ${signToken({sub:'student-id',sid:'test-session',av:0})}`};
 for(role of ['recruiter','tpo'])assert.equal((await fetch(`${base}/courses/youtube?q=React`,{headers})).status,403);
 assert.equal(searches,0);role='student';const result=await fetch(`${base}/courses/youtube?q=React`,{headers});assert.equal(result.status,200);assert.deepEqual((await result.json()).data.items,[]);assert.equal(searches,1);
 role='tpo';assert.equal((await fetch(`${base}/courses`,{headers})).status,200);
});
