-- Fixes "Internal server error" when deleting a product that has any
-- Stock In/Out transactions or sales recorded against it.
--
-- The root cause: `transactions.product_id` and `sales.product_id` both
-- have a FOREIGN KEY REFERENCES products(id) with no ON DELETE clause,
-- which makes MySQL default to RESTRICT — it refuses to delete a product
-- row as long as any transaction or sale still points at it. A plain
-- `DELETE FROM products` was never going to work for any product that had
-- ever actually been used, which in practice is almost every product.
--
-- The fix is NOT to cascade the delete (ON DELETE CASCADE would silently
-- destroy real transaction and profit history the moment someone removes
-- a product from the catalog — unacceptable for a system built around
-- accurate profit tracking). Instead, "delete" becomes a soft delete:
-- products gain an is_active flag, and removing a product just flips it
-- to 0 rather than deleting the row. Historical transactions/sales keep
-- working exactly as before (they can still look up the product's name
-- and SKU), and the product simply stops showing up in the active
-- catalog, search results, and Stock In/Out product pickers.

USE ledger_inventory;

ALTER TABLE products
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER image;
