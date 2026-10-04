# Ayuda ahora · texto para ANI-59 / ANI-67

**Responsable de la entrega:** Agustín Pedernera. **Versión:** 2, 04/10/2026.

**Estado:** propuesta concreta lista para revisión clínica. No se encontró evidencia de esa revisión en ANI-59. La revisión factual y técnica de esta entrega no equivale a una aprobación clínica.

La siguiente transcripción es el contenido de `/ayuda` en la rama `ani-67-ayuda-offline`. El botón global dice “Ayuda ahora” y abre la página directamente, sin sesión ni confirmación. Los teléfonos son enlaces `tel:` de HTML.

## Texto exacto de la pantalla

```text
Ayuda ahora

Peligro inmediato
Si vos u otra persona están en peligro inmediato, llamá al 911.

Llamar al 911
Emergencias · Desde todo el país

Podés consultar los números sin internet. Para llamar necesitás señal telefónica.

Centro de Asistencia al Suicida
De 8:00 a 0:00. La línea puede estar ocupada.

Llamar al 135
Capital Federal y Gran Buenos Aires

Llamar al 0800 345 1435
Desde todo el país

Urgencias de salud mental
Atención nacional, las 24 horas.

Llamar al 0800 999 0091
Desde todo el país

Números, cobertura y horarios: Centro de Asistencia al Suicida, sus horarios de atención y Ministerio de Salud de la Nación y Emergencias Argentina. Verificado el 04/10/2026.
```

La transcripción no incluye la cabecera y las tres tabs comunes a la app. En el pie, el nombre de cada fuente enlaza a su página oficial. No hay diagnóstico, promesa de mejora ni frases de aliento añadidas. La precisión clínica del mensaje y la pertinencia de recursos para una urgencia requieren la revisión expresamente solicitada por el ticket.

## Verificación factual · 04/10/2026

| Dato | Fuente primaria |
| --- | --- |
| 911: emergencias, todo el país; CAS lo indica ante peligro inminente | [Emergencias Argentina](https://www.argentina.gob.ar/tema/emergencias) y [CAS — Ayuda](https://www.asistenciaalsuicida.org.ar/ayuda) |
| 135: Capital Federal y Gran Buenos Aires; 0800 345 1435: todo el país | [Centro de Asistencia al Suicida — Ayuda](https://www.asistenciaalsuicida.org.ar/ayuda) |
| CAS: de 8:00 a 0:00; las líneas pueden estar ocupadas | [CAS — Horarios](https://www.asistenciaalsuicida.org.ar/horarios-de-atencion) |
| 0800 999 0091: orientación y apoyo en urgencias de salud mental, nacional, 24 horas | [Ministerio de Salud de la Nación](https://www.argentina.gob.ar/node/513585), publicación del 10/09/2026 |

Los enlaces comprobados son `tel:911`, `tel:135`, `tel:08003451435` y `tel:08009990091`. Las fuentes verifican los datos publicados; no acreditan una llamada realizada ni una revisión clínica particular de esta pantalla.

La consulta offline necesita que la app haya preparado la copia local previamente con conexión. No se puede descargar por primera vez sin red. El requisito técnico es que los números sigan consultables después de esa preparación; llamar necesita conectividad telefónica y un dispositivo con marcador.

## Revisión documental del contenido sanitario · 04/10/2026

**Responsable de esta revisión:** Codex (IA). **Método:** contrastación de cada indicación con fuentes primarias, revisión de riesgos de redacción, diferenciación de recursos de orientación y respuesta ante peligro inmediato, y comprobación de la transcripción contra la pantalla. No se atribuye formación profesional, intervención de una persona clínica ni aprobación de esa naturaleza a esta revisión.

| Aspecto | Hallazgo sobre v1 | Corrección o conclusión en v2 |
| --- | --- | --- |
| Peligro inmediato | V1 solo ofrecía líneas de acompañamiento u orientación; podía confundirse su función con respuesta inmediata de emergencias | Se agrega antes de las otras líneas una indicación y botón 911, siguiendo CAS y el portal nacional de emergencias. No se invita a esperar una línea ocupada ante peligro inmediato. |
| Cobertura | El 135 no tiene alcance nacional | Se conserva su cobertura Capital Federal y Gran Buenos Aires. El 0800 345 1435 ofrece la alternativa nacional publicada por CAS. |
| Horarios y disponibilidad | No se puede prometer atención permanente de CAS | Se conserva 8:00–0:00 y el aviso de posible ocupación. El 0800 999 0091 se identifica separadamente como nacional de 24 horas, según Ministerio de Salud. |
| Función de la línea nacional | Orientación y apoyo no equivalen a que la app preste atención | Se mantiene el recurso externo y no se ofrece chat, vigilancia ni atención desde eudila. No se promete la llegada de una ambulancia o un tiempo de respuesta. |
| Autodiagnóstico y tratamiento | El objetivo de la pantalla es acceder a recursos | No se evalúa riesgo individual, no se asigna diagnóstico ni se indican tratamientos; se ofrecen enlaces directos a los recursos publicados. |
| Lenguaje | Los mensajes deben evitar juicios y promesas | La redacción es breve, describe acciones y coberturas; no afirma que la persona deba mejorar, ni que llamar garantice un resultado. |
| Sin internet | Consultar el HTML no crea conectividad telefónica | Se distingue explícitamente consulta offline de llamadas que necesitan señal. |
| Fricción y privacidad | Una urgencia no debe exigir sesión, explicación o confirmación en la app | No se piden datos. Los enlaces tel son nativos. La copia cacheada es pública y no incluye registros emocionales. |

**Resultado de esta revisión documental:** se encontró y corrigió la omisión de peligro inmediato. Los demás datos y límites se corresponden con las fuentes citadas. Esta conclusión tiene el alcance descrito; no equivale a una evaluación clínica profesional de la pantalla ni de quienes la usan.

## Registro de revisión clínica profesional

**Pendiente.** Registrar sobre esta versión concreta:

- Nombre y rol profesional de quien revisa.
- Fecha y referencia verificable del dictamen.
- Aprobación o correcciones solicitadas, incluidas indicaciones sobre atención ante peligro inmediato, cobertura y horarios.
- Versión o commit del texto revisado e incorporación de los cambios que correspondan.

No se atribuye revisión a Noelia ni a una persona que no haya participado. Para cerrar ANI-67 se debe incorporar el registro real, integrar el texto resultante y verificar otra vez la pantalla. Este documento cubre únicamente Ayuda: no acredita la entrega de todos los textos restantes de ANI-59.
