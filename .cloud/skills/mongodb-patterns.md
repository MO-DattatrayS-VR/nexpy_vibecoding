# Skill: MongoDB Patterns

Domain knowledge for working with MongoDB in the nexpy backend via the **Motor** async driver.

---

## Overview

The nexpy backend connects to MongoDB through:
- **Motor** (`motor.motor_asyncio`) — the async MongoDB driver for Python.
- `app/db/mongoClient.py` — the central client module. Import `async_database` from here.
- All DB operations must be `await`ed — no synchronous calls inside async FastAPI routes.

---

## Accessing the Database

Always import the database from the central client module:

```python
from app.db.mongoClient import async_database

# Get a collection
users = async_database.users
notifications = async_database.notifications
```

Do **not** create a new `AsyncIOMotorClient` directly in router files.

---

## Pattern 1: Find (Read)

```python
# Find all documents (exclude _id)
items = await collection.find({}, {"_id": 0}).to_list(length=100)

# Find with filter
active_users = await collection.find({"is_active": True}, {"_id": 0}).to_list(length=500)

# Find one document
user = await collection.find_one({"username": username}, {"_id": 0})
if user is None:
    raise HTTPException(status_code=404, detail="User not found")

# Find by ObjectId
from bson import ObjectId

doc = await collection.find_one({"_id": ObjectId(item_id)})
if doc:
    doc["id"] = str(doc.pop("_id"))  # convert _id to string id
```

**Rules:**
- Always set `to_list(length=N)` — never use `to_list(length=None)` in production (unbounded read).
- Exclude `_id` with `{"_id": 0}` unless you need it, then convert to `str`.

---

## Pattern 2: Insert (Create)

```python
# Insert one document
payload = {"username": "alice", "email": "alice@example.com"}
result = await collection.insert_one(payload)
inserted_id = str(result.inserted_id)

# Insert many
docs = [{"name": "a"}, {"name": "b"}]
result = await collection.insert_many(docs)
```

---

## Pattern 3: Update

```python
from pymongo import ReturnDocument

# Update one (partial update with $set)
result = await collection.update_one(
    {"username": username},
    {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
)
if result.matched_count == 0:
    raise HTTPException(status_code=404, detail="Document not found")

# Find and update, return updated document
updated = await collection.find_one_and_update(
    {"username": username},
    {"$set": {"email": new_email}},
    return_document=ReturnDocument.AFTER,
    projection={"_id": 0}
)
```

---

## Pattern 4: Delete

```python
# Delete one
result = await collection.delete_one({"username": username})
if result.deleted_count == 0:
    raise HTTPException(status_code=404, detail="Document not found")

# Delete many (use with caution — always filter)
result = await collection.delete_many({"is_expired": True})
```

---

## Pattern 5: Creating Indexes

Define indexes in `app/components/initial_settings.py` (alongside `create_owner` and `initialize_message_settings`) so they run at startup:

```python
async def create_indexes():
    """Create MongoDB indexes for performance and uniqueness constraints."""
    db = async_database

    # Unique index on username
    await db.users.create_index("username", unique=True)

    # Unique index on email
    await db.users.create_index("email", unique=True)

    # Compound index for querying notifications by user + read status
    await db.notifications.create_index([("user_id", 1), ("is_read", 1)])

    # TTL index — auto-delete expired sessions after 3600 seconds
    await db.sessions.create_index("created_at", expireAfterSeconds=3600)
```

Register `create_indexes()` in the FastAPI `lifespan` startup event in `app/main.py`.

---

## Pattern 6: Pagination

```python
@router.get("/notifications")
async def get_notifications(page: int = 1, limit: int = 20, token: str = Depends(verify_token)):
    skip = (page - 1) * limit
    items = await collection.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(length=limit)
    total = await collection.count_documents({})
    return {"items": items, "total": total, "page": page, "limit": limit}
```

---

## Pattern 7: Transactions (Multi-Document)

Use transactions when multiple documents must be written atomically:

```python
from app.db.mongoClient import async_mdb_client

async def transfer_credits(from_user: str, to_user: str, amount: int):
    async with await async_mdb_client.start_session() as session:
        async with session.start_transaction():
            await async_database.users.update_one(
                {"username": from_user},
                {"$inc": {"credits": -amount}},
                session=session
            )
            await async_database.users.update_one(
                {"username": to_user},
                {"$inc": {"credits": amount}},
                session=session
            )
```

> Note: Transactions require MongoDB with a replica set or Atlas. Not available on a standalone `mongod`.

---

## Anti-Patterns

| Anti-Pattern | Correct Alternative |
|---|---|
| `pymongo.MongoClient` (sync) in async routes | `motor` async client via `async_database` |
| `to_list(length=None)` | Set a reasonable upper bound (e.g. `1000`) |
| Storing `_id` as ObjectId in responses | Convert to `str` or exclude with `{"_id": 0}` |
| Inserting user-controlled data without validation | Validate with Pydantic before inserting |
| `update_one` without a filter | Always include a filter document — never `{}` for updates |
| Creating indexes inside router files | Define all indexes in `initial_settings.py:create_indexes()` |
