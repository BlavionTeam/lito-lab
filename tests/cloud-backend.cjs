const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
const code=html.slice(html.indexOf('function sbBack(){'),html.indexOf('function accSay('));
let row={id:'u1',name:'QA',save:{level:1},save_version:0}, calls=0;
const fetch=async (url,opts)=>{calls++;const path=url.split('/rest/v1/')[1];const data=opts.body&&JSON.parse(opts.body);let out;
 if(opts.method==='PATCH'){const expected=Number(path.match(/save_version=eq\.(\d+)/)[1]); if(row&&row.save_version===expected){row={...row,...data};out=[row];}else out=[];}
 else if(opts.method==='POST'){if(row)return {ok:false,status:409,text:async()=>''};row=data;out=[row];}
 else out=row?[row]:[];
 return {ok:true,text:async()=>JSON.stringify(out)};
};
function client(){const store=new Map([['ecos-abismo-sb',JSON.stringify({access_token:'fake',uid:'u1',exp:Date.now()+100000})]]);const ctx={sessionEpoch:0,ACC:{uid:'u1'},CFG:{supabaseUrl:'https://example.test',supabaseKey:'fake'},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Date,JSON,Number,Object,fetch,payload:()=>({name:'QA',save:{level:2}})};vm.createContext(ctx);vm.runInContext(code+';this.back=sbBack();',ctx);return ctx.back;}
(async()=>{const a=client(),b=client();await Promise.all([a.load(),b.load()]);await a.save();assert.equal(row.save_version,1);await assert.rejects(b.save(),e=>e.code==='save_conflict');assert.equal(row.save_version,1);await b.load();await b.save();assert.equal(row.save_version,2);row=null;const c=client();await c.load();await c.save();assert.equal(row.save_version,1);const d=client();await assert.rejects(d.save(),e=>e.code==='leer_nube_primero');console.log('PASS: inline syntax, two clients with stale baseline, reload/retry, first insert, unread baseline');})().catch(e=>{console.error(e);process.exitCode=1;});
