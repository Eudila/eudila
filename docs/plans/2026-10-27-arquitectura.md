# Arquitectura por aplicaciones y paquetes

**Objetivo:** aplicar la organización del HTML «Panel del psicólogo» proporcionado por el usuario sin alterar el comportamiento existente.
**Arquitectura:** npm workspaces; apps consumen paquetes compartidos, nunca al revés. Next.js conserva URL mediante grupos de rutas. Supabase queda en la raíz e infraestructura en infra/.
**Stack:** Next.js 16, React, TypeScript, Tailwind, npm, Supabase.

1. Mover Next.js a apps/web y landing a apps/landing; actualizar imports, configuración, grupos (paciente)/(auth), pruebas y workspaces.
2. Extraer domain (borrador, registros, análisis, export), mood (motor, componentes y geometría) y brand (tokens y assets). Archivar prototype en docs/historia.
3. Adaptar build estático, standalone Docker, scripts locales y CI al monorepo. Un lockfile. Conservar datos, sesiones y contratos públicos.
4. Documentar arquitectura y decisiones; distinguir explícitamente propuestas del panel de funciones implementadas. No crear API, tabla o pantalla ficticia.
5. Verificar lint, tipos, suites Node, formato, build de ambas apps, recorrido de navegador y standalone. Registrar límites reales.

Alternativas descartadas: solo mover carpetas dejaría dependencias de producción en el prototipo; sumar Turborepo no aporta valor a estas dos apps.
