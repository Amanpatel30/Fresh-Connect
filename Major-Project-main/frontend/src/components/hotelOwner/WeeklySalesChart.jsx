import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { formatCurrency } from '../../utils/format';

// Register all Chart.js components
Chart.register(...registerables);

const WeeklySalesChart = ({ salesData = [], loading = false }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showQuery, setShowQuery] = useState(false);

  useEffect(() => {
    console.log('WeeklySalesChart received:', salesData);
    
    // Check if we have valid data
    const hasValidData = salesData && 
      Array.isArray(salesData) && 
      salesData.length > 0 && 
      salesData.some(day => day.sales > 0);
    
    if (!hasValidData) {
      console.log('No valid sales data available for chart');
      return;
    }

    // Check if canvas element exists
    if (!chartRef.current) {
      console.error('Chart canvas element not found');
      return;
    }

    try {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      // Extract data for the chart
      const labels = salesData.map(day => day.day);
      const data = salesData.map(day => day.sales);
      
      // Create gradient for the area under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sales',
            data: data,
            borderColor: '#6366F1',
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#6366F1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#1F2937',
              bodyColor: '#1F2937',
              borderColor: 'rgba(229, 231, 235, 1)',
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  return `Sales: ${formatCurrency(context.parsed.y)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11,
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(243, 244, 246, 1)',
              },
              border: {
                dash: [5, 5],
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11,
                },
                callback: function(value) {
                  return formatCurrency(value);
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [salesData]);

  const toggleQuery = () => {
    setShowQuery(!showQuery);
  };

  const getMongoDBInsertQuery = () => {
    const today = new Date();
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate dates for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date,
        dayName: dayNames[date.getDay()]
      });
    }
    
    // Format dates for MongoDB
    const formatDate = (date) => {
      return date.toISOString();
    };
    
    return `
// MongoDB query to insert sample orders for the past 7 days
// Run these queries to create sample weekly sales data

${days.map((day, index) => {
  const randomAmount = Math.floor(Math.random() * 1500) + 500;
  const randomQuantity = Math.floor(Math.random() * 3) + 1;
  
  return `// ${day.dayName} order
db.orders.insertOne({
  "items": [
    {
      "menuItemId": ObjectId("60d21b4667d0d8992e610c${85 + index}"),
      "name": "Sample Menu Item ${index + 1}",
      "price": ${randomAmount / randomQuantity},
      "quantity": ${randomQuantity}
    }
  ],
  "totalAmount": ${randomAmount},
  "status": "delivered",
  "paymentStatus": "paid",
  "paymentMethod": "online",
  "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}"),
  "createdAt": new Date("${formatDate(day.date)}"),
  "updatedAt": new Date("${formatDate(day.date)}")
});
`}).join('\n')}
    `;
  };

  // If loading, show loading state
  if (loading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          height: '100%', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Weekly Sales</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  // Check if we have valid data
  const hasValidData = salesData && 
    Array.isArray(salesData) && 
    salesData.length > 0 && 
    salesData.some(day => day.sales > 0);

  // If no valid data, show a message
  if (!hasValidData) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          height: '100%', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Weekly Sales</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column' }}>
          <InfoOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            No weekly sales data available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Complete some orders to see your weekly sales chart
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={toggleQuery}
            sx={{ mb: 2 }}
          >
            {showQuery ? 'Hide MongoDB Query' : 'Show MongoDB Query'}
          </Button>
          
          {showQuery && (
            <Box 
              sx={{ 
                width: '100%', 
                maxHeight: '200px', 
                overflow: 'auto', 
                bgcolor: 'rgba(0, 0, 0, 0.05)', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {getMongoDBInsertQuery()}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Calculate total sales for the week
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  
  // Find the day with the highest sales
  const bestDay = salesData.reduce((best, current) => 
    current.sales > best.sales ? current : best, salesData[0]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        height: '100%', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(229, 231, 235, 1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Weekly Sales</Typography>
        <Box>
          <Typography variant="body2" color="text.secondary">Total: {formatCurrency(totalSales)}</Typography>
          <Typography variant="caption" color="text.secondary">
            Best day: {bestDay.day} ({formatCurrency(bestDay.sales)})
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ height: 300, position: 'relative' }}>
        <canvas ref={chartRef} />
      </Box>
    </Paper>
  );
};

export default WeeklySalesChart; 