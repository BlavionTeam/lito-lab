# CONTINUAR · handoff activo

**Actualizado:** 2026-09-09 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v22**: FEAT-012..017, las seis mejoras aprobadas por el propietario en la misma
sesión que ecos-v21 (BUG-005..010, robustez del arranque y del bucle de juego).
FEAT-012 es la única que toca economía y fue una aprobación explícita: cumple la promesa
de renta hasta 8 h que el juego ya hacía y solo pagaba al recargar.
`sw.js` sirve `ecos-v22`.

## 2. Último commit estable

`e8befb7` (main) es ecos-v21, publicada por el PR #20 con el CI en verde.
Rollback de ecos-v22: revertir el merge que la publique, volviendo a ecos-v21.
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005..007 siguen Hecho. FEAT-003..007 siguen Verificado.
Nuevos en ecos-v19: TECH-004, FEAT-008, FEAT-009, FEAT-010, FEAT-011, BUG-002, BUG-003.
Nuevo en ecos-v20: BUG-004, ya confirmado en un iPhone real.
Nuevos en ecos-v21: BUG-005, BUG-006, BUG-007, BUG-008, BUG-009, BUG-010.
Nuevos en ecos-v22: FEAT-012, FEAT-013, FEAT-014, FEAT-015, FEAT-016, FEAT-017.

## 4. IDs en curso

- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.

## 5. Bugs conocidos

Ninguno abierto. BUG-002 (selección/zoom en iOS) sigue sin confirmación explícita
en Safari real: es lo único que ni Chromium ni WebKit bajo Playwright pueden acreditar.
De ecos-v21 falta la parte que solo se ve en un dispositivo: que el mob dorado ya no
se pierda al volver de una pestaña (BUG-006) y la mejora de fluidez del HUD (BUG-007).
De ecos-v22 falta lo mismo: el selector de actos del mapa (FEAT-015) a 320 px y que la
renta al volver de segundo plano (FEAT-012) dispare de verdad en la PWA de iOS.

## 6. Próxima acción exacta

1. Confirmar en un iPhone físico BUG-002 (que no salga «Copiar / Traducir» al
   mantener el dedo sobre el texto de un panel y que el pellizco no haga zoom) y,
   de paso, BUG-006/007 de ecos-v21: el mob dorado ya no aparece mientras estás en
   Campamento, y el combate va más fino. Es lo que Playwright no puede acreditar.
2. TECH-003 (ranking validado en backend): el trigger sigue confiando en el `save`
   del cliente, así que la puntuación del ranking es falsificable desde el navegador.
   Es el agujero más serio que queda abierto y está propuesto al propietario.
3. Dos sesiones reales simultáneas (FEAT-001).
4. Reconciliar cierres #24/#35/#37/#38, #4 y #29 en el Excel original de Drive.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con 45 comprobaciones en verde. Dos suites nuevas:
`tests/robustness.cjs` (arranque con partida corrupta, saneado de partidas imposibles,
mob dorado con la arena oculta, viaje de zona guardado y recuento del candado) y
`tests/improvements.cjs` (renta al volver sin doble cobro, lotes parciales sin pasar del
tope, mochila llena que sacrifica lo peor, mapa por actos, escapado del ranking y
guardado inmediato al gastar).
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

ecos-v21 publicada por merge a `main` (`e8befb7`, PR #20). ecos-v22 sale de la rama
`claude/game-bug-fixes-deploy-6fyu98` y se publica por merge a `main`. Pages sirve la raíz.
Sin comprobación HTTP del sitio publicado: esta sesión no tiene salida de red hacia Pages.

## 9. Archivos relevantes

`index.html`, `sw.js`, `migration-v5.sql`, `tests/robustness.cjs`, `tests/improvements.cjs`,
`tests/inventory.cjs`, `tests/tap-input.cjs`, `tests/browser.cjs`, documentos de continuidad.

## 10. Bloqueos reales

Sin salida HTTP hacia GitHub Pages ni hacia Supabase desde esta sesión (proxy 403):
el backend se administró por MCP y el cliente se probó con la red simulada.
El remoto no tiene ningún tag `ecos-v*`. Se reintentó empujar `ecos-v21` cuatro veces
con espera creciente y el proxy cortó la conexión cada vez, igual que en sesiones
anteriores: la regla 3 de `AGENTS.md` sigue sin cumplirse para v16..v22 y hace
falta una sesión con permiso real de push de tags.
Bloquear el pellizco (BUG-002) tiene un coste de accesibilidad conocido: quien
necesite ampliar ya no puede hacerlo con los dedos. Fue una petición explícita.
El PIN de la cuenta admin no está en el repositorio y no debe escribirse aquí.
