---
name: secure-fullstack-forms
description: Enforces end-to-end form engineering, strict input sanitization, schema validation, and SQL Injection / XSS / Mass Assignment protection across Vue.js (TypeScript) frontends and NestJS / Laravel backends. Never allow hollow visual-only forms in production.
---

# Secure Full Stack Form Engineering (`secure-fullstack-forms`)

## Core Mandate
Never generate a "visual-only" form (`@submit.prevent=""` or `console.log`). Every form built or refactored by the agent MUST be wired end-to-end across **4 mandatory layers**:
1. **Frontend Client Validation & Sanitization (Vue 3 + TypeScript)**
2. **Typed Transport & State Machine (Loading, Field Errors, Idempotency)**
3. **Strict Backend Payload Whitelisting (NestJS DTO / Laravel FormRequest)**
4. **Parameterized Database Execution (Zero Raw String Interpolation / SQLi Protection)**

---

## Layer 1: Vue 3 + TypeScript Frontend Contract

### Forbidden Patterns
- ❌ `<form @submit.prevent="console.log(form)">` (Unwired hollow shell)
- ❌ Rendering user input with `v-html` without DOMPurify sanitization (XSS vector)
- ❌ Submitting untyped `any` objects directly to `axios.post()` / `fetch()`
- ❌ Allowing double-submission when request is already in-flight

### Required Implementation
1. **Schema Validation Before Network Call:** Validate and trim all fields using `zod` or `valibot`. Reject control characters, unexpected script tags (`<script>`, `javascript:`), and oversized strings (`max()`).
2. **Complete UI State Machine:** Every form composable must expose:
   - `isSubmitting: Ref<boolean>` (disables submit button to prevent race conditions)
   - `fieldErrors: Ref<Record<string, string[]>>` (maps 422 backend validation errors back to specific inputs)
   - `serverError: Ref<string | null>`
3. **Never Trust Frontend Validation Alone:** Frontend validation is for UX and early payload hygiene; backend validation is the security boundary.

```typescript
// composables/useSecureForm.ts
import { ref } from 'vue';
import { z } from 'zod';

export const ContactPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120).regex(/^[^<>]*$/, 'Invalid characters detected'),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(2000),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;
```

---

## Layer 2: Backend Strict Whitelisting (Anti-Mass Assignment)

### Option A — NestJS (`class-validator` + `ValidationPipe`)
- ❌ Never read raw `req.body` without a DTO.
- ✅ Always enforce global or controller-level `ValidationPipe` with:
  - `whitelist: true` (strips any injected properties like `role: 'admin'` or `isVerified: true`)
  - `forbidNonWhitelisted: true` (throws `400 Bad Request` if unexpected fields are sent)
  - `transform: true`

```typescript
// main.ts / controller setup
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### Option B — Laravel (`FormRequest`)
- ❌ Never use `$request->all()` or `$request->input()` directly inside `Model::create()` or `Model::update()`.
- ✅ Always generate a dedicated `FormRequest` class and pass **only** `$request->validated()`.
- ✅ Explicitly define `$fillable` on Eloquent models (never set `$guarded = []`).

```php
// controller method
public function store(StoreContactRequest $request): JsonResponse
{
    $validated = $request->validated(); // Strictly whitelisted fields only
    $record = ContactSubmission::create($validated);

    return response()->json(['data' => $record], 201);
}
```

---

## Layer 3: Database & SQL Injection (SQLi) Prevention

### Forbidden Patterns
- ❌ String concatenation or template literals inside SQL queries:
  - `await dataSource.query(\`SELECT * FROM users WHERE email = '\${dto.email}'\`)`
  - `DB::select("SELECT * FROM users WHERE email = '$email'")`
- ❌ Raw `ORDER BY` or column names passed directly from query/form parameters without a strict enum allowlist.

### Required Implementation
- ✅ **Always use ORM parameterized queries / prepared statements:**
  - **NestJS (Prisma / TypeORM):** Use bound parameters (`where: { email: dto.email }` or `.where('user.email = :email', { email: dto.email })`).
  - **Laravel (Eloquent / Query Builder):** Use Eloquent bindings (`User::where('email', $validated['email'])->first()`). If raw SQL is unavoidable, pass bindings as an array: `DB::select('SELECT * FROM users WHERE email = ?', [$validated['email']])`.

---

## Layer 4: Abuse & Transport Protection Checklist
Before marking any form feature complete, verify:
- [ ] **CSRF Protection:** Enabled for cookie/session endpoints (Laravel Sanctum / CSRF token header).
- [ ] **Rate Limiting:** Endpoint protected against brute-force/spam (`@Throttle()` in NestJS or `throttle:6,1` middleware in Laravel).
- [ ] **HTTP 422 Field Mapping:** Backend validation errors return structured field keys that automatically highlight the corresponding `<input>` in Vue.js.
- [ ] **No Sensitive Data Leakage:** Error responses in production never expose stack traces or raw SQL error messages.
