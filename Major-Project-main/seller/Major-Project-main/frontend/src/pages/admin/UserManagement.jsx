import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button, 
  Chip, 
  Avatar, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  Badge,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Edit, 
  Delete, 
  Block, 
  CheckCircle, 
  MoreVert, 
  Refresh, 
  Add, 
  Download,
  PersonAdd,
  Person,
  Store,
  Restaurant,
  AddCircleOutline,
  AdminPanelSettings,
  VisibilityOutlined as ViewIcon
} from '@mui/icons-material';

// Mock data for users
const mockUsers = [
  { 
    id: 1, 
    name: 'John Smith', 
    email: 'john.smith@example.com', 
    phone: '9876543210', 
    role: 'user', 
    status: 'active', 
    joined: '2023-01-15', 
    lastLogin: '2023-05-20', 
    avatar: 'JS',
    orders: 12,
    verified: true 
  },
  { 
    id: 2, 
    name: 'Priya Sharma', 
    email: 'priyasharma@example.com', 
    phone: '8765432109', 
    role: 'seller', 
    status: 'active', 
    joined: '2023-02-10', 
    lastLogin: '2023-05-18', 
    avatar: 'PS',
    orders: 0,
    verified: true 
  },
  { 
    id: 3, 
    name: 'Taj Restaurant', 
    email: 'info@tajrestaurant.com', 
    phone: '7654321098', 
    role: 'restaurant', 
    status: 'active', 
    joined: '2023-03-05', 
    lastLogin: '2023-05-19', 
    avatar: 'TR',
    orders: 0,
    verified: true 
  },
  { 
    id: 4, 
    name: 'Mike Johnson', 
    email: 'mike.j@example.com', 
    phone: '6543210987', 
    role: 'user', 
    status: 'inactive', 
    joined: '2023-01-20', 
    lastLogin: '2023-03-15', 
    avatar: 'MJ',
    orders: 3,
    verified: true 
  },
  { 
    id: 5, 
    name: 'Fresh Farms', 
    email: 'contact@freshfarms.com', 
    phone: '5432109876', 
    role: 'seller', 
    status: 'pending', 
    joined: '2023-04-25', 
    lastLogin: '2023-05-20', 
    avatar: 'FF',
    orders: 0,
    verified: false 
  },
  { 
    id: 6, 
    name: 'Green Garden Restaurant', 
    email: 'info@greengarden.com', 
    phone: '4321098765', 
    role: 'restaurant', 
    status: 'pending', 
    joined: '2023-05-01', 
    lastLogin: '2023-05-15', 
    avatar: 'GG',
    orders: 0,
    verified: false 
  },
  { 
    id: 7, 
    name: 'Sarah Williams', 
    email: 'sarah.w@example.com', 
    phone: '3210987654', 
    role: 'user', 
    status: 'suspended', 
    joined: '2023-02-15', 
    lastLogin: '2023-03-10', 
    avatar: 'SW',
    orders: 1,
    verified: true 
  },
  { 
    id: 8, 
    name: 'Organic Valley', 
    email: 'sales@organicvalley.com', 
    phone: '2109876543', 
    role: 'seller', 
    status: 'active', 
    joined: '2023-03-20', 
    lastLogin: '2023-05-19', 
    avatar: 'OV',
    orders: 0,
    verified: true 
  },
  { 
    id: 9, 
    name: 'Spice Garden', 
    email: 'contact@spicegarden.com', 
    phone: '1098765432', 
    role: 'restaurant', 
    status: 'active', 
    joined: '2023-02-28', 
    lastLogin: '2023-05-17', 
    avatar: 'SG',
    orders: 0,
    verified: true 
  },
  { 
    id: 10, 
    name: 'Daniel Brown', 
    email: 'daniel.b@example.com', 
    phone: '0987654321', 
    role: 'admin', 
    status: 'active', 
    joined: '2023-01-10', 
    lastLogin: '2023-05-20', 
    avatar: 'DB',
    orders: 0,
    verified: true 
  },
  { 
    id: 11, 
    name: 'Fresh Veggies', 
    email: 'info@freshveggies.com', 
    phone: '9876543219', 
    role: 'seller', 
    status: 'active', 
    joined: '2023-04-15', 
    lastLogin: '2023-05-18', 
    avatar: 'FV',
    orders: 0,
    verified: true 
  },
  { 
    id: 12, 
    name: 'Emma Wilson', 
    email: 'emma.w@example.com', 
    phone: '8765432198', 
    role: 'user', 
    status: 'active', 
    joined: '2023-03-15', 
    lastLogin: '2023-05-10', 
    avatar: 'EW',
    orders: 8,
    verified: true 
  },
  { 
    id: 13, 
    name: 'Veggie Delight', 
    email: 'orders@veggiedelight.com', 
    phone: '7654321987', 
    role: 'restaurant', 
    status: 'active', 
    joined: '2023-04-10', 
    lastLogin: '2023-05-19', 
    avatar: 'VD',
    orders: 0,
    verified: true 
  },
  { 
    id: 14, 
    name: 'Lucas Garcia', 
    email: 'lucas.g@example.com', 
    phone: '6543219876', 
    role: 'user', 
    status: 'active', 
    joined: '2023-05-05', 
    lastLogin: '2023-05-18', 
    avatar: 'LG',
    orders: 2,
    verified: true 
  },
  { 
    id: 15, 
    name: 'Sunset Farms', 
    email: 'contact@sunsetfarms.com', 
    phone: '5432198765', 
    role: 'seller', 
    status: 'inactive', 
    joined: '2023-03-25', 
    lastLogin: '2023-04-15', 
    avatar: 'SF',
    orders: 0,
    verified: true 
  }
];

// Statistics data
const userStats = [
  { title: 'Total Users', value: 8435, icon: Person, color: '#4a90e2', increase: 15 },
  { title: 'Active Sellers', value: 126, icon: Store, color: '#22c55e', increase: 8 },
  { title: 'Restaurants', value: 83, icon: Restaurant, color: '#f59e0b', increase: 5 },
  { title: 'New This Month', value: 247, icon: PersonAdd, color: '#9333ea', increase: 24 }
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle dialog open
  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle role filter change
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle user action (suspend, delete, etc.)
  const handleUserAction = (action) => {
    let message = '';
    let severity = 'success';
    
    if (action === 'delete') {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      message = `User ${selectedUser.name} has been deleted`;
    } else if (action === 'suspend') {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, status: 'suspended' } : user
      ));
      message = `User ${selectedUser.name} has been suspended`;
    } else if (action === 'activate') {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, status: 'active' } : user
      ));
      message = `User ${selectedUser.name} has been activated`;
    } else if (action === 'verify') {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, verified: true } : user
      ));
      message = `User ${selectedUser.name} has been verified`;
    }
    
    setSnackbar({ open: true, message, severity });
    handleDialogClose();
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all users across the platform
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: '#22c55e',
              '&:hover': {
                backgroundColor: '#16a34a',
              },
            }}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {/* User Statistics */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={3} mb={4}>
          {userStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  height: '100%'
                }}
              >
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        backgroundColor: stat.color + '20',
                        color: stat.color,
                        width: 48,
                        height: 48
                      }}
                    >
                      <stat.icon />
                    </Avatar>
                    <Box ml={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={`+${stat.increase}% this month`}
                      size="small"
                      sx={{
                        backgroundColor: '#22c55e20',
                        color: '#22c55e',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="All Users" />
            <Tab label="Customers" />
            <Tab label="Sellers" />
            <Tab label="Restaurants" />
            <Tab label="Admins" />
          </Tabs>
        </Box>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Box mb={4} display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between">
          <Box display="flex" gap={2} flexWrap="wrap" flex="1">
            <TextField
              placeholder="Search users..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                value={roleFilter}
                label="Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="user">Customer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              size="small"
            >
              More Filters
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Users Data Grid */}
      <motion.div variants={itemVariants}>
        <Paper
          sx={{
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={60}></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow 
                      key={user.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              user.status === 'active' ? (
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    border: '2px solid white',
                                  }}
                                />
                              ) : user.status === 'suspended' ? (
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    border: '2px solid white',
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: '#f59e0b',
                                    border: '2px solid white',
                                  }}
                                />
                              )
                            }
                          >
                            <Avatar
                              sx={{
                                bgcolor: user.role === 'admin' ? '#9333ea' : 
                                        user.role === 'seller' ? '#22c55e' : 
                                        user.role === 'restaurant' ? '#f59e0b' : '#4a90e2'
                              }}
                            >
                              {user.avatar}
                            </Avatar>
                          </Badge>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          size="small"
                          sx={{
                            backgroundColor: 
                              user.role === 'admin' ? '#9333ea20' : 
                              user.role === 'seller' ? '#22c55e20' : 
                              user.role === 'restaurant' ? '#f59e0b20' : '#4a90e220',
                            color: 
                              user.role === 'admin' ? '#9333ea' : 
                              user.role === 'seller' ? '#22c55e' : 
                              user.role === 'restaurant' ? '#f59e0b' : '#4a90e2',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)} 
                          size="small"
                          sx={{
                            backgroundColor: 
                              user.status === 'active' ? '#22c55e20' : 
                              user.status === 'inactive' ? '#64748b20' : 
                              user.status === 'suspended' ? '#ef444420' : '#f59e0b20',
                            color: 
                              user.status === 'active' ? '#22c55e' : 
                              user.status === 'inactive' ? '#64748b' : 
                              user.status === 'suspended' ? '#ef4444' : '#f59e0b',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.verified ? (
                          <Chip 
                            icon={<CheckCircle fontSize="small" />}
                            label="Verified" 
                            size="small"
                            sx={{
                              backgroundColor: '#22c55e20',
                              color: '#22c55e',
                              fontWeight: 'medium'
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Unverified" 
                            size="small"
                            sx={{
                              backgroundColor: '#64748b20',
                              color: '#64748b',
                              fontWeight: 'medium'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              handleDialogOpen('view');
                            }}
                            sx={{ color: '#4a90e2' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              handleDialogOpen('edit');
                            }}
                            sx={{ color: '#f59e0b' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton 
                            size="small"
                            onClick={(event) => handleMenuOpen(event, user)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No users found. Try changing your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </motion.div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleDialogOpen('view')}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit')}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem 
          onClick={() => handleDialogOpen('suspend')}
          sx={{ color: selectedUser?.status === 'suspended' ? 'text.primary' : '#ef4444' }}
        >
          {selectedUser?.status === 'suspended' ? (
            <>
              <CheckCircle fontSize="small" sx={{ mr: 1, color: '#22c55e' }} />
              Reactivate User
            </>
          ) : (
            <>
              <Block fontSize="small" sx={{ mr: 1 }} />
              Suspend User
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: '#ef4444' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* User Action Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        {dialogType === 'view' && selectedUser && (
          <>
            <DialogTitle 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                pb: 2 
              }}
            >
              <Avatar 
                sx={{ 
                  mr: 2,
                  bgcolor: 
                    selectedUser.role === 'admin' ? '#9333ea' : 
                    selectedUser.role === 'seller' ? '#22c55e' : 
                    selectedUser.role === 'restaurant' ? '#f59e0b' : '#4a90e2'
                }}
              >
                {selectedUser.avatar}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser.name}</Typography>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)} 
                    size="small"
                    sx={{
                      backgroundColor: 
                        selectedUser.role === 'admin' ? '#9333ea20' : 
                        selectedUser.role === 'seller' ? '#22c55e20' : 
                        selectedUser.role === 'restaurant' ? '#f59e0b20' : '#4a90e220',
                      color: 
                        selectedUser.role === 'admin' ? '#9333ea' : 
                        selectedUser.role === 'seller' ? '#22c55e' : 
                        selectedUser.role === 'restaurant' ? '#f59e0b' : '#4a90e2',
                      fontWeight: 'medium'
                    }}
                  />
                  <Chip 
                    label={selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)} 
                    size="small"
                    sx={{
                      backgroundColor: 
                        selectedUser.status === 'active' ? '#22c55e20' : 
                        selectedUser.status === 'inactive' ? '#64748b20' : 
                        selectedUser.status === 'suspended' ? '#ef444420' : '#f59e0b20',
                      color: 
                        selectedUser.status === 'active' ? '#22c55e' : 
                        selectedUser.status === 'inactive' ? '#64748b' : 
                        selectedUser.status === 'suspended' ? '#ef4444' : '#f59e0b',
                      fontWeight: 'medium'
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedUser.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Joined Date</Typography>
                  <Typography variant="body1">{selectedUser.joined}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Active</Typography>
                  <Typography variant="body1">{selectedUser.lastLogin}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Orders</Typography>
                  <Typography variant="body1">{selectedUser.orders}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Verification</Typography>
                  <Typography variant="body1">{selectedUser.verified ? 'Verified' : 'Not Verified'}</Typography>
                </Grid>
              </Grid>
              
              {(selectedUser.role === 'seller' || selectedUser.role === 'restaurant') && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Verification Documents</Typography>
                  <Box 
                    sx={{ 
                      backgroundColor: 'background.default', 
                      p: 2, 
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    {selectedUser.verified ? (
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">GST Certificate</Typography>
                          <Chip label="Verified" size="small" color="success" />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">PAN Card</Typography>
                          <Chip label="Verified" size="small" color="success" />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Business License</Typography>
                          <Chip label="Verified" size="small" color="success" />
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        User has not submitted verification documents yet.
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={() => {
                  handleDialogClose();
                  handleDialogOpen('edit');
                }}
              >
                Edit User
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'edit' && selectedUser && (
          <>
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Edit user information and settings
              </Typography>
              <Box component="form" sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      defaultValue={selectedUser.name}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      defaultValue={selectedUser.email}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      defaultValue={selectedUser.phone}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Role</InputLabel>
                      <Select
                        defaultValue={selectedUser.role}
                        label="Role"
                      >
                        <MenuItem value="user">Customer</MenuItem>
                        <MenuItem value="seller">Seller</MenuItem>
                        <MenuItem value="restaurant">Restaurant</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        defaultValue={selectedUser.status}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
    </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleDialogClose}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'suspend' && selectedUser && (
          <>
            <DialogTitle>
              {selectedUser.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
            </DialogTitle>
            <DialogContent>
              {selectedUser.status === 'suspended' ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are about to reactivate this user. They will regain access to their account.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You are about to suspend this user. They will lose access to their account.
                </Alert>
              )}
              <Typography variant="body1">
                {selectedUser.status === 'suspended' 
                  ? `Are you sure you want to reactivate ${selectedUser.name}?`
                  : `Are you sure you want to suspend ${selectedUser.name}?`
                }
              </Typography>
              {selectedUser.status !== 'suspended' && (
                <TextField
                  label="Reason for suspension"
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                color={selectedUser.status === 'suspended' ? "success" : "error"}
                onClick={() => handleUserAction(selectedUser.status === 'suspended' ? 'activate' : 'suspend')}
              >
                {selectedUser.status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'delete' && selectedUser && (
          <>
            <DialogTitle>Delete User</DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                Warning: This action cannot be undone!
              </Alert>
              <Typography variant="body1">
                Are you sure you want to permanently delete the user "{selectedUser.name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                All data associated with this user will be permanently removed from the system.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => handleUserAction('delete')}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default UserManagement; 