import React, { useState, useEffect } from "react";
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiSave } from "react-icons/hi";

// --- Componentes de UI Reutilizables (sin cambios) ---
const Card = ({ title, children }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8">
    <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
    </div>
    <div className="px-4 py-6 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
      {children}
    </div>
  </div>
);
const InputField = ({ label, name, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900 mb-2">{label}</label>
    <input id={name} name={name} {...props} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 transition-all" />
  </div>
);
const SelectField = ({ label, name, children, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900 mb-2">{label}</label>
    <select id={name} name={name} {...props} className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6">{children}</select>
  </div>
);
const Notification = ({ message, type }) => {
  if (!message) return null;
  const styles = {
    success: { container: "bg-green-50 text-green-700", icon: <HiCheckCircle className="h-5 w-5 text-green-500" /> },
    error: { container: "bg-red-50 text-red-800", icon: <HiExclamationCircle className="h-5 w-5 text-red-500" /> },
    info: { container: "bg-blue-50 text-blue-800", icon: <HiInformationCircle className="h-5 w-5 text-blue-500" /> },
  };
  return (
    <div className={`flex items-center gap-3 p-4 mt-6 rounded-lg text-sm font-medium ${styles[type]?.container}`}>
      {styles[type]?.icon}
      <span>{message}</span>
    </div>
  );
};

// --- Componente Principal ---
export default function ConfiguracionCorreo() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  // La lógica de fetch y manejo de estado no cambia
  useEffect(() => {
    fetch("http://localhost:3000/api/configuracion/correo")
      .then((res) => res.json())
      .then((data) => { setConfig(data); setLoading(false); })
      .catch((err) => { setMessage({ text: "Error al cargar la configuración.", type: "error" }); setLoading(false); });
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "Guardando...", type: "info" });
    try {
      const res = await fetch("http://localhost:3000/api/configuracion/correo", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error");
      setMessage({ text: data.message, type: "success" });
    } catch (err) {
      setMessage({ text: `Error al guardar: ${err.message}`, type: "error" });
    }
  };

  if (loading) { return <div className="p-10 text-center text-gray-500">Cargando configuración...</div>; }

  return (
    <div className="bg-gray-50/50 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="pb-6 border-b border-gray-200 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Configuración de Correo</h2>
          <p className="mt-2 text-sm text-gray-600">Administra los ajustes para el envío de correos desde la plataforma.</p>
        </div>
        
        {/* LA CORRECCIÓN CLAVE ES ASEGURARSE DE QUE SOLO HAYA UN <form> ENVOLVIENDO TODO */}
        <form onSubmit={handleSubmit}>
          <Card title="Configuración General">
            <SelectField label="Proveedor de correo activo" name="proveedor_activo" value={config.proveedor_activo || 'gmail'} onChange={handleInputChange}>
              <option value="gmail">Gmail</option>
              <option value="corporativo">Corporativo</option>
            </SelectField>
            <InputField label="Email del Admin para Notificaciones" name="admin_email_notificaciones" type="email" value={config.admin_email_notificaciones || ''} onChange={handleInputChange} placeholder="admin@tuempresa.com" />
          </Card>
          <Card title="Ajustes de Gmail">
            <InputField label="Servidor SMTP" name="gmail_servidor" value={config.gmail_servidor || ''} onChange={handleInputChange} />
            <InputField label="Puerto" name="gmail_puerto" type="number" value={config.gmail_puerto || ''} onChange={handleInputChange} />
            <InputField label="Usuario (Email)" name="gmail_usuario" type="email" value={config.gmail_usuario || ''} onChange={handleInputChange} />
            <InputField label="Nombre Remitente" name="gmail_nombre_remitente" value={config.gmail_nombre_remitente || ''} onChange={handleInputChange} />
            <InputField label="Nueva Contraseña" name="gmail_contrasena" type="password" placeholder="Dejar en blanco para no cambiar" onChange={handleInputChange} />
          </Card>
          <Card title="Ajustes de Correo Corporativo">
            <InputField label="Servidor SMTP" name="corporativo_servidor" value={config.corporativo_servidor || ''} onChange={handleInputChange} />
            <InputField label="Puerto" name="corporativo_puerto" type="number" value={config.corporativo_puerto || ''} onChange={handleInputChange} />
            <InputField label="Usuario (Email)" name="corporativo_usuario" type="email" value={config.corporativo_usuario || ''} onChange={handleInputChange} />
            <InputField label="Nombre Remitente" name="corporativo_nombre_remitente" value={config.corporativo_nombre_remitente || ''} onChange={handleInputChange} />
            <InputField label="Nueva Contraseña" name="corporativo_contrasena" type="password" placeholder="Dejar en blanco para no cambiar" onChange={handleInputChange} />
          </Card>
          <Notification message={message.text} type={message.type} />
          <div className="flex justify-end mt-8">
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors">
              <HiSave className="h-5 w-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}