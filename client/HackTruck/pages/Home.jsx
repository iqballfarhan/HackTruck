import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import AnimatedTruck from '../components/AnimatedTruck';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.width = '100%';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.width = '';
    };
  }, []);

  const handleFindTrucks = () => {
    navigate('/posts/all');
  };

  return (
    <div className="container-fluid p-0" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <div className="container py-5">
        <div className="row mb-1">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#333' }}>Find The Perfect Truck For Your Delivery</h1>
            <p className="lead text-muted mb-2">Fast, reliable, and secure truck transportation for all your delivery needs</p>
          </div>
        </div>

        {/* Animated Truck Section */}
        <div className="row mb-5">
          <div className="col-12">
            <AnimatedTruck />
          </div>
        </div>

        {/* Map Section - Full width */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden mb-5">
          <div className="card-body p-0 google-map-container" style={{ height: '400px', width: '100%', position: 'relative' }}>
            <Map />
          </div>
        </div>

        {/* Features Section */}
        <div className="row mt-5 mb-4">
          <div className="col-12 text-center">
            <h2 className="mb-4">Why Choose HacTruck?</h2>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-shield-check" style={{ fontSize: '2.5rem', color: '#007bff' }}></i>
                </div>
                <h4>Trusted Drivers</h4>
                <p className="text-muted">All our drivers are carefully vetted and verified for your peace of mind.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-speedometer" style={{ fontSize: '2.5rem', color: '#007bff' }}></i>
                </div>
                <h4>Fast Delivery</h4>
                <p className="text-muted">Our drivers are committed to timely delivery of your goods.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-truck" style={{ fontSize: '2.5rem', color: '#007bff' }}></i>
                </div>
                <h4>Wide Truck Selection</h4>
                <p className="text-muted">Find the perfect truck type for any size of cargo you need to transport.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="row mt-5">
          <div className="col-lg-10 mx-auto">
            <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: '15px' }}>
              <div className="card-body text-center text-white p-5">
                <h2 className="mb-3">Ready to ship your cargo?</h2>
                <p className="lead mb-4">Browse our selection of trucks and find the perfect one for your delivery needs.</p>
                <button 
                  className="btn btn-light btn-lg px-5 py-3 fw-bold" 
                  style={{ borderRadius: '10px' }}
                  onClick={handleFindTrucks}
                >
                  <i className="bi bi-truck me-2"></i>Find Trucks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;