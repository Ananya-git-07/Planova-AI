import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TrendChart = ({ trends }) => {
  // Process data for the chart
  const platformCounts = trends.reduce((acc, trend) => {
    const platform = trend.platform;
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(platformCounts),
    datasets: [
      {
        label: '# of Trends',
        data: Object.values(platformCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)',   // Red for YouTube
          'rgba(249, 115, 22, 0.85)',  // Orange for Reddit
          'rgba(59, 130, 246, 0.85)',  // Blue for Twitter
          'rgba(16, 185, 129, 0.85)',  // Green for Google/AI/News
          'rgba(168, 85, 247, 0.85)',  // Purple fallback
          'rgba(236, 72, 153, 0.85)',  // Pink fallback
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: '600',
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Source Breakdown
        </h2>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold">
          {trends.length} total
        </span>
      </div>
      <div className="h-72 flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;