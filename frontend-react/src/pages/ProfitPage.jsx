import { useEffect, useState } from 'react';
import { Download, FileText, Mail } from 'lucide-react';
import { Card, PanelTitle } from '../components/common/Card.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ProfitSummaryCards from '../components/profit/ProfitSummaryCards.jsx';
import ProfitTable from '../components/profit/ProfitTable.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { useAutoPageSize } from '../hooks/useAutoPageSize.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProfitReport, getProfitHistory, exportProfitReport, emailProfitReport } from '../api/profit.js';

const RANGE_FILTERS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export default function ProfitPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [range, setRange] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const [report, setReport] = useState(null);
  const [historyResult, setHistoryResult] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [exporting, setExporting] = useState(null); // which format is currently exporting, or null
  const [emailing, setEmailing] = useState(false);
  const { containerRef, pageSize } = useAutoPageSize();

  const customIncomplete = range === 'custom' && (!customStart || !customEnd);

  // Two-step fetch, and this order matters: the Profit Report endpoint is
  // the one place that turns a named range ('monthly') into concrete
  // startDate/endDate ('2026-06-06' -> '2026-07-06'). Rather than
  // re-implementing that date math in the browser too (and risking it
  // drifting out of sync with the backend's version), we fetch the report
  // first and then reuse ITS resolved startDate/endDate as the exact
  // window for the history table — so the table and the summary cards
  // above it are always describing the same date range.
  useEffect(() => {
    if (customIncomplete) return;

    let cancelled = false;

    async function load() {
      try {
        const reportData = await getProfitReport({ range, startDate: customStart, endDate: customEnd });
        if (cancelled) return;
        setReport(reportData);

        const historyData = await getProfitHistory({
          search: debouncedSearch,
          startDate: reportData.startDate,
          endDate: reportData.endDate,
          sortBy,
          sortDir,
          page,
          perPage: pageSize,
        });
        if (!cancelled) setHistoryResult(historyData);
      } catch (err) {
        if (!cancelled) toast(err.message || 'Failed to load profit data', 'err');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [range, customStart, customEnd, customIncomplete, debouncedSearch, sortBy, sortDir, page, pageSize]);

  // See the matching comment in ProductsPage.jsx — resetting `page`
  // during render (rather than in its own effect, as this used to do)
  // prevents a race where the fetch effect above could fire with a stale
  // page number combined with a brand new pageSize, requesting a page
  // that no longer exists at the new size.
  const [filterKey, setFilterKey] = useState(
    `${range}|${customStart}|${customEnd}|${debouncedSearch}|${sortBy}|${sortDir}|${pageSize}`
  );
  const nextFilterKey = `${range}|${customStart}|${customEnd}|${debouncedSearch}|${sortBy}|${sortDir}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    if (page !== 1) setPage(1);
  }

  function handleSort(column) {
    if (column === sortBy) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  async function handleExport(format) {
    if (!report) return;
    setExporting(format);
    try {
      await exportProfitReport({ range, startDate: report.startDate, endDate: report.endDate, format });
      toast(`Profit report ${format.toUpperCase()} downloaded`, 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setExporting(null);
    }
  }

  async function handleEmail() {
    if (!report) return;
    setEmailing(true);
    try {
      const { message } = await emailProfitReport({ range, startDate: report.startDate, endDate: report.endDate, format: 'pdf' });
      toast(message, 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setEmailing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleExport('csv')} disabled={!!exporting || !report} className="btn btn-gold !px-3 !py-2 text-xs">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExport('pdf')} disabled={!!exporting || !report} className="btn btn-ghost !px-3 !py-2 text-xs">
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => handleExport('xlsx')} disabled={!!exporting || !report} className="btn btn-ghost !px-3 !py-2 text-xs">
            <FileText size={14} /> Excel
          </button>
          <button
            onClick={handleEmail}
            disabled={emailing || !report}
            title={`Email this report to ${user?.email}`}
            className="btn btn-ghost !px-3 !py-2 text-xs"
          >
            <Mail size={14} /> {emailing ? 'Sending…' : 'Email'}
          </button>
        </div>
      </div>

      {customIncomplete ? (
        <Card className="flex-1">
          <p className="py-8 text-center text-[13.5px] text-ink-muted">Pick a start and end date to view this report.</p>
        </Card>
      ) : (
        <>
          <ProfitSummaryCards report={report} />

          <Card noPadding className="flex flex-1 flex-col" ref={containerRef}>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
              <PanelTitle title="Profit History" subtitle="Every completed sale in the selected range" />
              <SearchInput value={search} onChange={setSearch} placeholder="Search product or SKU…" />
            </div>
            <ProfitTable sales={historyResult.data} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            <Pagination page={historyResult.pagination.page} totalPages={historyResult.pagination.totalPages} onChange={setPage} />
          </Card>
        </>
      )}
    </div>
  );
}
