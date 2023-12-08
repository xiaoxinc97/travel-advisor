import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext} from '../../context/userContext';
import '../../styles/userProfile.css'
import { refreshToken } from '../user/authService.js';

const UserProfile = ({ onLogout, show, handleClose }) => {
    const offcanvasClass = show ? "offcanvas offcanvas-end show" : "offcanvas offcanvas-end";
    const { userData, setUserData } = useContext(UserContext);
    const [favoriteSpotDetails, setFavoriteSpotDetails] = useState([]);
    const [error, setError] = useState('');

    const SPOTDISCOVERY_URL = process.env.REACT_APP_SPOTDISCOVERY_URL;
    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Fetches detailed information about the user's favorite spots and updates the state
    useEffect(() => {
        const fetchFavoriteSpots = async () => {
            if (!userData || userData.favoriteSpots.length === 0) {
                setFavoriteSpotDetails([]);
                return;
            }

            try {
                const spotDetails = await Promise.all(userData.favoriteSpots.map(spotId =>
                    axios.get(`${SPOTDISCOVERY_URL}/spotDetails`, {
                        params: { spotId }})));
                setFavoriteSpotDetails(spotDetails.map(res => res.data.spotDetails));
                setError('');
            } catch (error) {
                setError('Error fetching favorite spots.');
            }
        };

        fetchFavoriteSpots();
    }, [userData]);
    
    // Removes a spot from the user's favorites, updates the user data in the backend and local state
    const handleRemoveFavorite = async (spotId) => {
        try {
            const updatedFavorites = userData.favoriteSpots.filter(id => id !== spotId);
            await axios.put(`${USERSERVICE_URL}/users/${userData.userId}/favoriteSpots`, { favoriteSpots: updatedFavorites }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setUserData({ ...userData, favoriteSpots: updatedFavorites });
            setError('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired
                await refreshToken();
            } else {
                setError('Error removing favorite spots. Please try again.');
            }
        }
    };

    return (
        <div className={offcanvasClass} tabIndex="-1" id="userProfileOffcanvas" aria-labelledby="userProfileLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title menuTitle" id="userProfileLabel">User Profile</h5>
                <button type="button" className="btn-close" onClick={handleClose} data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div>
                    <p className="profileText"><strong>Username:</strong> {userData.username}</p>
                    <p className="profileText"><strong>Created Date:</strong> {new Date(userData.created).toLocaleDateString()}</p>
                </div>

                <div className="mt-3">
                    <p className="profileText"><strong>Favorite Spots:</strong></p>
                    <ul className="list-group">
                        {favoriteSpotDetails.map(spot => (
                            <li key={spot._id} className="list-group-item d-flex justify-content-between align-items-center">
                                {spot.name}
                                <button type="button" className="btn-close" onClick={() => handleRemoveFavorite(spot._id)} aria-label="Close"></button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-4">
                    <button className="btn btn-secondary" onClick={onLogout}>Log Out</button>
                </div>
                {error && (
                    <div id="travelPlanListError" className="alert alert-info mt-3">{error}</div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
