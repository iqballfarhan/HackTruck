import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin, checkAuth } from '../store/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import truckIcon from '../src/assets/react.svg';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="alert alert-warning text-center"
          style={{
            borderRadius: '10px',
            fontSize: '1rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: 'none',
          }}
        >
          Google Login issue: {this.state.error?.message || 'Unknown error'}. Please use email/password login or try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, token } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [googleError, setGoogleError] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showError, setShowError] = useState(false);

  // Use useCallback to memoize handleDismissError
  const handleDismissError = useCallback(() => {
    setShowError(false);
    setFormErrors({});
    setGoogleError(null);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (err) {
        if (err !== 'No token found') {
          console.log('No valid session found:', err);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthentication();

    document.body.style.height = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.height = '';
      document.documentElement.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isCheckingAuth && user && token) {
      setShowError(false); // Clear error on successful login
      const navDelay = setTimeout(() => {
        if (user.role === 'driver') {
          navigate('/driver/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1500);
      
      return () => clearTimeout(navDelay);
    }
  }, [user, token, navigate, isCheckingAuth]);

  useEffect(() => {
    if (error || formErrors.general || googleError) {
      setShowError(true);
    }
  }, [error, formErrors.general, googleError]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    setGoogleError(null);

    if (Object.keys(errors).length === 0) {
      try {
        await dispatch(login(formData)).unwrap();
      } catch (err) {
        console.error('Login failed:', err);
        setFormErrors({ general: err || 'Login failed. Please try again.' });
      }
    }
  };

  const handleGoogleLogin = async (credential) => {
    console.log('Attempting Google Login with credential:', credential);
    try {
      await dispatch(googleLogin(credential)).unwrap();
      setGoogleError(null);
    } catch (error) {
      console.error('Google login failed:', error);
      setGoogleError('Google login failed: ' + (error?.message || 'Server error') + '. Please try again or use email login.');
    }
  };

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center"
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #6b48ff, #00ddeb)',
        overflow: 'auto',
      }}
    >
      <div className="row justify-content-center w-100">
        <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
          <div
            className="card d-flex align-items-center justify-content-center p-4 shadow-lg"
            style={{
              maxWidth: '500px',
              width: '100%',
              margin: '0 auto',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <div className="text-center mb-3">
                <img 
                  src={truckIcon} 
                  alt="HackTruck Logo" 
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    marginBottom: '10px'
                  }} 
                />
              </div>
              <h2
                className="text-center mb-4"
                style={{
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  color: '#2d2d2d',
                  letterSpacing: '0.5px',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Welcome to HacTruck
              </h2>
              {showError && (error || formErrors.general || googleError) && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4 text-center"
                  style={{
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: 'none',
                  }}
                >
                  {error === "Invalid credentials" ? "Invalid password or email. Please check your login details and try again." : (formErrors.general || googleError || error)}
                  <button type="button" className="btn-close" onClick={handleDismissError} aria-label="Close"></button>
                </div>
              )}
              {isCheckingAuth ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Checking session...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className="form-label"
                      style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#4b5563',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      style={{
                        height: '45px',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        padding: '0.75rem 1.25rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        transition: 'all 0.3s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#6b48ff')}
                      onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                  <div className="mb-4">
                    <label
                      className="form-label"
                      style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#4b5563',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      style={{
                        height: '45px',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        padding: '0.75rem 1.25rem',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#f9fafb',
                        transition: 'all 0.3s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#6b48ff')}
                      onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                    />
                    {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                  </div>
                  <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                    style={{
                      height: '45px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6b48ff, #00ddeb)',
                      border: 'none',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = '0.9')}
                    onMouseOut={(e) => (e.target.style.opacity = '1')}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              )}
              <div className="d-flex align-items-center my-4">
                <hr style={{ flex: 1, borderColor: '#d1d5db' }} />
                <span
                  style={{
                    margin: '0 1rem',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  or
                </span>
                <hr style={{ flex: 1, borderColor: '#d1d5db' }} />
              </div>
              <ErrorBoundary>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log('Google Login Success:', credentialResponse);
                    handleGoogleLogin(credentialResponse.credential);
                  }}
                  onError={(error) => {
                    console.error('Google Login Client Error:', error);
                    setGoogleError('Google login failed: Client error. Please try again.');
                  }}
                  text="signin_with"
                  shape="rectangular"
                  width="400"
                  theme="filled_blue"
                  size="large"
                />
              </ErrorBoundary>
              <div
                className="mt-3 text-center"
                style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Don't have an account?{' '}
                <a
                  href="/register"
                  style={{
                    color: '#6b48ff',
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;