import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export const SalesTrendChart = ({ data }) => {
    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Sales Trend (30 Days)</h3>
            <div className="h-64 w-full">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(str) => str.slice(5)} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex bg-gray-50 dark:bg-gray-800 h-full w-full items-center justify-center rounded-lg border border-gray-100"><p className="text-gray-400">Loading tracking array natively...</p></div>
                )}
            </div>
        </div>
    );
};

export const ForecastAccuracyChart = ({ data }) => {
    // Artificial mock formatting tracking generic accuracies for immediate visual demo or parsing live objects
    const chartData = [
        { name: 'Last Wk', accuracy: 88 },
        { name: 'Current', accuracy: data || 0 },
        { name: 'Target', accuracy: 95 },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Forecast Accuracy</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#F3F4F6' }} />
                        <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const InventoryHealthChart = ({ data }) => {
    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Inventory Health Tracking</h3>
            <div className="h-64 w-full flex items-center justify-center">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex bg-gray-50 dark:bg-gray-800 h-full w-full items-center justify-center rounded-lg border border-gray-100"><p className="text-gray-400">Calculating Safe Stock bounds...</p></div>
                )}
            </div>
        </div>
    );
};

export const VendorPerformanceChart = ({ vendors }) => {
    // Artificial array mocking vendor score distribution comparing across the whole app.
    const chartData = [
        { name: 'Supplier A', logicScore: 92 },
        { name: 'Supplier B', logicScore: 85 },
        { name: 'Supplier C', logicScore: 78 }
    ];

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Vendor Intelligence</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563', fontWeight: 600 }} width={80} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#F3F4F6' }} />
                        <Bar dataKey="logicScore" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
