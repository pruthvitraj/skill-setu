const test=require('node:test');
const assert=require('node:assert/strict');
const provider=require('../src/integrations/ai/learning-provider');
const research=require('../src/integrations/ai/roadmap-research');
const studentService=require('../src/modules/student/student.service');
const Assignment=require('../src/models/PracticeAssignment');
const service=require('../src/modules/skills/practice.service');
const {ProviderError}=require('../src/integrations/ai/json-adapter');
const valid={title:'Synthetic exercise',brief:'Build an offline example.',objectives:['Practise'],deliverables:['Explanation'],rubric:[{criterion:'Correctness',weight:50},{criterion:'Clarity',weight:50}]};

test('assignment uses saved target role, current validator and existing draft fields',async t=>{
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student',targetRole:'Data Engineer',skills:[]}));
  t.mock.method(provider,'generateJson',async(system,user,validate)=>{assert.equal(JSON.parse(user).targetRole,'Data Engineer');assert.match(system,/synthetic data/);return {content:validate(valid),provider:'nvidia',model:'configured-model'};});
  t.mock.method(Assignment,'create',async value=>{assert.equal(value.student,'student');assert.equal(value.targetRole,'Data Engineer');assert.equal(value.source,'ai');assert.equal(value.provider,'nvidia');assert.equal(value.score,undefined);return value;});
  assert.equal((await service.generate('owner')).title,valid.title);
});

test('missing saved role or provider auth failure creates no assignment',async t=>{
  let creates=0;
  t.mock.method(Assignment,'create',async()=>{creates++;});
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student'}));
  await assert.rejects(service.generate('owner'),e=>e.errorCode==='TARGET_REQUIRED');
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student',targetRole:'Cloud Engineer'}));
  t.mock.method(provider,'generateJson',async()=>{throw new ProviderError('NVIDIA','AI_AUTH',401,'Credentials rejected.');});
  await assert.rejects(service.generate('owner'),e=>e.errorCode==='AI_AUTH');assert.equal(creates,0);
});

test('draft/save/submit queries preserve ownership and final immutability',async t=>{
  const id='123456789012345678901234';
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student'}));
  t.mock.method(Assignment,'findOneAndUpdate',async(filter,update)=>{assert.deepEqual(filter,{_id:id,student:'student',status:'draft'});assert.equal(update.$set.response,'my work');return {_id:id,...update.$set};});
  assert.equal((await service.save('owner',id,'my work',false)).status,undefined);
  assert.equal((await service.save('owner',id,'my work',true)).status,'submitted');
  t.mock.method(Assignment,'findOneAndUpdate',async()=>null);t.mock.method(Assignment,'findOne',async()=>({status:'submitted'}));
  await assert.rejects(service.save('owner',id,'overwrite',true),e=>e.errorCode==='ALREADY_SUBMITTED');
  t.mock.method(Assignment,'findOne',async filter=>{assert.equal(filter.student,'student');return null;});
  await assert.rejects(service.save('other',id,'overwrite',false),e=>e.errorCode==='NOT_FOUND');
});

test('roadmap auth errors produce an honest template with no researched attribution',async t=>{
  t.mock.method(research,'retrieve',async()=>({status:'failed',attemptedAt:new Date().toISOString(),sources:[]}));
  t.mock.method(provider,'generateJson',async()=>{throw new ProviderError('NVIDIA','AI_AUTH',401,'Credentials rejected.');});
  const roadmap=await require('../src/modules/roadmap/roadmap.ai').generate({student:{skills:[]},targetRole:'Data Engineer'});
  assert.equal(roadmap.source,'template');assert.equal(roadmap.guidanceKind,'template');assert.equal(roadmap.generationIssue.code,'AI_AUTH');assert.deepEqual(roadmap.research.sources,[]);
});

test('quota circuit is shared by roadmap and assignment flows',async t=>{
  const env=require('../src/config/env');
  const old={aiProvider:env.aiProvider,nvidiaKey:env.nvidiaKey,nvidiaModel:env.nvidiaModel};
  Object.assign(env,{aiProvider:'nvidia',nvidiaKey:require('node:crypto').randomBytes(16).toString('hex'),nvidiaModel:'test-model'});
  t.after(()=>Object.assign(env,old));
  let calls=0,creates=0;
  t.mock.method(global,'fetch',async()=>{calls++;return new Response('',{status:429});});
  t.mock.method(research,'retrieve',async()=>({status:'failed',attemptedAt:new Date().toISOString(),sources:[]}));
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student',targetRole:'Data Engineer'}));
  t.mock.method(Assignment,'create',async()=>{creates++;});
  const roadmap=await require('../src/modules/roadmap/roadmap.ai').generate({student:{skills:[]},targetRole:'Data Engineer'});
  assert.equal(roadmap.generationIssue.code,'AI_QUOTA');
  await assert.rejects(service.generate('owner'),e=>e.errorCode==='AI_QUOTA');
  assert.equal(calls,1);assert.equal(creates,0);
});

test('invalid assignment rubric is rejected before persistence',async t=>{
  const env=require('../src/config/env');
  const old={aiProvider:env.aiProvider,nvidiaKey:env.nvidiaKey,nvidiaModel:env.nvidiaModel};
  Object.assign(env,{aiProvider:'nvidia',nvidiaKey:require('node:crypto').randomBytes(16).toString('hex'),nvidiaModel:'test-model'});
  t.after(()=>Object.assign(env,old));
  t.mock.method(studentService,'getByUserId',async()=>({_id:'student',targetRole:'Cloud Engineer'}));
  t.mock.method(global,'fetch',async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({...valid,rubric:[{criterion:'Bad',weight:99}]})},finish_reason:'stop'}]})));
  t.mock.method(Assignment,'create',async()=>{assert.fail('invalid content must not save');});
  await assert.rejects(service.generate('owner'),e=>e.errorCode==='AI_INVALID_RESPONSE');
});
