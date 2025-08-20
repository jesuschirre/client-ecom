import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // Muestra un loader mientras se verifica
  }

  // Si está autenticado Y el rol es 'admin', permite el acceso
  if (isAuthenticated && user?.rol === 'admin') {
    return <Outlet />; // Renderiza el componente de la ruta (Dashboard, Usuarios, etc.)
  }

  // Si está autenticado pero NO es admin, lo manda a la página de "No Autorizado"
  if (isAuthenticated && user?.rol !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  // Si no está autenticado, lo manda al login
  return <Navigate to="/login" />;
};

export default AdminRoute;