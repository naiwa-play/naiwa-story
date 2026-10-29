import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as core from '../core.js';
import {downloadModel,loadGameModel,MODEL_FILES} from '../model-loader.js';

const originalFetch=globalThis.fetch,bytes=new Uint8Array([1,2,3,4]);
try{
  const events=[];globalThis.fetch=async()=>new Response(bytes);
  assert.deepEqual(new Uint8Array(await downloadModel('/model',event=>events.push(event))),bytes);assert.equal(events.at(-1).loaded,4);
  let requests=0;globalThis.fetch=async()=>++requests===1?new Response('',{status:503}):new Response(bytes);
  assert.equal((await downloadModel('/model')).byteLength,4);assert.equal(requests,2);
  requests=0;globalThis.fetch=(_url,{signal})=>{requests++;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))));};
  await assert.rejects(downloadModel('/stalled',()=>{},{timeout:10}),/长时间没有进展/);assert.equal(requests,2);
  globalThis.fetch=async(_url,{signal})=>new Response(new ReadableStream({start(controller){signal.addEventListener('abort',()=>controller.error(new DOMException('aborted','AbortError')));let n=0;const push=()=>{controller.enqueue(bytes);if(++n===6)controller.close();else setTimeout(push,8);};push();}}));
  assert.equal((await downloadModel('/slow-but-moving',()=>{},{timeout:25,retries:0})).byteLength,24);
  globalThis.fetch=async()=>({ok:true,headers:new Headers(),body:null,arrayBuffer:async()=>bytes.buffer});
  assert.equal((await downloadModel('/older-webview')).byteLength,4);
  const urls=[];globalThis.fetch=async url=>{urls.push(String(url));return new Response(bytes);};let parses=0;
  const loader={setMeshoptDecoder(decoder){assert.ok(decoder.supported);},async parseAsync(){if(++parses===1)throw new Error('Unsupported image decoder');return {scene:'fallback'};}};
  assert.equal((await loadGameModel(loader,'naiwa')).scene,'fallback');assert.equal(urls.length,2);assert.ok(urls[1].includes('rodin-v4/naiwa-jelly.glb'));
  let parsed=false;requests=0;globalThis.fetch=async()=>{requests++;return new Response('',{status:503});};
  await assert.rejects(loadGameModel({setMeshoptDecoder(){},parseAsync(){parsed=true;}},'naiwa'),/奶蛙.*503/);assert.equal(requests,2);assert.equal(parsed,false);
}finally{globalThis.fetch=originalFetch;}

// A summon must wait for its painted model; a failed download must leave the choice available.
const elements=new Map(),buttons=[{dataset:{card:'dog'},disabled:false,copy:{textContent:'召唤奶狗'},querySelector(){return this.copy;}}];
function element(id){if(!elements.has(id))elements.set(id,{style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},close(){this.closed=true;},showModal(){},getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};}});return elements.get(id);}
const context=vm.createContext({...core,rollCards:()=>[{id:'dog',title:'奶狗',tag:'召唤伙伴',icon:'',description:'召唤奶狗'}],Soundtrack:class{effect(){}pause(){}},document:{getElementById:element,querySelectorAll:selector=>selector==='[data-card]'?buttons:[],addEventListener(){},body:{classList:{add(){},remove(){}}}},window:{addEventListener(){}},localStorage:{getItem(){return null;}},innerWidth:1280,setTimeout(){},clearTimeout(){},console});
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/boot\(\);\s*$/,'');
vm.runInContext(source+'\nglobalThis.testGame={chooseCards,set(s,v){state=s;scene=v;pendingCards=null;}};',context);
let release;const state=core.freshRun(),scene={preparePet:()=>new Promise(resolve=>release=resolve),setWeapon(){}};
context.testGame.set(state,scene);context.testGame.chooseCards();const selection=buttons[0].onclick();
assert.equal(state.pets.naigou,0);assert.equal(buttons[0].disabled,true);assert.notEqual(element('modal').closed,true);release();await selection;
assert.equal(state.pets.naigou,1);assert.equal(buttons[0].disabled,false);assert.equal(element('modal').closed,true);
const failedState=core.freshRun();scene.preparePet=async()=>{throw new Error('下载失败');};context.testGame.set(failedState,scene);context.testGame.chooseCards();await buttons[0].onclick();assert.equal(failedState.pets.naigou,0);assert.equal(buttons[0].disabled,false);
scene.preparePet=async()=>{};await buttons[0].onclick();assert.equal(failedState.pets.naigou,1);
assert.ok(['naiwa','naidan','naiwa-crowd'].reduce((sum,name)=>sum+MODEL_FILES[name].bytes,0)<8*1024**2);
for(const spec of Object.values(MODEL_FILES))assert.equal(fs.statSync(new URL('../'+spec.url,import.meta.url)).size,spec.bytes);
console.log('PASS loading: streamed progress, retry, stalled and healthy downloads, older webviews, decoder fallback, safe pet summoning');
