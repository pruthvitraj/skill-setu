# API overview

Base URL: `/api`

All JSON responses:

```json
{ "success": true, "message": "…", "data": {} }
```

Errors include `errorCode`. Auth: `Authorization: Bearer <token>` or httpOnly cookie.

See per-area files in this folder. Health: `GET /api/health`.
