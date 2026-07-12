// Seeds demo user accounts with REAL bcrypt hashes, then seeds the
// transaction history that references them. This has to happen in one
// script, in this order, because:
//   1. Generating a correct bcrypt hash needs the actual `bcryptjs` package
//      (installed via `npm install`) — a .sql file can't produce one.
//   2. Every transaction has a foreign key to a user_id, so that history
//      can't be inserted until these users actually exist.
//
// Usage: npm run seed:users   (after `npm install` and after the schema +
// seeds/001_sample_data.sql have been loaded)
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@ledger.io', role: 'admin', password: 'admin123' },
  { name: 'Staff User', email: 'staff@ledger.io', role: 'staff', password: 'staff123' },
  { name: 'Priya Nathan', email: 'priya@ledger.io', role: 'staff', password: 'staff123' },
  { name: 'Carlos Mendes', email: 'carlos@ledger.io', role: 'admin', password: 'admin123' },
];

// References DEMO_USERS by array index (0 = Admin User, 1 = Staff User)
// rather than a hardcoded id, since the actual id depends on whether these
// users already existed (UPDATE) or were freshly created (INSERT).
const TRANSACTIONS = [
  { productId: 1, type: 'in', quantity: 100, userIdx: 0, notes: 'Quarterly restock', supplierId: 1, date: '2026-06-01' },
  { productId: 2, type: 'out', quantity: 12, userIdx: 1, reason: 'Department use', destination: 'Marketing Team', date: '2026-06-02' },
  { productId: 4, type: 'in', quantity: 50, userIdx: 0, notes: 'New shipment', supplierId: 2, date: '2026-06-03' },
  { productId: 6, type: 'out', quantity: 15, userIdx: 1, reason: 'Client demo', destination: 'Sales Team', date: '2026-06-05' },
  { productId: 9, type: 'in', quantity: 20, userIdx: 0, notes: 'Monthly order', supplierId: 3, date: '2026-06-06' },
  { productId: 3, type: 'out', quantity: 15, userIdx: 1, reason: 'Fully depleted', destination: 'Office Pool', date: '2026-06-08' },
  { productId: 8, type: 'out', quantity: 10, userIdx: 1, reason: 'Fully depleted', destination: 'Cleaning Crew', date: '2026-06-09' },
  { productId: 5, type: 'in', quantity: 20, userIdx: 0, notes: 'Restock', supplierId: 2, date: '2026-06-11' },
  { productId: 10, type: 'out', quantity: 8, userIdx: 1, reason: 'Pantry restock', destination: 'Break Room', date: '2026-06-13' },
  { productId: 12, type: 'in', quantity: 4, userIdx: 0, notes: 'New stock', supplierId: 4, date: '2026-06-15' },
  { productId: 11, type: 'out', quantity: 20, userIdx: 1, reason: 'Maintenance job', destination: 'Facilities', date: '2026-05-10' },
  { productId: 1, type: 'out', quantity: 40, userIdx: 1, reason: 'Dept. distribution', destination: 'All Teams', date: '2026-05-14' },
  { productId: 7, type: 'in', quantity: 40, userIdx: 0, notes: 'Bulk order', supplierId: 3, date: '2026-05-18' },
  { productId: 4, type: 'out', quantity: 25, userIdx: 1, reason: 'IT rollout', destination: 'IT Dept', date: '2026-04-20' },
  { productId: 9, type: 'out', quantity: 9, userIdx: 1, reason: 'Pantry use', destination: 'Break Room', date: '2026-04-25' },
  { productId: 2, type: 'in', quantity: 30, userIdx: 0, notes: 'Restock', supplierId: 1, date: '2026-04-05' },
  { productId: 12, type: 'in', quantity: 5, userIdx: 0, notes: 'Initial stock', supplierId: 4, date: '2026-03-20' },
  { productId: 6, type: 'in', quantity: 24, userIdx: 0, notes: 'Initial stock', supplierId: 2, date: '2026-03-15' },
];

async function run() {
  const userIds = [];

  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length) {
      await pool.query('UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?', [
        passwordHash, u.name, u.role, u.email,
      ]);
      userIds.push(existing[0].id);
      console.log(`Updated ${u.email}`);
    } else {
      const [result] = await pool.query('INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)', [
        u.name, u.email, u.role, passwordHash,
      ]);
      userIds.push(result.insertId);
      console.log(`Created ${u.email}`);
    }
  }

  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM transactions');
  if (count > 0) {
    console.log(`\nTransactions table already has ${count} row(s) — skipping transaction history seed.`);
  } else {
    for (const t of TRANSACTIONS) {
      await pool.query(
        `INSERT INTO transactions (product_id, transaction_type, quantity, user_id, notes, reason, destination, supplier_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.productId, t.type, t.quantity, userIds[t.userIdx], t.notes || null, t.reason || null, t.destination || null, t.supplierId || null, t.date]
      );
    }
    console.log(`Seeded ${TRANSACTIONS.length} transaction records.`);
  }

  console.log('\nDemo logins ready:');
  console.log('  admin@ledger.io  / admin123');
  console.log('  staff@ledger.io  / staff123');
  await pool.end();
}

run().catch((err) => {
  console.error('Seeding users failed:', err.message);
  process.exit(1);
});
