#!/usr/bin/env node
// Continuidad entre agentes. Sin dependencias, sin estado propio: lee git + los .md.
//   node scripts/agent.mjs preflight   -> estado del proyecto en 12 líneas (antes de tocar nada)
//   node scripts/agent.mjs check       -> coherencia de docs/IDs/versión (antes de commitear)
//   node scripts/agent.mjs id FEAT-003 -> estado, qué falta y commits de un ID
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const sh = (cmd, fallback = '') => {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return fallback; }
};
const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : '');
const ID_RE = /\b(BUG|FEAT|TECH)-(\d{3})\b/g;
const ESTADOS = ['Abierto', 'En curso', 'En revisión', 'Verificado', 'Hecho', 'Bloqueado'];

// Expande "FEAT-001..006" y devuelve el conjunto de IDs citados en un texto.
function idsOf(text) {
  const out = new Set();
  for (const m of text.matchAll(/\b(BUG|FEAT|TECH)-(\d{3})\.\.(\d{3})\b/g)) {
    for (let n = +m[2]; n <= +m[3]; n++) out.add(`${m[1]}-${String(n).padStart(3, '0')}`);
  }
  for (const m of text.replace(/\b(BUG|FEAT|TECH)-\d{3}\.\.\d{3}\b/g, '').matchAll(ID_RE)) out.add(m[0]);
  return out;
}

function tareas() {
  const src = read('TAREAS.md');
  const rows = [];
  for (const line of src.split('\n')) {
    const m = line.match(/^\|\s*((?:BUG|FEAT|TECH)-\d{3})\s*\|/);
    if (!m) continue;
    const c = line.split('|').map((s) => s.trim());
    rows.push({ id: m[1], legacy: c[2], titulo: c[3], estado: c[4], quien: c[5] || '-', falta: c[6] || '' });
  }
  const counters = {};
  const cm = src.match(/Contadores[^\n]*?:\*\*([^\n]+)/);
  if (cm) for (const m of cm[1].matchAll(/\b(BUG|FEAT|TECH)-(\d{3})\b/g)) counters[m[1]] = +m[2];
  return { src, rows, counters };
}

// Último estado estable: el tag ecos-v* si existe, si no el commit declarado en CONTINUAR §2.
function ultimoEstable() {
  const tag = sh('git describe --tags --abbrev=0 --match "ecos-v*"');
  if (tag) return { version: tag, sha: sh(`git rev-list -n1 ${tag}`).slice(0, 7), fuente: 'tag' };
  const s2 = (read('CONTINUAR.md').split(/^## 2\..*$/m)[1] || '').split(/^## /m)[0];
  return {
    version: ((read('CONTINUAR.md').split(/^## 1\..*$/m)[1] || '').match(/ecos-v\d+/) || ['?'])[0],
    sha: (s2.match(/`([0-9a-f]{7,40})`/) || ['', '?'])[1].slice(0, 7),
    fuente: 'CONTINUAR §2',
  };
}

function preflight() {
  const { rows } = tareas();
  const cont = read('CONTINUAR.md');
  const rama = sh('git rev-parse --abbrev-ref HEAD', '?');
  const sucio = sh('git status --porcelain').split('\n').filter(Boolean).length;
  const base = sh('git rev-parse --verify -q origin/main') ? 'origin/main' : 'main';
  const [ahead, behind] = (sh(`git rev-list --left-right --count HEAD...${base}`, '0\t0').split(/\s+/));
  const estable = ultimoEstable();
  const sw = (read('sw.js').match(/ecos-v\d+/) || ['?'])[0];
  const curso = rows.filter((r) => ['En curso', 'En revisión', 'Bloqueado'].includes(r.estado));
  const next = (cont.split(/^## 6\..*$/m)[1] || '').split(/^## /m)[0].trim().split('\n').filter(Boolean).slice(0, 2);

  const L = [];
  L.push('LITO-LAB · PREFLIGHT');
  L.push(`rama       ${rama}${sucio ? `  (${sucio} archivo(s) sin commitear)` : '  (limpia)'}`);
  L.push(`vs ${base.padEnd(12)}+${ahead} / -${behind}${+behind ? '  <- SINCRONIZA ANTES DE TOCAR NADA' : ''}`);
  L.push(`estable    ${estable.version} @ ${estable.sha}  (${estable.fuente})`);
  L.push(`sw.js      ${sw}`);
  L.push(`en curso   ${curso.length ? curso.map((r) => `${r.id}[${r.estado}${r.quien !== '-' ? ` · ${r.quien}` : ''}]`).join('  ') : '(ninguna)'}`);
  // Un cerrojo de más de 24 h se considera abandonado: el ID vuelve a estar libre.
  const caducadas = curso.filter((r) => {
    const d = (r.quien.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
    return d && (Date.now() - Date.parse(d)) > 864e5;
  });
  if (caducadas.length) L.push(`libres     ${caducadas.map((r) => r.id).join(', ')} (reclamadas hace >24 h: puedes cogerlas)`);
  for (const [i, n] of next.entries()) L.push(`${i ? '           ' : 'siguiente  '}${n.replace(/^[-\d.\s]+/, '')}`);
  L.push('leer       START_HERE.md -> CONTINUAR.md -> TAREAS.md (solo tu ID) -> código');
  L.push('cerrar     npm run check  +  CONTINUAR/TAREAS/CHANGELOG_AGENT actualizados');
  console.log(L.join('\n'));
  const p = problemas();
  if (p.length) console.log(`docs       ${p.length} problema(s): ejecuta npm run check`);
}

function problemas() {
  const { src, rows, counters } = tareas();
  const cont = read('CONTINUAR.md');
  const chg = read('CHANGELOG_AGENT.md');
  const err = [];
  if (!rows.length) err.push('TAREAS.md: no se ha podido leer la tabla de IDs.');

  // 1. IDs duplicados y estados válidos
  const vistos = new Set();
  for (const r of rows) {
    if (vistos.has(r.id)) err.push(`TAREAS.md: ${r.id} aparece dos veces.`);
    vistos.add(r.id);
    if (!ESTADOS.includes(r.estado)) err.push(`TAREAS.md: ${r.id} tiene estado "${r.estado}"; usa ${ESTADOS.join('/')}.`);
  }

  // 2. Contadores por delante del mayor ID usado
  for (const pref of ['BUG', 'FEAT', 'TECH']) {
    const max = rows.filter((r) => r.id.startsWith(pref)).reduce((a, r) => Math.max(a, +r.id.slice(-3)), 0);
    if (counters[pref] === undefined) err.push(`TAREAS.md: falta el contador de ${pref} en la línea "Contadores".`);
    else if (counters[pref] <= max) err.push(`TAREAS.md: contador ${pref}-${String(counters[pref]).padStart(3, '0')} ya usado; súbelo a ${pref}-${String(max + 1).padStart(3, '0')}.`);
  }

  // 3. Todo ID citado en el handoff o el changelog existe en TAREAS.md
  for (const [f, txt] of [['CONTINUAR.md', cont], ['CHANGELOG_AGENT.md', chg]]) {
    for (const id of idsOf(txt.replace(/```[\s\S]*?```/g, ''))) {
      if (!vistos.has(id)) err.push(`${f}: cita ${id}, que no está en TAREAS.md.`);
    }
  }

  // 4. El handoff conserva sus 10 secciones
  for (let i = 1; i <= 10; i++) {
    if (!new RegExp(`^## ${i}\\.`, 'm').test(cont)) err.push(`CONTINUAR.md: falta la sección ${i} de la plantilla.`);
  }

  // 5. La versión declarada en el handoff coincide con sw.js
  const sw = (read('sw.js').match(/ecos-v\d+/) || [])[0];
  const dec = ((cont.split(/^## 1\..*$/m)[1] || '').split(/^## /m)[0].match(/ecos-v\d+/) || [])[0];
  if (sw && dec && sw !== dec) err.push(`CONTINUAR.md declara ${dec} pero sw.js sirve ${sw}.`);

  // 6. Si cambia el juego, sube la versión de caché (evita servir HTML nuevo con SW viejo)
  const base = sh('git rev-parse --verify -q origin/main') ? 'origin/main' : '';
  const mb = base ? sh(`git merge-base HEAD ${base}`) : '';
  if (mb) {
    // Working tree incluido: el aviso llega antes de commitear, no después.
    const tocados = sh(`git diff --name-only ${mb}`).split('\n');
    const swBase = (sh(`git show ${mb}:sw.js`).match(/ecos-v\d+/) || [])[0];
    if (tocados.includes('index.html') && sw && swBase && sw === swBase) {
      err.push(`sw.js sigue en ${sw} pero index.html cambia respecto a main: incrementa "const C" o los navegadores servirán la caché antigua.`);
    }
  }
  if (!/^\|\s*\d{4}-\d{2}-\d{2}/m.test(chg)) err.push('CHANGELOG_AGENT.md: no hay ninguna fila de sesión con fecha.');

  // 6b. El commit estable declarado existe de verdad (evita shas inventados o con typo)
  const est = ultimoEstable();
  if (est.sha && est.sha !== '?' && !sh(`git cat-file -t ${est.sha}`)) {
    err.push(`CONTINUAR.md §2: el commit ${est.sha} no existe en el repositorio.`);
  }

  // 7b. Secretos: nada de claves privadas en lo que cambia respecto a main.
  // La publishable key de config.js es pública por diseño y no cuenta. Los patrones se
  // escriben con clases de caracteres para que este archivo no se detecte a sí mismo.
  if(mb){
    const peligros=[[/service[_]role/i,'clave de servicio de Supabase'],[/\bsk-[A-Za-z0-9]{16,}/,'clave de API tipo sk-'],
      [/\bghp_[A-Za-z0-9]{20,}/,'token de GitHub'],[/\bAKIA[0-9A-Z]{16}\b/,'clave de AWS'],
      [/-----BEGIN [A-Z ]*PRIVATE KEY-----/,'clave privada']];
    const diff=sh(`git diff -U0 ${mb} -- . ":(exclude)config.js"`);
    for(const linea of diff.split('\n')){
      if(!linea.startsWith('+')||linea.startsWith('+++'))continue;
      for(const [re,que] of peligros) if(re.test(linea)) err.push(`Posible ${que} en una línea añadida. Sácalo del repositorio antes de commitear.`);
    }
  }

  // 7. Ninguna suite queda huérfana: toda tests/*.cjs corre en npm test y en CI
  const pkg = read('package.json');
  const ci = read('.github/workflows/validate.yml');
  for (const f of sh('ls tests').split('\n').filter((f) => f.endsWith('.cjs') && f !== 'browser.cjs')) {
    if (!pkg.includes(`tests/${f}`)) err.push(`tests/${f} no está en el script "test" de package.json.`);
    if (ci && !ci.includes(`tests/${f}`)) err.push(`tests/${f} no se ejecuta en .github/workflows/validate.yml.`);
  }
  return err;
}

// Todo lo que hay que saber de un ID sin abrir un solo archivo.
function detalle(id) {
  const r = tareas().rows.find((x) => x.id === id.toUpperCase());
  if (!r) return console.error(`${id} no está en TAREAS.md`), process.exit(1);
  console.log(`${r.id}  ${r.titulo}`);
  console.log(`estado   ${r.estado}${r.quien !== '-' ? `  ·  reclamada por ${r.quien}` : ''}`);
  console.log(`roadmap  ${r.legacy === '—' ? '(sin fila en Drive)' : `fila ${r.legacy} del roadmap de Drive`}`);
  console.log(`falta    ${r.falta}`);
  const log = sh(`git log --oneline --grep=${r.id} --all -n 15`);
  console.log(`commits\n${log ? log.split('\n').map((l) => `  ${l}`).join('\n') : '  (ninguno todavía)'}`);
}

const cmd = process.argv[2] || 'preflight';
if (cmd === 'id') detalle(process.argv[3] || '');
else if (cmd === 'preflight') preflight();
else if (cmd === 'check') {
  const err = problemas();
  if (!err.length) console.log('CHECK OK · docs, IDs y versión coherentes');
  else { console.error('CHECK FALLA:'); for (const e of err) console.error(` - ${e}`); process.exit(1); }
} else { console.error('uso: node scripts/agent.mjs [preflight|check|id <ID>]'); process.exit(2); }
