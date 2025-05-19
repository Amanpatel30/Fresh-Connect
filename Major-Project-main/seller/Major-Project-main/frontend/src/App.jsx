import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from './context/ThemeContext'
import { NavbarProvider } from './context/NavbarContext'
import { UserProvider } from './context/UserContext'
import { useThemeMode } from './context/ThemeContext'
import { Box, Typography } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'

// Main App Components
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CustomCursor from './components/CustomCursor'
import BusinessRegistration from './pages/BusinessRegistration'

// Vegetable Seller Components

import SellerLayout from './components/layouts/SellerLayout'
import Dashboard from './pages/seller/Dashboard'
import Products from './pages/seller/Products'
import Orders from './pages/seller/Orders'
import UrgentSales from './pages/seller/UrgentSales'
import Profile from './pages/seller/Profile'
import Reviews from './pages/seller/Reviews'
import Payments from './pages/seller/Payments'
import Verification from './pages/seller/Verification'
import ProductAdd from './pages/seller/ProductAdd'
import ProductCategories from './pages/seller/ProductCategories'
import OrdersPending from './pages/seller/OrdersPending'
import OrdersShipping from './pages/seller/OrdersShipping'
import ProfileSecurity from './pages/seller/ProfileSecurity'
import ReviewsRespond from './pages/seller/ReviewsRespond'
import PaymentsMethods from './pages/seller/PaymentsMethods'
import PaymentsHistory from './pages/seller/PaymentsHistory'
import Analytics from './pages/seller/Analytics'
import SellerSupport from './pages/seller/SellerSupport'
import SupportContact from './pages/seller/SupportContact'
import Settings from './pages/seller/Settings'

// Hotel Owner Components
/*
import HotelOwnerLayout from './components/layouts/HotelOwnerLayout'
import HotelDashboard from './pages/hotelOwner/Dashboard'
import PurchaseHistory from './pages/hotelOwner/PurchaseHistory'
import InventoryManagement from './pages/hotelOwner/InventoryManagement'
import VerifiedBadge from './pages/hotelOwner/VerifiedBadge'
import LeftoverFood from './pages/hotelOwner/LeftoverFood'
import HotelUrgentSales from './pages/hotelOwner/UrgentSales'
import MenuManagement from './pages/hotelOwner/MenuManagement'
import ProfileSettings from './pages/hotelOwner/ProfileSettings'
import AnalyticsDashboard from './pages/hotelOwner/AnalyticsDashboard'
import CustomerFeedback from './pages/hotelOwner/CustomerFeedback'
import OrderManagement from './pages/hotelOwner/OrderManagement'
import VerificationDocuments from './pages/hotelOwner/VerificationDocuments'
*/

// Admin Components
import AdminLayout from './components/layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'

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

// User Panel Components
import UserHomePage from './pages/user/HomePage'
import UserLogin from './pages/user/Login'
import UserRegister from './pages/Register'
import ProductSearch from './pages/user/ProductSearch'
import ShoppingCart from './pages/user/ShoppingCart'
import OrderHistory from './pages/user/OrderHistory'
import VerifiedRestaurants from './pages/user/VerifiedRestaurants'
import UserUrgentSales from './pages/user/UrgentSales'
import FreeFoodListings from './pages/user/FreeFoodListings'
import ProfileManagement from './pages/user/ProfileManagement'
import Wishlist from './pages/user/Wishlist'
import PaymentGateway from './pages/user/PaymentGateway'
import OrderTracking from './pages/user/OrderTracking'
import ReviewsAndRatings from './pages/user/ReviewsAndRatings'
import UserLayout from './components/layouts/UserLayout'

// Seller Pages


function App() {
  return (
    <ThemeProvider>
      <NavbarProvider>
        <UserProvider>
          <ThemedApp />
        </UserProvider>
      </NavbarProvider>
    </ThemeProvider>
  )
}

function ThemedApp() {
  const { mode } = useThemeMode()

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
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/business-registration" element={<BusinessRegistration />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
          </Route>
          
          {/* User Panel Routes */}
          <Route path="/user" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserHomePage />} />
            <Route path="login" element={<UserLogin />} />
            <Route path="register" element={<UserRegister />} />
            <Route path="products" element={<ProductSearch />} />
            <Route path="cart" element={<ShoppingCart />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="restaurants" element={<VerifiedRestaurants />} />
            <Route path="urgent-sales" element={<UserUrgentSales />} />
            <Route path="free-food" element={<FreeFoodListings />} />
            <Route path="profile" element={<ProfileManagement />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="payment" element={<PaymentGateway />} />
            <Route path="track-order" element={<OrderTracking />} />
            <Route path="reviews" element={<ReviewsAndRatings />} />
          </Route>

          {/* Seller Routes */}
          <Route path="/seller" element={
            <ProtectedRoute requiredRole="seller">
              <SellerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<ProductAdd />} />
            <Route path="products/categories" element={<ProductCategories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/pending" element={<OrdersPending />} />
            <Route path="orders/shipping" element={<OrdersShipping />} />
            <Route path="urgent-sales" element={<UrgentSales />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/security" element={<ProfileSecurity />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reviews/respond" element={<ReviewsRespond />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payments/methods" element={<PaymentsMethods />} />
            <Route path="payments/history" element={<PaymentsHistory />} />
            <Route path="verification" element={<Verification />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<SellerSupport />} />
            <Route path="support/contact" element={<SupportContact />} />
          </Route>
          
          {/* Hotel Owner Routes */}
          {/*
          <Route path="/hotel-owner" element={
            <ProtectedRoute requiredRole="hotel">
              <HotelOwnerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HotelDashboard />} />
            <Route path="dashboard" element={<HotelDashboard />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="verification" element={<VerifiedBadge />} />
            <Route path="leftover-food" element={<LeftoverFood />} />
            <Route path="urgent-sales" element={<HotelUrgentSales />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="feedback" element={<CustomerFeedback />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="documents" element={<VerificationDocuments />} />
          </Route>
          */}
          
          {/* Shared Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/business-registration" element={<BusinessRegistration />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </MuiThemeProvider>
  )
}

export default App
