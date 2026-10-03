# Clonado en máquina limpia · ANI-78

## Prueba técnica · 03/10/2026

Repositorio público `https://github.com/Eudila/eudila.git`, commit `9b1f5332862b093f09981f83481ef14cd2ba0063`. Se clonó en una carpeta temporal nueva, sin `.env`, `node_modules` ni build heredados. Equipo de trabajo actual, macOS, Node 26.8.1; **no es una persona externa ni otra máquina**.

Se ejecutaron los comandos del README: `git clone`, `cd`, `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`. Instalación: 3 s según npm; servidor listo: 235 ms según Next. No se cronometró el recorrido humano y no se presenta como criterio de menos de 15 minutos.

HTTP 200 en `/registro/animo`; comprobación con Chrome del inicio visible y Ayuda con enlace `tel:135`. Lint, tipos, formato y build terminaron con exit 0. No hicieron falta credenciales ni base para el scaffold, tal como dice README.

Tropiezos del agente: primero se lanzó `npm ci` desde el directorio padre por omitir `cd`; falló y se corrigió. Es un error de ejecución del agente: el README incluye `cd eudila`. No se atribuye al documento.

Observaciones de instalación: npm informa deprecación de ESLint 9 y cinco entradas de severidad alta que corresponden a una sola cadena de dependencia de desarrollo (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`, GHSA-vfj7-8cjw-p6xm). El fix automático propone bajar la configuración Next a 14; no se aplicó ese cambio incompatible. La instalación y los checks funcionaron. No se afirma que esta prueba certifique seguridad o producción.

## Prueba externa pendiente

Dar a una persona ajena al setup únicamente la URL del repo y pedir que siga el README. Usar una máquina donde nunca haya corrido el proyecto. Empezar el cronómetro antes de clonar; no asistir por mensajes. Registrar cada tropiezo, corregir README o código según corresponda y repetir desde limpio.

| Dato | Resultado a completar |
| --- | --- |
| Persona / fecha / máquina / SO / versión Node | Pendiente |
| SHA clonado | Pendiente |
| Inicio del cronómetro | Pendiente |
| App visible y operable / fin del cronómetro | Pendiente |
| Total menor de 15 minutos | Pendiente |
| Ayuda abre desde registro | Pendiente |
| Tropiezos textuales y tiempo perdido | Pendiente |
| Cambios aplicados y repetición desde cero | Pendiente |

ANI-78 conserva su criterio original: la prueba automatizada anterior no sustituye a esa persona ni permite marcar Done.
