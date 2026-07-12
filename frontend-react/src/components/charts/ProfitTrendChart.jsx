import { Line } from 'react-chartjs-2';
import './chartSetup.js';
import { CHART_FONT, CHART_GRID_COLOR, CHART_TEXT_COLOR } from './chartSetup.js';

// `points` comes from GET /api/profit/trend — an array of
// { key, label, profit, revenue, cost }, already bucketed and sorted by
// the backend (see profitService.buildTrend). This component only has to
// worry about drawing it, not computing it.
export default function ProfitTrendChart({ points }) {
  const data = {
    labels: points.map((p) => p.label),
    datasets: [
      {
        label: 'Profit',
        data: points.map((p) => p.profit),
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212,175,55,0.14)',
        pointBackgroundColor: '#D4AF37',
        pointRadius: 3,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: CHART_TEXT_COLOR, font: CHART_FONT } },
      y: {
        grid: { color: CHART_GRID_COLOR },
        ticks: {
          color: CHART_TEXT_COLOR,
          font: CHART_FONT,
          // Currency prefix on the axis ticks; kept as '$' to match
          // fmtMoney() everywhere else in this app (see utils/format.js —
          // worth revisiting together if you'd rather this whole app used
          // ₱ instead, since that's what the original spec used).
          callback: (value) => '$' + value,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Profit: $${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return (
    <div className="h-[230px]">
      <Line data={data} options={options} />
    </div>
  );
}
