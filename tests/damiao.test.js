import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {nodes,places,studyOptions,questions} from '../damiao/story.js';
import {fresh,valid,apply,report,assignClass,destination,STREAMS,RELEASE} from '../damiao/model.js';
import {graduationLetter,letterEndings} from '../damiao/letter.js';
const seen=new Set();function visit(id,parents=[]){assert(!parents.includes(id),'cycle '+id);if(seen.has(id))return;seen.add(id);const n=nodes[id];assert(n);assert(places[n.scene]);assert(fs.existsSync(new URL('../damiao/art/'+n.scene+'.svg',import.meta.url)));assert(n.text.join('').length>=(n.type==='study'?80:100),id+' needs prose');if(n.frog)assert(fs.existsSync(new URL('../assets/portraits/'+n.frog+'.webp',import.meta.url)));for(const next of [n.next,...(n.choices||[]).filter(c=>!c.locked).map(c=>c.to)].filter(Boolean))visit(next,[...parents,id]);}
visit('mist');assert.equal(seen.size,Object.keys(nodes).length);assert.equal(Object.values(nodes).filter(n=>n.type==='study').length,12);assert.equal(Object.values(nodes).filter(n=>n.type==='exam').length,4);assert.equal(RELEASE,Date.parse('2026-10-19T16:00:00Z'));
for(let i=1;i<=6;i++)assert.equal(Object.values(nodes).filter(n=>n.term===i&&n.type==='study').length,2);
let low=fresh(12),high=fresh(12);for(let i=0;i<4;i++){low=apply(low,studyOptions[2].effect);high=apply(high,studyOptions[0].effect);}high.study+=4;high.focus="science";low.answers[2]=3;high.answers[2]=9;for(const s of [low,high])s.marks=[{phase:2,scores:report(s,2)}];assert(assignClass(low).startsWith('普通'));assert(assignClass(high).startsWith('励志'));assert.equal(assignClass(low),assignClass(JSON.parse(JSON.stringify(low))));
for(const stream of Object.keys(STREAMS)){high.stream=stream;assert(assignClass(high));}
for(const s of [low,high])for(const r of report(s,6))assert(r.score>=0&&r.score<=r.max);assert.equal(report(low,1).length,9);assert(valid(fresh(),nodes));assert(!valid({...fresh(),study:Infinity},nodes));assert(!valid({...fresh(),exam:{node:'mist',index:99}},nodes));assert.equal(graduationLetter,'');assert.deepEqual(letterEndings,['second-normal','fifth-dawn']);
// Run the actual reader with a tiny DOM to exercise all twelve study points,
// all four complete exams, refreshes, first-person transition and preview isolation.
function setup(saved=new Map()){
 class Element{constructor(){this.children=[];this.hidden=false;this.textContent='';this.dataset={};this.style={};this.disabled=false;this.classList={add(){},remove(){}};}append(...v){this.children.push(...v);}replaceChildren(){this.children=[];}setAttribute(k,v){this[k]=v;}querySelectorAll(selector){return this.children.flatMap(c=>[...(c.tag==='button'?[c]:[]),...c.querySelectorAll?.(selector)||[]]);}focus(){}click(){if(!this.disabled)this.onclick?.();}showModal(){this.open=true;}close(){this.open=false;}remove(){}getBoundingClientRect(){return {left:10,right:500,top:10,bottom:500};}}
 const els=new Map(),$=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};
 const context=vm.createContext({nodes,places,studyOptions,questions,fresh,valid,apply,report,assignClass,destination,STREAMS,structuredClone,showLetter(){},Image:class{decode(){return Promise.resolve();}},Audio:class{paused=true;pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}},document:{getElementById:$,createElement(tag){const e=new Element();e.tag=tag;return e;},querySelector(){return {prepend(){}};},addEventListener(){},hidden:false},window:{scrollTo(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},console});
 vm.runInContext(fs.readFileSync(new URL('../damiao/reader.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replace('export function start','function start'),context);vm.runInContext('start({preview:true})',context);return {$,saved};
}
let game=setup();const getState=()=>JSON.parse(game.saved.get('naiwa-damiao-preview-v1'));
for(let turn=0;turn<220;turn++){
 const s=getState(),n=nodes[s.node];if(n.type==='volume-end')break;
 const available=game.$('interaction').querySelectorAll('button').filter(b=>!b.disabled);
 if(s.node==='sunset'&&!s.pendingChoice){available[0].click();const before=getState().study;game=setup(game.saved);assert.equal(getState().study,before);assert(game.$('interaction').querySelectorAll('button').every(b=>b.disabled));}
 else if(available.length)available[0].click();else{assert(!game.$('next').hidden,s.node);game.$('next').click();}
 if(turn%17===0)game=setup(game.saved);
}
const final=getState();assert.equal(final.node,'volume-end');assert.equal(final.done.filter(id=>id.startsWith('study-')).length,12);assert.equal(final.marks.length,4);assert.equal(final.round,2);assert(final.memories.includes('转角处的一声谢谢'));assert(!game.saved.has('naiwa-damiao-v1'));
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
console.log(`PASS: Damiao ${seen.size} pages, six terms/twelve study points, distinct class outcomes, full reader playthrough and reload safety, private preview saves, server-time release boundary and blank afterword.`);
