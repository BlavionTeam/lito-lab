const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
let exported, clicked = false, filename;
const previous = {zone:3, name:'Niño 🐾', gold:42};
const context = {
  ACC:{uid:'qa'}, JSON, Blob, btoa, unescape, encodeURIComponent,
  localStorage:{getItem:()=>JSON.stringify([{save:{zone:1}},{save:previous}])},
  URL:{createObjectURL:blob=>{exported=blob;return 'blob:qa';},revokeObjectURL:()=>{}},
  document:{createElement:()=>({set download(v){filename=v;},click(){clicked=true;}})},
  setTimeout:f=>f(), accSay:message=>{throw new Error(message);}
};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('const enc ='), html.indexOf('const dec =')), context);
vm.runInContext(html.slice(html.indexOf('function exportRecovery(){'), html.indexOf('function showCloudConflict(){')), context);
context.exportRecovery();
(async()=>{
  assert.equal(clicked,true);
  assert.equal(filename,'lito-lab-copia-anterior.txt');
  const recovered=JSON.parse(Buffer.from(await exported.text(),'base64').toString('utf8'));
  assert.deepEqual(recovered,previous);
  console.log('PASS: latest recovery copy round-trips through the existing import format, including Unicode');
})().catch(e=>{console.error(e);process.exitCode=1;});
