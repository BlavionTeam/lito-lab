// FEAT-018 · La consola de administración toca la partida de verdad, y solo se abre para
// una cuenta que el servidor reconoce como admin. Un jugador normal no la ve ni aunque
// se ponga la marca en su copia local: el panel exige además el backend con las funciones.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function logout()'));

const noop = () => {};
const canvas = new Proxy({}, {get: () => noop, set: () => true});
const QA = `window.qa={fresh,admGrantSelf,admOk,renderAdmin,SKILLS,TAL,PETS,SLOTS,RAR,
  get S(){return S},set S(v){S=v},setAcc(a){ACC=a},setBack(b){BACK=b},
  seed(s){S=s;B=calcBon();S.enemy={hp:1e9,max:1e9,boss:false};}}; return;
`;

function boot(){
  const nodes = new Map(), storage = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, hidden:false, value:'', textContent:'', innerHTML:'', dataset:{},
      style:{setProperty:noop}, classList:{add:noop, remove:noop, toggle:noop, contains:() => false},
      addEventListener:noop, setAttribute:noop, remove:noop, close(){ this.open = false; },
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
  return {q:sandbox.window.qa, el};
}

const nube = {kind:'supabase', label:'Nube', stopRank:noop, logout:noop,
  adminPlayers:async () => [], adminGrant:async () => ({}), adminRole:async () => true, adminSave:async () => ({})};
const local = {kind:'local', label:'Solo local', stopRank:noop, logout:noop};

// --- El panel solo existe para una cuenta admin sobre un backend con administración ---
{
  const {q, el} = boot();
  q.seed(q.fresh());
  q.setAcc({id:'x', name:'Jugador', admin:false}); q.setBack(nube);
  assert.equal(q.admOk(), false, 'un jugador normal no tiene consola');
  q.renderAdmin(); assert.equal(el('adminPanel').hidden, true, 'el panel queda oculto para un jugador normal');

  q.setAcc({id:'x', name:'Jefa', admin:true}); q.setBack(local);
  assert.equal(q.admOk(), false, 'sin backend de nube no hay administración, aunque la copia local diga admin');

  q.setAcc({id:'x', name:'Jefa', admin:true}); q.setBack(nube);
  assert.equal(q.admOk(), true, 'con rol confirmado y backend con administración, la consola está disponible');
  q.renderAdmin(); assert.equal(el('adminPanel').hidden, false, 'el panel se muestra para la cuenta admin');
  console.log('PASS la consola de administración solo aparece con rol confirmado y backend que la soporta');
}

// --- Cada acción de la consola cambia la partida y la deja guardada ---
{
  const {q, el} = boot();
  q.seed(q.fresh());
  q.setAcc({id:'x', name:'Jefa', admin:true}); q.setBack(nube);

  q.admGrantSelf('oro'); assert.equal(q.S.gold, 1e6, '+1 M de oro');
  q.admGrantSelf('oroX'); assert.equal(q.S.gold, 1e9, 'el multiplicador se aplica sobre lo que ya hay');
  q.admGrantSelf('almas'); assert.equal(q.S.souls, 100, '+100 almas');
  q.admGrantSelf('nivel'); assert.equal(q.S.level, 11, '+10 niveles');
  q.admGrantSelf('renacer'); assert.equal(q.S.rebirths, 1, '+1 renacer');

  q.admGrantSelf('habilidades');
  const avanzadas = Object.keys(q.SKILLS).filter(k => q.SKILLS[k].advanced);
  assert.equal(q.S.unlockedSkills.slice().sort().join(','), avanzadas.slice().sort().join(','), 'las habilidades avanzadas quedan desbloqueadas');
  assert(q.S.level >= Math.max(...Object.values(q.SKILLS).map(s => s.unlock || 1)), 'y el nivel alcanza a las que dependen de él');

  q.admGrantSelf('talentos');
  for (const k in q.TAL) assert.equal(q.S.tal[k], q.TAL[k].max, `el talento ${k} queda al máximo`);

  q.admGrantSelf('mascotas');
  assert.equal(q.S.pets.length, q.PETS.length, 'la colección de mascotas queda completa');
  assert(q.S.pets.every(p => p.lvl === 10 && p.r === q.RAR.length - 1), 'todas míticas y a nivel 10');

  el('admZone').value = '42'; q.admGrantSelf('zona');
  assert.equal(q.S.zone, 42, 'la consola viaja a cualquier zona');
  assert(q.S.maxZone >= 42 && q.S.maxZoneEver >= 42, 'y la deja desbloqueada para volver');

  q.S.inv = []; q.S.eq = {arma:null, casco:null, pechera:null, botas:null};
  q.admGrantSelf('botin');
  const piezas = [...q.S.inv, ...Object.values(q.S.eq)].filter(Boolean);
  assert.equal(piezas.length, Object.keys(q.SLOTS).length, 'un juego completo de equipo');
  assert(piezas.every(p => p.r === q.RAR.length - 1 && p.ilvl === 42), 'míticas y al nivel de la zona actual');
  assert.equal(new Set(piezas.map(p => p.slot)).size, 4, 'una por hueco, sin repetir');
  assert(piezas.filter(p => p.slot !== 'arma').every(p => p.w === undefined), 'una armadura no arrastra tipo de arma');

  q.S.enemy = {hp:500, max:500, boss:false, name:'Cobaya'};
  const bajas = q.S.stats.kills;
  q.admGrantSelf('matar');
  assert.equal(q.S.stats.kills, bajas + 1, 'la consola remata al enemigo de un golpe y cuenta la baja');

  console.log('PASS la consola de administración da recursos, equipo, mascotas, talentos y viaje de zona reales');
}

// --- Una acción desconocida no toca nada, y sin rol la consola no hace nada ---
{
  const {q} = boot();
  q.seed(q.fresh());
  q.setAcc({id:'x', name:'Jugador', admin:false}); q.setBack(nube);
  q.admGrantSelf('oro');
  assert.equal(q.S.gold, 0, 'sin rol, la consola no reparte nada');

  q.setAcc({id:'x', name:'Jefa', admin:true});
  const antes = JSON.stringify(q.S);
  q.admGrantSelf('lo-que-sea');
  assert.equal(JSON.stringify(q.S), antes, 'una acción que no existe deja la partida intacta');
  console.log('PASS sin rol la consola no reparte recursos y una acción desconocida no altera la partida');
}
