import { useState, useEffect } from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import Swal from "sweetalert2";

// Ya no necesitamos DataTable, CustomLoader ni columns

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false); // Mantener para mostrar el estado de carga

    // Función para obtener clientes (centralizada)
    const obtenerClientes = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/cliente/clientes");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setClientes(data);
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
            Swal.fire("Error", "No se pudo cargar la lista de clientes.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerClientes();
    }, []);

    const handleELiminar = async (id) => {
        // 1. Mostrar la ventana de confirmación con SweetAlert2
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¡Si eliminas el cliente, también se eliminarán todos sus contratos de publicidad y solicitudes asociadas! Esta acción es irreversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", 
            cancelButtonColor: "#3085d6", 
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        // 2. Verificar si el usuario confirmó
        if (result.isConfirmed) {
            try {
                // 3. Ejecutar la solicitud DELETE al backend
                const res = await fetch(`http://localhost:3000/api/cliente/eliminar/${id}`, {
                    method: 'DELETE',
                });

                // 4. Manejar la respuesta del servidor
                if (res.ok) {
                    Swal.fire(
                        "¡Eliminado!",
                        "El cliente y todos sus datos relacionados han sido eliminados correctamente.",
                        "success"
                    );
                    // ***** ACTUALIZACIÓN CLAVE: Recargar los datos *****
                    obtenerClientes(); 
                    
                } else if (res.status === 404) {
                    const errorData = await res.json();
                    Swal.fire(
                        "Error",
                        errorData.error || "El cliente no fue encontrado.",
                        "error"
                    );
                } else {
                    const errorData = await res.json();
                    Swal.fire(
                        "Error",
                        `Error al eliminar: ${errorData.error || 'Error desconocido del servidor'}`,
                        "error"
                    );
                }
            } catch (error) {
                // 5. Manejar errores de red o de conexión
                console.error("Error de conexión:", error);
                Swal.fire(
                    "Error de Conexión",
                    "No se pudo conectar con el servidor. Inténtalo de nuevo.",
                    "error"
                );
            }
        }
    };
    
    // Función dummy para edición
    const handleEditar = (id) => {
        console.log("Editar cliente ID:", id);
        // Implementar lógica de edición aquí
    }

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8 ">
            <div className="max-w-7xl mx-auto">
                <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">Lista de Clientes</h1>
                        <p className="mt-2 text-sm text-gray-600">Visualiza, busca y administra todos los clientes registrados.</p>
                    </div>
                </div>

                {/* Esta es la tabla que simula el diseño de un DataTable */}
                <div className="overflow-x-auto rounded-2xl shadow-md bg-white">
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Usuario ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">nombre</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">apellidos </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">notas de usuario</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">numero telefono</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">fecha inicio</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">fecha fin</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">estado</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-gray-500">
                                            Cargando datos...
                                        </td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-gray-500">
                                            No hay clientes disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    clientes.map((cliente) => (
                                        <tr
                                            key={cliente.id}
                                            className="border-b border-gray-300 hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.usuario_id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.nombre || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.apellido || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.notas || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.telefono || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.fecha_inicio || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.fecha_fin || "null"} </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{cliente.estado || "null"} </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 transition"
                                                        title="Editar"
                                                        onClick={() => handleEditar(cliente.id)}
                                                    >
                                                        <HiPencil size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 transition"
                                                        title="Eliminar"
                                                        onClick={() => handleELiminar(cliente.id)}
                                                    >
                                                        <HiTrash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div> 
            </div>
        </div>
    );
}