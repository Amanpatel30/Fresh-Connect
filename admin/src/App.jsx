import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes';
import { HeaderProvider } from './contexts/HeaderContext';

// Create a fixed light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF',
    },
    secondary: {
      main: '#E6E1FF',
    },
    background: {
      default: '#F5F5F8',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeaderProvider>
        <AppRoutes />
      </HeaderProvider>
    </ThemeProvider>
  );
}

export default App; 