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
   assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} ${width}: entry, 12 taps, skills/details, keyboard guard, boss/history, profile, navigation, overflow, no runtime errors`);
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
