# Command: scaffold-router

Scaffolds a new FastAPI router file under `app/routers/` and registers it in `app/main.py`.

---

## Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | yes | — | Router name in snake_case (e.g. `notifications`) |
| `route_prefix` | string | no | `/<name>` | URL prefix for the router (e.g. `/notifications`) |
| `methods` | list | no | `["GET", "POST"]` | HTTP methods to scaffold |
| `auth_required` | boolean | no | `true` | Add JWT authentication dependency |
| `tag` | string | no | `<name>` | OpenAPI tag for grouping in docs |

---

## Steps

### 1. Create the router file

Create `app/routers/<name>.py` with the following template:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.components.auth.fastapi_auth import verify_token   # remove if auth_required=false
from app.components.logger import logger
from app.db.mongoClient import async_database

router = APIRouter()
collection = async_database.<name>  # update collection name as needed


# GET /<name>
@router.get("/<name>", tags=["<tag>"])
async def get_<name>(token: str = Depends(verify_token)):  # remove Depends if auth_required=false
    """
    Retrieve all <name> records.

    Args:
        token (str): JWT access token from the Authorization header.

    Returns:
        list[dict]: A list of <name> documents.
    """
    try:
        items = await collection.find({}, {"_id": 0}).to_list(length=100)
        return items
    except Exception as e:
        logger.error(f"Error fetching <name>: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


# POST /<name>
@router.post("/<name>", status_code=status.HTTP_201_CREATED, tags=["<tag>"])
async def create_<name>(payload: dict, token: str = Depends(verify_token)):  # replace dict with your Pydantic class
    """
    Create a new <name> record.

    Args:
        payload (dict): The data for the new record.
        token (str): JWT access token from the Authorization header.

    Returns:
        dict: Confirmation message.
    """
    try:
        result = await collection.insert_one(payload)
        return {"message": "<name> created", "id": str(result.inserted_id)}
    except Exception as e:
        logger.error(f"Error creating <name>: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
```

### 2. Register the router in `app/main.py`

Add the following import and `include_router` call alongside the existing routers:

```python
from app.routers import <name>

# Inside the app setup (after existing include_router calls):
app.include_router(<name>.router, prefix="/api/v1")
```

---

## Example

**Input:**
```yaml
name: notifications
methods: [GET, POST, DELETE]
auth_required: true
tag: Notifications
```

**Output files:**
- `app/routers/notifications.py` — new router with GET, POST, DELETE handlers
- `app/main.py` — updated with `include_router(notifications.router, prefix="/api/v1")`

---

## Expected Output

- New file at `app/routers/<name>.py`.
- `app/main.py` updated with the import and `include_router` call.
- All route functions are `async def`.
- All functions have docstrings.
- Errors are logged and re-raised as `HTTPException`.
