import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import { usePermisosDocente } from '@src/hooks/usePermisosDocente';

const ProtectedDocenteRoute = ({ children, requiereIncentivos = false, requiereCualificaciones = false }) => {
  const { permisos, error } = usePermisosDocente();

  if (permisos.loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Verificando permisos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al verificar permisos: {error}
        </Alert>
      </Box>
    );
  }

  // Si es administrador, acceso completo
  if (permisos.esAdministrador) {
    return children;
  }

  // Verificar permisos específicos para docentes
  if (requiereIncentivos && !permisos.tieneIncentivos) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            🔒 Acceso Restringido
          </Typography>
          <Typography variant="body1">
            No tienes un incentivo activo asignado. Para acceder a esta sección, 
            necesitas tener al menos un incentivo vigente.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Contacta al administrador si crees que esto es un error.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (requiereCualificaciones && !permisos.tieneCualificaciones) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            🔒 Acceso Restringido
          </Typography>
          <Typography variant="body1">
            No tienes cualificaciones registradas. Para acceder a esta sección, 
            necesitas tener al menos una cualificación activa.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Contacta al administrador si crees que esto es un error.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Si llega aquí, tiene permisos
  return children;
};

export default ProtectedDocenteRoute; 