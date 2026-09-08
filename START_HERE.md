# Lito Lab · START HERE

Punto de entrada para cualquier agente de IA, de cualquier proveedor.
Objetivo: continuar el trabajo con el mínimo contexto posible y sin duplicar esfuerzo.

## Arranque

```
npm run preflight
```

Devuelve en 12 líneas: rama, sincronía con `main`, último estado estable, versión de `sw.js`,
IDs en curso y quién los tiene, y la siguiente acción exacta. Con eso ya puedes empezar.

Flujo: **`preflight` → `CONTINUAR.md` → tu ID en `TAREAS.md` → solo los archivos de esa tarea.**

**No releas el repositorio.** Amplía contexto solo si la tarea lo exige, archivo a archivo.

## Qué es cada archivo

| Archivo | Para qué | ¿Leer al arrancar? |
| --- | --- | --- |
| `AGENTS.md` | Reglas operativas, roles y comandos | Sí (es corto) |
| `CONTINUAR.md` | Estado actual y próxima acción exacta | Sí |
| `TAREAS.md` | IDs activos (BUG/FEAT/TECH) y contadores | Solo el ID que trabajas |
| `CHANGELOG_AGENT.md` | Una línea por sesión: qué hizo cada agente | Solo si sospechas duplicidad |
| `docs/HISTORIAL.md` | Archivo histórico congelado | **No**, salvo necesidad real |

## Fuentes de verdad

- **GitHub = fuente operativa.** Código, estado técnico, handoff, validaciones, releases.
- **Drive = dirección.** Roadmap, prioridades, visión, impacto/esfuerzo.
- Enlace entre ambos: **el ID**. No se duplica el contenido de uno en el otro.

## Cierre de sesión

```
npm run check     # docs + IDs + versión de caché + 7 suites (≈2 s)
```

Y deja actualizados `CONTINUAR.md`, `TAREAS.md` y una fila en `CHANGELOG_AGENT.md`.
Detalle en `AGENTS.md`.

## Principio

Ejecución sobre reconstrucción de contexto. Maximizar mejoras terminadas por unidad de uso del agente.
