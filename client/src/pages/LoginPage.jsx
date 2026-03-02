import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import './LoginPage.css';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:'1px'}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const FloatField = ({ id, type, name, value, onChange, label, autoComplete, showToggle, showValue, onToggle, delay }) => (
  <div className="field-wrap" style={delay ? {animationDelay: delay} : {}}>
    <input
      type={showToggle ? (showValue ? 'text' : 'password') : (type || 'text')}
      id={id} name={name} value={value} onChange={onChange}
      className="form-input" placeholder=" " autoComplete={autoComplete}
    />
    <label htmlFor={id} className="field-label">{label}</label>
    {showToggle && (
      <button type="button" className="eye-btn" onClick={onToggle} tabIndex={-1}>
        {showValue ? <EyeOpen /> : <EyeClosed />}
      </button>
    )}
  </div>
);

const LoginPage = () => {
  const { login, signup } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [formData, setFormData] = useState({ userId: '', password: '', email: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const { userId, password, email, confirmPassword } = formData;
  const onChange = (e) => { setFormData(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isLoginMode) {
        if (!userId || !password) { setError('Please fill in all fields'); return; }
        await login({ userId, password });
      } else {
        if (!userId || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        await signup({ userId, email, password, confirmPassword });
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const switchMode = (target) => {
    if (target === isLoginMode || transitioning) return;
    setTransitioning(true);
    if (wrapRef.current) wrapRef.current.className = 'auth-form-wrapper mode-exit';
    setTimeout(() => {
      setIsLoginMode(target);
      setError('');
      setFormData({ userId: '', password: '', email: '', confirmPassword: '' });
      setShowPwd(false); setShowCPwd(false);
      if (wrapRef.current) wrapRef.current.className = 'auth-form-wrapper mode-enter';
      setTimeout(() => {
        if (wrapRef.current) wrapRef.current.className = 'auth-form-wrapper';
        setTransitioning(false);
      }, 420);
    }, 270);
  };

  const loginImage  = 'employee.jpg';
  const signupImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80';

  return (
    <div className="login-page-body">
      <div className="main-container">
        {/* ── IMAGE PANEL ── */}
        <div className="image-section" style={{ order: isLoginMode ? 1 : 2 }}>
          <img src={isLoginMode ? loginImage : signupImage} alt="" aria-hidden="true" />
          <div className="image-overlay" />
          <div className="img-brand">Electroland</div>
          <div className="img-copy">
            <p className="img-copy__tag">Employee Portal</p>
            <h2 className="img-copy__title">
              {isLoginMode ? <>Your work,<br /><em>your tools.</em></> : <>Start your<br /><em>journey.</em></>}
            </h2>
            <p className="img-copy__sub">
              {isLoginMode
                ? 'Sign in to access dashboards, reports, and your full workspace.'
                : 'Create an account and join the Electroland team today.'}
            </p>
            <div className="img-copy__dots">
              <span className={isLoginMode ? 'on' : ''} />
              <span className={!isLoginMode ? 'on' : ''} />
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className="auth-container" style={{ order: isLoginMode ? 2 : 1 }}>
          <div className="auth-form-wrapper" ref={wrapRef}>

            {/* Tabs */}
            <div className="mode-tabs" role="tablist">
              <button role="tab" type="button"
                className={`mode-tab${isLoginMode ? ' is-active' : ''}`}
                onClick={() => switchMode(true)}>Sign In</button>
              <button role="tab" type="button"
                className={`mode-tab${!isLoginMode ? ' is-active' : ''}`}
                onClick={() => switchMode(false)}>Sign Up</button>
              <div className="mode-tab-pill" style={{ transform: `translateX(${isLoginMode ? '0%' : '100%'})` }} />
            </div>

            {/* Heading */}
            <div className="form-heading">
              <h2>{isLoginMode ? 'Employee Login' : 'Create Account'}</h2>
              <p>{isLoginMode ? 'Welcome back — sign in to continue.' : 'Fill in your details to get started.'}</p>
            </div>

            {/* Error */}
            {error && <div className="error-message"><AlertCircle />{error}</div>}

            {/* Form */}
            <form onSubmit={onSubmit} noValidate>
              <FloatField id="f-uid" name="userId" label="User ID" value={userId} onChange={onChange} autoComplete="username" />

              {!isLoginMode && (
                <FloatField id="f-email" type="email" name="email" label="Email Address"
                  value={email} onChange={onChange} autoComplete="email"
                  delay=".04s" />
              )}

              <FloatField id="f-pwd" name="password" label="Password"
                value={password} onChange={onChange}
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                showToggle showValue={showPwd} onToggle={() => setShowPwd(v => !v)} />

              {!isLoginMode && (
                <FloatField id="f-cpwd" name="confirmPassword" label="Confirm Password"
                  value={confirmPassword} onChange={onChange} autoComplete="new-password"
                  showToggle showValue={showCPwd} onToggle={() => setShowCPwd(v => !v)}
                  delay=".06s" />
              )}

              {isLoginMode && (
                <div className="forgot-row">
                  <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" />{isLoginMode ? 'Signing in…' : 'Creating account…'}</>
                  : isLoginMode ? 'Sign In  →' : 'Create Account  →'}
              </button>

              <div className="link-container">
                {isLoginMode
                  ? <><span>New here?&nbsp;</span><span className="switch-cta" onClick={() => switchMode(false)}>Create an account</span></>
                  : <><span>Have an account?&nbsp;</span><span className="switch-cta" onClick={() => switchMode(true)}>Sign in</span></>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;