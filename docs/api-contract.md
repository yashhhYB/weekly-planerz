# API Contract

## Base URL

**Development:** `http://localhost:5000`  
**Production:** `https://your-api-url.com`

All endpoints require Content-Type: `application/json`

---

## Health Check

### GET /health

No authentication required.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-02T10:30:00Z",
  "uptime": "2d 5h 30m"
}
```

---

## Backlog API

### GET /api/backlog

Get all backlog items.

**Query Parameters:**
- `category` (optional): ClientFocused | TechDebt | RnD
- `archived` (optional): true | false
- `pageNumber` (default: 1)
- `pageSize` (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Fix API authentication",
      "description": "Implement JWT bearer tokens",
      "category": "TechDebt",
      "estimatedHours": 8,
      "isArchived": false,
      "createdAt": "2026-03-01T14:30:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 120
}
```

**Status:** 200 OK

---

### POST /api/backlog

Create new backlog item.

**Request:**
```json
{
  "title": "Fix API authentication",
  "description": "Implement JWT bearer tokens",
  "category": "TechDebt",
  "estimatedHours": 8
}
```

**Validation:**
- title: required, max 200 chars
- description: required, max 1000 chars
- category: required, must be valid enum
- estimatedHours: required, > 0, < 100

**Response:**
```json
{
  "id": "uuid",
  "title": "Fix API authentication",
  "description": "Implement JWT bearer tokens",
  "category": "TechDebt",
  "estimatedHours": 8,
  "isArchived": false,
  "createdAt": "2026-03-02T10:30:00Z"
}
```

**Status:** 201 Created

---

### PUT /api/backlog/{id}

Update backlog item.

**Request:**
```json
{
  "title": "Fix API authentication",
  "description": "Implement JWT bearer tokens",
  "estimatedHours": 10
}
```

**Constraints:**
- Cannot update archived items
- All validation rules apply

**Response:** 200 OK (same as GET detail)

---

### DELETE /api/backlog/{id}/archive

Archive backlog item (soft delete).

**Response:** 204 No Content

---

## Planning API

### GET /api/planning

Get all planning weeks.

**Query Parameters:**
- `status` (optional): Upcoming | InProgress | Completed
- `pageNumber` (default: 1)
- `pageSize` (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "planningDate": "2026-03-03",
      "startDate": "2026-03-04",
      "endDate": "2026-03-09",
      "status": "InProgress",
      "isFrozen": false,
      "categoryAllocation": {
        "clientPercent": 50,
        "techDebtPercent": 30,
        "rndPercent": 20
      },
      "createdAt": "2026-03-03T09:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 45
}
```

**Status:** 200 OK

---

### POST /api/planning

Create planning week (Tuesday only).

**Request:**
```json
{
  "planningDate": "2026-03-03",
  "categoryAllocation": {
    "clientPercent": 50,
    "techDebtPercent": 30,
    "rndPercent": 20
  }
}
```

**Validation:**
- planningDate: Must be Tuesday (DayOfWeek == 2)
- categoryPercent: Sum must equal 100 (±0.01 tolerance)

**Error Response (400 Bad Request):**
```json
{
  "errors": [
    {
      "field": "planningDate",
      "message": "Planning can only be created on Tuesday"
    },
    {
      "field": "categoryAllocation",
      "message": "Category percentages must sum to 100%"
    }
  ]
}
```

**Success Response:** 201 Created

```json
{
  "id": "uuid",
  "planningDate": "2026-03-03",
  "startDate": "2026-03-04",
  "endDate": "2026-03-09",
  "status": "Setup",
  "isFrozen": false,
  "categoryAllocation": {
    "clientPercent": 50,
    "techDebtPercent": 30,
    "rndPercent": 20
  },
  "createdAt": "2026-03-03T09:00:00Z"
}
```

---

### GET /api/planning/{id}

Get planning week details.

**Response:**
```json
{
  "id": "uuid",
  "planningDate": "2026-03-03",
  "startDate": "2026-03-04",
  "endDate": "2026-03-09",
  "status": "InProgress",
  "isFrozen": false,
  "categoryAllocation": {
    "clientPercent": 50,
    "techDebtPercent": 30,
    "rndPercent": 20,
    "clientHours": 15,
    "techDebtHours": 9,
    "rndHours": 6
  },
  "members": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "role": "Developer",
      "plannedHours": 30,
      "actualHours": 0,
      "progressPercent": 0
    }
  ],
  "createdAt": "2026-03-03T09:00:00Z"
}
```

**Status:** 200 OK

---

## Plan Entry API

### POST /api/planning/{id}/plan-entry

Create member plan entry.

**Request:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "backlogItemId": "uuid",
      "plannedHours": 15
    },
    {
      "backlogItemId": "uuid",
      "plannedHours": 15
    }
  ]
}
```

**Validation:**
- userId: Must be valid team member
- Sum(plannedHours): Must equal exactly 30
- Category limit: Cannot exceed allocated hours per category
- isFrozen: If true, reject with 409 Conflict

**Error Response (400 Bad Request):**
```json
{
  "error": "Planned hours must equal exactly 30. Current total: 29"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "This planning week is frozen. Cannot modify plan entries."
}
```

**Success Response:** 201 Created

```json
{
  "id": "uuid",
  "planningWeekId": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "backlogItemId": "uuid",
      "backlogTitle": "Fix authentication",
      "category": "TechDebt",
      "plannedHours": 15,
      "actualHours": 0,
      "progressPercent": 0
    }
  ],
  "totalPlannedHours": 30,
  "createdAt": "2026-03-04T10:00:00Z"
}
```

---

### PUT /api/planning/{planningId}/plan-entry/{entryId}/actual-hours

Update actual hours (frozen state only).

**Request:**
```json
{
  "actualHours": 14.5,
  "progressPercent": 75
}
```

**Validation:**
- isFrozen: Must be true, else 409 Conflict
- actualHours: >= 0, <= plannedHours
- progressPercent: 0-100

**Response:** 200 OK

```json
{
  "id": "uuid",
  "plannedHours": 15,
  "actualHours": 14.5,
  "progressPercent": 75
}
```

---

## Dashboard API

### GET /api/dashboard/{planningId}

Team Lead dashboard (aggregated view).

**Response:**
```json
{
  "planningWeekId": "uuid",
  "planningDate": "2026-03-03",
  "totalPlannedHours": 270,  // 9 members × 30 hours
  "totalActualHours": 145.5,
  "overallProgressPercent": 53.8,
  "categoryBreakdown": {
    "client": {
      "allocated": 135,
      "actual": 71,
      "progress": 52.6
    },
    "techDebt": {
      "allocated": 81,
      "actual": 45,
      "progress": 55.6
    },
    "rnd": {
      "allocated": 54,
      "actual": 29.5,
      "progress": 54.6
    }
  },
  "memberSummary": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "role": "Developer",
      "plannedHours": 30,
      "actualHours": 14.5,
      "progressPercent": 48.3,
      "itemBreakdown": [
        {
          "backlogId": "uuid",
          "title": "Fix authentication",
          "category": "TechDebt",
          "planned": 15,
          "actual": 14.5,
          "progress": 96.7
        }
      ]
    }
  ]
}
```

**Status:** 200 OK

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "planningDate",
      "message": "Planning can only be created on Tuesday"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Planning week not found",
  "id": "uuid"
}
```

### 409 Conflict
```json
{
  "error": "Planning week is frozen. Cannot modify plan entries"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred",
  "requestId": "req-123-456"
}
```

---

## Authentication

### Bearer Token
All authenticated endpoints require:
```
Authorization: Bearer {jwt_token}
```

### Scopes
- `planning:read` - Read planning/backlog data
- `planning:write` - Create/modify planning
- `planning:admin` - Freeze planning, view dashboard

---

## Rate Limiting

- **10 requests/second** per IP
- Headache: `X-RateLimit-Remaining`
- After limit: 429 Too Many Requests

