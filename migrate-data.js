import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User, Menu } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MENU_PATH = path.resolve(__dirname, '../burger-menu/menu.json');

async function migrate() {
    try {
        console.log('--- Phase 2: Data Migration Audit ---');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // 1. Initial Admin User (if not exists)
        const existingUser = await User.findOne({ username: 'admin' });
        if (!existingUser) {
            console.log('Creating initial admin user...');
            const hashedPassword = await bcrypt.hash('admin', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword
            });
            console.log('✅ Initial admin user created (Username: admin, Password: admin)');
            console.log('⚠️ Reminder: Client can change this later in settings.');
        } else {
            console.log('Admin user already exists.');
        }

        // 2. Menu Data Migration
        try {
            const data = await fs.readFile(MENU_PATH, 'utf-8');
            const menuObject = JSON.parse(data);

            // Upsert the menu document (we only keep one main configuration)
            await Menu.findOneAndUpdate(
                {},
                { data: menuObject, lastUpdated: new Date() },
                { upsert: true, new: true }
            );
            console.log('✅ Menu data migrated from menu.json to MongoDB.');
        } catch (fsError) {
            console.warn('Could not read local menu.json, skipping menu migration.', fsError.message);
        }

        await mongoose.disconnect();
        console.log('Data Migration: SUCCESS');
        process.exit(0);
    } catch (err) {
        console.error('Data Migration: FAILED');
        console.error(err);
        process.exit(1);
    }
}

migrate();
