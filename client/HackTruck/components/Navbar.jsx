import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import reactLogo from '../src/assets/react.svg';

const Navbar = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate('/login');
  };

  // Determine the home link destination based on user role
  const getHomeLinkDestination = () => {
    if (user?.role === 'driver') {
      return '/driver/dashboard';
    }
    return '/';
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{
        background: 'linear-gradient(135deg, #007bff, #0056b3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '0.75rem 0',
      }}
    >
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center"
          to={getHomeLinkDestination()}
          style={{ fontSize: '1.5rem', fontWeight: '700' }}
        >
          <img
            src={reactLogo}
            alt="HackTruck Logo"
            className="me-2"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'white',
              padding: '3px',
              objectFit: 'contain',
            }}
          />
          <i className="bi bi-truck me-2"></i>
          HacTruck
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          {/* Navigation menu */}
          <ul className="navbar-nav mx-auto">
            {user?.role !== 'driver' && (
              <li className="nav-item mx-2">
                <Link
                  className="nav-link d-flex align-items-center"
                  to={getHomeLinkDestination()}
                  style={{ fontWeight: '500' }}
                >
                  <i className="bi bi-house-door me-2"></i> Home
                </Link>
              </li>
            )}
            <li className="nav-item mx-2">
              <Link
                className="nav-link d-flex align-items-center"
                to="/posts/all"
                style={{ fontWeight: '500' }}
              >
                <i className="bi bi-truck me-2"></i> All Trucks
              </Link>
            </li>
            {user?.role === 'driver' && (
              <>
                <li className="nav-item mx-2">
                  <Link
                    className="nav-link d-flex align-items-center"
                    to="/driver/dashboard"
                    style={{ fontWeight: '500' }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item mx-2">
                  <Link
                    className="nav-link d-flex align-items-center"
                    to="/driver/posts"
                    style={{ fontWeight: '500' }}
                  >
                    <i className="bi bi-list-check me-2"></i> My Listings
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* User menu */}
          {user ? (
            <div className="d-flex align-items-center">
              <Link
                to="/profile"
                className="btn btn-light me-3"
                style={{
                  borderRadius: '50px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="bi bi-person-circle me-2"></i>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{
                  borderRadius: '50px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <Link
                to="/login"
                className="btn btn-light"
                style={{
                  borderRadius: '50px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="bi bi-person-circle me-2"></i>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;