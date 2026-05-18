# API Design

## What is it?
A set of conventions and patterns for designing clean, scalable, and secure HTTP APIs — covering structure, authentication, pagination, and rate limiting.

---

## REST Basics

| Method | Usage | Idempotent? |
|---|---|---|
| `GET` | Read resource | ✅ |
| `POST` | Create resource | ❌ |
| `PUT` | Replace resource (full update) | ✅ |
| `PATCH` | Partial update | ❌ |
| `DELETE` | Delete resource | ✅ |

**URL conventions:**
- Use nouns, not verbs: `/users` not `/getUsers`
- Plural for collections: `/orders`, `/products`
- Nest for ownership: `/users/{id}/orders`
- Version your API: `/v1/users`

---

## Authentication

### API Key (simple, service-to-service)
```
GET /v1/orders
Headers:
  X-API-Key: abc123xyz
```

### Bearer Token / JWT (user-facing)
```
GET /v1/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### OAuth 2.0 (delegated access — e.g. "Login with Google")
- Client gets an **access token** (short-lived) + **refresh token** (long-lived)
- Access token sent as Bearer on every request
- Refresh token used to get a new access token silently

> **Rule of thumb:** API keys for internal/service-to-service. JWT/OAuth for user-facing apps.

---

## Pagination

### Offset-based (simple, but has issues)
```
GET /v1/products?limit=20&offset=40
```
- Easy to implement
- ⚠️ Breaks if items are inserted/deleted mid-pagination (rows shift)
- ⚠️ Slow on large offsets (DB scans all preceding rows)

### Cursor-based (preferred for large datasets)
```
GET /v1/products?limit=20&cursor=eyJpZCI6MTAwfQ==
```
- Cursor = opaque pointer (usually base64-encoded last item ID or timestamp)
- Stable — insertions/deletions don't affect your page
- ✅ Best for infinite scroll, feeds, real-time data

### Response envelope (always include):
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ==",
    "has_more": true,
    "limit": 20
  }
}
```

---

## Rate Limiting

Protects your API from abuse and ensures fair usage.

### Where to enforce
- At the **API Gateway / Load Balancer** (before hitting your service)
- Per **API key**, per **user ID**, or per **IP**

### Common algorithms

| Algorithm | How it works | Best for |
|---|---|---|
| **Fixed Window** | N requests per minute, resets on the clock | Simple quota enforcement |
| **Sliding Window** | N requests in any rolling 60s window | Smoother; avoids burst at reset boundary |
| **Token Bucket** | Tokens refill at fixed rate; burst allowed up to bucket size | APIs that allow short bursts |
| **Leaky Bucket** | Requests processed at fixed rate; excess queued/dropped | Smoothing out traffic spikes |

### Response headers (always return these)
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1716912000    # Unix timestamp when limit resets
Retry-After: 30                  # Seconds to wait (on 429)
```

### Rate limit response
```
HTTP 429 Too Many Requests
```
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 30 seconds.",
    "retry_after": 30
  }
}
```

---

## Standard Response Envelope

Always wrap responses consistently:

### Success
```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2024-05-16T10:00:00Z"
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is required",
    "details": [
      { "field": "email", "issue": "missing" }
    ]
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

---

## HTTP Status Codes (the important ones)

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created (POST success) |
| `204` | No Content (DELETE success) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid auth) |
| `403` | Forbidden (valid auth, no permission) |
| `404` | Not Found |
| `409` | Conflict (e.g. duplicate email) |
| `422` | Unprocessable Entity (semantic validation fail) |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

---

## API Design Template

```
METHOD /v{version}/{resource}/{id?}/{sub-resource?}?{query-params}
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
  { JSON }
```

---

## Examples

### Create a user
```
POST /v1/users
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}

Response 201:
{
  "data": {
    "id": "usr_abc123",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin",
    "created_at": "2024-05-16T10:00:00Z"
  }
}
```

### Get paginated orders for a user
```
GET /v1/users/usr_abc123/orders?limit=20&cursor=eyJpZCI6NTB9
Headers:
  Authorization: Bearer <token>

Response 200:
{
  "data": [
    { "id": "ord_001", "total": 59.99, "status": "shipped" },
    { "id": "ord_002", "total": 120.00, "status": "pending" }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6NzB9",
    "has_more": true,
    "limit": 20
  }
}
```

### Partial update (PATCH)
```
PATCH /v1/users/usr_abc123
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "email": "newemail@example.com"
}

Response 200:
{
  "data": {
    "id": "usr_abc123",
    "email": "newemail@example.com",
    "updated_at": "2024-05-16T11:00:00Z"
  }
}
```

---

## Interview Talking Points
- Always **version your API** (`/v1/`) — never break existing clients
- Prefer **cursor-based pagination** over offset for feeds or large tables
- Rate limiting belongs at the **gateway layer**, not inside each service
- Return `401` vs `403` correctly — interviewers notice the distinction
- **Idempotency keys** on POST (e.g. payment APIs) prevent duplicate operations on retry
- Always return a `request_id` in responses — invaluable for debugging distributed systems
