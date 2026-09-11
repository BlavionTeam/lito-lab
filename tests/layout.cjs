// BUG-004: en un iPhone la fila de zona (Anterior / jefe / Siguiente) salía
// cortada. La causa no era el zoom: el combate estaba fijado con
// `min-height:270px; flex:1 0 270px`, así que no cedía altura, la arena
// desbordaba y su scroll interno dejaba la fila medio tapada por el panel del
// héroe. Chromium y WebKit a 844 px de alto no lo ven porque ahí sí cabe: esta
// regla se fija aquí, y el CI de navegador lo mide a la altura útil real.
const fs = require('node:fs'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');

// El bloque móvil que manda es el último, el que declara el scroll de la arena.
const inicio = html.indexOf('.arena{overflow-y:auto');
assert(inicio > 0, 'no se ha localizado el bloque móvil del combate');
const bloque = html.slice(inicio, html.indexOf('}', html.indexOf('.inventoryRow', inicio)));

assert.match(bloque, /\.stage\{min-height:0;flex:1 1 auto\}/,
  'el combate debe poder ceder altura: con flex-shrink 0 la fila de zona se sale de la pantalla');
assert.doesNotMatch(bloque, /\.stage\{[^}]*min-height:\s*\d+px/,
  'el combate no puede fijar un alto mínimo en px: en pantallas bajas expulsa la fila de zona');
assert.match(bloque, /\.enemy canvas\{[^}]*max-width:min\(/,
  'el enemigo no puede desbordar el ancho disponible');
assert.match(bloque, /\.enemy\{[^}]*min-height:\d+px/,
  'el enemigo necesita un mínimo jugable aunque el combate ceda altura');
// BUG-012: el porcentaje de altura no se resuelve contra un contenedor flexible, así que
// el lienzo tiene que medirse contra la altura que el combate le deja de verdad.
assert.match(bloque, /\.enemy canvas\{[^}]*height:100%/,
  'el enemigo toma la altura disponible del combate, no una medida propia que lo desborde');

// La fila de zona no encoge y respeta el mínimo táctil (BUG-003).
const movil = html.slice(html.indexOf('@media (max-width:760px){'), html.indexOf('.hero{flex:none'));
assert.match(movil, /\.nav\{flex:0 0 auto/, '.nav debe declarar flex:0 0 auto para no encogerse');
assert.match(movil, /\.nav button\{flex:1;min-height:44px/, 'los botones de zona mantienen el mínimo táctil de 44 px');
const enVh = movil.split('\n').filter(l => /\d+vh/.test(l.replace(/dvh/g, 'DVH')));
assert.deepEqual(enVh, [], `el layout móvil mide el alto en dvh, no en vh:\n${enVh.join('\n')}`);

// El emoji de la moneda (U+1FA99) no tiene glifo en iOS y se dibuja como un
// círculo gris; el oro usa uno que todas las versiones saben pintar.
assert.equal(html.includes('\u{1FA99}'), false, 'no uses 🪙: en iOS se ve como un círculo gris');

console.log('PASS combat yields height so the zone row always fits, keeps a playable enemy, and gold uses an icon iOS can draw');
