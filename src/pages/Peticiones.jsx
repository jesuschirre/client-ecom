import React, { useEffect, useState, useMemo } from "react";
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { HiCheck, HiX, HiSearch } from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";

const FilterComponent = ({ filterText, onFilter }) => (
  <div className="relative">
    <HiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    <input
      id="search"
      type="text"
      placeholder="Buscar por nombre o correo..."
      aria-label="Search Input"
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
      value={filterText}
      onChange={onFilter}
    />
  </div>
);

export default function Peticiones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const { token } = useAuth();

  const cargarSolicitudes = () => {
    if (!token) return;
    setLoading(true);
    fetch("http://localhost:3000/solicitudes/solicitudes-vendedor", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('No se pudo obtener la información. Verifica tus permisos.');
      return res.json();
    })
    .then(data => {
      setSolicitudes(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error al cargar solicitudes:", err);
      Swal.fire('Error', err.message, 'error');
      setLoading(false);
    });
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [token]);

  const aprobarSolicitud = async (id) => {
    setProcessingId(id);
    try {
      const res = await fetch("http://localhost:3000/solicitudes/solicitudes-vendedor/aceptar", {
        method: "POST", headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ solicitud_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en el servidor');
      Swal.fire({ title: '¡Aprobado!', text: data.message, icon: 'success', timer: 2500, showConfirmButton: false });
      cargarSolicitudes(); 
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const rechazarSolicitud = async (id) => {
    const { value: motivo } = await Swal.fire({
      title: 'Motivo del Rechazo', input: 'textarea',
      inputPlaceholder: 'Explica por qué la solicitud fue rechazada...',
      inputValidator: (value) => !value && '¡Necesitas escribir un motivo!',
      showCancelButton: true, confirmButtonText: 'Rechazar Solicitud',
      confirmButtonColor: '#d33', cancelButtonText: 'Cancelar'
    });
    if (motivo) {
      setProcessingId(id);
      try {
        const res = await fetch("http://localhost:3000/solicitudes/solicitudes-vendedor/rechazar", {
          method: "POST", headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ solicitud_id: id, motivo: motivo }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error en el servidor');
        Swal.fire({ title: '¡Rechazado!', text: data.message, icon: 'success', timer: 2500, showConfirmButton: false });
        cargarSolicitudes();
      } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const columns = useMemo(() => [
    { name: 'Usuario', selector: row => row.nombre, sortable: true, wrap: true },
    { name: 'Correo', selector: row => row.correo, sortable: true, wrap: true },
    { name: 'Monto', selector: row => `S/ ${Number(row.monto).toFixed(2)}`, sortable: true },
    {
      name: 'Comprobante',
      selector: row => <a href={row.comprobante_pago} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 font-semibold">Ver</a>,
    },
    {
      name: 'Estado',
      selector: row => row.estado,
      sortable: true,
      cell: row => {
        const statusClasses = {
          pendiente: 'bg-yellow-100 text-yellow-800',
          aprobada: 'bg-green-100 text-green-800',
          rechazada: 'bg-red-100 text-red-800'
        };
        return <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusClasses[row.estado] || 'bg-gray-100 text-gray-800'}`}>{row.estado}</span>;
      },
    },
    { name: 'Fecha', selector: row => new Date(row.fecha_solicitud).toLocaleDateString(), sortable: true },
    {
      name: 'Acciones',
      cell: row => row.estado === 'pendiente' ? (
        <div className="flex gap-2">
          <button onClick={() => aprobarSolicitud(row.id)} disabled={processingId === row.id} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50">
            {processingId === row.id ? <CgSpinner className="animate-spin" /> : <HiCheck size={20} />}
          </button>
          <button onClick={() => rechazarSolicitud(row.id)} disabled={processingId === row.id} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50">
            {processingId === row.id ? <CgSpinner className="animate-spin" /> : <HiX size={20} />}
          </button>
        </div>
      ) : <span className="text-gray-500 text-sm italic">Procesada</span>,
      ignoreRowClick: true, // <-- CORRECCIÓN APLICADA AQUÍ
    },
  ], [processingId]);

  const filteredSolicitudes = solicitudes.filter(item =>
    item.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
    item.correo.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    return <FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} />;
  }, [filterText]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-full">
      <div className="pb-6 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Gestión de Solicitudes</h2>
        <p className="mt-2 text-sm text-gray-600">Revisa, aprueba o rechaza las solicitudes para convertirse en vendedor.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <DataTable
          columns={columns}
          data={filteredSolicitudes}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          progressPending={loading}
          progressComponent={<div className="py-10 flex justify-center items-center"><CgSpinner className="animate-spin h-8 w-8 text-sky-600" /></div>}
          noDataComponent={<div className="py-10 text-center text-gray-500">No hay solicitudes para mostrar.</div>}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
}