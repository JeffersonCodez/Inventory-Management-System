import { pool } from '../config/database.js';

export const OtpCode = {
  // Requesting a new code for the same (email, purpose) invalidates any
  // code already outstanding — deleting old rows first means there's only
  // ever ONE valid code per email/purpose at a time. Without this, an
  // older code from 8 minutes ago would still verify successfully
  // alongside a brand new one, which is confusing at best (which code is
  // "the" code?) and a needless extra guessable value at worst.
  async create({ email, purpose, codeHash, expiresAt }) {
    await pool.query('DELETE FROM otp_codes WHERE email = ? AND purpose = ?', [email, purpose]);
    const [result] = await pool.query(
      'INSERT INTO otp_codes (email, purpose, code_hash, expires_at) VALUES (?, ?, ?, ?)',
      [email, purpose, codeHash, expiresAt]
    );
    return result.insertId;
  },

  async findLatest({ email, purpose }) {
    const [rows] = await pool.query(
      'SELECT * FROM otp_codes WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
      [email, purpose]
    );
    return rows[0] || null;
  },

  async incrementAttempts(id) {
    await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [id]);
  },

  // Called the instant a code is used successfully — a code that verified
  // once should never verify again.
  async consume(id) {
    await pool.query('DELETE FROM otp_codes WHERE id = ?', [id]);
  },
};
