// FEAT-023 · Desafíos: la tanda del día es estable, el progreso solo cuenta lo hecho
// dentro de ella, y una recompensa se cobra una vez y nada más.
// FEAT-022 · La rareza exótica remata la escala y se comporta como una más.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function logout()'));

const noop = () => {};
const canvas = new Proxy({}, {get: () => noop, set: () => true});
const QA = `window.qa={fresh,hydrate,questState,retosActivos,retosCadena,retosListos,cobrarReto,cobrarTodo,
  claveDia,claveSemana,restanteTanda,retoOro,RAR,POOL_DIA,POOL_SEMANA,CADENAS,genItem,fusionQuote,fuseEquipment,
  get S(){return S},set S(v){S=v},setBack(b){BACK=b},
  seed(s){S=s;B=calcBon();S.enemy={hp:1e9,max:1e9,boss:false};}}; return;
`;

function boot(){
  const nodes = new Map(), storage = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, hidden:false, value:'', textContent:'', innerHTML:'', dataset:{},
      style:{setProperty:noop}, classList:{add:noop, remove:noop, toggle:noop, contains:() => false},
      addEventListener:noop, setAttribute:noop, remove:noop, close(){ this.open = false; }, showModal(){ this.open = true; },
      querySelector:el, querySelectorAll:() => [], appendChild:noop,
      getBoundingClientRect:() => ({width:390, height:400, left:0, top:0}), getContext:() => canvas});
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
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  const q = sandbox.window.qa;
  q.setBack({kind:'local', label:'local', stopRank:noop, logout:noop});
  return {q, storage};
}

// --- La tanda es estable y solo cuenta lo que haces dentro de ella ---
{
  const {q} = boot();
  const s = q.fresh(); s.stats.kills = 4000; s.stats.bosses = 90; s.stats.items = 50; s.maxZoneEver = 40; s.zone = 40;
  q.seed(s);

  const primera = q.retosActivos('d').map(r => r.id).join(',');
  assert.equal(q.retosActivos('d').map(r => r.id).join(','), primera, 'la tanda del día no cambia entre dos miradas');
  assert.equal(new Set(q.retosActivos('d').map(r => r.id)).size, 3, 'son tres objetivos distintos');
  assert.equal(new Set(q.retosActivos('w').map(r => r.id)).size, 3, 'y tres semanales distintos');

  for (const r of q.retosActivos('d')) assert.equal(r.hecho, 0, `${r.id} arranca a cero pese al historial acumulado`);
  assert.equal(q.retosListos(), q.retosCadena().filter(x => x.listo).length, 'de entrada solo puede haber progresión lista');

  // Avanzar los contadores sí cuenta.
  const reto = q.retosActivos('d').find(r => r.m === 'kills' || r.m === 'bosses' || r.m === 'items' || r.m === 'clicks');
  if (reto) {
    const antes = q.S.stats[reto.m];
    q.S.stats[reto.m] = antes + reto.meta;
    const ahora = q.retosActivos('d').find(r => r.id === reto.id);
    assert.equal(ahora.listo, true, `${reto.id} se completa al llegar a la meta`);
  }
  console.log('PASS la tanda diaria es estable, arranca a cero y solo cuenta el progreso hecho dentro de ella');
}

// --- Cambiar de día renueva la tanda y su punto de partida ---
{
  const {q} = boot();
  const s = q.fresh(); s.stats.kills = 100; q.seed(s);
  q.retosActivos('d');
  const ayer = q.S.quests.d;
  assert.equal(ayer.k, q.claveDia(), 'la tanda se sella con el día de hoy');
  q.S.quests.d.k = '2020-01-01'; q.S.quests.d.hechos = ['d-kills'];
  q.S.stats.kills = 5000;
  const renovada = q.questState().d;
  assert.equal(renovada.k, q.claveDia(), 'al cambiar el día la tanda se renueva');
  assert.equal(renovada.hechos.length, 0, 'y no arrastra lo cobrado del día anterior');
  for (const r of q.retosActivos('d')) assert.equal(r.hecho, 0, 'el punto de partida se vuelve a fijar');
  console.log('PASS al cambiar el día la tanda se renueva, olvida lo cobrado y vuelve a fijar el punto de partida');
}

// --- Cobrar paga una vez ---
{
  const {q} = boot();
  const s = q.fresh(); s.zone = 10; s.maxZone = 10; s.maxZoneEver = 10; q.seed(s);
  const reto = q.retosActivos('d')[0];
  q.S.stats[reto.m] = (q.S.stats[reto.m] || 0) + reto.meta;
  const oroAntes = q.S.gold, almasAntes = q.S.souls;
  const premio = q.cobrarReto('d', reto.id);
  assert(premio && premio.oro > 0, 'cobrar entrega oro');
  assert.equal(q.S.gold, oroAntes + premio.oro, 'el oro entra en la partida');
  assert.equal(q.S.souls, almasAntes + (premio.almas || 0), 'y las almas también');
  assert.equal(q.cobrarReto('d', reto.id), null, 'la misma recompensa no se cobra dos veces');
  assert.equal(q.S.gold, oroAntes + premio.oro, 'y el segundo intento no añade nada');
  assert.equal(q.retosActivos('d').find(r => r.id === reto.id).cobrado, true, 'la ficha queda marcada como cobrada');

  // Un objetivo sin cumplir no paga.
  const pendiente = q.retosActivos('w').find(r => !r.listo);
  assert.equal(q.cobrarReto('w', pendiente.id), null, 'un objetivo a medias no paga');
  assert.equal(q.cobrarReto('d', 'no-existe'), null, 'un identificador inventado no paga');
  console.log('PASS una recompensa se cobra una sola vez y un objetivo sin cumplir no paga nada');
}

// --- Las cadenas de progresión avanzan escalón a escalón ---
{
  const {q} = boot();
  const s = q.fresh(); s.maxZoneEver = 30; s.maxZone = 30; s.zone = 30; q.seed(s);
  const explorador = () => q.retosCadena().find(r => r.cadena.m === 'zone');
  assert.equal(explorador().meta, 10, 'el primer escalón pendiente es el más bajo sin cobrar');
  assert.equal(explorador().listo, true, 'con zona 30 el escalón de 10 está superado');
  assert(q.cobrarReto('p', explorador().id), 'se cobra el escalón');
  assert.equal(explorador().meta, 25, 'y el siguiente escalón pasa a estar en curso');
  assert(q.cobrarReto('p', explorador().id), 'que también está superado');
  assert.equal(explorador().meta, 50, 'el tercero ya no está al alcance');
  assert.equal(explorador().listo, false);
  assert.equal(q.cobrarReto('p', explorador().id), null, 'y no se puede cobrar por adelantado');
  const guardado = q.hydrate(JSON.parse(JSON.stringify(q.S)));
  assert.equal(JSON.stringify(guardado.quests.p), JSON.stringify(q.S.quests.p), 'lo cobrado sobrevive a recargar la partida');
  console.log('PASS las cadenas de progresión avanzan escalón a escalón y lo cobrado sobrevive a la recarga');
}

// --- Cobrar todo y partidas viejas sin desafíos ---
{
  const {q} = boot();
  const s = q.fresh(); s.zone = 12; s.maxZone = 12; s.maxZoneEver = 12; q.seed(s);
  for (const r of q.retosActivos('d')) q.S.stats[r.m] = (q.S.stats[r.m] || 0) + r.meta;
  const listos = q.retosListos();
  assert(listos >= 3, 'hay varias recompensas esperando');
  assert.equal(q.cobrarTodo(), listos, 'cobrar todo las recoge de una vez');
  assert.equal(q.retosListos(), 0, 'y no queda ninguna pendiente');

  // Cobrar en lote encadena los escalones que quedan superados al cobrar el anterior.
  {
    const {q:q2} = boot();
    const s2 = q2.fresh(); s2.maxZoneEver = 60; s2.maxZone = 60; s2.zone = 60; q2.seed(s2);
    const antesZona = q2.S.quests.p ? q2.S.quests.p.length : 0;
    q2.cobrarTodo();
    const cobradosZona = q2.S.quests.p.filter(id => id.startsWith('zone:')).length;
    assert(cobradosZona >= 3, `con zona 60 el lote encadena los escalones superados (cobrados ${cobradosZona})`);
    assert.equal(q2.retosCadena().filter(r => r.listo).length, 0, 'y no deja ninguno superado sin cobrar');
  }

  // Una partida de antes de los desafíos no puede romper el arranque.
  const vieja = q.hydrate({zone:3, stats:{kills:10}});
  assert(vieja.quests && typeof vieja.quests === 'object', 'una partida vieja recibe su hueco de desafíos');
  q.seed(vieja);
  assert.equal(q.retosActivos('d').length, 3, 'y la tanda se genera igual');
  console.log('PASS cobrar todo recoge las recompensas listas y una partida anterior a los desafíos arranca sin tocarla');
}

// --- FEAT-022: la exótica es la cima de la escala ---
{
  const {q} = boot();
  const cima = q.RAR[q.RAR.length - 1];
  assert.equal(cima.n, 'Exótico', 'la exótica cierra la escala de rarezas');
  assert(cima.p > q.RAR[q.RAR.length - 2].p, 'y pega más que la mítica');
  assert(cima.w < q.RAR[q.RAR.length - 2].w, 'y cae menos a menudo');
  assert.match(html, /--r5:#[0-9a-f]{6}/, 'la exótica tiene su propio color');
  assert.match(html, /\.itemArt\[data-rank="VI"\]/, 'y su propio marco en la mochila');

  const s = q.fresh(); s.zone = 20; q.seed(s);
  const pieza = q.genItem(20, true); pieza.r = q.RAR.length - 1;
  assert.equal(q.fusionQuote(pieza.id, []), null, 'una exótica ya no se puede fusionar');
  console.log('PASS la rareza exótica cierra la escala, con color y marco propios, y no se puede superar');
}
