import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../styles/spotCard.css';
import { UserContext} from '../../context/userContext';
import { refreshToken } from '../user/authService.js';

const SpotCard = ({ spotId, setError }) => {
    const [spotInfo, setSpotInfo] = useState(null);
    const [isValid, setIsValid] = useState(true);
    const [showOpeningHours, setShowOpeningHours] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const { userData, setUserData } = useContext(UserContext);
    
    const SPOTDISCOVERY_URL = process.env.REACT_APP_SPOTDISCOVERY_URL;
    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Check and update the 'isFavorite' state based on user's favorite spots
    useEffect(() => {
        if (userData && userData.favoriteSpots.includes(spotId)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [spotId, userData]);

    // Fetches spot info from the database when the component mounts or the 'spotId' changes.
    useEffect(() => {
        const fetchSpotInfo = async () => {
            try {
                const response = await axios.get(`${SPOTDISCOVERY_URL}/spotDetails`, {
                    params: { spotId }});
                if (response.data && response.data.spotDetails) {
                    setSpotInfo(response.data.spotDetails);
                } else {
                    setIsValid(false);
                }
            } catch (error) {
                setIsValid(false);
            }
        };
    
        fetchSpotInfo();
    }, [spotId]);

    // Toggles the favorite status of a spot for the user and updates it both locally and in the backend.
    const handleFavoriteClick = async () => {
        if (!userData) {
            setError('Please login to add favorites.');
            return;
        }

        try {
            let updatedFavorites;
            const isAlreadyFavorite = userData.favoriteSpots.includes(spotId);

            if (isAlreadyFavorite) {
                updatedFavorites = userData.favoriteSpots.filter(favoriteId => favoriteId !== spotId);
            } else {
                updatedFavorites = [...userData.favoriteSpots, spotId];
            }

            // Update favorite spots in the backend
            await axios.put(`${USERSERVICE_URL}/users/${userData.userId}/favoriteSpots`, { favoriteSpots: updatedFavorites }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            // Update local user data
            setUserData({ ...userData, favoriteSpots: updatedFavorites });
            setIsFavorite(!isFavorite);
            setError('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired
                await refreshToken();
            } else {
                setError('Error adding favorite spots. Please try again.');
            }
        }
    };

    // Returns null if the spot is not valid, rendering nothing
    if (!isValid) {
        return null; 
    }

    // Displays a loading spinner while spot information is being fetched
    if (!spotInfo) {
        return (
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    // Formats and displays the opening hours of the spot.
    const displayHours = () => {
        return spotInfo.hours.split(';').map((time, index) => (
            <p key={index} className="card-text">{time.trim()}</p>
        ));
    }

    const imageUrl = spotInfo.photo ? `${spotInfo.photo.prefix}original${spotInfo.photo.suffix}` : '';

    return (
        <div className="card mb-3">
            {imageUrl && <img src={`${imageUrl}`} alt={spotInfo.name} className="card-img-top" />}
            
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    {/* spot name */}
                    <h5 className="card-title">{spotInfo.name}</h5>
                    <button className="btn" onClick={handleFavoriteClick}>
                        <i className={isFavorite ? "fas fa-heart text-danger" : "far fa-heart text-danger"}></i>
                    </button>
                </div>
                {/* spot address */}
                <p className="card-text cardCustom"><i className="fas fa-map-marker-alt"></i> {spotInfo.address}</p>
                {/* spot rating */}
                {spotInfo.rating && <p className="card-text cardCustom"><i className="fas fa-star"></i> Rating: {spotInfo.rating}</p>}
                {/* price level */}
                {spotInfo.price && <p className="card-text cardCustom"><i className="fas fa-money-bill-wave"></i> Price Level: {spotInfo.price}</p>}
                {/* opening hours */}
                {spotInfo.hours && (
                    <>
                        <div className="d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-clock"></i> Opening hours: </span>
                            <button className="btn btn-link" onClick={() => setShowOpeningHours(!showOpeningHours)}>
                                {showOpeningHours ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
                            </button>
                        </div>
                        {showOpeningHours && displayHours()}
                    </>
                )}
                {/* spot description */}
                {spotInfo.description && (
                    <>
                        <div className="d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-align-left"></i> Description: </span>
                            <button className="btn btn-link" onClick={() => setShowDescription(!showDescription)}>
                                {showDescription ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
                            </button>
                        </div>
                        {showDescription && <p className="card-text">{spotInfo.description}</p>}
                    </>
                )}
                {/* spot reviews */}
                {spotInfo.tips && spotInfo.tips.length > 0 && (
                    <>
                        <div className="d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-comments"></i> Reviews: </span>
                            <button className="btn btn-link" onClick={() => setShowReviews(!showReviews)}>
                                {showReviews ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
                            </button>
                        </div>
                        {showReviews && (
                            <div className="review-section">
                                {spotInfo.tips.map((tip, index) => (
                                    <p key={index} style={{
                                        borderBottom: index < spotInfo.tips.length - 1 ? '1px solid #ddd' : '',
                                        paddingBottom: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        {tip}
                                    </p>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {/* spot website */}
                {spotInfo.website && (
                    <div className="mt-2 cardCustom">
                        <a href={spotInfo.website} className="card-link" target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-globe"></i> {spotInfo.website}
                        </a>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SpotCard;
