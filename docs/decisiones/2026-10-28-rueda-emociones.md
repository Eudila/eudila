# 28/10/2026 · Registro guiado por la rueda de emociones

El slider de siete estados se conserva. Sus valores 1–3 ofrecen Tristeza, Enfado y Miedo; 5–7 ofrecen Calma, Felicidad y Fuerza; Neutral permite las seis familias. La búsqueda usa el mismo filtro y mantiene las tres alternativas explícitas.

Elegir cualquiera de las tres familias agradables muestra juntas sus 18 emociones de segunda capa. Elegir una emoción intermedia muestra los seis sentimientos exteriores de su familia/color. El sentimiento final determina el recorrido canónico: por ejemplo, Curioso se revisa como Felicidad → Interesado → Curioso, aunque se haya empezado por otra familia agradable.

El usuario debe seleccionar el sentimiento exterior o una alternativa para continuar. Factores y revisión validan también esa condición, incluso si se vuelve con el historial del navegador. Cambiar el ánimo elimina del borrador una selección incompatible; no se modifican registros anteriores.

El dominio compartido guarda las 36 relaciones de la imagen proporcionada por el usuario. El catálogo pasa a 1.1.0: conserva los 21 IDs/nombres anteriores y agrega 75 etiquetas con UUID estables. El registro sigue almacenando un único `emotion_id`, la elección final; el recorrido se deriva de ella. No se necesita cambiar el esquema de registros.

La imagen está atribuida en su propio texto a Gloria Willcox (1982), con crédito visual a @anabelcornago / El sonido de la hierba al crecer. Se transcriben palabras y relaciones, sin copiar la ilustración ni sus colores y sin presentar la adaptación como una escala clínica validada.

## Publicación

Aplicar `app/supabase/migrations/20261028000000_rueda_emociones.sql` antes de activar esta interfaz. Es aditiva (`on conflict do nothing`) y no borra ni renombra categorías con registros históricos. En el VPS autohospedado, conservar un respaldo y registrar el nombre en `public.eudila_migrations` dentro de la misma transacción. El pipeline rechaza migraciones pendientes.

Probar el build de producción con preview desactivado, autenticación y catálogo reales antes del merge; después verificar HTTPS, persistencia, aislamiento y exportación. Conservar la imagen anterior para rollback de la app. No revertir la migración borrando etiquetas que pudieran quedar referenciadas.

## Verificación

Pruebas de dominio: 36 relaciones, 18 opciones compartidas, seis por color, filtro, completitud de la selección, UUID y migración aditiva. Pruebas de navegador: 36 ramas, foco/teclado, recarga, reflujo 320 px/200%, errores y bloqueo de una revisión incompleta tras usar Atrás.

La prueba de cuenta local guarda y lee los 36 sentimientos con IDs/nombres reales, comprueba el cruce Fuerza → Optimista → Curioso, exportación de más de 1000 registros, aislamiento entre cuentas/anonimato, rollback de validaciones y reintentos sin duplicados. Usuarios sintéticos eliminados al finalizar.
