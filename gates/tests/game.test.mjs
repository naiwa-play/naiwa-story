import assert from 'node:assert/strict';
import {freshRun,applyGate,damageSquad,killReward,crossed,formation,makeCourse,runMultiplier,rollCards,CARDS,chooseCard,SHOP,buyUpgrade,shopPrice,sweepHit,BOSSES,bossFor,MODES,chargeMode,activateMode,tickMode,effectiveRate,squadContact,attackProfile,MINIONS} from '../core.js';
const s=freshRun();assert.equal(s.count,1);assert.equal(s.damage,1.1);assert.equal(s.rate,1.5);assert.deepEqual(s.pets,{naigou:0,naishu:0});assert.deepEqual(s.petDamage,{naigou:1.05,naishu:1.05});
applyGate(s,{stat:'count',op:'add',value:1});applyGate(s,{stat:'count',op:'multiply',value:2});assert.equal(s.count,4);
applyGate(s,{stat:'count',op:'multiply',value:100});assert.equal(s.count,128);
assert.ok(damageSquad(s,1));assert.equal(s.health,3);assert.equal(s.count,128,'Collision only costs health');assert.equal(damageSquad(s,1),false);s.invincible=0;damageSquad(s,3);assert.equal(s.phase,'lost');
const rewarded=freshRun();killReward(rewarded);assert.equal(rewarded.damage,1.12);killReward(rewarded,true);assert.equal(rewarded.count,2);assert.ok(rewarded.damage>1.3&&rewarded.rate>1.5);
assert.equal(crossed(27.9,28.6,28),true);assert.equal(crossed(28.6,29.2,28),false);assert.equal(formation(128).length,64);
for(let stage=0;stage<15;stage++){const course=makeCourse(stage);assert.ok(course.every((r,i)=>i===0||r.at>course[i-1].at));assert.ok(course.at(-1).at<260*(stage+1));assert.equal(course.filter(r=>r.type==='boss').length,1);}
assert.ok(makeCourse(5).at(-1).enemies[0].hp>makeCourse(4).at(-1).enemies[0].hp);
const endless=freshRun();endless.elapsed=160;assert.equal(runMultiplier(endless),3);endless.speed=1.6;endless.elapsed=10000;assert.equal(runMultiplier(endless),3);
const deck=freshRun();const before=CARDS.filter(c=>!c.eligible||c.eligible(deck));assert.ok(!before.some(c=>c.id==='naigou-pack'||c.id==='naishu-power'));assert.equal(new Set(rollCards(deck,()=>0).map(c=>c.id)).size,3);
assert.ok(chooseCard(deck,'dog'));assert.equal(deck.pets.naigou,1);assert.ok(!chooseCard(deck,'dog'));assert.ok(chooseCard(deck,'naigou-pack'));assert.equal(deck.pets.naigou,2);assert.ok(!chooseCard(deck,'naishu-pack'));
assert.ok(chooseCard(deck,'range'));assert.equal(deck.range,26);assert.ok(!chooseCard(deck,'pumpkin'));deck.theme='halloween';assert.ok(chooseCard(deck,'pumpkin'));assert.equal(deck.weapon,'pumpkin');
for(const weapon of ['laser','bomb','egg']){assert.ok(chooseCard(deck,weapon));assert.equal(deck.weapon,weapon);}
const saved={coins:20,upgrades:{}};assert.equal(buyUpgrade(saved,'naigou'),false);saved.coins=300;assert.ok(buyUpgrade(saved,'naigou'));assert.equal(saved.coins,210);assert.equal(saved.startingPet,'naigou');assert.equal(buyUpgrade(saved,'naigou'),false);
assert.equal(freshRun('coast',1,saved.upgrades,saved.startingPet).pets.naigou,1);const item=SHOP.find(c=>c.id==='heart');assert.ok(shopPrice(item,2)>shopPrice(item,1));
assert.ok(sweepHit(0,10,0,-10,1)!==null);assert.equal(sweepHit(5,10,5,-10,1),null);assert.equal(sweepHit(0,0,0,0,1),0);
console.log('PASS: low starting stats, conditional cards, weapons, shop purchases, endless scaling, generated course and swept collision.');
const waves=stage=>makeCourse(stage).filter(r=>r.type==='fight').reduce((n,r)=>n+r.enemies.length,0);
assert.ok(waves(3)>waves(1)&&waves(8)>waves(3));assert.ok(makeCourse(3).some(r=>r.enemies?.some(e=>e.z<0)));
assert.equal(makeCourse(0).filter(r=>r.type==='potion').length,1);assert.equal(makeCourse(1).filter(r=>r.type==='potion').length,0);assert.equal(makeCourse(2).filter(r=>r.type==='potion').length,1);
assert.ok(CARDS.some(c=>c.id==='laser'));assert.ok(CARDS.some(c=>c.id==='scatter'));
for(const [theme,bosses] of Object.entries(BOSSES)){assert.equal(bosses.length,2);assert.notEqual(bossFor(theme,0).id,bossFor(theme,1).id);assert.notEqual(bosses[0].attack,bosses[1].attack);}
for(const [i,id] of Object.keys(MODES).entries()){const mode=freshRun();assert.equal(mode.readyMode,null);chargeMode(mode,99,()=>i/5);assert.equal(mode.readyMode,null);chargeMode(mode,1,()=>i/5+.001);assert.equal(mode.readyMode,id);assert.ok(activateMode(mode));assert.equal(mode.activeMode,id);assert.equal(mode.joy,0);assert.equal(chargeMode(mode,100),false);if(id==='anger')assert.equal(effectiveRate(mode),2.7);if(id==='melancholy')assert.equal(runMultiplier(mode),.55);if(id==='god'){assert.equal(damageSquad(mode,2),false);assert.equal(mode.health,4);}tickMode(mode,MODES[id].duration+.1);assert.equal(mode.activeMode,null);assert.equal(mode.rate,1.5);assert.equal(effectiveRate(mode),1.5);assert.equal(runMultiplier(mode),1);}
const squad=freshRun();squad.count=2;assert.ok(squadContact(squad,-.43,6.1,-.43,6.7,.2));assert.equal(squadContact(squad,4,0,4,8,.2),false);
console.log('PASS: increasing multi-row swarms, rare bottles, six biome bosses, five revealed timed modes and complete squad collision.');
const build=freshRun();chooseCard(build,'bomb');chooseCard(build,'scatter');assert.equal(build.weapon,'bomb');assert.equal(build.pattern,'spread');assert.equal(attackProfile(build).count,5);
chooseCard(build,'heavy');const heavy=attackProfile(build);assert.ok(heavy.damage>build.damage&&heavy.rate<build.rate&&heavy.size>1);
chooseCard(build,'rapid');const rapid=attackProfile(build);assert.ok(rapid.rate>build.rate&&rapid.damage<build.damage*1.35);
chooseCard(build,'projectiles');assert.equal(attackProfile(build).count,2);assert.equal(build.weapon,'bomb');
const ordinary=CARDS.find(c=>c.id==='company'),rare=CARDS.find(c=>c.id==='squad-multiplier');assert.ok(rare.weight<ordinary.weight/10);
assert.ok(rollCards(freshRun(),()=>.4,true).every(c=>c.majorReward));
for(let stage=1;stage<8;stage++){const rows=makeCourse(stage,()=>.5);for(const row of rows){if(row.type==='boss')assert.equal(row.enemies[0].reward,5);if(row.type==='fight')assert.ok(row.enemies.every(e=>e.reward===1));}}
const healthAt=n=>makeCourse(n,()=>.5).find(r=>r.type==='fight').enemies[0].hp;assert.ok(healthAt(12)-2*healthAt(8)+healthAt(4)>0);
const mixed=makeCourse(8,()=>.5,'halloween').find(r=>r.type==='fight').enemies;assert.ok(new Set(mixed.map(e=>e.kind)).size>=3);assert.ok(mixed.every(e=>MINIONS[e.kind]));assert.ok(Math.min(...mixed.map(e=>e.z))< -15);
const charge=freshRun();charge.joy=100;charge.readyMode='anger';activateMode(charge);tickMode(charge,11);for(let i=0;i<100;i++)chargeMode(charge,8,Math.random,true);assert.ok(charge.joy<=3);charge.joy=100;chargeMode(charge,1);assert.equal(charge.readyMode,null);charge.elapsed=45;chargeMode(charge,0,()=>0);assert.equal(charge.readyMode,'anger');
console.log('PASS: weapon-pattern combinations, rare major rewards, 1/5 coin drops, quadratic HP, scattered mixed swarms and mode charge limits.');
