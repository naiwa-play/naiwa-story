import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {CyberFrontier} from '../cyber-frontier.js';
import {ExpeditionScene} from '../scene.js';
import {THEMES,MONSTER_POOLS,MINIONS,CARDS,makeCourse,bossFor,eliteFor,freshRun,chooseCard,rollCards,attackProfile} from '../core.js';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){},fillText(){},scale(){},createRadialGradient(){return {addColorStop(){}};}})})};
assert.ok(THEMES.cyber);const pool=MONSTER_POOLS.cyber;assert.equal(new Set(pool).size,4);assert.ok(pool.every(kind=>MINIONS[kind]));
assert.ok(rollCards(freshRun('cyber'),()=>.99).some(card=>card.id==='replicator'),'The first cyber choice must introduce the new weapon');
for(const stage of [0,1,5,15])for(const row of makeCourse(stage,()=>.5,'cyber'))for(const enemy of row.enemies||[])if(row.type!=='boss')assert.ok(pool.includes(enemy.kind),'Every cyber enemy, including the tutorial, must use the new designs');
const renderer=Object.create(ExpeditionScene.prototype);renderer.theme='cyber';renderer.scene=new T.Scene();renderer.entities=[];renderer.rows=[];
for(const kind of pool){const row={group:new T.Group(),major:false,stage:0};const enemy=renderer.makeEnemy('fight',{x:0,hp:100,kind},row,0);assert.ok(renderer.enemyBodies.get(enemy.bodyKey).children.length>0);}
for(const stage of [0,2]){const row={group:new T.Group(),major:true,stage},enemy=renderer.makeEnemy('boss',{x:0,hp:100},row,0);assert.ok(renderer.enemyBodies.get(enemy.bodyKey).children.length>=3);}
assert.equal(bossFor('cyber',0).id,'sheriff');assert.equal(bossFor('cyber',1).id,'foundry');assert.equal(eliteFor('cyber').id,'cyber-elite');

const geometry=new T.BoxGeometry(.6,1.7,.6),material=new T.MeshStandardMaterial({color:'#ffe57d'}),crowd=new T.InstancedMesh(geometry,material,1),factory=new CyberFrontier([{mesh:crowd}]);
assert.equal(factory.stations.length,6);const first=factory.stations[0],initialArm=first.shoulder.rotation.z,initialScan=first.scanner.position.y,initialFrog=new T.Matrix4();first.frogs[0].getMatrixAt(1,initialFrog);
factory.update(1.3,100,false);assert.notEqual(first.shoulder.rotation.z,initialArm);assert.notEqual(first.scanner.position.y,initialScan);const nextFrog=new T.Matrix4();first.frogs[0].getMatrixAt(1,nextFrog);assert.notDeepEqual(nextFrog.elements,initialFrog.elements);
for(const distance of [0,131,132,10000]){factory.update(8,distance,false);for(const cell of factory.stations){assert.ok(cell.root.position.z>=-112&&cell.root.position.z<20);assert.equal(cell.frogs[0].count,3);assert.equal(cell.frogs[0].geometry,geometry);for(const frog of cell.frogs)assert.ok([...frog.instanceMatrix.array].every(Number.isFinite));}}
factory.update(8,0,false);const loop=first.root.position.z;factory.update(8,132,false);assert.equal(first.root.position.z,loop);factory.update(8,300,true);assert.equal(first.root.position.z,first.root.userData.baseZ);
let draws=0;factory.group.traverse(object=>{if(object.isMesh)draws++;});assert.ok(draws<170,'Factory scenery should remain batched for mobile rendering');
let geometryDisposed=false,materialDisposed=false,instancesDisposed=0;geometry.addEventListener('dispose',()=>geometryDisposed=true);material.addEventListener('dispose',()=>materialDisposed=true);first.frogs[0].addEventListener('dispose',()=>instancesDisposed++);factory.dispose();assert.equal(geometryDisposed,false);assert.equal(materialDisposed,false);assert.equal(instancesDisposed,1);
const build=freshRun('cyber');assert.ok(chooseCard(build,'replicator'));assert.equal(build.weapon,'replicator');chooseCard(build,'scatter');assert.equal(attackProfile(build).count,5);assert.equal(build.weapon,'replicator');chooseCard(build,'heavy');assert.ok(attackProfile(build).damage>build.damage);
assert.ok(chooseCard(build,'replicator-depth'));assert.equal(build.splitDepth,6);assert.ok(chooseCard(build,'replicator-count'));assert.equal(build.splitCount,3);chooseCard(build,'egg');assert.equal(chooseCard(build,'replicator-count'),false);chooseCard(build,'replicator');assert.equal(build.splitDepth,6);assert.equal(build.splitCount,3);
for(let i=0;i<10;i++){chooseCard(build,'replicator-depth');chooseCard(build,'replicator-count');}assert.equal(build.splitDepth,8);assert.equal(build.splitCount,4);assert.equal(CARDS.find(card=>card.id==='replicator-depth').eligible(build),false);assert.equal(CARDS.find(card=>card.id==='replicator-count').eligible(build),false);
console.log('PASS cyber: four exclusive enemy designs, two bosses, factory production animations and loop, '+draws+' scenery draws, shared model preservation, copy-gun cards');
