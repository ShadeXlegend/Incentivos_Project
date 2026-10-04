import { lazy } from "react";

// Esta función ayuda a cargar componentes de manera diferida
const lazyLoad = (importFn) => {
  return {
    element: lazy(importFn),
  };
};

// PÚBLICAS (auth)
const publicRoutes = [
  { path: "/auth/login", ...lazyLoad(() => import("../pages/auth/Login")) },
  // { path: "/auth/register", ...lazyLoad(() => import("../pages/auth/Register")) },
  { path: "/auth/logout", ...lazyLoad(() => import("../pages/auth/Logout")) },
  // { path: "/auth/recover-password", ...lazyLoad(() => import("../pages/auth/ResetPassword")) },
  // { path: "/auth/lock-screen", ...lazyLoad(() => import("../pages/auth/LockScreen")) },
];

// ERRORES
const errorRoutes = [
  { path: "/error-404", ...lazyLoad(() => import("../pages/error/Error404")) },
  { path: "/error-500", ...lazyLoad(() => import("../pages/error/Error500")) },
  { path: "*", ...lazyLoad(() => import("../pages/error/Error404")) },
];

// PRIVADAS (acceso por rol/backend)
const privateRoutes = [
  { path: "/inicio", ...lazyLoad(() => import("../pages/inicio")) },
  { path: "/miCuenta", ...lazyLoad(() => import("../pages/miCuenta")) },
  { path: "/CaracterizacionDocentes", ...lazyLoad(() => import("../pages/CaracterizacionDocentes")) },
  { path: "/DocentesForm", ...lazyLoad(() => import("../pages/CaracterizacionDocentes/DocentesForm")) },
  { path: "/GestionFormaciones", ...lazyLoad(() => import("../pages/gestionFormaciones")) },
  { path: "/FormacionesForm", ...lazyLoad(() => import("../pages/gestionFormaciones/FormacionesForm")) },
  { path: "/Usuarios", ...lazyLoad(() => import("../pages/seguridad/usuarios")) },
  { path: "/Roles", ...lazyLoad(() => import("../pages/seguridad/roles")) },
  { path: "/misCualificaciones", ...lazyLoad(() => import("../pages/misCualificaciones")) },
  { path: "/GestionIncentivos", ...lazyLoad(() => import("../pages/gestionIncentivos")) },
  { path: "/proceso-reportes/:id_docente_incentivo", ...lazyLoad(() => import("../pages/procesoReportes")) },
  { path: "/misIncentivos", ...lazyLoad(() => import("../pages/misIncentivos")) },
];

// Exporta todas juntas
export const allPrivateRoutes = privateRoutes;
export const publicRoutesList = publicRoutes;
export const errorRoutesList = errorRoutes;
