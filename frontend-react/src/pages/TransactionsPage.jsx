import { useEffect, useState } from 'react';
import { Card } from '../components/common/Card.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import Pagination from '../components/common/Pagination.jsx';
import TransactionsTable from '../components/transactions/TransactionsTable.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { useAutoPageSize } from '../hooks/useAutoPageSize.js';
import { useToast } from '../context/ToastContext.jsx';
import { getTransactions } from '../api/transactions.js';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const { containerRef, pageSize } = useAutoPageSize();
  const toast = useToast();

  // See the matching comment in ProductsPage.jsx — resetting `page`
  // during render (rather than in a separate effect) prevents a race
  // where the fetch effect below could fire with a stale page number
  // combined with a brand new pageSize, requesting a page that no longer
  // exists.
  const [filterKey, setFilterKey] = useState(`${debouncedSearch}|${type}|${pageSize}`);
  const nextFilterKey = `${debouncedSearch}|${type}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    if (page !== 1) setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    getTransactions({ search: debouncedSearch, type, page, perPage: pageSize })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) toast(err.message || 'Failed to load transactions', 'err');
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, type, page, pageSize, toast]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search product…" />
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs ${
                type === f.value ? 'border-gold-dim bg-gold/10 text-gold-light' : 'border-border text-ink-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card noPadding className="flex flex-1 flex-col" ref={containerRef}>
        <TransactionsTable transactions={result.data} />
        <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
