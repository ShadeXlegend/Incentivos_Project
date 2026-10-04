import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { PageBreadcrumb } from "components";
import RolForm from "./RolesForm";
import { useRoles } from "./useRoles";

const Roles = () => {
  const { roles, loading, error } = useRoles();
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  const iconoPorRol = (nombre) =>
    nombre.toLowerCase().includes("admin")
      ? <AdminPanelSettingsIcon />
      : <SupervisorAccountIcon />;

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <PageBreadcrumb title="Roles" subName="App" />
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Box sx={{ flex: 1, borderRight: { md: "1px solid #ddd" }, pr: { md: 2 } }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Roles disponibles</Typography>
          {loading && <Typography>Cargando roles...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          {roles.map((rol) => (
            <Paper
              key={rol.id_rol}
              onClick={() => setRolSeleccionado(rol)}
              elevation={rolSeleccionado?.id_rol === rol.id_rol ? 4 : 1}
              sx={{
                p: 2,
                mb: 2,
                border: rolSeleccionado?.id_rol === rol.id_rol ? "2px solid rgb(193, 205, 27)" : "1px solid #ccc",
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: rolSeleccionado?.id_rol === rol.id_rol ? "rgba(161, 192, 26, 0.67)" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 500,
              }}
            >
              {iconoPorRol(rol.nombre)} {rol.nombre}
            </Paper>
          ))}
        </Box>

        <Box sx={{ flex: 2 }}>
          {rolSeleccionado ? (
            <RolForm rol={rolSeleccionado} reset={() => setRolSeleccionado(null)} />
          ) : (
            <Box
              sx={{
                height: "100%",
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "gray",
                fontSize: "1.1rem",
              }}
            >
              Escoja un rol para editar sus permisos
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Roles;
