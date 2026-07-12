import { pool } from '../config/database.js';

export const User = {
  async findAll() {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Includes the password hash — only for internal use during login.
  async findByEmailWithPassword(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT id, name, email, role, email_verified FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async create({ name, email, role, passwordHash }) {
    const [result] = await pool.query('INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)', [
      name,
      email,
      role || 'staff',
      passwordHash,
    ]);
    return this.findById(result.insertId);
  },

  // Used ONLY by the public Sign Up flow — note there is no `role`
  // parameter here at all, unlike `create()` above (which the
  // admin-only Users page uses). That's deliberate: a self-registered
  // account must never be able to choose its own role. It's hardcoded to
  // 'staff' and `email_verified` starts at 0, flipped to 1 only once the
  // OTP is confirmed (see authService.confirmSignup).
  async createUnverified({ name, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, role, password, email_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, 'staff', passwordHash, 0]
    );
    return result.insertId;
  },

  async markEmailVerified(email) {
    await pool.query('UPDATE users SET email_verified = 1 WHERE email = ?', [email]);
  },

  async updatePassword(email, passwordHash) {
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [passwordHash, email]);
  },

  // Signup requests for an email stuck in the unverified state (they
  // registered but never entered the OTP) need to be removable so they can
  // try again with a clean slate, rather than being permanently blocked by
  // their own abandoned first attempt.
  async removeUnverifiedByEmail(email) {
    await pool.query('DELETE FROM users WHERE email = ? AND email_verified = 0', [email]);
  },

  async remove(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },
};
