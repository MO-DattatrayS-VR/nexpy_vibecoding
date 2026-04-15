---
name: test-generator
description: Generates unit and integration tests for FastAPI routes and Next.js components, following the patterns in tests/tests.py.
version: 1.0.0
applyTo: "**"
---

# Test Generator Agent

## Purpose

Automates the creation of backend and frontend tests, ensuring new features are covered without starting from scratch each time. Generated tests follow the conventions already present in `tests/tests.py` and use the project's actual data models and route structure.

---

## Capabilities

| Task | Description |
|---|---|
| `route-tests` | Generate pytest tests for a FastAPI router |
| `component-tests` | Generate React Testing Library tests for a Next.js component or section |
| `auth-flow-tests` | Generate end-to-end auth tests (login, token refresh, permission denial) |
| `coverage-report` | Identify untested routes and components |

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `task` | string | yes | One of the capabilities above |
| `target` | string | yes | File or router to generate tests for (e.g. `app/routers/users.py`) |
| `test_types` | list | no | `["unit", "integration"]` — default `["integration"]` for routes |
| `include_negative` | boolean | no | Include tests for invalid inputs and unauthorized access — default `true` |

---

## Steps

### route-tests

1. Read `tests/tests.py` to understand the project's test client setup and conventions.
2. Read the target router file to identify all endpoints.
3. For each endpoint generate:
   - **Happy path** test: valid inputs → expected 2xx response and body shape.
   - **Auth failure** test (if auth required): no token or expired token → `401`.
   - **Validation failure** test: missing or malformed body → `422`.
   - **Not found** test (for GET by ID patterns): unknown ID → `404`.
4. Use `httpx.AsyncClient` with `app` as the ASGI transport (FastAPI async test client pattern).
5. Use `pytest.mark.asyncio` for all async test functions.
6. Place shared fixtures (test client, auth token, mock DB data) in the module or a `conftest.py`.

**Example generated test:**
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def auth_token(async_client):
    response = await async_client.post("/api/v1/auth/token", data={
        "username": "testowner",
        "password": "testpassword"
    })
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_get_users_authenticated(async_client, auth_token):
    response = await async_client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_users_unauthenticated(async_client):
    response = await async_client.get("/api/v1/users")
    assert response.status_code == 401
```

### auth-flow-tests

1. Generate tests covering the full JWT lifecycle:
   - `POST /token` with valid credentials → `200` + token in body.
   - `POST /token` with wrong password → `401`.
   - Authenticated request with valid token → `200`.
   - Authenticated request with expired token → `401`.
   - Authenticated request with tampered token signature → `401`.
2. Use `freezegun` or `unittest.mock.patch` to simulate token expiry without waiting.

### coverage-report

1. List all routes defined in `app/routers/` (by scanning `@router.<method>` decorators).
2. List all test functions in `tests/tests.py` (by scanning `def test_`).
3. Cross-reference and report which routes have no corresponding test.

**Example output:**
```
## Test Coverage Report

### Untested Routes
- POST   /api/v1/users         (app/routers/users.py:34)
- DELETE /api/v1/users/{id}    (app/routers/users.py:78)
- GET    /api/v1/chatgpt       (app/routers/chatgpt.py:22)

### Covered Routes (3)
- POST   /api/v1/auth/token
- GET    /api/v1/users/{id}
- PUT    /api/v1/users/{id}
```

---

## Example Invocations

**Generate tests for the users router:**
```
Generate integration tests for app/routers/users.py. Include negative tests for auth failure and validation errors.
```

**Generate auth flow tests:**
```
Generate the full JWT authentication flow test suite, including token expiry simulation.
```

**Get a coverage report:**
```
List all FastAPI routes that currently have no tests in tests/tests.py.
```

---

## Conventions

- Test file location: `tests/tests.py` (extend existing file) or `tests/test_<router>.py` for new modules.
- Framework: `pytest` + `pytest-asyncio`.
- HTTP client: `httpx.AsyncClient` with `transport=ASGITransport(app=app)`.
- All test functions are `async def test_*`.
- Fixtures for shared state (auth token, test DB) go in `conftest.py`.
- Never use the production database. Use an in-memory mock or a dedicated test database configured via environment variable.
