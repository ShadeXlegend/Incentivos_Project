import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Typography,
  Grid,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

const EstadoBadge = ({ estado }) => {
  const colores = {
    'VIGENTE': 'success',
    'FINALIZADO': 'default',
    'PAUSADO': 'warning'
  };
  
  return (
    <Chip 
      label={estado} 
      color={colores[estado] || 'default'}
      size="small"
    />
  );
};

const FechaDisplay = ({ fecha }) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-ES');
};

const DocentesTable = ({ 
  docentes = [], 
  loading, 
  filtros, 
  onFiltroChange, 
  onVerProceso,
  onEditarIncentivo,
  onExtenderPlazo,
  totalDocentes,
  onPaginaChange,
  tiposIncentivos = [],
  cargandoTipos = false
}) => {
  const handleChangePage = (event, newPage) => {
    onPaginaChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    onFiltroChange({ limit: newLimit, page: 1 });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
           Docentes con Incentivos Asignados
        </Typography>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar docente"
              placeholder="Nombre, apellido o documento..."
              value={filtros.busqueda}
              onChange={(e) => onFiltroChange({ busqueda: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtros.estado}
                onChange={(e) => onFiltroChange({ estado: e.target.value })}
                label="Estado"
              >
                <MenuItem value="VIGENTE">Vigente</MenuItem>
                <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                <MenuItem value="">Todos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth disabled={cargandoTipos}>
              <InputLabel>Tipo de Incentivo</InputLabel>
              <Select
                value={filtros.tipo_incentivo}
                label="Tipo de Incentivo"
                onChange={(e) => onFiltroChange({ tipo_incentivo: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {tiposIncentivos.map((tipo) => (
                  <MenuItem key={tipo.id_incentivo || tipo.id} value={tipo.nombre}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onFiltroChange({ 
                busqueda: '', 
                estado: 'VIGENTE', 
                tipo_incentivo: '' 
              })}
              sx={{ height: '56px' }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        {/* Tabla */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Docente</TableCell>
                <TableCell>Incentivo</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Próximo Reporte</TableCell>
                <TableCell>Progreso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Reportes</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : docentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No se encontraron docentes con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                docentes.map((row) => {
                  const docente = row.docente || {};
                  const incentivo = row.incentivo || {};
                  const plazoVencido = row.proxima_fecha_reporte && new Date(row.proxima_fecha_reporte) < new Date();
                  
                  return (
                    <TableRow key={row.id_docente_incentivo}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {`${docente.nombre || ''} ${docente.apellidos || ''}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {docente.numero_identificacion || 'Sin ID'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {incentivo.nombre || 'Sin nombre'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Frecuencia: {row.frecuencia_informe_dias || 0} días
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FechaDisplay fecha={row.fecha_inicio} />
                      </TableCell>
                      <TableCell>
                        <FechaDisplay fecha={row.fecha_fin} />
                      </TableCell>
                      <TableCell>
                        {row.proxima_fecha_reporte ? (
                          <Box>
                            <FechaDisplay fecha={row.proxima_fecha_reporte} />
                            {new Date(row.proxima_fecha_reporte) < new Date() && (
                              <Chip label="VENCIDO" color="error" size="small" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box minWidth={100}>
                          <LinearProgress 
                            variant="determinate" 
                            value={row.porcentaje_progreso || 0}
                            color={row.porcentaje_progreso >= 100 ? 'success' : 'primary'}
                            sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {row.reportes_validados || 0} / {row.total_reportes || 0} ({row.porcentaje_progreso || 0}%)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={row.estado} />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            Total: {row.total_reportes || 0}
                          </Typography>
                          {row.reportes_pendientes > 0 && (
                            <Chip 
                              label={`${row.reportes_pendientes} pendientes`}
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Ver proceso de reportes">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => onVerProceso(row)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar incentivo">
                            <IconButton 
                              color="secondary" 
                              size="small"
                              onClick={() => onEditarIncentivo(row)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {plazoVencido && (
                            <Tooltip title="Extender plazo">
                              <IconButton
                                color="warning"
                                size="small"
                                onClick={() => onExtenderPlazo(row)}
                              >
                                <DateRangeIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalDocentes}
          rowsPerPage={filtros.limit}
          page={filtros.page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default DocentesTable; 