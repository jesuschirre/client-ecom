import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { HiPhotograph, HiSave } from 'react-icons/hi';

export default function UserProfile() {
    const { token } = useAuth();
    const [config, setConfig] = useState({
        nombre: '', ruc: '', direccion: '', telefono: '', email_contacto: '', logo_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Estados para la previsualización del logo
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/configuracion_admin', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se pudo cargar la configuración.');
                const data = await response.json();
                setConfig(data);
                setLogoPreview(data.logo_url); // Establecer la vista previa inicial
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchConfig();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            // Crear una URL local para la previsualización instantánea
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        // Usamos FormData porque vamos a enviar un archivo
        const formData = new FormData();
        formData.append('nombre', config.nombre);
        formData.append('ruc', config.ruc);
        formData.append('direccion', config.direccion);
        formData.append('telefono', config.telefono);
        formData.append('email_contacto', config.email_contacto);
        formData.append('logo_url_actual', config.logo_url || '');

        if (logoFile) {
            formData.append('logo', logoFile);
        }

        try {
            const response = await fetch('http://localhost:3000/api/configuracion_admin', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }, // NO se pone Content-Type, FormData lo hace solo
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al guardar.');
            
            Swal.fire('¡Éxito!', data.message, 'success');
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando perfil de la empresa...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900">Perfil de la Empresa</h1>
            <p className="mt-2 text-sm text-gray-600">Esta información se mostrará en los documentos generados, como los contratos.</p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-4xl space-y-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna del Logo */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Logo de la Empresa</label>
                        <div className="mt-2 aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Vista previa del logo" className="h-full w-full object-contain rounded-lg" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <HiPhotograph className="mx-auto h-12 w-12" />
                                    <p>Sin logo</p>
                                </div>
                            )}
                        </div>
                        <label htmlFor="logo-upload" className="cursor-pointer mt-4 inline-block bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            Cambiar logo
                        </label>
                        <input id="logo-upload" name="logo" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg" />
                    </div>

                    {/* Columna de Datos */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
                            <input type="text" name="nombre" id="nombre" value={config.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="ruc" className="block text-sm font-medium text-gray-700">RUC</label>
                            <input type="text" name="ruc" id="ruc" value={config.ruc} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="text" name="telefono" id="telefono" value={config.telefono} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input type="text" name="direccion" id="direccion" value={config.direccion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                         <div className="sm:col-span-2">
                            <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                            <input type="email" name="email_contacto" id="email_contacto" value={config.email_contacto} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-5 border-t">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50">
                        <HiSave className="h-5 w-5" />
                        <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}