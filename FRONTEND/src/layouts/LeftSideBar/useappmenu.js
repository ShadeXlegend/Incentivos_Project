import { useEffect, useState } from 'react';
import { gsUrlApi } from '../../config/ConfigServer';

export default function useAppMenu() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('Token no disponible. No se puede cargar el menú.');
      return;
    }

    fetch(`${gsUrlApi}/interfaces/buscar`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data.interfaces) return;

        const raw = data.interfaces;

        const interfacesFiltradas = raw.filter(i => i.ruta?.toLowerCase() !== "/inicio");

        const padres = interfacesFiltradas.filter(i => !i.parent);
        const hijos = interfacesFiltradas.filter(i => i.parent);

        const finalMenu = padres.map(padre => {
          const children = hijos
            .filter(hijo => hijo.parent === padre.id_interface)
            .sort((a, b) => (a.Orden || 0) - (b.Orden || 0))
            .map(child => ({
              key: child.id_interface,
              label: child.nombre,
              url: child.ruta,
              type: "item"
            }));

          return {
            key: padre.id_interface,
            label: padre.nombre,
            icon: null,
            ...(children.length > 0
              ? { type: "collapse", children }
              : { type: "item", url: padre.ruta })
          };
        });

        setMenuItems(finalMenu.sort((a, b) => (a.Orden || 0) - (b.Orden || 0)));
      })
      .catch(err => {
        console.error("Error al cargar menú:", err);
      });
  }, []);

  return menuItems;
}
