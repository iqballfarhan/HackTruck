import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDriverPosts } from '../store/slices/postSlice';
import PostCard from '../components/PostCard';
import { Navigate } from 'react-router-dom';

const DriverPosts = () => {
  const dispatch = useDispatch();
  const { driverPosts, loading } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Only fetch if the user is a driver
    if (user?.role === 'driver') {
      dispatch(fetchDriverPosts());
    }
    
    // Make sure the page takes the full width
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.width = '100%';
    
    return () => {
      // Clean up
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.width = '';
    };
  }, [dispatch, user]);

  // Redirect if user is not logged in or not a driver
  if (!user || user.role !== 'driver') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container-fluid p-0" style={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <div className="container my-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Your Truck Listings</h2>
              {driverPosts && driverPosts.length > 0 && (
                <span className="badge bg-primary rounded-pill">{driverPosts.length}</span>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your listings...</p>
              </div>
            ) : driverPosts.length === 0 ? (
              <div className="alert alert-info text-center py-4">
                <i className="bi bi-truck fs-1 mb-3"></i>
                <h5>No listings yet</h5>
                <p>You don't have any truck listings. Create a new one from your dashboard!</p>
                <a href="/driver/dashboard" className="btn btn-primary mt-2">
                  Go to Dashboard
                </a>
              </div>
            ) : (
              <div className="row">
                {driverPosts.map(post => (
                  <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPosts;