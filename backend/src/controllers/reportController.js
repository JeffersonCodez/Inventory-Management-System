import { buildReport, toCSV, toXLSX, toPDF, REPORT_TYPES } from '../services/reportService.js';
import { sendMail } from '../utils/mailer.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CONTENT_TYPES = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

// Turns a resolved { startDate, endDate } into the human-readable line
// shown under a report's title (and used as its PDF subtitle) — e.g.
// "Jun 9 – Jul 9, 2026". Snapshot report types don't have this at all,
// which is deliberate: "Current Inventory" is inherently a right-now
// snapshot, not a date range, so no subtitle is more honest than a
// misleading one.
function dateRangeSubtitle(report) {
  if (!report.isDateScoped) return null;
  const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(report.startDate)} – ${fmt(report.endDate)}`;
}

// Shared by both the download endpoint and the email endpoint — same
// report, same three possible file formats, the only difference is
// whether the resulting bytes go out over HTTP as a download or as an
// email attachment. Keeping this in one place means a future 4th format
// (or a change to how any of the three are built) only has to happen once.
async function generateReportFile(report, format) {
  const filename = report.title.replace(/\s+/g, '_') + (report.isDateScoped ? `_${report.startDate}_to_${report.endDate}` : '');

  if (format === 'csv') {
    return { content: toCSV(report.headers, report.rows), contentType: CONTENT_TYPES.csv, filename: `${filename}.csv` };
  }
  if (format === 'xlsx') {
    return { content: await toXLSX(report), contentType: CONTENT_TYPES.xlsx, filename: `${filename}.xlsx` };
  }
  if (format === 'pdf') {
    const buffer = await toPDF({
      title: report.title,
      subtitle: dateRangeSubtitle(report) || `${report.rows.length} record${report.rows.length !== 1 ? 's' : ''}`,
      headers: report.headers,
      rows: report.rows,
    });
    return { content: buffer, contentType: CONTENT_TYPES.pdf, filename: `${filename}.pdf` };
  }
  throw ApiError.badRequest(`Unsupported format: ${format}`);
}

export const get = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { range, startDate, endDate } = req.query;
  const report = await buildReport(type, { range, startDate, endDate });
  if (!report) throw ApiError.notFound(`Unknown report type. Expected one of: ${REPORT_TYPES.join(', ')}`);
  res.json({ type, ...report, dateRangeLabel: dateRangeSubtitle(report) });
});

export const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { range, startDate, endDate } = req.query;
  const format = (req.query.format || 'csv').toLowerCase();

  const report = await buildReport(type, { range, startDate, endDate });
  if (!report) throw ApiError.notFound(`Unknown report type. Expected one of: ${REPORT_TYPES.join(', ')}`);

  const { content, contentType, filename } = await generateReportFile(report, format);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

// POST /api/reports/:type/email — generates the exact same file
// exportReport would have streamed to the browser, and emails it as an
// attachment instead. Deliberately sends ONLY to req.user.email — the
// email address on the authenticated JWT, never a recipient supplied in
// the request body. Accepting an arbitrary "to" address would turn this
// into an open relay anyone with a login could use to send mail (with
// your business's name on it) to any address they typed in; sending only
// to yourself has no such exposure.
export const emailReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { range, startDate, endDate } = req.body;
  const format = (req.body.format || 'pdf').toLowerCase();

  const report = await buildReport(type, { range, startDate, endDate });
  if (!report) throw ApiError.notFound(`Unknown report type. Expected one of: ${REPORT_TYPES.join(', ')}`);

  const { content, filename } = await generateReportFile(report, format);
  const subtitle = dateRangeSubtitle(report) || `${report.rows.length} record${report.rows.length !== 1 ? 's' : ''} · as of today`;

  await sendMail({
    to: req.user.email,
    subject: `${report.title} — Ledger Inventory`,
    text: `Attached: ${report.title} (${subtitle}).\n\nGenerated ${new Date().toLocaleString('en-US')}.`,
    attachments: [{ filename, content }],
  });

  res.json({ message: `Emailed to ${req.user.email}` });
});
