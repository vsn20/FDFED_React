import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from '../../owner/Branches/Branch.module.css'; // Reusing CSS

const AddSale = ({ handleBack }) => {
    const [salesmen, setSalesmen] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [products, setProducts] = useState([]);
    
    const [formData, setFormData] = useState({
        salesman_id: '',
        customer_name: '',
        saledate: new Date().toISOString().split('T')[0],
        unique_code: '',
        phone_number: '',
        address: '',
        company_id: '',
        product_id: '',
        purchased_price: '',
        sold_price: '',
        quantity: 1,
        installation: 'Not Required',
        installationType: '',
        installationcharge: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [salesmenRes, companiesRes] = await Promise.all([
                    api.get('/manager/sales/form-data/salesmen'),
                    api.get('/manager/sales/form-data/companies')
                ]);
                setSalesmen(salesmenRes.data);
                setCompanies(companiesRes.data);
            } catch (err) {
                console.error("Error loading form data", err);
                setError("Failed to load form data");
            }
        };
        fetchInitialData();
    }, []);

    // Fetch products when company changes
    useEffect(() => {
        if (formData.company_id) {
            const fetchProducts = async () => {
                try {
                    const res = await api.get(`/manager/sales/form-data/products/${formData.company_id}`);
                    setProducts(res.data);
                } catch (err) {
                    console.error("Error fetching products", err);
                }
            };
            fetchProducts();
        } else {
            setProducts([]);
        }
    }, [formData.company_id]);

    // Update prices when product changes
    useEffect(() => {
        if (formData.product_id) {
            const product = products.find(p => p.prod_id === formData.product_id);
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    purchased_price: product.Retail_price || '', // Legacy used Retail_price as purchased base
                    installation: product.installation || 'Not Required',
                    installationType: product.installationType || '',
                    installationcharge: product.installationcharge || ''
                }));
            }
        }
    }, [formData.product_id, products]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/manager/sales', formData);
            handleBack();
        } catch (err) {
            setError(err.response?.data?.message || "Error adding sale");
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.headerContainer}>
                <h2>Add New Sale</h2>
                <button className={styles.addButton} onClick={handleBack}>Back to List</button>
            </div>
            
            {error && <div className={styles.errorMessage} style={{color:'red', marginBottom:'10px'}}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                {/* Sale Info */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Sale Information</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Salesman</label>
                            <select name="salesman_id" value={formData.salesman_id} onChange={handleChange} required className={styles.fieldInput}>
                                <option value="">Select Salesman</option>
                                {salesmen.map(s => (
                                    <option key={s._id} value={s._id}>{s.f_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Customer Name</label>
                            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Sale Date</label>
                            <input type="date" name="saledate" value={formData.saledate} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Unique Code</label>
                            <input type="text" name="unique_code" value={formData.unique_code} onChange={handleChange} placeholder="e.g. INV001" className={styles.fieldInput} />
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Customer Contact</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required pattern="^\+?\d{10,15}$" className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.fieldInput} />
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Product Details</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Company</label>
                            <select name="company_id" value={formData.company_id} onChange={handleChange} required className={styles.fieldInput}>
                                <option value="">Select Company</option>
                                {companies.map(c => <option key={c.c_id} value={c.c_id}>{c.cname}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Product</label>
                            <select name="product_id" value={formData.product_id} onChange={handleChange} required className={styles.fieldInput} disabled={!formData.company_id}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.prod_id} value={p.prod_id}>{p.Prod_name} (Model: {p.Model_no})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Installation</label>
                            <input type="text" value={formData.installation} readOnly className={`${styles.fieldInput} ${styles.disabledField}`} />
                        </div>
                        {formData.installation === 'Required' && (
                            <>
                                <div>
                                    <label className={styles.fieldLabel}>Installation Type</label>
                                    <input type="text" value={formData.installationType} readOnly className={`${styles.fieldInput} ${styles.disabledField}`} />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Charge</label>
                                    <input type="text" value={formData.installationcharge} readOnly className={`${styles.fieldInput} ${styles.disabledField}`} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Transaction */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Transaction</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Purchased Price</label>
                            <input type="number" name="purchased_price" value={formData.purchased_price} readOnly className={`${styles.fieldInput} ${styles.disabledField}`} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Sold Price</label>
                            <input type="number" name="sold_price" value={formData.sold_price} onChange={handleChange} required min="0" className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className={styles.fieldInput} />
                        </div>
                    </div>
                </div>

                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Processing...' : 'Submit Sale'}
                </button>
            </form>
        </div>
    );
};

export default AddSale;