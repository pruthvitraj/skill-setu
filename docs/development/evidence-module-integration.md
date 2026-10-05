# Evidence modules and student digital card

This change extends the existing MERN application and its three roles. It does not add a simulation engine or a second student passport.

## Delivered workflows

- Students can repeat practice assessments without affecting competency scores.
- Controlled assessments require accepted rules, use a saved question snapshot and server deadline, and permit one controlled attempt per student and assessment. An interrupted attempt resumes with its original deadline. Final submission is atomic; retrying it returns the original result and repairs a partially written evidence record.
- Assessment evidence records its source, score, evaluator, timestamp, rules and limitations. The question bank is shared with practice. Identity and outside assistance are not monitored. These results must not be described as proctored or independently certified.
- Companies publish anonymized challenge briefs with a skill, a deadline, 0.5–8 hour effort and a disclosed rubric. The first version uses four fixed criteria, weighted 25/35/25/15; the API supports validated custom rubrics.
- Students submit one final HTTPS work link and rationale. Company reviewers score each criterion and record feedback. Final reviews cannot be changed. Retrying the review recovers evidence without overwriting the original evaluation.
- Only the challenge's owning recruiter can close it or review its submissions. TPO challenge submissions are scoped to students in their institution.
- The existing student profile includes evaluated evidence, source references, evaluators, feedback and limitations. TPO student details and company application review include the same evidence component. Recruiter profile/evidence access respects student profile and score visibility; submitted challenge work remains available to its reviewer.
- The student profile includes a digital card with a stable platform identifier, institution/department, enrollment number when present and print/save-PDF support. It is available in the authenticated student profile. It is not an institution-issued identity card. No public QR lookup or identity-verification claim is implemented.
- Student settings now persist recruiter visibility controls. Student notifications now load actual records and mark them read. Previously dead sidebar links now have pages; assessments, challenges, applications and profile skills are reachable from navigation.
- The skill tracker separates practice, controlled and legacy attempts. Its competency average is calculated from the latest evidence per skill. Institutional skill analytics exclude legacy scores.

## Existing database upgrade

Back up the database using your normal backup process. Stop the old server while upgrading.

From the repository root:

```sh
npm ci --prefix server
npm ci --prefix client
npm run migrate:evidence --prefix server
npm test --prefix server
npm run build --prefix client
```

The migration preserves old cached numeric scores as `legacyOverall` / `legacySkillScore`, labels old attempts `legacy`, and rebuilds current score caches from actual evidence. Old attempts remain in history and are not promoted to evidence. The migration can be rerun. Startup initializes the unique indexes needed for controlled attempts, evidence and challenge submissions. There is no seeded evidence; demonstration evaluations must be completed through the actual workflow.

Restart the server and client with their existing environment configuration. The migration uses `MONGO_URI` from server configuration. Do not run the destructive seed command against a database you need to retain.

## Validation

Automated validation: server regression suite and frontend production build. Regression coverage includes malformed answers, explicit rules, snapshot/key protection, expiry, practice isolation, weighted review scores, input ownership injection, rubric weights, company ownership, institutional scoping, private evidence access, immutable retries and challenge deadlines.

The tests use mocked persistence for new service workflows. There is no MongoDB process available in this execution environment, so the migration, database index behavior, concurrent writes and authenticated browser journeys remain to be verified against a real test database. A successful build does not establish that live journeys work.

Before the pitch, verify on a disposable/test database:

1. Run migration twice; confirm old scores remain in legacy fields and old results never appear as evaluated evidence.
2. Student: practice twice, start controlled assessment, reload/resume, submit and repeat submission; verify one attempt/evidence record and unchanged final score. Try a second controlled attempt and an expired attempt.
3. Company: publish an anonymized challenge, student submit, company review; verify source, weights, score and feedback in the student's existing profile.
4. Another company cannot review the challenge. Another institution cannot access its students' evidence or challenge submissions. Private evidence is unavailable to recruiters.
5. Print/save the digital card from the student profile. Confirm no public identity claims or functional QR code are implied.
6. Verify notification read actions, visibility settings and all new sidebar routes.

Known scope limits: no proctoring, isolated question bank, retake window, review appeal/edit workflow, public digital-card verification, file hosting for challenge work or company/TPO digital cards. Challenge lists show the latest 100 records and assessment history the latest 20 attempts. The existing frontend bundle-size warning remains; the visual redesign is deferred.
