import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { checkAuth } from '../store/slices/authSlice';
import PostForm from '../components/PostForm';

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

  useEffect(() => {
    // Temporarily disable checkAuth until the server endpoint is fixed
    // dispatch(checkAuth());
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.width = '100%';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.width = '';
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'driver') {
    return <Navigate to="/" />;
  }

  return (
    <div className="container-fluid p-0" style={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <div className="container my-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-lg mb-5">
              <div className="card-header bg-white py-3">
                <h4 className="mb-0">Driver Dashboard</h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger mb-4 text-center">
                    {error} - Please try logging in again.
                  </div>
                )}
                <div className="row mb-4">
                  <div className="col-md-8 offset-md-2">
                    <div className="alert alert-info">
                      <h5 className="alert-heading">
                        <i className="bi bi-info-circle me-2"></i>
                        Welcome to your Dashboard!
                      </h5>
                      <p className="mb-0">
                        Here you can create new truck listings for customers to find.
                        You can view and manage all your listings from the "My Listings" page in the navigation bar.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h5 className="mb-3 text-center">Add New Truck Listing</h5>
                <PostForm onMapGenerated={setMapEmbedUrl} />
                {mapEmbedUrl && (
                  <div className="mb-4">
                    <h6 className="mb-2">
                      <i className="bi bi-map me-2"></i>Map Preview
                    </h6>
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: '8px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;