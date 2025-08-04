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
        "http://localhost:3000/solicitudes/aprobar-solicitud",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solicitud_id: id }),
        }
      );

      const data = await res.json();
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
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">
                  Usuario
                </th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">
                  Correo
                </th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">
                  Estado
                </th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">
                  Fecha
                </th>
                <th className="px-6 py-3 border-b text-center text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol, index) => (
                <tr
                  key={sol.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-3 border-b text-sm">{sol.id}</td>
                  <td className="px-6 py-3 border-b text-sm">{sol.nombre}</td>
                  <td className="px-6 py-3 border-b text-sm">{sol.correo}</td>
                  <td className="px-6 py-3 border-b text-sm">{sol.estado}</td>
                  <td className="px-6 py-3 border-b text-sm">
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
