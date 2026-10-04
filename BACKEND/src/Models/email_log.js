const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo EmailLog
 * Registra todos los correos enviados por el sistema
 */
const EmailLog = sequelize.define('EmailLog', {
  id_email_log: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  recipient_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Correo del destinatario'
  },
  recipient_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre del destinatario'
  },
  subject: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Asunto del correo'
  },
  email_type: {
    type: DataTypes.ENUM(
      'INCENTIVO_ASIGNADO',
      'INCENTIVO_COMPLETADO',
      'INCENTIVO_DENEGADO',
      'REPORTE_VALIDADO', 
      'REPORTE_RECHAZADO',
      'RECORDATORIO_REPORTE',
      'RECORDATORIO_30_DIAS',
      'RECORDATORIO_10_DIAS',
      'RECORDATORIO_1_DIAS',
      'EXTENSION_PLAZO'
    ),
    allowNull: false,
    comment: 'Tipo de notificación enviada'
  },
  status: {
    type: DataTypes.ENUM('ENVIADO', 'FALLIDO', 'PENDIENTE'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    comment: 'Estado del envío'
  },
  message_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del mensaje proporcionado por el proveedor de correo'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mensaje de error en caso de fallo'
  },
  related_entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID de la entidad relacionada (incentivo, reporte, etc.)'
  },
  related_entity_type: {
    type: DataTypes.ENUM('INCENTIVO', 'REPORTE', 'USUARIO', 'DOCENTE_INCENTIVO'),
    allowNull: true,
    comment: 'Tipo de entidad relacionada'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de envío exitoso'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación del registro'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de última actualización'
  }
}, {
  tableName: 'email_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['recipient_email']
    },
    {
      fields: ['email_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['related_entity_id', 'related_entity_type']
    }
  ]
});

module.exports = EmailLog; 