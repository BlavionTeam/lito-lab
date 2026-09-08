# CONTINUAR · handoff activo

**Actualizado:** 2026-09-08 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v20**: BUG-004, el recorte de la fila de zona en iPhone y el icono del oro.
La versión anterior, ecos-v19, trajo TECH-004 y FEAT-008..011 más BUG-002/003.
`sw.js` sirve `ecos-v20`.

## 2. Último commit estable

`47008ea` (main), ecos-v19 publicada por el PR #16 con el CI en verde.
Rollback: revertir ese merge, recuperando `a412a9d` (ecos-v18).
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005..007 siguen Hecho. FEAT-003..007 siguen Verificado.
Nuevos en ecos-v19: TECH-004, FEAT-008, FEAT-009, FEAT-010, FEAT-011, BUG-002, BUG-003.

## 4. IDs en curso

- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.

## 5. Bugs conocidos

Ninguno abierto. BUG-002 (selección/zoom en iOS) y BUG-003 (navegación de zona)
quedan corregidos en ecos-v19, pendientes de confirmar en un iPhone real.

## 6. Próxima acción exacta

1. Confirmar BUG-002 en un iPhone físico: que no salga «Copiar / Traducir» al
   mantener el dedo sobre el texto de un panel y que el pellizco no haga zoom.
   Es la única parte que ni Chromium ni WebKit bajo Playwright pueden acreditar.
2. TECH-003 (ranking validado en backend): el trigger sigue confiando en el `save`
   del cliente, así que la puntuación del ranking es falsificable desde el navegador.
3. Dos sesiones reales simultáneas (FEAT-001).
4. Reconciliar cierres #24/#35/#37/#38, #4 y #29 en el Excel original de Drive.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con 33 comprobaciones en verde.
CI de navegador ampliado: candado, barra de desbloqueo, texto no seleccionable,
campos aún escribibles, viaje de zona (guardado, refresco y 44 px de área táctil)
y el flujo completo de cuenta (distintivo admin, puesto propio, cambio de PIN y
limpieza al cerrar sesión) con el backend simulado por red, sin tocar producción.
Backend verificado por SQL en el proyecto real: la vista `ranking` excluye a los
admin, `my_rank()` devuelve 3 de 4 para un jugador y nulo para un admin, y un
jugador autenticado **no** puede ponerse `is_admin` (prueba negativa).
No acreditado: iPhone físico, dos sesiones reales simultáneas, y la comprobación
HTTP del sitio publicado (esta sesión no tiene salida de red hacia Pages).

## 8. Deploy actual

ecos-v19 publicada por merge a `main` (`47008ea`, PR #16). Pages sirve la raíz.

## 9. Archivos relevantes

`index.html`, `sw.js`, `migration-v5.sql`, `tests/inventory.cjs`, `tests/tap-input.cjs`,
`tests/browser.cjs`, documentos de continuidad.

## 10. Bloqueos reales

Sin salida HTTP hacia GitHub Pages ni hacia Supabase desde esta sesión (proxy 403):
el backend se administró por MCP y el cliente se probó con la red simulada.
El remoto no tiene ningún tag `ecos-v*`. Se reintentó publicar `ecos-v19` en esta
sesión y el proxy devolvió 403 al empujar la etiqueta, igual que en sesiones
anteriores: la regla 3 de `AGENTS.md` sigue sin cumplirse para v16..v19 y hace
falta una sesión con permiso real de push de tags.
Bloquear el pellizco (BUG-002) tiene un coste de accesibilidad conocido: quien
necesite ampliar ya no puede hacerlo con los dedos. Fue una petición explícita.
El PIN de la cuenta admin no está en el repositorio y no debe escribirse aquí.
