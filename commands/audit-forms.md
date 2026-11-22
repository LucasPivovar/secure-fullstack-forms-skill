---
description: Audit all existing forms and submission endpoints in the codebase for hollow submits, XSS, Mass Assignment, SQL Injection, and missing rate limits.
---

# Command: `/audit-forms`

Perform a full security and completeness audit across the codebase using the rules defined in `../SKILL.md` and `../references/security-audit-checklist.md`.

## Audit Targets
Scan the workspace for:
1. **Hollow / Unwired Forms (Frontend):**
   - `<form>` tags with empty `@submit.prevent`, `console.log`, or missing `isSubmitting` double-submit protection.
   - Unsanitized `v-html` bindings on user-controlled data.
   - Forms submitting raw objects without `Zod`/`Valibot` schema validation.
2. **Mass Assignment Vectors (Backend):**
   - Laravel: `$request->all()`, `$request->input()` passed directly into `::create()` or `->update()`, or models with `$guarded = []`.
   - NestJS: Controllers reading `@Body() body: any` or missing `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
3. **SQL Injection Vectors (Database):**
   - Raw string interpolation or template literals inside SQL (`DB::select("... $var")`, `whereRaw("... {$var}")`, `query(\`... \${var}\`)`).
   - Dynamic `orderBy` / column filters without an explicit enum allowlist.
4. **Missing Transport Guards:**
   - Public `POST`/`PUT`/`PATCH` form endpoints without rate limiting (`ThrottlerGuard` or `throttle` middleware).

## Output Format
Produce a concise report grouped by severity (**Critical**, **High**, **Medium**) with exact file paths, line numbers, the vulnerable snippet, and the exact hardened replacement—then ask the user if they want the fixes applied automatically.
