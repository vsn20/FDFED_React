import React, { useState } from 'react';
import api from '../../../api/api';
const AddCompany = () => {
    // State to hold the form data
    const [formData, setFormData] = useState({
        cname: '',
        email: '',
        phone: '',
        address: ''
    });

    // A single handler to update the state for any form field change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handler for form submission
    const handleSubmit = async(e) => {
        e.preventDefault(); // Prevents the default page reload on form submission
        
        // TODO: Add your API call logic here to send the data to the server
        console.log('Submitting Company Data:', formData);
        try {
            await api.post('/companies', formData);
            setFormData({
            cname: '',
            email: '',
            phone: '',
            address: ''
        });
        } catch (error) {
            console.log('Error submitting company data:', error);
            alert('Failed to add company. Please try again.');
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
            <h2>Add New Company</h2>
            <div style={inputGroupStyle}>
                <label htmlFor="cname">Company Name</label>
                <input
                    type="text"
                    id="cname"
                    name="cname"
                    value={formData.cname}
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
                    value={formData.email}
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
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            <div style={inputGroupStyle}>
                <label htmlFor="address">Address</label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                Save Company
            </button>
        </form>
    );
};

export default AddCompany;