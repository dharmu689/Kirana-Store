import clsx from 'clsx';

const InputField = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    icon: Icon
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={clsx(
                        "block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sm:text-sm py-2 px-3 h-12 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-lg hover:border-gray-300 dark:hover:border-gray-500",
                        Icon ? "pl-10" : "pl-3",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    )}
                    placeholder={placeholder}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
};

export default InputField;
