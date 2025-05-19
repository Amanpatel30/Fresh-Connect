import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import RejectedIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import PreviewIcon from '@mui/icons-material/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { getVerificationDocuments, uploadVerificationDocument, deleteVerificationDocument, getVerificationStatus } from '../../services/api.jsx';

const VerificationDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('');
  
  // Add form validation state
  const [formErrors, setFormErrors] = useState({
    documentName: '',
    documentType: '',
    file: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchVerificationStatus();
  }, []);

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      const response = await getVerificationStatus();
      if (response.data && response.data.status) {
        setVerificationStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      // Default to pending if status can't be retrieved
      setVerificationStatus('pending');
    }
  };

  // Fetch verification documents from API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      console.log('Fetching verification documents...');
      
      const response = await getVerificationDocuments();
      console.log('Documents response:', response.data);
      
      // Added logging to inspect document structure
      if (response.data && Array.isArray(response.data)) {
        console.log('Number of documents:', response.data.length);
        if (response.data.length > 0) {
          console.log('First document structure:', response.data[0]);
          console.log('First document status:', response.data[0]?.status || 'undefined');
        }
      }
      
      if (response.data && Array.isArray(response.data.documents)) {
        setDocuments(response.data.documents);
      } else if (response.data && Array.isArray(response.data)) {
        // Ensure all documents have status
        const docsWithDefaults = response.data.map(doc => ({
          ...doc,
          status: doc.status || 'pending'
        }));
        setDocuments(docsWithDefaults);
      } else {
        setDocuments([]);
        console.warn('No documents found or unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch verification documents. Please ensure the backend server is running.',
        severity: 'error'
      });
      
      // Set empty documents array instead of using sample data
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open for uploading new document
  const handleOpenUploadDialog = () => {
    setOpenDialog(true);
    setFile(null);
    setDocumentType('');
    setDocumentName('');
    setUploadProgress(0);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle file change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setFormErrors(prev => ({
          ...prev,
          file: 'Invalid file type. Please upload a JPG, PNG, or PDF file.'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          file: `File size exceeds 5MB. Please upload a smaller file (current size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB).`
        }));
        return;
      }
      
      // Clear file error if validation passes
      setFormErrors(prev => ({
        ...prev,
        file: ''
      }));
      
      setFile(selectedFile);
      
      // Set default document name from file name if not already set
      if (!documentName) {
        const fileName = selectedFile.name;
        setDocumentName(fileName.split('.')[0]); // Remove file extension
        
        // Clear document name error if we're setting a value
        setFormErrors(prev => ({
          ...prev,
          documentName: ''
        }));
      }
    }
  };
  
  // Handle document name change
  const handleDocumentNameChange = (e) => {
    const value = e.target.value;
    setDocumentName(value);
    
    // Validate document name
    if (!value || value.trim() === '') {
      setFormErrors(prev => ({
        ...prev,
        documentName: 'Document name is required'
      }));
    } else if (value.length > 100) {
      setFormErrors(prev => ({
        ...prev,
        documentName: 'Document name must be less than 100 characters'
      }));
    } else if (value.length < 3) {
      setFormErrors(prev => ({
        ...prev,
        documentName: 'Document name must be at least 3 characters'
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        documentName: ''
      }));
    }
  };
  
  // Handle document type change
  const handleDocumentTypeChange = (e) => {
    const value = e.target.value;
    setDocumentType(value);
    
    // Validate document type
    if (!value || value === '') {
      setFormErrors(prev => ({
        ...prev,
        documentType: 'Document type is required'
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        documentType: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      documentName: '',
      documentType: '',
      file: ''
    };
    
    // Validate document name
    if (!documentName || documentName.trim() === '') {
      errors.documentName = 'Document name is required';
    } else if (documentName.length > 100) {
      errors.documentName = 'Document name must be less than 100 characters';
    } else if (documentName.length < 3) {
      errors.documentName = 'Document name must be at least 3 characters';
    }
    
    // Validate document type
    if (!documentType || documentType === '') {
      errors.documentType = 'Document type is required';
    }
    
    // Validate file
    if (!file) {
      errors.file = 'Please select a file to upload';
    } else {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        errors.file = 'Invalid file type. Please upload a JPG, PNG, or PDF file.';
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        errors.file = `File size exceeds 5MB. Please upload a smaller file (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
      }
    }
    
    setFormErrors(errors);
    
    // Return true if there are no errors (all error messages are empty)
    return !errors.documentName && !errors.documentType && !errors.file;
  };

  // Handle upload document
  const handleUploadDocument = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create form data for the API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', documentName);
      formData.append('type', documentType);
      
      console.log('Submitting document:', {
        name: documentName,
        type: documentType,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Upload document with progress tracking
      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };
      
      const response = await uploadVerificationDocument(formData, onUploadProgress);
      
      // Add the new document to the state
      if (response.data && response.data.document) {
        setDocuments([...documents, response.data.document]);
      } else {
        // Re-fetch all documents to ensure we have the latest
        fetchDocuments();
      }
      
      setSnackbar({
        open: true,
        message: 'Document uploaded successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error uploading document:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload document',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      setLoading(true);
      
      await deleteVerificationDocument(documentId);
      
      // Remove the deleted document from state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      setSnackbar({
        open: true,
        message: 'Document deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete document',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <VerifiedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Verification Documents
          </Typography>
          <Box>
            <Chip 
              icon={getStatusIcon(verificationStatus.toLowerCase())}
              label={`Status: ${verificationStatus}`}
              color={getStatusColor(verificationStatus)}
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
              disabled={verificationStatus === 'Approved'}
            >
              Upload Document
            </Button>
          </Box>
        </Box>
        
        {loading && documents.length === 0 ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : documents.length === 0 ? (
          <Box textAlign="center" my={5}>
            <Typography variant="h6" color="textSecondary">
              No verification documents found
            </Typography>
            <Typography variant="body1" color="textSecondary" mt={1}>
              Upload your verification documents to get verified
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {documents.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document._id}>
                <Card elevation={3}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={document.url || 'https://via.placeholder.com/300x140?text=Document+Preview'}
                    alt={document.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" component="div" noWrap>
                        {document.name}
                      </Typography>
                      <Chip 
                        icon={getStatusIcon(document?.status || 'pending')}
                        label={(document?.status ? document.status.charAt(0).toUpperCase() + document.status.slice(1) : 'Pending')}
                        color={document?.status === 'approved' ? 'success' : document?.status === 'rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {document.type}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      Uploaded on {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                    
                    {(document?.status === 'pending' || !document?.status) && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteDocument(document._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Verification Requirements
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Business License" 
                secondary="Upload your restaurant or food business license issued by the government" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Food Safety Certificate" 
                secondary="FSSAI certification or equivalent food safety certification" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Identity Proof" 
                secondary="Government-issued ID of the business owner (Aadhaar, PAN, etc.)" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Address Proof" 
                secondary="Proof of business address (utility bill, rent agreement, etc.)" 
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
      
      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Verification Document
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="documentName"
              label="Document Name"
              name="documentName"
              value={documentName}
              onChange={handleDocumentNameChange}
              error={!!formErrors.documentName}
              helperText={formErrors.documentName}
            />
            
            <FormControl fullWidth margin="normal" required error={!!formErrors.documentType}>
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                id="documentType"
                value={documentType}
                label="Document Type"
                onChange={handleDocumentTypeChange}
              >
                <MenuItem value="License">Business License</MenuItem>
                <MenuItem value="Certificate">Food Safety Certificate</MenuItem>
                <MenuItem value="ID">Identity Proof</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formErrors.documentType && (
                <FormHelperText>{formErrors.documentType}</FormHelperText>
              )}
            </FormControl>
            
            <Box mt={3}>
              <input
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                style={{ display: 'none' }}
                id="document-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="document-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  color={formErrors.file ? "error" : "primary"}
                >
                  {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'Select Document File'}
                </Button>
              </label>
              {formErrors.file && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, ml: 1.5 }}>
                  {formErrors.file}
                </Typography>
              )}
              {file && !formErrors.file && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, ml: 1.5 }}>
                  File size: {(file.size / (1024 * 1024)).toFixed(2)} MB (Valid)
                </Typography>
              )}
            </Box>
            
            {/* Document Preview */}
            {file && file.type.startsWith('image/') && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1, fontSize: 'small' }} /> Document Preview:
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 200, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #e0e0e0',
                    boxShadow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt="Document Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                    }}
                  />
                </Box>
              </Box>
            )}
            
            {file && file.type === 'application/pdf' && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1, fontSize: 'small' }} /> PDF Document Selected
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 100, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #e0e0e0',
                    boxShadow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">
                    {file.name}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {!file && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1, fontSize: 'small' }} /> Document Preview:
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 150, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px dashed #ccc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    Select a document to see preview
                  </Typography>
                </Box>
              </Box>
            )}
            
            {uploadProgress > 0 && (
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 10,
                    bgcolor: 'grey.200',
                    borderRadius: 5,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 5,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Accepted file formats: JPG, PNG, PDF (Max size: 5MB)
            </Typography>
            
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                <b>Note:</b> For best results, please ensure your document is clearly visible and all text is legible.
                Documents larger than 5MB will be automatically rejected by the system.
                If your file is too large, try resizing the image or using a PDF compression tool before uploading.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            color="primary"
            disabled={!file || !documentType || !documentName || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationDocuments; 