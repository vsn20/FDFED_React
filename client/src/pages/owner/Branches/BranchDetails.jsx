import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

const BranchDetails = ({ bid, handleBack }) => {
    const [formData, setFormData] = useState({
        bid: '',
        b_name: '',
        manager_name: '',
        manager_email: '',
        manager_ph_no: '',
        address: ''
    });
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                const res = await api.get(`/branches/${bid}`);
                setFormData({
                    bid: res.data.bid,
                    b_name: res.data.b_name,
                    manager_name: res.data.manager_name,
                    manager_email: res.data.manager_email,
                    manager_ph_no: res.data.manager_ph_no,
                    address: res.data.location
                });
            } catch (err) {
                console.error("Error fetching branch:", err);
                setNotFound(true);
            }
        };
        fetchBranch();
    }, [bid]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/branches/${bid}`, {
                b_name: formData.b_name,
                address: formData.address
            });
            handleBack();
        } catch (err) {
            console.error("Error updating branch:", err);
        }
    };

    if (notFound) {
        return <div>Branch not found.</div>;
    }

    return (
        <div>
            <h2>Edit Branch</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <h3>Branch Information</h3>
                    <div>
                        <label>Branch ID</label>
                        <input
                            type="text"
                            name="bid"
                            value={formData.bid}
                            disabled
                        />
                    </div>
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
                        <label>Manager Name</label>
                        <input
                            type="text"
                            name="manager_name"
                            value={formData.manager_name}
                            disabled
                        />
                    </div>
                    <div>
                        <label>Manager Email</label>
                        <input
                            type="text"
                            name="manager_email"
                            value={formData.manager_email}
                            disabled
                        />
                    </div>
                    <div>
                        <label>Manager Phone</label>
                        <input
                            type="text"
                            name="manager_ph_no"
                            value={formData.manager_ph_no}
                            disabled
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
                <button type="submit">Update Branch</button>
            </form>
        </div>
    );
};

export default BranchDetails;