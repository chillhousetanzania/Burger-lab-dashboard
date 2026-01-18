const sharp = require('sharp');
const fs = require('fs');

const input = 'images/grilled_chicken_v2.png';
const output = 'images/bacon_burger_v2.webp';

if (fs.existsSync(input)) {
    sharp(input)
        .webp({ quality: 80 })
        .toFile(output)
        .then(info => {
            console.log('Conversion complete:', info);
            // Delete source
            fs.unlinkSync(input);
            console.log('Deleted source:', input);
        })
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
} else {
    console.error('Input file not found:', input);
}
