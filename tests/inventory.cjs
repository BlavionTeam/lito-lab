// Regresiones de inventario y equipo: ningún objeto puede perderse ni venderse por error.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function logout()'));
const nodes=new Map(),storage=new Map();
const noop=()=>{};
const canvas=new Proxy({},{get:()=>noop,set:()=>true});
function el(id){if(!nodes.has(id)) nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,setAttribute:noop,remove(){this.removed=true},close(){this.open=false},querySelector:el,querySelectorAll:()=>[],appendChild:noop,getBoundingClientRect:()=>({width:400,height:400,left:0,top:0}),getContext:()=>canvas});return nodes.get(id)}
const sandbox={console,window:{matchMedia:()=>({matches:false}),ECOS_CONFIG:{}},document:{documentElement:el('html'),getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:el,addEventListener:noop,body:el('body')},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},performance:{now:()=>1000},setTimeout:()=>1,clearTimeout:noop,setInterval:noop,clearInterval:noop,requestAnimationFrame:noop,navigator:{},location:{protocol:'http:'},crypto:require('crypto').webcrypto,TextEncoder};sandbox.window.addEventListener=noop;
code=code.replace('/* ---------- boot ---------- */',`window.qa={fresh,logout,equip,RAR,unequip,fusionQuote,fuseEquipment,hydrate,setCloud(v){cloudConflict=v},sell,sellJunk,toggleLock,equipBest,genItem,itemPct,sellValue,clickDmg,dps,get S(){return S},setBack(b){BACK=b},seed(s){S=s;B=calcBon();ACC={id:'alpha',name:'Alpha'};cloudReady=true;S.enemy={hp:10,max:10};}}; return;\n/* ---------- boot ---------- */`);
vm.runInNewContext(code,sandbox); const q=sandbox.window.qa;
q.setBack({kind:'test',logout:noop,stopRank:noop,rank:noop,save:async()=>{},login:async()=>({acc:{id:'beta',name:'Beta'},save:null})});

// Genera un objeto real del juego para el slot pedido y le fija rareza/nivel.
const mk=(slot,r,ilvl)=>{for(let i=0;i<500;i++){const it=q.genItem(20,false);if(it.slot===slot){it.r=r;it.ilvl=ilvl;return it;}}throw new Error('no se pudo generar '+slot)};
const ids=()=>[...q.S.inv.map(i=>i.id),...Object.values(q.S.eq).filter(Boolean).map(i=>i.id)].sort();

let s=q.fresh();q.seed(s);
const arma1=mk('arma',1,5),arma2=mk('arma',3,20);
q.S.inv.push(arma1,arma2);
const todos=ids();
q.equip(arma2.id);
assert.equal(q.S.eq.arma.id,arma2.id,'equipar debe colocar el objeto en su hueco');
q.equip(arma1.id);
assert.equal(q.S.eq.arma.id,arma1.id);
assert.deepEqual(ids(),todos,'cambiar de equipo nunca puede destruir el objeto sustituido');
assert(q.S.inv.some(i=>i.id===arma2.id),'el objeto sustituido vuelve al inventario');
console.log('PASS equipar y sustituir no pierde objetos');

// Inventario lleno: desequipar no puede tirar el objeto al vacío.
s=q.fresh();q.seed(s);
q.S.inv=Array.from({length:40},()=>mk('botas',0,1));
q.S.eq.arma=mk('arma',4,30);
const eqId=q.S.eq.arma.id;
q.unequip('arma');
assert.equal(q.S.eq.arma.id,eqId,'con el inventario lleno el objeto sigue equipado');
assert.equal(q.S.inv.length,40);
q.S.inv.pop();
q.unequip('arma');
assert.equal(q.S.eq.arma,null);
assert(q.S.inv.some(i=>i.id===eqId),'al haber hueco, el objeto vuelve al inventario');
console.log('PASS inventario lleno no destruye el objeto desequipado');

// Venta: solo sale del inventario lo vendido, y el equipado nunca se toca.
s=q.fresh();q.seed(s);q.S.gold=0;
const vendible=mk('casco',0,1);
q.S.inv.push(vendible);q.S.eq.arma=mk('arma',4,30);
const oroEsperado=q.sellValue(vendible);
q.sell(vendible.id);
assert.equal(q.S.gold,oroEsperado,'la venta abona exactamente el valor del objeto');
assert.equal(q.S.inv.length,0);
q.sell(q.S.eq.arma.id);
assert(q.S.eq.arma,'vender por id no puede alcanzar al objeto equipado');
console.log('PASS venta abona el valor y nunca alcanza al equipo');

// Venta automática de basura: respeta míticos, el mejor de cada hueco y lo mejor que el equipo.
s=q.fresh();q.seed(s);
const mitico=mk('botas',4,30),mejorLibre=mk('casco',1,25),peor=mk('casco',0,1),mejorQueEquipo=mk('arma',1,40);
q.S.eq.arma=mk('arma',0,1);
q.S.inv=[mitico,mejorLibre,peor,mejorQueEquipo];
q.sellJunk();
const quedan=q.S.inv.map(i=>i.id);
assert(quedan.includes(mitico.id),'no vende objetos de rareza alta');
assert(quedan.includes(mejorLibre.id),'conserva el mejor de cada hueco sin equipar');
assert(quedan.includes(mejorQueEquipo.id),'conserva lo que mejora al equipo actual');
assert(!quedan.includes(peor.id),'sí vende el común peor');
console.log('PASS la venta automática solo tira lo que sobra');

// Equipar lo mejor: nunca empeora y es idempotente.
s=q.fresh();q.seed(s);
q.S.eq.arma=mk('arma',0,1);
q.S.inv=[mk('arma',3,30),mk('pechera',2,10)];
const antes={click:q.clickDmg(),dps:q.dps()};
q.equipBest();
const despues={click:q.clickDmg(),dps:q.dps()};
assert(despues.click>=antes.click&&despues.dps>=antes.dps,'equipar lo mejor nunca puede empeorar');
const foto=JSON.stringify(q.S.eq);
q.equipBest();
assert.equal(JSON.stringify(q.S.eq),foto,'una segunda pasada no cambia nada');
console.log('PASS equipar lo mejor nunca empeora y no oscila');

// Aislamiento: cerrar sesión no deja objetos de la cuenta anterior.
q.logout();
assert.equal(q.S.inv.length,0,'logout vacía el inventario');
assert(Object.values(q.S.eq).every(v=>!v),'logout vacía el equipo');
console.log('PASS logout no deja objetos de la cuenta anterior');

// Fusion consumes only the quoted materials, preserves the chosen base and persists atomically.
const prepareFusion=(r=0)=>{
 q.seed(q.fresh()); q.setCloud(false);q.S.gold=1e9;
 const base=mk('arma',r,5),a=mk('arma',r,2),b=mk('arma',r,3),other=mk('botas',1,8);
 q.S.inv=[base,a,b,other];q.S.eq.casco=mk('casco',4,12);
 return {base,a,b,other,quote:q.fusionQuote(base.id,[a.id,b.id])};
};
let f=prepareFusion();
const oldGold=q.S.gold,eqBefore=JSON.stringify(q.S.eq),powerBefore=q.itemPct(f.base);
const fused=q.fuseEquipment(f.quote);
assert(fused);assert.equal(fused.id,f.base.id);assert.equal(fused.r,1);
for(const k of ['slot','ilvl','w','main','sec'])assert.equal(fused[k],f.base[k],k+' must be preserved');
assert(q.itemPct(fused)>powerBefore);assert.equal(q.S.gold,oldGold-f.quote.cost);
assert.equal(q.S.inv.length,2);assert(q.S.inv.some(x=>x.id===f.other.id));assert.equal(JSON.stringify(q.S.eq),eqBefore);
const persisted=q.hydrate(JSON.parse(storage.get('ecos-abismo-v2')));
assert.equal(persisted.inv.find(x=>x.id===f.base.id).r,1);assert.equal(persisted.gold,q.S.gold);
const after=JSON.stringify(q.S);assert.equal(q.fuseEquipment(f.quote),null);assert.equal(JSON.stringify(q.S),after);
console.log('PASS fusion promotes exactly once, keeps base traits/equipment, charges exact cost and survives reload');

// FEAT-022: la escala llega hasta la exótica, que es la cima y ya no fusiona.
const cima=q.RAR.length-1;
for(let r=0;r<cima;r++){f=prepareFusion(r);assert.equal(q.fuseEquipment(f.quote).r,r+1);}
f=prepareFusion(cima);assert.equal(f.quote,null);
console.log(`PASS los ${cima} ascensos de rareza funcionan y la cima (${q.RAR[cima].n}) no se puede superar`);

f=prepareFusion();
assert.equal(q.fusionQuote(f.base.id,[f.a.id,f.a.id]),null);
assert.equal(q.fusionQuote(f.base.id,[f.a.id,f.other.id]),null);
assert.equal(q.fusionQuote(q.S.eq.casco.id,[f.a.id,f.b.id]),null);
q.S.inv.find(x=>x.id===f.b.id).r=1;assert.equal(q.fusionQuote(f.base.id,[f.a.id,f.b.id]),null);
console.log('PASS duplicate, incompatible, different rarity and equipped ingredients are rejected');

for(const mode of ['gold','sold','equipped','changed','cloud','replacement','logout','storage']){
 f=prepareFusion();
 if(mode==='gold')q.S.gold=f.quote.cost-1;
 if(mode==='sold')q.sell(f.a.id);
 if(mode==='equipped')q.equip(f.a.id);
 if(mode==='changed')q.S.inv.find(x=>x.id===f.base.id).ilvl++;
 if(mode==='cloud')q.setCloud(true);
 if(mode==='replacement')q.seed(q.hydrate(JSON.parse(JSON.stringify(q.S))));
 if(mode==='logout')q.logout();
 const memory=JSON.stringify(q.S),disk=storage.get('ecos-abismo-v2'),setter=sandbox.localStorage.setItem;
 if(mode==='storage')sandbox.localStorage.setItem=()=>{throw new Error('quota')};
 assert.equal(q.fuseEquipment(f.quote),null,mode);
 assert.equal(JSON.stringify(q.S),memory,mode+' cannot consume anything');
 assert.equal(storage.get('ecos-abismo-v2'),disk,mode+' cannot modify persisted save');
 sandbox.localStorage.setItem=setter;
}
console.log('PASS insufficient gold, stale quotes, cloud conflict, account changes and storage failure consume nothing');

f=prepareFusion();q.S.inv.push({...f.a});assert.equal(q.fusionQuote(f.base.id,[f.a.id,f.b.id]),null);
f=prepareFusion();while(q.S.inv.length<40)q.S.inv.push(mk('botas',0,1));
assert(q.fuseEquipment(f.quote));assert.equal(q.S.inv.length,38);
console.log('PASS corrupt duplicate IDs are rejected; full backpacks can fuse without losing unrelated items');

/* FEAT-010 · candado: una pieza marcada no se vende ni se consume como material. */
s=q.fresh();q.seed(s);
const guardada=mk('casco',0,1),sobrante=mk('casco',0,1);
guardada.id=9001;sobrante.id=9002;
q.S.inv.push(guardada,sobrante);
const oroInicial=q.S.gold;
assert.equal(q.toggleLock(9001),true,'el candado se activa');
q.sell(9001);
assert(q.S.inv.some(i=>i.id===9001),'la venta manual no puede tirar una pieza con candado');
assert.equal(q.S.gold,oroInicial,'una venta bloqueada no abona oro');
assert.equal(q.toggleLock(9001),false,'el candado se puede quitar');
assert.equal(q.toggleLock(9001),true);
q.sellJunk();
assert.deepEqual([...q.S.inv].map(i=>i.id),[9001],'la venta automática conserva la pieza con candado y tira el resto');
assert(q.S.gold>oroInicial,'lo vendido sí abona oro');
console.log('PASS locked items survive manual sale, auto-sale and keep their gold untouched');

s=q.fresh();q.seed(s);
const base=mk('botas',1,4),libre=mk('botas',1,4),cerrada=mk('botas',1,4);
base.id=9101;libre.id=9102;cerrada.id=9103;cerrada.lock=true;
q.S.inv.push(base,libre,cerrada);q.S.gold=1e9;
assert.equal(q.fusionQuote(9101,[9102,9103]),null,'un material con candado invalida la fusión');
base.lock=true;
assert.equal(q.fusionQuote(9101,[9102,9102]),null,'no se puede repetir el mismo material');
q.S.inv.push(Object.assign(mk('botas',1,4),{id:9104}));
const quote=q.fusionQuote(9101,[9102,9104]);
assert(quote,'la pieza base con candado sí puede fusionarse: se conserva, no se consume');
assert(q.fuseEquipment(quote),'la fusión con base bloqueada se completa');
assert.equal(q.S.inv.find(i=>i.id===9101).lock,true,'el resultado hereda el candado de la base');
assert(q.S.inv.some(i=>i.id===9103),'el material con candado sigue en la mochila');
console.log('PASS locked pieces are never consumed as fusion material; a locked base fuses and keeps its lock');

const sucio=q.hydrate({inv:[{id:1,slot:'arma',r:0,ilvl:1,w:0,lock:'sí'},{id:2,slot:'arma',r:0,ilvl:1,w:0}]});
assert.equal(sucio.inv[0].lock,false,'un lock no booleano se sanea a false');
assert.equal(sucio.inv[1].lock,false,'un objeto sin lock queda desbloqueado');
console.log('PASS imported saves cannot smuggle a non-boolean lock flag');
