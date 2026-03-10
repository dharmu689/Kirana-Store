import React from 'react';

const FooterSection = () => {
    return (
        <footer className="bg-[#f6f8fb]/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-900 py-8 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <span className="text-xl font-bold tracking-tight text-[#3b82f6] dark:text-blue-400">Kirana<span className="text-[#f97316]">Smart</span></span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                    &copy; {new Date().getFullYear()} KiranaSmart. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default FooterSection;
