import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import {
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { gsUrlApi } from '@src/config/ConfigServer';

const EstadoChip = ({ estado }) => {
  const configuracion = {
    'VIGENTE': { color: 'success', label: 'Vigente' },
    'FINALIZADO': { color: 'default', label: 'Finalizado' },
    'PAUSADO': { color: 'warning', label: 'Pausado' }
  };
  
  const config = configuracion[estado] || { color: 'default', label: estado };
  
  return (
    <Chip 
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

const ProgresoCircular = ({ porcentaje, completados, total }) => {
  const getColor = () => {
    if (porcentaje >= 80) return 'success';
    if (porcentaje >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="textSecondary">
          Progreso
        </Typography>
        <Typography variant="body2" fontWeight="bold" color={`${getColor()}.main`}>
          {porcentaje}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={porcentaje} 
        color={getColor()}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
        {completados} de {total} reportes completados
      </Typography>
    </Box>
  );
};

const FechaDisplay = ({ fecha, label, esVencimiento = false }) => {
  if (!fecha) return null;
  
  const fechaObj = new Date(fecha);
  const ahora = new Date();
  const esVencido = fechaObj < ahora;
  const diasRestantes = Math.ceil((fechaObj - ahora) / (1000 * 60 * 60 * 24));
  
  let color = 'textSecondary';
  let icono = <ScheduleIcon fontSize="small" />;
  
  if (esVencimiento) {
    if (esVencido) {
      color = 'error';
      icono = <ErrorIcon fontSize="small" color="error" />;
    } else if (diasRestantes <= 7) {
      color = 'warning';
      icono = <WarningIcon fontSize="small" color="warning" />;
    } else {
      color = 'success';
      icono = <CheckCircleIcon fontSize="small" color="success" />;
    }
  }

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {icono}
      <Box>
        <Typography variant="body2" color={color} fontWeight="medium">
          {label}
        </Typography>
        <Typography variant="caption" color={color}>
          {fechaObj.toLocaleDateString('es-ES')}
          {esVencimiento && (
            <>
              {esVencido ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}> (VENCIDO)</span>
              ) : diasRestantes <= 7 ? (
                <span style={{ color: 'orange', fontWeight: 'bold' }}> ({diasRestantes} días restantes)</span>
              ) : (
                <span style={{ color: 'green' }}> ({diasRestantes} días restantes)</span>
              )}
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

// Función para obtener mensajes relevantes del administrador
const obtenerMensajesRelevantes = (reportes) => {
  if (!reportes || reportes.length === 0) return [];

  // Filtrar reportes con mensajes del administrador
  const reportesConMensaje = reportes
    .filter(reporte => reporte.mensaje_administrador && reporte.mensaje_administrador.trim())
    .sort((a, b) => new Date(b.fecha_validacion || b.fecha_envio) - new Date(a.fecha_validacion || a.fecha_envio));

  if (reportesConMensaje.length === 0) return [];

  // Lógica de filtrado inteligente
  const mensajesRelevantes = [];
  const ahora = new Date();
  const DIAS_VIGENCIA_MENSAJE = 30; // Los mensajes son relevantes por 30 días

  for (const reporte of reportesConMensaje) {
    const fechaMensaje = new Date(reporte.fecha_validacion || reporte.fecha_envio);
    const diasTranscurridos = Math.floor((ahora - fechaMensaje) / (1000 * 60 * 60 * 24));

    // 1. Si el mensaje es muy antiguo (>30 días), no mostrarlo
    if (diasTranscurridos > DIAS_VIGENCIA_MENSAJE) continue;

    // 2. Si es un reporte rechazado, verificar si ya se envió uno nuevo después
    if (reporte.estado === 'RECHAZADO') {
      const reportesPosteriorAlRechazo = reportes.filter(r => 
        new Date(r.fecha_envio) > fechaMensaje
      );
      
      // Si ya se envió un reporte después del rechazo, no mostrar el mensaje de rechazo
      if (reportesPosteriorAlRechazo.length > 0) continue;
    }

    // 3. Agregar el mensaje a los relevantes
    mensajesRelevantes.push(reporte);

    // 4. Limitar a máximo 2 mensajes
    if (mensajesRelevantes.length >= 2) break;
  }

  return mensajesRelevantes;
};

const IncentiveCard = ({ 
  incentivo, 
  onSubirReporte, 
  puedeSubir, 
  estaProximoAVencer,
  estaVencido,
  subiendoReporte 
}) => {
  if (!incentivo) return null;

  const incentiveInfo = incentivo.incentivo || {};
  const progreso = incentivo.progreso || {};
  const proximaFechaLimite = incentivo.proxima_fecha_limite;

  const handleSubirReporte = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const archivo = e.target.files[0];
      if (archivo) {
        onSubirReporte(archivo, incentivo.id_docente_incentivo);
      }
    };
    input.click();
  };

  return (
    <Card 
      sx={{ 
        mb: 3, 
        boxShadow: 3,
        borderLeft: `4px solid ${
          incentivo.estado === 'VIGENTE' ? '#4caf50' : 
          incentivo.estado === 'FINALIZADO' ? '#9e9e9e' : '#ff9800'
        }`
      }}
    >
      <CardContent>
        {/* Header con título y estado */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {incentiveInfo.nombre || 'Incentivo Sin Nombre'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {incentiveInfo.descripcion || 'Sin descripción disponible'}
            </Typography>
          </Box>
          <EstadoChip estado={incentivo.estado} />
        </Box>

        {/* Información del período */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FechaDisplay 
              fecha={incentivo.fecha_inicio} 
              label="Fecha de Inicio"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FechaDisplay 
              fecha={incentivo.fecha_fin} 
              label="Fecha de Fin"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <ScheduleIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  Frecuencia
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Cada {incentivo.frecuencia_informe_dias || 0} días
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Progreso */}
        <ProgresoCircular 
          porcentaje={progreso.porcentaje || 0}
          completados={progreso.reportes_completados || 0}
          total={progreso.total_reportes_requeridos || 0}
        />

        {/* Estadísticas de reportes */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {progreso.reportes_completados || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Completados
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main">
                {progreso.reportes_pendientes || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Pendientes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" color="error.main">
                {progreso.reportes_rechazados || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Rechazados
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Próxima fecha límite */}
        {proximaFechaLimite && (
          <Box sx={{ mt: 2 }}>
            <FechaDisplay 
              fecha={proximaFechaLimite}
              label="Próximo Reporte Vence"
              esVencimiento={true}
            />
          </Box>
        )}

        {/* Estado secuencial de reportes */}
        {incentivo.estado === 'VIGENTE' && progreso.reportes_pendientes > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert 
              severity={progreso.reportes_pendientes > 0 ? "info" : "success"} 
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight="bold">
                Sistema de Reportes Secuencial
              </Typography>
              <Typography variant="body2">
                {progreso.reportes_pendientes > 0 ? (
                  <>
                    Tienes <strong>{progreso.reportes_pendientes}</strong> reportes pendientes de validación.
                    <br />
                    <small>Los nuevos reportes se habilitarán cuando el administrador valide los pendientes.</small>
                  </>
                ) : (
                  "Todos tus reportes han sido validados. El próximo se habilitará según la programación."
                )}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Mensajes del Administrador */}
        {incentivo.reportes && incentivo.reportes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {obtenerMensajesRelevantes(incentivo.reportes).map((reporte) => (
              <Alert 
                key={reporte.id_reporte_incentivo}
                severity={reporte.estado === 'RECHAZADO' ? 'error' : 'info'}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {reporte.estado === 'RECHAZADO' ? 'Reporte Rechazado' : 
                   reporte.estado === 'EXTENSION_PLAZO' ? 'Extensión de Plazo' : 
                   'Mensaje del Administrador'}
                </Typography>
                <Typography variant="body2">
                  {reporte.mensaje_administrador}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  {new Date(reporte.fecha_validacion || reporte.fecha_envio).toLocaleDateString('es-ES')}
                  {(() => {
                    const fechaMensaje = new Date(reporte.fecha_validacion || reporte.fecha_envio);
                    const ahora = new Date();
                    const diasTranscurridos = Math.floor((ahora - fechaMensaje) / (1000 * 60 * 60 * 24));
                    const diasRestantes = 30 - diasTranscurridos;
                    
                    if (diasRestantes > 7) {
                      return ` • Expira en ${diasRestantes} días`;
                    } else if (diasRestantes > 0) {
                      return ` • Expira en ${diasRestantes} días`;
                    } else {
                      return ` • Mensaje expirado`;
                    }
                  })()}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Alertas */}
        {incentivo.estado === 'VIGENTE' && (
          <Box sx={{ mt: 2 }}>
            {estaVencido(proximaFechaLimite) && (
              <Alert severity="error" sx={{ mb: 1 }}>
                Tienes un reporte vencido. Sube tu reporte lo antes posible.
              </Alert>
            )}
            {!estaVencido(proximaFechaLimite) && estaProximoAVencer(proximaFechaLimite) && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Tu próximo reporte vence pronto. Prepáralo con anticipación.
              </Alert>
            )}
            {!puedeSubir && !estaVencido(proximaFechaLimite) && progreso.reportes_pendientes === 0 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                El próximo reporte se habilitará cuando el administrador valide los pendientes.
              </Alert>
            )}
            {!puedeSubir && progreso.reportes_pendientes > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                No puedes subir más reportes hasta que el administrador valide los pendientes.
              </Alert>
            )}
          </Box>
        )}
      </CardContent>

      {/* Acciones */}
      {incentivo.estado === 'VIGENTE' && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant={puedeSubir ? "contained" : "outlined"}
            color={estaVencido(proximaFechaLimite) ? "error" : "primary"}
            startIcon={<UploadIcon />}
            onClick={handleSubirReporte}
            disabled={!puedeSubir || subiendoReporte}
            fullWidth
          >
            {subiendoReporte ? 'Subiendo...' : 
             estaVencido(proximaFechaLimite) ? 'Subir Reporte (URGENTE)' :
             puedeSubir ? 'Subir Reporte' : 'Subir Reporte (No Disponible)'}
          </Button>
        </CardActions>
      )}

      {incentivo.estado === 'FINALIZADO' && incentivo.ruta_certificado && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const token = localStorage.getItem('token');
              const url = `${gsUrlApi}/incentivos/docente-incentivo/${incentivo.id_docente_incentivo}/certificado?token=${token}`;
              window.open(url, '_blank');
            }}
            fullWidth
          >
            Descargar certificado
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default IncentiveCard; 