# Database — Ledger Inventory Management System

The prototype you clicked through runs on in-memory mock data — nothing persists on refresh. This folder gives you a **real database**, in two forms, both loaded with the same seed data the prototype uses (5 categories, 4 suppliers, 12 products, 18 transactions, 4 users) so numbers match what you already saw on screen.

## Files

| File | What it is |
|---|---|
| `inventory.db` | A ready-to-use **SQLite** database. Already built — just open it, no setup. |
| `schema.sql` | **MySQL** schema (tables, foreign keys, indexes) — matches the stack in `PROJECT_DOCUMENTATION.md`. |
| `seed.sql` | MySQL `INSERT` statements with the same sample data as `inventory.db`. |

## Option A — SQLite (fastest way to just look at the data)

`inventory.db` needs nothing installed on most systems. Options:

- **DB Browser for SQLite** (free, GUI): open the app → File → Open Database → pick `inventory.db`.
- **Command line**: `sqlite3 inventory.db` then `.tables`, or `SELECT * FROM products;`
- **VS Code**: the "SQLite Viewer" extension opens `.db` files directly.

It includes a `product_status` view, so `SELECT * FROM product_status WHERE status != 'ok';` gives you the low-stock / out-of-stock list without recalculating anything client-side — the same logic the dashboard uses.

## Option B — MySQL (for running the real backend)

This is the version to use once you build the Express API from `PROJECT_DOCUMENTATION.md`.

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

That creates a `ledger_inventory` database with all five tables, foreign keys, indexes, and the same `product_status` view, then loads the sample data.

## One thing to fix before this touches production

The `users.password` values in `seed.sql` and `inventory.db` are **placeholder strings**, not real password hashes — I generated the seed data without a live bcrypt library available in this environment. Before this is usable for actual login, regenerate them, e.g. in Node:

```js
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
// UPDATE users SET password = '<hash>' WHERE email = 'admin@ledger.io';
```

Everything else in the seed data (products, stock levels, transaction history) is real and consistent with what you saw in the prototype.
