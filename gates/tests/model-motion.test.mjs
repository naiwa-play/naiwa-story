import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {jellyPose,HURT_DURATION} from '../jelly-motion.js';
function read(name,base){const b=fs.readFileSync(new URL(name+'.glb',base)),size=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+size)),bin=b.subarray(28+size);return {g,values(index,k){const a=g.accessors[index],v=g.bufferViews[a.bufferView],Type=a.componentType===5126?Float32Array:a.componentType===5125?Uint32Array:Uint16Array;return new Type(bin.buffer,bin.byteOffset+(v.byteOffset||0),a.count*k);}};}
for(const [name,folder,hash] of [['naiwa','rodin-v4','8c22f4075d13058b8d3c4394af4322be81e501fadd29d811e627467d74b7bed1'],['naigou','rodin-naigou','43401779d99ec3bb4a4d25323b9fe1425c853a26620741e5751561a5a94a478e'],['naishu','rodin-naishu','b6ba069bf15df1b7620f690df7b38dc662cbc8c3a6100a15ae2df638434da335']]){
const base=new URL(`../assets/models/${folder}/`,import.meta.url);
const original=read(name+'-original',base),hero=read(name+'-jelly',base),g=hero.g,primitive=g.meshes[0].primitives[0];
assert.equal(g.meshes.length,1,'Keep the original complete body, with no separated limbs or cap meshes');
assert.equal(g.meshes[0].primitives.length,1);assert.equal(g.skins,undefined);assert.equal(primitive.targets,undefined);
const source=original.g.meshes[0].primitives[0],p=original.values(source.attributes.POSITION,3),uv=original.values(source.attributes.TEXCOORD_0,2),keys=new Set();
for(let i=0;i<p.length/3;i++)keys.add([p[i*3],p[i*3+1],p[i*3+2],uv[i*2],uv[i*2+1]].join(','));
const hp=hero.values(primitive.attributes.POSITION,3),huv=hero.values(primitive.attributes.TEXCOORD_0,2);
for(let i=0;i<hp.length/3;i++)assert.ok(keys.has([hp[i*3],hp[i*3+1],hp[i*3+2],huv[i*2],huv[i*2+1]].join(',')),'No new cut, repair or recolored vertex may be introduced');
assert.equal(createHash('sha256').update(fs.readFileSync(new URL(name+'-color.png',base))).digest('hex'),hash);
assert.equal(g.materials[0].pbrMetallicRoughness.baseColorTexture.index,0);
for(const image of g.images)assert.ok(fs.existsSync(new URL(image.uri,base)),name+' texture exists');
}
let min=Infinity,max=0;
for(let i=0;i<200;i++){const pose=jellyPose(i*.01,{moving:true});min=Math.min(min,pose.scaleY);max=Math.max(max,pose.scaleY);assert.ok(pose.y>=0);assert.ok(Math.abs(pose.scaleX*pose.scaleY*pose.scaleZ-1)<1e-10,'Squash/stretch must preserve volume');}
assert.ok(min<.72&&max>1.12,'Movement must visibly compress and rebound like the video');
let turn=-1;for(let i=0;i<80;i++){const pose=jellyPose(i*.01,{hurtAge:i*.01});assert.ok(pose.turn>=turn);turn=pose.turn;assert.ok(pose.y>=0&&pose.scaleY>.45);}
assert.ok(turn>Math.PI*1.99);assert.equal(jellyPose(1,{hurtAge:HURT_DURATION}).turn,0,'Hit must finish upright rather than keep spinning');
console.log('PASS: intact original geometry and paint, no cut/cap/skin, volume-preserving jelly movement and finite one-turn hit response.');
