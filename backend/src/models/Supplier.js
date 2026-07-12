import { pool } from '../config/database.js';

export const Supplier = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT s.*, COUNT(p.id) AS product_count
      FROM suppliers s
      LEFT JOIN products p ON p.supplier_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.contactPerson || null, data.phone || null, data.email || null, data.address || null, data.notes || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await pool.query(
      `UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?`,
      [data.name, data.contactPerson || null, data.phone || null, data.email || null, data.address || null, data.notes || null, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
  },

  async countProducts(id) {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE supplier_id = ?', [id]);
    return count;
  },
};
