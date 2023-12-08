import React, { useEffect } from 'react';
import "../../styles/popover.css";

const SpotPopover = ({ spot }) => {
    // Initializes a popover for the spot when the component mounts or the spot changes.
    useEffect(() => {
        const popoverTrigger = document.querySelector(`#popover-${spot._id}`);
        if (popoverTrigger) {
            new window.bootstrap.Popover(popoverTrigger, {
                html: true,
                title: spot.name,
                content: getPopoverContent(spot),
                trigger: 'focus'
            });
        }
    }, [spot]);

    // Generates and returns the HTML content for the popover based on the details of the spot.
    const getPopoverContent = (details) => {
        let content = `<div style="margin-bottom: 10px;">`;
        if (details.photo) {
            const imageUrl = `${details.photo.prefix}240x200${details.photo.suffix}`;
            content += `<img src="${imageUrl}" alt="Spot Image">`;
        }
        content += `<p className="popover-content"><i class="fas fa-map-marker-alt"></i> ${details.address}</p>`;
        if (details.price_level != null && details.price_level !== undefined) {
            content += `<p className="popover-content"><i class="fas fa-dollar-sign"></i> Price Level: ${details.price_level}</p>`;
        }
        if (details.rating) {
            content += `<p className="popover-content"><i class="fas fa-star"></i> Rating: ${details.rating}</p>`;
        }
        if (details.price) {
            content += `<p className="popover-content"><i class="fas fa-money-bill-wave"></i> Price: ${details.price}</p>`;
        }
        if (details.hours) {
            content += `<p className="popover-content"><i class="fas fa-clock"></i> Opening hours: <br>${details.hours.replace(/;/g, '<br>')}</p>`;
        }
        if (details.description) {
            content += `<p className="popover-content"><i class="fas fa-align-left"></i> Description: ${details.description}</p>`;
        }
        if (details.tips && details.tips.length > 0) {
            content += '<div className="popover-content"><i class="fas fa-comments"></i> Reviews:<br>';
            details.tips.forEach((tip, index) => {
                content += `<p className="popover-conntent">${tip}</p>`;
            });
            content += '</div>';
        }
        if (details.website) {
            content += `<p className="popover-content"><a href="${details.website}" class="card-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-globe"></i> ${details.website}</a></p>`;
        }
        content += `</div>`;
        return content;
    };

    return (
        <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm m-1" 
            id={`popover-${spot._id}`}
            data-bs-toggle="popover" 
            data-bs-placement="bottom" 
        >
            {spot.name}
        </button>
    );
};

export default SpotPopover;
