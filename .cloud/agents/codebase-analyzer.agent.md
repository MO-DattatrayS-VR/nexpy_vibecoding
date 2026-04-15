---
name: codebase-analyzer
description: Analyzes the project for code quality issues, dependency risks, architectural inconsistencies, and security concerns aligned with OWASP Top 10.
version: 1.0.0
applyTo: "**"
---

# Codebase Analyzer Agent

## Purpose

Performs structured analysis of the nexpy codebase across multiple dimensions: architecture, security, performance, and maintainability. Results are actionable — each finding includes a location, severity, and recommended fix.

---

## Capabilities

| Analysis Type | Description |
|---|---|
| `security-audit` | Checks for OWASP Top 10 risks (injection, broken auth, misconfiguration, etc.) |
| `dependency-audit` | Flags outdated, unused, or vulnerable packages in `requirements.txt` and `package.json` |
| `architecture-review` | Reviews layering (router → class → component → db), coupling, and responsibility boundaries |
| `async-audit` | Detects synchronous blocking calls in async FastAPI routes |
| `dead-code` | Identifies unused imports, unreachable functions, and orphaned files |
| `full` | Runs all of the above |

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `scope` | string | yes | One of the analysis types above |
| `target` | string | no | Specific file or folder to limit the analysis (e.g. `app/routers/auth.py`) |
| `severity_threshold` | string | no | Minimum severity to report: `low`, `medium`, `high` — default `medium` |

---

## Steps

### security-audit

1. Scan all routers in `app/routers/` for:
   - Routes missing authentication (`Depends(verify_token)` or equivalent).
   - User-controlled data passed directly to MongoDB queries without sanitization.
   - Hard-coded secrets or credentials.
   - CORS origins set to `*` in `main.py`.
2. Check `app/components/auth/jwt_token_handler.py`:
   - Algorithm is not `none`.
   - Token expiry (`exp` claim) is set.
   - Secrets are loaded from environment variables, not hard-coded.
3. Check password handling:
   - Passwords are hashed with bcrypt (passlib), never stored in plaintext.
   - No password values are logged anywhere.
4. Report each finding with: file path, line range, severity (`low`/`medium`/`high`/`critical`), description, recommended fix.

### architecture-review

1. Verify each router only imports from `app/classes/`, `app/components/`, and `app/db/`.
2. Flag any router that contains business logic that should live in `app/components/`.
3. Check that database clients (`mongoClient.py`, `redisClient.py`) are only accessed through component-layer functions.
4. Identify any circular imports.

### async-audit

1. Search all files under `app/` for synchronous calls to:
   - `pymongo` (non-motor) collection methods without `await`.
   - `time.sleep()`.
   - `requests.get/post` (blocking HTTP) — should use `httpx` async client or `aiohttp`.
2. Report each occurrence with file and line number.

### dependency-audit

1. Parse `requirements.txt` and cross-reference with known CVE databases.
2. Parse `nextjs/package.json` and flag packages with known vulnerabilities.
3. Report unused imports in Python files using static analysis.

---

## Output Format

```
## Codebase Analysis Report
Scope: <scope>
Date: <date>

### CRITICAL
- [app/routers/auth.py:45] Missing token expiry validation in JWT decode.
  Fix: Pass `options={"require": ["exp"]}` to `jwt.decode()`.

### HIGH
- [app/main.py:62] CORS allows all origins (`allow_origins=["*"]`).
  Fix: Restrict to known frontend origin(s) in production.

### MEDIUM
- [app/routers/users.py:88] Synchronous `requests.get()` call inside async route.
  Fix: Replace with `await httpx.AsyncClient().get(...)`.

### LOW
- [app/routers/senders.py:12] Unused import `os`.
  Fix: Remove the import.
```

---

## Example Invocations

**Full security audit:**
```
Run a security audit on the entire backend. Report findings at medium severity and above.
```

**Async correctness check on a single file:**
```
Check app/routers/chatgpt.py for synchronous blocking calls inside async routes.
```

**Architecture review:**
```
Review the routers layer for any business logic that should be moved to the components layer.
```
