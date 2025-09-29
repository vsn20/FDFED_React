import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AddBranch from './AddBranch';
import BranchDetails from './BranchDetails';

const BranchPage = () => {
    const [branches, setBranches] = useState([]);
    const [addBranch, setAddBranch] = useState(false);
    const [singleBranch, setSingleBranch] = useState(null);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await api.get('/branches');
            setBranches(res.data);
        } catch (err) {
            console.error("Error fetching branches:", err);
        }
    };

    const handleAddBranch = () => {
        setAddBranch(true);
        setSingleBranch(null);
    };

    const handleBack = () => {
        setAddBranch(false);
        fetchBranches();
        setSingleBranch(null);
    };

    const handleRowClick = (bid) => {
        setSingleBranch(bid);
        setAddBranch(false);
    };

    return (
        <div>
            <h1>Our Branches</h1>
            
            {addBranch && !singleBranch && (
                <>
                    <button onClick={handleBack}>Back to List</button>
                    <AddBranch handleBack={handleBack} />
                </>
            )}
            {singleBranch && !addBranch && (
                <>
                    <button onClick={handleBack}>Back to List</button>
                    <BranchDetails bid={singleBranch} handleBack={handleBack} />
                </>
            )}
            {!addBranch && !singleBranch && (
                <>
                    <button onClick={handleAddBranch}>Add Branch</button>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Branch ID</th>
                                <th>Branch Name</th>
                                <th>Manager Name</th>
                                <th>Manager Email</th>
                                <th>Manager Phone</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map((branch) => (
                                <tr key={branch._id} onClick={() => handleRowClick(branch.bid)} style={{ cursor: 'pointer' }}>
                                    <td>{branch.bid}</td>
                                    <td>{branch.b_name}</td>
                                    <td>{branch.manager_name}</td>
                                    <td>{branch.manager_email}</td>
                                    <td>{branch.manager_ph_no}</td>
                                    <td>{branch.location}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default BranchPage;