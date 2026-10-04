const constants = require('../../../constants');
const ReporteIncentivo = require('../../Models/reporte_incentivo');
const DocenteIncentivo = require('../../Models/docente_incentivo');
const Incentivo = require('../../Models/incentivo');
const Docente = require('../../Models/docente');
const { Op } = require('sequelize');

const repo = {
  subir: async ({ id_docente_incentivo, ruta_archivo }) => {
    try {
      // Verificar que el docente puede subir un reporte en este momento
      const docenteIncentivo = await DocenteIncentivo.findByPk(id_docente_incentivo, {
        include: [{
          model: Incentivo,
          as: 'incentivo'
        }]
      });

      if (!docenteIncentivo) {
        return { 
          status: constants.NOT_FOUND_ERROR_MESSAGE, 
          failure_code: 404, 
          failure_message: 'Asignación de incentivo no encontrada' 
        };
      }

      if (docenteIncentivo.estado !== 'VIGENTE') {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400, 
          failure_message: 'El incentivo no está vigente' 
        };
      }

      // Verificar que no haya un reporte pendiente muy reciente
      const reporteReciente = await ReporteIncentivo.findOne({
        where: { 
          id_docente_incentivo,
          estado: 'PENDIENTE',
          fecha_envio: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      });

      if (reporteReciente) {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400, 
          failure_message: 'Ya tiene un reporte pendiente reciente. Espere la validación antes de subir otro.' 
        };
      }

      const reporte = await ReporteIncentivo.create({ id_docente_incentivo, ruta_archivo });
      return { status: constants.SUCCEEDED_MESSAGE, reporte };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  listarPendientes: async () => {
    try {
      const reportes = await ReporteIncentivo.findAll({ 
        where: { estado: 'PENDIENTE' }, 
        include: [{ 
          model: DocenteIncentivo, 
          as: 'docente_incentivo',
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
        }],
        order: [['fecha_envio', 'ASC']]
      });
      return { status: constants.SUCCEEDED_MESSAGE, reportes };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  validar: async (id_reporte_incentivo, { estado, observaciones, mensaje_administrador }) => {
    try {
      // Obtener el reporte con todos los datos relacionados necesarios para el email
      const reporte = await ReporteIncentivo.findByPk(id_reporte_incentivo, {
        include: [{
          model: DocenteIncentivo,
          as: 'docente_incentivo',
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
        }]
      });

      if (!reporte) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Reporte no encontrado' };
      }

      if (reporte.estado !== 'PENDIENTE') {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400, 
          failure_message: 'El reporte ya ha sido validado previamente' 
        };
      }

      // Si se rechaza, el mensaje del administrador es obligatorio
      if (estado === 'RECHAZADO' && (!mensaje_administrador || mensaje_administrador.trim() === '')) {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400, 
          failure_message: 'El mensaje para el docente es obligatorio al rechazar un reporte' 
        };
      }

      await reporte.update({ 
        estado, 
        observaciones: observaciones || null,
        mensaje_administrador: mensaje_administrador || null,
        fecha_validacion: new Date()
      });

      // Recargar el reporte con los datos actualizados
      await reporte.reload();

      // Log simplificado
      console.log('📋 Validando reporte:', {
        estado: estado,
        docente: reporte.docente_incentivo?.docente?.nombre || 'No encontrado',
        incentivo: reporte.docente_incentivo?.incentivo?.nombre || 'No encontrado'
      });

      // Preparar datos para el email
      const datosDocente = reporte.docente_incentivo?.docente;
      const datosIncentivo = reporte.docente_incentivo?.incentivo;

      // Validar que tenemos los datos mínimos necesarios
      if (!datosDocente || !datosIncentivo) {
        console.error('❌ ERROR: Datos incompletos para envío de correo', {
          tieneDocente: !!datosDocente,
          tieneIncentivo: !!datosIncentivo
        });
        // Aún devolvemos éxito porque el reporte se validó correctamente
        return { 
          status: constants.SUCCEEDED_MESSAGE, 
          reporte,
          datosDocente: null,
          datosIncentivo: null,
          proximoReporte: null,
          proximaFechaLimite: null
        };
      }

      // Calcular próximo reporte si el estado es VALIDADO
      let proximoReporte = null;
      let proximaFechaLimite = null;

      if (estado === 'VALIDADO' && datosIncentivo.frecuencia_informe_dias) {
        const fechaProximo = new Date(reporte.fecha_validacion);
        fechaProximo.setDate(fechaProximo.getDate() + datosIncentivo.frecuencia_informe_dias);
        
        // Solo calcular si no supera la fecha de fin del incentivo
        if (fechaProximo <= new Date(reporte.docente_incentivo.fecha_fin)) {
          proximoReporte = fechaProximo;
        }
      }

      if (estado === 'RECHAZADO') {
        // Dar plazo de una semana para re-subir
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 7);
        proximaFechaLimite = fechaLimite;
      }

      return { 
        status: constants.SUCCEEDED_MESSAGE, 
        reporte,
        datosDocente,
        datosIncentivo,
        proximoReporte,
        proximaFechaLimite
      };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  listarPorDocenteIncentivo: async (id_docente_incentivo) => {
    try {
      const reportes = await ReporteIncentivo.findAll({ 
        where: { id_docente_incentivo },
        order: [['fecha_envio', 'ASC']] // CORRECCIÓN: ASC para que el más antiguo sea #1
      });
      return { status: constants.SUCCEEDED_MESSAGE, reportes };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  // NUEVAS FUNCIONES AVANZADAS

  listarPorDocente: async (filtros) => {
    try {
      const { id_docente, page, limit } = filtros;
      const offset = (page - 1) * limit;

      const { count, rows } = await ReporteIncentivo.findAndCountAll({
        include: [{
          model: DocenteIncentivo,
          as: 'docente_incentivo',
          where: { id_docente },
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
        }],
        limit,
        offset,
        order: [['fecha_envio', 'DESC']],
        distinct: true
      });

      return {
        status: constants.SUCCEEDED_MESSAGE,
        reportes: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  obtenerReportesPendientes: async (id_docente) => {
    try {
      // Obtener incentivos vigentes del docente
      const incentivosVigentes = await DocenteIncentivo.findAll({
        where: { id_docente, estado: 'VIGENTE' },
        include: [{
          model: Incentivo,
          as: 'incentivo'
        }]
      });

      const reportesPendientes = await Promise.all(incentivosVigentes.map(async (incentivo) => {
        // Obtener todos los reportes de este incentivo
        const reportesExistentes = await ReporteIncentivo.findAll({
          where: { id_docente_incentivo: incentivo.id_docente_incentivo },
          order: [['fecha_envio', 'ASC']]
        });

        // Calcular fechas de reporte programadas
        const fechasPrograma = repo.generarFechasReporte(
          incentivo.fecha_inicio,
          incentivo.fecha_fin,
          incentivo.frecuencia_informe_dias,
          reportesExistentes
        );

        // Encontrar reportes que faltan o fueron rechazados
        const reportesPendientesEsteIncentivo = fechasPrograma.filter(fecha => {
          if (!fecha.reporte) return true; // No hay reporte para esta fecha
          if (fecha.reporte.estado === 'RECHAZADO') return true; // Reporte rechazado
          return false;
        });

        return {
          incentivo: incentivo.toJSON(),
          reportes_pendientes: reportesPendientesEsteIncentivo,
          puede_subir: repo.puedeSubirReporte(fechasPrograma, reportesExistentes),
          proxima_fecha_limite: repo.obtenerProximaFechaLimite(fechasPrograma, reportesExistentes)
        };
      }));

      return { status: constants.SUCCEEDED_MESSAGE, reportes_pendientes: reportesPendientes };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  // FUNCIONES AUXILIARES - NUEVA LÓGICA SECUENCIAL

  generarFechasReporte: (fechaInicio, fechaFin, frecuenciaDias, reportesExistentes = []) => {
    const fechas = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Ordenar reportes existentes por fecha de envío
    const reportesOrdenados = reportesExistentes
      .filter(r => r.estado === 'VALIDADO') // Solo contar reportes VALIDADOS
      .sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio));

    let fechaActual = new Date(inicio);
    let numeroReporte = 1;
    
    // PRIMER REPORTE: Disponible desde el inicio
    fechaActual.setDate(fechaActual.getDate() + frecuenciaDias);
    
    while (fechaActual <= fin) {
      const reporteExistente = reportesExistentes.find(r => {
        const fechaReporte = new Date(r.fecha_envio);
        const diferenciaDias = Math.abs((fechaReporte - fechaActual) / (1000 * 60 * 60 * 24));
        return diferenciaDias <= 7; // Tolerancia de 7 días
      });

      // Determinar si este reporte está disponible para envío
      // Para el reporte N, debe haber N-1 reportes validados
      const reporteAnteriorValidado = reportesOrdenados.length >= numeroReporte - 1;

      const estado = reporteExistente ? reporteExistente.estado : 
        (reporteAnteriorValidado ? 'PENDIENTE' : 'BLOQUEADO');

      // Calcular disponible_desde: para el primer reporte es desde el inicio,
      // para los siguientes es desde que se validó el anterior
      let disponibleDesde = null;
      if (numeroReporte === 1) {
        disponibleDesde = new Date(inicio);
      } else if (reportesOrdenados[numeroReporte - 2]) {
        // Usar fecha_validacion si existe, si no usar fecha_envio como fallback
        const reporteAnterior = reportesOrdenados[numeroReporte - 2];
        disponibleDesde = new Date(reporteAnterior.fecha_validacion || reporteAnterior.fecha_envio);
      }

      fechas.push({
        fecha_limite: new Date(fechaActual),
        reporte: reporteExistente || null,
        estado: estado,
        numero_reporte: numeroReporte,
        disponible_desde: disponibleDesde,
        vencido: !reporteExistente && new Date() > fechaActual && reporteAnteriorValidado,
        puede_enviar: reporteAnteriorValidado && !reporteExistente
      });

      fechaActual.setDate(fechaActual.getDate() + frecuenciaDias);
      numeroReporte++;
    }

    // Aprovechamos reportesOrdenados declarado anteriormente
    let indiceSlot = 0;
    for (const rep of reportesOrdenados) {
      while (indiceSlot < fechas.length && fechas[indiceSlot].estado === 'VALIDADO') {
        indiceSlot++;
      }
      if (indiceSlot >= fechas.length) break;
      fechas[indiceSlot].reporte = rep;
      fechas[indiceSlot].estado = rep.estado;
      if (rep.estado === 'VALIDADO') indiceSlot++;
    }

    return fechas;
  },

  puedeSubirReporte: (fechasPrograma, reportes) => {
    const hoy = new Date();
    
    // Ordenar reportes validados
    const reportesValidados = reportes
      .filter(r => r.estado === 'VALIDADO')
      .sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio));

    // Buscar reportes pendientes sin validar (que bloquean el envío)
    const reportesPendientes = reportes.filter(r => r.estado === 'PENDIENTE');
    
    // Si hay reportes pendientes sin validar, no puede subir más
    if (reportesPendientes.length > 0) {
      return false;
    }

    // Buscar reportes rechazados que necesitan ser reenviados
    const reportesRechazados = reportes.filter(r => r.estado === 'RECHAZADO');
    if (reportesRechazados.length > 0) {
      // Puede reenviar reportes rechazados inmediatamente
      return true;
    }

    // Encuentra el próximo slot disponible
    const proximoSlot = fechasPrograma.find(fecha => {
      return fecha.puede_enviar && !fecha.reporte;
    });

    if (!proximoSlot) return false;

    // NUEVA LÓGICA: Si el reporte anterior está validado, puede subir inmediatamente
    // Sin esperar a los 7 días antes de la fecha límite
    const fechaLimite = new Date(proximoSlot.fecha_limite);
    
    // Verificar si ya pasó la fecha límite (no puede subir reportes vencidos)
    if (hoy > fechaLimite) {
      return false;
    }

    // Si llegamos aquí, significa que:
    // 1. No hay reportes pendientes
    // 2. No hay reportes rechazados 
    // 3. El slot está disponible según la secuencia
    // 4. No ha pasado la fecha límite
    // Por lo tanto, puede subir inmediatamente
    return true;
  },

  obtenerProximaFechaLimite: (fechasPrograma, reportes) => {
    // Buscar reportes rechazados primero (prioridad)
    const reportesRechazados = reportes.filter(r => r.estado === 'RECHAZADO');
    if (reportesRechazados.length > 0) {
      // Buscar la fecha del primer reporte rechazado
      const primerRechazado = reportesRechazados
        .sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio))[0];
      
      const fechaRechazado = fechasPrograma.find(f => 
        f.reporte && f.reporte.id_reporte_incentivo === primerRechazado.id_reporte_incentivo
      );
      
      if (fechaRechazado) return fechaRechazado.fecha_limite;
    }

    // Buscar el próximo slot disponible
    const proximoSlot = fechasPrograma.find(fecha => {
      return fecha.puede_enviar && !fecha.reporte;
    });

    return proximoSlot ? proximoSlot.fecha_limite : null;
  },

  // NUEVA FUNCIONALIDAD: Extender plazo de reporte
  extenderPlazo: async (id_docente_incentivo, { dias_extension, mensaje_administrador }) => {
    try {
      // Buscar el incentivo del docente
      const docenteIncentivo = await DocenteIncentivo.findByPk(id_docente_incentivo);
      if (!docenteIncentivo) {
        return { 
          status: constants.NOT_FOUND_ERROR_MESSAGE, 
          failure_code: 404, 
          failure_message: 'Incentivo del docente no encontrado' 
        };
      }

      // Obtener reportes existentes
      const reportesExistentes = await ReporteIncentivo.findAll({
        where: { id_docente_incentivo },
        order: [['fecha_envio', 'ASC']]
      });

      // Generar fechas de programa para identificar el próximo reporte pendiente
      const fechasPrograma = repo.generarFechasReporte(
        docenteIncentivo.fecha_inicio,
        docenteIncentivo.fecha_fin,
        docenteIncentivo.frecuencia_informe_dias,
        reportesExistentes
      );

      // Identificar el primer slot vencido que aún no cuenta con reporte
      // Ya no requerimos que "puede_enviar" sea true, pues la extensión de plazo
      // puede ser necesaria aunque el reporte previo no se haya validado todavía.
      const hoy = new Date();

      // Buscar el primer slot cuya fecha límite ya pasó y todavía no tiene reporte
      const slotParaExtender = fechasPrograma.find(fecha => {
        return !fecha.reporte && hoy > new Date(fecha.fecha_limite);
      });

      let slotObjetivo = slotParaExtender;

      // Fallback: si no hay slot vencido sin reporte, verificar la próxima fecha calculada
      if (!slotObjetivo) {
        const proximaFecha = require('../incentivos').calcularProximaFechaReporte(
          docenteIncentivo.fecha_inicio,
          docenteIncentivo.frecuencia_informe_dias,
          reportesExistentes
        );

        if (proximaFecha && hoy > new Date(proximaFecha)) {
          slotObjetivo = { fecha_limite: proximaFecha };
        }
      }

      if (!slotObjetivo) {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400, 
          failure_message: 'No hay reportes vencidos que requieran extensión de plazo' 
        };
      }

      // Calcular nueva fecha límite
      const fechaOriginal = new Date(slotObjetivo.fecha_limite);
      const nuevaFechaLimite = new Date(fechaOriginal);
      nuevaFechaLimite.setDate(nuevaFechaLimite.getDate() + dias_extension);

      // Crear un registro de extensión (como un reporte especial que registra la extensión)
      const extension = await ReporteIncentivo.create({
        id_docente_incentivo,
        ruta_archivo: `EXTENSION_PLAZO_${Date.now()}.txt`, // Archivo ficticio para registrar la extensión
        fecha_envio: new Date(),
        estado: 'EXTENSION_PLAZO', // Estado especial para extensiones
        fecha_limite_original: fechaOriginal,
        fecha_limite_extendida: nuevaFechaLimite,
        dias_extension,
        mensaje_administrador,
        observaciones: `Extensión de plazo: ${dias_extension} días otorgados por el administrador`
      });

      return { 
        status: constants.SUCCEEDED_MESSAGE, 
        extension: {
          id_extension: extension.id_reporte_incentivo,
          fecha_limite_original: fechaOriginal,
          fecha_limite_extendida: nuevaFechaLimite,
          dias_extension,
          mensaje_administrador
        }
      };

    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: 500, 
        failure_message: error.message 
      };
    }
  }
};

module.exports = repo; 