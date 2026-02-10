import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const API_BASE_URL = 'http://localhost:5001/api';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Steps: 'identifier' (enter email/id) -> 'reset' (enter otp/new password)
    const [step, setStep] = useState('identifier'); 
    
    // Form States
    const [identifierType, setIdentifierType] = useState('user_id');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);

    // Images
    const img1 = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60";
    const img2 = "https://plus.unsplash.com/premium_photo-1664476845274-27c2dabdd7f0?w=600&auto=format&fit=crop&q=60";

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!identifier.trim()) {
            setMessage('Please enter a User ID or Email ID.');
            setMessageType('error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, type: identifierType }),
            });
            
            const data = await response.json();

            if (data.success) {
                setMessage('OTP sent successfully!');
                setMessageType('success');
                // Small delay to show success message before switching views
                setTimeout(() => {
                    setStep('reset');
                    setMessage('');
                    setMessageType('');
                }, 1000);
            } else {
                setMessage(data.message || 'Failed to send OTP');
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Server error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp,
                    newPassword,
                    confirmPassword,
                    identifier, // We need to send this back to know WHO we are resetting
                    type: identifierType
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Password reset successfully! Redirecting...');
                setMessageType('success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage(data.message || 'Failed to reset password');
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Server error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-body">
            <div className="fp-main-container">
                
                {/* Image Section - order changes based on step to mimic animation */}
                <div className="fp-image-section" style={{ order: step === 'identifier' ? 1 : 2 }}>
                    <img src={step === 'identifier' ? img1 : img2} alt="Visual" />
                    <div className="fp-image-overlay"></div>
                </div>

                <div className="fp-auth-container" style={{ order: step === 'identifier' ? 2 : 1 }}>
                    
                    {/* STEP 1: SEND OTP */}
                    {step === 'identifier' && (
                        <div>
                            <h2>Forgot Password</h2>
                            <form onSubmit={handleSendOtp}>
                                <div className="fp-radio-group">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="identifierType" 
                                            value="user_id" 
                                            checked={identifierType === 'user_id'}
                                            onChange={(e) => setIdentifierType(e.target.value)}
                                        /> User ID
                                    </label>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="identifierType" 
                                            value="email" 
                                            checked={identifierType === 'email'}
                                            onChange={(e) => setIdentifierType(e.target.value)}
                                        /> Email ID
                                    </label>
                                </div>

                                <div className="fp-form-group">
                                    <label>
                                        {identifierType === 'user_id' ? 'User ID' : 'Email ID'}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="fp-input"
                                        placeholder={`Enter your ${identifierType === 'user_id' ? 'User ID' : 'Email ID'}`}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required 
                                    />
                                </div>

                                {message && <div className={`fp-message ${messageType}`}>{message}</div>}

                                <button type="submit" className="fp-btn" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                            <div className="fp-back-link">
                                <span onClick={() => navigate('/login')}>Back to Login</span>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: RESET PASSWORD */}
                    {step === 'reset' && (
                        <div>
                            <h2>Reset Password</h2>
                            <form onSubmit={handleResetPassword}>
                                <div className="fp-form-group">
                                    <label>OTP</label>
                                    <input 
                                        type="text" 
                                        className="fp-input"
                                        placeholder="Enter the OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div className="fp-form-group">
                                    <label>New Password</label>
                                    <input 
                                        type="password" 
                                        className="fp-input"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div className="fp-form-group">
                                    <label>Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className="fp-input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                    />
                                </div>

                                {message && <div className={`fp-message ${messageType}`}>{message}</div>}

                                <button type="submit" className="fp-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Submit'}
                                </button>
                            </form>
                            <div className="fp-back-link">
                                <span onClick={() => setStep('identifier')}>Back to Forgot Password</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;