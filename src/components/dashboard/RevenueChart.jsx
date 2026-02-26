import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RevenueChart = ({ data }) => {
    // Generate labels and data
    const labels = data ? data.map(item => {
        const date = new Date();
        date.setMonth(item._id - 1);
        return date.toLocaleString('default', { month: 'short' });
    }) : [];

    const revenueData = data ? data.map(item => item.revenue) : [];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Monthly Revenue',
                data: revenueData,
                borderColor: 'rgb(99, 102, 241)', // Indigo 500
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(99, 102, 241)',
                pointRadius: 4,
                pointHoverRadius: 6
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context) => `Revenue: ₹${context.raw.toLocaleString()}`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: { size: 12 },
                    color: '#9ca3af'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                    borderDash: [5, 5],
                    drawBorder: false,
                },
                ticks: {
                    font: { size: 12 },
                    color: '#9ca3af',
                    callback: (value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`
                }
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100/50 p-6 h-96">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Revenue Overview</h3>
                    <p className="text-sm text-gray-500">Monthly sales performance</p>
                </div>
            </div>
            <div className="h-72 w-full">
                {data && data.length > 0 ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No revenue data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
