import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { HiMicrophone, HiCheck, HiX, HiEye, HiSearch, HiClock, HiCollection, HiOutlineDocumentDownload, HiCheckCircle, HiXCircle } from 'react-icons/hi';

// --- Componente TareaCard (para la vista de "Pendientes") ---
const TareaCard = ({ tarea, onAceptar, onRechazar, userRole }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${userRole === 'admin' ? 'border-blue-500' : 'border-yellow-500'}`}>
        <p className="text-xs text-gray-500">Cliente: {tarea.nombre_cliente}</p>
        <h3 className="text-xl font-bold text-gray-800">{tarea.nombre_campana}</h3>
        <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700">Detalles y Guion:</p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{tarea.detalles_anuncio || "No se proporcionaron detalles."}</p>
        </div>
        <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700">Programación:</p>
            <p className="text-sm text-gray-600">Del {new Date(tarea.fecha_inicio).toLocaleDateString('es-PE')} al {new Date(tarea.fecha_fin).toLocaleDateString('es-PE')}</p>
        </div>
        {(userRole === 'locutor' || userRole === 'admin') && (
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => onRechazar(tarea.tarea_id, 'rechazar')} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 font-semibold transition-colors"><HiX /> Rechazar</button>
                <button onClick={() => onAceptar(tarea.tarea_id, 'aceptar')} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 font-semibold transition-colors"><HiCheck /> Aceptar Tarea</button>
            </div>
        )}
    </div>
);

// --- Componente para una insignia de estado en la tabla ---
const StatusBadge = ({ estado }) => {
    const statusStyles = {
        Aceptada: 'bg-green-100 text-green-800',
        Rechazada: 'bg-red-100 text-red-800',
    };
    return ( <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[estado] || 'bg-gray-100'}`}>{estado}</span> );
};

// --- Componente para el filtro de búsqueda de la tabla ---
const FilterComponent = ({ filterText, onFilter, placeholder }) => (
    <div className="relative">
        <input id="search" type="text" placeholder={placeholder || "Buscar..."} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm" value={filterText} onChange={onFilter} />
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
);

// =================================================================================
// COMPONENTE PRINCIPAL: PanelLocutor
// =================================================================================
export default function PanelLocutor() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('pendientes');
    
    const [pendientes, setPendientes] = useState([]);
    const [aceptadas, setAceptadas] = useState([]);
    const [rechazadas, setRechazadas] = useState([]);

    const [filterTextAceptadas, setFilterTextAceptadas] = useState('');
    const [filterTextRechazadas, setFilterTextRechazadas] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Determina qué endpoint de historial usar según el rol
            const endpointHistorial = user.rol === 'admin' ? '/tareas/historial-admin' : '/tareas/historial';
            
            // Realiza ambas peticiones (pendientes e historial) en paralelo
            const [pendientesRes, historialRes] = await Promise.all([
                fetch('http://localhost:3000/api/locutor_panel/tareas', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:3000/api/locutor_panel${endpointHistorial}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!pendientesRes.ok) throw new Error((await pendientesRes.json()).error || "Error al cargar tareas pendientes.");
            setPendientes(await pendientesRes.json());

            if (!historialRes.ok) throw new Error((await historialRes.json()).error || "Error al cargar el historial.");
            const historialData = await historialRes.json();

            // Separa los datos del historial en dos listas separadas
            setAceptadas(historialData.filter(t => t.estado === 'Aceptada'));
            setRechazadas(historialData.filter(t => t.estado === 'Rechazada'));

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchAllData(); }, [token]);

    const handleAction = (tareaId, action) => {
        Swal.fire({
            title: `¿Confirmar ${action}?`, icon: 'question', showCancelButton: true,
            confirmButtonText: `Sí, ${action}`, cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/locutor_panel/tareas/${tareaId}/${action}`, {
                        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    Swal.fire('¡Éxito!', data.message, 'success');
                    fetchAllData(); // Recarga todos los datos para mantener las pestañas sincronizadas
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    };

    // Define las columnas de la tabla dinámicamente según el rol del usuario
    const columns = useMemo(() => {
        const baseColumns = [
            { name: 'Campaña', selector: row => row.nombre_campana, sortable: true, grow: 2 },
            { name: 'Cliente', selector: row => row.nombre_cliente, sortable: true, grow: 2 },
        ];
        // Si el usuario es admin, añade la columna "Locutor"
        if (user.rol === 'admin') {
            baseColumns.push({ name: 'Locutor Asignado', selector: row => row.nombre_locutor, sortable: true, cell: row => row.nombre_locutor || <span className="text-gray-400">N/A</span> });
        }
        baseColumns.push(
            { name: 'Estado', cell: row => <StatusBadge estado={row.estado} />, center: true, sortable: true },
            { name: 'Acciones', button: true, center: true, cell: row => (
                <div className="flex items-center">
                  {row.pdf_url && (<a href={`http://localhost:3000${row.pdf_url}`} target="_blank" rel="noopener noreferrer" title="Ver Contrato PDF" className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600"><HiOutlineDocumentDownload className="h-5 w-5" /></a>)}
                </div>
              ),
            }
        );
        return baseColumns;
    }, [user.rol]);

    // Lógica para filtrar los datos de cada tabla
    const filteredAceptadas = aceptadas.filter(item =>
        (item.nombre_campana && item.nombre_campana.toLowerCase().includes(filterTextAceptadas.toLowerCase())) ||
        (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(filterTextAceptadas.toLowerCase())) ||
        (user.rol === 'admin' && item.nombre_locutor && item.nombre_locutor.toLowerCase().includes(filterTextAceptadas.toLowerCase()))
    );

    const filteredRechazadas = rechazadas.filter(item =>
        (item.nombre_campana && item.nombre_campana.toLowerCase().includes(filterTextRechazadas.toLowerCase())) ||
        (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(filterTextRechazadas.toLowerCase())) ||
        (user.rol === 'admin' && item.nombre_locutor && item.nombre_locutor.toLowerCase().includes(filterTextRechazadas.toLowerCase()))
    );

	const subHeaderAceptadas = useMemo(() => <FilterComponent onFilter={e => setFilterTextAceptadas(e.target.value)} filterText={filterTextAceptadas} placeholder="Buscar en aceptadas..." />, [filterTextAceptadas]);
    const subHeaderRechazadas = useMemo(() => <FilterComponent onFilter={e => setFilterTextRechazadas(e.target.value)} filterText={filterTextRechazadas} placeholder="Buscar en rechazadas..." />, [filterTextRechazadas]);

    if (error && !loading) return <div className="p-10 text-center text-red-500 font-semibold">Error: {error}</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-3">
                <HiMicrophone /> Panel de Tareas de Locución
                {user?.rol === 'admin' && <span className='text-lg font-normal text-blue-600 flex items-center gap-2'>(<HiEye/> Vista de Administrador)</span>}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                {user?.rol === 'admin' ? 'Supervisa el estado de todas las tareas de locución.' : 'Gestiona tus pautas publicitarias pendientes y completadas.'}
            </p>

            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setView('pendientes')} className={`${view === 'pendientes' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}>
                        <HiClock className="mr-2 h-5 w-5" /> <span>Pendientes ({pendientes.length})</span>
                    </button>
                    <button onClick={() => setView('aceptadas')} className={`${view === 'aceptadas' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}>
                        <HiCheckCircle className="mr-2 h-5 w-5" /> <span>Aceptadas ({aceptadas.length})</span>
                    </button>
                    <button onClick={() => setView('rechazadas')} className={`${view === 'rechazadas' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}>
                        <HiXCircle className="mr-2 h-5 w-5" /> <span>Rechazadas ({rechazadas.length})</span>
                    </button>
                </nav>
            </div>

            {loading && <div className="py-10 text-center">Cargando datos...</div>}

            {!loading && view === 'pendientes' && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendientes.length === 0 ? (<div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm"><p className="text-gray-500 text-lg">¡Todo al día! No hay tareas pendientes.</p></div>) 
                    : (pendientes.map(tarea => <TareaCard key={tarea.tarea_id} tarea={tarea} onAceptar={handleAction} onRechazar={handleAction} userRole={user?.rol} />))}
                </div>
            )}

            {!loading && view === 'aceptadas' && (
                 <div className="mt-8 border rounded-lg overflow-hidden shadow-sm">
                    <DataTable columns={columns} data={filteredAceptadas} pagination paginationPerPage={10} responsive highlightOnHover striped subHeader subHeaderComponent={subHeaderAceptadas} noDataComponent={<div className="py-10 text-center">No hay tareas aceptadas.</div>} />
                </div>
            )}

            {!loading && view === 'rechazadas' && (
                 <div className="mt-8 border rounded-lg overflow-hidden shadow-sm">
                    <DataTable columns={columns} data={filteredRechazadas} pagination paginationPerPage={10} responsive highlightOnHover striped subHeader subHeaderComponent={subHeaderRechazadas} noDataComponent={<div className="py-10 text-center">No hay tareas rechazadas.</div>} />
                </div>
            )}
        </div>
    );
}