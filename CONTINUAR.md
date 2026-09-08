# CONTINUAR · handoff activo

**Actualizado:** 2026-09-08 · **Agente:** ChatGPT Work

## 1. Estado / versión

**ecos-v18** preparada en `feat/equipment-fusion`: FEAT-007 (roadmap #4).
Todavía no publicada; producción verificada en ecos-v17 al arrancar esta sesión.

## 2. Último commit estable

`346fea2` (main), ecos-v17. HTML público y sw.js comprobados por HTTP.
Rollback de la próxima publicación: revertir el merge de FEAT-007, recuperando ecos-v17.

## 3. IDs terminados

TECH-005, TECH-006 y TECH-007 siguen Hecho. FEAT-003..006 siguen Verificado.
FEAT-007 implementado: base + 2 materiales del mismo hueco/rareza + oro, hasta Mítico;
conserva nivel/bonos/pasiva, selección explícita, confirmación y aspecto por rareza.

## 4. IDs en curso

- FEAT-007: ocho suites Node pasan; falta CI visual y publicación.
- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.

## 5. Bugs conocidos

Ninguno nuevo acreditado. BUG-001 sigue corregido desde ecos-v17.

## 6. Próxima acción exacta

1. Terminar CI de FEAT-007 (Chromium/WebKit, 320/390/430/1280) y revisar capturas.
2. Fusionar PR, verificar HTML público + sw.js ecos-v18 y actualizar este handoff.
3. Validar iPhone y dos sesiones reales. TECH-003 sigue siendo la prioridad de backend.
4. Reconciliar cierres #24/#35/#37/#38 y #4 en el Excel original de Drive cuando sea posible.

## 7. Tests / verificaciones

`npm test`: ocho suites OK. Fusión: cuatro ascensos, límite Mítico, doble ejecución,
materiales incompatibles/equipados, oro insuficiente, cuota local, cambio de sesión,
partida reemplazada, conflicto cloud, IDs duplicados y mochila llena. Persistencia comprobada.
CI ampliado para probar selección, cancelar, confirmar, ascenso, persistencia y solapes.
Pendiente ejecutar CI. Navegador remoto: ERR_BLOCKED_BY_CLIENT en localhost:4173.
No acreditado: iPhone físico ni dos sesiones reales simultáneas.

## 8. Deploy actual

Producción ecos-v17. ecos-v18 aún NO desplegada en esta sesión.

## 9. Archivos relevantes

`index.html`, `sw.js`, `tests/inventory.cjs`, `tests/browser.cjs`, documentos de continuidad.

## 10. Bloqueos reales

Primer push rechazado por revisión automática por destino no verificado; comprobado después
que la conexión es BlavionTeam, admin del repo, y que origin coincide con el proyecto autorizado.
GitHub informa visibilidad pública; no se ha cambiado. Acceso HTTP a Pages sí funciona aquí.
Roadmap original de Drive leído (#4); no modificado. El cierre debe conservar su ID original.
