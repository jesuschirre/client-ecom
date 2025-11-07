import React from 'react';
import { HiCheckCircle } from 'react-icons/hi';

const FieldGroup = ({ title, children }) => (
    <div className="bg-white p-6 shadow-sm rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">{title}</h3>
        {children}
    </div>
);

export const PlanSelector = ({ planes, selectedPlanId, onSelectPlan }) => {

    // --- LOG DE DIAGNÓSTICO 3 ---
    // Esto nos dirá qué props llegan al componente visual.
    console.log("COMPONENTE PlanSelector: Prop 'planes' recibida:", planes);
    // --- FIN DEL LOG ---

    if (!planes || planes.length === 0) {
        return (
            <FieldGroup title="2. Seleccione un Plan">
                <div className="text-center text-gray-500 py-8">
                    Cargando planes o no hay planes disponibles...
                </div>
            </FieldGroup>
        );
    }

    return (
        <FieldGroup title="2. Seleccione un Plan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {planes.map(plan => {
                    const isSelected = plan.id === selectedPlanId;
                    const caracteristicasArray = Array.isArray(plan.caracteristicas) ? plan.caracteristicas : [];

                    return (
                        <div key={plan.id} onClick={() => onSelectPlan(plan.id)} className={`border rounded-lg shadow-md flex flex-col cursor-pointer transition-all duration-200 transform ${isSelected ? 'border-sky-500 border-2 scale-105 shadow-xl' : 'border-gray-200 hover:shadow-lg'} ${plan.deshabilitado ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                            {plan.destacado && (<div className="bg-sky-500 text-white text-xs font-bold uppercase text-center py-1 rounded-t-md">Popular</div>)}
                            <div className="p-6 flex-grow">
                                <h3 className="text-2xl font-bold text-center text-gray-800">{plan.nombre}</h3>
                                <div className="text-center my-4">
                                    <span className="text-4xl font-extrabold text-gray-900">S/{parseFloat(plan.precio).toFixed(2)}</span>
                                    <span className="text-gray-500 ml-1">{plan.periodo}</span>
                                </div>
                                <ul className="space-y-3">
                                    {caracteristicasArray.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <HiCheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {isSelected && (<div className="bg-green-100 border-t-2 border-green-500 text-green-700 text-sm font-bold text-center py-2 rounded-b-md">SELECCIONADO</div>)}
                        </div>
                    );
                })}
            </div>
        </FieldGroup>
    );
};