# System architecture

SkillSetu is a **modular monolith**: one Node.js process, one React SPA, one MongoDB database.

```
Student / TPO / Recruiter browsers
        │
   React + Vite (role layouts)
        │ Axios + JWT cookie/header
        ▼
   Nginx-style API surface (Express)
        │
   Modules: auth, student, tpo, recruiter, resume, skills,
            roadmap, courses, jobs, applications, interviews,
            placement, messaging, notifications, analytics, posts
        │
   Services (business rules) → Mongoose models → MongoDB
        │
   Integrations: AI, email, storage, WhatsApp (optional)
```

AI, storage, and email are behind service adapters. The frontend never calls OpenAI/Gemini or AWS directly.

See also:

- [backend-architecture.md](./backend-architecture.md)
- [frontend-architecture.md](./frontend-architecture.md)
- [module-architecture.md](./module-architecture.md)
- [workflow.md](./workflow.md)
