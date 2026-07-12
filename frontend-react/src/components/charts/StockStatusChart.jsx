import { Doughnut } from 'react-chartjs-2';
import './chartSetup.js';
import { CHART_FONT, CHART_TEXT_COLOR } from './chartSetup.js';

export default function StockStatusChart({ ok, low, out }) {
  const data = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [ok, low, out],
        backgroundColor: ['#5FA97C', '#D4913A', '#C4574C'],
        borderColor: '#1A1A18',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    cutout: '68%',
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: CHART_TEXT_COLOR, font: CHART_FONT, padding: 14, usePointStyle: true, pointStyle: 'circle' },
      },
    },
  };

  return (
    <div className="h-[230px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}
