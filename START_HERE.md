# Lito Lab · START HERE

Punto de entrada único para cualquier agente (ChatGPT, Astra, Claude Code u otro).
Objetivo: continuar el trabajo con el mínimo contexto posible y sin duplicar esfuerzo.

## Flujo obligatorio

```
START_HERE.md  →  CONTINUAR.md  →  TAREAS.md (solo el ID que toca)  →  código
```

1. Sincroniza con la última versión de `main`.
2. Lee este archivo y `CONTINUAR.md`. Nada más por defecto.
3. Coge la próxima acción de `CONTINUAR.md` y su ID en `TAREAS.md`.
4. Abre **solo** los archivos que esa tarea necesita.
5. **No releas ni audites el repositorio completo.** Ampliar contexto solo si la tarea lo exige,
   y de forma dirigida: un archivo concreto, no un barrido.

## Qué es cada archivo

| Archivo | Para qué | ¿Leer al arrancar? |
| --- | --- | --- |
| `START_HERE.md` | Reglas y flujo | Sí |
| `CONTINUAR.md` | Estado actual y próxima acción exacta | Sí |
| `TAREAS.md` | IDs activos (BUG/FEAT/TECH) y contadores | Solo el ID que trabajas |
| `CHANGELOG_AGENT.md` | Una línea por sesión: qué hizo cada agente | Solo si sospechas duplicidad |
| `docs/HISTORIAL.md` | Archivo histórico congelado | **No**, salvo necesidad real |

## Fuentes de verdad

- **GitHub = fuente operativa y memoria compartida.** El estado real del desarrollo está aquí,
  no en la memoria interna de ningún agente.
- **Drive = roadmap y dirección.** El XLSM de Drive manda en planificación y prioridades;
  no se duplica en el repo. Los IDs de `TAREAS.md` mapean a sus filas `#NN`.

## IDs de tareas

`BUG-XXX` defecto · `FEAT-XXX` mejora · `TECH-XXX` técnico/infra/QA. Correlativos, sin renumerar.
Antes de crear uno, comprueba en `TAREAS.md` que no existe ya. Úsalo en commits y en el handoff.

## Cierre obligatorio de sesión

Antes de terminar, siempre:

- [ ] `CONTINUAR.md` reescrito con la plantilla (estado, commit, IDs, próxima acción, bloqueos).
- [ ] Fila nueva en `CHANGELOG_AGENT.md`.
- [ ] `TAREAS.md` actualizado si cambió el estado de un ID o creaste uno nuevo.
- [ ] Commit y push de la documentación junto con los cambios.

Regla de deploy: solo se incrementa `sw.js` y se publica cuando cambia el juego.
Cambios de documentación no llevan deploy.

## Principio

Ejecución sobre reconstrucción de contexto. Maximizar mejoras terminadas por unidad de uso del agente.
