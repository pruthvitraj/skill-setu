> Historical implementation notes. Current live MongoDB and three-role browser validation: [core-workflow-audit.md](core-workflow-audit.md).

# Core workflow repair

Branch: fix/core-workflows. Base: 0728249.

Repairs cover interview/job ownership, institutional application scope, profile privacy, MongoDB-backed sessions and revocation, TPO settings/report cards, student profile persistence, messaging recipient IDs, draft job editing, application duplication/status rules, protected resumes, PDF parsing errors, roadmap selection, and API contract mismatches. Company team now reads existing recruiter records. Multer was upgraded to 2.x.

## Upgrade behavior

- Existing tokens must be replaced by signing in again. Sessions are now stored in MongoDB, independently of optional Redis.
- Resume uploads accept readable PDF only. DOC/DOCX support is not implemented and is no longer advertised.
- Recruiters/TPOs cannot self-register into an existing named organization. An invitation workflow is not implemented; existing demo accounts continue to use login.
- Jobs with applications/interviews/drives cannot be deleted; close them to preserve history.
- Production startup requires JWT_SECRET.

## Automated validation

Run `npm test --prefix server`, `node --test tests/backend/health.test.js`, and `npm run build --prefix client`.
Boundary tests use mocked model calls where MongoDB is required; they do not certify a live database journey.

## Live validation still required

Use a disposable database, not production. Log into each seeded role; save/reload student and TPO settings; submit an assessment; apply once; inspect the submitted resume as its recruiter; schedule/update an interview; generate a TPO report; log out and confirm token rejection. Repeat ownership checks with a second recruiter and a second institution.

No MongoDB server is installed in this workspace, so this database-backed check was not performed. Do not reset or seed a populated user database without explicit authorization.

## Deferred scope

Digital IDs, the four proof-layer additions, organization identity approval/invitations, UI redesign, and production deployment are separate work. A self-created organization is not a verified organization. Existing SMTP/S3 integrations require configuration; S3 still requires its optional SDK. Notification/preferences saves persist values, but app-wide theme/language application is outside this repair.
