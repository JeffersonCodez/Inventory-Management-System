# Ledger — Inventory Management System

A dark-themed, gold-accented inventory management system for small businesses: products, categories, suppliers, stock in/out, transaction history, reports, and role-based access (admin / staff).

## Project structure

```
ledger-inventory-system/
├── frontend/               # Static HTML/CSS/JS prototype — zero setup, open index.html, mock data
├── frontend-react/          # React app — real components/routing, wired to the real backend below
├── backend/                   # Express + MySQL API — real auth, CRUD, transactional stock movement
│   ├── src/                     # config / models / controllers / routes / middleware / services / utils
│   ├── migrations/                # SQL schema
│   ├── seeds/                      # Sample data (products/categories/suppliers/transactions)
│   ├── scripts/seedUsers.js          # Creates demo logins with real bcrypt hashes
│   └── tests/                         # Dependency-free unit tests (node --test tests/)
├── database/
│   ├── inventory.db         # Standalone SQLite database (seeded) — same data, no backend needed
│   ├── schema.sql            # Same schema as backend/migrations/
│   ├── seed.sql               # Same seed data as backend/seeds/
│   └── README.md
├── docs/
│   └── PROJECT_DOCUMENTATION.md   # Architecture, ERD, full API reference, implementation plan
└── README.md                # You are here
```

## Quick start — the full, real stack

```bash
# 1) Database
mysql -u root -p < backend/migrations/001_initial_schema.sql
mysql -u root -p < backend/seeds/001_sample_data.sql

# 2) Backend
cd backend
cp .env.example .env    # add your MySQL credentials + a JWT secret
npm install
npm run seed:users        # creates admin@ledger.io / admin123 and staff@ledger.io / staff123
npm run dev                # http://localhost:4000

# 3) Frontend (new terminal)
cd frontend-react
npm install
npm run dev                # http://localhost:5173
```
Open `http://localhost:5173` and log in with the seeded demo accounts. This is now a genuinely connected full-stack app — the React frontend calls the real Express API, which reads and writes a real MySQL database.

**Just want to look at something with zero setup?** Open `frontend/index.html` directly in a browser (static prototype, mock data), or `database/inventory.db` with [DB Browser for SQLite](https://sqlitebrowser.org/).

## Status

| Layer | State |
|---|---|
| Static prototype (`frontend/`) | Built — vanilla HTML/CSS/JS, mock data, standalone |
| React app (`frontend-react/`) | Built and **wired to the real backend** — no more mock data |
| Backend API (`backend/`) | Built — real Express/MySQL/JWT/bcrypt |
| Database | Schema + seed data ready (SQLite and MySQL) |
| Frontend ↔ Backend connection | **Wired** — verified end-to-end with a local test harness (see `backend/README.md` and `frontend-react/README.md`) |
| PDF / Excel export | Not implemented — CSV works; PDF/XLSX return `501` rather than fake success |
| Automated integration tests | Not shipped (they depended on local-only test shims); real unit tests are in `backend/tests/` |

## How this was verified

Both projects were built without npm registry access, so nothing here has been through a real `npm install` + build. Instead: every file passed a real syntax check (Node's own parser for the backend, a TypeScript-compiler JSX check for the frontend), and the **actual application code** — real routes, controllers, models, and the real frontend API layer — was run end-to-end against local stand-ins for MySQL, Express, JWT, and bcrypt. That process found and fixed three real bugs along the way (a bad SQL table alias, a pagination edge case with `limit=0`, and a missing user-name join). Full details in `backend/README.md` and `frontend-react/README.md`.

**Bottom line:** the logic has real end-to-end verification behind it; a real `npm install` on your machine is still the first real test of the actual `express`/`mysql2`/etc. packages themselves.

## Tech stack (as specified)

React · Node.js · Express · MySQL · JWT · Chart.js · Tailwind CSS · Lucide React — all built and connected. See `docs/PROJECT_DOCUMENTATION.md` for the original architecture plan.
