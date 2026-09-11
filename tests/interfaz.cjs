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
  // El clon de restos vive dentro de .enemy, que ya estiliza sus canvas: su regla tiene
  // que ganar en especificidad o se queda en el flujo y se sale de la arena.
  assert(css.includes('.enemy canvas.restos{'), 'la regla de los restos debe ganar a la de .enemy canvas');
  assert(/\.enemy canvas\.restos\{[^}]*position:absolute/.test(css), 'y dejarlos en absoluto sobre la arena');
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

// --- FEAT-030 · Lo que se vio en un iPhone real ---
{
  // El perfil y las habilidades compartían caja. Cada uno tiene ahora la suya.
  assert.match(html, /class="heroBloque heroCard"/, 'el perfil vive en su propia tarjeta');
  assert.match(html, /class="sec heroBloque heroSkills"/, 'y las habilidades en la suya');
  assert(/\.heroCard\{[^}]*border-left/.test(css) && /\.heroSkills\{[^}]*border-left/.test(css),
    'cada tarjeta necesita su filo, o se siguen leyendo como un bloque solo');
  // El layout del móvil se ataba al número de hijo del panel: envolver el perfil destapó
  // «Equipado» y le robó al combate cien píxeles. Ya no puede volver a pasar.
  assert(!/\.hero[^{]*nth-of-type/.test(css), 'el panel del héroe no puede depender de la posición de sus hijos');
  assert(css.includes('.hero .heroExtra,.hero h3{display:none}'), 'las secciones de escritorio se ocultan por nombre');
  console.log('PASS el perfil y las habilidades son tarjetas distintas, y el panel no depende del orden de sus hijos');
}
{
  // El mapa de zonas existía pero se abría tocando el título: nadie lo encontraba.
  assert.match(html, /id="zoneMap"/, 'el mapa necesita un botón que se vea');
  assert(/>\s*Mapa\s*</.test(html), 'y que se llame Mapa');
  assert(!css.includes("content:' ▾'"), 'sin flechita en el título, que ya no abre nada');
  // Y el progreso dentro de la zona: diez puntitos de 6 px pasan a barra con el jefe al final.
  assert(css.includes('.stageTrack{'), 'el progreso de la zona se muestra como barra');
  assert(/\.stg\.boss\{/.test(css), 'con el jefe marcado al final del recorrido');
  assert(html.includes('class="stg'), 'y el render debe pintar esos tramos');
  console.log('PASS el mapa se abre desde un botón visible y el progreso de zona es una barra con su jefe');
}

// --- FEAT-031 · Segunda ronda sobre el dispositivo ---
{
  // El avatar era un recuadro con marco y sombra; se pidió el glifo suelto.
  assert(/\.heroHead \.av\{[^}]*border:0/.test(css), 'el avatar del perfil va sin recuadro');
  assert(/\.heroHead \.av\{[^}]*background:none/.test(css), 'ni fondo propio');
  // Y el filo de la tarjeta cruzaba con el del panel dejando la esquina sucia.
  assert(css.includes('.heroCard,.heroSkills{border-left:0'), 'las tarjetas del héroe no llevan filo que cruce con el del panel');
  console.log('PASS el avatar es un glifo suelto y las tarjetas del héroe no cruzan filos');
}
{
  // Las habilidades eran cajas altas con su botón «Detalles» debajo: un tercio de pantalla.
  const skill = (css.match(/\n\.skill\{[^}]*\}/) || [''])[0];
  assert(skill, 'la regla del sello de habilidad debe existir');
  assert(/border-radius:50%/.test(skill), 'las habilidades son sellos redondos');
  // El botón de detalles es el nombre entero: una «i» de 22 px no llega al mínimo táctil
  // y su área ampliada se la comía la habilidad de al lado.
  assert(/\.skillInfo\{[^}]*width:100%/.test(css) && /\.skillInfo\{[^}]*min-height:44px/.test(css),
    'el detalle se abre desde el nombre, con el mínimo táctil entero');
  assert(!/\.skillInfo::after/.test(css), 'sin áreas táctiles fantasma que el vecino pueda robar');
  assert(html.includes('class="skillInfo"'), 'y el render debe usarlo');
  console.log('PASS las habilidades son sellos redondos y el detalle se abre desde el nombre');
}
{
  // Filtrar la mochila y las mascotas por rareza, y ver cada pieza como su icono.
  assert(html.includes("const FILTRO = {inv:"), 'debe existir el estado del filtro');
  assert(html.includes('id="filtroInv"') && html.includes('id="filtroPets"'), 'con su barra en las dos listas');
  assert(/class="rejilla" id="listInv"/.test(html) && /class="rejilla" id="listPets"/.test(html),
    'las dos listas se muestran como rejilla de iconos');
  assert(css.includes('.celda{'), 'con su celda de icono');
  assert(/\.chip\{[^}]*min-height:44px/.test(css), 'y los filtros con mínimo táctil');
  // Al tocar una mascota se abre su ficha, como ya pasaba con el equipo.
  assert(html.includes('function abrirMascota('), 'una mascota debe abrir su ficha al tocarla');
  assert(html.includes('id="petDetail"'), 'con su propio diálogo');
  console.log('PASS la mochila y las mascotas se filtran por rareza, salen como iconos y abren su ficha');
}
{
  // El aviso de abajo era una caja ámbar en mitad de la pantalla: llamaba más que el juego.
  const toast = css.slice(css.indexOf('.toast{'), css.indexOf('}', css.indexOf('.toast{')));
  assert(!/rgba\(255,180,58/.test(toast), 'el aviso deja el ámbar, que competía con el oro');
  assert(/var\(--arcane\)/.test(toast), 'y pasa a un color frío');
  assert(/font-size:11\.5px/.test(toast), 'con letra más discreta');
  // El mapa se abre a pantalla completa y su botón de cerrar caía bajo la isla dinámica.
  assert(/\.worlds\{[^}]*env\(safe-area-inset-top\)/.test(css), 'el mapa debe respetar el hueco de arriba del móvil');
  console.log('PASS el aviso de abajo es discreto y frío, y el mapa respeta el hueco superior del móvil');
}
