# ANI-48 · Plan de implementación del scaffold

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dejar la base Next.js de Eudila instalable, ejecutable y verificable con los comandos documentados, y cerrar ANI-48 con evidencia.

**Architecture:** Una app con App Router en `app/`, sin carpetas vacías ni capas adicionales. El layout declara español, metadata y Figtree mediante `next/font/local`, reutilizando el archivo y la licencia existentes. El prototipo permanece independiente y conserva sus pruebas; el scaffold no adelanta el layout global de ANI-61 ni las integraciones de datos.

**Tech Stack:** Next.js 16, React 19, TypeScript estricto, Tailwind CSS 4/PostCSS, ESLint 9 con las reglas oficiales de Next y Prettier. Node 22.13+ en la rama 22, o 24+.

## Decisiones y alcance

- ANI-48 está en Backlog, sin dependencias pendientes y asignada a Joaco. Se toma como la próxima tarea de base porque desbloquea la integración de ANI-64 y ANI-67. Se conserva su asignación.
- Base de trabajo: `origin/main` en `ceef736`, que incluye el contenido de landing de ANI-75. Rama `ani-48-scaffold`, worktree externo al repositorio del usuario.
- Se prefiere instalación manual mínima a generar el template completo o portar el prototipo: evita assets genéricos y cubre exactamente el issue.
- Inicio estático con el wordmark, pregunta y descripción existentes; Nube `#FBFBFD`, Grafito `#1D1D1F`, Figtree en títulos y fuente del sistema en texto. No se inventan textos clínicos ni acciones que todavía no funcionan.
- El pedido del usuario incluye planificar y ejecutar hasta Done; las decisiones de implementación se resuelven dentro de ese alcance sin un paso adicional de aprobación del diseño.

## 1. Preparar la base

**Archivos:** `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `postcss.config.mjs`, `.gitignore`.

1. Declarar las dependencias necesarias y los scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format` y `format:check`.
2. Fijar Next/React y registrar el árbol instalado en `package-lock.json`; declarar el mínimo de Node compatible con las herramientas.
3. Configurar TypeScript con `strict: true`, `noEmit`, plugin de Next y alias `@/*`; incluir los tipos generados en desarrollo/producción.
4. Activar únicamente `@tailwindcss/postcss`; importar Tailwind desde el CSS global.
5. Ignorar `.next/`, `out/`, `*.tsbuildinfo` y `next-env.d.ts` además de los archivos ya ignorados.

**Comprobación:** `npm install`, sin errores de resolución. El lockfile permite repetir con `npm ci`.

## 2. Layout e inicio

**Archivos:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.

1. Layout raíz con `<html lang="es">`, título `eudila` y descripción tomada del prototipo.
2. Cargar `prototype/fonts/Figtree.ttf` con `next/font/local`, rango variable 300–900 y `display: swap`; mantener la fuente del sistema para el cuerpo.
3. Inicio semántico estático: cabecera con wordmark y `main` con la pregunta y descripción existentes. Usar clases Tailwind reales para comprobar que la integración produce CSS.
4. Mantener legibilidad y reflujo a 320 y 390 px; respetar la presentación sin añadir animaciones.

**Comprobación:** `npm run dev -- --hostname 127.0.0.1 --port 3048`; HTTP 200, idioma y metadata correctos, fuente local servida y CSS de Tailwind aplicado. Revisar en navegador y comprobar que no hay errores ni desborde horizontal.

## 3. Herramientas y documentación

**Archivos:** `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `README.md`, `NOTICE.md`; `AGENTS.md` y `CLAUDE.md` generados por Next.js y conservados según las indicaciones del framework.

1. Compartir las reglas oficiales `core-web-vitals` y TypeScript en una configuración ESLint plana; agregar `eslint-config-prettier` para evitar reglas en conflicto.
2. Excluir artefactos generados y el prototipo independiente del lint del scaffold. Prettier también preserva el prototipo y los documentos existentes.
3. README: requisitos, clonación, `cd`, `npm ci`, `npm run dev`, URL, producción y controles de calidad. Documentar cada carpeta existente y ubicar futuras rutas dentro de `app/` cuando se implementen.
4. Aclarar qué está operativo en Next y cómo ejecutar el prototipo independiente. Registrar las licencias de las nuevas dependencias directas en NOTICE.

**Comprobación:** `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` y `node --test prototype/flow-state.test.mjs`, todos con salida 0. Ejecutar también la comprobación existente de splash.

## 4. Verificar instalación limpia y cerrar

1. Crear un checkout temporal del resultado sin `node_modules`, `.next` ni variables de entorno locales. Seguir los comandos del README: `npm ci`, lint, build y arranque de producción.
2. Comparar `prototype/` con la base: ningún cambio; registrar versiones, comandos, resultados y commit en este documento.
3. Integrar el cambio verificado en `main`, publicar en `Eudila/eudila` y comprobar el SHA remoto.
4. Adjuntar evidencia en la descripción de ANI-48 y marcar Done solo cuando se satisfagan los criterios originales. No se altera el estado de las tareas dependientes.

## Fuentes técnicas

- [Instalación oficial de Next.js](https://nextjs.org/docs/app/getting-started/installation).
- [Configuración oficial de ESLint y Prettier](https://nextjs.org/docs/app/api-reference/config/eslint).
- [Fuentes locales en Next.js](https://nextjs.org/docs/app/getting-started/fonts).
- [Tailwind CSS con Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

## Evidencia de ejecución

- Base comprobada antes de cambios: `node --test prototype/flow-state.test.mjs`, 1/1 correcto.
- Entorno de desarrollo: macOS, Node 26.8.1, npm 11.19.0. Next 16.3.8, React/React DOM 19.3.0, Tailwind 4.3.3, TypeScript 5.9.3, Prettier 3.9.9; las licencias de todas las dependencias directas se comprobaron contra sus `package.json` instalados.
- `npm run lint`, `npm run typecheck`, `npm run format:check` y `npm run build`: salida 0. `npm ls eslint`: salida 0, sin dependencias inválidas tras fijar ESLint 9.
- `npm run dev -- --hostname 127.0.0.1 --port 3048`: arranque correcto, HTTP 200. Chrome comprobó idioma `es`, título y descripción, Figtree servida desde el origen local, utilidades reales de Tailwind y los colores Nube/Grafito. Ocho combinaciones de 320, 390, 520 y 1280 px con texto al 100 % y 200 %: sin desborde horizontal ni errores JS.
- `uv run --with playwright python prototype/splash.test.py`: entrada, salto, sesión, navegación, movimiento reducido y reflujo correctos. `prototype/` no tiene cambios respecto de la base.
- Pendiente para el cierre: revisión independiente, instalación/build en checkout limpio con Node 22, arranque de producción y verificación del commit publicado.

**Compatibilidad del lint:** ESLint 10.11.0 produce dependencias inválidas (`npm ls eslint`) y falla con `contextOrFilename.getFilename is not a function` en `eslint-plugin-react` del preset oficial de Next 16.3.8. Se fija ESLint 9.39.5, compatible con los plugins de React, importaciones y accesibilidad. npm avisa que la rama 9 ya no tiene soporte; actualizar cuando el preset oficial y todos sus plugins admitan ESLint 10, sin forzar sus peer dependencies ni omitir reglas.
