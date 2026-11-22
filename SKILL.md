---
name: secure-fullstack-forms
description: Enforces end-to-end form engineering, strict input sanitization, schema validation, and SQL Injection (SQLi), XSS, CSRF, and Mass Assignment protection across Vue.js (TypeScript) frontends and NestJS or Laravel backends. Use whenever creating, wiring, refactoring, or auditing web forms and form submission endpoints.
---

# Secure Full Stack Form Engineering (`secure-fullstack-forms`)

## When to Use This Skill
Activate this skill automatically or via slash commands:
- **`/secure-form`** (`commands/secure-form.md`) — Build or wire a new end-to-end hardened form across Vue 3 + TypeScript and NestJS / Laravel.
- **`/audit-forms`** (`commands/audit-forms.md`) — Scan an existing codebase for hollow forms, XSS, Mass Assignment (`$request->all()`), SQL Injection, and missing rate limits.

Also activate automatically whenever the user asks to:
- Create, wire, or refactor any form (`<form>`, login, registration, checkout, contact, filter, profile update, or multi-step wizard).
- Connect a frontend form (Vue 3 / TypeScript) to a backend API endpoint (NestJS / Node.js / Laravel / PHP).
- Fix broken form submissions, validation bugs, or security vulnerabilities.
- Audit existing forms for **SQL Injection (SQLi)**, **Cross-Site Scripting (XSS)**, **Mass Assignment**, or **CSRF**.

---

## Core Engineering Mandate
Never generate a "visual-only" hollow form (`@submit.prevent=""` or `console.log`). Every form built or touched by the agent MUST be wired end-to-end across **4 mandatory layers** before the task is complete:

1. **Layer 1 — Client Contract & State Machine (Vue 3 + TypeScript + Zod)**
2. **Layer 2 — Transport, CSRF & Rate-Limit Abuse Guard**
3. **Layer 3 — Strict Backend Payload Whitelisting (Anti-Mass Assignment)**
4. **Layer 4 — Parameterized Persistence Only (Zero Raw SQL Interpolation)**

---

## Layer 1: Client Contract & State Machine (Vue 3 + TypeScript)

### Strictly Forbidden
- ❌ Unwired submit handlers (`@submit.prevent="console.log(form)"` or empty functions).
- ❌ Rendering user-supplied strings with `v-html` without DOMPurify sanitization.
- ❌ Sending untyped `any` payloads directly to `fetch` or `axios`.
- ❌ Allowing concurrent submissions while a request is already in flight.

### Required Implementation
1. **Pre-Flight Schema Validation (`zod` / `valibot`):**
   - `.trim()` all text inputs.
   - Enforce explicit `.min()` and `.max()` length bounds on every field (prevents buffer/payload DoS).
   - Reject dangerous HTML/script tags (`/<[^>]*>/g`) or control characters in plain-text fields.
2. **Complete UI Submission State Machine:**
   - `isSubmitting: Ref<boolean>` — locks `<button :disabled="isSubmitting">` and blocks duplicate calls.
   - `fieldErrors: Ref<Record<string, string[]>>` — maps backend `HTTP 422` validation errors directly to the corresponding input field.
   - `serverError: Ref<string | null>` — safe user-facing fallback message for `5xx` or network errors.

See [`examples/vue3-zod-secure-form.vue`](./examples/vue3-zod-secure-form.vue) for the reference implementation.

---

## Layer 2: Transport, CSRF & Rate-Limit Abuse Guard

### Required Implementation
1. **Rate Limiting / Throttling:**
   - **NestJS:** Apply `@UseGuards(ThrottlerGuard)` and `@Throttle({ default: { limit: 5, ttl: 60000 } })` on public/sensitive form endpoints.
   - **Laravel:** Apply `throttle:6,1` middleware on form submission routes.
2. **CSRF & Credential Hygiene:**
   - For cookie/session authentication (Laravel Sanctum / web routes), ensure `X-XSRF-TOKEN` or `@csrf` is verified.
   - Never pass sensitive form tokens or passwords in URL query parameters (`GET`).
3. **Error Response Hygiene:**
   - Return structured `HTTP 422 Unprocessable Entity` for validation failures.
   - Never leak database stack traces, table names, or raw SQL syntax errors in HTTP responses.

---

## Layer 3: Strict Backend Payload Whitelisting (Anti-Mass Assignment)

Attackers routinely intercept form submissions in DevTools and inject extra JSON keys such as `{ "role": "admin", "is_verified": true, "balance": 99999 }`.

### Option A — NestJS (`class-validator` + `ValidationPipe`)
- ❌ **Forbidden:** Reading raw `@Body() body: any` or passing unvalidated DTOs to services.
- ✅ **Required:** Enable `ValidationPipe` with strict whitelisting:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strips any property without a validator decorator
      forbidNonWhitelisted: true, // Rejects request with HTTP 400 if extra fields are sent
      transform: true,            // Auto-transforms payloads to typed DTO instances
    }),
  );
  ```

See [`examples/nestjs-secure-dto.controller.ts`](./examples/nestjs-secure-dto.controller.ts) for the reference implementation.

### Option B — Laravel (`FormRequest` + `$fillable`)
- ❌ **Forbidden:** `Model::create($request->all())`, `Model::update($request->input())`, or `$guarded = []`.
- ✅ **Required:**
  1. Generate a dedicated `FormRequest` class (`php artisan make:request`).
  2. Retrieve **only** validated data via `$validated = $request->validated();`.
  3. Define explicit `protected $fillable = [...]` on the Eloquent model (keep sensitive columns like `role`, `is_admin`, `email_verified_at` out of `$fillable`).

See [`examples/laravel-secure-form-request.php`](./examples/laravel-secure-form-request.php) for the reference implementation.

---

## Layer 4: Parameterized Persistence Only (Anti-SQL Injection)

Attackers test form inputs with payloads like `admin' OR '1'='1' --` or `'; DROP TABLE users; --`.

### Strictly Forbidden
- ❌ String concatenation or template literals inside SQL queries:
  - `await dataSource.query(\`SELECT * FROM users WHERE email = '\${dto.email}'\`)`
  - `DB::select("SELECT * FROM users WHERE email = '$email'")`
  - `User::whereRaw("email = '{$request->email}'")->first()`
- ❌ Passing user input directly into dynamic column names or `ORDER BY` clauses without a strict `enum` allowlist.

### Required Implementation
- ✅ **NestJS (Prisma):**
  ```typescript
  await this.prisma.user.findUnique({ where: { email: dto.email } });
  // Or if raw query is strictly required, use tagged template ($queryRaw uses prepared statements):
  await this.prisma.$queryRaw`SELECT id, email FROM users WHERE email = ${dto.email}`;
  ```
- ✅ **NestJS (TypeORM):**
  ```typescript
  await this.userRepo
    .createQueryBuilder('user')
    .where('user.email = :email', { email: dto.email })
    .getOne();
  ```
- ✅ **Laravel (Eloquent / Query Builder):**
  ```php
  $user = User::where('email', $validated['email'])->first();
  // Or with parameter bindings in raw expressions:
  $users = DB::select('SELECT id, email FROM users WHERE email = ?', [$validated['email']]);
  ```

---

## Mandatory Verification Checklist
Before completing any form task, run through [`references/security-audit-checklist.md`](./references/security-audit-checklist.md):
- [ ] Frontend form validates schema via Zod/Valibot before sending network request.
- [ ] Submit button locks (`isSubmitting`) during in-flight requests and maps `422` field errors.
- [ ] Backend endpoint uses strict DTO whitelisting (`whitelist: true`) or Laravel `$request->validated()`.
- [ ] Database queries use 100% bound/parameterized arguments (zero string interpolation in SQL).
- [ ] Endpoint has rate limiting (`ThrottlerGuard` or `throttle` middleware) configured.
