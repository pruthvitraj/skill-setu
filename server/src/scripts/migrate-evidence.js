// Run once on an existing database before exposing the new evidence workflows.
// Legacy results remain in attempt history; old cached scores are preserved separately.
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const Student = require('../models/Student');
const SkillScore = require('../models/SkillScore');
const Attempt = require('../models/AssessmentAttempt');
const Evidence = require('../models/SkillEvidence');
const Submission = require('../models/ChallengeSubmission');
const { refreshScores } = require('../modules/evidence/evidence.service');
async function run() {
  await connectDb();
  await Promise.all([Attempt.init(), Evidence.init(), Submission.init()]);
  await Attempt.updateMany({ mode: { $exists: false } }, { $set: { mode: 'legacy', status: 'submitted' } });
  await SkillScore.collection.updateMany({ evidenceMigration: { $ne: 1 } }, [{ $set: { legacyOverall: '$overall', overall: 0, evidenceMigration: 1 } }]);
  await Student.collection.updateMany({ evidenceMigration: { $ne: 1 } }, [{ $set: { legacySkillScore: '$skillScore', skillScore: 0, evidenceMigration: 1 } }]);
  for await (const student of Student.find().select('_id').cursor()) await refreshScores(student._id);
  console.log('Evidence migration complete. Legacy scores retained separately; current scores rebuilt from evidence.');
}
run().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
