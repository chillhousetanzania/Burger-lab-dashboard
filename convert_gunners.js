
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const IMG_DIR = 'd:/websites/burger-menu/images';
const MENU_PATH_DASHBOARD = 'd:/websites/burger-dashboard/burger-menu/menu.json';
const MENU_PATH_WEBSITE = 'd:/websites/burger-menu/menu.json';

const TARGET_FILE = 'gunners_beef_red_real.png';

async function convert() {
    try {
        const input = path.join(IMG_DIR, TARGET_FILE);
        const output = input.replace('.png', '.webp');

        console.log(`🖼️ Converting ${TARGET_FILE} to WebP...`);
        await sharp(input).webp({ quality: 80 }).toFile(output);
        console.log('✅ Conversion done.');

        // Update JSONs
        for (const jsonPath of [MENU_PATH_DASHBOARD, MENU_PATH_WEBSITE]) {
            console.log(`📝 Updating ${jsonPath}...`);
            const raw = await fs.readFile(jsonPath, 'utf-8');
            let content = raw.replace('gunners_beef_red_real.png', 'gunners_beef_red_real.webp');
            await fs.writeFile(jsonPath, content);
        }
        console.log('✅ JSON updated. Ready to delete old PNG.');

    } catch (e) {
        console.error('Error:', e);
    }
}

convert();
