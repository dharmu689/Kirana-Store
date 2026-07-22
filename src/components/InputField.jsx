import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

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
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={clsx(
                        "block w-full h-12 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white",
                        Icon ? "pl-10 pr-10" : "px-4 pr-10",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    )}
                    placeholder={placeholder}
                />
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
};

export default InputField;

