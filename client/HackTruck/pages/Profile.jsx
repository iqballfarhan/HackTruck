import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
// Import React logo dari assets
import reactLogo from '../src/assets/react.svg';

const Profile = () => {
  const { user, loading } = useSelector(state => state.auth);
  
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
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-pencil-square me-2"></i>
                      Edit Profile
                    </button>
                    <button className="btn btn-outline-danger">
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
    </div>
  );
};

export default Profile;