import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as T from '../vendor/three.module.min.js';
import * as core from '../core.js';
import * as expansion from '../expansion.js';
import {CooperativeSession} from '../party.js';
import {ExpeditionScene} from '../scene.js';
const elements=new Map();
const windowEvents=new Map();
const modalEvents=new Map();
function element(id){if(!elements.has(id))elements.set(id,{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(name,handler){if(id==='modal')modalEvents.set(name,handler);},setAttribute(){},append(){},close(){},showModal(){},getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};}});return elements.get(id);}
const oldSave={stars:17,upgrades:{heart:'2',naigou:1},startingPet:'naigou',journal:{milestones:['guardian',false],daily:{'2026-11-08':900,'2026-11-09':'invalid'}}};
const context=vm.createContext({...core,...expansion,CooperativeSession,rollCards:(s,random,major)=>core.rollCards(s,()=>.43,major),T,ExpeditionScene,Soundtrack:class{effect(){}pause(){}resume(){}},document:{getElementById:element,querySelectorAll:()=>[],addEventListener(){},body:{classList:{add(){},remove(){}}}},window:{addEventListener(name,handler){windowEvents.set(name,handler);}},localStorage:{getItem(){return JSON.stringify(oldSave);}},location:{hostname:'test'},innerWidth:1280,setTimeout(){},clearTimeout(){},console,requestAnimationFrame(){}});
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/boot\(\);\s*$/,'');
vm.runInContext(source+'\nglobalThis.testGame={updateShots,update,volley,burst,hit,bossAttack,updateThreats,getThreats:()=>activeThreats,updateModeHUD,companionAttack,petAttack,dogAttack,threats(t){activeThreats=t;},set(s,v,a=null){state=s;scene=v;active=a;course=[];paused=false;pendingCards=null;nextStage=1;fireTimer=dogTimer=petTimer=0;dogBites=[];activeThreats=[];companionReady=[];pendingMajorReward=false;},course(rows){course=rows;scene.createCourse(rows);},choose(){if(pendingCards){const ids=["dog","mouse","company","damage","rate","scatter","range"],card=ids.map(id=>pendingCards.find(c=>c.id===id)).find(Boolean)||pendingCards[0];chooseCard(state,card.id);pendingCards=null;paused=false;}},getState:()=>state};',context);
const game=context.testGame;
assert.equal(vm.runInContext('saved.coins',context),17,'Legacy stars should carry forward as coins');
assert.equal(vm.runInContext('saved.startingPet',context),'naigou','Keep the purchased starting pet');
assert.equal(vm.runInContext('saved.upgrades.heart',context),2,'Restore purchased upgrades');
assert.equal(vm.runInContext('JSON.stringify(saved.journal)',context),JSON.stringify({daily:{'2026-11-08':900},enemies:[],evolutions:[],milestones:['guardian'],themes:[]}));
vm.runInContext('globalThis.testGame.getParty=()=>party;globalThis.testGame.partnerCombat=partnerCombat;globalThis.testGame.resolveEvent=()=>{if(eventChoice){applyEvent(state,eventChoice.choices[1]);eventChoice=null;paused=false;}};',context);
function fixture(at=20){const row={at,type:'fight',group:new T.Group(),used:false},group=new T.Group();row.group.add(group);const scene={home:false,rows:[row],entities:[],shots:[],scene:new T.Scene(),positionRows:ExpeditionScene.prototype.positionRows,shoot(){},beam(){},dropCoins(){},dropPotion(){},rewardText(){},collectCoins(){return 0;},collectPotions(){return 0;},pruneCourse(){},hurt(){},burst(){},ring(){},hit(e,d){e.hp-=d;if(e.hp<=0)e.dead=true;return e.dead;}};scene.scene.add(row.group);const enemy={row,group,type:'fight',hp:10,maxHp:10,radius:.8,offset:0,contact:0,reward:1,dead:false};scene.entities.push(enemy);scene.positionRows(0);scene.scene.updateMatrixWorld(true);return {scene,enemy,row};}
function extraEnemy(scene,row,x=2,z=0){const group=new T.Group();group.position.set(x,0,z);row.group.add(group);const enemy={row,group,type:'fight',hp:10,maxHp:10,radius:.8,offset:0,contact:0,reward:1,dead:false};scene.entities.push(enemy);scene.scene.updateMatrixWorld(true);return enemy;}
const failures=[];
for(const [name,run] of [
 ['visible enemies take projectile damage before any scripted battle',()=>{const {scene,enemy}=fixture();scene.shots=[{x:0,y:.9,z:-14,damage:4,life:0}];game.set(core.freshRun(),scene);game.updateShots(.08);assert.equal(enemy.hp,6);} ],
 ['boss projectiles hitting a visible companion cost shared health',()=>{const {scene}=fixture(100),s=core.freshRun();s.count=2;const group=new T.Mesh(new T.SphereGeometry(.2),new T.MeshBasicMaterial());group.position.set(-.43,.6,6.1);scene.scene.add(group);game.set(s,scene);game.threats([{group}]);game.update(.05);assert.equal(s.health,3);} ],
 ['companions fire independently, home toward enemies, and respect their cooldown',()=>{const {scene}=fixture(18),s=core.freshRun();scene.shoot=ExpeditionScene.prototype.shoot;s.count=3;s.elapsed=1;game.set(s,scene);game.companionAttack();s.elapsed=1.3;game.companionAttack();assert.equal(scene.shots.length,2);assert.ok(scene.shots.every(b=>b.kind==='companion'&&b.pet&&b.target));game.companionAttack();assert.equal(scene.shots.length,2);game.updateShots(.2);assert.ok(scene.shots[0].x>-.43);s.elapsed=5;game.companionAttack();assert.equal(scene.shots.length,4);} ],
 ['angel mode stops shooting and grants 1.5x growth without a kill',()=>{const {scene,enemy}=fixture(10),s=core.freshRun();scene.drawShots=()=>{};s.joy=100;s.readyMode='angel';game.set(s,scene);game.burst();game.update(.1);assert.equal(s.kills,0);assert.equal(enemy.peaceful,true);assert.equal(s.damage,1.13);assert.equal(scene.shots.length,0);} ],
 ['demon mode doubles kill growth and coin drops',()=>{const {scene,enemy}=fixture(),s=core.freshRun();let coins=0;scene.dropCoins=(x,z,value)=>coins+=value;enemy.hp=1;s.activeMode='demon';s.modeLeft=10;scene.shots=[{x:0,z:-14,damage:4,life:0}];game.set(s,scene);game.updateShots(.1);assert.equal(s.damage,1.14);assert.equal(coins,2);} ],
 ['enemies keep advancing through the contact line',()=>{const {scene,enemy,row}=fixture();const s=core.freshRun();s.phase='run';enemy.offset=18.9;game.set(s,scene,row);const before=enemy.offset;game.update(.1);assert.ok(enemy.offset>before,'Enemy stopped at the contact line');} ],
 ['boss encounter stops the road without stopping ordinary enemies',()=>{const {scene,enemy,row}=fixture(17);enemy.type='boss';row.type='boss';const mob=extraEnemy(scene,row,3,-2);game.set(core.freshRun(),scene);game.update(.1);const distance=game.getState().distance,offset=enemy.offset;assert.equal(game.getState().phase,'boss');game.update(.1);assert.equal(game.getState().distance,distance);assert.equal(enemy.offset,offset);assert.ok(mob.offset>0);} ],
 ['fast relative movement cannot tunnel through an enemy',()=>{const {scene,enemy}=fixture();enemy.previousZ=-22;scene.shots=[{x:0,z:-16,damage:3,life:0,range:22,kind:'egg'}];game.set(core.freshRun(),scene);game.updateShots(.08);assert.equal(enemy.hp,7);} ],
 ['dog can lunge at the 18-metre boss stand-off distance',()=>{const {scene}=fixture(18);let lunges=0;scene.petLunge=()=>lunges++;const s=core.freshRun();s.pets.naigou=1;game.set(s,scene);game.dogAttack();assert.equal(lunges,1);} ],
 ['scatter fires five visible projectiles and hits all three lanes',()=>{const {scene,enemy,row}=fixture();const left=extraEnemy(scene,row,-2.1),right=extraEnemy(scene,row,2.1),s=core.freshRun();scene.shoot=ExpeditionScene.prototype.shoot;s.pattern='spread';game.set(s,scene);game.volley();assert.equal(scene.shots.length,5);assert.equal(new Set(scene.shots.map(b=>b.angle)).size,5);assert.ok(scene.shots.every(b=>b.kind==='egg'&&b.radius>=.28));game.updateShots(1);assert.ok(enemy.hp<10&&left.hp<10&&right.hp<10);} ],
 ['laser pierces clustered enemies and can fan with spread',()=>{const {scene,enemy,row}=fixture(),s=core.freshRun();let rays=0;scene.beam=()=>rays++;const other=extraEnemy(scene,row,0,-2);s.weapon='laser';s.pattern='spread';game.set(s,scene);game.volley();assert.equal(rays,5);assert.ok(enemy.hp<10&&other.hp<10);} ],
 ['thrown eggs preserve their explosions when combined with spread',()=>{const {scene}=fixture(),s=core.freshRun();s.weapon='bomb';s.pattern='spread';scene.shoot=ExpeditionScene.prototype.shoot;game.set(s,scene);game.volley();assert.equal(scene.shots.length,5);assert.ok(scene.shots.every(b=>b.kind==='bomb'));} ],
 ['bomb damages nearby enemies together',()=>{const {scene,enemy,row}=fixture();const other=extraEnemy(scene,row,2,0);scene.shots=[{x:0,z:-14,damage:4,life:0,range:22,kind:'bomb'}];game.set(core.freshRun(),scene);game.updateShots(.08);assert.equal(enemy.hp,6);assert.equal(other.hp,6);} ],
 ['range limit and range upgrade affect the actual projectile path',()=>{const {scene,enemy}=fixture(35);const s=core.freshRun();scene.shots=[{x:0,z:4.25,damage:4,life:0,range:22,travel:0}];game.set(s,scene);game.updateShots(2);assert.equal(enemy.hp,10);s.range=40;scene.shots=[{x:0,z:4.25,damage:4,life:0,range:40,travel:0}];game.updateShots(2);assert.equal(enemy.hp,6);} ],
 ['a visible projectile impact at the range boundary still damages the enemy',()=>{const {scene,enemy}=fixture(23);scene.shots=[{x:0,z:-17,damage:4,life:0,range:22,travel:21.25}];game.set(core.freshRun(),scene);game.updateShots(.08);assert.equal(enemy.hp,6);} ],
]){try{run();console.log('PASS:',name);}catch(e){failures.push(name);console.error('FAIL:',name,e.message);}}
assert.equal(failures.length,0,failures.join('; '));
const bottle={group:new T.Group(),at:0,heal:2},pickupScene={scene:new T.Scene(),potions:[bottle],time:0};pickupScene.scene.add(bottle.group);
assert.equal(ExpeditionScene.prototype.collectPotions.call(pickupScene,0,0,.1,2,4),2);assert.equal(pickupScene.potions.length,0);
const simulation=fixture().scene;simulation.rows=[];simulation.entities=[];simulation.coins=[];simulation.potions=[];simulation.time=0;
for(const method of ['shoot','dropCoins','collectCoins','dropPotion','collectPotions','pruneCourse'])simulation[method]=ExpeditionScene.prototype[method];
simulation.chargeMouse=simulation.petLunge=()=>{};
simulation.createCourse=function(rows){for(const row of rows){row.group=new T.Group();this.scene.add(row.group);this.rows.push(row);for(const e of row.enemies||[]){const enemy=extraEnemy(this,row,e.x,e.z||0);enemy.offset=e.z||0;enemy.hp=enemy.maxHp=e.hp;enemy.type=row.type;enemy.radius=row.type==='boss'?2:.8;enemy.reward=e.reward;}if(row.type==='potion')for(const x of row.positions)this.dropPotion(x,5-(row.at-this.distance));if(row.type==='coins')for(const x of row.positions)this.dropCoins(x,5-(row.at-this.distance),1);}this.positionRows(this.distance);this.scene.updateMatrixWorld(true);};
const run=core.freshRun();run.health=run.maxHealth=200;game.set(run,simulation);game.course(core.makeCourse(0));
for(let i=0;i<6000&&run.distance<650;i++){game.update(.05);game.resolveEvent();game.choose();}
assert.ok(run.endless&&run.distance>=650,'Tutorial must continue into more than one endless segment');assert.ok(run.bosses>=2,'Boss combat must resume the road after victory');assert.ok(run.coins>0,'Real dropped coins must be collectible');assert.ok(Number.isFinite(run.damage)&&simulation.entities.length<100,'Old course entities must be retired');
console.log('PASS: health bottle pickup and complete tutorial → boss victories → continuous endless run, with collected coins.');
let hapticNow=10000;const vibrations=[];context.navigator={vibrate(pattern){vibrations.push(pattern);return true;}};context.performance={now:()=>hapticNow};context.window.matchMedia=()=>({matches:true});
const hapticFixture=fixture(),hapticState=core.freshRun();game.set(hapticState,hapticFixture.scene);
game.hit(hapticFixture.enemy,100);game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);assert.deepEqual(vibrations,[12]);
hapticNow+=601;game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);assert.equal(vibrations.length,2);
hapticState.readyMode='anger';hapticState.joy=100;game.updateModeHUD();game.updateModeHUD();assert.deepEqual(Array.from(vibrations[2]),[35,45,65]);assert.equal(vibrations.length,3);
game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);assert.equal(vibrations.length,3,'Kill feedback must not interrupt the full-charge pulse');
hapticNow+=1000;context.document.hidden=true;game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);assert.equal(vibrations.length,3);
context.document.hidden=false;context.window.matchMedia=()=>({matches:false});game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);assert.equal(vibrations.length,3);
delete context.navigator.vibrate;game.hit(extraEnemy(hapticFixture.scene,hapticFixture.row),100);
console.log('PASS: mobile kill pulse cooldown, full charge double pulse, no overlapping pulses and unsupported-device fallback.');

// Copy shots inherit their remaining range and cannot farm the same target repeatedly.
{
 const {scene,enemy,row}=fixture(20),s=core.freshRun('cyber');s.weapon='replicator';s.range=52;scene.shoot=ExpeditionScene.prototype.shoot;game.set(s,scene);game.volley();assert.equal(scene.shots[0].kind,'replicator');
 scene.shots=[{x:0,z:-13,damage:4,kind:'replicator',range:52,angle:0,size:1,radius:.28,travel:0,life:0}];game.updateShots(.1);
 assert.equal(enemy.hp,6);assert.equal(scene.shots.length,2);assert.ok(scene.shots.every(b=>b.generation===1&&b.damage===2.6&&b.size<1));
 const hp=enemy.hp;game.updateShots(.01);assert.equal(enemy.hp,hp,'Children must not hit their parent target again');
 let shot=scene.shots[0];
 for(let generation=1;generation<=5;generation++){
  scene.shots=[{...shot,x:0,z:-12,angle:0}];scene.entities=[extraEnemy(scene,row,0,2.5)];scene.scene.updateMatrixWorld(true);game.updateShots(.1);
  if(generation<5){assert.equal(scene.shots.length,2);shot=scene.shots[0];assert.equal(shot.generation,generation+1);}else assert.equal(scene.shots.length,0,'The fifth generation cannot split a sixth time');
 }
 scene.entities=[enemy];enemy.dead=false;enemy.hp=1e6;scene.scene.updateMatrixWorld(true);
 scene.shots=Array.from({length:155},()=>({x:0,z:-13,damage:1,kind:'replicator',range:52,angle:0,size:1,radius:.28,travel:0,life:0}));game.updateShots(.1);assert.equal(scene.shots.length,155,'Splitting respects the shared projectile budget');
 scene.shots=[{x:0,z:-13,damage:1,kind:'replicator',range:.05,angle:0,size:1,radius:.28,travel:0,life:0}];game.updateShots(.1);assert.equal(scene.shots.length,0,'Expired range cannot be reset by splitting');
}
for(const index of [0,1]){
 const {scene,enemy}=fixture(20),s=core.freshRun('cyber');enemy.boss=core.bossFor('cyber',index);game.set(s,scene);game.bossAttack(enemy);
 const threats=game.getThreats();assert.ok(threats.length>=2);const projectile=threats.find(t=>t.kind!=='area');projectile.group.position.set(0,.6,5);projectile.vx=0;projectile.vz=12;game.updateThreats(.1);assert.equal(s.health,3,'Both cyber bosses must damage shared health on impact');
}
console.log('PASS copy gun: horizontal hits, smaller splitting eggs, five-generation limit, no repeated targets, shared shot cap, preserved range; cyber boss damage.');
{
 const {scene}=fixture(20),state=core.freshRun('cyber');state.weapon='replicator';state.splitDepth=6;state.splitCount=3;scene.shoot=ExpeditionScene.prototype.shoot;game.set(state,scene);game.volley();assert.equal(scene.shots[0].splitLimit,6);assert.equal(scene.shots[0].splitChildren,3);
 scene.shots=[{x:0,z:-13,damage:1,kind:'replicator',range:52,angle:0,size:1,radius:.28,travel:0,life:0,generation:5}];game.updateShots(.1);assert.equal(scene.shots.length,3);assert.ok(scene.shots.every(shot=>shot.generation===6));
 scene.shots=[{x:0,z:-13,damage:1,kind:'replicator',range:52,angle:0,size:1,radius:.28,travel:0,life:0,generation:5,splitLimit:5,splitChildren:2}];game.updateShots(.1);assert.equal(scene.shots.length,0,'Already-fired shots retain their original upgrade snapshot');
}
console.log('PASS copy upgrades: extra split generations, extra eggs and immutable launch parameters.');
vm.runInContext('Object.assign(testGame,{explode,fields:()=>fields,turrets:()=>turrets,takeHit});',context);
{
 const {scene,enemy}=fixture(),s=core.freshRun();scene.shoot=ExpeditionScene.prototype.shoot;s.weapon='egg';s.pattern='rapid';s.projectileBonus=1;s.evolutions=['comet'];game.set(s,scene);let piercing=false;for(let i=0;i<4;i++){scene.shots=[];game.volley();piercing||=scene.shots.some(b=>b.piercing);}assert.ok(piercing,'Comet evolution must fire an actual piercing egg');
 s.weapon='bomb';s.pattern='spread';s.evolutions=['meteor'];scene.shots=[];game.volley();assert.ok(scene.shots.every(b=>b.evolution==='meteor'));game.explode({...scene.shots[0],x:0,z:-15});assert.ok(game.fields().some(f=>f.kind==='echo'));
 s.weapon='pumpkin';s.evolutions=['ghostfire'];game.explode({x:0,z:-15,damage:1,kind:'pumpkin',evolution:'ghostfire'});assert.ok(game.fields().some(f=>f.kind==='fire'));
 const session=game.getParty();session.playing=true;session.room.index=0;session.main=s;session.partner=core.freshRun();s.phase=session.partner.phase='boss';s.health=session.partner.health=4;s.damage=session.partner.damage=1.1;enemy.hp=1;enemy.type='boss';scene.shots=[{x:0,z:-14,damage:4,life:0,kind:'egg',owner:1}];game.updateShots(.08);assert.equal(s.bosses,1);assert.equal(session.partner.bosses,1);assert.equal(s.phase,'run','Guest boss kill must resume host road');assert.equal(session.partner.phase,'run');assert.ok(s.damage>1.1&&session.partner.damage>1.1);
 session.playing=false;
}
{
 const {scene}=fixture(100),s=core.freshRun(),session=game.getParty();scene.shoot=ExpeditionScene.prototype.shoot;scene.chargeMouse=scene.petLunge=()=>{};game.set(s,scene);session.playing=true;session.room.index=0;session.main=s;session.partner=core.freshRun();session.partner.x=0;session.targetX=0;s.health=0;s.downAt=0;s.phase='run';
 for(let i=0;i<60;i++)game.update(.05);assert.equal(s.health,2,'Nearby living partner revives in 2.5 seconds');assert.ok(s.invincible>0);session.playing=false;
}
console.log('PASS expansion combat: real evolution effects, guest kill rewards, boss road resumption and cooperative revival.');
{
 const {scene,enemy,row}=fixture(),other=extraEnemy(scene,row,2),s=core.freshRun();s.weapon='laser';s.pets.naishu=1;s.evolutions=['chain'];enemy.markUntil=4;game.set(s,scene);game.volley();assert.ok(other.hp<10,'Marked laser target must transmit damage outside the beam');
 s.weapon='replicator';scene.shots=[{x:0,z:-14,damage:1,life:0,kind:'replicator',generation:5,splitLimit:5,evolution:'mother'}];game.updateShots(.08);assert.ok(game.turrets().length>0,'Last-generation hit must create a mother turret');
}
vm.runInContext('testGame.challenge=(s,v)=>{state=s;scene=v;displayedResult=settled=paused=false;course=[];};',context);
for(const mode of ['guard','bossrush']){const s=core.freshRun();s.mode=mode;if(mode==='guard'){s.elapsed=179.95;s.baseHealth=12;}else s.bosses=6;game.challenge(s,fixture(100).scene);game.update(.1);assert.ok(s.victory);assert.equal(s.phase,'lost','A completed challenge must leave the combat loop');}
console.log('PASS: chain lightning, mother turret and both finite challenge victory paths.');
{
 const {scene,enemy}=fixture(35),s=core.freshRun(),session=game.getParty();s.range=12;session.playing=true;session.room.index=0;session.partner=core.freshRun();session.partner.range=40;session.main=s;game.set(s,scene);scene.shots=[{x:0,z:-25,damage:4,life:0,kind:'egg',owner:1,range:40,travel:29}];game.updateShots(.2);assert.equal(enemy.hp,6,'Guest range must remain independent of the host range');session.playing=false;
}
console.log('PASS: independent cooperative projectile ranges.');
{
 const {scene}=fixture();
 game.set(core.freshRun(),scene);
 vm.runInContext('pressed.clear()',context);
 const down=windowEvents.get('keydown'),up=windowEvents.get('keyup');
 down({key:'Process',code:'KeyD',preventDefault(){}});
 assert.equal(vm.runInContext('pressed.has("d")',context),true,'Physical D must work while an IME owns the character');
 up({key:'в',code:'KeyD'});
 assert.equal(vm.runInContext('pressed.size',context),0,'Releasing D must stop movement after the input language changes');
 down({key:'ф',code:'KeyA',preventDefault(){}});
 assert.equal(vm.runInContext('pressed.has("a")',context),true);
 up({key:'A',code:'KeyA'});
 down({key:'A',preventDefault(){}});
 assert.equal(vm.runInContext('pressed.has("a")',context),true,'Older browsers retain key-based controls');
 up({key:'a'});
 element('modal').open=true;
 down({key:'Process',code:'KeyD',preventDefault(){}});
 assert.equal(vm.runInContext('pressed.size',context),0,'Typing in an open dialog must not move the hero');
 element('modal').open=false;
}
console.log('PASS: physical movement keys, IME input, language changes, legacy keys and dialog input.');
{
 const modal=element('modal');
 modal.open=true;
 vm.runInContext('paused=true',context);
 modalEvents.get('close')();
 assert.equal(vm.runInContext('paused',context),true,'Closing the previous choice must not resume the game when its successor is open');
 modal.open=false;
 modalEvents.get('close')();
 assert.equal(vm.runInContext('paused',context),false);
}
{
 vm.runInContext('delete saved.journal',context);
 for(let run=0;run<2;run++){
  const s=core.freshRun();
  s.bosses=1;
  game.challenge(s,fixture().scene);
  vm.runInContext('end()',context);
  assert.equal(element('result-copy').textContent.includes('晨光奶蛋'),run===0,'A milestone should appear on the results only when newly earned');
 }
}
console.log('PASS: chained modal pauses, older save compatibility and first-time milestone rewards.');
