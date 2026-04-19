import React, { useState } from 'react';
import api from '../api/api';
import './ContactUs.css';

/* ── SVG Icons ──────────────────────────────────────────── */
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18 19.5 19.5 0 0 1 4.16 12 19.79 19.79 0 0 1 1.07 3.35 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81A2 2 0 0 1 8.25 7.7L7.09 8.91a16 16 0 0 0 5.93 5.93l1.18-1.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Component ──────────────────────────────────────────── */
const ContactUs = () => {
  const [formData, setFormData] = useState({ phone: '', email: '', message: '' });
  const [status,   setStatus]   = useState({ type: '', message: '' });
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const validateForm = () => {
    const { phone, email, message } = formData;
    const phonePattern = /^\+?([0-9]{1,3})?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phone) return 'Phone number is required.';
    if (!phonePattern.test(phone)) return 'Please enter a valid phone number.';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required.';
    if (!emailPattern.test(email)) return 'Please enter a valid email address.';
    if (!message) return 'Message is required.';
    if (message.length < 10) return 'Message must be at least 10 characters long.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) { setStatus({ type: 'error', message: error }); return; }
    setLoading(true);
    try {
      const res = await api.post('/contact/submit', formData);
      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        setFormData({ phone: '', email: '', message: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">

        {/* ── FORM SIDE ── */}
        <div className="form-side">
          <div className="form-inner">

            <div className="contact-overline">Get In Touch</div>
            <h1 className="contact-title">
              Let's <span>Talk</span>
            </h1>
            <p className="contact-subtitle">
              Have a question or need assistance? Drop us a message and we'll get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="phone">jjjjjjjjjjjjjjjjjjjjjjjj</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="+91 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
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
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="submit-btn__spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconSend />
                    Send Message
                  </>
                )}
              </button>

              {status.message && (
                <div className={`feedback-msg ${status.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                  {status.type === 'error' ? <IconX /> : <IconCheck />}
                  {status.message}
                </div>
              )}
            </form>

          </div>
        </div>

        {/* ── IMAGE SIDE ── */}
        <div className="image-side">
          <div className="image-side__bg" />
          <div className="image-side__overlay" />
          <div className="image-side__content">
            <div className="image-side__tag">Electroland</div>
            <h2 className="image-side__title">
              We're Here<br />to <em>Help You</em>
            </h2>
            <p className="image-side__sub">
              Our team is always ready to assist you — from product advice to after-sales support.
            </p>
            <div className="image-side__info">
              <div className="image-side__info-item">
                <div className="image-side__info-icon"><IconMapPin /></div>
                Guntur, Andhra Pradesh, India
              </div>
              <div className="image-side__info-item">
                <div className="image-side__info-icon"><IconPhone /></div>
                +91 234 567 890
              </div>
              <div className="image-side__info-item">
                <div className="image-side__info-icon"><IconMail /></div>
                seshasaisachand.a23@iits.in
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;