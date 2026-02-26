import { format } from 'date-fns';

const RecentSales = ({ sales }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100/50 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500">
                            <th className="pb-3 font-medium">Product</th>
                            <th className="pb-3 font-medium text-center">Qty</th>
                            <th className="pb-3 font-medium text-right">Price</th>
                            <th className="pb-3 font-medium text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sales && sales.length > 0 ? (
                            sales.map((sale, index) => (
                                <tr key={index} className="group hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                                    <td className="py-3 pr-2">
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{sale.productName || sale.product?.name || 'Unknown'}</p>
                                    </td>
                                    <td className="py-3 text-center text-gray-600 dark:text-gray-400">
                                        {sale.quantitySold}
                                    </td>
                                    <td className="py-3 text-right font-medium text-green-600">
                                        ₹{sale.totalPrice}
                                    </td>
                                    <td className="py-3 text-right text-gray-500 text-xs">
                                        {format(new Date(sale.createdAt), 'MMM dd, HH:mm')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-gray-500">No recent sales.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {sales && sales.length > 0 && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All Sales &rarr;</button>
                </div>
            )}
        </div>
    );
};

export default RecentSales;
