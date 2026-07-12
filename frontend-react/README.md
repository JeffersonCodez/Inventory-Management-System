# Ledger — React Frontend

The real React rewrite of the prototype — actual components, routing, and state management, matching the architecture in `docs/PROJECT_DOCUMENTATION.md`. Still running on mock data (no backend exists yet), but structured so wiring in the real API is a small, contained change.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Login with the demo buttons on the login screen (Admin or Staff) — any password works, since there's no real auth backend yet.

## A note on how this was built

This project was hand-written without running `npm install` — the sandbox it was built in had no network access to the npm registry. Every file was checked with the TypeScript compiler in JS/JSX syntax-check mode to catch typos and broken JSX, and every import path was verified to resolve to a real file, but **it has not been through an actual Vite build**. Run `npm install && npm run dev` as the real test, and treat this as a thorough first draft rather than a compiled artifact.

## Structure

```
src/
├── api/            # Mock API layer — async functions with simulated latency.
│                    Swap these for real fetch/axios calls when the backend exists;
│                    nothing above this layer needs to change.
├── mockData.js      # In-memory seed data (the "database" until there's a real one)
├── context/         # AuthContext (session/role), ToastContext, PageHeaderContext
├── hooks/           # usePagination, useDebounce, usePageActions
├── routes/          # AppRouter, ProtectedRoute (auth + role gating)
├── components/
│   ├── common/       # Button, Modal, ConfirmDialog, Pagination, Badge, etc.
│   ├── layout/        # Sidebar, Topbar, AppShell
│   ├── products/       # ProductTable, ProductFormModal, ProductDetailModal
│   ├── categories/
│   ├── suppliers/
│   ├── transactions/
│   └── charts/          # StockStatusChart, MovementChart (Chart.js)
└── pages/           # One component per route — Dashboard, Products, Categories,
                       Suppliers, StockIn, StockOut, Transactions, Reports, Users, Settings
```

## Where the mock data lives, and how to replace it

Every page talks to `src/api/*.js`, never to `mockData.js` directly. Each function in that layer (`getProducts`, `createProduct`, `stockIn`, etc.) already has the shape a real API call would have: it's `async`, takes a plain object, and returns a plain object or throws an `ApiError`. When the Express API exists:

1. Replace the body of each function in `src/api/*.js` with a `fetch`/`axios` call to the matching endpoint (they're listed in `docs/PROJECT_DOCUMENTATION.md`).
2. Delete `src/mockData.js`.
3. Nothing in `components/` or `pages/` needs to change.

## What's mocked vs. real

| Behavior | Status |
|---|---|
| Login | Demo-only — accepts any password, role comes from a lookup table in `api/auth.js` |
| Product/category/supplier CRUD | Real logic (validation, duplicate SKU checks, etc.), against in-memory data |
| Stock in/out | Real quantity math and validation (can't remove more than available) |
| CSV export | Fully functional — generates and downloads a real CSV client-side |
| PDF/Excel export | Placeholder toast — the real version needs a backend (`pdfkit`/`exceljs`, per the docs) |
| Data persistence | None — refreshing the page resets to the seed data in `mockData.js` |

## Known gaps to close before this is production-ready

- No real authentication — `api/auth.js` needs to exchange credentials for a JWT once the backend exists.
- No `.env`-driven API base URL wired up yet (`.env.example` documents where it'll go).
- No automated tests. `docs/PROJECT_DOCUMENTATION.md` recommends React Testing Library for this layer.
