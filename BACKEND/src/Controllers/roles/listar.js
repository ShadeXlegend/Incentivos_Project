const rolRepo = require("../../Repositories/roles");

async function handler (req, res) {
  try {
    const roles = await rolRepo.listarRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error en listarRolesController:", error);
    res.status(500).json({ error: "No se pudieron obtener los roles" });
  }
};

module.exports = [handler];
