import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AddEmployee from './AddEmployee';
import EmployeeDetails from './EmployeeDetails';
import styles from './Employee.module.css'; // Import CSS module

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [addEmployee, setAddEmployee] = useState(false);
    const [singleEmployee, setSingleEmployee] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const handleAddEmployee = () => {
        setAddEmployee(true);
        setSingleEmployee(null);
    };

    const handleBack = () => {
        setAddEmployee(false);
        fetchEmployees();
        setSingleEmployee(null);
    };

    const handleRowClick = (e_id) => {
        setSingleEmployee(e_id);
        setAddEmployee(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Employee List</h1>
                {addEmployee && !singleEmployee && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <AddEmployee handleBack={handleBack} />
                    </>
                )}
                {singleEmployee && !addEmployee && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <EmployeeDetails e_id={singleEmployee} handleBack={handleBack} />
                    </>
                )}
                {!addEmployee && !singleEmployee && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddEmployee}>Add Employee</button>
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmployeesPage;