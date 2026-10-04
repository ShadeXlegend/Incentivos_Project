const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol_Interface = sequelize.define('Rol_Interface', {
  id_rol_interface: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_interface: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Rol_Interface',
  timestamps: false
});

module.exports = Rol_Interface;
