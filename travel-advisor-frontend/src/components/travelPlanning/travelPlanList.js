import React, { useState, useEffect } from 'react';
import TravelPlanDetails from './travelPlanDetails';
import axios from 'axios';
import { refreshToken } from '../user/authService.js';

const TravelPlanList = ({ userData, setUserData }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [travelPlanData, setTravelPlanData] = useState([]);
    const [error, setError] = useState('');

    const TRAVELPLANNING_URL = process.env.REACT_APP_TRAVELPLANNING_URL;
    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Fetches and returns the details of a specific travel plan from the database.
    const fetchTravelPlanInfo = async (planId) => {
        try {
          const response = await axios.get(`${TRAVELPLANNING_URL}/plans/${planId}`);
          return response.data;
        } catch (error) {
          return null;
        }
    };
    
    // Fetch travel plan info for each plan in userData.travelPlans on component mount or when userData changes.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const planDataPromises = userData.travelPlans.map((planId) =>
                    fetchTravelPlanInfo(planId)
                );
                const planData = await Promise.all(planDataPromises);
                setTravelPlanData(planData);
            } catch (error) {
                setError('Error fetching travel plan info.');
            }
        };
      
        fetchData();
    }, [userData.travelPlans]);

    // Handles the deletion of a travel plan, including server communication and local state updates
    const handleDeleteTravelPlan = async (planId) => {
        try {
            setIsDeleting(true);
            // Delete the travel plan from the travel plan database
            await axios.delete(`${TRAVELPLANNING_URL}/plans/${planId}`);
            deleteTravelPlanFromUserAccount(planId);
            setIsDeleting(false);
        } catch (error) {
            setError('Error deleting travel plan. Please try again.');
            setIsDeleting(false);
        }
    };

    // Updates the user's account on the server to remove a deleted travel plan and updates local user data.
    const deleteTravelPlanFromUserAccount = async (planId) => {
        try {
            const updatedTravelPlans = userData.travelPlans.filter(id => id !== planId);
            // Delete the travel plan id from the user's account
            await axios.put(`${USERSERVICE_URL}/users/${userData.userId}/travelPlans`, {
                travelPlans: updatedTravelPlans
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUserData({ ...userData, travelPlans: updatedTravelPlans });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired
                await refreshToken();
            } else {
                setError('Error deleting travel plan from user accout. Please try again.');
            }
        }
    };

    return (
        <div className='container-flex mt-3'>
            <h3 className="mb-2">My Travel Plans</h3>
            {travelPlanData.map((plan, index) => (
                <div key={index}>
                    <p className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-outline-success"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${index}`}
                            aria-expanded="false"
                            aria-controls={`collapse${index}`}
                        >
                            Travel Plan #{index + 1}
                        </button>
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => handleDeleteTravelPlan(plan._id)}
                            disabled={isDeleting}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </p>
                    <div className="collapse mb-2" id={`collapse${index}`}>
                        <div className="card card-body">
                            <TravelPlanDetails travelPlan={plan} />
                        </div>
                    </div>
                </div>
            ))}
            {error && (
                <div id="travelPlanListError" className="alert alert-info">{error}</div>
            )}
        </div>
  );
};

export default TravelPlanList;
