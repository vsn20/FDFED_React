import React from 'react';
import SalaryList from './SalaryList';
import './AdminSalary.css';

export const Admin_salary = () => {
    return (
        <div className="admin-salary-container">
            <SalaryList />
        </div>
    );
};

export default Admin_salary;