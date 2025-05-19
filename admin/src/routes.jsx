import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import ContentManagement from './pages/ContentManagement';
import Analytics from './pages/Analytics';
import ReportGeneration from './pages/ReportGeneration';
import UserManagement from './pages/UserManagement';
import SellerVerification from './pages/SellerVerification';
import HotelVerification from './pages/HotelVerification';
import OrderMonitoring from './pages/OrderMonitoring';
import OrderVerification from './pages/OrderVerification';
import PaymentManagement from './pages/PaymentManagement';
import ComplaintHandling from './pages/ComplaintHandling';
import SystemSettings from './pages/SystemSettings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="seller-verification" element={<SellerVerification />} />
        <Route path="hotel-verification" element={<HotelVerification />} />
        <Route path="orders" element={<OrderMonitoring />} />
        <Route path="orders/:orderId/verification" element={<OrderVerification />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="complaints" element={<ComplaintHandling />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<ReportGeneration />} />
        <Route path="system-settings" element={<SystemSettings />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 