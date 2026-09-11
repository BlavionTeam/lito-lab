# CONTINUAR · handoff activo

**Actualizado:** 2026-09-11 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v24**: desafíos, rareza exótica y dos defectos vistos en un iPhone real.
FEAT-023 convierte el antiguo historial de hitos en un panel de desafíos con tres frentes
(progresión permanente, tanda diaria y tanda semanal) y recompensas que se cobran.
FEAT-022 añade la rareza **Exótica**, la cima de la escala, en verde.
BUG-011 quita los enemigos aplastados y BUG-012 el aviso cortado bajo la barra del jefe.
Antes, en ecos-v23: FEAT-018 (administración real), FEAT-019 (84 glifos propios en lugar
de emojis), FEAT-020 (emblema y pulido) y FEAT-021 (ficha pública de rival).
`sw.js` sirve `ecos-v24`. Backend: migraciones **v6** y **v7** aplicadas en Supabase.

## 2. Último commit estable

`65d61ec` (main), ecos-v24 publicada por el PR #26 con las dos suites del CI en verde.
Rollback: revertir ese merge, recuperando `9c34f6f` (ecos-v23).
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005..007 siguen Hecho. FEAT-003..021 siguen Verificado.
Nuevos en ecos-v24: BUG-011, BUG-012, FEAT-022, FEAT-023.

## 4. IDs en curso

- FEAT-001: falta prueba real con dos sesiones simultáneas.
- FEAT-002 / TECH-002: falta iPhone físico. TECH-001: antitrampas depende de TECH-003.
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

1. Confirmar en un iPhone físico: BUG-011 y BUG-012 (que el jefe ya no sale aplastado y
   que el aviso del combate no se corta), BUG-002, la iconografía nueva y el panel de
   administración a 390 px. Es lo que Playwright no puede acreditar.
2. Decidir si TECH-003 se cierra como mitigación aceptada o se lleva a validación real
   en servidor (simular la partida). Está documentado arriba con sus límites.
3. Dos sesiones reales simultáneas (FEAT-001).
4. Reconciliar cierres #24/#35/#37/#38, #4, #25, #27 y #29 en el Excel original de Drive.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con 55 comprobaciones en verde. Suite nueva en ecos-v24:
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

ecos-v24 publicada por merge a `main` (`65d61ec`, PR #26) con las dos suites del CI en
verde, incluida la QA visual real en Chromium y WebKit. Pages sirve la raíz.
Sin comprobación HTTP del sitio publicado: esta sesión no tiene salida de red hacia Pages.

## 9. Archivos relevantes

`index.html` (sprite de glifos, panel de administración, ficha de rival), `sw.js`,
`migration-v6.sql`, `migration-v7.sql`, `tests/iconografia.cjs`, `tests/admin.cjs`,
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
