import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import styles from './Products.module.css'; // Importing the CSS module

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// --- Products List Component ---
const ProductsList = ({ onAddProduct, onViewDetails }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/products`, {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Slideshow Logic
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

  if (loading) return <div className={styles.contentArea}><p>Loading...</p></div>;
  if (error) return <div className={styles.contentArea}><p className={styles.errorMessage}>Error: {error}</p></div>;

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
  const { user, token } = useContext(AuthContext);
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    files.forEach(file => {
      submitData.append('prod_photos', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/company/products/add`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        onBack();
      } else {
        setError(result.message || 'An error occurred while adding the product.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
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
              type="text"
              name="prod_year"
              value={formData.prod_year}
              onChange={handleChange}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.fieldLabel}>Initial Stock</label>
            <input
              type="text"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.fieldInput}
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
              type="text"
              name="Retail_price"
              value={formData.Retail_price}
              onChange={handleChange}
              className={styles.fieldInput}
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
              type="text"
              name="installationcharge"
              value={formData.installationcharge}
              onChange={handleChange}
              className={formData.installationType === 'Paid' ? styles.fieldInput : styles.fieldInputDisabled}
              disabled={formData.installationType !== 'Paid'}
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
        disabled={loading}
      >
        {loading ? 'Adding Product...' : 'Add Product'}
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

// --- Product Details Component ---
const ProductDetails = ({ productId, onBack }) => {
  const { token } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stockAvailability, setStockAvailability] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/products/details/${productId}`, {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch product details');
      
      const data = await response.json();
      setProduct(data.product);
      setStockAvailability(data.product.stockavailability);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async () => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/company/products/update-stockavailability/${productId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stockavailability: stockAvailability })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Stock availability updated successfully!');
        fetchProductDetails();
      } else {
        setError(result.message || 'An error occurred.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  if (loading) return <div className={styles.contentArea}><p>Loading...</p></div>;
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