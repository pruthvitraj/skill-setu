# Git workflow

Branches: `main` (stable), `develop` (integration).

Developer 1: `feature/student-*`, resume, ATS, skills, roadmap, courses, marketplace.  
Developer 2: `feature/tpo-*`, companies, drives, recruiter, jobs, candidates, interviews.

Never push unfinished work to `main`. Open PRs into `develop`, then release `develop` → `main`.
