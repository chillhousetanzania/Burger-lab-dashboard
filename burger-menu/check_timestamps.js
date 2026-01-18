const fs = require('fs');
const path = 'images';
fs.readdir(path, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const stats = fs.statSync(path + '/' + file);
        // Show files modified in the last 10 minutes
        if (Date.now() - stats.mtimeMs < 10 * 60 * 1000) {
            console.log(file, stats.mtime);
        }
    });
});
