---
name: code-generator
description: Scaffolds new backend routers (FastAPI) and frontend pages (Next.js) following this project's conventions.
version: 1.0.0
applyTo: "**"
---

# Code Generator Agent

## Purpose

Automates the creation of boilerplate code for new features, ensuring every new router, page, and section is consistent with the patterns already established in the codebase.

References:
- Backend conventions → `.cloud/skills/fastapi-patterns.md`
- Frontend conventions → `.cloud/skills/nextjs-patterns.md`
- Project paths → `.cloud/config.json` (`paths` section)

---

## Capabilities

| Task | Description |
|---|---|
| `scaffold-router` | Create a new FastAPI router under `app/routers/` |
| `scaffold-page` | Create a new Next.js page under `nextjs/src/pages/` |
| `scaffold-section` | Create a new section component under `nextjs/src/sections/` |
| `scaffold-class` | Create a new Pydantic model under `app/classes/` |
| `scaffold-component` | Create a new reusable UI component under `nextjs/src/components/` |

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `task` | string | yes | One of the capabilities listed above |
| `name` | string | yes | Name of the resource in snake_case (backend) or kebab-case (frontend) |
| `methods` | list | no | HTTP methods to include (e.g. `["GET", "POST", "DELETE"]`) — router only |
| `route` | string | no | URL path prefix (e.g. `/notifications`) — router/page only |
| `auth_required` | boolean | no | Whether to add JWT auth dependency — default `true` for routers |

---

## Steps

### scaffold-router

1. Read `app/routers/users.py` for structural reference.
2. Create `app/routers/<name>.py` with:
   - Module docstring
   - `APIRouter` instance
   - One async function per requested HTTP method
   - `Depends` import for auth if `auth_required` is true
   - Logger import from `app.components.logger`
3. Register the new router in `app/main.py` by adding an `include_router` call.

### scaffold-page

1. Read `nextjs/src/pages/users.js` for structural reference.
2. Create `nextjs/src/pages/<name>.js` with:
   - `useAuthenticatedRoute` hook call at the top
   - React Query `useQuery` for data fetching from the matching backend endpoint
   - Basic MUI `Container` / `Box` layout
   - `Loading` and `Error` component usage
3. Create a matching section in `nextjs/src/sections/<name>/` if content is non-trivial.

### scaffold-class

1. Read `app/classes/User.py` for structural reference.
2. Create `app/classes/<Name>.py` with a Pydantic `BaseModel` class.

---

## Example Invocations

**Generate a new backend router for notifications:**
```
Generate a new FastAPI router named "notifications" with GET /notifications and POST /notifications endpoints. Auth is required.
```

**Generate a new frontend page:**
```
Generate a new Next.js page for "notifications" at route /notifications. It should fetch data from GET /api/v1/notifications.
```

**Generate a Pydantic model:**
```
Generate a Pydantic class named "Notification" with fields: id (str), message (str), is_read (bool), created_at (datetime).
```

---

## Expected Output

- One or more new files matching the project structure and naming conventions.
- No changes to unrelated files except registering the router in `app/main.py`.
- All async functions. No synchronous DB calls.
- Auth dependency (`Depends(verify_token)`) included unless `auth_required` is false.
