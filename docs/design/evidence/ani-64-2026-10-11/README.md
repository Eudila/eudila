# ANI-64 · Evidencia del selector · 11/10/2026

Ruta comprobada: `/registro/emocion` en Next.js, sobre main `bd7339e` con el cambio de ANI-64. Fuente estética: brandbook Eudila v1.0 pp.8–10 y DESIGN.md. Sin ilustraciones, colores ni categorías de los mocks.

## Capturas de la lectura real

- [Selector, 390 × 844](selector-real-390.png): seis sugerencias, lienzo Nube/Grafito, acción institucional y cápsula ≥50 px.
- [Lista, 390 × 844](lista-real-390.png): Figtree Bold, buscador enfocado, 21 opciones provenientes de la base, diálogo nativo.
- [Selector, 320 × 568 con texto al 200%](selector-real-320-200.png): reflujo vertical; esta captura muestra el inicio del área desplazable. El registro necesita desplazamiento con este aumento, sin reducir texto ni eliminar controles.
- [Lista, 320 × 568 con texto al 200%](lista-real-320-200.png): buscador enfocado y lista desplazable dentro del diálogo, sin desbordamiento horizontal.

Estas capturas vienen de `emociones.live.test.py`: Chrome real, reduced motion activo, preview=false y GET sin interceptar a **Supabase local** `http://127.0.0.1:56421`. La insignia «N» pertenece al servidor Next.js de desarrollo. No son capturas de Supabase Cloud ni de la vista previa con catálogo importado desde JSON.

## Verificaciones

| Comprobación | Resultado |
| --- | --- |
| Supabase CLI 2.120.0, PostgreSQL 17.11, Auth/Kong/PostgREST | Proyecto temporal vacío; migración y semilla publicadas de ANI-50 en `15d1c7a` aplicadas. |
| SQL directo de la base | 21 emociones, seis sugeridas, 15 factores. |
| `emociones.live.test.py` | Exit 0: respuesta REST coincide con las 21 filas/UUID de ANI-96, chips/lista, teclado, búsqueda sin tildes, alternativas, foco/Escape, recarga, siguiente, 320/390/520 px y 200%. |
| `emociones.test.py` | Exit 0: seis sugerencias visibles sin desplazar y controles ≥44 px en 320/390/520; cápsula ≥50 px, Figtree Bold, contrato/errores/timeout/reintento, storage bloqueado y ausencia de configuración. |
| Node | 10/10 pasan: catálogo, semillas, borrador e historial. |
| Lint, tipos y formato | Exit 0. |
| Build de producción | Exit 0. |
| `app/frontend.test.py` en producción | Exit 0: flujo de registro/edición, preview, historial y exportaciones sin regresiones. |
| Revisión independiente | Sin bloqueantes de código; se aclaró origen local de la prueba y se completó documentación. |

La prueba del radio falló con el CTA anterior; la de visibilidad falló porque la última sugerencia terminaba en 565.4 px y el main terminaba en 507 px a 320 × 568. Las dos pasan después de los ajustes. No se modificaron colores: se conserva la adaptación AA institucional existente. Se inspeccionaron visualmente las cuatro capturas anteriores.

## Límites

La base local se usa solo para lectura de catálogo desde el navegador y se retira al terminar. No se crearon cuentas ni registros personales, no se modificó el destino Cloud y no se acredita persistencia de cuenta ni aprobación clínica. No se certificaron Safari físico ni Firefox/WebKit en esta entrega; la comprobación de teclado fue en Chrome. El cierre de ANI-64 no cierra las brechas globales VIS-01–12 ni ANI-50/53/66/98.
