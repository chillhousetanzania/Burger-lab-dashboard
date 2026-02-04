const sharp = require('sharp');
const path = require('path');

const artifactDir = "C:/Users/Andrew/.gemini/antigravity/brain/3e2055d7-ce69-4878-a629-fcccb4adfca9";
const destDir = "d:/websites/burger-dashboard/burger-menu/images";

const images = [
    { src: "gunners_beef_burger_1770208525577.png", dest: "gunners_beef_burger.webp" }
];

async function processImages() {
    for (const img of images) {
        const srcPath = path.join(artifactDir, img.src);
        const destPath = path.join(destDir, img.dest);

        await sharp(srcPath)
            .webp({ quality: 85 })
            .toFile(destPath);

        console.log(`Converted: ${img.src} -> ${img.dest}`);
    }
    console.log("Done!");
}

processImages().catch(console.error);
