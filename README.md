# NexPy: A Full-Stack User Management System with FastAPI, Next.js, and MUI

> **Version:** v15.04.2026

## Overview

NexPy is a full-stack application combining a **FastAPI** asynchronous backend with a **Next.js 14** frontend. It provides a production-ready foundation for user management, role-based access control, AI chat integration, and email notifications — all containerized with Docker.

## Project Structure

```
nexpy/
├── app/                        # FastAPI backend
│   ├── main.py                 # Application entry point, CORS & middleware setup
│   ├── classes/                # Pydantic models (Auth, User, Messages, Permissions, Chatgpt)
│   ├── components/             # Shared utilities
│   │   ├── auth/               # JWT token handler, FastAPI auth, permission checks
│   │   ├── chat_gpt/           # ChatGPT service integration
│   │   ├── message_dispatcher/ # SMTP email dispatcher
│   │   ├── hash_password.py
│   │   ├── initial_settings.py # Owner bootstrap & index creation
│   │   └── logger.py
│   ├── db/
│   │   ├── mongoClient.py      # Async MongoDB (Motor) client
│   │   └── redisClient.py      # Async Redis client
│   └── routers/
│       ├── auth.py             # Login / token endpoint
│       ├── register.py         # User registration
│       ├── users.py            # User CRUD
│       ├── chatgpt.py          # ChatGPT proxy router
│       ├── senders.py          # Email sending endpoints
│       └── settings/
│           └── messages.py     # Message template settings
├── nextjs/                     # Next.js 14 frontend
│   ├── src/
│   │   ├── api/                # Axios helpers, endpoint map, auth context
│   │   ├── components/         # Shared UI components (modals, loaders, effects)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Next.js pages (login, dashboard, users, settings, ChatGPT)
│   │   ├── sections/           # Feature sections (auth, header, profile, users, settings)
│   │   ├── styles/             # Global CSS
│   │   └── theme/              # MUI dark theme & menu icons
│   └── package.json
├── docker-compose.yml          # 4-container orchestration
├── Dockerfile                  # FastAPI container image
├── generate_env.py             # Auto-generates .env files with secrets
├── requirements.txt
└── tests/tests.py
```

## Key Features

### Security
- **JWT Authentication**: Stateless token-based auth via `python-jose` and `PyJWT`, with tokens stored in Redis for validation and revocation.
- **Bcrypt Password Hashing**: All passwords hashed with bcrypt using `passlib`.
- **Rate Limiting**: Brute-force protection on login; Swagger UI locks out after 5 failed attempts for 5 minutes.
- **Protected API Docs**: Swagger UI and ReDoc are disabled by default; access requires HTTP Basic credentials.
- **CORS Middleware**: Configurable allowed origins in `app/main.py`.

### User Management
- **Registration & Login**: Secure sign-up and OAuth2 password-flow login.
- **Role-Based Access Control**: Permission checks via `app/components/auth/check_permissions.py`.
- **Profile Management**: Users can update profile details and account settings.
- **Password Reset**: Forgot-password flow with secure tokenized email links.

### AI & Notifications
- **ChatGPT Integration**: Dedicated `/extensions/chatgpt` page and backend proxy router powered by the OpenAI API.
- **Email Notifications**: Async SMTP email dispatch (`aiosmtplib`) for registration confirmations and password resets.

### Frontend
- **Next.js 14** with the Pages Router.
- **Material-UI (MUI) v5** with a custom dark theme.
- **React Query** for server-state management and caching.
- **Recharts** for dashboard data visualization.
- **tsparticles** for animated background effects.
- **react-hot-toast** for in-app notifications.

### Performance & Scalability
- **Fully Async Backend**: FastAPI + Motor (async MongoDB driver) + async Redis client.
- **Docker Compose** orchestration across 4 independent containers.
- **Persistent Volumes**: MongoDB and Redis data survive container restarts.

### Logging & Monitoring
- **Structured Logging**: Application-wide logging via `app/components/logger.py`.
- **MongoDB Indexes**: Automatically created on startup for optimized query performance.

## Technologies

| Layer | Technology | Version |
|---|---|---|
| Backend framework | FastAPI | ~0.110.0 |
| ASGI server | Uvicorn | ~0.28.0 |
| Database (async) | MongoDB + Motor | ~3.3.2 |
| Cache / rate-limit | Redis | ~5.0.3 |
| Frontend framework | Next.js | 14.1.3 |
| UI library | Material-UI (MUI) | ^5.15.13 |
| State management | React Query | ^3.39.3 |
| Charts | Recharts | ^2.12.3 |
| Auth tokens | python-jose + PyJWT | ~3.3.0 / ~2.8.0 |
| Password hashing | bcrypt + passlib | ~4.0.1 / ~1.7.4 |
| Email | aiosmtplib | ~3.0.1 |
| Containerization | Docker + Docker Compose | — |

## Getting Started

### Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux) — [Install Docker](https://docs.docker.com/get-docker/)
- **Python 3.11+** — required to run `generate_env.py` — [Install Python](https://www.python.org/downloads/)
- **Node.js 18+** — only needed for local frontend development — [Install Node.js](https://nodejs.org/)

## Installation

### Clone the Repository
```shell
git clone <your-repository-url>
cd nexpy_vibecoding
```

### Docker Deployment (4 Containers — Recommended)

1. **(Optional) Create `chatgpt_credentials.env`** to enable the ChatGPT extension:
    ```ini
    open_ai_organization=org-your_openai_key
    open_ai_secret_key=sk-your_openai_key
    ```

2. **Generate secrets and start all containers:**

    * PowerShell / Linux:
        ```shell
        python generate_env.py ; docker-compose build --no-cache ; docker-compose up -d
        ```
    * CMD:
        ```shell
        python generate_env.py && docker-compose build --no-cache && docker-compose up -d
        ```
    * Step by step:
        ```shell
        python generate_env.py
        docker-compose build --no-cache
        docker-compose up -d
        ```

### Uninstall
```shell
docker-compose down -v
```

---

### Backend Only (FastAPI)

You must have MongoDB and Redis running locally first.

<details>
<summary><b>Create a .env file or run <code>python generate_env.py</code></b></summary>
<p>

```ini
# MongoDB connection
mongodb_server=localhost
mongodb_port=27017
mongodb_username=bringthemhome
mongodb_password=bringthemhome

# FastAPI
fastapi_ui_username=bringthemhome
fastapi_ui_password=bringthemhome
jwt_secret_key=bringthemhome
static_bearer_secret_key=bringthemhome
algorithm=HS256

# ChatGPT (optional)
open_ai_organization=org-your_openai_key
open_ai_secret_key=sk-your_openai_key

# Default root user
owner_username=root
owner_password=bringthemhome
owner_email=admin@example.com
```

> Note: Use `mongodb_server=localhost` when running locally, or `mongodb_server=mongodb` when inside Docker.

</p>
</details>

```shell
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Frontend Only (Next.js)

<details>
<summary><b>Create <code>nextjs/.env</code> if needed (defaults are loaded automatically by <code>generate_env.py</code>)</b></summary>
<p>

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=your_static_bearer_secret_key
```

</p>
</details>

```shell
cd nextjs
npm install

# Development
npm run dev

# Production
npm run build
npm start
```

## Usage

| Service | URL | Default Credentials |
|---|---|---|
| Frontend | http://localhost:3000 | `root` / `bringthemhome` |
| FastAPI Docs (Swagger) | http://localhost:8000/docs | `bringthemhome` / `bringthemhome` |
| FastAPI Docs (ReDoc) | http://localhost:8000/redoc | same as above |

> The Swagger UI is password-protected and will block access for 5 minutes after 5 consecutive failed login attempts.

## Security Practices

- Passwords hashed with bcrypt (never stored in plain text).
- JWT tokens signed with HS256 and validated against Redis on every request.
- Rate limiting on authentication endpoints to prevent brute-force attacks.
- API documentation endpoints are hidden behind HTTP Basic Auth.
- Environment secrets auto-generated with cryptographically secure random keys via `generate_env.py`.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.