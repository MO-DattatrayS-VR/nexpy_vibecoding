# Command: docker-dev

Starts the full nexpy development environment (FastAPI backend + Next.js frontend + MongoDB + Redis) using Docker Compose.

---

## Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `mode` | string | no | `up` | `up` (start), `down` (stop), `restart` (restart all), `rebuild` (rebuild images) |
| `service` | string | no | all | Target a specific service: `backend`, `frontend`, `mongo`, `redis` |
| `detached` | boolean | no | `true` | Run containers in the background (`-d`) |
| `logs` | boolean | no | `false` | Tail logs after starting |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A `.env` file in the project root with the required environment variables.

**Generate `.env` from the provided script:**
```bash
python generate_env.py
```

**Minimum required variables:**
```env
MONGODB_URL=mongodb://mongo:27017
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET_KEY=your-secret-key-here
OWNER_USERNAME=admin
OWNER_PASSWORD=changeme
```

---

## Steps

### Start all services

```bash
# Start all services in detached (background) mode
docker compose up -d

# Start and follow logs
docker compose up -d && docker compose logs -f
```

### Start a specific service

```bash
docker compose up -d backend
docker compose up -d frontend
```

### Rebuild images (after dependency changes)

Run this after modifying `requirements.txt`, `package.json`, or `Dockerfile`:

```bash
docker compose up -d --build

# Or rebuild a specific service only
docker compose up -d --build backend
```

### Stop all services

```bash
docker compose down

# Stop and remove volumes (wipes the database — use with caution)
docker compose down -v
```

### Restart a single service

```bash
docker compose restart backend
docker compose restart frontend
```

### View logs

```bash
# Tail all services
docker compose logs -f

# Tail a specific service
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Service URLs (default ports)

| Service | URL | Description |
|---|---|---|
| FastAPI backend | `http://localhost:8000` | REST API |
| FastAPI docs (Swagger) | `http://localhost:8000/docs` | OpenAPI interactive docs |
| FastAPI docs (Redoc) | `http://localhost:8000/redoc` | Alternative API docs |
| Next.js frontend | `http://localhost:3000` | Web application |
| MongoDB | `mongodb://localhost:27017` | Database (not exposed by default in prod) |
| Redis | `redis://localhost:6379` | Cache / session store |

---

## Debugging Inside Containers

```bash
# Open a shell in the backend container
docker compose exec backend bash

# Open a shell in the frontend container
docker compose exec frontend sh

# Run a Python script inside the backend container
docker compose exec backend python generate_env.py

# Check running containers and their status
docker compose ps
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| Port already in use | Another process on port 8000 or 3000 | `lsof -i :8000` then kill the process, or change the port in `docker-compose.yml` |
| Container exits immediately | Missing `.env` variables | Run `python generate_env.py` and verify `.env` exists |
| `MongoNetworkError` in backend logs | Backend starting before MongoDB is ready | Restart: `docker compose restart backend` |
| Frontend shows blank page | Next.js build failed | Check logs: `docker compose logs frontend` |
| Permission denied on `entrypoint.sh` | Wrong line endings (CRLF on Windows) | Run `dos2unix entrypoint.sh` or set `git config core.autocrlf false` |
