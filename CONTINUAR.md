# Lito Lab · continuidad operativa · 8 septiembre 2026

## ESTADO ACTUAL · ecos-v16 PUBLICADO · falta comprobación en móvil real

**Producción es ahora ecos-v16.** Miguel autorizó publicar tras conocer la
regresión encontrada y su corrección.

- PR #3 fusionada en `3da5901f36f3ee8b734743704bb2f9865f9e31aa`. La rama
  `fix/versioned-cloud-saves` ya está integrada; no seguir trabajando sobre ella.
- `sw.js` en main sirve `ecos-v16`. Pages: `pages build and deployment` run 15
  terminó **success** sobre ese mismo commit, luego lo publicado es main.
- Entra en producción el lote completo: #6 guardados versionados, #24 historial
  de hitos, #28 habilidades y Eclipse, #35 contador de clics, #37 protección de
  tapping, #38 primera calibración de compañeros y renacer, #9 pipeline parcial.
- **NO se pudo abrir la URL pública desde el entorno de esta sesión**: el proxy
  de salida responde 403 para `blavionteam.github.io`. La verificación de que
  Pages sirve el contenido correcto es indirecta (commit desplegado + success),
  NO una carga real de la app publicada. Queda pendiente confirmarlo en el móvil.

### Lo primero que debe hacer el próximo agente

1. Preguntar a Miguel si la app publicada carga y se juega bien en su iPhone.
   Es el único hueco de verificación que queda tras este deploy.
2. Si algo falla en producción, el rollback es revertir el merge de PR #3 sobre
   main; producción volvería a ecos-v15, que está acreditada como sana.
3. Actualizar el XLSM de Drive: #24, #35 y #37 quedan verificados en Chromium
   móvil y publicados; #6, #28 y #38 están publicados pero NO cerrados (falta
   calibración real de #38 y prueba de dos sesiones reales de #6).

## Cómo se llegó aquí · QA visual DESBLOQUEADA y regresión bloqueante corregida

Primera sesión que consigue ejecutar QA visual real sobre este lote. El bloqueo
`ERR_BLOCKED_BY_CLIENT` que arrastraban las sesiones anteriores era del navegador
de aquel entorno, no del proyecto: aquí se usó Chromium local con Playwright
(`/opt/pw-browsers/chromium-1194`) contra `npm run dev`, y funcionó sin incidencias.
Cualquier agente con Chromium disponible puede repetirlo; no volver a dar el QA
visual por imposible sin intentarlo.

### Regresión CRÍTICA encontrada en la rama (ya corregida)

El lote v16 dejaba **el juego injugable en móvil**, en cualquier ancho. No era un
detalle de una resolución concreta: en la vista Combate no se veía la arena.

- Causa raíz: `.skills` tiene `flex-direction:column` en la regla base (línea ~175).
  El bloque móvil que convierte las habilidades en carrusel **nunca reseteaba esa
  propiedad**, así que `.skillCard{flex:0 0 104px}` aplicaba los 104 px a la ALTURA:
  5 tarjetas × 104 + gaps = 553 px de columna vertical encima de la arena.
- Efecto medido, invitado recién entrado, 390×844:
  v15 producción `.skills` 78 px de alto en y=650, centro de arena `CANVAS#eCan`,
  toque central 12/12 → 11/12. Rama v16 antes del arreglo: `.skills` 553 px en y=175,
  centro de arena `BUTTON`, toque central sin efecto. **No se podía atacar.**
- Comprobado que producción v15 NO está afectada: la regresión la introduce el lote.

### Corrección aplicada (4 declaraciones CSS, sin tocar lógica de juego)

1. `flex-direction:row` en `.skills` del bloque móvil: el carrusel vuelve a ser fila.
2. `min-width:0` en `.grid`, `.skills` y `.hero .sec`: permiten encoger la cadena.
3. Bloque nuevo con `width:100%` en `.grid/.hero/.hero .sec` y `min-width:0` en
   `.res`, `.res>*` y `.currencies`: sin ancho definido el carrusel estiraba `main`
   hasta 590 px y el navegador hacía zoom-out; además la cabecera con el botón 📜
   de #24 desbordaba 36 px a 320 px.
4. Bloque `@media(max-width:760px) and (max-height:700px)`: compacta el carrusel
   (88 px, `min-height:56px`) para que en pantallas cortas no invada la arena.

No se modificó JavaScript, ni backend, ni configuración, ni el service worker.

### Verificación de esta sesión

- Las 7 suites de Node pasan (`npm test`), incluidas tap-input y player-history.
- QA visual automatizado: **36/36 PASS** en 320×568, 390×844 y 430×932. Antes del
  arreglo el mismo QA daba 25/26 con 320 roto, y el toque central fallaba en todos.
- Comprobado por tamaño (320/360/390/430): viewport sin zoom-out forzado, arena
  destapada (`CANVAS#eCan` en el centro), carrusel desplazable y visible, navegación
  de 7 accesos dentro del viewport, sin scroll horizontal, ataque por toque efectivo.
- Cubierto además: #24 historial abre/cierra, #35 contador de clics en el perfil,
  #28 habilidades visibles, #37 sin selección accidental, Space ataca en la arena y
  NO ataca con un diálogo abierto. Consola sin errores propios de la app.
- Capturas revisadas a 320 y 390: arena, enemigo, carrusel y accesos correctos.

### Límites que SIGUEN sin acreditar

- **Safari/WebKit real: NO probado.** WebKit no está instalado en este entorno
  (`/opt/pw-browsers` sólo trae Chromium). Sigue sin haber prueba en iPhone físico.
- **#38 balance sin calibrar con partidas reales**: no se han medido tiempos a jefes
  1/4/8/12 ni primer/segundo renacer. Los coeficientes siguen siendo una primera
  pasada. No cerrar #38 por esta sesión.
- **Dos sesiones reales simultáneas**: no probadas; #6 sólo tiene pruebas simuladas.
- Cosmético pendiente a 320 px: "ALMAS" queda recortado en la cabecera por el
  `overflow:hidden` de `.currencies`. No bloquea el juego; conviene una pasada.

### Siguiente acción exacta

1. Si el lote se publica: incrementar/confirmar `sw.js` y verificar en Pages que
   sirve la versión nueva, luego comprobar la app publicada en móvil real.
2. Calibrar #38 con partidas reales antes de darlo por cerrado en el XLSM.
3. Repetir el QA visual en Safari/iPhone físico: es el único hueco de plataforma.
4. No cerrar #6/#28/#38 en el Excel hasta 1-3. #24/#35/#37 quedan verificados en
   Chromium móvil por esta sesión, pendientes de Safari.

---

## Avance previo Business · #37 implementada, QA visual bloqueada

- Miguel pidió terminar el lote y desplegar una vez terminado, cuidando el uso.
- Dirección confirmada por Miguel: **móvil primero**, conservar compatibilidad
  de escritorio sin desviar el esfuerzo; objetivo futuro convertirlo en una app
  móvil real. La experiencia táctil guía el diseño y QA de esta actualización.
- Checkout nuevo de GitHub, main `76fce64f7834dc8ac94a8095846d5b220aa9ef28`,
  rama `fix/versioned-cloud-saves` desde `a6bc4d2`; conserva integración y logout v15.
- **#37 implementada, NO cerrada:** arena bloquea gestos de zoom/desplazamiento;
  arena, navegación y controles evitan selección, callout y arrastre accidental.
  Inputs, textarea, contenido editable y `.selectable` conservan selección/copia.
  Se quita user-scalable=no para permitir zoom deliberado fuera de la arena.
- Espacio no ataca al interactuar con controles/enlaces, editar texto, abrir un
  diálogo o estar oculta la arena. Repetición de tecla no suma ataques.
- Nueva suite `tests/tap-input.cjs` pasa; añadida a npm test y Actions. Sintaxis,
  cloud-backend y player-history pasan tras este cambio; las seis suites heredadas
  pasaron antes del cambio. No atribuir a estas pruebas QA real de Safari/PWA.
- Browser cloud volvió a fallar en `http://localhost:4173` con
  `net::ERR_BLOCKED_BY_CLIENT`. No se cambió a otro navegador: la skill
  frontend-testing-debugging requiere autorización del usuario tras ese fallo.
- Recuento del XLSM original verificado: **38 tareas, 20 Hecho, 18 abiertas**.
  Este lote tiene **6 tareas implementadas/en calibración pendientes de cierre**:
  #6, #24, #28, #35, #37 y #38; #9 es adicional y parcial. #31 comparte parte
  de la solución de historial, pero no se cuenta como cerrada por duplicado.
- Nueva implementación de esta sesión: **1 tarea (#37)** más corrección de teclado.
  No fusionado ni publicado: candidato ecos-v16, producción acreditada ecos-v15.
- Siguiente: autorizar vía alternativa de QA del navegador; validar móvil e historial,
  aislamiento/conflictos y balance #38 siguiendo el checklist inferior. Solo después
  cerrar filas del XLSM, fusionar PR #3 y verificar Pages. No publicar Site alternativo.

## Último avance · opcionales #24 y #35 · listo para continuar en Business

- Miguel pidió aprovechar el margen restante para opcionales y guardar continuidad
  para el siguiente agente de la cuenta Business. Mantener lote sin deploy.
- Base de este avance: main `76fce64f7834dc8ac94a8095846d5b220aa9ef28` y
  rama PR #3 `afcb9a048901fe62f71592b56418b54d11d8c7af`; main integrado.
- **#35 implementado:** perfil propio muestra clics de combate con número exacto
  (formato es-ES). Cuenta toques de arena, puntos débiles y ataque con espacio;
  no navegación, habilidades ni DPS. Se reutiliza stats.clicks, que ya persistía,
  sin reiniciar contadores previos. No se amplían datos públicos de rivales.
- **#24 implementado, falta QA visual:** historial de últimos 40 hitos por partida,
  botón 📜 en cabecera y badge sin leer. Orden reciente primero, fechas y cierre
  superior. Niveles, nuevas habilidades, compañeros, mascotas, botín prestigioso,
  jefes/trofeos, primer acto y renacer quedan consultables. Los avisos de hitos
  sustituidos ya no generan toasts ni tarjeta del jefe sobre la arena.
  Confirmaciones deliberadas de renacer/eclosión siguen su flujo existente.
- journal/journalRead/journalNext persisten al guardar y renacer; logout/cuenta
  nueva limpian historial y contador. Guardados antiguos inician historial vacío,
  conservando clics; no se reconstruyen eventos antiguos. Textos escapados en HTML.
- Nueva suite tests/player-history.cjs PASA: contador exacto, exclusión de otras
  acciones, persistencia, límite 40, badge/lectura, orden, XSS, victoria sin overlay,
  migración y aislamiento entre cuentas. Añadida a npm test y Validate game.
  Las cinco suites previas también pasaron tras modificar el código.
- Sigue **ecos-v16 candidata**, sin publicar; producción **ecos-v15**.
  Mismo bloqueo Browser de la sesión: no se ha hecho QA visual de estos controles.
- Siguiente agente Business: fetch de main y `fix/versioned-cloud-saves`, leer
  CONTINUAR.md de esa rama y seguir checklist inferior. Añadir a QA: contador en
  perfil, cabecera con badge a 320/390/430 px, historial largo/cierre, victoria
  de jefe sin tarjeta interceptando taps. No cerrar #24/#35 en Excel hasta QA.
- XLSM original no modificado en este avance; pendientes #24/#35 en curso de
  publicación, además de #6/#28/#38. No duplicar ni convertir el archivo.

## LEER PRIMERO · actualización agrupada en desarrollo (NO publicada)

Miguel autorizó desarrollar las mejoras prioritarias y prefiere una actualización
con varios cambios juntos. Autorizó expresamente dejarla sin deploy si falta QA,
siempre guardando el estado completo para el siguiente agente.

- Producción acreditada: **ecos-v15**, Pages https://blavionteam.github.io/lito-lab/.
  Esta sesión NO fusiona código a main y NO publica una nueva versión.
- Base sincronizada al comenzar y revalidada antes del cierre:
  main `1ee2c2127c245b12374c3401a5ef37c4adaf86a8`.
- Continuar en la rama existente **`fix/versioned-cloud-saves`**, PR #3 en borrador:
  https://github.com/BlavionTeam/lito-lab/pull/3.
  Se integró main en esta rama y se reconciliaron los conflictos con logout v15.
  **ecos-v16** preparado; v14 ya no es la versión candidata. No recuperar archivos
  desde los commits antiguos de PR #3: perderían la corrección de logout.
- Fuente de tareas: Excel original Drive `148gnxlqyOBPhhzToJoa4ylJVDVpOPr2M`,
  ahora `Lito Lab · Roadmap de gameplay · ACTUALIZADO.xlsm`, modificado
  2026-09-07 21:55 UTC, leído en esta sesión. Contiene 38 tareas; las listas
  históricas inferiores de 30 tareas son incompletas.

### Implementado en la rama

1. **#6 guardado simultáneo**: comparación atómica de save_version, subidas
   serializadas, conflicto sin forzado, cinco copias por cuenta, exportación de la
   última y recuperación con protección ante cuota local agotada. Se conserva la
   limpieza completa de logout; login/load/save/refresh/ranking/recuperación tardíos
   no deben afectar a otra sesión. La recuperación usa replacePlayer para limpiar
   también timers/undo. No importar el invitado al iniciar sesión con una cuenta.
2. **#38 compañeros y renacer (primera calibración, NO cerrada)**:
   - Daño base por compañero = base × nivel × (1 + min(nivel,100)/100).
     Se elimina el ×2 repetido cada 25 niveles; maestría máxima +100 %.
   - Precio crece ×1.20 por nivel (antes ×1.15).
   - Contratación/mejora requiere zona del ciclo actual: 1/4/8/12/18/24/32/40.
     No se borran niveles antiguos. Se recalculan talentos/bonos al contratar.
   - Oro offline limitado al daño equivalente de un enemigo de la zona por segundo.
   - Renacer exige un jefe derrotado realmente en el ciclo: zona 12 + 2×renaceres.
     Nuevo runBossMax registra la victoria y vuelve a 0 al renacer. Atajo ya no
     permite cobrar almas solo por aparecer en una zona avanzada.
   - Guardados anteriores sin runBossMax parten con 0: deberán vencer un jefe
     elegible una vez. No se eliminan almas, objetos ni renaceres existentes.
3. **#28 habilidades (implementación pendiente de QA visual)**:
   - Acción de un toque y botón separado de detalles/requisitos.
   - Estados Activar / Activa / Recarga / Solo contra jefes / Desbloquear.
   - Reloj y Eclipse no gastan recarga fuera de un jefe; no se reactivan durante buff.
   - Eclipse: ×2 daño a jefes durante 8 s, recarga base 150 s; desbloqueo permanente
     por 25 almas, 3 renaceres, zona histórica 30 y 60 jefes. Persiste al renacer,
     se aísla correctamente entre cuentas. No se entrega automáticamente.
   - Carrusel de habilidades en móvil y diálogo accesible de explicación.
4. **#9 pipeline (parcial)**: workflow Validate game ejecuta las cinco suites
   de regresión; no equivale a completar revisión de secretos ni antitrampas.

### Verificación completada y límites

- Pasan con Node: tests/cloud-backend.cjs, cloud-flow.cjs, recovery-export.cjs,
  logout-session.cjs y gameplay.cjs. Sintaxis de los scripts inline y diff --check OK.
- Pruebas: dos clientes simulados con misma revisión; primera inserción;
  conflicto/forzado; recuperación/copia/exportación Unicode/cuota; logout;
  cuenta nueva/de menor progreso; respuestas tardías y login duplicado;
  zonas de compañeros/crecimiento; Atajo sin renacer gratis; victoria real del jefe;
  migración de guardados; Eclipse/requisitos/coste/persistencia; recargas; oro offline.
- Estas pruebas usan DOM/red simulados: NO afirman prueba real con dos cuentas.
- Supabase comprobado de solo lectura: save_version bigint, RLS activado y trigger
  players_version_guard presentes y coherentes con schema-save-version.sql.
  No se cambió esquema, autenticación, permisos ni config.js.
- **QA visual bloqueada**: Browser devuelve `net::ERR_BLOCKED_BY_CLIENT` al abrir
  http://localhost:4173. No hay capturas ni validación visual de esta actualización.
  La guía frontend-testing-debugging exige autorización para cambiar de mecanismo
  tras fallo del Browser; no se empleó un navegador alternativo.
- No probados Safari web/PWA/iPhone, layout de 320/390/430 px, dos sesiones reales,
  ni tiempos de progresión comparando clic/compañeros/mixto. No cerrar #6/#28/#38.
- Excel NO modificado: anotar implementación en curso y PR al continuar; no marcar
  Hecho hasta QA y publicación. Mantener exactamente el ID y el formato XLSM,
  sin convertir, duplicar ni perder comentarios/formato/objetos del original.

### Siguiente acción exacta

1. Fetch/pull main y rama PR #3; leer esta cabecera en la rama. Conservar ambos
   padres de la integración y nunca sobrescribir las correcciones de logout.
2. Completar QA visual con un entorno permitido; flujo invitado → combate → Furia
   → recarga/detalles → campamento/bloqueos, y cuentas → conflicto → recuperar/logout.
3. Comparar rutas desde cuenta nueva (clic, compañeros, mixto), medir tiempo a jefes
   1/4/8/12 y primer/segundo renacer, antes/después. Ajustar #38 si hay muro excesivo
   o estrategia trivial; actuales coeficientes son una primera calibración.
4. Pruebas reales de dos sesiones de una cuenta con save_version, y cuentas distintas;
   no usar ni modificar partidas reales de Miguel/Alberto para QA.
5. Si se amplía el lote, #37 tapping/selección/zoom es CRUCIAL y sigue sin tocar.
   #29 admin sigue sin crear: requiere backend seguro, no ocultar controles solamente.
6. Cuando el lote esté verificado: actualizar XLSM, PR lista/revisión, fusionar main,
   comprobar Actions/Pages ecos-v16 y assets publicados, actualizar esta continuidad.
   Hasta entonces mantener producción ecos-v15. No publicar el Site alternativo.

---
## Historial (las notas anteriores quedan subordinadas a la cabecera)

# Lito Lab · continuidad · 7 septiembre 2026

## Corrección de logout · 7 septiembre 2026

- Base sincronizada con main `f0247cda8051bab30be1cc103fac9ab618893e1f`.
- Corrección autorizada por Miguel: logout descarta partida anterior, bonos calculados,
  daño pasivo, temporizadores, combos, buffs, inventario, deshacer e información de sesión.
  En la pantalla de entrada no avanza el combate. Cada login usa exclusivamente el
  guardado de esa cuenta; sin guardado, empieza desde fresh(), sin importar el invitado.
- Respuestas asíncronas de login, refresco de token, lectura, subida y ranking quedan
  invalidadas al cambiar de sesión. Se evita el login simultáneo.
- Versión de esta corrección: **ecos-v15** (v14 está reservada a PR #3, no incluida).
- Verificación: `node tests/logout-session.cjs`, seis escenarios con DOM/red simulados:
  logout sin DPS/undo, cuenta nueva, cuenta de menor progreso, lectura tardía,
  guardado tardío y login duplicado/tardío. Sintaxis JS y git diff --check correctos.
- QA visual local bloqueada por Chrome remoto: ERR_BLOCKED_BY_CLIENT en localhost.
  No se afirma prueba de cambio entre cuentas reales ni Safari/iPhone físico.
- Publicación VERIFICADA: https://blavionteam.github.io/lito-lab/.
  PR #7 fusionada en `9d9e2657fde31fe04d8ebe047985c28b08ef2229`; Actions
  `34155568732` terminó success. HTML y SW publicados coinciden byte a byte con
  esta corrección; SW ecos-v15. Chrome de escritorio: carga, entrada como invitado,
  saltar tutorial y ataque comprobados (vida 12 → 11), sin errores propios de la app.
  Solo aparecen errores de una extensión del navegador. Captura visual revisada.
  Las notas históricas inferiores sobre Pages 404 y Sites como única URL son obsoletas.
- No se cambia esquema/configuración de Supabase ni se fusiona PR #3.
- Roadmap de Drive no modificado en esta sesión; petición cambió a implementación directa.
- Siguiente agente: conservar este aislamiento al reconciliar PR #3 (hay cambios comunes
  en login/syncCloud). #6 sigue pendiente; esta corrección no resuelve guardados simultáneos.

## Arranque de bajo consumo de contexto

Antes de cualquier sesión de desarrollo, leer primero `START_HERE.md` y aplicar su protocolo. No reconstruir ni auditar el repositorio completo por defecto: sincronizar `main`, leer `START_HERE.md` + este archivo, identificar la tarea concreta y abrir solo los archivos estrictamente necesarios. Ampliar contexto únicamente si la tarea lo exige.

## Fuente de verdad y continuidad reconciliada

El roadmap vigente es el Excel original de Drive `148gnxlqyOBPhhzToJoa4ylJVDVpOPr2M`.
El 7 septiembre se reemplazó correctamente en el mismo ID: bloqueo de escritura
resuelto. Reconciliadas #20, #21, #22, #23, #26 y añadida #30, conservando las
descripciones de las 29 tareas originales. Recuentos: 20 hechas, 2 en curso,
8 sin empezar; 6 cruciales abiertas. START HERE de Drive enlaza esta continuidad
y la regla permanente de deploy.

## Producción

**Acceso recuperado mediante Sites:** https://lito-lab.blavion-7407.chatgpt.site
Publicación confirmada por Sites el 7 septiembre de 2026. Acceso privado del propietario
(requiere su cuenta de ChatGPT); no es un enlace público para otros jugadores.
Versión estable publicada: ecos-v13, desde main f5dbaa04321e96bd9b4a53e5684ab9b65fbdaacd.
El repo GitHub sigue privado. Pages continúa devolviendo 404 en la URL indicada por Miguel.
El backend Supabase es el mismo; iniciar sesión con nombre/PIN recupera la nube.
Los guardados de invitado no se trasladan entre dominios: exportar/importar copia.
La validación actual incluye publicación exitosa y archivos/JS correctos; no se ha probado
una sesión completa de juego en el navegador de producción.


- URL: https://blavionteam.github.io/lito-lab/
- GitHub Pages sirve `main` desde la raíz. No hay build de producción.
- PR #1 fusionada en `4d0a27a556ec2d1982a101e0dba93fcee9d1fbd5`, SW `ecos-v12`.
- Verificados en producción: carga, entrada como invitado e inventario nuevo.
- PR #2 fusionada en `f5d2384957036ea15104491ccb1bcd51581c107c`, SW `ecos-v13`.
- Verificado después del deploy: SW v13, pantalla de carga, perfil Invitado y estado sin insignias; cierre del diálogo y regreso al juego.

## Mejoras implementadas

| Roadmap | Cambio | Verificación |
| --- | --- | --- |
| #20 | Mochila compacta, cuatro huecos explícitos, ficha al tocar; equipar/quitar y venta con confirmación | 0/4 → 1/4 → 4/4, apertura y acciones en navegador |
| #21 | Resultado integrado de Equipar lo mejor: piezas, cambio CLIC/DPS y porcentajes, estado sin cambios | Equipar individual, automático y segunda pulsación sin cambios |
| #22 | Mascota fuera de la superficie de ataque | Coordenadas de mascota, etiqueta JEFE, nombre, vida y cronómetro sin intersección |
| #26 | Siete accesos móviles visibles; CLIC/DPS solo en Combate | Acceso a Mascotas, Talentos, Renacer, Ranking y Equipo |
| #30 (nuevo) | Pantalla breve de carga y marca Lito Lab | Arranque con salida de seguridad y prefers-reduced-motion |
| #23 | Nombre de la cuenta o Invitado, perfil y hasta tres insignias obtenidas, ordenables | Selección, límite de tres, reordenación; pruebas de persistencia |

QA móvil mediante documentos de 320×568, 390×844 y 430×932 en Chrome,
además de escritorio. Esto no sustituye una prueba en Safari/iPhone físico.
En pantallas muy cortas la arena permite scroll para evitar solapes.
La consola solo mostró mensajes de una extensión del navegador de pruebas.

## Roadmap sincronizado

Excel original guardado y verificado: versión ecos-v13, fuentes actuales,
recuentos automáticos y notas de QA. No usar el antiguo ZIP como continuidad.
La prueba de esta auditoría comprobó que el HTML público coincide con main
(blob e56cbf0e2ddff42e83a9b424d9b3479a5898c116) y sw.js sirve ecos-v13.
La moneda propia de #25 sigue pendiente. El fondo claro del popover ya existe;
no declarar completada la pasada visual global por ese cambio parcial.

## Próximas prioridades

1. Miguel autorizó continuar el desarrollo. Completar QA visual y publicación de la corrección #6 antes de nuevas mejoras.
2. #6: conflictos simultáneos de guardado. Existe snapshot `save_prev`, pero
   falta control atómico de versiones. No declarar resuelto el incidente de Alberto.
3. #29: cuenta admin. **No está creada y no hay Usuario/PIN entregables.**
   Se requiere rol real comprobado en backend, denegación a usuarios normales,
   secretos fuera del repositorio y pruebas positivas/negativas de autorización.
4. #28: habilidades: estados/activación y desbloqueos avanzados.
5. #8: el trigger calcula ranking a partir del `save` del cliente; esto no es
   protección antitrampas completa. Sigue En curso.
6. #9 pipeline con pruebas/revisión/secretos; #25 pulido visual global; #4 fusión.

No se cambió configuración ni esquema del backend. Se comprobó en Supabase
que las políticas de players limitan SELECT/UPDATE/INSERT a auth.uid() = id.
La publishable key en config.js es pública por diseño; no sustituirla por secretos.

## Desarrollo

`npm run dev` inicia un servidor estático sin dependencias. Para el navegador
de pruebas del entorno Work se usa el preview supervisado. Los archivos
`qa.html` y `qa-fixture.html`, si quedan en scratch, son pruebas locales con datos
ficticios: **no añadirlos a Git ni publicarlos**. Incrementar `const C` en sw.js
en cada publicación. Trabajar en rama y fusionar mediante PR después de QA.

## Reglas universales para cualquier agente

Estas reglas son obligatorias para ChatGPT Plus, ChatGPT Business, Claude Code
o cualquier otro agente que trabaje sobre Lito Lab:

1. **Antes de modificar nada, sincronizar siempre con la última versión del repositorio.**
   No trabajar sobre una copia antigua ni asumir que el estado local está actualizado.
2. **Después de cada sesión de desarrollo, actualizar este archivo de continuidad antes del commit final.**
   Debe reflejar qué se cambió, qué quedó verificado, qué sigue pendiente y cuál es el siguiente paso.
3. **GitHub es la memoria compartida y la fuente operativa común entre agentes.**
   La continuidad no debe depender de la memoria interna de una IA concreta.
4. Si existen cambios remotos nuevos o conflictos, reconciliarlos antes de continuar y nunca
   sobrescribir trabajo previo sin comprobarlo.

## Pendientes completos tras reconciliación

En curso: #6 guardado simultáneo; #8 ranking validado en backend.
Sin empezar: #4 fusión, #9 pipeline, #10 autenticación/recuperación,
#24 avisos de hitos, #25 visual/moneda propia, #27 cabecera,
#28 habilidades y desbloqueos, #29 admin.

Regla de cierre: código → versión ecos/sw.js cuando cambia el juego → main
→ Pages → comprobar app publicada → actualizar Excel y estas notas.
Esta sesión solo sincroniza documentación; no cambia el juego ni necesita
incrementar ecos-v13. Verificación en Safari/iPhone físico aún no acreditada.


## Sesión de desarrollo · guardado versionado preparado (7 septiembre 2026)

Implementación en PR #3 (borrador): https://github.com/BlavionTeam/lito-lab/pull/3
Rama `fix/versioned-cloud-saves`, commit `1f6f4b553d87562b2d12bf755c8213d23e01d7d8`.
Los archivos de código y pruebas descritos abajo están en esa rama, pendientes de fusión.

- Base sincronizada: main `ed4deaf06904804a4580aed856606ad4bbfb764d`.
- URL oficial corregida por Miguel: https://blavionteam.github.io/lito-lab/
  Devuelve HTTP 404 en esta sesión, también en Chrome. La URL anterior ya no es referencia.
- #6: cliente con comparación atómica de `save_version`, subidas serializadas,
  rechazo de sesiones con otro UID y bloqueo de forzado tras conflicto. En arranque,
  una base local obsoleta exige cargar la nube antes de subir; conserva cinco copias
  locales por cuenta y permite exportar la última. Si falla la copia, no reemplaza
  la partida local. El inicio de sesión usa la partida remota cuando existe.
- Backend: migración `players_save_version` APLICADA en Supabase
  `wccdwbdoxdejobtkdwqu`; SQL reproducible en `schema-save-version.sql`.
  Despliegue aditivo: filas antiguas con versión 0 mantienen compatibilidad con v13.
  Tras el primer guardado versionado, el trigger rechaza escrituras antiguas y
  upserts sin incremento. No afirmar protección completa mientras haya clientes
  v13 y filas que aún no hayan pasado a versión 1.
- Pruebas SQL con identidades ficticias dentro de BEGIN/ROLLBACK: escritura válida,
  escritura obsoleta descartada, update/upsert antiguo rechazado, snapshot conservado,
  aislamiento SELECT/UPDATE entre usuarios. Todos pasaron; sin filas de prueba persistentes.
- Scripts de `npm test` ejecutados directamente con Node: sintaxis inline, dos clientes con la misma versión, primera inserción,
  recarga/reintento, conflicto y forzado, cuota local agotada, recuperación y arranque
  desactualizado. Pasan. Las respuestas de red en estas pruebas son simuladas.
- QA visual NO completada: navegador remoto bloquea localhost y documentos data:.
  No se sustituyó por otra vía de navegador. No hay prueba real en Safari/iPhone.
- `ecos-v14` preparado en la rama; NO publicado ni verificado en producción.
  Abrir PR en borrador hasta completar QA y resolver Pages. No afirmar resuelto el
  incidente de Alberto ni cerrar #6. Última versión previamente acreditada: ecos-v13.
- Advisors: no aviso sobre la función nueva; persisten avisos previos en vista
  ranking (definer), search_path de players_guard y protección de contraseñas.
  No se cambió el ranking ni autenticación en esta sesión.
- Excel de Drive sigue pendiente de anotar esta sesión; sus recuentos no cambian.
- Siguiente acción: habilitar/verificar Pages manteniendo el repo privado, completar
  QA del flujo de dos sesiones, fusionar PR y comprobar sw.js ecos-v14 en la URL nueva.

## Publicación alternativa · continuidad operativa

- Site ID: `appgprj_6a9ed89f16f08191b70fb02bbc2a3b59`.
- URL activa: https://lito-lab.blavion-7407.chatgpt.site.
- Checkout Sites: `/workspace/sites/lito-lab`; manifest `.openai/hosting.json`, assets `dist/`.
- Fuente del juego sigue siendo `BlavionTeam/lito-lab`. Sites mantiene una copia de
  despliegue de los seis assets públicos de main; no editar ambas copias independientemente.
- Para republicar: sincronizar assets del commit de GitHub elegido hacia dist, conservar
  manifest/project_id, subir al repositorio Sites con credencial temporal, empaquetar y
  desplegar mediante sites-hosting. No crear otro Site ni guardar credenciales.
- PR #3 sigue en borrador (ecos-v14): no incluida en esta publicación de recuperación.
- Prioridad inmediata resuelta: Miguel tiene un enlace publicado para su cuenta. Si necesita
  acceso de otros jugadores, definir público/usuarios autorizados antes de cambiar audiencia.
- Pendiente: QA de la mejora #6, fusión de PR #3 y nueva publicación. Actualizar el Excel
  de Drive con esta recuperación y la publicación de ecos-v14 cuando ocurra.
