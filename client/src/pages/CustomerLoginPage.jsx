import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './CustomerLoginPage.css';

const CustomerLoginPage = () => {
    const { customerLogin } = useContext(AuthContext);

    const [step, setStep] = useState(1); // 1: Mobile Input, 2: OTP Input
    const [mobileNumber, setMobileNumber] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Handle Sending OTP
    const handleSendOtp = (e) => {
        e.preventDefault();
        setError('');

        const trimmedMobile = mobileNumber.trim();
        // Regex for 10 digit number
        if (!trimmedMobile.match(/^[0-9]{10}$/)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        // Generate Fake 6-digit OTP
        const randomOtp = Math.floor(100000 + Math.random() * 900000);
        setGeneratedOtp(randomOtp);
        
        // Simulate Network Delay and Show OTP
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            alert(`Your OTP is: ${randomOtp}`);
            console.log("Debug OTP:", randomOtp);
        }, 800);
    };

    // Step 2: Handle Verify & Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (parseInt(otpInput) !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            return;
        }

        setLoading(true);
        try {
            // Call the backend to check if number exists in Sales
            await customerLogin(mobileNumber);
            // Redirect is handled in AuthState or App.jsx logic
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setStep(1); // Reset to allow trying a different number
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-login-body">
            <div className="cl-main-container">
                {/* Left Side Image */}
                <div className="cl-image-section">
                    <img 
                        src="https://img.freepik.com/premium-vector/trendy-vector-design-secure-website_362714-3915.jpg?semt=ais_hybrid" 
                        alt="Customer Login" 
                    />
                    <div className="cl-image-overlay"></div>
                </div>
                
                {/* Right Side Form */}
                <div className="cl-auth-container">
                    <h2>Customer Login</h2>
                    
                    {error && <div className="cl-error-message">{error}</div>}

                    {step === 1 && (
                        <form className="cl-form" onSubmit={handleSendOtp}>
                            <input 
                                type="tel" 
                                className="cl-input"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="Enter your mobile number" 
                                required 
                                pattern="[0-9]{10}"
                            />
                            <button type="submit" className="cl-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form className="cl-form" onSubmit={handleLogin}>
                            <p>OTP sent to {mobileNumber}</p>
                            <input 
                                type="text" 
                                className="cl-input"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                placeholder="Enter 6-digit OTP" 
                                required 
                            />
                            <button type="submit" className="cl-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Login'}
                            </button>
                            
                            <div className="cl-change-number" onClick={() => { setStep(1); setError(''); }}>
                                Change Mobile Number
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerLoginPage;