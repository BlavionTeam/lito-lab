// Regresiones de inventario y equipo: ningún objeto puede perderse ni venderse por error.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function logout()'));
const nodes=new Map(),storage=new Map();
const noop=()=>{};
const canvas=new Proxy({},{get:()=>noop,set:()=>true});
function el(id){if(!nodes.has(id)) nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,setAttribute:noop,remove(){this.removed=true},close(){this.open=false},querySelector:el,querySelectorAll:()=>[],appendChild:noop,getBoundingClientRect:()=>({width:400,height:400,left:0,top:0}),getContext:()=>canvas});return nodes.get(id)}
const sandbox={console,window:{matchMedia:()=>({matches:false}),ECOS_CONFIG:{}},document:{documentElement:el('html'),getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:el,addEventListener:noop,body:el('body')},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},performance:{now:()=>1000},setTimeout:()=>1,clearTimeout:noop,setInterval:noop,clearInterval:noop,requestAnimationFrame:noop,navigator:{},location:{protocol:'http:'},crypto:require('crypto').webcrypto,TextEncoder};sandbox.window.addEventListener=noop;
code=code.replace('/* ---------- boot ---------- */',`window.qa={fresh,logout,equip,unequip,sell,sellJunk,equipBest,genItem,itemPct,sellValue,clickDmg,dps,get S(){return S},setBack(b){BACK=b},seed(s){S=s;B=calcBon();ACC={id:'alpha',name:'Alpha'};cloudReady=true;S.enemy={hp:10,max:10};}}; return;\n/* ---------- boot ---------- */`);
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
