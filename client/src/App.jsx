//path: client/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import AuthState from './context/AuthState';

import PublicLayout from './components/layout/PublicLayout';
import PrivateLayout from './components/layout/PrivateLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CustomerLoginPage from './pages/CustomerLoginPage';
import PreviousPurchases from './pages/customer/PreviousPurchases';

import HomePage from './pages/HomePage';
import ContactUs from './pages/contactus';
import LoginPage from './pages/LoginPage';
import AboutUs from './pages/AboutUs'
import OwnerAnalyticsPage from './pages/owner/OwnerAnalyticsPage';
import EmployeesPage from './pages/owner/Employees/EmployeesPage';
import SalesmanAnalyticsPage from './pages/salesman/SalesmanAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import CompanyPage from './pages/owner/CompanyPage';
import BranchPage from './pages/owner/Branches/BranchPage';
import Admin_messages from './pages/owner/messages/OwnerMessages';
import Details from './pages/salesman/EmployeeDetails/Details';
import CompanyLogin from './pages/CompanyLogin';
import companyproducts from './pages/company/products/CompanyProducts';
import CompanyOrders from './pages/company/orders/CompanyOrders';
import CompanyComplaints from './pages/company/complaints/CompanyComplaints';

import CompanyAnalytics from './pages/company/CompanyAnalytics';
import OurBranches from './pages/OurBranches';
import ManagerEmployeesPage from './pages/manager/Employees/ManagerEmployeesPage';
import ManagerEmployeeDetails from './pages/manager/Employees/ManagerEmployeeDetails';
import ManagerProfileEdit from './pages/manager/Profile/ManagerProfileEdit';
import CompanyProducts from './pages/company/products/CompanyProducts';
import Companymessages from './pages/company/messages/Companymessages';
import Products from './pages/owner/Products/Products';
import Sales from './pages/salesman/SalesDetails/sales';
import Inventory from './pages/salesman/Inventory/Inventory';
import Salaries from './pages/salesman/SalariesFeature/Salaries';
import Reviews from './pages/customer/Reviews/Review';


import ManagerOrdersPage from './pages/manager/Orders/ManagerOrdersPage';
import ManagerOrderDetails from './pages/manager/Orders/ManagerOrderDetails';
import OwnerSales from './pages/owner/Sales/Sales';
import ManagerInventoryPage from './pages/manager/Inventory/ManagerInventoryPage';

import NewProducts from './pages/NewProducts';
import Complaints_Customer from './pages/customer/Complaints_Customer';

import Manager_Sales from './pages/manager/Sales/Manager_Sales';
import ManagerSalaryPage from './pages/manager/Salary/ManagerSalaryPage';
import AdminOrders from './pages/owner/Orders/AdminOrders';
import ManagerAnalyticsPage from './pages/manager/Analytics/ManagerAnalyticsPage';
import Admin_Inventory from './pages/owner/Inventory/Admin_Inventory';
import { Admin_salary } from './pages/owner/Salary/Admin_salary';
import { Admin_Profits } from './pages/owner/Profits/Admin_Profits';

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
        case 'customer':
            return <Navigate to="/customer/previouspurchases" />;
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
                        <Route path="/newproducts" element={<NewProducts />} />
                        <Route path="/login" element={<LoginPage />} /> 
                        <Route path="/our-branches" element={<OurBranches />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/companylogin" element={<CompanyLogin />} />
                        <Route path="/customerlogin" element={<CustomerLoginPage />} />
                        <Route path="/contact-us" element={<ContactUs/>} />

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
                        <Route path="/owner/products" element={<ProtectedRoute roles={['owner']}><Products /></ProtectedRoute>} />
                        <Route path="/owner/sales" element={<ProtectedRoute roles={['owner']}><OwnerSales/></ProtectedRoute>} />
                        <Route path="/owner/orders" element={<ProtectedRoute roles={['owner']}><AdminOrders /></ProtectedRoute>} />
                        <Route path="/owner/inventory" element={<ProtectedRoute roles={['owner']}><Admin_Inventory /></ProtectedRoute>} />
                        <Route path="/owner/salaries" element={<ProtectedRoute roles={['owner']}><Admin_salary /></ProtectedRoute>} />
                        <Route path="/owner/profits" element={<ProtectedRoute roles={['owner']}><Admin_Profits /></ProtectedRoute>} />
                        <Route path="/owner/messages" element={<ProtectedRoute roles={['owner']}><Admin_messages /></ProtectedRoute>} />

                        {/* Manager Routes */}
                        <Route path="/manager/employees" element={<ProtectedRoute roles={['manager']}><ManagerEmployeesPage /></ProtectedRoute>} /> 
                        <Route path="/manager/employees/:e_id" element={<ProtectedRoute roles={['manager']}><ManagerEmployeeDetails /></ProtectedRoute>} />
                        <Route path="/manager/profile" element={<ProtectedRoute roles={['manager']}><ManagerProfileEdit /></ProtectedRoute>} />
                        <Route path="/manager/orders" element={<ProtectedRoute roles={['manager']}><ManagerOrdersPage /></ProtectedRoute>} />
                        <Route path="/manager/orders/:id" element={<ProtectedRoute roles={['manager']}><ManagerOrderDetails /></ProtectedRoute>} />
                        <Route path='/manager/inventory' element={<ProtectedRoute roles={['manager']}><ManagerInventoryPage/></ProtectedRoute>} />
                        <Route path='/manager/sales' element={<ProtectedRoute roles={['manager']}><Manager_Sales/></ProtectedRoute>} />
                        <Route path="/manager/salary" element={ <ProtectedRoute roles={['manager']}><ManagerSalaryPage /></ProtectedRoute>} />
                        <Route path="/manager/analytics" element={<ProtectedRoute roles={['manager']}><ManagerAnalyticsPage /></ProtectedRoute>} />
                        {/* Salesman Routes */}
                        <Route path="/salesman/analytics" element={<ProtectedRoute roles={['salesman']}><SalesmanAnalyticsPage /></ProtectedRoute>} />
                        <Route path='/salesman/profile' element={<ProtectedRoute roles={['salesman']}><Details/></ProtectedRoute>} />
                        <Route path='/salesman/sales/*' element={<ProtectedRoute roles={['salesman']}><Sales/></ProtectedRoute>} />
                        <Route path='/salesman/inventory' element={<ProtectedRoute roles={['salesman']}><Inventory/></ProtectedRoute>} />
                        <Route path='/salesman/salaries' element={<ProtectedRoute roles={['salesman']}><Salaries/></ProtectedRoute>} /> 

                        <Route path="/company/analytics" element={
                            <ProtectedRoute roles={['company']}>
                               <CompanyAnalytics/>
                            </ProtectedRoute>
                        } />
                        <Route path="/company/products" element={
                            <ProtectedRoute roles={['company']}>
                                 <CompanyProducts/>
                            </ProtectedRoute>
                        } />
                        <Route path="/company/orders" element={
                            <ProtectedRoute roles={['company']}>
                                <CompanyOrders/>
                            </ProtectedRoute>
                        } />
                        <Route path="/company/complaints" element={
                            <ProtectedRoute roles={['company']}>
                                <CompanyComplaints/>
                                
                            </ProtectedRoute>
                        } />
                        <Route path="/company/messages" element={
                            <ProtectedRoute roles={['company']}>
                                <Companymessages/>
                            </ProtectedRoute>
                        } />

                        <Route path="/customer/previouspurchases" element={
                            <ProtectedRoute roles={['customer']}>
                                <PreviousPurchases />
                            </ProtectedRoute>
                        } />
                        <Route path="/customer/complaints" element={
                            <ProtectedRoute roles={['customer']}>
                                <Complaints_Customer />
                            </ProtectedRoute>
                        } />
                        <Route path="/customer/review" element={
                            <ProtectedRoute roles={['customer']}>
                                <Reviews />
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