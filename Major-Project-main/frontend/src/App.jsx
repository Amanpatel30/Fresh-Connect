import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from './context/ThemeContext'
import { NavbarProvider } from './context/NavbarContext'
import { useThemeMode } from './context/ThemeContext'
import { Box, Typography, Button, Paper, Alert } from '@mui/material'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthWrapper from './components/auth/AuthWrapper'
import { useUser } from './context/UserContext'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'

// Import our hotel owner components
import Dashboard from './components/hotelOwner/Dashboard'
import Inventory from './components/hotelOwner/Inventory'

// Main App Components
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CustomCursor from './components/CustomCursor'

// Hotel Auth Components
import HotelLogin from './pages/hotel/Login'
import HotelRegister from './pages/hotel/Register'
import HotelLogout from './pages/hotel/Logout'

// Hotel Owner Components
import HotelOwnerLayout from './components/layouts/HotelOwnerLayout'
import PurchaseHistory from './pages/hotelOwner/PurchaseHistory'
import VerifiedBadge from './pages/hotelOwner/VerifiedBadge'
import LeftoverFood from './pages/hotelOwner/LeftoverFood'
import UrgentSales from './pages/hotelOwner/UrgentSales'
import MenuManagement from './pages/hotelOwner/MenuManagement'
import ProfileSettings from './pages/hotelOwner/ProfileSettings'
import HotelAnalyticsDashboard from './pages/hotelOwner/AnalyticsDashboard'
import CustomerFeedback from './pages/hotelOwner/CustomerFeedback'
import OrderManagement from './pages/hotelOwner/OrderManagement'
import VerificationDocuments from './pages/hotelOwner/VerificationDocuments'
import UrgentSalesMinimal from './pages/hotelOwner/UrgentSalesMinimal'


// Seller Components - Newly added
import SellerLayout from './components/layouts/SellerLayout'
import SellerDashboard from './pages/seller/Dashboard'
import SellerProducts from './pages/seller/Products'
import SellerOrders from './pages/seller/Orders'
import SellerUrgentSales from './pages/seller/UrgentSales'
import SellerProfile from './pages/seller/Profile'
import SellerReviews from './pages/seller/Reviews'
import SellerPayments from './pages/seller/Payments'
import SellerVerification from './pages/seller/Verification'
import SellerProductAdd from './pages/seller/ProductAdd'
import SellerProductCategories from './pages/seller/ProductCategories'
import SellerOrdersPending from './pages/seller/OrdersPending'
import SellerOrdersShipping from './pages/seller/OrdersShipping'
import SellerProfileSecurity from './pages/seller/ProfileSecurity'
import SellerReviewsRespond from './pages/seller/ReviewsRespond'
import SellerPaymentsMethods from './pages/seller/PaymentsMethods'
import SellerPaymentsHistory from './pages/seller/PaymentsHistory'
import SellerAnalytics from './pages/seller/Analytics'
import SellerSupport from './pages/seller/SellerSupport'
import SellerSupportContact from './pages/seller/SupportContact'
import SellerSettings from './pages/seller/Settings'
import SellerLogin from './pages/Login'
import SellerRegister from './pages/Register'
import BusinessRegistration from './pages/seller/BusinessRegistration'

// Shared Pages
import AboutUs from './pages/shared/AboutUs'
import ContactUs from './pages/shared/ContactUs'
import TermsConditions from './pages/shared/TermsConditions'
// Directly define the PrivacyPolicy component inline to bypass potential blocking
const PrivacyPolicy = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h1">Privacy Policy</Typography>
    </Box>
  );
};
import FAQ from './pages/shared/FAQ'
import Support from './pages/shared/Support'
import Blog from './pages/shared/Blog'
import NotificationCenter from './pages/shared/NotificationCenter'
import ForgotPassword from './pages/shared/ForgotPassword'
import ResetPassword from './pages/shared/ResetPassword'
import EmailVerification from './pages/shared/EmailVerification'
import NotFound from './pages/shared/NotFound'
import Unauthorized from './pages/shared/Unauthorized'
import ForceLogout from './pages/ForceLogout'
import Logout from './pages/Logout'

// User Components
import UserLayout from './components/layouts/UserLayout'
import ProductSearch from './pages/user/ProductSearch'
import ShoppingCart from './pages/user/ShoppingCart'
import OrderHistory from './pages/user/OrderHistory'
import VerifiedRestaurants from './pages/user/VerifiedRestaurants'
import UserUrgentSales from './pages/user/UrgentSales'
import FreeFoodListings from './pages/user/FreeFoodListings'
import ProfileDashboard from './pages/user/ProfileDashboard'
import ProfileManagement from './pages/user/ProfileManagement'
import AnalyticsDashboard from './pages/user/AnalyticsDashboard'
import UserWishlist from './pages/user/UserWishlist'
import PaymentGateway from './pages/user/PaymentGateway'
import OrderTracking from './pages/user/OrderTracking'
import ReviewsAndRatings from './pages/user/ReviewsAndRatings'
import Restaurants from './pages/Restaurants'
import RestaurantMenu from './pages/RestaurantMenu'

// Add import for Test page
import Test from './pages/Test';

// Function to check if backend server is running
const checkBackendServer = async () => {
  try {
    // Try to ping the backend server with a short timeout
    const response = await axios.get('http://https://fresh-connect-backend.onrender.com/api/check-auth', {
      timeout: 3000
    });
    console.log('Backend server is running on port 5001');
    return true;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Backend server is not running on port 5001');
      return false;
    }
    
    // If we get a response, even if it's an error response, the server is running
    if (error.response) {
      console.log('Backend server is running on port 5001 (received error response)');
      return true;
    }
    
    console.error('Unknown error checking backend server:', error);
    return false;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendRunning, setBackendRunning] = useState(true);

  // Check if backend server is running
  useEffect(() => {
    const checkServer = async () => {
      const isRunning = await checkBackendServer();
      setBackendRunning(isRunning);
    };
    
    checkServer();
    
    // Re-check periodically
    const intervalId = setInterval(checkServer, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeProvider>
      <NavbarProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        <ThemedApp 
          backendRunning={backendRunning} 
          setBackendRunning={setBackendRunning} 
          checkBackendServer={checkBackendServer}
        />
      </NavbarProvider>
    </ThemeProvider>
  )
}

function ThemedApp({ backendRunning, setBackendRunning, checkBackendServer }) {
  const { mode } = useThemeMode()
  const navigate = useNavigate()
  const location = useLocation()
  const userContext = useUser()

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#4a90e2',
        light: '#68a6e8',
        dark: '#2d75c8',
        lighter: mode === 'dark' ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.1)',
      },
      secondary: {
        main: '#7c5cff',
        light: '#9d85ff',
        dark: '#5c3fd9',
        lighter: mode === 'dark' ? 'rgba(124, 92, 255, 0.1)' : 'rgba(124, 92, 255, 0.1)',
      },
      background: {
        default: mode === 'dark' ? '#111827' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#1a202c',
        secondary: mode === 'dark' ? '#94a3b8' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      success: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
        lighter: mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        lighter: mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        lighter: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        lighter: mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#111827' : '#f8fafc',
            color: mode === 'dark' ? '#f8fafc' : '#1a202c',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })

  // Show warning if backend server is not running
  const BackendWarning = () => {
    if (backendRunning) return null;
    
    return (
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 9999,
          borderRadius: 0
        }}
      >
        Backend server is not running on port 5001. Some features may not work correctly.
        <Button 
          color="inherit" 
          size="small" 
          onClick={() => checkBackendServer().then(isRunning => setBackendRunning(isRunning))}
          sx={{ ml: 2 }}
        >
          Check Again
        </Button>
      </Alert>
    );
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <CustomCursor />
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Routes>
          {/* Main Routes - Public */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          
          {/* Redirect old /user routes to new routes */}
          <Route path="/user" element={<Navigate to="/" replace />} />
          <Route path="/user/*" element={<Navigate to="/" replace />} />
          
          {/* Special logout route - publicly accessible */}
          <Route path="/force-logout" element={<ForceLogout />} />
          
          {/* Hotel Auth Routes - Set up redirects */}
          <Route path="/hotel/login" element={<HotelLogin />} /> {/* HotelLogin now redirects to /login?type=hotel */}
          <Route path="/hotel/register" element={<HotelRegister />} />
          <Route path="/hotel/logout" element={<HotelLogout />} />
          
          {/* Seller Auth Routes - Public */}
          <Route path="/seller/login" element={<Navigate to="/login?type=seller" replace />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/seller/business-registration" element={<BusinessRegistration />} />
          
          {/* Shared Pages - Public */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog/*" element={<Blog />} />
          <Route path="/support" element={<Support />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          
          {/* Error pages - Public */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* All Protected Routes - require authentication */}
          
          {/* User Panel Routes - Now at root level */}
          <Route element={<AuthWrapper><UserLayout /></AuthWrapper>}>
            <Route path="products" element={<ProductSearch />} />
            <Route path="cart" element={<ShoppingCart />} />
            {/* Redirect standalone routes to profile tabs */}
            <Route path="orders" element={<Navigate to="/profile?tab=orders" replace />} />
            <Route path="wishlist" element={<Navigate to="/profile?tab=wishlist" replace />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurant/:id" element={<RestaurantMenu />} />
            <Route path="urgent-sales" element={<UserUrgentSales />} />
            <Route path="free-food" element={<FreeFoodListings />} />
            <Route path="profile" element={<ProfileDashboard />} />
            <Route path="profile-settings" element={<ProfileManagement />} />
            <Route path="settings" element={<ProfileManagement />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="payment" element={<PaymentGateway />} />
            <Route path="track-order" element={<OrderTracking />} />
            <Route path="reviews" element={<ReviewsAndRatings />} />
          </Route>
          
          {/* Hotel Owner Routes - Protected by both AuthWrapper and specific role check */}
          <Route path="/hotel" element={
            <AuthWrapper>
              <ProtectedRoute allowedRoles={['hotel']}>
                <HotelOwnerLayout />
              </ProtectedRoute>
            </AuthWrapper>
          }>
            <Route index element={<HotelAnalyticsDashboard />} />
            <Route path="dashboard" element={<HotelAnalyticsDashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="urgent-sales" element={<UrgentSales />} />
            <Route path="urgent-sales-minimal" element={<UrgentSalesMinimal />} />
            <Route path="leftover-food" element={<LeftoverFood />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="badge" element={<VerifiedBadge />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="verification" element={<VerificationDocuments />} />
            <Route path="feedback" element={<CustomerFeedback />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<HotelAnalyticsDashboard />} />
          </Route>
          
          {/* Seller Routes - Protected by both AuthWrapper and specific role check */}
          <Route path="/seller" element={
            <AuthWrapper>
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout />
              </ProtectedRoute>
            </AuthWrapper>
          }>
            <Route index element={<SellerDashboard />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="products/add" element={<SellerProductAdd />} />
            <Route path="products/categories" element={<SellerProductCategories />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="orders/pending" element={<SellerOrdersPending />} />
            <Route path="orders/shipping" element={<SellerOrdersShipping />} />
            <Route path="urgent-sales" element={<SellerUrgentSales />} />
            <Route path="profile" element={<SellerProfile />} />
            <Route path="profile/security" element={<SellerProfileSecurity />} />
            <Route path="reviews" element={<SellerReviews />} />
            <Route path="reviews/respond" element={<SellerReviewsRespond />} />
            <Route path="payments" element={<SellerPayments />} />
            <Route path="payments/methods" element={<SellerPaymentsMethods />} />
            <Route path="payments/history" element={<SellerPaymentsHistory />} />
            <Route path="verification" element={<SellerVerification />} />
            <Route path="analytics" element={<SellerAnalytics />} />
            <Route path="settings" element={<SellerSettings />} />
            <Route path="support" element={<SellerSupport />} />
            <Route path="support/contact" element={<SellerSupportContact />} />
          </Route>
          
          {/* Protected shared routes */}
          <Route path="/notifications" element={<AuthWrapper><NotificationCenter /></AuthWrapper>} />
          
          {/* Add a direct route for testing */}
          <Route path="/urgent-minimal" element={<UrgentSalesMinimal />} />
          
          {/* Add route */}
          <Route path="/test" element={<Test />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BackendWarning />
      </Box>
    </MuiThemeProvider>
  )
}

export default App
