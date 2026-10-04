const rolInterfaceRepo = require('../../Repositories/roles_interface');

async function handler(req, res) {

  try {
    const { idRol } = req.params;
    const { interfaces } = req.body;

    if (!Array.isArray(interfaces)) {
      return res.status(400).json({ message: "El campo 'interfaces' debe ser un arreglo" });
    }

    await rolInterfaceRepo.reemplazarInterfacesDelRol(idRol, interfaces);
    res.status(200).json({ message: "Permisos actualizados correctamente" });

  } catch (error) {
    console.error("Error al guardar interfaces del rol:", error.message);
    res.status(500).json({ message: "Error al guardar interfaces del rol" });
  }
};

module.exports = [handler];
