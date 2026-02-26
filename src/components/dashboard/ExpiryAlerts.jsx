import { AlertTriangle, Clock } from 'lucide-react';
import { EXPIRY_ALERTS } from '../../services/dummyData';
import clsx from 'clsx';

const ExpiryAlerts = () => {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <Clock size={20} className="mr-2 text-red-500" />
                Expiry Alerts
            </h3>
            <div className="space-y-4">
                {EXPIRY_ALERTS.map((item) => (
                    <div key={item.id} className="flex items-start p-3 bg-red-50/50 rounded-xl border border-red-100 group hover:border-red-200 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                            <p className={clsx(
                                "text-xs mt-1 font-medium",
                                item.daysLeft === 0 ? "text-red-600" : "text-orange-600"
                            )}>
                                {item.status}
                            </p>
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                            {item.daysLeft === 0 ? 'Today' : `${item.daysLeft} days`}
                        </div>
                    </div>
                ))}
                {EXPIRY_ALERTS.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No warnings</p>
                )}
            </div>
            <button className="w-full mt-6 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors font-medium">
                View Expired History
            </button>
        </div>
    );
};

export default ExpiryAlerts;
