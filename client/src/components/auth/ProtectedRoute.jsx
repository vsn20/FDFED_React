import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    let location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If the route requires specific roles, check if the user has one of them
    if (roles && !roles.includes(user.role)) {
        // User is logged in but does not have the required role,
        // redirect them to a generic dashboard or an "unauthorized" page.
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
