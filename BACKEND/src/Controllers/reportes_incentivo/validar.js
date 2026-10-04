const reportesRepo = require('../../Repositories/reportes_incentivo');
const constants = require('../../../constants');
const notificationService = require('../../Services/email/notificationService');

async function handler(req, res) {
  try {
    const { id } = req.params;
    const { estado, observaciones, mensaje_administrador } = req.body; // estado = VALIDADO | RECHAZADO
    if (!['VALIDADO', 'RECHAZADO'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    // Si se rechaza, el mensaje del administrador es obligatorio
    if (estado === 'RECHAZADO' && (!mensaje_administrador || mensaje_administrador.trim().length === 0)) {
      return res.status(400).json({ 
        message: 'Debe proporcionar un mensaje explicativo al rechazar el reporte' 
      });
    }

    const response = await reportesRepo.validar(id, { 
      estado, 
      observaciones, 
      mensaje_administrador: mensaje_administrador ? mensaje_administrador.trim() : null 
    });

    if (response.status === constants.SUCCEEDED_MESSAGE) {
      // Enviar notificación por correo electrónico
      try {
        // Validar que tenemos los datos del docente para enviar el correo
        if (!response.datosDocente) {
          console.warn(' No se pudo enviar notificación: datosDocente es null/undefined');
          return res.status(200).json({ reporte: response.reporte });
        }

        if (!response.datosDocente.email_institucional) {
          console.warn(' No se pudo enviar notificación: email_institucional no disponible', {
            docente: {
              id: response.datosDocente.id,
              nombre: response.datosDocente.nombre,
              apellidos: response.datosDocente.apellidos,
              email_institucional: response.datosDocente.email_institucional
            }
          });
          return res.status(200).json({ reporte: response.reporte });
        }

        console.log(' Enviando correo a:', response.datosDocente.email_institucional);
        
        const datosNotificacion = {
          emailDocente: response.datosDocente.email_institucional,
          nombreDocente: `${response.datosDocente.nombre} ${response.datosDocente.apellidos}`,
          nombreIncentivo: response.datosIncentivo.nombre,
          fechaEntrega: response.reporte.fecha_envio, // CORREGIDO: era fecha_subida
          observaciones: observaciones,
          idReporte: response.reporte.id_reporte_incentivo
        };

        if (estado === 'VALIDADO') {
          // Calcular próximo reporte si existe
          datosNotificacion.proximoReporte = response.proximoReporte;
          datosNotificacion.frecuenciaReporte = response.datosIncentivo.frecuencia_informe_dias;
          
          await notificationService.notifyReporteValidado(datosNotificacion);
        } else if (estado === 'RECHAZADO') {
          datosNotificacion.mensajeAdministrador = mensaje_administrador;
          datosNotificacion.proximaFechaLimite = response.proximaFechaLimite;
          
          await notificationService.notifyReporteRechazado(datosNotificacion);
        }
      } catch (emailError) {
        console.error('Error al enviar notificación de validación de reporte:', emailError.message);
        // No interrumpir el flujo principal por un error de email
      }

      return res.status(200).json({ reporte: response.reporte });
    }

    return res.status(response.failure_code || 500).json({ message: response.failure_message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = [handler]; 