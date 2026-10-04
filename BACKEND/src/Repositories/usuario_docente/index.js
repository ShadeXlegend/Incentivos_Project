const {
  Usuario_Docente,
  Usuario,
  Docente,
  DocenteCatedra,
  DocentePlanta,
  DocenteDetalle,
  DocenteDatosPersonales,
  Pregrado,
  Especializacion,
  Magister,
  Doctorado,
  Cualificacion,
  Formacion
} = require('../../Models');

const constants = require('../../../constants');

const repo = {
  listarConDetalle: async () => {
    try {
      const data = await Usuario_Docente.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'nombre_usuario']
          },
          {
            model: Docente,
            as: 'docente',
            attributes: [
              'id',
              'nombre',
              'apellidos',
              'numero_identificacion',
              'tipo_identificacion',
              'email_institucional'
            ],
            include: [
              { model: DocenteDatosPersonales, as: 'datos_personales', attributes: ['numero_contacto'] },
              { model: DocenteDetalle, as: 'detalle', attributes: ['facultad', 'programa_adscrito'] },
              { model: DocentePlanta, as: 'planta', attributes: ['docente_id'] },
              { model: DocenteCatedra, as: 'catedra', attributes: ['docente_id'] },
              { model: Doctorado, as: 'doctorados', attributes: ['id'] },
              { model: Magister, as: 'magisteres', attributes: ['id'] },
              { model: Especializacion, as: 'especializaciones', attributes: ['id'] },
              { model: Pregrado, as: 'pregrados', attributes: ['id'] },
              {
                model: Cualificacion,
                as: 'cualificaciones',
                attributes: ['id_cualificacion', 'año_cursado'],
                include: [
                  {
                    model: Formacion,
                    as: 'formacion',
                    attributes: ['id_formacion','nombre_formacion', 'linea_cualificacion', 'periodo', 'numero_horas']
                  }
                ]
              }
            ]
          }
        ]
      });

      const transformados = data.map(item => {
        const usuario = item.usuario || {};
        const docente = item.docente || {};
        const personales = docente.datos_personales || {};
        const detalle = docente.detalle || {};
        const cualificaciones = docente.cualificaciones || [];

        const doctorados = docente.doctorados || [];
        const magisteres = docente.magisteres || [];
        const especializaciones = docente.especializaciones || [];
        const pregrados = docente.pregrados || [];

        let tipoVinculacion = 'N/A';

        if (docente.planta?.docente_id === docente.id) {
          tipoVinculacion = 'Planta';
        } else if (docente.catedra?.docente_id === docente.id) {
          tipoVinculacion = 'Cátedra';
        }

        let nivelFormacion = 'N/A';
        if (doctorados.length > 0) nivelFormacion = 'Doctorado';
        else if (magisteres.length > 0) nivelFormacion = 'Magister';
        else if (especializaciones.length > 0) nivelFormacion = 'Especialización';
        else if (pregrados.length > 0) nivelFormacion = 'Pregrado';

        const formaciones = cualificaciones.map(c => ({
          id: c.id_cualificacion,
          titulo: c.formacion?.nombre_formacion || 'Sin título',
          linea_cualificacion: c.formacion?.linea_cualificacion || 'N/A',
          año: c.año_cursado,
          periodo: c.formacion?.periodo,
          id_formacion: c.formacion.id_formacion
        }));  

        return {
          id_docente:docente.id,
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          nombre: docente.nombre || '',
          apellidos: docente.apellidos || '',
          cedula: docente.numero_identificacion || '',
          correo_institucional: docente.email_institucional || '',
          tipo_documento: docente.tipo_identificacion || '',
          celular: personales.numero_contacto || '',
          facultad: detalle.facultad || '',
          programa: detalle.programa_adscrito || '',
          categoria: 'No aplica',
          tipo_vinculacion: tipoVinculacion,
          nivel_formacion: nivelFormacion,
          formaciones
        };
      });
      return {
        status: constants.SUCCEEDED_MESSAGE,
        usuarios_docentes: transformados
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al listar usuarios_docentes."
      };
    }
  }
};

module.exports = repo;
