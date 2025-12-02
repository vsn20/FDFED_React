// client/src/pages/company/products/CompanyProducts.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthContext from '../../../context/AuthContext';
import styles from './Products.module.css'; 

// Import actions from the slice created in the previous step
import { 
  fetchCompanyProducts, 
  addCompanyProduct, 
  fetchCompanyProductDetails, 
  updateStockAvailability,
  resetActionStatus,
  clearCurrentProduct
} from '../../../redux/slices/companyproductsslice';

// --- Products List Component ---
const ProductsList = ({ onAddProduct, onViewDetails }) => {
  const dispatch = useDispatch();
  // Select data from Redux store
  const { items: products, status, error } = useSelector((state) => state.companyProducts);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchCompanyProducts());
  }, [dispatch]);

  // Slideshow Logic (UI Logic kept local)
  useEffect(() => {
    if (products.length === 0) return;

    const intervals = [];
    products.forEach((product, productIndex) => {
      if (product.prod_photos && product.prod_photos.length > 1) {
        let currentSlide = 0;
        const interval = setInterval(() => {
          const container = document.querySelector(`[data-product-index="${productIndex}"]`);
          if (container) {
            const slides = container.querySelectorAll(`.${styles.slideImage}`);
            if (slides.length > 0) {
              slides.forEach(slide => slide.style.opacity = '0'); // Hide all
              currentSlide = (currentSlide + 1) % slides.length;
              slides[currentSlide].style.opacity = '1'; // Show next
            }
          }
        }, 3000); // 3 seconds per slide
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [products]);

  if (status === 'loading') return <div className={styles.contentArea}><p>Loading...</p></div>;
  if (status === 'failed') return <div className={styles.contentArea}><p className={styles.errorMessage}>Error: {error}</p></div>;

  return (
    <div className={styles.contentArea}>
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Products Management</h1>
        <button className={styles.button} onClick={onAddProduct}>
          + Add New Product
        </button>
      </div>
      
      <div className={styles.productsContainer}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={product.prod_id} 
              className={styles.productItem}
              onClick={() => onViewDetails(product.prod_id)}
            >
              <div 
                className={styles.slideshowContainer}
                data-product-index={index}
              >
                {product.prod_photos && product.prod_photos.length > 0 ? (
                  product.prod_photos.map((photo, photoIndex) => (
                    <img 
                      key={photoIndex}
                      src={photo}
                      alt="Product"
                      className={styles.slideImage}
                      style={{ opacity: photoIndex === 0 ? 1 : 0 }}
                    />
                  ))
                ) : (
                  <img 
                    src="/placeholder.jpg" 
                    alt="No Image" 
                    className={styles.slideImage} 
                    style={{ opacity: 1 }}
                  />
                )}
              </div>
              
              <div className={styles.productDetails}>
                <span>{product.Prod_name}</span>
                <span>ID: {product.prod_id}</span>
                <span>Model: {product.Model_no}</span>
                <span>Stock: {product.stock}</span>
                <span>{product.Status}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

// --- Add Product Form Component ---
const AddProductForm = ({ onBack }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext); // Used for displaying C_ID
  
  // Select action status from Redux
  const { actionStatus, actionError } = useSelector((state) => state.companyProducts);

  const [formData, setFormData] = useState({
    Prod_name: '',
    Model_no: '',
    prod_year: '',
    stock: '',
    stockavailability: 'instock',
    prod_description: '',
    Retail_price: '',
    warrantyperiod: '',
    installation: '',
    installationType: '',
    installationcharge: ''
  });
  const [files, setFiles] = useState([]);
  const [validationError, setValidationError] = useState('');

  // Reset status when component mounts
  useEffect(() => {
    dispatch(resetActionStatus());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Conditional logic for installation fields
    if (name === 'installation') {
      if (value !== 'Required') {
        setFormData(prev => ({ 
          ...prev, 
          installationType: '', 
          installationcharge: '' 
        }));
      }
    }
    if (name === 'installationType' && value !== 'Paid') {
      setFormData(prev => ({ ...prev, installationcharge: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // --- Validation Logic ---
  const validateForm = () => {
    if (!formData.Prod_name.trim()) return "Product Name is required.";
    if (!formData.Model_no.trim()) return "Model Number is required.";
    
    const currentYear = new Date().getFullYear();
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(formData.prod_year) || parseInt(formData.prod_year) < 1900 || parseInt(formData.prod_year) > currentYear + 1) {
      return `Please enter a valid Production Year (4 digits, e.g., ${currentYear}).`;
    }

    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      return "Stock must be a valid non-negative number.";
    }

    if (!formData.Retail_price || isNaN(formData.Retail_price) || parseFloat(formData.Retail_price) <= 0) {
      return "Selling Price must be a valid positive number.";
    }

    if (!formData.warrantyperiod.trim()) return "Warranty Period is required.";

    if (!formData.installation) return "Please select whether installation is required.";
    
    if (formData.installation === 'Required') {
      if (!formData.installationType) return "Please select the Installation Type (Paid/Free).";
      
      if (formData.installationType === 'Paid') {
        if (!formData.installationcharge || isNaN(formData.installationcharge) || parseFloat(formData.installationcharge) < 0) {
          return "Please enter a valid non-negative Installation Charge.";
        }
      }
    }

    if (!formData.prod_description.trim() || formData.prod_description.trim().length < 10) {
      return "Product description is required and should be at least 10 characters.";
    }

    if (files.length === 0) {
      return "Please upload at least one product photo.";
    }

    return null;
  };

  const handleSubmit = async () => {
    setValidationError('');
    
    const vError = validateForm();
    if (vError) {
      setValidationError(vError);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    files.forEach(file => {
      submitData.append('prod_photos', file);
    });

    try {
      // Dispatch the AsyncThunk
      await dispatch(addCompanyProduct(submitData)).unwrap();
      // If successful (no error thrown), go back and refresh list
      dispatch(fetchCompanyProducts());
      onBack();
    } catch (err) {
      console.error('Submit error:', err);
      // Errors are handled in Redux state (actionError), but we catch here to prevent crash
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Add New Product</h1>
        <button className={styles.backLink} onClick={onBack}>
          &larr; Back to Products
        </button>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>Product Information</div>
        <div className={styles.fieldGroup}>
          
          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Product Name</label>
            <input
              type="text"
              name="Prod_name"
              value={formData.Prod_name}
              onChange={handleChange}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Model Number</label>
            <input
              type="text"
              name="Model_no"
              value={formData.Model_no}
              onChange={handleChange}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Company ID (Auto)</label>
            <input
              type="text"
              value={user?.c_id || ''}
              className={styles.fieldInputDisabled}
              disabled
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Production Year</label>
            <input
              type="number" 
              name="prod_year"
              value={formData.prod_year}
              onChange={handleChange}
              className={styles.fieldInput}
              placeholder="YYYY"
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Initial Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.fieldInput}
              min="0"
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Stock Status</label>
            <select
              name="stockavailability"
              value={formData.stockavailability}
              onChange={handleChange}
              className={styles.fieldSelect}
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Selling Price</label>
            <input
              type="number"
              name="Retail_price"
              value={formData.Retail_price}
              onChange={handleChange}
              className={styles.fieldInput}
              min="0"
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Warranty Period</label>
            <input
              type="text"
              name="warrantyperiod"
              value={formData.warrantyperiod}
              onChange={handleChange}
              className={styles.fieldInput}
              placeholder="e.g. 2 Years"
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Installation Required?</label>
            <select
              name="installation"
              value={formData.installation}
              onChange={handleChange}
              className={styles.fieldSelect}
              required
            >
              <option value="">Select...</option>
              <option value="Required">Required</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Installation Type</label>
            <select
              name="installationType"
              value={formData.installationType}
              onChange={handleChange}
              className={formData.installation === 'Required' ? styles.fieldSelect : styles.fieldInputDisabled}
              disabled={formData.installation !== 'Required'}
            >
              <option value="">Select...</option>
              <option value="Paid">Paid</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Installation Charge</label>
            <input
              type="number"
              name="installationcharge"
              value={formData.installationcharge}
              onChange={handleChange}
              className={formData.installationType === 'Paid' ? styles.fieldInput : styles.fieldInputDisabled}
              disabled={formData.installationType !== 'Paid'}
              min="0"
            />
          </div>

          <div className={styles.fieldWrapper} style={{gridColumn: '1 / -1'}}>
            <label className={styles.fieldLabel}>Description</label>
            <input
              type="text"
              name="prod_description"
              value={formData.prod_description}
              onChange={handleChange}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.fieldWrapper} style={{gridColumn: '1 / -1'}}>
            <label className={styles.fieldLabel}>Product Photos</label>
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.fieldInput}
              multiple
              accept="image/*"
              required
            />
          </div>

        </div>
      </div>

      <button 
        onClick={handleSubmit}
        className={styles.submitBtn}
        disabled={actionStatus === 'loading'}
      >
        {actionStatus === 'loading' ? 'Adding Product...' : 'Add Product'}
      </button>

      {validationError && <div className={styles.errorMessage}>{validationError}</div>}
      {actionError && <div className={styles.errorMessage}>{actionError}</div>}
    </div>
  );
};

// --- Product Details Component ---
const ProductDetails = ({ productId, onBack }) => {
  const dispatch = useDispatch();
  // Select current product and status from Redux
  const { currentProduct: product, status, error } = useSelector((state) => state.companyProducts);
  
  const [stockAvailability, setStockAvailability] = useState('');
  const [message, setMessage] = useState('');

  // Fetch details on mount
  useEffect(() => {
    dispatch(fetchCompanyProductDetails(productId));
    // Cleanup to clear current product when leaving view
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, productId]);

  // Sync local state with fetched product
  useEffect(() => {
    if (product) {
      setStockAvailability(product.stockavailability);
    }
  }, [product]);

  const handleUpdateAvailability = async () => {
    setMessage('');
    try {
      const resultAction = await dispatch(updateStockAvailability({ 
        productId, 
        stockavailability: stockAvailability 
      }));

      if (updateStockAvailability.fulfilled.match(resultAction)) {
        setMessage('Stock availability updated successfully!');
      }
    } catch (err) {
      // Error handled by redux state, but local try/catch prevents crash
    }
  };

  if (status === 'loading') return <div className={styles.contentArea}><p>Loading...</p></div>;
  if (!product) return <div className={styles.contentArea}><p className={styles.errorMessage}>Product not found.</p></div>;

  return (
    <div className={styles.contentArea}>
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Product Details</h1>
        <button className={styles.backLink} onClick={onBack}>
          &larr; Back to Products
        </button>
      </div>

      <div className={styles.photos}>
        {product.prod_photos && product.prod_photos.length > 0 ? (
          product.prod_photos.map((photo, index) => (
            <img 
              key={index} 
              src={photo} 
              alt={`Photo ${index}`} 
              className={styles.photoThumbnail} 
            />
          ))
        ) : (
          <p>No photos available.</p>
        )}
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>Product Information</div>
        <div className={styles.fieldGroup}>
          
          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Product ID</label>
            <input type="text" value={product.prod_id} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Product Name</label>
            <input type="text" value={product.Prod_name} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Model Number</label>
            <input type="text" value={product.Model_no} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Stock Count</label>
            <input type="text" value={product.stock} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Stock Availability</label>
            <select
              value={stockAvailability}
              onChange={(e) => setStockAvailability(e.target.value)}
              className={styles.fieldSelect}
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
            <button className={styles.updateBtn} onClick={handleUpdateAvailability}>
              Update Availability
            </button>
            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Current Status</label>
            <input type="text" value={product.Status} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Selling Price</label>
            <input type="text" value={product.Retail_price} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Warranty</label>
            <input type="text" value={product.warrantyperiod} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Installation</label>
            <input type="text" value={product.installation} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Install Charge</label>
            <input type="text" value={product.installationcharge || 'N/A'} className={styles.fieldInputDisabled} disabled />
          </div>

          <div className={styles.fieldWrapper} style={{gridColumn: '1 / -1'}}>
            <label className={styles.fieldLabel}>Description</label>
            <input type="text" value={product.prod_description} className={styles.fieldInputDisabled} disabled />
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const CompanyProductsApp = () => {
  const [view, setView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleAddProduct = () => setView('add');
  
  const handleViewDetails = (productId) => {
    setSelectedProductId(productId);
    setView('details');
  };
  
  const handleBackToList = () => {
    setView('list');
    setSelectedProductId(null);
  };

  return (
    <div className={styles.container}>
      {view === 'list' && (
        <ProductsList 
          onAddProduct={handleAddProduct}
          onViewDetails={handleViewDetails}
        />
      )}
      {view === 'add' && (
        <AddProductForm 
          onBack={handleBackToList}
        />
      )}
      {view === 'details' && selectedProductId && (
        <ProductDetails 
          productId={selectedProductId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default CompanyProductsApp;