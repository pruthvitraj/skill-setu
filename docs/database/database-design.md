# Database design

MongoDB collections map 1:1 with Mongoose models in `server/models`.

**User** is the login identity (`email`, `passwordHash`, `role`, verification/reset tokens).  
Role profiles (`Student`, `Tpo`, `Recruiter`) reference `User` and organization docs (`University`, `Company`).

Frequently queried indexes:

- `users.email` unique
- `students.user`, `students.university`, `students.department`, `students.batch`
- `jobs.status`, `jobs.company`, `jobs.recruiter`
- `applications.student` + `applications.job` unique together
- `notifications.user` + `read`
- `messages.conversation` + `createdAt`

See `relationships.md` for how documents link.
