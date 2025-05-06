import { useSelector, useDispatch } from 'react-redux';
import { deletePost, updatePost } from '../store/slices/postSlice';
import { useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Map from './Map'; // Import the Map component directly

// Utility function to extract URL from iframe string if needed
const extractUrlFromIframe = (str) => {
  if (!str) return '';
  
  // Check if it's an iframe string
  if (str.includes('<iframe') && str.includes('src=')) {
    const srcMatch = str.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : '';
  }
  
  return str; // Return as is if it's already a URL
};

// Utility function to format phone number for WhatsApp
const formatWhatsAppNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace it with +62
  if (digits.startsWith('0')) {
    return '+62' + digits.substring(1);
  }
  
  // If number starts with 62, add + prefix
  if (digits.startsWith('62')) {
    return '+' + digits;
  }
  
  // Otherwise return as is
  return digits;
};

// Create WhatsApp link with formatted message
const createWhatsAppLink = (post) => {
  const formattedNumber = formatWhatsAppNumber(post.phoneNumber);
  
  // Create pre-formatted message with the new requested format
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan layanan transportasi Anda:\n` +
    `- Rute: ${post.origin} ke ${post.destination}\n` +
    `- Tanggal Keberangkatan: ${new Date(post.departureDate).toLocaleDateString()}\n` +
    `- Jenis Truk: ${post.truckType.charAt(0).toUpperCase() + post.truckType.slice(1)}\n` +
    `- Kapasitas Berat: ${post.maxWeight} kg\n` +
    `Apakah masih tersedia?`
  );
  
  return `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${message}`;
};

class MapErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    console.error('Map Error:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load map. Please try again later.</div>;
    }
    return this.props.children;
  }
}

const PostCard = ({ post, showControls = true }) => {
  const { user, error: authError } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    departureDate: post.departureDate.split('T')[0],
    origin: post.origin,
    destination: post.destination,
    truckType: post.truckType,
    maxWeight: post.maxWeight,
    phoneNumber: post.phoneNumber,
    price: post.price || 0,
    mapEmbedUrl: post.mapEmbedUrl || '',
  });
  const [image, setImage] = useState(null);
  const [center, setCenter] = useState({ lat: -6.2088, lng: 106.8456 });
  const [postError, setPostError] = useState(null);
  const [showError, setShowError] = useState(!!authError || !!postError);
  const [errorTimeout, setErrorTimeout] = useState(null);
  const [mapLoadingRetries, setMapLoadingRetries] = useState(0);
  const MAX_RETRIES = 5;

  // Use the proper Google Maps loading hook instead of manual checks
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  useEffect(() => {
    if (errorTimeout) {
      return () => clearTimeout(errorTimeout);
    }
  }, [errorTimeout]);

  // Geocode the post's origin to get map coordinates when maps are loaded
  useEffect(() => {
    const geocode = async () => {
      if (!mapsLoaded || !post.origin) return;
      
      try {
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: post.origin }, (results, status) => {
            if (status === "OK" && results[0]) {
              setCenter({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              });
            } else {
              console.log("Geocoding was not successful for the following reason:", status);
            }
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Retry loading if within retry limits
        if (mapLoadingRetries < MAX_RETRIES) {
          setTimeout(() => {
            setMapLoadingRetries(prev => prev + 1);
          }, 1000); // Wait 1 second before retry
        }
      }
    };
    
    if (mapsLoaded) geocode();
  }, [post.origin, mapsLoaded, mapLoadingRetries]);

  // Clean map URL when editing
  useEffect(() => {
    if (isEditing && formData.mapEmbedUrl) {
      const cleanUrl = extractUrlFromIframe(formData.mapEmbedUrl);
      if (cleanUrl !== formData.mapEmbedUrl) {
        setFormData(prev => ({
          ...prev,
          mapEmbedUrl: cleanUrl
        }));
      }
    }
  }, [isEditing, formData.mapEmbedUrl]);

  // Reset showError when authError or postError changes
  useEffect(() => {
    setShowError(!!authError || !!postError);
  }, [authError, postError]);

  const handleDismissError = () => {
    setShowError(false);
  };

  const mapStyles = {
    height: '200px',
    width: '100%',
    borderRadius: '8px',
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setPostError(null);
    
    // Validasi kepemilikan post
    if (!user || user.id !== post.driverId) {
      setPostError("You don't have permission to update this post");
      setIsEditing(false);
      return;
    }
    
    const data = new FormData();
    
    // Explicitly append each field to the FormData object
    data.append('departureDate', formData.departureDate);
    data.append('origin', formData.origin);
    data.append('destination', formData.destination);
    data.append('truckType', formData.truckType);
    data.append('maxWeight', formData.maxWeight);
    data.append('phoneNumber', formData.phoneNumber);
    
    // Make sure price is explicitly included and converted to a number
    data.append('price', formData.price.toString());
    
    // Make sure mapEmbedUrl is explicitly included
    if (formData.mapEmbedUrl) {
      data.append('mapEmbedUrl', formData.mapEmbedUrl);
    }
    
    // Add image if available
    if (image) data.append('image', image);

    try {
      await dispatch(updatePost({ id: post.id, postData: data })).unwrap();
      setIsEditing(false);
    } catch (err) {
      setPostError(err.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    // Validasi kepemilikan post
    if (!user || user.id !== post.driverId) {
      setPostError("You don't have permission to delete this post");
      return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
      setPostError(null);
      try {
        await dispatch(deletePost(post.id)).unwrap();
      } catch (err) {
        setPostError(err.message || 'Failed to delete post');
      }
    }
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    if (date) {
      // Format date to YYYY-MM-DD for backend compatibility
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, departureDate: formattedDate });
    } else {
      setFormData({ ...formData, departureDate: '' });
    }
  };

  // Apply custom styling to the date picker when edit mode is activated
  useEffect(() => {
    if (isEditing) {
      // Target the react-datepicker container to ensure full width
      const datePickerContainer = document.querySelector('.react-datepicker-wrapper');
      if (datePickerContainer) {
        datePickerContainer.style.width = '100%';
        datePickerContainer.style.display = 'block';
      }
      
      // Also style the direct input element for consistent appearance
      const datePickerInput = document.querySelector('.react-datepicker__input-container input');
      if (datePickerInput) {
        datePickerInput.style.width = '100%';
        datePickerInput.style.height = 'calc(1.5em + 0.75rem + 2px)';
        datePickerInput.style.padding = '0.375rem 0.75rem';
        datePickerInput.style.fontSize = '1rem';
        datePickerInput.style.fontWeight = '400';
      }
      
      // Make the input container full width as well
      const inputContainer = document.querySelector('.react-datepicker__input-container');
      if (inputContainer) {
        inputContainer.style.width = '100%';
        inputContainer.style.display = 'block';
      }
    }
  }, [isEditing]);

  // Get truck icon based on truck type
  const getTruckIcon = (type) => {
    const icons = {
      pickup: '🛻',
      box: '📦',
      flatbed: '🚚',
      refrigerated: '❄️',
    };
    return icons[type] || '🚚';
  };

  if (!mapsLoaded) {
    return (
      <div className="map-container mt-3 mb-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card post-card mb-4">
      <div className="card-body">
        {showError && (authError || postError) && (
          <div className="alert alert-danger alert-dismissible fade show mb-3">
            {authError === "Invalid credentials" ? "Invalid password or email. Please check your login details and try again." : (authError || postError)}
            <button type="button" className="btn-close" onClick={handleDismissError} aria-label="Close"></button>
          </div>
        )}

        {/* Show driver badge if post belongs to current user */}
        {user?.id === post.driverId && (
          <div className="position-absolute top-0 end-0 mt-2 me-2">
            <span className="badge bg-success">Your Post</span>
          </div>
        )}
        
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <h5 className="fw-bold mb-4">Edit Truck Listing</h5>
            
            <div className="row">
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Departure Date</label>
                  <div className="date-picker-container" style={{display: 'block', width: '100%'}}>
                    <DatePicker
                      selected={formData.departureDate ? new Date(formData.departureDate) : null}
                      onChange={handleDateChange}
                      className="form-control w-100"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select departure date"
                      minDate={new Date()}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Origin</label>
                  <input
                    type="text"
                    className="form-control"
                    name="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    name="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Truck Type</label>
                  <select
                    className="form-select"
                    name="truckType"
                    value={formData.truckType}
                    onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                  >
                    <option value="pickup">Pickup</option>
                    <option value="box">Box</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="refrigerated">Refrigerated</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Max Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxWeight"
                    value={formData.maxWeight}
                    onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Price (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Contact Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Map Embed URL (Google Maps)</label>
              <input
                type="text"
                className="form-control"
                name="mapEmbedUrl"
                value={formData.mapEmbedUrl}
                onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <small className="text-muted">Get embed URL from Google Maps share option</small>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Current Image</label>
              {post.imageUrl ? (
                <div className="mb-3">
                  <img 
                    src={post.imageUrl} 
                    alt="Current truck image" 
                    className="img-fluid rounded border" 
                    style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                  />
                  <div className="form-text text-muted mt-1">
                    <i className="bi bi-info-circle me-1"></i> 
                    Upload new image below to change it
                  </div>
                </div>
              ) : (
                <div className="alert alert-light text-center py-2">
                  <i className="bi bi-image me-1"></i> No image uploaded yet
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-semibold">Truck Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
              {image && (
                <div className="mt-2">
                  <p className="form-text text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    New image selected: {image.name}
                  </p>
                </div>
              )}
            </div>
            
            <hr className="my-4" />
            
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save me-1"></i> Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="post-header">
              <span className="truck-icon me-2" style={{ fontSize: '2rem' }}>
                {getTruckIcon(post.truckType)}
              </span>
              <div>
                <h5 className="card-title mb-1 fw-bold">
                  {post.origin} to {post.destination}
                </h5>
                <p className="text-muted mb-0">
                  <small>
                    Posted on {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                  </small>
                </p>
              </div>
            </div>

            <hr className="my-3" />

            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '30px', textAlign: 'center' }}>
                    🚚
                  </div>
                  <div>
                    <strong>Truck Type:</strong>{' '}
                    {post.truckType.charAt(0).toUpperCase() + post.truckType.slice(1)}
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '30px', textAlign: 'center' }}>
                    ⚖️
                  </div>
                  <div>
                    <strong>Max Weight:</strong> {post.maxWeight} kg
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '30px', textAlign: 'center' }}>
                    💰
                  </div>
                  <div>
                    <strong>Price:</strong> {post.price && post.price > 0 ? `Rp ${post.price.toLocaleString()}` : 'Contact for pricing'}
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '30px', textAlign: 'center' }}>
                    🗓️
                  </div>
                  <div>
                    <strong>Departure:</strong>{' '}
                    {new Date(post.departureDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '30px', textAlign: 'center' }}>
                    📱
                  </div>
                  <div>
                    <strong>Contact:</strong> {post.phoneNumber}
                  </div>
                </div>
                <div className="mt-3">
                  <a href={createWhatsAppLink(post)} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                    <i className="bi bi-whatsapp me-2"></i>Contact via WhatsApp
                  </a>
                </div>
              </div>

              <div className="col-md-6">
                {post.imageUrl ? (
                  <div className="truck-image-container mb-3">
                    <img
                      src={post.imageUrl}
                      alt="Truck"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="truck-image-placeholder d-flex justify-content-center align-items-center bg-light rounded mb-3" style={{ height: '200px' }}>
                    <div className="text-center text-muted">
                      <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                      <p className="mt-2 mb-0">No image available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="map-container mt-3 mb-3">
              {post.mapEmbedUrl ? (
                <>
                  {console.log('Processing map URL:', post.mapEmbedUrl)}
                  <iframe 
                    src={extractUrlFromIframe(post.mapEmbedUrl)}
                    width="100%" 
                    height="300" 
                    style={{border:0, borderRadius: '8px'}} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Route Map"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    onError={(e) => console.error('Map iframe error:', e)}
                  ></iframe>
                </>
              ) : (
                <MapErrorBoundary>
                  <Map 
                    center={center}
                    mapContainerStyle={mapStyles}
                    zoom={8}
                    showMarker={true}
                  />
                </MapErrorBoundary>
              )}
            </div>

            {/* Show edit/delete buttons only when showControls is true AND user is the post owner */}
            {showControls && user?.role === 'driver' && user.id === post.driverId && (
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => {
                    // Tambahan validasi sebelum masuk mode edit
                    if (user.id === post.driverId) {
                      setIsEditing(true);
                    } else {
                      setPostError("You don't have permission to edit this post");
                    }
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;