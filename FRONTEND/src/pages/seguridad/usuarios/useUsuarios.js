import { useState, useEffect } from "react";
import { gsUrlApi } from "@src/config/ConfigServer";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const insertarAdmin = async (datos) => {
    try {
      const response = await fetch(`${gsUrlApi}/usuarios/insertarAdmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "SUCCEEDED") {
        throw new Error(data.mensaje || "Error al crear administrador");
      }
      await listarUsuarios(); // Actualizar la lista de usuarios después de insertar
      return { success: true, mensaje: data.mensaje };
    } catch (err) {
      console.error("Error al crear administrador:", err);
      return { success: false, error: err.message };
    }
  };

  // Insertar usuario docente individual
  const insertarDocentesMasivo = async (datos) => {
    try {
      const response = await fetch(`${gsUrlApi}/usuarios/insertarDocentes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "SUCCEEDED") {
        throw new Error(data.failure_message || "Error al crear docentes");
      }

      await listarUsuarios(); // Refresca la lista actualizada

      const resultados = data.resultados || [];

      const exitosos = resultados.filter(
        (r) => r.status === "SUCCEEDED" && !r.mensaje.includes("ya existe")
      );
      const yaExistentes = resultados.filter(
        (r) => r.status === "SUCCEEDED" && r.mensaje.includes("ya existe")
      );
      const fallidos = resultados.filter((r) => r.status !== "SUCCEEDED");

      return {
        success: true,
        mensaje: data.mensaje || "Proceso masivo finalizado",
        resumen: {
          exitosos,
          yaExistentes,
          fallidos,
        },
      };
    } catch (err) {
      console.error("Error al crear docentes:", err);
      return {
        success: false,
        error: err.message || "Error inesperado",
      };
    }
  };

  const listarUsuarios = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${gsUrlApi}/usuarios/listar`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Error al obtener usuarios");
      }

      const usuarioActual = JSON.parse(localStorage.getItem("Usuario"));
      const idUsuarioActual = usuarioActual?.id_usuario;

      const usuariosFiltrados = (data.usuarios || []).filter(
        (u) => u.id_usuario !== idUsuarioActual
      );

      setUsuarios(usuariosFiltrados);
      setError(null);
    } catch (err) {
      console.error("Error al listar usuarios:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (id_usuario, datos) => {
    try {
      const response = await fetch(
        `${gsUrlApi}/usuarios/actualizar/${id_usuario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "SUCCEEDED") {
        throw new Error(data.failure_message || "Error al actualizar usuario");
      }

      await listarUsuarios();
      return {
        success: true,
        mensaje: data.mensaje,
        usuario: data.usuario || null,
      };
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      return {
        success: false,
        error: err.message || "Error inesperado",
      };
    }
  };

  const eliminarUsuario = async (id_usuario) => {
    try {
      const response = await fetch(
        `${gsUrlApi}/usuarios/eliminar/${id_usuario}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al eliminar usuario");
      }

      await listarUsuarios(); // Actualizar la lista de usuarios después de eliminar
      return { success: true, mensaje: data.mensaje };
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    listarUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    listarUsuarios,
    setUsuarios,
    eliminarUsuario,
    insertarAdmin,
    insertarDocentesMasivo,
    actualizarUsuario,
  };
};
