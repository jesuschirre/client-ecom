import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Importa todas tus páginas
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Usuarios from "./pages/Usuarios";
import Peticiones from "./pages/peticiones";
import Clientes from "./pages/clientes";

import ConfiguracionCorreo from "./pages/ConfiguracionCorreo";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

import Contratos from "./pages/Contratos";
import DetalleContrato from "./pages/DetalleContrato";
import FormularioContrato from "./pages/FormularioContrato";
import Planes from './pages/Planes';

// Importa tus componentes
import Sidebar from "./components/Sidebar";

// Componente Guardia para Rutas de Admin
const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return user.rol === 'admin' ? <AdminLayout /> : <Navigate to="/unauthorized" />;
};

// Componente del Layout del Panel de Admin
const AdminLayout = () => {
  return (
    <div>
      <Sidebar />
      <div className="ml-64 p-4">
        <Outlet />
      </div>
    </div>
  );
};

// Componente Principal de la Aplicación
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas de Admin Protegidas */}
        <Route element={<AdminRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/peticiones" element={<Peticiones />} />
          <Route path="/clientes" element={<Clientes />} />

          <Route path="/configuracion/correo" element={<ConfiguracionCorreo />} />

          {/* =====> 2. AÑADE ESTAS DOS LÍNEAS AQUÍ <===== */}
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/contratos/nuevo" element={<FormularioContrato />} />
          <Route path="/contratos/:id" element={<DetalleContrato />} /> 
          <Route path="/contratos/:id/editar" element={<FormularioContrato />} />
          {/* ============================================== */}
          <Route path="/planes" element={<Planes />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;