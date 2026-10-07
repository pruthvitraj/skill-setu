import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSearchRecommendations } from '../src/components/learning/searchRecommendationRanking.js';
import { createLearningSearch, initialLearningResults } from '../src/components/learning/learningSearchController.js';
const result=items=>({data:{items}});
const video=(title,url)=>({title,url,type:'video',channel:'Returned channel'});
const doc=(title,description,url)=>({title,description,url,type:'documentation',source:'docs.example.test'});
const state=(query,courses=[],resources=[])=>({courses:{status:'ready',query,items:courses},resources:{status:'ready',query,items:resources}});

test('React Hooks, SQL joins and Docker rank exact official matches, preserve metadata and cap at three',()=>{
 for(const query of ['React Hooks','SQL joins','Docker']){
 const official=doc(query+' official guide','Learn '+query,'https://docs.example.test/'+encodeURIComponent(query));
 const exact=video(query+' tutorial','https://youtube.com/watch?v=fixture');
 const unrelated=video('Unrelated cooking','https://youtube.com/watch?v=unrelated');
 const general=doc('General introduction',query+' concepts','https://docs.example.test/introduction');
 const repo={title:query+' examples',source:'github.com',type:'repository',url:'https://github.com/fixture/examples'};
 const selected=selectSearchRecommendations(state(query,[exact,unrelated],[general,repo,official]));
 assert.equal(selected.length,3);assert.equal(selected[0].item,official);assert.equal(selected[1].item,exact);assert.ok(!selected.some(({item})=>item===unrelated));
 assert.equal(selected[0].item.title,official.title);assert.equal(selected[0].item.source,official.source);assert.equal(selected[0].item.url,official.url);
 }
});
test('no pre-search, failed, empty or unrelated results produce recommendations',()=>{
 assert.deepEqual(selectSearchRecommendations(initialLearningResults()),[]);
 assert.deepEqual(selectSearchRecommendations({courses:{status:'error'},resources:{status:'error'}}),[]);
 assert.deepEqual(selectSearchRecommendations(state('React Hooks',[video('React basics','https://example.test')],[doc('SQL joins','SQL query guide','https://docs.example.test')])),[]);
 assert.deepEqual(selectSearchRecommendations(state('Docker')),[]);
});
test('partial successes use only the successful current query; duplicate URLs are not padded',()=>{
 const item=video('Docker tutorial','https://youtube.com/watch?v=fixture');
 const selected=selectSearchRecommendations({courses:{status:'ready',query:'Docker',items:[item,item]},resources:{status:'error',query:'Docker',items:[]}});assert.equal(selected.length,1);assert.equal(selected[0].item,item);
 assert.equal(selectSearchRecommendations({courses:{status:'ready',query:'Docker',items:[item]},resources:{status:'ready',query:'SQL',items:[doc('SQL joins','SQL joins','https://docs.example.test')]}}).length,1);
});
test('new search clears old recommendations immediately and stale successes cannot restore them',async()=>{
 let state,releaseOld,releaseNew;const old=new Promise(resolve=>{releaseOld=resolve;}),latest=new Promise(resolve=>{releaseNew=resolve;});let calls=0;
 const search=createLearningSearch({youtube:q=>{calls++;return q==='React Hooks'?old:latest;},resources:async()=>{calls++;return result([]);},onChange:value=>{state=value;}});
 const previous=search.search('React Hooks');const newer=search.search('Docker');assert.deepEqual(selectSearchRecommendations(state),[]);
 releaseOld(result([video('React Hooks tutorial','https://youtube.com/watch?v=old')]));await previous;assert.deepEqual(selectSearchRecommendations(state),[]);
 releaseNew(result([video('Docker tutorial','https://youtube.com/watch?v=new')]));await newer;assert.equal(selectSearchRecommendations(state)[0].item.title,'Docker tutorial');assert.equal(calls,4);
 const pending=search.search('SQL joins');assert.deepEqual(selectSearchRecommendations(state),[]);await pending;assert.deepEqual(selectSearchRecommendations(state),[]);
});
