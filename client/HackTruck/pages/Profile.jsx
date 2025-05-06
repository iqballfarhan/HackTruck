import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
// Import React logo dari assets
import reactLogo from '../src/assets/react.svg';
// Import actions from authSlice
import { updateUser } from '../store/slices/authSlice';
import api from '../store/api';

// Defining the component directly as a named export
export default function Profile() {
  const { user, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Error and success states
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect ke halaman login jika pengguna belum login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Tampilkan loading spinner jika sedang memuat data
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Menggunakan logo React SVG sebagai default avatar
  const defaultAvatar = reactLogo;
  
  // Handle form input changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Make API call to update profile
      const response = await api.post('/api/auth/profile/update', profileForm);
      
      // Update user in Redux state
      dispatch(updateUser(response.data));
      setProfileSuccess('Profile updated successfully!');
      
      // Close modal after short delay
      setTimeout(() => {
        setShowEditModal(false);
        setProfileSuccess(null);
      }, 1500);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsSubmitting(true);
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Make API call to change password
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Reset form and close modal after short delay
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow border-0 rounded-3">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="card-title mb-0">User Profile</h3>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-4 text-center mb-4 mb-md-0">
                  <div className="avatar-container mb-3">
                    <img 
                      src={defaultAvatar} 
                      alt="Profile" 
                      className="rounded-circle img-thumbnail" 
                      style={{width: '150px', height: '150px', objectFit: 'cover'}}
                    />
                  </div>
                  <h4 className="mb-1">{user.username}</h4>
                  <span className="badge bg-secondary">{user.role}</span>
                </div>
                <div className="col-md-8">
                  <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>
                  <div className="mb-3 row">
                    <div className="col-sm-4"><strong>Full Name:</strong></div>
                    <div className="col-sm-8">{user.name || user.username}</div>
                  </div>
                  <div className="mb-3 row">
                    <div className="col-sm-4"><strong>Email:</strong></div>
                    <div className="col-sm-8">{user.email}</div>
                  </div>
                  <div className="mb-3 row">
                    <div className="col-sm-4"><strong>Role:</strong></div>
                    <div className="col-sm-8">
                      {user.role === 'driver' ? (
                        <span className="badge bg-info">Driver</span>
                      ) : (
                        <span className="badge bg-success">Customer</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <div className="col-sm-4"><strong>Account Created:</strong></div>
                    <div className="col-sm-8">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <h5 className="border-bottom pb-2 mb-3 mt-4">Account Actions</h5>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      Edit Profile
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <i className="bi bi-shield-lock me-2"></i>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Profile</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="modal-body">
                  {profileError && (
                    <div className="alert alert-danger">{profileError}</div>
                  )}
                  {profileSuccess && (
                    <div className="alert alert-success">{profileSuccess}</div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Change Password</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPasswordModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  {passwordError && (
                    <div className="alert alert-danger">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="alert alert-success">{passwordSuccess}</div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}