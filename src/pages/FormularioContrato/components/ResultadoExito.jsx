import React from 'react';
import { HiSave, HiPrinter, HiArrowLeft } from 'react-icons/hi';

export const ResultadoExito = ({ resultado, navigate }) => (
    <div className="p-8 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="max-w-md w-full">
            <HiSave className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">¡Éxito!</h2>
            <p className="mt-2 text-lg text-gray-600">{resultado.message}</p>
            <div className="mt-8 flex flex-col gap-4">
                <a href={resultado.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-500">
                    <HiPrinter className="h-6 w-6" /> Ver Contrato (PDF)
                </a>
                <button onClick={() => navigate('/contratos')} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">
                    <HiArrowLeft className="h-5 w-5" /> Volver a Contratos
                </button>
            </div>
        </div>
    </div>
);