# secure-fullstack-forms

An AI Agent Skill (`SKILL.md`) that prevents AI coding assistants from shipping hollow, visual-only forms or vulnerable backend endpoints.

It enforces an end-to-end 4-layer engineering contract across **Vue.js (TypeScript)** frontends and **NestJS / Laravel** backends:
1. **Frontend Client Guard:** Strict `Zod` schema validation, XSS tag stripping, `isSubmitting` double-submit locking, and `422` field-level error mapping.
2. **Anti-Mass Assignment:** Enforces `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` in NestJS and dedicated `FormRequest` (`$request->validated()`) in Laravel—blocking injected payload fields like `{ "role": "admin" }`.
3. **Anti-SQL Injection (SQLi):** Forbids raw string interpolation inside SQL queries and enforces parameterized ORM bindings (`Prisma`, `TypeORM`, `Eloquent`).
4. **Transport & Abuse Protection:** Enforces CSRF protection, endpoint rate-limiting (`ThrottlerGuard` / Laravel `throttle`), and safe production error responses.

---

## 📦 Installation

This skill follows the open `SKILL.md` standard and works with **Claude Code**, **Antigravity**, **Cursor**, **Windsurf**, **GitHub Copilot**, and **OpenAI Codex**.

### Option 1: Install via `npx skills` CLI (Recommended)

```bash
npx skills add LucasPivovar/secure-fullstack-forms-skill
```

### Option 2: Install directly into your project (`.agents/skills`)

```bash
git clone https://github.com/LucasPivovar/secure-fullstack-forms-skill.git .agents/skills/secure-fullstack-forms
```

### Option 3: Single-file `curl` install (`SKILL.md` only)

**Linux / macOS / Git Bash:**
```bash
mkdir -p .agents/skills/secure-fullstack-forms && \
curl -fsSL https://raw.githubusercontent.com/LucasPivovar/secure-fullstack-forms-skill/main/SKILL.md \
  -o .agents/skills/secure-fullstack-forms/SKILL.md
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path ".agents/skills/secure-fullstack-forms" | Out-Null
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/LucasPivovar/secure-fullstack-forms-skill/main/SKILL.md" -OutFile ".agents/skills/secure-fullstack-forms/SKILL.md"
```

### Option 4: Global installation (Available across all your repositories)

- **Antigravity / Gemini:**
  ```bash
  git clone https://github.com/LucasPivovar/secure-fullstack-forms-skill.git ~/.gemini/config/skills/secure-fullstack-forms
  ```
- **Claude Code:**
  ```bash
  git clone https://github.com/LucasPivovar/secure-fullstack-forms-skill.git ~/.claude/skills/secure-fullstack-forms
  ```
- **Cursor (`.cursor/rules`):**
  ```bash
  mkdir -p .cursor/rules && \
  curl -fsSL https://raw.githubusercontent.com/LucasPivovar/secure-fullstack-forms-skill/main/SKILL.md \
    -o .cursor/rules/secure-fullstack-forms.mdc
  ```

---

## 📂 Repository Structure

```text
secure-fullstack-forms-skill/
├── SKILL.md                                   # Core instructions & 4-layer security rules for AI agents
├── examples/
│   ├── vue3-zod-secure-form.vue               # Vue 3 + TypeScript + Zod form with state lock & 422 mapping
│   ├── nestjs-secure-dto.controller.ts        # NestJS DTO with whitelist ValidationPipe, Throttler & Prisma
│   └── laravel-secure-form-request.php        # Laravel FormRequest using $request->validated() & Eloquent
└── references/
    └── security-audit-checklist.md            # Mandatory pre-completion security verification checklist
```

---

## 🛠️ How It Works

Once installed, your AI agent automatically loads `SKILL.md` whenever you ask it to create, wire, refactor, or review a form:

> **Example Prompt:**  
> *"Create a contact form in Vue 3 and wire it to our NestJS / Laravel backend."*

Instead of generating a disconnected `<form @submit.prevent="console.log()">` or an insecure controller using `$request->all()`, the agent will automatically scaffold:
1. The **Vue 3 + TypeScript** component with `Zod` validation, loading states, and field-level error handling.
2. The **NestJS DTO** (`whitelist: true`, `forbidNonWhitelisted: true`) or **Laravel `FormRequest`** (`$request->validated()`).
3. **Parameterized ORM queries** and **Rate Limiting** on the submission route.

---

## 📄 License

MIT License — Created by [Lucas Pivovar](https://www.linkedin.com/in/lucas-pivovar-a25b71337/).
