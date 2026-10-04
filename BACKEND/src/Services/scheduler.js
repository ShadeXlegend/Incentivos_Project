const cron = require('node-cron');
const reminderService = require('./email/reminderService');

class Scheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Inicializar todas las tareas programadas
   */
  initialize() {
    try {
      console.log('Inicializando scheduler de tareas...');
      
      // Verificar recordatorios cada día a las 8:00 AM
      this.scheduleReminderCheck();
      
      // Tarea de mantenimiento semanal (opcional)
      this.scheduleWeeklyMaintenance();
      
      console.log('Scheduler inicializado exitosamente');
      console.log(`${this.jobs.length} tareas programadas activas`);
      
    } catch (error) {
      console.error('Error al inicializar scheduler:', error.message);
    }
  }

  /**
   * Programar verificación diaria de recordatorios
   */
  scheduleReminderCheck() {
    try {
      // Ejecutar todos los días a las 8:00 AM
      const job = cron.schedule('0 8 * * *', async () => {
        console.log('Ejecutando verificación de recordatorios programada...');
        try {
          const result = await reminderService.procesarRecordatoriosPendientes();
          console.log(`Recordatorios procesados: ${result.processed || 0}`);
        } catch (error) {
          console.error('Error en verificación de recordatorios:', error.message);
        }
      }, {
        scheduled: true,
        timezone: "America/Bogota"
      });

      this.jobs.push({
        name: 'Verificación de Recordatorios',
        schedule: '8:00 AM diario',
        job: job
      });

      console.log('Tarea programada: Verificación de recordatorios (8:00 AM diario)');
      
    } catch (error) {
      console.error('Error al programar verificación de recordatorios:', error.message);
    }
  }

  /**
   * Programar mantenimiento semanal (opcional)
   */
  scheduleWeeklyMaintenance() {
    try {
      // Ejecutar todos los domingos a las 2:00 AM
      const job = cron.schedule('0 2 * * 0', async () => {
        console.log('Ejecutando mantenimiento semanal...');
        try {
          // Aquí puedes agregar tareas de limpieza si es necesario
          // Por ejemplo: limpiar logs antiguos, estadísticas, etc.
            console.log('Mantenimiento semanal completado');
        } catch (error) {
          console.error('Error en mantenimiento semanal:', error.message);
        }
      }, {
        scheduled: true,
        timezone: "America/Bogota"
      });

      this.jobs.push({
        name: 'Mantenimiento Semanal',
        schedule: '2:00 AM domingos',
        job: job
      });

      console.log('Tarea programada: Mantenimiento semanal (2:00 AM domingos)');
      
    } catch (error) {
      console.error('Error al programar mantenimiento semanal:', error.message);
    }
  }

  /**
   * Ejecutar verificación manual de recordatorios
   */
  async executeReminderCheckManually() {
    try {
      console.log('Ejecutando verificación manual de recordatorios...');
      const result = await reminderService.procesarRecordatoriosPendientes();
      return result;
    } catch (error) {
      console.error('Error en verificación manual:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener estado de todas las tareas programadas
   */
  getJobsStatus() {
    return this.jobs.map(job => ({
      name: job.name,
      schedule: job.schedule,
      running: job.job.running,
      destroyed: job.job.destroyed
    }));
  }

  /**
   * Detener todas las tareas programadas
   */
  stopAll() {
    try {
      this.jobs.forEach(job => {
        if (job.job && !job.job.destroyed) {
          job.job.stop();
        }
      });
      console.log('Todas las tareas programadas han sido detenidas');
    } catch (error) {
      console.error('Error al detener tareas:', error.message);
    }
  }

  /**
   * Reiniciar todas las tareas programadas
   */
  restartAll() {
    try {
      this.stopAll();
      this.jobs = [];
      this.initialize();
      console.log('Todas las tareas programadas han sido reiniciadas');
    } catch (error) {
      console.error('Error al reiniciar tareas:', error.message);
    }
  }
}

module.exports = new Scheduler(); 