import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
import * as T from '../vendor/three.module.min.js';
import * as core from '../core.js';
import {ExpeditionScene} from '../scene.js';

const canvasContext={clearRect(){},fillRect(){},fillText(){},scale(){},createRadialGradient(){return {addColorStop(){}};}};
const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},close(){},showModal(){}});
const document={getElementById:element,querySelectorAll:()=>[],addEventListener(){},body:element(),createElement:()=>({getContext:()=>({...canvasContext})})};
globalThis.document=document;
const context=vm.createContext({...core,T,ExpeditionScene,document,window:{addEventListener(){}},localStorage:{getItem(){}},Soundtrack:class{effect(){}},location:{hostname:'test'},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},console});
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/boot\(\);\s*$/,'');
vm.runInContext(source+'\nglobalThis.bench={step:updateShots,set(s,v){state=s;scene=v;}};',context);
const scene={scene:new T.Scene(),entities:[],shots:[],hit(){return false;}};
for(let i=0;i<96;i++){
  const group=new T.Group();group.position.set((i%4-1.5)*2,0,-1-Math.floor(i/4)*1.6);scene.scene.add(group);
  scene.entities.push({group,radius:.6,hp:1e6,type:'fight'});
}
scene.scene.updateMatrixWorld(true);const state=core.freshRun();state.range=52;context.bench.set(state,scene);
let worldReads=0;const original=T.Object3D.prototype.getWorldPosition;
T.Object3D.prototype.getWorldPosition=function(target){worldReads++;return original.call(this,target);};
const shots=Array.from({length:155},(_,i)=>({x:4.9+(i%3)*.01,z:4-i%14*.7,life:0,travel:0,range:52,radius:.14,damage:1}));
const collisionTimes=[];
for(let round=0;round<6;round++){
  const start=performance.now();
  for(let frame=0;frame<30;frame++){scene.shots=shots.map(shot=>({...shot}));context.bench.step(1/60);}
  collisionTimes.push((performance.now()-start)/30);
}
const readsPerFrame=worldReads/180;T.Object3D.prototype.getWorldPosition=original;
const spawnTimes=[];let geometries,textures,meshes,renderer;
for(let round=0;round<4;round++){
  renderer=Object.create(ExpeditionScene.prototype);renderer.theme='coast';renderer.scene=new T.Scene();renderer.entities=[];const row={group:new T.Group(),major:false,at:100};renderer.rows=[row];renderer.scene.add(row.group);geometries=new Set();textures=0;meshes=0;
  const start=performance.now();
  for(let i=0;i<96;i++){
    const enemy=renderer.makeEnemy('fight',{x:0,hp:100,kind:['blob','runner','shell','flyer'][i%4]},row,i);
    row.group.add(enemy.group);renderer.entities.push(enemy);
    renderer.enemyBodies.get(enemy.bodyKey).traverse(o=>{if(o.isMesh){geometries.add(o.geometry);meshes++;}});geometries.add(enemy.shadow.geometry);
    textures+=enemy.label.userData.canvas.width*enemy.label.userData.canvas.height*4;
  }
  spawnTimes.push(performance.now()-start);
}
renderer.drawEnemies();
const batches=[...renderer.enemyBatches.values()].flat(),enemyBodyDraws=batches.filter(mesh=>mesh.count>0).length+1;
const median=values=>values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)];
console.log(JSON.stringify({monsters:96,shots:155,collisionFrameMs:+median(collisionTimes.slice(1)).toFixed(3),worldReadsPerFrame:readsPerFrame,spawn96Ms:+median(spawnTimes.slice(1)).toFixed(1),uniqueEnemyGeometries:geometries.size,enemyBodyDraws,hpTextureMiB:+(textures/1024**2).toFixed(2)}));
if(!process.argv.includes('--measure-only')){
  assert.ok(readsPerFrame<400,'Dense shots must not repeat world transforms per enemy and projectile');
  assert.ok(geometries.size<100,'Repeated monster shapes should reuse geometry');
  assert.ok(textures<16*1024**2,'Dense enemy health labels must stay within a small texture budget');
  assert.ok(enemyBodyDraws<24,'Monster bodies and shadows must use shared instanced draws');
  assert.equal(renderer.enemyShadows.count,96);
  const geometry=renderer.enemyBodies.get(renderer.entities[0].bodyKey).children[0].geometry;let disposed=false;geometry.addEventListener('dispose',()=>disposed=true);
  renderer.entities[0].dead=true;renderer.pruneCourse(0);renderer.drawEnemies();assert.equal(renderer.enemyShadows.count,95);assert.equal(disposed,false,'Retiring one monster must preserve geometry shared by the others');
  renderer.clearCourse();assert.equal(renderer.enemyShadows.count,0);assert.ok(batches.every(mesh=>mesh.count===0));
}
