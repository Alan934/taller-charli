import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import RepairTracking from './pages/dashboard/RepairTracking';
import Budget from './pages/dashboard/Budget';
import History from './pages/dashboard/History';

// Booking Pages
import BookingStep1 from './pages/booking/BookingStep1';
import BookingStep2 from './pages/booking/BookingStep2';
import BookingStep3 from './pages/booking/BookingStep3';
import BookingStep4 from './pages/booking/BookingStep4';
import BookingSuccess from './pages/booking/BookingSuccess';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Booking Flow */}
        <Route path="/book/step1" element={<BookingStep1 />} />
        <Route path="/book/step2" element={<BookingStep2 />} />
        <Route path="/book/step3" element={<BookingStep3 />} />
        <Route path="/book/step4" element={<BookingStep4 />} />
        <Route path="/book/success" element={<BookingSuccess />} />
        
        {/* Client Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="repair/:id" element={<RepairTracking />} />
          <Route path="budget/:id" element={<Budget />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* Redirects */}
        <Route path="/book" element={<Navigate to="/book/step1" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;