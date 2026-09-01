# Task API — Postgres, Docker & Supabase Auth

A CRUD API for managing tasks, now secured with authentication. This project has grown through several stages: it started as an in-memory task list, moved to SQLite, then to a containerized PostgreSQL database, and now adds user accounts and protected routes via Supabase Auth. The task endpoints themselves have never changed behavior across any of these swaps, thanks to a layered architecture (routes → controllers → service/middleware → data).

## Tech stack

- Node.js + Express
- PostgreSQL (via Docker)
- Docker + Docker Compose
- Supabase Auth (Identity Provider — accounts, password hashing, JWTs)
- Layered architecture: routes / controllers / service / data / middleware

## Run the whole stack

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
cp .env.example .env
```

Fill in `.env` with your own Supabase project values (see below), then:

```bash
docker compose up -d db
node index.js
```

The API runs at `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```

- `DATABASE_URL` — connects to the local Postgres container
- `SUPABASE_URL` / `SUPABASE_KEY` — from your own Supabase project's **Project Settings → API** (use the **anon** key, never the `service_role` key)

`.env` is git-ignored and never committed. `.env.example` documents the required variable names with placeholder values.

## Setting up your own Supabase project

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**, copy your **Project URL** and **anon key**
3. Go to **Authentication → Sign In / Providers → Email**, and turn **off** "Confirm email" for local testing (so a fresh signup can log in immediately)

## Endpoints

| Method | Path                  | Description                                                   | Auth required |
|--------|-----------------------|----------------------------------------------------------------|----------------|
| GET    | /                     | API info                                                        | No             |
| GET    | /health               | Health check                                                     | No             |
| GET    | /tasks                | List all tasks                                                    | No             |
| GET    | /tasks/:id            | Get a single task                                                  | No             |
| POST   | /tasks                | Create a new task                                                   | No             |
| PUT    | /tasks/:id            | Update a task                                                        | No             |
| DELETE | /tasks/:id            | Delete a task                                                         | No             |
| POST   | /auth/signup          | Create a new account                                                   | No             |
| POST   | /auth/login           | Log in, returns an access token                                         | No             |
| POST   | /auth/logout          | End the current session                                                   | Yes            |
| GET    | /public/info          | Open, unauthenticated info                                                  | No             |
| GET    | /protected/profile    | Return the logged-in user's own profile                                     | Yes            |
| GET    | /protected/dashboard  | A second example of a protected route, reusing the same guard                | Yes            |

Routes marked "Auth required" expect a header:
```
Authorization: Bearer <access_token>
```

## Task shape

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending"
}
```

`status` must be one of: `Pending`, `In Progress`, `Completed`.

## Auth flow

1. `POST /auth/signup` with `{ "email": "...", "password": "..." }` creates a Supabase-managed account
2. `POST /auth/login` with the same credentials returns `access_token` and `refresh_token`
3. Send the `access_token` on any protected route:
   ```
   Authorization: Bearer <access_token>
   ```
4. `POST /auth/logout` (also requires the token) ends the session

The server never stores or hashes passwords itself — Supabase handles that entirely. The server's only job is verifying tokens Supabase issues.

## Example requests

**Sign up:**
```
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Log in:**
```
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Call a protected route:**
```
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>"
```

Response:
```
[PASTE A REAL curl -i OUTPUT HERE]
```

## Validation & status codes

- `POST /auth/signup` and `/auth/login` reject a missing email or password with `400`
- `POST /auth/login` returns `401` for invalid credentials (a deliberately generic message, to avoid revealing which emails have accounts)
- Any protected route returns `401` if the `Authorization` header is missing, malformed, or the token is invalid/expired
- `POST /tasks` and `PUT /tasks/:id` reject a missing/empty `title` or an invalid `status` with `400`
- Requesting a task id that doesn't exist returns `404`
- Successful task creation returns `201`; successful deletion returns `204`
- Successful logout returns `204`

## Architecture

```
project/
├── index.js                 # wires everything together, starts the server
├── routes/                  # URL to controller mapping only
│   ├── tasks.routes.js
│   ├── auth.routes.js
│   └── protected.routes.js
├── controllers/              # HTTP translation: req/res, status codes
│   ├── tasks.controller.js
│   ├── auth.controller.js
│   └── protected.controller.js
├── middleware/
│   └── auth.middleware.js     # requireAuth — verifies a bearer token, attaches req.user
├── data/
│   ├── task.data.js             # Postgres queries for tasks
│   └── supabase.client.js         # Supabase client setup
├── Dockerfile                       # recipe for building the app's image
├── compose.yaml                       # describes app + database services
├── openapi.json                        # OpenAPI spec, including bearer auth scheme
├── .env.example                          # documents required env vars
└── .gitignore                              # excludes node_modules and .env
```

## How the auth guard works

`middleware/auth.middleware.js` exports a single function, `requireAuth`, that:

1. Reads the `Authorization` header and checks it starts with `Bearer `
2. Extracts the token and asks Supabase directly whether it's genuine (`supabase.auth.getUser(token)`) — a real network call, so the answer is trustworthy, not just a local shape check
3. On failure, responds `401` immediately
4. On success, attaches the verified user to `req.user` and calls `next()`, letting the actual route run

Any route that needs authentication just adds `requireAuth` as a second argument before its controller function:
```javascript
router.get('/profile', requireAuth, protectedController.protectedProfile);
```

`GET /protected/dashboard` reuses this exact same middleware as proof — no new auth code was written for it.

## Docker setup

- **`db` service** — the official `postgres:16` image, with a named volume (`taskdata`) so data survives restarts
- **`api` service** — built from the local `Dockerfile`, waits for `db` to report healthy before starting
- During active development, only `db` is run via Docker (`docker compose up -d db`), with the app run directly via `node index.js` for faster iteration; the full stack (`docker compose up -d`) is used to confirm the one-command story still works

## Swagger UI

Interactive docs are available at `http://localhost:3000/docs`. Protected routes show a padlock icon. Click **Authorize**, paste an access token (no "Bearer " prefix needed), and every subsequent "Try it out" call on a locked route sends it automatically.

![Swagger UI with bearer auth](swagger-auth-screenshot.png)

## What I'd fix with another day

*(Fill in — e.g. add a refresh-token endpoint, add a real 403 case for role-based access, rate-limit login attempts.)*