import React, { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import api from '../api/api';
import jwt_decode from 'jwt-decode';

// Cookie Helper Functions
const setCookie = (name, value, days = 1) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) return cookieValue;
    }
    return null;
};

const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Reducer function to manage auth state changes
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            setCookie('token', action.payload.token, 1); // Set cookie for 24 hours
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'USER_LOADED':
             return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            deleteCookie('token'); // Remove cookie on logout
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
            };
        default:
            return state;
    }
};


const AuthState = (props) => {
    // Try to get token from localStorage first, then cookie as fallback
    const getInitialToken = () => {
        return localStorage.getItem('token') || getCookie('token') || null;
    };

    const initialState = {
        token: getInitialToken(),
        isAuthenticated: null,
        loading: true,
        user: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Load User: Check if a token exists and is valid
    useEffect(() => {
        const token = getInitialToken();
        if (token) {
            // Sync localStorage and cookie
            localStorage.setItem('token', token);
            setCookie('token', token, 1);
            
            try {
                const decoded = jwt_decode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    dispatch({ type: 'LOGOUT' });
                } else {
                    dispatch({ type: 'USER_LOADED', payload: decoded.user });
                }
            } catch (error) {
                 dispatch({ type: 'AUTH_ERROR' });
            }
        } else {
            dispatch({ type: 'AUTH_ERROR' }); // This sets loading to false
        }
    }, []);


    // Login User
    const login = async (formData) => {
        try {
            const res = await api.post('/auth/login', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data, // Expects { token, user }
            });
            navigate('/dashboard'); // <-- FIX: This line is added back
        } catch (err) {
            // In a real app, you would dispatch an action to show an error message
            console.error(err.response.data.message);
            dispatch({ type: 'LOGIN_FAIL' });
        }
    };
    const signup = async (formData) => {
        try {
            const res = await api.post('/auth/signup', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
            });
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Signup failed';
            console.error(errorMsg);
            dispatch({ type: 'AUTH_ERROR' });
            throw new Error(errorMsg); // Throw so component can handle UI alert
        }
    };

    const companyLogin = async (formData) => {
        try {
            const res = await api.post('/auth/company/login', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data, // Expects { token, user }
            });
            navigate('/dashboard'); // Redirect to central dashboard
        } catch (err) {
            console.error(err.response?.data?.message);
            dispatch({ type: 'LOGIN_FAIL' });
            throw err; // Re-throw error for the component to catch
        }
    };

    // --- ADD THIS FUNCTION ---
    const companySignup = async (formData) => {
        try {
            const res = await api.post('/auth/company/signup', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data, // Expects { token, user }
            });
            navigate('/dashboard'); // Redirect to central dashboard
        } catch (err) {
            console.error(err.response?.data?.message);
            dispatch({ type: 'LOGIN_FAIL' });
            throw err; // Re-throw error for the component to catch
        }
    };
    const customerLogin = async (mobileNumber) => {
        try {
            const res = await api.post('/auth/customer/login', { mobileNumber });
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data, 
            });
            navigate('/customer/previouspurchases'); // Redirect immediately
        } catch (err) {
            console.error(err.response?.data?.message);
            // We throw the error so the Login Page can catch it and show the error message
            throw new Error(err.response?.data?.message || 'Login failed');
        }
    };

    // Logout User
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                login,
                signup,
                logout,
                companyLogin,
                companySignup,
                customerLogin,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthState;