import { pool } from '../config/database.js';

const BASE_SELECT = `
  SELECT t.*, p.name AS product_name, p.sku AS product_sku, s.name AS supplier_name, u.name AS user_name
  FROM transactions t
  JOIN products p ON p.id = t.product_id
  LEFT JOIN suppliers s ON s.id = t.supplier_id
  LEFT JOIN users u ON u.id = t.user_id
`;

export const Transaction = {
  async findAll({ search, type, limit, offset }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    if (type && type !== 'all') {
      where.push('t.transaction_type = ?');
      params.push(type);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${BASE_SELECT} ${whereClause} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t JOIN products p ON p.id = t.product_id ${whereClause}`,
      params
    );

    return { rows, total };
  },

  async findById(id) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE t.id = ?`, [id]);
    return rows[0] || null;
  },

  async findRecent(type, limit) {
    const where = type ? 'WHERE t.transaction_type = ?' : '';
    const params = type ? [type, limit] : [limit];
    const [rows] = await pool.query(`${BASE_SELECT} ${where} ORDER BY t.created_at DESC LIMIT ?`, params);
    return rows;
  },

  // Used for both the "Stock In/Out Report" exports and the dashboard
  // movement chart — grouping is done in JS (see reportService) rather than
  // with engine-specific date functions, so this stays portable across
  // MySQL and other SQL engines.
  // Optional startDate/endDate scopes this to a window — used by the
  // Stock In / Stock Out reports, which (unlike Current Inventory or Low
  // Stock, both point-in-time snapshots) represent a list of movements
  // over time, so "which time?" is a real, meaningful question for them.
  async findAllRaw({ startDate, endDate } = {}) {
    const where = [];
    const params = [];
    if (startDate) {
      where.push('t.created_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('t.created_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(`${BASE_SELECT} ${whereClause} ORDER BY t.created_at DESC`, params);
    return rows;
  },

  // Inserts a transaction row using an already-open connection, so it can be
  // combined with the product quantity update in a single DB transaction.
  async createWithConnection(conn, data) {
    const [result] = await conn.query(
      `INSERT INTO transactions
        (product_id, transaction_type, quantity, user_id, notes, reason, destination, supplier_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.productId, data.type, data.quantity, data.userId,
        data.notes || null, data.reason || null, data.destination || null, data.supplierId || null,
        data.date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      ]
    );
    return result.insertId;
  },
};
