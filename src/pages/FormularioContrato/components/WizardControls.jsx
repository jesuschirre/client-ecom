// src/pages/FormularioContrato/components/WizardControls.jsx (COMPLETO Y CORREGIDO)

import React from 'react';
import { HiArrowLeft, HiArrowRight, HiSave } from 'react-icons/hi';

export const WizardControls = ({ step, totalSteps, prevStep, nextStep, isStepValid, isLoading, formId }) => {
    return (
        <div className="flex justify-between pt-5 border-t mt-8">
            <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <HiArrowLeft className="h-5 w-5" />
                <span>Anterior</span>
            </button>

            {step < totalSteps ? (
                <button
                    type="button"
                    // --- ¡CAMBIO CLAVE AQUÍ! ---
                    // Añadimos el evento 'e' y llamamos a e.preventDefault()
                    // para evitar cualquier comportamiento de envío no deseado.
                    onClick={(e) => {
                        e.preventDefault();
                        nextStep();
                    }}
                    // --- FIN DEL CAMBIO ---
                    disabled={!isStepValid || isLoading}
                    className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                    <span>Siguiente</span>
                    <HiArrowRight className="h-5 w-5" />
                </button>
            ) : (
                <button
                    type="submit"
                    form={formId}
                    disabled={!isStepValid || isLoading}
                    className="inline-flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                    <HiSave className="h-5 w-5" />
                    <span>{isLoading ? 'Guardando...' : 'Finalizar y Guardar Contrato'}</span>
                </button>
            )}
        </div>
    );
};