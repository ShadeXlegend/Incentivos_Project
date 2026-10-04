const Rol_Interface = require('../../Models/rol_interface');

const obtenerInterfacesPorRol = async (idRol) => {
  try {
    return await Rol_Interface.findAll({ where: { id_rol: idRol } });
  } catch (error) {
    throw new Error('Error al consultar interfaces del rol: ' + error.message);
  }
};
const reemplazarInterfacesDelRol = async (idRol, interfaces) => {
  try {
    await Rol_Interface.destroy({ where: { id_rol: idRol } });

    const nuevas = interfaces.map(id_interface => ({
      id_rol: idRol,
      id_interface
    }));

    await Rol_Interface.bulkCreate(nuevas);
  } catch (error) {
    throw new Error("Error actualizando interfaces del rol: " + error.message);
  }
};


module.exports = {
  obtenerInterfacesPorRol,
  reemplazarInterfacesDelRol
  };
