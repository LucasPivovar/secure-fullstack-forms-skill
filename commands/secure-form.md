---
description: Build or wire a production-ready, end-to-end secured form using the project's native frontend and backend stack (framework-agnostic).
---

# Command: `/secure-form`

Use the `secure-fullstack-forms` skill (`../SKILL.md`) to build or fully wire the requested form end-to-end.

## Execution Steps
1. **Auto-Detect Project Stack:** Inspect project config files (`package.json`, `composer.json`, `pyproject.toml`, `go.mod`, `pom.xml`, `*.csproj`, `Gemfile`) to identify the frontend framework, backend framework, validation library, and ORM/database driver.
2. **Layer 1 — Frontend Form & State Machine:**
   - Build/wire the form using the project's native validation library (e.g. Zod, Valibot, Yup, or native validators) with explicit `min`/`max` bounds and XSS hygiene.
   - Implement `isSubmitting` double-submit locking, `422` field-level error mapping, and safe fallback error banners.
   - Never leave hollow `console.log` or empty submit handlers.
3. **Layers 2, 3 & 4 — Hardened Backend & Persistence:**
   - Create a dedicated whitelisted input schema/DTO/FormRequest that strips or rejects unexpected fields (zero raw `req.body` or `$request->all()`).
   - Persist data exclusively via parameterized ORM methods or prepared statements (`?`, `$1`, `:param`).
   - Apply the stack's native rate limiting and CSRF protection (if cookie/session-based).
4. **Verify:** Run through `../references/security-audit-checklist.md` before finishing.
