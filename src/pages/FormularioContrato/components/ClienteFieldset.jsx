import React, { useMemo } from 'react';
import { HiUser, HiPlus, HiSearch, HiOfficeBuilding, HiMail } from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg';
import Select from 'react-select';

const FieldGroup = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-lg border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">{title}</h3>
        {children}
    </div>
);

const customSelectStyles = (darkMode) => ({
    control: (base, state) => ({
        ...base,
        background: darkMode ? '#1f2937' : '#fff',
        borderColor: state.isFocused ? '#38bdf8' : (darkMode ? '#4b5563' : '#d1d5db'),
        boxShadow: state.isFocused ? '0 0 0 1px #38bdf8' : 'none',
        borderRadius: '0.375rem',
        '&:hover': {
            borderColor: state.isFocused ? '#38bdf8' : (darkMode ? '#556375' : '#a0aec0')
        }
    }),
    input: (base) => ({ ...base, color: darkMode ? '#f3f4f6' : '#111827' }),
    singleValue: (base) => ({ ...base, color: darkMode ? '#f3f4f6' : '#111827' }),
    placeholder: (base) => ({ ...base, color: darkMode ? '#9ca3af' : '#9ca3af' }),
    menu: (base) => ({ ...base, background: darkMode ? '#1f2937' : '#fff', borderRadius: '0.375rem', marginTop: '4px' }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? (darkMode ? '#1e40af' : '#e0f2fe') : 'transparent',
        color: darkMode ? '#e5e7eb' : '#374151',
        '&:active': { backgroundColor: darkMode ? '#1d4ed8' : '#bae6fd' },
    }),
    noOptionsMessage: (base) => ({ ...base, color: darkMode ? '#9ca3af' : '#6b7280' }),
});

export const ClienteFieldset = ({
    tipoCliente, setTipoCliente, formData, handleChange, clientes,
    numeroDoc, setNumeroDoc, handleBuscarDocumento, buscandoDoc, docError,
    clienteOptions: passedClienteOptions, handleClienteChange, isEditing
}) => {

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const clienteOptions = useMemo(() =>
        (passedClienteOptions || clientes.map(cliente => ({
            value: cliente.id,
            label: `${cliente.nombre} (${cliente.correo || 'Sin Correo'})`
        }))), [clientes, passedClienteOptions]);

    const selectedValue = useMemo(() =>
        clienteOptions.find(option => option.value === formData.cliente_id)
    , [clienteOptions, formData.cliente_id]);

    return (
        <FieldGroup title="1. Datos del Cliente">
            {isEditing ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">La edición de contratos no permite cambiar el cliente asociado.</p>
                </div>
            ) : (
                <div className="flex gap-1 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-100 dark:bg-gray-900/50">
                    <button type="button" onClick={() => setTipoCliente('existente')} className={`w-full justify-center px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${tipoCliente === 'existente' ? 'bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/50'}`}><HiUser /> Cliente Existente</button>
                    <button type="button" onClick={() => setTipoCliente('nuevo')} className={`w-full justify-center px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${tipoCliente === 'nuevo' ? 'bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/50'}`}><HiPlus /> Crear Nuevo Cliente</button>
                </div>
            )}
            
            {tipoCliente === 'existente' ? (
                <div>
                    <label htmlFor="cliente_id_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar y Seleccionar Cliente</label>
                    <Select
                        id="cliente_id_select"
                        name="cliente_id"
                        options={clienteOptions}
                        value={selectedValue}
                        onChange={handleClienteChange}
                        isClearable={!isEditing}
                        isDisabled={isEditing}
                        placeholder={isEditing ? (selectedValue ? selectedValue.label : "Cliente no modificable") : "Escribe para buscar un cliente..."}
                        noOptionsMessage={() => "No se encontraron clientes"}
                        styles={customSelectStyles(isDarkMode)}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4 border-t dark:border-gray-700/50">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar por DNI / RUC</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="text" value={numeroDoc} onChange={e => setNumeroDoc(e.target.value)} placeholder="Ingrese DNI o RUC" className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                            <button type="button" onClick={handleBuscarDocumento} disabled={buscandoDoc} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-600 text-white shadow-sm hover:bg-gray-700 disabled:opacity-50 w-32">
                                {buscandoDoc ? <CgSpinner className="animate-spin h-5 w-5" /> : <HiSearch className="h-5 w-5" />} 
                                <span>{buscandoDoc ? 'Buscando...' : 'Buscar'}</span>
                            </button>
                        </div>
                        {docError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{docError}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><HiUser /> Nombre / Razón Social</label>
                        <input type="text" id="nuevo_cliente_nombre" name="nuevo_cliente_nombre" placeholder="(Se autocompleta)" value={formData.nuevo_cliente_nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_direccion" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><HiOfficeBuilding /> Dirección Fiscal</label>
                        <input type="text" id="nuevo_cliente_direccion" name="nuevo_cliente_direccion" placeholder="(Opcional, se autocompleta para RUC)" value={formData.nuevo_cliente_direccion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="nuevo_cliente_email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><HiMail /> Correo Electrónico</label>
                        <input type="email" id="nuevo_cliente_email" name="nuevo_cliente_email" placeholder="contacto@empresa.com" value={formData.nuevo_cliente_email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                    </div>
                </div>
            )}
        </FieldGroup>
    );
};