import { REORDER_ALERTS } from '../../services/dummyData';
import clsx from 'clsx';

const ReorderTable = () => {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Reorder Alerts</h3>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                            <th className="font-semibold py-3 pl-2">Product Name</th>
                            <th className="font-semibold py-3 text-center">Qty</th>
                            <th className="font-semibold py-3 text-center">Alert Level</th>
                            <th className="font-semibold py-3 text-center">Status</th>
                            <th className="font-semibold py-3 text-right pr-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {REORDER_ALERTS.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                                <td className="py-4 pl-2 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                <td className="py-4 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                <td className="py-4 text-center text-gray-500">{item.reorderLevel}</td>
                                <td className="py-4 text-center">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-semibold border",
                                        item.status === 'Out of Stock' ? "bg-red-50 text-red-600 border-red-100" :
                                            item.status === 'Critical' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-yellow-50 text-yellow-600 border-yellow-100"
                                    )}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <button className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors font-medium">
                                        Restock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReorderTable;
