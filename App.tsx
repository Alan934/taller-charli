import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Landing from './pages/Landing';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import RepairTracking from './pages/dashboard/RepairTracking';
import Budget from './pages/dashboard/Budget';
import History from './pages/dashboard/History';
import CalendarView from './pages/dashboard/CalendarView';
import AdminClients from './pages/dashboard/AdminClients';
import AdminSettings from './pages/dashboard/AdminSettings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Booking Pages
import BookingStep1 from './pages/booking/BookingStep1';
import BookingStep2 from './pages/booking/BookingStep2';
import BookingStep4 from './pages/booking/BookingStep4';
import BookingSuccess from './pages/booking/BookingSuccess';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading label="Preparando tu sesión" />;
  }

  if (!token) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname, message: 'Debes iniciar sesión para reservar un turno.' }}
      />
    );
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <HashRouter>
          <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Booking Flow */}
          <Route
            path="/book/step1"
            element={(
              <RequireAuth>
                <BookingStep1 />
              </RequireAuth>
            )}
          />
          <Route
            path="/book/step2"
            element={(
              <RequireAuth>
                <BookingStep2 />
              </RequireAuth>
            )}
          />
          <Route
            path="/book/step4"
            element={(
              <RequireAuth>
                <BookingStep4 />
              </RequireAuth>
            )}
          />
          <Route
            path="/book/success"
            element={(
              <RequireAuth>
                <BookingSuccess />
              </RequireAuth>
            )}
          />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Client Dashboard Routes */}
          <Route
            path="/dashboard"
            element={(
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            )}
          >
            <Route index element={<DashboardHome />} />
            <Route path="repair/:id" element={<RepairTracking />} />
            <Route path="budget/:id" element={<Budget />} />
            <Route path="history" element={<History />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="admin" element={<AdminSettings />} />
          </Route>

          {/* Redirects */}
          <Route path="/book" element={<Navigate to="/book/step1" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;