import { Sale } from '../models/Sale.js';
import * as profitService from '../services/profitService.js';
import { toCSV, toXLSX, toPDF } from '../services/reportService.js';
import { sendMail } from '../utils/mailer.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Converts a raw DB row (snake_case, joined columns) into the camelCase
// shape the React frontend expects — same job toResponse() does in
// transactionController.js and productController.js.
function toResponse(row) {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    productId: row.product_id,
    productName: row.product_name,
    productSku: row.product_sku,
    quantitySold: row.quantity_sold,
    purchasePrice: Number(row.purchase_price),
    sellingPrice: Number(row.selling_price),
    totalCost: Number(row.total_cost),
    totalRevenue: Number(row.total_revenue),
    totalProfit: Number(row.total_profit),
    soldBy: row.sold_by_name,
    soldAt: row.sold_at,
  };
}

// GET /api/profit — the paginated, searchable, sortable Profit History table.
export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 10 });
  const { search, startDate, endDate, sortBy, sortDir } = req.query;
  const { rows, total } = await Sale.findAll({ search, startDate, endDate, sortBy, sortDir, limit, offset });
  res.json({ data: rows.map(toResponse), pagination: buildPaginationMeta(total, page, limit) });
});

// GET /api/profit/summary — the "Total Profit Earned" dashboard card.
// Called with no query params at all -> totals across every sale ever
// recorded (mirrors how the existing "Total Stock Value" card is an
// all-time snapshot, not a date-windowed one).
export const summary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  res.json(await Sale.summary({ startDate, endDate }));
});

// GET /api/profit/trend?range=monthly&granularity=daily — feeds the
// Profit Trend chart on the dashboard.
export const trend = asyncHandler(async (req, res) => {
  const { range = 'monthly', granularity = 'daily', startDate: qsStart, endDate: qsEnd } = req.query;
  const { startDate, endDate } = profitService.resolveRange({ range, startDate: qsStart, endDate: qsEnd });
  const rows = await Sale.findAllRaw({ startDate, endDate });
  res.json(profitService.buildTrend(rows, granularity));
});

// GET /api/profit/report?range=daily|weekly|monthly|yearly|custom —
// the Daily/Weekly/Monthly/Yearly/Custom Profit Report totals (Total
// Revenue, Total Cost, Total Profit, Number of Sales) for the Profit page.
export const report = asyncHandler(async (req, res) => {
  const { range = 'monthly', startDate: qsStart, endDate: qsEnd } = req.query;
  const { startDate, endDate } = profitService.resolveRange({ range, startDate: qsStart, endDate: qsEnd });
  const totals = await Sale.summary({ startDate, endDate });
  res.json({ range, startDate, endDate, ...totals });
});

const PROFIT_HEADERS = ['Transaction ID', 'Product', 'SKU', 'Qty Sold', 'Purchase Price', 'Selling Price', 'Profit Earned', 'Date Sold', 'Sold By'];

function toProfitTableRows(rows) {
  return rows.map((r) => [
    r.transaction_id, r.product_name, r.product_sku, r.quantity_sold,
    Number(r.purchase_price).toFixed(2), Number(r.selling_price).toFixed(2),
    Number(r.total_profit).toFixed(2), r.sold_at, r.sold_by_name,
  ]);
}

function fmtDate(d) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Shared by the download endpoint and the email endpoint — same reasoning
// as generateReportFile() in reportController.js.
async function generateProfitFile({ startDate, endDate, format }) {
  const rows = await Sale.findAllRaw({ startDate, endDate });
  const tableRows = toProfitTableRows(rows);
  const filename = `Profit_Report_${startDate}_to_${endDate}`;
  const subtitle = `${fmtDate(startDate)} – ${fmtDate(endDate)}`;

  if (format === 'csv') {
    return { content: toCSV(PROFIT_HEADERS, tableRows), contentType: 'text/csv; charset=utf-8', filename: `${filename}.csv`, subtitle, rowCount: rows.length };
  }
  if (format === 'xlsx') {
    const buffer = await toXLSX({ title: 'Profit Report', headers: PROFIT_HEADERS, rows: tableRows });
    return { content: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${filename}.xlsx`, subtitle, rowCount: rows.length };
  }
  if (format === 'pdf') {
    const buffer = await toPDF({ title: 'Profit Report', subtitle, headers: PROFIT_HEADERS, rows: tableRows });
    return { content: buffer, contentType: 'application/pdf', filename: `${filename}.pdf`, subtitle, rowCount: rows.length };
  }
  throw ApiError.badRequest(`Unsupported format: ${format}`);
}

// GET /api/profit/export?range=...&format=csv|pdf|xlsx
// PDF/XLSX reuse the exact same generators reportController.js uses —
// same reasoning documented there: both run entirely inside this Node
// process (pdfkit / exceljs), no external service or API key involved.
export const exportProfit = asyncHandler(async (req, res) => {
  const { range = 'monthly', startDate: qsStart, endDate: qsEnd, format = 'csv' } = req.query;
  const { startDate, endDate } = profitService.resolveRange({ range, startDate: qsStart, endDate: qsEnd });

  const { content, contentType, filename } = await generateProfitFile({ startDate, endDate, format: format.toLowerCase() });
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

// POST /api/profit/email — same file exportProfit would have streamed to
// the browser, emailed as an attachment instead. Sends ONLY to
// req.user.email (from the authenticated JWT) — see the matching comment
// on reportController.emailReport for why that's not just a convenience,
// it's what keeps this from being usable as an open mail relay.
export const emailProfit = asyncHandler(async (req, res) => {
  const { range = 'monthly', startDate: qsStart, endDate: qsEnd, format = 'pdf' } = req.body;
  const { startDate, endDate } = profitService.resolveRange({ range, startDate: qsStart, endDate: qsEnd });

  const { content, filename, subtitle, rowCount } = await generateProfitFile({ startDate, endDate, format: format.toLowerCase() });

  await sendMail({
    to: req.user.email,
    subject: 'Profit Report — Ledger Inventory',
    text: `Attached: Profit Report (${subtitle}, ${rowCount} sale${rowCount !== 1 ? 's' : ''}).\n\nGenerated ${new Date().toLocaleString('en-US')}.`,
    attachments: [{ filename, content }],
  });

  res.json({ message: `Emailed to ${req.user.email}` });
});
