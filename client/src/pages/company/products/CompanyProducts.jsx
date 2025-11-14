import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';

// API base URL - adjust as needed
const API_BASE_URL = 'http://localhost:5001/api';

// Shared CSS Module
const styles = {
  container: {
    marginTop: '90px',
    display: 'flex',
    flex: 1,
    gap: '25px',
    padding: '0 20px',
    maxWidth: '100%'
  },
  contentArea: {
    background: '#ffffff',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    flex: 1,
    height: 'calc(100vh - 90px)',
    overflowY: 'auto',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  heading: {
    color: '#2d3436',
    marginBottom: '20px',
    fontSize: '1.5rem'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#2d3436',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background 0.3s'
  },
  productsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  productItem: {
    flex: '1 1 calc(33.33% - 20px)',
    background: '#ffffff',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center'
  },
  slideshowContainer: {
    position: 'relative',
    width: '100%',
    margin: '0 auto 10px auto',
    cursor: 'pointer'
  },
  slideImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '5px'
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  clickable: {
    cursor: 'pointer',
    color: '#2d3436',
    fontSize: '1.1rem',
    fontWeight: 500,
    letterSpacing: '0.5px'
  },
  formSection: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #e6e9f0',
    borderRadius: '5px'
  },
  sectionTitle: {
    color: '#2d3436',
    fontSize: '1.2rem',
    marginBottom: '15px'
  },
  fieldGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  fieldWrapper: {
    flex: '1',
    minWidth: '250px'
  },
  fieldLabel: {
    display: 'block',
    marginBottom: '5px',
    color: '#2d3436',
    fontWeight: 500
  },
  fieldInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e6e9f0',
    borderRadius: '5px',
    fontSize: '1rem'
  },
  fieldInputDisabled: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e6e9f0',
    borderRadius: '5px',
    fontSize: '1rem',
    background: '#f0f0f0',
    cursor: 'not-allowed'
  },
  submitBtn: {
    display: 'block',
    width: '100%',
    padding: '12px',
    background: '#2d3436',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '20px',
    transition: 'background 0.3s'
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    color: '#2d3436',
    textDecoration: 'none',
    marginTop: '20px',
    fontSize: '1.1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  },
  errorMessage: {
    color: '#e74c3c',
    margin: '10px 0',
    minHeight: '20px'
  },
  successMessage: {
    color: '#27ae60',
    margin: '10px 0',
    minHeight: '20px'
  },
  photos: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  photoThumbnail: {
    maxWidth: '150px',
    height: 'auto',
    borderRadius: '5px'
  },
  updateBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#2d3436',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '10px',
    transition: 'background 0.3s'
  }
};

// Products List Component
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

  useEffect(() => {
    if (products.length === 0) return;

    const intervals = [];
    products.forEach((product, productIndex) => {
      if (product.prod_photos && product.prod_photos.length > 1) {
        let currentSlide = 0;
        const interval = setInterval(() => {
          const container = document.querySelector(`[data-product-index="${productIndex}"]`);
          if (container) {
            const slides = container.querySelectorAll('.slide-image');
            if (slides.length > 0) {
              slides[currentSlide].style.display = 'none';
              currentSlide = (currentSlide + 1) % slides.length;
              slides[currentSlide].style.display = 'block';
            }
          }
        }, 2000);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [products]);

  if (loading) return <div style={styles.contentArea}><p>Loading...</p></div>;
  if (error) return <div style={styles.contentArea}><p style={styles.errorMessage}>Error: {error}</p></div>;

  return (
    <div style={styles.contentArea}>
      <div style={styles.headerContainer}>
        <h1 style={styles.heading}>Products</h1>
        <button 
          onClick={onAddProduct}
          style={styles.button}
          onMouseEnter={(e) => e.target.style.background = '#636e72'}
          onMouseLeave={(e) => e.target.style.background = '#2d3436'}
        >
          Add Product
        </button>
      </div>
      <div style={styles.productsContainer}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.prod_id} style={styles.productItem}>
              <div 
                style={styles.slideshowContainer}
                data-product-index={index}
                onClick={() => onViewDetails(product.prod_id)}
              >
                {product.prod_photos && product.prod_photos.map((photo, photoIndex) => (
                  <img 
                    key={photoIndex}
                    src={photo}
                    alt="Product Photo"
                    className="slide-image"
                    style={{
                      ...styles.slideImage,
                      display: photoIndex === 0 ? 'block' : 'none'
                    }}
                  />
                ))}
              </div>
              <div style={styles.productDetails}>
                <span 
                  onClick={() => onViewDetails(product.prod_id)}
                  style={styles.clickable}
                >
                  {product.prod_id}
                </span>
                <span 
                  onClick={() => onViewDetails(product.prod_id)}
                  style={styles.clickable}
                >
                  {product.Model_no}
                </span>
                <span 
                  onClick={() => onViewDetails(product.prod_id)}
                  style={styles.clickable}
                >
                  Stock: {product.stock}
                </span>
                <span 
                  onClick={() => onViewDetails(product.prod_id)}
                  style={styles.clickable}
                >
                  {product.Status}
                </span>
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

// Add Product Component
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
    <div style={styles.contentArea}>
      <h1 style={styles.heading}>Add New Product</h1>
      <div>
        <div style={styles.formSection}>
          <div style={styles.sectionTitle}>Product Information</div>
          <div style={styles.fieldGroup}>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Product Name</label>
              <input
                type="text"
                name="Prod_name"
                value={formData.Prod_name}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Company ID</label>
              <input
                type="text"
                value={user?.c_id || ''}
                style={styles.fieldInputDisabled}
                disabled
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Model Number</label>
              <input
                type="text"
                name="Model_no"
                value={formData.Model_no}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Company Name</label>
              <input
                type="text"
                value={user?.name || ''}
                style={styles.fieldInputDisabled}
                disabled
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Production Year</label>
              <input
                type="text"
                name="prod_year"
                value={formData.prod_year}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Stock</label>
              <input
                type="text"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Stock Availability</label>
              <select
                name="stockavailability"
                value={formData.stockavailability}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Description</label>
              <input
                type="text"
                name="prod_description"
                value={formData.prod_description}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Company Selling Price</label>
              <input
                type="text"
                name="Retail_price"
                value={formData.Retail_price}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Warranty Period</label>
              <input
                type="text"
                name="warrantyperiod"
                value={formData.warrantyperiod}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Installation</label>
              <select
                name="installation"
                value={formData.installation}
                onChange={handleChange}
                style={styles.fieldInput}
                required
              >
                <option value="">Select Installation</option>
                <option value="Required">Required</option>
                <option value="Not Required">Not Required</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Installation Type</label>
              <select
                name="installationType"
                value={formData.installationType}
                onChange={handleChange}
                style={formData.installation === 'Required' ? styles.fieldInput : styles.fieldInputDisabled}
                disabled={formData.installation !== 'Required'}
              >
                <option value="">Select Type</option>
                <option value="Paid">Paid</option>
                <option value="Free">Free</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Installation Charge</label>
              <input
                type="text"
                name="installationcharge"
                value={formData.installationcharge}
                onChange={handleChange}
                style={formData.installationType === 'Paid' ? styles.fieldInput : styles.fieldInputDisabled}
                disabled={formData.installationType !== 'Paid'}
              />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.fieldLabel}>Product Photos</label>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ ...styles.fieldInput, padding: '10px 0' }}
                multiple
                accept="image/*"
                required
              />
            </div>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          style={styles.submitBtn}
          disabled={loading}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#636e72')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#2d3436')}
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
        {error && <div style={styles.errorMessage}>{error}</div>}
      </div>
      <span 
        onClick={onBack}
        style={styles.backLink}
        onMouseEnter={(e) => e.target.style.color = '#636e72'}
        onMouseLeave={(e) => e.target.style.color = '#2d3436'}
      >
        Back to Products
      </span>
    </div>
  );
};

// Product Details Component
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
        setError(result.message || 'An error occurred while updating stock availability.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  if (loading) return <div style={styles.contentArea}><p>Loading...</p></div>;
  if (error && !product) return <div style={styles.contentArea}><p style={styles.errorMessage}>Error: {error}</p></div>;
  if (!product) return <div style={styles.contentArea}><p>Product not found.</p></div>;

  return (
    <div style={styles.contentArea}>
      <h1 style={styles.heading}>Product Details</h1>
      <div style={styles.photos}>
        {product.prod_photos && product.prod_photos.map((photo, index) => (
          <img key={index} src={photo} alt="Product Photo" style={styles.photoThumbnail} />
        ))}
      </div>
      <div style={styles.formSection}>
        <div style={styles.sectionTitle}>Product Information</div>
        <div style={styles.fieldGroup}>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Product ID</label>
            <input type="text" value={product.prod_id} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Product Name</label>
            <input type="text" value={product.Prod_name} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Company ID</label>
            <input type="text" value={product.Com_id} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Model Number</label>
            <input type="text" value={product.Model_no} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Company Name</label>
            <input type="text" value={product.com_name} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Production Year</label>
            <input type="text" value={product.prod_year} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Stock</label>
            <input type="text" value={product.stock} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Stock Availability</label>
            <select
              value={stockAvailability}
              onChange={(e) => setStockAvailability(e.target.value)}
              style={styles.fieldInput}
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
            <button 
              onClick={handleUpdateAvailability}
              style={styles.updateBtn}
              onMouseEnter={(e) => e.target.style.background = '#636e72'}
              onMouseLeave={(e) => e.target.style.background = '#2d3436'}
            >
              Update Availability
            </button>
            {error && <div style={styles.errorMessage}>{error}</div>}
            {message && <div style={styles.successMessage}>{message}</div>}
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Status</label>
            <input type="text" value={product.Status} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Description</label>
            <input type="text" value={product.prod_description} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Company Selling Price</label>
            <input type="text" value={product.Retail_price} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Created At</label>
            <input type="text" value={product.createdAt || 'N/A'} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Approved At</label>
            <input type="text" value={product.approvedAt || 'N/A'} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Warranty Period</label>
            <input type="text" value={product.warrantyperiod} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Installation</label>
            <input type="text" value={product.installation} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Installation Type</label>
            <input type="text" value={product.installationType || 'N/A'} style={styles.fieldInputDisabled} disabled />
          </div>
          <div style={styles.fieldWrapper}>
            <label style={styles.fieldLabel}>Installation Charge</label>
            <input type="text" value={product.installationcharge || 'N/A'} style={styles.fieldInputDisabled} disabled />
          </div>
        </div>
      </div>
      <span 
        onClick={onBack}
        style={styles.backLink}
        onMouseEnter={(e) => e.target.style.color = '#636e72'}
        onMouseLeave={(e) => e.target.style.color = '#2d3436'}
      >
        Back to Products
      </span>
    </div>
  );
};

// Main App Component
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
    <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={styles.container}>
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
    </div>
  );
};

export default CompanyProductsApp;