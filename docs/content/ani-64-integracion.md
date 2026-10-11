# ANI-64 · Conexión del selector a la base

El selector de Next.js está preparado para leer el catálogo de ANI-50. No necesita un cambio de componente al crear la base: completar las migraciones/semillas y configurar la URL y clave pública habilita la lectura. El frontend nunca importa las emociones del archivo JSON como catálogo de respaldo.

## Preparación de ANI-50

1. Crear `emociones` con `id UUID`, `nombre text` y `sugerida boolean`, sin valores nulos. Importar `data/catalogo-v1.json` → `emociones`, conservando sus UUID y haciendo upsert por `id`.
2. Habilitar lectura de las filas del catálogo para el rol `anon` mediante los permisos y políticas correspondientes. El catálogo contiene únicamente etiquetas públicas; no registros personales. La escritura del catálogo corresponde a migraciones/administración.
3. Confirmar que PostgREST entrega un array de filas en este endpoint:

   ```text
   GET <origen-supabase>/rest/v1/emociones?select=id,nombre,sugerida&order=nombre.asc
   apikey: <clave-publica-anon>
   Authorization: Bearer <clave-publica-anon>
   ```

   La respuesta es el array `emociones`, no el objeto JSON completo. La app valida UUID, nombres no vacíos, booleanos reales e IDs únicos; una respuesta incompatible muestra error y permite reintentar.

4. Copiar `.env.example` a `.env.local` en la raíz del proyecto y completar:

   ```dotenv
   NEXT_PUBLIC_CATALOG_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_CATALOG_ANON_KEY=<clave-publica-anon-JWT>
   ```

   En Supabase local, usar el origen `http://127.0.0.1:54321`. El origen no incluye `/rest/v1/emociones`. Ambas variables quedan en el navegador: usar la clave **anon JWT**, nunca `service_role` ni una clave secreta. Reiniciar `npm run dev` al cambiar valores; para producción, configurarlos antes de `npm run build` y reconstruir/desplegar.

El prototipo estático usa por separado `prototype/config.js` (`url`, `anonKey`); no interpreta las variables de Next.js. Ambos clientes comparten `prototype/catalog.js` y el contrato REST. El archivo config del prototipo mantiene valores vacíos en el repositorio.

## Comprobación sobre la base real

- Entrar a `/registro/tipo`, elegir un momento y recorrer ánimo → emoción.
- Ver seis sugerencias definidas por `sugerida`, independientes del ánimo, y 21 opciones en «Ver todas las emociones».
- Buscar «alegria» o «no se»; elegir una opción con teclado, cerrar con Escape y comprobar que el foco vuelve al botón que abrió la lista.
- Recargar y volver desde Ayuda: la opción y el ánimo se conservan en el borrador. Solo se guarda el UUID en `emotionId`.
- Las tres alternativas explícitas de ANI-96 son opciones válidas. Si el UUID restaurado ya no aparece en el catálogo, se pide otra elección sin borrar silenciosamente el borrador.
- Cortar la conexión y recargar el paso: mostrar error y reintento sin perder la selección. Una lectura que no responde termina con error después de 10 segundos de actividad del navegador.

El botón «Siguiente» lleva a `/registro/factores`, que permite elegir ninguno, uno o varios factores. La confirmación informa que el guardado de cuenta todavía no está habilitado en esta versión; con preview=false no se simula persistencia. ANI-66/98 cubren el guardado real. La lectura del catálogo no certifica autenticación, aislamiento de registros personales ni persistencia en Supabase.

## Evidencia previa a la base

`node --test prototype/catalog.test.mjs data/catalogo.test.mjs prototype/flow-state.test.mjs` comprueba el contrato y las identidades de los datos semilla. `uv run --with playwright python app/registro/emociones.test.py` recorre el selector Next.js con las filas reales de ANI-96 interceptadas exclusivamente dentro de Chrome; el servidor de la app no entrega fixtures. La prueba también arranca la app sin configuración y comprueba que no realiza lecturas de catálogo.

Estas pruebas con respuestas interceptadas confirman el manejo de errores y estados; no acreditan conexión real.

## Prueba contra Supabase real

Con las dos variables públicas exportadas en el entorno, ejecutar:

```sh
uv run --with playwright python app/registro/emociones.live.test.py
```

La prueba inicia Next.js con preview=false y lee el endpoint configurado desde Chrome, sin interceptarlo. Exige que las 21 filas recibidas coincidan con ANI-96, comprueba las seis sugerencias, elección con teclado por ambas vías, búsqueda sin tildes, Escape/retorno de foco, tres alternativas, UUID, recarga, siguiente y reflujo a 320/390/520 px con texto al 200%. Si faltan variables o la base falla, termina con error; no omite la prueba ni usa un catálogo de respaldo. Solo efectúa GET del catálogo; no crea cuentas ni registros.

El 11/10/2026 se verificó contra **Supabase local real** (`http://127.0.0.1:56421`), con PostgreSQL 17.11, PostgREST y la migración/semilla publicadas de ANI-50 en `15d1c7a`. La base temporal vacía entregó 21 emociones, seis sugeridas y 15 factores. La prueba configurada terminó con exit 0. [Plan y evidencia](../plans/2026-10-11-ani-64-cierre.md).

Esta comprobación acredita el consumo desde la base requerido por ANI-64. El proyecto Cloud descrito en Linear pertenece a otra cuenta y no se verificó desde esta sesión; su despliegue continúa en ANI-53. La prueba real permite repetir el mismo recorrido sobre ese destino cuando su configuración pública esté disponible.
