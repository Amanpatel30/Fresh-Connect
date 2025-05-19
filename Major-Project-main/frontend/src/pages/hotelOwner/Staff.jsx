import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Divider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';
import { UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample staff data
  const staffMembers = [
    { id: 1, name: 'John Smith', role: 'Manager', department: 'Kitchen', phone: '(555) 123-4567', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', role: 'Chef', department: 'Kitchen', phone: '(555) 234-5678', email: 'sarah@example.com', status: 'Active' },
    { id: 3, name: 'Michael Brown', role: 'Waiter', department: 'Service', phone: '(555) 345-6789', email: 'michael@example.com', status: 'Active' },
    { id: 4, name: 'Emma Davis', role: 'Receptionist', department: 'Front Desk', phone: '(555) 456-7890', email: 'emma@example.com', status: 'On Leave' },
    { id: 5, name: 'James Wilson', role: 'Janitor', department: 'Maintenance', phone: '(555) 567-8901', email: 'james@example.com', status: 'Active' },
  ];
  
  // Filter staff based on search term
  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Staff management card */}
      <Grid container spacing={3}>
        {/* Staff summary cards */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            className="card-3d"
            sx={{
              p: 3,
              borderRadius: '16px',
              height: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Staff Overview
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                <UserAddOutlined />
              </Avatar>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {staffMembers.length}
            </Typography>
            <Typography variant="body2">
              Total staff members
            </Typography>
            <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {staffMembers.filter(staff => staff.status === 'Active').length}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  On Leave
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {staffMembers.filter(staff => staff.status === 'On Leave').length}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            className="card-3d"
            sx={{
              p: 3,
              borderRadius: '16px',
              height: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Department Distribution
              </Typography>
            </Box>
            <Box sx={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
              {/* Simple bar chart */}
              <Box sx={{ 
                height: '150px', 
                width: '25%', 
                bgcolor: '#6366f1', 
                borderRadius: '8px 8px 0 0',
                mx: 1,
                position: 'relative'
              }}>
                <Typography variant="body2" sx={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  Kitchen
                </Typography>
                <Typography variant="body2" sx={{ position: 'absolute', top: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  2
                </Typography>
              </Box>
              <Box sx={{ 
                height: '100px', 
                width: '25%', 
                bgcolor: '#8b5cf6', 
                borderRadius: '8px 8px 0 0',
                mx: 1,
                position: 'relative'
              }}>
                <Typography variant="body2" sx={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  Service
                </Typography>
                <Typography variant="body2" sx={{ position: 'absolute', top: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  1
                </Typography>
              </Box>
              <Box sx={{ 
                height: '100px', 
                width: '25%', 
                bgcolor: '#a78bfa', 
                borderRadius: '8px 8px 0 0',
                mx: 1,
                position: 'relative'
              }}>
                <Typography variant="body2" sx={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  Front Desk
                </Typography>
                <Typography variant="body2" sx={{ position: 'absolute', top: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  1
                </Typography>
              </Box>
              <Box sx={{ 
                height: '100px', 
                width: '25%', 
                bgcolor: '#c4b5fd', 
                borderRadius: '8px 8px 0 0',
                mx: 1,
                position: 'relative'
              }}>
                <Typography variant="body2" sx={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  Maintenance
                </Typography>
                <Typography variant="body2" sx={{ position: 'absolute', top: '-25px', left: 0, right: 0, textAlign: 'center' }}>
                  1
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Staff List Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            className="card-3d"
            sx={{
              p: 3,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Staff Members
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="Search staff..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchOutlined style={{ color: '#6366f1', marginRight: '8px' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<UserAddOutlined />}
                  sx={{
                    bgcolor: '#6366f1',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#4f46e5',
                    }
                  }}
                >
                  Add Staff
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow
                      key={staff.id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(99, 102, 241, 0.05)',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: '#6366f1' }}>
                            {staff.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {staff.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{staff.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">{staff.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: '50px',
                            bgcolor: staff.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: staff.status === 'Active' ? '#22c55e' : '#f59e0b',
                            fontWeight: 500,
                            fontSize: '12px',
                          }}
                        >
                          {staff.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<EditOutlined />}
                            sx={{
                              color: '#6366f1',
                              minWidth: 'auto',
                              '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DeleteOutlined />}
                            sx={{
                              color: '#ef4444',
                              minWidth: 'auto',
                              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Staff; 