import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import {
    HiChartPie,
    HiUser,
    HiUsers,
    HiUserGroup,
    HiOutlineCog,
    HiOutlineLogout,
    HiDocumentText,
    HiTag,
    HiChevronDown,
    HiChevronUp,
    HiMicrophone,
    HiBell,
    HiOutlineBadgeCheck
} from "react-icons/hi";

const NavLink = ({ to, icon, children, isSubLink = false, badge }) => {
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
                ${isSubLink ? 'pl-11' : ''}
            `}
        >
            <div className="relative">
                {icon}
                {badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-shake">
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
            </div>
            <span>{children}</span>
        </Link>
    );
};

const AccordionMenu = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isChildActive = useMemo(() => React.Children.toArray(children).some(child => {
        return child && child.props && child.props.to && location.pathname.startsWith(child.props.to);
    }), [children, location.pathname]);

    useEffect(() => {
        if (isChildActive) {
            setIsOpen(true);
        }
    }, [isChildActive, location.pathname]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                <div className="pt-2 flex flex-col gap-1 pl-3">
                    {React.Children.map(children, child =>
                        React.isValidElement(child) ? React.cloneElement(child, { isSubLink: true }) : child
                    )}
                </div>
            )}
        </div>
    );
};

export default function Sidebar() {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [pendientes, setPendientes] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchPendientes = async () => {
            if (!token || (user?.rol !== 'locutor' && user?.rol !== 'admin')) {
                if (isMounted) setPendientes([]);
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/api/locutor_panel/tareas', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    let errorMsg = "Error al cargar tareas pendientes.";
                    try { errorMsg = (await response.json()).error || errorMsg; } catch (e) { }
                    throw new Error(errorMsg);
                }
                const data = await response.json();
                if (isMounted) {
                    const filteredData = Array.isArray(data) ? data.filter(t => t.estado.toLowerCase() === 'pendiente') : [];
                    setPendientes(filteredData);
                }
            } catch (err) {
                console.error('Sidebar: Error fetching pendientes:', err);
                if (isMounted) setPendientes([]);
            }
        };

        fetchPendientes();
        const intervalId = setInterval(fetchPendientes, 60000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        }
    }, [token, user?.rol]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBellClick = () => {
        navigate('/panel-locutor');
    };

    return (
        <div className="fixed top-0 left-0 bg-gray-800 text-white w-64 h-screen p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 px-1 mb-6">
                    <svg className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2 className="text-xl font-bold">Metrópoli</h2>
                </div>

                <nav className="flex flex-col gap-2">
                    {user && (
                        <NavLink to="/" icon={<HiChartPie size={20} />}>Dashboard</NavLink>
                    )}

                    {user?.rol === 'admin' && (
                        <>
                            <AccordionMenu title="Gestión Usuarios" icon={<HiUsers size={20} />}>
                                <NavLink to="/personal-interno" icon={<HiUser size={18} />}>Personal Interno</NavLink>
                                <NavLink to="/clientes-visitantes" icon={<HiUserGroup size={18} />}>Clientes/Visitantes</NavLink>
                            </AccordionMenu>
                            <NavLink to="/solicitudes" icon={<HiOutlineBadgeCheck size={20} />}>Solicitudes</NavLink>
                            <NavLink to="/contratos" icon={<HiDocumentText size={20} />}>Contratos</NavLink>
                            <NavLink
                                to="/panel-locutor"
                                icon={<HiMicrophone size={20} />}
                                badge={pendientes.length}
                            >
                                Panel Locutor
                            </NavLink>
                            <AccordionMenu title="Configuraciones" icon={<HiOutlineCog size={20} />}>
                                <NavLink to="/configuracion/empresa" icon={<HiUser size={18} />}>Perfil Empresa</NavLink>
                                <NavLink to="/planes" icon={<HiTag size={18} />}>Planes</NavLink>
                                <NavLink to="/configuracion/correo" icon={<HiOutlineCog size={18} />}>Correo</NavLink>
                            </AccordionMenu>
                        </>
                    )}

                    {user?.rol === 'locutor' && (
                        <NavLink
                            to="/panel-locutor"
                            icon={<HiMicrophone size={20} />}
                            badge={pendientes.length}
                        >
                            Mis Tareas
                        </NavLink>
                    )}
                </nav>
            </div>

            <div className="border-t border-gray-700 pt-4">
                {user && (
                    <>
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sky-300">
                                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{user?.nombre}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 mt-4 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <HiOutlineLogout size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}