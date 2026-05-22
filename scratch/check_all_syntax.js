const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = '/Users/venkatragavn/march slot/3d';
const htmlFiles = [
    'index.html',
    'home2.html',
    'about.html',
    'services.html',
    'contact.html',
    'login.html',
    'register.html',
    'user-dashboard.html',
    'admin-dashboard.html'
];

let failed = false;

htmlFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found - ${filePath}`);
        return;
    }
    
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
        let match;
        let index = 1;
        
        while ((match = scriptRegex.exec(html)) !== null) {
            const jsCode = match[1].trim();
            if (!jsCode) continue;
            
            try {
                new vm.Script(jsCode);
            } catch (err) {
                console.error(`Error in ${file} (Script tag #${index}): Syntax Error!`);
                console.error(err);
                failed = true;
            }
            index++;
        }
        console.log(`Verified ${file}: All ${index - 1} script tag(s) OK.`);
    } catch (e) {
        console.error(`Failed to read or parse ${file}:`, e);
        failed = true;
    }
});

if (failed) {
    console.error("\nSome files failed syntax verification!");
    process.exit(1);
} else {
    console.log("\nAll html files syntax check PASSED!");
}
