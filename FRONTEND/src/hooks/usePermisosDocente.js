import { useState, useEffect } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const usePermisosDocente = () => {
  const [permisos, setPermisos] = useState({
    esAdministrador: false,
    tieneIncentivos: false,
    tieneCualificaciones: false,
    loading: true
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const verificarPermisos = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setPermisos(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch(`${gsUrlApi}/interfaces/permisos-docente`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPermisos({
            ...data.permisos,
            loading: false
          });
        } else {
          setError('Error al verificar permisos');
          setPermisos(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        setError(err.message);
        setPermisos(prev => ({ ...prev, loading: false }));
      }
    };

    verificarPermisos();
  }, []);

  return { permisos, error };
}; 