import React from 'react';
import { HiSparkles } from 'react-icons/hi';

const FieldGroup = ({ title, children }) => (
    <div className="bg-white p-6 shadow-sm rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">{title}</h3>
        {children}
    </div>
);

export const DetallesFieldset = ({ formData, handleChange, precioCalculado }) => (
    <FieldGroup title="4. Detalles Finales del Contrato">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
                <label htmlFor="nombre_campana" className="block text-sm font-medium text-gray-700">Nombre de la Campaña</label>
                <input type="text" id="nombre_campana" name="nombre_campana" value={formData.nombre_campana} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
            </div>
            <div>
                <label htmlFor="monto_acordado" className="flex items-center gap-2 text-sm font-medium text-gray-700"><HiSparkles /> Monto Final (S/)</label>
                <input type="number" step="0.01" id="monto_acordado" name="monto_acordado" value={formData.monto_acordado} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                <p className="text-xs text-gray-500 mt-1">Calculado: S/{precioCalculado}. Puedes ajustar.</p>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="detalles_anuncio" className="block text-sm font-medium text-gray-700">Detalles del Anuncio y Guion</label>
                <textarea id="detalles_anuncio" name="detalles_anuncio" rows={4} value={formData.detalles_anuncio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
            </div>
        </div>
    </FieldGroup>
);