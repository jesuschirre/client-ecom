// src/pages/Contratos/components/StatCard.jsx
import React from 'react';
import { HiDocumentText, HiOutlineDocumentReport } from 'react-icons/hi';

// Asegúrate de que tu componente acepte 'onExportCSV' y 'onExportPDF'
export const StatCard = ({ 
  title, 
  count, 
  icon, 
  colorClass, 
  onExportCSV, // <-- Prop para CSV
  onExportPDF  // <-- Prop para PDF
}) => (
  <div className="bg-white shadow-lg rounded-xl flex flex-col transition-all duration-300 hover:shadow-2xl">
    
    {/* 1. Sección de Estadísticas (Esto es lo que ya tienes) */}
    <div className="p-5 flex items-center">
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>

    {/* 2. NUEVO: Sección de Botones de Reporte */}
    {/* Esta sección es la que te falta. Usa las props onExportCSV y onExportPDF */}
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 rounded-b-xl">
      <div className="flex justify-end items-center space-x-3">
        <span className="text-xs font-medium text-gray-500">Exportar:</span>
        <button
          onClick={onExportCSV}
          disabled={count === 0} // Deshabilita el botón si el conteo es 0
          title={`Exportar ${title} a CSV`}
          className="p-2 text-gray-400 rounded-full hover:bg-green-100 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <HiDocumentText className="h-5 w-5" />
        </button>
        <button
          onClick={onExportPDF}
          disabled={count === 0} // Deshabilita el botón si el conteo es 0
          title={`Exportar ${title} a PDF`}
          className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <HiOutlineDocumentReport className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);