const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo Incentivo
 * Representa los beneficios como comisiones de estudio o años sabáticos.
 */
const Incentivo = sequelize.define('Incentivo', {
  id_incentivo: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  frecuencia_informe_dias: {
    // Cada cuántos días debe enviar informe el profesor
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    defaultValue: 'ACTIVO',
  },
  tiempo_minimo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tiempo_maximo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Ruta del archivo PDF de la resolución (opcional)
  resolucion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'Incentivo',
  timestamps: false,
});

module.exports = Incentivo; 