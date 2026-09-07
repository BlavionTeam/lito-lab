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
