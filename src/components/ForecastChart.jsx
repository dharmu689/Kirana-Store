import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ForecastChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="w-full h-72 md:h-96 bg-white rounded-xl shadow-lg p-4 flex items-center justify-center border border-gray-100">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 font-medium">Loading trend data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-72 md:h-96 bg-white rounded-xl shadow-lg p-4 flex items-center justify-center border border-gray-100">
                <p className="text-gray-500 font-medium">No trend data available for this product.</p>
            </div>
        );
    }

    // Custom Tooltip for cleaner UI
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-md rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm flex items-center my-1" style={{ color: entry.color }}>
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-72 md:h-96 bg-white rounded-xl shadow-lg p-4 pt-6 border border-gray-100 transition-all hover:shadow-xl">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            // Format: "MM/DD"
                            const parts = value.split('-');
                            if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
                            return value;
                        }}
                        minTickGap={20}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px" }} iconType="circle" />
                    <Line
                        type="monotone"
                        name="Actual Sales (30d)"
                        dataKey="actualSales"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        name="Regression Prediction"
                        dataKey="predictedDemand"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                    />
                    <Line
                        type="monotone"
                        name="Hybrid Forecast"
                        dataKey="hybridForecastDemand"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ForecastChart;
