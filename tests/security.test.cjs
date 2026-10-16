const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function backend(){
 const writes=[];const context={Utilities:{getUuid:()=> 'test-id'}};
 vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname,'../apps-script/Code.gs'),'utf8'),context);
 context.getSheet_=()=>({appendRow:row=>writes.push(row)});
 return {context,writes};
}
function pattern(overrides={}){return {title:'테스트',author:'별명',ratio:'square',sizeKey:'small',cols:16,rows:16,legend:[{num:1,color:'#4c8dff'}],cells:Array(256).fill(1),...overrides};}
test('accepts real example patterns',()=>{
 const {context,writes}=backend();
 for(const p of JSON.parse(fs.readFileSync(path.join(__dirname,'../examples/gallery_seed.json'),'utf8'))) context.savePattern_(p);
 assert.equal(writes.length,17);
});
for(const [name,changes] of Object.entries({
 'HTML in legend':{legend:[{num:1,color:'#fff"><img src=x onerror="void(0)">'}]},
 'oversized grid':{cols:100000},
 'wrong cell count':{cells:[1]},
 'unknown color number':{cells:Array(256).fill(2)},
 'duplicate legend numbers':{legend:[{num:1,color:'#ffffff'},{num:1,color:'#000000'}]},
 'non-integer dimension':{rows:1.5},
 'missing public author':{author:''}
})) test(`rejects ${name} before storing`,()=>{
 const {context,writes}=backend();
 assert.throws(()=>context.savePattern_(pattern(changes)));
 assert.equal(writes.length,0);
});
test('does not pass a spreadsheet formula as executable cell content',()=>{
 const {context,writes}=backend();context.savePattern_(pattern({title:'=1+1'}));
 assert.ok(!String(writes[0][1]).startsWith('='));
 assert.equal(JSON.parse(writes[0][4]).title,'=1+1');
});
test('administrator access still requires the configured password',()=>{
 const {context}=backend();context.PropertiesService={getScriptProperties:()=>({getProperty:()=> 'local-test-only'})};
 assert.throws(()=>context.handleAdminAction_({action:'admin-delete',id:'test-id',password:'incorrect'}),/invalid admin password/);
});
for(const [name,changes] of Object.entries({
 'overlong title':{title:'x'.repeat(61)},
 'overlong author':{author:'x'.repeat(41)},
 'missing country name':{countryCode:'KR'},
 'malformed country code':{countryCode:'BAD',countryName:'Test'}
})) test(`rejects ${name}`,()=>{const {context,writes}=backend();assert.throws(()=>context.savePattern_(pattern(changes)));assert.equal(writes.length,0);});
test('admin updates preserve formula-like metadata as text',()=>{
 const {context}=backend();const values={};
 context.findPatternRow_=()=>({row:2,sheet:{getRange:(_,col)=>({
  getValue:()=>col===5?JSON.stringify(pattern()):'2026-10-16T00:00:00Z',
  setValue:value=>{values[col]=value;}
 })}});
 const result=context.updatePattern_({id:'test-id',title:'  =1+1',author:'@example'});
 assert.ok(values[2].startsWith("'"));assert.ok(values[3].startsWith("'"));
 assert.equal(result.title,'  =1+1');assert.equal(result.author,'@example');
});
