# Skill: FastAPI Patterns

Domain knowledge for writing backend code consistent with the nexpy FastAPI codebase.

---

## Overview

The backend is a FastAPI application using:
- **Motor** (async MongoDB driver via `app/db/mongoClient.py`)
- **Redis** for caching/sessions via `app/db/redisClient.py`
- **JWT** authentication with `python-jose` / `PyJWT`
- **bcrypt** (passlib) for password hashing
- **Pydantic v2** for request/response validation
- **asyncio** throughout — no synchronous DB or HTTP calls in route handlers

---

## Pattern 1: Router Structure

Every router follows this layout:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.components.auth.fastapi_auth import verify_token
from app.components.logger import logger
from app.db.mongoClient import async_database

router = APIRouter()
collection = async_database.your_collection


@router.get("/resource", tags=["Resource"])
async def get_resources(token: str = Depends(verify_token)):
    """One-line summary.

    Args:
        token (str): JWT from Authorization header.

    Returns:
        list[dict]: List of resource documents.
    """
    try:
        items = await collection.find({}, {"_id": 0}).to_list(length=100)
        return items
    except Exception as e:
        logger.error(f"get_resources error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
```

**Key rules:**
- Router is created with `APIRouter()` (no prefix — prefix is set in `main.py`).
- Collection is accessed at module level (`async_database.<collection>`).
- Always exclude `_id` with `{"_id": 0}` or convert to `str(doc["_id"])`.
- Always `await` Motor operations.
- Wrap in `try/except`, log the error, and raise `HTTPException`.

---

## Pattern 2: Authentication Dependency

Protect a route by adding `Depends(verify_token)` or `Depends(verify_credentials)`:

```python
from app.components.auth.fastapi_auth import verify_token

@router.get("/protected")
async def protected_route(token: str = Depends(verify_token)):
    # token is the decoded JWT payload
    ...
```

For admin-only routes, additionally use `Depends(check_permissions)`:

```python
from app.components.auth.check_permissions import check_permissions

@router.delete("/admin-only/{item_id}")
async def delete_item(item_id: str, _: None = Depends(check_permissions)):
    ...
```

---

## Pattern 3: Pydantic Request Models

Define request body schemas in `app/classes/`:

```python
# app/classes/Notification.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    is_read: bool = False
    created_at: Optional[datetime] = None

class NotificationResponse(BaseModel):
    id: str
    message: str
    is_read: bool
    created_at: datetime
```

Use in the router:

```python
from app.classes.Notification import NotificationCreate, NotificationResponse

@router.post("/notifications", response_model=NotificationResponse, status_code=201)
async def create_notification(payload: NotificationCreate, token: str = Depends(verify_token)):
    doc = payload.model_dump()
    result = await collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc
```

---

## Pattern 4: Async HTTP Calls

Never use `requests` (blocking) inside async routes. Use `httpx` or `aiohttp`:

```python
# Correct — async HTTP with httpx
import httpx

async def fetch_external_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
```

Anti-pattern — **do not use**:
```python
# WRONG — blocks the event loop
import requests
data = requests.get(url).json()
```

---

## Pattern 5: Logging

Always use the central logger from `app/components/logger.py`:

```python
from app.components.logger import logger

logger.info("User authenticated successfully")
logger.warning("Rate limit approaching for user %s", username)
logger.error("Database write failed: %s", str(e))
```

**Never log sensitive values** (passwords, tokens, PII):
```python
# WRONG
logger.info(f"Password attempt: {password}")

# Correct
logger.info("Password verification failed for user: %s", username)
```

---

## Pattern 6: Router Registration in `main.py`

```python
from app.routers import auth, users, chatgpt, register, notifications  # add new router here

app.include_router(auth.router,          prefix="/api/v1")
app.include_router(users.router,         prefix="/api/v1")
app.include_router(chatgpt.router,       prefix="/api/v1")
app.include_router(register.router,      prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")  # new
```

---

## Anti-Patterns

| Anti-Pattern | Correct Alternative |
|---|---|
| `requests.get()` in async route | `await httpx.AsyncClient().get()` |
| `time.sleep()` in async route | `await asyncio.sleep()` |
| Raw `pymongo` (sync) client | `motor` async client via `async_database` |
| Storing plaintext passwords | Hash with `bcrypt` via `passlib` |
| Hard-coded secrets in source | Load from environment via `python-dotenv` |
| `_id` in MongoDB response | Exclude with `{"_id": 0}` or convert to `str` |
| Business logic inside routers | Move to `app/components/` |
