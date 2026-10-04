const notificationService = require('./notificationService');
const emailService = require('./emailService');
const { DocenteIncentivo, Incentivo, Docente, ReporteIncentivo, EmailLog } = require('../../Models');
const { Op } = require('sequelize');

class ReminderService {
  
  /**
   * Obtener reportes que necesitan recordatorios
   */
  async getReportesForReminders() {
    try {
      const hoy = new Date();
      const en30Dias = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
      const en10Dias = new Date(hoy.getTime() + (10 * 24 * 60 * 60 * 1000));
      const en1Dia = new Date(hoy.getTime() + (1 * 24 * 60 * 60 * 1000));

      // Obtener incentivos vigentes
      const incentivosVigentes = await DocenteIncentivo.findAll({
        where: { 
          estado: 'VIGENTE',
          fecha_fin: { [Op.gte]: hoy } // Solo incentivos que no han terminado
        },
        include: [
          {
            model: Docente,
            as: 'docente'
          },
          {
            model: Incentivo,
            as: 'incentivo'
          }
        ]
      });

      const recordatoriosPendientes = [];

      for (const incentivo of incentivosVigentes) {
        // Calcular próximas fechas de reporte
        const proximasFechas = await this.calcularProximasFechasReporte(incentivo);
        
        for (const fecha of proximasFechas) {
          const diasHastaVencimiento = Math.ceil((fecha.fechaLimite - hoy) / (1000 * 60 * 60 * 24));
          
          // Verificar si necesita recordatorio
          if (diasHastaVencimiento === 30 || diasHastaVencimiento === 10 || diasHastaVencimiento === 1) {
            // Verificar si ya se envió este recordatorio
            const yaEnviado = await this.yaSeEnvioRecordatorio(
              incentivo.id_docente_incentivo,
              fecha.fechaLimite,
              diasHastaVencimiento
            );

            if (!yaEnviado) {
              recordatoriosPendientes.push({
                docenteIncentivo: incentivo,
                fechaLimite: fecha.fechaLimite,
                diasAntes: diasHastaVencimiento,
                numeroReporte: fecha.numeroReporte
              });
            }
          }
        }
      }

      return recordatoriosPendientes;
    } catch (error) {
      console.error('Error al obtener reportes para recordatorios:', error.message);
      return [];
    }
  }

  /**
   * Calcular próximas fechas de reporte para un incentivo
   */
  async calcularProximasFechasReporte(docenteIncentivo) {
    try {
      const fechaInicio = new Date(docenteIncentivo.fecha_inicio);
      const fechaFin = new Date(docenteIncentivo.fecha_fin);
      const frecuenciaDias = docenteIncentivo.frecuencia_informe_dias;

      // Obtener reportes ya enviados y validados
      const reportesValidados = await ReporteIncentivo.findAll({
        where: {
          id_docente_incentivo: docenteIncentivo.id_docente_incentivo,
          estado: 'VALIDADO'
        },
        order: [['fecha_envio', 'ASC']]
      });

      const proximasFechas = [];
      let fechaActual = new Date(fechaInicio);
      let numeroReporte = 1;

      // Generar fechas de reporte
      while (fechaActual <= fechaFin) {
        fechaActual.setDate(fechaActual.getDate() + frecuenciaDias);
        
        if (fechaActual <= fechaFin) {
          // Verificar si este reporte ya fue validado
          const reporteExistente = reportesValidados.find((r, index) => index === numeroReporte - 1);
          
          if (!reporteExistente) {
            proximasFechas.push({
              fechaLimite: new Date(fechaActual),
              numeroReporte: numeroReporte
            });
          }
        }
        
        numeroReporte++;
      }

      return proximasFechas;
    } catch (error) {
      console.error('Error al calcular próximas fechas de reporte:', error.message);
      return [];
    }
  }

  /**
   * Verificar si ya se envió un recordatorio específico
   */
  async yaSeEnvioRecordatorio(idDocenteIncentivo, fechaLimite, diasAntes) {
    try {
      const recordatorio = await EmailLog.findOne({
        where: {
          email_type: `RECORDATORIO_${diasAntes}_DIAS`,
          related_entity_id: idDocenteIncentivo,
          related_entity_type: 'DOCENTE_INCENTIVO',
          status: 'ENVIADO',
          // Buscar recordatorios enviados en los últimos días para esta fecha específica
          created_at: {
            [Op.gte]: new Date(Date.now() - (diasAntes + 5) * 24 * 60 * 60 * 1000)
          }
        }
      });

      return !!recordatorio;
    } catch (error) {
      console.error('Error al verificar recordatorio enviado:', error.message);
      return false;
    }
  }

  /**
   * Enviar recordatorio de reporte pendiente
   */
  async enviarRecordatorio(datosRecordatorio) {
    const {
      docenteIncentivo,
      fechaLimite,
      diasAntes,
      numeroReporte
    } = datosRecordatorio;

    try {
      const docente = docenteIncentivo.docente;
      const incentivo = docenteIncentivo.incentivo;

      if (!docente.email_institucional) {
        console.warn(`Docente ${docente.nombre} no tiene email institucional`);
        return { success: false, error: 'Email no disponible' };
      }

      // Crear log de intento
      const logEntry = await notificationService.logEmailAttempt({
        recipient_email: docente.email_institucional,
        recipient_name: `${docente.nombre} ${docente.apellidos}`,
        subject: this.getSubjectRecordatorio(incentivo.nombre, diasAntes),
        email_type: `RECORDATORIO_${diasAntes}_DIAS`,
        related_entity_id: docenteIncentivo.id_docente_incentivo,
        related_entity_type: 'DOCENTE_INCENTIVO'
      });

      if (!logEntry) {
        return { success: false, error: 'Error en el sistema de logging' };
      }

      // Calcular días restantes de forma dinámica
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

      // Preparar datos para el email
      const datosEmail = {
        emailDocente: docente.email_institucional,
        nombreDocente: `${docente.nombre} ${docente.apellidos}`,
        nombreIncentivo: incentivo.nombre,
        fechaLimite: fechaLimite,
        diasAntes: diasAntes,
        diasRestantes: diasRestantes,
        numeroReporte: numeroReporte,
        frecuenciaReporte: incentivo.frecuencia_informe_dias
      };

      // Enviar email
      const result = await emailService.notifyRecordatorioReporte(datosEmail);

      // Actualizar estado
      if (result.success) {
        await notificationService.updateEmailStatus(logEntry.id_email_log, 'ENVIADO', result.messageId);
        console.log(`Recordatorio enviado (${diasAntes} días) a ${docente.email_institucional}`);
        return { success: true, logId: logEntry.id_email_log };
      } else {
        await notificationService.updateEmailStatus(logEntry.id_email_log, 'FALLIDO', null, result.error);
        console.error(`Error al enviar recordatorio a ${docente.email_institucional}:`, result.error);
        return { success: false, error: result.error, logId: logEntry.id_email_log };
      }

    } catch (error) {
      console.error('Error inesperado al enviar recordatorio:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener subject del recordatorio según los días
   */
  getSubjectRecordatorio(nombreIncentivo, diasAntes) {
    switch (diasAntes) {
      case 30:
        return `Recordatorio: Reporte de ${nombreIncentivo} vence en 30 días`;
      case 10:
        return `Recordatorio: Reporte de ${nombreIncentivo} vence en 10 días`;
      case 1:
        return `URGENTE: Reporte de ${nombreIncentivo} vence mañana`;
      default:
        return `Recordatorio: Reporte de ${nombreIncentivo} próximo a vencer`;
    }
  }

  /**
   * Procesar todos los recordatorios pendientes
   */
  async procesarRecordatoriosPendientes() {
    try {
      console.log('Procesando recordatorios pendientes...');
      
      const recordatorios = await this.getReportesForReminders();
      
      console.log(`Encontrados ${recordatorios.length} recordatorios pendientes`);

      for (const recordatorio of recordatorios) {
        await this.enviarRecordatorio(recordatorio);
        
        // Esperar un poco entre envíos para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Procesamiento de recordatorios completado');
      return { success: true, processed: recordatorios.length };

    } catch (error) {
      console.error('Error al procesar recordatorios:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ReminderService(); 