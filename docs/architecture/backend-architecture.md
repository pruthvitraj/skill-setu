# Backend architecture

Request flow:

```
Route → Controller → Service → Model → MongoDB
```

Controllers only parse HTTP and call services. Validation lives in `*.validation.js` plus `validation.middleware.js`. Errors go through `error.middleware.js` and always return:

```json
{ "success": true, "message": "...", "data": {} }
```

or

```json
{ "success": false, "message": "...", "errorCode": "ALREADY_APPLIED" }
```

Cross-cutting:

- JWT + role middleware
- Helmet, CORS, rate limit
- Storage abstraction (`storage.service.js`)
- Redis optional cache
- Audit log on hiring/status changes
