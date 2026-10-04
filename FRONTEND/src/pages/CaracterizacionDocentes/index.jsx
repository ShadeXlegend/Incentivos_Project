import React, { useState } from "react";
import {
    Grid,
    TextField,
    Button,
    Typography,
    Paper,
    Menu,
    Box,
    Pagination,
    IconButton,
    CircularProgress,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageBreadcrumb } from "components";
import DocentesForm from "./DocentesForm";
import { useCaracterizacionDocentes } from "./useCaracterizacionDocentes";

const itemsPerPage = 10;

const CaracterizacionDocentes = () => {
    const {
        docentes,
        loading,
        error,
    } = useCaracterizacionDocentes();

    const [busqueda, setBusqueda] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [page, setPage] = useState(1);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [docenteEditando, setDocenteEditando] = useState(null);

    const openMenu = Boolean(anchorEl);
    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);
    const handlePageChange = (_, value) => setPage(value);

    const docentesFiltrados = docentes.filter((docente) => {
        const nombreCompleto = `${docente.nombre || ""} ${docente.apellidos || ""}`.toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase());
    });

    const totalPages = Math.ceil(docentesFiltrados.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const docentesPaginados = docentesFiltrados.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            {mostrarFormulario ? (
                <DocentesForm
                    data={docenteEditando || {}}
                    onCancel={() => {
                        setMostrarFormulario(false);
                        setDocenteEditando(null);
                    }}
                />
            ) : (
                <>
                    <PageBreadcrumb title="Caracterización de Docentes" subName="App" />
                    <Paper elevation={2} sx={{ borderRadius: 4, p: 4 }}>
                        <Grid container spacing={2} justifyContent="space-between" alignItems="center" mb={3}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar docente..."
                                    variant="outlined"
                                    size="small"
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md="auto" display="flex" gap={2}>
                                <Button
                                    color="inherit"
                                    onClick={handleOpenMenu}
                                    startIcon={<FilterListIcon />}
                                    sx={{ textTransform: "none" }}
                                >
                                    Filtros
                                </Button>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleCloseMenu}
                                    slotProps={{
                                        paper: {
                                            elevation: 3,
                                            sx: { mt: 1.5, minWidth: 300, px: 2, py: 2 },
                                        },
                                    }}
                                >
                                    <Box component="form" noValidate sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                        <Button variant="contained" onClick={handleCloseMenu}>
                                            Aplicar
                                        </Button>
                                    </Box>
                                </Menu>

                                <Button variant="contained" color="primary" sx={{ textTransform: "none" }}>
                                    Descargar
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Loader o Lista */}
                        {loading ? (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Typography color="error">{error}</Typography>
                            </Box>
                        ) : docentesPaginados.length > 0 ? (
                            <Box sx={{ maxHeight: 500, overflowY: "auto", pr: 1 }}>
                                <Grid container direction="column" spacing={2}>
                                    {docentesPaginados.map((docente, index) => (
                                        <Grid item key={index}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    minHeight: 80,
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="h6">
                                                        {`${docente.nombre} ${docente.apellidos}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Cédula: <strong>{docente.cedula}</strong>
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Correo: {docente.correo_institucional}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Programa: {docente.programa || "N/A"}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" gap={1}>
                                                    <IconButton
                                                        title="Ver detalles"
                                                        color="primary"
                                                        onClick={() => {
                                                            setDocenteEditando(docente);
                                                            setMostrarFormulario(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                                <Typography variant="body1" color="text.secondary">
                                    No hay coincidencias
                                </Typography>
                            </Box>
                        )}

                        {/* Paginación */}
                        {!loading && totalPages > 1 && (
                            <Box display="flex" mt={2} justifyContent="center">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    siblingCount={0}
                                    boundaryCount={1}
                                />
                            </Box>
                        )}
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default CaracterizacionDocentes;
