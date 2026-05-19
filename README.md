# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack. Manage your sales pipeline with role-based access control, advanced filtering, real-time search, and CSV export.

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://service-hive-intern-assigmentfronte.vercel.app |
| **API Docs** | https://service-hive-intern-assigmentfronte.vercel.app/apidocs |
| **Backend API** | https://service-hive-intern-assigmentbacken.vercel.app |

---

## Features

### Core
- **JWT Authentication** — Register, login, protected routes, bcrypt password hashing
- **Leads CRUD** — Create, read, update, delete leads with full validation
- **Advanced Filtering** — Filter by status, source, search by name/email, sort by date — all combinable
- **Backend Pagination** — 10 records per page with full metadata (`page`, `limit`, `total`, `totalPages`)
- **Role-Based Access Control** — Admin (full access to all leads) vs Sales User (own leads only, no delete)

### Mandatory Additional
- **Debounced Search** — 400ms debounce on name/email search
- **CSV Export** — Exports current filtered view as a properly escaped `.csv` file
- **Docker Setup** — Multi-stage Dockerfiles for backend and frontend, `docker-compose.yml` with MongoDB

### Bonus
- **CSV Import** — Bulk import leads from a `.csv` file with per-row validation and a result summary banner
- **Dark Mode** — System-preference aware, persisted to localStorage, toggle in navbar
- **Dark-themed Auth Panel** — Glassmorphism lead preview cards on the login/register left panel
- **Live Stats Cards** — Total, New, Qualified, Lost lead counts via aggregation endpoint
- **Relative Timestamps** — "2m ago", "3h ago" style in the leads table
- **Interactive API Docs** — Full API reference at `/apidocs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4 |
| State / Data | TanStack React Query v5, React Hook Form |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Icons | Lucide React |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Validation | Zod (backend) |
| Auth | JSON Web Tokens, bcryptjs |
| Containerisation | Docker, Docker Compose, nginx |

---

## Project Structure

```
InternAssignment/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Auth + Lead controllers
│   │   ├── middleware/      # authenticate, requireAdmin, errorHandler
│   │   ├── models/          # User, Lead Mongoose models
│   │   ├── routes/          # auth.routes, lead.routes
│   │   ├── types/           # Express Request augmentation
│   │   ├── utils/           # jwt helpers, response helpers
│   │   ├── validators/      # Zod schemas
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # axios instance, auth API, leads API
│   │   ├── components/
│   │   │   ├── layout/      # Navbar
│   │   │   ├── leads/       # LeadsTable, FiltersBar, Modals
│   │   │   └── ui/          # Button, Input, Modal, Badge, Avatar, Skeleton…
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useAuth, useDebounce
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, NotFoundPage
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # localStorage token helpers
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas account **or** Docker Desktop (for local MongoDB)

---

### Option A — Local Development

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd InternAssignment
```

**2. Configure the backend**
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-leads
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**3. Install and run the backend**
```bash
# still inside /backend
npm install
npm run dev
# → Server running on port 5000
```

**4. Install and run the frontend** *(new terminal)*
```bash
cd frontend
npm install
npm run dev
# → App running on http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to the backend automatically — no extra config needed.

---

### Option B — Docker

**1. Configure root environment**
```bash
cp .env.example .env
```
Edit `.env` and set a strong `JWT_SECRET`:
```env
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```

**2. Build and start all services**
```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 (internal) |

**Other Docker commands**
```bash
# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and delete database volume
docker-compose down -v
```

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | No | Frontend URL for CORS (default: `http://localhost:5173`) |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend API base URL (default: `/api` via Vite proxy) |

---

## API Documentation

> **Interactive API Docs** — visit [`https://service-hive-intern-assigmentfronte.vercel.app/apidocs`](https://service-hive-intern-assigmentfronte.vercel.app/apidocs) (or `http://localhost:5173/apidocs` locally / `http://localhost/apidocs` via Docker) for a beautifully rendered, interactive version of this documentation directly in the app.

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

All responses follow the format:
```json
{
  "success": true,
  "message": "...",
  "data": { },
  "meta": { }
}
```

---

### Auth Endpoints

#### `POST /api/auth/register`
Register a new user.

**Body**
```json
{
  "name": "Lakshay Punia",
  "email": "lakshay@example.com",
  "password": "secret123",
  "role": "admin"
}
```
`role` is optional — defaults to `sales_user`. Accepted values: `admin`, `sales_user`.

**Response `201`**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Lakshay Punia", "email": "lakshay@example.com", "role": "admin" }
  }
}
```

---

#### `POST /api/auth/login`
Login with existing credentials.

**Body**
```json
{ "email": "lakshay@example.com", "password": "secret123" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Lakshay Punia", "email": "lakshay@example.com", "role": "admin" }
  }
}
```

---

#### `GET /api/auth/me` 🔒
Get the currently authenticated user.

**Response `200`**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "Lakshay Punia", "email": "lakshay@example.com", "role": "admin" }
}
```

---

### Lead Endpoints

All lead endpoints require authentication (`🔒`). Delete requires admin role (`🛡`).

#### `GET /api/leads` 🔒
Get paginated leads with optional filters.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: `1`) |
| `limit` | number | Records per page (default: `10`, max: `100`) |
| `status` | string | Filter by `New`, `Contacted`, `Qualified`, or `Lost` |
| `source` | string | Filter by `Website`, `Instagram`, or `Referral` |
| `search` | string | Search by name or email (case-insensitive) |
| `sort` | string | `latest` (default) or `oldest` |

All filters combine — e.g. `?status=Qualified&source=Instagram&search=rahul`.

**Response `200`**
```json
{
  "success": true,
  "data": [ { "_id": "...", "name": "...", "email": "...", "status": "Qualified", "source": "Instagram", "createdBy": { "name": "...", "email": "..." }, "createdAt": "..." } ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

> **RBAC:** Admin sees all leads. Sales User sees only their own leads.

---

#### `POST /api/leads` 🔒
Create a new lead.

**Body**
```json
{
  "name": "Priya Sharma",
  "email": "priya@startup.io",
  "source": "Instagram",
  "status": "New"
}
```
`status` is optional — defaults to `New`.

**Response `201`**
```json
{ "success": true, "message": "Lead created", "data": { "_id": "...", ... } }
```

---

#### `GET /api/leads/stats` 🔒
Get lead count by status for dashboard cards.

**Response `200`**
```json
{
  "success": true,
  "data": { "total": 42, "New": 15, "Contacted": 12, "Qualified": 10, "Lost": 5 }
}
```

> **RBAC:** Admin gets counts for all leads. Sales User gets counts for their own leads only.

---

#### `GET /api/leads/export` 🔒
Export leads as a CSV file. Accepts the same query parameters as `GET /api/leads` (except `page` and `limit`).

**Response** — `Content-Type: text/csv`, file download.

---

#### `GET /api/leads/:id` 🔒
Get a single lead by ID.

**Response `200`**
```json
{ "success": true, "data": { "_id": "...", "name": "...", ... } }
```

---

#### `PUT /api/leads/:id` 🔒
Update a lead. All fields are optional.

**Body**
```json
{ "status": "Qualified" }
```

> **RBAC:** Sales User can only update their own leads.

---

#### `DELETE /api/leads/:id` 🔒🛡
Delete a lead. **Admin only.**

**Response `200`**
```json
{ "success": true, "message": "Lead deleted", "data": null }
```

---

#### `POST /api/leads/import` 🔒
Bulk import leads from a CSV file. Requires `Content-Type: text/csv`. Columns: `Name`, `Email`, `Source` (required), `Status` (optional, defaults to `New`).

**Body** — raw CSV text
```csv
Name,Email,Status,Source
Priya Sharma,priya@startup.io,Qualified,Instagram
Rahul Gupta,rahul@techco.com,New,Website
```

**Response `200`**
```json
{ "success": true, "message": "Imported 2 lead(s)", "data": { "imported": 2, "failed": 0, "errors": [] } }
```

---

### Error Responses

```json
{ "success": false, "message": "Error description" }
```

| Status | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Missing or invalid token |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already registered) |
| `500` | Internal server error |

---

## Scripts

### Backend
```bash
npm run dev      # ts-node-dev with hot reload
npm run build    # compile TypeScript → dist/
npm run start    # run compiled output
```

### Frontend
```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm run lint     # ESLint
```

---

## Author

**Lakshay Punia** — MERN Stack Internship Assignment
