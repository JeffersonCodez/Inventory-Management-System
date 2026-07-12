import { pool } from '../config/database.js';

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, s.name AS supplier_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN suppliers s ON s.id = p.supplier_id
`;

const STATUS_CONDITIONS = {
  out: 'p.quantity = 0',
  low: 'p.quantity > 0 AND p.quantity <= p.minimum_stock',
  ok: 'p.quantity > p.minimum_stock',
};

export const Product = {
  async findAll({ search, categoryId, status, limit, offset }) {
    const where = [];
    const params = [];

    // 'archived' is its own branch, not just another entry in
    // STATUS_CONDITIONS — it's not a stock-quantity state like
    // low/out/ok, it's asking for the OPPOSITE of the default "only
    // active products" filter every other view uses.
    if (status === 'archived') {
      where.push('p.is_active = 0');
    } else {
      where.push('p.is_active = 1');
      if (status && STATUS_CONDITIONS[status]) {
        where.push(STATUS_CONDITIONS[status]);
      }
    }

    if (search) {
      where.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (categoryId) {
      where.push('p.category_id = ?');
      params.push(categoryId);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${BASE_SELECT} ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );

    return { rows, total };
  },

  // Deliberately NOT filtered by is_active — this is used for single-
  // product lookups (the detail modal, the edit form, resolving a
  // product_id on an old transaction), all of which need to keep working
  // for an archived product, not just an active one.
  async findById(id) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE p.id = ?`, [id]);
    return rows[0] || null;
  },

  async findBySku(sku, excludeId = null) {
    const params = [sku];
    let sql = 'SELECT id FROM products WHERE sku = ?';
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO products
        (sku, name, category_id, supplier_id, unit, quantity, minimum_stock, purchase_price, selling_price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.sku, data.name, data.categoryId, data.supplierId, data.unit,
        data.quantity, data.minimumStock, data.purchasePrice, data.sellingPrice, data.image || null,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await pool.query(
      `UPDATE products SET
        sku = ?, name = ?, category_id = ?, supplier_id = ?, unit = ?,
        quantity = ?, minimum_stock = ?, purchase_price = ?, selling_price = ?, image = ?
       WHERE id = ?`,
      [
        data.sku, data.name, data.categoryId, data.supplierId, data.unit,
        data.quantity, data.minimumStock, data.purchasePrice, data.sellingPrice, data.image || null,
        id,
      ]
    );
    return this.findById(id);
  },

  // Soft delete — flips is_active to 0 rather than physically removing
  // the row. A real DELETE here would fail with a foreign key constraint
  // violation for any product that's ever appeared in a transaction or
  // sale (transactions.product_id / sales.product_id both reference this
  // table), which in practice is almost every product — and even where it
  // wouldn't fail, actually destroying a product with real sales history
  // would corrupt past profit reports that reference it. This keeps the
  // row (and everything that points at it) intact, just hidden from the
  // active catalog, search results, and Stock In/Out product pickers.
  async remove(id) {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  },

  async restore(id) {
    await pool.query('UPDATE products SET is_active = 1 WHERE id = ?', [id]);
  },

  async adjustQuantity(id, delta) {
    await pool.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [delta, id]);
    return this.findById(id);
  },

  // Every count here is scoped to is_active = 1 — an archived product
  // shouldn't keep contributing to "Total Products", "Stock Value", or
  // the Low/Out of Stock counts on the dashboard once it's been removed
  // from the active catalog.
  async summary() {
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products p WHERE p.is_active = 1');
    const [[{ lowStock }]] = await pool.query(
      `SELECT COUNT(*) AS lowStock FROM products p WHERE p.is_active = 1 AND ${STATUS_CONDITIONS.low}`
    );
    const [[{ outOfStock }]] = await pool.query(
      `SELECT COUNT(*) AS outOfStock FROM products p WHERE p.is_active = 1 AND ${STATUS_CONDITIONS.out}`
    );
    const [[{ stockValue }]] = await pool.query(
      'SELECT COALESCE(SUM(quantity * purchase_price), 0) AS stockValue FROM products WHERE is_active = 1'
    );
    return { totalProducts, lowStock, outOfStock, stockValue: Number(stockValue) };
  },
};
