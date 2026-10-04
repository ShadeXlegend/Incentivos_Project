import { useState } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useMiCuenta = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const actualizarUsuario = async (usuario) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${gsUrlApi}/usuarios/actualizar/${usuario.id_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(usuario),
            });

            const data = await response.json();

            if (data.status === "SUCCEEDED") {
                setSuccessMessage(data.mensaje || "Usuario actualizado correctamente.");
                return { success: true, usuario: data.usuario, mensaje: data.mensaje };
            } else {
                setError(data.error?.message || "Error desconocido");
                return { success: false };
            }
        } catch (err) {
            console.error("Error al actualizar usuario:", err);
            setError(err.message || "Error inesperado");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { actualizarUsuario, loading, error, successMessage };
};
