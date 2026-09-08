# CONTINUAR · handoff activo

> Único archivo de estado. Se **sobrescribe** cada sesión, no se acumula.
> Empieza por `npm run preflight`. Detalle de tareas → `TAREAS.md`. Reglas → `AGENTS.md`.
> Registro de sesiones → `CHANGELOG_AGENT.md`. Histórico → `docs/HISTORIAL.md` (no leer por defecto).

**Actualizado:** 2026-09-08 00:15 UTC · **Agente:** sesión Claude Code

---

## 1. Estado / versión

Producción **ecos-v16** en https://blavionteam.github.io/lito-lab/ · sin cambios de juego pendientes.
Esta sesión solo ha tocado arquitectura de continuidad y pruebas: `index.html`, `sw.js`,
`config.js` y el backend siguen intactos.

## 2. Último commit estable

`fc9dc5c` (main) · Pages y CI en verde sobre ese commit · etiquetado localmente como `ecos-v16`.
Rollback: revertir el merge de PR #3 devuelve producción a ecos-v15, acreditada como sana.

## 3. IDs terminados

TECH-005 (arquitectura de continuidad), TECH-006 (preflight/check + reglas de agente),
TECH-007 (red de regresión de inventario/equipo).
FEAT-004, FEAT-005 y FEAT-006 siguen `Verificado`: solo falta cerrarlos en el roadmap de Drive.

## 4. IDs en curso

- FEAT-001 — publicado, sin prueba real de dos sesiones simultáneas.
- FEAT-002 — publicado; WebKit pasa en CI, falta iPhone real.
- FEAT-003 — publicado, coeficientes sin calibrar con partidas reales.
- TECH-001 — pipeline parcial: faltan revisión de secretos y antitrampas.

## 5. Bugs conocidos

- BUG-001 — a 320 px "ALMAS" queda recortado en la cabecera (`overflow:hidden` en `.currencies`). Cosmético.

## 6. Próxima acción exacta

1. Preguntar a Miguel si ecos-v16 se juega bien en su iPhone: es lo único que cierra TECH-002.
2. Publicar el tag del estado estable: `git push origin ecos-v16` (falló por el proxy de esta sesión, ver §10).
3. Calibrar FEAT-003 con partidas reales antes de cerrarlo.
4. Cerrar FEAT-004/005/006 en el roadmap de Drive; FEAT-001/002/003 siguen abiertos allí.

## 7. Tests / verificaciones

- `npm run check` en verde: coherencia de docs/IDs/versión + **8 suites** Node (≈2 s).
- Suite nueva de inventario validada por mutación: al romper `equip`/`unequip` a propósito, falla.
- CI: job de regresiones + `mobile-browser`, que ya ejecuta **Chromium y WebKit** a 320/390/430 px.
- El paso `check` en CI se estrenará en la próxima PR; en local pasa con el mismo comando.
- NO acreditado: iPhone físico, dos sesiones reales simultáneas, balance de FEAT-003.

## 8. Deploy actual

ecos-v16. **Sin deploy en esta sesión**: no hay cambios de gameplay.
`npm run check` bloquea cualquier cambio de `index.html` que no suba `const C` en `sw.js`.

## 9. Archivos relevantes

Arquitectura: `AGENTS.md`, `scripts/agent.mjs`, `TAREAS.md`, `CHANGELOG_AGENT.md`.
Juego: `index.html` (todo), `sw.js` (versión de caché), `tests/*.cjs`, `.github/workflows/validate.yml`.

## 10. Bloqueos reales

- El proxy de salida de los entornos de agente rechaza `git push` de **tags** (la rama sí sube) y
  devuelve 403 para `blavionteam.github.io`. Consecuencias: el tag `ecos-v16` existe solo en local
  (§6.2) y la verificación de producción tiene que hacerla Miguel en el móvil.
  Nada de esto bloquea el desarrollo: `preflight` cae a §2 cuando no hay tag.
- El roadmap de Drive es un `.xlsm` con macros: legible por metadatos, pero la API no lo edita sin
  round-trip binario que arriesga perder VBA y formato. No se toca desde agentes; el puente es el ID.

---

## Plantilla de cierre (copiar y rellenar, borrar lo anterior)

```
**Actualizado:** <fecha UTC> · **Agente:** <identificador de sesión>
1. Estado / versión: <ecos-vNN · publicada o no>
2. Último commit estable: <sha + rama>
3. IDs terminados: <IDs>
4. IDs en curso: <ID — qué falta exactamente>
5. Bugs conocidos: <BUG-XXX — síntoma · bloquea sí/no>
6. Próxima acción exacta: <1-4 pasos accionables>
7. Tests / verificaciones: <qué se ejecutó y qué NO se acredita>
8. Deploy actual: <versión + sí/no deploy en esta sesión>
9. Archivos relevantes: <solo los que tocará el siguiente>
10. Bloqueos reales: <o "ninguno">
```

Reglas: máximo ~60 líneas, sin historia, sin repetir lo que ya está en `TAREAS.md`,
`AGENTS.md` o `CHANGELOG_AGENT.md`. Lo histórico va a `docs/HISTORIAL.md`.
`npm run check` verifica que estas 10 secciones siguen existiendo.
