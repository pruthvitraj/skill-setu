# Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET /api/auth/me`

Passwords are bcrypt-hashed. JWT is signed with `JWT_SECRET`. Reset and verify tokens are random hashes stored on the user document, never returned in full after creation (reset link is emailed or logged in development).
