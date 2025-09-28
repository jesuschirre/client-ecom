import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiSave, HiUser, HiPlus, HiPrinter, HiArrowLeft, HiSearch, 
  HiOfficeBuilding, HiMail, HiCheckCircle, HiCalendar, HiCash, 
  HiSparkles, HiSun, HiMoon 
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

// --- REUSABLE COMPONENTS ---
const FieldGroup = ({ title, children }) => (
  <div className="bg-white p-6 shadow-sm rounded-lg border">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">{title}</h3>
    {children}
  </div>
);

const PlanCardSelector = ({ planes, selectedPlanId, onSelectPlan }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
    {planes.map(plan => {
      const isSelected = plan.id === selectedPlanId;
      return (
        <div 
          key={plan.id}
          onClick={() => onSelectPlan(plan.id)}
          className={`
            relative border rounded-lg p-5 cursor-pointer transition-all duration-200 transform
            ${isSelected ? 'border-sky-500 ring-2 ring-sky-500 shadow-lg scale-105' : 'border-gray-300 hover:border-sky-400 hover:shadow-md'}
          `}
        >
          {plan.destacado && !isSelected && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full z-10">Popular</div>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full p-1 z-10">
              <HiCheckCircle className="h-4 w-4" />
            </div>
          )}
          <h4 className="text-lg font-bold text-gray-800">{plan.nombre}</h4>
          <p className="text-2xl font-extrabold my-2">S/{parseFloat(plan.precio).toFixed(2)} <span className="text-sm font-normal text-gray-500">{plan.periodo}</span></p>
          <ul className="text-xs text-gray-600 space-y-2 mt-4">
            {plan.caracteristicas.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1 flex-shrink-0">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);

// --- MAIN COMPONENT ---
export default function FormularioContrato() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token } = useAuth();

  const [tipoCliente, setTipoCliente] = useState('existente');
  const [formData, setFormData] = useState({
    cliente_id: '',
    nuevo_cliente_nombre: '',
    nuevo_cliente_email: '',
    nuevo_cliente_tipo_doc: '',
    nuevo_cliente_num_doc: '',
    nuevo_cliente_direccion: '',
    plan_id: null,
    nombre_campana: '',
    fecha_inicio: '',
    fecha_fin: '',
    monto_acordado: '',
    detalles_anuncio: '',
    precio_base: '',
    descuento: '',
  });
  
  const [diasEmision, setDiasEmision] = useState({
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: false,
    domingo: false,
  });

  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [numeroDoc, setNumeroDoc] = useState('');
  const [buscandoDoc, setBuscandoDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const [duracionTipo, setDuracionTipo] = useState('meses');
  const [duracionValor, setDuracionValor] = useState('');

  const { diasTotales, diasEmisionActivos, precioCalculado } = useMemo(() => {
    const { fecha_inicio, fecha_fin, plan_id, descuento } = formData;
    if (!fecha_inicio || !fecha_fin || !plan_id) {
      return { diasTotales: 0, diasEmisionActivos: 0, precioCalculado: 0 };
    }

    const inicio = new Date(fecha_inicio + 'T00:00:00');
    const fin = new Date(fecha_fin + 'T00:00:00');
    if (fin < inicio) {
      return { diasTotales: 0, diasEmisionActivos: 0, precioCalculado: 0 };
    }

    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calculate active emission days
    const dayMap = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sabado: 6,
    };
    let activeEmissionDays = 0;
    const currentDate = new Date(inicio);
    while (currentDate <= fin) {
      const dayOfWeek = currentDate.getDay();
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
      if (dayName && diasEmision[dayName]) {
        activeEmissionDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const planSeleccionado = planes.find(p => p.id === parseInt(plan_id, 10));
    if (!planSeleccionado) {
      return { diasTotales: diffDays, diasEmisionActivos: activeEmissionDays, precioCalculado: 0 };
    }

    const precioPorMes = parseFloat(planSeleccionado.precio);
    const precioPorDia = precioPorMes / 30;
    const precioTotal = precioPorDia * activeEmissionDays;
    const precioFinal = precioTotal - (parseFloat(descuento) || 0);

    return {
      diasTotales: diffDays,
      diasEmisionActivos: activeEmissionDays,
      precioCalculado: precioFinal > 0 ? precioFinal.toFixed(2) : '0.00',
    };
  }, [formData.fecha_inicio, formData.fecha_fin, formData.plan_id, formData.descuento, planes, diasEmision]);

  useEffect(() => {
    if (precioCalculado > 0 && formData.plan_id) {
      setFormData(prev => ({ ...prev, monto_acordado: precioCalculado }));
    }
  }, [precioCalculado, formData.plan_id]);

  useEffect(() => {
    if (duracionValor && formData.plan_id) {
      const today = new Date();
      const fechaInicio = formData.fecha_inicio 
        ? new Date(formData.fecha_inicio + 'T00:00:00')
        : new Date(today.setHours(0, 0, 0, 0));

      let fechaFin;
      if (duracionTipo === 'meses') {
        const meses = parseInt(duracionValor, 10);
        if (meses > 0) {
          fechaFin = new Date(fechaInicio);
          fechaFin.setMonth(fechaInicio.getMonth() + meses);
          fechaFin.setDate(fechaFin.getDate() - 1);
        }
      } else if (duracionTipo === 'dias') {
        const dias = parseInt(duracionValor, 10);
        if (dias > 0) {
          fechaFin = new Date(fechaInicio);
          fechaFin.setDate(fechaInicio.getDate() + dias - 1);
        }
      }

      if (fechaFin) {
        const formatDate = date => date.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          fecha_inicio: formData.fecha_inicio || formatDate(fechaInicio),
          fecha_fin: formatDate(fechaFin),
        }));
      }
    }
  }, [duracionValor, duracionTipo, formData.plan_id]);

  useEffect(() => {
    const fetchDataForSelects = async () => {
      try {
        const [clientesRes, planesRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/usuarios', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/api/planes_admin', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!clientesRes.ok) throw new Error('No se pudo cargar la lista de clientes.');
        if (!planesRes.ok) throw new Error('No se pudo cargar la lista de planes.');
        const clientesData = await clientesRes.json();
        const planesData = await planesRes.json();
        setClientes(clientesData.filter(u => u.rol !== 'admin'));
        setPlanes(planesData);
      } catch (err) {
        setError('Error al cargar datos necesarios.');
        console.error(err);
      }
    };
    if (token) fetchDataForSelects();
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiasChange = dia => {
    setDiasEmision(prev => ({ ...prev, [dia]: !prev[dia] }));
  };

  const handleSelectPlan = planId => {
    const selectedPlan = planes.find(p => p.id === planId);
    setFormData(prev => ({
      ...prev,
      plan_id: planId,
      precio_base: selectedPlan ? selectedPlan.precio : '',
    }));
  };

  const handleBuscarDocumento = async () => {
    if (numeroDoc.trim().length !== 8 && numeroDoc.trim().length !== 11) {
      setDocError('Ingrese un DNI (8 dígitos) o RUC (11 dígitos) válido.');
      return;
    }
    setBuscandoDoc(true);
    setDocError('');
    try {
      const response = await fetch(`http://localhost:3000/api/consultas_admin/documento/${numeroDoc}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');
      setFormData(prev => ({
        ...prev,
        nuevo_cliente_nombre: data.nombreCompleto,
        nuevo_cliente_num_doc: data.documento,
        nuevo_cliente_tipo_doc: data.tipo,
        nuevo_cliente_direccion: data.direccion || '',
      }));
    } catch (err) {
      setDocError(err.message);
    } finally {
      setBuscandoDoc(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const diasSeleccionados = Object.keys(diasEmision).filter(dia => diasEmision[dia]);
    if (diasSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un día de emisión.');
      setLoading(false);
      return;
    }
    if (!formData.plan_id) {
      setError('Por favor, seleccione un plan antes de guardar.');
      setLoading(false);
      return;
    }
    let payload = { 
      ...formData,
      dias_emision: diasSeleccionados,
    };
    if (tipoCliente === 'existente') {
      delete payload.nuevo_cliente_nombre;
      delete payload.nuevo_cliente_email;
      delete payload.nuevo_cliente_tipo_doc;
      delete payload.nuevo_cliente_num_doc;
      delete payload.nuevo_cliente_direccion;
    } else {
      delete payload.cliente_id;
    }
    try {
      const response = await fetch('http://localhost:3000/api/contratos_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 401 || response.status === 403) throw new Error('No tienes autorización.');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo crear el contrato.');
      setResultado({ message: data.message, pdfUrl: data.pdfUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener el plan seleccionado para el resumen
  const planSeleccionado = planes.find(p => p.id === parseInt(formData.plan_id, 10));

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
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-500"
            >
              <HiPrinter className="h-6 w-6" /> Ver / Imprimir Contrato (PDF)
            </a>
            <button
              onClick={() => navigate('/contratos')}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              <HiArrowLeft className="h-5 w-5" /> Volver a la Lista de Contratos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/75 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Formulario */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEditing ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
          </h1>
          <p className="mt-2 text-gray-600">Complete la información para registrar un nuevo acuerdo comercial.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <FieldGroup title="1. Datos del Cliente">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <div className="flex gap-1 mb-4 border border-gray-200 rounded-lg p-1 bg-gray-100">
                    <button
                      type="button"
                      onClick={() => setTipoCliente('existente')}
                      className={`w-full justify-center px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
                        tipoCliente === 'existente' ? 'bg-white text-sky-700 shadow' : 'text-gray-600 hover:bg-white/60'
                      }`}
                    >
                      <HiUser /> Cliente Existente
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoCliente('nuevo')}
                      className={`w-full justify-center px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
                        tipoCliente === 'nuevo' ? 'bg-white text-sky-700 shadow' : 'text-gray-600 hover:bg-white/60'
                      }`}
                    >
                      <HiPlus /> Crear Nuevo Cliente
                    </button>
                  </div>
                  {tipoCliente === 'existente' ? (
                    <div className="md:col-span-2">
                      <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Cliente
                      </label>
                      <select
                        id="cliente_id"
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleChange}
                        required={tipoCliente === 'existente'}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                      >
                        <option value="">Seleccione un cliente de la lista...</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} ({cliente.correo})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4 border-t">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Buscar por DNI / RUC</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={numeroDoc}
                            onChange={e => setNumeroDoc(e.target.value)}
                            placeholder="Ingrese DNI o RUC"
                            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                          />
                          <button
                            type="button"
                            onClick={handleBuscarDocumento}
                            disabled={buscandoDoc}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-600 text-white shadow-sm hover:bg-gray-700 disabled:opacity-50"
                          >
                            <HiSearch /> <span>{buscandoDoc ? '...' : 'Buscar'}</span>
                          </button>
                        </div>
                        {docError && <p className="text-xs text-red-600 mt-1">{docError}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <HiUser /> Nombre / Razón Social
                        </label>
                        <input
                          type="text"
                          id="nuevo_cliente_nombre"
                          name="nuevo_cliente_nombre"
                          placeholder="(Se autocompleta)"
                          value={formData.nuevo_cliente_nombre}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_direccion" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <HiOfficeBuilding /> Dirección Fiscal
                        </label>
                        <input
                          type="text"
                          id="nuevo_cliente_direccion"
                          name="nuevo_cliente_direccion"
                          placeholder="(Opcional para DNI, se autocompleta para RUC)"
                          value={formData.nuevo_cliente_direccion}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <HiMail /> Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="nuevo_cliente_email"
                          name="nuevo_cliente_email"
                          placeholder="contacto@empresa.com"
                          value={formData.nuevo_cliente_email}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FieldGroup>

            <FieldGroup title="2. Seleccione un Plan">
              <div className="md:col-span-2">
                <PlanCardSelector
                  planes={planes}
                  selectedPlanId={formData.plan_id}
                  onSelectPlan={handleSelectPlan}
                />
              </div>
            </FieldGroup>

            <FieldGroup title="3. Programación y Cálculo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración del Contrato (Rápido)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={duracionValor}
                      onChange={e => setDuracionValor(e.target.value)}
                      placeholder="Ej: 3"
                      className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    />
                    <select
                      value={duracionTipo}
                      onChange={e => setDuracionTipo(e.target.value)}
                      className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    >
                      <option value="meses">Meses</option>
                      <option value="dias">Días</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ingrese la duración para autocompletar las fechas. Use los campos de abajo para fechas específicas.</p>
                </div>
                <div>
                  <label htmlFor="fecha_inicio" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HiCalendar /> Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="fecha_fin" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HiCalendar /> Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Días de Emisión</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(diasEmision).map(dia => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => handleDiasChange(dia)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                          diasEmision[dia] ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setDiasEmision({
                          ...diasEmision,
                          lunes: !diasEmision.lunes,
                          martes: !diasEmision.martes,
                          miercoles: !diasEmision.miercoles,
                          jueves: !diasEmision.jueves,
                          viernes: !diasEmision.viernes,
                        })
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                        diasEmision.lunes && diasEmision.martes && diasEmision.miercoles && diasEmision.jueves && diasEmision.viernes
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <HiSun className="inline mr-1" /> Lunes a Viernes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDiasEmision({
                          ...diasEmision,
                          sabado: !diasEmision.sabado,
                          domingo: !diasEmision.domingo,
                        })
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                        diasEmision.sabado && diasEmision.domingo ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <HiMoon className="inline mr-1" /> Fin de Semana
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">El precio se calcula según los días de emisión seleccionados.</p>
                </div>
                <hr className="md:col-span-2" />
                <div>
                  <label htmlFor="descuento" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HiCash /> Descuento (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="descuento"
                    name="descuento"
                    value={formData.descuento || ''}
                    onChange={handleChange}
                    placeholder="Ej: 20.00"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Duración Total</p>
                  <p className="text-2xl font-bold text-sky-700">{diasTotales} días</p>
                  <p className="text-sm text-gray-600 mt-2">Días de Emisión Activos</p>
                  <p className="text-lg font-semibold text-sky-700">{diasEmisionActivos} días</p>
                </div>
              </div>
            </FieldGroup>

            <FieldGroup title="4. Detalles Finales del Contrato">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label htmlFor="nombre_campana" className="block text-sm font-medium text-gray-700">Nombre de la Campaña</label>
                  <input
                    type="text"
                    id="nombre_campana"
                    name="nombre_campana"
                    value={formData.nombre_campana}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="monto_acordado" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <HiSparkles /> Monto Final Acordado (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="monto_acordado"
                    name="monto_acordado"
                    value={formData.monto_acordado}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Precio calculado: S/{precioCalculado}. Puedes ajustar el monto.</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="detalles_anuncio" className="block text-sm font-medium text-gray-700">Detalles del Anuncio y Guion</label>
                  <textarea
                    id="detalles_anuncio"
                    name="detalles_anuncio"
                    rows={4}
                    value={formData.detalles_anuncio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
            </FieldGroup>

            {error && <p className="text-sm text-red-600 text-center font-semibold py-4">{error}</p>}

            <div className="flex justify-end pt-5 border-t">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                <HiSave className="h-5 w-5" />
                <span>{loading ? 'Guardando...' : 'Guardar y Generar Contrato'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar de Resumen */}
        <div className="w-full lg:w-1/3 lg:fixed lg:right-8 lg:top-8 lg:max-w-sm">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Resumen del Contrato</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Plan Seleccionado</p>
                <p className="text-base font-semibold text-gray-900">
                  {planSeleccionado ? planSeleccionado.nombre : 'No seleccionado'}
                </p>
                {planSeleccionado && (
                  <p className="text-sm text-gray-500">S/{parseFloat(planSeleccionado.precio).toFixed(2)} {planSeleccionado.periodo}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Fechas</p>
                <p className="text-base font-semibold text-gray-900">
                  {formData.fecha_inicio && formData.fecha_fin
                    ? `${formData.fecha_inicio} al ${formData.fecha_fin}`
                    : 'No especificadas'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duración Total</p>
                <p className="text-base font-semibold text-gray-900">{diasTotales} días</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Días de Emisión Activos</p>
                <p className="text-base font-semibold text-gray-900">{diasEmisionActivos} días</p>
                <p className="text-xs text-gray-500">
                  {Object.keys(diasEmision)
                    .filter(dia => diasEmision[dia])
                    .map(dia => dia.charAt(0).toUpperCase() + dia.slice(1))
                    .join(', ') || 'Ninguno'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Descuento</p>
                <p className="text-base font-semibold text-gray-900">S/{formData.descuento || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio Calculado</p>
                <p className="text-base font-semibold text-gray-900">S/{precioCalculado}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Final Acordado</p>
                <p className="text-lg font-bold text-sky-700">S/{formData.monto_acordado || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}