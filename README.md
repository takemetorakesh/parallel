# Task Management System

Full-stack task manager: **React + TypeScript (Vite, Tailwind)** frontend and **FastAPI** backend.
Tasks live in backend memory only (no database); data resets when the server restarts.

| | |
|---|---|
| ![Dashboard](docs/dashboard-light.jpg) | ![Task details, dark mode](docs/task-details-dark.jpg) |

## Features
- Dashboard with create, edit, view (drawer) and delete (with confirmation)
- Loading skeleton, empty state (with/without filters), error state with retry, toasts
- Client-side form validation, plus server errors mapped back onto form fields
- **Bonus:** debounced search, status/priority filters, sorting (created / priority / due date), pagination, dark mode (follows system, persisted), Swagger docs, Postman collection
- Responsive: single column on mobile, 2–3 columns on larger screens

## Requirements
Python 3.10+ and Node 20+.

## Run it

**Backend** (http://localhost:8000, Swagger UI at `/docs`)
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # optional
uvicorn app.main:app --reload --port 8000
```

**Frontend** (http://localhost:5173)
```bash
cd frontend
npm install
cp .env.example .env        # optional
npm run dev
```
In dev, Vite proxies `/api` to the backend, so no CORS setup is needed. For a production build, set `VITE_API_URL` to the backend origin and add the frontend origin to the backend's `CORS_ORIGINS`.

**Tests**
```bash
cd backend && pytest
cd frontend && npm run build   # type-checks and builds
```

## Environment variables
| File | Variable | Default | Purpose |
|---|---|---|---|
| `backend/.env` | `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed origins |
| | `SEED_DATA` | `true` | Seed sample tasks on startup |
| | `API_PREFIX` | `/api` | URL prefix for the API routes |
| `frontend/.env` | `VITE_API_URL` | *(empty)* | Backend origin; empty = use the dev proxy |
| | `VITE_PROXY_TARGET` | `http://localhost:8000` | Dev proxy target |

## API
Base path `/api`. JSON uses camelCase. Interactive docs: `http://localhost:8000/docs`. Postman: [`docs/postman_collection.json`](docs/postman_collection.json).

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| GET | `/api/tasks` | List tasks (search, filter, sort, paginate) | 200, 400 |
| GET | `/api/tasks/{id}` | Get one task | 200, 404 |
| POST | `/api/tasks` | Create a task | 201, 400 |
| PUT | `/api/tasks/{id}` | Update a task (omitted fields unchanged; `dueDate: null` clears it) | 200, 400, 404 |
| DELETE | `/api/tasks/{id}` | Delete a task | 200, 404 |
| GET | `/health` | Liveness check | 200 |

**Task:** `id`, `title` (1–120), `description` (1–2000), `status` (`pending` \| `in_progress` \| `completed`), `priority` (`low` \| `medium` \| `high`), `dueDate` (`YYYY-MM-DD` or null), `createdAt`, `updatedAt`.
`title` and `description` are required on create; `status` defaults to `pending`, `priority` to `medium`.

**List query params:** `q`, `status`, `priority`, `sortBy` (`createdAt` \| `priority` \| `dueDate`, default `createdAt`), `order` (`asc` \| `desc`, default `desc`), `page` (≥1), `limit` (1–100, default 10). Tasks without a due date sort last.

```bash
curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{
  "title": "Complete assignment",
  "description": "Build the full-stack task manager",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-10-05"
}'
```

List response:
```json
{ "data": [ { "id": "…", "title": "…" } ], "meta": { "total": 11, "page": 1, "limit": 10, "pages": 2 } }
```

Errors share one shape. Validation failures return **400** (not FastAPI's default 422):
```json
{ "error": { "code": "validation_error", "message": "Invalid request data",
             "details": [ { "field": "title", "message": "String should have at least 1 character" } ] } }
```
Codes: `validation_error` (400), `not_found` (404), `internal_error` (500).

## Structure
```
backend/app
├── main.py                  app factory, CORS, routers
├── core/config.py           env-based settings
├── routes/task_routes.py    HTTP routing only
├── controllers/             404 mapping, response shaping
├── services/task_service.py in-memory store + search/filter/sort/paginate
├── schemas/task.py          Pydantic models (camelCase aliases)
└── middleware/error_handler.py  centralized error handling
frontend/src
├── api/                     fetch wrapper + typed task calls (only place that touches the network)
├── hooks/                   useTasks (data + query state), useDebounce, useTheme
├── components/              TaskCard, TaskForm, TaskDetailsDrawer, Toolbar, Pagination, Modal, …
└── pages/Dashboard.tsx      composes everything
```

## Design notes
- Routes → controllers → services; the service owns storage (guarded by a lock) so swapping in a DB later touches one file.
- `PUT` accepts partial bodies rather than requiring every field.
- After any mutation the list is refetched; if that leaves the current page empty, the UI steps back to the last page.
