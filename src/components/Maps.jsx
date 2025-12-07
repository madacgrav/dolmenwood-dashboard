import React, { useState, useEffect } from 'react';
import './Maps.css';

// Map image configuration constants
const MAP_MAX_WIDTH = 800; // Maximum width in pixels
const MAP_MAX_HEIGHT = 600; // Maximum height in pixels
const MAP_JPEG_QUALITY = 0.8; // JPEG compression quality (0-1)
const MAP_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

function Maps({ user, mapsStorage }) {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    // Subscribe to maps updates
    const unsubscribe = mapsStorage.subscribeToMaps((updatedMaps) => {
      setMaps(updatedMaps);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [mapsStorage]);

  const handleMapUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size
    if (file.size > MAP_MAX_FILE_SIZE) {
      alert('Image file must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Reading image...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          setUploadProgress('Resizing image...');
          
          // Create canvas to resize image
          const canvas = document.createElement('canvas');
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > MAP_MAX_WIDTH || height > MAP_MAX_HEIGHT) {
            const widthRatio = MAP_MAX_WIDTH / width;
            const heightRatio = MAP_MAX_HEIGHT / height;
            const ratio = Math.min(widthRatio, heightRatio);
            
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression
          const resizedBase64 = canvas.toDataURL('image/jpeg', MAP_JPEG_QUALITY);
          
          // Prompt for map name
          const mapName = prompt('Enter a name for this map:');
          if (!mapName || !mapName.trim()) {
            setIsUploading(false);
            setUploadProgress('');
            return;
          }
          
          setUploadProgress('Uploading...');
          
          // Upload to storage
          await mapsStorage.addMap({
            name: mapName.trim(),
            imageData: resizedBase64,
            uploadedBy: user.email,
            uploadedById: user.uid
          });
          
          setUploadProgress('Upload complete!');
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress('');
          }, 2000);
          
          // Clear file input
          e.target.value = '';
        } catch (error) {
          console.error('Error uploading map:', error);
          alert('Error uploading map. Please try again.');
          setIsUploading(false);
          setUploadProgress('');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMap = async (mapId, mapName) => {
    if (window.confirm(`Are you sure you want to delete "${mapName}"?`)) {
      try {
        await mapsStorage.deleteMap(mapId);
      } catch (error) {
        console.error('Error deleting map:', error);
        alert('Error deleting map. Please try again.');
      }
    }
  };

  const openMapModal = (map) => {
    setSelectedMap(map);
  };

  const closeMapModal = () => {
    setSelectedMap(null);
  };

  return (
    <div className="maps-container">
      <div className="maps-header">
        <h1>Dolmenwood Maps</h1>
        <p className="subtitle">Shared Map Gallery</p>
      </div>

      <div className="upload-section">
        <label htmlFor="map-upload" className="btn-upload-map">
          {isUploading ? uploadProgress : '+ Upload New Map'}
        </label>
        <input
          id="map-upload"
          type="file"
          accept="image/*"
          onChange={handleMapUpload}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <p className="upload-info">
          Upload maps to share with all players (max 5MB, auto-resized to 800x600px)
        </p>
      </div>

      <div className="maps-grid">
        {maps.map((map) => (
          <div key={map.id} className="map-card">
            <div className="map-image-container" onClick={() => openMapModal(map)}>
              <img src={map.imageData} alt={map.name} className="map-thumbnail" />
              <div className="map-overlay">
                <span className="view-text">Click to view</span>
              </div>
            </div>
            <div className="map-info">
              <h3 className="map-name">{map.name}</h3>
              <p className="map-meta">
                Uploaded by {map.uploadedBy}
              </p>
              <p className="map-date">
                {new Date(map.createdAt).toLocaleDateString()}
              </p>
              {user && (user.uid === map.uploadedById || user.email === map.uploadedBy) && (
                <button 
                  className="btn-delete-map"
                  onClick={() => handleDeleteMap(map.id, map.name)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {maps.length === 0 && (
        <div className="empty-state">
          <p>No maps uploaded yet. Be the first to share a map!</p>
        </div>
      )}

      {selectedMap && (
        <div className="map-modal" onClick={closeMapModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMapModal}>×</button>
            <h2>{selectedMap.name}</h2>
            <img src={selectedMap.imageData} alt={selectedMap.name} className="map-full" />
            <div className="modal-info">
              <p>Uploaded by: {selectedMap.uploadedBy}</p>
              <p>Date: {new Date(selectedMap.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maps;
