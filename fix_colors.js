import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function fixColors() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        const data = menu.data;

        if (!data.categorySettings) data.categorySettings = {};

        // 1. Fix 'all' (Set to Brand Red or Remove to use CSS default)
        // Let's set it explicitly to Brand Red to be safe
        data.categorySettings.all = {
            id: 'all',
            title: 'ALL MENU',
            color: '#A01E28', // Brand Red
            image: "images/banner_all.webp"
        };

        // 2. Ensure Kids is Orange
        data.categorySettings.kids = {
            id: 'kids',
            title: 'KIDS MENU',
            color: '#FF9800', // Orange
            image: "images/banner_all.webp"
        };

        // 3. Ensure Burgers is Red
        data.categorySettings.burgers = {
            id: 'burgers',
            title: 'Burges',
            color: '#A01E28',
            image: "images/banner_burgers.png"
        };

        await Menu.updateOne({ _id: menu._id }, { data: data });
        console.log('✅ Colors reset: All=Red, Kids=Orange');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
fixColors();
