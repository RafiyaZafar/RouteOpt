import React from 'react';
import NavBar from "./shared/NavBar";
import DispatchPage from "./pages/DispatchPage";
import DriversPage from "./pages/DriversPage";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import { AuthProvider, useAuth } from './state/auth';
import MapPage from "./pages/MapPage";


function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/orders" replace />;
  return children;
}


function AppRoutes() {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      {/* Admin + Driver common */}
      <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />

      {/* Admin only pages */}
      <Route path="/dispatch" element={<ProtectedAdmin><DispatchPage /></ProtectedAdmin>} />
      <Route path="/drivers" element={<ProtectedAdmin><DriversPage /></ProtectedAdmin>} />
      <Route path="/map" element={<ProtectedAdmin><MapPage /></ProtectedAdmin>}/>



      <Route path="/" element={<Navigate to="/dispatch" replace />} />

    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <NavBar />
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);
