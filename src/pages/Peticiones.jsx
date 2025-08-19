import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2'; // Importamos SweetAlert2 para notificaciones profesionales

export default function Peticiones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [processingId, setProcessingId] = useState(null); // Para saber qué solicitud se está procesando

  const cargarSolicitudes = () => {
    fetch("http://localhost:3000/solicitudes/solicitudes-vendedor")
      .then((res) => res.json())
      .then((data) => setSolicitudes(data))
      .catch((err) => {
        console.error("Error al cargar solicitudes:", err);
        Swal.fire('Error', 'No se pudieron cargar las solicitudes.', 'error');
      });
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const aprobarSolicitud = async (id) => {
    setProcessingId(id);
    try {
      const res = await fetch("http://localhost:3000/solicitudes/solicitudes-vendedor/aceptar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      title: 'Motivo del Rechazo',
      input: 'textarea',
      inputPlaceholder: 'Explica por qué la solicitud fue rechazada...',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir un motivo!';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar Solicitud',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar'
    });

    if (motivo) {
      setProcessingId(id);
      try {
        const res = await fetch("http://localhost:3000/solicitudes/solicitudes-vendedor/rechazar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Solicitudes de Vendedor</h2>
      {solicitudes.length === 0 ? (
        <p className="text-gray-600">No hay solicitudes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border-b text-left">ID</th>
                <th className="px-6 py-3 border-b text-left">Usuario</th>
                <th className="px-6 py-3 border-b text-left">Correo</th>
                <th className="px-6 py-3 border-b text-left">Monto</th>
                <th className="px-6 py-3 border-b text-left">Comprobante</th>
                <th className="px-6 py-3 border-b text-left">Estado</th>
                <th className="px-6 py-3 border-b text-left">Fecha</th>
                <th className="px-6 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id}>
                  <td className="px-6 py-4 border-b">{sol.id}</td>
                  <td className="px-6 py-4 border-b">{sol.nombre}</td>
                  <td className="px-6 py-4 border-b">{sol.correo}</td>
                  <td className="px-6 py-4 border-b">S/ {Number(sol.monto).toFixed(2)}</td>
                  <td className="px-6 py-4 border-b">
                    <a href={`http://localhost:3000/uploads/${sol.comprobante_pago}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver</a>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        sol.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                        sol.estado === 'aprobada' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                    }`}>
                      {sol.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">{new Date(sol.fecha_solicitud).toLocaleString()}</td>
                  <td className="px-6 py-4 border-b text-center">
                    {sol.estado === "pendiente" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => aprobarSolicitud(sol.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow disabled:bg-gray-400"
                          disabled={processingId === sol.id}
                        >
                          {processingId === sol.id ? '...' : 'Aceptar'}
                        </button>
                        <button
                          onClick={() => rechazarSolicitud(sol.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow disabled:bg-gray-400"
                          disabled={processingId === sol.id}
                        >
                          {processingId === sol.id ? '...' : 'Rechazar'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Procesada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}