import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Importamos iconos para la lista de características y el botón de carga
import { HiChartPie, HiUsers, HiOutlineNewspaper, HiOutlineCog } from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";

// Componente para la columna izquierda (la vista previa)
const FeaturePreview = () => (
  <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-sky-600 to-cyan-500 text-white">
    <h2 className="text-3xl font-bold mb-4">Panel de Control E-commerce</h2>
    <p className="text-sky-100 mb-8">
      Gestiona tu tienda de manera eficiente con nuestras herramientas de administración.
    </p>
    <ul className="space-y-4">
      <li className="flex items-center gap-3">
        <HiChartPie className="w-6 h-6 text-sky-300" />
        <span>Dashboard con métricas clave.</span>
      </li>
      <li className="flex items-center gap-3">
        <HiUsers className="w-6 h-6 text-sky-300" />
        <span>Administración de usuarios y roles.</span>
      </li>
      <li className="flex items-center gap-3">
        <HiOutlineNewspaper className="w-6 h-6 text-sky-300" />
        <span>Gestión de peticiones de vendedores.</span>
      </li>
      <li className="flex items-center gap-3">
        <HiOutlineCog className="w-6 h-6 text-sky-300" />
        <span>Configuración avanzada del sistema.</span>
      </li>
    </ul>
  </div>
);

// Componente principal de Login
export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
        
        {/* Columna Izquierda: Vista Previa de Características */}
        <FeaturePreview />

        {/* Columna Derecha: Formulario de Inicio de Sesión */}
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <svg className="h-12 w-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
          <p className="text-center text-sm text-gray-600 mt-1 mb-8">
            Accede al panel de administración.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="block w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center !mt-4">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 font-bold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-400 transition-colors"
              >
                {loading ? (
                  <>
                    <CgSpinner className="animate-spin h-5 w-5" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}