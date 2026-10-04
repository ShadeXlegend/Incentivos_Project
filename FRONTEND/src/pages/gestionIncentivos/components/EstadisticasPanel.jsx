import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const EstadisticaCard = ({ titulo, valor, icono, color = 'primary' }) => {
  const IconoComponente = icono;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {titulo}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {valor}
            </Typography>
          </Box>
          <IconoComponente 
            sx={{ 
              fontSize: 40, 
              color: `${color}.main`,
              opacity: 0.7 
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const EstadisticasPanel = ({ estadisticas, loading }) => {
  if (loading || !estadisticas) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Estadísticas Generales
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const { totales, reportes, por_tipo } = estadisticas;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Estadísticas Generales
      </Typography>
      
      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            titulo="Incentivos Activos"
            valor={totales.incentivos_activos}
            icono={TrendingUpIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            titulo="Docentes con Incentivos"
            valor={totales.incentivos_vigentes}
            icono={PeopleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            titulo="Incentivos Finalizados"
            valor={totales.incentivos_finalizados}
            icono={AssignmentIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            titulo="Incentivos Eliminados"
            valor={totales.incentivos_eliminados || 0}
            icono={DeleteIcon}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Estadísticas de reportes */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Reportes Validados
              </Typography>
              <Typography variant="h3" component="div" color="success.main">
                {reportes.validados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                Reportes Pendientes
              </Typography>
              <Typography variant="h3" component="div" color="warning.main">
                {reportes.pendientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error.main">
                Reportes Rechazados
              </Typography>
              <Typography variant="h3" component="div" color="error.main">
                {reportes.rechazados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribución por tipo de incentivo */}
      {por_tipo && por_tipo.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribución por Tipo de Incentivo
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {por_tipo.map((tipo, index) => (
                <Chip
                  key={index}
                  label={`${tipo.tipo_incentivo}: ${tipo.cantidad}`}
                  color="primary"
                  variant="outlined"
                  size="medium"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EstadisticasPanel; 