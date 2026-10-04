const emailService = require('./emailService');
const { EmailLog } = require('../../Models');

class NotificationService {
  
  /**
   * Registrar intento de envío de correo en la base de datos
   */
  async logEmailAttempt(emailData) {
    try {
      return await EmailLog.create({
        recipient_email: emailData.recipient_email,
        recipient_name: emailData.recipient_name,
        subject: emailData.subject,
        email_type: emailData.email_type,
        status: 'PENDIENTE',
        related_entity_id: emailData.related_entity_id,
        related_entity_type: emailData.related_entity_type
      });
    } catch (error) {
      console.error('Error al registrar intento de correo:', error.message);
      return null;
    }
  }

  /**
   * Actualizar estado de correo en la base de datos
   */
  async updateEmailStatus(logId, status, messageId = null, errorMessage = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date()
      };

      if (status === 'ENVIADO') {
        updateData.message_id = messageId;
        updateData.sent_at = new Date();
      } else if (status === 'FALLIDO') {
        updateData.error_message = errorMessage;
      }

      await EmailLog.update(updateData, {
        where: { id_email_log: logId }
      });
    } catch (error) {
      console.error('Error al actualizar estado de correo:', error.message);
    }
  }

  /**
   * Notificar asignación de incentivo con logging
   */
  async notifyIncentivoAsignado(datosCompletos) {
    const {
      emailDocente,
      nombreDocente,
      nombreIncentivo,
      descripcionIncentivo,
      fechaInicio,
      fechaFin,
      observaciones,
      frecuenciaReporte,
      fechaPrimerReporte,
      idIncentivo
    } = datosCompletos;

    // Crear log de intento
    const logEntry = await this.logEmailAttempt({
      recipient_email: emailDocente,
      recipient_name: nombreDocente,
      subject: `Incentivo Asignado: ${nombreIncentivo}`,
      email_type: 'INCENTIVO_ASIGNADO',
      related_entity_id: idIncentivo,
      related_entity_type: 'INCENTIVO'
    });

    if (!logEntry) {
      console.error('No se pudo crear el registro de log para el email');
      return { success: false, error: 'Error en el sistema de logging' };
    }

    try {
      // Enviar correo
      const result = await emailService.notifyIncentivoAsignado({
        emailDocente,
        nombreDocente,
        nombreIncentivo,
        descripcionIncentivo,
        fechaInicio,
        fechaFin,
        observaciones,
        frecuenciaReporte,
        fechaPrimerReporte
      });

      // Actualizar estado en base de datos
      if (result.success) {
        await this.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Notificación de incentivo asignado enviada a ${emailDocente}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar notificación de incentivo a ${emailDocente}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }
    } catch (error) {
      await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, error.message);
      console.error('Error inesperado al enviar notificación de incentivo:', error.message);
      return { success: false, error: error.message, logId: logEntry.id_email_log };
    }
  }

  /**
   * Notificar validación de reporte con logging
   */
  async notifyReporteValidado(datosCompletos) {
    const {
      emailDocente,
      nombreDocente,
      nombreIncentivo,
      fechaEntrega,
      observaciones,
      proximoReporte,
      frecuenciaReporte,
      idReporte
    } = datosCompletos;

    // Crear log de intento
    const logEntry = await this.logEmailAttempt({
      recipient_email: emailDocente,
      recipient_name: nombreDocente,
      subject: `Reporte Validado - ${nombreIncentivo}`,
      email_type: 'REPORTE_VALIDADO',
      related_entity_id: idReporte,
      related_entity_type: 'REPORTE'
    });

    if (!logEntry) {
      console.error('No se pudo crear el registro de log para el email');
      return { success: false, error: 'Error en el sistema de logging' };
    }

    try {
      // Enviar correo
      const result = await emailService.notifyReporteValidado({
        emailDocente,
        nombreDocente,
        nombreIncentivo,
        fechaEntrega,
        observaciones,
        proximoReporte,
        frecuenciaReporte
      });

      // Actualizar estado en base de datos
      if (result.success) {
        await this.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Notificación de reporte validado enviada a ${emailDocente}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar notificación de reporte validado a ${emailDocente}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }
    } catch (error) {
      await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, error.message);
      console.error('Error inesperado al enviar notificación de reporte validado:', error.message);
      return { success: false, error: error.message, logId: logEntry.id_email_log };
    }
  }

  /**
   * Notificar rechazo de reporte con logging
   */
  async notifyReporteRechazado(datosCompletos) {
    const {
      emailDocente,
      nombreDocente,
      nombreIncentivo,
      fechaEntrega,
      observaciones,
      mensajeAdministrador,
      proximaFechaLimite,
      idReporte
    } = datosCompletos;

    // Crear log de intento
    const logEntry = await this.logEmailAttempt({
      recipient_email: emailDocente,
      recipient_name: nombreDocente,
      subject: `Reporte Rechazado - ${nombreIncentivo}`,
      email_type: 'REPORTE_RECHAZADO',
      related_entity_id: idReporte,
      related_entity_type: 'REPORTE'
    });

    if (!logEntry) {
      console.error('No se pudo crear el registro de log para el email');
      return { success: false, error: 'Error en el sistema de logging' };
    }

    try {
      // Enviar correo
      const result = await emailService.notifyReporteRechazado({
        emailDocente,
        nombreDocente,
        nombreIncentivo,
        fechaEntrega,
        observaciones,
        mensajeAdministrador,
        proximaFechaLimite
      });

      // Actualizar estado en base de datos
      if (result.success) {
        await this.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Notificación de reporte rechazado enviada a ${emailDocente}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar notificación de reporte rechazado a ${emailDocente}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }
    } catch (error) {
      await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, error.message);
      console.error('Error inesperado al enviar notificación de reporte rechazado:', error.message);
      return { success: false, error: error.message, logId: logEntry.id_email_log };
    }
  }

  /**
   * Notificar incentivo completado con logging y certificado adjunto
   */
  async notifyIncentivoCompletado(datosCompletos) {
    const {
      emailDocente,
      nombreDocente,
      nombreIncentivo,
      fechaInicio,
      fechaFin,
      observaciones,
      rutaCertificado,
      idIncentivo
    } = datosCompletos;

    // Crear registro en EmailLog
    const logEntry = await this.logEmailAttempt({
      recipient_email: emailDocente,
      recipient_name: nombreDocente,
      subject: `Incentivo Completado - ${nombreIncentivo}`,
      email_type: 'INCENTIVO_COMPLETADO',
      related_entity_id: idIncentivo,
      related_entity_type: 'INCENTIVO'
    });

    if (!logEntry) {
      console.error('No se pudo crear el registro de log para el email');
      return { success: false, error: 'Error en el sistema de logging' };
    }

    try {
      const result = await emailService.notifyIncentivoCompletado({
        emailDocente,
        nombreDocente,
        nombreIncentivo,
        fechaInicio,
        fechaFin,
        observaciones,
        rutaCertificado
      });

      if (result.success) {
        await this.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Notificación de incentivo completado enviada a ${emailDocente}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar notificación de incentivo completado a ${emailDocente}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }
    } catch (error) {
      await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, error.message);
      console.error('Error inesperado al enviar notificación de incentivo completado:', error.message);
      return { success: false, error: error.message, logId: logEntry.id_email_log };
    }
  }

  /**
   * Notificar incentivo denegado con logging y certificado adjunto
   */
  async notifyIncentivoDenegado(datosCompletos) {
    const {
      emailDocente,
      nombreDocente,
      nombreIncentivo,
      fechaInicio,
      fechaFin,
      observaciones,
      mensajeAdministrador,
      rutaCertificado,
      idIncentivo
    } = datosCompletos;

    const logEntry = await this.logEmailAttempt({
      recipient_email: emailDocente,
      recipient_name: nombreDocente,
      subject: `Incentivo Rechazado - ${nombreIncentivo}`,
      email_type: 'INCENTIVO_DENEGADO',
      related_entity_id: idIncentivo,
      related_entity_type: 'INCENTIVO'
    });

    if (!logEntry) {
      console.error('No se pudo crear el registro de log para el email');
      return { success: false, error: 'Error en el sistema de logging' };
    }

    try {
      const result = await emailService.notifyIncentivoDenegado({
        emailDocente,
        nombreDocente,
        nombreIncentivo,
        fechaInicio,
        fechaFin,
        observaciones,
        mensajeAdministrador,
        rutaCertificado
      });

      if (result.success) {
        await this.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Notificación de incentivo denegado enviada a ${emailDocente}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar notificación de incentivo denegado a ${emailDocente}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }
    } catch (error) {
      await this.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, error.message);
      console.error('Error inesperado al enviar notificación de incentivo denegado:', error.message);
      return { success: false, error: error.message, logId: logEntry.id_email_log };
    }
  }

  /**
   * Obtener estadísticas de emails enviados
   */
  async getEmailStats(startDate, endDate) {
    try {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [startDate, endDate]
        };
      }

      const stats = await EmailLog.findAll({
        attributes: [
          'email_type',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id_email_log')), 'count']
        ],
        where: whereClause,
        group: ['email_type', 'status']
      });

      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de email:', error.message);
      return [];
    }
  }
}

// Instancia singleton
const notificationService = new NotificationService();

module.exports = notificationService; 