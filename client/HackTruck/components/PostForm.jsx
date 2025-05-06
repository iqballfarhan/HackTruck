import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../store/slices/postSlice';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const PostForm = ({ onMapGenerated }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.posts);
  
  const [formData, setFormData] = useState({
    departureDate: '',
    origin: '',
    destination: '',
    truckType: 'pickup',
    maxWeight: '',
    price: '',
    mapEmbedUrl: '',
    phoneNumber: '',
    image: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Function to automatically generate embed URL from origin and destination
  const generateMapEmbed = async () => {
    if (!formData.origin || !formData.destination) {
      setMapError("Please enter both origin and destination to generate route");
      return;
    }
    
    setMapLoading(true);
    setMapError(null);
    
    try {
      // Generate embed URL from origin and destination
      const origin = encodeURIComponent(formData.origin);
      const destination = encodeURIComponent(formData.destination);
      const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}&mode=driving`;
      
      setFormData({ ...formData, mapEmbedUrl: embedUrl });
      // notify parent of new embed URL
      if (onMapGenerated) onMapGenerated(embedUrl);
    } catch (error) {
      console.error('Error generating map:', error);
      setMapError("Failed to generate route. Please check your origin and destination addresses.");
    } finally {
      setMapLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.departureDate) errors.departureDate = 'Departure date is required';
    if (!formData.origin) errors.origin = 'Origin is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    if (!formData.truckType) errors.truckType = 'Truck type is required';
    if (!formData.maxWeight || formData.maxWeight <= 0) errors.maxWeight = 'Valid max weight is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    // If form is valid but no map is generated yet, try to auto-generate it
    if (Object.keys(errors).length === 0 && !formData.mapEmbedUrl && formData.origin && formData.destination) {
      try {
        setMapLoading(true);
        setMapError(null);
        
        // Generate embed URL from origin and destination
        const origin = encodeURIComponent(formData.origin);
        const destination = encodeURIComponent(formData.destination);
        const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}&mode=driving`;
        
        // Update formData with the generated map URL
        setFormData(prevData => ({
          ...prevData,
          mapEmbedUrl: embedUrl
        }));
        // notify parent of new embed URL on submit auto-generation
        if (onMapGenerated) onMapGenerated(embedUrl);
        
        setMapLoading(false);
      } catch (error) {
        console.error('Error auto-generating map:', error);
        setMapError("Failed to auto-generate route map. Continuing with submission.");
        setMapLoading(false);
      }
    }

    // Proceed with form submission
    if (Object.keys(errors).length === 0) {
      try {
        const postData = new FormData();
        postData.append('departureDate', formData.departureDate);
        postData.append('origin', formData.origin);
        postData.append('destination', formData.destination);
        postData.append('truckType', formData.truckType);
        postData.append('maxWeight', formData.maxWeight);
        
        // Explicitly convert price to string when appending
        postData.append('price', formData.price.toString());
        
        // Make sure mapEmbedUrl is properly included
        if (formData.mapEmbedUrl) {
          postData.append('mapEmbedUrl', formData.mapEmbedUrl);
        }
        
        if (formData.phoneNumber) {
          postData.append('phoneNumber', formData.phoneNumber);
        }
        
        if (formData.image) {
          postData.append('image', formData.image);
        }

        await dispatch(createPost(postData)).unwrap();
        // Reset form on success
        setFormData({
          departureDate: '',
          origin: '',
          destination: '',
          truckType: 'pickup',
          maxWeight: '',
          price: '',
          mapEmbedUrl: '',
          phoneNumber: '',
          image: null,
        });
        setFormErrors({});
        setMapError(null);
        navigate('/driver/posts');
      } catch (err) {
        console.error('Post creation failed:', err);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up any created object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Function to handle date changes from DatePicker
  const handleDateChange = (date) => {
    if (date) {
      // Format date to YYYY-MM-DD for backend compatibility
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, departureDate: formattedDate });
    } else {
      setFormData({ ...formData, departureDate: '' });
    }
  };

  // Add custom styles for DatePicker to make it consistent with other form elements
  useEffect(() => {
    // Target the react-datepicker container to ensure full width
    const datePickerContainer = document.querySelector('.react-datepicker-wrapper');
    if (datePickerContainer) {
      datePickerContainer.style.width = '100%';
      datePickerContainer.style.display = 'block';
    }
    
    // Style the direct input element for consistent appearance
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
  }, []);

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      {error && (
        <div className="alert alert-danger mb-4 text-center">
          {error}
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Departure Date</label>
        <DatePicker
          selected={formData.departureDate ? new Date(formData.departureDate) : null}
          onChange={handleDateChange}
          className={`form-control ${formErrors.departureDate ? 'is-invalid' : ''}`}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select departure date"
          minDate={new Date()}
        />
        {formErrors.departureDate && <div className="invalid-feedback">{formErrors.departureDate}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Origin</label>
        <input
          type="text"
          className={`form-control ${formErrors.origin ? 'is-invalid' : ''}`}
          placeholder="Enter origin"
          value={formData.origin}
          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
        />
        {formErrors.origin && <div className="invalid-feedback">{formErrors.origin}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          type="text"
          className={`form-control ${formErrors.destination ? 'is-invalid' : ''}`}
          placeholder="Enter destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
        />
        {formErrors.destination && <div className="invalid-feedback">{formErrors.destination}</div>}
      </div>

      {/* Map auto-generation section */}
      <div className="mb-4 d-grid gap-2">
        <button 
          type="button" 
          className="btn btn-outline-primary"
          onClick={generateMapEmbed}
          disabled={!formData.origin || !formData.destination || mapLoading}
        >
          {mapLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Generating Map...
            </>
          ) : (
            <>
              <i className="bi bi-map me-2"></i>
              Generate Route Map
            </>
          )}
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label">Map Embed URL</label>
        <div className="input-group">
          <input
            type="url"
            className="form-control"
            placeholder="Google Maps embed URL will appear here"
            value={formData.mapEmbedUrl}
            onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
          />
          <button 
            className="btn btn-outline-secondary" 
            type="button"
            onClick={() => window.navigator.clipboard.writeText(formData.mapEmbedUrl)}
            disabled={!formData.mapEmbedUrl}
          >
            <i className="bi bi-clipboard"></i>
          </button>
        </div>
        <small className="form-text text-muted">
          The map URL will be auto-generated when you click "Generate Route Map", or you can paste your own Google Maps embed URL.
        </small>
      </div>

      {/* Map Preview Section has been removed */}

      <div className="mb-3">
        <label className="form-label">Truck Type</label>
        <select
          className={`form-control ${formErrors.truckType ? 'is-invalid' : ''}`}
          value={formData.truckType}
          onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
        >
          <option value="pickup">Pickup</option>
          <option value="box">Box</option>
          <option value="flatbed">Flatbed</option>
          <option value="refrigerated">Refrigerated</option>
        </select>
        {formErrors.truckType && <div className="invalid-feedback">{formErrors.truckType}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Max Weight (kg)</label>
        <input
          type="number"
          className={`form-control ${formErrors.maxWeight ? 'is-invalid' : ''}`}
          placeholder="Enter max weight in kg"
          value={formData.maxWeight}
          onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
        />
        {formErrors.maxWeight && <div className="invalid-feedback">{formErrors.maxWeight}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Price (Rp)</label>
        <input
          type="number"
          className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
          placeholder="e.g. 500000"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
        />
        <small className="form-text text-muted">Enter price in Indonesian Rupiah (IDR)</small>
        {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-control"
          placeholder="Enter phone number (optional)"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
        />
        {imagePreview && (
          <div className="mt-3">
            <p className="mb-1 text-muted">Image Preview:</p>
            <div style={{ maxWidth: '100%', maxHeight: '300px', overflow: 'hidden' }}>
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="img-fluid rounded"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Creating Post...
          </>
        ) : (
          'Create Post'
        )}
      </button>
    </form>
  );
};

export default PostForm;