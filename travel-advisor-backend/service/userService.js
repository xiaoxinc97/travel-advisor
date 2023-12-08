import express from 'express';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, TempUser, cleanupUnverifiedUsers } from '../models/user.js';

dotenv.config();

const app = express();
const PORT = process.env.USER_PORT;

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

setInterval(cleanupUnverifiedUsers, 24 * 60 * 60 * 1000); // Cleanup every 24 hours

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to authenticate users by verifying JWT in the Authorization header
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
}

// Re-issue a new token with a new expiration time
app.post('/users/refresh-token', async (req, res) => {
    const { expiredToken } = req.body;

    jwt.verify(expiredToken, JWT_SECRET, { ignoreExpiration: true }, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Re-issue a new token
        const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: newToken });
    });
});


// Register new user and generate QR code for OTP
app.post('/users/register', async (req, res) => {
    const { username } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    let tempUser = await TempUser.findOne({ username });
    if (tempUser) {
        const otpUrl = authenticator.keyuri(username, 'TravelAdvisorApp', tempUser.totp_secret);
        const qrCodeUrl = await qrcode.toDataURL(otpUrl);
        return res.json({ qrCodeUrl });
    }

    const totp_secret = authenticator.generateSecret();
    const otpUrl = authenticator.keyuri(username, 'TravelAdvisorApp', totp_secret);
    const qrCodeUrl = await qrcode.toDataURL(otpUrl);

    tempUser = new TempUser({
        username,
        totp_secret,
        createdAt: new Date()
    });
    await tempUser.save();

    res.json({ qrCodeUrl });
});

// Validate OTP and complete registration
app.post('/users/validate-otp', async (req, res) => {
    const { username, otp } = req.body;

    const tempUser = await TempUser.findOne({ username });
    if (!tempUser) {
        return res.status(400).json({ error: 'Invalid request or user not found' });
    }

    if (authenticator.verify({ token: otp, secret: tempUser.totp_secret })) {
        const newUser = new User({
            username,
            created: new Date(),
            totp_secret: tempUser.totp_secret,
            favoriteSpots: [],
            travelPlans: []
        });

        const savedUser = await newUser.save();

        await TempUser.deleteOne({ username });
        // Issue a new token
        const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'User successfully registered', token, userId: savedUser._id });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

// Login user by validating OTP
app.post('/users/login', async (req, res) => {
    const { username, otp } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    if (authenticator.verify({ token: otp, secret: user.totp_secret })) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token, userId: user._id });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

// Retrieve user data based on userId
app.get('/users/:userId', authenticate, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId, '-totp_secret -__v');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const response = {
            userId: user._id,
            username: user.username,
            created: user.created,
            favoriteSpots: user.favoriteSpots,
            travelPlans: user.travelPlans
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update user's travel plans
app.put('/users/:userId/travelPlans', authenticate, async (req, res) => {
    const { userId } = req.params;
    const { travelPlans } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.travelPlans = travelPlans;
        await user.save();
        res.json({ message: 'Travel plans updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update user's favorite tourist spots
app.put('/users/:userId/favoriteSpots', authenticate, async (req, res) => {
    const { userId } = req.params;
    const { favoriteSpots } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.favoriteSpots = favoriteSpots;
        await user.save();
        res.json({ message: 'Favorite spots updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`User Account Microservice running on port ${PORT}`);
});
