---
name: secure-fullstack-forms
description: Framework-agnostic AI Agent Skill that enforces end-to-end form wiring, strict schema validation, input sanitization, and SQL Injection (SQLi), XSS, CSRF, and Mass Assignment protection across ANY frontend and backend stack (TypeScript/JS, Python, PHP, Go, Java, C#, Ruby). Use whenever creating, wiring, refactoring, or auditing web forms and submission endpoints.
---

# Secure Full Stack Forms — Framework-Agnostic (`secure-fullstack-forms`)

## When to Use This Skill
Activate this skill automatically or via slash commands:
- **`/secure-form`** (`commands/secure-form.md`) — Build or wire a new end-to-end hardened form tailored to the repository's detected stack.
- **`/audit-forms`** (`commands/audit-forms.md`) — Scan any codebase for hollow forms, XSS, Mass Assignment, SQL Injection, and missing rate limits.

Also activate automatically whenever the user asks to create, connect, refactor, or review any form (`<form>`, login, signup, checkout, contact, search/filter, profile update, or multi-step wizard) in any language.

---

## Step 0: Auto-Detect Project Stack
Before writing any code, inspect the project manifest (`package.json`, `composer.json`, `requirements.txt` / `pyproject.toml`, `go.mod`, `pom.xml`, `*.csproj`, `Gemfile`) and apply the 4 mandatory layers using the project's native ecosystem tools:

| Stack Layer | Supported Ecosystems (Auto-Detected) |
| :--- | :--- |
| **Frontend** | Vue, React, Next.js, Nuxt, Angular, Svelte, Solid, HTMX, Blade/Twig/Jinja templates, Vanilla JS/TS |
| **Client Validation** | Zod, Valibot, Yup, ArkType, Angular Reactive Forms, native HTML5 constraints + custom validators |
| **Backend Whitelisting** | NestJS (`class-validator` DTO), Express/Fastify (`Zod`), Laravel (`FormRequest`), FastAPI (`Pydantic`), Django (`ModelForm`/`DRF Serializer`), Spring Boot (`@Valid` Record/DTO), .NET (`FluentValidation`/DTO), Go (`validator/v10` Struct) |
| **Database / Persistence** | Prisma, TypeORM, Drizzle, Knex, Eloquent, SQLAlchemy, Django ORM, Hibernate/JPA, EF Core, `database/sql` prepared statements |

---

## Core Engineering Mandate
Never generate a "visual-only" hollow form (`onSubmit={() => console.log()}`, `@submit.prevent=""`, or dead `<button>`). Every form built or touched by the agent MUST be wired end-to-end across **4 mandatory layers** before the task is marked complete:

1. **Layer 1 — Client Contract, Sanitization & UI State Machine**
2. **Layer 2 — Transport, CSRF & Rate-Limit Abuse Guard**
3. **Layer 3 — Strict Backend Payload Whitelisting (Anti-Mass Assignment)**
4. **Layer 4 — Parameterized Persistence Only (Zero Raw SQL Interpolation)**

---

## Layer 1: Client Contract & UI State Machine (Any Frontend)

### Strictly Forbidden
- ❌ Unwired submit handlers (`console.log(form)`, empty `onSubmit`, or `TODO: connect API`).
- ❌ Rendering user-supplied strings as raw HTML (`v-html`, `dangerouslySetInnerHTML`, `[innerHTML]`, `{@html}`, `|safe`) without strict sanitization (e.g., DOMPurify).
- ❌ Allowing duplicate/concurrent form submissions while a request is already in flight.
- ❌ Submitting unbounded strings with no `maxlength` / schema length limits.

### Required Implementation
1. **Pre-Flight Schema Validation:** Validate and trim every field before sending the HTTP request. Enforce explicit `min`/`max` length bounds, data types, and reject unexpected HTML/script tags in plain-text fields.
2. **Complete UI Submission State Machine:**
   - **In-flight lock (`isSubmitting`):** Disables the submit button and blocks concurrent triggers until the response settles.
   - **Field-level error mapping (`HTTP 400/422`):** Maps backend validation error keys directly to the corresponding form inputs.
   - **Safe fallback error state:** Displays a clean, generic message on `5xx` or network failures without exposing technical internals.
3. **Never Trust Client Validation Alone:** Client validation is for UX and early payload hygiene; the backend is always the security boundary.

---

## Layer 2: Transport, CSRF & Abuse Guard (Any Backend)

### Required Implementation
1. **Rate Limiting / Throttling:** Protect public and sensitive form endpoints (`POST`/`PUT`/`PATCH`) against brute-force and spam flooding using the stack's native rate limiter (e.g., NestJS `ThrottlerGuard`, Express `express-rate-limit`, Laravel `throttle`, FastAPI `slowapi`, Spring Bucket4j, ASP.NET RateLimiter, Nginx/API Gateway limits).
2. **CSRF Verification:** Enforce CSRF tokens on all cookie/session-authenticated form endpoints. Never pass credentials or sensitive form payloads via URL query strings (`GET`).
3. **Production Error Hygiene:** Return structured `HTTP 422` (or `400`) validation responses. Never leak raw SQL errors, table names, or stack traces to the client.

---

## Layer 3: Strict Backend Payload Whitelisting (Anti-Mass Assignment)

Attackers routinely tamper with form payloads in browser DevTools to inject unauthorized fields such as `{ "role": "admin", "is_verified": true, "credits": 99999 }`.

### Strictly Forbidden
- ❌ Passing raw request bodies directly into database models (`Model.create(req.body)`, `User::create($request->all())`, `User(**request.json)`, `db.Save(&rawBody)`).
- ❌ Binding database entity/table models directly to HTTP request handlers without a separate DTO / Schema / FormRequest layer.

### Required Implementation
- ✅ **Explicit Allowlisting (Whitelist-Only):** Define a dedicated input schema/DTO per endpoint containing **only** the fields that specific form is allowed to modify.
- ✅ **Strip or Reject Unknown Keys:**
  - **TypeScript/Node (NestJS / Zod):** `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` or `z.object({...}).strict()`.
  - **PHP (Laravel):** Dedicated `FormRequest` using `$request->validated()` only + explicit `$fillable` on models.
  - **Python (FastAPI / Django):** Pydantic `BaseModel` with `extra="forbid"` or explicit `fields = [...]` in DRF Serializer / ModelForm.
  - **Go / Java / C#:** Dedicated request DTO struct/record mapped explicitly to the domain entity (never bind directly to ORM entities).

---

## Layer 4: Parameterized Persistence Only (Anti-SQL Injection)

Attackers routinely test form inputs with payloads like `admin' OR '1'='1' --` or `'; DROP TABLE users; --`.

### Strictly Forbidden
- ❌ String concatenation, format strings, or template literals inside SQL queries in **any** language:
  - JS/TS: ``db.query(`SELECT * FROM users WHERE email = '${email}'`)``
  - PHP: `DB::select("SELECT * FROM users WHERE email = '$email'")`
  - Python: `cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")`
  - Go/Java/C#: `"SELECT * FROM users WHERE email = '" + email + "'"`
- ❌ Injecting user input into dynamic `ORDER BY`, `GROUP BY`, or column names without a strict hardcoded `enum`/allowlist check.

### Required Implementation
- ✅ **Prepared Statements / Bound Parameters Only:** Always pass user values as bound query parameters (`?`, `$1`, `:param`) or via safe ORM query builders (Prisma, TypeORM, Drizzle, Eloquent, SQLAlchemy, Django ORM, JPA Criteria/Named Params, EF Core LINQ, Go `db.Query("... WHERE email = $1", email)`).

---

## Mandatory Verification Checklist
Before completing any form task, verify every item in [`references/security-audit-checklist.md`](./references/security-audit-checklist.md):
- [ ] Frontend form is wired to a real endpoint with schema validation, XSS hygiene, in-flight lock, and `422` field error mapping.
- [ ] Backend endpoint uses strict input whitelisting (dedicated DTO / Schema / FormRequest) and drops/rejects unexpected fields.
- [ ] All database operations use parameterized queries / bound ORM parameters (zero raw SQL string interpolation).
- [ ] Route has rate limiting, CSRF protection (when session-based), and safe production error handling.
