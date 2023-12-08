import axios from "axios";

// Requests a new authentication token using the expired token and updates it in localStorage
const refreshToken = async () => {
    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;
    try {
        const currentToken = localStorage.getItem('token');
        const response = await axios.post(`${USERSERVICE_URL}/users/refresh-token`, 
            { expiredToken: currentToken }
        );

        if (response.status >= 200 && response.status < 300) {
            const data = response.data;
            localStorage.setItem('token', data.token);
            return data.token; // Return the new token
        } else {
            alert('Unable to refresh session. Please log in again.');
        }
    } catch (error) {
        alert('An error occurred. Please try log in again.');
    }
};

export { refreshToken };
