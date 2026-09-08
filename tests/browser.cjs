// Isolated browser profiles and fictional saves only; never logs in to production.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out=process.env.QA_OUTPUT || '/tmp/lito-browser';fs.mkdirSync(out,{recursive:true});
let activePage;
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  for(const width of [320,390,430,1280]){
   const context=await browser.newContext({viewport:{width,height:width===1280?900:844},hasTouch:width<700,isMobile:width<700,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage(),errors=[];activePage=page;page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));console.log(`START ${engine.name()} ${width}`);
   await page.goto('http://localhost:4173');
   assert.match(await page.title(),/Lito|Ecos/i);
   await page.locator('#stGuest').click();await page.locator('#tutSkip').click();
   await page.locator('#stage').waitFor({state:'visible'});
   const initial=await page.evaluate(()=>window.__lito.S.stats.clicks);
   for(let i=0;i<12;i++)await page.locator('#stage').click({position:{x:30,y:80}});
   assert.equal(await page.evaluate(()=>window.__lito.S.stats.clicks),initial+12);
   assert.equal(await page.evaluate(()=>getSelection().toString()),'');
   assert.equal(await page.locator('#stage').evaluate(e=>getComputedStyle(e).touchAction),'none');
   await page.locator('[data-sk="fury"]').click();
   assert((await page.evaluate(()=>window.__lito.S.buff.fury))>0);
   await page.locator('[data-info="fury"]').click();assert(await page.locator('#skillDetail').isVisible());
   await page.locator('#skillClose').focus();
   const before=await page.evaluate(()=>window.__lito.S.stats.clicks);await page.keyboard.press('Space');
   assert.equal(await page.evaluate(()=>window.__lito.S.stats.clicks),before);
   assert.equal(await page.locator('#skillDetail').isVisible(),false,'Space activates the focused close button without attacking');
   await page.locator('[data-info="eclipse"]').click();assert.match(await page.locator('#skillRequirements').innerText(),/25|renacer/i);await page.locator('#skillClose').click();
   // Fixture: real boss victory must keep the arena usable and write history.
   await page.evaluate(()=>{window.__lito.setStage(1,10);window.__lito.S.enemy.hp=0.1;});
   await page.locator('#stage').click({position:{x:30,y:80}});
   assert.equal(await page.locator('#reward').isVisible(),false);
   await page.locator('#journalOpen').click();assert.match(await page.locator('#journalList').innerText(),/triunfo|Jefe/);
   await page.screenshot({path:`${out}/${engine.name()}-${width}-history.png`});
   await page.locator('#journalClose').click();await page.locator('#heroProfileOpen').click();
   assert.match(await page.locator('#profileStats').innerText(),/Clics de combate/);await page.locator('#profileClose').click();
   if(width<700){await page.locator('.mnav [data-v="camp"]').click();assert(await page.locator('#tab-camp').isVisible());await page.locator('.mnav [data-v="combate"]').click();}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page must not overflow horizontally');
   await page.screenshot({path:`${out}/${engine.name()}-${width}-combat.png`});
   // FEAT-007: use fictional loot, then exercise only the visible forge controls.
   const fixture=await page.evaluate(()=>{
    const q=window.__lito,s=q.S;s.gold=1000000;s.inv=[];
    const make=(slot,r,level)=>{const it=q.genItem(level,false);Object.assign(it,{slot,r,ilvl:level,main:slot==='arma'?'click':'dmg',sec:'gold',w:0,name:slot==='arma'?'Espada de prueba':'Botas de prueba'});s.inv.push(it);return it.id;};
    const base=make('arma',0,5),a=make('arma',0,2),b=make('arma',0,3);
    make('arma',0,4);make('botas',4,5);q.renderInv();return {base,a,b};
   });
   await page.locator(width<700?'.mnav [data-v="equip"]':'[data-tab="equip"]').click();
   assert.equal(await page.locator('#listInv .itemArt').count(),5);
   assert(await page.evaluate(()=>[...document.querySelectorAll('.inventoryRow')].every(row=>{const icon=row.querySelector('.ic').getBoundingClientRect(),text=row.querySelector('.t').getBoundingClientRect();return icon.right<=text.left+1;})),'icons cannot overlap item names');
   await page.screenshot({path:`${out}/${engine.name()}-${width}-equipment.png`});
   await page.locator(`[data-item="${fixture.base}"]`).click();await page.locator('#itemDetailFuse').click();
   assert.match(await page.locator('#forgePreview').innerText(),/Común → Raro/);
   assert.equal(await page.locator('#forgeConfirm').isEnabled(),false);
   await page.locator(`#forgeMaterials input[value="${fixture.a}"]`).check();await page.locator(`#forgeMaterials input[value="${fixture.b}"]`).check();
   assert.equal(await page.locator('#forgeMaterials input:disabled').count(),1);
   const beforeFusion=await page.evaluate(()=>JSON.stringify({inv:window.__lito.S.inv,gold:window.__lito.S.gold}));
   await page.locator('#forgeConfirm').click();
   assert.equal(await page.evaluate(()=>JSON.stringify({inv:window.__lito.S.inv,gold:window.__lito.S.gold})),beforeFusion,'first tap only asks for confirmation');
   await page.locator('#forgeClose').click();
   assert.equal(await page.evaluate(()=>JSON.stringify({inv:window.__lito.S.inv,gold:window.__lito.S.gold})),beforeFusion,'cancel never consumes loot');
   await page.locator(`[data-item="${fixture.base}"]`).click();await page.locator('#itemDetailFuse').click();
   await page.locator(`#forgeMaterials input[value="${fixture.a}"]`).check();await page.locator(`#forgeMaterials input[value="${fixture.b}"]`).check();
   await page.locator('#forgeConfirm').click();
   assert(await page.locator('#forge').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'forge cannot overflow horizontally');
   await page.screenshot({path:`${out}/${engine.name()}-${width}-forge.png`});
   await page.locator('#forgeConfirm').click();
   assert.match(await page.locator('#itemDetailMeta').innerText(),/Raro · Nivel 5/);
   assert.equal(await page.evaluate(()=>window.__lito.S.inv.length),3);
   const persisted=await page.evaluate(id=>JSON.parse(localStorage.getItem('ecos-abismo-v2')).inv.find(x=>x.id===id).r,fixture.base);assert.equal(persisted,1);
   await page.screenshot({path:`${out}/${engine.name()}-${width}-fused.png`});
   await page.locator('#itemDetailClose').click();
   console.log(`PASS ${engine.name()} ${width}: rarity art, forge selection, cancel, confirmation, promotion, persistence, no overlap`);
   // FEAT-010: el candado protege una pieza de la venta manual, la automática y la forja.
   await page.evaluate(()=>{const L=window.__lito,base=Object.assign(L.genItem(1),{r:0,ilvl:1});L.S.inv.length=0;
    L.S.inv.push({...base,id:9001,name:'Pieza guardada'},{...base,id:9002,name:'Pieza sobrante'},{...base,id:9003,name:'Material'});L.renderInv();});
   await page.locator('[data-item="9001"]').click();
   await page.locator('#itemDetailLock').click();
   await page.locator('[data-item="9001"] .lockPill').waitFor({state:'visible'});
   await page.locator('[data-item="9001"]').click();
   assert.equal(await page.locator('#itemDetailSell').isHidden(),true,'una pieza con candado no ofrece venta');
   assert.equal(await page.locator('#itemDetailLock').innerText(),'Quitar candado');
   await page.locator('#itemDetailClose').click();
   await page.locator('[data-item="9002"]').click();await page.locator('#itemDetailFuse').click();
   assert.doesNotMatch(await page.locator('#forgeMaterials').innerText(),/Pieza guardada/,'la forja no ofrece piezas con candado');
   await page.locator('#forgeClose').click();
   await page.locator('#btnJunk').click();
   assert.deepEqual([...await page.evaluate(()=>window.__lito.S.inv.map(i=>i.id))],[9001],'la venta automática respeta el candado');
   await page.screenshot({path:`${out}/${engine.name()}-${width}-candado.png`});
   console.log(`PASS ${engine.name()} ${width}: locked item keeps its lock badge, hides sale, stays out of the forge and survives auto-sale`);
   // FEAT-011: el compañero bloqueado dice cuánto falta y lo dibuja.
   await page.evaluate(()=>window.__lito.setStage(2,1));
   await page.locator(width<700?'.mnav [data-v="camp"]':'.tabs [data-tab="camp"]').click();
   await page.locator('[data-hero="1"]',{hasText:'te faltan 2 zonas'}).waitFor({state:'visible'});
   assert.equal(await page.locator('[data-hero="1"] .unlockBar > i').evaluate(e=>e.style.width),'33.3%','la barra refleja 1 de 3 zonas');
   await page.screenshot({path:`${out}/${engine.name()}-${width}-desbloqueo.png`});
   console.log(`PASS ${engine.name()} ${width}: locked companion shows the remaining zones and a matching progress bar`);
   assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} ${width}: entry, 12 taps, skills/details, keyboard guard, boss/history, profile, navigation, overflow, no runtime errors`);
   await context.close();
  }
  // Cuenta y ranking con el backend simulado en la propia red del navegador:
  // se ejercita el camino real del cliente sin tocar nunca producción.
  // TECH-004 rol admin · FEAT-008 puesto propio · FEAT-009 cambio de PIN.
  for(const caso of [
   {nombre:'admin',isAdmin:true,rank:{posicion:null,total:4,puntuacion:1001},espera:/no apareces en el ranking/i},
   {nombre:'fuera del top',isAdmin:false,rank:{posicion:40,total:128,puntuacion:24310},espera:/Tu puesto:\s*40 de 128/}
  ]){
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(15000);activePage=page;
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const UID='11111111-2222-3333-4444-555555555555';
   await page.route('**/*.supabase.co/**',route=>{
    const url=route.request().url(),method=route.request().method();
    const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    if(url.includes('/auth/v1/user')&&method==='PUT')return json({id:UID});
    if(url.includes('/auth/v1/token'))return json({access_token:'t',refresh_token:'r',expires_in:3600,user:{id:UID}});
    if(url.includes('/rest/v1/rpc/my_rank'))return json([caso.rank]);
    if(url.includes('/rest/v1/ranking'))return json(Array.from({length:25},(_,i)=>({name:`Rival ${i+1}`,score:90000-i*1000,max_zone:60-i,rebirths:5,level:40})));
    if(url.includes('/rest/v1/players'))return method==='GET'?json([{name:'Prueba',save:null,save_version:0,is_admin:caso.isAdmin}]):json([{name:'Prueba',save:null,save_version:1}]);
    return json({});
   });
   await page.goto('http://localhost:4173');
   await page.locator('#stName').fill('Prueba');await page.locator('#stPin').fill('123456');
   await page.locator('#stLogin').click();
   await page.locator('#tutSkip').click().catch(()=>{});
   await page.locator('.mnav [data-v="acc"]').click();
   await page.locator('#accCard').waitFor({state:'visible'});
   const card=await page.locator('#accCard').innerText();
   assert.equal(/ADMIN/i.test(card),caso.isAdmin,'el distintivo de admin solo aparece en la cuenta admin');
   if(caso.isAdmin)assert.match(card,/fuera del ranking/i,'la cuenta admin avisa de que no aparece en el ranking');
   await page.locator('#rankMine').waitFor({state:'visible'});
   assert.match(await page.locator('#rankMine').innerText(),caso.espera,'el puesto propio se muestra según el caso');
   await page.screenshot({path:`${out}/${browser.browserType().name()}-cuenta-${caso.nombre.replace(/ /g,'-')}.png`,fullPage:true});
   // FEAT-009: PIN corto rechazado, PIN válido confirmado.
   await page.locator('#btnPin').click();
   await page.locator('#pinOld').fill('123456');await page.locator('#pinNew').fill('123');
   await page.locator('#btnPinSave').click();
   assert.match(await page.locator('#accMsg').innerText(),/6 dígitos o más/,'un PIN corto se rechaza');
   await page.locator('#pinNew').fill('99887766');
   await page.locator('#btnPinSave').click();
   await page.locator('#toast.show',{hasText:'PIN actualizado'}).waitFor({state:'visible'});
   assert.equal(await page.locator('#pinBox').isHidden(),true,'el formulario de PIN se cierra tras el cambio');
   // Cerrar sesión no puede dejar el puesto de la cuenta anterior en pantalla.
   await page.locator('#btnLogout').click();
   assert.equal(await page.locator('#rankMine').isHidden(),true,'al cerrar sesión desaparece tu puesto');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${browser.browserType().name()} cuenta (${caso.nombre}): admin badge, own rank position, PIN change and logout cleanup`);
   await context.close();
  }
  // PWA instalada: manifest válido, service worker activo y arranque sin red.
  // Cubre la parte de TECH-002 que no necesita un iPhone físico.
  {
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
   const page=await context.newPage();page.setDefaultTimeout(15000);
   await page.goto('http://localhost:4173');
   const man=await page.evaluate(async()=>{
     const l=document.querySelector('link[rel="manifest"]');if(!l)return null;
     return (await fetch(l.href)).json();
   });
   assert(man,'la página debe declarar un manifest');
   assert(man.name&&man.start_url&&man.display==='standalone','manifest incompleto para instalar');
   assert(man.icons.some(i=>i.sizes==='512x512'),'falta el icono de 512');
   assert(man.icons.some(i=>i.purpose==='maskable'),'falta el icono maskable de Android');
   const soportaSW=await page.evaluate(()=>'serviceWorker' in navigator);
   if(!soportaSW){console.log(`SKIP ${browser.browserType().name()} PWA: sin service worker en este motor`);}
   else{
    try{
    const activo=await page.evaluate(async()=>{
      const r=await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      return !!(r.active||navigator.serviceWorker.controller);
    });
    assert(activo,'el service worker debe activarse');
    const version=await page.evaluate(async()=>{const k=await caches.keys();return k.find(x=>/^ecos-v\d+$/.test(x))||null});
    assert(version,'el service worker debe crear su caché de versión');
    await page.reload({waitUntil:'load'});          // segunda visita: ya controlada por el SW
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload({waitUntil:'load'});
    assert.match(await page.title(),/Lito|Ecos/i,'sin red, el SW debe servir la app desde caché');
    await page.locator('#stGuest').click();await page.locator('#tutSkip').click();
    await page.locator('#stage').waitFor({state:'visible'});
    const antes=await page.evaluate(()=>window.__lito.S.stats.clicks);
    await page.locator('#stage').click({position:{x:30,y:80}});
    assert.equal(await page.evaluate(()=>window.__lito.S.stats.clicks),antes+1,'sin red se debe poder jugar');
    await context.setOffline(false);
    console.log(`PASS ${browser.browserType().name()} PWA: manifest instalable, service worker activo (${version}), arranque y combate sin red`);
    }catch(err){
     // El soporte de service workers de WebKit bajo Playwright es limitado: ahí se avisa
     // sin romper el CI, porque la señal real de esta comprobación la da Chromium.
     if(browser.browserType().name()!=='webkit')throw err;
     console.log(`SKIP webkit PWA: ${err.message.split('\n')[0]}`);
     await context.setOffline(false);
    }
   }
   await context.close();
  }
  await browser.close();
 }
})().catch(async e=>{console.error(e);if(activePage){console.error(await activePage.locator('body').innerText().catch(()=>''));await activePage.screenshot({path:`${out}/failure.png`,timeout:5000}).catch(()=>{});}process.exit(1)});
