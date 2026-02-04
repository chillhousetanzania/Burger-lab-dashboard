
import fs from 'fs/promises';
import { translate } from 'google-translate-api-x';
import mongoose from 'mongoose'; // Optional if we just want to update file, but let's do both
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MENU_PATH_DASHBOARD = path.resolve(__dirname, 'burger-menu/menu.json');
const MENU_PATH_WEBSITE = 'd:/websites/burger-menu/menu.json'; // Hardcoded for certainty

async function fixTranslations() {
    try {
        console.log(`📖 Reading menu.json from: ${MENU_PATH_DASHBOARD}`);
        const raw = await fs.readFile(MENU_PATH_DASHBOARD, 'utf-8');
        let menuData = JSON.parse(raw);
        let changed = false;

        const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

        // Helper to translate
        async function translateText(text, to) {
            try {
                if (!text || !text.trim()) return '';
                // Avoid translating if already looks like target (rough check)
                if (to === 'ar' && isArabic(text)) return text;

                const res = await translate(text, { to });
                return res.text;
            } catch (e) {
                console.error(`❌ Failed to translate "${text}" to ${to}:`, e.message);
                return '';
            }
        }

        console.log('🌍 Starting translation audit...');

        const processItem = async (item, context) => {
            // Translate Name
            if (item.name && item.name.en) {
                if (!item.name.ar || item.name.ar.trim() === '') {
                    console.log(`   Translating Name [AR]: ${item.name.en}`);
                    item.name.ar = await translateText(item.name.en, 'ar');
                    changed = true;
                }
                if (!item.name.tr || item.name.tr.trim() === '') {
                    console.log(`   Translating Name [TR]: ${item.name.en}`);
                    item.name.tr = await translateText(item.name.en, 'tr');
                    changed = true;
                }
            }

            // Translate Description
            if (item.description && item.description.en) {
                if (!item.description.ar || item.description.ar.trim() === '') {
                    console.log(`   Translating Desc [AR]: ${item.description.en.substring(0, 20)}...`);
                    item.description.ar = await translateText(item.description.en, 'ar');
                    changed = true;
                }
                if (!item.description.tr || item.description.tr.trim() === '') {
                    console.log(`   Translating Desc [TR]: ${item.description.en.substring(0, 20)}...`);
                    item.description.tr = await translateText(item.description.en, 'tr');
                    changed = true;
                }
            }
        };

        // 1. Promotions
        if (menuData.promotions && menuData.promotions.text && menuData.promotions.text.en) {
            if (!menuData.promotions.text.ar) {
                menuData.promotions.text.ar = await translateText(menuData.promotions.text.en, 'ar');
                changed = true;
            }
            if (!menuData.promotions.text.tr) {
                menuData.promotions.text.tr = await translateText(menuData.promotions.text.en, 'tr');
                changed = true;
            }
        }

        // 2. Categories
        const categories = Object.keys(menuData).filter(k => k !== 'promotions' && k !== 'categorySettings');
        for (const cat of categories) {
            if (Array.isArray(menuData[cat])) {
                console.log(`📂 Processing Category: ${cat}`);
                for (const item of menuData[cat]) {
                    await processItem(item, cat);
                }
            }
        }

        // 3. Category Settings Titles
        if (menuData.categorySettings) {
            for (const catKey in menuData.categorySettings) {
                const settings = menuData.categorySettings[catKey];
                // Ensure titles object exists
                if (!settings.titles) settings.titles = { en: catKey }; // Default to key

                const enTitle = settings.titles.en || catKey;

                if (!settings.titles.ar) {
                    console.log(`   Translating Category Title [AR]: ${enTitle}`);
                    settings.titles.ar = await translateText(enTitle, 'ar');
                    changed = true;
                }
                if (!settings.titles.tr) {
                    console.log(`   Translating Category Title [TR]: ${enTitle}`);
                    settings.titles.tr = await translateText(enTitle, 'tr');
                    changed = true;
                }
            }
        }

        if (changed) {
            console.log('💾 Saving updated menu.json...');
            console.log(`💾 Saving to DASHBOARD: ${MENU_PATH_DASHBOARD}`);
            await fs.writeFile(MENU_PATH_DASHBOARD, JSON.stringify(menuData, null, 4));

            console.log(`💾 Saving to WEBSITE: ${MENU_PATH_WEBSITE}`);
            await fs.writeFile(MENU_PATH_WEBSITE, JSON.stringify(menuData, null, 4));

            console.log('✅ Translation Fix Complete & Synced!');
        } else {
            console.log('✨ No missing translations found.');
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

fixTranslations();
