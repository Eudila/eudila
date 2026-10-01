# ANI-75 · Contenido de la landing — diseño y plan de ejecución

> **Ejecución:** seguir este plan de principio a fin con `superpowers:executing-plans`. Agustín autorizó tomar la siguiente tarea, planificarla y llevarla hasta Done el 01/10/2026.

**Objetivo:** entregar el texto completo, verificable y aprobado para que Joaco pueda maquetar ANI-76.
**Arquitectura:** un documento Markdown con el texto público en su orden de lectura: presentación, gobiernos, contacto y desarrolladores. Las notas editoriales y la evidencia quedan en este plan. El contenido describe el prototipo publicado; la exportación se identifica como prevista hasta completar ANI-94/ANI-95.
**Tecnologías:** Markdown, Git, Python 3 para servir el prototipo; fuentes primarias SNIC y Scientific Reports.
**Estado:** en ejecución; aprobación editorial pendiente.

## Selección y diseño

ANI-69 y ANI-70 están Done. ANI-64 depende del catálogo clínico y del esquema; ANI-67 depende del layout definitivo y del texto con revisión clínica. ANI-94/ANI-95 necesitan registros guardados y un historial, ausentes hoy. ANI-78 requiere una persona externa en una máquina limpia. ANI-75 puede producir su entregable ahora y desbloquear la maquetación.

Se consideraron dos opciones: redactar una versión para el MVP futuro, condicionada a un lanzamiento todavía no verificado, o una versión que pueda publicarse con el repositorio actual. Se elige la segunda para cumplir la regla explícita de ANI-75 de no prometer prestaciones inexistentes. La actualización al MVP requerirá comprobar el código disponible al publicarse.

El texto conserva el wordmark `eudila`, el voseo y el tono directo. Para gobiernos: necesidad local con una comparación fechada, propuesta de explorar una implementación y límites del servicio. Para desarrolladores: repo real, comando que funciona hoy, AGPL-3.0 y contribuciones por issues/PR. La oferta institucional es una conversación sobre desarrollo y adaptación, no la venta de un dashboard operativo.

La exportación aparece en ambos bloques como prevista: control del informe por la persona para gobiernos, portabilidad de formatos para desarrolladores. Generar archivos en el navegador no equivale a que la aplicación completa nunca use servidores. No se promete importación de datos ni un formato que aún no existe.

Contacto: issues públicos del repo, habilitados y accesibles, con aviso breve de no enviar datos de salud. ANI-56 figura Done, pero no documenta correo ni dominio; no inventar uno ni publicar una dirección personal. El canal no es atención clínica.

## Secuencia de ejecución

1. **Base y alcance.** Revisar Linear, README, código y `research.md`. Crear un worktree desde `origin/main`; ejecutar `node --test prototype/flow-state.test.mjs` como control de base.
2. **Fuentes.** Abrir el informe oficial SNIC 2025, comprobar tabla 138 y denominador; descargarlo temporalmente para contrastar la extracción. Leer el artículo enlazado por `research.md`, incluidos métodos y límites. Verificar repo y canal de contacto mediante GitHub.
3. **Redacción.** Crear `docs/content/landing.md` con todos los títulos, párrafos, botones y enlaces listos para copiar. Añadir desde README un enlace al documento. No construir ANI-76 ni cambiar la app.
4. **Comprobación.** Clonar el repo público en una carpeta temporal; seguir los comandos que aparecen en el texto y verificar HTTP 200 en inicio y ayuda. Revisar cada prestación contra el código y cada cifra contra su fuente; comprobar destinos y `git diff --check`. Pedir una revisión independiente de requisitos antes de integrar.
5. **Aprobación y entrega.** Mostrar a Agustín el texto concreto. ANI-75 exige explícitamente «todo el texto escrito y aprobado»: la autorización para ejecutar la tarea no sustituye aprobar el copy final. Si pide cambios, incorporarlos y repetir las comprobaciones afectadas. Tras aprobación, registrar la evidencia, integrar/publicar en `Eudila/eudila` y actualizar ANI-75 a Done con el enlace. Hasta entonces, conservar In Progress.

## Evidencia de fuentes · 01/10/2026

- [SNIC 2025, tabla 138, página 177](https://cloud-snic.minseg.gob.ar/Informes/SNIC/Informe_SNIC_Nacional_2025.pdf#page=177): tasas de suicidio 2025 Salta 17,4 y total nacional 11,8; denominador «población mayor a 5 años». El propio informe advierte diferencias de registro entre jurisdicciones (p. 13). Se cita la comparación descriptiva, sin inferir riesgo individual, causalidad ni eficacia de Eudila. No se mezclan registros DEIS/SNIC ni se usan variaciones interanuales.
- PDF descargado temporalmente y contrastado con `pdftotext -layout -f 177 -l 177`; SHA-256 `ee051000e5a0d8a6f562d28f73393fb98857e766327fa0b33403ed79af512264`. No se incorpora el PDF al repo. Su portada contiene un año residual; la tabla y el cuerpo identifican 2025.
- [Pichowicz, Kotas y Piotrowski, Scientific Reports, 27/08/2025](https://www.nature.com/articles/s41598-025-17242-4): evaluación de agentes con escenarios simulados en inglés; fallas de respuesta y de contactos adecuados a la región. Se usa una paráfrasis breve, sin generalizar a todos los modelos actuales ni a conversaciones reales. La corrección del 26/01/2026 añade financiación y no cambia el resultado citado.
- `gh repo view Eudila/eudila`: repo público con issues habilitados. `https://github.com/Eudila/eudila/issues` responde HTTP 200. README, licencia y ruta `prototype/` existen en `main`.

## Criterios de cierre

- [x] Texto completo en `docs/content/landing.md`, en orden de maquetación.
- [x] Cada cifra estadística con fuente primaria y alcance al lado.
- [x] Contacto real y comandos reproducidos desde clon temporal.
- [x] Prestaciones actuales contrastadas; PDF/CSV/JSON claramente previstos en ambas secciones.
- [x] Revisión independiente resuelta.
- [ ] Aprobación editorial explícita de Agustín.
- [ ] Documento publicado y ANI-75 confirmado en Done.

## Evidencia de ejecución · 01/10/2026

- Base `51cdea8` de `origin/main`, worktree externo en rama `ani-75-contenido-landing`; checkout original limpio y preservado.
- Clon nuevo de `https://github.com/Eudila/eudila.git` en carpeta temporal. Servidor con `python3 -m http.server` usando un puerto libre temporal; inicio, `app.js` y ayuda respondieron HTTP 200. Se comprobó contenido de las vistas y enlace `tel:135`. El clon, arranque y peticiones demoraron 1,3 s en este equipo. Esto verifica los comandos, no sustituye la prueba con una persona externa de ANI-78.
- `node --test prototype/flow-state.test.mjs`: pasó en la base y en el clon público, un archivo y cero fallos.
- Todos los enlaces externos del copy respondieron HTTP 200 con redirecciones: informe oficial, artículo, repo, README, licencia, NOTICE, issues y pull requests. Los destinos Markdown del README existen.
- `git diff --check`: sin errores. Solo documentación; no se modifica comportamiento, dependencias ni assets del prototipo.
- Revisión independiente con `superpowers:requesting-code-review`: sin hallazgos críticos ni importantes. El revisor contrastó ambas fuentes, destinos y prestaciones con el código; reprodujo los comandos desde otro clon temporal y confirmó HTTP 200 y prueba de estado sin fallos. Considera el documento listo para revisión editorial y maquetación.
- Aprobación editorial solicitada con enlace al texto completo; pendiente de respuesta antes de publicación y Done.
