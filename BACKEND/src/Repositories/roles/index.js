const Rol = require('../../Models/rol');

const listarRoles = async () => {
  return await Rol.findAll({
    attributes: ['id_rol', 'nombre']
  });
};

module.exports = {
  listarRoles
};