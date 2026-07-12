import { useEffect, useState } from 'react';
import {
  Package, AlertTriangle, PackageX, ArrowDownToLine, ArrowUpFromLine, DollarSign,
  BarChart3, Download, FileText, Mail,
} from 'lucide-react';
import { Card, PanelTitle } from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getReport, exportReport, emailReport } from '../api/reports.js';

// `dateScoped: true` marks the two report types that represent a list of
// movements OVER TIME (mirrors DATE_SCOPED_TYPES on the backend, in
// services/reportService.js) — only these two show the range picker below.
// Current Inventory, Low Stock, Out of Stock, and Inventory Value are all
// point-in-time snapshots of "right now"; a "weekly Low Stock Report"
// isn't a meaningful thing without a whole separate history-snapshot
// system this app doesn't have, so they deliberately don't get a range
// picker at all rather than one that would silently do nothing.
const REPORT_DEFS = [
  { type: 'inventory', title: 'Current Inventory', sub: 'Full product listing', icon: Package },
  { type: 'low-stock', title: 'Low Stock Report', sub: 'Below minimum level', icon: AlertTriangle },
  { type: 'out-of-stock', title: 'Out of Stock Report', sub: 'Zero quantity items', icon: PackageX },
  { type: 'stock-in', title: 'Stock In Report', sub: 'Receiving history', icon: ArrowDownToLine, dateScoped: true },
  { type: 'stock-out', title: 'Stock Out Report', sub: 'Dispatch history', icon: ArrowUpFromLine, dateScoped: true },
  { type: 'value', title: 'Inventory Value', sub: 'Cost & revenue potential', icon: DollarSign },
];

const RANGE_FILTERS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export default function ReportsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [activeDef, setActiveDef] = useState(null);
  const [exporting, setExporting] = useState(null); // which format is currently exporting, or null
  const [emailing, setEmailing] = useState(false);

  const [range, setRange] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const customIncomplete = range === 'custom' && (!customStart || !customEnd);

  async function handleShow(def) {
    setActiveDef(def);
    setReport(null);
    if (def.dateScoped && customIncomplete) return; // wait for both custom dates
    try {
      const data = await getReport(def.type, def.dateScoped ? { range, startDate: customStart, endDate: customEnd } : {});
      setReport(data);
    } catch (err) {
      toast(err.message || 'Failed to load report', 'err');
    }
  }

  // Re-fetch automatically when the range changes, but only while a
  // date-scoped report is the one currently on screen — switching the
  // range shouldn't do anything to a snapshot report, since it's ignored
  // either way.
  useEffect(() => {
    if (!activeDef?.dateScoped || customIncomplete) return;
    getReport(activeDef.type, { range, startDate: customStart, endDate: customEnd })
      .then(setReport)
      .catch((err) => toast(err.message || 'Failed to load report', 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customStart, customEnd]);

  async function handleExport(format) {
    setExporting(format);
    try {
      await exportReport(activeDef.type, format, activeDef.dateScoped ? { range, startDate: customStart, endDate: customEnd } : {});
      toast(`${report.title}.${format} downloaded`, 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setExporting(null);
    }
  }

  async function handleEmail() {
    setEmailing(true);
    try {
      // Always sent as a PDF — the one format meant to be read as-is
      // rather than opened in a spreadsheet, which fits an email
      // attachment best.
      const { message } = await emailReport(activeDef.type, 'pdf', activeDef.dateScoped ? { range, startDate: customStart, endDate: customEnd } : {});
      toast(message, 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setEmailing(false);
    }
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_DEFS.map((d) => (
          <button
            key={d.type}
            onClick={() => handleShow(d)}
            className={`card flex flex-col gap-2.5 text-left ${activeDef?.type === d.type ? 'border-gold-dim' : ''}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gold/10 text-gold-light">
              <d.icon size={17} strokeWidth={1.75} />
            </div>
            <div className="text-[13.5px] font-semibold">{d.title}</div>
            <div className="text-[11px] text-ink-muted">{d.sub}</div>
          </button>
        ))}
      </div>

      {!activeDef ? (
        <Card>
          <EmptyState icon={BarChart3} message="Select a report above to preview and export it" />
        </Card>
      ) : (
        <>
          {activeDef.dateScoped && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {RANGE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setRange(f.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs ${
                      range === f.value ? 'border-gold-dim bg-gold/10 text-gold-light' : 'border-border text-ink-secondary'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {range === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" className="field-input !w-auto" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                  <span className="text-ink-muted">to</span>
                  <input type="date" className="field-input !w-auto" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {!report ? (
            <Card>
              <p className="py-8 text-center text-[13.5px] text-ink-muted">
                {activeDef.dateScoped && customIncomplete ? 'Pick a start and end date to view this report.' : 'Loading…'}
              </p>
            </Card>
          ) : (
            <Card>
              <PanelTitle
                title={report.title}
                subtitle={
                  report.dateRangeLabel
                    ? `${report.rows.length} record${report.rows.length !== 1 ? 's' : ''} · ${report.dateRangeLabel}`
                    : `${report.rows.length} record${report.rows.length !== 1 ? 's' : ''} · as of today`
                }
                action={
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleExport('csv')} disabled={!!exporting} className="btn btn-gold !px-3 !py-2 text-xs">
                      <Download size={14} /> CSV
                    </button>
                    <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="btn btn-ghost !px-3 !py-2 text-xs">
                      <FileText size={14} /> PDF
                    </button>
                    <button onClick={() => handleExport('xlsx')} disabled={!!exporting} className="btn btn-ghost !px-3 !py-2 text-xs">
                      <FileText size={14} /> Excel
                    </button>
                    <button
                      onClick={handleEmail}
                      disabled={emailing}
                      title={`Email this report to ${user?.email}`}
                      className="btn btn-ghost !px-3 !py-2 text-xs"
                    >
                      <Mail size={14} /> {emailing ? 'Sending…' : 'Email'}
                    </button>
                  </div>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                      {report.headers.map((h) => (
                        <th key={h} className="pb-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.length === 0 ? (
                      <tr>
                        <td colSpan={report.headers.length} className="py-8 text-center text-ink-muted">
                          No records
                        </td>
                      </tr>
                    ) : (
                      report.rows.map((row, i) => (
                        <tr key={i} className="border-t border-border-soft">
                          {row.map((cell, j) => (
                            <td key={j} className="py-3">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
