import React, { useEffect } from 'react';
import { styled, Box, Typography, Grid } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(...registerables);

const SummaryContainer = styled(Box)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

const SummaryHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const SummaryTopSection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3),
  borderRadius: '20px 20px 0 0',
  width: '98%',
  margin: '0 auto',
}));

const SummaryBodySection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3, 3, 3),
  borderTop: '1px solid rgba(230, 230, 235, 0.8)',
  width: '98%',
  margin: '0 auto',
  height: '300px',
  borderRadius: '0 0 20px 20px',
  display: 'flex',
  flexDirection: 'column',
}));

const HighlightBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color || 'white',
  borderRadius: '10px',
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
}));

const SummaryChart = (props) => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Productivity',
        data: [65, 59, 80, 81, 56, 85],
        fill: false,
        borderColor: '#6C63FF',
        tension: 0.4,
      },
      {
        label: 'Efficiency',
        data: [28, 48, 40, 69, 76, 67],
        fill: false,
        borderColor: '#4CAF50',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  useEffect(() => {
    console.log('SummaryChart component loaded');
  }, []);

  return (
    <SummaryContainer {...props}>
      <SummaryHeader>
        <Box>
          <Typography variant="h6" fontWeight="600">
            Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your performance
          </Typography>
        </Box>
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          View Report
        </Typography>
      </SummaryHeader>

      <SummaryTopSection>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <HighlightBox color="#f3f0ff">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#6C63FF">
                128
              </Typography>
            </HighlightBox>
          </Grid>
          <Grid item xs={4}>
            <HighlightBox color="#e6f7ff">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Productivity
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#2196F3">
                85%
              </Typography>
            </HighlightBox>
          </Grid>
          <Grid item xs={4}>
            <HighlightBox color="#e6ffed">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Efficiency
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#4CAF50">
                67%
              </Typography>
            </HighlightBox>
          </Grid>
        </Grid>
      </SummaryTopSection>

      <SummaryBodySection>
        <Box sx={{ flexGrow: 1, minHeight: '200px', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 20, right: 10, zIndex: 10, background: 'white', padding: '2px 8px', borderRadius: '4px' }}>
            <Typography variant="h6" sx={{ color: '#333' }}>203</Typography>
          </Box>
          <Line data={data} options={options} />
        </Box>
      </SummaryBodySection>
    </SummaryContainer>
  );
};

export default SummaryChart; 