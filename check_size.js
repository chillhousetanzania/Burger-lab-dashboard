import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '../burger-menu/images');
const file = path.join(dir, 'classic_burger_v2.webp');

try {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`File: ${file}`);
        console.log(`Size: ${stats.size} bytes`);
    } else {
        console.log('File not found');
    }
} catch (err) {
    console.error(err);
}
