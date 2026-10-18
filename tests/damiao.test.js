import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {nodes,places,studyOptions,questions} from '../damiao/story.js';
import {fresh,valid,apply,report,assignClass,destination,STREAMS,RELEASE,enterSecond} from '../damiao/model.js';
import {graduationLetter,letterEndings} from '../damiao/letter.js';
const seen=new Set();function visit(id,parents=[]){assert(!parents.includes(id),'cycle '+id);if(seen.has(id))return;seen.add(id);const n=nodes[id];assert(n);assert(places[n.scene]);assert(fs.existsSync(new URL('../damiao/art/'+n.scene+'.svg',import.meta.url)));assert(n.text.join('').length>=(n.type==='study'?80:100),id+' needs prose');if(n.frog)assert(fs.existsSync(new URL('../assets/portraits/'+n.frog+'.webp',import.meta.url)));for(const next of [n.next,...(n.routes||[]),...(n.choices||[]).filter(c=>!c.locked).map(c=>c.to)].filter(Boolean))visit(next,[...parents,id]);}
visit('mist');assert.equal(seen.size,Object.keys(nodes).length);assert.equal(Object.values(nodes).filter(n=>n.type==='study').length,12);assert.equal(Object.values(nodes).filter(n=>n.type==='exam').length,4);assert.equal(RELEASE,Date.parse('2026-10-19T16:00:00Z'));
for(let i=1;i<=6;i++)assert.equal(Object.values(nodes).filter(n=>n.term===i&&n.type==='study').length,2);
let low=fresh(12),high=fresh(12);for(let i=0;i<4;i++){low=apply(low,studyOptions[2].effect);high=apply(high,studyOptions[0].effect);}high.study+=4;high.focus="science";low.answers[2]=3;high.answers[2]=9;for(const s of [low,high])s.marks=[{phase:2,scores:report(s,2)}];assert(assignClass(low).startsWith('普通'));assert(assignClass(high).startsWith('励志'));assert.equal(assignClass(low),assignClass(JSON.parse(JSON.stringify(low))));
for(const stream of Object.keys(STREAMS)){high.stream=stream;assert(assignClass(high));}
for(const s of [low,high])for(const r of report(s,6))assert(r.score>=0&&r.score<=r.max);assert.equal(report(low,1).length,9);assert(valid(fresh(),nodes));assert(!valid({...fresh(),study:Infinity},nodes));assert(!valid({...fresh(),exam:{node:'mist',index:99}},nodes));assert.equal(graduationLetter,'');assert.deepEqual(letterEndings,['second-normal','fifth-dawn']);
// Run the actual reader with a tiny DOM to exercise all twelve study points,
// all four complete exams, refreshes, first-person transition and preview isolation.
function setup(saved=new Map()){
 const letters=[];
 class Element{constructor(){this.children=[];this.hidden=false;this.textContent='';this.dataset={};this.style={};this.disabled=false;this.classList={add(){},remove(){},toggle(){}};}append(...v){this.children.push(...v);}replaceChildren(){this.children=[];}setAttribute(k,v){this[k]=v;}getAttribute(k){return this[k]??null;}querySelectorAll(selector){return this.children.flatMap(c=>[...(c.tag==='button'?[c]:[]),...c.querySelectorAll?.(selector)||[]]);}focus(){}click(){if(!this.disabled)this.onclick?.();}showModal(){this.open=true;}close(){this.open=false;}remove(){}getBoundingClientRect(){return {left:10,right:500,top:10,bottom:500};}}
 const els=new Map(),$=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};
 const context=vm.createContext({nodes,places,studyOptions,questions,fresh,valid,apply,report,assignClass,destination,STREAMS,enterSecond,structuredClone,showLetter(id,options){letters.push(id);options?.onClose?.();},Image:class{decode(){return Promise.resolve();}},Audio:class{paused=true;pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}},document:{getElementById:$,createElement(tag){const e=new Element();e.tag=tag;return e;},querySelector(){return {prepend(){}};},addEventListener(){},hidden:false},window:{scrollTo(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},console});
 vm.runInContext(fs.readFileSync(new URL('../damiao/reader.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace('export function start','function start'),context);vm.runInContext('start({preview:true})',context);return {$,saved,letters};
}
let game=setup();const getState=()=>JSON.parse(game.saved.get('naiwa-damiao-preview-v1'));
for(let turn=0;turn<350;turn++){
 const s=getState(),n=nodes[s.node];if(['volume-end','second-ending','rest-ending'].includes(n.type))break;
 const available=game.$('interaction').querySelectorAll('button').filter(b=>!b.disabled);
 if(s.node==='sunset'&&!s.pendingChoice){available[0].click();const before=getState().study;game=setup(game.saved);assert.equal(getState().study,before);assert(game.$('interaction').querySelectorAll('button').every(b=>b.disabled));}
 else if(available.length)available[0].click();else{assert(!game.$('next').hidden,s.node);game.$('next').click();}
 if(turn%17===0)game=setup(game.saved);
}
const final=getState();assert.equal(final.node,'second-normal');assert.equal(final.done.filter(id=>id.startsWith('study-')).length,12);assert.equal(final.marks.length,4);assert.equal(final.round,2);assert(final.memories.includes('转角处的一声谢谢'));assert(!game.saved.has('naiwa-damiao-v1'));
assert.deepEqual(game.letters,[],'letter must wait until the reader finishes the story');
game.$('interaction').querySelectorAll('button').find(b=>b.textContent==='合上故事，看看桌上的来信').click();assert.deepEqual(game.letters,['second-normal']);
game=setup(game.saved);assert.deepEqual(game.letters,[],'reload must not force the letter open again');
// Walk both study outcomes and both flower deductions with reloads. First-round
// marks must not decide the second-round class, and clues must not change it.
for(const intense of [false,true])for(const deduction of [0,1]){
 const start=fresh(18);start.node='second-gate';start.study=intense?0:99;
 const store=new Map([['naiwa-damiao-preview-v1',JSON.stringify(start)]]);let run=setup(store);
 for(let turn=0;turn<180;turn++){
  const s=JSON.parse(store.get('naiwa-damiao-preview-v1')),n=nodes[s.node];if(n.type==='volume-end')break;
  const buttons=run.$('interaction').querySelectorAll('button').filter(b=>!b.disabled);
  if(buttons.length){const index=['second-first-plan','second-online-day','second-spring-plan'].includes(s.node)&&intense?1:s.node==='second-flower-missing'?deduction:0;buttons[index].click();}
  else{assert(!run.$('next').hidden,s.node);run.$('next').click();}
  if(turn%4===0)run=setup(store);
 }
 const s=JSON.parse(store.get('naiwa-damiao-preview-v1'));assert.equal(s.node,intense?'second-next-volume':'second-normal');assert.equal(s.second.group,intense?'励志一班':'普通四班');assert.equal(s.study,start.study,'first-round values remain independent');
 if(!intense){assert(s.memories.includes('被全班一起找回的花束'));assert(s.visited.includes(deduction?'second-flower-card':'second-flower-time'));}
 assert.equal(s.visited.filter(id=>nodes[id].round===2&&nodes[id].frog).length,1,'Naiwa only appears at the brief meeting');
 run.$('scene-expand').click();assert(run.$('notebook').open);run.$('close').click();assert(!run.$('notebook').open);
}
// Every sports/study, outside/inside and sunset variation reaches its intended
// closure without an early letter. The old v2 checkpoint continues in place.
for(const sunset of ['open','closed'])for(const sports of [0,1])for(const outside of [0,1]){
 const start=enterSecond(fresh(31));start.node='second-pause';start.round=2;start.second.sunset=sunset;start.second.group='普通四班';
 const store=new Map([['naiwa-damiao-preview-v1',JSON.stringify(start)]]);let run=setup(store);
 for(let i=0;i<100;i++){
  const s=JSON.parse(store.get('naiwa-damiao-preview-v1')),n=nodes[s.node];if(['second-ending','rest-ending'].includes(n.type))break;
  const available=run.$('interaction').querySelectorAll('button').filter(b=>!b.disabled);
  if(available.length){const index=s.node==='second-sports-choice'?sports:s.node==='second-outside-choice'?outside:s.node==='second-recollection'?1:0;available[index].click();}else run.$('next').click();
  if(i%5===0)run=setup(store);
 }
 const end=JSON.parse(store.get('naiwa-damiao-preview-v1'));assert.equal(end.node,sunset==='open'?'second-normal':'second-rest-ending');assert(end.visited.includes(sports?'second-sports-room':'second-sports-field'));assert(end.visited.includes(outside?'second-inside-day':'second-outside-day'));assert.deepEqual(run.letters,[]);
 if(sunset==='closed')assert(!run.$('interaction').querySelectorAll('button').some(b=>b.textContent.includes('来信')));
}
const old=fresh();old.node='volume-end';old.round=2;old.visited=['second-meeting'];old.study=40;const migrated=setup(new Map([['naiwa-damiao-preview-v1',JSON.stringify(old)]]));migrated.$('next').click();assert.equal(JSON.parse(migrated.saved.get('naiwa-damiao-preview-v1')).node,'second-sunset');assert.equal(JSON.parse(migrated.saved.get('naiwa-damiao-preview-v1')).second.study,1);
assert(!valid({...fresh(),second:{study:Infinity,support:0,sunset:'open'}},nodes));
for(const [id,hash]of [['corridor','b2a101ce460504cc65630cc506c39b7734d52f23aa9d70237146ad733f754ab9'],['dawn','b2a101ce460504cc65630cc506c39b7734d52f23aa9d70237146ad733f754ab9'],['observatory','b9d2e6fbb6785c3506349307e5d89cbd2613e9b3edf1cd91ff1f99bd12154506']])assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../damiao/art/'+id+'.svg',import.meta.url))).digest('hex'),hash,id+' approved artwork preserved');
assert.equal(places.field[0],'王月恒铭操场');assert.equal(places.sealed[0],'王月恒铭操场外');assert(nodes['second-room'].text.join('').includes('蒋琳'));assert(nodes['second-four'].text.join('').includes('周芸'));assert(places['observatory-reverse']);
assert(!fs.existsSync(new URL('../damiao/__preview.html',import.meta.url)),'unlocked preview must not become a public file');
assert(fs.existsSync(new URL('../damiao/art/student-watercolor.webp',import.meta.url)));assert(fs.statSync(new URL('../damiao/art/student-watercolor.webp',import.meta.url)).size<150000,'portrait stays lightweight on mobile');assert(!fs.existsSync(new URL('../damiao/art/student.svg',import.meta.url)),'discarded geometric portrait is not shipped');
// Gate must fail closed before release and on network errors, even if local clock is wrong.
async function gate({date,fail=false,preview=false,host='example.github.io'}={}){
 const els=new Map(),$=id=>{if(!els.has(id))els.set(id,{hidden:true,dataset:{},textContent:''});return els.get(id);};
 const context=vm.createContext({RELEASE,Date,performance:{now:()=>100},location:{hostname:host},document:{getElementById:$,documentElement:{dataset:preview?{preview:'local'}:{}},addEventListener(){}},fetch:async()=>{if(fail)throw Error('offline');return {ok:true,headers:{get:()=>date}};},setInterval(){}});
 vm.runInContext(fs.readFileSync(new URL('../damiao/entry.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,''),context);await new Promise(setImmediate);return $;
}
assert((await gate({date:'Mon, 19 Oct 2026 15:59:59 GMT'}))('open').hidden);
assert(!(await gate({date:'Mon, 19 Oct 2026 16:00:00 GMT'}))('open').hidden);
assert((await gate({fail:true}))('open').hidden);
assert((await gate({date:'Sun, 18 Oct 2026 00:00:00 GMT',preview:true}))('open').hidden);
assert(!(await gate({preview:true,host:'127.0.0.1'}))('open').hidden);
console.log(`PASS: Damiao ${seen.size} pages, both second-life classes and flower deductions, independent study values, old checkpoint migration, approved art preservation, full reader playthrough and reload safety, private preview saves, server-time release boundary and blank afterword.`);
