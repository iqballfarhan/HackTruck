import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadScript } from '@react-google-maps/api';
import { store } from '../store/store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import Navbar from '../components/Navbar.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import DriverDashboard from '../pages/DriverDashboard.jsx';
import DriverPosts from '../pages/DriverPosts.jsx';
import AllPosts from '../pages/AllPosts.jsx';
import Profile from '../pages/Profile.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "713517391777-3sfb91kna4sibldihbrngjgflp2d0djd.apps.googleusercontent.com";

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const hideNavbarPaths = ['/login', '/register'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);
  
  // Check auth status on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/posts" element={<DriverPosts />} />
        <Route path="/posts/all" element={<AllPosts />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places']} // Add libraries if needed (e.g., for autocomplete)
      >
        <Provider store={store}>
          <Router>
            <AppContent />
          </Router>
        </Provider>
      </LoadScript>
    </GoogleOAuthProvider>
  );
}

export default App;