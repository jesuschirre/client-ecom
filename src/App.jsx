// client-ecom/src/App.jsx (Con la nueva ruta añadida)

import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Importa todas tus páginas
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile"; // Asumo que es para Configuración Empresa
import Usuarios from "./pages/Usuarios"; // Renombrado mentalmente a PersonalInterno
import Peticiones from "./pages/peticiones"; // Asumo que es Solicitudes
import ConfiguracionCorreo from "./pages/ConfiguracionCorreo";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Contratos from "./pages/Contratos";
import DetalleContrato from "./pages/DetalleContrato"; // Asumo que existe
import Planes from './pages/Planes';
import PanelLocutor from './pages/PanelLocutor';
import FormularioContrato from './pages/FormularioContrato';

// --- ¡NUEVA IMPORTACIÓN! ---
import ClientesVisitantes from "./pages/ClientesVisitantes"; // Importamos el nuevo componente
// --------------------------


// Importa tus componentes
import Sidebar from "./components/Sidebar"; // Asegúrate que sea el Sidebar correcto
import { useState } from "react"; // Necesario para el estado del Sidebar


// Componente Guardia para Rutas Protegidas (Mejorado)
const ProtectedRoute = ({ children }) => { // Recibe children para más flexibilidad
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />; // replace es buena práctica
    }

    // Permitir acceso a Admin y Locutor a todas las rutas protegidas
    if (user.rol === 'admin' || user.rol === 'locutor') {
        return children; // Renderiza el contenido protegido (AppLayout)
    } else {
        // Otros roles logueados pero no autorizados
        return <Navigate to="/unauthorized" replace />;
    }
};

// Layout principal de la aplicación (con manejo de estado del Sidebar)
const AppLayout = () => {
    // Estado para controlar si el Sidebar está abierto en móvil/tablet
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Podrías añadir un botón en un Header (no incluido aquí) para llamar a setIsSidebarOpen

    return (
        <div className="flex h-screen bg-gray-100"> {/* Flex layout para Sidebar y Main */}
            {/* Pasa el estado y el setter al Sidebar si necesita ser controlable */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Contenido Principal */}
            {/* Ajusta ml-0/ml-64 basado en si el sidebar está fijo o flotante */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:ml-64"> {/* ml-64 en pantallas grandes */}
                 {/* Aquí se renderizará el componente de la ruta activa */}
                <Outlet />
            </main>
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

                {/* Rutas Protegidas (envueltas en el Guardia) */}
                <Route element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    {/* Rutas Comunes y de Admin */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/configuracion/empresa" element={<UserProfile />} /> {/* Ruta actualizada */}
                    <Route path="/personal-interno" element={<Usuarios />} /> {/* Ruta actualizada */}

                    {/* --- ¡NUEVA RUTA! --- */}
                    <Route path="/clientes-visitantes" element={<ClientesVisitantes />} />
                    {/* ------------------- */}

                    <Route path="/solicitudes" element={<Peticiones />} /> {/* Ruta actualizada */}
                    <Route path="/configuracion/correo" element={<ConfiguracionCorreo />} />
                    <Route path="/contratos" element={<Contratos />} />
                    <Route path="/contratos/nuevo" element={<FormularioContrato />} />
                    {/* <Route path="/contratos/:id" element={<DetalleContrato />} /> */} {/* Comentado si no existe */}
                    <Route path="/contratos/:id/editar" element={<FormularioContrato />} />
                    <Route path="/planes" element={<Planes />} />

                    {/* Ruta para el Panel Locutor (accesible por Admin y Locutor) */}
                    <Route path="/panel-locutor" element={<PanelLocutor />} /> {/* Ruta actualizada */}
                </Route>

                {/* Redirección por defecto si ninguna ruta coincide */}
                 {/* Mejor redirigir a "/" si está autenticado, o a "/login" si no */}
                <Route path="*" element={<Navigate to="/" replace />} />
                 {/* O podrías tener un componente NotFound */}
                 {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;