// app/components/Charts.js
'use client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { formatPrice } from '../../utils/currency';

// Register ChartJS components only on client side
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
  );
}

export function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No sales data available</div>
  }

  const chartData = {
    labels: data.map(item => item.date || ''),
    datasets: [
      {
        label: 'Daily Sales (₱)',
        data: data.map(item => item.total || 0),
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview (Last 7 Days)'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatPrice(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No category data available</div>
  }

  const chartData = {
    labels: data.map(item => item.category || 'Unknown'),
    datasets: [
      {
        label: 'Sales by Category (₱)',
        data: data.map(item => item.total_sales || 0),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales by Category'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatPrice(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function StockPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No stock data available</div>
  }

  const chartData = {
    labels: data.map(item => item.status || 'Unknown'),
    datasets: [
      {
        data: data.map(item => item.count || 0),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Distribution'
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No product data available</div>
  }

  const chartData = {
    labels: data.map(item => item.name || 'Unknown'),
    datasets: [
      {
        label: 'Units in Stock',
        data: data.map(item => item.total_sold || 0),
        backgroundColor: 'rgba(118, 75, 162, 0.8)',
        borderColor: 'rgba(118, 75, 162, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Products by Stock'
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}