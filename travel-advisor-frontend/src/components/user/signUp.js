import React, { useState } from 'react';
import axios from 'axios';

const SignUpModal = ({ show, handleClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);

    const USERSERVICE_URL = process.env.REACT_APP_USERSERVICE_URL;

    // Initiates the user registration process, sending the username and handling QR code retrieval for OTP setup.
    const handleSignUp = async () => {
        if (!username.trim()) {
            setErrorMessage('Username cannot be empty.');
            return;
        }
        try {
            const response = await axios.post(`${USERSERVICE_URL}/users/register`, { username });
            setQrCodeUrl(response.data.qrCodeUrl);
            setIsCodeSent(true);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Registration failed, please try again.');
        }
    };

    // Validates the entered OTP, handles successful registration by storing credentials and invoking onLoginSuccess
    const handleValidateOtp = async () => {
        try {
            const response = await axios.post(`${USERSERVICE_URL}/users/validate-otp`, { username, otp });
            const { token, userId } = response.data;
            // Store token and userId in local storage
            localStorage.setItem('token', token);
            onLoginSuccess(userId, token);
            resetModal();
            handleClose();
        } catch (error) {
            setErrorMessage('Invalid authentication code. Please try again.');
        }
    };

    // Resets the state of the modal inputs and error message
    const resetModal = () => {
        setUsername('');
        setOtp('');
        setQrCodeUrl('');
        setErrorMessage('');
        setIsCodeSent(false);
    };

    // Resets the modal state and closes the modal
    const handleModalClose = () => {
        resetModal();
        handleClose();
    };

    return (
        <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sign Up</h5>
                        <button type="button" className="btn-close" onClick={handleModalClose}></button>
                    </div>
                    <div className="modal-body">
                        {!isCodeSent ? (
                            <>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <button type="button" className="btn btn-primary mb-3" onClick={handleSignUp}>Sign Up</button>
                            </>
                        ) : (
                            <>
                                <p>Scan the QR code with your TOTP app and enter the code below:</p>
                                <div className="text-center">
                                    <img src={qrCodeUrl} alt="QR Code" className="mb-3"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="otp" className="form-label">Authentication Code</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <button type="button" className="btn btn-primary mb-3" onClick={handleValidateOtp}>Validate</button>
                            </>
                        )}
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpModal;
