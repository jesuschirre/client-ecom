import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiSave, HiUser, HiPlus, HiPrinter, HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext'; // Asegúrate que la ruta a tu AuthContext sea correcta

export default function FormularioContrato() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token } = useAuth(); // Obtenemos el token del contexto de autenticación

  const [tipoCliente, setTipoCliente] = useState('existente');

  const [formData, setFormData] = useState({
    cliente_id: '',
    nuevo_cliente_nombre: '',
    nuevo_cliente_email: '',
    plan_id: '',
    nombre_campana: '',
    fecha_inicio: '',
    fecha_fin: '',
    monto_acordado: '',
    detalles_anuncio: '',
  });

  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const fetchDataForSelects = async () => {
      try {
        const [clientesRes, planesRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` } // También se necesita token para obtener usuarios
          }),
          fetch('http://localhost:3000/api/planes'),
        ]);

        if (!clientesRes.ok) throw new Error('No se pudo cargar la lista de clientes.');
        if (!planesRes.ok) throw new Error('No se pudo cargar la lista de planes.');
        
        const clientesData = await clientesRes.json();
        const planesData = await planesRes.json();
        
        setClientes(clientesData.filter(u => u.rol !== 'admin'));
        setPlanes(planesData);
      } catch (err) {
        setError('Error al cargar datos necesarios para el formulario.');
        console.error(err);
      }
    };
    fetchDataForSelects();
  }, [token]); // Añadimos token a las dependencias por si cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let payload = { ...formData };
    if (tipoCliente === 'existente') {
      delete payload.nuevo_cliente_nombre;
      delete payload.nuevo_cliente_email;
    } else {
      delete payload.cliente_id;
    }

    try {
      const response = await fetch('http://localhost:3000/api/contratos_admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // LA CORRECCIÓN CLAVE
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('No tienes autorización para realizar esta acción.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el contrato.');
      }
      
      setResultado({
        message: data.message,
        pdfUrl: data.pdfUrl
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (resultado) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center flex items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="max-w-md w-full">
          <HiSave className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">¡Éxito!</h2>
          <p className="mt-2 text-lg text-gray-600">{resultado.message}</p>
          <p className="mt-1 text-base text-gray-500">Se ha enviado una copia del contrato al correo del cliente.</p>
          <div className="mt-8 flex flex-col gap-4">
            <a 
              href={resultado.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
            >
              <HiPrinter className="h-6 w-6" />
              Ver / Imprimir Contrato (PDF)
            </a>
            <button 
              onClick={() => navigate('/contratos')} 
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
            >
               <HiArrowLeft className="h-5 w-5" />
              Volver a la Lista de Contratos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {isEditing ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-900 mb-3">Cliente</label>
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => setTipoCliente('existente')} className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${tipoCliente === 'existente' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                <HiUser /> Cliente Existente
              </button>
              <button type="button" onClick={() => setTipoCliente('nuevo')} className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${tipoCliente === 'nuevo' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                <HiPlus /> Crear Nuevo Cliente
              </button>
            </div>
            {tipoCliente === 'existente' ? (
              <div>
                <select id="cliente_id" name="cliente_id" value={formData.cliente_id} onChange={handleChange} required={tipoCliente === 'existente'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="">Seleccione un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre} ({cliente.correo})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" name="nuevo_cliente_nombre" placeholder="Nombre completo del nuevo cliente" value={formData.nuevo_cliente_nombre} onChange={handleChange} required={tipoCliente === 'nuevo'} className="block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="email" name="nuevo_cliente_email" placeholder="Correo electrónico del nuevo cliente" value={formData.nuevo_cliente_email} onChange={handleChange} required={tipoCliente === 'nuevo'} className="block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700">Plan</label>
            <select id="plan_id" name="plan_id" value={formData.plan_id} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">Seleccione un plan</option>
              {planes.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.nombre} - S/{plan.precio}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nombre_campana" className="block text-sm font-medium text-gray-700">Nombre de la Campaña</label>
            <input type="text" id="nombre_campana" name="nombre_campana" value={formData.nombre_campana} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input type="date" id="fecha_inicio" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">Fecha de Finalización</label>
              <input type="date" id="fecha_fin" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="monto_acordado" className="block text-sm font-medium text-gray-700">Monto Acordado (S/)</label>
            <input type="number" step="0.01" id="monto_acordado" name="monto_acordado" value={formData.monto_acordado} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="detalles_anuncio" className="block text-sm font-medium text-gray-700">Detalles del Anuncio y Guion</label>
            <textarea id="detalles_anuncio" name="detalles_anuncio" rows={5} value={formData.detalles_anuncio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        
        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50">
            <HiSave className="h-5 w-5" />
            <span>{loading ? 'Guardando...' : 'Guardar y Generar Contrato'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}