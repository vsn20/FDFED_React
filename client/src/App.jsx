import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import AuthState from './context/AuthState';

import PublicLayout from './components/layout/PublicLayout';
import PrivateLayout from './components/layout/PrivateLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AboutUs from './pages/AboutUs'
import OwnerAnalyticsPage from './pages/owner/OwnerAnalyticsPage';
import EmployeesPage from './pages/owner/Employees/EmployeesPage';
import ManagerAnalyticsPage from './pages/manager/ManagerAnalyticsPage';
import SalesmanAnalyticsPage from './pages/salesman/SalesmanAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import CompanyPage from './pages/owner/CompanyPage';
import BranchPage from './pages/owner/Branches/BranchPage';
import Details from './pages/salesman/EmployeeDetails/Details';
import CompanyLogin from './pages/CompanyLogin';
import CompanyAnalytics from './pages/company/CompanyAnalytics';
// A small component to handle the initial redirect after login
const PostLoginRedirect = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Redirect based on role
    switch (user.role) {
        case 'owner':
            return <Navigate to="/owner/analytics" />;
        case 'manager':
            return <Navigate to="/manager/analytics" />;
        case 'salesman':
            return <Navigate to="/salesman/analytics" />;
        case 'company':
            return <Navigate to="/company/analytics" />;
        default:
            return <Navigate to="/login" />;
    }
};


function App() {
    return (
        <Router>
            <AuthState>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} /> 
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/companylogin" element={<CompanyLogin />} />
                    </Route>

                    {/* Redirect after login */}
                    <Route path="/dashboard" element={<ProtectedRoute><PostLoginRedirect /></ProtectedRoute>} />

                    {/* Private Routes */}
                    <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
                        {/* Owner Routes */}
                        <Route path="/owner/analytics" element={<ProtectedRoute roles={['owner']}><OwnerAnalyticsPage /></ProtectedRoute>} />
                        <Route path="/owner/employees" element={<ProtectedRoute roles={['owner']}><EmployeesPage /></ProtectedRoute>} />
                        <Route path="/owner/companies" element={<ProtectedRoute roles={['owner']}><CompanyPage /></ProtectedRoute>} />
                        <Route path="/owner/branches" element={<ProtectedRoute roles={['owner']}><BranchPage /></ProtectedRoute>} />
                        {/* Manager Routes */}
                        <Route path="/manager/analytics" element={<ProtectedRoute roles={['manager']}><ManagerAnalyticsPage /></ProtectedRoute>} />

                        {/* Salesman Routes */}
                        <Route path="/salesman/analytics" element={<ProtectedRoute roles={['salesman']}><SalesmanAnalyticsPage /></ProtectedRoute>} />
                        <Route path='/salesman/profile' element={<ProtectedRoute roles={['salesman']}><Details/></ProtectedRoute>} />

                        <Route path="/company/analytics" element={
                            <ProtectedRoute roles={['company']}>
                               <CompanyAnalytics/>
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthState>
        </Router>
    );
}

export default App;