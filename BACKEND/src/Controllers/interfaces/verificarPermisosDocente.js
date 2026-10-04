const constants = require('../../../constants');
const { Usuario, Usuario_Docente, DocenteIncentivo, Cualificacion, Rol } = require('../../Models');
const { Op } = require('sequelize');

async function handler(req, res) {
  try {
    const id_usuario = req.usuario.id;

    // Verificar si el usuario es docente
    const usuario = await Usuario.findByPk(id_usuario, {
      include: [{
        model: Rol,
        as: 'rol',
        attributes: ['nombre']
      }]
    });

    if (!usuario) {
      return res.status(404).json({
        status: constants.NOT_FOUND_ERROR_MESSAGE,
        message: 'Usuario no encontrado'
      });
    }

    // Si es administrador, tiene acceso a todo
    const esAdmin = usuario.rol?.nombre?.toLowerCase().includes('admin') || 
                   usuario.rol?.nombre?.toLowerCase().includes('administrador');

    if (esAdmin) {
      return res.status(200).json({
        status: constants.SUCCEEDED_MESSAGE,
        permisos: {
          esAdministrador: true,
          tieneIncentivos: true,
          tieneCualificaciones: true
        }
      });
    }

    // Verificar si es docente
    const usuarioDocente = await Usuario_Docente.findOne({
      where: { id_usuario },
      attributes: ['id_docente']
    });

    if (!usuarioDocente) {
      return res.status(200).json({
        status: constants.SUCCEEDED_MESSAGE,
        permisos: {
          esAdministrador: false,
          tieneIncentivos: false,
          tieneCualificaciones: false
        }
      });
    }

    const id_docente = usuarioDocente.id_docente;

    // Verificar si tiene incentivos activos
    const tieneIncentivos = await DocenteIncentivo.count({
      where: { 
        id_docente,
        estado: { [Op.in]: ['VIGENTE', 'FINALIZADO'] }
      }
    }) > 0;

    // Verificar si tiene cualificaciones activas
    const tieneCualificaciones = await Cualificacion.count({
      where: { id_docente }
    }) > 0;

    return res.status(200).json({
      status: constants.SUCCEEDED_MESSAGE,
      permisos: {
        esAdministrador: false,
        tieneIncentivos,
        tieneCualificaciones,
        id_docente
      }
    });

  } catch (error) {
    console.error('Error verificando permisos docente:', error);
    return res.status(500).json({
      status: constants.INTERNAL_ERROR_MESSAGE,
      message: error.message
    });
  }
}

module.exports = [handler]; 