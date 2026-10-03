# Material TechWeek · ANI-82 / ANI-87

Paquete de trabajo del 03/10/2026. **No acredita impresión, varios teléfonos, dos celulares ni ensayo humano.** El video muestra lo que funciona en la app, incluidos sus pendientes; no simula un historial.

- `one-pager-borrador.pdf`: una carilla A4, preparada para revisión/impresión. Sigue siendo borrador: falta landing publicada y contacto definitivo. Fuente editable: `one-pager.html`.
- `qr-repo.png`: QR al repo público, decodificado automáticamente. **No es el QR de landing**; ese archivo se agrega al conocer y verificar su URL.
- `demo-60s.mp4`: recorrido real de tipo, escala, borrador, catálogo pendiente y ayuda, con portada que explica el alcance. H.264/yuv420p, 60 s; sin audio. No demuestra el guardado, calendario o funcionamiento offline de la app completa.
- `inicio.png`, `animo.png`, `emocion-pendiente.png`, `ayuda.png`: capturas reales locales sin datos personales, para plan C.
- `ensayo.md`: agenda, pitch de trabajo, respuestas y acta para el 22/10.
- `clonado.md`: evidencia técnica y acta de prueba externa de ANI-78.

## Descargar y probar el respaldo

Copiar el MP4 y las cuatro capturas al almacenamiento local de **dos teléfonos**. Desactivar wifi y datos, reproducir completo desde la galería/archivos y abrir las capturas. Anotar teléfono, persona, duración y resultado en `ensayo.md`. Abrir un link a GitHub no prueba que el video esté descargado.

Cuando esté la landing, generar su QR, decodificar el destino y probarlo desde el one-pager impreso en varios teléfonos. Actualizar fuente/PDF con ese QR y el contacto definitivo, imprimir y comprobar que no queda marcado como borrador. Registrar cantidad de copias, responsable y verificación física. La demo con varias semanas de datos requiere guardado y calendario reales; no cargar registros ficticios en datos de usuarios.

## Regenerar desde un build verificado

Servir producción con `npm run build` y `npm run start -- --port 3068`. Desde la raíz del repo:

```sh
TECHWEEK_BASE_URL=http://localhost:3068 uv run --with playwright --with qrcode --with pillow --with opencv-python-headless --with pypdf python docs/techweek/preparar.py
```

Requiere ffmpeg en PATH y Chrome o Chromium de Playwright (`CHROME_BIN` permite elegirlo). Las herramientas de creación se ejecutan de forma aislada con uv; no son dependencias de la app. El script requiere que el catálogo siga pendiente: si ya está disponible, actualizar el recorrido y la descripción al estado comprobado antes de grabar otra versión.

La fuente del PDF usa la fuente local de `prototype/fonts/`; para editar/imprimir HTML después de descargar este paquete aislado, abrir el PDF incluido o conservar esa ruta del repositorio.
