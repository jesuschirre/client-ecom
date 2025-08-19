import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Usuarios from "./pages/Usuarios";
import Sidebar from "./components/Sidebar";
import Peticiones from "./pages/peticiones";
import ConfiguracionCorreo from "./pages/ConfiguracionCorreo"; // <-- AÑADE ESTA IMPORTACIÓN

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/peticiones" element={<Peticiones />} />
            {/* V-- AÑADE ESTA NUEVA RUTA --V */}
            <Route path="/configuracion/correo" element={<ConfiguracionCorreo />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;