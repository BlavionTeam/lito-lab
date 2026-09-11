# CHANGELOG_AGENT

> Registro de sesiones para agentes. **Una fila por sesión, siempre arriba.** Nunca editar filas antiguas.
> Fecha en UTC. `-` = no aplica. Máximo una línea por sesión: si necesitas más, va en `CONTINUAR.md`.

| Fecha UTC | Agente | IDs | Cambios | Commit | Tests | Deploy | Incidencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-11 14:10 | Claude Code | BUG-013, FEAT-030 | ecos-v30: restos del enemigo sin partirse contra el borde, perfil y habilidades en tarjetas distintas, botón de mapa visible y progreso de zona como barra | (este commit) | npm test 69/69 · CI de navegador en Chromium 320/390/430/1280 + PWA · alto del combate medido a siete alturas contra la versión publicada | Sí ecos-v30 | El layout del móvil se ataba al número de hijo del panel: separar el perfil destapó «Equipado» y costó 100 px de arena |
| 2026-09-11 13:45 | Claude Code | FEAT-029 | ecos-v29: sellos del perfil redondos y por rareza, uno por jefe final de acto en vez de uno por zona, con los que faltan en sombra y su progreso; cruz de salida en los diez diálogos | (este commit) | npm test 67/67 · CI de navegador en Chromium 320/390/430/1280 + PWA · contraste y área táctil a cero fallos | Sí ecos-v29 | Dos diálogos ya traían cruz propia y la nueva la tapaba: se detectó en el CI de navegador y se unificó |
| 2026-09-11 13:20 | Claude Code | FEAT-028 | ecos-v28: bordes con jerarquía y silueta propia, criaturas con volumen/apéndices/textura/caras variadas, ocho animaciones nuevas y barra inferior de seis botones en una fila con el ranking en la cabecera | (este commit) | npm test 64/64 · CI de navegador en Chromium 320/390/430/1280 + PWA · contraste y área táctil medidos en seis vistas | Sí ecos-v28 | Cancelé dos veces el CI de v27 creyéndolo colgado: no lo estaba, medí mal el tiempo entre consultas |
| 2026-09-11 10:30 | Claude Code | TECH-008, FEAT-026, FEAT-027 | ecos-v27: auditoría completa (rendimiento, accesibilidad, balance, deuda) en docs/AUDITORIA.md, paleta cálida sin azul marino, mínimo táctil corregido y rebaja de las almas de progresión | (este commit) | npm test 59/59 · medición de FPS y contraste con Playwright · npm run balance | Sí ecos-v27 | La ruta idle rota (solo compañeros no pasa de z1) queda propuesta, no aplicada: toca balance |
| 2026-09-11 09:40 | Claude Code | FEAT-025 | ecos-v26: código de rescate de un solo uso para recuperar la cuenta sin el PIN (cierra #10 del backlog) | 477e9b7 | npm test 59/59 · CI de navegador · SQL en el proyecto real | Sí ecos-v26 | Nadie ha recuperado aún una cuenta real desde el móvil |
| 2026-09-11 09:10 | Claude Code | FEAT-024, TECH-001 | ecos-v25: bestiario con siete arquetipos de criatura, auditoría del backend aplicada (search_path del trigger y RLS por consulta) y cobro de recompensas en lote | (este commit) | npm test 56/56 · CI de navegador | Sí ecos-v25 | La auditoría deja tres puntos aceptados a propósito, anotados en migration-v8.sql |
| 2026-09-11 00:40 | Claude Code | BUG-011, BUG-012, FEAT-022, FEAT-023 | ecos-v24: desafíos diarios/semanales/progresión con recompensas, rareza exótica, enemigos sin aplastar y aviso del combate sin cortar en iPhone | 65d61ec | npm test 55/55 · CI de navegador en Chromium 320/390/430/1280 + PWA | Sí ecos-v24 | Recompensas sin medir en partida larga; el enemigo queda pequeño a 760 px de alto |
| 2026-09-10 23:55 | Claude Code | FEAT-018..021, TECH-003 | ecos-v23: iconografía propia (84 glifos, cero emojis), emblema y pulido de interfaz, panel de administración con recursos y fichas, ficha pública de rival y puntuación validada en servidor | 179f8ef | npm test 49/49 · CI de navegador en Chromium 320/390/430/1280 + PWA · SQL en el proyecto real | Sí ecos-v23 | TECH-003 queda mitigado, no cerrado: esperar tiempo real sigue generando crédito |
| 2026-09-09 10:45 | Claude Code | FEAT-012..017 | Seis mejoras aprobadas: renta al volver, lotes parciales, mochila llena, mapa por actos, ranking y guardado | 4359cc2 | npm test 45/45 · CI mobile-browser verde | Sí ecos-v22 (PR #22) | Tag ecos-v22 no empujado: el proxy devuelve 403 en refs/tags |
| 2026-09-09 07:20 | Claude Code | BUG-005..010 | Caza de defectos: arranque a prueba de saves rotos, mob dorado, HUD, teclado, viaje y candado | e8befb7 | npm test 39/39 · CI mobile-browser verde | Sí ecos-v21 (PR #20) | Tag ecos-v21 no empujado: el proxy corta la conexión |
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
