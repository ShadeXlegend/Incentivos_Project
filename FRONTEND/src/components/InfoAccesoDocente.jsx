import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Chip,
  Grid,
  CircularProgress 
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';
import { usePermisosDocente } from '@src/hooks/usePermisosDocente';

const InfoAccesoDocente = () => {
  const { permisos, error } = usePermisosDocente();

  if (permisos.loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return null; // No mostrar nada si hay error
  }

  // Solo mostrar para docentes (no administradores)
  if (permisos.esAdministrador) {
    return null;
  }

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
           Estado de Acceso a Módulos
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} p={2} 
                 sx={{ 
                   borderRadius: 1, 
                   backgroundColor: permisos.tieneIncentivos ? 'success.light' : 'grey.100' 
                 }}>
              {permisos.tieneIncentivos ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="disabled" />
              )}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Mis Incentivos
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {permisos.tieneIncentivos 
                    ? 'Tienes incentivos activos asignados' 
                    : 'No tienes incentivos asignados'
                  }
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={permisos.tieneIncentivos ? "Disponible" : "No disponible"}
                  color={permisos.tieneIncentivos ? "success" : "default"}
                  size="small"
                  icon={permisos.tieneIncentivos ? <WorkspacePremiumIcon /> : undefined}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} p={2}
                 sx={{ 
                   borderRadius: 1, 
                   backgroundColor: permisos.tieneCualificaciones ? 'success.light' : 'grey.100' 
                 }}>
              {permisos.tieneCualificaciones ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="disabled" />
              )}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Mis Cualificaciones
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {permisos.tieneCualificaciones 
                    ? 'Tienes cualificaciones registradas' 
                    : 'No tienes cualificaciones registradas'
                  }
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={permisos.tieneCualificaciones ? "Disponible" : "No disponible"}
                  color={permisos.tieneCualificaciones ? "success" : "default"}
                  size="small"
                  icon={permisos.tieneCualificaciones ? <SchoolIcon /> : undefined}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {(!permisos.tieneIncentivos || !permisos.tieneCualificaciones) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
             Los módulos no disponibles no aparecerán en tu menú de navegación. 
              Si necesitas acceso a algún módulo, contacta al administrador del sistema.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoAccesoDocente; 