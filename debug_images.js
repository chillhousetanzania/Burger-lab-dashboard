const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../burger-menu/images');
console.log('Checking directory:', dir);

try {
    const files = fs.readdirSync(dir);
    console.log('Files found:', files.length);
    console.log('First 10 files:', files.slice(0, 10));

    if (files.includes('classic_burger_v2.webp')) {
        console.log('SUCCESS: classic_burger_v2.webp exists!');
    } else {
        console.log('ERROR: classic_burger_v2.webp NOT found!');
    }
} catch (err) {
    console.error('Error reading directory:', err);
}
