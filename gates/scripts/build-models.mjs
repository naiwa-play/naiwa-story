import fs from 'node:fs/promises';
import * as T from '../vendor/three.module.min.js';
import { GLTFLoader } from '../vendor/loaders/GLTFLoader.js';
import { GLTFExporter } from './GLTFExporter.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(data => { this.result = data; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(data => { this.result = `data:${blob.type};base64,${Buffer.from(data).toString('base64')}`; this.onloadend?.(); }); }
};
globalThis.ProgressEvent ??= class { constructor(type, data) { Object.assign(this, data, { type }); } };
const out = new URL('../assets/models/', import.meta.url);
const yellow = new T.MeshStandardMaterial({ color: '#f5ce45', roughness: .49 });
const cream = new T.MeshStandardMaterial({ color: '#fff1c5', roughness: .7 });
const dark = new T.MeshStandardMaterial({ color: '#302b20', roughness: .62 });
const green = new T.MeshStandardMaterial({ color: '#8da35c', roughness: .38 });
const black = new T.MeshStandardMaterial({ color: '#101c14', roughness: .27 });
const pink = new T.MeshStandardMaterial({ color: '#db8565', roughness: .65 });
const white = new T.MeshStandardMaterial({ color: '#fffdf0', roughness: .3 });
const sphere = new T.SphereGeometry(1, 24, 18);
function ball(parent, name, material, position, scale) {
  const mesh = new T.Mesh(sphere, material); mesh.name = name;
  mesh.position.set(...position); mesh.scale.set(...scale); parent.add(mesh); return mesh;
}
function eye(parent, x, y, z, size = .14) {
  ball(parent, 'iris', green, [x,y,z], [size,size*1.12,size*.6]);
  ball(parent, 'pupil', black, [x,y,z+size*.48], [size*.56,size*.72,size*.34]);
  ball(parent, 'glint', white, [x-size*.2,y+size*.32,z+size*.7], [size*.17,size*.2,size*.12]);
}
function tube(parent, name, points, radius, material) {
  const mesh = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))), 24, radius, 7, false), material);
  mesh.name=name; parent.add(mesh); return mesh;
}
function group(parent,name,p) { const g=new T.Group();g.name=name;g.position.set(...p);parent.add(g);return g; }
function makePet(kind) {
  const root=new T.Group();root.name=kind; const body=group(root,`${kind}_body`,[0,0,0]);
  const legs=[];
  if(kind==='naigou') {
    ball(body,'round_body',yellow,[0,.76,-.12],[.46,.54,.79]);
    ball(body,'cream_chest',cream,[0,.76,.40],[.32,.37,.30]);
    ball(body,'head',yellow,[0,1.34,.48],[.44,.53,.39]);
    for(const x of [-.37,.37]) {const ear=ball(body,'floppy_ear',dark,[x,1.66,.43],[.21,.36,.10]);ear.rotation.z=-Math.sign(x)*.45;}
    ball(body,'happy_mouth',dark,[0,1.28,.822],[.25,.22,.046]);
    ball(body,'tongue',pink,[0,1.18,.867],[.14,.07,.018]);
    ball(body,'teeth',white,[0,1.405,.86],[.18,.036,.017]);
    for(const x of [-.18,.18])tube(body,'laugh_eye',[[x-.10,1.57,.801],[x,1.60,.82],[x+.10,1.57,.801]],.019,dark);
    for(const x of [-.29,.29])for(const z of [-.57,.38]){
      const leg=group(body,`leg_${legs.length}`,[x,.55,z]);ball(leg,'leg',yellow,[0,-.20,0],[.15,.32,.17]);ball(leg,'paw',dark,[0,-.44,.04],[.17,.09,.20]);legs.push(leg);
    }
    const tail=group(body,'tail',[0,.96,-.78]);tube(tail,'tail_curve',[[0,0,0],[.06,.24,-.13],[.03,.48,-.10],[-.04,.61,.04]],.079,yellow);
  } else if(kind==='naishu') {
    ball(body,'pear_body',yellow,[0,.77,0],[.53,.66,.40]);
    ball(body,'head',yellow,[0,1.30,.025],[.42,.40,.35]);
    for(const x of [-.47,.47]){
      ball(body,'big_ear',yellow,[x,1.64,.015],[.34,.39,.105]);
      ball(body,'inner_ear',new T.MeshStandardMaterial({color:'#eab651',roughness:.7}),[x,1.64,.092],[.265,.31,.04]);
      const leg=group(body,`leg_${legs.length}`,[x*.53,.27,0]);ball(leg,'foot',yellow,[0,-.14,.06],[.17,.15,.24]);legs.push(leg);
      const arm=ball(body,'arm',yellow,[x*.98,.90,.04],[.13,.32,.14]);arm.rotation.z=-Math.sign(x)*.35;
    }
    eye(body,-.175,1.36,.329,.135);eye(body,.175,1.36,.329,.135);
    tube(body,'smile',[[-.17,1.14,.363],[0,1.115,.392],[.17,1.14,.363]],.013,dark);
    const tail=group(body,'tail',[.19,.33,-.28]);tube(tail,'tail_curve',[[0,0,0],[.47,.06,-.28],[.68,.29,-.45],[.82,.23,-.51]],.027,yellow);
  } else {
    const geometry=sphere.clone();const p=geometry.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i),factor=1-.16*y;p.setXYZ(i,p.getX(i)*.59*factor,(y+1)*.70,p.getZ(i)*.47*factor);}geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,yellow);mesh.name='egg_body';body.add(mesh);
    for(const x of [-.17,.17]){
      ball(body,'iris',green,[x,1.00,.41],[.115,.115,.035]);
      ball(body,'pupil',black,[x,1.00,.440],[.057,.057,.018]);
      ball(body,'glint',white,[x-.014,1.021,.457],[.007,.007,.004]);
    }
    tube(body,'smile',[[-.14,.81,.458],[0,.78,.48],[.14,.81,.458]],.012,dark);
  }
  root.userData={kind,author:'Naiwa Expedition',reference:'User-provided character photographs',forward:'+Z'};
  const times=[0,.16,.32,.48,.64];const idleTimes=[0,.7,1.4];
  const tracks=[new T.VectorKeyframeTrack(`${body.name}.scale`,times,[1,1,1,1.055,.93,1.035,.97,1.055,.98,1.055,.93,1.035,1,1,1]),new T.VectorKeyframeTrack(`${body.name}.position`,times,[0,0,0,0,.055,0,0,.11,0,0,.055,0,0,0,0])];
  function rotationTrack(node,axis,angles){return new T.QuaternionKeyframeTrack(`${node.name}.quaternion`,times,angles.flatMap(a=>new T.Quaternion().setFromAxisAngle(axis,a).toArray()));}
  legs.forEach((leg,i)=>tracks.push(rotationTrack(leg,new T.Vector3(1,0,0),[0,i%2?.52:-.52,0,i%2?-.52:.52,0])));
  const tail=body.getObjectByName('tail');if(tail)tracks.push(rotationTrack(tail,new T.Vector3(0,0,1),[0,.22,0,-.22,0]));
  const idle=new T.AnimationClip('Idle',1.4,[new T.VectorKeyframeTrack(`${body.name}.scale`,idleTimes,[1,1,1,1.024,.977,1.024,1,1,1])]);
  return {root,animations:[idle,new T.AnimationClip('Run',.64,tracks)]};
}
// A vertex clustering pass keeps the source silhouette and vertex colours without a heavy runtime decoder.
function compactGeometry(source, step=.045) {
  const p=source.attributes.position,n=source.attributes.normal,c=source.attributes.color;
  const cells=new Map(),map=new Uint32Array(p.count),verts=[];
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v/step)).join(',');
    let index=cells.get(key);if(index===undefined){index=verts.length;cells.set(key,index);verts.push({p:[0,0,0],n:[0,0,0],c:[0,0,0],count:0});}
    const v=verts[index];v.count++;for(let a=0;a<3;a++){v.p[a]+=p.array[i*3+a];v.n[a]+=n?.array[i*3+a]??0;v.c[a]+=c?.array[i*3+a]??1;}map[i]=index;
  }
  const positions=[],normals=[],colors=[];
  for(const v of verts){positions.push(...v.p.map(x=>x/v.count));const normal=new T.Vector3(...v.n).normalize();normals.push(...normal);colors.push(...v.c.map(x=>x/v.count));}
  const indices=[],ind=source.index?.array??Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<ind.length;i+=3){const a=map[ind[i]],b=map[ind[i+1]],c=map[ind[i+2]];if(a!==b&&a!==c&&b!==c)indices.push(a,b,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
  if(c)g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);return g;
}
async function frog() {
  const data=await fs.readFile(new URL('naiwa-source.glb',out));
  const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
  const root=gltf.scene;root.name='naiwa';root.children[0].quaternion.identity();
  const runTracks=[];
  root.traverse(mesh=>{
    if(!mesh.isMesh)return;
    mesh.geometry=compactGeometry(mesh.geometry,mesh.name.includes('Body')?.045:.012);
    const p=mesh.geometry.attributes.position;
    // Slightly broaden the head while retaining the reference model's distinctive proportions.
    for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)*(1+T.MathUtils.smoothstep(y,3.6,4.6)*.13));}
    mesh.geometry.computeVertexNormals();
    if(mesh.name.includes('Body')){
      const targets=[new Float32Array(p.count*3),new Float32Array(p.count*3)];
      for(let i=0;i<p.count;i++){
        const x=p.getX(i),y=p.getY(i),side=x<0?-1:1;
        const leg=1-T.MathUtils.smoothstep(y,1.05,1.95);
        const arm=T.MathUtils.smoothstep(Math.abs(x),.85,1.35)*(1-T.MathUtils.smoothstep(Math.abs(y-2.8),.40,.9));
        targets.forEach((a,k)=>{const phase=side*(k?1:-1);a[i*3+1]=leg*(phase>0?.23:.01)+arm*phase*.09;a[i*3+2]=leg*phase*.45-arm*phase*.16;});
      }
      mesh.geometry.morphTargetsRelative=true;mesh.geometry.morphAttributes.position=targets.map(t=>new T.Float32BufferAttribute(t,3));mesh.updateMorphTargets();
      runTracks.push(new T.NumberKeyframeTrack(`${mesh.name}.morphTargetInfluences`,[0,.16,.32,.48,.64],[0,0,1,0,0,0,0,1,0,0]));
    }
    mesh.material.roughness=mesh.name.includes('Eye')?.36:.55;
  });
  const scale=.38;root.scale.setScalar(scale);
  runTracks.push(new T.VectorKeyframeTrack('naiwa.position',[0,.16,.32,.48,.64],[0,0,0,0,.035,0,0,.075,0,0,.035,0,0,0,0]));
  const idle=new T.AnimationClip('Idle',2.4,[new T.VectorKeyframeTrack('naiwa.scale',[0,1.2,2.4],[scale,scale,scale,scale*1.024,scale*.98,scale*1.024,scale,scale,scale])]);
  const run=new T.AnimationClip('Run',.64,runTracks);return{root,animations:[idle,run]};
}
const selected=process.argv.slice(2);for(const kind of selected.length?selected:['naiwa','naigou','naishu','naidan']){
  const {root,animations}=kind==='naiwa'?await frog():makePet(kind);
  const data=await new GLTFExporter().parseAsync(root,{binary:true,animations,onlyVisible:false});
  await fs.writeFile(new URL(`${kind}.glb`,out),Buffer.from(data));console.log(kind,data.byteLength,animations.map(a=>a.name));
}
