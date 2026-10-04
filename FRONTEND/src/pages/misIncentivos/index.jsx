import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { PageBreadcrumb } from 'components';
import Swal from 'sweetalert2';

// Hooks
import { useMisIncentivos } from './hooks/useMisIncentivos';

// Componentes
import IncentiveCard from './components/IncentiveCard';

const ResumenEstadisticas = ({ estadisticas }) => (
  <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
       Resumen de Mi Progreso
      </Typography>
      <Grid container spacing={3} textAlign="center">
        <Grid item xs={6} md={2}>
          <Typography variant="h4" fontWeight="bold">
            {estadisticas.totalIncentivos}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Incentivos Activos
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="h4" fontWeight="bold" color="success.light">
            {estadisticas.progresoPromedio}%
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Progreso General
          </Typography>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography variant="h4" fontWeight="bold" color="success.light">
            {estadisticas.reportesCompletados}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Completados
          </Typography>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography variant="h4" fontWeight="bold" color="warning.light">
            {estadisticas.reportesPendientes}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Pendientes
          </Typography>
        </Grid>
        <Grid item xs={4} md={2}>
          <Typography variant="h4" fontWeight="bold" color="error.light">
            {estadisticas.reportesRechazados}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Rechazados
          </Typography>
        </Grid>
        <Grid item xs={12} md={2}>
          <Typography variant="h4" fontWeight="bold" color="info.light">
            {estadisticas.reportesTotales}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total Requeridos
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const MisIncentivos = () => {
  const {
    loading,
    error,
    miProgreso,
    subiendoReporte,
    subirReporte,
    calcularEstadisticas,
    puedeSubirReporte,
    obtenerProximaFechaLimite,
    estaProximoAVencer,
    estaVencido,
    setError
  } = useMisIncentivos();

  const estadisticas = calcularEstadisticas();

  // Manejar subida de reporte
  const handleSubirReporte = async (archivo, idDocenteIncentivo) => {
    try {
      const resultado = await subirReporte(archivo, idDocenteIncentivo);
      
      if (resultado.success) {
        Swal.fire({
          title: '¡Reporte Enviado!',
          text: 'Tu reporte ha sido enviado correctamente y está en proceso de validación.',
          icon: 'success',
          confirmButtonText: 'Excelente'
        });
      } else {
        Swal.fire({
          title: 'Error al Subir Reporte',
          text: resultado.message || 'No se pudo subir el reporte',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error Inesperado',
        text: 'Ocurrió un error al intentar subir el reporte: ' + error.message,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  if (error) {
    return (
      <Box component="main" sx={{ flexGrow: 1 }}>
        <PageBreadcrumb title="Mis Incentivos" subName="Docente" />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar tus incentivos: {error}
          <br />
          <button onClick={() => setError(null)} style={{ marginTop: '8px' }}>
            Reintentar
          </button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1 }}>
        <PageBreadcrumb title="Mis Incentivos" subName="Docente" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando tus incentivos...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <PageBreadcrumb title="Mis Incentivos" subName="Docente" />
      
      <Box sx={{ p: 3 }}>
        {/* Estadísticas generales */}
        {miProgreso.length > 0 && (
          <ResumenEstadisticas estadisticas={estadisticas} />
        )}

        {/* Alertas importantes */}
        {miProgreso.some(inc => estaVencido(obtenerProximaFechaLimite(inc))) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              Tienes reportes vencidos
            </Typography>
            <Typography variant="body2">
              Algunos de tus reportes han pasado la fecha límite. Sube los reportes pendientes lo antes posible 
              para mantener tu incentivo en buen estado.
            </Typography>
          </Alert>
        )}

        {miProgreso.some(inc => 
          !estaVencido(obtenerProximaFechaLimite(inc)) && 
          estaProximoAVencer(obtenerProximaFechaLimite(inc))
        ) && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              Próximos vencimientos
            </Typography>
            <Typography variant="body2">
              Tienes reportes que vencen en los próximos 7 días. 
              Prepara y sube tus reportes con anticipación.
            </Typography>
          </Alert>
        )}

        {/* Lista de incentivos */}
        {miProgreso.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No tienes incentivos asignados
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Actualmente no tienes incentivos profesorales asignados. 
                Contacta con la administración si crees que esto es un error.
                <br />
                <br />
                <Typography variant="body1" color="textSecondary">
                  Si tienes incentivos asignados, pero no los ves en esta lista, es posible que estén en proceso de validación.
                  Espera unos minutos y recarga la página.
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Mis Incentivos Activos ({miProgreso.length})
            </Typography>
            
            {miProgreso.map((incentivo) => (
              <IncentiveCard
                key={incentivo.id_docente_incentivo}
                incentivo={incentivo}
                onSubirReporte={handleSubirReporte}
                puedeSubir={puedeSubirReporte(incentivo)}
                estaProximoAVencer={estaProximoAVencer}
                estaVencido={estaVencido}
                subiendoReporte={subiendoReporte}
              />
            ))}
          </Box>
        )}

        {/* Información adicional */}
        <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Información Importante
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Formato de Reportes:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Solo archivos PDF (máximo 10MB)
                    • El reporte debe ser claro y detallado
                    • Incluye toda la información relevante
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Sistema de Reportes:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Los reportes se habilitan cuando el anterior es validado
                    • Un reporte por vez hasta que se valide el enviado
                    • Recibirás notificación del resultado de validación
                    • Si el reporte es rechazado, deberás subir un nuevo reporte
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default MisIncentivos; 