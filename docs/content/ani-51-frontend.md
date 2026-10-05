# Autenticación · entrega de frontend

Abrir `/ingresar` desde «Ingresar o crear cuenta» en el inicio. `/crear-cuenta` contiene alta con los mismos dos campos; `/cuenta` muestra ausencia de sesión y el cierre preparado, deshabilitado.

El acceso todavía no está conectado. Los formularios validan email y contraseña requerida, permiten mostrar/ocultar y no envían solicitudes de autenticación. Al enviar datos válidos limpian la contraseña y anuncian que no hubo ingreso ni alta. No hay cuentas locales, tokens, cookies, middleware ni persistencia de credenciales. La vista previa conserva su funcionamiento anterior.

Para integrar, reemplazar el resultado local de `submit` en `app/auth/auth-form.tsx` por el cliente acordado, implementar estados de carga/error/éxito y habilitar cierre únicamente con sesión real. La política de contraseña y confirmación de correo pertenecen a esa integración. Los gestores de contraseña pueden autocompletar mediante `email`, `current-password` y `new-password`.

Verificación en navegador: iniciar la app en el puerto 3100 y ejecutar `uv run --with playwright python app/auth/browser.test.py`; para otro origen, usar `AUTH_BASE_URL`. El test utiliza Chrome instalado en macOS. Comprobar además `npm run lint`, `npm run typecheck`, `npm run format:check` y `npm run build`.
