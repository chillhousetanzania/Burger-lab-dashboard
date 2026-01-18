import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Will be bcrypt hashed
}, { timestamps: true });

const menuSchema = new mongoose.Schema({
    data: { type: Object, required: true }, // Stores the entire menu object
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Menu = mongoose.model('Menu', menuSchema);
