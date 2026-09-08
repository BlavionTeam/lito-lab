# CONTINUAR · handoff activo

**Actualizado:** 2026-09-08 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v19** en preparación: TECH-004 (cuenta admin) y FEAT-008..011.
`sw.js` sirve `ecos-v19`. La versión publicada hasta este merge es ecos-v18 (FEAT-007).

## 2. Último commit estable

`a412a9d` (main), ecos-v18, CI verde (run #25: check + 8 suites + Chromium/WebKit).
Rollback: revertir ese merge, recuperando `346fea2` (ecos-v17).
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005, TECH-006 y TECH-007 siguen Hecho. FEAT-003..006 siguen Verificado.
FEAT-007 verificado y publicado: base + 2 materiales del mismo hueco/rareza + oro, hasta Mítico;
conserva nivel/bonos/pasiva, selección explícita, confirmación y aspecto por rareza.
Solo le falta el cierre de la fila #4 en el roadmap de Drive.

## 4. IDs en curso

- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.

## 5. Bugs conocidos

Ninguno nuevo acreditado. BUG-001 sigue corregido desde ecos-v17.

## 6. Próxima acción exacta

1. TECH-003 (ranking validado en backend) es la prioridad: el trigger aún confía en el `save` del cliente.
2. Validar iPhone físico (TECH-002/FEAT-002) y dos sesiones reales simultáneas (FEAT-001).
3. Comprobar por HTTP el HTML público y `sw.js` de ecos-v18 desde un entorno con salida a Pages.
4. Reconciliar cierres #24/#35/#37/#38 y #4 en el Excel original de Drive cuando sea posible.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con las ocho suites en verde sobre `main`.
CI de `main` en `a412a9d` (run #25) verde: continuity check, las ocho suites y el job
`mobile-browser` con Chromium y WebKit a 320/390/430 px. Fusión cubierta por regresión:
cuatro ascensos, límite Mítico, doble ejecución, materiales incompatibles/equipados,
oro insuficiente, cuota local, cambio de sesión, conflicto cloud, IDs duplicados y mochila llena.
No acreditado: iPhone físico, dos sesiones reales simultáneas y la comprobación HTTP del
sitio publicado (esta sesión no tiene salida de red hacia Pages).

## 8. Deploy actual

Producción ecos-v18 por merge a `main` (Pages sirve la raíz). Publicación no comprobada
por HTTP en esta sesión; la evidencia disponible es el CI verde sobre el commit publicado.

## 9. Archivos relevantes

`index.html`, `sw.js`, `tests/inventory.cjs`, `tests/browser.cjs`, documentos de continuidad.

## 10. Bloqueos reales

Sin salida HTTP hacia GitHub Pages desde esta sesión (proxy responde 403), así que la
verificación del sitio público queda pendiente para un entorno con red.
El remoto no tiene ningún tag `ecos-v*`: los pushes de tags se rechazaron en sesiones
anteriores, y la regla 3 de `AGENTS.md` no está cumplida para v16/v17/v18.
Roadmap original de Drive leído (#4); no modificado. El cierre debe conservar su ID original.
