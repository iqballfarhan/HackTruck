import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '200px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: -6.2088, // Default: Jakarta, Indonesia
  lng: 106.8456,
};

const mapOptions = {
  zoom: 10,
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  zoomControl: true,
};

// Updated Map component to accept custom props
const Map = ({ center = defaultCenter, zoom = 8, showMarker = true, mapContainerStyle = containerStyle }) => {
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
    >
      {showMarker && <Marker position={center} />}
    </GoogleMap>
  );
};

export default Map;