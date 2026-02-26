import fs from 'fs';
import path from 'path';

const searchDirs = ['src/pages', 'src/components'];

const replacements = [
    { regex: /bg-white(?!\s+dark:)/g, replace: 'bg-white dark:bg-gray-900' },
    { regex: /bg-gray-50(?!\s+dark:)/g, replace: 'bg-gray-50 dark:bg-gray-800' },
    { regex: /bg-gray-100(?!\s+dark:)/g, replace: 'bg-gray-100 dark:bg-gray-800' },
    // text-black and text-gray-900 common text colors
    { regex: /text-black(?!\s+dark:)/g, replace: 'text-black dark:text-white' },
    { regex: /text-gray-900(?!\s+dark:)/g, replace: 'text-gray-900 dark:text-gray-100' },
    { regex: /text-gray-800(?!\s+dark:)/g, replace: 'text-gray-800 dark:text-gray-200' },
    { regex: /text-gray-700(?!\s+dark:)/g, replace: 'text-gray-700 dark:text-gray-300' },
    { regex: /text-gray-600(?!\s+dark:)/g, replace: 'text-gray-600 dark:text-gray-400' },
    // borders
    { regex: /border-gray-200(?!\s+dark:)/g, replace: 'border-gray-200 dark:border-gray-700' },
    { regex: /border-gray-300(?!\s+dark:)/g, replace: 'border-gray-300 dark:border-gray-600' }
];

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Handle standard tailwind replacements
            for (const { regex, replace } of replacements) {
                if (regex.test(content)) {
                    content = content.replace(regex, replace);
                    modified = true;
                }
            }

            // Specifically for Table logic:
            // <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
            if (content.includes('<table ')) {
                content = content.replace(/<table\s+className="([^"]*)"/g, (match, classes) => {
                    if (!classes.includes('min-w-full')) classes = 'min-w-full ' + classes;
                    return `<table className="${classes}"`;
                });
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

searchDirs.forEach(dir => {
    const fullDirPath = path.resolve(process.cwd(), dir);
    if (fs.existsSync(fullDirPath)) {
        processDirectory(fullDirPath);
    }
});

console.log('Bulk replacement complete.');
