const { chromium } = require('playwright');

(async () => {
  const url = 'http://localhost:3000/final_v8_fixed.html';
  console.log('Abriendo', url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    console.log('Página cargada');

    // Esperar a Alpine inicializar
    await page.waitForFunction(() => window.Alpine !== undefined && typeof window.Alpine.data === 'function', { timeout: 10000 });
    console.log('Alpine detectado');

    // Cambiar IVA
    const ivaSelector = 'input[aria-label="Porcentaje de IVA"]';
    await page.waitForSelector(ivaSelector, { timeout: 5000 });
    await page.fill(ivaSelector, '10');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const ivaVal = await page.$eval(ivaSelector, el => el.value);
    console.log('IVA en input:', ivaVal);
    if (ivaVal !== '10') throw new Error('No se pudo escribir el IVA');

    // Guardar presupuesto
    const guardarBtn = 'button[aria-label="Guardar presupuesto"]';
    await page.click(guardarBtn);
    await page.waitForTimeout(600);
    const lista = await page.evaluate(() => localStorage.getItem('amr17_presupuestos'));
    console.log('LocalStorage amr17_presupuestos exists:', !!lista);

    // Duplicar y comprobar número
    const duplicarBtn = 'button[aria-label="Duplicar presupuesto"]';
    await page.click(duplicarBtn);
    await page.waitForTimeout(300);
    const numero = await page.$eval('input[aria-label="Número de presupuesto"]', el => el.value);
    console.log('Número tras duplicar:', numero);

    console.log('Test finalizado correctamente');
  } catch (e) {
    console.error('Error en test:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
