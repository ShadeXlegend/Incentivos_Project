import { useEffect, useState } from "react";
import { gsUrlApi } from "../config/ConfigServer";

export default function useUserRoutes(token) {
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setAllowedRoutes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`${gsUrlApi}/interfaces/buscar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const rutasBase = data.interfaces?.map((i) => i.ruta?.toLowerCase()) || [];
        
        // Agregar rutas derivadas automáticamente
        const rutasDerivadas = [];
        
        // Si tiene acceso a /gestionincentivos, puede acceder a proceso-reportes
        if (rutasBase.includes('/gestionincentivos')) {
          rutasDerivadas.push('/proceso-reportes/:id_docente_incentivo');
        }
        
        // Si tiene acceso a /caracterizaciondocentes, puede acceder a docentesform
        if (rutasBase.includes('/caracterizaciondocentes')) {
          rutasDerivadas.push('/docentesform');
        }
        
        // Si tiene acceso a /gestionformaciones, puede acceder a formacionesform
        if (rutasBase.includes('/gestionformaciones')) {
          rutasDerivadas.push('/formacionesform');
        }
        
        const todasLasRutas = [...rutasBase, ...rutasDerivadas];
        setAllowedRoutes(todasLasRutas);
      })
      .catch(() => setAllowedRoutes([]))
      .finally(() => setLoading(false));
  }, [token]);

  return { allowedRoutes, loading };
}
