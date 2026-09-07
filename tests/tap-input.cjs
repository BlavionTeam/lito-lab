const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const handlers = {}, stage = {getBoundingClientRect: () => ({width:390,height:400})};
let modal = null, attacks = 0;
const code = html.slice(html.indexOf('const tapSurface ='), html.indexOf("$('btnBoss').addEventListener"));
vm.runInNewContext(code, {document:{addEventListener:(name,fn)=>handlers[name]=fn,querySelector:()=>modal},$:()=>stage,attack:()=>attacks++,Math});
function event(kind, groups=[], extra={}) {
  let prevented = false;
  const ev = {code:'Space',repeat:false,target:{isContentEditable:false,closest:selector=>groups.some(g=>selector.split(',').map(s=>s.trim()).includes(g))?{}:null},preventDefault:()=>{prevented=true},...extra};
  handlers[kind](ev); return prevented;
}
for (const kind of ['contextmenu','selectstart','dragstart']) {
  for (const control of ['.stage','button','summary','[role="button"]','.tabs','.mnav']) assert(event(kind,[control]), `${kind}: protect ${control}`);
  for (const field of ['input','textarea','[contenteditable="true"]','.selectable']) assert(!event(kind,[field,'button']), `${kind}: preserve ${field}`);
  assert(!event(kind), `${kind}: explanatory text stays selectable`);
}
assert(event('keydown'));assert.equal(attacks,1);
for (const control of ['button','input','textarea','select','summary','a','[role="button"]','dialog']) assert(!event('keydown',[control]));
assert(!event('keydown',[],{repeat:true}));
modal={};assert(!event('keydown'));modal=null;
stage.getBoundingClientRect=()=>({width:0,height:0});assert(!event('keydown'));
assert.equal(attacks,1);
console.log('PASS tap guards preserve text fields; Space attacks once and never through controls, dialogs or hidden arena');
