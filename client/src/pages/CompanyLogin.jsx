import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './CompanyLogin.module.css'; // We'll create this next

const CompanyLogin = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    
    // We will add these functions to AuthContext in Step 7
    const { companyLogin, companySignup, isAuthenticated } = useContext(AuthContext);

    const [loginData, setLoginData] = useState({
        userId: '',
        password: '',
    });
    const [signupData, setSignupData] = useState({
        userId: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    // Redirect if already logged in
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await companyLogin(loginData);
            // AuthState will handle the redirect
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (signupData.password !== signupData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        try {
            await companySignup(signupData);
            // AuthState will handle the redirect
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    const toggleView = (e) => {
        e.preventDefault();
        setError('');
        setIsLoginView(!isLoginView);
    };

    const renderLoginForm = () => (
        <div className={styles.authContainer}>
            <h2>Company Login</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleLoginSubmit}>
                <input
                    type="text"
                    name="userId"
                    placeholder="Enter your User ID"
                    value={loginData.userId}
                    onChange={handleLoginChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                />
                <button type="submit">Login</button>
                <div className={styles.linkContainer}>
                    <a href="#" onClick={toggleView}>Don't have an account? Sign Up</a>
                    <a href="/forgot-password">Forgot Password?</a>
                </div>
            </form>
        </div>
    );

    const renderSignupForm = () => (
        <div className={styles.authContainer}>
            <h2>Sign Up</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSignupSubmit}>
                <input
                    type="text"
                    name="userId"
                    placeholder="User ID"
                    value={signupData.userId}
                    onChange={handleSignupChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Company Email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                />
                <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={signupData.confirm_password}
                    onChange={handleSignupChange}
                    required
                />
                <button type="submit">Sign Up</button>
                <div className={styles.linkContainer}>
                    <a href="#" onClick={toggleView}>Already have an account? Login</a>
                </div>
            </form>
        </div>
    );

    return (
         <div className={styles.pageWrapper}>
            <div className={styles.mainContainer}>
                <div className={`${styles.imageSection} ${!isLoginView ? styles.order2 : styles.order1}`}>
                    <img 
                        src={isLoginView 
                            ? "https://plus.unsplash.com/premium_photo-1664476845274-27c2dabdd7f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RvY2slMjBtYXJrZXR8ZW58MHx8MHx8fDA%3D" 
                            : "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                        } 
                        alt="Business" 
                    />
                    <div className={styles.imageOverlay}></div>
                </div>
                <div className={`${styles.authContainerWrapper} ${!isLoginView ? styles.order1 : styles.order2}`}>
                    {isLoginView ? renderLoginForm() : renderSignupForm()}
                </div>
            </div>
        </div>
    );
};

export default CompanyLogin;