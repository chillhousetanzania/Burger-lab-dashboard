
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Schema (Simplified)
const menuSchema = new mongoose.Schema({
    data: Object,
    lastUpdated: Date
});
const Menu = mongoose.model('Menu', menuSchema);

// Path to Source of Truth
const MENU_PATH = path.resolve(__dirname, '../burger-menu/menu.json');

async function sync() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        console.log(`📂 Reading Menu File: ${MENU_PATH}`);
        const fileContent = await fs.readFile(MENU_PATH, 'utf-8');
        const menuData = JSON.parse(fileContent);

        console.log('💾 Updating Database...');
        await Menu.findOneAndUpdate({}, { data: menuData, lastUpdated: new Date() }, { upsert: true });

        console.log('🎉 SUCCESS: Database synced with File Source of Truth.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Sync Failed:', error);
        process.exit(1);
    }
}

sync();
