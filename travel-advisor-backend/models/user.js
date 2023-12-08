import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    created: Date,
    totp_secret: String,
    favoriteSpots: Array,
    travelPlans: Array
});

export const User = mongoose.model('User', userSchema);

const tempUserSchema = new mongoose.Schema({
    username: String,
    totp_secret: String,
    createdAt: Date
});

export const TempUser = mongoose.model('TempUser', tempUserSchema);

// Function to cleanup unverified users
export async function cleanupUnverifiedUsers() {
    const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = new Date();
    await TempUser.deleteMany({ createdAt: { $lt: new Date(now - CLEANUP_THRESHOLD) } });
}
