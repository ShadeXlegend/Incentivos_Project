import { Box, Typography, Alert, CircularProgress, Button, Fab, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Settings as SettingsIcon, People as PeopleIcon } from '@mui/icons-material';
import { PageBreadcrumb } from 'components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Hooks
import { useIncentivosDashboard } from './hooks/useIncentivosDashboard';
import { useIncentivos } from './useIncentivos';

// Componentes
import EstadisticasPanel from './components/EstadisticasPanel';
import DocentesTable from './components/DocentesTable';
import AsignarIncentivoModal from './components/AsignarIncentivoModal';
import EditarIncentivoModal from './components/EditarIncentivoModal';
import GestionIncentivosTipos from './components/GestionIncentivosTipos';

const GestionIncentivos = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    estadisticas,
    docentesAsignados,
    reportesPendientes,
    filtros,
    totalDocentes,
    totalPages,
    asignarIncentivo,
    actualizarAsignacion,
    eliminarAsignacion,
    actualizarFiltros,
    cambiarPagina,
    extenderPlazo,
    setError
  } = useIncentivosDashboard();

  // Obtener la lista de tipos de incentivos disponibles para el filtro
  const { incentivos: tiposIncentivos, loading: loadingTiposIncentivos } = useIncentivos();

  // Estados para pestañas y modales
  const [tabActiva, setTabActiva] = useState(0);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [docenteIncentivoSeleccionado, setDocenteIncentivoSeleccionado] = useState(null);

  // Manejar ver proceso de reportes - navegar a vista completa
  const handleVerProceso = (docenteIncentivo) => {
    navigate(`/proceso-reportes/${docenteIncentivo.id_docente_incentivo}`);
  };

  // Manejar editar incentivo
  const handleEditarIncentivo = (docenteIncentivo) => {
    setDocenteIncentivoSeleccionado(docenteIncentivo);
    setModalEditarAbierto(true);
  };

  // Manejar asignación de incentivo
  const handleAsignarIncentivo = async (datosAsignacion) => {
    const resultado = await asignarIncentivo(datosAsignacion);
    return resultado;
  };

  // Abrir modal de asignación
  const handleAbrirModalAsignar = () => {
    setModalAsignarAbierto(true);
  };

  // Cerrar modal de asignación
  const handleCerrarModalAsignar = () => {
    setModalAsignarAbierto(false);
  };

  // Actualizar asignación de incentivo
  const handleActualizarAsignacion = async (id_docente_incentivo, formData) => {
    return await actualizarAsignacion(id_docente_incentivo, formData);
  };

  // Eliminar asignación de incentivo
  const handleEliminarAsignacion = async (id_docente_incentivo, formData) => {
    return await eliminarAsignacion(id_docente_incentivo, formData);
  };

  // Manejar extensión de plazo
  const handleExtenderPlazo = async (docenteIncentivo) => {
    try {
      // Paso 1: solicitar días de extensión
      const { value: dias } = await Swal.fire({
        title: 'Extender plazo',
        input: 'number',
        inputLabel: 'Días de extensión (1-15)',
        inputAttributes: {
          min: 1,
          max: 15,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || value < 1 || value > 15) {
            return 'Debe ingresar un número entre 1 y 15';
          }
        }
      });

      if (!dias) return;

      // Paso 2: solicitar mensaje para el docente
      const { value: mensaje } = await Swal.fire({
        title: 'Motivo de la extensión',
        input: 'textarea',
        inputLabel: 'Explique la razón de la extensión',
        inputPlaceholder: 'Escriba su mensaje...',
        showCancelButton: true,
        confirmButtonText: 'Extender',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return 'El mensaje es obligatorio';
          }
        }
      });

      if (!mensaje) return;

      // Llamar al endpoint
      const resultado = await extenderPlazo(docenteIncentivo.id_docente_incentivo, parseInt(dias, 10), mensaje);
      if (resultado.success) {
        Swal.fire('Éxito', 'Plazo extendido correctamente', 'success');
      } else {
        Swal.fire('Error', resultado.message || 'No se pudo extender el plazo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Ocurrió un error inesperado', 'error');
    }
  };

  // Cerrar modal de edición
  const handleCerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setDocenteIncentivoSeleccionado(null);
  };

  // Cambiar pestaña
  const handleCambiarTab = (event, newValue) => {
    setTabActiva(newValue);
  };

  if (error) {
    return (
      <Box component="main" sx={{ flexGrow: 1 }}>
        <PageBreadcrumb title="Gestión de Incentivos" subName="Administración" />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar los datos: {error}
          <br />
          <button onClick={() => setError(null)} style={{ marginTop: '8px' }}>
            Reintentar
          </button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      <PageBreadcrumb title="Gestión de Incentivos" subName="Administración" />
      
      {loading && !estadisticas && tabActiva === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando dashboard...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          {/* Navegación por pestañas */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabActiva} onChange={handleCambiarTab} aria-label="gestión incentivos tabs">
              <Tab 
                icon={<PeopleIcon />} 
                label="Incentivos Asignados" 
                iconPosition="start"
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Gestión de Tipos" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Contenido de la pestaña activa */}
          {tabActiva === 0 ? (
            <>
              {/* Panel de estadísticas */}
              <EstadisticasPanel 
                estadisticas={estadisticas} 
                loading={loading && !estadisticas} 
              />

              {/* Alertas de reportes pendientes */}
              {reportesPendientes && reportesPendientes.length > 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  action={
                    <Typography variant="body2" fontWeight="bold">
                      {reportesPendientes.length} reportes pendientes
                    </Typography>
                  }
                >
                  <Typography variant="body2">
                    Hay {reportesPendientes.length} reportes esperando validación. 
                    Revisa la tabla de docentes para procesarlos.
                  </Typography>
                </Alert>
              )}

              {/* Tabla de docentes */}
              <DocentesTable
                docentes={docentesAsignados}
                loading={loading}
                filtros={filtros}
                onFiltroChange={actualizarFiltros}
                onVerProceso={handleVerProceso}
                onEditarIncentivo={handleEditarIncentivo}
                onExtenderPlazo={handleExtenderPlazo}
                totalDocentes={totalDocentes}
                totalPages={totalPages}
                onPaginaChange={cambiarPagina}
                tiposIncentivos={tiposIncentivos}
                cargandoTipos={loadingTiposIncentivos}
              />
            </>
          ) : (
            /* Gestión de tipos de incentivos */
            <GestionIncentivosTipos />
          )}

          {/* Modal de asignación de incentivos */}
          <AsignarIncentivoModal
            open={modalAsignarAbierto}
            onClose={handleCerrarModalAsignar}
            onAsignar={handleAsignarIncentivo}
          />

          {/* Modal de edición de incentivos asignados */}
          <EditarIncentivoModal
            open={modalEditarAbierto}
            onClose={handleCerrarModalEditar}
            docenteIncentivo={docenteIncentivoSeleccionado}
            onActualizar={handleActualizarAsignacion}
            onEliminar={handleEliminarAsignacion}
          />
        </Box>
      )}

      {/* Botón flotante para asignar incentivo (solo en la primera pestaña) */}
      {tabActiva === 0 && (
        <Fab
          color="primary"
          aria-label="asignar incentivo"
          onClick={handleAbrirModalAsignar}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default GestionIncentivos; 