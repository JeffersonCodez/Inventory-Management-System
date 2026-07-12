import { Bar } from 'react-chartjs-2';
import './chartSetup.js';
import { CHART_FONT, CHART_GRID_COLOR, CHART_TEXT_COLOR } from './chartSetup.js';

export default function MovementChart({ months }) {
  const data = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: 'Stock In',
        data: months.map((m) => m.in),
        backgroundColor: '#D4AF37',
        borderRadius: 5,
        maxBarThickness: 22,
      },
      {
        label: 'Stock Out',
        data: months.map((m) => m.out),
        backgroundColor: '#4A4740',
        borderRadius: 5,
        maxBarThickness: 22,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: CHART_TEXT_COLOR, font: CHART_FONT } },
      y: { grid: { color: CHART_GRID_COLOR }, ticks: { color: CHART_TEXT_COLOR, font: CHART_FONT } },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: CHART_TEXT_COLOR, font: CHART_FONT, usePointStyle: true, pointStyle: 'circle' },
      },
    },
  };

  return (
    <div className="h-[230px]">
      <Bar data={data} options={options} />
    </div>
  );
}
