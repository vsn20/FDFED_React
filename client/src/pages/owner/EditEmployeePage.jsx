import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const EditEmployeePage = () => {
    const { id } = useParams(); // Gets the employee ID from the URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        e_id: id,
        f_name: '',
        last_name: '',
        email: '',
        role: '',
        phone_no: '',
    });

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/employees/${id}`);
                setFormData({
                    e_id: res.data.e_id,
                    f_name: res.data.f_name,
                    last_name: res.data.last_name,
                    email: res.data.email,
                    role: res.data.role,
                    phone_no: res.data.phone_no || '',
                });
            } catch (err) {
                console.error("Error fetching employee data:", err);
            }
        };

        fetchEmployee();
    }, [id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/employees/${id}`, formData);
            alert('Employee updated successfully!');
            navigate('/owner/employees'); // Go back to the employee list
        } catch (err) {
            console.error("Error updating employee:", err.response.data);
            alert('Failed to update employee.');
        }
    };

    return (
        <div>
            <h1>Edit Employee: {formData.f_name} {formData.last_name}</h1>
            <form onSubmit={handleSubmit}>
                <p>Employee ID: {formData.e_id} (cannot be changed)</p>
                
                <label>First Name:</label>
                <input type="text" name="f_name" value={formData.f_name} onChange={handleInputChange} required />
                
                <label>Last Name:</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                
                <label>Phone Number:</label>
                <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} />
                
                <label>Role:</label>
                <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="salesman">Salesman</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                </select>
                
                <button type="submit">Save Changes</button>
            </form>
            <button onClick={() => navigate('/owner/employees')}>Back to List</button>
        </div>
    );
};

export default EditEmployeePage;
