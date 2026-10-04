const incentivosRepo = require('../../Repositories/incentivos');
const constants = require('../../../constants');
const notificationService = require('../../Services/email/notificationService');

async function handler(req, res) {
  try {
    const { id_incentivo, id_docente, fecha_inicio, fecha_fin, observaciones } = req.body;
    
    // Obtener ruta del archivo de resolución si se subió
    const resolucion = req.file ? req.file.filename : null;
    
    const datosAsignacion = {
      id_docente,
      id_incentivo,
      fecha_inicio,
      fecha_fin,

      observaciones,
      resolucion
    };

    const response = await incentivosRepo.asignar(datosAsignacion);

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      // Enviar notificación por correo electrónico
      try {
        const datosNotificacion = {
          emailDocente: response.datosDocente.email_institucional,
          nombreDocente: `${response.datosDocente.nombre} ${response.datosDocente.apellidos}`,
          nombreIncentivo: response.datosIncentivo.nombre,
          descripcionIncentivo: response.datosIncentivo.descripcion,
          fechaInicio: response.asignacion.fecha_inicio,
          fechaFin: response.asignacion.fecha_fin,
          observaciones: response.asignacion.observaciones,
          frecuenciaReporte: response.datosIncentivo.frecuencia_informe_dias,
          fechaPrimerReporte: response.fechaPrimerReporte,
          idIncentivo: response.asignacion.id_docente_incentivo
        };

        await notificationService.notifyIncentivoAsignado(datosNotificacion);
      } catch (emailError) {
        console.error('Error al enviar notificación de incentivo asignado:', emailError.message);
        // No interrumpir el flujo principal por un error de email
      }

      return res.status(201).json({ 
        status: response.status,
        asignacion: response.asignacion,
        message: 'Incentivo asignado exitosamente'
      });
    }

    return res.status(response.failure_code || 500).json({ 
      status: response.status, 
      message: response.failure_message 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: constants.INTERNAL_ERROR_MESSAGE, 
      message: error.message 
    });
  }
}

module.exports = [handler]; 