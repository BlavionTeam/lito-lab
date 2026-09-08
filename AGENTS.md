# AGENTS.md · reglas operativas

Válido para cualquier agente de IA, de cualquier proveedor. Ningún rol depende del modelo.

## Arranque (siempre igual)

```
npm run preflight     # estado real en 12 líneas: rama, sincronía, versión estable, IDs en curso, siguiente acción
```

Luego: `START_HERE.md` → `CONTINUAR.md` → tu ID en `TAREAS.md` → **solo** los archivos de esa tarea.
No releas el repositorio. No abras `docs/HISTORIAL.md` salvo que necesites el porqué de una decisión.

## Cierre (siempre igual)

```
npm run check         # coherencia de docs/IDs/versión + las 7 suites (≈2 s)
```

Y actualiza, en el mismo commit: `CONTINUAR.md` (plantilla de 10 campos), `TAREAS.md`
(estado del ID, `Quién` a `-`) y una fila en `CHANGELOG_AGENT.md`.
Commit con el ID delante: `fix(BUG-001): ...`, `feat(FEAT-003): ...`, `chore(TECH-006): ...`.

## Roles

Un mismo agente puede asumir varios en una sesión. El rol lo decide la tarea, nunca el modelo.

| Rol | Qué lee | Qué entrega |
| --- | --- | --- |
| **Constructor** | `CONTINUAR` §6 + su fila de `TAREAS` + archivos de la tarea | Código + `npm run check` en verde + handoff actualizado |
| **Reviewer** | `git diff origin/main...HEAD` + la fila del ID | Confirma o corrige; si hay defecto, abre `BUG-XXX` en vez de discutirlo |
| **QA** | `CONTINUAR` §7 (qué NO está acreditado) | Ejecuta lo que falta y escribe qué queda acreditado y qué no |
| **Siguiente agente** | `preflight` + `CONTINUAR` | Continúa sin saber quién trabajó antes |

Regla de honestidad: en §7 se separa siempre *verificado* de *no acreditado*. Una prueba
simulada no es una prueba real, y decirlo evita que el siguiente agente lo dé por hecho.

## Evitar trabajo duplicado

- Reclama la tarea en `TAREAS.md` (`En curso` + tu identificador) **antes** de empezar y haz push pronto.
- Si tu ID ya está reclamado con menos de 24 h, coge otro o coordina; no lo trabajes en paralelo.
- Antes de abrir un ID nuevo, busca en `TAREAS.md` y en `git log --grep=` por palabra clave.

## Reglas duras

1. Sincroniza con `main` antes de tocar nada (`preflight` avisa si estás detrás).
2. Si cambias `index.html`, incrementa `const C` en `sw.js`: si no, los navegadores sirven caché vieja.
   `npm run check` lo bloquea.
3. Deploy = merge a `main` (Pages sirve la raíz). Tras publicar, etiqueta el commit:
   `git tag ecos-vNN && git push origin ecos-vNN`. El último tag `ecos-v*` es el estado estable y el punto de rollback.
4. Rollback = revertir el merge que publicó, volviendo al tag anterior.
5. No se toca `config.js`, el esquema de Supabase ni secretos sin petición explícita.
6. Documentación de docs no lleva deploy ni sube versión de `sw.js`.

## Dónde vive cada cosa

| | GitHub | Drive |
| --- | --- | --- |
| Código, estado técnico, handoff, changelog, releases | ✅ | ❌ |
| Roadmap, prioridades, visión, impacto/esfuerzo | ❌ | ✅ |

Enlace entre ambos: **el ID**. La columna `Legacy` de `TAREAS.md` mapea a la fila `#NN` del roadmap.
No se copia el roadmap al repo ni el estado técnico a Drive.

## Qué NO hacer

Reescribir sistemas que funcionan, añadir dependencias, rediseñar la UI, cambiar balance,
crear documentos largos, duplicar información que ya tiene fuente canónica.
