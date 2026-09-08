// FEAT-003 · mide la progresión SIN tocar ni un coeficiente del juego.
// Simula por eventos (no por frames) sobre el código real de index.html:
// tiempo hasta los jefes de zona 1/4/8/12 y hasta el primer y segundo renacer,
// comparando tres rutas: solo clic, solo compañeros y mixta.
//   node scripts/balance.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
// clics/s sostenidos y en qué gasta el oro cada ruta
const RUTAS={
  clic:       {cps:4,   compra:['upg']},
  companeros: {cps:0.5, compra:['heroes']},
  mixta:      {cps:2,   compra:['upg','heroes']},
};
const TOPE=60*60*8;                            // 8 h simuladas: más allá se considera muro
const TOPE_FARMEO=60*60;                       // 1 h farmeando un mismo jefe ya es un muro

const fmt=s=>s>=3600?`${(s/3600).toFixed(1)} h`:s>=60?`${(s/60).toFixed(1)} min`:`${s.toFixed(0)} s`;

function nuevoJuego(){
  let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function logout()'));
  const nodes=new Map(),storage=new Map(),noop=()=>{};
  const canvas=new Proxy({},{get:()=>noop,set:()=>true});
  function el(id){if(!nodes.has(id))nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,setAttribute:noop,remove(){},close(){},querySelector:el,querySelectorAll:()=>[],appendChild:noop,get parentElement(){return el('__padre')},get children(){return[]},getBoundingClientRect:()=>({width:400,height:400,left:0,top:0}),getContext:()=>canvas});return nodes.get(id)}
  const sandbox={console:{log:noop,warn:noop,error:noop},window:{matchMedia:()=>({matches:false}),ECOS_CONFIG:{}},document:{documentElement:el('html'),getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:el,addEventListener:noop,body:el('body')},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},performance:{now:()=>1000},setTimeout:()=>1,clearTimeout:noop,setInterval:noop,clearInterval:noop,requestAnimationFrame:noop,navigator:{},location:{protocol:'http:'},crypto:require('crypto').webcrypto,TextEncoder};
  sandbox.window.addEventListener=noop;
  // Azar determinista y reproducible: mismas tiradas para las tres rutas.
  let semilla=0x9e3779b9;
  const rnd=()=>{semilla|=0;semilla=semilla+0x6D2B79F5|0;let t=Math.imul(semilla^semilla>>>15,1|semilla);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  sandbox.Math=Object.create(Math); sandbox.Math.random=rnd;
  code=code.replace('/* ---------- boot ---------- */',`window.qa={fresh,kill,dps,clickDmg,buyHero,heroCost,heroAvailable,soulGain,rebirth,enemyHp,bossTime,HEROES,buyUpg,upgCost,UPG,equipBest,buySoul,soulCost,SOUL,get S(){return S},get B(){return B},setBack(b){BACK=b},seed(s){S=s;B=calcBon();ACC={id:'sim',name:'Sim'};cloudReady=true;S.enemy={hp:1,max:1};}}; return;\n/* ---------- boot ---------- */`);
  vm.runInNewContext(code,sandbox);
  const q=sandbox.window.qa;
  q.setBack({kind:'sim',logout:noop,stopRank:noop,rank:noop,save:async()=>{},login:async()=>({acc:{id:'sim'},save:null})});
  q.seed(q.fresh());
  return q;
}

// Gasta las almas del renacer: poder y oro son las que rompen muros.
function gastarAlmas(q){
  for(let v=0;v<500;v++){
    let comprada=false;
    for(const k of ['power','gold','power']){        // el daño pesa el doble en la rotación
      if(q.S.souls>=q.soulCost(k)){const a=q.S.souls;q.buySoul(k);if(q.S.souls<a)comprada=true}
    }
    if(!comprada)return;
  }
}

// Gasta el oro en lo que más daño da por moneda, según la ruta.
function invertir(q,donde){
  for(let vueltas=0;vueltas<200;vueltas++){
    let mejor=null,ratio=Infinity;
    if(donde.includes('heroes')){
      for(let i=0;i<q.HEROES.length;i++){
        if(!q.heroAvailable(i))continue;
        const coste=q.heroCost(i,q.S.heroes[i]||0);
        if(coste>q.S.gold)continue;
        const r=coste/Math.max(1,q.HEROES[i].dmg*((q.S.heroes[i]||0)+1));
        if(r<ratio){ratio=r;mejor={tipo:'hero',i}}
      }
    }
    if(donde.includes('upg')){
      for(const k of ['sword','crit']){
        const lvl=q.S.upg[k]||0, coste=q.upgCost(k,lvl);
        if(coste>q.S.gold)continue;
        const r=coste/(k==='sword'?lvl+1:(lvl+1)*0.5);  // la espada rinde más por moneda
        if(r<ratio){ratio=r;mejor={tipo:'upg',k}}
      }
    }
    if(!mejor)return;
    const antes=q.S.gold;
    if(mejor.tipo==='hero')q.buyHero(mejor.i); else q.buyUpg(mejor.k);
    if(q.S.gold>=antes)return;                 // la compra no se aplicó: no insistir
  }
}

function simular(ruta){
  const q=nuevoJuego(),{cps,compra}=RUTAS[ruta];
  const hitos={},muros=[];
  let t=0,renaceres=0;
  while(t<TOPE){
    const z=q.S.zone,s=q.S.stage,jefe=s===10;
    const hp=q.enemyHp(z,s);
    // Valor esperado del golpe: el crítico se aplica en attack(), no dentro de clickDmg().
    const critM=1+q.B.crit*(q.B.critDmg-1);
    const dano=q.dps()+q.clickDmg()*critM*cps;
    if(dano<=0){muros.push(`sin daño en zona ${z}`);break}
    const seg=hp/dano;
    if(jefe){
      const limite=q.bossTime();
      if(seg>limite){
        // El juego devuelve al jugador a la etapa 9: farmea mobs hasta poder con el jefe.
        const t0=t; t+=limite;                 // el intento fallido consume su tiempo
        let dano2=dano,seg2=seg,farmeos=0;
        while(seg2>limite&&t-t0<TOPE_FARMEO&&farmeos<20000){
          const hpMob=q.enemyHp(z,9);
          t+=hpMob/dano2; farmeos++;
          q.S.stage=9; q.S.enemy={hp:0,max:hpMob,boss:false,name:'sim',icon:'x'};
          q.kill(); q.S.stage=9;               // kill() avanza etapa: se vuelve a la 9
          q.equipBest(); gastarAlmas(q); invertir(q,compra);
          dano2=q.dps()+q.clickDmg()*(1+q.B.crit*(q.B.critDmg-1))*cps;
          seg2=q.enemyHp(z,10)/dano2;
        }
        const farmeo=t-t0;
        muros.push(`jefe z${z}: ${(seg/limite).toFixed(1)}× corto, ${fmt(farmeo)} de farmeo`);
        if(seg2>limite){muros.push(`muro real en jefe z${z}`);break}
        q.S.stage=10; continue;
      }
      if(hitos[`jefe z${z}`]===undefined)hitos[`jefe z${z}`]=t;
    }
    t+=seg;
    q.S.enemy={hp:0,max:hp,boss:jefe,name:'sim',icon:'x'};
    q.kill();
    q.equipBest();                             // el jugador se pone lo mejor que le cae
    invertir(q,compra);
    if(q.soulGain()>0&&(renaceres<2||q.S.zone>=15)){
      renaceres++; hitos[`renacer ${renaceres}`]=t; q.rebirth();
      gastarAlmas(q); invertir(q,compra);
    }
  }
  return {hitos,muros,zonaFinal:q.S.zone,t};
}

const rutas=Object.keys(RUTAS);
const res=Object.fromEntries(rutas.map(r=>[r,simular(r)]));
const filas=['jefe z1','jefe z4','jefe z8','jefe z12','renacer 1','renacer 2'];

console.log(`FEAT-003 · progresión simulada · ${rutas.map(r=>`${r} ${RUTAS[r].cps} clic/s`).join(' · ')}\n`);
console.log(['hito',...rutas].map(c=>c.padEnd(14)).join(''));
console.log('-'.repeat(14*(rutas.length+1)));
for(const f of filas){
  console.log([f,...rutas.map(r=>res[r].hitos[f]!==undefined?fmt(res[r].hitos[f]):'no llega')].map(c=>String(c).padEnd(14)).join(''));
}
console.log();
for(const r of rutas){
  const m=res[r].muros;
  console.log(`${r.padEnd(12)} zona final ${String(res[r].zonaFinal).padEnd(4)} ${m.length?'muros: '+m.slice(0,5).join(' · '):'sin muros'}`);
}
console.log(`\nSupuestos: azar determinista, se equipa el mejor botín, se invierte el oro de forma óptima,
crítico contado como valor esperado. NO se modelan talentos, habilidades, combo, puntos débiles
ni oro offline, que en el juego real aceleran: estos tiempos son cotas superiores comparables
entre rutas, no tiempos reales de un jugador.`);
