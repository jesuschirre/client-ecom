import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    HiPlus, 
    HiOutlineDocumentDownload, 
    HiSearch,
    HiCollection, 
    HiCheckCircle, 
    HiClock, 
    HiXCircle // <-- Corregido de HiExCircle a HiXCircle
} from 'react-icons/hi';
import DataTable from 'react-data-table-component';
import { useAuth } from '../context/AuthContext';

// Componente reutilizable para las tarjetas de métricas
const StatCard = ({ title, count, icon, colorClass }) => (
    <div className="bg-white p-5 shadow-sm rounded-lg flex items-center">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
    </div>
);

// Componente para una insignia de estado
const StatusBadge = ({ estado }) => {
  const statusStyles = {
    Pendiente_Activacion: 'bg-yellow-100 text-yellow-800', Programado: 'bg-blue-100 text-blue-800',
    Activo: 'bg-green-100 text-green-800', Por_Vencer: 'bg-orange-100 text-orange-800',
    Vencido: 'bg-red-100 text-red-800', Cancelado: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[estado] || 'bg-gray-100'}`}>
      {estado ? estado.replace('_', ' ') : ''}
    </span>
  );
};

// Componente para el filtro de búsqueda
const FilterComponent = ({ filterText, onFilter }) => (
    <div className="relative">
        <input id="search" type="text" 
            placeholder="Buscar por campaña, cliente o DNI/RUC..."
            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm"
            value={filterText} onChange={onFilter} />
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
);

export default function Contratos() {
  const { token } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  const stats = useMemo(() => {
    return {
      total: contratos.length,
      activos: contratos.filter(c => c.estado === 'Activo').length,
      programados: contratos.filter(c => c.estado === 'Programado').length,
      vencidos: contratos.filter(c => c.estado === 'Vencido').length
    };
  }, [contratos]);

  const columns = [
    { name: 'Campaña', selector: row => row.nombre_campana, sortable: true, grow: 2, cell: row => (
        <Link to={`/contratos/${row.id}`} className="font-medium text-gray-900 hover:text-sky-600">{row.nombre_campana}</Link>
      ),
    },
    { name: 'Cliente / Documento', selector: row => row.nombre_cliente, sortable: true, grow: 2, cell: row => (
        <div>
          <div className="font-medium text-gray-900">{row.nombre_cliente}</div>
          <div className="mt-1 text-gray-500 font-mono text-xs">{row.numero_documento || 'N/A'}</div>
        </div>
      ),
    },
    { name: 'Plan', selector: row => row.nombre_plan, sortable: true, },
    { name: 'Estado', selector: row => row.estado, sortable: true, cell: row => <StatusBadge estado={row.estado} /> },
    { name: 'Fechas', selector: row => row.fecha_inicio, sortable: true, cell: row => (
        <div className='text-sm text-gray-500'>
          <div>Inicio: {row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : 'Pendiente'}</div>
          <div className="mt-1">Fin: {row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-PE') : 'Pendiente'}</div>
        </div>
      ),
    },
    { name: 'Acciones', button: true, cell: row => (
        <div className="flex items-center space-x-2">
          {row.pdf_url && (
            <a href={row.pdf_url} target="_blank" rel="noopener noreferrer" title="Descargar Contrato PDF" className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600">
              <HiOutlineDocumentDownload className="h-5 w-5" />
            </a>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!token) {
        setLoading(false);
        return;
    }
    const fetchContratos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contratos_admin', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) throw new Error('No tienes autorización.');
            throw new Error('Error del servidor.');
        }
        const data = await response.json();
        setContratos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContratos();
  }, [token]);

  const filteredItems = contratos.filter(item => {
    const searchText = filterText.toLowerCase();
    return (
        (item.nombre_campana && item.nombre_campana.toLowerCase().includes(searchText)) ||
        (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(searchText)) ||
        (item.numero_documento && item.numero_documento.includes(searchText))
    );
  });

  const subHeaderComponentMemo = useMemo(() => {
		return <FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} />;
	}, [filterText]);

  if (error) {
    return <div className="p-10 text-center text-red-500 font-semibold">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Gestión de Contratos</h1>
          <p className="mt-2 text-sm text-gray-600">Lista de los contratos publicitarios registrados.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
            <Link to="/contratos/nuevo" className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
                <HiPlus className="h-5 w-5" />
                <span>Crear Contrato</span>
            </Link>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Contratos" 
            count={stats.total}
            colorClass="bg-gray-500"
            icon={<HiCollection className="h-6 w-6 text-white" />} 
        />
        <StatCard 
            title="Activos" 
            count={stats.activos}
            colorClass="bg-green-500"
            icon={<HiCheckCircle className="h-6 w-6 text-white" />} 
        />
        <StatCard 
            title="Programados" 
            count={stats.programados}
            colorClass="bg-blue-500"
            icon={<HiClock className="h-6 w-6 text-white" />} 
        />
        <StatCard 
            title="Vencidos" 
            count={stats.vencidos}
            colorClass="bg-red-500"
            icon={<HiXCircle className="h-6 w-6 text-white" />} // <-- Corregido
        />
      </div>

      <div className="mt-8 border rounded-lg overflow-hidden shadow-sm">
        <DataTable 
            columns={columns} 
            data={filteredItems} 
            progressPending={loading}
            progressComponent={<div className="py-10 text-center">Cargando contratos...</div>}
            pagination 
            paginationPerPage={10} 
            paginationRowsPerPageOptions={[10, 25, 50]}
            responsive 
            highlightOnHover 
            pointerOnHover 
            striped
            subHeader 
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead 
            noDataComponent={<div className="py-10 text-center">No hay contratos para mostrar.</div>}
        />
      </div>
    </div>
  );
}