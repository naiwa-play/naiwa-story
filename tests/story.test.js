import assert from 'node:assert/strict';
import {story,endings,chapters,secrets,fresh,advance,validSave} from '../story.js';
import {portraitFor,portraits} from '../portraits.js';
import fs from 'node:fs';
const reached=new Set();function walk(s,depth=0){assert(depth<30,'No cyclic story');assert(validSave(s));const n=story[s.node];if(n.ending){assert(endings[n.ending]);reached.add(n.ending);return;}if(n.choices)n.choices.forEach((_,i)=>walk(advance(s,i),depth+1));else{assert(n.next&&story[n.next]);walk(advance(s),depth+1);}}
for(const id of Object.keys(chapters))walk(fresh(id));assert.equal(reached.size,21);assert.equal(Object.values(endings).filter(e=>e.chapter==='adventure').length,12);
assert(!validSave({version:1,node:'toString',history:[]}));assert(!validSave({version:1,node:'arrival',history:['bad']}));const s=advance(fresh());assert.deepEqual(JSON.parse(JSON.stringify(s)),s);assert.equal(advance({...s,node:'umbrella'},99).node,'umbrella');
for(const [id,n]of Object.entries(story)){assert(chapters[n.chapter]);if(n.chapter!=='prologue')assert.equal(portraitFor(id),null);}
for(const id of Object.keys(secrets))assert(story[id]);for(const p of Object.values(portraits))assert(fs.existsSync(new URL('../'+p.src,import.meta.url)));
assert(validSave({version:1,node:'lamp',history:['arrival','hello']}),'Legacy save survives');
console.log('PASS: all 5 chapters, 21 endings, 12 main endings; no broken branches; legacy saves, secret nodes and all portrait files valid.');
