import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const authContext = useContext(AuthContext);
    const { login, isAuthenticated } = authContext;
    const navigate = useNavigate();

    const [user, setUser] = useState({
        userId: '',
        password: '',
    });

    const { userId, password } = user;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard'); // If already logged in, redirect
        }
    }, [isAuthenticated, navigate]);

    const onChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        if (userId === '' || password === '') {
            alert('Please fill in all fields');
        } else {
            login({
                userId,
                password,
            });
        }
    };

    return (
        <div>
            <h1>Account Login</h1>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="userId">User ID (e.g., employee ID)</label>
                    <input type="text" name="userId" value={userId} onChange={onChange} required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required />
                </div>
                <input type="submit" value="Login" />
            </form>
        </div>
    );
};

export default LoginPage;
