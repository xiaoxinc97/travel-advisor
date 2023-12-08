import React, { createContext, useState } from 'react';
import axios from 'axios';

export const UserContext = createContext({
    userData: null,
    setUserData: () => {},
    spotIds: [],
    setSpotIds: () => {},
    isCity: true,
    setIsCity: () => {}
});

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [spotIds, setSpotIds] = useState([]);
    const [isCity, setIsCity] = useState(true);

    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Fetches user data from the server using the user ID and token, and updates the userData state
    const fetchUserData = async (userId, token) => {
        try {
            const response = await axios.get(`${USERSERVICE_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserData(response.data);
        } catch (error) {
            return;
        }
    };

    const contextValue = {
        userData,
        setUserData,
        spotIds,
        setSpotIds,
        isCity,
        setIsCity,
        fetchUserData
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
