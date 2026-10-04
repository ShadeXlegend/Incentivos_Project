import { useEffect, useState } from 'react';
import { gsUrlApi } from '@src/config/ConfigServer';

export const useMisIncentivos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados principales
  const [miProgreso, setMiProgreso] = useState([]);
  const [reportesPendientes, setReportesPendientes] = useState([]);
  const [subiendoReporte, setSubiendoReporte] = useState(false);

  const token = localStorage.getItem('token');

  // Cargar progreso completo del docente
  const cargarMiProgreso = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${gsUrlApi}/incentivos/mi-progreso`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setMiProgreso(data.progreso || []);
        setError(null);
      } else {
        setError(data.message || 'Error al cargar el progreso');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes pendientes de subir
  const cargarReportesPendientes = async () => {
    try {
      const resp = await fetch(`${gsUrlApi}/incentivos/reportes/mis-pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setReportesPendientes(data.reportes_pendientes || []);
      } else {
        console.error('Error al cargar reportes pendientes:', data.message);
      }
    } catch (err) {
      console.error('Error al cargar reportes pendientes:', err.message);
    }
  };

  // Subir reporte
  const subirReporte = async (archivo, idDocenteIncentivo) => {
    try {
      setSubiendoReporte(true);
      
      // Validar archivo
      if (!archivo) {
        return { success: false, message: 'No se ha seleccionado ningún archivo' };
      }
      
      if (archivo.type !== 'application/pdf') {
        return { success: false, message: 'Solo se permiten archivos PDF' };
      }
      
      if (archivo.size > 10 * 1024 * 1024) { // 10MB
        return { success: false, message: 'El archivo no puede superar los 10MB' };
      }

      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('id_docente_incentivo', idDocenteIncentivo);

      const resp = await fetch(`${gsUrlApi}/incentivos/reportes/subir`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await resp.json();
      if (resp.ok) {
        // Recargar datos
        await Promise.all([
          cargarMiProgreso(),
          cargarReportesPendientes()
        ]);
        return { success: true, reporte: data.reporte };
      }
      
      return { success: false, message: data.message || 'Error al subir el reporte' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setSubiendoReporte(false);
    }
  };

  // Descargar reporte
  const descargarReporte = (rutaArchivo, nombreArchivo = 'reporte.pdf') => {
    if (!rutaArchivo) return;
    
    // Construir la URL correctamente, manejando caracteres especiales
    const baseUrl = gsUrlApi.endsWith('/') ? gsUrlApi.slice(0, -1) : gsUrlApi;
    const url = `${baseUrl}/${rutaArchivo}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular estadísticas del progreso
  const calcularEstadisticas = () => {
    if (!miProgreso || miProgreso.length === 0) {
      return {
        totalIncentivos: 0,
        reportesTotales: 0,
        reportesCompletados: 0,
        reportesPendientes: 0,
        reportesRechazados: 0,
        progresoPromedio: 0
      };
    }

    const stats = miProgreso.reduce((acc, incentivo) => {
      const progreso = incentivo.progreso || {};
      acc.reportesTotales += progreso.total_reportes_requeridos || 0;
      acc.reportesCompletados += progreso.reportes_completados || 0;
      acc.reportesPendientes += progreso.reportes_pendientes || 0;
      acc.reportesRechazados += progreso.reportes_rechazados || 0;
      return acc;
    }, {
      totalIncentivos: miProgreso.length,
      reportesTotales: 0,
      reportesCompletados: 0,
      reportesPendientes: 0,
      reportesRechazados: 0
    });

    stats.progresoPromedio = stats.reportesTotales > 0 
      ? Math.round((stats.reportesCompletados / stats.reportesTotales) * 100)
      : 0;

    return stats;
  };

  // Verificar si puede subir reporte para un incentivo específico
  const puedeSubirReporte = (incentivo) => {
    if (!incentivo || incentivo.estado !== 'VIGENTE') return false;

    // Si el incentivo ya alcanzó el 100 % de progreso, no permitir más envíos
    const progreso = incentivo.progreso || {};
    if (progreso.porcentaje >= 100) return false;

    return incentivo.puede_subir_reporte || false;
  };

  // Obtener próxima fecha límite
  const obtenerProximaFechaLimite = (incentivo) => {
    if (!incentivo || !incentivo.proxima_fecha_limite) return null;
    return new Date(incentivo.proxima_fecha_limite);
  };

  // Verificar si una fecha está próxima a vencer (menos de 7 días)
  const estaProximoAVencer = (fecha) => {
    if (!fecha) return false;
    const ahora = new Date();
    const diferencia = new Date(fecha) - ahora;
    const diasRestantes = diferencia / (1000 * 60 * 60 * 24);
    return diasRestantes <= 7 && diasRestantes > 0;
  };

  // Verificar si una fecha está vencida
  const estaVencido = (fecha) => {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await Promise.all([
        cargarMiProgreso(),
        cargarReportesPendientes()
      ]);
    };
    
    cargarDatosIniciales();
    // eslint-disable-next-line
  }, []);

  return {
    // Estados
    loading,
    error,
    miProgreso,
    reportesPendientes,
    subiendoReporte,
    
    // Funciones principales
    cargarMiProgreso,
    cargarReportesPendientes,
    subirReporte,
    descargarReporte,
    
    // Utilidades
    calcularEstadisticas,
    puedeSubirReporte,
    obtenerProximaFechaLimite,
    estaProximoAVencer,
    estaVencido,
    setError
  };
}; 