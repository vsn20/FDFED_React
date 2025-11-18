import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from '../Employees/Details.module.css';

const ManagerAddOrder = ({ handleBack, managerInfo }) => {
    const [formData, setFormData] = useState({
        company_id: '',
        product_id: '',
        quantity: 1,
        ordered_date: new Date().toISOString().split('T')[0], // Default to today
    });
    const [companies, setCompanies] = useState([]);
    const [products, setProducts] = useState([]);
    const [branchName, setBranchName] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        // Fetch companies and branch info on load
        const fetchFormData = async () => {
            try {
                const res = await api.get('/manager/orders/form-data');
                setCompanies(res.data.companies);
                setBranchName(res.data.branchname);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load form data");
            }
        };
        fetchFormData();
    }, []);

    useEffect(() => {
        // Fetch products when company changes
        const fetchProducts = async () => {
            if (formData.company_id) {
                try {
                    const res = await api.get(`/manager/orders/products/${formData.company_id}`);
                    setProducts(res.data);
                    // Reset product selection
                    setFormData(prev => ({ ...prev, product_id: '' })); 
                } catch (err) {
                    setError(err.response?.data?.message || "Failed to load products");
                }
            } else {
                setProducts([]); // Clear products if no company selected
            }
        };
        fetchProducts();
    }, [formData.company_id]);

    const validateForm = () => {
        const errors = {};
        if (!formData.company_id) errors.company_id = 'Please select a company.';
        if (!formData.product_id) errors.product_id = 'Please select a product.';
        if (!formData.ordered_date) errors.ordered_date = 'Please select an ordered date.';
        if (isNaN(formData.quantity) || Number(formData.quantity) < 1) {
            errors.quantity = 'Quantity must be at least 1.';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (validationErrors[e.target.name]) {
            setValidationErrors({ ...validationErrors, [e.target.name]: '' });
        }
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setError('Please fix the errors below.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/manager/orders', {
                ...formData,
                branch_name: branchName, // Add branch name from manager profile
            });
            setSuccess('Order added successfully!');
            setTimeout(() => handleBack(), 1500); // Auto back after success
        } catch (err) {
            console.error("Error adding order:", err);
            setError(err.response?.data?.message || "Error adding order");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add New Order</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}
            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Order Details</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Branch</label>
                            <input
                                type="text"
                                value={branchName || 'Loading...'}
                                disabled
                                className={`${styles.fieldInput} ${styles.disabledField}`}
                            />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Company *</label>
                            <select
                                name="company_id"
                                value={formData.company_id}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                                aria-invalid={!!validationErrors.company_id}
                            >
                                <option value="">Select a company</option>
                                {companies.map(c => (
                                    <option key={c.c_id} value={c.c_id}>{c.cname}</option>
                                ))}
                            </select>
                            {validationErrors.company_id && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.company_id}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Product *</label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                                disabled={!formData.company_id}
                                aria-invalid={!!validationErrors.product_id}
                            >
                                <option value="">Select a product</option>
                                {products.map(p => (
                                    <option key={p.prod_id} value={p.prod_id}>{p.Prod_name}</option>
                                ))}
                            </select>
                            {validationErrors.product_id && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.product_id}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                                className={styles.fieldInput}
                                aria-invalid={!!validationErrors.quantity}
                            />
                            {validationErrors.quantity && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.quantity}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Ordered Date *</label>
                            <input
                                type="date"
                                name="ordered_date"
                                value={formData.ordered_date}
                                onChange={handleChange}
                                required
                                className={styles.fieldInput}
                                aria-invalid={!!validationErrors.ordered_date}
                            />
                            {validationErrors.ordered_date && <span className={styles.validationError} style={{ color: 'red' }}>{validationErrors.ordered_date}</span>}
                        </div>
                    </div>
                </div>

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Order'}
                </button>
                <button type="button" className={styles.backButton} onClick={handleBack} disabled={isSubmitting}>
                    Back to List
                </button>
            </form>
        </div>
    );
};

export default ManagerAddOrder;