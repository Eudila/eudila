# Entrada antes del acceso

**Objetivo:** mostrar la apertura existente antes de una bienvenida con solo Google, Ingresar y Registrarse; pedir datos después de elegir.

**Diseño:** reutilizar `/bienvenida` y el componente `Intro`, con la misma cookie de sesión, Saltear/Esc, Ayuda disponible y movimiento reducido. Mantener las tres cápsulas alineadas, Lisa y coral. Un título accesible queda oculto visualmente. Los errores de Google se muestran solo cuando ocurren; la indisponibilidad se anuncia con descripción accesible. Email, contraseña y recuperación siguen en sus rutas actuales.

**Alcance:** `app/bienvenida/page.tsx` y un cliente `welcome.tsx`; quitar apertura de `app/empezar/page.tsx` y `onboarding.tsx`; mover OAuth desde `app/auth/auth-form.tsx`; ajustar CSS, pruebas de acceso/acciones y documentación de marca. Sin cambios de esquema ni dependencias.

1. Agregar una prueba de navegador para apertura → tres opciones → formulario, salto/Esc, cookie, movimiento reducido, teclado y reflujo. Ejecutarla contra la implementación previa para comprobar el fallo.
2. Mover la apertura a bienvenida; trasladar el OAuth existente con bloqueo de envíos repetidos, estado de espera y errores. Quitar Google de los formularios y la apertura del onboarding. Conservar validación y flujo de datos.
3. Actualizar comprobaciones existentes que buscaban Google en alta; ejecutar lint, tipos, build y pruebas de navegador. Registrar capturas y límites en los documentos de marca.

**Comprobación:** `npm run lint`, `npm run typecheck`, `npm run build`, `uv run --with playwright python app/bienvenida/browser.test.py`; regresión `app/design-actions.test.py`. El login externo de Google requiere credenciales que no están configuradas en el entorno.

## Refinamiento posterior

El usuario pidió ralentizar el cierre, elevar el bloque y agregar texto encima. Se mantiene el primer tramo y se escala el reloj al 70 % desde el florecimiento coral. La bienvenida usa título/subtítulo visibles y margen superior adaptable. La prueba existente se amplía para comprobar duración, posición y errores de consola. El error de Next reportado se investiga por reproducción y se solicita su texto si no aparece en una sesión nueva.

## Recorrido principal

El usuario define bienvenida → ingreso/alta → registro emocional. Las entradas de autenticación y su callback deben abrir `/registro/tipo`, conservando la confirmación de email y la recuperación de contraseña. Se quita la exigencia de completar nombre/introducción antes de usar la app; la personalización existente queda opcional desde Cuenta. El inicio no exige personalización y conserva el acceso a Cuenta; la vista previa conserva su entrada explícita. Se actualizan los destinos y la prueba real de autenticación, incluyendo una cuenta sin personalización.
