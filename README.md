# Task API

A CRUD API for managing a to-do list, built with Node.js, Express, and SQLite. Originally built for the FlyRank Backend Internship (Week 2, Assignment A1), later extended with persistent storage.

## What this is

This API lets you create, read, update, and delete tasks. Task data is stored in a SQLite database file (`tasks.db`), so it persists across server restarts.

## Tech stack

- Node.js + Express
- SQLite (via `sqlite` + `sqlite3`)
- Swagger UI for interactive API docs

## Install & Run

```bash
npm install
node server.js
```

The server runs at `http://localhost:3000`. On first run, it automatically creates `tasks.db` and seeds it with 3 example tasks.

## Endpoints

| Method | Path         | Description              |
|--------|--------------|---------------------------|
| GET    | /            | API info                  |
| GET    | /health      | Health check               |
| GET    | /tasks       | List all tasks             |
| GET    | /tasks/:id   | Get a single task          |
| POST   | /tasks       | Create a new task          |
| PUT    | /tasks/:id   | Update a task               |
| DELETE | /tasks/:id   | Delete a task               |

## Example request
curl.exe -i http://localhost:3000/tasks 
 
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 156
ETag: W/"9c-0yo3F3w3oxAQIBPmOwuNtDAp5HA"
Date: Sat, 25 Jul 2026 13:26:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"buy groceries","completed":false},{"id":2,"title":"clean the house","completed":true},{"id":3,"title":"finish project","completed":false}]