import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './LoginPage.css'; // Make sure to create this file

const LoginPage = () => {
    const authContext = useContext(AuthContext);
    const { login, signup } = authContext;

    // State for toggling between Login and Signup
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    // Unified state for form inputs
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        email: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const { userId, password, email, confirmPassword } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on typing
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginMode) {
                // Handle Login
                if (!userId || !password) {
                    setError('Please fill in all fields');
                    return;
                }
                await login({ userId, password });
            } else {
                // Handle Signup
                if (!userId || !email || !password || !confirmPassword) {
                    setError('Please fill in all fields');
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await signup({ userId, email, password, confirmPassword });
            }
        } catch (err) {
            // Error is handled in context and thrown, we catch it here to set UI state
            setError(err.message);
        }
    };

    const toggleMode = (mode) => {
        setIsLoginMode(mode);
        setError('');
        // Optional: Reset form data on switch
        setFormData({ userId: '', password: '', email: '', confirmPassword: '' });
    };

    // Images from your EJS file
    const loginImage = "https://plus.unsplash.com/premium_photo-1664476845274-27c2dabdd7f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RvY2slMjBtYXJrZXR8ZW58MHx8MHx8fDA%3D";
    const signupImage = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

    return (
        <div className="login-page-body">
            <div className="main-container">
                {/* Dynamic Ordering: 
                   In EJS, you changed 'order' style. In React flexbox, 
                   we can control this via inline styles or classes based on state.
                */}
                <div 
                    className="image-section" 
                    style={{ order: isLoginMode ? 1 : 2 }}
                >
                    <img 
                        src={isLoginMode ? loginImage : signupImage} 
                        alt="Business Visual" 
                    />
                    <div className="image-overlay"></div>
                </div>

                <div 
                    className="auth-container"
                    style={{ order: isLoginMode ? 2 : 1 }}
                >
                    <div className="auth-form-wrapper">
                        <h2>{isLoginMode ? 'Employee Login' : 'Sign Up'}</h2>
                        
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={onSubmit}>
                            <input
                                type="text"
                                className="form-input"
                                name="userId"
                                value={userId}
                                onChange={onChange}
                                placeholder={isLoginMode ? "Enter your User ID" : "User ID"}
                                required
                            />
                            
                            {!isLoginMode && (
                                <input
                                    type="email"
                                    className="form-input"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    placeholder="Email"
                                    required
                                />
                            )}

                            <input
                                type="password"
                                className="form-input"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder={isLoginMode ? "Enter password" : "Password"}
                                required
                            />

                            {!isLoginMode && (
                                <input
                                    type="password"
                                    className="form-input"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    placeholder="Confirm Password"
                                    required
                                />
                            )}

                            <button type="submit" className="submit-btn">
                                {isLoginMode ? 'Login' : 'Sign Up'}
                            </button>

                            <div className="link-container">
                                {isLoginMode ? (
                                    <>
                                        <span onClick={() => toggleMode(false)}>
                                            Don't have an account? Sign Up
                                        </span>
                                        <a href="/forgot-password">Forgot Password?</a>
                                    </>
                                ) : (
                                    <span onClick={() => toggleMode(true)}>
                                        Already have an account? Login
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;