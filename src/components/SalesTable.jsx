import { format } from 'date-fns';

const SalesTable = ({ sales }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b text-gray-800 dark:text-gray-200">Sales History</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">Date</th>
                            <th className="py-3 px-6">Product</th>
                            <th className="py-3 px-6">Category</th>
                            <th className="py-3 px-6 text-center">Qty</th>
                            <th className="py-3 px-6 text-right">Total</th>
                            <th className="py-3 px-6">Payment</th>
                            <th className="py-3 px-6">Sold By</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400 text-sm font-light">
                        {sales.length > 0 ? (
                            sales.map((sale) => (
                                <tr key={sale._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition duration-150">
                                    <td className="py-3 px-6 whitespace-nowrap">
                                        {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="py-3 px-6 font-medium text-gray-800 dark:text-gray-200">
                                        {sale.productName}
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className="bg-blue-100 text-blue-600 py-1 px-3 rounded-full text-xs">
                                            {sale.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        {sale.quantitySold}
                                    </td>
                                    <td className="py-3 px-6 text-right font-medium text-green-600">
                                        ₹{sale.totalPrice}
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className={`py-1 px-3 rounded-full text-xs ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-600' :
                                                sale.paymentMethod === 'UPI' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6">
                                        {sale.soldBy?.name || 'Unknown'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4">No sales recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesTable;
