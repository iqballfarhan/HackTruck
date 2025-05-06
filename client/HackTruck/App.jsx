import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadScript } from '@react-google-maps/api';
import store from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import DriverPosts from './pages/DriverPosts';
import NotFound from './pages/NotFound';

// Define libraries as a static array outside the component
const googleMapsLibraries = ['places'];

const App = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "713517391777-3sfb91kna4sibldihbrngjgflp2d0djd.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={googleMapsLibraries} // Use the static array
        >
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/posts" element={<DriverPosts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </LoadScript>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;