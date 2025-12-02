import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import styles from './Sale.module.css';

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
    const [validationErrors, setValidationErrors] = useState({}); // New state for field errors
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
            // Clear product-dependent fields when company changes
            setFormData(prev => ({
                ...prev,
                product_id: '',
                purchased_price: '',
                installation: 'Not Required',
                installationType: '',
                installationcharge: ''
            }));
        }
    }, [formData.company_id]);

    // Update prices when product changes
    useEffect(() => {
        if (formData.product_id) {
            const product = products.find(p => p.prod_id === formData.product_id);
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    purchased_price: product.Retail_price || '',
                    installation: product.installation || 'Not Required',
                    installationType: product.installationType || '',
                    installationcharge: product.installationcharge || ''
                }));
            }
        }
    }, [formData.product_id, products]);

    const validateField = (name, value) => {
        let message = '';
        switch (name) {
            case 'salesman_id':
                if (!value) message = 'Please select a salesman.';
                break;
            case 'customer_name':
                if (!value || value.trim().length < 3) message = 'Customer name is required and must be at least 3 characters.';
                break;
            case 'phone_number':
                // Allows optional '+' followed by 10 to 15 digits
                if (!value) message = 'Phone number is required.';
                else if (!/^\+?\d{10,15}$/.test(value)) message = 'Invalid phone number format (10 digits).';
                break;
            case 'company_id':
                if (!value) message = 'Please select a company.';
                break;
            case 'product_id':
                if (!value) message = 'Please select a product.';
                break;
            case 'sold_price':
                if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) message = 'Sold price must be a positive number.';
                break;
            case 'quantity':
                if (!value || isNaN(parseInt(value)) || parseInt(value) <= 0) message = 'Quantity must be a positive whole number.';
                break;
            default:
                break;
        }
        return message;
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;
        
        // Validate all fields used in the form
        Object.keys(formData).forEach(key => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg) {
                errors[key] = errorMsg;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Real-time validation
        const errorMsg = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            setError("Please correct the validation errors below.");
            return;
        }

        setLoading(true);

        // Create a copy of the data
        const payload = { ...formData };

        // FIX: If installationType is empty, explicitly set it to 'Free' (as per backend logic)
        if (!payload.installationType) {
            payload.installationType = 'Free';
        }

        // Optional: specific safety for installationcharge (usually empty string fails for numbers)
        if (payload.installationcharge === '') {
            payload.installationcharge = 0;
        }

        try {
            await api.post('/manager/sales', payload);
            handleBack();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error adding sale");
            setLoading(false);
        }
    };

    const getFieldClassName = (fieldName) => {
        return `${styles.fieldInput} ${validationErrors[fieldName] ? styles.validationErrorInput : ''}`;
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.headerContainer}>
                <h2>Add New Sale</h2>
                <button className={styles.submitButton} onClick={handleBack}>Back to List</button>
            </div>
            <br/>

            {/* Display general submission error */}
            {error && <div className={styles.errorMessage} style={{color:'red', marginBottom:'10px'}}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formWrapper}>
                {/* Sale Info */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Sale Information</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Salesman</label>
                            <select 
                                name="salesman_id" 
                                value={formData.salesman_id} 
                                onChange={handleChange} 
                                required 
                                className={getFieldClassName('salesman_id')}
                                aria-invalid={!!validationErrors.salesman_id}
                            >
                                <option value="">Select Salesman</option>
                                {salesmen.map(s => (
                                    <option key={s._id} value={s._id}>{s.f_name} {s.last_name}</option>
                                ))}
                            </select>
                            {validationErrors.salesman_id && <span className={styles.validationError}>{validationErrors.salesman_id}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Customer Name</label>
                            <input 
                                type="text" 
                                name="customer_name" 
                                value={formData.customer_name} 
                                onChange={handleChange} 
                                required 
                                className={getFieldClassName('customer_name')}
                                aria-invalid={!!validationErrors.customer_name}
                            />
                            {validationErrors.customer_name && <span className={styles.validationError}>{validationErrors.customer_name}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Sale Date</label>
                            {/* Note: date input doesn't usually require complex validation beyond 'required' and browser default date checking */}
                            <input type="date" name="saledate" value={formData.saledate} onChange={handleChange} required className={styles.fieldInput} />
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Unique Code</label>
                            <input type="text" name="unique_code" value={formData.unique_code} onChange={handleChange} placeholder="e.g. INV001" className={styles.fieldInput} />
                            {/* Backend handles unique code existence validation */}
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Customer Contact</h3>
                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone_number" 
                                value={formData.phone_number} 
                                onChange={handleChange} 
                                required 
                                className={getFieldClassName('phone_number')}
                                aria-invalid={!!validationErrors.phone_number}
                            />
                            {validationErrors.phone_number && <span className={styles.validationError}>{validationErrors.phone_number}</span>}
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
                            <select 
                                name="company_id" 
                                value={formData.company_id} 
                                onChange={handleChange} 
                                required 
                                className={getFieldClassName('company_id')}
                                aria-invalid={!!validationErrors.company_id}
                            >
                                <option value="">Select Company</option>
                                {companies.map(c => <option key={c.c_id} value={c.c_id}>{c.cname}</option>)}
                            </select>
                            {validationErrors.company_id && <span className={styles.validationError}>{validationErrors.company_id}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Product</label>
                            <select 
                                name="product_id" 
                                value={formData.product_id} 
                                onChange={handleChange} 
                                required 
                                className={getFieldClassName('product_id')}
                                disabled={!formData.company_id}
                                aria-invalid={!!validationErrors.product_id}
                            >
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.prod_id} value={p.prod_id}>{p.Prod_name} (Model: {p.Model_no})</option>)}
                            </select>
                            {validationErrors.product_id && <span className={styles.validationError}>{validationErrors.product_id}</span>}
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
                            <input 
                                type="number" 
                                name="sold_price" 
                                value={formData.sold_price} 
                                onChange={handleChange} 
                                required 
                                min="0.01" 
                                step="0.01" 
                                className={getFieldClassName('sold_price')}
                                aria-invalid={!!validationErrors.sold_price}
                            />
                            {validationErrors.sold_price && <span className={styles.validationError}>{validationErrors.sold_price}</span>}
                        </div>
                        <div>
                            <label className={styles.fieldLabel}>Quantity</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={formData.quantity} 
                                onChange={handleChange} 
                                required 
                                min="1" 
                                className={getFieldClassName('quantity')}
                                aria-invalid={!!validationErrors.quantity}
                            />
                            {validationErrors.quantity && <span className={styles.validationError}>{validationErrors.quantity}</span>}
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