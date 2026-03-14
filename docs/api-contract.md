# API Contract

## Base URLs

- Production API: `https://api-production-b715.up.railway.app`
- Health: `/health`
- Swagger: `/swagger`

## Response Envelope

All endpoints should return a consistent envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "errors": [],
  "timestamp": "2026-01-01T00:00:00Z"
}
```

## Core Route Groups

- `/api/Planning`
- `/api/Backlog`
- `/api/Team`
- `/api/Admin`

