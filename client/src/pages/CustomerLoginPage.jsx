import React, { useState, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import './CustomerLoginPage.css';

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:'1px'}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CustomerLoginPage = () => {
  const { customerLogin } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [goingBack, setGoingBack] = useState(false);
  const digitRefs = useRef([]);

  /* ── OTP input logic ── */
  const handleDigitChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (val && idx < 5) digitRefs.current[idx + 1]?.focus();
  };
  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) digitRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) digitRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) digitRefs.current[idx + 1]?.focus();
  };
  const handleDigitPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = [...digits];
    paste.split('').forEach((c, i) => { if (i < 6) next[i] = c; });
    setDigits(next);
    const lastFilled = Math.min(paste.length, 5);
    digitRefs.current[lastFilled]?.focus();
  };
  const otpValue = digits.join('');

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = (e) => {
    e.preventDefault(); setError('');
    if (!mobileNumber.trim().match(/^[0-9]{10}$/)) {
      setError('Please enter a valid 10-digit mobile number'); return;
    }
    const randomOtp = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(randomOtp);
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setGoingBack(false); setStep(2);
      alert(`Your OTP is: ${randomOtp}`);
      console.log('Debug OTP:', randomOtp);
    }, 800);
  };

  /* ── Step 2: Verify & Login ── */
  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    if (otpValue.length < 6) { setError('Please enter all 6 digits'); return; }
    if (parseInt(otpValue) !== generatedOtp) { setError('Invalid OTP. Please try again.'); return; }
    setLoading(true);
    try {
      await customerLogin(mobileNumber);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setGoingBack(true); setStep(1);
    } finally { setLoading(false); }
  };

  const handleBack = () => {
    setGoingBack(true);
    setTimeout(() => { setStep(1); setDigits(['','','','','','']); setError(''); }, 0);
  };

  const imageUrl = 'https://img.freepik.com/premium-vector/trendy-vector-design-secure-website_362714-3915.jpg?semt=ais_hybrid';

  return (
    <div className="customer-login-body">
      <div className="cl-main-container">

        {/* ── IMAGE PANEL ── */}
        <div className="cl-image-section">
          <img src={imageUrl} alt="" aria-hidden="true" />
          <div className="cl-image-overlay" />
          <div className="cl-image-copy">
            <p className="cl-image-tag">Customer Portal</p>
            <h2 className="cl-image-title">
              {step === 1 ? <>Quick &amp;<br /><em>secure login.</em></> : <>Almost<br /><em>there.</em></>}
            </h2>
            <p className="cl-image-sub">
              {step === 1
                ? 'Enter your mobile number to receive a one-time passcode.'
                : `We've sent a 6-digit code to your registered number.`}
            </p>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className="cl-auth-container">
          <div className="cl-form-box">

            {/* Step progress */}
            <div className="cl-progress">
              <div className="cl-step">
                <div className={`cl-step-circle ${step >= 1 ? 'done' : 'idle'}`}>
                  {step > 1 ? <CheckIcon /> : '1'}
                </div>
                <span className={`cl-step-label ${step === 1 ? 'active' : ''}`}>Mobile</span>
              </div>
              <div className={`cl-step-connector ${step > 1 ? 'done' : ''}`} />
              <div className="cl-step">
                <div className={`cl-step-circle ${step === 2 ? 'active' : 'idle'}`}>2</div>
                <span className={`cl-step-label ${step === 2 ? 'active' : ''}`}>Verify</span>
              </div>
            </div>

            <h2>{step === 1 ? 'Customer Login' : 'Enter OTP'}</h2>
            <p className="cl-step-desc">
              {step === 1
                ? 'Enter your 10-digit mobile number to continue.'
                : `A 6-digit code was sent to ${mobileNumber}.`}
            </p>

            {error && <div className="cl-error-message"><AlertCircle />{error}</div>}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form className={`cl-form${goingBack ? ' step-back' : ''}`} onSubmit={handleSendOtp} noValidate>
                <div className="cl-field-wrap">
                  <input
                    type="tel" className="cl-input" id="cl-mobile" placeholder=" "
                    value={mobileNumber}
                    onChange={(e) => { setMobileNumber(e.target.value); setError(''); }}
                    pattern="[0-9]{10}" maxLength={10} autoComplete="tel"
                  />
                  <label htmlFor="cl-mobile" className="cl-field-label">Mobile Number</label>
                </div>
                <button type="submit" className="cl-btn" disabled={loading}>
                  {loading ? <><span className="cl-spinner" />Sending OTP…</> : 'Send OTP  →'}
                </button>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form className="cl-form" onSubmit={handleLogin} noValidate>
                <div className="cl-sent-info">
                  <PhoneIcon />
                  <span>Code sent to <strong style={{color:'#faf5ea', fontWeight:500}}>{mobileNumber}</strong></span>
                </div>

                <label className="cl-otp-label">Enter 6-digit OTP</label>
                <div className="cl-otp-grid" onPaste={handleDigitPaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => digitRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      className={`cl-otp-digit${d ? ' filled' : ''}`}
                      value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(i, e)}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button type="submit" className="cl-btn" disabled={loading || otpValue.length < 6}>
                  {loading ? <><span className="cl-spinner" />Verifying…</> : 'Verify & Sign In  →'}
                </button>

                <div className="cl-change-number" onClick={handleBack}>Change Mobile Number</div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;