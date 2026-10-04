const constants = require('../../../constants');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { Usuario, Rol } = require('../../Models'); // Usa el index que define las asociaciones


const login = {
  loginInfo: async ({ Login, Clave }) => {
    try {
      // Buscar usuario por nombre_usuario
      const user = await Usuario.findOne({
        where: { nombre_usuario: Login }, 
        include: {
          model: Rol, 
          as: 'rol',
          attributes: ['nombre']
        }
      });

      if (!user) {
        return {
          status: constants.SUCCEEDED_MESSAGE,
          usuario: [],
          token: null,
          failure_code: 401,
          failure_message: "Usuario o contraseña incorrectos."
        };
      }

      // Validar contraseña
      const validPassword = await bcrypt.compare(Clave, user.contraseña);
      if (!validPassword) {
        return {
          status: 'error',
          usuario: null,
          token: null,
          failure_code: 401,
          failure_message: "Usuario o contraseña incorrectos."
        };

      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id: user.id_usuario,
          usuario: user.nombre_usuario,
          rol: user.id_rol
        },
        constants.TOKEN_SECRET,
        { expiresIn: "2h" }
      );
      const { contraseña, rol: rolData, ...userSinPassword } = user.toJSON();

      return {
        status: constants.SUCCEEDED_MESSAGE,
        usuario: {
          ...userSinPassword,
          rol_nombre: rolData?.nombre || null
        },
        token,
        failure_code: null,
        failure_message: null
      };

    } catch (error) {
      console.error("Error en loginInfo:", error);
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        usuario: [],
        token: null,
        failure_code: error.code || 500,
        failure_message: error.message || "Error interno del servidor."
      };
    }
  }
};

module.exports = login;
