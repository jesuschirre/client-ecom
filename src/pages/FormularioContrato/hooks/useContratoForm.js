import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const useContratoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const { token } = useAuth();

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [tipoCliente, setTipoCliente] = useState('existente');
    const [formData, setFormData] = useState({
        cliente_id: '', nuevo_cliente_nombre: '', nuevo_cliente_email: '', nuevo_cliente_tipo_doc: '',
        nuevo_cliente_num_doc: '', nuevo_cliente_direccion: '', plan_id: null, nombre_campana: '',
        fecha_inicio: '', fecha_fin: '', monto_acordado: '', detalles_anuncio: '', precio_base: '', descuento: '',
    });
    const [diasEmision, setDiasEmision] = useState({
        lunes: true, martes: true, miercoles: true, jueves: true, viernes: true, sabado: false, domingo: false,
    });
    const [clientes, setClientes] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultado, setResultado] = useState(null);
    const [numeroDoc, setNumeroDoc] = useState('');
    const [buscandoDoc, setBuscandoDoc] = useState(false);
    const [docError, setDocError] = useState('');
    const [duracionTipo, setDuracionTipo] = useState('meses');
    const [duracionValor, setDuracionValor] = useState('');
    const [stockInfo, setStockInfo] = useState([]);
    const [loadingStock, setLoadingStock] = useState(false);

    const isStepValid = useMemo(() => {
        switch (step) {
            case 1: return tipoCliente === 'existente' ? !!formData.cliente_id : (!!formData.nuevo_cliente_nombre && !!formData.nuevo_cliente_email);
            case 2: return !!formData.plan_id;
            case 3: return !!formData.fecha_inicio && !!formData.fecha_fin;
            case 4: return !!formData.nombre_campana && !!formData.monto_acordado;
            default: return false;
        }
    }, [step, formData, tipoCliente]);

    const nextStep = () => { if (isStepValid) setStep(prev => Math.min(prev + 1, totalSteps)); };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
    const goToStep = (stepNumber) => { if (stepNumber < step) setStep(stepNumber); };

    const { diasTotales, diasEmisionActivos, precioCalculado } = useMemo(() => {
        const { fecha_inicio, fecha_fin, plan_id, descuento } = formData;
        if (!fecha_inicio || !fecha_fin || !plan_id) return { diasTotales: 0, diasEmisionActivos: 0, precioCalculado: 0 };
        const inicio = new Date(fecha_inicio + 'T00:00:00');
        const fin = new Date(fecha_fin + 'T00:00:00');
        if (fin < inicio) return { diasTotales: 0, diasEmisionActivos: 0, precioCalculado: 0 };
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const dayMap = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
        let activeEmissionDays = 0;
        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
            const dayName = Object.keys(dayMap).find(key => dayMap[key] === d.getDay());
            if (dayName && diasEmision[dayName]) {
                activeEmissionDays++;
            }
        }
        const planSeleccionado = planes.find(p => p.id === parseInt(plan_id, 10));
        if (!planSeleccionado) return { diasTotales: diffDays, diasEmisionActivos: activeEmissionDays, precioCalculado: 0 };
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

    const planSeleccionado = useMemo(() => planes.find(p => p.id === parseInt(formData.plan_id, 10)), [formData.plan_id, planes]);
    
    const clienteOptions = useMemo(() => 
        clientes.map(cliente => ({
            value: cliente.id,
            label: `${cliente.nombre} (${cliente.correo})`
        })), 
    [clientes]);

    const handleClienteChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, cliente_id: selectedOption ? selectedOption.value : '' }));
    };

    useEffect(() => {
        if (!isEditing && precioCalculado > 0 && formData.plan_id) {
            setFormData(prev => ({ ...prev, monto_acordado: precioCalculado }));
        }
    }, [precioCalculado, formData.plan_id, isEditing]);

    useEffect(() => {
        if (duracionValor && duracionTipo && formData.plan_id) {
            const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio + 'T00:00:00') : new Date(new Date().setHours(0, 0, 0, 0));
            let fechaFin = new Date(fechaInicio);
            if (duracionTipo === 'meses') {
                fechaFin.setMonth(fechaInicio.getMonth() + parseInt(duracionValor, 10));
                fechaFin.setDate(fechaFin.getDate() - 1);
            } else if (duracionTipo === 'dias') {
                fechaFin.setDate(fechaInicio.getDate() + parseInt(duracionValor, 10) - 1);
            }
            const formatDate = date => date.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, fecha_inicio: formData.fecha_inicio || formatDate(fechaInicio), fecha_fin: formatDate(fechaFin) }));
        }
    }, [duracionValor, duracionTipo, formData.plan_id]);

    useEffect(() => {
        const fetchStock = async () => {
            if (!formData.fecha_inicio || !formData.fecha_fin || !planSeleccionado) {
                setStockInfo([]);
                return;
            }
            setLoadingStock(true);
            try {
                const url = `http://localhost:3000/api/stock_admin/disponibilidad?fecha_inicio=${formData.fecha_inicio}&fecha_fin=${formData.fecha_fin}`;
                const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                if (!response.ok) throw new Error('No se pudo cargar la disponibilidad de stock.');
                const data = await response.json();
                setStockInfo(data);
            } catch (err) {
                console.error("Error al buscar stock:", err);
                setStockInfo([]);
            } finally {
                setLoadingStock(false);
            }
        };
        const timer = setTimeout(() => fetchStock(), 500);
        return () => clearTimeout(timer);
    }, [formData.fecha_inicio, formData.fecha_fin, planSeleccionado, token]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                const [clientesRes, planesRes] = await Promise.all([
                    fetch('http://localhost:3000/api/clientes_admin', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:3000/api/planes_admin', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                if (!clientesRes.ok || !planesRes.ok) throw new Error(`Error en las respuestas de la API.`);
                const clientesData = await clientesRes.json();
                const planesData = await planesRes.json();
                setClientes(clientesData);
                setPlanes(planesData);

                if (isEditing && id) {
                    const contratoRes = await fetch(`http://localhost:3000/api/contratos_admin/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!contratoRes.ok) throw new Error("No se pudo cargar el contrato para editar.");
                    const data = await contratoRes.json();
                    
                    setFormData(prev => ({
                        ...prev,
                        cliente_id: data.cliente_id,
                        plan_id: data.plan_id,
                        nombre_campana: data.nombre_campana,
                        fecha_inicio: data.fecha_inicio ? data.fecha_inicio.split('T')[0] : '',
                        fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
                        monto_acordado: data.monto_acordado,
                        detalles_anuncio: data.detalles_anuncio,
                        precio_base: data.precio_base,
                        descuento: data.descuento
                    }));

                    const newDiasEmision = { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false };
                    if (Array.isArray(data.dias_emision)) {
                        data.dias_emision.forEach(dia => {
                            if (dia in newDiasEmision) {
                                newDiasEmision[dia] = true;
                            }
                        });
                    }
                    setDiasEmision(newDiasEmision);
                    if (data.cliente_id) {
                        setTipoCliente('existente');
                    }
                }
            } catch (err) {
                setError('Error al cargar datos necesarios.');
                console.error("Detalle del error de carga:", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchInitialData();
    }, [id, isEditing, token]);
    
    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDiasChange = dia => setDiasEmision(prev => ({ ...prev, [dia]: !prev[dia] }));
    const handleSelectPlan = planId => {
        const selectedPlan = planes.find(p => p.id === planId);
        setFormData(prev => ({ ...prev, plan_id: planId, precio_base: selectedPlan ? selectedPlan.precio : '' }));
    };
    const handleBuscarDocumento = async () => {
        if (numeroDoc.trim().length !== 8 && numeroDoc.trim().length !== 11) {
            setDocError('Ingrese un DNI (8 dígitos) o RUC (11 dígitos) válido.');
            return;
        }
        setBuscandoDoc(true);
        setDocError('');
        try {
            const response = await fetch(`http://localhost:3000/api/consultas_admin/documento/${numeroDoc}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');
            setFormData(prev => ({ ...prev, nuevo_cliente_nombre: data.nombreCompleto, nuevo_cliente_num_doc: data.documento, nuevo_cliente_tipo_doc: data.tipo, nuevo_cliente_direccion: data.direccion || '' }));
        } catch (err) {
            setDocError(err.message);
        } finally {
            setBuscandoDoc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isStepValid) {
            setError("Por favor, complete todos los campos requeridos en el paso final.");
            return;
        }

        setLoading(true);
        setError('');

        const url = isEditing
            ? `http://localhost:3000/api/contratos_admin/${id}`
            : 'http://localhost:3000/api/contratos_admin';
        
        const method = isEditing ? 'PUT' : 'POST';

        const diasSeleccionados = Object.keys(diasEmision).filter(dia => diasEmision[dia]);

        let payload = {
            ...formData,
            dias_emision: diasSeleccionados,
        };
        
        if (!isEditing && tipoCliente === 'existente') {
            delete payload.nuevo_cliente_nombre;
            delete payload.nuevo_cliente_email;
            delete payload.nuevo_cliente_tipo_doc;
            delete payload.nuevo_cliente_num_doc;
            delete payload.nuevo_cliente_direccion;
        } else if (!isEditing && tipoCliente === 'nuevo') {
            delete payload.cliente_id;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo guardar el contrato.');
            
            if (isEditing) {
                navigate('/contratos');
            } else {
                setResultado({ message: data.message, pdfUrl: data.pdfUrl });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        isEditing, navigate,
        wizard: { step, totalSteps, nextStep, prevStep, goToStep, isStepValid },
        states: {
            tipoCliente, formData, diasEmision, clientes, planes, loading, error, resultado,
            numeroDoc, buscandoDoc, docError, duracionTipo, duracionValor, stockInfo, loadingStock,
        },
        setters: {
            setTipoCliente, setFormData, setDiasEmision, setNumeroDoc, setDuracionTipo, setDuracionValor,
        },
        handlers: {
            handleChange, handleDiasChange, handleSelectPlan, handleBuscarDocumento, handleSubmit,
            handleClienteChange
        },
        computed: {
            diasTotales, diasEmisionActivos, precioCalculado, planSeleccionado,
            clienteOptions
        },
    };
};