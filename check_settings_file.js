import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';
import fs from 'fs';

dotenv.config();

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        fs.writeFileSync('settings.txt', JSON.stringify(menu.data.categorySettings, null, 2));
        console.log("Wrote settings.txt");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkSettings();
