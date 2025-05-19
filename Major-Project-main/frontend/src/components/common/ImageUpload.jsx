import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { Upload, X } from 'lucide-react';

const ImageUpload = ({ 
  onImageSelect, 
  defaultImage = null, 
  className = '',
  error = false,
  helperText = '',
  isUploading = false,
  uploadProgress = 0,
  onRemoveImage = null
}) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview when defaultImage changes
  useEffect(() => {
    // Only try to set the preview if defaultImage exists and is not empty
    if (defaultImage && typeof defaultImage === 'string') {
      setPreview(defaultImage);
      setLoadError(false);
    } else {
      setPreview(null);
      setLoadError(false); // Reset error state when no image
    }
  }, [defaultImage]);

  const handleFileSelect = (file) => {
    if (!file) return;
    onImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    setPreview(null);
    setLoadError(false);
    if (onRemoveImage) {
      onRemoveImage();
    } else {
      onImageSelect(null);
    }
  };

  return (
    <Box className={className}>
      <Box
        sx={{
          border: '1px dashed',
          borderColor: isDragging 
            ? 'primary.main' 
            : error 
              ? 'error.main' 
              : loadError 
                ? 'error.main' 
                : 'divider',
          borderRadius: 1,
          p: 2,
          position: 'relative',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0]);
            }
            e.target.value = ''; // Reset input for repeated uploads of the same file
          }}
        />

        {preview && !loadError ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <img
              src={preview}
              alt="Product Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Image failed to load:', e);
                setLoadError(true);
              }}
            />
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'error.lighter'
                }
              }}
              onClick={removeImage}
            >
              <X size={16} />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            {loadError ? (
              <>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'error.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <X size={24} color="#f44336" />
                </Box>
                <Typography variant="body1" color="error" fontWeight="medium">
                  Failed to load image
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click to try another image
                </Typography>
              </>
            ) : isUploading ? (
              <>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    position: 'relative'
                  }}
                >
                  <CircularProgress 
                    size={40} 
                    variant={uploadProgress > 0 ? "determinate" : "indeterminate"} 
                    value={uploadProgress} 
                  />
                  {uploadProgress > 0 && (
                    <Typography 
                      variant="caption" 
                      component="div" 
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {`${Math.round(uploadProgress)}%`}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" color="primary" fontWeight="medium">
                  Uploading...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Please wait while your image uploads
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Upload size={24} color="#1976d2" />
                </Box>
                <Typography variant="body1" color="primary" fontWeight="medium">
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG, JPEG (max. 5MB)
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {(error || helperText) && (
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ 
            display: 'block',
            mt: 1,
            ml: 1.5
          }}
        >
          {helperText || (loadError ? 'Failed to load image. Please try a different file.' : '')}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload; 