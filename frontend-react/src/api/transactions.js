import { api } from './client.js';

// Backend returns userName (joined from the users table); the UI uses
// `user` as the display field.
function toFrontend(t) {
  return { ...t, user: t.userName };
}

export async function getTransactions({ search = '', type = 'all', page = 1, perPage = 10 } = {}) {
  const result = await api.get('/transactions', {
    search, type: type === 'all' ? undefined : type, page, limit: perPage,
  });
  return { data: result.data.map(toFrontend), pagination: result.pagination };
}

export async function getRecentTransactions(type, limit = 8) {
  const rows = await api.get('/transactions/recent', { type: type || undefined, limit });
  return rows.map(toFrontend);
}

export async function stockIn({ productId, quantity, supplierId, date, notes }) {
  const result = await api.post('/transactions/stock-in', { productId, quantity, supplierId, date, notes });
  return { product: result.product };
}

export async function stockOut({ productId, quantity, reason, destination, date, notes }) {
  const result = await api.post('/transactions/stock-out', { productId, quantity, reason, destination, date, notes });
  return { product: result.product };
}

export async function getMonthlyMovement(months = 6) {
  return api.get('/transactions/monthly-movement', { months });
}
