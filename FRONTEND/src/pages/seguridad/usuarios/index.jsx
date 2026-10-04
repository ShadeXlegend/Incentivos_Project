import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    MenuItem,
    IconButton,
    Modal,
    Menu,
    Pagination
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageBreadcrumb } from "components";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ModalCargaMasiva from "./ModalCargaMasiva";
import UsuariosForm from "./UsuariosForm";
import FiltrosUsuarios from "./filtrosUsuarios";
import { useUsuarios } from "./useUsuarios"; // Ajusta la ruta según tu proyecto
import Swal from 'sweetalert2';


const GestionUsuarios = () => {
    const { usuarios, eliminarUsuario, insertarAdmin, insertarDocentesMasivo, actualizarUsuario } = useUsuarios();
    const [busqueda, setBusqueda] = useState("");
    const [page, setPage] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorAddUser, setAnchorAddUser] = useState(null);
    const [modalCargaMasivaOpen, setModalCargaMasivaOpen] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [filtroRol, setFiltroRol] = useState("Todos");
    const itemsPerPage = 10;

    const usuariosFiltrados = usuarios.filter((u) => {
        const cumpleBusqueda =
            u.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase());

        const cumpleRol =
            filtroRol === "Todos" || u.rol_nombre?.toLowerCase() === filtroRol.toLowerCase();

        return cumpleBusqueda && cumpleRol;
    });



    const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const usuariosPaginados = usuariosFiltrados.slice(startIndex, startIndex + itemsPerPage);


    const confirmarEliminacion = (usuario) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el usuario "${usuario.nombres}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resultDelete = await eliminarUsuario(usuario.id_usuario);

                if (resultDelete.success) {
                    Swal.fire('Eliminado', resultDelete.mensaje, 'success');
                } else {
                    Swal.fire('Error', resultDelete.error, 'error');
                }
            }
        });
    };

    const handleEditar = (usuario) => {
        const usuarioFormateado = {
            id_usuario: usuario.id_usuario, // NECESARIO para poder actualizar
            nombres: usuario.nombres || "",
            apellidos: usuario.apellidos || "",
            nombre_usuario: usuario.nombre_usuario || "",
            id_rol: usuario.id_rol || 1,
            rol_nombre: usuario.rol_nombre
        };

        setUsuarioEditando(usuarioFormateado);
        setMostrarFormulario(true);
    };


    const handleCancelar = () => {
        setUsuarioEditando(null);
        setMostrarFormulario(false);
    };

    const handlePageChange = (_, value) => setPage(value);
    const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            {mostrarFormulario ? (
                <UsuariosForm onCancel={handleCancelar} data={usuarioEditando || {}}
                    onSave={usuarioEditando ? (data) => actualizarUsuario(usuarioEditando.id_usuario, data) : insertarAdmin} />
            ) : (
                <>
                    <PageBreadcrumb title="Gestión de Usuarios" subName="App" />
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 4 }}>
                        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} mb={4}>
                            <TextField
                                label="Buscar usuario"
                                variant="outlined"
                                size="small"
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPage(1);
                                }}
                                sx={{ width: { xs: "100%", md: "50%" } }}
                            />
                            <Box display="flex" gap={1}>
                                <Button
                                    color="primary"
                                    startIcon={<FilterListIcon />}
                                    onClick={handleOpenMenu}
                                >
                                    Filtros
                                </Button>
                                <FiltrosUsuarios anchorEl={anchorEl} handleClose={handleCloseMenu} onAplicarFiltros={({ rol }) => {
                                    setFiltroRol(rol);
                                    setPage(1);
                                }} />

                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AddIcon />}
                                    onClick={(e) => setAnchorAddUser(e.currentTarget)}
                                >
                                    Agregar usuario
                                </Button>

                                <Menu anchorEl={anchorAddUser} open={Boolean(anchorAddUser)} onClose={() => setAnchorAddUser(null)}>
                                    <MenuItem
                                        onClick={() => {
                                            setAnchorAddUser(null);
                                            setUsuarioEditando(null);  // limpiar edición
                                            setMostrarFormulario(true);
                                        }}
                                    >
                                        Administrador
                                    </MenuItem>
                                    <MenuItem onClick={() => { setAnchorAddUser(null); setModalCargaMasivaOpen(true); }}>
                                        Docentes
                                    </MenuItem>
                                </Menu>

                            </Box>
                        </Box>

                        <Box sx={{
                            maxHeight: 500, overflowY: "auto", pr: 1, scrollbarWidth: "thin", scrollbarColor: "#ccc transparent",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                backgroundColor: "transparent",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#b0b0b0",
                                borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                                backgroundColor: "#888",
                            },
                        }}>
                            {usuariosPaginados.length > 0 ? (
                                usuariosPaginados.map((user) => (
                                    <Paper
                                        key={user.id_usuario}
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            mb: 2,
                                            borderRadius: 2,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {user.nombres}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Usuario: {user.nombre_usuario}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Rol: {user.rol_nombre}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" gap={1}>
                                            <IconButton color="primary" onClick={() => handleEditar(user)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => confirmarEliminacion(user)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                ))
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                                    <Typography variant="body1" color="text.secondary">
                                        No hay coincidencias
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box display="flex" justifyContent="center" mt={2}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                        </Box>
                    </Paper>
                </>
            )}

            <ModalCargaMasiva
                open={modalCargaMasivaOpen}
                onClose={() => setModalCargaMasivaOpen(false)}
                onDataParsed={(datos) => {
                    console.log("Datos cargados:", datos);

                }}
                insertarDocentesMasivo={insertarDocentesMasivo}
            />

        </Box>
    );
};

export default GestionUsuarios;
