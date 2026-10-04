import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Avatar,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    AccountCircle,
    AssignmentInd,
    Person,
    LockOpen,
    Cancel,
    DoneAll
} from '@mui/icons-material';
import { MdOutlinePassword } from "react-icons/md";
import { useMiCuenta } from '@src/pages/miCuenta/useCuenta';
import { PageBreadcrumb } from "components";
import AvatarIcon from '../../assets/images/avatars/avatar2.png';
import Swal from 'sweetalert2';

const MiCuenta = () => {
    const usuario = JSON.parse(localStorage.getItem('Usuario'));

    const [usuarioEditado, setUsuarioEditado] = useState({
        ...usuario,
        nueva_contraseña: ''
    });
    const [editing, setEditing] = useState(false);
    const { actualizarUsuario, loading } = useMiCuenta();

    // Detecta si hay cambios en usuario o en nueva_contraseña
    const seHaEditado =
        editing ||
        usuarioEditado.nombre_usuario !== usuario.nombre_usuario ||
        usuarioEditado.nueva_contraseña.length > 0;

    const handleGuardarCambios = async () => {
        if (!usuarioEditado.nombre_usuario.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'El nombre de usuario no puede estar vacío.',
                confirmButtonColor: '#d33',
            });
            return;
        }
        const payload = {
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuarioEditado.nombre_usuario,
            ...(usuarioEditado.nueva_contraseña && { nueva_contraseña: usuarioEditado.nueva_contraseña })
        };
        const resultado = await actualizarUsuario(payload);

        if (resultado.success) {
            setEditing(false);
            setUsuarioEditado({ ...resultado.usuario, nueva_contraseña: '' });

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: resultado.mensaje || 'Tus datos se actualizaron correctamente.',
                confirmButtonColor: '#3085d6',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar tu cuenta.',
                confirmButtonColor: '#d33',
            });
        }
    };


    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            <PageBreadcrumb title="Mi cuenta" subName="App" />
            <Paper elevation={2} sx={{ borderRadius: 4, p: 4, minHeight: "50vh" }}>
                {/* DATOS PERSONALES */}
                <Divider sx={{ mb: 3, fontWeight: 'bold' }}>
                    DATOS PERSONALES
                </Divider>
                <Avatar
                    alt={`${usuario.nombres} ${usuario.apellidos}`}
                    src={AvatarIcon}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 4 }}
                />

                <Box sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    mb: 4
                }}>
                    <TextField
                        label="Nombre completo"
                        fullWidth
                        disabled
                        value={`${usuario.nombres} ${usuario.apellidos}`}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        label="Rol"
                        fullWidth
                        disabled
                        value={usuario.rol_nombre}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AssignmentInd />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                {/* DATOS DE CUENTA */}
                <Divider sx={{ mb: 3, fontWeight: 'bold' }} />

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        // En pantallas md+ uso 3 columnas (usuario / contraseña / botón).
                        // En pantallas xs apilan en 1 sola columna.
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: editing ? '1fr 1fr auto' : '2fr auto'
                        },
                        alignItems: 'center',
                        mb: 4
                    }}
                >
                    {/* Campo Usuario */}
                    <TextField
                        label="Usuario"
                        fullWidth
                        disabled={!editing}
                        value={usuarioEditado.nombre_usuario}
                        onChange={e =>
                            setUsuarioEditado({ ...usuarioEditado, nombre_usuario: e.target.value })
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person />
                                </InputAdornment>
                            )
                        }}
                    />

                    {/* Nuevo campo de contraseña, sólo si editing=true */}
                    {editing && (
                        <TextField
                            label="Nueva contraseña"
                            type="password"
                            fullWidth
                            value={usuarioEditado.nueva_contraseña}
                            onChange={e =>
                                setUsuarioEditado({ ...usuarioEditado, nueva_contraseña: e.target.value })
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOpen />
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}

                    {/* Botón toggle */}
                    <Button
                        variant="outlined"
                        color={editing ? 'error' : 'primary'}
                        startIcon={<MdOutlinePassword />}
                        onClick={() => {
                            // al cancelar edición, limpia contraseña
                            if (editing) {
                                setUsuarioEditado({ ...usuario, nueva_contraseña: '' });
                            }
                            setEditing(!editing);
                        }}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {editing ? 'Cancelar edición' : 'Editar usuario y contraseña'}
                    </Button>
                </Box>


                {/* BOTONES GUARDAR / CANCELAR */}
                {seHaEditado && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {/* <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => {
                                setUsuarioEditado({ ...usuario, nueva_contraseña: '' });
                                setEditing(false);
                            }}
                        >
                            Cancelar
                        </Button> */}
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<DoneAll />}
                            onClick={handleGuardarCambios}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default MiCuenta;
