# SkillSetu

Campus placement and career growth platform connecting **students**, **TPOs**, and **recruiters** in one role-based web app.

Student: build skills → improve → apply → get hired  
TPO: manage students → organize drives → track placements  
Recruiter: post jobs → match candidates → interview → hire

## Stack

- Frontend: React (Vite) + Tailwind CSS + React Router + Axios + Recharts
- Backend: Node.js + Express (modular monolith)
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Optional: Redis cache, AWS S3, OpenAI/Gemini (rules-based fallbacks if keys are missing)

## Quick start

```bash
# 1. Start MongoDB (and Redis if you want caching)
docker compose up -d

# 2. Install dependencies
npm run install:all

# 3. Environment
copy .env.example .env
copy server\.env.example server\.env
copy client\.env.example client\.env

# 4. Seed demo users and sample data
npm run seed

# 5. Run API + client
npm run dev
```

- Client: http://localhost:5173  
- API: http://localhost:5000/api/health

### Demo accounts (after seed)

| Role | Email | Password |
| --- | --- | --- |
| Student | student@skillsetu.dev | Password123! |
| TPO | tpo@skillsetu.dev | Password123! |
| Recruiter | recruiter@skillsetu.dev | Password123! |

## Project layout

- `client/` — single SPA with Student / TPO / Recruiter layouts
- `server/` — Express modular monolith (`route → controller → service → model`)
- `shared/` — roles, statuses, permissions
- `docs/` — architecture, API, database, workflows
- `tests/` — backend and integration smoke tests

## Git workflow

Two developers share `develop`. Feature branches never merge unfinished work into `main`.

See `docs/development/git-workflow.md`.
