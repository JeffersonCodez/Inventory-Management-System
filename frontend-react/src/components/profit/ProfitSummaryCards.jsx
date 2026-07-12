import { Receipt, Wallet, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { fmtMoney } from '../../utils/format.js';

function Stat({ label, value, icon: Icon, tone = '' }) {
  const toneClass = {
    ok: 'bg-success-bg text-success',
    danger: 'bg-danger-bg text-danger',
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
      <div className="font-mono text-[22px] font-semibold tracking-tight">{value}</div>
    </Card>
  );
}

// `report` is the raw object from GET /api/profit/report — see
// profitController.report(). Rendered as its own component (rather than
// inlined in ProfitPage) so these four cards could later be reused
// elsewhere, e.g. embedded in a per-product detail view.
export default function ProfitSummaryCards({ report }) {
  if (!report) return null;
  const isLoss = report.totalProfit < 0;

  return (
    <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
      <Stat label="Total Revenue" value={fmtMoney(report.totalRevenue)} icon={Receipt} />
      <Stat label="Total Cost" value={fmtMoney(report.totalCost)} icon={Wallet} />
      <Stat
        label="Total Profit"
        value={fmtMoney(report.totalProfit)}
        icon={isLoss ? TrendingDown : TrendingUp}
        tone={isLoss ? 'danger' : 'ok'}
      />
      <Stat label="Number of Sales" value={report.numberOfSales} icon={ShoppingCart} />
    </div>
  );
}
