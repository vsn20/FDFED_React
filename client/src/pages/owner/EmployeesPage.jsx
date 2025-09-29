import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        e_id: '',
        f_name: '',
        last_name: '',
        email: '',
        role: 'salesman', // default role
        phone_no: '',
        password: ''
    });

    const navigate = useNavigate();

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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employees', formData);
            // After successful submission:
            setShowAddForm(false); // Hide the form
            fetchEmployees(); // Refresh the employee list
             setFormData({ e_id: '', f_name: '', last_name: '', email: '', role: 'salesman', phone_no: '', password: '' }); // Clear form
        } catch (err) {
            console.error("Error adding employee:", err.response.data);
            alert('Failed to add employee. Check console for details.');
        }
    };

    const handleRowClick = (id) => {
        navigate(`/owner/employees/edit/${id}`);
    };


    return (
        <div>
            <h1>Manage Employees</h1>

            <button onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : 'Add Employee'}
            </button>

            {showAddForm && (
                <form onSubmit={handleSubmit} style={{ border: '1px solid black', padding: '10px', margin: '10px 0' }}>
                    <h2>Add New Employee</h2>
                    <input type="text" name="e_id" placeholder="Employee ID" value={formData.e_id} onChange={handleInputChange} required />
                    <input type="text" name="f_name" placeholder="First Name" value={formData.f_name} onChange={handleInputChange} required />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                    <input type="text" name="phone_no" placeholder="Phone Number" value={formData.phone_no} onChange={handleInputChange} />
                    <input type="password" name="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleInputChange} required />
                    <select name="role" value={formData.role} onChange={handleInputChange}>
                        <option value="salesman">Salesman</option>
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                    </select>
                    <button type="submit">Save Employee</button>
                </form>
            )}

            <h2>Employee List</h2>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.e_id} onClick={() => handleRowClick(emp.e_id)} style={{cursor: 'pointer'}}>
                            <td>{emp.e_id}</td>
                            <td>{emp.f_name}</td>
                            <td>{emp.last_name}</td>
                            <td>{emp.role}</td>
                            <td>{emp.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeesPage;
