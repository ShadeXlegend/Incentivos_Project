const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Reporte periódico que el docente debe subir para justificar su incentivo.
 */
const ReporteIncentivo = sequelize.define('ReporteIncentivo', {
  id_reporte_incentivo: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_docente_incentivo: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ruta_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fecha_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'VALIDADO', 'RECHAZADO', 'EXTENSION_PLAZO'),
    defaultValue: 'PENDIENTE',
  },
  fecha_validacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que el administrador validó/rechazó el reporte'
  },
  fecha_limite_original: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha límite original antes de extensiones'
  },
  fecha_limite_extendida: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Nueva fecha límite después de extensión (máximo 10 días)'
  },
  dias_extension: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 15
    },
    comment: 'Días de extensión otorgados (máximo 15)'
  },
  mensaje_administrador: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mensaje del administrador al rechazar o extender plazo'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Reporte_Incentivo',
  timestamps: false,
});

module.exports = ReporteIncentivo; 