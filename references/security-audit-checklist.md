# Form Security & End-to-End Wiring Audit Checklist

Run this audit before marking any form creation or refactoring task as complete.

## 1. Frontend (Vue 3 + TypeScript)
- [ ] **No Hollow Submit:** `@submit.prevent` calls a real async handler connected to the API service.
- [ ] **Pre-Flight Schema Validation:** Payload is validated and trimmed via `zod` or `valibot` before any HTTP request is dispatched.
- [ ] **XSS Hygiene:** Plain-text inputs strip or reject `<` and `>` characters; `v-html` is never used on unescaped user input.
- [ ] **In-Flight Locking:** `isSubmitting` disables inputs and the submit button while awaiting the response.
- [ ] **422 Field Mapping:** Validation errors returned by the backend map cleanly to individual input error messages.

## 2. Backend Whitelisting (Anti-Mass Assignment)
- [ ] **NestJS:** `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` is active and every DTO property has explicit `class-validator` decorators.
- [ ] **Laravel:** Controller uses a dedicated `FormRequest` and reads **only** `$request->validated()`. Zero occurrences of `$request->all()` or `$guarded = []`.

## 3. Database Persistence (Anti-SQL Injection)
- [ ] **Zero String Interpolation in SQL:** No template literals (`` `SELECT ... ${input}` ``) or PHP string concatenation (`"SELECT ... '$input'"`) exist in any query.
- [ ] **Bound Parameters Only:** All queries use ORM methods (`Prisma`, `TypeORM`, `Eloquent`) or explicit parameter binding arrays (`?` / `:param`).
- [ ] **Sort/Filter Allowlists:** Any dynamic `orderBy` or column filter is validated against a strict hardcoded `enum` allowlist.

## 4. Transport & Abuse Protection
- [ ] **Rate Limiting:** Route is protected by `@Throttle()` / `ThrottlerGuard` (NestJS) or `throttle:X,Y` middleware (Laravel).
- [ ] **CSRF Verification:** Session-based routes validate CSRF tokens.
- [ ] **Safe Error Output:** Production error responses never leak SQL queries, table names, or stack traces.
