# Clonado en máquina limpia · ANI-78

## Estado · 04/10/2026

Verificación técnica completada contra el repositorio público. **Prueba externa pendiente; ANI-78 permanece In Progress.** El criterio de cierre exige una persona ajena al setup en una máquina donde nunca corrió eudila, siguiendo solo el README y en menos de 15 minutos.

[Plan de ejecución](../plans/2026-10-04-ani-78-clonado.md). [Ticket ANI-78](https://linear.app/anima-org/issue/ANI-78/prueba-de-clonado-en-una-maquina-limpia).

## Verificación técnica realizada

- Repositorio: https://github.com/Eudila/eudila.git.
- Commit público probado: [59e55a1f5fc7d7a9acfd9c7b1e0e194005c41f39](https://github.com/Eudila/eudila/commit/59e55a1f5fc7d7a9acfd9c7b1e0e194005c41f39).
- Ejecutor: Codex (IA) en el equipo de trabajo. Clon temporal nuevo, fuera de los checkouts y worktrees; sin copiar node_modules, build ni archivos de entorno. **No es una persona externa ni una máquina diferente.**
- Entorno: macOS 26.5, Darwin 25.5.0; Git 2.52.0; Node.js 26.8.1; npm 11.19.0; Chrome instalado. No se afirma una matriz probada de otros sistemas o versiones de Node.
- Inicio del clonado: 04/10/2026 20:34:10 UTC (17:34:10 ART).
- Recorrido de desarrollo comprobado: 20:34:57 UTC; producción: 20:36:08 UTC.

Se ejecutó exactamente el quickstart del README:

```sh
git clone https://github.com/Eudila/eudila.git
cd eudila
npm ci
npm run dev
```

El puerto 3000 estaba disponible. No se crearon variables de entorno, credenciales ni base de datos. Chrome abrió http://localhost:3000 con HTTP 200; mostró inicio, permitió Empezar registro, elegir Mañana y avanzar al ánimo. Desde el registro, Ayuda abrió en un toque y presentó los cuatro enlaces `tel:911`, `tel:135`, `tel:08003451435` y `tel:08009990091`. Sin errores de JavaScript de página. No se realizaron llamadas reales.

Se detuvo desarrollo con Ctrl+C y se ejecutaron los comandos de verificación del README, seguidos de `npm run start`. Producción se comprobó nuevamente en Chrome con el mismo recorrido. La captura de Ayuda a 390 × 844 fue inspeccionada: acción 911 visible, texto legible y navegación sin superposición. Ambos servidores quedaron detenidos.

| Comando | Tiempo del proceso | Resultado |
| --- | ---: | --- |
| git clone | 1,469 s | exit 0 |
| npm ci | 9,617 s | exit 0 |
| npm run lint | 2,126 s | exit 0 |
| npm run typecheck | 1,542 s | exit 0 |
| npm run format:check | 0,683 s | exit 0 |
| npm run build | 4,420 s | exit 0 |
| npm run dev | Ready en 249 ms según Next | Recorrido visible y operable |
| npm run start | Ready en 79 ms según Next | Recorrido visible y operable |

También se ejecutó `node --test app/ayuda/worker.test.mjs prototype/flow-state.test.mjs data/catalogo.test.mjs`: 5/5, cero fallos. El clon quedó sin cambios versionados.

El tiempo entre el comienzo del clonado y la comprobación automatizada del recorrido en desarrollo fue **47,897 segundos**, incluyendo pausas del agente. Este dato describe esta ejecución técnica; **no acredita el tiempo ni la experiencia de una persona externa**.

### Tropiezos y observaciones

No hubo pasos faltantes del README ni fallos de instalación, arranque, checks o recorrido. No se modificó el código ni el quickstart.

npm ci emitió avisos de deprecación de ESLint, cinco entradas de severidad alta en su auditoría y una advertencia de scripts de instalación de unrs-resolver bajo npm 11. La instalación terminó con exit 0 y el build funcionó; no se aplicó `npm audit fix --force` ni se alteraron las versiones del proyecto dentro de esta prueba de clonado.

La prueba técnica anterior del 03/10 está registrada en [PR #2](https://github.com/Eudila/eudila/pull/2), sobre otro SHA. Esta repetición usa main con ANI-67 integrada y no incorpora los cambios de ese PR.

## Prueba externa: protocolo listo para usar

Agustín coordina la persona y le entrega únicamente la URL del repositorio y este pedido:

> Abrí https://github.com/Eudila/eudila y levantá la app siguiendo únicamente su README. Registrá los pasos que te traben y avisá cuando la veas funcionando.

La persona debe ser ajena al setup y usar una máquina donde nunca corrió eudila, con Git, Node compatible y npm disponibles. El README es la única guía operativa; no ayudar por WhatsApp ni verbalmente durante el recorrido. Si la persona no puede seguirlo sin ayuda, registrar el tropiezo y corregir antes de repetir.

1. Registrar versiones y SHA clonado. Iniciar el cronómetro al comenzar a clonar.
2. Seguir solo README hasta la app visible y operable. Detener el cronómetro al llegar allí.
3. Registrar si logró comenzar el registro y abrir Ayuda, sin realizar llamadas.
4. Anotar cualquier tropiezo y tiempo perdido. Si tarda 15 minutos o más, requiere ayuda o falla un paso, corregir y publicar la solución.
5. Repetir desde una carpeta limpia con la versión corregida. Conservar los intentos fallidos y aclarar que la repetición ya no es primera exposición.

### Acta externa por completar

| Dato | Resultado |
| --- | --- |
| Persona ajena al setup / identificación consentida | Pendiente |
| Fecha, máquina donde nunca corrió eudila y sistema operativo | Pendiente |
| Versiones de Git, Node y npm | Pendiente |
| SHA público clonado | Pendiente |
| Inicio del cronómetro | Pendiente |
| App visible y operable / fin del cronómetro | Pendiente |
| Duración total menor de 15 minutos | Pendiente |
| Registro y Ayuda accesibles | Pendiente |
| Tropiezos textuales, tiempo perdido y ayuda recibida | Pendiente |
| Correcciones y repetición, si hubo fallos | Pendiente |

## Regla de cierre

Incorporar el acta externa real y cualquier corrección en main, adjuntar PR y SHA a ANI-78 y verificar Done por lectura de Linear. Hasta disponer de esa evidencia, la verificación técnica y el protocolo publicados no sustituyen el criterio externo del ticket.
