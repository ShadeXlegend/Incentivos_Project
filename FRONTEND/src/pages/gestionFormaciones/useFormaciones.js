import { useState, useEffect } from "react";
import { gsUrlApi } from "@src/config/ConfigServer";
import * as XLSX from "xlsx";

export const useFormaciones = () => {
  const [formaciones, setFormaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listarFormaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(gsUrlApi + "/formacion/listar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.status === "SUCCEEDED") {
        setFormaciones(data.formaciones || []);
        setError(null);
      } else {
        const mensaje =
          data.mensaje || data.error?.message | "Error al listar formaciones.";
        setError(mensaje);
      }
    } catch (err) {
      console.error("Error al listar formaciones:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const crearFormacion = async (nuevaFormacion) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(gsUrlApi + "/formacion/insertar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaFormacion),
      });

      const data = await response.json();

      if (response.ok && data.status === "SUCCEEDED") {
        await listarFormaciones();
        setError(null);
        return { success: true, mensaje: data.mensaje };
      } else {
        const mensaje =
          data.mensaje || data.error?.message || "Error al crear la formación.";
        setError(mensaje);
        return { success: false, mensaje };
      }
    } catch (err) {
      console.error("Error en crearFormacion:", err);
      const mensaje = err.message || "Error inesperado";
      setError(mensaje);
      return { success: false, mensaje };
    }
  };

  const actualizarFormacion = async (idFormacion, datosActualizados) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${gsUrlApi}/formacion/actualizar/${idFormacion}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosActualizados),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "SUCCEEDED") {
        await listarFormaciones();
        setError(null);
        return { success: true, mensaje: data.mensaje };
      } else {
        const mensaje =
          data.mensaje ||
          data.error?.message || "Error al actualizar la formación.";
        setError(mensaje);
        return { success: false, mensaje };
      }
    } catch (err) {
      console.error("Error en actualizarFormacion:", err);
      const mensaje = err.message || "Error inesperado";
      setError(mensaje);
      return { success: false, mensaje };
    }
  };

  const eliminarFormacion = async (idFormacion) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${gsUrlApi}/formacion/eliminar/${idFormacion}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "SUCCEEDED") {
        await listarFormaciones();
        setError(null);
        return { success: true, mensaje: data.mensaje };
      } else {
        const mensaje =
          data.mensaje ||
          data.error?.message || "Error al eliminar la formación.";
        setError(mensaje);
        return { success: false, mensaje };
      }
    } catch (err) {
      console.error("Error en eliminarFormacion:", err);
      const mensaje = err.message || "Error inesperado";
      setError(mensaje);
      return { success: false, mensaje };
    }
  };

  const cargarFormacionesMasivo = async (datos) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${gsUrlApi}/formacion/cargaMasiva`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "SUCCEEDED") {
        throw new Error(data.failure_message || "Error al cargar formaciones");
      }

      await listarFormaciones();

      const resultados = data.resultados || [];

      const exitosos = resultados.filter(
        (r) => r.mensaje == "Formación creada correctamente"
      );

      const yaExistentes = resultados.filter(
        (r) => r.mensaje == "La formación ya existe en la base de datos."
      );

      const fallidos = resultados.filter(
        (r) => r.mensaje == "Error al insertar esta formación"
      );

      return {
        status: "SUCESSED",
        mensaje: data.mensaje || "Proceso masivo finalizado",
        resumen: {
          exitosos,
          yaExistentes,
          fallidos,
        },
      };
    } catch (err) {
      console.error("Error al cargar formaciones:", err);
      return {
        success: false,
        error: err.message || "Error inesperado",
      };
    }
  };

  useEffect(() => {
    listarFormaciones();
  }, []);

  return {
    formaciones,
    loading,
    error,
    listarFormaciones,
    crearFormacion,
    eliminarFormacion,
    actualizarFormacion,
    cargarFormacionesMasivo,
  };
};
