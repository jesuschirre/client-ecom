import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Reutilizamos el componente StatusBadge
const StatusBadge = ({ estado }) => {
    // ... (puedes copiar el mismo componente del archivo Contratos.jsx)
    const statusStyles = {
    Pendiente_Activacion: 'bg-yellow-100 text-yellow-800',
    Programado: 'bg-blue-100 text-blue-800',
    Activo: 'bg-green-100 text-green-800',
    Por_Vencer: 'bg-orange-100 text-orange-800',
    Vencido: 'bg-red-100 text-red-800',
    Cancelado: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[estado] || 'bg-gray-100 text-gray-800'}`}>
      {estado.replace('_', ' ')}
    </span>
  );
};

// Panel de activación que se mostrará condicionalmente
const PanelDeActivacion = ({ contratoId, onActivacionExitosa }) => {
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

    const handleActivate = async (fechaInicio) => {
        try {
            const response = await fetch(`http://localhost:3000/api/contratos_admin/${contratoId}/activar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha_inicio: fechaInicio }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al activar');
            alert(data.message); // O una notificación más elegante
            onActivacionExitosa(); // Llama a la función para recargar los datos
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 10);
    };

    return (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 my-6">
            <h3 className="text-lg font-semibold text-sky-800">Activar Campaña</h3>
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <button onClick={() => handleActivate(new Date().toISOString().slice(0, 10))} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">▶️ Iniciar Hoy</button>
                <button onClick={() => handleActivate(getTomorrow())} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">▶️ Iniciar Mañana</button>
                <div className="flex items-center gap-2">
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border-gray-300 rounded-md shadow-sm"/>
                    <button onClick={() => handleActivate(fecha)} className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800">✔️ Programar</button>
                </div>
            </div>
        </div>
    );
};


export default function DetalleContrato() {
  const { id } = useParams(); // Obtiene el :id de la URL
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContrato = async () => {
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:3000/api/contratos_admin/${id}`);
        if (!response.ok) throw new Error('Contrato no encontrado.');
        const data = await response.json();
        setContrato(data);
    } catch (err) {
        console.error(err);
        navigate('/contratos'); // Redirige si hay error
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchContrato();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Cargando detalles del contrato...</div>;
  if (!contrato) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{contrato.nombre_campana}</h1>
        <div className="mt-2">
            <StatusBadge estado={contrato.estado} />
        </div>

        {contrato.estado === 'Pendiente_Activacion' && (
            <PanelDeActivacion contratoId={id} onActivacionExitosa={fetchContrato} />
        )}

        <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                    <dd className="mt-1 text-sm text-gray-900">{contrato.nombre_cliente}</dd>
                </div>
                 <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Plan Contratado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{contrato.nombre_plan}</dd>
                </div>
                 <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{contrato.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString() : 'Pendiente de activación'}</dd>
                </div>
                 <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Fin</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(contrato.fecha_fin).toLocaleDateString()}</dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Detalles del Anuncio y Guion</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{contrato.detalles_anuncio || 'No se especificaron detalles.'}</dd>
                </div>
            </dl>
        </div>
    </div>
  );
}