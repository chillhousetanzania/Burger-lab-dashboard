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
    { src: "banner_kids_nano_v2_1769967667809.png", dest: "banner_kids_nano_v2.webp" },
    { src: "banner_sides_nano_v2_1769967684003.png", dest: "banner_sides_nano_v2.webp" },
    { src: "banner_all_nano_new_1769967699112.png", dest: "banner_all_nano_new.webp" }
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
