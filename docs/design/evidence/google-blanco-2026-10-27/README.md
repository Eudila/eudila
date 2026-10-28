# Acceso con Google blanco · 27/10/2026

Pedido del usuario: botón de login con Google blanco, con su G.

`/bienvenida` conserva la cápsula y altura de las otras acciones, con blanco (`--color-white`) y texto Grafito (`--color-graphite`). El recurso oficial se guarda localmente en `public/brand/google-g.png`, desde <https://developers.google.com/static/identity/images/g-logo.png>; [fuente y guía de Google](https://developers.google.com/identity/branding-guidelines). La imagen es decorativa (`alt=""`), sin deformar su proporción. El estado deshabilitado conserva el blanco con menor opacidad; carga y foco mantienen su comportamiento.

No se cambia el flujo OAuth ni la identidad de las demás acciones.

Desplegado en <https://app.eudila.com/bienvenida> en la versión `20261027T230211Z-google-white-2fbee686`. [Captura real de producción a 390 px](produccion-390.png). Se verificaron fondo blanco, texto Grafito, carga de la G oficial, nombre accesible, foco visible, apariencia deshabilitada y reflujo a 320/390/1440 px con texto al 100/200%. Pasaron la prueba existente de bienvenida (apertura, saltar/Esc, foco, acceso y registro), lint, tipos, formato, 38 pruebas unitarias y el build Linux. No se repitió el consentimiento OAuth completo.
