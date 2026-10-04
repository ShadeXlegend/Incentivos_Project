const { DocenteIncentivo } = require('../../Models');
const reminderService = require('../../Services/email/reminderService');

/**
 * Envia un recordatorio manual al docente sobre el plazo del siguiente reporte.
 * URL: POST /incentivos/docente-incentivo/:id_docente_incentivo/recordar-plazo
 */
module.exports = async (req, res) => {
  const { id_docente_incentivo } = req.params;

  try {
    // Obtener la asignación con relaciones necesarias
    const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo, {
      include: [
        { association: 'docente' },
        { association: 'incentivo' }
      ]
    });

    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }

    // Calcular próximas fechas de reporte usando el mismo servicio de recordatorios
    const proximasFechas = await reminderService.calcularProximasFechasReporte(asignacion);
    if (!proximasFechas || proximasFechas.length === 0) {
      return res.status(400).json({ message: 'No hay reportes pendientes para esta asignación' });
    }

    const { fechaLimite, numeroReporte } = proximasFechas[0];
    const hoy = new Date();
    const diffDias = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

    // Normalizar a las categorías 30 / 10 / 1 día para usar los enums existentes
    let diasCategoria = 30;
    if (diffDias <= 1) diasCategoria = 1;
    else if (diffDias <= 10) diasCategoria = 10;

    // Enviar el recordatorio utilizando la misma lógica del cron
    const resultado = await reminderService.enviarRecordatorio({
      docenteIncentivo: asignacion,
      fechaLimite,
      diasAntes: diasCategoria,
      diasRestantes: diffDias,
      numeroReporte
    });

    if (resultado.success) {
      return res.status(200).json({ message: 'Recordatorio enviado exitosamente' });
    }

    return res.status(500).json({ message: resultado.error || 'Error al enviar el recordatorio' });
  } catch (error) {
    console.error('Error en recordarPlazo:', error.message);
    return res.status(500).json({ message: error.message });
  }
}; 