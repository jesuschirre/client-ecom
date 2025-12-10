import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { 
    HiMicrophone, HiCheck, HiEye, HiSearch, HiClock, 
    HiOutlineDocumentDownload, HiCheckCircle, HiOutlineArchive, 
    HiOutlineXCircle, HiExclamationCircle, HiCalendar, HiUser, HiDocumentText 
} from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg';

// --- UTILIDADES ---
const formatDateSafe = (dateString) => {
    if (!dateString) return '-';
    try {
        const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return 'Error';
    }
};

// --- ESTILOS DE TABLA ---
const customTableStyles = {
    headCells: {
        style: {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '12px',
            paddingRight: '12px',
            borderBottom: '1px solid #e2e8f0',
        },
    },
    rows: {
        style: {
            fontSize: '0.875rem',
            color: '#334155',
            minHeight: '60px',
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
            },
            '&:hover': {
                backgroundColor: '#f8fafc',
                transition: 'all 0.1s ease-in-out',
            },
        },
    },
};

// --- COMPONENTES UI ---

const StatusBadge = ({ estado }) => {
    const statusUpper = estado ? estado.toUpperCase() : '';

    const styles = {
        'ACEPTADA':   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
        'ACTIVO':     'bg-green-100 text-green-700 ring-1 ring-green-600/20',
        'PROGRAMADO': 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
        'PENDIENTE':  'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
        'VENCIDA':    'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
        'RETIRADA':   'bg-slate-100 text-slate-500 ring-1 ring-slate-400/20',
        'RECHAZADA':  'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    };

    const currentStyle = styles[statusUpper] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-400/20';
    const isLive = statusUpper === 'ACTIVO';

    return (
        <div className="flex justify-center w-full">
            <span className={`
                px-3 py-1.5 rounded-full 
                text-[10px] font-extrabold uppercase tracking-widest
                shadow-sm whitespace-nowrap
                flex items-center justify-center gap-1.5
                ${currentStyle}
            `}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-current opacity-40'}`}></span>
                {estado}
            </span>
        </div>
    );
};

const SearchBar = ({ filterText, onFilter, placeholder }) => (
    <div className="relative group max-w-sm w-full ml-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
        </div>
        <input
            id="search"
            type="text"
            placeholder={placeholder || "Buscar..."}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all duration-200 shadow-sm"
            value={filterText}
            onChange={onFilter}
        />
    </div>
);

const CustomLoader = () => (
  <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
    <CgSpinner className="animate-spin h-10 w-10 mb-3 text-sky-600" />
    <p className="font-medium text-sm">Sincronizando tareas...</p>
  </div>
);

const EmptyState = ({ message, icon }) => (
    <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-300 mt-4">
        <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400">
            {icon}
        </div>
        <p className="text-gray-500 font-medium">{message}</p>
    </div>
);

const PendienteCard = ({ tarea, onAceptar }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
        <div className="h-1.5 bg-amber-400 w-full"></div>
        <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800 leading-tight group-hover:text-amber-600 transition-colors">
                    {tarea.nombre_campana}
                </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <HiUser className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{tarea.nombre_cliente}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-4">
                <HiCalendar className="h-5 w-5 text-sky-600" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vigencia</span>
                    <span className="text-xs font-semibold text-gray-700">
                        {formatDateSafe(tarea.fecha_inicio)} — {formatDateSafe(tarea.fecha_fin)}
                    </span>
                </div>
            </div>
            <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <HiDocumentText className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-bold uppercase text-gray-500">Detalles</span>
                </div>
                <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 h-24 overflow-y-auto scrollbar-thin">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {tarea.detalles_anuncio || "Sin detalles adicionales."}
                    </p>
                </div>
            </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-between items-center">
            {tarea.pdf_url ? (
                <a href={tarea.pdf_url} target="_blank" rel="noopener noreferrer" 
                   className="text-xs font-medium text-gray-500 hover:text-sky-600 flex items-center gap-1 transition-colors">
                    <HiOutlineDocumentDownload className="h-4 w-4" /> Ver PDF
                </a>
            ) : (<span></span>)}
            <button onClick={() => onAceptar(tarea.tarea_id)} 
                className="flex-1 max-w-[140px] inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all active:scale-95">
                <HiCheck className="h-4 w-4" /> Aceptar
            </button>
        </div>
    </div>
);

const VencidaCard = ({ tarea, onRetirar }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:border-red-200 group">
        <div className="h-1.5 bg-red-500 w-full"></div>
        <div className="p-5 flex-grow">
            <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1 group-hover:text-red-600 transition-colors">
                {tarea.nombre_campana}
            </h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <HiUser className="h-3 w-3" /> {tarea.nombre_cliente}
            </p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col items-center justify-center text-center mb-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Fecha de Vencimiento</span>
                <span className="text-lg font-bold text-red-700 flex items-center gap-2">
                    <HiOutlineXCircle className="h-5 w-5" />
                    {formatDateSafe(tarea.fecha_fin)}
                </span>
            </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end items-center">
            <button onClick={() => onRetirar(tarea.tarea_id)} 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all shadow-sm">
                <HiOutlineArchive className="h-4 w-4" /> Archivar
            </button>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function PanelLocutor() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const validViews = ['pendientes', 'aceptadas', 'vencidas', 'retiradas'];
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialViewQuery = queryParams.get('view');
    const initialView = validViews.includes(initialViewQuery) ? initialViewQuery : 'pendientes';
    const [view, setView] = useState(initialView);

    const [pendientes, setPendientes] = useState([]);
    const [aceptadas, setAceptadas] = useState([]);
    const [vencidas, setVencidas] = useState([]);
    const [retiradas, setRetiradas] = useState([]);
    const [filterText, setFilterText] = useState('');

    const fetchAllData = async () => {
        setError(null);
        if (!token || !user) { 
            setError("Esperando autenticación..."); 
            setLoading(false); 
            return; 
        }
        
        try {
            // LÓGICA DE ROLES: Define qué endpoint usar según quién eres
            const isAdmin = user.rol === 'admin';
            
            const endpointPendientes = isAdmin ? '/tareas-admin' : '/tareas'; // Asumiendo que existe ruta admin para pendientes, si no, usa la normal
            const endpointAceptadas = isAdmin ? '/tareas/aceptadas-admin' : '/tareas/aceptadas';
            const endpointVencidas = isAdmin ? '/tareas/vencidas-admin' : '/tareas/vencidas';
            const endpointRetiradas = isAdmin ? '/tareas/retiradas-admin' : '/tareas/retiradas';

            // Nota: He ajustado la URL base para pendientes para ser consistente
            const baseUrl = 'http://localhost:3000/api/locutor_panel';

            const [pendientesRes, aceptadasRes, vencidasRes, retiradasRes] = await Promise.all([
                fetch(`${baseUrl}${isAdmin ? '/tareas' : '/tareas'}`, { headers: { 'Authorization': `Bearer ${token}` } }), // Ajusta si tienes ruta distinta para admin en pendientes
                fetch(`${baseUrl}${endpointAceptadas}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}${endpointVencidas}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}${endpointRetiradas}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            // Manejo de errores específicos por petición
            if (pendientesRes.status === 403) throw new Error("Acceso denegado a Pendientes (403). Revisa permisos.");
            if (aceptadasRes.status === 403) throw new Error("Acceso denegado a Aceptadas (403). Revisa permisos.");

            const [pendientesData, aceptadasData, vencidasData, retiradasData] = await Promise.all([
                 pendientesRes.ok ? pendientesRes.json() : [],
                 aceptadasRes.ok ? aceptadasRes.json() : [],
                 vencidasRes.ok ? vencidasRes.json() : [],
                 retiradasRes.ok ? retiradasRes.json() : []
            ]);

            setPendientes(Array.isArray(pendientesData) ? pendientesData : []);
            setAceptadas(Array.isArray(aceptadasData) ? aceptadasData : []);
            setVencidas(Array.isArray(vencidasData) ? vencidasData : []);
            setRetiradas(Array.isArray(retiradasData) ? retiradasData : []);

        } catch (err) {
            console.error("Error fetching panel data:", err);
            setError(err.message || "Ocurrió un error al cargar los datos.");
            // No limpiamos los estados para evitar parpadeos si es un error transitorio
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (token && user) { 
            fetchAllData(); 
        } else {
            // Esperamos un poco antes de mostrar error, por si está cargando el contexto
            const timer = setTimeout(() => {
                if(!user) setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [token, user?.rol]); // Dependencia clave: user?.rol

     useEffect(() => {
        const currentQueryView = queryParams.get('view');
        const newView = validViews.includes(currentQueryView) ? currentQueryView : 'pendientes';
        if (newView !== view) { setView(newView); }
    }, [queryParams, view]);

    const handleAction = (tareaId) => {
        Swal.fire({
            title: '¿Confirmar Tarea?',
            text: "La tarea pasará a tu lista de Aceptadas.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Sí, Aceptar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/locutor_panel/tareas/${tareaId}/aceptar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error al aceptar la tarea");
                    Swal.fire({ title: '¡Aceptada!', text: 'Tarea agregada a tu cola de trabajo.', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchAllData();
                } catch (err) { Swal.fire('Error', err.message, 'error'); }
            }
        });
    };
    
    const handleRetirar = (tareaId) => {
        Swal.fire({
            title: '¿Archivar Tarea?',
            text: "Se moverá al historial de Retiradas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Sí, Archivar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/locutor_panel/tareas/${tareaId}/retirar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error al retirar la tarea");
                    Swal.fire({ title: 'Archivada', text: 'Tarea retirada correctamente.', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchAllData();
                } catch (err) { Swal.fire('Error', err.message, 'error'); }
            }
        });
    };

    // --- COLUMNAS (Aceptadas) ---
    const acceptedCols = useMemo(() => [
        { 
            name: 'Campaña', 
            selector: row => row.nombre_campana, 
            sortable: true, 
            grow: 2, 
            cell: row => <span className="font-bold text-slate-700 text-sm">{row.nombre_campana}</span> 
        },
        { 
            name: 'Cliente', 
            selector: row => row.nombre_cliente, 
            sortable: true, 
            grow: 1.5, 
            hide: 'sm',
            cell: row => <span className="text-slate-500 text-xs font-medium">{row.nombre_cliente}</span>
        },
        { 
            name: 'Inicio', 
            selector: row => row.fecha_inicio, 
            sortable: true, 
            width: '100px', 
            center: true,
            cell: row => (
                <div className="flex flex-col items-center">
                    <span className="text-slate-600 font-semibold text-xs">{formatDateSafe(row.fecha_inicio)}</span>
                </div>
            ) 
        },
        { 
            name: 'Fin', 
            selector: row => row.fecha_fin, 
            sortable: true, 
            width: '100px', 
            center: true,
            cell: row => (
                <div className="flex flex-col items-center">
                    <span className="text-slate-600 font-semibold text-xs">{formatDateSafe(row.fecha_fin)}</span>
                </div>
            ) 
        },
        { 
            name: 'Estado', 
            selector: row => row.estado, 
            sortable: true, 
            center: true, 
            minWidth: '150px', 
            cell: row => <StatusBadge estado={row.estado} /> 
        }
    ], []); // Quitamos user.rol de dependencias para que no parpadee la tabla

    // --- COLUMNAS (Retiradas/Historial) ---
    const retiredCols = useMemo(() => [
        { 
            name: 'Campaña', 
            selector: row => row.nombre_campana, 
            sortable: true, 
            grow: 2, 
            cell: row => <span className="font-medium text-gray-600">{row.nombre_campana}</span> 
        },
        { 
            name: 'Cliente', 
            selector: row => row.nombre_cliente, 
            sortable: true, 
            grow: 1.5, 
            hide: 'sm',
            cell: row => <span className="text-gray-500 text-xs font-medium">{row.nombre_cliente}</span> 
        },
        { 
            name: 'Inicio', 
            selector: row => row.fecha_inicio, 
            sortable: true, 
            width: '100px', 
            center: true,
            cell: row => <span className="text-gray-500 text-xs">{formatDateSafe(row.fecha_inicio)}</span> 
        },
        { 
            name: 'Fin', 
            selector: row => row.fecha_fin, 
            sortable: true, 
            width: '100px', 
            center: true,
            cell: row => <span className="text-gray-500 font-mono text-xs">{formatDateSafe(row.fecha_fin)}</span> 
        },
        { name: 'Estado', cell: () => <StatusBadge estado="Retirada" />, center: true, width: '140px' }
    ], []);

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();
        const filterFn = item => 
            (item.nombre_campana && item.nombre_campana.toLowerCase().includes(lowerFilter)) ||
            (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(lowerFilter));
            
        switch(view) {
            case 'pendientes': return pendientes.filter(filterFn);
            case 'aceptadas': return aceptadas.filter(filterFn);
            case 'vencidas': return vencidas.filter(filterFn);
            case 'retiradas': return retiradas.filter(filterFn);
            default: return [];
        }
    }, [view, filterText, pendientes, aceptadas, vencidas, retiradas]);

    // Verificación de seguridad para evitar renderizar sin usuario
    if (!user && !loading) return (
        <div className="p-10 text-center">
            <h3 className="text-lg font-bold text-gray-700">No se ha iniciado sesión</h3>
            <p>Por favor, ingresa nuevamente.</p>
        </div>
    );

    if (error && !loading) return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
             <div className="bg-red-50 p-4 rounded-full mb-3">
                <HiExclamationCircle className="h-8 w-8 text-red-500" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Algo salió mal</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">{error}</p>
            <button onClick={fetchAllData} className="mt-4 text-sky-600 hover:text-sky-800 font-medium text-sm">Intentar de nuevo</button>
        </div>
    );

    const renderContent = () => {
        if (loading) return <CustomLoader />;

        const dataToDisplay = filteredData;
        const commonTableProps = {
            pagination: true,
            paginationPerPage: 10,
            responsive: true,
            highlightOnHover: true,
            customStyles: customTableStyles,
            noDataComponent: <EmptyState message={`No hay tareas ${view} para mostrar.`} icon={<HiSearch className="h-8 w-8 opacity-50"/>} />,
            paginationComponentOptions: { rowsPerPageText: 'Filas:', rangeSeparatorText: 'de', noRowsPerPage: false },
        };

        switch(view) {
            case 'pendientes':
                return (
                    <div className="mt-6">
                        {dataToDisplay.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {dataToDisplay.map(tarea => <PendienteCard key={tarea.tarea_id} tarea={tarea} onAceptar={handleAction} />)}
                            </div>
                        ) : (
                            <EmptyState message={filterText ? "No se encontraron coincidencias." : "¡Estás al día! No tienes tareas nuevas."} icon={<HiCheckCircle className="h-10 w-10 text-green-400"/>} />
                        )}
                    </div>
                );
            case 'vencidas':
                return (
                    <div className="mt-6">
                         {dataToDisplay.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {dataToDisplay.map(tarea => <VencidaCard key={tarea.tarea_id} tarea={tarea} onRetirar={handleRetirar} />)}
                            </div>
                        ) : (
                            <EmptyState message={filterText ? "No se encontraron coincidencias." : "Limpio. No hay tareas vencidas."} icon={<HiOutlineArchive className="h-10 w-10 text-gray-300"/>} />
                        )}
                    </div>
                );
            case 'aceptadas':
                return (
                    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                        <DataTable columns={acceptedCols} data={dataToDisplay} {...commonTableProps} />
                    </div>
                );
            case 'retiradas':
                 return (
                    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                        <DataTable columns={retiredCols} data={dataToDisplay} {...commonTableProps} />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-sky-100 rounded-lg text-sky-600"><HiMicrophone /></span>
                        Panel de Locución
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 ml-1">
                        {user?.rol === 'admin' ? 'Vista de Administrador' : 'Gestiona tus grabaciones y contratos.'}
                    </p>
                </div>
                {!loading && <SearchBar onFilter={e => setFilterText(e.target.value)} filterText={filterText} placeholder={`Buscar en ${view}...`} />}
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                    {[
                        { id: 'pendientes', label: 'Pendientes', icon: HiClock, color: 'sky' },
                        { id: 'aceptadas', label: 'Aceptadas', icon: HiCheckCircle, color: 'green' },
                        { id: 'vencidas', label: 'Vencidas', icon: HiOutlineXCircle, color: 'red' },
                        { id: 'retiradas', label: 'Historial', icon: HiOutlineArchive, color: 'gray' },
                    ].map((tab) => {
                        const isActive = view === tab.id;
                        const activeColors = {
                            sky: 'border-sky-500 text-sky-600',
                            green: 'border-green-500 text-green-600',
                            red: 'border-red-500 text-red-600',
                            gray: 'border-gray-500 text-gray-700'
                        };
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setView(tab.id); navigate(`/panel-locutor?view=${tab.id}`, { replace: true }); setFilterText(''); }}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200
                                    ${isActive ? activeColors[tab.color] : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? '' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                {tab.label}
                                <span className={`ml-1.5 py-0.5 px-2 rounded-full text-xs ${isActive ? 'bg-gray-100' : 'bg-gray-100 text-gray-500'}`}>
                                    {tab.id === 'pendientes' ? pendientes.length : 
                                     tab.id === 'aceptadas' ? aceptadas.length : 
                                     tab.id === 'vencidas' ? vencidas.length : retiradas.length}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
}