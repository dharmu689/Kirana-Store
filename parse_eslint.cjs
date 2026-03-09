const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint-errors.json', 'utf8'));

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
