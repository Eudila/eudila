# Login · 26/10/2026

Rutas reales de Next.js en build de producción, preview activo y sin variables de autenticación. Chrome headless con Playwright. El aviso de acceso sin configurar y Google deshabilitado en las capturas corresponden a este entorno.

Se mantienen el lienzo Lisa, la mascota estática del header, Figtree y los tokens de acción coral. Se priorizan email/contraseña, se agrupa recuperación con contraseña y se alinean las cápsulas principal, Google y cambio de ingreso/alta. «Mostrar» comparte el contorno del campo. Los estilos nuevos se limitan a `auth-access`.

- [Ingreso móvil, 390 × 1000](ingresar-390.png).
- [Ingreso escritorio, 1440 × 1000](ingresar-1440.png).
- [Ingreso con enlace inválido, 320 px y texto al 200 %](ingresar-320-200.png).
- [Mediciones de los 36 casos](mediciones.json).

## Verificación

Build, lint y tipos pasan. Comprobación de navegador sobre `/ingresar`, `/crear-cuenta` y `/recuperar`, a 320, 390 y 1440 px; texto al 100 % y 200 %; movimiento normal y reducido: sin desborde horizontal, cápsulas alineadas de al menos 50 px y objetivos de al menos 44 px. Sin errores de JavaScript.

También se comprobaron foco/orden con teclado, validación de email y contraseña, longitud mínima de alta, mostrar/ocultar contraseña, navegación a recuperación/alta, aviso de enlace inválido y Google deshabilitado. La regresión existente `app/design-actions.test.py` pasa: siete pares AA, hover/focus/active/disabled, teclado, loading y 54 casos de reflujo.

```sh
NEXT_PUBLIC_FRONTEND_PREVIEW=true npm run build
npm run start -- --hostname 127.0.0.1 --port 3126
npm run lint
npm run typecheck
npx prettier --check app/auth/auth-form.tsx app/auth/auth.css
ACTIONS_BASE_URL=http://127.0.0.1:3126 uv run --with playwright --with pillow python app/design-actions.test.py
```

La comprobación visual adicional se ejecutó con un script temporal de Playwright; sus mediciones quedan adjuntas. No se modificó la lógica de autenticación ni se comprobó ingreso real, envío de correo, Google OAuth, actualización de contraseña autenticada, Safari, Firefox o hardware móvil.

## Refinamiento de íconos · 26/10/2026

Se reemplazó el texto visible «Mostrar/Ocultar» por ojo/ojo tachado del componente `Icon` compartido. El botón conserva nombre accesible, `aria-pressed`, foco y tooltip; las acciones principales, recuperación y etiquetas mantienen texto para evitar ambigüedad. [Captura actual del login](iconos-390.png).

Verificado en Next.js de desarrollo: 12 casos sobre ingreso y alta a 320/390/1440 px, texto al 100/200 %, control con teclado, cambio de ícono/tipo de campo/nombre accesible, foco visible y objetivos de al menos 44 px. Sin errores JS. Lint, tipos y formato pasan. No se repitió el build de producción ni autenticación real para este cambio de ícono.

Como comprobación adicional se abrió `/bienvenida`: su canvas de mascota produce 6 px de desborde interno a 320 px y texto al 200 %. Persiste al quitar todas las reglas nuevas de `auth-access`, por lo que corresponde a la composición previa de bienvenida y queda fuera del ajuste del login.
