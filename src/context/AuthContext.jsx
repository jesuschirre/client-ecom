import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Creamos el contexto. Es como crear una caja vacía para nuestros datos de login.
const AuthContext = createContext();

// 2. Creamos el "Proveedor", que es el componente que llenará la caja y la compartirá.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // Para saber si estamos verificando el login inicial

  // Este efecto se ejecuta solo una vez cuando la app carga
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('user');

    if (tokenGuardado && userGuardado) {
      // Si encontramos datos en el navegador, los cargamos en nuestro estado.
      setToken(tokenGuardado);
      setUser(JSON.parse(userGuardado));
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Terminamos de verificar
  }, []);

  const login = async (correo, password) => {
    // Llamamos a la ruta del backend que creamos en el paso anterior
    const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
    });
    
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
    }

    // Si todo sale bien, actualizamos nuestro "cerebro" (el estado)
    setUser(data.usuario);
    setToken(data.token);
    setIsAuthenticated(true);

    // Y guardamos los datos en el navegador para no perderlos si se recarga la página
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
  };

  const logout = () => {
    // Limpiamos el estado
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Y borramos los datos del navegador
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Estos son los datos y funciones que compartiremos con toda la app
  const value = { user, token, isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Creamos un "atajo" (un hook) para que usar el contexto sea más fácil
export const useAuth = () => {
  return useContext(AuthContext);
};