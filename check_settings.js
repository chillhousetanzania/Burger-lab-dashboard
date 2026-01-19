import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        console.log(JSON.stringify(menu.data.categorySettings, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkSettings();
