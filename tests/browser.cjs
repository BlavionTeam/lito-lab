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
   // FEAT-023: el botón de la cabecera abre los desafíos; la crónica de hitos es una
   // de sus pestañas, y una recompensa cumplida se cobra una sola vez.
   await page.locator('#journalOpen').click();
   await page.locator('#quests').waitFor({state:'visible'});
   await page.locator('[data-qt="d"]').click();
   assert.equal(await page.locator('.questRow').count(),3,'la tanda diaria trae tres objetivos');
   assert.match(await page.locator('#questHint').innerText(),/Cambian cada día/);
   await page.locator('[data-qt="p"]').click();
   const cobrable=page.locator('.questRow.listo [data-cobrar]').first();
   if(await cobrable.count()){
    const oroAntes=await page.evaluate(()=>window.__lito.S.gold);
    await cobrable.click();
    assert((await page.evaluate(()=>window.__lito.S.gold))>oroAntes,'cobrar una recompensa entrega su oro');
    assert.equal(await page.locator('#toast.show').count(),1,'y lo confirma en pantalla');
   }
   await page.locator('[data-qt="c"]').click();
   assert.match(await page.locator('#journalList').innerText(),/triunfo|Jefe/);
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
   // BUG-002: ningún texto de la interfaz se selecciona; los campos escribibles sí.
   await page.locator(width<700?'.mnav [data-v="acc"]':'.tabs [data-tab="acc"]').click();
   assert.equal(await page.locator('#accCard p').first().evaluate(e=>getComputedStyle(e).webkitUserSelect||getComputedStyle(e).userSelect),'none','el texto de los paneles no se selecciona');
   assert.equal(await page.locator('#saveBox').evaluate(e=>getComputedStyle(e).webkitUserSelect||getComputedStyle(e).userSelect),'text','la caja de copia de seguridad sigue siendo seleccionable');
   await page.locator('#accCard p').first().dblclick();
   assert.equal(await page.evaluate(()=>getSelection().toString()),'','un doble toque sobre el texto de un panel no selecciona nada');
   await page.locator('#saveBox').fill('texto de prueba');
   assert.equal(await page.locator('#saveBox').inputValue(),'texto de prueba','los campos de texto siguen aceptando escritura');
   await page.locator('#saveBox').fill('');
   console.log(`PASS ${engine.name()} ${width}: panel text is unselectable while inputs stay writable`);
   // BUG-003: viajar de zona respeta el mínimo táctil, guarda y refresca los botones.
   await page.locator(width<700?'.mnav [data-v="combate"]':'.tabs [data-tab="camp"]').click();
   if(width>=700)await page.locator('.tabs [data-tab="camp"]').click();
   await page.evaluate(()=>{const L=window.__lito;L.S.maxZone=3;L.setStage(1,1);});
   if(width<700)assert((await page.locator('#btnNextZone').boundingBox()).height>=44,'los botones de zona cumplen el mínimo táctil');
   await page.locator('#btnNextZone').click();
   assert.equal(await page.evaluate(()=>window.__lito.S.zone),2,'Siguiente avanza de zona');
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ecos-abismo-v2')).zone),2,'el viaje se guarda en el acto');
   await page.locator('#btnPrevZone').click();
   assert.equal(await page.evaluate(()=>window.__lito.S.zone),1,'Anterior retrocede de zona');
   assert.equal(await page.locator('#btnPrevZone').isDisabled(),true,'en la zona 1 Anterior se deshabilita sin esperar al siguiente render');
   console.log(`PASS ${engine.name()} ${width}: zone travel saves immediately, refreshes its buttons and keeps a 44px touch target`);
   assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} ${width}: entry, 12 taps, skills/details, keyboard guard, boss/history, profile, navigation, overflow, no runtime errors`);
   await context.close();
  }
  // BUG-004: la altura útil de un iPhone es la pantalla menos la barra de estado y
  // el indicador de inicio, bastante menos que los 844 px de los casos de arriba.
  // A esa altura es donde la fila de zona se salía y quedaba medio tapada.
  for(const [w,h] of [[393,759],[390,700],[320,640]]){
   const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(15000);activePage=page;
   await page.goto('http://localhost:4173');
   await page.locator('#stGuest').click();await page.locator('#tutSkip').click();
   await page.locator('#stage').waitFor({state:'visible'});
   const m=await page.evaluate(()=>{
    const arena=document.querySelector('.arena'),nav=document.querySelector('.nav'),hero=document.querySelector('.hero');
    return {desborde:arena.scrollHeight-arena.clientHeight,
      tapada:Math.round(nav.getBoundingClientRect().bottom-hero.getBoundingClientRect().top),
      alto:Math.round(nav.getBoundingClientRect().height)};
   });
   assert.equal(m.desborde,0,`${w}x${h}: la arena desborda ${m.desborde}px y empuja la fila de zona fuera de la vista`);
   assert(m.tapada<=0,`${w}x${h}: el panel del héroe tapa ${m.tapada}px de la fila de zona`);
   assert(m.alto>=44,`${w}x${h}: los botones de zona bajan de 44px`);
   for(const id of ['btnPrevZone','btnBoss','btnNextZone'])await page.locator('#'+id).waitFor({state:'visible'});
   await page.screenshot({path:`${out}/${browser.browserType().name()}-${w}x${h}-zona.png`});
   console.log(`PASS ${browser.browserType().name()} ${w}x${h}: the zone row fits whole, untouched by the hero panel`);
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
   // WebKit bajo Playwright no deja interceptar el preflight de una petición cross-origin,
   // así que el PATCH al backend simulado que sigue a una recarga se queda en «access
   // control checks». Es del banco de pruebas, no del juego: en producción Supabase
   // responde al preflight. Se descarta ese mensaje y solo ese; el resto de la consola
   // se sigue exigiendo limpia.
   const errors=[];page.on('pageerror',e=>{ if(/due to access control checks/.test(e.message)&&/supabase\.co/.test(e.message))return; errors.push(e.message); });
   const UID='11111111-2222-3333-4444-555555555555';
   let rescateGuardado=null;
   await page.route('**/*.supabase.co/**',route=>{
    const url=route.request().url(),method=route.request().method();
    // El backend simulado vive en otro origen: WebKit exige la respuesta al preflight y
    // las cabeceras CORS explícitas, o el guardado en la nube falla «due to access
    // control checks» y ensucia la consola con un error que no es del juego.
    const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,PUT,OPTIONS','access-control-expose-headers':'*'};
    if(method==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const json=body=>route.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify(body)});
    if(url.includes('/auth/v1/user')&&method==='PUT')return json({id:UID});
    if(url.includes('/auth/v1/token'))return json({access_token:'t',refresh_token:'r',expires_in:3600,user:{id:UID}});
    if(url.includes('/rest/v1/rpc/my_rank'))return json([caso.rank]);
    if(url.includes('/rest/v1/rpc/is_admin'))return json(caso.isAdmin);
    if(url.includes('/rest/v1/rpc/set_rescue_code')){rescateGuardado=JSON.parse(route.request().postData()).codigo;return json(true);}
    if(url.includes('/rest/v1/rpc/rescue_account'))return json(JSON.parse(route.request().postData()).codigo===rescateGuardado);
    if(url.includes('/rest/v1/rpc/player_card'))return json([{name:'Rival 1',score:90000,max_zone:60,rebirths:5,level:40,tiempo:4321,kills:5714,jefes:598,trofeos:71,especies:7,score_capped:false,updated_at:'2026-09-08T10:32:29Z'}]);
    if(url.includes('/rest/v1/rpc/admin_players'))return json([
      {id:'p1',name:'Honrada',score:74788,max_zone:72,rebirths:11,level:38,is_admin:false,updated_at:'2026-09-08T10:32:29Z',score_capped:false,cheat_note:null,gold:1e9,souls:25,tiempo:4778,credito:4778,kills:5714,clicks:8200,jefes:598,oro_total:1e10,objetos:12,mascotas:6,trofeos:71},
      {id:'p2',name:'Sospechosa',score:2185012,max_zone:2185,rebirths:0,level:12,is_admin:false,updated_at:'2026-09-10T22:00:00Z',score_capped:true,cheat_note:'recortado a zona 2185',gold:1e6,souls:0,tiempo:1e7,credito:21824,kills:51,clicks:60,jefes:1,oro_total:4000,objetos:0,mascotas:0,trofeos:1}]);
    if(url.includes('/rest/v1/rpc/admin_player_save'))return json({gold:193,level:6,zone:3});
    if(url.includes('/rest/v1/rpc/admin_grant'))return json({gold:2000000,souls:50});
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
   // FEAT-018: la consola de administración solo existe para la cuenta con rol, y hace
   // cambios reales sobre la partida; el directorio marca a quien tiene la puntuación recortada.
   assert.equal(await page.locator('#adminPanel').isVisible(),caso.isAdmin,'el panel de administración solo se abre con rol');
   if(caso.isAdmin){
    const antes=await page.evaluate(()=>window.__lito.S.gold);
    await page.locator('[data-adm="oro"]').click();
    assert.equal(await page.evaluate(()=>window.__lito.S.gold),antes+1e6,'la consola entrega oro de verdad');
    await page.locator('#admZone').fill('30');await page.locator('[data-adm="zona"]').click();
    assert.equal(await page.evaluate(()=>window.__lito.S.zone),30,'la consola viaja a cualquier zona');
    await page.locator('#admLoad').click();
    await page.locator('.adminRow').first().waitFor();
    assert.equal(await page.locator('.adminRow').count(),2,'el directorio lista a los jugadores');
    assert.equal(await page.locator('.adminRow.flagged').count(),1,'una puntuación recortada queda marcada');
    await page.locator('[data-adm-row="1"]').click();
    await page.locator('#adminPlayer').waitFor({state:'visible'});
    assert.match(await page.locator('#admPlayerStats').innerText(),/Juego acreditado/,'la ficha compara tiempo declarado y acreditado');
    await page.locator('#admSaveGo').click();
    await page.locator('#admPlayerSave').waitFor({state:'visible'});
    await page.screenshot({path:`${out}/${browser.browserType().name()}-admin.png`,fullPage:true});
    await page.locator('#admPlayerClose').click();
    console.log(`PASS ${browser.browserType().name()} administración: consola de recursos, viaje de zona, directorio y ficha con puntuación recortada`);
   }else{
    // FEAT-018: marcarse admin en el almacenamiento del navegador no abre el panel;
    // al recuperar la sesión el rol se vuelve a preguntar al servidor, que dice que no.
    await page.evaluate(()=>{const a=JSON.parse(localStorage.getItem('ecos-abismo-acc'));a.admin=true;localStorage.setItem('ecos-abismo-acc',JSON.stringify(a));});
    await page.reload({waitUntil:'load'});
    await page.locator('.mnav [data-v="acc"]').click();
    await page.locator('#accCard').waitFor({state:'visible'});
    await page.waitForTimeout(500);
    assert.equal(await page.locator('#adminPanel').isVisible(),false,'un admin inventado en localStorage no abre el panel');
    console.log(`PASS ${browser.browserType().name()} administración: el rol lo confirma el servidor, no el almacenamiento del navegador`);
   }
   // FEAT-025: el código de rescate se puede renovar desde la cuenta, y con él se pone un
   // PIN nuevo sin conocer el anterior. El código malo no abre nada.
   await page.locator('#btnRescue').click();
   await page.locator('#rescueShow').waitFor({state:'visible'});
   const rescate=await page.locator('#rescueCode').innerText();
   assert.match(rescate,/^LITO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,'el código tiene el formato que se le enseña al jugador');
   assert.equal(rescate,rescateGuardado,'y es exactamente el que ha quedado guardado en el servidor');
   await page.locator('#rescueClose').click();
   await page.evaluate(()=>{document.getElementById('start').hidden=false});
   await page.locator('#stForgot').click();
   await page.locator('#recover').waitFor({state:'visible'});
   await page.locator('#recName').fill('Prueba');
   await page.locator('#recCode').fill('LITO-ZZZZ-ZZZZ-ZZZZ');await page.locator('#recPin').fill('112233');
   await page.locator('#recGo').click();
   await page.locator('#recMsg',{hasText:'no coinciden'}).waitFor();
   await page.locator('#recCode').fill(rescate);await page.locator('#recGo').click();
   await page.locator('#recMsg',{hasText:'PIN nuevo'}).waitFor();
   await page.locator('#recClose').click();
   await page.evaluate(()=>{document.getElementById('start').hidden=true});
   console.log(`PASS ${browser.browserType().name()} rescate: el código se renueva, se guarda en el servidor y canjea un PIN nuevo`);

   // FEAT-021: la ficha de un rival amplía con los datos públicos que sirve el servidor.
   await page.locator('#rank .rank').first().click();
   await page.locator('#rivalExtra').waitFor({state:'visible'});
   assert.match(await page.locator('#rivalExtra').innerText(),/Jefes vencidos/,'la ficha del rival trae sus hazañas');
   await page.locator('#rivalClose').click();
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
