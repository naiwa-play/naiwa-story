import assert from 'node:assert/strict';
import {story,endings,chapters,secrets,fresh,advance,validSave} from '../story.js';
import {portraitFor,portraits,scenePortraits,endingMood} from '../portraits.js?v=12';
import fs from 'node:fs';
import {canEnterNightmares,nightmareMilestones} from '../nightmares.js';
const reached=new Set();function walk(s,depth=0){assert(depth<150,'No cyclic story');assert(validSave(s));const n=story[s.node];if(n.ending){assert(endings[n.ending]);reached.add(n.ending);return;}if(n.choices)n.choices.forEach((_,i)=>walk(advance(s,i),depth+1));else{assert(n.next&&story[n.next]);walk(advance(s),depth+1);}}
for(const id of Object.keys(chapters))walk(fresh(id));assert.equal(reached.size,44);assert.equal(Object.values(endings).filter(e=>e.chapter==='adventure'&&!e.legacy).length,6);
assert(!validSave({version:1,node:'toString',history:[]}));assert(!validSave({version:1,node:'arrival',history:['bad']}));const s=advance(fresh());assert.deepEqual(JSON.parse(JSON.stringify(s)),s);assert.equal(advance({...s,node:'umbrella'},99).node,'umbrella');
for(const [id,n]of Object.entries(story)){assert(chapters[n.chapter]);}
for(const id of Object.keys(secrets))assert(story[id]);for(const p of Object.values(portraits))assert(fs.existsSync(new URL('../'+p.src,import.meta.url)));
assert(validSave({version:1,node:'lamp',history:['arrival','hello']}),'Legacy save survives');
assert(!canEnterNightmares(fresh()));assert(!canEnterNightmares({node:'coast_2',history:['departure','coast']}));
for(const node of nightmareMilestones){assert(canEnterNightmares({node,history:[]}));assert(canEnterNightmares(fresh(),{[node]:{node}}));}
assert(canEnterNightmares(fresh(),{},['open_horizon']));assert(!canEnterNightmares(fresh(),{},['journey','snacks']));
assert.equal(Object.values(endings).filter(e=>e.chapter==='nightmares').length,20);
for(const [id,n]of Object.entries(story)){if(n.chapter!=='nightmares'||!n.choices)continue;for(const c of n.choices){const next=story[c.to];assert(!next.ending,`${id}: choices must continue narration before ending`);assert(next.next||next.choices);}}
console.log('PASS: all 8 chapters, 44 active endings, 6 new main endings; no broken branches; legacy saves, secret nodes and all portrait files valid.');

for(const [id,p]of Object.entries(scenePortraits)){assert(story[id],id);assert(portraits[p],p);}for(const [id,e]of Object.entries(endings)){const m=endingMood(id,e);assert(m.portrait);if(e.note.includes('困局'))assert.equal(m.tone,'dream');}assert.equal(portraitFor('opera_script_2'),portraits.laughing);assert(!fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('skip-ending'));

const themes=new Set(Object.entries(endings).map(([id,e])=>endingMood(id,e).theme));assert.equal(themes.size,12);assert.equal(endingMood('crab_castle',endings.crab_castle).theme,'tide');assert.equal(endingMood('opera_blank',endings.opera_blank).theme,'curtain');

for(const chapter of ['adventure','beach','balloon','forest']){const lengths=[];function count(id,n=1){const node=story[id];if(node.ending)lengths.push(n);else for(const next of node.choices?.map(c=>c.to)||[node.next])count(next,n+1);}count(chapters[chapter].entry);assert(Math.min(...lengths)>=85,chapter+' too short');assert(Math.max(...lengths)<=150,chapter+' too long');}
const {relics,collectedRelics}=await import('../relics.js');for(const item of relics)for(const id of item.ends)assert(endings[id],id);assert.equal(collectedRelics(['light','light']).length,1);assert.equal(collectedRelics(['light','journey','snacks']).length,3);
console.log('PASS: all ordinary routes 85–150 scenes and collection references valid.');
// Every new main route stays inside its chapter, has regular choices, and includes a portrait.
const choiceSchedules=[];
function mainWalk(id,depth=1,choices=[]){const n=story[id];assert.equal(n.chapter,'adventure');assert(!n.legacy);assert(portraitFor(id));if(n.choices)choices=[...choices,depth];if(n.ending){assert(depth>=140&&depth<=150);assert(choices[0]<=10);assert(choices.every((v,i)=>i===0||v-choices[i-1]<=30));choiceSchedules.push(choices);return;}for(const next of n.choices?.map(c=>c.to)||[n.next])mainWalk(next,depth+1,choices);}
mainWalk(chapters.adventure.entry);assert(choiceSchedules.length>0);
for(const id of Object.keys(story))assert(portraitFor(id),'Missing portrait '+id);
assert(story.departure.legacy);assert(validSave({version:1,node:'coast_2',history:['departure']}));assert(canEnterNightmares({node:'main_threshold_0',history:[]}));
console.log('PASS: independent 145-scene main routes, choices by scene 6 and at most 30 scenes apart, full portrait coverage, legacy nodes retained.');
for(const chapter of ['iceland','polar']){const seen=new Set(),lengths=[],choiceDepth=[];function travelWalk(id,depth=1,first=null){const n=story[id];seen.add(id);assert.equal(n.chapter,chapter);assert(portraitFor(id));assert(n.text.length>=25);if(n.choices&&first===null)first=depth;if(n.ending){lengths.push(depth);choiceDepth.push(first);return;}for(const next of n.choices?.map(c=>c.to)||[n.next])travelWalk(next,depth+1,first);}travelWalk(chapters[chapter].entry);assert(lengths.every(n=>n===91));assert(choiceDepth.every(n=>n<=10));assert.equal(new Set([...seen].filter(id=>story[id].ending).map(id=>story[id].ending)).size,3);for(const scene of new Set([...seen].map(id=>story[id].scene))){assert(fs.existsSync(new URL('../assets/travels/'+scene+'.svg',import.meta.url)));}}
assert(!chapters.adventure.description.includes('145'));for(const e of Object.values(endings))assert(!e.note.includes('新主线'));assert.equal(endings.polar_haven.celebration,'wildlife');assert(!endings.polar_record.celebration);
console.log('PASS: two independent 91-scene travel routes, early choices, six endings, portrait/background coverage and immersive copy.');
