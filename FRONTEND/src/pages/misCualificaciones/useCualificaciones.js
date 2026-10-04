import { useState, useEffect } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useCualificaciones = (idUsuario) => {
    const [cualificaciones, setCualificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const obtenerCualificaciones = async () => {
        setLoading(true);
        try {

            const response = await fetch(`${gsUrlApi}/cualificacion/obtenerPorUsuario?id_usuario=${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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
                setCualificaciones(data.cualificaciones || []);
                setError(null);
            } else {
                const mensaje = data?.error?.message || 'Error al obtener cualificaciones.';
                console.error('Error del backend:', mensaje);
                setError(mensaje);
            }
        } catch (err) {
            console.error('Excepción al obtener cualificaciones:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idUsuario) {
            obtenerCualificaciones();
        }
    }, [idUsuario]);

    return {
        cualificaciones,
        loading,
        error,
        refetch: obtenerCualificaciones,
    };
};
