import React, { useState, useContext } from 'react';
import axios from 'axios';
import TravelPlanDetails from './travelPlanDetails';
import { UserContext} from '../../context/userContext';
import { refreshToken } from '../user/authService.js';

const CreateTravelPlan = ({ favoriteSpotsDetails }) => {
    const [startPoint, setStartPoint] = useState('');
    const [timeCost, setTimeCost] = useState('');
    const [selectedSpots, setSelectedSpots] = useState([]);
    const [travelPlan, setTravelPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { userData, setUserData } = useContext(UserContext);

    const TRAVELPLANNING_URL = process.env.REACT_APP_TRAVELPLANNING_URL;
    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Toggles the selection status of a spot in the selected spots session.
    const toggleSpotSelection = (spotId) => {
        if (selectedSpots.includes(spotId)) {
            setSelectedSpots(selectedSpots.filter(id => id !== spotId));
        } else {
            setSelectedSpots([...selectedSpots, spotId]);
        }
    };

    // Fetches a travel plan based on the selected spots, start point, and time cost
    const handleFetchTravelPlan = async () => {
        setIsLoading(true);
        setError('');
        setTravelPlan(null);
        
        const value = parseInt(timeCost, 10);
        if (isNaN(value) || value < 1 || value > 10) {
            setIsLoading(false);
            setError('Please enter a valid time between 1 and 10 days.');
            return; 
        }
        try {
            // Prepare the spots data in the required format
            const spotsArray = selectedSpots.map(spotId => {
                const spot = favoriteSpotsDetails.find(s => s._id === spotId);
                return spot ? { city: spot.city, name: spot.name } : null;
            }).filter(spot => spot !== null);
    
            const spotsData = {};
            spotsArray.forEach(spot => {
                if (!spotsData[spot.city]) {
                    spotsData[spot.city] = [];
                }
                spotsData[spot.city].push(spot.name);
            });
            // Fetch the travel plan
            const response = await axios.post(`${TRAVELPLANNING_URL}/plans/createTravelGuide`, {
                startPoint,
                spots: spotsData,
                timeCost
            });
            if (response.data.isValidAddress) {
                let travelPlanDetails = {
                    timeCost: timeCost,
                    startPoint: startPoint,
                    spots: selectedSpots,
                    details: response.data.travelGuide,
                    createdAt: new Date()
                };
                setTravelPlan(travelPlanDetails);
                setIsLoading(false);
                setError('');
            } else {
                setError('Invalid start point address. Please try again.');
                setIsLoading(false);
            }
        } catch (error) {
            setError('Failed to fetch travel guide. Please try again.');
            setIsLoading(false);
        }
    };
      
    // Saves the travel plan to the database and adds it to the user's account
    const handleSaveTravelPlan = async () => {
        try {
            const requestBody = {
                timeCost: travelPlan.timeCost,
                startPoint: travelPlan.startPoint,
                spots: travelPlan.spots,
                details: travelPlan.details
            };
            const response = await axios.post(`${TRAVELPLANNING_URL}/plans`, requestBody);
            const { planId } = response.data;
            await addNewTravelPlantoUserAccount(planId);
            return planId;
        } catch (error) {
            setError('Error saving travel plan. Please try again.')
        }
    };

    // Adds the travel plan to the user's account
    const addNewTravelPlantoUserAccount = async (planId) => {
        try {
            const updatedTravelPlans = [...userData.travelPlans, planId];
            await axios.put(`${USERSERVICE_URL}/users/${userData.userId}/travelPlans`, {
                travelPlans: updatedTravelPlans
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUserData({ ...userData, travelPlans: updatedTravelPlans });
            handleCloseTravelPlan();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired
                await refreshToken();
            }
            else {
                setError('Error updating user account with new travel plan.')
            }
        }
    };
    
    // Closes the travel plan creation session
    const handleCloseTravelPlan = () => {
        setStartPoint('');
        setTimeCost('');
        setSelectedSpots([]);
        setTravelPlan(null);
        setIsCreating(false);
        setError('');
    };

    return (
        <div className="container-flex mt-3">
            {isCreating ? (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Create a Travel Plan</h3>
                        <button className="btn btn-secondary" onClick={handleCloseTravelPlan}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className='form-floating mb-3'>
                        <input 
                            type="text" 
                            className="form-control"
                            id="startPointAddress"
                            value={startPoint} 
                            onChange={(e) => setStartPoint(e.target.value)}
                        />
                        <label htmlFor="startPointAddress">Departure Address</label>
                    </div>
                    <div className='form-floating mb-3'>
                        <input 
                            type="number" 
                            className="form-control"
                            id="timeCost"
                            value={timeCost} 
                            onChange={(e) => setTimeCost(e.target.value)}
                        />
                        <label htmlFor="timeCost">Estimated Travel Time (days)</label>
                    </div>
                    {/* selected spots session */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4>Selected Spots :</h4>
                            <button className="btn btn-primary m-2" onClick={handleFetchTravelPlan}>Generate Travel Plan</button>
                        </div>
                        <div>
                            {favoriteSpotsDetails.map(spot => (
                                <button className="btn btn-outline-secondary btn-sm m-1"
                                    key={spot._id} 
                                    onClick={() => toggleSpotSelection(spot._id)}>
                                    {spot.name}
                                    {selectedSpots.includes(spot._id) && <i className="fa-solid fa-check ms-1"></i>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading && (
                        <>
                            <div className="alert alert-info">
                                It may takes about 15 seconds to generate the travel plan
                            </div>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </>
                    )}

                    {!isLoading && travelPlan && (
                        <>
                            <TravelPlanDetails travelPlan={travelPlan} />
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <button className="btn btn-primary m-2" onClick={handleSaveTravelPlan}>Save</button>
                            </div>
                        </>
                    )}

                    {!isLoading && error && (
                        <div id="createTravelPlanError" className="alert alert-info">{error}</div>
                    )}

                </>) : (
                    <button className="btn btn-primary" onClick={() => {setIsCreating(true);}}>
                        <i className="fa-solid fa-plus"></i>
                    </button>
            )}
        </div>
    );
};

export default CreateTravelPlan;
