# CONTINUAR · handoff activo

> Único archivo de estado. Se **sobrescribe** cada sesión, no se acumula.
> Empieza por `npm run preflight`. Detalle de tareas → `TAREAS.md`. Reglas → `AGENTS.md`.
> Registro de sesiones → `CHANGELOG_AGENT.md`. Histórico → `docs/HISTORIAL.md` (no leer por defecto).

**Actualizado:** 2026-09-08 12:20 UTC · **Agente:** sesión Claude Code

---

## 1. Estado / versión

**ecos-v17** publicada: incluye el arreglo de cabecera de BUG-001. Sin cambios de lógica ni balance.
La arquitectura de continuidad es ya el protocolo oficial en `main`: `index.html`, `sw.js`,
`config.js` y el backend siguen intactos (diff cero frente a la versión publicada).

## 2. Último commit estable

`0744a6e` (main) · merge de PR #13 · CI en verde (regresiones + Chromium/WebKit).
Rollback: revertir ese merge devuelve producción a ecos-v16 (`5aaf649`), acreditada como sana.

## 3. IDs terminados

TECH-005 (arquitectura de continuidad), TECH-006 (preflight/check + reglas de agente),
TECH-007 (red de regresión de inventario/equipo). El protocolo está integrado en `main`:
cualquier agente que entre por `main` ya lo recibe.
FEAT-004, FEAT-005 y FEAT-006 siguen `Verificado`: solo falta cerrarlos en el roadmap de Drive.

## 4. IDs en curso

- FEAT-001 — publicado, sin prueba real de dos sesiones simultáneas.
- FEAT-002 — publicado; WebKit y PWA pasan en CI, falta iPhone real.
- TECH-001 — revisión de secretos ya en `npm run check`; la parte antitrampas es TECH-003.

## 5. Bugs conocidos

Ninguno abierto. BUG-001 arreglado en ecos-v17.

## 6. Próxima acción exacta

1. Preguntar a Miguel si ecos-v17 se juega bien en su iPhone: es lo único que cierra TECH-002.
2. Publicar los tags de estado estable: `git push origin ecos-v16 ecos-v17` (el proxy de agente los rechaza, ver §10).
3. Cerrar en el roadmap de Drive: FEAT-003/004/005/006 verificados; FEAT-001 y FEAT-002 siguen abiertos.
4. TECH-003 (ranking antitrampas en backend) es la siguiente pieza de peso; requiere tocar Supabase.

## 7. Tests / verificaciones

- `npm run check` en verde: coherencia de docs/IDs/versión + **8 suites** Node (≈2 s).
- Suite nueva de inventario validada por mutación: al romper `equip`/`unequip` a propósito, falla.
- CI: job de regresiones + `mobile-browser`, que ejecuta **Chromium y WebKit** a 320/390/430/1280 px
  y ahora también la PWA: manifest instalable, service worker activo y arranque + combate **sin red**.
- CI de PR #11 en verde con el paso `check` ya activo: `cloud-save-regressions` y `mobile-browser`.
- `npm run balance`: con almas gastadas, el muro cae en z25-28 (clic) y z22-25 (mixta).
  Los coeficientes de balance NO se han tocado: la curva aguanta.
- BUG-001 verificado A/B con Chromium a 320/360/390 px: sin recorte, sin scroll horizontal
  y arena jugable (`CANVAS#eCan` en el centro). Sin el arreglo falla en 320 y 360.
- NO acreditado: iPhone físico, dos sesiones reales simultáneas. La simulación no modela
  talentos, habilidades, combo, puntos débiles ni oro offline: da cotas superiores comparables.

## 8. Deploy actual

**ecos-v17 publicada** desde `main`. Único cambio de juego: el CSS de cabecera de BUG-001.
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
