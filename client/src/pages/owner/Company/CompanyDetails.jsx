import React, { useState, useEffect } from 'react';
import api from '../../../api/api'; // Assuming api is in this location

const CompanyDetails = ({ id,handleback }) => {
    const [formdata, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });

    // Fetch details when the component mounts or the id prop changes
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const res = await api.get(`/companies/${id}`);
                setFormData(res.data);
            } catch (error) {
                console.log('Error fetching company details:', error);
                alert('Failed to fetch company details. Please try again.');
            }
        };

        if (id) {
            fetchCompanyDetails();
        }
    }, [id]); // Dependency array ensures this runs if the id changes

    // Update state as the user types in the form
    const handleChange = (e) => {
        setFormData({
            ...formdata,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission to save changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use a PUT or PATCH request to update the data
            await api.put(`/companies/${id}`, formdata);
           handleback();
        } catch (error) {
            console.error('Error updating company details:', error);
            alert('Failed to update details. Please try again.');
        }
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '400px',
        margin: '20px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px'
    };

    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h2>Edit Company Details</h2>
            <div style={inputGroupStyle}>
                <label>Company ID</label>
                <input
                    value={id}
                    disabled
                />
                </div>
            <div style={inputGroupStyle}>
                <label htmlFor="cname">Company Name</label>
                <input
                    type="text"
                    id="cname"
                    name="cname"
                    value={formdata.cname}
                    onChange={handleChange}
                    required
                />
            </div>
            <div style={inputGroupStyle}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formdata.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div style={inputGroupStyle}>
                <label htmlFor="phone">Phone</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formdata.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            <div style={inputGroupStyle}>
                <label htmlFor="address">Address</label>
                <textarea
                    id="address"
                    name="address"
                    value={formdata.address}
                    onChange={handleChange}
                    rows="3"
                    required
                />
            </div>
            <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                Save Changes
            </button>
        </form>
    );
};

export default CompanyDetails;