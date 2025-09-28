import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiExclamation } from 'react-icons/hi';

// --- Componente del Modal del Formulario ---
const FormularioPlan = ({ plan, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        periodo: '/mes',
        caracteristicas: '',
        destacado: false,
        deshabilitado: false,
        url_contratacion: '/FormNvend'
    });

    useEffect(() => {
        if (plan) {
            setFormData({ ...plan, caracteristicas: plan.caracteristicas.join('\n') });
        }
    }, [plan]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            caracteristicas: formData.caracteristicas.split('\n').filter(line => line.trim() !== '')
        };
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{plan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Precio (S/)</label>
                            <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Características (una por línea)</label>
                        <textarea name="caracteristicas" rows="4" value={formData.caracteristicas} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="destacado" name="destacado" type="checkbox" checked={formData.destacado} onChange={handleChange} className="h-4 w-4 text-sky-600 border-gray-300 rounded" />
                            <label htmlFor="destacado" className="ml-2 block text-sm text-gray-900">Marcar como destacado</label>
                        </div>
                        <div className="flex items-center">
                            <input id="deshabilitado" name="deshabilitado" type="checkbox" checked={formData.deshabilitado} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded" />
                            <label htmlFor="deshabilitado" className="ml-2 block text-sm text-gray-900">Deshabilitar compra</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Guardar Plan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente de la Tarjeta de Plan ---
const PlanCard = ({ plan, onEdit, onDelete }) => (
    <div className={`border rounded-lg shadow-md flex flex-col ${plan.destacado ? 'border-sky-500 border-2' : 'border-gray-200'} ${plan.deshabilitado ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
        {plan.destacado && (
            <div className="bg-sky-500 text-white text-xs font-bold uppercase text-center py-1">Popular</div>
        )}
        <div className="p-6 flex-grow">
            <h3 className="text-2xl font-bold text-center text-gray-800">{plan.nombre}</h3>
            <div className="text-center my-4">
                <span className="text-4xl font-extrabold">S/{parseFloat(plan.precio).toFixed(2)}</span>
                <span className="text-gray-500">{plan.periodo}</span>
            </div>
            <ul className="space-y-3">
                {plan.caracteristicas.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <HiCheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
            <button onClick={() => onEdit(plan)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200"><HiPencil className="h-5 w-5"/></button>
            <button onClick={() => onDelete(plan)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><HiTrash className="h-5 w-5"/></button>
        </div>
    </div>
);

// --- Componente Principal de la Página ---
export default function Planes() {
    const { token } = useAuth();
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    const fetchPlanes = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/planes_admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo cargar los planes.');
            const data = await response.json();
            setPlanes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPlanes();
    }, [token]);

    const handleOpenModal = (plan = null) => {
        setCurrentPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentPlan(null);
        setIsModalOpen(false);
    };

    const handleSavePlan = async (planData) => {
        const url = planData.id 
            ? `http://localhost:3000/api/planes_admin/${planData.id}` 
            : 'http://localhost:3000/api/planes_admin';
        const method = planData.id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(planData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo guardar el plan.');
            
            Swal.fire({ title: '¡Éxito!', text: data.message, icon: 'success', timer: 1500 });
            handleCloseModal();
            fetchPlanes(); // Recargar la lista de planes
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
        }
    };

    const handleDeletePlan = (plan) => {
        Swal.fire({
            title: `¿Eliminar el plan "${plan.nombre}"?`,
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/planes_admin/${plan.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el plan.');
                    
                    Swal.fire('¡Eliminado!', data.message, 'success');
                    fetchPlanes();
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    };

    if (loading) return <div className="p-10 text-center">Cargando planes...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
                    <p className="mt-2 text-sm text-gray-600">Crea, edita y administra los planes de suscripción y publicidad.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 mt-4 sm:mt-0 px-4 py-2 bg-sky-600 text-white rounded-md shadow-sm hover:bg-sky-700">
                    <HiPlus /> Crear Nuevo Plan
                </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {planes.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onEdit={handleOpenModal} onDelete={handleDeletePlan} />
                ))}
            </div>

            {isModalOpen && <FormularioPlan plan={currentPlan} onSave={handleSavePlan} onCancel={handleCloseModal} />}
        </div>
    );
}