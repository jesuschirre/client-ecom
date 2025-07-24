import { useEffect, useState } from "react";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const URL = "https://ecomers-b0wm.onrender.com/api/users";

  useEffect(() => {
    fetch(URL)
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch((error) => console.error("Error al obtener usuarios:", error));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Lista de Usuarios</h2>
      
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td className="px-6 py-4 text-sm text-gray-800">{usuario.id}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{usuario.nombre}</td>
              <td className="px-6 py-4 text-sm text-gray-800">{usuario.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
