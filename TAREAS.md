# TAREAS · índice de IDs

> Solo tareas **activas o próximas**. El backlog completo y las prioridades viven en el roadmap de Drive.
> `CONTINUAR.md` referencia IDs de aquí; no repite su descripción.

**Contadores (siguiente ID libre):** BUG-002 · FEAT-008 · TECH-008

`BUG-XXX` defecto · `FEAT-XXX` mejora de producto · `TECH-XXX` técnico/infra/QA.
Correlativos, nunca se reutilizan ni se renumeran. `Legacy` = fila del roadmap de Drive.
Estados: **Abierto → En curso → En revisión → Verificado → Hecho** (o **Bloqueado**).
`Quién` es solo un cerrojo para no duplicar trabajo, no un reparto de roles: pon tu
identificador de sesión y la fecha al empezar, y déjalo en `-` al terminar.
Una reclamación de más de 24 h sin commits se considera libre.

| ID | Legacy | Título | Estado | Quién | Falta para cerrar |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | — | "ALMAS" recortado en cabecera a 320 px | Verificado | - | Arreglado en ecos-v17; QA A/B en 320/360/390 |
| FEAT-001 | #6 | Guardado en nube versionado (save_version) | En revisión | - | Prueba real con dos sesiones simultáneas |
| FEAT-002 | #28 | Habilidades: estados, carrusel y Eclipse | En revisión | - | QA en iPhone real (TECH-002); WebKit ya pasa en CI |
| FEAT-003 | #38 | Balance de compañeros y renacer | Verificado | - | Medido con almas incluidas: el muro cae en z25-28, la curva no necesita ajuste |
| FEAT-004 | #24 | Historial de hitos (botón 📜 + badge) | Verificado | - | Solo cierre en el roadmap de Drive |
| FEAT-005 | #35 | Contador de clics de combate en el perfil | Verificado | - | Solo cierre en el roadmap de Drive |
| FEAT-006 | #37 | Protección de tapping/zoom/selección | Verificado | - | Solo cierre en el roadmap de Drive |
| FEAT-007 | #4 | Fusión de equipo y aspecto por rareza | Verificado | - | Publicada en ecos-v18 con CI verde; solo cierre en el roadmap de Drive |
| TECH-001 | #9 | Pipeline de validación | En revisión | - | Revisión de secretos hecha; falta la parte antitrampas (TECH-003) |
| TECH-002 | — | QA en iPhone físico (PWA + Safari real) | En revisión | - | PWA (manifest, SW, offline) y WebKit ya se prueban en CI; solo falta el dispositivo real |
| TECH-003 | #8 | Ranking validado en backend (antitrampas) | Abierto | - | El trigger aún confía en el `save` del cliente |
| TECH-004 | #29 | Cuenta admin | Abierto | - | Rol real en backend + pruebas positivas/negativas |
| TECH-005 | — | Arquitectura de continuidad entre agentes | Hecho | - | — |
| TECH-006 | — | Preflight/check y reglas de agente | Hecho | - | — |
| TECH-007 | — | Red de regresión de inventario/equipo | Hecho | - | — |

**Backlog en Drive, sin ID hasta activarse:** #10 autenticación/recuperación,
#25 pulido visual y moneda propia, #27 cabecera.

## Reglas (30 segundos)

1. Antes de crear un ID, búscalo aquí. Si ya existe, se reutiliza: así no se duplica trabajo.
2. ID nuevo = siguiente número del contador de su prefijo, y se sube el contador en el mismo commit.
3. Al empezar: estado `En curso` + tu identificador en `Quién`. Al terminar: estado real y `Quién` a `-`.
4. El ID va en el commit (`fix(BUG-001): ...`), en `CONTINUAR.md` y en `CHANGELOG_AGENT.md`.
   Así `git log --grep=BUG-001` reconstruye tarea → commits → validación sin leer nada más.
5. `Hecho` se retira de la tabla en la siguiente sesión que la toque; el rastro queda en el changelog.
6. `npm run check` valida contadores, duplicados, estados y referencias cruzadas.
