import React, { useEffect, useState } from "react";

export default function Peticiones() {
  const [solicitudes, setSolicitudes] = useState([]);

  // Cargar solicitudes al iniciar
  const cargarSolicitudes = () => {
    fetch("http://localhost:3000/solicitudes/solicitudes-vendedor")
      .then((res) => res.json())
      .then((data) => setSolicitudes(data))
      .catch((err) => console.error("Error al cargar solicitudes:", err));
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // Función para aprobar solicitud
  const aprobarSolicitud = async (id) => {
    try {
      const res = await fetch(
        "http://localhost:3000/solicitudes/solicitudes-vendedor/aceptar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solicitud_id: id }),
        }
      );

      const data = await res.json();
      console.log("Respuesta del servidor:", data);
      alert(data.message);
      cargarSolicitudes();
    } catch (err) {
      console.error("Error al aprobar:", err);
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
                <th className="px-6 py-3 border-b">ID</th>
                <th className="px-6 py-3 border-b">Usuario</th>
                <th className="px-6 py-3 border-b">Correo</th>
                <th className="px-6 py-3 border-b">Método</th>
                <th className="px-6 py-3 border-b">Monto</th>
                <th className="px-6 py-3 border-b">Referencia</th>
                <th className="px-6 py-3 border-b">Comprobante</th>
                <th className="px-6 py-3 border-b">Estado</th>
                <th className="px-6 py-3 border-b">Fecha</th>
                <th className="px-6 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol, index) => (
                <tr
                  key={sol.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-3 border-b">{sol.id}</td>
                  <td className="px-6 py-3 border-b">{sol.nombre}</td>
                  <td className="px-6 py-3 border-b">{sol.correo}</td>
                  <td className="px-6 py-3 border-b">{sol.metodo_pago}</td>
                  <td className="px-6 py-3 border-b">S/ {sol.monto}</td>
                  <td className="px-6 py-3 border-b">{sol.referencia_pago}</td>
                  <td className="px-6 py-3 border-b">
                    {sol.comprobante_pago ? (
                      <a
                        href={`http://localhost:3000/uploads/${sol.comprobante_pago}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-3 border-b">{sol.estado}</td>
                  <td className="px-6 py-3 border-b">
                    {new Date(sol.fecha_solicitud).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    {sol.estado === "pendiente" && (
                      <button
                        onClick={() => aprobarSolicitud(sol.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow"
                      >
                        Aceptar
                      </button>
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