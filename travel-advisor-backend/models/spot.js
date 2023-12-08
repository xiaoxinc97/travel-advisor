import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: String,
    city: String,
    hours: String,
    rating: Number,
    price: Number,
    photo: Object, 
    tips: [String],
    website: String,
    createdAt: { type: Date, default: Date.now }
});

export const Spot = mongoose.model('Spot', spotSchema);
