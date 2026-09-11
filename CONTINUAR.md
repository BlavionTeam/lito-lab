# CONTINUAR · handoff activo

**Actualizado:** 2026-09-11 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v29**: los sellos del perfil y la salida de los diálogos.
FEAT-029 rehace las insignias: las dejaba **cada zona**, así que el perfil acababa siendo
una lista de sesenta iguales; ahora solo las deja el **jefe de cada diez zonas** más cinco
gestas grandes. Son **sellos redondos**, nunca rectángulos, con el color y el aro de su
rareza —de épico hacia arriba el aro brilla y la exótica late—, y la lista trae **también
los que faltan**, en sombra y con lo que queda para cada uno («te faltan 6 zonas») y su
barra. Los conseguidos salen arriba; de los que faltan, primero el más cercano.
Y la **cruz de salir**: solo la tenía la forja. Ahora la llevan los diez diálogos, de 44 px
y cableada de una vez para todas (`.dialogX` cierra el `<dialog>` que la contiene), así que
una ventana nueva la hereda sin tocar nada.

Antes, en **ecos-v28**: la tanda de diseño que se pidió por su nombre — bordes repetitivos,
mobs pobres, pocas animaciones y la barra inferior cargada.
FEAT-028 toca los cuatro frentes:
- **Bordes**: cada superficie deja el mismo `1px solid var(--line)` y toma su propio trato.
  Las tarjetas llevan chaflán y filo de color, los paneles un filo de marca arriba, los
  botones filo superior e inferior en vez de marco cerrado, y las filas de lista se tiñen
  del color de lo que contienen (los compañeros rotan de color por puesto).
- **Criaturas**: el lienzo sube de 24 a 30 píxeles de lado (40 los jefes), la luz pasa a ser
  direccional con volumen y brillo, los apéndices dejan de comérselos el suavizado —era lo
  que convertía los siete arquetipos en la misma bola—, cada arquetipo estrena textura
  (placas, segmentos, vetas, manchas) y la cara varía en número de ojos y en cuatro bocas.
- **Animaciones**: ocho nuevas (entrada de vista y de lista, marca de la barra inferior,
  tirón del recurso al cobrar, destello de compra, filo del panel, sombra del suelo y los
  restos del enemigo derrotado). Todas se apagan con movimiento reducido.
- **Barra inferior**: de siete botones en dos filas a seis en una. El ranking sube a la
  cabecera. El combate recupera el alto: el enemigo pasa de 140 a 178 px de tope.
De propina, seis controles por debajo del mínimo táctil que la auditoría de v27 no llegó a
recorrer (selector de cantidad, huevo, reparto de talentos y renacer): 0 fallos de contraste
y 0 botones cortos en las seis vistas.

Antes, en **ecos-v27**: auditoría completa, paleta cálida y un ajuste de balance con datos.
TECH-008 mide rendimiento, accesibilidad, balance y deuda técnica sobre el código real y
deja el informe en `docs/AUDITORIA.md`. Dos hallazgos se corrigen aquí: el único control
por debajo del mínimo táctil (los botones «Detalles»), y las almas que regalaba la
progresión, que a un jugador de zona 55 le daban 16 de golpe teniendo 2 (FEAT-027: ahora
solo pagan almas los dos últimos escalones de cada cadena, y son 2).
FEAT-026 cambia la paleta: la base deja el azul marino y pasa a berenjena/carbón, en la
familia del emblema, y el cian que salpicaba la interfaz pasa a violeta.
**El hallazgo más serio queda propuesto, no aplicado**: la ruta de solo compañeros no pasa
del jefe de zona 1 (se queda 24,5× corta). Está en `docs/AUDITORIA.md` §4.1 y §6.1.

Antes, en **ecos-v26**: recuperar la cuenta sin el PIN (#10, la última pendiente del backlog).
FEAT-025 entrega al crear la cuenta un código de rescate de un solo uso; el servidor solo
guarda su hash bcrypt y con él se puede fijar un PIN nuevo sin conocer el anterior. Se
renueva desde el panel de cuenta y se canjea desde «He olvidado el PIN» en la entrada.
Migración **v9**.

Antes, en **ecos-v25**: bestiario con siluetas propias y la auditoría del backend aplicada.
FEAT-024 da a cada criatura un arquetipo de cuerpo (bestia, alada, acorazada, tentaculada,
espectro, serpiente o blob), así que el bestiario deja de ser sesenta veces la misma bola.
TECH-001 aplica la auditoría: el trigger del ranking corre con `search_path` fijo y las
políticas RLS dejan de evaluar `auth.uid()` una vez por fila (migración **v8**).
Y en el cliente, cobrar recompensas en lote ya no guarda y sube a la nube una vez por
recompensa, y encadena los escalones de progresión que quedan superados.

Antes, en **ecos-v24**: desafíos, rareza exótica y dos defectos vistos en un iPhone real.
FEAT-023 convierte el antiguo historial de hitos en un panel de desafíos con tres frentes
(progresión permanente, tanda diaria y tanda semanal) y recompensas que se cobran.
FEAT-022 añade la rareza **Exótica**, la cima de la escala, en verde.
BUG-011 quita los enemigos aplastados y BUG-012 el aviso cortado bajo la barra del jefe.
Antes, en ecos-v23: FEAT-018 (administración real), FEAT-019 (84 glifos propios en lugar
de emojis), FEAT-020 (emblema y pulido) y FEAT-021 (ficha pública de rival).
`sw.js` sirve `ecos-v29`. Backend: migraciones **v6**, **v7**, **v8** y **v9** aplicadas en Supabase.

## 2. Último commit estable

`246ea5f` (main), ecos-v28 publicada por los PR #32 y #33 con el CI en verde.
Rollback de ecos-v29: revertir el merge que la publique, recuperando `246ea5f`.
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005..007 siguen Hecho. FEAT-003..023 siguen Verificado.
Nuevos en ecos-v25: FEAT-024 (y la auditoría del backend, dentro de TECH-001).
Nuevo en ecos-v26: FEAT-025, que cierra #10 del backlog de Drive.
Nuevos en ecos-v27: FEAT-026, FEAT-027 y TECH-008 (la auditoría).
Nuevo en ecos-v28: FEAT-028 (la tanda de diseño).
Nuevo en ecos-v29: FEAT-029 (sellos del perfil y cruz de salida).

## 4. IDs en curso

- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.
- FEAT-025: el canje del código está probado contra el backend real por SQL y contra el
  simulado en el CI, pero nadie ha recuperado todavía una cuenta de verdad desde el móvil.
- TECH-003: mitigado, no cerrado. Ver §5.

## 5. Bugs conocidos

Ninguno abierto. Lo que sigue sin acreditar:

- BUG-002 (selección/zoom en iOS) sigue sin confirmación en Safari real.
- De ecos-v21/v22: mob dorado al volver de una pestaña, fluidez del HUD, selector de
  actos a 320 px y renta de segundo plano en la PWA de iOS.
- **TECH-003 está mitigado, no resuelto.** El servidor ya no acepta el tiempo jugado que
  declara el navegador: lleva su propio crédito, que crece con el reloj real, como mucho
  15 min por guardado y 6 h por día natural. Publicar zona 9999 de golpe ya no es posible
  (se recorta a lo que el crédito sostiene y la cuenta queda marcada). Lo que **sigue
  abierto**: un tramposo paciente puede escalar despacio, porque esperar tiempo real
  genera crédito. Cerrarlo del todo exige simular la partida en servidor.
- Los glifos son SVG con `<use>`: si algún navegador antiguo no resolviera `href` sin
  `xlink:href`, se verían huecos. Chromium y WebKit actuales lo resuelven; no está
  probado en un iPhone físico.
- BUG-012 se midió con Chromium a 844, 800, 760, 740, 700 y 660 px de alto: el aviso ya
  cabe en todos. En un iPhone con la barra de direcciones visible el enemigo se queda
  pequeño (unos 90 px a 760): es el precio de que no se corte nada, y conviene mirarlo
  en el dispositivo.
- Las recompensas de los desafíos se pagan en oro medido en enemigos de tu zona (un
  diario ≈ 320 enemigos) y en almas contadas (2-3 por semanal, 1-4 por escalón de
  progresión). No está medido en una partida larga: si infla la economía, los números
  están todos juntos en `POOL_DIA`, `POOL_SEMANA` y `CADENAS`.

## 6. Próxima acción exacta

0. **Decidir sobre el hallazgo de la auditoría**: la ruta de solo compañeros no pasa del
   jefe de zona 1. Propuesta concreta en `docs/AUDITORIA.md` §6.1 (subir la potencia base
   de Escudero y Arquera y volver a correr `npm run balance` hasta que esa ruta llegue al
   menos a la zona 12). Toca balance, así que necesita el visto bueno del propietario.
1. Confirmar en un iPhone físico: BUG-011 y BUG-012 (que el jefe ya no sale aplastado y
   que el aviso del combate no se corta), BUG-002, la iconografía nueva y el panel de
   administración a 390 px. Es lo que Playwright no puede acreditar.
2. Decidir si TECH-003 se cierra como mitigación aceptada o se lleva a validación real
   en servidor (simular la partida). Está documentado arriba con sus límites.
3. Dos sesiones reales simultáneas (FEAT-001).
4. Reconciliar cierres #24/#35/#37/#38, #4, #25, #27 y #29 en el Excel original de Drive.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con 59 comprobaciones en verde. Suite nueva en ecos-v26:
`tests/rescate.cjs` (el código no se repite en cuatrocientas tiradas, evita los caracteres
que se confunden al copiarlo, el canje valida nombre, formato y PIN antes de llamar a
nadie, y el código nunca se guarda en el navegador). En el CI de navegador: renovar el
código desde la cuenta, que coincida con lo guardado en el servidor, que uno falso no
abra nada y que el bueno canjee un PIN nuevo. Suite nueva en ecos-v25:
`tests/criaturas.cjs`, que dibuja las 60 criaturas del juego sobre un lienzo simulado y
mide cada una: ninguna sale vacía, aplastada, fuera del lienzo ni asimétrica, la misma
criatura se dibuja siempre igual y el bestiario tiene 23 siluetas distintas. Es la
regresión real de BUG-011, que hasta ahora solo se podía ver a ojo. Suite nueva en ecos-v24:
`tests/desafios.cjs` (la tanda del día es estable y arranca a cero, cambiar de día la
renueva, una recompensa se cobra una sola vez, las cadenas avanzan escalón a escalón,
una partida anterior a los desafíos arranca intacta y la exótica cierra la escala).
De ecos-v23 siguen las dos suites:
`tests/iconografia.cjs` (cero emojis, ningún `<use>` roto, ningún nombre de glifo impreso
como texto, el glifo escala con el texto y el emblema está en sus tres sitios) y
`tests/admin.cjs` (la consola solo existe con rol confirmado y backend que la soporta, y
cada acción cambia la partida de verdad).
CI de navegador ampliado con el bloque de administración (consola, viaje de zona,
directorio, cuenta marcada por puntuación recortada, partida en bruto) y con la ficha
pública de un rival, siempre con el backend simulado por red, sin tocar producción.
Ejecutado en esta sesión con Chromium a 320/390/430/1280 px: todo verde, incluida la PWA.
Backend verificado por SQL en el proyecto real: un jugador no ve fichas ajenas ni el
`save` de otro; el admin sí; una partida que declara zona 9999 se publica recortada a lo
que el crédito permite y queda anotada; el `save` del jugador nunca se altera.
No acreditado: iPhone físico, WebKit en esta sesión (solo Chromium: el motor de Safari lo
mide el CI), dos sesiones reales simultáneas, y la comprobación HTTP del sitio publicado.

## 8. Deploy actual

ecos-v28 publicada por merge a `main` (`246ea5f`, PR #32 y #33). ecos-v29 queda pendiente
de merge en el momento de escribir esto. Pages sirve la raíz.
Sin comprobación HTTP del sitio publicado: esta sesión no tiene salida de red hacia Pages.

## 9. Archivos relevantes

`index.html` (sprite de glifos, panel de administración, ficha de rival), `sw.js`,
`migration-v6.sql`, `migration-v7.sql`, `migration-v8.sql`, `migration-v9.sql`,
`tests/rescate.cjs`, `tests/criaturas.cjs`,
`tests/iconografia.cjs`, `tests/admin.cjs`,
`tests/desafios.cjs`, `tests/layout.cjs`, `tests/browser.cjs`, documentos de continuidad.

## 10. Bloqueos reales

Sin salida HTTP hacia GitHub Pages desde esta sesión (proxy 403): el backend se
administró por MCP y el cliente se probó con la red simulada. Google Fonts tampoco es
alcanzable desde aquí, así que el QA local bloquea esa petición; en el CI no hace falta.
El remoto sigue sin ningún tag `ecos-v*`: con `--porcelain` el proxy devuelve HTTP 403 al
escribir `refs/tags/*`, mientras que el push de ramas pasa. La regla 3 de `AGENTS.md`
sigue sin cumplirse para v16..v23 y hace falta una sesión con salida real para empujar tags.
Bloquear el pellizco (BUG-002) tiene un coste de accesibilidad conocido y fue una
petición explícita. El PIN de la cuenta admin no está en el repositorio y no debe
escribirse aquí.
