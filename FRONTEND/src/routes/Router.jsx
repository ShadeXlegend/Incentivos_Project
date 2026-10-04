import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import ScrollToTop from "@src/components/ScrollToTop";
import DefaultLayout from "../layouts/DefaultLayout";
import VerticalLayout from "../layouts/VerticalLayout";
import ProtectedDocenteRoute from "./ProtectedDocenteRoute";

import {
  publicRoutesList,
  allPrivateRoutes,
  errorRoutesList,
} from "./routes";
import useUserRoutes from "../hooks/useRoutes";

const Router = () => {
  const token = localStorage.getItem("token");
  const { allowedRoutes, loading } = useUserRoutes(token);

  // Esperamos que las rutas estén listas
  if (loading) {
    return <>Cargando rutas...</>;
  }

  // Función para verificar si una ruta está permitida (incluyendo rutas con parámetros)
  const isRouteAllowed = (routePath, allowedRoutes) => {
    const lowerRoutePath = routePath.toLowerCase();
    
    // Verificación exacta
    if (allowedRoutes.includes(lowerRoutePath)) {
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
        return regex.test(lowerRoutePath);
      }
      return false;
    });
  };

  return (
    <BrowserRouter key={token}>
      <ScrollToTop />
      <Routes>
        {publicRoutesList.map((route, idx) => (
          <Route
            key={`public-${idx}`}
            path={route.path}
            element={
              <DefaultLayout>
                <Suspense fallback={<>Cargando...</>}>
                  <route.element />
                </Suspense>
              </DefaultLayout>
            }
          />
        ))}

        {allowedRoutes.length > 0 &&
          allPrivateRoutes
            .filter((route) =>
              isRouteAllowed(route.path, allowedRoutes)
            )
            .map((route, idx) => {
              // Determinar si necesita protección específica de docente
              const rutaBaja = route.path.toLowerCase();
              const requiereIncentivos = rutaBaja.includes('misincentivos');
              const requiereCualificaciones = rutaBaja.includes('miscualificaciones');

              return (
                <Route
                  key={`private-${idx}`}
                  path={route.path}
                  element={
                    <VerticalLayout>
                      <Suspense fallback={<>Cargando...</>}>
                        {requiereIncentivos || requiereCualificaciones ? (
                          <ProtectedDocenteRoute 
                            requiereIncentivos={requiereIncentivos}
                            requiereCualificaciones={requiereCualificaciones}
                          >
                            <route.element />
                          </ProtectedDocenteRoute>
                        ) : (
                          <route.element />
                        )}
                      </Suspense>
                    </VerticalLayout>
                  }
                />
              );
            })}

        {errorRoutesList.map((route, idx) => (
          <Route
            key={`error-${idx}`}
            path={route.path}
            element={
              <DefaultLayout>
                <Suspense fallback={<>Cargando...</>}>
                  <route.element />
                </Suspense>
              </DefaultLayout>
            }
          />
        ))}

        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
