import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { HiMicrophone, HiCheck, HiEye, HiSearch, HiClock, HiOutlineDocumentDownload, HiCheckCircle, HiOutlineArchive, HiOutlineXCircle, HiExclamationCircle } from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg';

const StatusBadge = ({ estado }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    if (estado === 'Aceptada') { bgColor = 'bg-green-100'; textColor = 'text-green-800'; }
    else if (estado === 'Pendiente') { bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; }
    else if (estado === 'Vencida') { bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; }
    else if (estado === 'Retirada') { bgColor = 'bg-gray-200'; textColor = 'text-gray-600'; }
    else if (estado === 'Rechazada') { bgColor = 'bg-red-100'; textColor = 'text-red-800'; }
    return (<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>{estado}</span>);
};

const FilterComponent = ({ filterText, onFilter, placeholder }) => (
    <div className="relative">
        <input id="search" type="text" placeholder={placeholder || "Buscar..."}
            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm focus:ring-[#1E88E5] focus:border-[#1E88E5]"
            value={filterText} onChange={onFilter} />
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
);

const CustomLoader = () => (
  <div className="py-10 flex flex-col items-center justify-center text-gray-500">
    <CgSpinner className="animate-spin h-8 w-8 mb-4" />
    <p>Cargando tareas...</p>
  </div>
);

const EmptyState = ({ message, icon }) => (
    <div className="py-10 text-center text-gray-500">
        {icon}
        <p className="mt-2 text-sm">{message}</p>
    </div>
);

const PendienteCard = ({ tarea, onAceptar }) => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl">
        <div className="p-4">
            <h3 className="font-bold text-lg text-sky-800 truncate">{tarea.nombre_campana}</h3>
            <p className="text-sm text-gray-600 mb-2 truncate">{tarea.nombre_cliente}</p>
            <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                {tarea.fecha_inicio ? new Date(tarea.fecha_inicio).toLocaleDateString('es-PE') : 'N/A'} - {tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString('es-PE') : 'N/A'}
            </span>
        </div>
        <div className="p-4 bg-gray-50 border-t border-b flex-grow">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Guion / Detalles</h4>
            <div className="text-sm text-gray-700 h-24 overflow-y-auto p-2 bg-white border border-gray-200 rounded scrollbar-thin">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {tarea.detalles_anuncio || "No se especificaron detalles."}
                </pre>
            </div>
        </div>
        <div className="p-3 bg-gray-100 flex gap-2 justify-end">
            {tarea.pdf_url && (
            <a href={tarea.pdf_url} target="_blank" rel="noopener noreferrer" title="Ver Contrato PDF"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                <HiOutlineDocumentDownload className="h-4 w-4" /> Ver PDF
            </a>
            )}
            <button onClick={() => onAceptar(tarea.tarea_id)} title="Aceptar Tarea"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                <HiCheck className="h-4 w-4" /> Aceptar
            </button>
        </div>
    </div>
);

const VencidaCard = ({ tarea, onRetirar }) => (
    <div className="bg-white shadow-lg rounded-lg border border-blue-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl">
        <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800 truncate">{tarea.nombre_campana}</h3>
            <p className="text-sm text-gray-600 mb-2 truncate">{tarea.nombre_cliente}</p>
            <div className="text-left">
                <span className="text-xs font-bold text-blue-700">VENCIDO EL:</span>
                <p className="text-sm font-medium text-blue-800">{tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString('es-PE') : 'N/A'}</p>
            </div>
             {tarea.nombre_locutor && (
                <div className="text-left mt-2">
                    <span className="text-xs font-bold text-gray-500">ACEPTADA POR:</span>
                    <p className="text-sm font-medium text-gray-700">{tarea.nombre_locutor}</p>
                </div>
            )}
        </div>
        <div className="p-3 bg-blue-50 border-t flex gap-2 justify-end">
             {tarea.pdf_url && (
                <a href={tarea.pdf_url} target="_blank" rel="noopener noreferrer" title="Ver Contrato PDF"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                    <HiOutlineDocumentDownload className="h-4 w-4" /> Ver PDF
                </a>
             )}
            <button onClick={() => onRetirar(tarea.tarea_id)} title="Retirar Tarea (Archivar)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <HiOutlineArchive className="h-4 w-4" /> Retirar
            </button>
        </div>
    </div>
);

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
        if (!token) { setError("Autenticación requerida."); setLoading(false); return; }
        
        try {
            const endpointAceptadas = user.rol === 'admin' ? '/tareas/aceptadas-admin' : '/tareas/aceptadas';
            const endpointVencidas = user.rol === 'admin' ? '/tareas/vencidas-admin' : '/tareas/vencidas';
            const endpointRetiradas = user.rol === 'admin' ? '/tareas/retiradas-admin' : '/tareas/retiradas';

            const [pendientesRes, aceptadasRes, vencidasRes, retiradasRes] = await Promise.all([
                fetch('http://localhost:3000/api/locutor_panel/tareas', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:3000/api/locutor_panel${endpointAceptadas}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:3000/api/locutor_panel${endpointVencidas}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:3000/api/locutor_panel${endpointRetiradas}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const [pendientesData, aceptadasData, vencidasData, retiradasData] = await Promise.all([
                 pendientesRes.ok ? pendientesRes.json() : Promise.reject(new Error(`Pendientes: ${pendientesRes.statusText}`)),
                 aceptadasRes.ok ? aceptadasRes.json() : Promise.reject(new Error(`Aceptadas: ${aceptadasRes.statusText}`)),
                 vencidasRes.ok ? vencidasRes.json() : Promise.reject(new Error(`Vencidas: ${vencidasRes.statusText}`)),
                 retiradasRes.ok ? retiradasRes.json() : Promise.reject(new Error(`Retiradas: ${retiradasRes.statusText}`))
            ]);

            setPendientes(Array.isArray(pendientesData) ? pendientesData : []);
            setAceptadas(Array.isArray(aceptadasData) ? aceptadasData : []);
            setVencidas(Array.isArray(vencidasData) ? vencidasData : []);
            setRetiradas(Array.isArray(retiradasData) ? retiradasData : []);

        } catch (err) {
            console.error("Error fetching panel data:", err);
            setError(err.message || "Ocurrió un error al cargar los datos.");
            setPendientes([]); setAceptadas([]); setVencidas([]); setRetiradas([]);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (token) { fetchAllData(); }
        else { setError("Autenticación requerida."); setLoading(false); }
    }, [token, user.rol]);

     useEffect(() => {
        const currentQueryView = queryParams.get('view');
        const newView = validViews.includes(currentQueryView) ? currentQueryView : 'pendientes';
        if (newView !== view) { setView(newView); }
    }, [queryParams, view]);

    const handleAction = (tareaId) => {
        Swal.fire({
            title: `¿Confirmar Tarea?`, text: "La tarea se marcará como 'Aceptada'.", icon: 'question',
            showCancelButton: true, confirmButtonColor: '#34D399', cancelButtonColor: '#EF4444',
            confirmButtonText: `Sí, Aceptar`, cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/locutor_panel/tareas/${tareaId}/aceptar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error al aceptar la tarea");
                    Swal.fire('¡Éxito!', 'Tarea aceptada correctamente.', 'success');
                    fetchAllData();
                } catch (err) { Swal.fire('Error', err.message, 'error'); }
            }
        });
    };
    
    const handleRetirar = (tareaId) => {
        Swal.fire({
            title: `¿Retirar Tarea Vencida?`, text: "La tarea se moverá al archivo de 'Retiradas'.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#3B82F6', cancelButtonColor: '#6B7280',
            confirmButtonText: `Sí, Retirar`, cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/locutor_panel/tareas/${tareaId}/retirar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Error al retirar la tarea");
                    Swal.fire('¡Éxito!', 'Tarea retirada y archivada correctamente.', 'success');
                    fetchAllData();
                } catch (err) { Swal.fire('Error', err.message, 'error'); }
            }
        });
    };

    const aceptadasColumns = useMemo(() => {
        const baseColumns = [
            { name: 'Campaña', selector: row => row.nombre_campana, sortable: true, grow: 2 },
            { name: 'Cliente', selector: row => row.nombre_cliente, sortable: true, grow: 2 },
            { name: 'Fechas', selector: row => row.fecha_inicio, sortable: true, cell: row => (<div className='text-sm text-gray-500 whitespace-nowrap'>{`${new Date(row.fecha_inicio + 'T00:00:00').toLocaleDateString('es-PE')} - ${new Date(row.fecha_fin + 'T00:00:00').toLocaleDateString('es-PE')}`}</div>) },
        ];
        if (user.rol === 'admin') {
            baseColumns.push({ name: 'Locutor', selector: row => row.nombre_locutor, sortable: true, grow: 1, cell: row => row.nombre_locutor || <span className="text-gray-400 italic">N/A</span> });
        }
        baseColumns.push({ name: 'Estado', selector: row => row.estado, sortable: true, cell: row => <StatusBadge estado={row.estado} />, width: '120px' });
        return baseColumns;
    }, [user.rol]);

    const vencidasColumns = useMemo(() => {
        const baseColumns = [
            { name: 'Campaña', selector: row => row.nombre_campana, sortable: true, grow: 2 },
            { name: 'Cliente', selector: row => row.nombre_cliente, sortable: true, grow: 2 },
            { name: 'Fecha Vencimiento', selector: row => row.fecha_fin, sortable: true, cell: row => (<span className="text-red-600 font-medium">{new Date(row.fecha_fin + 'T00:00:00').toLocaleDateString('es-PE')}</span>) }
        ];
        if (user.rol === 'admin') {
            baseColumns.push({ name: 'Locutor', selector: row => row.nombre_locutor, sortable: true, cell: row => row.nombre_locutor || <span className="text-gray-400 italic">N/A</span> });
        }
        baseColumns.push({
            name: 'Acción', minWidth: '100px', center: true,
            cell: row => (
                <button onClick={() => handleRetirar(row.tarea_id)} title="Retirar Tarea (Archivar)"
                    className="p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600">
                    <HiOutlineArchive className="h-5 w-5" />
                </button>
            )
        });
        return baseColumns;
    }, [user.rol]);

    const retiradasColumns = useMemo(() => {
         const baseColumns = [
            { name: 'Campaña', selector: row => row.nombre_campana, sortable: true, grow: 2 },
            { name: 'Cliente', selector: row => row.nombre_cliente, sortable: true, grow: 2 },
            { name: 'Fecha Vencimiento', selector: row => row.fecha_fin, sortable: true, cell: row => new Date(row.fecha_fin + 'T00:00:00').toLocaleDateString('es-PE') }
        ];
        if (user.rol === 'admin') {
            baseColumns.push({ name: 'Locutor', selector: row => row.nombre_locutor, sortable: true, cell: row => row.nombre_locutor || <span className="text-gray-400 italic">N/A</span> });
        }
        baseColumns.push({ name: 'Estado', cell: () => <StatusBadge estado="Retirada" />, center: true, width: '120px' });
        return baseColumns;
    }, [user.rol]);

    const filteredData = useMemo(() => {
        const lowerFilter = filterText.toLowerCase();
        const filterFn = item => 
            (item.nombre_campana && item.nombre_campana.toLowerCase().includes(lowerFilter)) ||
            (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(lowerFilter)) ||
            (user.rol === 'admin' && item.nombre_locutor && item.nombre_locutor.toLowerCase().includes(lowerFilter));
            
        switch(view) {
            case 'pendientes': return pendientes.filter(filterFn);
            case 'aceptadas': return aceptadas.filter(filterFn);
            case 'vencidas': return vencidas.filter(filterFn);
            case 'retiradas': return retiradas.filter(filterFn);
            default: return [];
        }
    }, [view, filterText, pendientes, aceptadas, vencidas, retiradas, user.rol]);

    const subHeaderComponent = useMemo(() => (
        <div className="w-full md:w-1/3 py-2 px-1">
            <FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} placeholder={`Buscar en ${view}...`} />
        </div>
    ), [filterText, view]);

    if (error && !loading) return (
        <div className="p-10 text-center text-red-600 bg-red-50 rounded-md shadow">
             <HiExclamationCircle className="mx-auto h-12 w-12 text-red-400" />
             <h3 className="mt-2 text-sm font-medium text-red-800">Error al Cargar Datos</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
    );

    const renderContent = () => {
        if (loading) return <CustomLoader />;

        const dataToDisplay = filteredData;
        
        switch(view) {
            case 'pendientes':
                return (
                    <>
                        <div className="w-full md:w-1/3 py-2 px-1 mt-4">
                            {subHeaderComponent}
                        </div>
                        {dataToDisplay.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {dataToDisplay.map(tarea => <PendienteCard key={tarea.tarea_id} tarea={tarea} onAceptar={handleAction} />)}
                            </div>
                        ) : (
                            <EmptyState message={filterText ? "No se encontraron tareas." : "¡Todo al día! No hay tareas pendientes."} icon={filterText ? <HiSearch className="h-12 w-12"/> : <HiCheckCircle className="h-12 w-12" />} />
                        )}
                    </>
                );
            case 'vencidas':
                return (
                    <>
                        <div className="w-full md:w-1/3 py-2 px-1 mt-4">
                            {subHeaderComponent}
                        </div>
                        {dataToDisplay.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {dataToDisplay.map(tarea => <VencidaCard key={tarea.tarea_id} tarea={tarea} onRetirar={handleRetirar} />)}
                            </div>
                        ) : (
                            <EmptyState message={filterText ? "No se encontraron tareas." : "No hay tareas vencidas para retirar."} icon={filterText ? <HiSearch className="h-12 w-12"/> : <HiOutlineArchive className="h-12 w-12" />} />
                        )}
                    </>
                );
            case 'aceptadas':
                return (
                    <div className="mt-0 border border-t-0 rounded-b-lg overflow-hidden shadow-sm bg-white">
                        <DataTable columns={aceptadasColumns} data={dataToDisplay} pagination paginationPerPage={10} responsive highlightOnHover subHeader subHeaderComponent={subHeaderComponent} noDataComponent={<EmptyState message="No hay tareas aceptadas." icon={<HiSearch className="h-12 w-12"/>}/>} paginationComponentOptions={{ rowsPerPageText: 'Filas:', rangeSeparatorText: 'de' }} subHeaderAlign="left" />
                    </div>
                );
            case 'retiradas':
                 return (
                    <div className="mt-0 border border-t-0 rounded-b-lg overflow-hidden shadow-sm bg-white">
                        <DataTable columns={retiradasColumns} data={dataToDisplay} pagination paginationPerPage={10} responsive highlightOnHover subHeader subHeaderComponent={subHeaderComponent} noDataComponent={<EmptyState message="No hay tareas retiradas." icon={<HiSearch className="h-12 w-12"/>} />} paginationComponentOptions={{ rowsPerPageText: 'Filas:', rangeSeparatorText: 'de' }} subHeaderAlign="left" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-3 mb-1">
                <HiMicrophone className="text-sky-600" />
                 Panel de Tareas de Locución
                {user?.rol === 'admin' && (
                    <span className='text-base font-normal text-sky-600 flex items-center gap-1 ml-2'>(<HiEye /> Vista Admin)</span>
                )}
            </h1>
            <p className="mt-1 text-sm text-gray-600 mb-6">
                {user?.rol === 'admin' ? 'Supervisa el estado de todas las tareas.' : 'Gestiona tus pautas publicitarias.'}
            </p>

            <div className="border-b border-gray-200 bg-white px-4 rounded-t-lg shadow-sm">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button
                        onClick={() => { setView('pendientes'); navigate('/panel-locutor?view=pendientes', { replace: true }); setFilterText(''); }}
                        className={`${view === 'pendientes' ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out whitespace-nowrap`}
                    >
                        <HiClock className={`mr-2 h-5 w-5 ${view === 'pendientes' ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Pendientes ({pendientes.length})</span>
                    </button>
                    <button
                        onClick={() => { setView('aceptadas'); navigate('/panel-locutor?view=aceptadas', { replace: true }); setFilterText(''); }}
                        className={`${view === 'aceptadas' ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out whitespace-nowrap`}
                    >
                        <HiCheckCircle className={`mr-2 h-5 w-5 ${view === 'aceptadas' ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Aceptadas ({aceptadas.length})</span>
                    </button>
                    <button
                        onClick={() => { setView('vencidas'); navigate('/panel-locutor?view=vencidas', { replace: true }); setFilterText(''); }}
                        className={`${view === 'vencidas' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out whitespace-nowrap`}
                    >
                        <HiOutlineXCircle className={`mr-2 h-5 w-5 ${view === 'vencidas' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Vencidas ({vencidas.length})</span>
                    </button>
                     <button
                        onClick={() => { setView('retiradas'); navigate('/panel-locutor?view=retiradas', { replace: true }); setFilterText(''); }}
                        className={`${view === 'retiradas' ? 'border-gray-600 text-gray-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out whitespace-nowrap`}
                    >
                        <HiOutlineArchive className={`mr-2 h-5 w-5 ${view === 'retiradas' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Retiradas ({retiradas.length})</span>
                    </button>
                </nav>
            </div>
            
            {(view === 'aceptadas' || view === 'retiradas') && !loading && (
                <div className="bg-white p-3 border-x border-b rounded-b-lg shadow-sm">
                    {subHeaderComponent}
                </div>
            )}
            
            {loading ? <CustomLoader /> : renderContent()}
            
        </div>
    );
}