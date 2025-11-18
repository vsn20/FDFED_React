import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api'; 
import styles from './AddSale.module.css';

const AddSale = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    sales_date: new Date().toISOString().split('T')[0],
    unique_code: '',
    company_id: '',
    product_id: '',
    purchased_price: 0,
    sold_price: '',
    quantity: 1,
    phone_number: '',
    address: '',
    // Read-only fields
    installation: '',
    installationType: '',
    installationcharge: ''
  });
  
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch companies on load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/salesman/sales/helpers/companies');
        setCompanies(res.data);
      } catch (err) {
        setFormMessage({ type: 'error', message: 'Failed to load companies' });
      }
    };
    fetchCompanies();
  }, []);

  // Fetch products when company changes
  useEffect(() => {
    // Reset product-dependent fields
    setFormData(f => ({
      ...f,
      product_id: '',
      purchased_price: 0,
      installation: '',
      installationType: '',
      installationcharge: ''
    }));

    if (formData.company_id) {
      const fetchProducts = async () => {
        try {
          const res = await api.get(`/salesman/sales/helpers/products-by-company/${formData.company_id}`);
          setProducts(res.data);
        } catch (err) {
          setFormMessage({ type: 'error', message: 'Failed to load products' });
        }
      };
      fetchProducts();
    } else {
      setProducts([]); // Clear products if no company is selected
    }
  }, [formData.company_id]);
  
  // Update read-only fields when product changes
  useEffect(() => {
    if (formData.product_id) {
      const selectedProduct = products.find(p => p.prod_id === formData.product_id);
      if (selectedProduct) {
        setFormData(f => ({
          ...f,
          purchased_price: selectedProduct.Retail_price || 0,
          installation: selectedProduct.installation || 'Not Required',
          installationType: selectedProduct.installationType || '',
          installationcharge: selectedProduct.installationcharge || ''
        }));
      }
    } else {
       setFormData(f => ({
        ...f,
        purchased_price: 0,
        installation: '',
        installationType: '',
        installationcharge: ''
      }));
    }
  }, [formData.product_id, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    
    if (errors[name]) {
      setErrors(e => ({ ...e, [name]: null }));
    }
  };

  const validateField = async (name, value) => {
    let error = null;
    
    switch (name) {
      case 'customer_name':
        if (!value) error = 'Customer name is required';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Must contain only letters and spaces';
        break;
      case 'sales_date':
        if (!value) error = 'Sales date is required';
        else if (new Date(value) > new Date()) error = 'Sales date cannot be in the future';
        break;
      case 'unique_code':
        if (!value) error = 'Unique code is required';
        else {
          try {
            const res = await api.post('/salesman/sales/helpers/check-unique-code', { unique_code: value });
            if (!res.data.isUnique) error = 'This unique code already exists';
          } catch (err) {
            error = 'Error checking unique code';
          }
        }
        break;
      case 'company_id':
        if (!value) error = 'Company is required';
        break;
      case 'product_id':
        if (!value) error = 'Product is required';
        break;
      case 'sold_price':
        if (!value || parseFloat(value) <= 0) error = 'Must be a positive number';
        else if (parseFloat(value) < formData.purchased_price) error = 'Sold price cannot be less than purchased price';
        break;
      case 'quantity':
        if (!value || parseInt(value) <= 0) error = 'Must be at least 1';
        else if (formData.product_id && formData.company_id) {
          try {
            const res = await api.post('/salesman/sales/helpers/check-inventory', { 
              product_id: formData.product_id, 
              company_id: formData.company_id, 
              quantity: value 
            });
            if (!res.data.isAvailable) error = `Insufficient stock (Available: ${res.data.availableQuantity})`;
          } catch (err) {
            error = 'Error checking inventory';
          }
        }
        break;
      case 'phone_number':
        if (value && !/^\d{10}$/.test(value)) error = 'Must be 10 digits';
        break;
      case 'address':
        if (!value) error = 'Address is required';
        break;
      default:
        break;
    }
    
    setErrors(e => ({ ...e, [name]: error }));
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', message: '' });
    
    // Validate all fields first
    const fieldsToValidate = ['customer_name', 'sales_date', 'unique_code', 'company_id', 'product_id', 'sold_price', 'quantity', 'phone_number', 'address'];
    let hasErrors = false;
    for (const name of fieldsToValidate) {
      const error = await validateField(name, formData[name]);
      if (error) hasErrors = true;
    }
    
    if (hasErrors) {
      setFormMessage({ type: 'error', message: 'Please correct the errors in the form' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/salesman/sales', formData);
      if (res.data.success) {
        // Redirect to sales list with a success message
        navigate('/salesman/sales', { state: { successMessage: 'Sale added successfully!' } });
      } else {
        setFormMessage({ type: 'error', message: res.data.message || 'An unknown error occurred' });
      }
    } catch (err) {
      setFormMessage({ type: 'error', message: err.response?.data?.message || 'Failed to add sale' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1>Add New Sale</h1>
      
      {formMessage.message && (
        <p className={formMessage.type === 'error' ? styles.errorMessage : styles.successMessage}>
          {formMessage.message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formWrapper}>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Sale Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Customer Name *</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.customer_name && <p className={styles.fieldError}>{errors.customer_name}</p>}
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Sales Date *</label>
                <input
                  className={styles.fieldInput}
                  type="date"
                  name="sales_date"
                  value={formData.sales_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.sales_date && <p className={styles.fieldError}>{errors.sales_date}</p>}
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Unique Code *</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  name="unique_code"
                  value={formData.unique_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.unique_code && <p className={styles.fieldError}>{errors.unique_code}</p>}
              </div>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Customer Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input
                  className={styles.fieldInput}
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone_number && <p className={styles.fieldError}>{errors.phone_number}</p>}
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Address *</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.address && <p className={styles.fieldError}>{errors.address}</p>}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Product Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Company *</label>
                <select
                  className={styles.fieldInput}
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.c_id} value={c.c_id}>{c.cname}</option>)}
                </select>
                {errors.company_id && <p className={styles.fieldError}>{errors.company_id}</p>}
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Product *</label>
                <select
                  className={styles.fieldInput}
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!formData.company_id}
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.prod_id} value={p.prod_id}>{p.Prod_name} ({p.Model_no})</option>)}
                </select>
                {errors.product_id && <p className={styles.fieldError}>{errors.product_id}</p>}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Transaction Details</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Purchased Price</label>
                <input
                  className={`${styles.fieldInput} ${styles.disabledField}`}
                  type="number"
                  name="purchased_price"
                  value={formData.purchased_price}
                  readOnly
                />
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Sold Price *</label>
                <input
                  className={styles.fieldInput}
                  type="number"
                  name="sold_price"
                  value={formData.sold_price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.01"
                  min="0"
                />
                {errors.sold_price && <p className={styles.fieldError}>{errors.sold_price}</p>}
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Quantity *</label>
                <input
                  className={styles.fieldInput}
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                />
                {errors.quantity && <p className={styles.fieldError}>{errors.quantity}</p>}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Installation Details (Read-Only)</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Installation</label>
                <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={formData.installation} readOnly />
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Installation Type</label>
                <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={formData.installationType} readOnly />
              </div>
              <div className={styles.fieldItem}>
                <label className={styles.fieldLabel}>Installation Charge</label>
                <input className={`${styles.fieldInput} ${styles.disabledField}`} type="text" value={formData.installationcharge} readOnly />
              </div>
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.backButton} onClick={() => navigate('/salesman/sales')}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Sale'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSale;