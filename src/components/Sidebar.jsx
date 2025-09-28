import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- CORREGIDO
import { useAuth } from '../context/AuthContext';
import { 
  HiChartPie, 
  HiUser, 
  HiUsers, 
  HiOutlineNewspaper, 
  HiOutlineCog, 
  HiOutlineLogout, 
  HiDocumentText, 
  HiTag,
  HiChevronDown, 
  HiChevronUp 
} from "react-icons/hi";

// COMPONENTE NavLink CON LA LÓGICA DE 'isActive' CORREGIDA
const NavLink = ({ to, icon, children, isSubLink = false }) => {
  const location = useLocation();
  const isActive = to === "/" 
    ? location.pathname === "/" 
    : location.pathname.startsWith(to);

  return (
    <Link 
      to={to} 
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-sky-600 text-white' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }
        ${isSubLink ? 'text-xs pl-5' : ''}
      `}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

// COMPONENTE AccordionMenu (SIN CAMBIOS)
const AccordionMenu = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isChildActive = React.Children.toArray(children).some(child => 
        child.props.to && location.pathname.startsWith(child.props.to)
    );
    useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive]);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isChildActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span>{title}</span>
                </div>
                {isOpen ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
            </button>
            {isOpen && (
                <div className="pt-2 flex flex-col gap-2">
                    {React.Children.map(children, child => 
                        React.cloneElement(child, { isSubLink: true })
                    )}
                </div>
            )}
        </div>
    );
};


export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="fixed top-0 left-0 bg-gray-800 text-white w-64 h-screen p-4 flex flex-col justify-between">
      {/* Sección Superior: Logo y Navegación */}
      <div>
        <div className="flex items-center gap-2 px-3 mb-6">
            <svg className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-bold">Ecommers Panel</h2>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink to="/" icon={<HiChartPie size={20} />}>Dashboard</NavLink>
          <NavLink to="/usuarios" icon={<HiUsers size={20} />}>Usuarios</NavLink>
          <NavLink to="/peticiones" icon={<HiOutlineNewspaper size={20} />}>Peticiones</NavLink>
          <NavLink to="/contratos" icon={<HiDocumentText size={20} />}>Contratos</NavLink>
          
          <AccordionMenu title="Configuraciones" icon={<HiOutlineCog size={20} />}>
            <NavLink to="/profile" icon={<HiUser size={18} />}>Perfil Empresa</NavLink>
            <NavLink to="/planes" icon={<HiTag size={18} />}>Planes</NavLink>
            <NavLink to="/configuracion/correo" icon={<HiOutlineCog size={18} />}>Correo</NavLink>
          </AccordionMenu>
        </nav>
      </div>

      {/* Sección Inferior: Perfil de Usuario y Logout */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold">
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.nombre}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-4 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
          <HiOutlineLogout size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}