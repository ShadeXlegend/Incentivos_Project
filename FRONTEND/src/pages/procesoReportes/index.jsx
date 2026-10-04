import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
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
  Alert,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { gsUrlApi } from '@src/config/ConfigServer';
import { PageBreadcrumb } from 'components';

const EstadoChip = ({ estado }) => {
  const configuracion = {
    'PENDIENTE': { color: 'warning', label: 'Pendiente' },
    'VALIDADO': { color: 'success', label: 'Validado' },
    'RECHAZADO': { color: 'error', label: 'Rechazado' },
    'EXTENSION_PLAZO': { color: 'info', label: 'Extensión' }
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
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        height: '70vh', 
        border: '1px solid #ddd',
        borderRadius: 2,
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
    </Paper>
  );
};

const ProcesoReportes = () => {
  const { id_docente_incentivo } = useParams();
  const navigate = useNavigate();
  
  const [docenteIncentivo, setDocenteIncentivo] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [mensajeAdministrador, setMensajeAdministrador] = useState('');
  const [validando, setValidando] = useState(false);
  const [porcentajeProgreso, setPorcentajeProgreso] = useState(0);
  const [contadores, setContadores] = useState({ validados: 0, total: 0 });

  const token = localStorage.getItem('token');

  // Obtener fechas programa para calcular progreso total
  const cargarProgreso = async (idAsignacion) => {
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/calcular-fechas/${idAsignacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        const fechas = data.fechas || [];
        const total = fechas.length;
        const reportes = data.reportes || [];
        const validados = reportes.filter(r => r.estado === 'VALIDADO').length;
        const porcentaje = total > 0 ? Math.round((validados / total) * 100) : 0;
        setPorcentajeProgreso(porcentaje);
        setContadores({ validados, total });
      }
    } catch (err) {
      console.error('Error al calcular progreso', err);
    }
  };

  useEffect(() => {
    if (id_docente_incentivo) {
      cargarDatos();
      cargarProgreso(id_docente_incentivo);
    }
  }, [id_docente_incentivo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const fetchDocentes = async (estado) => {
        const url = `${gsUrlApi}/incentivos/docentes-asignados?limit=1000&page=1${estado ? `&estado=${estado}` : ''}`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        return r.ok ? (await r.json()).docentes || [] : [];
      };

      const [docentesVigentes, docentesFinalizados] = await Promise.all([
        fetchDocentes('VIGENTE'),
        fetchDocentes('FINALIZADO')
      ]);

      const docentesLista = [...docentesVigentes, ...docentesFinalizados];

      // Buscar el docente
      const docente = docentesLista.find(d => d.id_docente_incentivo === id_docente_incentivo);
      setDocenteIncentivo(docente);
      
      if (docente) {
        const reportesResp = await fetch(`${gsUrlApi}/incentivos/reportes/docente-incentivo/${id_docente_incentivo}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (reportesResp.ok) {
          const reportesData = await reportesResp.json();
          // CORRECCIÓN: Ordenar reportes por fecha de envío (más antiguo primero)
          const reportesOrdenados = (reportesData.reportes || []).sort((a, b) => 
            new Date(a.fecha_envio) - new Date(b.fecha_envio)
          );
          setReportes(reportesOrdenados);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'Error al cargar los datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarReporte = async (estado) => {
    if (!reporteSeleccionado) return;
    
    if (estado === 'RECHAZADO' && !mensajeAdministrador.trim()) {
      Swal.fire('Error', 'Debe proporcionar un mensaje explicativo al rechazar un reporte', 'warning');
      return;
    }

    setValidando(true);
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/reportes/${reporteSeleccionado.id_reporte_incentivo}/validar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          estado,
          observaciones: observaciones || null,
          mensaje_administrador: mensajeAdministrador || null
        })
      });

      const data = await resp.json();
      
      if (resp.ok) {
        Swal.fire('Éxito', `Reporte ${estado.toLowerCase()} correctamente`, 'success');
        setReporteSeleccionado(null);
        setObservaciones('');
        setMensajeAdministrador('');
        await cargarDatos();
        // Recalcular el progreso inmediatamente para actualizar la barra
        await cargarProgreso(id_docente_incentivo);
      } else {
        Swal.fire('Error', data.message || 'No se pudo validar el reporte', 'error');
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

  // Función para calcular el número de reporte considerando rechazos
  const calcularNumeroReporte = (reportes, reporteActual) => {
    if (!reportes || reportes.length === 0) return 1;

    // Ordenar reportes por fecha de envío
    const reportesOrdenados = [...reportes].sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio));
    
    let numeroReporte = 1;

    for (let i = 0; i < reportesOrdenados.length; i++) {
      const reporte = reportesOrdenados[i];
      
      if (reporte.id_reporte_incentivo === reporteActual.id_reporte_incentivo) {
        // Este es el reporte actual, devolver el número que le corresponde
        return numeroReporte;
      }
      
      if (reporte.estado === 'VALIDADO') {
        // Si el reporte fue validado, incrementar el contador para el siguiente
        numeroReporte++;
      }
      // Si fue rechazado, el siguiente reporte mantiene el mismo número
      // Si está pendiente, también mantiene el número actual hasta que se resuelva
    }
    
    return numeroReporte;
  };

  const handleVolver = () => {
    navigate('/GestionIncentivos');
  };

  const handleAprobarIncentivo = async () => {
    const confirm = await Swal.fire({
      title: 'Aprobar incentivo',
      text: '¿Está seguro de aprobar el incentivo? Se generará un certificado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/docente-incentivo/${id_docente_incentivo}/aprobar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        Swal.fire('Éxito', 'Incentivo aprobado y certificado generado.', 'success');
        if (data.certificado) {
          window.open(`${gsUrlApi}/${data.certificado}`, '_blank');
        }
        navigate('/GestionIncentivos');
      } else {
        Swal.fire('Error', data.message || 'No se pudo aprobar', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDesaprobarIncentivo = async () => {
    const { value: text } = await Swal.fire({
      title: 'Desaprobar incentivo',
      input: 'textarea',
      inputLabel: 'Observaciones',
      inputPlaceholder: 'Escriba las razones de la desaprobación...',
      showCancelButton: true,
      confirmButtonText: 'Desaprobar',
      cancelButtonText: 'Cancelar'
    });
    if (text === undefined) return; // Cancelado

    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/docente-incentivo/${id_docente_incentivo}/desaprobar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ observaciones: text })
      });
      const data = await resp.json();
      if (resp.ok) {
        Swal.fire('Proceso completado', 'Incentivo desaprobado.', 'success');
        if (data.certificado) {
          window.open(`${gsUrlApi}/${data.certificado}`, '_blank');
        }
        navigate('/GestionIncentivos');
      } else {
        Swal.fire('Error', data.message || 'No se pudo desaprobar', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const verCertificado = () => {
    const url = `${gsUrlApi}/incentivos/docente-incentivo/${id_docente_incentivo}/certificado?token=${token}`;
    window.open(url, '_blank');
  };

  const handleRecordarPlazo = async () => {
    const confirm = await Swal.fire({
      title: 'Enviar recordatorio',
      text: 'Se enviará un correo al docente recordándole su próximo reporte. ¿Desea continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/docente-incentivo/${id_docente_incentivo}/recordar-plazo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        Swal.fire('Éxito', data.message || 'Recordatorio enviado correctamente', 'success');
      } else {
        Swal.fire('Error', data.message || 'No se pudo enviar el recordatorio', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1 }}>
        <PageBreadcrumb title="Proceso de Reportes" subName="Gestión" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (!docenteIncentivo) {
    return (
      <Box component="main" sx={{ flexGrow: 1 }}>
        <PageBreadcrumb title="Proceso de Reportes" subName="Gestión" />
        <Alert severity="error" sx={{ mt: 2 }}>
          No se encontró información del incentivo del docente.
          <Button onClick={handleVolver} sx={{ ml: 2 }}>Volver a Gestión</Button>
        </Alert>
      </Box>
    );
  }

  const docente = docenteIncentivo.docente || {};
  const incentivo = docenteIncentivo.incentivo || {};

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <PageBreadcrumb 
        title={`Proceso de Reportes - ${docente.nombre || ''} ${docente.apellidos || ''}`}
        subName="Gestión de Incentivos" 
      />
      
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVolver} sx={{ mb: 3 }} variant="outlined">
          Volver a Gestión de Incentivos
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <PersonIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {`${docente.nombre || ''} ${docente.apellidos || ''}`}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {docente.email_institucional || docente.email || 'Sin email institucional'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    Información del Incentivo
                  </Typography>
                  <Box display="flex" gap={1}>
                    {docenteIncentivo.resolucion && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        onClick={() => window.open(`${gsUrlApi}/uploads/resoluciones/${docenteIncentivo.resolucion}`, '_blank')}
                        sx={{ textTransform: 'none' }}
                      >
                        Ver Resolución
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<ScheduleIcon />}
                      onClick={handleRecordarPlazo}
                      sx={{ textTransform: 'none' }}
                    >
                      Recordar Plazo
                    </Button>
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Tipo de Incentivo:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {incentivo.nombre || 'Sin especificar'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Período:</Typography>
                    <Typography variant="body1">
                      {new Date(docenteIncentivo.fecha_inicio).toLocaleDateString('es-ES')} - {' '}
                      {new Date(docenteIncentivo.fecha_fin).toLocaleDateString('es-ES')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Frecuencia:</Typography>
                    <Typography variant="body1">
                      Cada {docenteIncentivo.frecuencia_informe_dias || 0} días
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="textSecondary">Estado:</Typography>
                    <Chip 
                      label={docenteIncentivo.estado || 'Sin estado'}
                      color={docenteIncentivo.estado === 'VIGENTE' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reportes Enviados ({reportes.length})
                </Typography>

                {reportes.some(r => r.estado === 'RECHAZADO') && (
                  <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                    <Typography variant="body2">
                      Los reportes rechazados mantienen su número hasta ser validados. 
                      El docente debe reenviar el mismo número de reporte.
                    </Typography>
                  </Alert>
                )}
                
                {reportes.length === 0 ? (
                  <Alert severity="info">No hay reportes enviados aún</Alert>
                ) : (
                  <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {reportes.map((reporte) => (
                      <ListItem 
                        key={reporte.id_reporte_incentivo}
                        button
                        selected={reporteSeleccionado?.id_reporte_incentivo === reporte.id_reporte_incentivo}
                        onClick={() => setReporteSeleccionado(reporte)}
                        divider
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': { backgroundColor: 'primary.main' }
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="bold">
                                Reporte #{calcularNumeroReporte(reportes, reporte)}
                                {reporte.estado === 'RECHAZADO' && (
                                  <Typography component="span" variant="caption" color="error" sx={{ ml: 0.5 }}>
                                    (requiere reenvío)
                                  </Typography>
                                )}
                              </Typography>
                              <EstadoChip estado={reporte.estado} />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Enviado: {new Date(reporte.fecha_envio).toLocaleDateString('es-ES')}
                              </Typography>
                              {reporte.fecha_validacion && (
                                <Typography variant="caption" display="block" color="success.main">
                                  Validado: {new Date(reporte.fecha_validacion).toLocaleDateString('es-ES')}
                                </Typography>
                              )}
                              {reporte.mensaje_administrador && (
                                <Typography variant="caption" color={reporte.estado === 'RECHAZADO' ? 'error.main' : 'info.main'} display="block">
                                  {reporte.mensaje_administrador.substring(0, 50)}...
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => { e.stopPropagation(); descargarReporte(reporte); }}
                            title="Abrir en nueva ventana"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            {reporteSeleccionado ? (
              <Box>
                <Card elevation={2} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Reporte #{calcularNumeroReporte(reportes, reporteSeleccionado)} - {reporteSeleccionado.estado}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Enviado el {new Date(reporteSeleccionado.fecha_envio).toLocaleDateString('es-ES')} a las {new Date(reporteSeleccionado.fecha_envio).toLocaleTimeString('es-ES')}
                    </Typography>
                  </CardContent>
                </Card>
                
                <PDFViewer rutaArchivo={reporteSeleccionado.ruta_archivo} />
                
                {reporteSeleccionado.estado === 'PENDIENTE' && (
                  <Card elevation={2} sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Validación del Reporte
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Observaciones Técnicas"
                            placeholder="Comentarios técnicos (opcional)"
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
                      
                      <Box display="flex" gap={2} mt={2}>
                        <Button
                          variant="contained"
                          color="success"
                          size="large"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleValidarReporte('VALIDADO')}
                          disabled={validando}
                        >
                          {validando ? 'Validando...' : 'Aprobar Reporte'}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="large"
                          startIcon={<CancelIcon />}
                          onClick={() => handleValidarReporte('RECHAZADO')}
                          disabled={validando || !mensajeAdministrador.trim()}
                        >
                          {validando ? 'Rechazando...' : 'Rechazar Reporte'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {reporteSeleccionado.estado !== 'PENDIENTE' && (
                  <Card elevation={2} sx={{ mt: 2 }}>
                    <CardContent>
                      <Alert severity={reporteSeleccionado.estado === 'VALIDADO' ? 'success' : 'error'}>
                        <Typography variant="body1" fontWeight="bold">
                          Este reporte ya ha sido {reporteSeleccionado.estado.toLowerCase()}
                        </Typography>
                        {reporteSeleccionado.observaciones && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Observaciones:</strong> {reporteSeleccionado.observaciones}
                          </Typography>
                        )}
                        {reporteSeleccionado.mensaje_administrador && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Mensaje del administrador:</strong> {reporteSeleccionado.mensaje_administrador}
                          </Typography>
                        )}
                        {reporteSeleccionado.fecha_validacion && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Fecha de validación:</strong> {new Date(reporteSeleccionado.fecha_validacion).toLocaleDateString('es-ES')}
                          </Typography>
                        )}
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : (
              <Card elevation={2}>
                <CardContent>
                  <Box 
                    display="flex" 
                    flexDirection="column"
                    alignItems="center" 
                    justifyContent="center" 
                    height="60vh"
                    textAlign="center"
                  >
                    <ScheduleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Selecciona un reporte para visualizarlo
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Haz clic en cualquier reporte de la lista para ver su contenido y validarlo
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Progreso general del incentivo */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Progreso del incentivo
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={porcentajeProgreso}
            color={porcentajeProgreso >= 100 ? 'success' : 'primary'}
            sx={{ height: 10, borderRadius: 4 }}
          />
          <Typography variant="caption" color="textSecondary">
            {contadores.validados} / {contadores.total} reportes validados ({porcentajeProgreso}%)
          </Typography>
        </Box>

        {/* Botones de aprobación final */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
          {docenteIncentivo.estado === 'FINALIZADO' || docenteIncentivo.estado === 'APROBADO' || docenteIncentivo.estado === 'REPROBADO' ? (
            <Button
              variant="contained"
              color="info"
              startIcon={<VisibilityIcon />}
              onClick={verCertificado}
            >
              Ver Certificado
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={porcentajeProgreso < 100}
                onClick={handleAprobarIncentivo}
                sx={{ mr: 1 }}
              >
                Aprobar incentivo
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                disabled={porcentajeProgreso < 100}
                onClick={handleDesaprobarIncentivo}
              >
                Desaprobar incentivo
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProcesoReportes; 