import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Divider,
    Switch, FormControlLabel
} from "@mui/material";
import Cancel from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { PageBreadcrumb } from "components";
import Swal from "sweetalert2";


const UsuariosForm = ({ onCancel, data = {}, onSave }) => {
    const [formData, setFormData] = useState({
        nombres: data.nombres || "",
        id_usuario: data.id_usuario || "",
        apellidos: data.apellidos || "",
        nombre_usuario: data.nombre_usuario || "",
        contraseña: data.contraseña || "",
        id_rol: data.id_rol || 1,
        rol_nombre: data.rol_nombre// por defecto Administrador (1)
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "id_rol" ? parseInt(value) : value,
        }));
    };


    const handleSubmit = async () => {
        const resultado = await onSave(formData);

        if (resultado?.success) {
            Swal.fire({
                icon: 'success',
                title: data?.id_usuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
                text: resultado.mensaje,
                confirmButtonText: 'Aceptar'
            }).then(() => {
                onCancel(); // Cierra el formulario y regresa
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado?.error || 'Ocurrió un error al crear el usuario',
            });
        }
    };


    return (
        <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
            {
            }
            <PageBreadcrumb
                title={data?.id_usuario ? "Editar Usuario" : "Crear Usuario"}
                subName="Administración"
            />

            <Paper elevation={2} sx={{ borderRadius: 4, p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    {data?.id_usuario ? 'ACTUALIZACIÓN DE USUARIO' : 'REGISTRO DE NUEVO USUARIO'}
                </Typography>

                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Fila 1 - Datos personales */}
                    <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        flexWrap="wrap"
                        gap={3}
                    >
                        <TextField
                            fullWidth
                            label="Nombres"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />

                        <TextField
                            fullWidth
                            label="Apellidos"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            sx={{ flex: 1 }}
                        />

                    </Box>
                    <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        flexWrap="wrap"
                        gap={3}
                    >
                        <TextField
                            fullWidth
                            label="Usuario"
                            name="nombre_usuario"
                            value={formData.nombre_usuario}
                            onChange={handleChange}
                        />

                        <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Rol </InputLabel>
                            <Select
                                label="Rol"
                                name="id_rol"
                                value={formData.id_rol}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        id_rol: parseInt(e.target.value),
                                    }))
                                }
                            >
                                <MenuItem value={1}>Administrador</MenuItem>
                                {data.rol_nombre && (
                                    <MenuItem value={2}>Docente</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {/* Activar cambio de contraseña solo si es edición */}
                        {data?.id_usuario && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!formData.mostrarContraseña}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                mostrarContraseña: e.target.checked,
                                                contraseña: "", // Limpiar campo al activar
                                            }))
                                        }
                                    />
                                }
                                label="Actualizar contraseña"
                                sx={{ alignItems: 'center', ml: 1 }}
                            />
                        )}

                        {/* Mostrar campo de contraseña solo si se activa o si es un nuevo usuario */}
                        {(!data.id_usuario || formData.mostrarContraseña) && (
                            <TextField
                                fullWidth
                                label="Contraseña"
                                name="contraseña"
                                type="password"
                                value={formData.contraseña}
                                onChange={handleChange}
                                sx={{ flex: 1 }}
                            />
                        )}

                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box display="flex" justifyContent="center" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
                    <Button variant="contained" color="error" startIcon={<Cancel />} onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DoneAllIcon />}
                        onClick={handleSubmit}
                    >
                        {data?.id_usuario ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </Button>

                </Box>
            </Paper>
        </Box>
    );
};

export default UsuariosForm;
