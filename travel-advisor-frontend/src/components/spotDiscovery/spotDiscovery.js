import React, { useState, useContext } from 'react';
import axios from 'axios';
import SpotCard from './spotCard'; 
import '../../styles/spotCard.css';
import '../../styles/spotDiscovery.css';
import { UserContext} from '../../context/userContext';

const SpotDiscovery = () => {
    const [cityName, setCityName] = useState('');
    const [preference, setPreference] = useState('');
    const [error, setError] = useState('');
    const { spotIds, setSpotIds, isCity, setIsCity } = useContext(UserContext);

    const SPOTDISCOVERY_URL = process.env.REACT_APP_SPOTDISCOVERY_URL;

    // Initiates a search for popular spots based on the entered city and preference
    const handleSearch = async () => {
        try {
            const response = await axios.get(`${SPOTDISCOVERY_URL}/popularSpotIn/${cityName}${preference ? `/${preference}` : ''}`);
            if (response.data.isCity) {
                setIsCity(true);
                setError('');

                // Fetch spotIds for each spotName
                const spotPromises = response.data.spots.map(async (name) => {
                    try {
                        const spotResponse = await axios.get(`${SPOTDISCOVERY_URL}/spotInfo`, {
                            params: { cityName, spotName: name }
                        });
                        return spotResponse.data.spotId;
                    } catch (err) {
                        return null; // Return null or a specific error indicator if a request fails
                    }
                });

                const spotIds = (await Promise.all(spotPromises)).filter(id => id !== null);
                setSpotIds(spotIds);
            } else {
                setIsCity(false);
                setError('Oops! No popular spots found for the entered city. Please try again.');
            }
        } catch (error) {
            setIsCity(false);
            setError('Network error or server issue. Unable to fetch popular spots. Please try again later.');
            setSpotIds([]);
        }
    };


    return (
        <div className="spotDiscoveryContainer">
            {/* input for city name */}
            <div className="input-group mb-3">
                <input 
                    type="text" 
                    className="form-control"
                    value={cityName} 
                    onChange={(e) => setCityName(e.target.value)} 
                    placeholder="Enter City Name"
                />
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>
            {/* input for preference */}
            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control"
                    value={preference} 
                    onChange={(e) => setPreference(e.target.value)} 
                    placeholder="Enter Preference (optional)"
                />
            </div>
            {error && <div className="alert alert-primary">{error}</div>}
            {/* spot cards */}
            <div className="spotCardsContainer">
                {isCity && spotIds.map((spotId) => (
                    <div className="spotCard" key={spotId}>
                        <SpotCard 
                            spotId={spotId} 
                            setError={setError}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpotDiscovery;
