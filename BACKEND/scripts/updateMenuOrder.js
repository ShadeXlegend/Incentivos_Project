const { Interface } = require('../src/Models');

async function updateMenuOrder() {
  try {
    console.log('Actualizando orden del menú...');

    // Primero, agregar las interfaces faltantes si no existen
    const gestionIncentivos = await Interface.findOne({
      where: { ruta: '/GestionIncentivos' }
    });

    if (!gestionIncentivos) {
      await Interface.create({
        id_interface: '11111111-1111-1111-1111-111111111005',
        nombre: 'Gestión Incentivos',
        ruta: '/GestionIncentivos',
        parent: null,
        Orden: 4
      });
      console.log('Agregada interface: Gestión Incentivos');
    }

    const misIncentivos = await Interface.findOne({
      where: { ruta: '/misIncentivos' }
    });

    if (!misIncentivos) {
      await Interface.create({
        id_interface: '11111111-1111-1111-1111-111111111006',
        nombre: 'Mis Incentivos',
        ruta: '/misIncentivos',
        parent: null,
        Orden: 4
      });
      console.log('Agregada interface: Mis Incentivos');
    }

    // Actualizar orden según requerimientos:
    // 1. Caracterización de docentes - Orden 1
    await Interface.update(
      { Orden: 1 },
      { where: { ruta: '/CaracterizacionDocentes' } }
    );

    // 2. Gestión de formaciones - Orden 2  
    await Interface.update(
      { Orden: 2 },
      { where: { ruta: '/gestionFormaciones' } }
    );

    // 3. Gestión Incentivos - Orden 3 (debajo de Gestión de formaciones)
    await Interface.update(
      { Orden: 3 },
      { where: { ruta: '/GestionIncentivos' } }
    );

    // 4. Mis Cualificaciones - Orden 4
    await Interface.update(
      { Orden: 4 },
      { where: { ruta: '/misCualificaciones' } }
    );

    // 5. Mis Incentivos - Orden 5 (arriba de Mi cuenta)
    await Interface.update(
      { Orden: 5 },
      { where: { ruta: '/misIncentivos' } }
    );

    // 6. Mi cuenta - Orden 6
    await Interface.update(
      { Orden: 6 },
      { where: { ruta: '/miCuenta' } }
    );

    // Interfaces de admin (orden más alto)
    // Seguridad - Orden 100 (padre)
    await Interface.update(
      { Orden: 100 },
      { where: { nombre: 'Seguridad' } }
    );

    // Usuarios - Orden 101 (hijo de Seguridad)
    await Interface.update(
      { Orden: 101 },
      { where: { ruta: '/usuarios' } }
    );

    // Roles - Orden 102 (hijo de Seguridad)
    await Interface.update(
      { Orden: 102 },
      { where: { ruta: '/roles' } }
    );

    console.log('Orden del menú actualizado correctamente');

    // Mostrar el resultado
    const interfaces = await Interface.findAll({ 
      order: [['Orden', 'ASC']] 
    });
    
    console.log('\nOrden final del menú:');
    interfaces.forEach(i => {
      console.log(`${i.Orden} - ${i.nombre} (${i.ruta})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateMenuOrder(); 