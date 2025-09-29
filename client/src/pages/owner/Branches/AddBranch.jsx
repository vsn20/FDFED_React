import React, { useState } from 'react';
import api from '../../../api/api';

const AddBranch = ({ handleBack }) => {
    const [formData, setFormData] = useState({
        b_name: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/branches', {
                b_name: formData.b_name,
                address: formData.address
            });
            handleBack();
        } catch (err) {
            console.error("Error adding branch:", err);
        }
    };

    return (
        <div>
            <h2>Add Branch</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <h3>Branch Information</h3>
                    <div>
                        <label>Branch Name</label>
                        <input
                            type="text"
                            name="b_name"
                            value={formData.b_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <button type="submit">Submit Branch</button>
            </form>
        </div>
    );
};

export default AddBranch;