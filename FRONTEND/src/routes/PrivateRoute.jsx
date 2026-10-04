import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../states";
import useUserRoutes from "../hooks/useRoutes"; // Asegúrate de que esté bien importado

// eslint-disable-next-line no-unused-vars
export const RouteWrapper = ({ component: RouteComponent }) => {
  return <RouteComponent />;
};

// eslint-disable-next-line no-unused-vars
export const PrivateRouteWrapper = ({ component: RouteComponent }) => {
  const { isAuthenticated } = useAuthContext();
  const allowedRoutes = useUserRoutes();
  const location = useLocation();

  // Mientras carga el menú dinámico, no mostramos nada
  if (!allowedRoutes || allowedRoutes.length === 0) return null;

  const currentPath = location.pathname.toLowerCase();

  // Si no está autenticado, redirige a login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Función para verificar si una ruta está permitida (incluyendo rutas con parámetros)
  const isRouteAllowed = (currentPath, allowedRoutes) => {
    // Verificación exacta
    if (allowedRoutes.includes(currentPath)) {
      return true;
    }
    
    // Verificación de rutas con parámetros
    return allowedRoutes.some(allowedRoute => {
      if (allowedRoute.includes(':')) {
        // Convertir ruta con parámetros a regex
        const routePattern = allowedRoute
          .replace(/:[^/]+/g, '[^/]+') // Reemplazar :param con [^/]+
          .replace(/\//g, '\\/'); // Escapar barras
        
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(currentPath);
      }
      return false;
    });
  };

  // Si la ruta no está permitida por el backend (interfaces), redirige a /404 o /403
  if (!isRouteAllowed(currentPath, allowedRoutes)) {
    return <Navigate to="/error-404" replace />;
  }

  return <RouteComponent />;
};
