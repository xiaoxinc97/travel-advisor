import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import FavoriteSpots from './favoriteSpots';
import TravelPlansList from './travelPlanList';
import CreateTravelPlan from './createTravelPlan.js';
import '../../styles/travelPlanning.css';

const TravelPlanning = () => {
    const { userData, setUserData } = useContext(UserContext);
    const [favoriteSpotsDetails, setFavoriteSpotsDetails] = useState([]);

    const SPOTDISCOVERY_URL = process.env.REACT_APP_SPOTDISCOVERY_URL;

    // Initializes fetching of favorite spots details when the component mounts or when userData updates.
    useEffect(() => {
        // Fetches detailed information for each of the user's favorite spots and updates state
        const fetchFavoriteSpotsDetails = async () => {
            if (userData && userData.favoriteSpots) {
                try {
                    const spotsDetailsPromises = userData.favoriteSpots.map(async (spotId) => {
                        try {
                            const response = await axios.get(`${SPOTDISCOVERY_URL}/spotDetails`, {
                                params: { spotId }
                            });
                            return response.data.spotDetails;
                        } catch (error) {
                            return null; 
                        }
                    });
    
                    const spotsDetails = await Promise.all(spotsDetailsPromises);
                    setFavoriteSpotsDetails(spotsDetails.filter(spot => spot !== null)); 
                } catch (error) {
                    return;
                }
            }
        };
    
        fetchFavoriteSpotsDetails();
    }, [userData]);
    

    return (
        <div className="travelPlanningContainer">
            {userData ? (
                <>
                    <FavoriteSpots favoriteSpotsDetails={favoriteSpotsDetails} />
                    <TravelPlansList userData={userData} setUserData={setUserData} />
                    <CreateTravelPlan favoriteSpotsDetails={favoriteSpotsDetails} />
                </>
            ) : (
                <p>Please log in to access travel planning features.</p>
            )}
        </div>
    );
};

export default TravelPlanning;
