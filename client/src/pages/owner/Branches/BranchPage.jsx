import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AddBranch from './AddBranch';
import BranchDetails from './BranchDetails';
import styles from './Branch.module.css'; // Import CSS module

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
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Our Branches</h1>
                {addBranch && !singleBranch && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <AddBranch handleBack={handleBack} />
                    </>
                )}
                {singleBranch && !addBranch && (
                    <>
                        <button className={styles.addButton} onClick={handleBack}>Back to List</button>
                        <BranchDetails bid={singleBranch} handleBack={handleBack} />
                    </>
                )}
                {!addBranch && !singleBranch && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddBranch}>Add Branch</button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Branch ID</th>
                                        <th className={styles.th}>Branch Name</th>
                                        <th className={styles.th}>Manager Name</th>
                                        <th className={styles.th}>Manager Email</th>
                                        <th className={styles.th}>Manager Phone</th>
                                        <th className={styles.th}>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branches.map((branch) => (
                                        <tr key={branch._id} className={styles.tr} onClick={() => handleRowClick(branch.bid)}>
                                            <td className={styles.td} data-label="Branch ID">{branch.bid}</td>
                                            <td className={styles.td} data-label="Branch Name">{branch.b_name}</td>
                                            <td className={styles.td} data-label="Manager Name">{branch.manager_name}</td>
                                            <td className={styles.td} data-label="Manager Email">{branch.manager_email}</td>
                                            <td className={styles.td} data-label="Manager Phone">{branch.manager_ph_no}</td>
                                            <td className={styles.td} data-label="Address">{branch.location}</td>
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

export default BranchPage;