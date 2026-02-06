import React, { useState } from 'react';
import api from '../api/api';
import './ContactUs.css'; // Import the CSS file created above

const ContactUs = () => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    type: '', // 'success' or 'error'
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear status when user types
    if (status.message) setStatus({ type: '', message: '' });
  };

  const validateForm = () => {
    const { phone, email, message } = formData;
    
    // Phone Regex
    const phonePattern = /^\+?([0-9]{1,3})?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phone) return 'Phone number is required.';
    if (!phonePattern.test(phone)) return 'Please enter a valid phone number.';

    // Email Regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required.';
    if (!emailPattern.test(email)) return 'Please enter a valid email address.';

    // Message Length
    if (!message) return 'Message is required.';
    if (message.length < 10) return 'Message must be at least 10 characters long.';

    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setLoading(true);

    try {
      // Using api instance which has CSRF token handling built-in
      const res = await api.post('/contact/submit', formData);

      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        setFormData({ phone: '', email: '', message: '' }); // Reset form
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        
        {/* Left Side: Form */}
        <div className="form-side">
          <h2 className="contact-title">Contact Us</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email ID</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                className="form-input"
                placeholder="Enter your message..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            {status.message && (
              <div className={`feedback-msg ${status.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Image */}
        <div className="image-side">
          <div className="image-overlay"></div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;