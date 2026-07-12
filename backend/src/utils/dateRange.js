import { ApiError } from './ApiError.js';

const RANGE_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

// Turns a named range ('daily' | 'weekly' | 'monthly' | 'yearly' | 'custom')
// into concrete { startDate, endDate } strings (YYYY-MM-DD). Shared between
// profitService.js and reportService.js specifically so "weekly" resolves
// to the exact same window in both places — if each had its own copy of
// this date math, they could quietly drift apart over time.
export function resolveRange({ range = 'monthly', startDate, endDate }) {
  if (range === 'custom') {
    if (!startDate || !endDate) {
      throw ApiError.badRequest('startDate and endDate are required for a custom range');
    }
    return { startDate, endDate };
  }

  const days = RANGE_DAYS[range];
  if (!days) throw ApiError.badRequest(`Unknown range: ${range}`);

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1)); // inclusive of today

  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}
