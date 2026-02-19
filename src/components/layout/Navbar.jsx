import { Bell, Search, Menu } from 'lucide-react';

const Navbar = ({ user }) => {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 ml-64">
            {/* Left Global Search */}
            <div className="flex items-center w-96">
                <button className="mr-4 lg:hidden text-gray-500 hover:text-gray-700">
                    <Menu size={24} />
                </button>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all duration-200"
                        placeholder="Search products, orders, or customers..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors group">
                    <Bell size={20} className="group-hover:text-blue-600 transition-colors" />
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                </button>
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                        {user ? `Welcome, ${user.name}` : 'Welcome, Guest'}
                    </span>
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                        {user ? user.role : 'Offline'}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
