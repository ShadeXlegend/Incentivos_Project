const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocenteDatosPersonales = sequelize.define('DocenteDatosPersonales', {
  docente_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  fecha_nacimiento: DataTypes.DATE,
  sexo: DataTypes.STRING,
  edad: DataTypes.INTEGER,
  lugar_nacimiento_municipio: DataTypes.STRING,
  departamento: DataTypes.STRING,
  pais_procedencia: DataTypes.STRING,
  direccion_residencia: DataTypes.STRING,
  numero_contacto: DataTypes.STRING
}, {
  tableName: 'docente_datos_personales',
  timestamps: false
});

module.exports = DocenteDatosPersonales;
