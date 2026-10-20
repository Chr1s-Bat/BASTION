# BASTION — Base Logistics & Requisition Command

**Developer:** [Your Full Name]  ·  **Course:** React Fundamentals with Laravel as Backend — Mini Capstone
**Demo video (5–8 min):** [paste link here]  ·  **Slides:** [`docs/BASTION-slides.pdf`](docs/BASTION-slides.pdf)

## Theme

BASTION is a supply-office system for a military base. Officers register equipment and file requisitions;
the Base Commander approves, issues and closes them out while the system tracks stock across depots.
It handles non-weapon logistics only: radios, vehicles, medical supplies, power equipment, field gear,
rations and navigation tools.

**Client (proposal):** the Supply Office of a reserve logistics battalion.
**Problem:** requests are tracked on paper and spreadsheets, so stock levels are wrong, approvals get lost,
and nobody knows who holds which equipment.

## Roles

| Role | Label in the app | Can do |
|---|---|---|
| `user` | Supply Officer | Register equipment, file requisitions, edit/withdraw their own while pending, see only their own requisitions |
| `admin` | Base Commander | Everything above, plus approve / reject / issue / mark returned, change equipment status, delete equipment, view all requisitions and the Personnel Roster |

New sign-ups always receive the `user` role. Roles can never be self-assigned.

## Features

- **Auth:** register, login, logout (token revoked), current user — Laravel Sanctum bearer tokens
- **Role-based access:** `role:admin` middleware + policies on the API; protected/admin route guards and hidden menu items in React
- **Two related resources with full CRUD:** *Items* (equipment) and *Requisitions*; items belong to a category, a depot and a creator
- **Search + filters:** items (name/serial, category, depot, status, low stock) and requisitions (text, status, priority)
- **Pagination:** Laravel `paginate()` rendered by a reusable React component
- **Dashboard:** 8 figures, a category bar chart, a status donut chart and the latest requisitions (officers see their own figures, commanders see base-wide)
- **Validation on both sides:** React field checks plus Laravel Form Requests; server 422 messages appear under the matching field
- **Feedback:** loaders, toasts, empty and error states, confirmation dialog before every delete or workflow step
- **Workflow:** `pending → approved → issued → returned` (or `rejected`). Issuing deducts stock, returning restores it, invalid jumps are refused
- **Extras:** low-stock alerts, equipment status control, Personnel Roster (admin only, in both React and API), responsive/mobile layout, feature tests

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router 6, Axios, Context API, Recharts, lucide-react, plain CSS |
| Backend | Laravel 12 (PHP 8.2+), Laravel Sanctum, Form Requests, Policies, API Resources |
| Database | MySQL / MariaDB |

## Repository layout

```
backend/    Laravel API
frontend/   React app (Vite)
docs/       ERD, Postman collection, screenshots, slides, scripts
```

## Quick start on Windows (recommended)

From the project folder (the one containing `backend`, `frontend` and `docs`):

```bat
scripts\setup-windows.bat          :: first time only (MySQL database "bastion" must exist; XAMPP/phpMyAdmin is fine)
scripts\setup-windows.bat sqlite   :: or this, if you have no MySQL
scripts\start-windows.bat          :: starts the API and the React app, opens the browser
```

The manual steps below do exactly the same thing.

## Setup

**Requirements:** PHP 8.2+ (with `pdo_mysql`), Composer, Node 18+, MySQL running locally (or use the SQLite option).

> Run every command from inside the `backend` or `frontend` folder, not the project root: `artisan` and `composer.json` live in `backend/`.

### 1. Backend
```bash
cd backend
composer install
cp .env.example .env            # Windows: copy .env.example .env
php artisan key:generate
```
Create an empty MySQL database named `bastion`, and set `DB_USERNAME` / `DB_PASSWORD` in `backend/.env` if yours differ from `root` / empty. Then:
```bash
php artisan migrate --seed      # creates tables + realistic demo data
php artisan serve               # API at http://localhost:8000
```

### 2. Frontend (second terminal)
```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8000/api
npm run dev                     # app at http://localhost:5173
```

### 3. Optional: run the tests
```bash
cd backend && php artisan test
```

> **Troubleshooting:** "Cannot reach the BASTION API" → the Laravel server is not running or `VITE_API_URL` is wrong.
> CORS errors → make sure the frontend runs on `localhost:5173` (see `CORS_ALLOWED_ORIGINS` in `backend/.env`).

## Demo accounts

Password for every account: `Password123!`

| Role | Email |
|---|---|
| Base Commander (admin) | `admin@bastion.test` |
| Supply Officer (user) | `officer@bastion.test` |

Four more officers are seeded. Seed data: 7 categories, 4 depots, 24 equipment items and 28 requisitions in every workflow state, with real-sounding names, serial numbers and dates.

## API documentation

Import [`docs/BASTION.postman_collection.json`](docs/BASTION.postman_collection.json) into Postman or Thunder Client
(32 requests with built-in tests, including 401/403/404/422 cases). Run **1. Auth** first; it stores the tokens.
Base URL: `http://localhost:8000/api`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/register` | Public | Create account (always role `user`) |
| POST | `/api/login` | Public | Return token |
| POST | `/api/logout` | Auth | Revoke current token |
| GET | `/api/user` | Auth | Current user |
| GET | `/api/items?search=&category_id=&depot_id=&status=&low_stock=&sort=&dir=&page=&per_page=` | Auth | List with search, filters, pagination |
| POST | `/api/items` | Auth | Create |
| GET | `/api/items/{id}` | Auth | View one |
| PUT | `/api/items/{id}` | Owner / Admin | Update |
| DELETE | `/api/items/{id}` | Admin | Delete (204) |
| PATCH | `/api/items/{id}/status` | Admin | Change equipment status |
| GET | `/api/requisitions?search=&status=&priority=&page=` | Auth | List (own; admin sees all) |
| POST | `/api/requisitions` | Auth | Create |
| GET | `/api/requisitions/{id}` | Owner / Admin | View one |
| PUT | `/api/requisitions/{id}` | Owner / Admin | Edit while pending |
| DELETE | `/api/requisitions/{id}` | Owner (pending) / Admin | Delete (204) |
| PATCH | `/api/requisitions/{id}/status` | Admin | Workflow transition |
| GET | `/api/dashboard` | Auth | Summary figures and chart data |
| GET | `/api/meta` | Auth | Categories, depots, status lists for dropdowns |
| GET | `/api/users?search=&role=&page=` | Admin | Personnel roster |

Status codes used: 200, 201, 204, 401, 403, 404, 422.

## Security

- Sanctum bearer tokens; passwords hashed; logout revokes the token; login/register are rate-limited
- Admin endpoints are blocked by the `role:admin` middleware, and ownership rules by policies; React hides and guards the same pages
- Every API write is validated by a Form Request; responses use API Resources so internal fields never leak
- CORS limited to the configured frontend origin; real `.env` files are git-ignored

## Documentation

| File | Contents |
|---|---|
| [`docs/erd.png`](docs/erd.png) (+ `erd.svg`) | Entity relationship diagram |
| [`docs/BASTION.postman_collection.json`](docs/BASTION.postman_collection.json) | Exported API collection |
| [`docs/screenshots/`](docs/screenshots) | Main pages, validation, workflow, roles, mobile |
| [`docs/BASTION-slides.pdf`](docs/BASTION-slides.pdf) | Final presentation slides (8) |
| [`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md) | Timed script for the live demo and the demo video |

## Delivered vs. the Day 2 proposal

All required features were delivered (see Features). _Add one line here for anything in your Day 2 proposal that changed._

## Known limitations / Phase 2

No email notifications, report export, equipment photos, per-depot stock counts or audit log yet. Recommended Phase 2: email alerts for approvals and low stock, PDF/CSV reports, photo upload per item, stock transfers between depots, and an audit trail.

## References and AI-use declaration

Laravel, Sanctum, React, Vite, Recharts and lucide-react documentation. This project was built with the help of an AI assistant (Claude); the developer reviewed, ran and is able to explain the code. _Adjust this statement to match your course's academic-integrity rules._
