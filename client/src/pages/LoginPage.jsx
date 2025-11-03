import React, { useState, useContext } from 'react'; // <-- useEffect is removed
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const authContext = useContext(AuthContext);
    const { login } = authContext; // <-- isAuthenticated is removed
    const navigate = useNavigate();

    const [user, setUser] = useState({
        userId: '',
        password: '',
    });

    const { userId, password } = user;

    // FIX: The useEffect hook that was here is now REMOVED.

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