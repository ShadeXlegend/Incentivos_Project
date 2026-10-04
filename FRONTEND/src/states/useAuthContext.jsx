import { deleteCookie, hasCookie, setCookie, getCookie } from "cookies-next";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Usa una clave constante para las cookies
const authSessionKey = "authToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  // Cargar la sesión desde las cookies cuando el componente se monta
  useEffect(() => {
    const savedUser = getCookie(authSessionKey);
    if (savedUser) {
      setUser(JSON.parse(savedUser));  // Parseamos el JSON guardado en las cookies
    }
  }, []);

  const saveSession = user => {
    setCookie(authSessionKey, JSON.stringify(user));
    setUser(user);
  };

  const removeSession = () => {
    deleteCookie(authSessionKey);
    setUser(undefined);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: hasCookie(authSessionKey),
        saveSession,
        removeSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}