import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserContext } from './context/userContext';
import SpotDiscovery from './components/spotDiscovery/spotDiscovery.js';
import TravelPlanning from './components/travelPlanning/travelPlanning.js';
import SignInModal from './components/user/signIn';
import SignUpModal from './components/user/signUp';
import UserProfile from './components/user/userProfile.js';
import './styles/App.css';

function App() {
    const { userData, setUserData, fetchUserData } = useContext(UserContext);

    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showOffcanvasMenu, setShowOffcanvasMenu] = useState(false);

    // Toggles the visibility of the user profile offcanvas and closes the menu offcanvas if open
    const handleToggleUserProfileOffcanvas = () => {
        setShowOffcanvas(!showOffcanvas);
        if (showOffcanvasMenu) {
            setShowOffcanvasMenu(false);
        }
    };

    // Toggles the visibility of the menu offcanvas and closes the user profile offcanvas if open
    const handleToggleMenuOffcanvas = () => {
        setShowOffcanvasMenu(!showOffcanvasMenu);
        if (showOffcanvas) {
            setShowOffcanvas(false);
        }
    };

    // Handles user login success by setting local storage items and fetching user data
    const handleLoginSuccess = (userId, token) => {
        localStorage.setItem('token', token);
        fetchUserData(userId, token);
    };

    // Clears user data from local storage and state, and hides the user profile offcanvas
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserData(null);
        setShowOffcanvas(false);
    };

    return (
        <Router>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        onClick={handleToggleMenuOffcanvas}
                        aria-controls="offcanvasNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <Link className="navbar-brand title" to="/">Travel Advisor</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link subtitle" to="/spot-discovery">Spot Discovery</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link subtitle" to="/travel-planning">Travel Planning</Link>
                            </li>
                        </ul>
                        {userData ? (
                            <button type="button" className="btn btn-info subtitle userButton" onClick={handleToggleUserProfileOffcanvas}>
                                {userData.username}
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-outline-primary me-2 subtitle" onClick={() => setShowSignInModal(true)}>Sign In</button>
                                <button className="btn btn-outline-success subtitle" onClick={() => setShowSignUpModal(true)}>Sign Up</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Offcanvas component for small screens */}
            <div className={`offcanvas offcanvas-start ${showOffcanvasMenu ? 'show' : ''}`} tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title menuTitle" id="offcanvasNavbarLabel">Menu</h5>
                    <button type="button" className="btn-close" onClick={handleToggleMenuOffcanvas} aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link menuText" to="/spot-discovery" onClick={handleToggleMenuOffcanvas}>Spot Discovery</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link menuText" to="/travel-planning" onClick={handleToggleMenuOffcanvas}>Travel Planning</Link>
                        </li>
                        {userData ? (
                            <li className="nav-item">
                                <button className="btn nav-link menuText" onClick={handleToggleUserProfileOffcanvas}>Profile</button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <button className="btn nav-link menuText" onClick={() => setShowSignInModal(true)}>Sign In</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn nav-link menuText" onClick={() => setShowSignUpModal(true)}>Sign Up</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <div className="container-fluid mt-4">
                <Routes>
                    <Route path="/spot-discovery" element={<SpotDiscovery />} />
                    <Route path="/travel-planning" element={<TravelPlanning />} />
                    <Route path="/" element={<SpotDiscovery />} /> 
                </Routes>
            </div>

            <SignInModal 
                show={showSignInModal} 
                handleClose={() => setShowSignInModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
            <SignUpModal 
                show={showSignUpModal} 
                handleClose={() => setShowSignUpModal(false)}
                onLoginSuccess={handleLoginSuccess} 
            />
            {userData && (
                <UserProfile 
                    onLogout={handleLogout} 
                    show={showOffcanvas}
                    handleClose={handleToggleUserProfileOffcanvas}
                />
            )}
        </Router>
    );
}

export default App;
