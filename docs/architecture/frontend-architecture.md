# Frontend architecture

One application. Role is resolved after login; layouts and route guards switch chrome and allowed pages.

- `layouts/` — Auth, Student, TPO, Recruiter
- `pages/` — route screens by role
- `components/` — reusable UI (common, charts, profile, jobs, …)
- `features/` — feature-local helpers
- `context/` — Auth + Notifications only
- `services/` — Axios API clients
- `routes/` — `ProtectedRoute` / `RoleRoute`

Theme tokens in `index.css` stay shared. Accent colors change per layout (`--accent-*`) so the product still feels like one SaaS.

State:

- Auth user + tokens: `AuthContext`
- Unread notifications: `NotificationContext`
- Everything else: local page/feature state + API
