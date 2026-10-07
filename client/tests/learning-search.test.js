import test from 'node:test';
import assert from 'node:assert/strict';
import { createLearningSearch, initialLearningResults } from '../src/components/learning/learningSearchController.js';
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a;reject=b; }); return {promise,resolve,reject}; };
const result = label => ({data:{items:[{title:label}],cached:false}});

test('one submission starts both endpoints concurrently with the same trimmed query', async () => {
 const courses=deferred(),resources=deferred(),calls=[];let state=initialLearningResults();
 const search=createLearningSearch({youtube:q=>{calls.push(['youtube',q]);return courses.promise;},resources:q=>{calls.push(['resources',q]);return resources.promise;},onChange:value=>{state=value;}});
 const pending=search.search('  React Hooks  ');assert.deepEqual(calls,[['youtube','React Hooks'],['resources','React Hooks']]);assert.equal(state.courses.status,'loading');assert.equal(state.resources.status,'loading');
 courses.resolve(result('video'));await Promise.resolve();assert.equal(state.courses.status,'ready');assert.equal(state.resources.status,'loading');resources.resolve(result('docs'));await pending;assert.equal(state.resources.status,'ready');
});
test('partial failure retains successful results and retry only calls the failed group', async () => {
 let state,calls=0;const search=createLearningSearch({youtube:async()=>result('video'),resources:async()=>{if(++calls===1)throw {message:'quota exhausted'};return result('docs');},onChange:value=>{state=value;}});
 await search.search('SQL');assert.equal(state.courses.status,'ready');assert.equal(state.resources.status,'error');assert.equal(state.resources.error,'quota exhausted');const saved=state.courses;
 await search.retry('resources');assert.equal(state.courses,saved);assert.equal(state.resources.status,'ready');assert.equal(calls,2);
});
test('reverse partial failure does not hide successful resources', async () => {
 let state;const search=createLearningSearch({youtube:async()=>{throw {message:'missing key'};},resources:async()=>result('docs'),onChange:value=>{state=value;}});
 await search.search('Docker');assert.equal(state.courses.status,'error');assert.equal(state.resources.status,'ready');
});
test('older successes, failures and retries cannot overwrite newer searches', async () => {
 let state;const old=deferred(),oldResources=deferred();const search=createLearningSearch({youtube:q=>q==='React'?old.promise:Promise.resolve(result('Docker video')),resources:q=>q==='React'?oldResources.promise:Promise.resolve(result('Docker docs')),onChange:value=>{state=value;}});
 const pending=search.search('React');await search.search('Docker');old.resolve(result('old'));oldResources.reject({message:'old error'});await pending;assert.equal(state.courses.query,'Docker');assert.equal(state.resources.query,'Docker');assert.equal(state.resources.status,'ready');
});
test('invalid input makes no calls and empty results remain empty', async () => {
 let calls=0,state;const empty=async()=>{calls++;return {data:{items:[],cached:true}};};const search=createLearningSearch({youtube:empty,resources:empty,onChange:value=>{state=value;}});
 for(const input of ['', 'x', 'x'.repeat(101), 'React\nHooks'])assert.throws(()=>search.search(input),/2–100/);assert.equal(calls,0);
 await search.search('SQL');assert.equal(calls,2);assert.equal(state.courses.status,'ready');assert.deepEqual(state.courses.items,[]);assert.deepEqual(state.resources.items,[]);
});
test('unmount invalidation prevents later response callbacks', async () => {
 const pending=deferred();let updates=0;const search=createLearningSearch({youtube:()=>pending.promise,resources:()=>pending.promise,onChange:()=>updates++});const work=search.search('SQL');search.invalidate();const before=updates;pending.resolve(result('late'));await work;assert.equal(updates,before);
});
