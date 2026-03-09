import StoreSettings from '../components/settings/StoreSettings';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Settings = () => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{t?.settings || "Settings"}</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Manage your store configuration and preferences
                    </p>
                </div>
            </div>

            {/* Tabs (Removed extra tabs, keeping Store Settings as default) */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap gap-4 px-2">
                <button
                    className="py-3 px-4 font-semibold text-sm transition-all rounded-t-xl bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] border-b-2 border-[var(--color-brand-blue)]"
                >
                    Store Settings
                </button>
            </div>

            {/* Content */}
            <div className="mt-6">
                <StoreSettings />
            </div>
        </div>
    );
};

export default Settings;
