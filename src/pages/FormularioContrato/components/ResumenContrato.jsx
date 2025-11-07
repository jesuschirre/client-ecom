import React from 'react';

export const ResumenContrato = ({ plan, formData, diasTotales, diasEmisionActivos, diasEmision, precioCalculado }) => (
    <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Resumen del Contrato</h3>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-base font-semibold text-gray-900">{plan ? plan.nombre : 'No seleccionado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Fechas</p>
                    <p className="text-base font-semibold text-gray-900">{formData.fecha_inicio && formData.fecha_fin ? `${formData.fecha_inicio} al ${formData.fecha_fin}` : 'N/A'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Días de Emisión</p>
                    <p className="text-base font-semibold text-gray-900">{diasEmisionActivos} / {diasTotales} días</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Descuento</p>
                    <p className="text-base font-semibold text-gray-900">S/{formData.descuento || '0.00'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Monto Final Acordado</p>
                    <p className="text-lg font-bold text-sky-700">S/{formData.monto_acordado || '0.00'}</p>
                </div>
            </div>
        </div>
    </div>
);