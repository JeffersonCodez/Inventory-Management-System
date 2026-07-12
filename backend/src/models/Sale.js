import { pool } from '../config/database.js';
import { calculateProfit } from '../utils/profitMath.js';

// Joins in the product name/SKU and the salesperson's name up front, so
// every query below returns display-ready rows instead of forcing the
// controller to do N follow-up lookups. Same approach as Transaction.js's
// BASE_SELECT.
const BASE_SELECT = `
  SELECT s.*, p.name AS product_name, p.sku AS product_sku, u.name AS sold_by_name
  FROM sales s
  JOIN products p ON p.id = s.product_id
  JOIN users u ON u.id = s.sold_by
`;

// Whitelists which columns the Profit History table is allowed to sort by.
// This is passed in from query-string input (?sortBy=profit), so we map it
// through a fixed dictionary rather than interpolating the raw string
// directly into SQL — that would be a SQL-injection hole.
const SORTABLE_COLUMNS = {
  date: 's.sold_at',
  product: 'p.name',
  quantity: 's.quantity_sold',
  profit: 's.total_profit',
};

export const Sale = {
  // Powers the paginated / searchable / sortable / date-filtered Profit
  // History table.
  async findAll({ search, startDate, endDate, sortBy, sortDir, limit, offset }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (startDate) {
      where.push('s.sold_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('s.sold_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderColumn = SORTABLE_COLUMNS[sortBy] || SORTABLE_COLUMNS.date;
    const orderDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    const [rows] = await pool.query(
      `${BASE_SELECT} ${whereClause} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM sales s JOIN products p ON p.id = s.product_id ${whereClause}`,
      params
    );

    return { rows, total };
  },

  // Unpaginated — used by the trend chart (needs every row in a date range
  // to bucket into days/weeks/months) and by CSV export (needs every row,
  // not one page of them).
  async findAllRaw({ startDate, endDate } = {}) {
    const where = [];
    const params = [];
    if (startDate) {
      where.push('s.sold_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('s.sold_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(`${BASE_SELECT} ${whereClause} ORDER BY s.sold_at DESC`, params);
    return rows;
  },

  // Aggregate totals for the Dashboard card and the Reports summary line.
  // Called with no dates -> all-time. Called with startDate/endDate -> just
  // that window.
  async summary({ startDate, endDate } = {}) {
    const where = [];
    const params = [];
    if (startDate) {
      where.push('sold_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where.push('sold_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[row]] = await pool.query(
      `SELECT
         COALESCE(SUM(total_revenue), 0) AS totalRevenue,
         COALESCE(SUM(total_cost), 0)    AS totalCost,
         COALESCE(SUM(total_profit), 0)  AS totalProfit,
         COUNT(*)                        AS numberOfSales
       FROM sales ${whereClause}`,
      params
    );

    return {
      totalRevenue: Number(row.totalRevenue),
      totalCost: Number(row.totalCost),
      totalProfit: Number(row.totalProfit),
      numberOfSales: row.numberOfSales,
    };
  },

  // Inserts a sale row using an ALREADY-OPEN connection, so it lands in the
  // same DB transaction as the stock-out row and the quantity decrement in
  // stockService.js. If any of those three writes fails, all three roll
  // back together — you can never end up with a sale recorded but the
  // stock quantity untouched, or vice versa.
  async createWithConnection(conn, { transactionId, productId, quantitySold, purchasePrice, sellingPrice, soldBy, soldAt }) {
    const { totalCost, totalRevenue, totalProfit } = calculateProfit({
      purchasePrice,
      sellingPrice,
      quantity: quantitySold,
    });

    const [result] = await conn.query(
      `INSERT INTO sales
        (transaction_id, product_id, quantity_sold, purchase_price, selling_price,
         total_cost, total_revenue, total_profit, sold_by, sold_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId, productId, quantitySold, purchasePrice, sellingPrice,
        totalCost, totalRevenue, totalProfit, soldBy,
        soldAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      ]
    );

    return { id: result.insertId, totalCost, totalRevenue, totalProfit };
  },
};
