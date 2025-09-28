import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { HiExclamationCircle, HiPencil, HiTrash, HiCheckCircle, HiPlus } from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";
import Modal from "react-modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";

// --- Estilos para el Modal (sin cambios) ---
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
Modal.setAppElement('#root');

// --- Componente de Carga de la Tabla (sin cambios) ---
const CustomLoader = () => (
  <div className="py-10 flex flex-col items-center justify-center text-gray-500">
    <CgSpinner className="animate-spin h-8 w-8 mb-4" />
    <p>Cargando usuarios...</p>
  </div>
);

// --- Componente Principal ---
export default function Usuarios() {
  const { token } = useAuth(); // Obtenemos el token para las peticiones seguras
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // NUEVO ESTADO
  const [notification, setNotification] = useState({ message: '', type: '' });

  const API_URL = "http://localhost:3000/api/admin/usuarios";

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Error al cargar los datos de usuarios.");
      const data = await response.json();
      setUsuarios(data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsuarios();
  }, [token]);

  // --- Lógica de Modales ---
  const openEditModal = (user) => { setSelectedUser(user); editFormik.setValues(user); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedUser(null); editFormik.resetForm(); };
  const openDeleteModal = (user) => { setSelectedUser(user); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedUser(null); };
  const openCreateModal = () => { createFormik.resetForm(); setIsCreateModalOpen(true); };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  // --- Esquemas de Validación con Yup ---
  const editValidationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es requerido"),
    correo: Yup.string().email("Debe ser un correo válido").required("El correo es requerido"),
    rol: Yup.string().oneOf(['admin', 'vendedor', 'usuario'], "Rol no válido").required("El rol es requerido"),
  });

  const createValidationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es requerido"),
    correo: Yup.string().email("Debe ser un correo válido").required("El correo es requerido"),
    password: Yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida"),
    rol: Yup.string().oneOf(['admin', 'vendedor', 'usuario'], "Rol no válido").required("El rol es requerido"),
  });

  // --- Manejo de Formularios con Formik ---
  const editFormik = useFormik({
    initialValues: { nombre: '', correo: '', rol: 'usuario' },
    validationSchema: editValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await fetch(`${API_URL}/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Ocurrió un error');
        showNotification(result.message, 'success');
        closeEditModal();
        fetchUsuarios();
      } catch (err) {
        showNotification(err.message, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const createFormik = useFormik({
    initialValues: { nombre: '', correo: '', password: '', rol: 'usuario' },
    validationSchema: createValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(values),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Ocurrió un error al crear.');
            showNotification(result.message, 'success');
            closeCreateModal();
            fetchUsuarios();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    },
  });

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_URL}/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ocurrió un error');
      showNotification(result.message, 'success');
      closeDeleteModal();
      fetchUsuarios();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Correo', selector: row => row.correo, sortable: true },
    {
      name: 'Rol', sortable: true, cell: row => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${row.rol === 'admin' ? 'bg-red-100 text-red-800' : row.rol === 'vendedor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {row.rol}
        </span>
      )
    },
    {
      name: 'Acciones', cell: row => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="text-sky-600 hover:text-sky-800 transition-colors" aria-label="Editar"> <HiPencil className="h-5 w-5" /> </button>
          <button onClick={() => openDeleteModal(row)} className="text-red-600 hover:text-red-800 transition-colors" aria-label="Eliminar"> <HiTrash className="h-5 w-5" /> </button>
        </div>
      ), ignoreRowClick: true, allowOverflow: true, button: true
    },
  ];

  if (error) {
    return (
      <div className="p-8">
         <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-3">
            <HiExclamationCircle className="h-5 w-5" />
            <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Gestión de Usuarios</h2>
            <p className="mt-2 text-sm text-gray-600">Visualiza, busca y administra todos los usuarios registrados.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
              <HiPlus className="h-5 w-5" />
              <span>Añadir Usuario</span>
            </button>
          </div>
        </div>

        {notification.message && (
          <div className={`p-4 mb-4 rounded-md flex items-center gap-3 text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.type === 'success' ? <HiCheckCircle className="h-5 w-5" /> : <HiExclamationCircle className="h-5 w-5" />}
            {notification.message}
          </div>
        )}
        
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <DataTable
            columns={columns} data={usuarios} pagination
            paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
            responsive highlightOnHover progressPending={loading}
            progressComponent={<CustomLoader />}
            noDataComponent="No hay usuarios para mostrar."
          />
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal} style={customModalStyles} contentLabel="Editar Usuario">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        <form onSubmit={editFormik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" id="nombre" {...editFormik.getFieldProps('nombre')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            {editFormik.touched.nombre && editFormik.errors.nombre ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.nombre}</div> : null}
          </div>
          <div className="mb-4">
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" id="correo" {...editFormik.getFieldProps('correo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            {editFormik.touched.correo && editFormik.errors.correo ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.correo}</div> : null}
          </div>
          <div className="mb-6">
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
            <select id="rol" {...editFormik.getFieldProps('rol')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
              <option value="usuario">Usuario</option>
              <option value="vendedor">Vendedor</option>
              <option value="admin">Admin</option>
            </select>
            {editFormik.touched.rol && editFormik.errors.rol ? <div className="text-red-600 text-sm mt-1">{editFormik.errors.rol}</div> : null}
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={editFormik.isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300">
              {editFormik.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DE CREACIÓN --- */}
      <Modal isOpen={isCreateModalOpen} onRequestClose={closeCreateModal} style={customModalStyles} contentLabel="Añadir Usuario">
        <h2 className="text-xl font-bold mb-4">Añadir Nuevo Usuario</h2>
        <form onSubmit={createFormik.handleSubmit}>
            <div className="mb-4">
                <label htmlFor="create-nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input id="create-nombre" type="text" {...createFormik.getFieldProps('nombre')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
                {createFormik.touched.nombre && createFormik.errors.nombre ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.nombre}</div> : null}
            </div>
            <div className="mb-4">
                <label htmlFor="create-correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input id="create-correo" type="email" {...createFormik.getFieldProps('correo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
                {createFormik.touched.correo && createFormik.errors.correo ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.correo}</div> : null}
            </div>
            <div className="mb-4">
                <label htmlFor="create-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input id="create-password" type="password" {...createFormik.getFieldProps('password')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"/>
                {createFormik.touched.password && createFormik.errors.password ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.password}</div> : null}
            </div>
            <div className="mb-6">
                <label htmlFor="create-rol" className="block text-sm font-medium text-gray-700">Rol</label>
                <select id="create-rol" {...createFormik.getFieldProps('rol')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
                    <option value="usuario">Usuario</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Admin</option>
                </select>
                {createFormik.touched.rol && createFormik.errors.rol ? <div className="text-red-600 text-sm mt-1">{createFormik.errors.rol}</div> : null}
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={closeCreateModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={createFormik.isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300">
                    {createFormik.isSubmitting ? 'Creando...' : 'Crear Usuario'}
                </button>
            </div>
        </form>
      </Modal>

      {/* --- Modal de Confirmación de Eliminación --- */}
      <Modal isOpen={isDeleteModalOpen} onRequestClose={closeDeleteModal} style={customModalStyles} contentLabel="Confirmar Eliminación">
         <h2 className="text-xl font-bold mb-2">Confirmar Eliminación</h2>
         <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.nombre}</strong>? Esta acción no se puede deshacer.</p>
         <div className="flex justify-end gap-4">
            <button onClick={closeDeleteModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Sí, Eliminar</button>
          </div>
      </Modal>

    </div>
  );
}