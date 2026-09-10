// FEAT-019 · Los glifos de Lito son la identidad del juego: ningún emoji del sistema y
// ningún `<use>` que apunte a un símbolo que no existe (se vería un hueco en blanco).
const fs = require('node:fs'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');

// 1) Cero emojis: el aspecto no puede depender de la fuente del sistema operativo.
const emojis = html.match(/\p{Extended_Pictographic}/gu) || [];
assert.deepEqual([...new Set(emojis)], [],
  `la interfaz no debe usar emojis del sistema: ${[...new Set(emojis)].join(' ')}`);

// 2) Todo símbolo referenciado existe en el sprite.
const definidos = new Set([...html.matchAll(/<g id="g-([a-z0-9-]+)"/g)].map(m => m[1]));
assert(definidos.size > 60, `el sprite debe traer la colección completa, hay ${definidos.size}`);
const usados = new Set([...html.matchAll(/href="#g-([a-z0-9-]+)"/g)].map(m => m[1]));
for (const nombre of usados) assert(definidos.has(nombre), `falta el glifo #g-${nombre} en el sprite`);

// 3) Los datos del juego guardan el nombre del glifo, nunca marcado: así el mismo icono
//    se puede pintar en una lista, en un diálogo o en la barra inferior sin duplicarlo.
const bloque = html.slice(html.indexOf('const THEMES = ['), html.indexOf('/* ---------- procedural pixel mobs'));
for (const m of bloque.matchAll(/icon:'([^']+)'/g)) {
  assert(definidos.has(m[1]), `el dato icon:'${m[1]}' no corresponde a ningún glifo del sprite`);
}
for (const m of bloque.matchAll(/\['([a-z][a-z0-9-]*)','/g)) {
  assert(definidos.has(m[1]), `el dato ['${m[1]}', …] no corresponde a ningún glifo del sprite`);
}

// 4) Los glifos heredan color y tamaño del texto: si se fijan en px dejan de encajar
//    en la cabecera, en una tarjeta de rareza y en la barra inferior a la vez.
const clase = html.match(/\.gi\{[^}]+\}/);
assert(clase, 'falta la clase .gi que dibuja los glifos');
assert.match(clase[0], /width:1em;height:1em/, 'el glifo se mide en em, no en px');
assert.match(clase[0], /stroke:currentColor/, 'el glifo hereda el color del texto que acompaña');

// 5) El sello de marca no puede volver a ser una letra en una caja: es un símbolo propio.
assert(definidos.has('emblema'), 'falta el emblema de Lito Lab');
assert.equal((html.match(/<svg class="brandMark"/g) || []).length, 3,
  'el sello debe estar en la cabecera, en la pantalla de inicio y en el arranque');

console.log('PASS los glifos propios cubren toda la interfaz: sin emojis, sin referencias rotas y escalando con el texto');
