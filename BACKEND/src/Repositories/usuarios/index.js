const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const requests = require("request");
const constants = require('../../../constants');
const { Usuario, Rol, Docente, Usuario_Docente } = require('../../Models');

const repo = {

  // insertar: async (usuario) => {
  //   try {
  //     let nombreUsuario, contraseñaTextoPlano, nombres, apellidos, email, docenteId;

  //     if (usuario.id_rol === 2) {
  //       // Validar que exista el docente
  //       const docente = await Docente.findOne({
  //         where: { numero_identificacion: usuario.numero_identificacion }
  //       });

  //       if (!docente) {
  //         return {
  //           status: constants.FAILED_MESSAGE,
  //           mensaje: "El número de identificación no está registrado como docente.",
  //           failure_code: 404,
  //           failure_message: "Número de identificación no encontrado en docentes."
  //         };
  //       }

  //       // Asignar datos desde docente
  //       nombreUsuario = usuario.numero_identificacion;
  //       contraseñaTextoPlano = usuario.numero_identificacion;
  //       nombres = docente.nombre;
  //       apellidos = docente.apellidos;
  //       email = docente.email_institucional;
  //       docenteId = docente.id;

  //     } else {
  //       // Si no es rol docente, se usa lo enviado normalmente
  //       nombreUsuario = usuario.nombre_usuario;
  //       contraseñaTextoPlano = usuario.contraseña;
  //       nombres = usuario.nombres;
  //       apellidos = usuario.apellidos;
  //       email = usuario.email;
  //     }

  //     // Verificar que no exista el usuario (por nombre de usuario generado o enviado)
  //     const existente = await Usuario.findOne({ where: { nombre_usuario: nombreUsuario } });
  //     if (existente) {
  //       return {
  //         status: constants.SUCCEEDED_MESSAGE,
  //         mensaje: "El usuario ya existe.",
  //         failure_code: 409,
  //         failure_message: "El usuario ya existe."
  //       };
  //     }

  //     // Hashear la contraseña
  //     const hashedPassword = await bcrypt.hash(contraseñaTextoPlano, 10);

  //     // Crear el nuevo usuario
  //     const nuevo = await Usuario.create({
  //       nombre_usuario: nombreUsuario,
  //       contraseña: hashedPassword,
  //       id_rol: usuario.id_rol,
  //       nombres,
  //       apellidos,
  //       email,
  //       numero_identificacion: usuario.numero_identificacion,
  //       id_docente: docenteId // si lo tienes en la tabla usuario
  //     });

  //     return {
  //       status: constants.SUCCEEDED_MESSAGE,
  //       usuario: nuevo,
  //       failure_code: null,
  //       failure_message: null
  //     };

  //   } catch (error) {
  //     return {
  //       status: constants.INTERNAL_ERROR_MESSAGE,
  //       mensaje: "Error al crear el usuario.",
  //       failure_code: error.code || 500,
  //       failure_message: error.message || "Error interno del servidor."
  //     };
  //   }
  // },
  insertarAdministrador: async (usuario) => {
    try {
      const existente = await Usuario.findOne({ where: { nombre_usuario: usuario.nombre_usuario } });
      if (existente) {
        return {
          status: constants.SUCCEEDED_MESSAGE,
          mensaje: "El usuario ya existe.",
          failure_code: 409,
          failure_message: "El usuario ya existe."
        };
      }

      const hashedPassword = await bcrypt.hash(usuario.contraseña, 10);

      const nuevo = await Usuario.create({
        nombre_usuario: usuario.nombre_usuario,
        contraseña: hashedPassword,
        id_rol: usuario.id_rol,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
      });

      return {
        status: constants.SUCCEEDED_MESSAGE,
        usuario: nuevo,
        failure_code: null,
        failure_message: null
      };

    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        mensaje: "Error al crear el usuario.",
        failure_code: error.code || 500,
        failure_message: error.message || "Error interno del servidor."
      };
    }
  },
  insertarDocentesMasivo: async (listaUsuarios) => {
    try {
      const resultados = [];

      for (const usuario of listaUsuarios) {
        const docente = await Docente.findOne({
          where: { numero_identificacion: String(usuario.numero_identificacion) }
        });


        if (!docente) {
          resultados.push({
            status: constants.FAILED_MESSAGE,
            numero_identificacion: usuario.numero_identificacion,
            mensaje: "No encontrado en la tabla Docente, por favor verifique que en la hoja de vida esté registrado el docente.",
          });
          continue;
        }

        const yaExiste = await Usuario.findOne({
          where: { nombre_usuario: String(usuario.numero_identificacion) }
        });

        if (yaExiste) {
          // Verifica si ya tiene relación con el docente
          const yaVinculado = await Usuario_Docente.findOne({
            where: {
              id_usuario: yaExiste.id_usuario,
              id_docente: docente.id
            }
          });

          resultados.push({
            status: constants.SUCCEEDED_MESSAGE,
            numero_identificacion: usuario.numero_identificacion,
            mensaje: yaVinculado
              ? "Usuario ya existe y está vinculado al docente"
              : "Usuario ya existe pero no está vinculado al docente"
          });

          // Si ya estaba vinculado, continúa (no crea ni intenta nada más)
          if (yaVinculado) continue;

          // Si no estaba vinculado, creamos la relación
          await Usuario_Docente.create({
            id_usuario: yaExiste.id_usuario,
            id_docente: docente.id
          });

          continue;
        }
        const hashedPassword = await bcrypt.hash(String(usuario.numero_identificacion), 10);

        const nuevoUsuario = await Usuario.create({
          nombre_usuario: String(usuario.numero_identificacion),
          contraseña: hashedPassword,
          id_rol: usuario.id_rol,
          nombres: docente.nombre,
          apellidos: docente.apellidos,
          email: docente.email_institucional,
          numero_identificacion: String(usuario.numero_identificacion),
          id_docente: docente.id
        });

        await Usuario_Docente.create({
          id_usuario: nuevoUsuario.id_usuario,
          id_docente: docente.id
        });

        resultados.push({
          status: constants.SUCCEEDED_MESSAGE,
          numero_identificacion: usuario.numero_identificacion,
          mensaje: "Usuario creado y vinculado correctamente"
        });
      }

      return {
        status: constants.SUCCEEDED_MESSAGE,
        resultados
      };

    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        mensaje: "Error durante el proceso masivo",
        failure_code: error.code || 500,
        failure_message: error.message || "Error interno del servidor."
      };
    }
  },

  listar: async () => {
    try {
      const usuarios = await Usuario.findAll({
        include: {
          model: Rol,
          as: 'rol',
          attributes: ['nombre']
        }
      });

      const usuariosLimpios = usuarios.map(usuario => {
        const { contraseña, rol: rolData, ...restoUsuario } = usuario.toJSON();
        return {
          ...restoUsuario,
          rol_nombre: rolData?.nombre || null
        };
      });

      return {
        status: constants.SUCCEEDED_MESSAGE,
        usuarios: usuariosLimpios
      };
    } catch (error) {
      console.error("Error en listar:", error);
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al listar usuarios."
      };
    }
  },

  actualizar: async (id_usuario, datos) => {
    try {
      const user = await Usuario.findByPk(id_usuario);
      if (!user) {
        return {
          status: 'error',
          mensaje: 'Usuario no encontrado.',
          failure_code: 404
        };
      }

      const cambios = {};

      // Validar que nombre_usuario no sea vacío o solo espacios
      if (
        typeof datos.nombre_usuario === 'string' &&
        datos.nombre_usuario.trim() &&
        datos.nombre_usuario !== user.nombre_usuario
      ) {
        cambios.nombre_usuario = datos.nombre_usuario.trim();
      }

      // Validar nombres
      if (
        typeof datos.nombres === 'string' &&
        datos.nombres.trim() &&
        datos.nombres !== user.nombres
      ) {
        cambios.nombres = datos.nombres.trim();
      }

      // Validar apellidos
      if (
        typeof datos.apellidos === 'string' &&
        datos.apellidos.trim() &&
        datos.apellidos !== user.apellidos
      ) {
        cambios.apellidos = datos.apellidos.trim();
      }

      // Validar nueva contraseña
      if (
        typeof datos.nueva_contraseña === 'string' &&
        datos.nueva_contraseña.trim()
      ) {
        const isSamePassword = await bcrypt.compare(datos.nueva_contraseña, user.contraseña);
        if (!isSamePassword) {
          cambios.contraseña = await bcrypt.hash(datos.nueva_contraseña, 10);
        }
      }
      //Validar Rol
      if (
        typeof datos.id_rol === 'number' &&
        datos.id_rol !== user.id_rol
      ) {
        cambios.id_rol = datos.id_rol;
      }
      // Si no hay cambios válidos, no hacer update
      if (Object.keys(cambios).length === 0) {
        return {
          status: constants.SUCCEEDED_MESSAGE,
          mensaje: 'No se realizaron cambios.',
        };
      }

      await user.update(cambios);

      return {
        status: constants.SUCCEEDED_MESSAGE,
        mensaje: 'Usuario actualizado correctamente.',
      };

    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al actualizar el usuario."
      };
    }
  },


  eliminar: async (id_usuario) => {
    try {
      const usuario = await Usuario.findByPk(id_usuario);

      if (!usuario) {
        return {
          status: 'error',
          failure_code: 404,
          failure_message: 'Usuario no encontrado.',
        };
      }

      await usuario.destroy();

      return {
        status: constants.SUCCEEDED_MESSAGE,
        mensaje: 'Usuario eliminado correctamente.',
      };
    } catch (error) {
      return {
        status: constants.INTERNAL_ERROR_MESSAGE,
        failure_code: error.code || 500,
        failure_message: error.message || "Error al eliminar el usuario.",
      };
    }
  }


};

module.exports = repo;