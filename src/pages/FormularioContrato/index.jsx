// src/pages/FormularioContrato/index.jsx (COMPLETO Y CORREGIDO)

import React from 'react';
import { useContratoForm } from './hooks/useContratoForm.js';
import { StepperNav } from './components/StepperNav.jsx';
import { WizardControls } from './components/WizardControls.jsx';
import { ClienteFieldset } from './components/ClienteFieldset.jsx';
import { PlanSelector } from './components/PlanSelector.jsx';
import { ProgramacionFieldset } from './components/ProgramacionFieldset.jsx';
import { DetallesFieldset } from './components/DetallesFieldset.jsx';
import { ResumenContrato } from './components/ResumenContrato.jsx';
import { ResultadoExito } from './components/ResultadoExito.jsx';

export default function FormularioContrato() {
  const {
    wizard,
    states,
    setters,
    handlers,
    computed,
    navigate,
    isEditing // Añadimos isEditing aquí para el título
  } = useContratoForm();

  const steps = ["Cliente", "Plan", "Programación", "Detalles"];

  if (states.resultado) {
    return <ResultadoExito resultado={states.resultado} navigate={navigate} />;
  }

  const renderStepContent = () => {
    switch (wizard.step) {
      case 1:
        return <ClienteFieldset
                  tipoCliente={states.tipoCliente}
                  setTipoCliente={setters.setTipoCliente}
                  formData={states.formData}
                  handleChange={handlers.handleChange}
                  clientes={states.clientes}
                  clienteOptions={computed.clienteOptions}
                  handleClienteChange={handlers.handleClienteChange}
                  numeroDoc={states.numeroDoc}
                  setNumeroDoc={setters.setNumeroDoc}
                  handleBuscarDocumento={handlers.handleBuscarDocumento}
                  buscandoDoc={states.buscandoDoc}
                  docError={states.docError}
                  isEditing={isEditing} // Pasamos isEditing para deshabilitar el cambio de cliente
                />;
      case 2:
        return <PlanSelector
                  planes={states.planes}
                  selectedPlanId={states.formData.plan_id}
                  onSelectPlan={handlers.handleSelectPlan}
                />;
      case 3:
        return <ProgramacionFieldset
                  formData={states.formData}
                  handleChange={handlers.handleChange}
                  diasEmision={states.diasEmision}
                  handleDiasChange={handlers.handleDiasChange}
                  duracionValor={states.duracionValor}
                  setDuracionValor={setters.setDuracionValor}
                  duracionTipo={states.duracionTipo}
                  setDuracionTipo={setters.setDuracionTipo}
                  stockInfo={states.stockInfo}
                  loadingStock={states.loadingStock}
                  planSeleccionado={computed.planSeleccionado}
                  diasTotales={computed.diasTotales}
                  diasEmisionActivos={computed.diasEmisionActivos}
                />;
      case 4:
        return <DetallesFieldset
                  formData={states.formData}
                  handleChange={handlers.handleChange}
                  precioCalculado={computed.precioCalculado}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/75 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        <div className="w-full lg:w-2/3">
          
          <StepperNav 
            steps={steps}
            currentStep={wizard.step}
            goToStep={wizard.goToStep}
          />

          <form id="contrato-wizard-form" onSubmit={handlers.handleSubmit}>
            {renderStepContent()}
          </form>
          
          <WizardControls
            step={wizard.step}
            totalSteps={wizard.totalSteps}
            prevStep={wizard.prevStep}
            nextStep={wizard.nextStep}
            isStepValid={wizard.isStepValid}
            isLoading={states.loading}
            formId="contrato-wizard-form" 
          />
          
          {states.error && <p className="mt-4 text-sm text-red-600 text-center font-semibold">{states.error}</p>}
        </div>

        <ResumenContrato
          plan={computed.planSeleccionado}
          formData={states.formData}
          diasTotales={computed.diasTotales}
          diasEmisionActivos={computed.diasEmisionActivos}
          diasEmision={states.diasEmision}
          precioCalculado={computed.precioCalculado}
        />
      </div>
    </div>
  );
}