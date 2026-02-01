import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target the subdirectory images
const imagesDir = path.join(__dirname, 'burger-menu', 'images');

async function optimizeImages() {
    try {
        console.log(`Scanning directory: ${imagesDir}`);
        const files = await fs.readdir(imagesDir);
        let convertedCount = 0;

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                const inputPath = path.join(imagesDir, file);
                const outputFilename = path.basename(file, ext) + '.webp';
                const outputPath = path.join(imagesDir, outputFilename);

                console.log(`Optimizing: ${file} -> ${outputFilename}`);

                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                // Delete original file
                await fs.unlink(inputPath);

                convertedCount++;
            }
        }

        console.log(`Optimization complete! Converted ${convertedCount} images.`);
    } catch (error) {
        console.error('Error optimizing images:', error);
    }
}

optimizeImages();
