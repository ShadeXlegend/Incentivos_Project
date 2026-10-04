const rolesInterfaceRepo = require('../../Repositories/roles_interface');

async function handler(req, res) {
  try {
    const { idRol } = req.params;
    const interfaces = await rolesInterfaceRepo.obtenerInterfacesPorRol(idRol);
    res.status(200).json(interfaces);
  } catch (error) {
    console.error("Error al buscar interfaces del rol:", error.message);
    res.status(500).json({ error: "Error interno al buscar interfaces del rol" });
  }
};

module.exports = [handler];
