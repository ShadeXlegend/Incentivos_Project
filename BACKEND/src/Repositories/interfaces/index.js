const constants = require('../../../constants');
const { Usuario, Interface, Rol_Interface, Usuario_Docente, DocenteIncentivo, Cualificacion, Rol } = require('../../Models');
const { Op } = require('sequelize');

const repo = {

  buscarPorUsuario: async (id_usuario) => {
    try {
      const usuario = await Usuario.findByPk(id_usuario, {
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['nombre']
        }]
      });

      if (!usuario) {
        return {
          status: constants.NOT_FOUND_ERROR_MESSAGE,
          failure_code: 404,
          failure_message: 'Usuario no encontrado',
          interfaces: []
        };
      }

      const relaciones = await Rol_Interface.findAll({
        where: { id_rol: usuario.id_rol },
        include: {
          model: Interface,
          attributes: ['id_interface', 'nombre', 'ruta', 'parent', 'Orden']
        }
      });

      let interfaces = relaciones.map(rel => rel.Interface);

      // Si es administrador, mostrar todo
      const esAdmin = usuario.rol?.nombre?.toLowerCase().includes('admin') || 
                     usuario.rol?.nombre?.includes('administrador');

      if (esAdmin) {
        return {
          status: constants.SUCCEEDED_MESSAGE,
          interfaces
        };
      }

      // Si es docente, filtrar según sus registros activos
      const usuarioDocente = await Usuario_Docente.findOne({
        where: { id_usuario },
        attributes: ['id_docente']
      });

      if (usuarioDocente) {
        const id_docente = usuarioDocente.id_docente;

        // Verificar permisos específicos
        const tieneIncentivos = await DocenteIncentivo.count({
          where: { 
            id_docente,
            estado: { [Op.in]: ['VIGENTE', 'FINALIZADO'] }
          }
        }) > 0;

        const tieneCualificaciones = await Cualificacion.count({
          where: { id_docente }
        }) > 0;

        // Filtrar interfaces según permisos
        interfaces = interfaces.filter(interfaz => {
          const ruta = interfaz.ruta?.toLowerCase();
          
          // Permitir acceso a rutas básicas
          if (!ruta || ruta === '/inicio' || ruta === '/micuenta') {
            return true;
          }
          
          // Filtrar mis incentivos
          if (ruta.includes('misincentivos') && !tieneIncentivos) {
            return false;
          }
          
          // Filtrar mis cualificaciones
          if (ruta.includes('miscualificaciones') && !tieneCualificaciones) {
            return false;
          }
          
          // Ocultar rutas administrativas para docentes
          if (ruta.includes('gestion') || ruta.includes('usuarios') || 
              ruta.includes('roles') || ruta.includes('caracterizacion') ||
              ruta.includes('formaciones')) {
            return false;
          }
          
          return true;
        });
      }

      return {
        status: constants.SUCCEEDED_MESSAGE,
        interfaces
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message,
        interfaces: []
      };
    }
  },
  actualizar: async (interfaces) => {
  try {
    for (const item of interfaces) {
      await Interface.update(
        {
          nombre: item.nombre,
          ruta: item.ruta,
          parent: item.parent || null,
          Orden: item.Orden
        },
        {
          where: { id_interface: item.id_interface }
        }
      );
    }

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
listarTodas: async () => {
  try {
    const interfaces = await Interface.findAll({
      attributes: ['id_interface', 'nombre', 'ruta', 'parent', 'Orden']
    });

    return {
      status: constants.SUCCEEDED_MESSAGE,
      interfaces
    };
  } catch (error) {
    return {
      status: constants.INTERNAL_ERROR_MESSAGE,
      failure_code: error.code || 500,
      failure_message: error.message,
      interfaces: []
    };
  }
}


};

module.exports = repo;
