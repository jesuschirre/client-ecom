import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    HiPlus, 
    HiOutlineDocumentDownload, 
    HiSearch,
    HiCollection, 
    HiCheckCircle, 
    HiClock, 
    HiXCircle,
    HiPencil,
    HiUserCircle
} from 'react-icons/hi';
import DataTable from 'react-data-table-component';
import { useAuth } from '../context/AuthContext';

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

const StatusBadge = ({ estado }) => {
  const statusStyles = {
    Pendiente_Activacion: 'bg-yellow-100 text-yellow-800',
    Programado: 'bg-blue-100 text-blue-800',
    Activo: 'bg-green-100 text-green-800',
    Por_Vencer: 'bg-orange-100 text-orange-800',
    Vencido: 'bg-red-100 text-red-800',
    Cancelado: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[estado] || 'bg-gray-100'}`}>
      {estado ? estado.replace('_', ' ') : ''}
    </span>
  );
};

const LocutorStatusBadge = ({ estado }) => {
    if (!estado) {
        return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                No Asignado
            </span>
        );
    }
    const statusStyles = {
        Pendiente: 'bg-yellow-100 text-yellow-800',
        Aceptada: 'bg-green-100 text-green-800',
        Rechazada: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusStyles[estado] || 'bg-gray-100'}`}>
            <HiUserCircle />
            {estado}
        </span>
    );
};

const FilterComponent = ({ filterText, onFilter, statusFilter, onStatusFilter }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <div className="relative w-full sm:w-64">
            <input
                id="search"
                type="text"
                placeholder="Buscar por campaña, cliente o DNI/RUC..."
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm"
                value={filterText}
                onChange={onFilter}
            />
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
            {['Todos', 'Activo', 'Programado', 'Por_Vencer', 'Vencido'].map(status => (
                <button
                    key={status}
                    onClick={() => onStatusFilter(status)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        statusFilter === status
                            ? 'bg-sky-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {status === 'Todos' ? 'Todos' : status.replace('_', ' ')}
                </button>
            ))}
        </div>
    </div>
);

const getContratoEstado = (contrato, currentDate) => {
  const startDate = contrato.fecha_inicio ? new Date(contrato.fecha_inicio) : null;
  const endDate = contrato.fecha_fin ? new Date(contrato.fecha_fin) : null;
  if (startDate && isNaN(startDate.getTime())) return contrato.estado;
  if (endDate && isNaN(endDate.getTime())) return contrato.estado;
  if (contrato.estado === 'Cancelado') return 'Cancelado';
  if (contrato.estado === 'Pendiente_Activacion') return 'Pendiente_Activacion';
  if (startDate && currentDate < startDate) return 'Programado';
  if (endDate && currentDate > endDate) return 'Vencido';
  if (endDate && endDate.getTime() - currentDate.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Por_Vencer';
  if (startDate && endDate && currentDate >= startDate && currentDate <= endDate) return 'Activo';
  return contrato.estado;
};

export default function Contratos() {
  const { token } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const currentDate = new Date();

  const processedContratos = useMemo(() => {
    return contratos.map(contrato => ({
      ...contrato,
      estado: getContratoEstado(contrato, currentDate),
    }));
  }, [contratos]);

  const stats = useMemo(() => {
    return {
      total: processedContratos.length,
      activos: processedContratos.filter(c => c.estado === 'Activo').length,
      programados: processedContratos.filter(c => c.estado === 'Programado').length,
      vencidos: processedContratos.filter(c => c.estado === 'Vencido').length,
      porVencer: processedContratos.filter(c => c.estado === 'Por_Vencer').length,
    };
  }, [processedContratos]);

  const columns = [
    {
      name: 'Campaña',
      selector: row => row.nombre_campana,
      sortable: true,
      grow: 2,
      cell: row => (
        <Link to={`/contratos/${row.id}`} className="font-medium text-gray-900 hover:text-sky-600">
          {row.nombre_campana}
        </Link>
      ),
    },
    {
      name: 'Cliente / Documento',
      selector: row => row.nombre_cliente,
      sortable: true,
      grow: 2,
      cell: row => (
        <div>
          <div className="font-medium text-gray-900">{row.nombre_cliente}</div>
          <div className="mt-1 text-gray-500 font-mono text-xs">{row.numero_documento || 'N/A'}</div>
        </div>
      ),
    },
    { name: 'Plan', selector: row => row.nombre_plan, sortable: true },
    { name: 'Estado Contrato', selector: row => row.estado, sortable: true, cell: row => <StatusBadge estado={row.estado} /> },
    { 
      name: 'Estado Locutor', 
      selector: row => row.estado_locutor, 
      sortable: true, 
      cell: row => <LocutorStatusBadge estado={row.estado_locutor} /> 
    },
    {
      name: 'Fechas',
      selector: row => row.fecha_inicio,
      sortable: true,
      cell: row => (
        <div className="text-sm text-gray-500">
          <div>Inicio: {row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : 'Pendiente'}</div>
          <div className="mt-1">Fin: {row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-PE') : 'Pendiente'}</div>
        </div>
      ),
    },
    {
      name: 'Acciones',
      button: true,
      cell: row => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/contratos/${row.id}/editar`}
            title="Editar Contrato"
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-sky-600"
          >
            <HiPencil className="h-5 w-5" />
          </Link>
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
    if (!token) { setLoading(false); return; }
    const fetchContratos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contratos_admin', {
          headers: { Authorization: `Bearer ${token}` },
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

  const filteredItems = processedContratos.filter(item => {
    const searchText = filterText.toLowerCase();
    const matchesText =
      (item.nombre_campana && item.nombre_campana.toLowerCase().includes(searchText)) ||
      (item.nombre_cliente && item.nombre_cliente.toLowerCase().includes(searchText)) ||
      (item.numero_documento && item.numero_documento.includes(searchText));
    const matchesStatus = statusFilter === 'Todos' || item.estado === statusFilter;
    return matchesText && matchesStatus;
  });

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <FilterComponent
        onFilter={e => setFilterText(e.target.value)}
        filterText={filterText}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
      />
    );
  }, [filterText, statusFilter]);

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
          <Link
            to="/contratos/nuevo"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
          >
            <HiPlus className="h-5 w-5" />
            <span>Crear Contrato</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contratos" count={stats.total} colorClass="bg-gray-500" icon={<HiCollection className="h-6 w-6 text-white" />} />
        <StatCard title="Activos" count={stats.activos} colorClass="bg-green-500" icon={<HiCheckCircle className="h-6 w-6 text-white" />} />
        <StatCard title="Programados" count={stats.programados} colorClass="bg-blue-500" icon={<HiClock className="h-6 w-6 text-white" />} />
        <StatCard title="Vencidos" count={stats.vencidos} colorClass="bg-red-500" icon={<HiXCircle className="h-6 w-6 text-white" />} />
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