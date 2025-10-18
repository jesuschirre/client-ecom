import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, BarChart, Bar, Cell } from 'recharts';
import { HiUsers, HiDocumentText, HiCheckCircle, HiExclamation, HiArrowRight, HiTrendingUp, HiCalendar, HiTag, HiStar, HiRefresh } from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg';

const StatCard = ({ title, value, icon, gradientClass, iconBgClass }) => (
    <div className={`relative overflow-hidden rounded-xl p-6 shadow-lg ${gradientClass} transition-transform duration-300 hover:scale-105`} role="region" aria-label={title}>
        <div className="relative z-10">
            <div className={`mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full ${iconBgClass}`}>{icon}</div>
            <p className="text-4xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm uppercase font-semibold text-gray-700">{title}</p>
        </div>
    </div>
);

const DashboardSection = ({ title, children, linkTo, linkText, icon }) => (
    <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200/50">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">{icon}{title}</h2>
            {linkTo && (
                <Link to={linkTo} className="text-sm font-medium text-[#1E88E5] hover:text-[#1565C0] flex items-center gap-1">{linkText} <HiArrowRight /></Link>
            )}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const PlanDashboardCard = ({ plan }) => (
    <div className={`relative border rounded-xl flex flex-col transition-all duration-300 ${plan.destacado ? 'border-[#1E88E5] shadow-lg' : 'border-gray-200'} ${plan.deshabilitado ? 'bg-gray-100/50' : 'bg-white/50'}`}>
        {plan.destacado && (
            <div className="absolute -top-3.5 left-4 bg-[#1E88E5] text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1"><HiStar /> Popular</div>
        )}
        <div className="p-6 flex-grow">
            <h3 className="text-xl font-bold text-center text-gray-800">{plan.nombre}</h3>
            <div className="text-center my-4">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">S/{parseFloat(plan.precio).toFixed(2)}</span>
                <span className="text-gray-500 font-medium">{plan.periodo}</span>
            </div>
            <ul className="space-y-3 text-sm">
                {plan.caracteristicas.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <HiCheckCircle className="h-5 w-5 text-[#4CAF50] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        {plan.deshabilitado && (
            <div className="bg-red-100 text-red-700 text-xs font-bold text-center py-1 rounded-b-xl">DESHABILITADO</div>
        )}
    </div>
);

export default function Dashboard() {
    const { token, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const url = new URL('http://localhost:3000/api/dashboard_admin/stats');
                if (selectedMonth) url.searchParams.append('month', selectedMonth);
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
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
        return data?.charts.revenue.data.labels.map((mes, index) => ({
            mes: new Date(mes + '-01').toLocaleString('es-PE', { month: 'short', year: '2-digit' }).replace('.', ''),
            Ingresos: parseFloat(data.charts.revenue.data.datasets[0].data[index] || 0)
        })) || [];
    }, [data]);

    const formattedContractStatusData = useMemo(() => {
        return data?.charts.contractStatus.data.labels.map((label, index) => ({
            name: label,
            value: parseFloat(data.charts.contractStatus.data.datasets[0].data[index])
        })) || [];
    }, [data]);

    const formattedEmissionDaysData = useMemo(() => {
        return data?.charts.emissionDays.data.labels.map((label, index) => ({
            name: label,
            value: parseFloat(data.charts.emissionDays.data.datasets[0].data[index])
        })) || [];
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

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-full">
            <CgSpinner className="animate-spin h-10 w-10 text-[#1E88E5]" />
        </div>
    );
    if (error) return (
        <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button onClick={handleRetry} className="mt-4 inline-flex items-center px-4 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0]">
                <HiRefresh className="mr-2" /> Reintentar
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-50 to-gray-100/50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 font-['Helvetica', 'Arial', sans-serif]">Bienvenido, {user?.nombre || 'Admin'}</h1>
                <p className="mt-1 text-gray-600">Este es el centro de comando de Metrópoli Radio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard 
                    title="Total Usuarios" 
                    value={data.stats.totalUsuarios} 
                    icon={<HiUsers size={28} className="text-gray-900" />}
                    gradientClass="from-[#1E88E5] to-[#0288D1]" 
                    iconBgClass="bg-[#1E88E5]/20"
                />
                <StatCard 
                    title="Contratos Totales" 
                    value={data.stats.totalContratos} 
                    icon={<HiDocumentText size={28} className="text-gray-900" />}
                    gradientClass="from-[#1E88E5] to-[#0288D1]" 
                    iconBgClass="bg-[#1E88E5]/20"
                />
                <StatCard 
                    title="Contratos Activos" 
                    value={data.stats.contratosActivos} 
                    icon={<HiCheckCircle size={28} className="text-gray-900" />}
                    gradientClass="from-[#4CAF50] to-[#2E7D32]" 
                    iconBgClass="bg-[#4CAF50]/20"
                />
                <StatCard 
                    title="Solicitudes Pendientes" 
                    value={data.stats.solicitudesPendientes} 
                    icon={<HiExclamation size={28} className="text-gray-900" />}
                    gradientClass="from-[#FFCA28] to-[#FFB300]" 
                    iconBgClass="bg-[#FFCA28]/20"
                />
                <StatCard 
                    title="Ingresos Mensuales" 
                    value={`S/${data.stats.ingresosTotales}`} 
                    icon={<HiTrendingUp size={28} className="text-gray-900" />}
                    gradientClass="from-[#1E88E5] to-[#0288D1]" 
                    iconBgClass="bg-[#1E88E5]/20"
                />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardSection title="Rendimiento de Ingresos" icon={<HiTrendingUp/>}>
                        <div className="mb-4">
                            <select 
                                value={selectedMonth} 
                                onChange={handleMonthChange}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                                aria-label="Filtrar por mes"
                            >
                                <option value="">Últimos 6 meses</option>
                                {data.charts.revenue.data.labels.map(mes => (
                                    <option key={mes} value={mes}>{new Date(mes + '-01').toLocaleString('es-PE', { month: 'long', year: 'numeric' })}</option>
                                ))}
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={formattedRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `S/${value}`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(5px)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '0.75rem' }} />
                                <Area type="monotone" dataKey="Ingresos" stroke="#1E88E5" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>
                <div className="flex flex-col gap-6">
                    <DashboardSection title="Distribución de Contratos" icon={<HiDocumentText/>}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={formattedContractStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={40}
                                    outerRadius={80}
                                    stroke="#ffffff"
                                    label
                                >
                                    {formattedContractStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={data.charts.contractStatus.data.datasets[0].backgroundColor[index]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(5px)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '0.75rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                    <DashboardSection title="Días de Emisión Populares" icon={<HiCalendar/>}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={formattedEmissionDaysData}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(5px)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '0.75rem' }} />
                                <Bar dataKey="value" fill="#4CAF50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </DashboardSection>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Próximos Vencimientos" linkTo="/contratos" linkText="Ver todos" icon={<HiCalendar/>}>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {data.expirations.length > 0 ? data.expirations.map(exp => (
                            <div key={exp.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100/50" role="row">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{exp.nombre_cliente}</p>
                                    <p className="text-xs text-gray-500">{exp.nombre_campana}</p>
                                    <p className="text-xs text-gray-500">Días: {exp.dias_emision}</p>
                                </div>
                                <p className="text-sm font-bold text-red-500">{exp.fecha_fin}</p>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">¡Todo en orden! No hay vencimientos cercanos.</p>}
                    </div>
                </DashboardSection>
                <DashboardSection title="Actividad Reciente" linkTo="/contratos" linkText="Ver todos" icon={<HiTrendingUp/>}>
                    <ul className="divide-y divide-gray-200">
                        {data.activity.map(act => (
                            <li key={act.id} className="py-3 flex justify-between items-center" role="listitem">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Nuevo contrato "<span className="font-bold">{act.nombre_campana}</span>" para <span className="font-bold">{act.nombre_cliente}</span>.</p>
                                    <p className="text-xs text-gray-500">Días: {act.dias_emision}</p>
                                </div>
                                <p className="text-sm text-gray-500">{act.fecha_creacion}</p>
                            </li>
                        ))}
                    </ul>
                </DashboardSection>
            </div>

            <div className="mt-8">
                <DashboardSection title="Planes Ofrecidos Actualmente" icon={<HiTag />} linkTo="/planes" linkText="Gestionar Planes">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.planes.map(plan => (
                            <PlanDashboardCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                </DashboardSection>
            </div>
        </div>
    );
}