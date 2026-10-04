import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

// Componente del modal de eliminación
const EliminarIncentivoModal = ({ open, onClose, docenteIncentivo, onEliminar }) => {
  const [formData, setFormData] = useState({
    observaciones: '',
    resolucion: null
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, resolucion: file }));
    } else {
      Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
      event.target.value = '';
    }
  };

  const handleEliminar = async () => {
    if (!formData.observaciones.trim()) {
      Swal.fire('Error', 'Las observaciones son obligatorias para eliminar el incentivo', 'warning');
      return;
    }

    if (!formData.resolucion) {
      Swal.fire('Error', 'Debe subir la resolución del Consejo para eliminar el incentivo', 'warning');
      return;
    }

    const confirmacion = await Swal.fire({
      title: '¿Confirmar Eliminación?',
      text: 'Esta acción eliminará el incentivo de la vista del docente y administrador. ¿Está seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('resolucion', formData.resolucion);

      const resultado = await onEliminar(docenteIncentivo.id_docente_incentivo, formDataToSend);
      
      if (resultado.success) {
        Swal.fire('Eliminado', 'El incentivo ha sido eliminado correctamente', 'success');
        onClose();
      } else {
        Swal.fire('Error', resultado.message || 'No se pudo eliminar el incentivo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al eliminar: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ observaciones: '', resolucion: null });
    onClose();
  };

  if (!docenteIncentivo) return null;

  const docente = docenteIncentivo.docente || {};
  const incentivo = docenteIncentivo.incentivo || {};

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <DeleteIcon color="error" />
          <Box>
            <Typography variant="h6" color="error">
              Eliminar Incentivo Asignado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`${docente.nombre || ''} ${docente.apellidos || ''}`}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Incentivo:</strong> {incentivo.nombre || 'Sin especificar'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Esta acción eliminará el incentivo de la vista del docente y administrador.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Resolución del Consejo *
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ marginTop: '8px' }}
              />
              {formData.resolucion && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Archivo seleccionado: {formData.resolucion.name}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                Debe subir la resolución del Consejo que dicta que este incentivo ya no sigue vigente
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones *"
                multiline
                rows={4}
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Motivo de la eliminación del incentivo..."
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleEliminar} 
          variant="contained" 
          color="error"
          startIcon={<DeleteIcon />}
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditarIncentivoModal = ({ open, onClose, docenteIncentivo, onActualizar, onEliminar }) => {
  const [formData, setFormData] = useState({
    fecha_inicio: null,
    fecha_fin: null,
    frecuencia_informe_dias: '',
    observaciones: '',
    estado: ''
  });
  const [loading, setLoading] = useState(false);
  const [resolucionFile, setResolucionFile] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  useEffect(() => {
    if (docenteIncentivo) {
      setFormData({
        fecha_inicio: docenteIncentivo.fecha_inicio ? new Date(docenteIncentivo.fecha_inicio) : null,
        fecha_fin: docenteIncentivo.fecha_fin ? new Date(docenteIncentivo.fecha_fin) : null,
        frecuencia_informe_dias: docenteIncentivo.frecuencia_informe_dias?.toString() || '',
        observaciones: docenteIncentivo.observaciones || '',
        estado: docenteIncentivo.estado || 'VIGENTE'
      });
    }
  }, [docenteIncentivo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResolucionFile(file);
    } else {
      Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      Swal.fire('Error', 'Las fechas de inicio y fin son obligatorias', 'warning');
      return;
    }

    if (formData.fecha_inicio >= formData.fecha_fin) {
      Swal.fire('Error', 'La fecha de inicio debe ser anterior a la fecha de fin', 'warning');
      return;
    }

    if (!formData.frecuencia_informe_dias || formData.frecuencia_informe_dias < 1) {
      Swal.fire('Error', 'La frecuencia de informe debe ser mayor a 0 días', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fecha_inicio', formData.fecha_inicio.toISOString().split('T')[0]);
      formDataToSend.append('fecha_fin', formData.fecha_fin.toISOString().split('T')[0]);
      formDataToSend.append('frecuencia_informe_dias', parseInt(formData.frecuencia_informe_dias));
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('estado', formData.estado);
      
      if (resolucionFile) {
        formDataToSend.append('resolucion', resolucionFile);
      }

      const resultado = await onActualizar(docenteIncentivo.id_docente_incentivo, formDataToSend);
      
      if (resultado.success) {
        Swal.fire('Éxito', 'Incentivo actualizado correctamente', 'success');
        onClose();
      } else {
        Swal.fire('Error', resultado.message || 'No se pudo actualizar el incentivo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al actualizar: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fecha_inicio: null,
      fecha_fin: null,
      frecuencia_informe_dias: '',
      observaciones: '',
      estado: ''
    });
    setResolucionFile(null);
    onClose();
  };

  const mostrarInfoDocente = (docente) => {
    const partes = [];
    if (docente.nombre && docente.apellidos) {
      partes.push(`${docente.nombre} ${docente.apellidos}`);
    }
    if (docente.numero_identificacion) {
      partes.push(`ID: ${docente.numero_identificacion}`);
    }
    if (docente.email_institucional) {
      partes.push(docente.email_institucional);
    }
    return partes.length > 0 ? partes.join(' - ') : 'Información no disponible';
  };

  if (!docenteIncentivo) return null;

  const docente = docenteIncentivo.docente || {};
  const incentivo = docenteIncentivo.incentivo || {};

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <PersonIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  Editar Incentivo Asignado
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {`${docente.nombre || ''} ${docente.apellidos || ''}`}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Información del incentivo */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Tipo de Incentivo:</strong> {incentivo.nombre || 'Sin especificar'}
                </Typography>
                <Typography variant="body2">
                  <strong>Docente:</strong> {mostrarInfoDocente(docente)}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                {/* Fechas */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de Inicio"
                    value={formData.fecha_inicio}
                    onChange={(newValue) => handleInputChange('fecha_inicio', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de Fin"
                    value={formData.fecha_fin}
                    onChange={(newValue) => handleInputChange('fecha_fin', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                {/* Frecuencia y Estado */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Frecuencia de Informe (días)"
                    type="number"
                    value={formData.frecuencia_informe_dias}
                    onChange={(e) => handleInputChange('frecuencia_informe_dias', e.target.value)}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="VIGENTE">
                        <Chip label="VIGENTE" color="success" size="small" />
                      </MenuItem>
                      <MenuItem value="FINALIZADO">
                        <Chip label="FINALIZADO" color="default" size="small" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Observaciones */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Observaciones adicionales sobre la asignación..."
                  />
                </Grid>

                {/* Archivo de Resolución */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Actualizar Resolución (Opcional)
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ marginTop: '8px' }}
                  />
                  {resolucionFile && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      Archivo seleccionado: {resolucionFile.name}
                    </Typography>
                  )}
                  {docenteIncentivo.resolucion && (
                    <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                      Resolución actual: {docenteIncentivo.resolucion}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button 
              onClick={() => setModalEliminarAbierto(true)} 
              startIcon={<DeleteIcon />}
              color="error"
              disabled={loading}
            >
              Eliminar
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              onClick={handleClose} 
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Modal de Eliminación */}
      <EliminarIncentivoModal
        open={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        docenteIncentivo={docenteIncentivo}
        onEliminar={onEliminar}
      />
    </>
  );
};

export default EditarIncentivoModal; 