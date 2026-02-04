
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Menu } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the ACTUAL source of truth (the static site's menu.json)
const MENU_JSON_PATH = path.resolve(__dirname, 'burger-menu/menu.json');

async function sync() {
    try {
        console.log('🔄 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        console.log(`📖 Reading Menu from: ${MENU_JSON_PATH}`);
        const rawData = await fs.readFile(MENU_JSON_PATH, 'utf-8');
        const jsonData = JSON.parse(rawData);

        console.log('💾 Updating Database...');
        // Updates the single document, or creates it if missing
        await Menu.findOneAndUpdate({}, { data: jsonData, lastUpdated: new Date() }, { upsert: true });

        console.log('✅ SYNC COMPLETE: Dashboard is now in sync with Menu JSON.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync Error:', error);
        process.exit(1);
    }
}

sync();
