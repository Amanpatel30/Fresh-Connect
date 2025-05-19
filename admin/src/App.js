import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderVerification from './pages/OrderVerification';
import OrderMonitoring from './pages/OrderMonitoring';
import Layout from './components/Layout';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<OrderMonitoring />} />
          <Route path="orders" element={<OrderMonitoring />} />
          <Route path="orders/:orderId/verification" element={<OrderVerification />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App; 