// Opt-in integration checks. Creates an isolated local database; never seeds or drops existing data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const dbName = `skillsetu_audit_${Date.now()}`;
process.env.MONGO_URI = `mongodb://127.0.0.1:27017/${dbName}`;
process.env.SMTP_HOST = '';
process.env.OPENAI_API_KEY = '';
process.env.GEMINI_API_KEY = '';
const { connectDb } = require('../src/config/db');
const app = require('../src/app');
const model = name => require(`../src/models/${name}`);
const { hashPassword } = require('../src/utils/password');
const { migrateEvidence } = require('../src/scripts/migrate-evidence');
const checks = [];
let server, base;
async function check(name, fn) { await fn(); checks.push(name); console.log('PASS', name); }
async function request(token, route, method='GET', body, expected=200) {
  const response = await fetch(base + route, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? {'Content-Type':'application/json'} : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(result)}`);
  return result.data || result;
}
async function run() {
  await connectDb();
  await Promise.all(Object.values(mongoose.models).map(m=>m.init()));
  const passwordHash = await hashPassword('AuditPassword!2026');
  async function user(role, suffix=role) { return model('User').create({ email:`audit.${suffix}@skillsetu.test`, role, firstName:'Audit', lastName:suffix, passwordHash }); }
  const [su, tu, ru, otherSu, otherTu, otherRu, orphan] = await Promise.all([user('student'),user('tpo'),user('recruiter'),user('student','otherstudent'),user('tpo','othertpo'),user('recruiter','otherrecruiter'),user('student','orphan')]);
  const [uni, otherUni, company, otherCompany] = await Promise.all([model('University').create({name:'Audit Institute'}),model('University').create({name:'Other Audit Institute'}),model('Company').create({name:'Audit Company'}),model('Company').create({name:'Other Audit Company'})]);
  const student = await model('Student').create({user:su._id,university:uni._id,batch:'2026',skillScore:91,skills:[{name:'SQL'}]});
  const otherStudent = await model('Student').create({user:otherSu._id,university:otherUni._id});
  await model('Tpo').create({user:tu._id,university:uni._id}); await model('Tpo').create({user:otherTu._id,university:otherUni._id});
  const recruiter = await model('Recruiter').create({user:ru._id,company:company._id}); await model('Recruiter').create({user:otherRu._id,company:otherCompany._id});
  const assessment = await model('Assessment').create({title:'Audit SQL',skill:'SQL',durationMinutes:20,questions:[{prompt:'Select all columns from a table.',options:['SELECT * FROM records','DELETE FROM records'],correctIndex:0,topic:'SQL'}]});
  const browserAssessment = await model('Assessment').create({title:'Browser SQL',skill:'SQL',durationMinutes:20,questions:assessment.questions});
  await model('SkillScore').create({student:student._id,skill:'SQL',overall:91});
  const oldAttempt = await model('AssessmentAttempt').collection.insertOne({student:student._id,assessment:assessment._id,skill:'SQL',score:91,createdAt:new Date()});
  await check('migration twice preserves legacy values and never creates evidence',async()=>{
    await migrateEvidence(); await migrateEvidence();
    const old = await model('Student').collection.findOne({_id:student._id}); assert.equal(old.legacySkillScore,91); assert.equal(old.skillScore,0);
    assert.equal((await model('SkillScore').collection.findOne({student:student._id})).legacyOverall,91);
    assert.equal((await model('AssessmentAttempt').findById(oldAttempt.insertedId)).mode,'legacy'); assert.equal(await model('SkillEvidence').countDocuments(),0);
  });
  server = app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r)); base = `http://127.0.0.1:${server.address().port}/api`;
  async function login(email) { return (await request(null,'/auth/login','POST',{email:`audit.${email}@skillsetu.test`,password:'AuditPassword!2026'})).token; }
  const [st,tt,rt,ost,ott,ort,ot] = await Promise.all(['student','tpo','recruiter','otherstudent','othertpo','otherrecruiter','orphan'].map(login));
  await check('orphan student receives stable card profile without invented institution',async()=>{const first=(await request(ot,'/students/me')).student;const second=(await request(ot,'/students/me')).student;assert.equal(first._id,second._id);assert.ok(!first.university);assert.equal(await model('Student').countDocuments({user:orphan._id}),1);});
  const answers=[{questionIndex:0,selectedIndex:0}];
  await check('practice is repeatable and isolated from competency evidence',async()=>{await request(st,`/skills/assessments/${assessment._id}/attempts`,'POST',{answers});await request(st,`/skills/assessments/${assessment._id}/attempts`,'POST',{answers});assert.equal(await model('AssessmentAttempt').countDocuments({mode:'practice'}),2);assert.equal(await model('SkillEvidence').countDocuments(),0);});
  let attempt;
  await check('concurrent controlled start resumes one persisted deadline without answer key',async()=>{const starts=await Promise.all([request(st,`/skills/assessments/${assessment._id}/start`,'POST',{rulesVersion:'timed-single-submit-v1'}),request(st,`/skills/assessments/${assessment._id}/start`,'POST',{rulesVersion:'timed-single-submit-v1'})]);attempt=starts[0].attempt;assert.equal(starts[1].attempt._id,attempt._id);assert.equal(starts[1].attempt.expiresAt,attempt.expiresAt);assert.ok(!JSON.stringify(starts).includes('correctIndex'));});
  await check('controlled ownership, immutable final score, one evidence record and retake denial',async()=>{await request(ost,`/skills/attempts/${attempt._id}/submit`,'POST',{answers},404);await request(st,`/skills/attempts/${attempt._id}/submit`,'POST',{answers});const retry=await request(st,`/skills/attempts/${attempt._id}/submit`,'POST',{answers:[{questionIndex:0,selectedIndex:1}]});assert.equal(retry.score,100);assert.equal(await model('SkillEvidence').countDocuments({sourceId:attempt._id}),1);await request(st,`/skills/assessments/${assessment._id}/start`,'POST',{rulesVersion:'timed-single-submit-v1'},409);});
  await check('expired attempts fail on the server',async()=>{const expired=await request(ost,`/skills/assessments/${assessment._id}/start`,'POST',{rulesVersion:'timed-single-submit-v1'});await model('AssessmentAttempt').updateOne({_id:expired.attempt._id},{expiresAt:new Date(Date.now()-1000)});await request(ost,`/skills/attempts/${expired.attempt._id}/submit`,'POST',{answers},409);});
  let challenge, submission;
  await check('company challenge creates immutable submission under duplicate requests',async()=>{challenge=(await request(rt,'/challenges','POST',{title:'Audit database brief',brief:'Design a small anonymized database query for a fictional service.',skill:'SQL',expectedHours:1,deadline:new Date(Date.now()+86400000).toISOString(),rubric:[{criterion:'Correctness',weight:60},{criterion:'Explanation',weight:40}]},201)).item;const work={url:'https://example.com/audit-work',rationale:'This is a synthetic test submission explaining the query design.'};const both=await Promise.all([request(st,`/challenges/${challenge._id}/submissions`,'POST',work,201),request(st,`/challenges/${challenge._id}/submissions`,'POST',work,201)]);submission=both[0].item;assert.equal(both[1].item._id,submission._id);await request(st,`/challenges/${challenge._id}/submissions`,'POST',{...work,url:'https://example.com/changed'},409);});
  await check('review ownership, rubric score, immutable retry and sourced evidence',async()=>{const review={scores:[80,90],feedback:'Correct synthetic solution with clear reasoning.'};await request(ort,`/challenges/${challenge._id}/submissions/${submission._id}/review`,'POST',review,404);await request(rt,`/challenges/${challenge._id}/submissions/${submission._id}/review`,'POST',review);const saved=await request(rt,`/challenges/${challenge._id}/submissions/${submission._id}/review`,'POST',{scores:[0,0],feedback:'Changed feedback must not replace the saved review.'});assert.equal(saved.item.review.score,84);const ev=await model('SkillEvidence').findOne({sourceId:submission._id});assert.equal(ev.score,84);assert.ok(ev.evaluator&&ev.evaluatedAt&&ev.limitations&&ev.source);assert.equal(await model('SkillEvidence').countDocuments({sourceId:submission._id}),1);});
  await check('institution and privacy boundaries cover evidence and submitted work',async()=>{assert.equal((await request(ott,`/challenges/${challenge._id}/submissions`)).items.length,0);assert.equal((await request(tt,`/challenges/${challenge._id}/submissions`)).items.length,1);await request(ott,`/evidence/students/${student._id}`,'GET',undefined,404);await request(rt,`/evidence/students/${student._id}`);await request(st,'/students/me','PATCH',{privacy:{showProfile:true,showScores:false}});await request(rt,`/evidence/students/${student._id}`,'GET',undefined,404);await request(st,'/students/me','PATCH',{privacy:{showProfile:true,showScores:true}});});
  let job,resume,application;
  await check('job ownership, application duplication, resume retention and expiry',async()=>{job=(await request(rt,'/jobs','POST',{title:'Audit SQL role',description:'Synthetic test role',requiredSkills:['SQL'],status:'published'},201)).job;await request(ort,`/jobs/${job._id}`,'PATCH',{title:'Injected change'},404);resume=await model('Resume').create({student:student._id,fileKey:'resumes/audit-only.pdf',fileName:'Audit resume.pdf',parsed:{skills:['SQL'],rawText:'Synthetic fixture'},ats:{overall:50,disclaimer:'Synthetic test fixture'}});application=(await request(st,'/applications','POST',{jobId:job._id,resumeId:resume._id},201)).application;await request(st,'/applications','POST',{jobId:job._id,resumeId:resume._id},409);await request(st,`/resumes/${resume._id}`,'DELETE',undefined,409);await request(ott,`/applications/${application._id}`,'GET',undefined,404);await request(ort,`/applications/${application._id}`,'GET',undefined,404);await model('Job').updateOne({_id:job._id},{deadline:new Date(Date.now()-1000)});const otherResume=await model('Resume').create({student:otherStudent._id,fileKey:'resumes/other-audit.pdf',fileName:'Other audit.pdf'}); const expired=await request(ost,'/applications','POST',{jobId:job._id,resumeId:otherResume._id},400); assert.equal(expired.errorCode,'JOB_CLOSED');await model('Job').updateOne({_id:job._id},{$unset:{deadline:1}});});
  let interview;
  await check('interview scheduling validates ownership, dates and duplicate requests',async()=>{const body={candidate:String(student._id),job:job._id,application:application._id,scheduledAt:new Date(Date.now()+86400000).toISOString(),meetingLink:'https://example.com/interview'};await request(rt,'/interviews','POST',{...body,scheduledAt:new Date(Date.now()-1000).toISOString()},422);interview=(await request(rt,'/interviews','POST',body,201)).interview;await request(rt,'/interviews','POST',body,409);await request(ort,`/interviews/${interview._id}`,'PATCH',{result:'pass'},404);assert.equal((await request(st,'/interviews')).items.length,1);});
  await check('institution messaging and notifications return accurate errors',async()=>{await request(st,'/messages','POST',{receiverId:otherTu._id,body:'Synthetic boundary message'},403);await request(st,'/messages','POST',{receiverId:tu._id,body:'Synthetic institutional test message'},201);await request(st,'/messages','POST',{receiverId:tu._id,body:'   '},422);const notes=await request(st,'/notifications');assert.ok(notes.items.length);await request(st,`/notifications/${notes.items[0]._id}/read`,'PATCH');await request(ost,`/notifications/${notes.items[0]._id}/read`,'PATCH',undefined,404);});
  await check('drive request/review boundaries, duplicate prevention and reporting',async()=>{const drive=(await request(rt,'/placement-drives','POST',{university:String(uni._id),job:job._id,title:'Audit campus drive'},201)).drive;await request(rt,'/placement-drives','POST',{university:String(uni._id),job:job._id},409);await request(ott,`/placement-drives/${drive._id}`,'PATCH',{status:'approved',scheduledDate:new Date(Date.now()+86400000).toISOString()},404);await request(tt,`/placement-drives/${drive._id}`,'PATCH',{status:'approved'},422);await request(tt,`/placement-drives/${drive._id}`,'PATCH',{status:'approved',scheduledDate:new Date(Date.now()+86400000).toISOString()});for(const type of ['placement','department','company','drive','internship','interview'])await request(tt,`/tpo/reports/${type}`);const card=await request(tt,`/tpo/students/${student._id}/report-card`);assert.ok(card.skills.every(s=>s.evidenceBased));});
  await check('profile/settings save and unavailable email never claims delivery',async()=>{await request(st,'/auth/me','PATCH',{firstName:'Audit',lastName:'Student',phone:'123'});assert.equal((await request(st,'/auth/me')).user.phone,'123');await request(tt,'/tpo/settings/profile','PATCH',{firstName:'Audit',lastName:'TPO',designation:'Placement Officer'});assert.equal((await request(tt,'/tpo/settings')).user.designation,'Placement Officer');await request(null,'/auth/forgot-password','POST',{email:'audit.student@skillsetu.test'},503);});
  await check('real PDF parsing and scoped announcement/report/analytics contracts',async()=>{
    const {parseBuffer}=require('../src/modules/resume/resume.parser');const parsed=await parseBuffer(fs.readFileSync(path.join(__dirname,'fixtures/resume.pdf')),'application/pdf');assert.ok(parsed.rawText.includes('Audit Student'));assert.ok(!parsed.skills.includes('java'));
    const announcement=(await request(tt,'/tpo/announcements','POST',{title:'Audit evidence notice',body:'Synthetic institution-only announcement.'},201)).item;
    assert.equal(await model('Notification').countDocuments({user:su._id,'data.announcementId':new mongoose.Types.ObjectId(announcement._id)}),1);assert.equal(await model('Notification').countDocuments({user:otherSu._id,'data.announcementId':new mongoose.Types.ObjectId(announcement._id)}),0);
    const analytics=await request(tt,'/tpo/placement-analytics');assert.equal(analytics.applications,1);assert.equal(analytics.totalDrives,1);assert.equal(analytics.statusBreakdown.interview_scheduled,1);assert.equal(analytics.monthlyTrend.length,6);
    const mine=await request(rt,'/jobs/mine');assert.equal(mine.items.find(j=>j._id===job._id).applications,1);
    const report=await request(tt,'/tpo/reports/placement');assert.equal(report.students[0].batch,'2026');assert.equal(report.students[0].name,'Audit Student');assert.ok(!report.students[0].privacy);
    await request(rt,'/recruiters/me','PATCH',{company:{name:'Audit Company',location:'Audit City'}});await request(rt,'/recruiters/me','PATCH',{company:{owner:su._id}},422);
  });
  await check('concurrent interview creation has one scheduled record',async()=>{
    const freshJob=(await request(rt,'/jobs','POST',{title:'Concurrent interview role',status:'published'},201)).job;
    const freshApp=(await request(st,'/applications','POST',{jobId:freshJob._id,resumeId:resume._id},201)).application;
    const body={candidate:String(student._id),job:freshJob._id,application:freshApp._id,scheduledAt:new Date(Date.now()+86400000).toISOString()};
    const responses=await Promise.all([1,2].map(()=>fetch(base+'/interviews',{method:'POST',headers:{Authorization:'Bearer '+rt,'Content-Type':'application/json'},body:JSON.stringify(body)})));assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);assert.equal(await model('Interview').countDocuments({application:freshApp._id,status:'scheduled'}),1);
  });
  await check('roadmap provenance, completion and expired sessions',async()=>{
    const roadmap=(await request(st,'/roadmaps/me','POST',{targetRole:'Data Engineer'},201)).roadmap;assert.equal(roadmap.source,'template');assert.ok(roadmap.summary.includes('Role template'));
    await request(st,'/roadmaps/me/items/'+roadmap.items[0]._id,'PATCH',{completed:'false'},422);await request(st,'/roadmaps/me/items/'+roadmap.items[0]._id,'PATCH',{completed:true});assert.equal((await request(st,'/roadmaps/me')).roadmap.items[0].completed,true);
    await request(st,'/roadmaps/me','POST',{targetRole:{injected:true}},400);
    const token=await login('otherstudent');const jwt=require('../src/utils/jwt');const claims=jwt.verifyToken(token);await model('Session').updateOne({sessionId:claims.sid},{expiresAt:new Date(Date.now()-1000)});await request(token,'/auth/me','GET',undefined,401);
  });
  await check('logout invalidates database session',async()=>{await request(ot,'/auth/logout','POST');await request(ot,'/auth/me','GET',undefined,401);});
  // Extra clean records for interactive journeys; these are synthetic fixtures only.
  await model('Job').create({recruiter:recruiter._id,company:company._id,title:'Browser workflow role',status:'published',requiredSkills:['SQL']});
  const info={database:dbName,mongoUri:process.env.MONGO_URI,checks,createdAt:new Date().toISOString(),studentId:String(student._id),browserAssessmentId:String(browserAssessment._id)};
  fs.writeFileSync(path.join(__dirname,'../../.audit-runtime.json'),JSON.stringify(info,null,2));
  fs.writeFileSync(path.join(__dirname,'../../docs/development/live-api-results.json'),JSON.stringify({...info,mongoUri:undefined},null,2));
  console.log(`Validated ${checks.length} live MongoDB/API groups; database ${dbName} retained for browser validation.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();});
