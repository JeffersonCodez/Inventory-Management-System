import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// LineElement/PointElement/Filler are new here — they're what the Profit
// Trend chart needs (a Line chart with a soft fill under the line) that
// the existing Bar/Doughnut charts didn't require.
ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export const CHART_TEXT_COLOR = '#A6A297';
export const CHART_GRID_COLOR = '#232220';
export const CHART_FONT = { family: 'Inter', size: 11 };
