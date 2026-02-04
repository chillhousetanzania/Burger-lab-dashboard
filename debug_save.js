
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Mock environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const PORT = process.env.PORT || 5174;
const JWT_SECRET = process.env.JWT_SECRET || 'burger-secret-key';
const API_URL = `http://localhost:${PORT}/api/menu`;

async function testSave() {
    console.log('🔑 Generating Test Admin Token...');
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Token Generated.');

    console.log('📤 Sending POST request to update Promotions...');

    // Minimal payload to enable promotion
    const payload = {
        promotions: {
            isActive: true,
            text: { en: "DEBUG CAMPAIGN ACTIVE", ar: "", tr: "" },
            billboards: []
        },
        categorySettings: {}, // Required to prevent crash
        // Include minimal other data to pass validation if any
        burgers: []
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`📥 Response Status: ${response.status}`);
        console.log(`📥 Response Body: ${text}`);

        if (response.ok) {
            console.log('🎉 SUCCESS: API accepted the save!');
        } else {
            console.error('❌ FAILURE: API rejected the save.');
        }

    } catch (error) {
        console.error('❌ NETWORK ERROR:', error.message);
    }
}

testSave();
