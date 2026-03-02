import React, { useState, useContext, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './CompanyLogin.module.css';

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

const CompanyLogin = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const { companyLogin, companySignup, isAuthenticated } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [signupData, setSignupData] = useState({ userId: '', email: '', password: '', confirm_password: '' });
  const containerRef = useRef(null);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleLoginChange  = (e) => { setLoginData(d => ({ ...d, [e.target.name]: e.target.value })); setError(''); };
  const handleSignupChange = (e) => { setSignupData(d => ({ ...d, [e.target.name]: e.target.value })); setError(''); };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await companyLogin(loginData); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (signupData.password !== signupData.confirm_password) { setError('Passwords do not match'); setLoading(false); return; }
    try { await companySignup(signupData); }
    catch (err) { setError(err.response?.data?.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  const switchView = (target) => {
    if (target === isLoginView || transitioning) return;
    setTransitioning(true);
    if (containerRef.current) containerRef.current.className = `${styles.authContainer} ${styles.exit}`;
    setTimeout(() => {
      setIsLoginView(target);
      setError('');
      setLoginData({ userId: '', password: '' });
      setSignupData({ userId: '', email: '', password: '', confirm_password: '' });
      setShowPwd(false); setShowCPwd(false);
      if (containerRef.current) containerRef.current.className = `${styles.authContainer} ${styles.enter}`;
      setTimeout(() => {
        if (containerRef.current) containerRef.current.className = styles.authContainer;
        setTransitioning(false);
      }, 420);
    }, 270);
  };

  const loginImage  = 'https://plus.unsplash.com/premium_photo-1664476845274-27c2dabdd7f0?w=900&auto=format&fit=crop&q=80';
  const signupImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContainer}>

        {/* ── IMAGE PANEL ── */}
        <div className={`${styles.imageSection} ${!isLoginView ? styles.order2 : styles.order1}`}>
          <img src={isLoginView ? loginImage : signupImage} alt="" aria-hidden="true" />
          <div className={styles.imageOverlay} />
          <div className={styles.imgBrand}>Electroland</div>
          <div className={styles.imgCopy}>
            <p className={styles.imgTag}>Company Portal</p>
            <h2 className={styles.imgTitle}>
              {isLoginView ? <>Business<br /><em>command centre.</em></> : <>Scale with<br /><em>Electroland.</em></>}
            </h2>
            <p className={styles.imgSub}>
              {isLoginView
                ? 'Manage teams, analytics, inventory and sales — all in one workspace.'
                : 'Register your company and unlock the full suite of business tools.'}
            </p>
            <div className={styles.imgDots}>
              <span className={isLoginView ? styles.dotActive : ''} />
              <span className={!isLoginView ? styles.dotActive : ''} />
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className={`${styles.authContainerWrapper} ${!isLoginView ? styles.order1 : styles.order2}`}>
          <div className={styles.authContainer} ref={containerRef}>

            {/* Tabs */}
            <div className={styles.tabs} role="tablist">
              <button role="tab" type="button"
                className={`${styles.tab} ${isLoginView ? styles.tabActive : ''}`}
                onClick={() => switchView(true)}>Sign In</button>
              <button role="tab" type="button"
                className={`${styles.tab} ${!isLoginView ? styles.tabActive : ''}`}
                onClick={() => switchView(false)}>Sign Up</button>
              <div className={styles.tabPill} style={{ transform: `translateX(${isLoginView ? '0%' : '100%'})` }} />
            </div>

            {/* Heading */}
            <div className={styles.formHeading}>
              <h2>{isLoginView ? 'Company Login' : 'Register Company'}</h2>
              <p>{isLoginView ? 'Access your company portal below.' : 'Set up your company account today.'}</p>
            </div>

            {error && <div className={styles.errorMessage}><AlertCircle />{error}</div>}

            {/* ── LOGIN FORM ── */}
            {isLoginView && (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className={styles.fieldWrap}>
                  <input type="text" name="userId" id="cl-uid" placeholder=" "
                    value={loginData.userId} onChange={handleLoginChange} autoComplete="username" />
                  <label htmlFor="cl-uid" className={styles.fieldLabel}>User ID</label>
                </div>
                <div className={styles.fieldWrap}>
                  <input type={showPwd ? 'text' : 'password'} name="password" id="cl-pwd" placeholder=" "
                    value={loginData.password} onChange={handleLoginChange} autoComplete="current-password" />
                  <label htmlFor="cl-pwd" className={styles.fieldLabel}>Password</label>
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                    {showPwd ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                <div className={styles.forgotRow}>
                  <a href="/forgot-password" className={styles.forgotLink}>Forgot password?</a>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? <><span className={styles.spinner} />Signing in…</> : 'Sign In  →'}
                </button>
                <div className={styles.linkContainer}>
                  <span>Don't have an account?&nbsp;</span>
                  <button type="button" className={styles.switchCta} onClick={() => switchView(false)}>Sign Up</button>
                </div>
              </form>
            )}

            {/* ── SIGNUP FORM ── */}
            {!isLoginView && (
              <form onSubmit={handleSignupSubmit} noValidate>
                <div className={styles.fieldWrap}>
                  <input type="text" name="userId" id="cs-uid" placeholder=" "
                    value={signupData.userId} onChange={handleSignupChange} autoComplete="username" />
                  <label htmlFor="cs-uid" className={styles.fieldLabel}>User ID</label>
                </div>
                <div className={`${styles.fieldWrap} ${styles.fieldIn}`} style={{animationDelay:'.04s'}}>
                  <input type="email" name="email" id="cs-email" placeholder=" "
                    value={signupData.email} onChange={handleSignupChange} autoComplete="email" />
                  <label htmlFor="cs-email" className={styles.fieldLabel}>Company Email</label>
                </div>
                <div className={`${styles.fieldWrap} ${styles.fieldIn}`} style={{animationDelay:'.08s'}}>
                  <input type={showPwd ? 'text' : 'password'} name="password" id="cs-pwd" placeholder=" "
                    value={signupData.password} onChange={handleSignupChange} autoComplete="new-password" />
                  <label htmlFor="cs-pwd" className={styles.fieldLabel}>Password</label>
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                    {showPwd ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                <div className={`${styles.fieldWrap} ${styles.fieldIn}`} style={{animationDelay:'.12s'}}>
                  <input type={showCPwd ? 'text' : 'password'} name="confirm_password" id="cs-cpwd" placeholder=" "
                    value={signupData.confirm_password} onChange={handleSignupChange} autoComplete="new-password" />
                  <label htmlFor="cs-cpwd" className={styles.fieldLabel}>Confirm Password</label>
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowCPwd(v => !v)} tabIndex={-1}>
                    {showCPwd ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? <><span className={styles.spinner} />Creating account…</> : 'Create Account  →'}
                </button>
                <div className={styles.linkContainer}>
                  <span>Already registered?&nbsp;</span>
                  <button type="button" className={styles.switchCta} onClick={() => switchView(true)}>Sign In</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;