import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {THEMES,MONSTER_POOLS,BOSSES,freshRun,chooseCard,MAX_STAT} from '../core.js';
import {EVENTS,expeditionCourse,seededRandom,dayKey,applyEvent,availableEvolutions,evolve,evolutionActive,recordRun,EVOLUTIONS} from '../expansion.js';
import {DestinationScenery,destinationEnemy,destinationBoss} from '../destinations.js';
for(const theme of ['abyss','dream','lantern']){
 assert.ok(THEMES[theme]);assert.equal(MONSTER_POOLS[theme].length,4);for(const id of MONSTER_POOLS[theme]){const g=destinationEnemy(id);assert.ok(g.children.length);assert.ok(!new T.Box3().setFromObject(g).isEmpty());}
 for(const b of BOSSES[theme]){const g=destinationBoss(b.id);assert.ok(g.children.length);assert.ok(new T.Box3().setFromObject(g).max.y>2);}
 const scenery=new DestinationScenery(theme);scenery.update(0,0,true);let draws=0;scenery.group.traverse(o=>{if(o.isMesh)draws++;});assert.ok(draws<260,theme+' scenery draw budget: '+draws);const start=scenery.cells.map(c=>c.g.position.z);scenery.update(2,144,true);assert.deepEqual(scenery.cells.map(c=>c.g.position.z),start);scenery.update(3,1e8,false);assert.ok(scenery.cells.every(c=>Number.isFinite(c.g.position.z)));scenery.dispose();
}
assert.equal(dayKey(new Date('2026-11-02T16:00:00Z')),'2026-11-03');
const a=seededRandom('test'),b=seededRandom('test');assert.deepEqual(Array.from({length:100},a),Array.from({length:100},b));
for(const theme of Object.keys(THEMES))for(let stage=0;stage<8;stage++)for(const mode of ['expedition','guard','bossrush','daily']){const rows=expeditionCourse(stage,seededRandom('x'),theme,mode);assert.ok(rows.every((r,i)=>!i||r.at>rows[i-1].at));assert.equal(rows.filter(r=>r.type==='boss').length,1);assert.ok(rows.every(r=>!r.enemies||r.enemies.every(e=>e.hp>0&&e.hp<=MAX_STAT)));if(mode==='bossrush')assert.equal(rows.filter(r=>r.type==='card').length,1);if(stage>0&&['daily','expedition'].includes(mode))assert.ok(rows.some(r=>r.type==='event'));}
for(const event of EVENTS)for(const c of event.choices){const s=freshRun();s.stage=10;s.coins=10;applyEvent(s,c);assert.ok(s.health>0&&s.health<=s.maxHealth);assert.ok(s.maxHealth>=2&&s.maxHealth<=99);assert.ok(s.damage>0&&s.damage<=MAX_STAT);assert.ok(s.coins>=0);}
for(const evolution of EVOLUTIONS){const s=freshRun('halloween');Object.assign(s,{weapon:evolution.weapon,splitDepth:6,splitCount:3,projectileBonus:1});if(evolution.id==='meteor')s.pattern='spread';if(evolution.id==='ghostfire')s.pattern='heavy';if(evolution.id==='comet')s.pattern='rapid';s.pets.naishu=1;assert.ok(availableEvolutions(s).includes(evolution));assert.ok(evolve(s,evolution.id));assert.equal(evolve(s,evolution.id),false);assert.ok(evolutionActive(s,evolution.id));s.weapon='other';assert.equal(evolutionActive(s,evolution.id),false);}
const s=freshRun();s.events=3;s.bosses=1;s.seenEnemies=['manta'];s.evolutions=['chain'];const saved={};const first=recordRun(saved,s);assert.ok(first.length>=3);assert.equal(recordRun(saved,s).length,0);assert.equal(saved.journal.enemies.length,1);
for(const id of ['naigou-guard','naigou-strike','naishu-support','naishu-burst']){const s=freshRun();assert.equal(chooseCard(s,id),false);s.pets.naigou=s.pets.naishu=1;assert.ok(chooseCard(s,id));assert.equal(chooseCard(s,id),false);}
console.log('PASS: three animated destinations, twelve enemies, six bosses, seeded challenges, routes, all five evolutions and persistent journal.');
