import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const SeasonalityChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No Seasonality Data</p>
                <p className="text-sm text-gray-400 mt-1">Select a product to view weekly patterns</p>
            </div>
        );
    }

    // Determine highest day locally to highlight
    const maxSales = Math.max(...data.map(d => d.sales));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
                    <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
                    <div className="flex space-x-2 items-center">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <p className="text-sm text-gray-600">Sales: {payload[0].value.toFixed(0)}</p>
                    </div>
                    {payload[0].value === maxSales && maxSales > 0 && (
                        <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2 py-1 rounded inline-block">Peak Day</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                    <Bar
                        dataKey="sales"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.sales === maxSales && maxSales > 0 ? '#10B981' : '#6366F1'}
                                fillOpacity={entry.sales === maxSales && maxSales > 0 ? 1 : 0.7}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SeasonalityChart;
