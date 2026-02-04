const sharp = require('sharp');
const path = require('path');

const src = 'C:/Users/Andrew/.gemini/antigravity/brain/3e2055d7-ce69-4878-a629-fcccb4adfca9/gunners_beef_red_real_1770206756308.png';
const dest = path.join(__dirname, 'images', 'gunners_beef_red_real.webp');

sharp(src)
    .webp({ quality: 80 })
    .toFile(dest)
    .then(() => console.log('Converted Gunners Beef image to WebP'))
    .catch(err => console.error('Error converting image:', err));
