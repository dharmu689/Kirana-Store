const { execSync } = require('child_process');
let output;
try {
    output = execSync('npx eslint "src/**/*.jsx" --format json', { encoding: 'utf8' });
} catch (e) {
    output = e.stdout;
}

const data = JSON.parse(output);
const missingImports = {};

data.forEach(result => {
    let missingHooks = new Set();
    result.messages.forEach(msg => {
        if (msg.ruleId === 'no-undef') {
            const match = msg.message.match(/'(useEffect|useState|useMemo|useCallback|useRef|useContext|useReducer|useLayoutEffect)' is not defined/);
            if (match) {
                missingHooks.add(match[1]);
            }
        }
    });

    if (missingHooks.size > 0) {
        missingImports[result.filePath] = Array.from(missingHooks);
    }
});

console.log(JSON.stringify(missingImports, null, 2));
