// src/pages/FormularioContrato/components/DisponibilidadStock.jsx (VERSIÓN MEJORADA)

import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';

export const DisponibilidadStock = ({ 
    stockInfo, loadingStock, fecha_inicio, fecha_fin, 
    diasEmision, planSeleccionado, diasTotales, diasEmisionActivos 
}) => {

    if (!fecha_inicio || !fecha_fin || !planSeleccionado) {
        return (
            <div className="bg-gray-100 p-4 rounded-lg text-center h-full min-h-[14rem] flex items-center justify-center">
                <p className="text-sm text-gray-500">Seleccione un plan y un rango de fechas para ver la disponibilidad.</p>
            </div>
        );
    }

    if (loadingStock) {
        return (
            <div className="bg-gray-100 p-4 rounded-lg text-center h-full min-h-[14rem] flex flex-col items-center justify-center">
                <CgSpinner className="animate-spin h-8 w-8 text-sky-600" />
                <p className="text-sm text-gray-500 mt-2">Consultando disponibilidad...</p>
            </div>
        );
    }
    
    const anunciosRequeridos = planSeleccionado.max_anuncios_por_dia || 0;
    const stockMap = new Map(stockInfo.map(s => [s.fecha.split('T')[0], s.anuncios_disponibles]));
    
    let fechasDelRango = [];
    let fechaActual = new Date(fecha_inicio + 'T00:00:00');
    const fechaFinObj = new Date(fecha_fin + 'T00:00:00');
    while(fechaActual <= fechaFinObj) {
        fechasDelRango.push(new Date(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const dayMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };

    let diasConConflicto = 0;

    const resumenDiario = fechasDelRango.map(fecha => {
        const fechaStr = fecha.toISOString().split('T')[0];
        const diaSemana = dayMap[fecha.getDay()];
        const esDiaSeleccionado = diasEmision[diaSemana];
        const disponibles = stockMap.get(fechaStr) ?? 100;
        const hayStock = disponibles >= anunciosRequeridos;
        if (esDiaSeleccionado && !hayStock) {
            diasConConflicto++;
        }
        return { fecha, fechaStr, esDiaSeleccionado, disponibles, hayStock };
    });

    const hayConflictos = diasConConflicto > 0;

    return (
        <div className="bg-gray-50 p-4 rounded-lg border h-full">
            {/* --- NUEVA SECCIÓN DE RESUMEN DE DÍAS --- */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-sm font-semibold text-gray-600">Duración Total</p>
                    <p className="text-2xl font-bold text-sky-700">{diasTotales} <span className="text-base font-normal">días</span></p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-sm font-semibold text-gray-600">Días de Emisión</p>
                    <p className="text-2xl font-bold text-sky-700">{diasEmisionActivos} <span className="text-base font-normal">días</span></p>
                </div>
            </div>
            {/* --- FIN DE LA NUEVA SECCIÓN --- */}

            <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${hayConflictos ? 'text-red-600' : 'text-green-600'}`}>
                {hayConflictos ? <HiExclamationCircle className="h-5 w-5" /> : <HiCheckCircle className="h-5 w-5" />}
                <h4 className="text-sm font-bold">
                    {hayConflictos 
                        ? `${diasConConflicto} día(s) con stock insuficiente`
                        : "Todos los días seleccionados tienen stock"}
                </h4>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                {resumenDiario.map(({ fecha, fechaStr, esDiaSeleccionado, disponibles, hayStock }) => {
                    let statusClass = 'bg-gray-200 text-gray-600';
                    let statusText = 'No Emite';

                    if (esDiaSeleccionado) {
                        if (hayStock) {
                            statusClass = 'bg-green-100 text-green-800';
                            statusText = `OK (${disponibles} disp.)`;
                        } else {
                            statusClass = 'bg-red-100 text-red-800';
                            statusText = `Faltan (${anunciosRequeridos - disponibles})`;
                        }
                    }

                    return (
                        <div key={fechaStr} className="flex justify-between items-center text-xs p-1 rounded">
                            <span className="font-medium text-gray-700">{fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${statusClass}`}>{statusText}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};