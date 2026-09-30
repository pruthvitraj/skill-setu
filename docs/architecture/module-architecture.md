# Module ownership

| Area | Owner | Notes |
| --- | --- | --- |
| Auth, users, JWT | Shared | Do not fork per role |
| Student profile, resume, ATS, skills, roadmap, courses | Developer 1 | `modules/student`, `resume`, `skills`, `roadmap`, `courses` |
| Jobs, applications (student view) | Shared contracts; Dev 1 UI | `modules/jobs`, `applications` |
| TPO, placement, companies, reports | Developer 2 | `modules/tpo`, `placement`, `analytics` |
| Recruiter, matching, interviews (recruiter) | Developer 2 | `modules/recruiter`, `jobMatching.service.js` |
| Messaging, notifications | Shared | Permission-checked conversations |

Suggested branches are listed in `docs/development/git-workflow.md`.
