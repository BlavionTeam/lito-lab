// FEAT-028 · Lo que se pidió aquí es visual, así que hay que medirlo, no mirarlo: que la
// barra inferior no vuelva a cargarse, que las cajas no vuelvan a ser todas la misma, y
// que cada animación nueva siga existiendo y se pueda apagar.
const fs = require('node:fs'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));

// --- La barra inferior ---
{
  const nav = html.slice(html.indexOf('<nav class="mnav"'), html.indexOf('</nav>'));
  const botones = [...nav.matchAll(/data-v="([a-z]+)"/g)].map(m => m[1]);
  assert.equal(botones.length, 6, `la barra inferior se pidió menos cargada: hay ${botones.length} botones`);
  assert(!botones.includes('acc'), 'el ranking se movió fuera de la barra inferior');
  assert.match(html, /id="rankOpen"[^>]*data-v="acc"/, 'y vive en la cabecera, no se ha perdido');
  // Seis columnas en las tres medidas: una sola fila, sin la segunda que comía el combate.
  const cols = [...css.matchAll(/\.mnav\{[^}]*grid-template-columns:repeat\((\d+)/g)].map(m => +m[1]);
  assert(cols.length >= 3, `la barra se define en varias medidas, encontradas ${cols.length}`);
  for (const c of cols) assert.equal(c, 6, `una medida dejó la barra en ${c} columnas`);
  console.log('PASS la barra inferior baja a seis botones en una fila y el ranking sube a la cabecera');
}

// --- Las cajas dejan de ser la misma caja ---
{
  // La queja era literal: el mismo borde en cada botón y cada sección. Cada superficie
  // tiene ahora su propio trato, y ninguna repite el marco cerrado de antes.
  const regla = n => { const i = css.indexOf(n + '{'); return i < 0 ? '' : css.slice(i, css.indexOf('}', i)); };
  for (const sel of ['.card', '.item', '.stat']) {
    const r = regla(sel);
    assert(r, `${sel} debe seguir existiendo`);
    assert(!/border:1px solid var\(--line\)/.test(r), `${sel} vuelve a llevar el marco genérico de siempre`);
  }
  // Los radios ya no son todos iguales: es lo que da silueta propia a cada pieza.
  const radios = new Set(['button', '.card', '.item', '.stat'].map(s => (regla(s).match(/border-radius:([^;]+)/) || [])[1]));
  assert(radios.size >= 3, `las piezas deben tener siluetas distintas, solo hay ${radios.size} radios`);
  // Y el acento tiñe la fila entera, no solo el hueco del icono.
  assert.match(css, /\.item\{[^}]*var\(--acento/, 'la fila de lista debe tomar el color de lo que contiene');
  assert.match(css, /#listHeroes \.item:nth-child\(6n\+1\)/, 'los compañeros rotan de color por puesto');
  console.log('PASS cada superficie lleva su propio filo y silueta; ninguna repite el marco genérico');
}

// --- Las animaciones nuevas ---
{
  const nuevas = ['secIn', 'filaIn', 'navMark', 'tick', 'bought', 'filoIn', 'sombra', 'restos'];
  for (const a of nuevas) assert(css.includes('@keyframes ' + a), `falta la animación ${a}`);
  // Ninguna puede quedar fuera del interruptor de movimiento reducido: es accesibilidad,
  // no un detalle. Se comprueba que cada clase animada aparece en algún bloque que lo apaga.
  const reduce = [...css.matchAll(/@media \(prefers-reduced-motion:reduce\)\{([\s\S]*?)\}\s*\n/g)].map(m => m[1]).join(' ')
    + css.slice(css.indexOf('prefers-reduced-motion'));
  for (const sel of ['.sec', '.list > *', '.val.tick', '.item.bought', '.restos', '.enemy::after']) {
    assert(reduce.includes(sel), `${sel} se anima pero no se apaga con movimiento reducido`);
  }
  console.log(`PASS las ${nuevas.length} animaciones nuevas existen y todas se apagan con movimiento reducido`);
}

// --- El enemigo aprovecha el alto que la barra inferior ha liberado ---
{
  const tope = css.match(/\.enemy canvas\{width:auto;height:100%;max-width:min\(\d+vw,(\d+)px\)/);
  assert(tope, 'el enemigo debe seguir acotado para no desbordar el combate');
  assert(+tope[1] >= 170, `el enemigo se quedó en ${tope[1]}px pese al alto recuperado`);
  console.log(`PASS el enemigo sube a ${tope[1]}px con el alto que libera la barra inferior`);
}

// --- El volumen de las criaturas ---
{
  const dib = html.slice(html.indexOf('function drawMob'), html.indexOf('const fresh ='));
  assert(dib.includes('const prof ='), 'las criaturas necesitan profundidad para no salir planas');
  assert(/Math\.hypot\([^)]*lx/.test(dib), 'y una luz con dirección, no un degradado por altura');
  assert(dib.includes('brillo'), 'y un brillo que marque por dónde entra la luz');
  // La queja era que se ven pobres: sin apéndices, todas acababan siendo la misma bola,
  // porque el suavizado del contorno se comía patas, cuernos y tentáculos de un píxel.
  assert(dib.includes('ap[y][x]'), 'los apéndices deben quedar fuera del suavizado del cuerpo');
  // Y la cara tiene que variar: número de ojos, tamaño y cuatro bocas distintas.
  assert(/ojos = /.test(dib) && /ojos === 3/.test(dib), 'el número de ojos debe variar con la criatura');
  assert(/forma === 0/.test(dib) && /forma === 2/.test(dib), 'debe haber varias bocas, no una sola raya');
  assert(/tipo === 'acorazado'[\s\S]*?marca\(/.test(dib), 'cada arquetipo necesita su textura de superficie');
  // Y con sitio para el detalle: a 24 píxeles de lado no cabe nada de esto.
  const res = dib.match(/const N = boss \? (\d+) : (\d+)/);
  assert(res && +res[2] >= 30, `el lienzo de la criatura se quedó en ${res && res[2]} píxeles de lado`);
  console.log('PASS las criaturas traen luz, volumen, apéndices propios, textura y caras distintas');
}

// --- FEAT-029 · Los sellos del perfil ---
{
  // Se pidió que los deje el jefe de cada diez zonas, no cada zona: el perfil llegó a ser
  // una lista de sesenta insignias idénticas.
  const js = html.slice(html.indexOf('const HITO_ZONA'), html.indexOf('const earnedBadges'));
  // El acto es la unidad de historia, así que el sello cae en su jefe final y se ata a
  // THEMES: si algún día cambian los temas del acto, el hito lo sigue solo.
  assert.match(html, /const HITO_ZONA = THEMES\.length;/, 'el sello cae en el jefe final de cada acto');
  assert(js.includes('z += HITO_ZONA'), 'la lista avanza de acto en acto');
  assert(/Acto \$\{acto\}/.test(js) && js.includes('Cierra el acto'), 'y cada sello dice de qué acto es');
  // Y la lista los trae todos, no solo los conseguidos: es lo que permite ver lo que falta.
  assert(js.includes('tengo:S.trophies.includes(z)'), 'cada sello sabe si lo tienes o no');
  assert(js.includes('hecho:') && js.includes('meta:'), 'y cuánto llevas de él, para el progreso');
  console.log('PASS el sello cae en el jefe final de cada acto y la lista trae también los que faltan');
}
{
  // Redondos, nunca rectangulares, y con el aro de su rareza.
  const sello = css.slice(css.indexOf('.sello{'), css.indexOf('}', css.indexOf('.sello{')));
  assert(/border-radius:50%/.test(sello), 'los sellos se pidieron redondos, no rectangulares');
  for (let r = 0; r <= 5; r++) assert(css.includes(`.sello.r${r}{`), `falta el color de la rareza r${r}`);
  assert(/\.sello\.r5\{[^}]*animation/.test(css), 'la exótica debe destacar sobre las demás');
  // El bloqueado se ve en sombra pero su texto sigue siendo legible: ahí va lo que falta.
  assert(/\.profileBadge\.bloqueado \.sello\{[^}]*grayscale/.test(css), 'el sello que no tienes va en sombra');
  assert(css.includes('.badgeBar>i'), 'y con una barra de lo que llevas');
  // Ninguna caja rectangular de las de antes puede volver.
  assert(!/\.profileShowcase span\{[^}]*border-radius:12px/.test(css), 'la vitrina no vuelve a ser rectangular');
  console.log('PASS los sellos son redondos, con aro por rareza, y el que falta va en sombra con su progreso');
}
{
  // La cruz de cerrar, en todos los diálogos. Antes solo la tenía la forja.
  const dialogos = [...html.matchAll(/<dialog[^>]*class="[^"]*gameDialog[^"]*"[^>]*id="([^"]+)"[\s\S]*?<\/dialog>/g)];
  assert(dialogos.length >= 10, `deben seguir estando todos los diálogos, hay ${dialogos.length}`);
  for (const d of dialogos) {
    const cruces = [...d[0].matchAll(/<button[^>]*>✕<\/button>/g)];
    assert.equal(cruces.length, 1, `el diálogo ${d[1]} tiene ${cruces.length} cruces: dos se tapan entre sí`);
    assert(/class="dialogX"/.test(cruces[0][0]), `la cruz de ${d[1]} debe llevar la clase común`);
  }
  // Cableada de una vez para todas, no diálogo a diálogo: así una ventana nueva la hereda.
  assert.match(html, /querySelectorAll\('\.dialogX'\)[\s\S]{0,120}closest\('dialog'\)/, 'la cruz debe cerrar su propio diálogo de forma genérica');
  assert(/\.dialogX\{[^}]*min-height:44px/.test(css), 'la cruz mantiene el mínimo táctil');
  console.log(`PASS los ${dialogos.length} diálogos tienen cruz de salida de 44 px, cableada de forma genérica`);
}
