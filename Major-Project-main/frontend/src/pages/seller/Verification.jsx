import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Verification = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [documents, setDocuments] = useState({
    gst: { file: null, status: 'pending', number: '' },
    pan: { file: null, status: 'verified', number: 'ABCDE1234F' },
    fssai: { file: null, status: 'rejected', number: '' },
    shopLicense: { file: null, status: 'pending', number: '' },
  });

  const steps = [
    'Basic Information',
    'Document Upload',
    'Verification',
    'Approval',
  ];

  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], file: file },
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckIcon color="success" />;
      case 'pending':
        return <CircularProgress size={20} />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seller Verification
      </Typography>

      {/* Verification Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Document Upload Section */}
      <Grid container spacing={3}>
        {/* GST Document */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">GST Registration</Typography>
                {getStatusIcon(documents.gst.status)}
              </Box>
              <TextField
                fullWidth
                label="GST Number"
                variant="outlined"
                value={documents.gst.number}
                onChange={(e) => setDocuments(prev => ({
                  ...prev,
                  gst: { ...prev.gst, number: e.target.value },
                }))}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('gst', e)}
                  />
                </Button>
                {documents.gst.file && (
                  <Typography variant="body2" color="textSecondary">
                    {documents.gst.file.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* PAN Document */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">PAN Card</Typography>
                {getStatusIcon(documents.pan.status)}
              </Box>
              <TextField
                fullWidth
                label="PAN Number"
                variant="outlined"
                value={documents.pan.number}
                onChange={(e) => setDocuments(prev => ({
                  ...prev,
                  pan: { ...prev.pan, number: e.target.value },
                }))}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('pan', e)}
                  />
                </Button>
                {documents.pan.file && (
                  <Typography variant="body2" color="textSecondary">
                    {documents.pan.file.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* FSSAI License */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">FSSAI License</Typography>
                {getStatusIcon(documents.fssai.status)}
              </Box>
              <TextField
                fullWidth
                label="FSSAI Number"
                variant="outlined"
                value={documents.fssai.number}
                onChange={(e) => setDocuments(prev => ({
                  ...prev,
                  fssai: { ...prev.fssai, number: e.target.value },
                }))}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('fssai', e)}
                  />
                </Button>
                {documents.fssai.file && (
                  <Typography variant="body2" color="textSecondary">
                    {documents.fssai.file.name}
                  </Typography>
                )}
              </Box>
              {documents.fssai.status === 'rejected' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Document rejected. Please upload a valid FSSAI license.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shop License */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Shop License</Typography>
                {getStatusIcon(documents.shopLicense.status)}
              </Box>
              <TextField
                fullWidth
                label="License Number"
                variant="outlined"
                value={documents.shopLicense.number}
                onChange={(e) => setDocuments(prev => ({
                  ...prev,
                  shopLicense: { ...prev.shopLicense, number: e.target.value },
                }))}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('shopLicense', e)}
                  />
                </Button>
                {documents.shopLicense.file && (
                  <Typography variant="body2" color="textSecondary">
                    {documents.shopLicense.file.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // Handle save and continue
          }}
        >
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Verification; 