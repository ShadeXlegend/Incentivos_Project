import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { gsUrlApi } from '@src/config/ConfigServer';

const EstadoChip = ({ estado }) => {
  const configuracion = {
    'PENDIENTE': { color: 'warning', label: 'Pendiente' },
    'VALIDADO': { color: 'success', label: 'Validado' },
    'RECHAZADO': { color: 'error', label: 'Rechazado' }
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

const PDFViewer = ({ rutaArchivo }) => {
  if (!rutaArchivo) return null;
  
  const urlPDF = `${gsUrlApi}/${rutaArchivo}`;
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '500px', 
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <iframe
        src={urlPDF}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Visualizador de PDF"
      />
    </Box>
  );
};

const ReportesModal = ({ 
  open, 
  onClose, 
  docenteIncentivo, 
  onValidarReporte 
}) => {
  const [reportes, setReportes] = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [mensajeAdministrador, setMensajeAdministrador] = useState('');
  const [validando, setValidando] = useState(false);

  const token = localStorage.getItem('token');

  // Cargar reportes del docente
  useEffect(() => {
    if (open && docenteIncentivo?.docente?.id) {
      cargarReportes();
    }
  }, [open, docenteIncentivo]);

  const cargarReportes = async () => {
    if (!docenteIncentivo?.docente?.id) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/reportes/docente/${docenteIncentivo.docente.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setReportes(data.reportes || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudieron cargar los reportes', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al cargar reportes: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarReporte = async (estado) => {
    if (!reporteSeleccionado) return;
    
    // Validación para rechazos - mensaje del administrador es obligatorio
    if (estado === 'RECHAZADO' && !mensajeAdministrador.trim()) {
      Swal.fire('Error', 'Debe proporcionar un mensaje explicativo al rechazar un reporte', 'warning');
      return;
    }

    setValidando(true);
    try {
      const resultado = await onValidarReporte(
        reporteSeleccionado.id_reporte_incentivo, 
        estado, 
        observaciones,
        mensajeAdministrador
      );
      
      if (resultado.success) {
        Swal.fire(
          'Éxito', 
          `Reporte ${estado.toLowerCase()} correctamente`, 
          'success'
        );
        setReporteSeleccionado(null);
        setObservaciones('');
        setMensajeAdministrador('');
        await cargarReportes();
      } else {
        Swal.fire('Error', resultado.message || 'No se pudo validar el reporte', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al validar reporte: ' + error.message, 'error');
    } finally {
      setValidando(false);
    }
  };

  const descargarReporte = (reporte) => {
    if (!reporte.ruta_archivo) return;
    
    const urlPDF = `${gsUrlApi}/${reporte.ruta_archivo}`;
    window.open(urlPDF, '_blank');
  };

  if (!docenteIncentivo) return null;

  const docente = docenteIncentivo.docente || {};
  const incentivo = docenteIncentivo.incentivo || {};

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" />
          <Typography variant="h6">
            Proceso de Reportes - {`${docente.nombre || ''} ${docente.apellidos || ''}`}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Información del incentivo */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Información del Incentivo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">Tipo:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {incentivo.nombre || 'Sin especificar'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">Período:</Typography>
                    <Typography variant="body1">
                      {new Date(docenteIncentivo.fecha_inicio).toLocaleDateString('es-ES')} - {' '}
                      {new Date(docenteIncentivo.fecha_fin).toLocaleDateString('es-ES')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">Frecuencia:</Typography>
                    <Typography variant="body1">
                      Cada {docenteIncentivo.frecuencia_informe_dias || 0} días
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de reportes */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Reportes Enviados ({reportes.length})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : reportes.length === 0 ? (
              <Alert severity="info">
                No hay reportes enviados aún
              </Alert>
            ) : (
              <List>
                {reportes.map((reporte, index) => (
                  <ListItem 
                    key={reporte.id_reporte_incentivo}
                    button
                    selected={reporteSeleccionado?.id_reporte_incentivo === reporte.id_reporte_incentivo}
                    onClick={() => setReporteSeleccionado(reporte)}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            Reporte #{index + 1}
                          </Typography>
                          <EstadoChip estado={reporte.estado} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Enviado: {new Date(reporte.fecha_envio).toLocaleDateString('es-ES')}
                          </Typography>
                          {reporte.observaciones && (
                            <Typography variant="caption" color="error">
                              Obs: {reporte.observaciones}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          descargarReporte(reporte);
                        }}
                        title="Abrir en nueva ventana"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          {/* Visualizador y acciones */}
          <Grid item xs={12} md={7}>
            {reporteSeleccionado ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Visualización del Reporte
                </Typography>
                
                {/* Visor PDF */}
                <PDFViewer rutaArchivo={reporteSeleccionado.ruta_archivo} />
                
                <Divider sx={{ my: 2 }} />
                
                {/* Acciones de validación */}
                {reporteSeleccionado.estado === 'PENDIENTE' && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Validación del Reporte
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Observaciones Técnicas"
                          placeholder="Comentarios técnicos sobre el reporte (opcional)"
                          multiline
                          rows={3}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mensaje para el Docente"
                          placeholder="Mensaje que verá el docente (obligatorio para rechazos)"
                          multiline
                          rows={3}
                          value={mensajeAdministrador}
                          onChange={(e) => setMensajeAdministrador(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box display="flex" gap={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleValidarReporte('VALIDADO')}
                        disabled={validando}
                      >
                        {validando ? 'Validando...' : 'Aprobar'}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleValidarReporte('RECHAZADO')}
                        disabled={validando}
                      >
                        {validando ? 'Rechazando...' : 'Rechazar'}
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {reporteSeleccionado.estado !== 'PENDIENTE' && (
                  <Alert severity="info">
                    Este reporte ya ha sido {reporteSeleccionado.estado.toLowerCase()}
                    {reporteSeleccionado.observaciones && (
                      <>
                        <br />
                        <strong>Observaciones:</strong> {reporteSeleccionado.observaciones}
                      </>
                    )}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="400px"
                border="2px dashed #ccc"
                borderRadius={2}
              >
                <Typography variant="h6" color="textSecondary">
                  Selecciona un reporte para visualizarlo
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportesModal; 