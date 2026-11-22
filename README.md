# secure-fullstack-forms

A **framework-agnostic** AI Agent Skill (`SKILL.md`) that prevents AI coding assistants from shipping hollow, visual-only forms or vulnerable backend endpoints—working across **any language or stack** (**TypeScript/JS, Vue, React, Next.js, Angular, Svelte, Node.js, NestJS, PHP/Laravel, Python/FastAPI/Django, Go, Java/Spring, C#/.NET, Ruby**).

It automatically detects your repository's stack and enforces an end-to-end **4-layer security & wiring contract**:
1. **Frontend Client Guard:** Pre-flight schema validation, XSS hygiene, in-flight submit locking, and `422` field-level error mapping.
2. **Anti-Mass Assignment:** Enforces strict payload whitelisting (DTO / Schema / FormRequest)—blocking injected fields like `{ "role": "admin" }`.
3. **Anti-SQL Injection (SQLi):** Forbids raw string interpolation inside SQL queries and enforces parameterized queries / bound ORM parameters.
4. **Transport & Abuse Protection:** Enforces CSRF protection, endpoint rate-limiting, and safe production error responses without stack-trace leaks.

---

## 📦 Installation

Follows the open `SKILL.md` standard—compatible with **Claude Code**, **Antigravity**, **Cursor**, **Windsurf**, **GitHub Copilot**, and **OpenAI Codex**.

### Option 1: Install via `npx skills` CLI (Recommended)

```bash
npx skills add LucasPivovar/secure-fullstack-forms-skill
```

### Option 2: Install directly into your project (`.agents/skills`)

```bash
git clone https://github.com/LucasPivovar/secure-fullstack-forms-skill.git .agents/skills/secure-fullstack-forms
```

### Option 3: Single-file install (`SKILL.md` only)

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

### Option 4: Global installation (All repositories)

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

## ⚡ Slash Commands

| Command | Description |
| :--- | :--- |
| **`/secure-form`** | Auto-detects your stack and builds/wires a complete end-to-end hardened form (client validation + UI state lock + strict backend whitelisting + parameterized DB + rate limiting). |
| **`/audit-forms`** | Scans any repository for hollow submit handlers, XSS vectors, Mass Assignment (`req.body`, `$request->all()`), raw SQL string interpolation, and missing throttling. |

*(The skill also activates automatically whenever you ask your AI agent to create, wire, or refactor any form.)*

---

## 📂 Repository Structure

```text
secure-fullstack-forms-skill/
├── SKILL.md                                   # Universal, framework-agnostic 4-layer form security rules
├── commands/
│   ├── secure-form.md                         # /secure-form — Scaffold & wire an end-to-end hardened form
│   └── audit-forms.md                         # /audit-forms — Audit any codebase for hollow forms, SQLi & Mass Assignment
├── examples/                                  # Concrete reference implementations
│   ├── vue3-zod-secure-form.vue               # Frontend reference (Vue 3 + TypeScript + Zod)
│   ├── nestjs-secure-dto.controller.ts        # Node/TypeScript backend reference (NestJS + Prisma)
│   └── laravel-secure-form-request.php        # PHP backend reference (Laravel FormRequest + Eloquent)
└── references/
    └── security-audit-checklist.md            # Mandatory pre-completion OWASP form verification checklist
```

---

## 📄 License

MIT License — Created by [Lucas Pivovar](https://www.linkedin.com/in/lucas-pivovar-a25b71337/).
