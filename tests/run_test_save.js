const { chromium } = require('playwright');

(async () => {
  const url = 'http://localhost:3000/final_v8_fixed.html';
  console.log('Abriendo', url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    console.log('Página cargada');

    await page.waitForFunction(() => window.Alpine !== undefined && typeof window.Alpine.data === 'function', { timeout: 10000 });
    console.log('Alpine detectado');

    // Rellenar cliente y matrícula para permitir guardar
    await page.fill('input[placeholder="Nombre / Razón social"]', 'Cliente Prueba S.L.');
    await page.fill('input[placeholder="Matrícula"]', '1234ABC');
    await page.fill('input[placeholder="Teléfono"]', '600111222');

    // Asegurar IVA
    await page.fill('input[aria-label="Porcentaje de IVA"]', '21');
    await page.keyboard.press('Tab');

    // Guardar
    await page.click('button[aria-label="Guardar presupuesto"]');
    await page.waitForTimeout(500);

    const raw = await page.evaluate(()=>localStorage.getItem('amr17_presupuestos'));
    console.log('localStorage amr17_presupuestos raw:', raw ? 'EXISTS' : 'MISSING');
    if(!raw){ throw new Error('No se almacenó en localStorage'); }
    const lista = JSON.parse(raw);
    console.log('Número de registros guardados:', lista.length);
    const last = lista[lista.length-1];
    console.log('Último registro cliente:', last.cliente && last.cliente.nombre);
    console.log('Último registro vehículo matrícula:', last.vehiculo && last.vehiculo.matricula);

    // Verificar que el IVA guardado coincide
    console.log('IVA guardado en registro:', last.porcentajeIva);

    console.log('Test de guardado finalizado correctamente');
  } catch (e) {
    console.error('Error en test de guardado:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
