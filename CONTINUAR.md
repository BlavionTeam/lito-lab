# CONTINUAR · handoff activo

> Único archivo de estado. Se **sobrescribe** cada sesión, no se acumula.
> Detalle de tareas → `TAREAS.md`. Registro de sesiones → `CHANGELOG_AGENT.md`.
> Contexto antiguo → `docs/HISTORIAL.md` (no leer salvo necesidad real).

**Actualizado:** 2026-09-07 23:50 UTC · **Agente:** Claude Code (Opus 5)

---

## 1. Estado / versión

Producción **ecos-v16** publicada en https://blavionteam.github.io/lito-lab/
Sin cambios de gameplay pendientes de subir. Rama de trabajo actual: solo documentación.

## 2. Último commit estable

`fc9dc5c` (main) · merge PR #10 · Pages build success sobre ese commit.
Rollback conocido: revertir el merge de PR #3 devuelve producción a ecos-v15 (sana).

## 3. IDs terminados

- FEAT-004, FEAT-005, FEAT-006 — publicados y verificados en Chromium móvil. Falta Safari (TECH-002).
- TECH-005 — arquitectura de continuidad entre agentes (esta sesión).

## 4. IDs en curso

- FEAT-001 — publicado, sin prueba real de dos sesiones simultáneas.
- FEAT-002 — publicado, sin QA visual en Safari real.
- FEAT-003 — publicado, coeficientes sin calibrar con partidas reales.
- TECH-001 — pipeline de validación parcial (solo suites de regresión).
- TECH-002 — QA en Safari/iPhone físico: nunca ejecutado.

## 5. Bugs conocidos

- BUG-001 — a 320 px "ALMAS" queda recortado en la cabecera (`overflow:hidden` en `.currencies`). Cosmético, no bloquea.

## 6. Próxima acción exacta

1. Preguntar a Miguel si ecos-v16 carga y se juega bien en su iPhone (cierra TECH-002 parcialmente).
2. Si falla en producción: revertir el merge de PR #3 sobre main.
3. Calibrar FEAT-003 con partidas reales (tiempos a jefes 1/4/8/12 y renaceres 1º/2º) antes de cerrarlo.
4. Actualizar el XLSM de Drive: FEAT-004/005/006 verificados y publicados; FEAT-001/002/003 publicados pero NO cerrados.

## 7. Tests / verificaciones

- `npm test` (7 suites Node) pasa sobre el commit estable.
- QA visual automatizado 36/36 en 320×568, 390×844 y 430×932 (Chromium local + Playwright, `npm run dev`).
- NO acreditado: Safari/WebKit real, dos sesiones simultáneas reales, balance de FEAT-003.
- Esta sesión: solo documentación; sin cambios de código, sin re-ejecutar suites.

## 8. Deploy actual

ecos-v16 en GitHub Pages desde `main`. **Sin deploy en esta sesión** (no hay cambios de gameplay).
Regla: `sw.js` (`const C`) se incrementa solo cuando cambia el juego.

## 9. Archivos relevantes

`index.html` (todo el juego), `sw.js` (versión de caché), `config.js` (claves públicas Supabase),
`tests/*.cjs` (7 suites), `.github/workflows/validate.yml`, `schema-save-version.sql`.

## 10. Bloqueos reales

- El proxy de salida de los entornos de agente devuelve 403 para `blavionteam.github.io`: la verificación de producción es indirecta y debe confirmarla Miguel en el móvil.
- WebKit no está instalado en los entornos usados hasta ahora: TECH-002 no se puede cerrar sin un iPhone físico.

---

## Plantilla de cierre (copiar y rellenar, borrar lo anterior)

```
**Actualizado:** <fecha UTC> · **Agente:** <agente/modelo>
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

Reglas: máximo ~60 líneas, sin historia, sin repetir lo que ya está en `TAREAS.md`
o `CHANGELOG_AGENT.md`. Si algo es histórico, va a `docs/HISTORIAL.md`.
