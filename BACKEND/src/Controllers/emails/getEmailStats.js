const { EmailLog } = require('../../Models');
const { Op } = require('sequelize');
const constants = require('../../../constants');

async function handler(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir filtros de fecha
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Obtener estadísticas generales
    const totalEmails = await EmailLog.count({ where: whereClause });
    const emailsEnviados = await EmailLog.count({ 
      where: { ...whereClause, status: 'ENVIADO' } 
    });
    const emailsFallidos = await EmailLog.count({ 
      where: { ...whereClause, status: 'FALLIDO' } 
    });
    const emailsPendientes = await EmailLog.count({ 
      where: { ...whereClause, status: 'PENDIENTE' } 
    });

    // Estadísticas por tipo de email
    const statsByType = await EmailLog.findAll({
      attributes: [
        'email_type',
        'status',
        [EmailLog.sequelize.fn('COUNT', EmailLog.sequelize.col('id_email_log')), 'count']
      ],
      where: whereClause,
      group: ['email_type', 'status'],
      raw: true
    });

    // Obtener últimos emails enviados
    const recentEmails = await EmailLog.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 50,
      raw: true
    });

    // Calcular tasa de éxito
    const successRate = totalEmails > 0 ? ((emailsEnviados / totalEmails) * 100).toFixed(2) : 0;

    return res.status(200).json({
      status: constants.SUCCEEDED_MESSAGE,
      data: {
        resumen: {
          total: totalEmails,
          enviados: emailsEnviados,
          fallidos: emailsFallidos,
          pendientes: emailsPendientes,
          tasaExito: successRate
        },
        estadisticasPorTipo: statsByType,
        emailsRecientes: recentEmails
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de emails:', error.message);
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      message: error.message
    });
  }
}

module.exports = [handler]; 