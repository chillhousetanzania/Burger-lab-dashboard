import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from 'google-translate-api-x';
import multer from 'multer';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { User, Menu } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Configure Multer for temp storage
const upload = multer({ dest: 'temp/' });

const app = express();
const PORT = process.env.PORT || 5174;
const JWT_SECRET = process.env.JWT_SECRET || 'burger-secret-key';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Log in required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired session' });
        req.user = user;
        next();
    });
};

app.use(cors({
    origin: '*', // Allow all for local/LAN management
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 1. Logging Middleware (Top Priority)
app.use((req, res, next) => {
    console.log(`>>> Incoming: ${req.method} ${req.url}`);
    next();
});

// 2. API Routes (Before Static Files)
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.post('/api/login', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({ username: 'admin' });

        if (!user) return res.status(404).json({ error: 'Admin account not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/update-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 chars' });
        }

        const user = await User.findOne({ username: 'admin' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        console.log('Password updated for admin');
        res.json({ success: true, message: 'Password updated' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// 3. Static Files (Isolated Routes)
app.use('/menu', express.static(path.join(__dirname, 'burger-menu')));
app.use('/images', express.static(path.join(__dirname, 'burger-menu/images')));

// 4. Admin Dashboard Static Files (Disable Cache for Index)
app.use((req, res, next) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    next();
});
app.use(express.static(path.join(__dirname, 'dist'))); // Serve root files
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'))); // Explicit assets

// Path to menu.json (Source of Truth - Local Dev Folder)
const MENU_PATH = path.resolve(__dirname, '../burger-menu/menu.json');
console.log('📍 MENU_PATH RESOLVED TO:', MENU_PATH);

app.get('/api/menu', async (req, res) => {
    try {
        console.log('📖 Reading Menu from DB...');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        const menuDoc = await Menu.findOne();
        if (!menuDoc) return res.status(404).json({ error: 'Menu not found' });
        res.json(menuDoc.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read menu data' });
    }
});

app.post('/api/menu', authenticateToken, async (req, res) => {
    try {
        console.log('💾 Received Save Request');
        let data = req.body;
        if (!data) throw new Error('No data provided');

        // Auto-translation logic (Preserved during migration)
        try {
            // 1. Translate Promotions
            if (data.promotions && data.promotions.text && data.promotions.text.en) {
                if (!data.promotions.text.ar) {
                    try {
                        const res = await translate(data.promotions.text.en, { to: 'ar' });
                        data.promotions.text.ar = res.text;
                    } catch (e) { }
                }
                if (!data.promotions.text.tr) {
                    try {
                        const res = await translate(data.promotions.text.en, { to: 'tr' });
                        data.promotions.text.tr = res.text;
                    } catch (e) { }
                }
            }

            const categories = Object.keys(data);
            for (const cat of categories) {
                if (!Array.isArray(data[cat])) continue;

                for (let i = 0; i < data[cat].length; i++) {
                    const item = data[cat][i];

                    // Translate Name if missing
                    if (item.name && item.name.en) {
                        if (!item.name.ar || item.name.ar.trim() === '') {
                            try {
                                const res = await translate(item.name.en, { to: 'ar' });
                                item.name.ar = res.text;
                            } catch (e) { }
                        }
                        if (!item.name.tr || item.name.tr.trim() === '') {
                            try {
                                const res = await translate(item.name.en, { to: 'tr' });
                                item.name.tr = res.text;
                            } catch (e) { }
                        }
                    }

                    // Translate Description if present
                    if (item.description && item.description.en) {
                        if (!item.description.ar || item.description.ar.trim() === '') {
                            try {
                                const res = await translate(item.description.en, { to: 'ar' });
                                item.description.ar = res.text;
                            } catch (e) { }
                        }
                        if (!item.description.tr || item.description.tr.trim() === '') {
                            try {
                                const res = await translate(item.description.en, { to: 'tr' });
                                item.description.tr = res.text;
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (transError) {
            console.error('Auto-translation failed:', transError);
        }

        // Update Database
        await Menu.findOneAndUpdate({}, { data, lastUpdated: new Date() }, { upsert: true });

        // Update Local File (Source of Truth for Static Deployment)
        try {
            console.log(`📝 Writing to ${MENU_PATH}...`);
            await fs.writeFile(MENU_PATH, JSON.stringify(data, null, 4));
            console.log(`✅ SUCCESSFULLY Updated local menu.json at ${new Date().toISOString()}`);

            // TRIGGER DEPLOYMENT
            console.log('🚀 Triggering Deployment Script...');
            const deployScript = path.resolve(__dirname, '../burger-menu/force_update.bat');
            const { exec } = await import('child_process');
            exec(`"${deployScript}"`, { cwd: path.dirname(deployScript) }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Deployment Failed: ${error.message}`);
                    return;
                }
                console.log(`✅ Deployment Output: ${stdout}`);
            });

        } catch (fileErr) {
            console.error(`❌ FAILED to update/deploy menu.json at ${MENU_PATH}:`, fileErr);
            // Don't fail the request, just log it
        }

        res.json({ success: true, message: 'Saved to Database, File, & Cloud 🚀' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save menu data' });
    }
});

app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Missing text or targetLang' });
        }

        const result = await translate(text, { to: targetLang });
        res.json({ translation: result.text });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Ensure images directory exists
        const imagesDir = path.resolve(__dirname, '../burger-menu/images');
        await fs.mkdir(imagesDir, { recursive: true });

        // Generate unique filename
        const filename = `${path.parse(req.file.originalname).name}_${Date.now()}.webp`.replace(/\s+/g, '_');
        const outputPath = path.join(imagesDir, filename);

        // Process image (Resize and Convert to WebP)
        await sharp(req.file.path)
            .resize(1200, null, { withoutEnlargement: true }) // Max width 1200px
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Cleanup temp file
        await fs.unlink(req.file.path).catch(() => { });

        console.log(`✅ Image saved locally: ${outputPath}`);

        // Return path relative to menu.json (images/filename.webp)
        // usage in frontend: API_BASE + path, OR if in menu.json, direct static path
        res.json({ path: `images/${filename}` });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message });
});

// Handle React routing - LAST RESORT
app.get(/.*/, (req, res) => {
    // If it's a request for an image or menu that wasn't found, don't send index.html
    if (req.url.startsWith('/api/') || req.url.startsWith('/images/') || req.url.startsWith('/menu/')) {
        return res.status(404).send('Not Found');
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`LAN Access: http://<YOUR_IP>:${PORT}`);
});
