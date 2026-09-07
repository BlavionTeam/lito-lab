const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const code=html.slice(html.indexOf('async function cloudSave('),html.indexOf('function rankNumber'));
const nodes=new Map(),store=new Map();let failStorage=false,writeCalls=0,readCalls=0;
function node(){return {textContent:'',parentElement:{appendChild:b=>nodes.set(b.id,b)},addEventListener(){},remove(){nodes.delete(this.id)}};}
nodes.set('btnCloudSave',node());
const ctx={sessionEpoch:0,loginBusy:false,S:{level:1,stats:{time:1}},B:null,ACC:{uid:'u1'},cloudReady:true,cloudBusy:false,cloudLoading:false,cloudConflict:false,cloudHold:0,Number,Date,JSON,Object,
 $:id=>nodes.get(id),document:{createElement:()=>node()},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>{if(failStorage)throw Error('quota');store.set(k,v)}},
 progressOf:s=>s.level,accSay:()=>{},toast:()=>{},markCloud:()=>{},save:()=>{},hydrate:x=>x,calcBon:()=>0,spawn:()=>{},renderAll:()=>{},renderAcc:()=>{},renderRank:()=>{},cloudWins:()=>false,
 BACK:{kind:'supabase',save:async()=>{writeCalls++;throw {code:'save_conflict'}},load:async()=>{readCalls++;return {level:4,stats:{time:2}}},version:()=>2,rank:()=>{}}};
ctx.replacePlayer=sv=>{ctx.S=sv};
vm.createContext(ctx);vm.runInContext(code,ctx);
(async()=>{await ctx.cloudSave(true);assert.equal(ctx.cloudConflict,true);assert.ok(nodes.has('btnCloudRecover'));assert.equal(ctx.S.level,1);await ctx.cloudSave(true,true);assert.equal(writeCalls,1);failStorage=true;await ctx.recoverCloud();assert.equal(ctx.S.level,1);assert.equal(ctx.cloudConflict,true);failStorage=false;await ctx.recoverCloud();assert.equal(ctx.S.level,4);assert.equal(ctx.S.cloud.version,2);assert.equal(ctx.cloudConflict,false);assert.equal(nodes.has('btnCloudRecover'),false);assert.equal(JSON.parse(store.get('ecos-save-recovery-u1')).at(-1).save.level,1);
ctx.cloudReady=false;ctx.S={level:99,stats:{time:1},cloud:{uid:'u1',version:1}};await ctx.syncCloud();assert.equal(ctx.cloudConflict,true);assert.equal(ctx.S.level,99);assert.equal(writeCalls,1);
console.log('PASS: conflict retains local state, force cannot bypass, quota failure retains local, recovery keeps backup/version, stale startup cannot overwrite cloud');})().catch(e=>{console.error(e);process.exitCode=1});
