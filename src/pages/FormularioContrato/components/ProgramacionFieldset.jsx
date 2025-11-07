// src/pages/FormularioContrato/components/ProgramacionFieldset.jsx (COMPLETO)

import React from 'react';
import { HiCalendar, HiCash } from 'react-icons/hi';
import { DisponibilidadStock } from './DisponibilidadStock.jsx';

const FieldGroup = ({ title, children }) => (
    <div className="bg-white p-6 shadow-sm rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">{title}</h3>
        {children}
    </div>
);

export const ProgramacionFieldset = ({
    formData, handleChange, diasEmision, handleDiasChange,
    duracionValor, setDuracionValor, duracionTipo, setDuracionTipo,
    stockInfo, loadingStock, planSeleccionado, 
    diasTotales, diasEmisionActivos // <-- Nuevas props
}) => (
    <FieldGroup title="3. Programación y Cálculo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Rápido)</label>
                <div className="flex items-center gap-2">
                    <input type="number" min="1" value={duracionValor} onChange={e => setDuracionValor(e.target.value)} placeholder="Ej: 3" className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                    <select value={duracionTipo} onChange={e => setDuracionTipo(e.target.value)} className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500">
                        <option value="meses">Meses</option>
                        <option value="dias">Días</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="fecha_inicio" className="flex items-center gap-2 text-sm font-medium text-gray-700"><HiCalendar /> Fecha de Inicio</label>
                <input type="date" id="fecha_inicio" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
            </div>
            <div>
                <label htmlFor="fecha_fin" className="flex items-center gap-2 text-sm font-medium text-gray-700"><HiCalendar /> Fecha de Fin</label>
                <input type="date" id="fecha_fin" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Días de Emisión</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(diasEmision).map(dia => (
                        <button key={dia} type="button" onClick={() => handleDiasChange(dia)} className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${diasEmision[dia] ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{dia}</button>
                    ))}
                </div>
            </div>
            <hr className="md:col-span-2" />
            <div>
                <label htmlFor="descuento" className="flex items-center gap-2 text-sm font-medium text-gray-700"><HiCash /> Descuento (S/)</label>
                <input type="number" step="0.01" id="descuento" name="descuento" value={formData.descuento || ''} onChange={handleChange} placeholder="Ej: 20.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
            </div>
            
            <div className="md:col-span-1">
                <DisponibilidadStock 
                    stockInfo={stockInfo}
                    loadingStock={loadingStock}
                    fecha_inicio={formData.fecha_inicio}
                    fecha_fin={formData.fecha_fin}
                    diasEmision={diasEmision}
                    planSeleccionado={planSeleccionado}
                    diasTotales={diasTotales}         // <-- Pasando el dato
                    diasEmisionActivos={diasEmisionActivos} // <-- Pasando el dato
                />
            </div>
        </div>
    </FieldGroup>
);