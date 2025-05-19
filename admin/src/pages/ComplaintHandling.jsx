import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';

// API base URL
const API_URL = 'http://localhost:5001/api/complaints';

// Fallback data in case API fails
const FALLBACK_COMPLAINTS = [
  {
    id: 'COMP-2023-001',
    date: '2023-05-20',
    customer: 'Green Valley Hotel',
    subject: 'Poor vegetable quality',
    priority: 'High',
    status: 'Open',
    category: 'Vegetable Quality',
    assignedTo: 'Sarah Wilson',
    orderId: 'ORD-2023-1234'
  },
  {
    id: 'COMP-2023-002',
    date: '2023-05-19',
    customer: 'Fresh Foods Market',
    subject: 'Delivery delayed - vegetables spoiled',
    priority: 'High',
    status: 'In Progress',
    category: 'Delivery',
    assignedTo: 'Mike Johnson',
    orderId: 'ORD-2023-1235'
  },
  {
    id: 'COMP-2023-003',
    date: '2023-05-18',
    customer: 'Sunshine Restaurant',
    subject: 'Refund for wrong vegetables',
    priority: 'Medium',
    status: 'Open',
    category: 'Billing',
    assignedTo: 'Unassigned',
    orderId: 'ORD-2023-1236'
  },
  {
    id: 'COMP-2023-004',
    date: '2023-05-17',
    customer: 'John Smith',
    subject: 'Hotel food not as described',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Food Quality',
    assignedTo: 'Sarah Wilson',
    orderId: 'ORD-2023-1237'
  },
  {
    id: 'COMP-2023-005',
    date: '2023-05-16',
    customer: 'Organic Farms',
    subject: 'Verification badge not showing',
    priority: 'Low',
    status: 'Open',
    category: 'Technical',
    assignedTo: 'Unassigned',
    orderId: 'N/A'
  },
  {
    id: 'COMP-2023-006',
    date: '2023-05-15',
    customer: 'Riverdale Hotel',
    subject: 'Billing discrepancy on bulk order',
    priority: 'Medium',
    status: 'Resolved',
    category: 'Billing',
    assignedTo: 'Mike Johnson',
    orderId: 'ORD-2023-1239'
  },
  {
    id: 'COMP-2023-007',
    date: '2023-05-14',
    customer: 'David Miller',
    subject: 'Urgent sale vegetables already expired',
    priority: 'High',
    status: 'Closed',
    category: 'Vegetable Quality',
    assignedTo: 'Sarah Wilson',
    orderId: 'ORD-2023-1240'
  }
];

// Sample message data - would be replaced with API data in production
const FALLBACK_MESSAGES = [
  {
    id: 1,
    complaint: 'COMP-2023-001',
    sender: 'John Doe',
    role: 'customer',
    message: 'I placed an order 5 days ago and it still hasn\'t arrived. Can you check the status?',
    timestamp: '2023-05-20 09:30:00'
  },
  {
    id: 2,
    complaint: 'COMP-2023-001',
    sender: 'Sarah Wilson',
    role: 'agent',
    message: 'I apologize for the delay. Let me check the order status for you right away.',
    timestamp: '2023-05-20 10:15:00'
  },
  {
    id: 3,
    complaint: 'COMP-2023-001',
    sender: 'Sarah Wilson',
    role: 'agent',
    message: 'I\'ve checked and there was a delay at our warehouse. Your order has now been shipped and should arrive within 2 business days. I\'ve added a 10% discount on your next order for the inconvenience.',
    timestamp: '2023-05-20 10:20:00'
  },
  {
    id: 4,
    complaint: 'COMP-2023-001',
    sender: 'John Doe',
    role: 'customer',
    message: 'Thank you for checking. I appreciate the discount.',
    timestamp: '2023-05-20 10:25:00'
  }
];

// Function to test API connection
const testComplaintsAPI = async () => {
  try {
    // Get all complaints
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Get complaint statistics
    const statsResponse = await fetch(`${API_URL}/stats/summary`);
    if (!statsResponse.ok) {
      throw new Error(`HTTP error for stats! status: ${statsResponse.status}`);
    }
    const statsData = await statsResponse.json();
    
    console.log('Complaints API test successful');
    return { success: true, data, stats: statsData };
  } catch (error) {
    console.error('Complaints API test error:', error);
    return { success: false, error: error.message };
  }
};

const ComplaintHandling = () => {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [apiWorking, setApiWorking] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: ''
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Check if we're on the Complaints page
  const isComplaintsPage = location.pathname.includes('/complaints') || location.pathname.includes('/complaint');
  
  // Only log API URL when on Complaints page
  useEffect(() => {
    if (isComplaintsPage) {
      console.log('Using Complaints API URL:', API_URL);
    }
  }, [isComplaintsPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isComplaintsPage) {
        return; // Skip API calls if not on Complaints page
      }
      
      console.log('Testing Complaints API connection...');
      const result = await testComplaintsAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isComplaintsPage]);

  // Fetch complaints data
  useEffect(() => {
    const fetchData = async () => {
      if (!isComplaintsPage) {
        return; // Skip API calls if not on Complaints page
      }
      
      setLoading(true);
      
      try {
        // Fetch all complaints
        const response = await fetch(API_URL);
        let complaintsData;
        
        if (response.ok) {
          complaintsData = await response.json();
          console.log('Complaints data fetched successfully:', complaintsData);
        } else {
          console.error('Error fetching complaints:', response.status);
          complaintsData = FALLBACK_COMPLAINTS;
        }
        
        // Format the data as needed
        const formattedComplaints = complaintsData.map((complaint, index) => {
          // Create a readable ID format
          const today = new Date();
          const year = today.getFullYear();
          const formattedId = `COMP-${year}-${String(index + 1).padStart(3, '0')}`;
          
          return {
            id: formattedId,
            originalId: complaint._id || complaint.id, // Keep the original MongoDB ID
            date: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : complaint.date,
            customer: complaint.customerName || complaint.customer,
            subject: complaint.subject,
            priority: complaint.priority,
            status: complaint.status,
            category: complaint.category || 'N/A',
            assignedTo: complaint.assignedTo || 'Unassigned',
            orderId: complaint.orderId || 'N/A',
            description: complaint.description || ''
          };
        });
        
        setComplaints(formattedComplaints);
        
        // Fetch complaint statistics
        try {
          const statsResponse = await fetch(`${API_URL}/stats/summary`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setComplaintStats({
              total: statsData.total || 0,
              pending: statsData.pending || 0,
              inProgress: statsData.inProgress || 0,
              resolved: statsData.resolved || 0
            });
          } else {
            // Calculate stats from complaints if API fails
            const total = formattedComplaints.length;
            const pending = formattedComplaints.filter(c => c.status === 'pending' || c.status === 'Open').length;
            const inProgress = formattedComplaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
            const resolved = formattedComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
            
            setComplaintStats({
              total,
              pending,
              inProgress,
              resolved
            });
          }
        } catch (error) {
          console.error('Error fetching complaint stats:', error);
          // Calculate stats from complaints if API fails
          const total = formattedComplaints.length;
          const pending = formattedComplaints.filter(c => c.status === 'pending' || c.status === 'Open').length;
          const inProgress = formattedComplaints.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
          const resolved = formattedComplaints.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
          
          setComplaintStats({
            total,
            pending,
            inProgress,
            resolved
          });
        }
        
      } catch (error) {
        console.error('Error fetching complaints data:', error);
        setComplaints(FALLBACK_COMPLAINTS);
        
        // Calculate stats from fallback data
        const total = FALLBACK_COMPLAINTS.length;
        const pending = FALLBACK_COMPLAINTS.filter(c => c.status === 'pending' || c.status === 'Open').length;
        const inProgress = FALLBACK_COMPLAINTS.filter(c => c.status === 'in-progress' || c.status === 'In Progress').length;
        const resolved = FALLBACK_COMPLAINTS.filter(c => c.status === 'resolved' || c.status === 'Resolved').length;
        
        setComplaintStats({
          total,
          pending,
          inProgress,
          resolved
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isComplaintsPage]);
  
  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Fetch all complaints
      const response = await fetch(API_URL);
      let complaintsData;
      
      if (response.ok) {
        complaintsData = await response.json();
        console.log('Complaints data refreshed successfully:', complaintsData);
      } else {
        console.error('Error refreshing complaints:', response.status);
        complaintsData = FALLBACK_COMPLAINTS;
      }
      
      // Format the data as needed
      const formattedComplaints = complaintsData.map((complaint, index) => {
        // Create a readable ID format
        const today = new Date();
        const year = today.getFullYear();
        const formattedId = `COMP-${year}-${String(index + 1).padStart(3, '0')}`;
        
        return {
          id: formattedId,
          originalId: complaint._id || complaint.id, // Keep the original MongoDB ID
          date: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : complaint.date,
          customer: complaint.customerName || complaint.customer,
          subject: complaint.subject,
          priority: complaint.priority,
          status: complaint.status,
          category: complaint.category || 'N/A',
          assignedTo: complaint.assignedTo || 'Unassigned',
          orderId: complaint.orderId || 'N/A',
          description: complaint.description || ''
        };
      });
      
      setComplaints(formattedComplaints);
      
      // Fetch complaint statistics
      try {
        const statsResponse = await fetch(`${API_URL}/stats/summary`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setComplaintStats({
            total: statsData.total || 0,
            pending: statsData.pending || 0,
            inProgress: statsData.inProgress || 0,
            resolved: statsData.resolved || 0
          });
        }
      } catch (error) {
        console.error('Error refreshing complaint stats:', error);
      }
      
    } catch (error) {
      console.error('Error refreshing complaints data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter dialog
  const handleFilterDialogOpen = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  const handleApplyFilters = () => {
    // Apply filters logic would go here
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      assignedTo: ''
    });
  };

  // Handle complaint details view
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    
    // Fetch messages for this complaint
    fetchComplaintMessages(complaint.originalId);
    
    setDetailsDialogOpen(true);
  };
  
  // Fetch messages for a complaint
  const fetchComplaintMessages = async (complaintId) => {
    try {
      // In a real implementation, you would fetch messages from the API
      // const response = await fetch(`${API_URL}/${complaintId}/messages`);
      // const messagesData = await response.json();
      // setMessages(messagesData);
      
      // For now, use sample data filtered by complaint ID
      setMessages(FALLBACK_MESSAGES.filter(m => m.complaint === complaintId));
    } catch (error) {
      console.error('Error fetching complaint messages:', error);
      setMessages(FALLBACK_MESSAGES.filter(m => m.complaint === complaintId));
    }
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedComplaint(null);
    setMessages([]);
    setNewMessage('');
  };

  // Handle new message
  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    // In a real implementation, you would send the message to the API
    // For now, just add it to the local state
    const newMsg = {
      id: messages.length + 1,
      complaint: selectedComplaint.originalId,
      sender: 'Agent Name', // This would be the logged-in user
      role: 'agent',
      message: newMessage,
      timestamp: new Date().toLocaleString()
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  // Helper functions for UI
  const getStatusChipColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'open' || lowerStatus === 'pending') {
      return 'error';
    } else if (lowerStatus === 'in progress' || lowerStatus === 'in-progress') {
      return 'warning';
    } else if (lowerStatus === 'resolved') {
      return 'success';
    } else if (lowerStatus === 'closed') {
      return 'info';
    }
    return 'default';
  };

  const getPriorityChipColor = (priority) => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority === 'high') {
      return 'error';
    } else if (lowerPriority === 'medium') {
      return 'warning';
    } else if (lowerPriority === 'low') {
      return 'success';
    }
    return 'default';
  };

  // Filtered and sorted complaints
  const filteredComplaints = complaints.filter(complaint => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      complaint.id.toLowerCase().includes(lowerSearchTerm) ||
      complaint.customer.toLowerCase().includes(lowerSearchTerm) ||
      complaint.subject.toLowerCase().includes(lowerSearchTerm);
      
    const matchesStatus = filters.status ? complaint.status.toLowerCase() === filters.status.toLowerCase() : true;
    const matchesPriority = filters.priority ? complaint.priority.toLowerCase() === filters.priority.toLowerCase() : true;
    const matchesCategory = filters.category ? complaint.category.toLowerCase() === filters.category.toLowerCase() : true;
    const matchesAssignedTo = filters.assignedTo ? complaint.assignedTo.toLowerCase() === filters.assignedTo.toLowerCase() : true;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignedTo;
  });
  
  // Filter complaints by tab value
  const displayComplaints = filteredComplaints.filter(complaint => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return complaint.status.toLowerCase() === 'open' || complaint.status.toLowerCase() === 'pending'; // Open
    if (tabValue === 2) return complaint.status.toLowerCase() === 'in progress' || complaint.status.toLowerCase() === 'in-progress'; // In Progress
    if (tabValue === 3) return complaint.status.toLowerCase() === 'resolved'; // Resolved
    return true;
  });

  // Sort complaints
  const sortedComplaints = [...displayComplaints].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date sorting
    if (sortField === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const paginatedComplaints = sortedComplaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Complaint Handling
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Complaints
              </Typography>
              <Typography variant="h3">
                {loading ? <CircularProgress size={24} /> : complaintStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h3" color="error">
                {loading ? <CircularProgress size={24} /> : complaintStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h3" color="warning.main">
                {loading ? <CircularProgress size={24} /> : complaintStats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h3" color="success.main">
                {loading ? <CircularProgress size={24} /> : complaintStats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All" />
            <Tab label="Open" />
            <Tab label="In Progress" />
            <Tab label="Resolved" />
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              placeholder="Search complaints..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterDialogOpen}
            >
              Filter
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('id')}
                  sx={{ cursor: 'pointer' }}
                >
                  ID
                  {sortField === 'id' && (
                    sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('date')}
                  sx={{ cursor: 'pointer' }}
                >
                  Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('customer')}
                  sx={{ cursor: 'pointer' }}
                >
                  Customer
                  {sortField === 'customer' && (
                    sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                  )}
                </TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedComplaints.map((complaint) => (
                  <TableRow key={complaint.id} hover>
                    <TableCell>{complaint.id}</TableCell>
                    <TableCell>{complaint.date}</TableCell>
                    <TableCell>{complaint.customer}</TableCell>
                    <TableCell>{complaint.subject}</TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.priority} 
                        color={getPriorityChipColor(complaint.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={complaint.status} 
                        color={getStatusChipColor(complaint.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{complaint.assignedTo}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(complaint)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredComplaints.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={handleFilterDialogClose}>
        <DialogTitle>Filter Complaints</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                label="Priority"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Vegetable Quality">Vegetable Quality</MenuItem>
                <MenuItem value="Delivery">Delivery</MenuItem>
                <MenuItem value="Billing">Billing</MenuItem>
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Food Quality">Food Quality</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                label="Assigned To"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Sarah Wilson">Sarah Wilson</MenuItem>
                <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
                <MenuItem value="Unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters}>Reset</Button>
          <Button onClick={handleFilterDialogClose}>Cancel</Button>
          <Button onClick={handleApplyFilters} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
      
      {/* Complaint Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleDetailsDialogClose}
        fullWidth
        maxWidth="md"
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              Complaint Details: {selectedComplaint.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Complaint Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Customer</Typography>
                        <Typography variant="body1">{selectedComplaint.customer}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Date</Typography>
                        <Typography variant="body1">{selectedComplaint.date}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Status</Typography>
                        <Chip 
                          label={selectedComplaint.status} 
                          color={getStatusChipColor(selectedComplaint.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Priority</Typography>
                        <Chip 
                          label={selectedComplaint.priority} 
                          color={getPriorityChipColor(selectedComplaint.priority)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Category</Typography>
                        <Typography variant="body1">{selectedComplaint.category}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Assigned To</Typography>
                        <Typography variant="body1">{selectedComplaint.assignedTo}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Order ID</Typography>
                        <Typography variant="body1">{selectedComplaint.orderId}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Subject</Typography>
                        <Typography variant="body1">{selectedComplaint.subject}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography variant="body1">{selectedComplaint.description || 'No description provided.'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Communication
                    </Typography>
                    <Box sx={{ 
                      flex: 1, 
                      overflowY: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2
                    }}>
                      {messages.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" align="center">
                          No messages yet
                        </Typography>
                      ) : (
                        messages.map((msg) => (
                          <Box 
                            key={msg.id}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: msg.role === 'agent' ? 'flex-end' : 'flex-start',
                              mb: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1,
                                  bgcolor: msg.role === 'agent' ? 'primary.main' : 'secondary.main'
                                }}
                              >
                                {msg.sender.charAt(0)}
                              </Avatar>
                              <Typography variant="caption" color="textSecondary">
                                {msg.sender} - {msg.timestamp}
                              </Typography>
                            </Box>
                            <Paper
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                maxWidth: '80%',
                                bgcolor: msg.role === 'agent' ? 'primary.light' : 'grey.100',
                                color: msg.role === 'agent' ? 'primary.contrastText' : 'inherit'
                              }}
                            >
                              <Typography variant="body2">
                                {msg.message}
                              </Typography>
                            </Paper>
                          </Box>
                        ))
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={handleNewMessageChange}
                        multiline
                        maxRows={3}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{ ml: 1 }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsDialogClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComplaintHandling; 