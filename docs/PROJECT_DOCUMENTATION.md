# Ledger — Inventory Management System
### Technical documentation & implementation plan

This document accompanies the interactive UI prototype (`inventory-management-system.html`) and the architecture/ERD diagrams shared in chat. It specifies everything needed to build the production system: folder structure, API contract, data model, and a phased implementation plan.

---

## 1. System overview

A three-tier web application for small-business inventory tracking:

- **Client** — React SPA (dashboard, product/category/supplier management, stock movement, reports)
- **API** — Node.js + Express REST API, stateless, JWT-authenticated, role-gated (admin / staff)
- **Data** — MySQL, accessed through a connection pool, no ORM required at small scale (raw parameterized queries via `mysql2`, or a lightweight query builder like Knex if the team prefers)

Request flow: the browser calls the API over HTTPS with a bearer JWT on every request after login. Middleware verifies the token, attaches the user and role to `req.user`, and route-level authorization checks the role before the controller touches the database. All writes go through parameterized queries; all reads support pagination, search, and filtering at the SQL level (not in-memory) once data volume grows past a few thousand rows.

---

## 2. Database schema

Five tables, matching the ERD shown above:

| Table | Purpose | Key relationships |
|---|---|---|
| `categories` | Product groupings | Referenced by `products.category_id` |
| `suppliers` | Vendor directory | Referenced by `products.supplier_id` |
| `products` | Catalog + live stock levels | Belongs to a category and supplier; has many transactions |
| `transactions` | Stock in / stock out ledger | Belongs to a product and a user |
| `users` | Login accounts + roles | Creates transactions |

Notes on the schema beyond the brief's minimum fields:

- `products.status` is **not** a stored column — it's derived at read time (or in a `GENERATED` column) from `quantity` vs. `minimum_stock`, so it can never drift out of sync after a stock movement.
- `transactions.transaction_type` is an `ENUM('in','out')`.
- Add a unique index on `products.sku` and `users.email`.
- Add indexes on `products.category_id`, `products.supplier_id`, `transactions.product_id`, and `transactions.created_at` — these are the columns every list/filter/report query will touch.
- Store `users.password` as a bcrypt hash, never plaintext.

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(30),
  email VARCHAR(150),
  address VARCHAR(255)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  supplier_id INT NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 0,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_category (category_id),
  INDEX idx_supplier (supplier_id)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  transaction_type ENUM('in','out') NOT NULL,
  quantity INT NOT NULL,
  user_id INT NOT NULL,
  notes TEXT,
  reason VARCHAR(150),
  destination VARCHAR(150),
  supplier_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
);
```

---

## 3. Folder structure

### Backend (Node.js + Express, MVC)

```
inventory-backend/
├── src/
│   ├── config/
│   │   ├── database.js         # mysql2 connection pool
│   │   └── env.js              # centralized env var access
│   ├── models/
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Supplier.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── supplierController.js
│   │   ├── transactionController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── userRoutes.js
│   │   └── index.js            # mounts all routers under /api
│   ├── middleware/
│   │   ├── authenticate.js     # verifies JWT, sets req.user
│   │   ├── authorize.js        # role check (admin-only routes)
│   │   ├── validate.js         # express-validator result handler
│   │   └── errorHandler.js     # centralized error → JSON response
│   ├── services/
│   │   ├── stockService.js     # quantity math, status derivation
│   │   └── reportService.js    # CSV / PDF / Excel generation
│   ├── utils/
│   │   ├── logger.js
│   │   └── pagination.js
│   └── app.js                  # express app: middleware + routes
├── migrations/                 # SQL schema migrations
├── seeds/                      # sample data for local dev
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── server.js                   # entry point, starts app.js
```

### Frontend (React + Tailwind CSS)

```
inventory-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axiosClient.js      # base instance + auth interceptor
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── suppliers.js
│   │   ├── transactions.js
│   │   ├── reports.js
│   │   └── auth.js
│   ├── components/
│   │   ├── common/             # Button, Modal, Toast, Pagination, Badge
│   │   ├── layout/              # Sidebar, Topbar, AppShell
│   │   ├── products/             # ProductTable, ProductForm, ProductDetail
│   │   ├── categories/
│   │   ├── suppliers/
│   │   ├── transactions/
│   │   └── charts/                # StockStatusChart, MovementChart
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── SuppliersPage.jsx
│   │   ├── StockInPage.jsx
│   │   ├── StockOutPage.jsx
│   │   ├── TransactionsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── UsersPage.jsx
│   │   └── SettingsPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── usePagination.js
│   │   └── useDebounce.js
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx   # redirects unauthenticated users
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js           # dark background #0F0F0F, gold #D4AF37
├── package.json
└── .env.example
```

---

## 4. API endpoint documentation

Base URL: `/api`. All responses are JSON. Protected routes require `Authorization: Bearer <token>`. Fields marked **admin only** reject staff-role tokens with `403 Forbidden`.

### Authentication

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user: { id, name, email, role } }` |
| POST | `/auth/logout` | — | `204 No Content` (client discards token) |
| GET | `/auth/me` | — | Current user profile from token |

### Products

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/products?search=&category=&status=&page=&limit=` | Paginated, filtered list |
| GET | `/products/:id` | Single product with joined category/supplier names |
| POST | `/products` | Create; validates SKU uniqueness |
| PUT | `/products/:id` | Update; recalculates `updated_at` |
| DELETE | `/products/:id` | **Admin only** |

### Categories

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/categories` | Includes product count per category |
| POST | `/categories` | Create |
| PUT | `/categories/:id` | Update |
| DELETE | `/categories/:id` | **Admin only**; blocked (`409 Conflict`) if products reference it |

### Suppliers

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/suppliers` | Includes product count per supplier |
| POST | `/suppliers` | Create |
| PUT | `/suppliers/:id` | Update |
| DELETE | `/suppliers/:id` | **Admin only**; blocked if products reference it |

### Stock movement & transactions

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/transactions?type=&search=&page=&from=&to=` | Full movement history |
| POST | `/transactions/stock-in` | `{ productId, quantity, supplierId, notes }` — increments quantity in a DB transaction |
| POST | `/transactions/stock-out` | `{ productId, quantity, reason, destination, notes }` — decrements quantity; rejects if it would go negative |
| GET | `/transactions/:id` | Single record detail |

Stock-in and stock-out are each wrapped in a SQL transaction (`BEGIN`/`COMMIT`) so the quantity update on `products` and the insert into `transactions` succeed or fail together — this is the one place in the API where partial writes would corrupt the inventory count.

### Reports

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/reports/inventory` | Full current stock listing |
| GET | `/reports/low-stock` | Products at or below `minimum_stock` |
| GET | `/reports/out-of-stock` | Products at zero quantity |
| GET | `/reports/stock-in` | All stock-in transactions |
| GET | `/reports/stock-out` | All stock-out transactions |
| GET | `/reports/value` | Stock value at cost and at selling price |
| GET | `/reports/:type/export?format=csv\|pdf\|xlsx` | Streams a file download |

CSV export is trivial (stream rows as text). PDF export uses `pdfkit`; Excel export uses `exceljs` — both stream directly to the response rather than buffering the whole file in memory, which matters once inventories run into the thousands of rows.

### Users

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/users` | **Admin only** |
| POST | `/users` | **Admin only**; hashes password with bcrypt before insert |
| PUT | `/users/:id` | **Admin only** |
| DELETE | `/users/:id` | **Admin only**; cannot delete own account |

All list endpoints share a consistent envelope:

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "perPage": 20, "total": 143, "totalPages": 8 }
}
```

And a consistent error shape:

```json
{ "error": { "message": "SKU already exists", "field": "sku" } }
```

---

## 5. Implementation plan

### Phase 1 — Foundation (Week 1)
Project scaffolding, MySQL schema + migrations, Express app skeleton, JWT auth (`/auth/login`, `authenticate` middleware, `authorize` middleware for admin routes), React app skeleton with routing and a protected-route wrapper, login page wired to the real auth endpoint.

### Phase 2 — Core CRUD (Week 2)
Products, categories, and suppliers: full CRUD on both ends, search/filter/pagination implemented at the SQL level, form validation (`express-validator` on the backend, matching client-side checks on the frontend), toast notifications and confirmation dialogs.

### Phase 3 — Stock movement & dashboard (Week 3)
Stock-in and stock-out flows with transactional quantity updates, transaction history with filtering, dashboard aggregation queries (totals, low-stock/out-of-stock counts, stock value, monthly movement), Chart.js integration.

### Phase 4 — Reports & polish (Week 4)
Report endpoints and CSV/PDF/Excel export, low-stock notification badges throughout the UI, responsive pass across breakpoints, loading skeletons, empty states, accessibility pass (focus states, keyboard navigation, contrast check against the dark background).

### Phase 5 — Hardening & deployment (Week 5)
Rate limiting (`express-rate-limit`) and `helmet` on the API, CORS locked to the frontend origin, structured logging, integration tests for the transaction endpoints (the highest-risk code path), seed script for demo data, deployment (e.g. API + MySQL on a managed host, static frontend build on a CDN).

### Coding standards

- ESLint + Prettier on both projects; enforce in a pre-commit hook.
- REST conventions: plural resource nouns, standard status codes (`200/201/204/400/401/403/404/409/500`), no verbs in URLs.
- Every mutating query wrapped in a transaction where more than one table is touched.
- All SQL parameterized — no string-concatenated queries, ever.
- Controllers stay thin: request parsing and response shaping only; business logic (stock math, status derivation) lives in `services/`.
- Shared React components (`Button`, `Modal`, `Table`, `Toast`) built once and reused across every page rather than re-implemented per page, matching the prototype's design system.

### Security checklist

- Passwords hashed with bcrypt (cost factor 10+), never logged or returned in API responses.
- JWT short-lived (e.g. 2 hours) with refresh handled by re-login rather than a refresh-token flow at this scale.
- Role checks enforced server-side on every mutating route — the frontend hiding a delete button is a UX nicety, not a security boundary.
- Input validated and sanitized on the server regardless of client-side checks.
- File uploads (product images), if added, restricted by type/size and stored outside the web root or in object storage.

---

## 6. Scalable foundation for future enhancements

The schema and API are deliberately structured so these can be added without a rewrite:

- **Barcode / QR scanning** — add a `barcode` column to `products` (already unique-indexable like `sku`); the frontend adds a scan-to-search input that calls the existing `GET /products?search=` endpoint.
- **Purchase orders** — new `purchase_orders` and `purchase_order_items` tables referencing `suppliers`; a fulfilled PO generates `stock-in` transactions through the existing service rather than a parallel code path.
- **Inventory forecasting** — a scheduled job reads `transactions` history to compute average consumption per product and suggest reorder points; surfaces as an additional dashboard card, no schema change required.
- **Email notifications** — a cron job queries the existing low-stock report endpoint and sends digest emails via a transactional email provider; no new tables needed.
- **Multi-warehouse support** — the one change with real schema impact: introduce a `warehouses` table and a `product_stock` junction table (`product_id`, `warehouse_id`, `quantity`), moving `quantity` off `products` itself; `transactions` gains a `warehouse_id`. Planning for this now is why `stockService.js` is kept separate from the controller — the quantity-update logic has one call site to change later.

---

*Companion files: `inventory-management-system.html` (interactive prototype), architecture diagram and ERD (shown inline in chat).*
