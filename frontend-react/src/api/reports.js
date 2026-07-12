import { api, downloadFile } from './client.js';

// `range`/`startDate`/`endDate` only matter for the two date-scoped report
// types (stock-in, stock-out) — harmless to pass them for a snapshot type
// like Current Inventory, the backend just ignores them there.
export async function getReport(type, { range, startDate, endDate } = {}) {
  return api.get(`/reports/${type}`, { range, startDate, endDate });
}

// Streams a real file from the server — CSV, PDF, and XLSX are all
// generated on the backend itself (no external service involved).
export async function exportReport(type, format = 'csv', { range, startDate, endDate } = {}) {
  await downloadFile(`/reports/${type}/export`, { format, range, startDate, endDate });
}

// Emails the same file exportReport would have downloaded, instead
// sending it as an attachment to your own account email — the backend
// only ever sends to the logged-in user, this can't be pointed at anyone
// else's inbox.
export async function emailReport(type, format = 'pdf', { range, startDate, endDate } = {}) {
  return api.post(`/reports/${type}/email`, { format, range, startDate, endDate });
}
