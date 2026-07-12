-- Ledger Inventory Management System — MySQL schema
-- Matches the ERD in PROJECT_DOCUMENTATION.md

CREATE DATABASE IF NOT EXISTS ledger_inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ledger_inventory;

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
  address VARCHAR(255),
  notes TEXT
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
  -- Soft-delete flag. See migrations/004_soft_delete_products.sql — a
  -- product is never hard-deleted once it has real transaction/sale
  -- history referencing it, both to satisfy the FOREIGN KEY constraints
  -- below and to keep that history accurate after the product is removed
  -- from the active catalog.
  is_active TINYINT(1) NOT NULL DEFAULT 1,
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
  -- Defaults to 1 (verified) so existing/admin-created accounts are
  -- unaffected; only accounts created through the public Sign Up form
  -- start at 0 until the OTP is confirmed (see migrations/003).
  email_verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One-time codes for Sign Up email verification and Forgot Password.
-- See migrations/003_add_auth_verification.sql for the full reasoning.
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  purpose ENUM('signup', 'password_reset') NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_purpose (email, purpose)
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
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
);

-- Derived stock status is computed at query time (kept out of the table
-- so it can never drift out of sync with quantity / minimum_stock):
--   status = 'out'  WHEN quantity = 0
--   status = 'low'  WHEN quantity <= minimum_stock
--   status = 'ok'   otherwise
CREATE VIEW product_status AS
SELECT *,
  CASE
    WHEN quantity = 0 THEN 'out'
    WHEN quantity <= minimum_stock THEN 'low'
    ELSE 'ok'
  END AS status
FROM products;

-- Stock Profit Value feature (see backend/migrations/002_add_sales_table.sql
-- for the full explanation of why this is its own table).
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_sold INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
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
