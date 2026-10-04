const constants = require('../../../constants');
const Incentivo = require('../../Models/incentivo');
const DocenteIncentivo = require('../../Models/docente_incentivo');
const ReporteIncentivo = require('../../Models/reporte_incentivo');
const Docente = require('../../Models/docente');
const { Op } = require('sequelize');

const repo = {
  insertar: async (data) => {
    try {
      const incentivo = await Incentivo.create({
        nombre: data.nombre,
        frecuencia_informe_dias: data.frecuencia_informe_dias,
        tiempo_minimo_meses: data.tiempo_minimo_meses,
        tiempo_maximo_meses: data.tiempo_maximo_meses,
        descripcion: data.descripcion,
        resolucion: data.resolucion || null,
      });
      return { status: constants.SUCCEEDED_MESSAGE, incentivo };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || 'Error al crear incentivo.'
      };
    }
  },

  listar: async () => {
    try {
      const incentivos = await Incentivo.findAll({ where: { estado: 'ACTIVO' } });
      return { status: constants.SUCCEEDED_MESSAGE, incentivos };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  actualizar: async (id_incentivo, data) => {
    try {
      const incentivo = await Incentivo.findByPk(id_incentivo);
      if (!incentivo) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Incentivo no encontrado' };
      }
      await incentivo.update(data);
      return { status: constants.SUCCEEDED_MESSAGE, incentivo };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  eliminar: async (id_incentivo) => {
    try {
      const incentivo = await Incentivo.findByPk(id_incentivo);
      if (!incentivo) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Incentivo no encontrado' };
      }
      await incentivo.update({ estado: 'INACTIVO' });
      return { status: constants.SUCCEEDED_MESSAGE };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  asignar: async ({ id_docente, id_incentivo, fecha_inicio, fecha_fin, observaciones, resolucion }) => {
    try {
      // Verificar si el docente ya tiene un incentivo vigente
      const incentivoVigente = await DocenteIncentivo.findOne({
        where: { 
          id_docente, 
          estado: 'VIGENTE' 
        }
      });

      if (incentivoVigente) {
        const docente = await Docente.findByPk(id_docente);

        console.log("DOCENTE ENCONTRADO:");
        console.log(docente?.toJSON ? docente.toJSON() : docente);
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400,
          failure_message: 'El docente ya tiene un incentivo vigente' 
        };
      }

      const incentivo = await Incentivo.findByPk(id_incentivo);
      if (!incentivo) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Incentivo no encontrado' };
      }

      const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : new Date();
      let fechaFin = fecha_fin ? new Date(fecha_fin) : null;

      const MIN = incentivo.tiempo_minimo_meses;
      const MAX = incentivo.tiempo_maximo_meses;

      // Calcula fecha_fin si longitud fija
      if (MIN === MAX) {
        fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + MIN);
      } else {
        if (!fechaFin) {
          return { status: constants.INVALID_PARAMETER_SENDED, failure_message: 'Debe enviar fecha_fin' };
        }
        const diffMonths = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth());
        if (diffMonths < MIN || diffMonths > MAX) {
          return { status: constants.INVALID_PARAMETER_SENDED, failure_message: `La duración debe estar entre ${MIN} y ${MAX} meses` };
        }
      }

      // Usar la frecuencia definida en el incentivo
      const frecuencia = incentivo.frecuencia_informe_dias;

      const asignacion = await DocenteIncentivo.create({
        id_docente,
        id_incentivo,
        fecha_asignacion: new Date(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        frecuencia_informe_dias: frecuencia,
        resolucion: resolucion || null,
        observaciones: observaciones || null
      });

      return { status: constants.SUCCEEDED_MESSAGE, asignacion };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  listarPorDocente: async (id_docente) => {
    try {
      const incentivos = await DocenteIncentivo.findAll({ 
        where: { id_docente }, 
        include: [{
          model: Incentivo,
          as: 'incentivo'
        }]
      });
      return { status: constants.SUCCEEDED_MESSAGE, incentivos };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: error.code || 500, failure_message: error.message };
    }
  },

  // NUEVAS FUNCIONES AVANZADAS

  listarDocentesAsignados: async (filtros) => {
    try {
      const { estado, tipo_incentivo, busqueda, page, limit } = filtros;
      const offset = (page - 1) * limit;

      // Filtro principal sobre la entidad DocenteIncentivo (asignaciones)
      const whereClause = {
        estado: { [Op.ne]: 'ELIMINADO' } // Siempre excluir registros eliminados
      };

      // Si viene un estado concreto ("VIGENTE", "FINALIZADO", etc.), lo aplicamos.
      // Cuando es cadena vacía o null, se asume que se quieren todos los estados.
      if (estado) {
        whereClause.estado = { [Op.and]: [estado, { [Op.ne]: 'ELIMINADO' }] };
      }

      // Construcción dinámica del where para Docente permitiendo búsqueda en nombre + apellidos
      const docenteWhere = {};
      if (busqueda && busqueda.trim().length > 0) {
        const termino = busqueda.trim();
        docenteWhere[Op.or] = [
          { nombre: { [Op.iLike]: `%${termino}%` } },
          { apellidos: { [Op.iLike]: `%${termino}%` } },
          { numero_identificacion: { [Op.iLike]: `%${termino}%` } },
          // Búsqueda concatenada "nombre apellidos"
          // Sequelize.where(fn('concat', col('docente.nombre'), ' ', col('docente.apellidos')), { [Op.iLike]: `%${termino}%` })
        ];

        // Agregamos la condición con concat usando funciones de Sequelize
        const { fn, col, where: wh } = require('sequelize');
        docenteWhere[Op.or].push(
          wh(fn('concat', col('docente.nombre'), ' ', col('docente.apellidos')), {
            [Op.iLike]: `%${termino}%`
          })
        );
      }

      const includeClause = [
        {
          model: Docente,
          as: 'docente',
          required: true,
          attributes: ['id', 'nombre', 'apellidos', 'numero_identificacion', 'email_institucional'],
          where: docenteWhere
        },
        {
          model: Incentivo,
          as: 'incentivo',
          where: tipo_incentivo ? { nombre: { [Op.iLike]: `%${tipo_incentivo}%` } } : {}
        }
      ];

      const { count, rows } = await DocenteIncentivo.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit,
        offset,
        order: [['fecha_asignacion', 'DESC']],
        distinct: true
      });

      // Calcular próximas fechas de reporte para cada docente
      const docentesConProgreso = await Promise.all(rows.map(async (docenteIncentivo) => {
        const reportes = await ReporteIncentivo.findAll({
          where: { id_docente_incentivo: docenteIncentivo.id_docente_incentivo },
          order: [['fecha_envio', 'DESC']]
        });

        const proximaFecha = repo.calcularProximaFechaReporte(
          docenteIncentivo.fecha_inicio,
          docenteIncentivo.frecuencia_informe_dias,
          reportes
        );

        const reportesValidados = reportes.filter(r => r.estado === 'VALIDADO').length;

        // Calcular total de reportes requeridos utilizando la generación de fechas
        const fechasPrograma = repo.generarFechasReporte(
          docenteIncentivo.fecha_inicio,
          docenteIncentivo.fecha_fin,
          docenteIncentivo.frecuencia_informe_dias,
          reportes
        );

        const totalRequeridos = fechasPrograma.length;
        const porcentajeProgreso = totalRequeridos > 0 ? Math.min(100, Math.round((reportesValidados / totalRequeridos) * 100)) : 0;

        const reportesPendientes = reportes.filter(r => r.estado === 'PENDIENTE').length;

        return {
          ...docenteIncentivo.toJSON(),
          proxima_fecha_reporte: proximaFecha,
          reportes_pendientes: reportesPendientes,
          total_reportes: totalRequeridos,
          reportes_validados: reportesValidados,
          porcentaje_progreso: porcentajeProgreso
        };
      }));

      return {
        status: constants.SUCCEEDED_MESSAGE,
        docentes: docentesConProgreso,
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

  obtenerEstadisticas: async () => {
    try {
      const totalIncentivos = await Incentivo.count({ where: { estado: 'ACTIVO' } });
      const incentivoVigentes = await DocenteIncentivo.count({ where: { estado: 'VIGENTE' } });
      const incentivoFinalizados = await DocenteIncentivo.count({ where: { estado: 'FINALIZADO' } });
      const incentivoEliminados = await DocenteIncentivo.count({ where: { estado: 'ELIMINADO' } });
      
      const reportesPendientes = await ReporteIncentivo.count({ where: { estado: 'PENDIENTE' } });
      const reportesValidados = await ReporteIncentivo.count({ where: { estado: 'VALIDADO' } });
      const reportesRechazados = await ReporteIncentivo.count({ where: { estado: 'RECHAZADO' } });

      // Estadísticas por tipo de incentivo
      const incentivosPorTipo = await DocenteIncentivo.findAll({
        attributes: [
          [Incentivo.sequelize.col('incentivo.nombre'), 'tipo_incentivo'],
          [Incentivo.sequelize.fn('COUNT', Incentivo.sequelize.col('DocenteIncentivo.id_docente_incentivo')), 'cantidad']
        ],
        include: [{
          model: Incentivo,
          as: 'incentivo',
          attributes: []
        }],
        where: { estado: 'VIGENTE' },
        group: ['incentivo.nombre'],
        raw: true
      });

      const estadisticas = {
        totales: {
          incentivos_activos: totalIncentivos,
          incentivos_vigentes: incentivoVigentes,
          incentivos_finalizados: incentivoFinalizados,
          incentivos_eliminados: incentivoEliminados
        },
        reportes: {
          pendientes: reportesPendientes,
          validados: reportesValidados,
          rechazados: reportesRechazados
        },
        por_tipo: incentivosPorTipo
      };

      return { status: constants.SUCCEEDED_MESSAGE, estadisticas };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  calcularFechasReporte: async (id_docente_incentivo) => {
    try {
      const docenteIncentivo = await DocenteIncentivo.findByPk(id_docente_incentivo);
      if (!docenteIncentivo) {
        return { 
          status: constants.NOT_FOUND_ERROR_MESSAGE, 
          failure_code: 404, 
          failure_message: 'Asignación de incentivo no encontrada' 
        };
      }

      const reportes = await ReporteIncentivo.findAll({
        where: { id_docente_incentivo },
        order: [['fecha_envio', 'ASC']]
      });

      const fechas = repo.generarFechasReporte(
        docenteIncentivo.fecha_inicio,
        docenteIncentivo.fecha_fin,
        docenteIncentivo.frecuencia_informe_dias,
        reportes
      );

      return { status: constants.SUCCEEDED_MESSAGE, fechas, reportes };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  obtenerProgreso: async (id_docente) => {
    try {
      const incentivos = await DocenteIncentivo.findAll({
        where: { 
          id_docente, 
          estado: { [Op.in]: ['VIGENTE', 'FINALIZADO'] }
        },
        include: [{
          model: Incentivo,
          as: 'incentivo'
        }]
      });

      const progresoCompleto = await Promise.all(incentivos.map(async (incentivo) => {
        const reportes = await ReporteIncentivo.findAll({
          where: { id_docente_incentivo: incentivo.id_docente_incentivo },
          order: [['fecha_envio', 'ASC']]
        });

        const fechasPrograma = repo.generarFechasReporte(
          incentivo.fecha_inicio,
          incentivo.fecha_fin,
          incentivo.frecuencia_informe_dias,
          reportes
        );

        const reportesValidados = reportes.filter(r => r.estado === 'VALIDADO').length;
        const reportesPendientes = reportes.filter(r => r.estado === 'PENDIENTE').length;
        const reportesRechazados = reportes.filter(r => r.estado === 'RECHAZADO').length;

        const progreso = {
          porcentaje: Math.min(100, Math.round((reportesValidados / fechasPrograma.length) * 100)),
          reportes_completados: reportesValidados,
          reportes_pendientes: reportesPendientes,
          reportes_rechazados: reportesRechazados,
          total_reportes_requeridos: fechasPrograma.length
        };

        return {
          ...incentivo.toJSON(),
          reportes,
          fechas_programa: fechasPrograma,
          progreso,
          ruta_certificado: incentivo.ruta_certificado,
          puede_subir_reporte: repo.puedeSubirReporte(fechasPrograma, reportes),
          proxima_fecha_limite: repo.obtenerProximaFechaLimite(fechasPrograma, reportes)
        };
      }));

      return { status: constants.SUCCEEDED_MESSAGE, progreso: progresoCompleto };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  actualizarAsignacion: async (id_docente_incentivo, datos) => {
    try {
      const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo);
      if (!asignacion) {
        return { 
          status: constants.NOT_FOUND_ERROR_MESSAGE, 
          failure_code: 404, 
          failure_message: 'Asignación de incentivo no encontrada' 
        };
      }

      // Validar fechas si se proporcionan
      if (datos.fecha_inicio && datos.fecha_fin) {
        const fechaInicio = new Date(datos.fecha_inicio);
        const fechaFin = new Date(datos.fecha_fin);
        
        if (fechaInicio >= fechaFin) {
          return { 
            status: constants.INVALID_PARAMETER_SENDED, 
            failure_code: 400,
            failure_message: 'La fecha de inicio debe ser anterior a la fecha de fin' 
          };
        }
      }

      // Actualizar la asignación
      await asignacion.update(datos);
      
      // Obtener la asignación actualizada con relaciones
      const asignacionActualizada = await DocenteIncentivo.findByPk(id_docente_incentivo, {
        include: [
          {
            model: Docente,
            as: 'docente',
            attributes: ['nombre', 'apellidos', 'email', 'numero_identificacion']
          },
          {
            model: Incentivo,
            as: 'incentivo',
            attributes: ['nombre', 'descripcion', 'frecuencia_informe_dias']
          }
        ]
      });

      return { 
        status: constants.SUCCEEDED_MESSAGE, 
        asignacion: asignacionActualizada 
      };
    } catch (error) {
      return { 
        status: constants.INTERNAL_ERROR_MESSAGE, 
        failure_code: error.code || 500, 
        failure_message: error.message 
      };
    }
  },

  eliminarAsignacion: async (id_docente_incentivo, datos) => {
    try {
      const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo);
      if (!asignacion) {
        return { 
          status: constants.NOT_FOUND_ERROR_MESSAGE, 
          failure_code: 404, 
          failure_message: 'Asignación de incentivo no encontrada' 
        };
      }

      // Verificar que no esté ya eliminada
      if (asignacion.estado === 'ELIMINADO') {
        return { 
          status: constants.INVALID_PARAMETER_SENDED, 
          failure_code: 400,
          failure_message: 'La asignación ya está eliminada' 
        };
      }

      // Realizar soft delete
      await asignacion.update({
        estado: 'ELIMINADO',
        fecha_eliminacion: new Date(),
        motivo_eliminacion: datos.observaciones,
        resolucion_eliminacion: datos.resolucion_eliminacion
      });

      return { 
        status: constants.SUCCEEDED_MESSAGE 
      };
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

    // Usamos el mismo arreglo reportesOrdenados ya existente arriba
    let indiceSlot = 0;
    for (const rep of reportesOrdenados) {
      // Avanzar al siguiente slot VALIDADO si corresponde
      while (indiceSlot < fechas.length && fechas[indiceSlot].estado === 'VALIDADO') {
        indiceSlot++;
      }
      if (indiceSlot >= fechas.length) break;

      // Sustituir (o colocar) el reporte en el slot actual
      fechas[indiceSlot].reporte = rep;
      fechas[indiceSlot].estado = rep.estado;

      // Si quedó VALIDADO, avanzamos al próximo slot
      if (rep.estado === 'VALIDADO') {
        indiceSlot++;
      }
    }

    return fechas;
  },

  calcularProximaFechaReporte: (fechaInicio, frecuenciaDias, reportes) => {
    // 1. Revisar si existe una extensión de plazo aún vigente
    const ultimaExtension = reportes
      .filter(r => r.estado === 'EXTENSION_PLAZO' && r.fecha_limite_extendida)
      .sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio))[0];

    const hoy = new Date();
    if (ultimaExtension) {
      const fechaExt = new Date(ultimaExtension.fecha_limite_extendida);
      if (fechaExt > hoy) {
        return fechaExt; // La extensión define la próxima fecha
      }
    }

    // 2. Cálculo estándar basado en reportes validados
    const reportesValidados = reportes
      .filter(r => r.estado === 'VALIDADO')
      .sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio));

    const inicio = new Date(fechaInicio);
    let proximaFecha = new Date(inicio);

    if (reportesValidados.length === 0) {
      proximaFecha.setDate(proximaFecha.getDate() + frecuenciaDias);
      return proximaFecha;
    }

    proximaFecha.setDate(proximaFecha.getDate() + (frecuenciaDias * (reportesValidados.length + 1)));
    return proximaFecha;
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

    if (!proximoSlot) {
      return false;
    }

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

  // Nueva función: Verificar si un reporte puede ser enviado según la secuencia
  puedeEnviarReporteSecuencial: (numeroReporte, reportesValidados) => {
    if (numeroReporte === 1) return true; // El primer reporte siempre puede enviarse
    
    // Para enviar el reporte N, deben existir N-1 reportes validados
    return reportesValidados.length >= numeroReporte - 1;
  },

  /* --------------------------------------------------
   * APROBACIÓN / DESAPROBACIÓN FINAL DEL INCENTIVO
   * -------------------------------------------------- */

  aprobarIncentivo: async (id_docente_incentivo) => {
    try {
      // Buscar asignación y relaciones
      const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo, {
        include: [
          { model: Docente, as: 'docente' },
          { model: Incentivo, as: 'incentivo' }
        ]
      });

      if (!asignacion) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Asignación no encontrada' };
      }

      // Obtener progreso para asegurar 100 %
      const reportes = await ReporteIncentivo.findAll({ where: { id_docente_incentivo }, order: [['fecha_envio', 'ASC']] });
      const fechasPrograma = repo.generarFechasReporte(
        asignacion.fecha_inicio,
        asignacion.fecha_fin,
        asignacion.frecuencia_informe_dias,
        reportes
      );
      const reportesValidados = reportes.filter(r => r.estado === 'VALIDADO').length;
      if (reportesValidados < fechasPrograma.length) {
        return { status: constants.INVALID_PARAMETER_SENDED, failure_code: 400, failure_message: 'El docente no ha completado el 100 % de los informes' };
      }

      // Generar certificado
      const generateCert = require('../../Services/certificate/generateIncentivoCertificate');
      const rutaCertificado = await generateCert({
        docente: asignacion.docente,
        incentivo: asignacion.incentivo,
        fecha_inicio: asignacion.fecha_inicio,
        fecha_fin: asignacion.fecha_fin,
        aprobado: true
      });

      // Actualizar estado
      await asignacion.update({ estado: 'FINALIZADO', ruta_certificado: rutaCertificado });

      return { 
        status: constants.SUCCEEDED_MESSAGE, 
        certificado: rutaCertificado,
        datosDocente: asignacion.docente,
        datosIncentivo: asignacion.incentivo,
        asignacion
      };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: 500, failure_message: error.message };
    }
  },

  desaprobarIncentivo: async (id_docente_incentivo, observaciones) => {
    try {
      const asignacion = await DocenteIncentivo.findByPk(id_docente_incentivo, {
        include: [
          { model: Docente, as: 'docente' },
          { model: Incentivo, as: 'incentivo' }
        ]
      });

      if (!asignacion) {
        return { status: constants.NOT_FOUND_ERROR_MESSAGE, failure_code: 404, failure_message: 'Asignación no encontrada' };
      }

      // Generar certificado de denegación
      const generateCert = require('../../Services/certificate/generateIncentivoCertificate');
      const rutaCertificado = await generateCert({
        docente: asignacion.docente,
        incentivo: asignacion.incentivo,
        fecha_inicio: asignacion.fecha_inicio,
        fecha_fin: asignacion.fecha_fin,
        aprobado: false,
        observaciones
      });

      // Marcar como FINALIZADO igualmente (o podríamos usar otro estado si se desea)
      await asignacion.update({ estado: 'FINALIZADO', ruta_certificado: rutaCertificado });

      return { 
        status: constants.SUCCEEDED_MESSAGE, 
        certificado: rutaCertificado,
        datosDocente: asignacion.docente,
        datosIncentivo: asignacion.incentivo,
        asignacion
      };
    } catch (error) {
      return { status: constants.INTERNAL_ERROR_MESSAGE, failure_code: 500, failure_message: error.message };
    }
  }
};

module.exports = repo; 