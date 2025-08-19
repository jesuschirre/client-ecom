import React, { useState, useEffect } from "react";

export default function ConfiguracionCorreo() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("http://localhost:3000/api/configuracion/correo")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar la configuración:", err);
        setMessage({ text: "Error al cargar la configuración.", type: "error" });
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "Guardando...", type: "info" });

    try {
      const res = await fetch("http://localhost:3000/api/configuracion/correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error");
      }
      
      setMessage({ text: data.message, type: "success" });
    } catch (err) {
      console.error("Error al guardar:", err);
      setMessage({ text: `Error al guardar: ${err.message}`, type: "error" });
    }
  };

  if (loading) {
    return <p className="text-center p-10">Cargando configuración...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Configuración de Correo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="border p-4 rounded-lg shadow-sm">
          <legend className="text-lg font-semibold px-2">Configuración General</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="proveedor_activo" className="block text-sm font-medium text-gray-700">
                Proveedor de correo activo
              </label>
              <select
                id="proveedor_activo"
                name="proveedor_activo"
                value={config.proveedor_activo || 'gmail'}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="gmail">Gmail</option>
                <option value="corporativo">Corporativo</option>
              </select>
            </div>
            
            {/* ====================================================== */}
            {/* ===== AQUÍ ESTÁ EL NUEVO CAMPO DEL ADMINISTRADOR ===== */}
            {/* ====================================================== */}
            <div>
              <InputField 
                label="Email del Admin para Notificaciones" 
                name="admin_email_notificaciones" 
                type="email" 
                value={config.admin_email_notificaciones || ''} 
                onChange={handleInputChange}
                placeholder="admin@tuempresa.com"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded-lg shadow-sm">
          <legend className="text-lg font-semibold px-2">Configuración Gmail</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField label="Servidor SMTP" name="gmail_servidor" value={config.gmail_servidor || ''} onChange={handleInputChange} />
            <InputField label="Puerto" name="gmail_puerto" type="number" value={config.gmail_puerto || ''} onChange={handleInputChange} />
            <InputField label="Usuario (Email)" name="gmail_usuario" type="email" value={config.gmail_usuario || ''} onChange={handleInputChange} />
            <InputField label="Nombre Remitente" name="gmail_nombre_remitente" value={config.gmail_nombre_remitente || ''} onChange={handleInputChange} />
            <InputField label="Nueva Contraseña" name="gmail_contrasena" type="password" placeholder="Dejar en blanco para no cambiar" onChange={handleInputChange} />
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded-lg shadow-sm">
          <legend className="text-lg font-semibold px-2">Configuración Correo Corporativo</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <InputField label="Servidor SMTP" name="corporativo_servidor" value={config.corporativo_servidor || ''} onChange={handleInputChange} />
            <InputField label="Puerto" name="corporativo_puerto" type="number" value={config.corporativo_puerto || ''} onChange={handleInputChange} />
            <InputField label="Usuario (Email)" name="corporativo_usuario" type="email" value={config.corporativo_usuario || ''} onChange={handleInputChange} />
            <InputField label="Nombre Remitente" name="corporativo_nombre_remitente" value={config.corporativo_nombre_remitente || ''} onChange={handleInputChange} />
            <InputField label="Nueva Contraseña" name="corporativo_contrasena" type="password" placeholder="Dejar en blanco para no cambiar" onChange={handleInputChange} />
          </div>
        </fieldset>
        
        {message.text && (
          <div className={`p-3 rounded text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {message.text}
          </div>
        )}

        <div className="text-right">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

const InputField = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);