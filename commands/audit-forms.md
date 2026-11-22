---
description: Audit all existing forms and submission endpoints in any codebase (any language/framework) for hollow submits, XSS, Mass Assignment, SQL Injection, and missing rate limits.
---

# Command: `/audit-forms`

Perform a full security and completeness audit across the repository using the rules in `../SKILL.md` and `../references/security-audit-checklist.md`.

## Audit Targets (Language-Agnostic)
Scan the workspace for:
1. **Hollow / Unwired Forms (Frontend):**
   - `<form>` elements with empty submit handlers, `console.log`, `TODO` stubs, or missing in-flight submit locks.
   - Unsanitized raw HTML rendering (`v-html`, `dangerouslySetInnerHTML`, `[innerHTML]`, `{@html}`, `|safe`) on user-controlled input.
   - Forms submitting unbounded/unvalidated payloads directly to the network.
2. **Mass Assignment Vectors (Backend):**
   - Passing raw request bodies straight into database models (`req.body`, `$request->all()`, `**request.json`, direct ORM entity binding) without an explicit field whitelist/DTO.
3. **SQL Injection Vectors (Database):**
   - String concatenation, f-strings, or template literals inside SQL queries (`SELECT ... ${var}`, `f"SELECT ... '{var}'"`, `"SELECT ... '" + var + "'"`).
   - Dynamic `ORDER BY` or column names taken from user input without a strict enum allowlist.
4. **Missing Transport Guards:**
   - Public `POST`/`PUT`/`PATCH` form endpoints lacking rate limiting, CSRF verification (for cookie/session auth), or leaking raw stack traces/SQL errors.

## Output Format
Produce a concise report grouped by severity (**Critical**, **High**, **Medium**) with exact file paths, line numbers, the vulnerable code, and the hardened replacement—then ask if the user wants the fixes applied automatically.
