import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  TextField,
  MenuItem,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';

const ComplaintHandling = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);

  const menuOpen = Boolean(anchorEl);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/complaints');
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleReplyOpen = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyContent('');
    setReplyDialogOpen(true);
  };

  const handleReplyClose = () => {
    setReplyDialogOpen(false);
  };

  const handleReplyContentChange = (event) => {
    setReplyContent(event.target.value);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    setReplyLoading(true);
    try {
      const response = await fetch(`/api/admin/complaints/${selectedComplaint._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: replyContent,
          adminId: 'admin123', // This would come from your auth context in a real app
          adminName: 'Admin User'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const updatedComplaint = await response.json();
      
      // Update complaints list
      setComplaints(complaints.map(complaint => 
        complaint._id === selectedComplaint._id ? updatedComplaint : complaint
      ));

      // Update selected complaint if dialog is open
      setSelectedComplaint(updatedComplaint);

      // Close reply dialog
      setReplyDialogOpen(false);
    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the local state
      setComplaints(complaints.map(complaint => 
        complaint._id === complaintId ? { ...complaint, status: newStatus } : complaint
      ));

      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }

      // Close menu if open
      handleCloseMenu();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, complaintId) => {
    setAnchorEl(event.currentTarget);
    setCurrentComplaintId(complaintId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentComplaintId(null);
  };

  const handleRefresh = () => {
    fetchComplaints();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'new': return 'error';
      case 'in progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = statusFilter === 'all' || complaint.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || complaint.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesTab = 
      (tabValue === 0) || // All
      (tabValue === 1 && complaint.status === 'new') || // New
      (tabValue === 2 && complaint.status === 'in progress') || // In Progress
      (tabValue === 3 && complaint.status === 'resolved'); // Resolved
    
    const matchesSearch = 
      searchTerm === '' ||
      complaint._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesTab && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Complaint Handling
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="complaint tabs">
          <Tab label="All Complaints" />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>New</Typography>
              {complaints.filter(c => c.status === 'new').length > 0 && (
                <Chip 
                  label={complaints.filter(c => c.status === 'new').length} 
                  color="error" 
                  size="small"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Box>
          } />
          <Tab label="In Progress" />
          <Tab label="Resolved" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              placeholder="Search by ID, subject, or customer"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Complaint Type"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="shipping">Shipping</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="account">Account</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              variant="outlined"
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredComplaints.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No complaints found matching your criteria
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint._id} hover>
                  <TableCell>{complaint._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                  <TableCell>{complaint.user.name}</TableCell>
                  <TableCell>
                    <Tooltip title={complaint.subject}>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {complaint.subject}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={complaint.type} 
                      size="small"
                      color={
                        complaint.type === 'product' ? 'primary' : 
                        complaint.type === 'shipping' ? 'info' : 
                        complaint.type === 'payment' ? 'secondary' : 
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={complaint.status} 
                      color={getStatusColor(complaint.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(complaint.updatedAt || complaint.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleViewComplaint(complaint)}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reply">
                        <IconButton 
                          onClick={() => handleReplyOpen(complaint)}
                          size="small"
                          color="secondary"
                        >
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Actions">
                        <IconButton 
                          onClick={(event) => handleMenuOpen(event, complaint._id)}
                          size="small"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Complaint Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Complaint #{selectedComplaint._id.slice(-6).toUpperCase()} - {selectedComplaint.subject}
                </Typography>
                <Chip 
                  label={selectedComplaint.status} 
                  color={getStatusColor(selectedComplaint.status)} 
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Complaint Information</Typography>
                    <Typography>Date: {formatDate(selectedComplaint.createdAt)}</Typography>
                    <Typography>Type: {selectedComplaint.type}</Typography>
                    {selectedComplaint.orderId && (
                      <Typography>Related Order: {selectedComplaint.orderId}</Typography>
                    )}
                    {selectedComplaint.productId && (
                      <Typography>Related Product: {selectedComplaint.productId}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Customer Information</Typography>
                    <Typography>Name: {selectedComplaint.user.name}</Typography>
                    <Typography>Email: {selectedComplaint.user.email}</Typography>
                    <Typography>Phone: {selectedComplaint.user.phone}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Complaint Details
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography>{selectedComplaint.message}</Typography>
                </Paper>
              </Box>

              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Attachments
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedComplaint.attachments.map((attachment, index) => (
                        <Grid item key={index}>
                          <Box 
                            component="img"
                            src={attachment.url}
                            alt={`Attachment ${index + 1}`}
                            sx={{ 
                              width: 100, 
                              height: 100, 
                              objectFit: 'cover',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              )}

              {selectedComplaint.conversation && selectedComplaint.conversation.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Conversation History
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {selectedComplaint.conversation.map((message, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            mb: 2,
                            display: 'flex',
                            flexDirection: message.isAdmin ? 'row-reverse' : 'row',
                          }}
                        >
                          <Box 
                            sx={{ 
                              maxWidth: '70%',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: message.isAdmin ? 'primary.light' : 'grey.100',
                              ml: message.isAdmin ? 0 : 2,
                              mr: message.isAdmin ? 2 : 0,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24,
                                  bgcolor: message.isAdmin ? 'primary.main' : 'secondary.main',
                                  mr: 1
                                }}
                              >
                                {message.isAdmin ? 'A' : 'U'}
                              </Avatar>
                              <Typography variant="subtitle2" color="text.secondary">
                                {message.isAdmin ? 'Admin' : selectedComplaint.user.name}
                              </Typography>
                            </Box>
                            <Typography>{message.message}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                              {formatDate(message.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => handleReplyOpen(selectedComplaint)}
                  >
                    Reply to Customer
                  </Button>
                  {selectedComplaint.status !== 'in progress' && (
                    <Button 
                      variant="outlined" 
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'in progress')}
                      color="primary"
                    >
                      Mark as In Progress
                    </Button>
                  )}
                  {selectedComplaint.status !== 'resolved' && (
                    <Button 
                      variant="outlined" 
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'resolved')}
                      color="success"
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {selectedComplaint.status !== 'closed' && (
                    <Button 
                      variant="outlined" 
                      onClick={() => handleUpdateStatus(selectedComplaint._id, 'closed')}
                      color="error"
                    >
                      Close Complaint
                    </Button>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={handleReplyClose}
        fullWidth
        maxWidth="sm"
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              Reply to Complaint #{selectedComplaint._id.slice(-6).toUpperCase()}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Replying to: {selectedComplaint.user.name}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  maxRows={12}
                  placeholder="Type your reply here..."
                  value={replyContent}
                  onChange={handleReplyContentChange}
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReplyClose}>Cancel</Button>
              <Button 
                onClick={handleSendReply} 
                variant="contained" 
                color="primary"
                disabled={!replyContent.trim() || replyLoading}
              >
                {replyLoading ? <CircularProgress size={24} /> : 'Send Reply'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleUpdateStatus(currentComplaintId, 'new')}>
          Mark as New
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(currentComplaintId, 'in progress')}>
          Mark as In Progress
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(currentComplaintId, 'resolved')}>
          Mark as Resolved
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(currentComplaintId, 'closed')}>
          Close Complaint
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ComplaintHandling; 