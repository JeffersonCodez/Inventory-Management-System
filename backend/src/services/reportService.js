import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { pool } from '../config/database.js';
import { deriveStatus } from '../utils/stockStatus.js';
import { Transaction } from '../models/Transaction.js';
import { resolveRange } from '../utils/dateRange.js';

// Report types that represent a list of movements OVER TIME (as opposed to
// a snapshot of the current state, like Current Inventory or Low Stock) —
// these are the only ones where "which date range?" is a meaningful
// question, so they're the only ones that accept range/startDate/endDate.
const DATE_SCOPED_TYPES = new Set(['stock-in', 'stock-out']);

const REPORT_BUILDERS = {
  async inventory() {
    const [rows] = await pool.query(`
      SELECT p.sku, p.name, c.name AS category, s.name AS supplier, p.quantity, p.unit,
             p.minimum_stock, p.purchase_price
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN suppliers s ON s.id = p.supplier_id
      ORDER BY p.name ASC
    `);
    return {
      title: 'Current Inventory',
      headers: ['SKU', 'Product', 'Category', 'Supplier', 'Quantity', 'Unit', 'Status', 'Stock Value'],
      rows: rows.map((r) => [
        r.sku, r.name, r.category, r.supplier, r.quantity, r.unit,
        deriveStatus(r.quantity, r.minimum_stock), (r.quantity * r.purchase_price).toFixed(2),
      ]),
    };
  },

  async 'low-stock'() {
    const [rows] = await pool.query(`
      SELECT p.sku, p.name, c.name AS category, p.quantity, p.minimum_stock, s.name AS supplier
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN suppliers s ON s.id = p.supplier_id
      WHERE p.quantity > 0 AND p.quantity <= p.minimum_stock
      ORDER BY p.name ASC
    `);
    return {
      title: 'Low Stock Report',
      headers: ['SKU', 'Product', 'Category', 'Quantity', 'Min Stock', 'Supplier'],
      rows: rows.map((r) => [r.sku, r.name, r.category, r.quantity, r.minimum_stock, r.supplier]),
    };
  },

  async 'out-of-stock'() {
    const [rows] = await pool.query(`
      SELECT p.sku, p.name, c.name AS category, s.name AS supplier, p.updated_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN suppliers s ON s.id = p.supplier_id
      WHERE p.quantity = 0
      ORDER BY p.name ASC
    `);
    return {
      title: 'Out of Stock Report',
      headers: ['SKU', 'Product', 'Category', 'Supplier', 'Last Updated'],
      rows: rows.map((r) => [r.sku, r.name, r.category, r.supplier, r.updated_at]),
    };
  },

  async 'stock-in'({ startDate, endDate } = {}) {
    const all = await Transaction.findAllRaw({ startDate, endDate });
    const rows = all.filter((t) => t.transaction_type === 'in');
    return {
      title: 'Stock In Report',
      headers: ['Date', 'Product', 'Quantity', 'Supplier', 'User', 'Notes'],
      rows: rows.map((t) => [t.created_at, t.product_name, t.quantity, t.supplier_name || '', t.user_name || '', t.notes || '']),
    };
  },

  async 'stock-out'({ startDate, endDate } = {}) {
    const all = await Transaction.findAllRaw({ startDate, endDate });
    const rows = all.filter((t) => t.transaction_type === 'out');
    return {
      title: 'Stock Out Report',
      headers: ['Date', 'Product', 'Quantity', 'Reason', 'Destination', 'User'],
      rows: rows.map((t) => [t.created_at, t.product_name, t.quantity, t.reason || '', t.destination || '', t.user_name || '']),
    };
  },

  async value() {
    const [rows] = await pool.query('SELECT sku, name, quantity, purchase_price, selling_price FROM products ORDER BY name ASC');
    return {
      title: 'Inventory Value Report',
      headers: ['SKU', 'Product', 'Quantity', 'Purchase Price', 'Selling Price', 'Stock Value', 'Potential Revenue'],
      rows: rows.map((p) => [
        p.sku, p.name, p.quantity, p.purchase_price.toFixed(2), p.selling_price.toFixed(2),
        (p.quantity * p.purchase_price).toFixed(2), (p.quantity * p.selling_price).toFixed(2),
      ]),
    };
  },
};

export const REPORT_TYPES = Object.keys(REPORT_BUILDERS);
export const DATE_SCOPED_REPORT_TYPES = [...DATE_SCOPED_TYPES];

// `range`/`startDate`/`endDate` are only meaningful for stock-in/stock-out
// — passed for a snapshot type, they're silently ignored, rather than
// erroring, since the frontend always sends whatever the currently
// selected range is regardless of which report is showing.
export async function buildReport(type, { range, startDate, endDate } = {}) {
  const builder = REPORT_BUILDERS[type];
  if (!builder) return null;

  if (DATE_SCOPED_TYPES.has(type)) {
    const resolved = resolveRange({ range, startDate, endDate });
    const report = await builder(resolved);
    return { ...report, ...resolved, isDateScoped: true };
  }

  const report = await builder();
  return { ...report, isDateScoped: false };
}

export function toCSV(headers, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

// Generates a real .xlsx file in memory (a Buffer) — no external service,
// this runs entirely inside this Node process via the exceljs package.
export async function toXLSX({ title, headers, rows }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ledger Inventory';
  workbook.created = new Date();

  // Excel caps sheet names at 31 characters and disallows a few symbols —
  // slicing keeps a long report title from causing a write error.
  const sheet = workbook.addWorksheet(title.slice(0, 31));

  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  });

  rows.forEach((row) => sheet.addRow(row));

  // Auto-sized columns based on the longest value in each one, clamped to
  // a sane range — otherwise every column opens at Excel's generic
  // default width and someone has to manually widen each one before the
  // file is actually readable.
  sheet.columns.forEach((column, i) => {
    const headerLen = String(headers[i] ?? '').length;
    const maxCellLen = rows.reduce((max, row) => Math.max(max, String(row[i] ?? '').length), 0);
    column.width = Math.min(40, Math.max(10, headerLen, maxCellLen) + 2);
  });

  return workbook.xlsx.writeBuffer();
}

// Generates a real .pdf file in memory (a Buffer) via pdfkit — also
// entirely local, no external service. Deliberately a plain white
// background with dark text rather than matching the app's dark theme:
// this is a document meant to be printed or emailed to someone (an
// accountant, a supplier), and a dark-background PDF wastes ink/toner and
// looks unusual outside the app itself. The gold accent rule under the
// title is the one deliberate brand touch carried over.
export async function toPDF({ title, subtitle, headers, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 40, bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const bottomLimit = doc.page.height - doc.page.margins.bottom;

    // Column widths are proportional to the longest value in each column
    // (header or any cell), then normalized so they exactly fill the
    // page's printable width — a column of dollar amounts doesn't need
    // nearly as much room as a Notes column, so this avoids either wasted
    // whitespace or cramped, truncated text.
    const rawWidths = headers.map((h, i) => {
      const headerLen = String(h).length;
      const maxCellLen = rows.reduce((max, r) => Math.max(max, String(r[i] ?? '').length), 0);
      return Math.max(headerLen, maxCellLen, 4);
    });
    const totalRaw = rawWidths.reduce((a, b) => a + b, 0) || 1;
    const colWidths = rawWidths.map((w) => (w / totalRaw) * pageWidth);

    function drawHeaderRow(y) {
      doc.rect(left, y, pageWidth, 22).fill('#F0F0F0');
      doc.fillColor('#1A1A1A').font('Helvetica-Bold').fontSize(9);
      let x = left;
      headers.forEach((h, i) => {
        doc.text(String(h), x + 5, y + 6.5, { width: colWidths[i] - 8, ellipsis: true, lineBreak: false });
        x += colWidths[i];
      });
      return y + 22;
    }

    doc.fillColor('#1A1A1A').font('Helvetica-Bold').fontSize(18).text(title);
    if (subtitle) {
      doc.moveDown(0.2);
      doc.fillColor('#666666').font('Helvetica').fontSize(10).text(subtitle);
    }
    doc.moveDown(0.6);
    doc
      .moveTo(left, doc.y)
      .lineTo(left + pageWidth, doc.y)
      .strokeColor('#D4AF37')
      .lineWidth(1.5)
      .stroke();
    doc.moveDown(0.7);

    let y = drawHeaderRow(doc.y);
    doc.font('Helvetica').fontSize(8.5);
    const rowHeight = 20;

    rows.forEach((row, i) => {
      if (y + rowHeight > bottomLimit) {
        doc.addPage();
        y = drawHeaderRow(doc.page.margins.top);
        doc.font('Helvetica').fontSize(8.5);
      }
      if (i % 2 === 1) doc.rect(left, y, pageWidth, rowHeight).fill('#FAFAFA');
      doc.fillColor('#1A1A1A');
      let x = left;
      row.forEach((cell, j) => {
        doc.text(String(cell ?? ''), x + 5, y + 5.5, { width: colWidths[j] - 8, ellipsis: true, lineBreak: false });
        x += colWidths[j];
      });
      y += rowHeight;
    });

    if (rows.length === 0) {
      doc.fillColor('#888888').font('Helvetica').fontSize(10).text('No records', left, y + 12);
      y += 30;
    }

    doc.fillColor('#999999').fontSize(7.5);
    doc.text(`Generated ${new Date().toLocaleString('en-US')} · Ledger Inventory`, left, Math.min(y + 16, bottomLimit - 12));

    doc.end();
  });
}
