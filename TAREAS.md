# TAREAS · índice de IDs

> Solo tareas **activas o próximas**. El backlog completo vive en el roadmap XLSM de Drive.
> `CONTINUAR.md` referencia IDs de aquí; no repite su descripción.

**Contadores (siguiente ID libre):** BUG-002 · FEAT-007 · TECH-006

**Formato:** `BUG-XXX` defecto · `FEAT-XXX` mejora de producto · `TECH-XXX` técnico/infra/QA.
Numeración correlativa, nunca se reutiliza ni se renumera. `Legacy` = fila del XLSM de Drive.

| ID | Legacy | Título | Estado | Falta para cerrar |
| --- | --- | --- | --- | --- |
| BUG-001 | — | "ALMAS" recortado en cabecera a 320 px | Abierto | Ajustar `overflow` en `.currencies`; cosmético |
| FEAT-001 | #6 | Guardado en nube versionado (save_version) | Publicado | Prueba real con dos sesiones simultáneas |
| FEAT-002 | #28 | Habilidades: estados, carrusel y Eclipse | Publicado | QA visual en Safari real |
| FEAT-003 | #38 | Balance de compañeros y renacer | Publicado | Calibrar tiempos a jefes 1/4/8/12 y renaceres 1º/2º |
| FEAT-004 | #24 | Historial de hitos (botón 📜 + badge) | Verificado | Solo Safari (TECH-002) |
| FEAT-005 | #35 | Contador de clics de combate en el perfil | Verificado | Solo Safari (TECH-002) |
| FEAT-006 | #37 | Protección de tapping/zoom/selección | Verificado | Solo Safari (TECH-002) |
| TECH-001 | #9 | Pipeline de validación | Parcial | Revisión de secretos y antitrampas |
| TECH-002 | — | QA en Safari/iPhone físico | Abierto | Requiere dispositivo real de Miguel |
| TECH-003 | #8 | Ranking validado en backend (antitrampas) | Abierto | El trigger aún confía en el `save` del cliente |
| TECH-004 | #29 | Cuenta admin | Sin empezar | Rol real en backend + pruebas positivas/negativas |
| TECH-005 | — | Arquitectura de continuidad entre agentes | Hecho | — |

**Backlog en Drive, sin ID hasta activarse:** #4 fusión, #10 autenticación/recuperación,
#25 pulido visual y moneda propia, #27 cabecera.

## Cómo usar los IDs

1. Antes de crear un ID, buscarlo aquí: si ya existe, se reutiliza (evita duplicar trabajo).
2. ID nuevo = siguiente número del contador de su prefijo. Actualizar el contador en el mismo commit.
3. Usar el ID en el mensaje de commit (`fix(BUG-001): ...`), en `CONTINUAR.md` y en `CHANGELOG_AGENT.md`.
4. Al cerrar: estado `Hecho`, y se retira de la tabla en la siguiente sesión que la toque
   (el rastro queda en `CHANGELOG_AGENT.md`). Nunca se renumera el histórico.
