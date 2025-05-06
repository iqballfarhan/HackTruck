import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../store/slices/postSlice';
import PostCard from '../components/PostCard';
import AiRecommendation from '../components/AiRecommendation';

const AllPosts = () => {
  const dispatch = useDispatch();
  const { posts, loading, totalPages, currentPage } = useSelector(state => state.posts);
  const [filters, setFilters] = useState({
    search: '',
    truckType: '',
    sortBy: 'createdAt',
    order: 'DESC',
    page: 1,
  });

  useEffect(() => {
    dispatch(fetchPosts(filters));
    
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
  }, [filters, dispatch]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div className="container-fluid p-0" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="container py-4">
        {/* Search and Filter Section */}
        <div className="card shadow border-0 rounded-lg mb-5">
          <div className="card-header bg-white py-4">
            <h3 className="mb-0">Find Available Trucks</h3>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-3 mb-3 mb-md-0">
                <label className="form-label">Search</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Origin or destination"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <label className="form-label">Truck Type</label>
                <select
                  className="form-select"
                  name="truckType"
                  value={filters.truckType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Truck Types</option>
                  <option value="pickup">Pickup</option>
                  <option value="box">Box</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="refrigerated">Refrigerated</option>
                </select>
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <label className="form-label">Sort By</label>
                <select
                  className="form-select"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="createdAt">Newest First</option>
                  <option value="maxWeight">Weight</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Order</label>
                <select
                  className="form-select"
                  name="order"
                  value={filters.order}
                  onChange={handleFilterChange}
                >
                  <option value="DESC">High to Low</option>
                  <option value="ASC">Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Section */}
        <AiRecommendation />

        {/* Results Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Available Trucks</h2>
          {posts && posts.length > 0 && (
            <span className="badge bg-primary rounded-pill">{posts.length}</span>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading available trucks...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <i className="bi bi-truck fs-1 mb-3"></i>
            <h4>No trucks available</h4>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="row">
            {posts.map(post => (
              <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                <PostCard post={post} showControls={false} />
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setFilters({ ...filters, page })}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;