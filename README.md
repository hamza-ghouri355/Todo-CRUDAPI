Task API — Postgres + Docker

A CRUD API for managing tasks, built with Node.js and Express, now running against a real PostgreSQL database in Docker. This is the third storage backend for this project — it started as an in-memory array, moved to SQLite, and now runs on containerized Postgres. The API itself never changed across any of these swaps, only the storage layer, thanks to the layered architecture (routes → controllers → service → data).

Tech stack
Node.js + Express
PostgreSQL (via Docker)
Docker + Docker Compose
Layered architecture: routes / controllers / service / data
Run the whole stack with one command
bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
cp .env.example .env
docker compose up

The API runs at http://localhost:3000, backed by a Postgres database running in its own container. On first run, the tasks table is created automatically and seeded with 3 example tasks.

Environment variables

Copy .env.example to .env:

DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks

.env holds the real values and is git-ignored. .env.example documents the variable names with placeholder values so anyone cloning the repo knows what to set.

Endpoints
Method	Path	Description
GET	/	API info
GET	/health	Health check
GET	/tasks	List all tasks
GET	/tasks/:id	Get a single task
POST	/tasks	Create a new task
PUT	/tasks/:id	Update a task
DELETE	/tasks/:id	Delete a task
Task shape
json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending"
}

status must be one of: Pending, In Progress, Completed.

Example request
curl -i http://localhost:3000/tasks

Response:

[PASTE A REAL curl -i OUTPUT HERE]
Validation & status codes
POST and PUT reject a missing/empty title with 400
POST and PUT reject an invalid status with 400
Requesting a task id that doesn't exist returns 404
Successful creation returns 201
Successful deletion returns 204 with no body
Architecture
project/
├── index.js          # wires everything together, starts the server
├── routes/            # URL to controller mapping only
├── controllers/         # HTTP translation: req/res, status codes
├── service/               # business rules and validation
├── data/                    # database queries (Postgres via pg)
├── Dockerfile                 # recipe for building the app's image
├── compose.yaml                  # describes app + database together
├── .env.example                     # documents required env vars
└── .gitignore                         # excludes node_modules and .env

Each layer only knows about the one below it. The data/ layer is the only file that changed when the storage engine moved from an in-memory array → SQLite → Postgres — routes, controllers, and service logic stayed identical across all three.

Docker setup
db service — runs the official postgres:16 image, with a named volume (taskdata) so data survives container restarts and docker compose down
api service — built from the local Dockerfile, waits for db to report healthy (via a Postgres pg_isready healthcheck) before starting, so it never tries to connect before the database is ready
Inside the Compose network, the app reaches the database at the hostname db (the service name), not localhost — that only applies inside Docker. Running the app directly on your machine, outside Compose, still uses localhost.
Persistence

Data is stored in a Docker-managed volume (taskdata) and survives:

Restarting the app
A full docker compose down followed by docker compose up

Data is lost only if the volume itself is explicitly removed (docker compose down -v or docker volume rm taskdata).