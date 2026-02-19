import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReorderAlertCard = ({ count, criticalCount }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Stock Alerts</h3>
                        <p className="text-sm text-gray-500">Items requiring attention</p>
                    </div>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center space-x-3">
                            <AlertOctagon size={18} className="text-red-500" />
                            <span className="text-sm font-medium text-gray-700">Critical (Out of Stock)</span>
                        </div>
                        <span className="text-lg font-bold text-red-600">{criticalCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle size={18} className="text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">Low Stock</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{count || 0}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate('/reorder')}
                className="w-full mt-4 py-2 border border-orange-200 text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors text-sm"
            >
                View Reorder List
            </button>
        </div>
    );
};

export default ReorderAlertCard;
