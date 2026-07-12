import { pool } from '../config/database.js';

export const Category = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, description }) {
    const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [
      name,
      description || null,
    ]);
    return this.findById(result.insertId);
  },

  async update(id, { name, description }) {
    await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  },

  async countProducts(id) {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE category_id = ?', [id]);
    return count;
  },
};
