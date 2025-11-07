import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { HiExclamationCircle, HiPencil, HiTrash, HiCheckCircle, HiPlus } from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";
import Modal from "react-modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext"; // Reutilizamos el contexto de autenticación

// --- Estilos para el Modal (iguales que en Usuarios.jsx) ---
const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '500px', padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 50 }
};
Modal.setAppElement('#root'); // Asegúrate de que tu #root exista en index.html

// --- Componente de Carga (igual que en Usuarios.jsx) ---
const CustomLoader = () => (
  <div className="py-10 flex flex-col items-center justify-center text-gray-500">
    <CgSpinner className="animate-spin h-8 w-8 mb-4" />
    <p>Cargando usuarios externos...</p> {/* Texto ajustado */}
  </div>
);

// --- Componente Principal: ClientesVisitantes ---
export default function ClientesVisitantes() {
  const { token } = useAuth(); // Necesitamos el token para las llamadas API
  const [usuariosExternos, setUsuariosExternos] = useState([]); // Nombre de estado más específico
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- ¡CAMBIO CLAVE: Nueva URL de la API! ---
  const API_URL = "http://localhost:3000/api/admin/clientes";

  const fetchUsuariosExternos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` } // Enviamos el token
      });
      // El backend ya valida si el token es de admin
      if (!response.ok) {
           let errorMsg = "Error al cargar clientes y visitantes.";
           try {
               const errData = await response.json();
               errorMsg = errData.message || errData.error || errorMsg;
           } catch(e) { /* Ignorar si no hay cuerpo JSON */ }
           throw new Error(errorMsg);
      }
      const data = await response.json();
      setUsuariosExternos(data); // Guardamos en el estado
    } catch (error) {
      console.error("Error al obtener clientes/visitantes:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente si hay token
  useEffect(() => {
    if (token) {
        fetchUsuariosExternos();
    } else {
        // Podría pasar si el token expira mientras está en la página
        setError("Acceso denegado. Se requiere autenticación de administrador.");
        setLoading(false);
    }
  }, [token]); // Recargar si el token cambia (ej. re-login)

  // --- Lógica de Modales (igual que en Usuarios.jsx) ---
  const openEditModal = (user) => { setSelectedUser(user); editFormik.setValues(user); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedUser(null); editFormik.resetForm(); };
  const openDeleteModal = (user) => { setSelectedUser(user); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedUser(null); };
  const openCreateModal = () => { createFormik.resetForm(); setIsCreateModalOpen(true); };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  // --- Esquemas de Validación (Solo roles cliente/usuario) ---
  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es requerido"),
    correo: Yup.string().email("Debe ser un correo válido").required("El correo es requerido"),
    password: Yup.string().when('$isCreating', {
        is: true,
        then: schema => schema.min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida"),
        otherwise: schema => schema,
    }),
    // Ajustado para solo permitir cliente o usuario
    rol: Yup.string().oneOf(['cliente', 'usuario'], "Rol no válido (solo cliente o usuario)").required("El rol es requerido"),
  });

  // --- Formulario de Edición ---
  const editFormik = useFormik({
    initialValues: { nombre: '', correo: '', rol: 'cliente' }, // Default a cliente
    validationSchema: validationSchema,
    context: { isCreating: false },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await fetch(`${API_URL}/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ nombre: values.nombre, correo: values.correo, rol: values.rol }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Ocurrió un error al actualizar');
        showNotification(result.message, 'success');
        closeEditModal();
        fetchUsuariosExternos(); // Recargar lista
      } catch (err) {
        showNotification(err.message, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- Formulario de Creación ---
  const createFormik = useFormik({
    initialValues: { nombre: '', correo: '', password: '', rol: 'cliente' }, // Default rol a 'cliente'
    validationSchema: validationSchema,
    context: { isCreating: true },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Ocurrió un error al crear');
        showNotification(result.message, 'success');
        closeCreateModal();
        fetchUsuariosExternos(); // Recargar lista
      } catch (err) {
        showNotification(err.message, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- DELETE Handler ---
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_URL}/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Ocurrió un error al eliminar');
      showNotification(result.message, 'success');
      closeDeleteModal();
      fetchUsuariosExternos(); // Recargar lista
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- Notificación (igual que Usuarios.jsx) ---
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // --- Definición de Columnas (Ajustar colores si quieres) ---
  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Correo', selector: row => row.correo, sortable: true },
    {
      name: 'Rol', sortable: true, cell: row => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
          // Colores ajustados para cliente/usuario
          row.rol === 'cliente' ? 'bg-green-100 text-green-800' :
          row.rol === 'usuario' ? 'bg-indigo-100 text-indigo-800' : // Ejemplo para 'usuario'
          'bg-gray-100 text-gray-800' // Fallback
        }`}>
          {row.rol}
        </span>
      )
    },
    { // Acciones (igual que Usuarios.jsx, sin restricción de ID 1)
      name: 'Acciones', cell: row => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="text-sky-600 hover:text-sky-800 transition-colors" aria-label="Editar"> <HiPencil className="h-5 w-5" /> </button>
          <button onClick={() => openDeleteModal(row)} className="text-red-600 hover:text-red-800 transition-colors" aria-label="Eliminar"> <HiTrash className="h-5 w-5" /> </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true
    },
  ];

  // --- Renderizado Condicional de Error ---
  if (error && !loading) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-3">
          <HiExclamationCircle className="h-5 w-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  // --- Renderizado Principal ---
  return (
    <div className="bg-gray-50/50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Cabecera (Texto ajustado) --- */}
        <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Gestión de Clientes y Visitantes</h2>
            <p className="mt-2 text-sm text-gray-600">Administra los usuarios externos (Clientes y Usuarios registrados).</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
              <HiPlus className="h-5 w-5" />
              <span>Añadir Usuario Externo</span> {/* Texto ajustado */}
            </button>
          </div>
        </div>

        {/* --- Notificación (igual) --- */}
        {notification.message && (
          <div className={`p-4 mb-4 rounded-md flex items-center gap-3 text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.type === 'success' ? <HiCheckCircle className="h-5 w-5" /> : <HiExclamationCircle className="h-5 w-5" />}
            {notification.message}
          </div>
        )}

        {/* --- Tabla (Texto ajustado en 'noDataComponent') --- */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <DataTable
            columns={columns}
            data={usuariosExternos} // Usamos el estado correcto
            pagination
            paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
            responsive
            highlightOnHover
            progressPending={loading}
            progressComponent={<CustomLoader />}
            noDataComponent={loading ? "" : "No hay clientes o visitantes para mostrar."} // Texto ajustado
          />
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN (Solo Cliente/Usuario) --- */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal} style={customModalStyles} contentLabel="Editar Usuario Externo">
        <h2 className="text-xl font-bold mb-4">Editar Cliente/Visitante</h2>
        <form onSubmit={editFormik.handleSubmit}>
          {/* Nombre */}
          <div className="mb-4">
            <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="edit-nombre" type="text" {...editFormik.getFieldProps('nombre')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            {editFormik.touched.nombre && editFormik.errors.nombre ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.nombre}</div> : null}
          </div>
          {/* Correo */}
          <div className="mb-4">
            <label htmlFor="edit-correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input id="edit-correo" type="email" {...editFormik.getFieldProps('correo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            {editFormik.touched.correo && editFormik.errors.correo ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.correo}</div> : null}
          </div>
           {/* Rol (Solo Cliente/Usuario) */}
          <div className="mb-6">
            <label htmlFor="edit-rol" className="block text-sm font-medium text-gray-700">Rol</label>
            <select id="edit-rol" {...editFormik.getFieldProps('rol')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
              <option value="cliente">Cliente</option>
              <option value="usuario">Usuario</option>
            </select>
            {editFormik.touched.rol && editFormik.errors.rol ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.rol}</div> : null}
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={editFormik.isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300">
              {editFormik.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DE CREACIÓN (Solo Cliente/Usuario, Default Cliente) --- */}
      <Modal isOpen={isCreateModalOpen} onRequestClose={closeCreateModal} style={customModalStyles} contentLabel="Añadir Usuario Externo">
        <h2 className="text-xl font-bold mb-4">Añadir Nuevo Cliente/Visitante</h2>
        <form onSubmit={createFormik.handleSubmit}>
           {/* Nombre */}
          <div className="mb-4">
            <label htmlFor="create-nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="create-nombre" type="text" {...createFormik.getFieldProps('nombre')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
            {createFormik.touched.nombre && createFormik.errors.nombre ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.nombre}</div> : null}
          </div>
           {/* Correo */}
          <div className="mb-4">
            <label htmlFor="create-correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input id="create-correo" type="email" {...createFormik.getFieldProps('correo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
            {createFormik.touched.correo && createFormik.errors.correo ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.correo}</div> : null}
          </div>
           {/* Contraseña */}
          <div className="mb-4">
            <label htmlFor="create-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input id="create-password" type="password" {...createFormik.getFieldProps('password')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
            {createFormik.touched.password && createFormik.errors.password ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.password}</div> : null}
          </div>
           {/* Rol (Solo Cliente/Usuario) */}
          <div className="mb-6">
            <label htmlFor="create-rol" className="block text-sm font-medium text-gray-700">Rol</label>
            <select id="create-rol" {...createFormik.getFieldProps('rol')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
              <option value="cliente">Cliente</option>
              <option value="usuario">Usuario</option>
            </select>
            {createFormik.touched.rol && createFormik.errors.rol ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.rol}</div> : null}
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={closeCreateModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={createFormik.isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300">
              {createFormik.isSubmitting ? 'Creando...' : 'Crear Usuario'} {/* Texto ajustado */}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Modal de Confirmación de Eliminación (igual) --- */}
      <Modal isOpen={isDeleteModalOpen} onRequestClose={closeDeleteModal} style={customModalStyles} contentLabel="Confirmar Eliminación">
        <h2 className="text-xl font-bold mb-2">Confirmar Eliminación</h2>
        <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar a <strong>{selectedUser?.nombre}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-4">
          <button onClick={closeDeleteModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Sí, Eliminar</button>
        </div>
      </Modal>

    </div>
  );
}