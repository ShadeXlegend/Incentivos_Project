const constants = require("../../../constants");
const objModel = require("../../Models/formacion");

const repo = {
  insertar: async (formacion) => {
    try {
      if (formacion.id_formacion) {
        const existente = await objModel.findOne({
          where: { id_formacion: formacion.id_formacion },
        });
        if (existente) {
          return {
            status: constants.SUCCEEDED_MESSAGE,
            mensaje: "La formación ya existe.",
            failure_code: 409,
            failure_message: "La formación ya existe.",
          };
        }
      }

      const nuevaFormacion = await objModel.create({
        id_formacion: formacion.id_formacion,
        nombre_formacion: formacion.nombre_formacion,
        periodo: formacion.periodo,
        linea_cualificacion: formacion.linea_cualificacion,
        numero_horas: formacion.numero_horas,
        fecha_inicio: formacion.fecha_inicio,
        fecha_terminacion: formacion.fecha_terminacion,
        observaciones: formacion.observaciones,
      });

      return {
        status: constants.SUCCEEDED_MESSAGE,
        formacion: nuevaFormacion,
        failure_code: null,
        failure_message: null,
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        mensaje: "Error al crear la formación.",
        failure_code: error.code || 500,
        failure_message: error.message || "Error interno del servidor.",
      };
    }
  },

  listar: async () => {
    try {
      const formaciones = await objModel.findAll();

      const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, "0");
        const dd = String(fecha.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const formacionesFormateadas = formaciones.map((f) => ({
        ...f.dataValues,
        fecha_inicio: formatearFecha(f.fecha_inicio),
        fecha_terminacion: formatearFecha(f.fecha_terminacion),
      }));

      return {
        status: constants.SUCCEEDED_MESSAGE,
        formaciones: formacionesFormateadas,
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al listar formaciones.",
      };
    }
  },

  actualizar: async (id_formacion, datos) => {
    try {
      const formacion = await objModel.findByPk(id_formacion);
      if (!formacion) {
        return {
          status: "error",
          mensaje: "Formación no encontrada.",
          failure_code: 404,
        };
      }

      await formacion.update(datos);

      return {
        status: constants.SUCCEEDED_MESSAGE,
        formacion,
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al actualizar la formación.",
      };
    }
  },

  eliminar: async (id_formacion) => {
    try {
      const formacion = await objModel.findByPk(id_formacion);
      if (!formacion) {
        return {
          status: "error",
          mensaje: "Formación no encontrada.",
          failure_code: 404,
        };
      }

      await formacion.destroy();

      return {
        status: constants.SUCCEEDED_MESSAGE,
        mensaje: "Formación eliminada exitosamente.",
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al eliminar la formación.",
      };
    }
  },

  cargarMasivamente: async (listaFormaciones) => {
    try {
      const resultados = [];

      const normalizarFecha = (fecha) => {
        const d = new Date(fecha);
        return isNaN(d) ? null : d.toISOString().split("T")[0]; 
      };

      for (const formacion of listaFormaciones) {
        try {
          const fecha_inicio = normalizarFecha(formacion.fecha_inicio);
          const fecha_terminacion = normalizarFecha(
            formacion.fecha_terminacion
          );

          if (!fecha_inicio || !fecha_terminacion) {
            resultados.push({
              status: constants.FAILED_MESSAGE,
              nombre_formacion: formacion.nombre_formacion,
              mensaje: "Fechas inválidas en la formación",
            });
            continue;
          }

          const yaExiste = await objModel.findOne({
            where: {
              nombre_formacion: formacion.nombre_formacion,
            },
          });
          if (yaExiste) {
            resultados.push({
              status: constants.SUCCEEDED_MESSAGE,
              nombre_formacion: formacion.nombre_formacion,
              mensaje: "La formación ya existe en la base de datos.",
            });
            continue;
          }

          await objModel.create({
            ...formacion,
            fecha_inicio,
            fecha_terminacion,
          });

          resultados.push({
            status: constants.SUCCEEDED_MESSAGE,
            nombre_formacion: formacion.nombre_formacion,
            mensaje: "Formación creada correctamente",
          });
        } catch (errorFormacion) {
          resultados.push({
            status: constants.FAILED_MESSAGE,
            nombre_formacion: formacion.nombre_formacion,
            mensaje:
              errorFormacion.message || "Error al insertar esta formación",
          });
        }
      }
      return {
        status: constants.SUCCEEDED_MESSAGE,
        resultados,
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        mensaje: "Error general durante la carga masiva",
        failure_code: error.code || 500,
        failure_message: error.message || "Error interno del servidor",
      };
    }
  },
};

module.exports = repo;
