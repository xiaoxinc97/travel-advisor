import React, { useState } from 'react';
import axios from 'axios';

const SignInModal = ({ show, handleClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Validates the username, makes a sign-in request, handles success by storing credentials 
    // and calling onLoginSuccess
    const handleSignIn = async () => {
        if (!username.trim()) {
            setErrorMessage('Username cannot be empty.');
            return;
        }
        try {
            // Make a POST request to the login endpoint
            const response = await axios.post(`${USERSERVICE_URL}/users/login`, { username, otp });
            const { token, userId } = response.data;
            // Store token and userId in local storage
            localStorage.setItem('token', token);
            onLoginSuccess(userId, token);
            handleModalClose();
        } catch (error) {
            setErrorMessage('Login failed, please try again.');
        }
    };

    // Resets the state of the modal inputs and error message
    const handleModalClose = () => {
        setUsername('');
        setOtp('');
        setErrorMessage('');
        handleClose();
    };

    return (
        <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sign In</h5>
                        <button type="button" className="btn-close" onClick={handleModalClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="signin-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="otp" className="form-label">Authentication Code</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleSignIn}>Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInModal;
