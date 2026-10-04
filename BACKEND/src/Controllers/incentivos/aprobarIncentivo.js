const incentivosRepo = require('../../Repositories/incentivos');
const notificationService = require('../../Services/email/notificationService');

module.exports = async (req, res) => {
  const { id_docente_incentivo } = req.params;
  try {
    const respuesta = await incentivosRepo.aprobarIncentivo(id_docente_incentivo);
    if (respuesta.status === 'SUCCEEDED') {

      // Enviar notificación al docente con certificado adjunto
      try {
        const datosNotificacion = {
          emailDocente: respuesta.datosDocente.email_institucional,
          nombreDocente: `${respuesta.datosDocente.nombre} ${respuesta.datosDocente.apellidos}`,
          nombreIncentivo: respuesta.datosIncentivo.nombre,
          fechaInicio: respuesta.asignacion.fecha_inicio,
          fechaFin: respuesta.asignacion.fecha_fin,
          observaciones: respuesta.asignacion.observaciones,
          rutaCertificado: respuesta.certificado,
          idIncentivo: respuesta.asignacion.id_docente_incentivo
        };

        await notificationService.notifyIncentivoCompletado(datosNotificacion);
      } catch (emailError) {
        console.error('Error al enviar notificación de incentivo completado:', emailError.message);
        // Continuar sin interrumpir la respuesta HTTP
      }

      return res.status(200).json({ certificado: respuesta.certificado });
    }
    return res.status(respuesta.failure_code || 400).json({ message: respuesta.failure_message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}; 