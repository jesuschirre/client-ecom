import React from 'react';
import { Link } from 'react-router-dom';
import { HiLockClosed } from 'react-icons/hi';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <HiLockClosed className="text-red-500 w-24 h-24 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
      <p className="text-lg text-gray-600 mb-6">
        No tienes los permisos necesarios para acceder a esta página.
      </p>
      <Link 
        to="/login"
        className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors"
      >
        Volver al Inicio de Sesión
      </Link>
    </div>
  );
}