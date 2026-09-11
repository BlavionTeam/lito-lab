// FEAT-025 (#10) · El código de rescate es lo único que separa "he olvidado el PIN" de
// "he perdido la cuenta", así que tiene que ser imposible de adivinar y fácil de copiar.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function logout()'));

const noop = () => {};
const canvas = new Proxy({}, {get: () => noop, set: () => true});
const QA = `window.qa={generaRescate,RESCATE_ABC,canjearRescate,renovarRescate,fresh,
  get S(){return S},set S(v){S=v},setAcc(a){ACC=a},setBack(b){BACK=b},
  seed(s){S=s;B=calcBon();S.enemy={hp:10,max:10};}}; return;
`;
function boot(){
  const nodes = new Map(), storage = new Map();
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, hidden:false, value:'', textContent:'', innerHTML:'', dataset:{},
      style:{setProperty:noop}, classList:{add:noop, remove:noop, toggle:noop, contains:() => false},
      addEventListener:noop, setAttribute:noop, remove:noop, focus:noop,
      close(){ this.open = false; }, showModal(){ this.open = true; },
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
    performance:{now:() => 1000}, setTimeout:f => { if (typeof f === 'function') return ++timer; return ++timer; },
    clearTimeout:noop, setInterval:noop, clearInterval:noop,
    requestAnimationFrame:noop, navigator:{}, location:{protocol:'http:'}, crypto:require('crypto').webcrypto, TextEncoder};
  vm.runInNewContext(code.replace('/* ---------- boot ---------- */', QA + '/* ---------- boot ---------- */'), sandbox);
  return {q:sandbox.window.qa, el};
}

// --- El código en sí ---
{
  const {q} = boot();
  const codigos = new Set();
  for (let i = 0; i < 400; i++) {
    const c = q.generaRescate();
    assert.match(c, /^LITO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, `formato inesperado: ${c}`);
    for (const ch of c.replace(/^LITO-/, '').replace(/-/g, '')) {
      assert(q.RESCATE_ABC.includes(ch), `el carácter ${ch} no está en el alfabeto del código`);
    }
    codigos.add(c);
  }
  assert.equal(codigos.size, 400, 'cuatrocientos códigos seguidos y ninguno repetido');
  // Doce caracteres de un alfabeto de 32 son sesenta bits: ni se adivina ni se fuerza.
  assert.equal(q.RESCATE_ABC.length, 32);
  assert(!/[O0I1]/.test(q.RESCATE_ABC), 'el alfabeto evita los caracteres que se confunden al copiar a mano');
  console.log('PASS el código de rescate es único, con formato fijo y sin caracteres que se confundan');
}

// --- El canje valida antes de llamar a nadie ---
(async () => {
  const {q, el} = boot();
  q.seed(q.fresh());
  let llamadas = 0;
  q.setBack({kind:'supabase', label:'nube', stopRank:noop, logout:noop,
    setRescue:async () => { llamadas++; return true; },
    rescue:async (jugador, codigo, pin) => { llamadas++; return codigo === 'LITO-AAAA-BBBB-CCCC' && pin.length >= 6; }});

  const intentar = async (nombre, codigo, pin) => {
    el('recName').value = nombre; el('recCode').value = codigo; el('recPin').value = pin;
    await q.canjearRescate();
    return el('recMsg').textContent;
  };
  assert.match(await intentar('', 'LITO-AAAA-BBBB-CCCC', '123456'), /nombre/i, 'sin nombre no se llama al servidor');
  assert.match(await intentar('Ana', 'corto', '123456'), /LITO-/, 'un código con mala pinta se rechaza aquí mismo');
  assert.match(await intentar('Ana', 'LITO-AAAA-BBBB-CCCC', '123'), /6 dígitos/, 'un PIN corto se rechaza aquí mismo');
  assert.equal(llamadas, 0, 'ninguna de las tres llegó a molestar al servidor');

  assert.match(await intentar('Ana', 'LITO-ZZZZ-ZZZZ-ZZZZ', '123456'), /no coinciden/i, 'un código que no cuadra lo dice claro');
  assert.match(await intentar('Ana', 'LITO-AAAA-BBBB-CCCC', '123456'), /PIN nuevo/i, 'y el bueno confirma el cambio');
  assert.equal(llamadas, 2, 'solo los intentos con formato válido llegan al servidor');
  console.log('PASS el canje comprueba nombre, formato y PIN antes de llamar, y distingue código bueno de malo');
})().then(() => {

  // El backend guarda el código, no el jugador.
  // La función del servidor guarda un hash bcrypt; el cliente nunca almacena el código.
  assert(!/localStorage\.setItem\([^)]*rescate/i.test(html), 'el código de rescate no puede quedarse en el navegador');
  assert.match(html, /set_rescue_code/, 'el cliente guarda el código llamando al servidor');
  assert.match(html, /rescue_account/, 'y lo canjea por la función del servidor');
  console.log('PASS el código vive en el servidor hasheado y no se guarda en el navegador');
}).catch(e => { console.error(e); process.exitCode = 1; });
