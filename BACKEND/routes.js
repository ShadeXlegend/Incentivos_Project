const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require('./src/Middlewares/upload');
const uploadCertificado = require('./src/Middlewares/uploadCertificado')
const uploadResolucion = require('./src/Middlewares/uploadResolucion');
const constants = require("./constants");
const verifyToken = require('./src/Middlewares/authentication');

const rutas = () => {
  const storage = multer.memoryStorage();

  //---------------------------------------Controladores---------------------------------------

  //Login
  const loginController = require("./src/Controllers/login");

  //Interface
  const interfacesController = require('./src/Controllers/interfaces');

  //Usuario
  const usuariosController = require("./src/Controllers/usuarios");

  //Formacion
  const formacionesController = require('./src/Controllers/formaciones');

  //Roles
  const rolesInterfacesController = require('./src/Controllers/roles');

  //Cualificación
  const cualificacionController = require('./src/Controllers/cualificacion');

  // Incentivos
  const incentivosController = require('./src/Controllers/incentivos');

  //Usuario Docente
  const usuarioDocenteController = require('./src/Controllers/usuario_docente');

  //Emails
  const emailsController = require('./src/Controllers/emails');

  //---------------------------------------Rutas---------------------------------------

  // Ruta base
  router.get("/", (req, res) => {
    res.status(200).json({ response: "El back está backeando" });
  });

  // Login
  router.post("/login", loginController.login);

  // Interfaces
  router.get('/interfaces/buscar', verifyToken, interfacesController.buscar);
  router.put('/interfaces/actualizar', verifyToken, interfacesController.actualizar);
  router.get('/interfaces/listarTodas',verifyToken,interfacesController.listarTodas);
  router.get('/interfaces/permisos-docente', verifyToken, interfacesController.verificarPermisosDocente);

  // Usuarios
  router.post("/usuarios/insertarAdmin", usuariosController.insertarAdmin);
  router.post("/usuarios/insertarDocentes", usuariosController.insertarDocentes);
  router.get("/usuarios/listar", verifyToken, usuariosController.listar);
  router.put("/usuarios/actualizar/:id", verifyToken, usuariosController.actualizar);
  router.delete("/usuarios/eliminar/:id", usuariosController.eliminar);

  //Formaciones
  router.post("/formacion/insertar", verifyToken, formacionesController.insertar);
  router.get("/formacion/listar", verifyToken, formacionesController.listar);
  router.put("/formacion/actualizar/:id", verifyToken, formacionesController.actualizar);
  router.delete("/formacion/eliminar/:id", formacionesController.eliminar);
  router.post("/formacion/cargaMasiva",formacionesController.cargarFormacionesMasivo);

  //Roles
  router.post('/roles/:idRol/interfaces', verifyToken, rolesInterfacesController.guardar);
  router.get('/roles/:idRol/interfaces', verifyToken, rolesInterfacesController.buscar);
  router.get("/roles", verifyToken, rolesInterfacesController.listar);

  // Cualificación
  router.get('/cualificacion/listar', cualificacionController.listar);
  router.post('/cualificacion/insertar', uploadCertificado.single('certificado'),cualificacionController.insertar);
  router.put('/cualificacion/actualizar/:id', cualificacionController.actualizar);
  router.delete('/cualificacion/eliminar/:id', cualificacionController.eliminar);
  router.post('/cualificacion/subirCertificado/:idCualificacion', uploadCertificado.single('certificado'), cualificacionController.subirCertificado);
  router.get('/cualificacion/obtenerPorUsuario', cualificacionController.obtenerCualificacionesPorUsuarioId);

  // Incentivos - Rutas básicas
  router.post('/incentivos/insertar', verifyToken, uploadResolucion.single('resolucion'), incentivosController.insertar);
  router.get('/incentivos/listar', verifyToken, incentivosController.listar);
  router.put('/incentivos/actualizar/:id', verifyToken, uploadResolucion.single('resolucion'), incentivosController.actualizar);
  router.delete('/incentivos/eliminar/:id', verifyToken, incentivosController.eliminar);
  router.post('/incentivos/asignar', verifyToken, uploadResolucion.single('resolucion'), incentivosController.asignar);
  router.put('/incentivos/asignacion/:id_docente_incentivo', verifyToken, uploadResolucion.single('resolucion'), incentivosController.actualizarAsignacion);
  router.delete('/incentivos/asignacion/:id_docente_incentivo', verifyToken, uploadResolucion.single('resolucion'), incentivosController.eliminarAsignacion);
  router.get('/incentivos/docente', verifyToken, incentivosController.listarPorDocente);
  router.get('/incentivos/docente/:idDocente', verifyToken, incentivosController.listarPorDocente);

  // Incentivos - Rutas avanzadas para admin
  router.get('/incentivos/docentes-asignados', verifyToken, incentivosController.listarDocentesAsignados);
  router.get('/incentivos/estadisticas', verifyToken, incentivosController.obtenerEstadisticas);
  router.get('/incentivos/calcular-fechas/:id_docente_incentivo', verifyToken, incentivosController.calcularFechasReporte);

  // Incentivos - Rutas avanzadas para docentes
  router.get('/incentivos/mi-progreso', verifyToken, incentivosController.obtenerMiProgreso);

  // Reportes Incentivo
  const reportesController = require('./src/Controllers/reportes_incentivo');
  const uploadPDF = require('./src/Middlewares/uploadPDF');

  // Reportes - Rutas básicas
  router.post('/incentivos/reportes/subir', verifyToken, uploadPDF.single('archivo'), reportesController.subir);
  router.get('/incentivos/reportes/pendientes', verifyToken, reportesController.listarPendientes);
  router.put('/incentivos/reportes/:id/validar', verifyToken, reportesController.validar);

  // Reportes - Rutas avanzadas
router.get('/incentivos/reportes/docente/:idDocente', verifyToken, reportesController.listarPorDocente);
router.get('/incentivos/reportes/docente-incentivo/:id_docente_incentivo', verifyToken, reportesController.listarPorDocenteIncentivo);
router.get('/incentivos/reportes/mis-pendientes', verifyToken, reportesController.obtenerReportesPendientes);
router.post('/incentivos/reportes/:id_docente_incentivo/extender-plazo', verifyToken, reportesController.extenderPlazo);

  // Usuario Docente
  router.get('/usuarioDocente/listar',  usuarioDocenteController.listarDetalle);

  // Emails - Administración del sistema de correos
  router.get('/emails/verify-connection', emailsController.verifyConnection); // Sin autenticación por ahora para pruebas
  router.get('/emails/stats', verifyToken, emailsController.getEmailStats);
  router.post('/emails/resend/:emailLogId', verifyToken, emailsController.resendEmail);
  router.post('/emails/execute-reminders', verifyToken, emailsController.executeReminders);
  
  // Incentivos - Aprobación / Desaprobación final
  router.put('/incentivos/docente-incentivo/:id_docente_incentivo/aprobar', verifyToken, incentivosController.aprobarIncentivo);
  router.put('/incentivos/docente-incentivo/:id_docente_incentivo/desaprobar', verifyToken, incentivosController.desaprobarIncentivo);
  // Recordar plazo manual
  router.post('/incentivos/docente-incentivo/:id_docente_incentivo/recordar-plazo', verifyToken, incentivosController.recordarPlazo);

  // Ver certificado generado
  router.get('/incentivos/docente-incentivo/:id_docente_incentivo/certificado', verifyToken, incentivosController.getCertificado);

  return router;
};

module.exports = rutas;
