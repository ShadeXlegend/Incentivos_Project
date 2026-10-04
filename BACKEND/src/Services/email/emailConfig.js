const nodemailer = require('nodemailer');

/**
 * Configuración del servicio de correo electrónico
 */
const emailConfig = {
  // Configuración SMTP para Gmail (desarrollo)
  development: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    }
  },
  
  // Configuración para producción (puede ser SendGrid, AWS SES, etc.)
  production: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    }
  }
};

const environment = process.env.NODE_ENV || 'development';

/**
 * Crear transporter de nodemailer
 */
function createTransporter() {
  const config = emailConfig[environment];
  
  if (!config.auth.user || !config.auth.pass) {
    throw new Error('Credenciales de correo no configuradas. Verifique las variables de entorno EMAIL_USER y EMAIL_PASSWORD');
  }

  return nodemailer.createTransport(config);
}

/**
 * Configuración por defecto del remitente
 */
const defaultSender = {
  name: 'Sistema de Incentivos - Universidad de Cartagena',
  email: process.env.EMAIL_FROM || process.env.EMAIL_USER || ''
};

module.exports = {
  createTransporter,
  defaultSender,
  environment
}; 