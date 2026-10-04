const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Genera un certificado en PDF para el resultado de un incentivo.
 * @param {Object} opciones
 * @param {Object} opciones.docente - Información del docente (nombre, apellidos, numero_identificacion).
 * @param {Object} opciones.incentivo - Información del incentivo (nombre, descripcion).
 * @param {Date} opciones.fecha_inicio - Fecha de inicio del incentivo.
 * @param {Date} opciones.fecha_fin - Fecha de fin del incentivo.
 * @param {Boolean} opciones.aprobado - true si se aprueba, false si se desaprueba.
 * @param {String} [opciones.observaciones] - Observaciones adicionales en caso de desaprobación.
 * @returns {Promise<String>} ruta relativa del PDF generado (por ejemplo uploads/certificados/Cert_...).
 */
function generateIncentivoCertificate({ docente, incentivo, fecha_inicio, fecha_fin, aprobado, observaciones }) {
  // __dirname = BACKEND/src/Services/certificate
  // Subir tres niveles -> BACKEND y luego /uploads/certificados
  const uploadsDir = path.join(__dirname, '../../../uploads/certificados');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `CERT_${incentivo?.nombre?.replace(/\s+/g, '_')}_${docente?.numero_identificacion}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  // Crear documento PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Encabezado
  doc
    .fontSize(18)
    .text('Universidad de Cartagena', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .text(aprobado ? 'CERTIFICADO DE APROBACIÓN DE INCENTIVO' : 'CERTIFICADO DE DENEGACIÓN DE INCENTIVO', { align: 'center' })
    .moveDown(1);

  // Cuerpo del certificado
  const nombreCompleto = `${docente?.nombre || ''} ${docente?.apellidos || ''}`.trim();
  const fechaInicioStr = new Date(fecha_inicio).toLocaleDateString('es-ES');
  const fechaFinStr = new Date(fecha_fin).toLocaleDateString('es-ES');

  const textoAprobado = `Se certifica que el/la docente ${nombreCompleto} (ID: ${docente?.numero_identificacion || 'N/A'}) ha completado satisfactoriamente el 100% de los informes requeridos para el incentivo "${incentivo?.nombre || ''}" correspondiente al periodo comprendido entre ${fechaInicioStr} y ${fechaFinStr}.`;

  const textoDenegado = `Se certifica que el/la docente ${nombreCompleto} (ID: ${docente?.numero_identificacion || 'N/A'}) NO ha cumplido con los requisitos necesarios del incentivo "${incentivo?.nombre || ''}" correspondiente al periodo comprendido entre ${fechaInicioStr} y ${fechaFinStr}.\n\nMotivo: ${observaciones || 'Incumplimiento de entregas u otros criterios establecidos.'}`;

  doc.fontSize(12).text(aprobado ? textoAprobado : textoDenegado, {
    align: 'justify',
  });

  doc.moveDown(2);
  doc.text('Emitido en Cartagena de Indias, a la fecha ' + new Date().toLocaleDateString('es-ES'), {
    align: 'right',
  });

  doc.moveDown(4);
  doc.text('_______________________________', { align: 'center' });
  doc.text('Vicerrectoría de Talento Humano', { align: 'center' });

  doc.end();

  // Esperar a que el stream termine para asegurar que el archivo se escribió
  const relativePath = `uploads/certificados/${fileName}`;

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(relativePath));
    writeStream.on('error', reject);
    doc.on('error', reject);
  });
}

module.exports = generateIncentivoCertificate; 