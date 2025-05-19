import React from 'react';
import { Box, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const HotelOwnerLayout = () => {
  return (
    <Box>
      <Typography variant="h1">Hotel Owner Layout</Typography>
      <Outlet />
    </Box>
  );
};

export default HotelOwnerLayout; 