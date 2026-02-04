import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Artifacts source
const sourceDir = "C:/Users/Andrew/.gemini/antigravity/brain/3e2055d7-ce69-4878-a629-fcccb4adfca9";
// Target for the MENU website
const targetDir = "d:/websites/burger-menu/images";

const images = [
    { src: "water_bottle_red_1770199555803.png", dest: "water_bottle_red.webp" },
    { src: "soda_collection_red_1770199571508.png", dest: "soda_collection_red.webp" },
    { src: "banner_drinks_nano_blue_1770199584897.png", dest: "banner_drinks_nano_blue.webp" }
];

async function processImages() {
    for (const img of images) {
        const input = path.join(sourceDir, img.src);
        const output = path.join(targetDir, img.dest);

        console.log(`Converting ${img.src} -> ${img.dest}...`);

        try {
            await sharp(input)
                .webp({ quality: 85 })
                .toFile(output);
            console.log(`Saved: ${output}`);
        } catch (e) {
            console.error(`Error processing ${img.src}:`, e);
        }
    }
}

processImages();
