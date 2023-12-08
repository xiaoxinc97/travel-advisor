import express from 'express';
import axios from 'axios';
import OpenAIApi from "openai";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Spot } from '../models/spot.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const configuration = {
    apiKey: process.env.OpenAI_API_KEY,
};
const openai = new OpenAIApi(configuration);

const FSQ_API_KEY = process.env.FSQ_API_KEY;

const app = express();
app.use(cors());

const PORT = process.env.SPOTDISCOVERY_PORT;

// Generate a message for ChatGPT to fetch tourist spots in the specified city
async function fetchTouristSpotsFromChatGPT(cityName, preference) {
    let userPreference = preference ? `based on the user preference "${preference}" ` : "";
    let prompt = `Is ${cityName} recognized as a city? If no, reply in JSON format {"isCity": false}. Otherwise, list up to 12 most popular tourist spots in ${cityName} ${userPreference}in JSON format as follows: {"isCity": true, "spots": ["Spot 1", "Spot 2", ...]}.`;
    
    const completion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: prompt,
        max_tokens: 400,
        
    });
    return completion.choices[0]["text"];
}

// Fetch popular tourist spot names in a city
app.get('/popularSpotIn/:cityName/:preference?', async (req, res) => {
    const cityName = req.params.cityName.trim();
    const preference = req.params.preference;
    try {
        const spots = await fetchTouristSpotsFromChatGPT(cityName, preference);
        const spotsJson = JSON.parse(spots);
        res.json(spotsJson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tourist spots' });
    }
});

// Fetch detailed information of a spot
app.get('/spotInfo', async (req, res) => {
    const { spotName, cityName } = req.query;

    try {
        // Find all spots with the same name, case-insensitive
        const matchingSpots = await Spot.find({ 
            name: { $regex: new RegExp('^' + spotName.trim() + '$', 'i') }
        });

        // Filter by city name, case-insensitive
        let existingSpot = matchingSpots.find(spot => 
            spot.city.toLowerCase() === cityName.trim().toLowerCase());

        // If spot exists and it's older than 24 hours, update it
        if (existingSpot && new Date() - existingSpot.createdAt >= 24 * 60 * 60 * 1000) {
            const newSpotInfo = await fetchSpotDataFromFoursquare(spotName, cityName.trim());
            await Spot.findByIdAndUpdate(existingSpot._id, { ...newSpotInfo, createdAt: new Date() });
            return res.json({ spotId: existingSpot._id });
        }

        // Fetch new data from Foursquare if spot doesn't exist or is recent
        if (!existingSpot) {
            const newSpotInfo = await fetchSpotDataFromFoursquare(spotName, cityName.trim());
            // Create new spot if it doesn't exist in the database
            const newSpot = new Spot({ ...newSpotInfo, city: cityName.trim(), createdAt: new Date() });
            await newSpot.save();
            return res.json({ spotId: newSpot._id });
        }

        // If spot is recent, serve from the database
        return res.json({ spotId: existingSpot._id });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search result' });
    }
});


// Fetch detailed information of a spot from Foursquare
async function fetchSpotDataFromFoursquare(spotName, cityName) {
    const foursquareOptions = {
        method: 'GET',
        url: 'https://api.foursquare.com/v3/places/search',
        headers: {
            'accept': 'application/json',
            'Authorization': FSQ_API_KEY
        },
        params: {
            query: spotName,
            near: cityName,
            limit: 1,
            fields: 'fsq_id,location,name'
        }
    };

    try {
        const response = await axios(foursquareOptions);
        const places = response.data.results;

        if (!places || places.length === 0) {
            throw new Error('Spot not found');
        }

        const place = places[0];
        const fsq_id = place.fsq_id;

        const spotDetailsOptions = {
            method: 'GET',
            url: `https://api.foursquare.com/v3/places/${fsq_id}`,
            headers: {
                'accept': 'application/json',
                'Authorization': FSQ_API_KEY
            },
            params: {
                fields: 'description,website,hours,rating,price,photos,tips'
            }
        };

        const placeDetailsResponse = await axios(spotDetailsOptions);
        const placeDetails = placeDetailsResponse.data;
        const processedTips = placeDetails.tips ? placeDetails.tips.slice(0, 3).map(tip => tip.text) : [];

        return {
            name: place.name,
            description: placeDetails.description,
            address: place.location.formatted_address,
            city: place.location.locality,
            hours: placeDetails.hours.display,
            rating: placeDetails.rating,
            price: placeDetails.price,
            photo: placeDetails.photos[0],
            tips: processedTips,
            website: placeDetails.website
        };
    } catch (error) {
        throw error;
    }
}

// Fetch detailed information of a spot from the database
app.get('/spotDetails', async (req, res) => {
    const { spotId } = req.query;
    try {
        const spot = await Spot.findById(spotId);

        if (!spot) {
            return res.status(404).json({ error: 'Spot not found' });
        }

        res.json({ spotDetails: spot });

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve spot details' });
    }
});


app.listen(PORT, () => {
    console.log(`Tourist Spot Microservice running on port ${PORT}`);
});
