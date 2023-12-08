import React from 'react';
import "../../styles/travelPlanDetails.css"

const TravelPlanDetails = ({ travelPlan }) => {
    if (!travelPlan) {
        return <p>No travel plan available.</p>;
    }
    
    return (
        <div className="container-flex">
            <h4>Departure:</h4>
            <p className="travelPlanText">{travelPlan.startPoint}</p>
            <h4>Estimated Travel Time:</h4>
            <p className="travelPlanText">{travelPlan.timeCost} days</p>
            <h4>Created:</h4>
            <p className="travelPlanText">{new Date(travelPlan.createdAt).toLocaleString()}</p>
            {Object.entries(travelPlan.details).map(([day, activities], index) => (
                <div key={index} className="day-plan">
                    <h4 className="day">{day}</h4>
                    <h5 className="time">Morning:</h5>
                    <p className="activity">{activities.Morning || 'Not specified'}</p>
                    <h5 className="time">Afternoon:</h5>
                    <p className="activity">{activities.Afternoon || 'Not specified'}</p>
                    <h5 className="time">Evening:</h5>
                    <p className="activity">{activities.Evening || 'Not specified'}</p>
                </div>
            ))}
        </div>
    );
};

export default TravelPlanDetails;
