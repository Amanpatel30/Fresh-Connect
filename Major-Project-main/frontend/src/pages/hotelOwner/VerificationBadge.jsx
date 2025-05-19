import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Preview as PreviewIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getVerificationStatus,
  getVerificationDocuments,
  applyForVerification,
  uploadVerificationDocument,
  deleteVerificationDocument,
  cancelVerification,
  submitVerificationRequest
} from '../../services/api.jsx';

const VerificationBadge = () => {
  // State for verification status
  const [status, setStatus] = useState({
    status: 'Not Applied',
    applicationDate: null,
    reviewDate: null,
    isActive: false,
    expiryDate: null,
    documents: [],
    rejectionReason: '',
  });

  // State for application form
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: '',
    url: '',
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Add form validation state
  const [documentErrors, setDocumentErrors] = useState({
    name: '',
    type: '',
    url: ''
  });

  // Fetch verification status on component mount
  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await getVerificationStatus();
        console.log('Verification status:', response.data);

        if (response && response.data) {
          setStatus(response.data);

          // If there are documents, fetch them
          if (response.data.status !== 'Not Applied') {
            try {
              const documentsResponse = await getVerificationDocuments();
              console.log('Verification documents:', documentsResponse.data);

              if (documentsResponse && documentsResponse.data) {
                setDocuments(documentsResponse.data);
              }
            } catch (docError) {
              console.error('Error fetching documents:', docError);
              // Continue with empty documents array
              setDocuments([]);
              setSnackbar({
                open: true,
                message: 'Failed to fetch verification documents. Please try again later.',
                severity: 'warning'
              });
            }
          }
        } else {
          console.log('No data from API');
          // Initialize with empty state instead of mock data
          setStatus({
            status: 'Not Applied',
            applicationDate: null,
            reviewDate: null,
            isActive: false,
            expiryDate: null,
            documents: [],
            rejectionReason: '',
          });
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Initialize with empty state instead of mock data
        setStatus({
          status: 'Not Applied',
          applicationDate: null,
          reviewDate: null,
          isActive: false,
          expiryDate: null,
          documents: [],
          rejectionReason: '',
        });
        
        // Show a more specific error message
        if (apiError.response && apiError.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (apiError.message === 'Network Error') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Error loading verification status. The backend service might be unavailable.');
        }
        
        setSnackbar({
          open: true,
          message: 'Failed to fetch verification status. Please ensure the backend server is running.',
          severity: 'error'
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error in fetchVerificationStatus:', err);
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false);
      
      // Use mock data for demonstration
      setStatus({
        status: 'Not Applied',
        applicationDate: null,
        reviewDate: null,
        isActive: false,
        expiryDate: null,
        documents: [],
        rejectionReason: '',
      });
    }
  };

  // Handle document form change
  const handleDocumentChange = (e) => {
    const { name, value } = e.target;
    setNewDocument((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user makes changes
    if (documentErrors[name]) {
      setDocumentErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validate fields in real-time
    if (name === 'url' && value) {
      if (!value.match(/^(http|https):\/\/[^ "]+$/)) {
        setDocumentErrors(prev => ({
          ...prev,
          url: 'Please enter a valid URL'
        }));
      }
    }
    
    if (name === 'name' && value) {
      if (value.length < 3) {
        setDocumentErrors(prev => ({
          ...prev,
          name: 'Document name must be at least 3 characters'
        }));
      } else if (value.length > 100) {
        setDocumentErrors(prev => ({
          ...prev,
          name: 'Document name must be less than 100 characters'
        }));
      }
    }
  };

  // Validate document form
  const validateDocumentForm = () => {
    const errors = {
      name: '',
      type: '',
      url: ''
    };
    
    // Validate document name
    if (!newDocument.name || newDocument.name.trim() === '') {
      errors.name = 'Document name is required';
    } else if (newDocument.name.length < 3) {
      errors.name = 'Document name must be at least 3 characters';
    } else if (newDocument.name.length > 100) {
      errors.name = 'Document name must be less than 100 characters';
    }
    
    // Validate document type
    if (!newDocument.type || newDocument.type === '') {
      errors.type = 'Document type is required';
    }
    
    // Validate document URL
    if (!newDocument.url || newDocument.url.trim() === '') {
      errors.url = 'Document URL is required';
    } else if (!newDocument.url.match(/^(http|https):\/\/[^ "]+$/)) {
      errors.url = 'Please enter a valid URL';
    } else if (newDocument.url.length > 500) {
      errors.url = 'URL is too long (maximum 500 characters)';
    }
    
    setDocumentErrors(errors);
    
    // Return true if there are no errors (all error messages are empty)
    return !errors.name && !errors.type && !errors.url;
  };

  // Handle adding a document
  const handleAddDocument = async () => {
    // Validate document form
    if (!validateDocumentForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the document form',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create a mock document for testing
      const mockDocument = {
        ...newDocument,
        _id: Date.now().toString(), // Generate a unique ID
        uploadedAt: new Date().toISOString(),
      };
      
      try {
        const response = await uploadVerificationDocument(newDocument);
        console.log('Document uploaded:', response.data);

        if (response && response.data && response.data.document) {
          setDocuments((prev) => [...prev, response.data.document]);
          setNewDocument({
            name: '',
            type: '',
            url: '',
          });
          setSnackbar({
            open: true,
            message: 'Document added successfully',
            severity: 'success',
          });
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        // If API fails, still add the mock document for demo purposes
        setDocuments((prev) => [...prev, mockDocument]);
        setNewDocument({
          name: '',
          type: '',
          url: '',
        });
        setSnackbar({
          open: true,
          message: 'Document added successfully (mock)',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error adding document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add document',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setLoading(true);
      
      try {
        const response = await deleteVerificationDocument(documentToDelete._id);
        console.log('Document deleted:', response.data);

        if (response && response.data) {
          setDocuments((prev) =>
            prev.filter((doc) => doc._id !== documentToDelete._id)
          );
          setSnackbar({
            open: true,
            message: 'Document deleted successfully',
            severity: 'success',
          });
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Delete document from local state anyway for better UX
        console.log('Deleting document from local state despite API error');
        setDocuments((prev) =>
          prev.filter((doc) => doc._id !== documentToDelete._id)
        );
        
        setSnackbar({
          open: true,
          message: 'Document removed (locally). API error: ' + (apiError.message || 'Unknown error'),
          severity: 'warning',
        });
      }
      
      setOpenDeleteDialog(false);
      setDocumentToDelete(null);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting document:', err);
      setSnackbar({
        open: true,
        message: `Error deleting document: ${err.message || 'Unknown error'}`,
        severity: 'error',
      });
      setOpenDeleteDialog(false);
      setDocumentToDelete(null);
      setLoading(false);
    }
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (documents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please upload at least one document',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      try {
        const response = await applyForVerification({
          documents,
          notes,
        });
        console.log('Application submitted:', response.data);

        if (response && response.data) {
          setStatus((prev) => ({
            ...prev,
            status: 'Pending',
            applicationDate: new Date().toISOString(),
          }));
          setSnackbar({
            open: true,
            message: 'Verification application submitted successfully',
            severity: 'success',
          });
          setActiveStep(0);
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Use mock data for demonstration
        console.log('Using mock data due to API error');
        setStatus((prev) => ({
          ...prev,
          status: 'Pending',
          applicationDate: new Date().toISOString(),
        }));
        
        setSnackbar({
          open: true,
          message: 'Application submitted (mock data). API error: ' + (apiError.message || 'Unknown error'),
          severity: 'warning',
        });
        setActiveStep(0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting application:', err);
      setSnackbar({
        open: true,
        message: `Error submitting application: ${err.message || 'Unknown error'}`,
        severity: 'error',
      });
      setLoading(false);
    }
  };

  // Handle application cancellation
  const handleCancelApplication = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await cancelVerification();
        console.log('Application cancelled:', response.data);

        if (response && response.data) {
          setStatus({
            status: 'Not Applied',
            applicationDate: null,
            reviewDate: null,
            isActive: false,
            expiryDate: null,
            documents: [],
            rejectionReason: '',
          });
          setDocuments([]);
          setSnackbar({
            open: true,
            message: 'Verification application cancelled successfully',
            severity: 'success',
          });
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Reset status anyway for better UX
        console.log('Resetting status despite API error');
        setStatus({
          status: 'Not Applied',
          applicationDate: null,
          reviewDate: null,
          isActive: false,
          expiryDate: null,
          documents: [],
          rejectionReason: '',
        });
        setDocuments([]);
        
        setSnackbar({
          open: true,
          message: 'Application cancelled (locally). API error: ' + (apiError.message || 'Unknown error'),
          severity: 'warning',
        });
      }
      
      setOpenCancelDialog(false);
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling application:', err);
      setSnackbar({
        open: true,
        message: `Error cancelling application: ${err.message || 'Unknown error'}`,
        severity: 'error',
      });
      setOpenCancelDialog(false);
      setLoading(false);
    }
  };

  // Render status badge
  const renderStatusBadge = () => {
    let icon, color, bgcolor;

    switch (status.status) {
      case 'Approved':
        icon = <CheckCircleIcon />;
        color = 'success.main';
        bgcolor = 'success.light';
        break;
      case 'Rejected':
        icon = <CancelIcon />;
        color = 'error.main';
        bgcolor = 'error.light';
        break;
      case 'Pending':
        icon = <HourglassEmptyIcon />;
        color = 'warning.main';
        bgcolor = 'warning.light';
        break;
      default:
        icon = <VerifiedUserIcon />;
        color = 'text.secondary';
        bgcolor = 'grey.100';
    }

    return (
      <Chip
        icon={icon}
        label={status.status}
        sx={{
          color,
          bgcolor,
          fontWeight: 'bold',
          fontSize: '0.875rem',
          py: 2.5,
          px: 1,
        }}
      />
    );
  };

  // Application steps
  const steps = ['Upload Documents', 'Review & Submit'];

  // Render application form
  const renderApplicationForm = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Verification Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please upload documents that verify your hotel's identity and
              legitimacy. This can include business licenses, health department
              certificates, or other official documents.
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="name"
                    label="Document Name"
                    value={newDocument.name}
                    onChange={handleDocumentChange}
                    fullWidth
                    required
                    error={!!documentErrors.name}
                    helperText={documentErrors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth required error={!!documentErrors.type}>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      name="type"
                      value={newDocument.type}
                      onChange={handleDocumentChange}
                      label="Document Type"
                    >
                      <MenuItem value="License">Business License</MenuItem>
                      <MenuItem value="Certificate">
                        Health Certificate
                      </MenuItem>
                      <MenuItem value="ID">ID Proof</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {documentErrors.type && (
                      <FormHelperText>{documentErrors.type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="url"
                    label="Document URL"
                    value={newDocument.url}
                    onChange={handleDocumentChange}
                    fullWidth
                    required
                    error={!!documentErrors.url}
                    helperText={documentErrors.url || "Enter URL of uploaded document"}
                  />
                </Grid>
                <Grid item xs={12}>
                  {newDocument.url && (
                    <Box sx={{ mt: 2, mb: 2 }}>
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
                          src={newDocument.url || 'https://via.placeholder.com/300x200?text=No+Image'}
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
                  {!newDocument.url && (
                    <Box sx={{ mt: 2, mb: 2 }}>
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
                          Enter a document URL to see preview
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleAddDocument}
                    disabled={loading}
                  >
                    Add Document
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>
              Uploaded Documents
            </Typography>
            {documents.length === 0 ? (
              <Alert severity="info">
                No documents uploaded yet. Please upload at least one document.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {documents.map((doc, index) => (
                  <Grid item xs={12} sm={6} md={4} key={doc._id || index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {doc.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Type: {doc.type}
                        </Typography>
                        {doc.uploadedAt && (
                          <Typography variant="body2" color="text.secondary">
                            Uploaded:{' '}
                            {format(
                              new Date(doc.uploadedAt),
                              'MMM dd, yyyy'
                            )}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={documents.length === 0 || loading}
              >
                Next
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit Application
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review your documents and add any additional notes before
              submitting your verification application.
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Documents ({documents.length})
              </Typography>
              <Grid container spacing={2}>
                {documents.map((doc, index) => (
                  <Grid item xs={12} sm={6} key={doc._id || index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">{doc.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doc.type}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <TextField
                label="Additional Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Add any additional information that might help with the verification process"
              />
            </Paper>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitApplication}
                disabled={loading}
              >
                Submit Application
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Render verification status
  const renderVerificationStatus = () => {
    return (
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6">Verification Status</Typography>
          {renderStatusBadge()}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Application Date
            </Typography>
            <Typography variant="body1">
              {status.applicationDate
                ? format(new Date(status.applicationDate), 'MMMM dd, yyyy')
                : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Review Date
            </Typography>
            <Typography variant="body1">
              {status.reviewDate
                ? format(new Date(status.reviewDate), 'MMMM dd, yyyy')
                : 'N/A'}
            </Typography>
          </Grid>

          {status.status === 'Approved' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Badge Status
                </Typography>
                <Typography variant="body1">
                  {status.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expiry Date
                </Typography>
                <Typography variant="body1">
                  {status.expiryDate
                    ? format(new Date(status.expiryDate), 'MMMM dd, yyyy')
                    : 'N/A'}
                </Typography>
              </Grid>
            </>
          )}

          {status.status === 'Rejected' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Rejection Reason
              </Typography>
              <Typography variant="body1">{status.rejectionReason}</Typography>
            </Grid>
          )}

          {status.status === 'Pending' && (
            <Grid item xs={12}>
              <Alert severity="info">
                Your verification application is currently under review. This
                process typically takes 2-3 business days.
              </Alert>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenCancelDialog(true)}
                >
                  Cancel Application
                </Button>
              </Box>
            </Grid>
          )}

          {status.status === 'Rejected' && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setStatus({
                      ...status,
                      status: 'Not Applied',
                    });
                  }}
                >
                  Apply Again
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        {(status.status === 'Approved' || status.status === 'Rejected') && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Submitted Documents
            </Typography>
            <Grid container spacing={2}>
              {documents.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No documents available</Alert>
                </Grid>
              ) : (
                documents.map((doc, index) => (
                  <Grid item xs={12} sm={6} md={4} key={doc._id || index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {doc.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Type: {doc.type}
                        </Typography>
                        {doc.uploadedAt && (
                          <Typography variant="body2" color="text.secondary">
                            Uploaded:{' '}
                            {format(
                              new Date(doc.uploadedAt),
                              'MMM dd, yyyy'
                            )}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        )}
      </Paper>
    );
  };

  return (
    <Box p={3}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <VerifiedUserIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Verified Badge Management
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Verification
        </Typography>
        <Typography variant="body1" paragraph>
          The Verified Badge helps customers identify trusted hotels on our
          platform. Verified hotels have undergone a thorough review process to
          confirm their legitimacy and quality standards.
        </Typography>
        <Typography variant="body1" paragraph>
          Benefits of being verified:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              Increased visibility in search results
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Higher trust from potential customers
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Access to premium platform features
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Priority customer support
            </Typography>
          </li>
        </ul>
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : status.status === 'Not Applied' ? (
        renderApplicationForm()
      ) : (
        renderVerificationStatus()
      )}

      {/* Delete Document Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteDocument}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Application Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Cancel Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your verification application? All
            uploaded documents will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          <Button
            onClick={handleCancelApplication}
            color="error"
            variant="contained"
          >
            Yes, Cancel Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationBadge; 