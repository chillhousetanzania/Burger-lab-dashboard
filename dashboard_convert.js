const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src = 'd:/websites/burger-dashboard/images/gunners_beef_red_real.png';
const destDash = 'd:/websites/burger-dashboard/images/gunners_beef_red_real.webp';
const destMenu = 'd:/websites/burger-menu/images/gunners_beef_red_real.webp';

sharp(src)
    .webp({ quality: 80 })
    .toFile(destDash)
    .then(() => {
        console.log('Converted to WebP in Dashboard');
        fs.copyFileSync(destDash, destMenu);
        console.log('Copied to Menu');
    })
    .catch(err => console.error('Error:', err));
