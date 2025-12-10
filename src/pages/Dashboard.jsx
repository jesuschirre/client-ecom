import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
    PieChart, Pie, BarChart, Bar, Cell 
} from 'recharts';
import { 
    HiUsers, HiDocumentText, HiCheckCircle, HiExclamation, HiArrowRight, 
    HiTrendingUp, HiCalendar, HiTag, HiStar, HiRefresh, HiMoon, HiSun,
    HiMicrophone, HiPlay, HiClock, HiDownload
} from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg';

// --- 1. COMPONENTES UI COMPARTIDOS ---

const StatCard = ({ title, value, icon, gradientClass, iconBgClass }) => {
    const isDark = document.documentElement.classList.contains('dark');
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl ${isDark ? gradientClass : 'bg-white border border-gray-200'} backdrop-blur-lg`}>
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-white/10 to-transparent opacity-50' : 'bg-gradient-to-br from-gray-50 to-transparent opacity-30'}`}></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3 rounded-full ${isDark ? iconBgClass : 'bg-gray-100'} shadow-md`}>
                    {React.cloneElement(icon, { className: `${isDark ? 'text-white' : 'text-indigo-600'}`, size: 28 })}
                </div>
                <div>
                    <p className={`text-3xl font-extrabold drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                    <p className={`text-sm uppercase font-semibold tracking-wide ${isDark ? 'text-white/80' : 'text-gray-600'}`}>{title}</p>
                </div>
            </div>
        </div>
    );
};

const DashboardSection = ({ title, children, linkTo, linkText, icon }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl h-full">
        <div className="flex justify-between items-center p-5 border-b border-gray-200/30 dark:border-gray-700/30">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">{icon} {title}</h2>
            {linkTo && (
                <Link to={linkTo} className="text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors duration-200">
                    {linkText} <HiArrowRight />
                </Link>
            )}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const PlanDashboardCard = ({ plan }) => (
    <div className={`relative border-2 ${plan.destacado ? 'border-indigo-500 shadow-xl' : 'border-gray-200 dark:border-gray-700'} ${plan.deshabilitado ? 'bg-gray-100/50 dark:bg-gray-800/50' : 'bg-white/90 dark:bg-gray-900/90'} rounded-xl flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-md`}>
        {plan.destacado && (
            <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <HiStar /> Destacado
            </div>
        )}
        <div className="p-6 flex-grow">
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">{plan.nombre}</h3>
            <div className="text-center my-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">S/{parseFloat(plan.precio).toFixed(2)}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">{plan.periodo}</span>
            </div>
            <ul className="space-y-3 text-sm">
                {plan.caracteristicas.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <HiCheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        {plan.deshabilitado && (
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold text-center py-2 rounded-b-xl">DESHABILITADO</div>
        )}
    </div>
);

// --- 2. VISTA EXCLUSIVA LOCUTOR ---

const LocutorDashboardView = ({ user, token }) => {
    const [stats, setStats] = useState({ pendientes: 0, aceptadas: 0, vencidas: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocutorStats = async () => {
            try {
                // Hacemos las peticiones para contar cuántas tareas hay en cada estado
                const [pendientesRes, aceptadasRes, vencidasRes] = await Promise.all([
                    fetch('http://localhost:3000/api/locutor_panel/tareas', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:3000/api/locutor_panel/tareas/aceptadas', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:3000/api/locutor_panel/tareas/vencidas', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                // Si fallan (ej. array vacío), manejamos con precaución
                const pendientes = pendientesRes.ok ? await pendientesRes.json() : [];
                const aceptadas = aceptadasRes.ok ? await aceptadasRes.json() : [];
                const vencidas = vencidasRes.ok ? await vencidasRes.json() : [];

                setStats({
                    pendientes: Array.isArray(pendientes) ? pendientes.length : 0,
                    aceptadas: Array.isArray(aceptadas) ? aceptadas.length : 0,
                    vencidas: Array.isArray(vencidas) ? vencidas.length : 0
                });
            } catch (error) {
                console.error("Error cargando stats de locutor", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocutorStats();
    }, [token]);

    if (loading) return <div className="flex justify-center items-center h-screen"><CgSpinner className="animate-spin h-12 w-12 text-sky-500"/></div>;

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 flex items-center gap-3">
                        <HiMicrophone className="text-sky-300" /> Cabina de Control
                    </h1>
                    <p className="text-sky-100 text-lg max-w-2xl mb-8">
                        Hola <strong>{user?.nombre}</strong>. Tienes <span className="bg-white/20 px-2 py-0.5 rounded font-bold">{stats.pendientes} grabaciones pendientes</span> esperando tu voz el día de hoy.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/panel-locutor?view=pendientes" className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2">
                            <HiPlay className="h-5 w-5" /> Ir a Grabar
                        </Link>
                        <Link to="/panel-locutor?view=aceptadas" className="bg-indigo-800/50 text-white border border-white/20 px-6 py-3 rounded-xl font-medium hover:bg-indigo-800/70 transition-all flex items-center gap-2">
                            <HiCheckCircle className="h-5 w-5" /> Mis Campañas
                        </Link>
                    </div>
                </div>
            </div>

            {/* STAT CARDS LOCUTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard 
                    title="Por Grabar" 
                    value={stats.pendientes} 
                    icon={<HiClock />} 
                    gradientClass="from-amber-500 to-orange-400" 
                    iconBgClass="bg-white/20" 
                />
                <StatCard 
                    title="Al Aire / Activas" 
                    value={stats.aceptadas} 
                    icon={<HiCheckCircle />} 
                    gradientClass="from-emerald-500 to-green-400" 
                    iconBgClass="bg-white/20" 
                />
                <StatCard 
                    title="Vencidas" 
                    value={stats.vencidas} 
                    icon={<HiExclamation />} 
                    gradientClass="from-rose-500 to-red-400" 
                    iconBgClass="bg-white/20" 
                />
            </div>

            {/* ACCESOS RAPIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardSection title="Accesos Rápidos" icon={<HiTag size={20} />}>
                    <div className="grid grid-cols-1 gap-4">
                        <Link to="/perfil" className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <HiUsers size={20}/>
                                </div>
                                <span className="font-semibold text-gray-700">Mi Perfil Profesional</span>
                            </div>
                            <HiArrowRight className="text-gray-400 group-hover:text-indigo-600"/>
                        </Link>
                         <Link to="/panel-locutor?view=retiradas" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-200 p-2 rounded-lg text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-colors">
                                    <HiDocumentText size={20}/>
                                </div>
                                <span className="font-semibold text-gray-700">Historial de Grabaciones</span>
                            </div>
                            <HiArrowRight className="text-gray-400 group-hover:text-gray-600"/>
                        </Link>
                    </div>
                </DashboardSection>
                
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-center text-center">
                    <HiStar className="text-yellow-400 w-12 h-12 mb-3 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">Consejo del día</h3>
                    <p className="text-indigo-100 text-sm">
                        "Revisa los detalles del guion antes de aceptar. Una buena entonación comienza con una buena lectura."
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- 3. VISTA EXCLUSIVA ADMIN (Toda la funcionalidad restaurada) ---

const AdminDashboardView = ({ 
    user, token, data, loading, error, handleRetry, 
    selectedMonth, handleMonthChange, 
    formattedRevenueData, formattedContractStatusData, formattedEmissionDaysData 
}) => {
    
    // Estados de carga para los 4 botones de reportes
    const [loadingReports, setLoadingReports] = useState({
        contratos: false,
        estado: false,
        demandado: false,
        planes: false
    });

    const generateReport = async (type, endpoint) => {
        setLoadingReports(prev => ({ ...prev, [type]: true }));
        try {
            const res = await fetch(`http://localhost:3000/reportes/${endpoint}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al generar el PDF.');
            }
            const data = await res.json();
            window.open(`http://localhost:3000/Uploads/reportes/${data.file}`, '_blank');
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoadingReports(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-screen">
            <CgSpinner className="animate-spin h-12 w-12 text-indigo-500" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600 bg-gray-50 h-screen flex flex-col justify-center items-center">
            <HiExclamation className="h-10 w-10 mb-2"/>
            <p className="text-lg font-semibold">{error}</p>
            <button onClick={handleRetry} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <HiRefresh /> Reintentar
            </button>
        </div>
    );

    if (!data) return null;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Admin */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-['Inter'] tracking-tight">
                        Bienvenido, {user?.nombre || 'Admin'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Centro de comando de Metrópoli Radio</p>
                </div>
                
                {/* Botonera de Reportes Restaurada */}
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => generateReport('contratos', 'contratos')}
                        disabled={loadingReports.contratos}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm text-sm font-medium"
                    >
                        {loadingReports.contratos ? <CgSpinner className="animate-spin h-5 w-5"/> : <HiDocumentText size={18}/>}
                        Reporte Contratos
                    </button>

                    <button 
                        onClick={() => generateReport('estado', 'estado')}
                        disabled={loadingReports.estado}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm text-sm font-medium"
                    >
                        {loadingReports.estado ? <CgSpinner className="animate-spin h-5 w-5"/> : <HiCheckCircle size={18}/>}
                        Por Estado
                    </button>

                    <button 
                        onClick={() => generateReport('demandado', 'demandado')}
                        disabled={loadingReports.demandado}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm text-sm font-medium"
                    >
                        {loadingReports.demandado ? <CgSpinner className="animate-spin h-5 w-5"/> : <HiTrendingUp size={18}/>}
                        Mas Demandados
                    </button>

                    <button 
                        onClick={() => generateReport('planes', 'planes')}
                        disabled={loadingReports.planes}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm text-sm font-medium"
                    >
                        {loadingReports.planes ? <CgSpinner className="animate-spin h-5 w-5"/> : <HiTag size={18}/>}
                        Reporte Planes
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Usuarios" value={data.stats.totalUsuarios} icon={<HiUsers />} gradientClass="from-indigo-600 to-blue-500" iconBgClass="bg-white/20" />
                <StatCard title="Contratos Totales" value={data.stats.totalContratos} icon={<HiDocumentText />} gradientClass="from-indigo-600 to-blue-500" iconBgClass="bg-white/20" />
                <StatCard title="Contratos Activos" value={data.stats.contratosActivos} icon={<HiCheckCircle />} gradientClass="from-green-600 to-teal-500" iconBgClass="bg-white/20" />
                <StatCard title="Solicitudes Pendientes" value={data.stats.solicitudesPendientes} icon={<HiExclamation />} gradientClass="from-yellow-500 to-amber-500" iconBgClass="bg-white/20" />
                <StatCard title="Ingresos Mensuales" value={`S/${data.stats.ingresosTotales}`} icon={<HiTrendingUp />} gradientClass="from-indigo-600 to-blue-500" iconBgClass="bg-white/20" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardSection title="Rendimiento de Ingresos" icon={<HiTrendingUp size={20} />}>
                        <div className="mb-6">
                            <select value={selectedMonth} onChange={handleMonthChange} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100">
                                <option value="">Últimos 6 meses</option>
                                {data.charts.revenue.data.labels.map((mes) => (
                                    <option key={mes} value={mes}>{new Date(mes + '-01').toLocaleString('es-PE', { month: 'long', year: 'numeric' })}</option>
                                ))}
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={formattedRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `S/${value}`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.75rem', color: '#1f2937' }} />
                                <Area type="monotone" dataKey="Ingresos" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>

                <div className="flex flex-col gap-6">
                    <DashboardSection title="Estado de Contratos" icon={<HiDocumentText size={20} />}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={formattedContractStatusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                                    {formattedContractStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </DashboardSection>

                    <DashboardSection title="Días de Emisión" icon={<HiCalendar size={20} />}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={formattedEmissionDaysData}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>
            </div>

            {/* Listas: Vencimientos y Actividad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Próximos Vencimientos" linkTo="/contratos" linkText="Ver todos" icon={<HiCalendar size={20} />}>
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                        {data.expirations.length > 0 ? (
                            data.expirations.map((exp) => (
                                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{exp.nombre_cliente}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{exp.nombre_campana}</p>
                                    </div>
                                    <p className="text-sm font-bold text-red-500">{exp.fecha_fin}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">¡Todo en orden! No hay vencimientos.</p>
                        )}
                    </div>
                </DashboardSection>

                <DashboardSection title="Actividad Reciente" linkTo="/contratos" linkText="Ver todos" icon={<HiTrendingUp size={20} />}>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.activity.map((act) => (
                            <li key={act.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        Contrato "<span className="font-bold">{act.nombre_campana}</span>" para <span className="font-bold">{act.nombre_cliente}</span>.
                                    </p>
                                    <p className="text-xs text-gray-500">Días: {act.dias_emision}</p>
                                </div>
                                <p className="text-sm text-gray-500">{act.fecha_creacion}</p>
                            </li>
                        ))}
                    </ul>
                </DashboardSection>
            </div>

            {/* Planes */}
            <DashboardSection title="Planes Ofrecidos" icon={<HiTag size={20} />} linkTo="/planes" linkText="Gestionar Planes">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.planes.map((plan) => (
                        <PlanDashboardCard key={plan.id} plan={plan} />
                    ))}
                </div>
            </DashboardSection>
        </div>
    );
};


// --- 4. COMPONENTE PRINCIPAL (CONTAINER) ---

export default function Dashboard() {
    const { token, user } = useAuth();
    
    // Estados generales
    const [darkMode, setDarkMode] = useState(false);
    
    // Estados exclusivos de ADMIN
    const [adminData, setAdminData] = useState(null);
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminError, setAdminError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');

    // --- EFECTOS ---

    // 1. Dark Mode
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved !== null) {
            setDarkMode(saved === 'true');
            document.documentElement.classList.toggle('dark', saved === 'true');
        } else {
            setDarkMode(prefersDark);
            document.documentElement.classList.toggle('dark', prefersDark);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    // 2. Fetch Data ADMIN (Solo si es admin)
    useEffect(() => {
        // Si es locutor, marcamos carga de admin como terminada (porque no la necesitamos) y salimos
        if (user?.rol === 'locutor') {
            setAdminLoading(false);
            return;
        }

        const fetchAdminData = async () => {
            try {
                const url = new URL('http://localhost:3000/api/dashboard_admin/stats');
                if (selectedMonth) url.searchParams.append('month', selectedMonth);
                
                const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                
                if (!response.ok) throw new Error('No se pudieron cargar los datos del dashboard.');
                const data = await response.json();
                setAdminData(data);
            } catch (err) {
                setAdminError(err.message);
            } finally {
                setAdminLoading(false);
            }
        };

        if (token && user) fetchAdminData();
    }, [token, selectedMonth, user]);


    // --- MEMOS (Transformación de datos para gráficos Admin) ---
    const formattedRevenueData = useMemo(() => {
        return adminData?.charts.revenue.data.labels.map((mes, index) => ({
            mes: new Date(mes + '-01').toLocaleString('es-PE', { month: 'short', year: '2-digit' }).replace('.', ''),
            Ingresos: parseFloat(adminData.charts.revenue.data.datasets[0].data[index] || 0),
        })) || [];
    }, [adminData]);

    const formattedContractStatusData = useMemo(() => {
        return adminData?.charts.contractStatus.data.labels.map((label, index) => ({
            name: label,
            value: parseFloat(adminData.charts.contractStatus.data.datasets[0].data[index]),
        })) || [];
    }, [adminData]);

    const formattedEmissionDaysData = useMemo(() => {
        return adminData?.charts.emissionDays.data.labels.map((label, index) => ({
            name: label,
            value: parseFloat(adminData.charts.emissionDays.data.datasets[0].data[index]),
        })) || [];
    }, [adminData]);


    // --- RENDERIZADO PRINCIPAL ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            
            {/* Botón Flotante Modo Oscuro */}
            <div className="fixed top-24 right-6 z-50 md:absolute md:top-6 md:right-6">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
                    aria-label="Cambiar modo oscuro"
                >
                    {darkMode ? <HiSun size={24} /> : <HiMoon size={24} />}
                </button>
            </div>

            {/* DECISIÓN DE VISTA SEGÚN ROL */}
            {user?.rol === 'locutor' ? (
                // --- VISTA LOCUTOR ---
                <LocutorDashboardView user={user} token={token} />
            ) : (
                // --- VISTA ADMIN ---
                <AdminDashboardView 
                    user={user} 
                    token={token}
                    data={adminData} 
                    loading={adminLoading} 
                    error={adminError}
                    handleRetry={() => { setAdminLoading(true); setAdminData(null); setAdminError(null); }}
                    selectedMonth={selectedMonth}
                    handleMonthChange={(e) => { setSelectedMonth(e.target.value); setAdminLoading(true); }}
                    formattedRevenueData={formattedRevenueData}
                    formattedContractStatusData={formattedContractStatusData}
                    formattedEmissionDaysData={formattedEmissionDaysData}
                />
            )}
        </div>
    );
}