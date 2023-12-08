import React from 'react';
import SpotPopover from './spotPopover';

const FavoriteSpots = ({ favoriteSpotsDetails }) => {
    if (favoriteSpotsDetails.length === 0) {
        return <p>No favorite spots added yet.</p>;
    }
    
    return (
        <div className="container-flex">
            <h3>Favorite Spots</h3>
            <div>
                {favoriteSpotsDetails.map(spot => (
                    <SpotPopover key={spot._id} spot={spot} />
                ))} 
            </div>
        </div>
    );
};

export default FavoriteSpots;
