import mongoose from 'mongoose';

const travelPlanSchema = new mongoose.Schema({
    timeCost: Number,
    startPoint: String,
    spots:  Array,
    details: Object,
    createdAt: { type: Date, default: Date.now }
});

export const TravelPlan = mongoose.model('TravelPlan', travelPlanSchema);
