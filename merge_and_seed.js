import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Menu } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. New Data from User
const newAdditions = {
    burgers: [
        {
            name: { en: "Mediterranean Burger", ar: "", tr: "" },
            price: "15000",
            priceDouble: "20000",
            calories: "650",
            image: "images/placeholder.webp",
            description: { en: "Ketchup, Mayonnaise, Pickles, Cheddar cheese, Pastrami, Lettuce, Tomato", ar: "", tr: "" }
        },
        {
            name: { en: "Lord of the Rings", ar: "", tr: "" },
            price: "18000",
            priceDouble: "23000",
            calories: "850",
            image: "images/placeholder.webp",
            description: { en: "Ranch sauce, BBQ sauce, Tomato slice, Lettuce, Cheddar cheese, 3 Onion Rings, 50g Beef Bacon", ar: "", tr: "" }
        },
        {
            name: { en: "Smoky Mushrooms", ar: "", tr: "" },
            price: "17000",
            priceDouble: "22000",
            calories: "780",
            image: "images/placeholder.webp",
            description: { en: "Smoky BBQ sauce, Lettuce, Cheddar cheese, Caramelized onion, Tomato slice, Crispy Bacon", ar: "", tr: "" }
        }
    ],
    chicken: [
        {
            name: { en: "Tandoori Chicken", ar: "", tr: "" },
            price: "14000",
            calories: "550",
            image: "images/placeholder.webp",
            description: { en: "Buffalo sauce, Grilled onion, Tomato, Lettuce, Cucumber", ar: "", tr: "" }
        },
        {
            name: { en: "Butter Chicken", ar: "", tr: "" },
            price: "15000",
            calories: "600",
            image: "images/placeholder.webp",
            description: { en: "Grilled chicken, Buffalo sauce, Lettuce, Tomato, Onion, Cheddar cheese, Coriander leaves", ar: "", tr: "" }
        },
        {
            name: { en: "Flaky Chicken", ar: "", tr: "" },
            price: "14500",
            calories: "620",
            image: "images/placeholder.webp",
            description: { en: "Fried chicken, Cheddar cheese, Fresh mushrooms, Beef bacon", ar: "", tr: "" }
        }
    ],
    sauces: [
        { name: { en: "Buffalo Sauce", ar: "", tr: "" }, price: "2000", calories: "50", image: "images/placeholder.webp", description: { en: "Spicy buffalo sauce", ar: "", tr: "" } },
        { name: { en: "BBQ Sauce", ar: "", tr: "" }, price: "2000", calories: "60", image: "images/placeholder.webp", description: { en: "Classic BBQ sauce", ar: "", tr: "" } },
        { name: { en: "Smoky BBQ Sauce", ar: "", tr: "" }, price: "2000", calories: "60", image: "images/placeholder.webp", description: { en: "Smoky flabour BBQ", ar: "", tr: "" } },
        { name: { en: "Ranch Sauce", ar: "", tr: "" }, price: "2000", calories: "120", image: "images/placeholder.webp", description: { en: "Creamy ranch", ar: "", tr: "" } },
        { name: { en: "Cheddar Cheese Sauce", ar: "", tr: "" }, price: "3000", calories: "150", image: "images/placeholder.webp", description: { en: "Melted cheddar cheese", ar: "", tr: "" } },
        { name: { en: "Thousands Island Sauce", ar: "", tr: "" }, price: "2000", calories: "100", image: "images/placeholder.webp", description: { en: "Classic dressing", ar: "", tr: "" } },
        { name: { en: "Texas Sauce", ar: "", tr: "" }, price: "2000", calories: "90", image: "images/placeholder.webp", description: { en: "Spicy Texas style", ar: "", tr: "" } },
        { name: { en: "Sriracha Sauce", ar: "", tr: "" }, price: "2000", calories: "30", image: "images/placeholder.webp", description: { en: "Hot chili sauce", ar: "", tr: "" } }
    ],
    sides: [
        { name: { en: "Caramelizsed Onions", ar: "", tr: "" }, price: "3000", calories: "80", image: "images/placeholder.webp", description: { en: "Sweet grilled onions", ar: "", tr: "" } },
        { name: { en: "Coleslaw", ar: "", tr: "" }, price: "4000", calories: "150", image: "images/placeholder.webp", description: { en: "Fresh cabbage slaw", ar: "", tr: "" } },
        { name: { en: "Onion Rings", ar: "", tr: "" }, price: "5000", calories: "300", image: "images/placeholder.webp", description: { en: "Crispy fried rings", ar: "", tr: "" } },
        { name: { en: "Buffalo Wings Fried", ar: "", tr: "" }, price: "12000", calories: "400", image: "images/placeholder.webp", description: { en: "Fried wings with buffalo sauce", ar: "", tr: "" } },
        { name: { en: "Fries", ar: "", tr: "" }, price: "5000", calories: "350", image: "images/placeholder.webp", description: { en: "Classic french fries", ar: "", tr: "" } },
        { name: { en: "Cheese Fries", ar: "", tr: "" }, price: "8000", calories: "500", image: "images/placeholder.webp", description: { en: "Fries topped with cheese", ar: "", tr: "" } },
        { name: { en: "Mozzarella Sticks", ar: "", tr: "" }, price: "10000", calories: "400", image: "images/placeholder.webp", description: { en: "Fried cheese sticks", ar: "", tr: "" } }
    ],
    // Ensure category settings for new categories exist
    categorySettings: {
        sauces: { color: "#C0392B", image: "images/banner_extras.webp" },
        sides: { color: "#27AE60", image: "images/banner_extras.webp" }
    }
};

async function mergeAndSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 2. Read Original Backup Data
        const menuPath = path.resolve(__dirname, 'burger-menu/menu.json');
        const rawData = await fs.readFile(menuPath, 'utf-8');
        const oldMenu = JSON.parse(rawData);

        console.log('Original menu loaded.');

        // 3. Merge Data
        // Merge Burgers
        if (oldMenu.burgers) {
            oldMenu.burgers.push(...newAdditions.burgers);
        } else {
            oldMenu.burgers = newAdditions.burgers;
        }

        // Merge Chicken
        if (oldMenu.chicken) {
            oldMenu.chicken.push(...newAdditions.chicken);
        } else {
            oldMenu.chicken = newAdditions.chicken;
        }

        // Add New Categories (Sauces, Sides) explicitly
        // If they already exist in oldMenu (unlikely based on file), strictly add
        // Since original file fetched in step 3337 doesn't have sauces/sides, we add them.
        oldMenu.sauces = newAdditions.sauces;
        oldMenu.sides = newAdditions.sides;

        // Merge Category Settings
        if (!oldMenu.categorySettings) oldMenu.categorySettings = {};
        // Add defaults for existing if missing
        if (!oldMenu.categorySettings.burgers) oldMenu.categorySettings.burgers = { color: "#A01E28", image: "images/banner_burgers.webp" };
        if (!oldMenu.categorySettings.chicken) oldMenu.categorySettings.chicken = { color: "#D97706", image: "images/banner_chicken.webp" };
        if (!oldMenu.categorySettings.extras) oldMenu.categorySettings.extras = { color: "#DC2626", image: "images/banner_extras.webp" };
        if (!oldMenu.categorySettings.drinks) oldMenu.categorySettings.drinks = { color: "#0891b2", image: "images/banner_drinks.webp" };

        // Add new settings
        Object.assign(oldMenu.categorySettings, newAdditions.categorySettings);

        // Ensure Promotions object logic matches schema requirements if any
        if (!oldMenu.promotions) oldMenu.promotions = { isActive: false, text: { en: '', ar: '', tr: '' }, billboards: [] };

        // 4. Update Database
        await Menu.deleteMany({}); // Clear the "New Only" mistake
        await Menu.create({ data: oldMenu });

        console.log('✅ Menu Restored and Merged Successfully!');
        console.log(`Total Burgers: ${oldMenu.burgers.length}`);
        console.log(`Total Chicken: ${oldMenu.chicken.length}`);
        console.log(`Sauces: ${oldMenu.sauces.length}`);
        console.log(`Sides: ${oldMenu.sides.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Merge Error:', error);
        process.exit(1);
    }
}

mergeAndSeed();
