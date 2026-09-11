# TAREAS · índice de IDs

> Solo tareas **activas o próximas**. El backlog completo y las prioridades viven en el roadmap de Drive.
> `CONTINUAR.md` referencia IDs de aquí; no repite su descripción.

**Contadores (siguiente ID libre):** BUG-013 · FEAT-030 · TECH-009

`BUG-XXX` defecto · `FEAT-XXX` mejora de producto · `TECH-XXX` técnico/infra/QA.
Correlativos, nunca se reutilizan ni se renumeran. `Legacy` = fila del roadmap de Drive.
Estados: **Abierto → En curso → En revisión → Verificado → Hecho** (o **Bloqueado**).
`Quién` es solo un cerrojo para no duplicar trabajo, no un reparto de roles: pon tu
identificador de sesión y la fecha al empezar, y déjalo en `-` al terminar.
Una reclamación de más de 24 h sin commits se considera libre.

| ID | Legacy | Título | Estado | Quién | Falta para cerrar |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | — | "ALMAS" recortado en cabecera a 320 px | Verificado | - | Arreglado en ecos-v17; QA A/B en 320/360/390 |
| BUG-002 | — | iOS selecciona texto y hace zoom en toda la interfaz | Verificado | - | Corregido en ecos-v19; falta confirmarlo en un iPhone físico (TECH-002) |
| BUG-003 | — | Navegación de zona: sin guardado, sin refresco y con área táctil corta | Verificado | - | Corregido en ecos-v19 con regresión en el CI de navegador |
| BUG-004 | — | iPhone: fila de zona recortada y moneda sin glifo | Verificado | - | Corregido en ecos-v20 y confirmado en el iPhone que lo reportó |
| BUG-005 | — | Una partida imposible mata el arranque y deja pantalla muerta | Verificado | - | Corregido en ecos-v21 con `tests/robustness.cjs`; falta verlo en un iPhone físico |
| BUG-006 | — | El mob dorado se gasta con la arena fuera de pantalla (móvil) | Verificado | - | Corregido en ecos-v21 con regresión propia |
| BUG-007 | — | El HUD reconstruye HTML 60 veces por segundo | Verificado | - | Corregido en ecos-v21; falta medir FPS en un iPhone físico (TECH-002) |
| BUG-008 | — | La barra espaciadora ataca bajo el mapa de mundos y el resumen | Verificado | - | Corregido en ecos-v21 con regresión en `tests/tap-input.cjs` |
| BUG-009 | — | Viajar desde el mapa de mundos no guarda ni refresca los botones | Verificado | - | Corregido en ecos-v21 con regresión propia |
| BUG-010 | — | La venta automática miente en el recuento de piezas con candado | Verificado | - | Corregido en ecos-v21 con regresión propia |
| BUG-011 | — | El enemigo salía aplastado: el cuerpo podía ser mucho más ancho que alto | Verificado | - | Corregido en ecos-v24; la proporción del cuerpo queda acotada |
| BUG-012 | — | En un iPhone el aviso del combate quedaba cortado bajo la barra del jefe | Verificado | - | Corregido en ecos-v24 con regresión de medidas a 700-844 px |
| FEAT-001 | #6 | Guardado en nube versionado (save_version) | En revisión | - | Prueba real con dos sesiones simultáneas |
| FEAT-002 | #28 | Habilidades: estados, carrusel y Eclipse | En revisión | - | QA en iPhone real (TECH-002); WebKit ya pasa en CI |
| FEAT-003 | #38 | Balance de compañeros y renacer | Verificado | - | Medido con almas incluidas: el muro cae en z25-28, la curva no necesita ajuste |
| FEAT-004 | #24 | Historial de hitos (ahora la pestaña Crónica de Desafíos) | Verificado | - | Absorbido por FEAT-023 en ecos-v24 |
| FEAT-005 | #35 | Contador de clics de combate en el perfil | Verificado | - | Solo cierre en el roadmap de Drive |
| FEAT-006 | #37 | Protección de tapping/zoom/selección | Verificado | - | Solo cierre en el roadmap de Drive |
| FEAT-007 | #4 | Fusión de equipo y aspecto por rareza | Verificado | - | Publicada en ecos-v18 con CI verde; solo cierre en el roadmap de Drive |
| FEAT-008 | — | Tu puesto real en el ranking aunque no estés en el top | Verificado | - | Publicado en ecos-v19; solo cierre en el roadmap de Drive |
| FEAT-009 | #10 | Cambiar el PIN desde el panel de cuenta | Verificado | - | Publicado en ecos-v19; la recuperación sin PIN llegó en FEAT-025 |
| FEAT-010 | — | Candado de objetos para que la venta no los tire | Verificado | - | Publicado en ecos-v19 con regresión propia |
| FEAT-011 | — | Progreso visible hacia el siguiente desbloqueo | Verificado | - | Publicado en ecos-v19; no toca balance |
| FEAT-012 | — | La renta de compañeros también al volver de segundo plano | Verificado | - | Publicado en ecos-v22 con regresión propia; sin doble cobro |
| FEAT-013 | — | ×10/×100 compran lo que alcanza el oro en vez de apagarse | Verificado | - | Publicado en ecos-v22 con regresión propia |
| FEAT-014 | — | La mochila llena no tira botín épico o mejor | Verificado | - | Publicado en ecos-v22; sacrifica lo peor sin candado o lo deja escrito |
| FEAT-015 | — | El mapa de mundos permite moverse entre actos | Verificado | - | Publicado en ecos-v22; falta QA visual en iPhone real (TECH-002) |
| FEAT-016 | — | Los nombres del ranking se escapan en vez de mutilarse | Verificado | - | Publicado en ecos-v22 con regresión propia |
| FEAT-017 | — | Gastar oro o almas se guarda en el acto | Verificado | - | Publicado en ecos-v22; alcanza a mascotas y tienda de almas |
| FEAT-018 | #29 | Panel de administración real: recursos y fichas de jugadores | Verificado | - | Publicado en ecos-v23; migración v6 aplicada y probada por SQL y en el CI de navegador |
| FEAT-019 | #25 | Iconografía propia: los glifos de Lito sustituyen a los emojis | Verificado | - | Publicado en ecos-v23 con `tests/iconografia.cjs`; falta verlo en un iPhone real (TECH-002) |
| FEAT-020 | #27 | Identidad visual y pulido de interfaz | Verificado | - | Publicado en ecos-v23: emblema, acentos por sección, marco de bioma y sellos del mapa |
| FEAT-021 | — | Ficha pública de jugador con más datos | Verificado | - | Publicado en ecos-v23 con migración v7; regresión en el CI de navegador |
| FEAT-022 | — | Rareza exótica: la cima de la escala, en verde | Verificado | - | Publicada en ecos-v24 con regresión propia |
| FEAT-023 | #24 | Desafíos y recompensas: progresión, diarios y semanales | Verificado | - | Publicado en ecos-v24 con `tests/desafios.cjs` y regresión en el CI de navegador |
| FEAT-024 | — | Bestiario con siluetas propias: siete arquetipos de criatura | Verificado | - | Publicado en ecos-v25 con `tests/criaturas.cjs` |
| FEAT-025 | #10 | Recuperar la cuenta sin el PIN con un código de rescate | Verificado | - | Publicado en ecos-v26 con migración v9, `tests/rescate.cjs` y regresión en el CI de navegador |
| FEAT-026 | — | Paleta cálida: la interfaz deja de ser azul marino | Verificado | - | Publicada en ecos-v27; contraste WCAG AA comprobado |
| FEAT-027 | — | Rebaja de las almas que paga la progresión | Verificado | - | Publicada en ecos-v27; medida contra las cuentas reales |
| FEAT-028 | — | Diseño: bordes con jerarquía, criaturas con volumen, animaciones y barra inferior aligerada | Verificado | - | Publicado en ecos-v28 con `tests/interfaz.cjs`; falta verlo en un iPhone físico |
| FEAT-029 | — | Sellos del perfil: uno por jefe final de acto, redondos, por rareza y con lo que falta; cruz de salida en todo diálogo | Verificado | - | Publicado en ecos-v29; cubierto en `tests/interfaz.cjs` y en el CI de navegador |
| TECH-008 | — | Auditoría completa: rendimiento, accesibilidad, balance y deuda | Verificado | - | `docs/AUDITORIA.md`; el hallazgo de la ruta idle queda propuesto, no aplicado |
| TECH-001 | #9 | Pipeline de validación | En revisión | - | Auditoría del backend hecha (migración v8); falta la parte antitrampas (TECH-003) |
| TECH-002 | — | QA en iPhone físico (PWA + Safari real) | En revisión | - | PWA (manifest, SW, offline) y WebKit ya se prueban en CI; solo falta el dispositivo real |
| TECH-003 | #8 | Ranking validado en backend (antitrampas) | En revisión | - | Mitigado en ecos-v23: el servidor acredita el tiempo jugado y recorta lo que no sostiene. Un tramposo paciente aún escala despacio; cerrarlo exige simular la partida en servidor |
| TECH-004 | #29 | Cuenta admin | Verificado | - | Rol real en Supabase, invisible en el ranking, con prueba negativa de escalada |
| TECH-005 | — | Arquitectura de continuidad entre agentes | Hecho | - | — |
| TECH-006 | — | Preflight/check y reglas de agente | Hecho | - | — |
| TECH-007 | — | Red de regresión de inventario/equipo | Hecho | - | — |

**Backlog en Drive, sin ID hasta activarse:** (ninguno activo).
(#25, #27 y #29 se activaron como FEAT-019, FEAT-020 y FEAT-018; #10 se cerró con FEAT-009 y FEAT-025.)

## Reglas (30 segundos)

1. Antes de crear un ID, búscalo aquí. Si ya existe, se reutiliza: así no se duplica trabajo.
2. ID nuevo = siguiente número del contador de su prefijo, y se sube el contador en el mismo commit.
3. Al empezar: estado `En curso` + tu identificador en `Quién`. Al terminar: estado real y `Quién` a `-`.
4. El ID va en el commit (`fix(BUG-001): ...`), en `CONTINUAR.md` y en `CHANGELOG_AGENT.md`.
   Así `git log --grep=BUG-001` reconstruye tarea → commits → validación sin leer nada más.
5. `Hecho` se retira de la tabla en la siguiente sesión que la toque; el rastro queda en el changelog.
6. `npm run check` valida contadores, duplicados, estados y referencias cruzadas.
