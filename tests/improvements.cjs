// Regresión de FEAT-012..017: renta al volver de segundo plano, compra parcial por lote,
// mochila llena que no tira botín bueno, mapa por actos, nombres del ranking y guardado
// inmediato al gastar oro o almas.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function logout()'));

const noop = () => {};
const canvas = new Proxy({}, {get: () => noop, set: () => true});

const QA = `window.qa={fresh,hydrate,offline,resumeFromBackground,bundle,upgCost,heroCost,buyUpg,buyHero,
  tryDrop,sellValue,itemPct,renderWorlds,renderRank,feedPet,buySoul,eggCost,soulCost,save,spawn,
  get S(){return S},set S(v){S=v},get B(){return B},get act(){return worldsAct},set act(v){worldsAct=v},
  setQty(v){qty=v},setAcc(a){ACC=a},calc(){B=calcBon()},
  seed(s){S=s;B=calcBon();S.enemy={hp:1e9,max:1e9,boss:false};}}; return;
`;

function boot(storage = new Map()){
  const nodes = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, hidden:false, value:'', textContent:'', innerHTML:'', dataset:{},
      style:{setProperty:noop}, classList:{add:noop, remove:noop, toggle:noop, contains:() => false},
      addEventListener:noop, setAttribute:noop, remove:noop, close(){ this.open = false; },
      querySelector:el, querySelectorAll:() => [], appendChild:noop,
      getBoundingClientRect:() => ({width:390, height:400, left:0, top:0}), getContext:() => canvas});
    return nodes.get(id);
  };
  let timer = 0;
  const sandbox = {console, el, storage, finishLitoBoot:noop,
    window:{matchMedia:() => ({matches:false}), ECOS_CONFIG:{}, addEventListener:noop},
    document:{documentElement:el('html'), getElementById:el, querySelector:el, querySelectorAll:() => [],
      createElement:() => el('tmp' + (++timer)), addEventListener:noop, body:el('body')},
    localStorage:{getItem:k => storage.get(k) || null, setItem:(k, v) => storage.set(k, v), removeItem:k => storage.delete(k)},
    performance:{now:() => 1000}, setTimeout:() => ++timer, clearTimeout:noop, setInterval:noop, clearInterval:noop,
    requestAnimationFrame:noop, navigator:{}, location:{protocol:'http:'}, crypto:require('crypto').webcrypto, TextEncoder};
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  return {q:sandbox.window.qa, el, storage};
}

// --- FEAT-012: la renta se cobra al volver, y solo una vez por rato ---
{
  const {q, el, storage} = boot();
  const s = q.fresh(); s.heroes[0] = 50; s.zone = 3; s.lastSeen = Date.now() - 3600*1000;
  q.seed(s); el('start').hidden = true;
  const antes = q.S.gold, ganado = q.resumeFromBackground();
  assert(ganado > 0, 'volver tras una hora en segundo plano paga la renta');
  assert.equal(q.S.gold, antes + ganado);
  // Segunda vuelta inmediata: el rato ya está cobrado.
  assert.equal(q.resumeFromBackground(), 0, 'volver otra vez no vuelve a pagar el mismo rato');
  assert.equal(q.S.gold, antes + ganado);
  // Y recargar justo después tampoco: cobrar deja el momento guardado.
  assert.equal(JSON.parse(storage.get('ecos-abismo-v2')).gold, antes + ganado, 'el cobro queda guardado');
  const recargado = q.hydrate(JSON.parse(storage.get('ecos-abismo-v2')));
  assert(Date.now() - recargado.lastSeen < 60000, 'el reloj de la renta se reinicia al cobrar');
  // Con el juego sin empezar no se cobra nada.
  const otro = boot(); const s2 = otro.q.fresh(); s2.heroes[0] = 50; s2.lastSeen = Date.now() - 3600*1000;
  otro.q.seed(s2); otro.el('start').hidden = false;
  assert.equal(otro.q.resumeFromBackground(), 0, 'sin haber entrado a jugar no se paga renta');
}
console.log('PASS la renta de segundo plano se cobra al volver y nunca se paga dos veces');

// --- FEAT-013: ×10 ofrece lo que el oro alcanza ---
{
  const {q} = boot();
  const s = q.fresh(); s.gold = 30; q.seed(s); q.setQty(10);
  const lote = q.bundle(l => q.upgCost('sword', l), 0);
  assert(lote.n > 0 && lote.n < 10, `ofrece un lote parcial, no cero ni diez: ${lote.n}`);
  assert(lote.total <= 30, 'y ese lote se puede pagar, así que el botón queda activo');
  q.buyUpg('sword');
  assert.equal(q.S.upg.sword, lote.n, 'se compra exactamente lo anunciado');
  // Sin oro para ni un nivel: se enseña el precio del siguiente y el botón queda apagado.
  const pobre = boot(); const s2 = pobre.q.fresh(); s2.gold = 1; pobre.q.seed(s2); pobre.q.setQty(10);
  const nada = pobre.q.bundle(l => pobre.q.upgCost('sword', l), 0);
  assert.equal(nada.n, 1); assert(nada.total > 1, 'muestra cuánto falta');
  // El tope de una mejora sigue respetándose.
  const rico = boot(); const s3 = rico.q.fresh(); s3.gold = 1e12; s3.upg.crit = 58; rico.q.seed(s3); rico.q.setQty(10);
  assert.equal(rico.q.bundle(l => rico.q.upgCost('crit', l), 58, 60).n, 2, 'nunca pasa del máximo');
}
console.log('PASS los lotes ×10/×100 ofrecen lo que el oro alcanza sin pasarse del tope');

// --- FEAT-014: la mochila llena no tira una pieza épica o mejor ---
{
  const {q} = boot();
  const pieza = (id, r) => ({id, slot:'casco', r, ilvl:5, main:'xp', sec:'gold', lock:false});
  const s = q.fresh(); s.zone = 40; s.gold = 0;
  s.inv = Array.from({length:40}, (_, i) => pieza(100 + i, i === 0 ? 0 : 1));
  q.seed(s); q.S.stats.items = 0;
  const antes = q.S.gold;
  let epica = null;
  for (let i = 0; i < 400 && !epica; i++) { const got = q.tryDrop(40, true); if (got && got.r >= 2) epica = got; }
  assert(epica, 'con jefes se acaba soltando algo épico o mejor');
  assert.equal(q.S.inv.length, 40, 'la mochila sigue llena, no crece sola');
  assert(q.S.inv.some(x => x.id === epica.id), 'la pieza buena entra en la mochila');
  assert(q.S.gold > antes, 'y el oro de la pieza sacrificada sí se cobra');

  // Sin nada sacrificable (todo con candado), se vende y queda escrito en el historial.
  const {q:q2} = boot();
  const s2 = q2.fresh(); s2.zone = 40;
  s2.inv = Array.from({length:40}, (_, i) => Object.assign(pieza(200 + i, 1), {lock:true}));
  q2.seed(s2); q2.S.journal = [];
  let vendida = false;
  for (let i = 0; i < 400 && !vendida; i++) { const got = q2.tryDrop(40, true); if (!got && q2.S.journal.length) vendida = true; }
  assert(vendida, 'sin hueco sacrificable la pérdida se registra como hito');
  assert.equal(q2.S.inv.length, 40, 'ninguna pieza con candado se ha tocado');
  assert(q2.S.inv.every(x => x.lock), 'siguen todas cerradas');
}
console.log('PASS la mochila llena sacrifica lo peor antes que tirar un épico, y si no puede lo deja escrito');

// --- FEAT-015: el mapa de mundos se mueve entre actos ---
{
  const {q, el} = boot();
  const s = q.fresh(); s.zone = 3; s.maxZone = 26; q.seed(s);   // acto 3 alcanzado
  q.act = 1; q.renderWorlds();
  assert(/Acto 1 de 3/.test(el('wActLabel').textContent), el('wActLabel').textContent);
  assert.equal(el('wActPrev').disabled, true, 'en el primer acto no se puede retroceder');
  assert.equal(el('wActNext').disabled, false);
  assert(/Zona 1 /.test(el('wgrid').innerHTML), 'el acto 1 lista sus zonas reales');
  q.act = 3; q.renderWorlds();
  assert(/Acto 3 de 3/.test(el('wActLabel').textContent));
  assert.equal(el('wActNext').disabled, true, 'no hay actos más allá de lo conquistado');
  assert(/Zona 25 /.test(el('wgrid').innerHTML), 'y muestra las zonas del acto 3');
  assert(/data-z="26"/.test(el('wgrid').innerHTML), 'la zona 26 es viajable');
  assert(!/data-z="27"/.test(el('wgrid').innerHTML), 'la 27 aún no');
  q.act = 99; q.renderWorlds();
  assert(/Acto 3 de 3/.test(el('wActLabel').textContent), 'el acto se mantiene dentro de lo posible');
}
console.log('PASS el mapa de mundos recorre los actos conquistados sin salirse de ellos');

// --- FEAT-016: los nombres del ranking se escapan, no se mutilan ---
{
  const {q, el} = boot();
  q.setAcc(null);
  q.renderRank([{name:'Ana & Bob', score:10, maxZone:2, rebirths:0, level:3},
                {name:'<script>x</script>', score:5, maxZone:1, rebirths:0, level:1}]);
  const out = el('rank').innerHTML;
  assert(/Ana &amp; Bob/.test(out), `el ampersand se conserva escapado: ${out.slice(0, 200)}`);
  assert(!/<script>/.test(out), 'y nada se inyecta como HTML');
  assert(/&lt;script&gt;/.test(out), 'el nombre hostil se muestra como texto');
}
console.log('PASS los nombres del ranking conservan sus símbolos sin poder inyectar HTML');

// --- FEAT-017: gastar oro o almas se guarda en el acto ---
{
  const {q, storage} = boot();
  const s = q.fresh(); s.gold = 1e9; s.souls = 500; s.pets = [{sp:0, r:0, lvl:1, stat:'dmg'}]; s.activePet = 0;
  q.seed(s); storage.clear();
  q.feedPet(0);
  assert.equal(q.S.pets[0].lvl, 2);
  assert.equal(JSON.parse(storage.get('ecos-abismo-v2')).pets[0].lvl, 2, 'alimentar guarda al instante');
  storage.clear();
  q.buySoul('power');
  assert.equal(q.S.soul.power, 1);
  assert.equal(JSON.parse(storage.get('ecos-abismo-v2')).soul.power, 1, 'comprar almas guarda al instante');
  q.feedPet(9);   // una mascota que no existe no puede cobrar
  assert.equal(q.S.gold, JSON.parse(storage.get('ecos-abismo-v2')).gold, 'alimentar a nadie no gasta oro');
}
console.log('PASS alimentar mascotas y comprar almas guardan sin esperar al autoguardado');
