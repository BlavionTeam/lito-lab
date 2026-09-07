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
   assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} ${width}: entry, 12 taps, skills/details, keyboard guard, boss/history, profile, navigation, overflow, no runtime errors`);
   await context.close();
  }
  await browser.close();
 }
})().catch(async e=>{console.error(e);if(activePage){console.error(await activePage.locator('body').innerText().catch(()=>''));await activePage.screenshot({path:`${out}/failure.png`,timeout:5000}).catch(()=>{});}process.exit(1)});
