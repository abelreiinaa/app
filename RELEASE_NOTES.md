# Release v1.0.0 - AMR 17 Motorsport

- Fecha: 2026-05-15

Resumen
-------
Lanzamiento inicial del generador de presupuestos web para AMR 17 Motorsport. Incluye la versión funcional del formulario, cálculo de totales/IVA, gestión de items, guardado en `localStorage`, importación básica desde PDF, y soporte de impresión compatible con Chrome.

Principales funcionalidades
--------------------------
- Interfaz completa para crear, duplicar, guardar y limpiar presupuestos.
- Cálculos automáticos: base imponible, cuota IVA y total.
- Gestión de líneas: añadir repuestos y mano de obra, editar cantidad, coste y precio.
- Guardado local en `localStorage` (borradores y presupuestos guardados con identificador único).
- Importador básico de texto desde PDF (usa PDF.js) para extraer datos y líneas de trabajo.
- Impresión compatible con Chrome usando `Blob` + `URL.createObjectURL()` para evitar bloqueos de popup.
- Modal de historial por vehículo y descarga de copia HTML si la apertura de ventana es bloqueada.

Correcciones y mejoras importantes
---------------------------------
- Solucionado un error crítico en la generación de HTML para impresión (tag `<br/>` mal cerrado) que impedía la inicialización de Alpine.js.
- Reemplazo de imágenes externas faltantes por emojis para evitar retrasos por recursos no encontrados.
- Añadido `.gitignore` y `README.md` con instrucciones de ejecución local.

Cómo probar localmente
----------------------
1. Abrir terminal en el directorio del proyecto.
2. Ejecutar:

```bash
python -m http.server 5500 --bind 127.0.0.1
```

3. Abrir `http://127.0.0.1:5500/final_v8_fixed.html` en Chrome.
4. Recomendado limpiar caché si aparece comportamiento extraño (Ctrl+Shift+Supr).

Notas finales
------------
- Revisa la carpeta `PRESUPUESTO MECANICOS/` si quieres excluir PDFs del repositorio (ya añadí `.gitignore`).
- Para publicar las notas en GitHub Releases, copia el contenido de este archivo al formulario del release en: https://github.com/abelreiinaa/app/releases/new
