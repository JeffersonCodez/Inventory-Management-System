-- Seed data matching the prototype's mock data (12 products, 18 transactions)
USE ledger_inventory;

INSERT INTO categories (id, name, description) VALUES
  (1, 'Office Supplies', 'Paper, pens, binders and general desk essentials.'),
  (2, 'Electronics', 'Devices, cables, peripherals and accessories.'),
  (3, 'Cleaning Supplies', 'Janitorial and sanitation products.'),
  (4, 'Food & Pantry', 'Break room and pantry consumables.'),
  (5, 'Hardware', 'Tools, fasteners and maintenance parts.');

INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes) VALUES
  (1, 'Northwind Traders', 'Elena Cruz', '+1 555 0110', 'elena@northwind.co', '22 Harbor Rd, Cebu City', 'Preferred vendor for office supplies. Net 30 terms.'),
  (2, 'Pacific Electronics Co.', 'Marco Reyes', '+1 555 0142', 'marco@pacelec.com', '8 Industrial Ave, Mandaue', 'Bulk discounts above 50 units.'),
  (3, 'BrightClean Supply', 'Ana Bautista', '+1 555 0198', 'ana@brightclean.ph', '14 Market St, Cebu City', 'Delivers weekly on Tuesdays.'),
  (4, 'IronWorks Hardware', 'Diego Santos', '+1 555 0176', 'diego@ironworks.co', '5 Foundry Ln, Talisay', '');

INSERT INTO products (id, sku, name, category_id, supplier_id, unit, quantity, minimum_stock, purchase_price, selling_price, created_at, updated_at) VALUES
  (1, 'OFC-1001', 'A4 Copy Paper (Ream)', 1, 1, 'ream', 140, 50, 3.2, 5.5, '2026-01-14', '2026-06-20'),
  (2, 'OFC-1002', 'Ballpoint Pens (Box of 12)', 1, 1, 'box', 18, 20, 4.1, 7.0, '2026-01-15', '2026-06-18'),
  (3, 'OFC-1003', 'Ring Binders 2"', 1, 1, 'pc', 0, 15, 2.8, 5.0, '2026-02-02', '2026-06-10'),
  (4, 'ELC-2001', 'USB-C Cable 1m', 2, 2, 'pc', 76, 30, 1.9, 6.5, '2026-01-20', '2026-06-22'),
  (5, 'ELC-2002', 'Wireless Mouse', 2, 2, 'pc', 24, 25, 6.4, 14.0, '2026-02-10', '2026-06-19'),
  (6, 'ELC-2003', 'HDMI Cable 2m', 2, 2, 'pc', 9, 20, 2.6, 9.0, '2026-02-11', '2026-06-15'),
  (7, 'CLN-3001', 'Multi-Surface Cleaner 1L', 3, 3, 'bottle', 52, 20, 2.1, 4.2, '2026-01-25', '2026-06-21'),
  (8, 'CLN-3002', 'Paper Towels (6-pack)', 3, 3, 'pack', 0, 10, 5.0, 8.5, '2026-02-18', '2026-06-05'),
  (9, 'FD-4001', 'Ground Coffee 1kg', 4, 3, 'bag', 31, 10, 7.5, 12.0, '2026-03-01', '2026-06-24'),
  (10, 'FD-4002', 'Bottled Water (24-pack)', 4, 1, 'pack', 12, 15, 4.8, 8.0, '2026-03-05', '2026-06-17'),
  (11, 'HW-5001', 'Assorted Screws (500pc)', 5, 4, 'box', 64, 15, 6.0, 11.0, '2026-03-12', '2026-06-11'),
  (12, 'HW-5002', 'Cordless Drill', 5, 4, 'pc', 6, 5, 38.0, 69.0, '2026-03-14', '2026-06-09');

-- NOTE: these password hashes are placeholders, not real bcrypt hashes.
-- Generate real ones with bcrypt (cost 10+) before using this seed anywhere real.
INSERT INTO users (id, name, email, role, password) VALUES
  (1, 'Admin User', 'admin@ledger.io', 'admin', '$2b$10$CHANGE.ME.PLACEHOLDER.HASH.NOT.REAL.aaaaaaaaaaaaaaaaaaaa'),
  (2, 'Staff User', 'staff@ledger.io', 'staff', '$2b$10$CHANGE.ME.PLACEHOLDER.HASH.NOT.REAL.bbbbbbbbbbbbbbbbbbbb'),
  (3, 'Priya Nathan', 'priya@ledger.io', 'staff', '$2b$10$CHANGE.ME.PLACEHOLDER.HASH.NOT.REAL.cccccccccccccccccccc'),
  (4, 'Carlos Mendes', 'carlos@ledger.io', 'admin', '$2b$10$CHANGE.ME.PLACEHOLDER.HASH.NOT.REAL.dddddddddddddddddddd');

INSERT INTO transactions (id, product_id, transaction_type, quantity, user_id, notes, reason, destination, supplier_id, created_at) VALUES
  (1, 1, 'in', 100, 1, 'Quarterly restock', NULL, NULL, 1, '2026-06-01'),
  (2, 2, 'out', 12, 2, NULL, 'Department use', 'Marketing Team', NULL, '2026-06-02'),
  (3, 4, 'in', 50, 1, 'New shipment', NULL, NULL, 2, '2026-06-03'),
  (4, 6, 'out', 15, 2, NULL, 'Client demo', 'Sales Team', NULL, '2026-06-05'),
  (5, 9, 'in', 20, 1, 'Monthly order', NULL, NULL, 3, '2026-06-06'),
  (6, 3, 'out', 15, 2, NULL, 'Fully depleted', 'Office Pool', NULL, '2026-06-08'),
  (7, 8, 'out', 10, 2, NULL, 'Fully depleted', 'Cleaning Crew', NULL, '2026-06-09'),
  (8, 5, 'in', 20, 1, 'Restock', NULL, NULL, 2, '2026-06-11'),
  (9, 10, 'out', 8, 2, NULL, 'Pantry restock', 'Break Room', NULL, '2026-06-13'),
  (10, 12, 'in', 4, 1, 'New stock', NULL, NULL, 4, '2026-06-15'),
  (11, 11, 'out', 20, 2, NULL, 'Maintenance job', 'Facilities', NULL, '2026-05-10'),
  (12, 1, 'out', 40, 2, NULL, 'Dept. distribution', 'All Teams', NULL, '2026-05-14'),
  (13, 7, 'in', 40, 1, 'Bulk order', NULL, NULL, 3, '2026-05-18'),
  (14, 4, 'out', 25, 2, NULL, 'IT rollout', 'IT Dept', NULL, '2026-04-20'),
  (15, 9, 'out', 9, 2, NULL, 'Pantry use', 'Break Room', NULL, '2026-04-25'),
  (16, 2, 'in', 30, 1, 'Restock', NULL, NULL, 1, '2026-04-05'),
  (17, 12, 'in', 5, 1, 'Initial stock', NULL, NULL, 4, '2026-03-20'),
  (18, 6, 'in', 24, 1, 'Initial stock', NULL, NULL, 2, '2026-03-15');
