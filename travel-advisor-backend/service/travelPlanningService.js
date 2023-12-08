import express from 'express';
import OpenAIApi from "openai";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { TravelPlan } from '../models/plan.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const configuration = {
    apiKey: process.env.OpenAI_API_KEY,
};
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());

const PORT = process.env.TRAVELPLANNING_PORT;

app.use(express.json());

// Retrieve a specific travel plan by planId
app.get('/plans/:planId', async (req, res) => {
    const { planId } = req.params;
    try {
        const plan = await TravelPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Store a new travel plan in the database
app.post('/plans', async (req, res) => {
    const { timeCost, startPoint, spots, details } = req.body;
    try {
        const newPlan = new TravelPlan({
            timeCost,
            startPoint,
            spots,
            details
        });
        await newPlan.save();
        res.json({ planId: newPlan._id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a specific travel plan by planId
app.delete('/plans/:planId', async (req, res) => {
    const { planId } = req.params;
    try {
        const deletedPlan = await TravelPlan.findByIdAndDelete(planId);
        if (!deletedPlan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        res.json({ message: 'Travel plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate a travel guide from chatGPT
app.post('/plans/createTravelGuide', async (req, res) => {
    const { startPoint, spots, timeCost } = req.body;

    const spotToVisit = Object.entries(spots)
        .map(([city, spotNames]) => `${spotNames.join(', ')} in ${city}`)
        .join(', ');

        let prompt = `Is "${startPoint}" a valid address? If no, reply in JSON format  {"isValidAddress": false}.Otherwise, given the start point "${startPoint}", the spots to visit "${spotToVisit}", estimated travel time "${timeCost} day(s)", provide a about ${timeCost * 50} words travel guide in strict JSON format only. If "${startPoint}" is valid, the response should be in the following format: {"isValidAddress": true, "travelGuide": {"Day 1": {"Morning": "activity", "Afternoon": "activity", "Evening": "activity"}, ...}}`;
    
    try {
        const completion = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 2000,
        });

        const responseText = completion.choices[0]["text"];
        const jsonStartIndex = responseText.indexOf('{');
        const jsonResponse = jsonStartIndex !== -1 ? responseText.substring(jsonStartIndex) : '{"isValidAddress": false}';
        const travelGuide = JSON.parse(jsonResponse);
        return res.json(travelGuide);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create travel guide' });
    }
});



app.listen(PORT, () => {
    console.log(`Travel Planning is running on ${PORT}`);
});
