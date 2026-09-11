// FEAT-024 · Cada criatura nace con un arquetipo de cuerpo, así que el bestiario tiene
// siluetas distintas y no sesenta veces la misma bola.
// BUG-011 · Ninguna puede salir aplastada, vacía ni fuera del lienzo.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const dibujo = html.slice(html.indexOf('function rng(seed)'), html.indexOf('const fresh = ()'));

// Lienzo de mentira: apunta cada píxel pintado en una rejilla para poder medir la figura.
function lienzo(){
  const px = new Set();
  let width = 0, height = 0, fillStyle = '#000';
  return {
    px,
    set width(v){ width = v; px.clear(); }, get width(){ return width; },
    set height(v){ height = v; }, get height(){ return height; },
    getContext(){
      return {
        set fillStyle(v){ fillStyle = v; }, get fillStyle(){ return fillStyle; },
        clearRect(){ px.clear(); },
        fillRect(x, y, w, h){ for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) px.add(`${x+i},${y+j}`); },
      };
    },
  };
}
const ctx = {console};
vm.runInNewContext(dibujo + '\nthis.drawMob = drawMob; this.ARQUETIPOS = ARQUETIPOS; this.rng = rng;', ctx);

// Los nombres reales del juego: doce temas con cuatro criaturas y un jefe cada uno.
const nombres = [...html.matchAll(/\['b-[a-z]+','([^']+)'\]/g)].map(m => m[1]);
assert(nombres.length >= 50, `el bestiario del juego debe tener criaturas de sobra, hay ${nombres.length}`);

function medir(nombre, boss){
  const cv = lienzo();
  ctx.drawMob(cv, nombre + '|1', '#5eea8a', boss);
  const N = boss ? 32 : 24;
  const puntos = [...cv.px].map(s => s.split(',').map(Number));
  const xs = puntos.map(p => p[0]), ys = puntos.map(p => p[1]);
  return {N, n:puntos.length, minX:Math.min(...xs), maxX:Math.max(...xs), minY:Math.min(...ys), maxY:Math.max(...ys),
    set:new Set(puntos.map(p => p.join(',')))};
}

let aplastadas = 0, estrechas = 0;
for (const nombre of nombres) for (const boss of [false, true]) {
  const m = medir(nombre, boss);
  assert(m.n > m.N*3, `${nombre}${boss ? ' (jefe)' : ''} sale casi vacía: ${m.n} píxeles`);
  assert(m.minX >= 0 && m.maxX < m.N && m.minY >= 0 && m.maxY < m.N,
    `${nombre}${boss ? ' (jefe)' : ''} se sale del lienzo`);
  const ancho = m.maxX - m.minX + 1, alto = m.maxY - m.minY + 1;
  // BUG-011: el defecto que se veía en el iPhone era exactamente esto, un cuerpo mucho
  // más ancho que alto. Se deja margen para alas y patas, pero no para tortitas.
  assert(ancho / alto <= 1.75, `${nombre}${boss ? ' (jefe)' : ''} sale aplastada: ${ancho}×${alto}`);
  assert(alto / ancho <= 2.6, `${nombre}${boss ? ' (jefe)' : ''} sale como un palo: ${ancho}×${alto}`);
  if (ancho / alto > 1.4) aplastadas++;
  if (alto / ancho > 1.9) estrechas++;
  // Toda criatura es simétrica: es lo que hace que se lea como un ser vivo y no como ruido.
  const espejo = [...m.set].every(p => { const [x, y] = p.split(',').map(Number); return m.set.has(`${m.N-1-x},${y}`); });
  assert(espejo, `${nombre}${boss ? ' (jefe)' : ''} no es simétrica`);
}

// El mismo nombre dibuja siempre la misma criatura: el jugador la reconoce al volver.
const a = medir(nombres[0], false), b = medir(nombres[0], false);
assert.equal([...a.set].sort().join('|'), [...b.set].sort().join('|'), 'la misma criatura se dibuja igual cada vez');
const otra = medir(nombres[1], false);
assert.notEqual([...a.set].sort().join('|'), [...otra.set].sort().join('|'), 'dos criaturas distintas no comparten silueta');

// Y hay variedad de verdad: siluetas anchas, estrechas y de todo.
assert(ctx.ARQUETIPOS.length >= 6, `el generador debe traer varios arquetipos, hay ${ctx.ARQUETIPOS.length}`);
const siluetas = new Set(nombres.map(n => {
  const m = medir(n, false);
  return `${m.maxX - m.minX}x${m.maxY - m.minY}`;
}));
assert(siluetas.size >= 8, `las criaturas deben tener siluetas distintas, solo hay ${siluetas.size}`);

console.log(`PASS las ${nombres.length} criaturas salen enteras, simétricas y con ${siluetas.size} siluetas distintas; ninguna aplastada`);
