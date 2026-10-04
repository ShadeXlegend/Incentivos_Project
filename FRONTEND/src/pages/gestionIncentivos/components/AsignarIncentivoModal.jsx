import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { es } from 'date-fns/locale';
import { gsUrlApi } from '@src/config/ConfigServer';
import Swal from 'sweetalert2';

const AsignarIncentivoModal = ({ open, onClose, onAsignar }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id_docente: '',
    id_incentivo: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
    resolucion: null
  });

  // Estados para listas
  const [docentes, setDocentes] = useState([]);
  const [incentivos, setIncentivos] = useState([]);
  const [loadingListas, setLoadingListas] = useState(true);

  const token = localStorage.getItem('token');

  // Cargar docentes e incentivos al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDatosFormulario();
    } else {
      // Resetear formulario al cerrar
      setFormData({
        id_docente: '',
        id_incentivo: '',
        fecha_inicio: '',
        fecha_fin: '',
        observaciones: '',
        resolucion: null
      });
      setError(null);
    }
  }, [open]);

  const cargarDatosFormulario = async () => {
    setLoadingListas(true);
    try {
      // Cargar docentes y incentivos en paralelo
      const [docentesResp, incentivosResp] = await Promise.all([
        fetch(`${gsUrlApi}/usuarioDocente/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${gsUrlApi}/incentivos/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const docentesData = await docentesResp.json();
      const incentivosData = await incentivosResp.json();

      if (docentesResp.ok) {
        setDocentes(docentesData.usuarios_docentes || []);
      }
      
      if (incentivosResp.ok) {
        // Filtrar solo incentivos activos
        const incentivosActivos = (incentivosData.incentivos || [])
          .filter(incentivo => incentivo.estado === 'ACTIVO');
        setIncentivos(incentivosActivos);
      }
    } catch {
      setError('Error al cargar los datos del formulario');
    } finally {
      setLoadingListas(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validarFormulario = () => {
    if (!formData.id_docente) {
      setError('Debe seleccionar un docente');
      return false;
    }
    if (!formData.id_incentivo) {
      setError('Debe seleccionar un incentivo');
      return false;
    }
    if (!formData.fecha_inicio) {
      setError('Debe seleccionar la fecha de inicio');
      return false;
    }
    if (!formData.fecha_fin) {
      setError('Debe seleccionar la fecha de finalización');
      return false;
    }
    if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de finalización');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append('id_docente', formData.id_docente);
      formDataToSend.append('id_incentivo', formData.id_incentivo);
      formDataToSend.append('fecha_inicio', formData.fecha_inicio);
      formDataToSend.append('fecha_fin', formData.fecha_fin);
      formDataToSend.append('frecuencia_informe_dias', formData.frecuencia_informe_dias);
      formDataToSend.append('observaciones', formData.observaciones);
      
      if (formData.resolucion) {
        formDataToSend.append('resolucion', formData.resolucion);
      }

      const resultado = await onAsignar(formDataToSend);

      if (resultado.success) {
        Swal.fire({
          title: '¡Incentivo Asignado!',
          text: 'El incentivo ha sido asignado exitosamente al docente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        onClose();
      } else {
        setError(resultado.message || 'Error al asignar el incentivo');
      }
    } catch {
      setError('Error inesperado al asignar el incentivo');
    } finally {
      setLoading(false);
    }
  };

  const docenteSeleccionado = docentes.find(d => d.id_docente === formData.id_docente);
  const incentivoSeleccionado = incentivos.find(i => i.id_incentivo === formData.id_incentivo);

  // Calcular fechas límite según el incentivo seleccionado
  const calcularFechaMaxima = () => {
    if (!formData.fecha_inicio || !incentivoSeleccionado) return '';
    
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaMaxima = new Date(fechaInicio);
    fechaMaxima.setMonth(fechaMaxima.getMonth() + incentivoSeleccionado.tiempo_maximo_meses);
    
    return fechaMaxima.toISOString().split('T')[0];
  };

  const calcularFechaMinima = () => {
    if (!formData.fecha_inicio || !incentivoSeleccionado) return '';
    
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaMinima = new Date(fechaInicio);
    fechaMinima.setMonth(fechaMinima.getMonth() + incentivoSeleccionado.tiempo_minimo_meses);
    
    return fechaMinima.toISOString().split('T')[0];
  };

  // Calcular información para el resumen
  const calcularInfoResumen = () => {
    if (!formData.fecha_inicio || !formData.fecha_fin || !incentivoSeleccionado) return null;

    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);
    const diasTotales = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
    const años = Math.floor(diasTotales / 365);
    const meses = Math.floor((diasTotales % 365) / 30);
    
    let duracionTexto = '';
    if (años > 0) {
      duracionTexto += `${años} año${años > 1 ? 's' : ''}`;
      if (meses > 0) duracionTexto += ` y ${meses} mes${meses > 1 ? 'es' : ''}`;
    } else if (meses > 0) {
      duracionTexto += `${meses} mes${meses > 1 ? 'es' : ''}`;
    } else {
      duracionTexto += `${diasTotales} día${diasTotales > 1 ? 's' : ''}`;
    }
    duracionTexto += ` (${diasTotales} días)`;

    // Calcular frecuencia de informes
    const frecuenciaDias = incentivoSeleccionado.frecuencia_informe_dias;
    const frecuenciaMeses = Math.floor(frecuenciaDias / 30);
    let frecuenciaTexto = '';
    if (frecuenciaMeses > 0) {
      frecuenciaTexto = `cada ${frecuenciaMeses} mes${frecuenciaMeses > 1 ? 'es' : ''} (${frecuenciaDias} días)`;
    } else {
      frecuenciaTexto = `cada ${frecuenciaDias} días`;
    }

    return {
      duracion: duracionTexto,
      frecuencia: frecuenciaTexto
    };
  };

  const infoResumen = calcularInfoResumen();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Asignar Incentivo a Docente
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loadingListas ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Selección de Docente */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={docentes}
                getOptionLabel={(option) => 
                  `${option.nombre} ${option.apellidos} - ${option.cedula}`
                }
                value={docenteSeleccionado || null}
                onChange={(event, newValue) => {
                  handleInputChange('id_docente', newValue?.id_docente || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Docente *"
                    placeholder="Buscar docente..."
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.nombre} {option.apellidos}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.cedula} - {option.correo_institucional}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Selección de Incentivo */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Tipo de Incentivo *"
                value={formData.id_incentivo}
                onChange={(e) => handleInputChange('id_incentivo', e.target.value)}
                fullWidth
              >
                {incentivos.map((incentivo) => (
                  <MenuItem key={incentivo.id_incentivo} value={incentivo.id_incentivo}>
                    <Box>
                      <Typography variant="body1">{incentivo.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {incentivo.descripcion}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fechas */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha de Inicio *"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: (() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - 2);
                    return date.toISOString().split('T')[0];
                  })()
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha de Finalización *"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: calcularFechaMinima(),
                  max: calcularFechaMaxima()
                }}
                helperText={incentivoSeleccionado ? 
                  `Duración permitida: ${incentivoSeleccionado.tiempo_minimo_meses} - ${incentivoSeleccionado.tiempo_maximo_meses} meses` : 
                  'Selecciona un incentivo primero'
                }
              />
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                fullWidth
                placeholder="Observaciones adicionales sobre la asignación..."
              />
            </Grid>

            {/* Archivo de Resolución */}
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Resolución (Opcional)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sube el archivo PDF de la resolución del incentivo (máximo 10MB)
                </Typography>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleInputChange('resolucion', e.target.files[0])}
                  style={{ marginTop: '8px' }}
                />
                {formData.resolucion && (
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Archivo: ${formData.resolucion.name}`}
                      color="success"
                      variant="outlined"
                      onDelete={() => handleInputChange('resolucion', null)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Resumen de la asignación */}
            {docenteSeleccionado && incentivoSeleccionado && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Asignación
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`Docente: ${docenteSeleccionado.nombre} ${docenteSeleccionado.apellidos}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={`Incentivo: ${incentivoSeleccionado.nombre}`}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  {infoResumen && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Duración:</strong> {infoResumen.duracion}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Informes:</strong> {infoResumen.frecuencia}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || loadingListas}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Asignando...' : 'Asignar Incentivo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarIncentivoModal; 