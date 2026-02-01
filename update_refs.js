import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'seed_new_menu.js');
const menuPath = path.join(__dirname, '..', 'burger-menu', 'menu.json');

async function updateFile(filePath, isJson = false) {
    try {
        console.log(`Updating references in: ${filePath}`);
        let content = await fs.readFile(filePath, 'utf8');

        // 1. Replace Extensions
        // Regex to find .png, .jpg, .jpeg inside quotes and replace with .webp
        content = content.replace(/(\.png|\.jpg|\.jpeg)/gi, '.webp');

        // 2. Update Banners (Specific replacements)
        // Note: The previous optimization converted existing banners to .webp too, 
        // but we want to switch to the NEW nano banners.

        const bannerMap = {
            'images/banner_burgers.webp': 'images/banner_burgers_nano.webp',
            'images/banner_chicken.webp': 'images/banner_chicken_nano.webp',
            'images/banner_all.webp': 'images/banner_all_nano.webp',
            'images/banner_extras.webp': 'images/banner_extras_nano.webp',
            // Handle if they were still png/jpg in the source before the regex above ran?
            // The regex above runs first, so they became .webp. 
            // So we strictly replace the .webp versions with _nano.webp
        };

        for (const [oldBanner, newBanner] of Object.entries(bannerMap)) {
            // Global replace
            content = content.split(oldBanner).join(newBanner);
        }

        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);

    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
}

async function run() {
    await updateFile(seedPath);
    await updateFile(menuPath, true);
}

run();
