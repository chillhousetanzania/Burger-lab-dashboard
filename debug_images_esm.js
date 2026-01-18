import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '../burger-menu/images');
console.log('Checking directory:', dir);

try {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log('Files found:', files.length);
        console.log('Sample files:', files.slice(0, 5));

        const target = 'classic_burger_v2.webp';
        if (files.includes(target)) {
            console.log(`SUCCESS: ${target} found.`);
        } else {
            console.log(`ERROR: ${target} NOT found.`);
            // Check for similar names
            const likely = files.filter(f => f.includes('burger'));
            console.log('Similiar files:', likely);
        }
    } else {
        console.log('ERROR: Directory does not exist:', dir);
    }
} catch (err) {
    console.error('Error:', err);
}
