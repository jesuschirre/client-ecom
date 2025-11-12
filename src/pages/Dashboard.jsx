import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, BarChart, Bar, Cell } from 'recharts';
import { 
  HiUsers, 
  HiDocumentText, 
  HiCheckCircle, 
  HiExclamation, 
  HiArrowRight, 
  HiTrendingUp, 
  HiCalendar, 
  HiTag, 
  HiStar, 
  HiRefresh, 
  HiMoon, 
  HiSun 
} from 'react-icons/hi'; // Lista de íconos única y limpia
import { CgSpinner } from 'react-icons/cg'; // Esta está bien separada

const StatCard = ({ title, value, icon, gradientClass, iconBgClass }) => {
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-6 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl ${
                isDark ? gradientClass : 'bg-white border border-gray-200'
            } backdrop-blur-lg`}
            role="region"
            aria-label={title}
        >
            <div
                className={`absolute inset-0 ${
                    isDark
                        ? 'bg-gradient-to-br from-white/10 to-transparent opacity-50'
                        : 'bg-gradient-to-br from-gray-50 to-transparent opacity-30'
                }`}
            ></div>
            <div className="relative z-10 flex items-center gap-4">
                <div
                    className={`p-3 rounded-full ${
                        isDark ? iconBgClass : 'bg-gray-100'
                    } shadow-md`}
                >
                    {React.cloneElement(icon, {
                        className: `${isDark ? 'text-white' : 'text-indigo-600'}`,
                        size: 28,
                    })}
                </div>
                <div>
                    <p
                        className={`text-3xl font-extrabold drop-shadow-md ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {value}
                    </p>
                    <p
                        className={`text-sm uppercase font-semibold tracking-wide ${
                            isDark ? 'text-white/80' : 'text-gray-600'
                        }`}
                    >
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
};

const DashboardSection = ({ title, children, linkTo, linkText, icon }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center p-5 border-b border-gray-200/30 dark:border-gray-700/30">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                {icon} {title}
            </h2>
            {linkTo && (
                <Link
                    to={linkTo}
                    className="text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors duration-200"
                >
                    {linkText} <HiArrowRight />
                </Link>
            )}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const PlanDashboardCard = ({ plan }) => (
    <div
        className={`relative border-2 ${
            plan.destacado ? 'border-indigo-500 shadow-xl' : 'border-gray-200 dark:border-gray-700'
        } ${
            plan.deshabilitado
                ? 'bg-gray-100/50 dark:bg-gray-800/50'
                : 'bg-white/90 dark:bg-gray-900/90'
        } rounded-xl flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-md`}
    >
        {plan.destacado && (
            <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <HiStar /> Destacado
            </div>
        )}
        <div className="p-6 flex-grow">
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
                {plan.nombre}
            </h3>
            <div className="text-center my-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                    S/{parseFloat(plan.precio).toFixed(2)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">
                    {plan.periodo}
                </span>
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
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold text-center py-2 rounded-b-xl">
                DESHABILITADO
            </div>
        )}
    </div>
);

export default function Dashboard() {
    const { token, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [loading4, setLoading4] = useState(false);
    // Inicializar modo oscuro según sistema y guardado
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (saved !== null) {
            const isDark = saved === 'true';
            setDarkMode(isDark);
            if (isDark) document.documentElement.classList.add('dark');
        } else {
            setDarkMode(prefersDark);
            if (prefersDark) document.documentElement.classList.add('dark');
        }
    }, []);

    // Fetch data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const url = new URL('http://localhost:3000/api/dashboard_admin/stats');
                if (selectedMonth) url.searchParams.append('month', selectedMonth);
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('No se pudieron cargar los datos del dashboard.');
                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDashboardData();
    }, [token, selectedMonth]);

    const formattedRevenueData = useMemo(() => {
        return (
            data?.charts.revenue.data.labels.map((mes, index) => ({
                mes: new Date(mes + '-01')
                    .toLocaleString('es-PE', { month: 'short', year: '2-digit' })
                    .replace('.', ''),
                Ingresos: parseFloat(data.charts.revenue.data.datasets[0].data[index] || 0),
            })) || []
        );
    }, [data]);

    const formattedContractStatusData = useMemo(() => {
        return (
            data?.charts.contractStatus.data.labels.map((label, index) => ({
                name: label,
                value: parseFloat(data.charts.contractStatus.data.datasets[0].data[index]),
            })) || []
        );
    }, [data]);

    const formattedEmissionDaysData = useMemo(() => {
        return (
            data?.charts.emissionDays.data.labels.map((label, index) => ({
                name: label,
                value: parseFloat(data.charts.emissionDays.data.datasets[0].data[index]),
            })) || []
        );
    }, [data]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setLoading(true);
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        setData(null);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    if (loading)
        return (
            <div className="p-8 flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                <CgSpinner className="animate-spin h-12 w-12 text-indigo-500 dark:text-indigo-400" />
            </div>
        );

    if (error)
        return (
            <div className="p-8 text-center text-red-600 dark:text-red-400 bg-gray-50 dark:bg-gray-900">
                <p className="text-lg font-semibold">{error}</p>
                <button
                    onClick={handleRetry}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                    <HiRefresh className="mr-2" /> Reintentar
                </button>
            </div>
        );

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-['Inter'] tracking-tight">
            Bienvenido, {user?.nombre || 'Admin'} Metropoli
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Centro de comando de Metrópoli Radio
            </p>
        </div>
        <div className="flex items-center gap-3">
            {/* Botón para generar PDF */}
        <button
            onClick={async () => {
                try {
                    setLoading2(true); //  Activa la pantalla de carga
                    
                    // Asume que esta URL devuelve el JSON con el nombre del archivo
                    const res = await fetch('http://localhost:3000/reportes/contratos', {
                        headers: { Authorization: `Bearer ${token}` }, // Importante: Asegura el token si es necesario para esta ruta
                    });
                    
                    if (!res.ok) {
                        // Si el servidor responde con un código de error (4xx, 5xx)
                        const errorData = await res.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                        throw new Error(errorData.message || 'Error al generar el PDF.');
                    }

                    const data = await res.json();
                    
                    // Opcional: Mostrar alerta solo si el backend envía un mensaje específico
                    // alert(data.message); 

                    // Abre el PDF generado en una nueva pestaña
                    window.open(`http://localhost:3000/Uploads/reportes/${data.file}`, '_blank');
                
                } catch (err) {
                    console.error(err);
                    alert(`Hubo un problema al generar el PDF: ${err.message || 'Verifica la consola para más detalles.'}`);
                } finally {
                    setLoading2(false); //  Desactiva la pantalla de carga
                }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed min-w-[200px]" // Añadida clase para deshabilitar y ancho mínimo
            disabled={loading2} // Deshabilita mientras carga
        >
            {loading2 ? (
                <>
                    <CgSpinner className="animate-spin h-5 w-5" />
                    Generando...
                </>
            ) : (
                <>
                    <HiDocumentText size={20} />
                    Reporte Contratos
                </>
            )}
        </button>
        <button
            onClick={async () => {
                try {
                    setLoading4(true); //  Activa la pantalla de carga
                    
                    // Asume que esta URL devuelve el JSON con el nombre del archivo
                    const res = await fetch('http://localhost:3000/reportes/estado');
                    
                    if (!res.ok) {
                        // Si el servidor responde con un código de error (4xx, 5xx)
                        const errorData = await res.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                        throw new Error(errorData.message || 'Error al generar el PDF.');
                    }

                    const data = await res.json();
                    // Opcional: Mostrar alerta solo si el backend envía un mensaje específico
                    // alert(data.message); 
                    // Abre el PDF generado en una nueva pestaña
                    window.open(`http://localhost:3000/Uploads/reportes/${data.file}`, '_blank');
                
                } catch (err) {
                    console.error(err);
                    alert(`Hubo un problema al generar el PDF: ${err.message || 'Verifica la consola para más detalles.'}`);
                } finally {
                    setLoading4(false); //  Desactiva la pantalla de carga
                }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed min-w-[200px]" // Añadida clase para deshabilitar y ancho mínimo
            disabled={loading4} // Deshabilita mientras carga
        >
            {loading4 ? (
                <>
                    <CgSpinner className="animate-spin h-5 w-5" />
                    Generando...
                </>
            ) : (
                <>
                    <HiDocumentText size={20} />
                    Reporte contratos por estado 
                </>
            )}
        </button>


        <button
            onClick={async () => {
                try {
                    setLoading3(true); //  Activa la pantalla de carga
                    
                    // Asume que esta URL devuelve el JSON con el nombre del archivo
                    const res = await fetch('http://localhost:3000/reportes/planes');
                    
                    if (!res.ok) {
                        // Si el servidor responde con un código de error (4xx, 5xx)
                        const errorData = await res.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                        throw new Error(errorData.message || 'Error al generar el PDF.');
                    }

                    const data = await res.json();
                    // Opcional: Mostrar alerta solo si el backend envía un mensaje específico
                    // alert(data.message); 
                    // Abre el PDF generado en una nueva pestaña
                    window.open(`http://localhost:3000/Uploads/reportes/${data.file}`, '_blank');
                
                } catch (err) {
                    console.error(err);
                    alert(`Hubo un problema al generar el PDF: ${err.message || 'Verifica la consola para más detalles.'}`);
                } finally {
                    setLoading3(false); // 👈 Desactiva la pantalla de carga
                }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed min-w-[200px]" // Añadida clase para deshabilitar y ancho mínimo
            disabled={loading3} // Deshabilita mientras carga
        >
            {loading3 ? (
                <>
                    <CgSpinner className="animate-spin h-5 w-5" />
                    Generando...
                </>
            ) : (
                <>
                    <HiDocumentText size={20} />
                    Reporte contratos por planes
                </>
            )}
        </button>


            {/* Botón modo oscuro */}
            <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {darkMode ? <HiSun size={24} /> : <HiMoon size={24} />}
            </button>
        </div>

        </div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Usuarios"
                    value={data.stats.totalUsuarios}
                    icon={<HiUsers />}
                    gradientClass="from-indigo-600 to-blue-500"
                    iconBgClass="bg-white/20"
                />
                <StatCard
                    title="Contratos Totales"
                    value={data.stats.totalContratos}
                    icon={<HiDocumentText />}
                    gradientClass="from-indigo-600 to-blue-500"
                    iconBgClass="bg-white/20"
                />
                <StatCard
                    title="Contratos Activos"
                    value={data.stats.contratosActivos}
                    icon={<HiCheckCircle />}
                    gradientClass="from-green-600 to-teal-500"
                    iconBgClass="bg-white/20"
                />
                <StatCard
                    title="Solicitudes Pendientes"
                    value={data.stats.solicitudesPendientes}
                    icon={<HiExclamation />}
                    gradientClass="from-yellow-500 to-amber-500"
                    iconBgClass="bg-white/20"
                />
                <StatCard
                    title="Ingresos Mensuales"
                    value={`S/${data.stats.ingresosTotales}`}
                    icon={<HiTrendingUp />}
                    gradientClass="from-indigo-600 to-blue-500"
                    iconBgClass="bg-white/20"
                />
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardSection title="Rendimiento de Ingresos" icon={<HiTrendingUp size={20} />}>
                        <div className="mb-6">
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 transition-all duration-200"
                                aria-label="Filtrar por mes"
                            >
                                <option value="">Últimos 6 meses</option>
                                {data.charts.revenue.data.labels.map((mes) => (
                                    <option key={mes} value={mes}>
                                        {new Date(mes + '-01').toLocaleString('es-PE', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </option>
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
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.75rem',
                                        color: '#1f2937',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Ingresos"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>

                <div className="flex flex-col gap-6">
                    <DashboardSection title="Distribución de Contratos" icon={<HiDocumentText size={20} />}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={formattedContractStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    outerRadius={90}
                                    stroke="#ffffff"
                                    label
                                >
                                    {formattedContractStatusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.75rem',
                                        color: '#1f2937',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </DashboardSection>

                    <DashboardSection title="Días de Emisión Populares" icon={<HiCalendar size={20} />}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={formattedEmissionDaysData}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.75rem',
                                        color: '#1f2937',
                                    }}
                                />
                                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>
            </div>

            {/* Expirations & Activity */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Próximos Vencimientos" linkTo="/contratos" linkText="Ver todos" icon={<HiCalendar size={20} />}>
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-100 dark:scrollbar-thumb-indigo-400 dark:scrollbar-track-gray-800">
                        {data.expirations.length > 0 ? (
                            data.expirations.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                                    role="row"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {exp.nombre_cliente}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {exp.nombre_campana}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Días: {exp.dias_emision}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-red-500 dark:text-red-400">
                                        {exp.fecha_fin}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                ¡Todo en orden! No hay vencimientos cercanos.
                            </p>
                        )}
                    </div>
                </DashboardSection>

                <DashboardSection title="Actividad Reciente" linkTo="/contratos" linkText="Ver todos" icon={<HiTrendingUp size={20} />}>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.activity.map((act) => (
                            <li key={act.id} className="py-3 flex justify-between items-center" role="listitem">
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        Nuevo contrato "<span className="font-bold">{act.nombre_campana}</span>" para{' '}
                                        <span className="font-bold">{act.nombre_cliente}</span>.
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Días: {act.dias_emision}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{act.fecha_creacion}</p>
                            </li>
                        ))}
                    </ul>
                </DashboardSection>
            </div>

            {/* Planes */}
            <div className="mt-8">
                <DashboardSection title="Planes Ofrecidos Actualmente" icon={<HiTag size={20} />} linkTo="/planes" linkText="Gestionar Planes">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.planes.map((plan) => (
                            <PlanDashboardCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                </DashboardSection>
            </div>
        </div>
    );
}