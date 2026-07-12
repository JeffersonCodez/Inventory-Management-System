# Ledger — Backend API

The real Express + MySQL API for the Ledger inventory system, implementing every endpoint specified in `docs/PROJECT_DOCUMENTATION.md`.

## Setup

**1. Install MySQL** if you don't already have it running, and create the database:
```bash
mysql -u root -p < migrations/001_initial_schema.sql
mysql -u root -p < seeds/001_sample_data.sql
```
This creates a `ledger_inventory` database with all five tables and loads the product/category/supplier sample data (12 products, 4 suppliers, 5 categories). User accounts and transaction history are seeded together in step 4 below — transactions reference a `user_id`, so they can't be loaded until real users exist.

**2. Configure environment variables:**
```bash
cp .env.example .env
```
Edit `.env` with your MySQL credentials and a real `JWT_SECRET` (any long random string — this signs login tokens).

**3. Install dependencies and start:**
```bash
npm install
npm run dev
```
The API listens on `http://localhost:4000` by default. `GET /health` should return `{"status":"ok"}` once it's up.

**4. Create working demo logins (and the transaction history):**
```bash
npm run seed:users
```
SQL files can't generate real bcrypt hashes, so user accounts are seeded by this script instead, using the actual `bcryptjs` package. It also seeds the 18 sample transactions, since each one references a `user_id` that can't exist until this step runs. It creates:
```
admin@ledger.io / admin123
staff@ledger.io  / staff123
```
plus two more (`priya@ledger.io`, `carlos@ledger.io`) with the same passwords, matching the original mock data's four users.

## How this was verified — read this before trusting it blindly

I built this without npm registry access (the sandbox I was working in had no network), so I couldn't run `npm install` against the real `express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, etc. Instead, I:

1. Syntax-checked every file directly with `node --check` (this needs no dependencies — Node parses plain JS/ESM natively).
2. Built minimal local stand-ins for `express`, `mysql2/promise` (backed by Node's built-in `node:sqlite`), `jsonwebtoken` (a real HS256 implementation via `node:crypto`), `bcryptjs` (real salted hashing via `scrypt`), `express-validator`, `cors`, `helmet`, `morgan`, and `dotenv` — then ran the **actual, unmodified application code** against them over real HTTP requests.
3. That caught two real bugs, both fixed in this version:
   - `Product.summary()` referenced a `p.` table alias in a query that never defined one — would have failed identically against real MySQL.
   - `parsePagination()` treated `limit=0` as falsy and silently replaced it with the default instead of clamping it to 1.
4. Verified auth, role-based access control, product/category/supplier CRUD, transactional stock in/out (including the overdraw-rejection and rollback path), pagination, search filtering, report generation, and CSV export — all against the real route/controller/service/model code, not a simplified version of it.

That test harness isn't shipped — it depended on shim-internal hooks (like a `pool.__rawDb` escape hatch) that don't exist on the real packages, so shipping it would mean a test suite that silently breaks the moment you run `npm install`. What's in `tests/` instead is a small set of real, dependency-free unit tests (`node --test tests/`) covering the pure logic — pagination math, status derivation, error shaping — that run today with zero setup.

**What this means for you:** the request/response shapes, SQL, and business logic have real end-to-end verification behind them. What it does *not* verify: the actual `mysql2`, `express`, `jsonwebtoken`, and `bcryptjs` packages behaving exactly like my stand-ins once installed for real. Those are extremely stable, widely-used libraries, so this is a low-risk gap — but run `npm install && npm run dev` and hit a few endpoints yourself before deploying this anywhere that matters.

## What's implemented vs. not

| Area | Status |
|---|---|
| Auth (login, JWT issuance/verification) | Implemented, verified |
| Role-based access control (admin/staff) | Implemented, verified |
| Products/Categories/Suppliers CRUD | Implemented, verified |
| Stock in/out (transactional, overdraw-safe) | Implemented, verified |
| Reports (inventory, low-stock, out-of-stock, stock-in, stock-out, value) | Implemented, verified |
| CSV export | Implemented, verified |
| PDF / Excel export | **Not implemented** — returns `501`. Needs `pdfkit` / `exceljs` wired into `reportController.js`; left out rather than shipped unverified |
| Rate limiting, request logging in production | `morgan` is wired in; `express-rate-limit` from the original plan is not added yet |
| Automated integration tests | Not shipped (see above) — only dependency-free unit tests are included |
| Refresh tokens / logout invalidation | Not implemented — JWTs are stateless and simply expire (`JWT_EXPIRES_IN` in `.env`) |

## API reference

Full endpoint list, request/response shapes, and the database schema are in `docs/PROJECT_DOCUMENTATION.md`. Quick summary:

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/products            ?search=&category=&status=&page=&limit=
GET    /api/products/summary
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id        (admin only)

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id      (admin only)

GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id       (admin only)

GET    /api/transactions        ?type=&search=&page=&limit=
GET    /api/transactions/recent ?type=&limit=
GET    /api/transactions/monthly-movement ?months=
GET    /api/transactions/:id
POST   /api/transactions/stock-in
POST   /api/transactions/stock-out

GET    /api/reports/:type       (inventory | low-stock | out-of-stock | stock-in | stock-out | value)
GET    /api/reports/:type/export?format=csv   (pdf/xlsx return 501 for now)

GET    /api/users                (admin only)
POST   /api/users                (admin only)
DELETE /api/users/:id            (admin only)
```

All routes except `/api/auth/login` and `/health` require `Authorization: Bearer <token>`.
