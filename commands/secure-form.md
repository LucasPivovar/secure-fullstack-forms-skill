---
description: Build or wire a production-ready, end-to-end secured form (Vue 3 + TypeScript + Zod + NestJS DTO / Laravel FormRequest + Parameterized Queries + Rate Limiting).
---

# Command: `/secure-form`

Use the `secure-fullstack-forms` skill (`../SKILL.md`) to build or fully wire the requested form from scratch.

## Execution Steps
1. **Inspect Project Stack:** Detect whether the project uses Vue 3 (TypeScript/JavaScript), Zod/Valibot, and NestJS (Prisma/TypeORM) or Laravel (Eloquent).
2. **Generate Frontend Form (Layer 1):**
   - Create/update the Vue 3 component with a strict `Zod` schema (`trim()`, `min()`, `max()`, anti-HTML regex).
   - Wire `isSubmitting` lock, `fieldErrors` (422 mapping), and `serverError` state.
   - Never leave a hollow `@submit.prevent="console.log()"` handler.
3. **Generate Backend Endpoint (Layers 2, 3 & 4):**
   - **If NestJS:** Create a strict DTO with `class-validator` decorators, enforce `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, add `@UseGuards(ThrottlerGuard)` / `@Throttle()`, and persist using parameterized Prisma/TypeORM queries.
   - **If Laravel:** Create a dedicated `FormRequest` with `prepareForValidation()` sanitization and explicit `rules()`, persist using `$request->validated()` only (never `$request->all()`), verify `$fillable` on the Model, and add `throttle` middleware to the route.
4. **Verify:** Run through `../references/security-audit-checklist.md` before responding.
