# CONTINUAR · handoff activo

**Actualizado:** 2026-09-10 · **Agente:** sesión Claude Code

## 1. Estado / versión

**ecos-v23**: identidad propia y administración real.
FEAT-019 sustituye los 109 emojis del sistema por un sprite propio de 84 glifos SVG.
FEAT-020 convierte el sello de la marca en un emblema y da acento de color a cada sección.
FEAT-018 da privilegios de verdad a la cuenta admin: consola de recursos y directorio de
jugadores con ficha completa. FEAT-021 amplía la ficha pública de un rival del ranking.
TECH-003 deja de fiarse del `save` del cliente para publicar puntuación.
`sw.js` sirve `ecos-v23`. Backend: migraciones **v6** y **v7** ya aplicadas en Supabase.

## 2. Último commit estable

`4359cc2` (main), ecos-v22 publicada por el PR #22 con el CI en verde.
Rollback: revertir el merge que publique ecos-v23, recuperando `4359cc2`.
No hay tags `ecos-v*` en el remoto: el punto de rollback es el commit, no una etiqueta.

## 3. IDs terminados

TECH-005..007 siguen Hecho. FEAT-003..017 siguen Verificado.
Nuevos en ecos-v23: FEAT-018, FEAT-019, FEAT-020, FEAT-021.

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

## 6. Próxima acción exacta

1. Confirmar en un iPhone físico: BUG-002, la iconografía nueva (que los glifos se
   dibujan en Safari real) y el panel de administración a 390 px. Es lo que Playwright
   no puede acreditar.
2. Decidir si TECH-003 se cierra como mitigación aceptada o se lleva a validación real
   en servidor (simular la partida). Está documentado arriba con sus límites.
3. Dos sesiones reales simultáneas (FEAT-001).
4. Reconciliar cierres #24/#35/#37/#38, #4, #25, #27 y #29 en el Excel original de Drive.

## 7. Tests / verificaciones

`npm run check` OK y `npm test` con 49 comprobaciones en verde. Dos suites nuevas:
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

ecos-v22 sigue siendo lo publicado hasta que se mergee ecos-v23 a `main`.
Pages sirve la raíz. Sin comprobación HTTP del sitio publicado: esta sesión no tiene
salida de red hacia Pages.

## 9. Archivos relevantes

`index.html` (sprite de glifos, panel de administración, ficha de rival), `sw.js`,
`migration-v6.sql`, `migration-v7.sql`, `tests/iconografia.cjs`, `tests/admin.cjs`,
`tests/browser.cjs`, documentos de continuidad.

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
