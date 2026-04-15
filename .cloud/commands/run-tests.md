# Command: run-tests

Runs the backend test suite using `pytest` with options for targeting specific test files, enabling verbose output, and running inside or outside Docker.

---

## Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `target` | string | no | `tests/` | Specific test file or folder to run |
| `verbose` | boolean | no | `true` | Enable verbose pytest output (`-v`) |
| `failfast` | boolean | no | `false` | Stop after the first failure (`-x`) |
| `env` | string | no | `local` | `local` or `docker` — determines how the command is invoked |
| `coverage` | boolean | no | `false` | Generate a coverage report |

---

## Prerequisites

### Local environment

Ensure the virtual environment is active and dependencies are installed:

```bash
# Create and activate virtual environment (first time only)
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx

# Set required environment variables
cp .env.example .env             # edit .env with your local values
```

### Docker environment

The application must be running via Docker Compose (see `commands/docker-dev.md`).

---

## Steps

### Run locally

```bash
# Run all tests
pytest tests/ -v

# Run a specific test file
pytest tests/tests.py -v

# Run a specific test by name
pytest tests/tests.py -v -k "test_login"

# Stop at first failure
pytest tests/ -v -x

# With coverage report (requires pytest-cov)
pip install pytest-cov
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Run inside Docker

```bash
# Exec into the running backend container
docker compose exec backend pytest tests/ -v

# With coverage
docker compose exec backend pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## Environment Variables for Tests

Tests require a running (or mocked) MongoDB and Redis instance. Set these in your `.env` file or as environment variables before running:

```env
MONGODB_URL=mongodb://localhost:27017
REDIS_HOST=localhost
REDIS_PORT=6379
TEST_DB_NAME=nexpy_test        # Use a separate DB for tests
JWT_SECRET_KEY=test-secret-key
```

> **Important:** Always point tests at a dedicated test database (`TEST_DB_NAME`), never the production database.

---

## Example Outputs

**All tests pass:**
```
========================= test session starts ==========================
collected 12 items

tests/tests.py::test_login_success PASSED                        [  8%]
tests/tests.py::test_login_invalid_credentials PASSED            [ 16%]
tests/tests.py::test_get_users_authenticated PASSED              [ 25%]
...
========================= 12 passed in 1.42s ===========================
```

**With coverage:**
```
---------- coverage: platform linux, python 3.12 -----------
Name                                Stmts   Miss  Cover
-------------------------------------------------------
app/routers/auth.py                    45      3    93%
app/routers/users.py                   62      8    87%
app/components/auth/jwt_token_handler.py  28    0   100%
-------------------------------------------------------
TOTAL                                 243     18    93%
```

**Failure:**
```
FAILED tests/tests.py::test_get_users_unauthenticated - AssertionError: assert 200 == 401
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: app` | Wrong working directory | Run from the repo root (`nexpy/`) |
| `Motor connection refused` | MongoDB not running | Start MongoDB or use Docker Compose |
| `pytest-asyncio` warnings | Missing asyncio mode config | Add `asyncio_mode = "auto"` to `pytest.ini` or `pyproject.toml` |
| `422 Unprocessable Entity` in tests | Wrong request body shape | Verify the Pydantic model matches the test payload |
