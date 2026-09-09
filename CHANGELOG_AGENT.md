# CHANGELOG_AGENT

> Registro de sesiones para agentes. **Una fila por sesión, siempre arriba.** Nunca editar filas antiguas.
> Fecha en UTC. `-` = no aplica. Máximo una línea por sesión: si necesitas más, va en `CONTINUAR.md`.

| Fecha UTC | Agente | IDs | Cambios | Commit | Tests | Deploy | Incidencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-09 07:20 | Claude Code | BUG-005..010 | Caza de defectos: arranque a prueba de saves rotos, mob dorado, HUD, teclado, viaje y candado | (pendiente) | npm test 39/39 · nueva suite robustness | Sí ecos-v21 | Ninguna |
| 2026-09-08 21:40 | sesión Claude Code | BUG-004 | ecos-v20: el combate medía en vh dentro de un layout dvh y recortaba la fila de zona en iOS; moneda con glifo real | 21ed28d | check + 34 comprobaciones | Sí ecos-v20 | Confirmado en el iPhone que lo reportó; el CI ya lo mide a 393x759 |
| 2026-09-08 20:55 | sesión Claude Code | TECH-004, FEAT-008, FEAT-009, FEAT-010, FEAT-011, BUG-002, BUG-003 | ecos-v19: cuenta admin oculta del ranking, puesto propio, cambio de PIN, candado de objetos, progreso de desbloqueo y arreglos de iOS | 47008ea | check + 33 comprobaciones + CI de navegador ampliado + pruebas SQL en el backend real | Sí ecos-v19 | Pinch bloqueado a coste de accesibilidad; falta iPhone físico |
| 2026-09-08 18:45 | sesión Claude Code | FEAT-007 | Handoff al día: FEAT-007 publicada en ecos-v18 y cerrada como Verificado | a412a9d | check + 8 suites + CI run #25 (Chromium/WebKit) | Sí ecos-v18 (a412a9d) | Sin tags ecos-v* en el remoto; Pages no accesible por HTTP |
| 2026-09-08 12:20 | sesión Claude Code | TECH-002 | QA de PWA en CI: manifest, service worker y juego sin red (PR #14) | d3c7371 | check + 8 suites + PWA local en Chromium | No | Ninguna |
| 2026-09-08 11:45 | sesión Claude Code | BUG-001, FEAT-003, TECH-001 | Arreglo cabecera 320px (ecos-v17), balance medido sin cambios, scan de secretos | 1b1bb4a | check + 8 suites + QA A/B 320/360/390 | Sí ecos-v17 (0744a6e) | Ninguna |
| 2026-09-08 10:05 | sesión Claude Code | FEAT-003 | Simulador de progresión: mide muros y rutas sin tocar balance | 1451599 | check OK + 8 suites | No | Ninguna |
| 2026-09-08 09:25 | sesión Claude Code | TECH-005, TECH-006, TECH-007 | Protocolo de continuidad integrado en main (PR #11) | 3590d31 | CI verde: check + 8 suites + Chromium/WebKit | No | Ninguna |
| 2026-09-08 00:15 | sesión Claude Code | TECH-006, TECH-007 | Preflight/check, reglas de agente, suite de inventario | 4afb8ed | check OK + 8 suites | No | Push de tags rechazado por el proxy |
| 2026-09-07 23:50 | Claude Code / Opus 5 | TECH-005 | Arquitectura de continuidad: IDs, CHANGELOG_AGENT, handoff estricto, histórico archivado | 030084b | - (solo docs) | No | Ninguna |
| 2026-09-07 23:34 | ChatGPT Business | FEAT-001..006 | Publicación ecos-v16 + fix regresión CSS de arena móvil | fc9dc5c | npm test 7/7 · QA visual 36/36 (320/390/430) | Sí ecos-v16 | Sin verificar en Safari/iPhone real |

## Cómo añadir tu fila

Copia y rellena, insertándola **justo debajo de la cabecera**:

```
| <YYYY-MM-DD HH:MM> | <agente/modelo> | <IDs> | <cambios en ≤12 palabras> | <sha> | <tests o "-"> | <Sí vNN / No> | <incidencia o "Ninguna"> |
```

Obligatorio antes de terminar una sesión, junto con `CONTINUAR.md`.
