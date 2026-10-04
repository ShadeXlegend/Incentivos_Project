import { useState, useEffect } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useCaracterizacionDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [formaciones, setFormaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listarDocentes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${gsUrlApi}/usuarioDocente/listar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      const contentType = response.headers.get('content-type');
      let data = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        console.error(`Respuesta no JSON. Código: ${response.status}`);
        throw new Error(`Respuesta inválida del servidor (${response.status})`);
      }

      if (response.ok && data.status === "SUCCEEDED") {
        setDocentes(data.usuarios_docentes || []);
        setError(null);
      } else {
        const mensaje = data?.error?.message || 'Error al listar docentes.';
        console.error('Error del backend:', mensaje);
        setError(mensaje);
      }
    } catch (err) {
      console.error('Excepción al listar docentes:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const listarFormaciones = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${gsUrlApi}/formacion/listar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok && data.status === "SUCCEEDED") {
        setFormaciones(data || []);
      } else {
        console.error('Error al listar formaciones:', data);
      }
    } catch (error) {
      console.error('Error al obtener formaciones:', error);
    }
  };

  const insertarCualificaciones = async (formacionesActuales, id_docente, formacionesPrevias = []) => {
    const token = localStorage.getItem("token");

    const idsExistentes = formacionesPrevias.map(f => f.id_formacion);

    const nuevasFormaciones = formacionesActuales.filter(
      f => !idsExistentes.includes(f.id_formacion)
    );

    if (!nuevasFormaciones.length) {
      return { success: false, message: "No hay formaciones nuevas para registrar." };
    }

    const nuevasInsertadas = [];

    try {
      for (const f of nuevasFormaciones) {
        const año = f.año || (f.fecha_terminacion ? new Date(f.fecha_terminacion).getFullYear() : null);
        const formData = new FormData();

        formData.append("id_formacion", f.id_formacion);
        formData.append("cursado", año);
        formData.append("id_docente", id_docente);

        if (f.certificadoArchivo) {
          formData.append("certificado", f.certificadoArchivo); 
        }
        const res = await fetch(`${gsUrlApi}/cualificacion/insertar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok || data.status !== "SUCCEEDED") {
          throw new Error(data.failure_message || "Error al insertar cualificación.");
        }

        nuevasInsertadas.push(data.data);
      }
      return {
        success: true,
        mensaje: "Formaciones registradas correctamente.",
        nuevasFormaciones: nuevasInsertadas
      };

    } catch (err) {
      console.error("Error al insertar cualificaciones:", err);
      return { success: false, message: err.message };
    }
  };

  const subirCertificadoCualificacion = async (idCualificacion, archivoPDF) => {
    const token = localStorage.getItem("token");

    if (!idCualificacion || !archivoPDF) {
      return { success: false, message: "Datos incompletos para subir el certificado." };
    }

    const formData = new FormData();
    formData.append("certificado", archivoPDF);

    try {
      const response = await fetch(`${gsUrlApi}/cualificacion/subirCertificado/${idCualificacion}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.status === "SUCCEEDED") {
        return { success: true, mensaje: data.mensaje };
      } else {
        return { success: false, message: data.failure_message || "Error al subir el certificado." };
      }
    } catch (error) {
      console.error("Error en la subida del certificado:", error);
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    listarDocentes();
    listarFormaciones();
  }, []);

  return {
    docentes,
    formaciones,
    loading,
    error,
    listarDocentes,
    listarFormaciones,
    insertarCualificaciones,
    subirCertificadoCualificacion
  };
};
