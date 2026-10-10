import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import * as story from '../story.js';import * as portraits from '../portraits.js';
function setup(preload){
 const saved=new Map(),els=new Map();function element(){return {children:[],textContent:'',hidden:false,paused:true,open:false,append(...v){this.children.push(...v);},replaceChildren(){this.children=[];},setAttribute(k,v){this[k]=v;},play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},showModal(){this.open=true;},close(){this.open=false;},animate(){}};}
 const $=id=>{if(!els.has(id))els.set(id,element());return els.get(id);};const imageCache=new Map(Object.values(portraits.portraits).map(p=>[p.src,element()]));
 const timers=[],context=vm.createContext({...story,...portraits,imageCache,mediaCache:new Map(),preloadAssets:preload,document:{getElementById:$,createElement:element,createTextNode:t=>t,addEventListener(){},activeElement:null},window:{scrollTo(){},matchMedia(){return {matches:false};}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},setTimeout(fn,ms){timers.push({fn,ms});return timers.length;},clearTimeout(){},console});
 vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,''),context);return {$,saved,context,timers,imageCache};
}
let release;const loading=new Promise(r=>release=r);const g=setup(()=>loading),{$,saved,context,imageCache}=g;
assert.equal(vm.runInContext('ready',context),false);vm.runInContext("enter(fresh())",context);assert.equal(vm.runInContext('playing',context),false);
release([]);await vm.runInContext('bootPromise',context);assert($('reader').hidden);assert.equal($('chapters').children.length,5);
vm.runInContext('enter(fresh())',context);assert.equal($('portrait-wrap').children[0],imageCache.get(portraits.portraits.normal.src));
const first=$('portrait-wrap').children[0];$('next').onclick();assert.notEqual($('portrait-wrap').children[0],first);assert.equal($('speaker').textContent,'奶蛙');assert.equal($('next').textContent,'下一句');
for(let i=0;i<3;i++)$('next').onclick();assert.equal($('choices').children.length,3);$('save').onclick();const manual=saved.get('naiwa-letter-save-v1');
$('choices').children[0].onclick();$('next').onclick();assert(!$('clue').hidden);$('clue').onclick();assert(saved.get('naiwa-secrets-v1').includes('home'));$('close').onclick();$('next').onclick();$('choices').children[1].onclick();$('next').onclick();assert.equal($('ending-title').textContent,'下一站，一起去');assert.equal($('ending').className,'ending-reveal');$('skip-ending').onclick();assert($('ending').className.includes('settled'));
$('next').onclick();assert.equal(vm.runInContext('state.node',context),'departure');assert($('portrait-wrap').hidden);assert.equal(saved.get('naiwa-letter-save-v1'),manual);
$('load').onclick();assert.equal(vm.runInContext('state.node',context),'umbrella');$('routes').onclick();assert($('modal').open);$('close').onclick();$('back-home').onclick();assert($('reader').hidden);assert(!$('resume').hidden);
$('gallery').onclick();assert.equal($('modal-body').children[0].children.length,17);$('close').onclick();await $('music').onclick();assert(! $('bgm').paused);await $('music').onclick();assert($('bgm').paused);
const failure=setup(async()=>[0]);await vm.runInContext('bootPromise',failure.context);assert(!failure.$('loading-actions').hidden);failure.$('text-mode').onclick();vm.runInContext('enter(fresh())',failure.context);assert(failure.$('portrait-wrap').hidden);
const slow=setup(()=>new Promise(()=>{}));slow.timers.find(t=>t.ms===5000).fn();assert(!slow.$('loading-actions').hidden);slow.$('text-mode').onclick();assert.equal(vm.runInContext('ready',slow.context),true);
console.log('PASS: loading gate, 5-second fallback, failed downloads, decoded portrait swap, prologue-to-main invitation, legacy saves, secrets, gallery and navigation.');
