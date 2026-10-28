import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ADMIN_PATH, ADMIN_BASE } from '../config';

const ProtectedRoute = ({ allowedRoles }) => {
  const userStr = localStorage.getItem('talaqCurrentUser');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = user.role || 'player'; // default if missing
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to={ADMIN_PATH ? `${ADMIN_BASE}/dashboard` : '/'} replace />;
        if (role === 'scout') return <Navigate to="/scout/dashboard" replace />;
        return <Navigate to="/player/dashboard" replace />;
    }
    return <Outlet />;
  } catch(e) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
