import { useEffect, useState } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useIncentivos = () => {
  const [incentivos, setIncentivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const listarIncentivos = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${gsUrlApi}/incentivos/listar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (resp.ok) {
        setIncentivos(data.incentivos || []);
        setError(null);
      } else {
        setError(data.message || 'Error al listar incentivos');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crearIncentivo = async (nuevo) => {
    try {
      const formData = new FormData();
      Object.entries(nuevo).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const resp = await fetch(`${gsUrlApi}/incentivos/insertar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok) {
        await listarIncentivos();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const actualizarIncentivo = async (id, cambios) => {
    try {
      const formData = new FormData();
      Object.entries(cambios).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const resp = await fetch(`${gsUrlApi}/incentivos/actualizar/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok) {
        await listarIncentivos();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const eliminarIncentivo = async (id) => {
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/eliminar/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (resp.ok) {
        await listarIncentivos();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const asignarIncentivo = async ({ id_incentivo, id_docente, fecha_asignacion }) => {
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/asignar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_incentivo, id_docente, fecha_asignacion }),
      });
      const data = await resp.json();
      if (resp.ok) return { success: true, asignacion: data.asignacion };
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    listarIncentivos();
    // eslint-disable-next-line
  }, []);

  return {
    incentivos,
    loading,
    error,
    listarIncentivos,
    crearIncentivo,
    actualizarIncentivo,
    eliminarIncentivo,
    asignarIncentivo,
  };
}; 