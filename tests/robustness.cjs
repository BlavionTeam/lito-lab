// Regresión de BUG-005/006/009/010: partidas imposibles, arena fuera de pantalla,
// viaje por el mapa de mundos y recuento del candado en la venta automática.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const script = s => s.includes('function logout()');
let code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(script);

const noop = () => {};
const canvas = new Proxy({}, {get: () => noop, set: () => true});

function makeSandbox(storage, arena){
  const nodes = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, hidden:false, value:'', textContent:'', innerHTML:'', dataset:{},
      style:{setProperty:noop}, classList:{add:noop, remove:noop, toggle:noop, contains:() => false},
      addEventListener:noop, setAttribute:noop, remove:noop, close(){ this.open = false; },
      querySelector:el, querySelectorAll:() => [], appendChild:noop,
      getBoundingClientRect:() => (id === 'stage' || id === 'eCan') ? arena() : {width:400, height:400, left:0, top:0},
      getContext:() => canvas});
    return nodes.get(id);
  };
  let timer = 0;
  const sandbox = {console, el, finishLitoBoot:noop,
    window:{matchMedia:() => ({matches:false}), ECOS_CONFIG:{}, addEventListener:noop},
    document:{documentElement:el('html'), getElementById:el, querySelector:el, querySelectorAll:() => [],
      createElement:() => el('tmp' + (++timer)), addEventListener:noop, body:el('body')},
    localStorage:{getItem:k => storage.get(k) || null, setItem:(k, v) => storage.set(k, v), removeItem:k => storage.delete(k)},
    performance:{now:() => 1000}, setTimeout:() => ++timer, clearTimeout:noop, setInterval:noop, clearInterval:noop,
    requestAnimationFrame:noop, navigator:{}, location:{protocol:'http:'}, crypto:require('crypto').webcrypto, TextEncoder};
  return sandbox;
}

const QA = `window.qa={fresh,hydrate,sanitize,sellJunk,tick,travelTo,spawn,save,dps,
  get S(){return S},set S(v){S=v},get goldOn(){return goldOn},get gt(){return goldT},set gt(v){goldT=v},
  calc(){B=calcBon()},seed(s){S=s;B=calcBon();S.enemy={hp:1e12,max:1e12,boss:false};}}; return;
`;

// --- BUG-005: el arranque nunca puede morir por una partida guardada imposible ---
{
  // Antes: zone 0 hacía que spawn() leyera un tema inexistente y el juego moría en la
  // pantalla de carga, sin siquiera el botón de reiniciar.
  const storage = new Map();
  storage.set('ecos-abismo-v2', JSON.stringify({zone:0, stage:3, maxZone:1, gold:'mucho', enemy:{hp:5, max:10, boss:false}}));
  const sandbox = makeSandbox(storage, () => ({width:390, height:400, left:0, top:0}));
  vm.runInNewContext(code, sandbox);   // el boot entero se ejecuta aquí
  assert(/^Zona 1 /.test(sandbox.el('zoneNo').textContent), `la partida arranca jugable: ${sandbox.el('zoneNo').textContent}`);
}
{
  // Un contenido que ni siquiera es JSON: se aparta en vez de perderse, y se juega igual.
  const storage = new Map();
  storage.set('ecos-abismo-v2', '{esto no es json');
  const sandbox = makeSandbox(storage, () => ({width:390, height:400, left:0, top:0}));
  vm.runInNewContext(code, sandbox);
  assert(/^Zona 1 /.test(sandbox.el('zoneNo').textContent), 'se arranca una partida nueva');
  assert(storage.has('ecos-save-danada'), 'la partida ilegible queda apartada, no se pierde');
}
console.log('PASS un save imposible ya no mata el arranque y se conserva apartado');

// --- BUG-005: hydrate devuelve siempre una partida jugable ---
{
  const storage = new Map(), sandbox = makeSandbox(storage, () => ({width:390, height:400, left:0, top:0}));
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  const q = sandbox.window.qa;

  const roto = q.hydrate({zone:0, stage:37, maxZone:-5, maxZoneEver:'x', gold:'mucho', xp:NaN, level:0,
    souls:-9, rebirths:1e400, heroes:'no', upg:{sword:'x', crit:9999}, soul:{start:999},
    tal:{g1:99, inventado:5}, trophies:[3, 3, -1, 'x'], pets:[{sp:99, r:0, lvl:1}, {sp:1, r:0, lvl:-4}],
    activePet:57, inv:[null, {id:1, slot:'inventado'}], eq:{arma:{id:2, slot:'casco'}}, stats:{kills:'x'}});
  assert.equal(roto.zone, 1); assert.equal(roto.stage, 10); assert.equal(roto.maxZone, 1);
  assert.equal(roto.gold, 0); assert.equal(roto.xp, 0); assert.equal(roto.level, 1); assert.equal(roto.souls, 0);
  assert.equal(roto.upg.sword, 0); assert.equal(roto.upg.crit, 60, 'la mejora se capa a su máximo real');
  assert.equal(roto.soul.start, 40, 'el atajo no puede pasar de su tope');
  assert.equal(JSON.stringify(roto.tal), '{"g1":5}', 'los talentos inventados desaparecen y el resto se capa');
  assert.equal(JSON.stringify(roto.trophies), '[3]');
  assert.equal(roto.pets.length, 1); assert.equal(roto.pets[0].lvl, 1);
  assert.equal(roto.activePet, 0, 'la mascota activa siempre existe');
  assert.equal(JSON.stringify(roto.inv), '[]'); assert.equal(roto.eq.arma, null, 'una pieza en el hueco equivocado se retira');
  assert.equal(roto.stats.kills, 0);
  assert(Number.isSafeInteger(roto.heroes.length) && roto.heroes.every(v => v === 0), 'los compañeros vuelven a cero');
  // Una partida legítima no se toca.
  const buena = q.fresh(); buena.gold = 500; buena.zone = 7; buena.maxZone = 9; buena.stage = 4; buena.level = 12;
  const igual = q.hydrate(JSON.parse(JSON.stringify(buena)));
  assert.equal(igual.gold, 500); assert.equal(igual.zone, 7); assert.equal(igual.maxZone, 9);
  assert.equal(igual.stage, 4); assert.equal(igual.level, 12);
}
console.log('PASS toda partida cargada queda jugable y una partida sana no se altera');

// --- BUG-006: con la arena fuera de pantalla no se gasta el mob dorado ---
{
  const storage = new Map();
  let width = 0;   // en móvil la arena no existe fuera de la vista de combate
  const sandbox = makeSandbox(storage, () => ({width, height:width ? 400 : 0, left:0, top:0}));
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  const q = sandbox.window.qa;
  q.seed(q.fresh()); sandbox.el('start').hidden = true;
  q.gt = 0.1;
  for (let i = 0; i < 20; i++) q.tick(1000 + i*100);
  assert.equal(q.goldOn, false, 'el mob dorado no aparece donde no se puede tocar');
  assert(q.gt > 0, 'su temporizador se congela en vez de consumirse a ciegas');
  width = 390;
  for (let i = 0; i < 20; i++) q.tick(3000 + i*100);
  assert.equal(q.goldOn, true, 'al volver al combate sí aparece');
}
console.log('PASS el mob dorado espera a que la arena esté en pantalla');

// --- BUG-009: viajar por el mapa de mundos guarda y respeta el límite ---
{
  const storage = new Map(), sandbox = makeSandbox(storage, () => ({width:390, height:400, left:0, top:0}));
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  const q = sandbox.window.qa;
  const s = q.fresh(); s.zone = 1; s.maxZone = 5; s.stage = 7; q.seed(s);
  assert.equal(q.travelTo(9), false, 'no se viaja más allá de lo conquistado');
  assert.equal(q.travelTo(0), false); assert.equal(q.S.zone, 1);
  assert.equal(q.travelTo(4), true);
  assert.equal(q.S.zone, 4); assert.equal(q.S.stage, 1, 'el viaje reinicia la etapa');
  assert.equal(JSON.parse(storage.get('ecos-abismo-v2')).zone, 4, 'el viaje queda guardado al instante');
}
console.log('PASS el viaje de zona guarda y no salta zonas sin conquistar');

// --- BUG-010: el aviso de la venta automática cuenta solo lo que el candado salvó ---
{
  const storage = new Map(), sandbox = makeSandbox(storage, () => ({width:390, height:400, left:0, top:0}));
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  const q = sandbox.window.qa;
  const item = (id, r, ilvl, lock) => ({id, slot:'arma', r, ilvl, main:'dmg', sec:'gold', w:0, lock});
  const s = q.fresh();
  s.inv = [item(1, 0, 1, false), item(2, 0, 2, false), item(3, 4, 50, true), item(4, 0, 3, true)];
  q.seed(s); q.sellJunk();
  const aviso = sandbox.el('toast').textContent;
  assert(/1 con candado/.test(aviso), `solo el común con candado cuenta como salvado: ${aviso}`);
  assert(q.S.inv.some(i => i.id === 3) && q.S.inv.some(i => i.id === 4), 'nada con candado se vende');
}
console.log('PASS la venta automática solo cuenta los candados que evitaron una venta');
