# Onboarding y autenticación

**Objetivo:** completar bienvenida, alta con email, confirmación, ingreso con email/Google, recuperación, introducción a la app y cierre de sesión; probar contra Supabase local en Docker.

**Arquitectura:** Supabase Auth como único emisor de sesiones, cliente SSR con cookies y validación en servidor. Google usa OAuth con PKCE. Perfil mínimo con nombre opcional y fecha de onboarding, aislado por RLS. Preview conserva su recorrido explícito; la cuenta real no promete persistencia de registros todavía no implementada.

**Stack:** Next.js 16 instalado, React, SDK oficial Supabase y CLI local, PostgreSQL/Auth/Inbucket en Docker, Playwright existente para pruebas.

## Decisión

Se recomienda Supabase email + Google por permitir pruebas locales y evitar dos sistemas de identidad. Se consultó preferencia por Clerk sin bloquear la preparación independiente. Se ejecuta el alcance autorizado por el pedido del usuario. No se agregan cuestionarios de salud, suscripciones ni onboarding obligatorio de datos sensibles.

## Trabajo y alcance

1. Agregar clientes Supabase, renovación de cookies, callback y comprobación de sesión. Revisar Next.js local y documentación oficial de Supabase. Proteger cuenta y onboarding en servidor; RLS protege perfiles independientemente de la UI.
2. Conectar `app/auth/auth-form.tsx`, ingresar y crear cuenta. Agregar confirmación con reenvío, recuperación/cambio de contraseña y errores recuperables. Mantener validación, foco, objetivos táctiles, loading y Ayuda.
3. Agregar bienvenida/introducción y nombre opcional; persistir finalización en perfiles. Conectar inicio y cuenta, logout real y limpieza de borrador al cambiar de identidad.
4. Crear configuración local reproducible, migración de perfiles/catálogos y semillas desde los UUID existentes. Correos de prueba capturados localmente. Nunca versionar secretos.
5. Verificar alta/confirmación/ingreso/recarga/logout/recovery, enlaces vencidos, RLS entre usuarios, preview y reflujo/teclado en Next.js real. Google requiere credenciales externas; distinguir integración de prueba real.
6. Ejecutar lint, tipos, suites Node y build. Actualizar README, PRODUCT, DESIGN y evidencia de marca con resultados concretos.

## Riesgos a comprobar

Cookies y callbacks no deben permitir redirecciones externas; acciones de perfil verifican identidad y validan entrada; ningún service-role llega al cliente. Confirmación y recuperación usan enlaces de un solo uso. Logout no debe dejar datos personales de la cuenta anterior. Ayuda permanece pública incluso con Auth caído.

## Referencias

- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/local-development/customizing-email-templates
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- PRODUCT.md, DESIGN.md y revisión de marca del 04/10.

## Entrega y verificación

Implementados los seis grupos del alcance. Supabase local encendido, migración/semillas aplicadas y `.env.local` configurado con claves públicas. Prueba real de email/perfiles/RLS completa en desarrollo y build de producción; 31 pruebas Node, lint/tipos/formato/build y regresiones de preview/acciones pasan. [Capturas y evidencia detallada](../design/evidence/auth-onboarding-2026-10-19/README.md).

Google se integra con Supabase OAuth/PKCE y exige credenciales propias para habilitar y verificar el proveedor real. No se realizó despliegue ni se extendió el guardado de registros emocionales, que permanece explícitamente pendiente en la UI.
