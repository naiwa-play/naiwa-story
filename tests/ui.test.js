import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import * as story from '../story.js';import * as portraits from '../portraits.js';
const saved=new Map(),els=new Map();function element(){return {children:[],textContent:'',hidden:false,paused:true,open:false,append(...v){this.children.push(...v);},replaceChildren(){this.children=[];},setAttribute(k,v){this[k]=v;},play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},showModal(){this.open=true;},close(){this.open=false;}};}
const $=id=>{if(!els.has(id))els.set(id,element());return els.get(id);};const doc={getElementById:$,createElement:element,createTextNode:t=>t,addEventListener(){},activeElement:null};
const context=vm.createContext({...story,...portraits,document:doc,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},setTimeout(){return 1;},clearTimeout(){},console,assert});const code=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'');vm.runInContext(code,context);
assert.equal($('speaker').textContent,'旁白');assert.equal($('load').disabled,true);
for(let i=0;i<4;i++)$('next').onclick();assert.equal($('choices').children.length,3);assert($('next').hidden);
$('save').onclick();assert.equal($('load').disabled,false);const checkpoint=saved.get('naiwa-letter-save-v1');$('choices').children[0].onclick();$('next').onclick();$('next').onclick();assert.equal($('choices').children.length,3);$('choices').children[1].onclick();$('next').onclick();assert.equal($('ending-title').textContent,'下一站，一起去');assert.equal($('ending').hidden,false);
$('load').onclick();assert.equal(saved.get('naiwa-letter-auto-v1'),checkpoint);assert.equal($('choices').children.length,3);$('history').onclick();assert($('modal').open);$('close').onclick();assert(!$('modal').open);
await $('music').onclick();assert.equal($('bgm').paused,false);await $('music').onclick();assert.equal($('bgm').paused,true);
$('restart').onclick();$('modal-body').children[1].onclick();assert.equal($('speaker').textContent,'旁白');assert.equal(JSON.parse(saved.get('naiwa-letter-endings-v1'))[0],'journey');assert.equal(saved.get('naiwa-letter-save-v1'),checkpoint);
console.log('PASS: UI choices, manual save/load, ending unlock, restart keeps memories/save, history modal, music toggle.');

$('gallery').onclick();assert.equal($('modal-body').children[0].children.length,17);console.log('PASS: 17 portraits available in gallery');
