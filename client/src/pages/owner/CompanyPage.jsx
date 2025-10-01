import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AddCompany from './Company/AddCompany';
import CompanyDetails from './Company/CompanyDetails';
import styles from './Company/Company.module.css'; // Import CSS module

const CompanyPage = () => {
    const [companies, setCompanies] = useState([]);
    const [addcompany, setaddcompany] = useState(false);
    const [singlecompany, setSinglecompany] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data);
        } catch (err) {
            console.error("Error fetching companies:", err);
        }
    };

    const handleAddCompany = () => {
        setaddcompany(true);
        setSinglecompany(null);
    };

    const handleback = () => {
        setaddcompany(false);
        fetchCompanies();
        setSinglecompany(null);
    };

    const handlerowclick = (id) => {
        setSinglecompany(id);
        setaddcompany(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <h1>Companies</h1>
                {addcompany && !singlecompany && (
                    <>
                        <button className={styles.addButton} onClick={handleback}>Back to List</button>
                        <AddCompany />
                    </>
                )}
                {singlecompany && !addcompany && (
                    <>
                        <button className={styles.addButton} onClick={handleback}>Back to List</button>
                        <CompanyDetails id={singlecompany} handleback={handleback} />
                    </>
                )}
                {!addcompany && !singlecompany && (
                    <>
                        <div className={styles.headerContainer}>
                            <button className={styles.addButton} onClick={handleAddCompany}>Add Company</button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Company ID</th>
                                        <th className={styles.th}>Company Name</th>
                                        <th className={styles.th}>Email</th>
                                        <th className={styles.th}>Phone</th>
                                        <th className={styles.th}>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company._id} className={styles.tr} onClick={() => handlerowclick(company.c_id)}>
                                            <td className={styles.td} data-label="Company ID">{company.c_id}</td>
                                            <td className={styles.td} data-label="Company Name">{company.cname}</td>
                                            <td className={styles.td} data-label="Email">{company.email}</td>
                                            <td className={styles.td} data-label="Phone">{company.phone}</td>
                                            <td className={styles.td} data-label="Address">{company.address}</td>
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

export default CompanyPage;