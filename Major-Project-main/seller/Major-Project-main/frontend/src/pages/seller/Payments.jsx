import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Payments = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    totalEarnings: 25003,
    pendingPayouts: 3500,
    lastPayout: 2800,
    transactionFees: 250,
  };

  const transactions = [
    {
      id: 1,
      date: '2024-02-28',
      orderId: 'ORD001',
      amount: 1500,
      status: 'completed',
      type: 'sale',
      customer: 'John Doe',
    },
    {
      id: 2,
      date: '2024-02-27',
      orderId: 'ORD002',
      amount: 2800,
      status: 'pending',
      type: 'payout',
      customer: 'System',
    },
    // Add more transactions as needed
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payments & Earnings
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Earnings
                </Typography>
              </Box>
              <Typography variant="h4">₹{stats.totalEarnings}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pending Payouts
                </Typography>
              </Box>
              <Typography variant="h4">₹{stats.pendingPayouts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Last Payout
                </Typography>
              </Box>
              <Typography variant="h4">₹{stats.lastPayout}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="error" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Transaction Fees
                </Typography>
              </Box>
              <Typography variant="h4">₹{stats.transactionFees}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Transaction History</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="To Date"
                value={dateRange[1]}
                onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Export">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.orderId}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {transaction.type}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell align="right">₹{transaction.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Payments; 