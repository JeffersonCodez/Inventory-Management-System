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
