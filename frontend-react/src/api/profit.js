import { api, downloadFile } from './client.js';

// All-time totals for the "Total Profit Earned" dashboard card — no date
// params, matching how "Total Stock Value" is also an all-time snapshot.
export async function getProfitSummary() {
  return api.get('/profit/summary');
}

// Chart-ready { key, label, profit, revenue, cost }[] for the dashboard's
// Profit Trend chart.
export async function getProfitTrend({ range = 'monthly', granularity = 'daily' } = {}) {
  return api.get('/profit/trend', { range, granularity });
}

// Aggregated totals (Total Revenue / Total Cost / Total Profit / Number of
// Sales) for whatever range is selected on the Profit page.
export async function getProfitReport({ range = 'monthly', startDate, endDate } = {}) {
  return api.get('/profit/report', { range, startDate, endDate });
}

// Paginated Profit History rows for the Profit page's table.
export async function getProfitHistory({
  search = '', startDate, endDate, sortBy = 'date', sortDir = 'desc', page = 1, perPage = 10,
} = {}) {
  return api.get('/profit', { search, startDate, endDate, sortBy, sortDir, page, limit: perPage });
}

// Streams a CSV, PDF, or XLSX file from the server — all three are
// generated locally on the backend, no external service involved.
export async function exportProfitReport({ range = 'monthly', startDate, endDate, format = 'csv' } = {}) {
  await downloadFile('/profit/export', { range, startDate, endDate, format });
}

// Emails the same report as an attachment to your own account email —
// the backend only ever sends to the logged-in user.
export async function emailProfitReport({ range = 'monthly', startDate, endDate, format = 'pdf' } = {}) {
  return api.post('/profit/email', { range, startDate, endDate, format });
}
