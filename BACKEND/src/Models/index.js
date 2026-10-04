const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

const basename = path.basename(__filename);
const modelsPath = __dirname;

// Cargar todos los modelos del directorio actual
fs.readdirSync(modelsPath)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  )
  .forEach(file => {
    const model = require(path.join(modelsPath, file));
    if (model && model.name) {
      db[model.name] = model;
    }
  });

// Desestructurar modelos para relaciones
const {
  Usuario,
  Usuario_Docente,
  Rol,
  Interface,
  Rol_Interface,
  Docente,
  Formacion,
  Cualificacion,
  DocentePlanta,
  DocenteDetalle,
  DocenteDatosPersonales,
  DocenteCatedra,
  Pregrado,
  Especializacion,
  Magister,
  Doctorado,
  Incentivo,
  DocenteIncentivo,
  ReporteIncentivo,
  EmailLog
} = db;

// Relaciones
if (Usuario && Rol) {
  Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });
  Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
}

if (Rol_Interface && Rol && Interface) {
  Rol_Interface.belongsTo(Rol, { foreignKey: 'id_rol' });
  Rol.hasMany(Rol_Interface, { foreignKey: 'id_rol' });

  Rol_Interface.belongsTo(Interface, { foreignKey: 'id_interface' });
  Interface.hasMany(Rol_Interface, { foreignKey: 'id_interface' });
}

// Usuario ↔ Docente
if (Usuario && Docente && Usuario_Docente) {
  Usuario.belongsToMany(Docente, {
    through: Usuario_Docente,
    foreignKey: 'id_usuario',
    otherKey: 'id_docente',
    as: 'docentes'
  });
  Docente.belongsToMany(Usuario, {
    through: Usuario_Docente,
    foreignKey: 'id_docente',
    otherKey: 'id_usuario',
    as: 'usuarios'
  });

  Usuario_Docente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
  Usuario_Docente.belongsTo(Docente, { foreignKey: 'id_docente', as: 'docente' });
  Usuario.hasMany(Usuario_Docente, { foreignKey: 'id_usuario', as: 'usuario_docente' });
  Docente.hasMany(Usuario_Docente, { foreignKey: 'id_docente', as: 'usuario_docente' });
}

// Relaciones 1:N de formación
if (Docente && Cualificacion) {
  Docente.hasMany(Cualificacion, { foreignKey: 'id_docente', as: 'cualificaciones' });
  Cualificacion.belongsTo(Docente, { foreignKey: 'id_docente', as: 'docente' });
}

if (Formacion && Cualificacion) {
  Formacion.hasMany(Cualificacion, { foreignKey: 'id_formacion', as: 'cualificaciones' });
  Cualificacion.belongsTo(Formacion, { foreignKey: 'id_formacion', as: 'formacion' });
}

// Relaciones 1:1
if (Docente && DocentePlanta) {
  Docente.hasOne(DocentePlanta, { foreignKey: 'docente_id', as: 'planta' });
}
if (Docente && DocenteDetalle) {
  Docente.hasOne(DocenteDetalle, { foreignKey: 'docente_id', as: 'detalle' });
}
if (Docente && DocenteDatosPersonales) {
  Docente.hasOne(DocenteDatosPersonales, { foreignKey: 'docente_id', as: 'datos_personales' });
}
if (Docente && DocenteCatedra) {
  Docente.hasOne(DocenteCatedra, { foreignKey: 'docente_id', as: 'catedra' });
}

// Relaciones nuevas 1:N (nivel académico)
if (Docente && Pregrado) {
  Docente.hasMany(Pregrado, { foreignKey: 'docente_id', as: 'pregrados' });
}
if (Docente && Especializacion) {
  Docente.hasMany(Especializacion, { foreignKey: 'docente_id', as: 'especializaciones' });
}
if (Docente && Magister) {
  Docente.hasMany(Magister, { foreignKey: 'docente_id', as: 'magisteres' });
}
if (Docente && Doctorado) {
  Docente.hasMany(Doctorado, { foreignKey: 'docente_id', as: 'doctorados' });
}

// --------- NUEVAS RELACIONES INCENTIVOS ---------
if (Docente && Incentivo && DocenteIncentivo) {
  Docente.hasMany(DocenteIncentivo, { foreignKey: 'id_docente', as: 'incentivos_docente' });
  DocenteIncentivo.belongsTo(Docente, { foreignKey: 'id_docente', as: 'docente' });

  Incentivo.hasMany(DocenteIncentivo, { foreignKey: 'id_incentivo', as: 'docentes_asignados' });
  DocenteIncentivo.belongsTo(Incentivo, { foreignKey: 'id_incentivo', as: 'incentivo' });
}

if (DocenteIncentivo && ReporteIncentivo) {
  DocenteIncentivo.hasMany(ReporteIncentivo, { foreignKey: 'id_docente_incentivo', as: 'reportes' });
  ReporteIncentivo.belongsTo(DocenteIncentivo, { foreignKey: 'id_docente_incentivo', as: 'docente_incentivo' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
