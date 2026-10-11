import assert from 'node:assert/strict';
import {story,endings,chapters,secrets,fresh,advance,validSave} from '../story.js';
import {portraitFor,portraits,scenePortraits,endingMood} from '../portraits.js';
import fs from 'node:fs';
import {canEnterNightmares,nightmareMilestones} from '../nightmares.js';
const reached=new Set();function walk(s,depth=0){assert(depth<30,'No cyclic story');assert(validSave(s));const n=story[s.node];if(n.ending){assert(endings[n.ending]);reached.add(n.ending);return;}if(n.choices)n.choices.forEach((_,i)=>walk(advance(s,i),depth+1));else{assert(n.next&&story[n.next]);walk(advance(s),depth+1);}}
for(const id of Object.keys(chapters))walk(fresh(id));assert.equal(reached.size,41);assert.equal(Object.values(endings).filter(e=>e.chapter==='adventure').length,12);
assert(!validSave({version:1,node:'toString',history:[]}));assert(!validSave({version:1,node:'arrival',history:['bad']}));const s=advance(fresh());assert.deepEqual(JSON.parse(JSON.stringify(s)),s);assert.equal(advance({...s,node:'umbrella'},99).node,'umbrella');
for(const [id,n]of Object.entries(story)){assert(chapters[n.chapter]);}
for(const id of Object.keys(secrets))assert(story[id]);for(const p of Object.values(portraits))assert(fs.existsSync(new URL('../'+p.src,import.meta.url)));
assert(validSave({version:1,node:'lamp',history:['arrival','hello']}),'Legacy save survives');
assert(!canEnterNightmares(fresh()));assert(!canEnterNightmares({node:'coast_2',history:['departure','coast']}));
for(const node of nightmareMilestones){assert(canEnterNightmares({node,history:[]}));assert(canEnterNightmares(fresh(),{[node]:{node}}));}
assert(canEnterNightmares(fresh(),{},['open_horizon']));assert(!canEnterNightmares(fresh(),{},['journey','snacks']));
assert.equal(Object.values(endings).filter(e=>e.chapter==='nightmares').length,20);
for(const [id,n]of Object.entries(story)){if(n.chapter!=='nightmares'||!n.choices)continue;for(const c of n.choices){const next=story[c.to];assert(!next.ending,`${id}: choices must continue narration before ending`);assert(next.next||next.choices);}}
console.log('PASS: all 6 chapters, 41 endings, 12 main endings; no broken branches; legacy saves, secret nodes and all portrait files valid.');

for(const [id,p]of Object.entries(scenePortraits)){assert(story[id],id);assert(portraits[p],p);}for(const [id,e]of Object.entries(endings)){const m=endingMood(id,e);assert(m.portrait);if(e.note.includes('困局'))assert.equal(m.tone,'dream');}assert.equal(portraitFor('opera_script_2'),portraits.laughing);assert(!fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('skip-ending'));

const themes=new Set(Object.entries(endings).map(([id,e])=>endingMood(id,e).theme));assert.equal(themes.size,7);assert.equal(endingMood('crab_castle',endings.crab_castle).theme,'tide');assert.equal(endingMood('opera_blank',endings.opera_blank).theme,'curtain');
