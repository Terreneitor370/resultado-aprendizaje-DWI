import React, { useState, useEffect, createContext } from "react";
import { setToken, getToken, removeToken } from "../api/token";
import { useUser } from "../hooks/useUser";

// 1. Crear el contexto
export const AuthContext = createContext({
  auth: undefined,
  login: () => null,
  logout: () => null,
});

// 2. Crear el provider
export function AuthProvider({ children }) {
  // undefined = verificando sesion, null = sin sesion, objeto = sesion activa
  const [auth, setAuth] = useState(undefined);
  const { getMe } = useUser();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuth(null);
      return;
    }
    // Si el token guardado ya expiro o es invalido, se limpia la sesion
    login(token).catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (token) => {
    const me = await getMe(token); // si falla no se guarda el token
    setToken(token);
    setAuth({ token, me });
  };

  const logout = () => {
    removeToken();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
