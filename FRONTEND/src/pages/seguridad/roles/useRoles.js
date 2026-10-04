import { useState, useEffect } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const listarRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${gsUrlApi}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al obtener roles');
      }

      setRoles((data || []).filter(rol => rol.id_rol !== 3));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const obtenerInterfacesPorRol = async (idRol) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${gsUrlApi}/roles/${idRol}/interfaces`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Error al obtener interfaces del rol');
    }

    return data;
  };

  const obtenerTodasLasInterfaces = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${gsUrlApi}/interfaces/listarTodas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Error al obtener interfaces');
    }

    return data.interfaces;
  };

  const guardarInterfacesPorRol = async (idRol, interfaces) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${gsUrlApi}/roles/${idRol}/interfaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ interfaces })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Error al guardar permisos');
    }

    return data;
  };

  const obtenerDatosDePermisosPorRol = async (idRol) => {
    const [todas, asignadas] = await Promise.all([
      obtenerTodasLasInterfaces(),
      obtenerInterfacesPorRol(idRol),
    ]);

    const checked = asignadas.map(i => i.id_interface);

    const vistas = todas.filter(i => i.parent === null && i.nombre !== "Inicio");

    const isSeguridad = (item, lista) => {
      if (item.nombre === "Seguridad") return true;
      let current = item;
      while (current.parent) {
        const parent = lista.find(i => i.id_interface === current.parent);
        if (!parent) break;
        if (parent.nombre === "Seguridad") return true;
        current = parent;
      }
      return false;
    };

    const buildChildren = (parentId) => {
      const hijos = todas.filter(hijo => hijo.parent === parentId);
      return hijos.map(hijo => {
        const subHijos = todas.filter(i => i.parent === hijo.id_interface);
        const isSeg = idRol === 1 && isSeguridad(hijo, todas);

        const baseNode = {
          value: hijo.id_interface,
          label: hijo.nombre,
          ...(isSeg && { disabled: true, title: 'No se puede modificar para este rol' })
        };

        if (subHijos.length > 0) {
          baseNode.children = buildChildren(hijo.id_interface);
        }

        return baseNode;
      });
    };

    const tree = [
      {
        value: "vistas",
        label: "Vistas",
        children: vistas.map(vista => {
          const hijos = todas.filter(hijo => hijo.parent === vista.id_interface);
          const isSeg = idRol === 1 && vista.nombre === "Seguridad";

          const baseNode = {
            value: vista.id_interface,
            label: vista.nombre,
            ...(isSeg && { disabled: true, title: 'No se puede modificar para este rol' })

          };

          if (hijos.length > 0) {
            baseNode.children = buildChildren(vista.id_interface);
          }

          return baseNode;
        }),
      },
    ];

    return { treeData: tree, checked };
  };

  useEffect(() => {
    listarRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    listarRoles,
    setRoles,
    obtenerInterfacesPorRol,
    guardarInterfacesPorRol,
    obtenerTodasLasInterfaces,
    obtenerDatosDePermisosPorRol
  };
};
