import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';
import api from '../../../api/api';
import ManagerAddEmployee from './ManagerAddEmployee';
import styles from './Details.module.css';

const ManagerEmployeesPage = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [manager, setManager] = useState(null);
    const [addSalesman, setAddSalesman] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
        fetchManagerProfile();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/manager/employees');
            console.log('Received employees in frontend:', res.data.map(e => ({ e_id: e.e_id, status: e.status }))); 
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const fetchManagerProfile = async () => {
        try {
            const res = await api.get('/manager/employees/me');
            setManager(res.data);
        } catch (err) {
            console.error("Error fetching manager profile:", err);
        }
    };

    const handleAddSalesman = () => {
        setAddSalesman(true);
    };

    const handleBackFromAdd = () => {
        setAddSalesman(false);
        fetchEmployees();
    };

    const handleRowClick = (e_id) => {
        navigate(`/manager/employees/${e_id}`);
    };

    if (!user || user.role !== 'manager') {
        return <div>Access denied.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>All Salesmen in Your Branch ({manager?.bid || 'Not Assigned'})</h1>
                
                {/* Add Salesman Form */}
                {addSalesman && (
                    <ManagerAddEmployee handleBack={handleBackFromAdd} manager={manager} />
                )}

                {/* Salesmen Table */}
                {!addSalesman && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddSalesman}>Add Salesman</button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Employee ID</th>
                                        <th className={styles.th}>First Name</th>
                                        <th className={styles.th}>Last Name</th>
                                        <th className={styles.th}>Role</th>
                                        <th className={styles.th}>Branch ID</th>
                                        <th className={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee._id} className={styles.tr} onClick={() => handleRowClick(employee.e_id)}>
                                            <td className={styles.td} data-label="Employee ID">{employee.e_id}</td>
                                            <td className={styles.td} data-label="First Name">{employee.f_name}</td>
                                            <td className={styles.td} data-label="Last Name">{employee.last_name}</td>
                                            <td className={styles.td} data-label="Role">{employee.role}</td>
                                            <td className={styles.td} data-label="Branch ID">{employee.bid || 'Not Assigned'}</td>
                                            <td className={styles.td} data-label="Status">{employee.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {employees.length === 0 && <p>No salesmen assigned to your branch.</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManagerEmployeesPage;