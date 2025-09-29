import React, { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import api from '../api/api';
import jwt_decode from 'jwt-decode';

// Reducer function to manage auth state changes
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
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
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Load User: Check if a token exists and is valid
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
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
            navigate('/dashboard'); // Redirect to central dashboard after login
        } catch (err) {
            // In a real app, you would dispatch an action to show an error message
            console.error(err.response.data.message);
            dispatch({ type: 'LOGIN_FAIL' });
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
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthState;
