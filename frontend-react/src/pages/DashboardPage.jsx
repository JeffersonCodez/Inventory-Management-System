import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, AlertTriangle, PackageX, DollarSign, TrendingUp } from 'lucide-react';
import { Card, PanelTitle } from '../components/common/Card.jsx';
import { getProductSummary, getProducts } from '../api/products.js';
import { getMonthlyMovement, getRecentTransactions } from '../api/transactions.js';
import { getProfitSummary, getProfitTrend } from '../api/profit.js';
import StockStatusChart from '../components/charts/StockStatusChart.jsx';
import MovementChart from '../components/charts/MovementChart.jsx';
import ProfitTrendChart from '../components/charts/ProfitTrendChart.jsx';
import { TypeBadge, CategoryTag } from '../components/common/Badge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmtDate, fmtMoney } from '../utils/format.js';

function StatCard({ label, value, trend, icon: Icon, tone = '' }) {
  const toneClass = {
    warn: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
    ok: 'bg-success-bg text-success',
    '': 'bg-gold/10 text-gold-light',
  }[tone];

  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-secondary">{label}</span>
        <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${toneClass}`}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
      </div>
      <div className="font-mono text-[26px] font-semibold tracking-tight">{value}</div>
      <div className="text-[11.5px] text-ink-muted">{trend}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [months, setMonths] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [profitTrend, setProfitTrend] = useState([]);

  const toast = useToast();

  useEffect(() => {
    // Every fetch here used to have no .catch() at all — if any one of
    // these failed (e.g. the database was missing a column a migration
    // hadn't been run for yet), the promise just rejected into the void:
    // no error, no toast, `summary` stayed null forever, and the whole
    // page silently rendered nothing (see the `if (!summary) return null`
    // guard below) with zero indication anything was wrong. A toast here
    // at least makes a real backend failure visibly a FAILURE, not
    // something that looks like "there's just no data yet".
    const onError = (err) => toast(err.message || 'Failed to load dashboard data', 'err');

    getProductSummary().then(setSummary).catch(onError);
    getMonthlyMovement(6).then(setMonths).catch(onError);
    getProducts({ perPage: 1000 })
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
        setRecentProducts(sorted.slice(0, 5));
      })
      .catch(onError);
    getRecentTransactions(null, 5).then(setRecentTx).catch(onError);
    // All-time total for the card; last 6 months, grouped by month, for the
    // trend chart — same "6 months" window the Monthly Inventory Movement
    // chart above already uses, so the two line up when read side by side.
    getProfitSummary().then(setProfitSummary).catch(onError);
    getProfitTrend({ range: 'yearly', granularity: 'monthly' }).then(setProfitTrend).catch(onError);
  }, [toast]);

  if (!summary) return null;

  const attention = summary.lowStock + summary.outOfStock;

  return (
    <div>
      {attention > 0 && (
        <div className="mb-5 flex items-center gap-2.5 rounded-control border border-danger/30 bg-danger-bg px-4 py-3 text-[13px]">
          <AlertTriangle size={18} className="text-danger" />
          <span>
            <b className="text-danger">
              {attention} item{attention > 1 ? 's' : ''}
            </b>{' '}
            need attention — {summary.lowStock} low on stock, {summary.outOfStock} out of stock.
          </span>
          <Link to="/products" className="ml-auto whitespace-nowrap text-[12.5px] font-semibold text-gold-light">
            Review products →
          </Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Products" value={summary.totalProducts} trend={`Across ${summary.totalCategories} categories`} icon={Package} />
        <StatCard label="Categories" value={summary.totalCategories} trend="Active groupings" icon={Layers} />
        <StatCard label="Low Stock" value={summary.lowStock} trend="Below minimum level" icon={AlertTriangle} tone="warn" />
        <StatCard label="Out of Stock" value={summary.outOfStock} trend="Needs reorder" icon={PackageX} tone="danger" />
        <StatCard label="Stock Value" value={fmtMoney(summary.stockValue)} trend="At purchase price" icon={DollarSign} tone="ok" />
        <StatCard
          label="Total Profit Earned"
          value={fmtMoney(profitSummary?.totalProfit ?? 0)}
          trend={`From ${profitSummary?.numberOfSales ?? 0} completed sales`}
          icon={TrendingUp}
          tone="ok"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <PanelTitle title="Monthly Inventory Movement" subtitle="Stock in vs. stock out" />
          <MovementChart months={months} />
        </Card>
        <Card>
          <PanelTitle title="Stock Status" subtitle="Current distribution" />
          <StockStatusChart ok={summary.totalProducts - summary.lowStock - summary.outOfStock} low={summary.lowStock} out={summary.outOfStock} />
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-1">
        <Card>
          <PanelTitle title="Profit Trend" subtitle="Realized profit by month, last 12 months" />
          <ProfitTrendChart points={profitTrend} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card noPadding>
          <div className="p-5 pb-0">
            <PanelTitle
              title="Recently Added Products"
              subtitle="Latest catalog entries"
              action={
                <Link to="/products" className="text-xs text-gold-light">
                  View all
                </Link>
              }
            />
          </div>
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => (
                  <tr key={p.id} className="border-t border-border-soft">
                    <td className="py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="font-mono text-[11.5px] text-ink-muted">{p.sku}</div>
                    </td>
                    <td className="py-3">
                      <CategoryTag>{p.categoryName}</CategoryTag>
                    </td>
                    <td className="py-3 font-mono">
                      {p.quantity} {p.unit}
                    </td>
                    <td className="py-3">{fmtDate(p.dateAdded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card noPadding>
          <div className="p-5 pb-0">
            <PanelTitle
              title="Recent Transactions"
              subtitle="Latest movement"
              action={
                <Link to="/transactions" className="text-xs text-gold-light">
                  View all
                </Link>
              }
            />
          </div>
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Type</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((t) => (
                  <tr key={t.id} className="border-t border-border-soft">
                    <td className="py-3 font-semibold">{t.productName}</td>
                    <td className="py-3">
                      <TypeBadge type={t.type} />
                    </td>
                    <td className="py-3 font-mono">{t.quantity}</td>
                    <td className="py-3">{fmtDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
