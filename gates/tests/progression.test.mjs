import assert from 'node:assert/strict';
import {MAX_STAT,THEMES,MINIONS,CARDS,freshRun,makeCourse,applyGate,killReward,rewardGrowth,chooseCard,rollCards,formation,attackProfile,formatStat} from '../core.js';

// All generated health, including weighted tanks and bosses, must stay finite at the requested limit.
for(const theme of Object.keys(THEMES))for(const stage of [0,1,10,30,50,100,10000]){
 for(const row of makeCourse(stage,()=>.5,theme))for(const enemy of row.enemies||[]){assert.ok(Number.isFinite(enemy.hp)&&enemy.hp>0&&enemy.hp<=MAX_STAT);assert.equal(enemy.reward,row.type==='boss'?5:1);}
}
const bossHP=stage=>makeCourse(stage,()=>.5).at(-1).enemies[0].hp;
assert.ok(Math.abs(bossHP(9)/bossHP(6)-1.48**3)<.01);assert.equal(bossHP(100),MAX_STAT);
const ordinaryHP=stage=>{const enemy=makeCourse(stage,()=>.5).find(row=>row.type==='fight').enemies[0];return enemy.hp/MINIONS[enemy.kind].health;};
assert.ok(Math.abs(ordinaryHP(24)/ordinaryHP(20)-1.43**4)<.01);assert.ok(1.43>1.14&&1.48>1.14);
const early=freshRun(),late=freshRun();late.stage=20;killReward(early);killReward(late);
assert.ok(late.damage-1.1>(early.damage-1.1)*10);assert.ok(Math.abs((late.damage-1.1)/(.02*rewardGrowth(20))-1)<.001);
late.damage=100;late.count=500;late.pets.naigou=1;late.petDamage.naigou=10;killReward(late,true);assert.ok(late.damage>100&&late.count>500&&late.petDamage.naigou>10);
const gateAt=stage=>makeCourse(stage,()=>.5).find(row=>row.type==='gate');assert.ok(gateAt(20).options[0].value>gateAt(1).options[0].value);assert.ok(gateAt(20).options[1].value>gateAt(1).options[1].value);
const grow=freshRun();grow.stage=20;const damageCard=CARDS.find(card=>card.id==='damage'),amount=Number(damageCard.describe(grow).match(/增加 ([\d.]+)/)[1]);chooseCard(grow,'damage');assert.ok(Math.abs(grow.damage-1.1-amount)<1e-10);
grow.count=200;chooseCard(grow,'squad-multiplier');assert.equal(grow.count,300,'Logical partners can exceed the old 128 cap');assert.equal(formation(MAX_STAT).length,64,'Rendering stays bounded');
applyGate(grow,{stat:'damage',op:'multiply',value:MAX_STAT});applyGate(grow,{stat:'count',op:'multiply',value:MAX_STAT});assert.equal(grow.damage,MAX_STAT);assert.equal(grow.count,MAX_STAT);killReward(grow,true);assert.equal(grow.damage,MAX_STAT);assert.equal(grow.count,MAX_STAT);
applyGate(grow,{stat:'rate',op:'add',value:10000});assert.equal(grow.rate,8);assert.equal(CARDS.find(card=>card.id==='rate').eligible(grow),false);
grow.range=52;grow.speed=1.6;grow.cards=1;for(let i=0;i<50;i++)assert.ok(rollCards(grow,Math.random).every(card=>!['damage','company','growth','rate','range','speed'].includes(card.id)),'Capped growth cards must leave the pool');
grow.weapon='bomb';grow.pattern='heavy';assert.equal(attackProfile(grow).damage,MAX_STAT);
grow.maxHealth=20;chooseCard(grow,'major-rest');assert.equal(grow.maxHealth,21);assert.equal(grow.health,21);
assert.equal(formatStat(12345),'1.23万');assert.equal(formatStat(123456789),'1.23亿');assert.equal(formatStat(1.85),'1.85');
console.log('PASS progression: exponential enemies and rewards, 999999999 ceilings, logical squad scaling, pet growth, accurate card copy, performance caps and compact numbers');
