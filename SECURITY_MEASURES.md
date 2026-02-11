# Security Measures – Awoof (Frontend & Backend)

Overview of safety measures to prevent attacks, with **In place** vs **To do** status.

---

## Backend

### Authentication & Authorization

| Measure | Status | Notes |
|--------|--------|-------|
| **JWT access + refresh tokens** | ✅ In place | Short-lived access (15m), refresh in Redis; `jwt.service.ts`, auth routes. |
| **Password hashing (bcrypt)** | ✅ In place | bcryptjs, 12 salt rounds; `password.service.ts`. |
| **Password strength validation** | ✅ In place | Min 8 chars, upper, lower, number; used on register, reset, update. |
| **Role-based access (RBAC)** | ✅ In place | `authenticate` + `requireRole('admin'|'vendor'|'student')` on protected routes. |
| **Admin routes protected** | ✅ In place | All `/api/admin/*` require auth + admin role. |
| **Vendor/student data scoped to user** | ✅ In place | Controllers use `req.user.userId` and JOIN students/vendors so users only see their own data (IDOR mitigated). |

### Input Validation & Injection

| Measure | Status | Notes |
|--------|--------|-------|
| **Request body validation (Zod)** | ✅ In place | Auth, verification, vendors, etc. use Zod schemas; invalid input rejected with 422. |
| **Parameterized SQL queries** | ✅ In place | `db.query()` with `$1, $2` params; no string-concatenated SQL found. |
| **File upload validation** | ✅ In place | Multer: MIME allowlist (images + PDF), 5MB limit; CSV upload: type + 2MB limit. |
| **File type by extension** | ⚠️ Partial | MIME only; optional: verify magic bytes for uploads. |

### HTTP & Headers

| Measure | Status | Notes |
|--------|--------|-------|
| **CORS** | ✅ In place | Configured via `config.cors.origin` (e.g. `CORS_ORIGIN` env); credentials allowed. |
| **JSON body size limit** | ✅ In place | `express.json({ limit: '10mb' })` to reduce DoS from huge bodies. |
| **Security headers (Helmet)** | ✅ In place | Helmet applied in `index.ts` (X-Content-Type-Options, X-Frame-Options, etc.). |
| **HTTPS enforcement** | ❌ To do | Not enforced in app; should be done at reverse proxy (e.g. Nginx) or in app in production. |

### Rate Limiting & DoS

| Measure | Status | Notes |
|--------|--------|-------|
| **Global rate limiting** | ✅ In place | `express-rate-limit` applied in `index.ts` using `config.rateLimit` (windowMs, maxRequests); 429 JSON response. |
| **Auth-specific rate limiting** | ✅ In place | Stricter limit on `/api/auth`: 50 req/15 min per IP; 429 JSON response. |

### Error Handling & Information Leakage

| Measure | Status | Notes |
|--------|--------|-------|
| **Generic 500 in production** | ✅ In place | `errorHandler`: production returns "An unexpected error occurred"; no stack/details. |
| **Stack traces only in dev** | ✅ In place | `config.isDevelopment` controls stack in response. |
| **Structured error responses** | ✅ In place | AppError, Zod validation errors; consistent JSON shape. |

### Other Backend

| Measure | Status | Notes |
|--------|--------|-------|
| **Swagger /api-docs in dev only** | ✅ In place | Served only when `config.isDevelopment`. |
| **Refresh token invalidation** | ✅ In place | Logout and password change clear refresh tokens in Redis. |
| **Soft delete / deleted_at** | ✅ In place | Queries often filter `deleted_at IS NULL` to avoid exposing deleted entities. |

---

## Frontend

### XSS & Rendering

| Measure | Status | Notes |
|--------|--------|-------|
| **No raw HTML injection** | ✅ In place | No `dangerouslySetInnerHTML` / `innerHTML` / `eval` found in app code. |
| **React default escaping** | ✅ In place | React escapes text in JSX. |
| **CSP (Content-Security-Policy)** | ❌ To do | Not set; recommend adding via Next.js headers or reverse proxy. |

### Authentication & Tokens

| Measure | Status | Notes |
|--------|--------|-------|
| **Token in memory + localStorage** | ⚠️ In place | Access/refresh in `localStorage`; convenient but vulnerable to XSS (token theft if XSS exists). |
| **Bearer sent only to API** | ✅ In place | `api-client` adds `Authorization: Bearer` only for API requests. |
| **401 handling + refresh** | ✅ In place | Interceptor refreshes token on 401, then retries; redirect to login on refresh failure. |
| **Protected routes by role** | ✅ In place | `ProtectedRoute` checks auth and `requiredRole`; redirects to role-specific login. |

### API & Configuration

| Measure | Status | Notes |
|--------|--------|-------|
| **API URL from env** | ✅ In place | `NEXT_PUBLIC_API_URL`; no hardcoded production API URL. |
| **Sensitive keys not in frontend** | ✅ In place | Paystack public key / API base only; secrets stay on backend. |

### Other Frontend

| Measure | Status | Notes |
|--------|--------|-------|
| **HTTPS in production** | ❌ To do | Enforce in deployment (host, proxy, or Next.js config). |
| **Secure cookie option** | N/A | Session is JWT in localStorage, not cookies; if you move to httpOnly cookies later, set Secure + SameSite. |

---

## Summary: What’s in place

- **Auth:** JWT, bcrypt, password rules, RBAC, scoped access (IDOR mitigation).
- **Input:** Zod validation, parameterized SQL, file type/size limits.
- **HTTP:** CORS, body size limit, safe error responses in production.
- **Frontend:** No raw HTML, React escaping, protected routes, token refresh.

## Summary: What’s to do

1. ~~**Apply global rate limiting**~~ – Done.
2. ~~**Add stricter rate limits on auth**~~ – Done (50 req/15 min on `/api/auth`).
3. ~~**Add Helmet**~~ – Done.
4. **Enforce HTTPS** – At reverse proxy and/or in app for production.
5. **Optional: CSP** – Content-Security-Policy via Next.js or proxy.
6. **Optional: JWT in httpOnly cookie** – Reduces XSS impact vs localStorage (requires backend + frontend changes).

Implementing 1–4 will address the main remaining risks (brute-force, DoS, and header/transport security).
