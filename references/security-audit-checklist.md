# Framework-Agnostic Form Security & Wiring Audit Checklist

Run this audit before marking any form creation or refactoring task as complete—regardless of language or framework.

## 1. Frontend Contract (Client Boundary)
- [ ] **No Hollow Submit:** Form submit calls a real async API handler (zero `console.log` or empty handlers).
- [ ] **Pre-Flight Schema Validation:** Payload is trimmed and validated with explicit `min`/`max` bounds before any network request.
- [ ] **XSS Hygiene:** Plain-text inputs reject/escape `<` and `>` characters; raw HTML directives (`v-html`, `dangerouslySetInnerHTML`, `innerHTML`, `|safe`) are never used on unsanitized user input.
- [ ] **In-Flight Locking:** Submit button and inputs lock while the request is pending to prevent double-submit race conditions.
- [ ] **422 Field Mapping:** Backend validation errors map cleanly back to individual input fields.

## 2. Backend Whitelisting (Anti-Mass Assignment)
- [ ] **Dedicated Input Schema / DTO / FormRequest:** Endpoint accepts only explicitly whitelisted fields.
- [ ] **Reject/Strip Extra Fields:** Unknown injected properties (e.g., `role: "admin"`, `is_verified: true`) are automatically stripped or rejected with HTTP `400`/`422`.
- [ ] **Zero Raw Body Persistence:** No direct `Model.create(req.body)`, `$request->all()`, or `**request.json` writes exist.

## 3. Database Persistence (Anti-SQL Injection)
- [ ] **Zero String Interpolation in SQL:** No template literals, f-strings, or string concatenation exist inside any SQL query.
- [ ] **Bound Parameters Only:** Every query uses ORM parameter bindings or prepared statement placeholders (`?`, `$1`, `:param`).
- [ ] **Dynamic Column Allowlists:** Any user-driven `ORDER BY` or filter column is checked against a strict hardcoded enum allowlist.

## 4. Transport & Abuse Protection
- [ ] **Rate Limiting:** Endpoint is protected against brute-force and spam flooding.
- [ ] **CSRF Protection:** Enabled and verified for cookie/session-authenticated routes.
- [ ] **Safe Error Output:** Production error responses never leak raw SQL messages, table names, or stack traces.
