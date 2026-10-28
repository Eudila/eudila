# Registros de cuenta · 27/10/2026

La confirmación real de Next.js ofrece «Guardar registro» cuando hay una cuenta autenticada. Solo anuncia «Guardamos tu registro.» después de confirmar la escritura y recuperar la fila de Supabase. Conserva borrador e ID del intento ante errores; los estados de error permiten reintentar. Hoy, Calendario, Evolución, Factores y Exportar leen la cuenta; ejemplos y almacenamiento temporal siguen exclusivos del preview.

La prueba `app/historial/account.test.py` toma capturas de `/registro/confirmacion`, `/hoy` y `/exportar` en el build de producción conectado a Supabase Docker local, con cuentas sintéticas. Comprueba reflujo a 320/390 px con texto al 200% y acceso a Ayuda. Las capturas usan movimiento reducido.

No cambia tokens, geometría, color, tipografía, composición ni reglas de la mascota. El gesto Guardado existente representa la confirmación del registro en cualquier ánimo. No se cierra ninguna brecha visual con esta integración.

La evidencia local no certifica despliegue VPS ni la configuración OAuth Google remota. Ver el [plan](../../../plans/2026-10-27-registros-cuenta.md) para pruebas y límites.

**Verificación de producción, 27/10/2026:** se desplegó y probó el recorrido real en <https://app.eudila.com> con dos cuentas sintéticas. Guardado, recarga, otro navegador, calendario, análisis y exportación aprobados, con aislamiento por cuenta. Se eliminaron las cuentas de prueba al terminar. [Versión, respaldo y registro operativo](../../../ops/vps-eudila.md). Google continúa habilitado; no se automatizó un consentimiento OAuth personal.
