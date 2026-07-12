-- Adds the Stock Profit Value feature.
--
-- Why a separate `sales` table instead of just adding columns to
-- `transactions`?
--   1. Not every stock-out is a sale (damaged goods, department use, etc.
--      per the existing `reason` field) — profit only applies to a subset
--      of stock-out rows, so it doesn't belong on every transaction.
--   2. We SNAPSHOT purchase_price/selling_price at the moment of sale.
--      Product prices can change later (a supplier raises purchase price,
--      you run a promotion on selling price) — if we recalculated profit
--      from the current `products` row instead, historical profit reports
--      would silently change every time someone edits a product. Storing
--      the actual prices used at sale time keeps history accurate forever.
--   3. Keeping it a separate table (rather than nullable columns bolted
--      onto `transactions`) means the "transactions" table and its
--      Stock In/Out Report keep working completely untouched.

USE ledger_inventory;

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Links back to the transactions row that caused this sale (type='out').
  -- One-to-one: every sale has exactly one stock-out transaction behind it.
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,

  quantity_sold INT NOT NULL,

  -- Snapshotted from products.purchase_price / products.selling_price at
  -- the moment of sale (see stockService.js) — NOT a live join.
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,

  -- Pre-computed and stored (rather than derived at query time) so that
  -- summing thousands of rows for a dashboard card or a yearly report is a
  -- single SUM(), not a multiplication across every row on every request.
  total_cost DECIMAL(12,2) NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,

  sold_by INT NOT NULL,
  sold_at TIMESTAMP NOT NULL,

  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (sold_by) REFERENCES users(id),

  INDEX idx_product (product_id),
  INDEX idx_sold_at (sold_at)
);
