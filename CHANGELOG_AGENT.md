# CHANGELOG_AGENT

> Registro de sesiones para agentes. **Una fila por sesión, siempre arriba.** Nunca editar filas antiguas.
> Fecha en UTC. `-` = no aplica. Máximo una línea por sesión: si necesitas más, va en `CONTINUAR.md`.

| Fecha UTC | Agente | IDs | Cambios | Commit | Tests | Deploy | Incidencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-07 23:50 | Claude Code / Opus 5 | TECH-005 | Arquitectura de continuidad: IDs, CHANGELOG_AGENT, handoff estricto, histórico archivado | 41262b0 | - (solo docs) | No | Ninguna |
| 2026-09-07 23:34 | ChatGPT Business | FEAT-001..006 | Publicación ecos-v16 + fix regresión CSS de arena móvil | fc9dc5c | npm test 7/7 · QA visual 36/36 (320/390/430) | Sí ecos-v16 | Sin verificar en Safari/iPhone real |

## Cómo añadir tu fila

Copia y rellena, insertándola **justo debajo de la cabecera**:

```
| <YYYY-MM-DD HH:MM> | <agente/modelo> | <IDs> | <cambios en ≤12 palabras> | <sha> | <tests o "-"> | <Sí vNN / No> | <incidencia o "Ninguna"> |
```

Obligatorio antes de terminar una sesión, junto con `CONTINUAR.md`.
