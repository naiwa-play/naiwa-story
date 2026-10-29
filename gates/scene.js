import * as T from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { mergeGeometries } from './vendor/utils/BufferGeometryUtils.js';
import { THEMES, MODES, bossFor, eliteFor, MINIONS, formation, clamp, gateText } from './core.js?v=16';
import {jellyPose,applyJellyPose} from './jelly-motion.js';
import {loadGameModel,MODEL_FILES} from './model-loader.js?v=19';

const sphere=new T.SphereGeometry(1,20,14), lowSphere=new T.SphereGeometry(1,12,9), box=new T.BoxGeometry(1,1,1),coinGeometry=new T.CylinderGeometry(.21,.21,.07,14);
const materials=new Map(),leafGeometries=new Map(),shadowGeometry=new T.PlaneGeometry(2,1.6);
function mat(color,roughness=.7,extra={}) { const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,...extra}));return materials.get(key); }
function mesh(geometry,material,parent,p=[0,0,0],s=[1,1,1]) {const m=new T.Mesh(geometry,material);m.position.set(...p);m.scale.set(...s);parent.add(m);return m;}
function ell(parent,color,p,s){return mesh(sphere,mat(color),parent,p,s);}
function label(text,sub='',color='#315b49',width=3.8,height=1.9,compact=false){
  const canvas=document.createElement('canvas');canvas.width=compact?256:640;canvas.height=compact?128:300;const c=canvas.getContext('2d');c.scale(canvas.width/640,canvas.height/300);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.font='650 118px system-ui';c.fillText(text,320,sub?110:145);
  if(sub){c.font='700 58px "Microsoft YaHei",sans-serif';c.fillText(sub,320,230);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthWrite:false}));sprite.scale.set(width,height,1);
  sprite.userData={canvas,c,texture,text,sub,color};return sprite;
}
function updateLabel(sprite,text){if(sprite.userData.text===text)return;const{c,texture,color}=sprite.userData;c.clearRect(0,0,640,300);c.fillStyle=color;c.font='650 104px system-ui';c.fillText(text,320,145,610);texture.needsUpdate=true;sprite.userData.text=text;}
let shadowTexture,shadowMaterial;
function shadow(parent,x=0,z=0,size=1){
  if(!shadowTexture){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,3,32,32,31);g.addColorStop(0,'#243d3660');g.addColorStop(1,'#243d3600');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);shadowTexture=new T.CanvasTexture(c);}
  shadowMaterial??=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});const m=mesh(shadowGeometry,shadowMaterial,parent,[x,.015,z],[size,size,1]);m.userData.sharedEnemy=true;m.rotation.x=-Math.PI/2;return m;
}
function leaf(parent,p,length,angle,color){
  if(!leafGeometries.has(length)){
  const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.26,length*.3,-.35,length*.72,0,length);shape.bezierCurveTo(.30,length*.7,.24,length*.2,0,0);
  leafGeometries.set(length,new T.ShapeGeometry(shape,8));}
  const m=mesh(leafGeometries.get(length),mat(color,.8,{side:T.DoubleSide}),parent,p);m.rotation.x=-1.02;m.rotation.z=angle;return m;
}
function consolidate(group){
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map();
  group.traverse(o=>{if(!o.isMesh)return;const material=o.material;if(!batches.has(material))batches.set(material,[]);batches.get(material).push(o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));});
  group.clear();for(const [material,geometries] of batches){const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());const m=new T.Mesh(geometry,material);m.userData.merged=true;group.add(m);}
}
function palm(){
  const g=new T.Group(),trunk=mesh(new T.CylinderGeometry(.12,.22,3.8,8),mat('#b99867'),g,[0,1.7,0]);trunk.rotation.z=-.12;
  const top=new T.Group();top.position.set(.22,3.6,0);g.add(top);
  for(let i=0;i<7;i++){const fan=new T.Group();fan.rotation.y=i*Math.PI*2/7;top.add(fan);leaf(fan,[0,0,0],2.1,0,i%2?'#639b75':'#467e62');}
  for(const x of [-.12,.17])ell(top,'#a88b56',[x,-.1,.09],[.20,.22,.20]);return g;
}
function tree(){
  const g=new T.Group();mesh(new T.CylinderGeometry(.18,.32,4.7,7),mat('#6e7357'),g,[0,2,0]);
  for(let i=0;i<4;i++)ell(g,['#6b9976','#86af85','#517d66','#9ab68a'][i],[(i%2-.5)*1.3,4+i*.22,(Math.floor(i/2)-.5)*1.2],[1.3+i*.13,.95,1.35]);
  return g;
}

function pumpkin(){
 const g=new T.Group();for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ell(g,i%2?'#dd873e':'#ef9a49',[Math.cos(a)*.23,.5,Math.sin(a)*.23],[.43,.49,.43]);}
 const stem=mesh(new T.CylinderGeometry(.07,.09,.28,7),mat('#798257'),g,[0,1,0]);stem.rotation.z=-.2;
 const shape=new T.Shape();shape.moveTo(-.12,0);shape.lineTo(.12,0);shape.lineTo(0,.18);shape.closePath();
 for(const x of [-.23,.23])mesh(new T.ShapeGeometry(shape),mat('#32253e',.5,{emissive:'#f4bc63',emissiveIntensity:.12,side:T.DoubleSide}),g,[x,.54,.58]);
 const mouth=mesh(new T.TorusGeometry(.23,.045,6,12,Math.PI),mat('#39263c'),g,[0,.42,.6]);mouth.rotation.z=Math.PI;return g;
}
function ghost(){
 const g=new T.Group(),profile=new T.CatmullRomCurve3([new T.Vector3(0,.92,0),new T.Vector3(.32,.85,0),new T.Vector3(.52,.55,0),new T.Vector3(.53,.1,0),new T.Vector3(.48,-.28,0),new T.Vector3(.45,-.58,0)]),points=profile.getPoints(24).map(p=>new T.Vector2(p.x,p.y)),geometry=new T.LatheGeometry(points,40);
 const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),lower=Math.max(0,(-y-.05)/.53);p.setXYZ(i,x+lower*lower*.17,y+Math.sin(Math.atan2(z,x)*3+.4)*lower*lower*.13,z);}geometry.computeVertexNormals();
 mesh(geometry,mat('#d5e0ed',.46,{transparent:true,opacity:.88,emissive:'#7c91b2',emissiveIntensity:.10,side:T.DoubleSide}),g);
 for(const x of [-.16,.16]){ell(g,'#344257',[x,.3,.57],[.07,.12,.035]);ell(g,'#e6f4fa',[x-.018,.34,.601],[.017,.025,.012]);}
 const smile=mesh(new T.TorusGeometry(.09,.018,6,12,Math.PI),mat('#75849a'),g,[0,.04,.56]);smile.rotation.z=Math.PI;
 return g;
}
function cobweb(){
 const g=new T.Group(),material=mat('#c6aecb',.8,{transparent:true,opacity:.45});
 function thread(a,b){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),m=mesh(new T.CylinderGeometry(.012,.012,v.length(),4),material,g,new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;thread([0,0,0],[Math.cos(a)*1.7,Math.sin(a)*1.7,0]);for(const r of [.45,.9,1.35])thread([Math.cos(a)*r,Math.sin(a)*r,0],[Math.cos(a+Math.PI/4)*r,Math.sin(a+Math.PI/4)*r,0]);}
 return g;
}


function bossEyes(g,y,z,spacing=.36){for(const x of [-spacing,spacing]){ell(g,'#fff5d8',[x,y,z],[.25,.29,.14]);ell(g,'#293844',[x,y,z+.12],[.10,.15,.045]);}}
function minionBody(kind,color){
 const g=new T.Group();
 if(kind==='pumpkinling'){const jack=pumpkin();jack.scale.setScalar(1.1);g.add(jack);for(const side of [-1,1])ell(g,'#6c7054',[side*.32,.07,.1],[.22,.10,.3]);}
 else if(kind==='skeletonling'){ell(g,'#e5dcc5',[0,.92,0],[.46,.5,.36]);ell(g,'#ded4bd',[0,.35,0],[.28,.4,.22]);for(const x of [-.17,.17])ell(g,'#46384d',[x,1.0,.32],[.12,.15,.05]);for(const x of [-.22,.22])mesh(new T.CylinderGeometry(.07,.09,.45,7),mat('#ded4bd'),g,[x,.12,.05]);for(let i=0;i<4;i++)mesh(box,mat('#9c8d8d'),g,[(i-1.5)*.12,.71,.34],[.035,.12,.025]);}
 else if(kind==='bat'){ell(g,'#80658f',[0,.65,0],[.38,.5,.3]);for(const side of [-1,1]){const wing=new T.Shape();wing.moveTo(0,0);wing.bezierCurveTo(side*.4,.5,side*.9,.48,side*1,.12);wing.lineTo(side*.72,-.05);wing.lineTo(side*.5,-.15);wing.lineTo(side*.25,-.2);wing.closePath();const m=mesh(new T.ShapeGeometry(wing),mat('#6b517f',.7,{side:T.DoubleSide}),g,[0,.65,0]);m.rotation.y=-side*.15;mesh(new T.ConeGeometry(.12,.28,6),mat('#9878a4'),g,[side*.23,1.1,0]);}bossEyes(g,.78,.27,.14);}
 else if(kind==='shell'){ell(g,'#a8a3c3',[0,.55,-.13],[.65,.62,.56]);const spiral=mesh(new T.TorusGeometry(.3,.065,7,18),mat('#d1bdc9'),g,[0,.67,.42]);spiral.rotation.z=.3;ell(g,'#839bb4',[0,.23,.35],[.56,.26,.45]);bossEyes(g,.55,.62,.2);}
 else if(kind==='sprout'){ell(g,'#92ab79',[0,.6,0],[.52,.65,.43]);for(const side of [-1,1]){const leaf=ell(g,'#6e9164',[side*.25,1.25,0],[.32,.15,.17]);leaf.rotation.z=side*.5;ell(g,'#677b53',[side*.32,.10,.1],[.22,.12,.3]);}bossEyes(g,.75,.38,.19);}
 else if(kind==='flyer'){const spirit=ghost();spirit.scale.setScalar(.78);spirit.position.y=.7;g.add(spirit);}
 else if(kind==='tank'){ell(g,'#8d8eaa',[0,.55,0],[.77,.56,.6]);mesh(box,mat('#b0b6c0'),g,[0,.66,.46],[1,.8,.18]);for(const side of [-1,1])ell(g,'#6c728b',[side*.52,.1,.15],[.28,.13,.35]);bossEyes(g,.8,.58,.23);}
 else if(kind==='runner'){ell(g,color,[0,.65,0],[.4,.7,.38]);for(const side of [-1,1]){const horn=mesh(new T.ConeGeometry(.1,.5,6),mat('#d8c99a'),g,[side*.26,1.3,0]);horn.rotation.z=-side*.22;ell(g,color,[side*.32,.1,.24],[.27,.12,.42]);}bossEyes(g,.85,.34,.16);}
 else{ell(g,color,[0,.65,0],[.65,.68,.52]);ell(g,'#c5b8c9',[0,.5,.43],[.4,.32,.16]);bossEyes(g,.86,.47,.22);for(const side of [-1,1])ell(g,color,[side*.38,.1,.1],[.27,.13,.33]);}
 return g;
}

function bossBody(id){
 const g=new T.Group();
 if(id==='elite'){const unit=minionBody('blob','#827797');unit.scale.setScalar(2);g.add(unit);for(let i=0;i<3;i++)mesh(new T.ConeGeometry(.16,.4,6),mat('#dfbd70'),g,[(i-1)*.36,2.8,0]);}
 else if(id==='crab'){
  ell(g,'#68b5bf',[0,1.2,0],[1.55,.9,1.05]);ell(g,'#a7d8d6',[0,1.25,-.4],[1.25,1.25,.9]);
  for(const side of [-1,1]){for(let i=0;i<3;i++){const leg=mesh(new T.CylinderGeometry(.09,.13,1.4,7),mat('#6a9fae'),g,[side*(1.25+i*.12),.6,(i-1)*.55]);leg.rotation.z=side*.9;}
   ell(g,'#81cad0',[side*1.9,1.25,.65],[.62,.44,.5]);for(const z of [.4,.9]){const claw=mesh(new T.ConeGeometry(.25,.7,7),mat('#b7e1d6'),g,[side*2.15,1.48,z]);claw.rotation.z=-side*.8;}
   mesh(new T.CylinderGeometry(.07,.09,.7,7),mat('#72bbc0'),g,[side*.5,2,.65]);}
  bossEyes(g,2.35,.7,.5);
 }else if(id==='jellyfish'){
  const bell=mesh(new T.SphereGeometry(1.5,24,14,0,Math.PI*2,0,Math.PI*.59),mat('#9fbfe3',.25,{transparent:true,opacity:.86,emissive:'#809cce',emissiveIntensity:.15}),g,[0,2.35,0],[1,.88,1]);
  const rim=mesh(new T.TorusGeometry(1.42,.12,8,28),mat('#c9d3ec'),g,[0,1.93,0]);rim.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4,len=1.3+(i%3)*.2,t=mesh(new T.CylinderGeometry(.055,.1,len,6),mat(i%2?'#bda8dd':'#89bbd5'),g,[Math.cos(a)*.85,1.9-len/2,Math.sin(a)*.85]);t.rotation.z=Math.sin(a)*.2;}bossEyes(g,2.4,1.3,.4);
 }else if(id==='treant'){
  mesh(new T.CylinderGeometry(.66,1,2.6,10),mat('#8d7960'),g,[0,1.4,0]);for(const side of [-1,1]){const arm=mesh(new T.CylinderGeometry(.18,.28,1.7,8),mat('#8d7960'),g,[side*1.1,1.9,0]);arm.rotation.z=side*.8;ell(g,'#638867',[side*1.1,3.05,0],[.95,.8,.9]);ell(g,'#6e8257',[side*.7,.22,.2],[.6,.22,.6]);}
  ell(g,'#91ad70',[0,3.2,-.1],[1.4,.9,1.1]);bossEyes(g,1.85,.72,.34);ell(g,'#574c47',[0,1.25,.84],[.26,.12,.04]);
 }else if(id==='mushroom'){
  mesh(new T.CylinderGeometry(.65,.95,2.5,14),mat('#e2d8b1'),g,[0,1.3,0]);mesh(new T.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI*.6),mat('#b47c9d'),g,[0,2.65,0],[1.85,1.05,1.6]);for(const [x,y,z] of [[-.7,3.28,.7],[.6,3.38,.6],[0,3.6,0],[-1.3,2.96,.4],[1.2,3,.5]])ell(g,'#eedec9',[x,y,z],[.23,.10,.2]);bossEyes(g,1.6,.76,.34);
 }else if(id==='witch'){
  const robe=mesh(new T.ConeGeometry(1.2,2.3,10),mat('#645076'),g,[0,1.4,-.25]);const jack=pumpkin();jack.scale.setScalar(1.65);jack.position.set(0,.5,.2);g.add(jack);
  mesh(new T.CylinderGeometry(1.18,1.2,.12,20),mat('#463752'),g,[0,2.48,0]);const hat=mesh(new T.ConeGeometry(.95,1.7,16),mat('#51405f'),g,[0,3.25,0]);hat.rotation.z=-.15;mesh(new T.CylinderGeometry(.68,.83,.17,16),mat('#d8a16b'),g,[0,2.7,0]);mesh(new T.CylinderGeometry(.07,.09,2.6,7),mat('#7a5964'),g,[1.8,1.5,.2]);ell(g,'#b799de',[1.8,2.9,.2],[.29,.35,.29]);
 }else if(id==='skeleton'){
  ell(g,'#e8dfc7',[0,1.4,0],[.66,.92,.43]);for(let i=0;i<4;i++)mesh(box,mat('#988c86'),g,[0,1+i*.27,.43],[.9,.055,.04]);
  ell(g,'#f0e4cc',[0,2.85,0],[.88,.95,.72]);for(const x of [-.32,.32]){ell(g,'#493e52',[x,3,.64],[.24,.29,.09]);ell(g,'#e4879d',[x,3,.72],[.075,.10,.025]);}
  ell(g,'#4b4050',[0,2.69,.71],[.1,.14,.03]);for(let i=0;i<6;i++)mesh(box,mat('#c1b7a5'),g,[(i-2.5)*.14,2.38,.67],[.06,.2,.1]);
  for(const side of [-1,1]){const arm=mesh(new T.CylinderGeometry(.12,.15,1.5,8),mat('#e2d9c3'),g,[side*.95,1.5,0]);arm.rotation.z=-side*.35;mesh(new T.CylinderGeometry(.13,.17,.85,8),mat('#e2d9c3'),g,[side*.44,.45,.1]);}
  mesh(new T.CylinderGeometry(.7,.73,.15,16),mat('#cfad68'),g,[0,3.6,0]);for(let i=0;i<3;i++)mesh(new T.ConeGeometry(.17,.5,6),mat('#dfbd70'),g,[(i-1)*.43,3.87,0]);mesh(box,mat('#acb7b8'),g,[1.5,1.5,.25],[.25,1.8,.07]);mesh(box,mat('#9f8263'),g,[1.5,.8,.25],[.7,.12,.15]);
 }
 return g;
}

export class ExpeditionScene {
  constructor(canvas,onProgress){
    this.canvas=canvas;this.scene=new T.Scene();this.theme='coast';this.time=0;this.home=true;
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
    this.camera=new T.PerspectiveCamera(43,1,.1,180);this.clock=new T.Clock();this.target=new T.Vector3();this.tmp=new T.Object3D();
    this.scene.add(new T.HemisphereLight('#fff8df','#649e87',2.55));
    const sun=new T.DirectionalLight('#fff4d6',3.0);sun.position.set(-14,24,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=23;sun.shadow.camera.bottom=-23;sun.shadow.normalBias=.04;sun.shadow.bias=-.0005;this.scene.add(sun);
    this.environment=new T.Group();this.scene.add(this.environment);this.decor=[];this.clouds=[];
    this.road=mesh(new T.BoxGeometry(10.8,.32,180),mat('#ffedc7'),this.environment,[0,-.17,-64]);this.road.receiveShadow=true;
    this.edges=[];for(const x of [-5.38,5.38])this.edges.push(mesh(new T.BoxGeometry(.16,.10,180),mat('#f4c46c'),this.environment,[x,.03,-64]));
    this.dashes=[];for(let i=0;i<27;i++)for(const x of [-4.85,4.85])this.dashes.push(mesh(new T.BoxGeometry(.09,.012,1.35),mat('#fff8de'),this.environment,[x,.006,8-i*6]));
    this.water=mesh(new T.PlaneGeometry(240,240,36,36),mat('#63c5bc',.4),this.environment,[0,-.48,-60]);this.water.rotation.x=-Math.PI/2;
    this.platform=mesh(new T.CylinderGeometry(3.6,3.85,.18,64),mat('#f4e7bf'),this.scene,[3,-.015,1]);this.platform.receiveShadow=true;
    this.hero=new T.Group();this.scene.add(this.hero);this.heroBody=new T.Group();this.hero.add(this.heroBody);shadow(this.hero,0,0,1.0);
    this.modeAura=mesh(new T.RingGeometry(1.1,1.21,56),new T.MeshBasicMaterial({color:'#e5c66e',transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}),this.hero,[0,.07,0]);this.modeAura.rotation.x=-Math.PI/2;this.modeAura.visible=false;
    this.modeShield=mesh(sphere,new T.MeshBasicMaterial({color:'#ffe5a0',transparent:true,opacity:.14,depthWrite:false}),this.hero,[0,1,0],[.95,1.25,.8]);this.modeShield.visible=false;
    this.rangeMarker=mesh(box,mat('#f2db9d',.8,{transparent:true,opacity:.65}),this.scene,[0,.025,-17],[9,.02,.06]);this.rangeMarker.visible=false;
    this.petRoots=[];this.rows=[];this.entities=[];this.coins=[];this.potions=[];this.rewards=[];this.beams=[];this.distance=0;this.hurtAge=Infinity;this.strideMix=0;
    this.buildCrowd();this.buildProjectiles();this.buildParticles();this.rebuildScenery('coast');this.resize();
    this.ready=this.load(onProgress);
  }
  async load(progress){
    const names=['naiwa','naidan','naiwa-crowd'],loaded=new Map(names.map(name=>[name,0])),total=names.reduce((sum,name)=>sum+MODEL_FILES[name].bytes,0);
    const assets=await Promise.all(names.map(async name=>loadGameModel(new GLTFLoader(),name,event=>{
      loaded.set(name,Math.min(MODEL_FILES[name].bytes,event.phase==='decode'?MODEL_FILES[name].bytes:event.loaded));
      const percent=Math.min(99,Math.round([...loaded.values()].reduce((sum,value)=>sum+value,0)/total*100)),size=(event.loaded/1024**2).toFixed(1),expected=((event.total||event.expected)/1024**2).toFixed(1);
      progress(percent,100,event.phase==='decode'?'正在唤醒'+event.label+' · 准备画面':event.phase==='fallback'?'正在为当前浏览器加载兼容模型':'正在唤醒'+event.label+' · '+size+' / '+expected+' MB'+(event.attempt?' · 正在重试':''));
    })));
    this.models=Object.fromEntries(names.map((n,i)=>[n,assets[i]]));
    const paint=this.models.naiwa.scene.getObjectByProperty('isMesh',true).material;this.models['naiwa-crowd'].scene.traverse(object=>{if(object.isMesh)object.material=paint;});
    this.buildCrowdAsset(this.models['naiwa-crowd'].scene);
    this.buildProjectileAsset(this.models.naidan.scene);
    this.buildProjectileAsset(pumpkin(),'pumpkinParts');
    this.main=this.models.naiwa.scene;this.heroBody.add(this.main);
    this.staff=new T.Group();this.heroBody.add(this.staff);this.staff.position.set(-.6,.25,.05);mesh(new T.CylinderGeometry(.045,.065,1.3,8),mat('#715461'),this.staff,[0,.65,0]);const jack=pumpkin();jack.scale.setScalar(.28);jack.position.y=1.45;this.staff.add(jack);this.staff.visible=false;
    const egg=this.models.naidan.scene;egg.scale.setScalar(.38);this.eggHome=new T.Group();this.eggHome.add(egg);this.hero.add(this.eggHome);
    this.setMode(true);progress(100,100,'伙伴准备好了');this.petLoads={};this.petProgress={};for(const name of ['naigou','naishu'])this.preparePet(name).catch(()=>{});return this;
  }
  preparePet(name,onProgress){
    if(this.models[name])return Promise.resolve();if(onProgress)this.petProgress[name]=onProgress;if(this.petLoads[name])return this.petLoads[name];
    this.petLoads[name]=(async()=>{
      const asset=await loadGameModel(new GLTFLoader(),name,event=>this.petProgress[name]?.(event));
      for(let i=0;i<3;i++){const root=new T.Group(),motion=new T.Group();this.hero.add(root);shadow(root,0,0,.48);root.add(motion);motion.add(asset.scene.clone(true));root.userData={motion,name,index:i};root.scale.setScalar(.60);root.visible=false;if(name==='naishu'){const orb=ell(motion,'#dff4aa',[0,.6,.58],[.12,.12,.12]);orb.material=mat('#dff4aa',.3,{emissive:'#9cd998',emissiveIntensity:.6});root.userData.orb=orb;}this.petRoots.push(root);}
      this.models[name]=asset;
    })().finally(()=>{delete this.petLoads[name];delete this.petProgress[name];});return this.petLoads[name];
  }
  hurt(){this.hurtAge=0;}
  buildCrowd(){
    this.crowd=new T.Group();this.scene.add(this.crowd);this.crowdParts=[];
  }
  buildCrowdAsset(asset){
    asset.updateMatrixWorld(true);
    asset.traverse(source=>{
      if(!source.isMesh)return;
      const geometry=source.geometry.clone().applyMatrix4(source.matrixWorld),material=source.material.clone();
      // Whole characters share one instanced draw; no limb or vertex deformation.
      const m=new T.InstancedMesh(geometry,material,64);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.count=0;m.frustumCulled=false;this.crowd.add(m);this.crowdParts.push({mesh:m});
    });
  }
  updateCrowd(state,time){
    const points=formation(state.count);this.crowd.position.set(state.x,0,5.8);this.crowd.visible=!this.home;
    this.crowdParts.forEach(({mesh:m})=>{
      m.count=Math.max(0,points.length-1);
      for(let i=1;i<points.length;i++){
        const f=points[i],pose=jellyPose(time,{moving:this.strideMix,phase:i*.17,hurtAge:this.hurtAge});
        this.tmp.position.set(f.x,pose.y*.52,f.z);
        this.tmp.rotation.set(0,Math.PI+pose.turn,0);this.tmp.scale.set(.52*pose.scaleX,.52*pose.scaleY,.52*pose.scaleZ);
        this.tmp.updateMatrix();m.setMatrixAt(i-1,this.tmp.matrix);
      }m.instanceMatrix.needsUpdate=true;
    });
  }
  buildProjectiles(){
    this.shots=[];this.shotParts=[];this.pumpkinParts=[];this.pumpkinColor=new T.Color('#ff8a3b');this.projectileWhite=new T.Color('#ffffff');this.projectileRed=new T.Color('#ff708b');
    this.shotTrail=new T.InstancedMesh(new T.ConeGeometry(.14,1,6),new T.MeshBasicMaterial({color:'#fff2b9',transparent:true,opacity:.55,depthWrite:false,toneMapped:false}),160);
    this.pumpkinFlame=new T.InstancedMesh(new T.ConeGeometry(.18,.55,9),new T.MeshBasicMaterial({color:'#ffd16a',transparent:true,opacity:.85,depthWrite:false,toneMapped:false}),160);this.pumpkinFlame.instanceMatrix.setUsage(T.DynamicDrawUsage);this.pumpkinFlame.count=0;this.pumpkinFlame.frustumCulled=false;this.scene.add(this.pumpkinFlame);
    this.shotTrail.instanceMatrix.setUsage(T.DynamicDrawUsage);this.shotTrail.count=0;this.shotTrail.frustumCulled=false;this.scene.add(this.shotTrail);
  }
  buildProjectileAsset(asset,destination='shotParts'){
    // Reuse the complete approved egg, including its green eyes and smile.
    asset.updateMatrixWorld(true);const center=new T.Box3().setFromObject(asset).getCenter(new T.Vector3()),batches=new Map();
    asset.traverse(o=>{if(!o.isMesh)return;if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(o.geometry.clone().applyMatrix4(o.matrixWorld).translate(0,-center.y,0));});
    for(const [source,geometries] of batches){const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());const material=source.clone();material.emissive.copy(material.color).multiplyScalar(.16);const m=new T.InstancedMesh(geometry,material,160);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.count=0;m.frustumCulled=false;geometry.computeBoundingBox();m.userData.tintBody=geometry.boundingBox.max.y-geometry.boundingBox.min.y>1;this.scene.add(m);this[destination].push(m);}
  }
  drawShots(){
    let eggs=0,pumpkins=0;this.shotTrail.count=this.shots.length;
    this.shots.forEach((b,i)=>{
      const jack=b.kind==='pumpkin',big=b.kind==='bomb'||jack,size=(big?.72:b.kind==='milkball'?.60:.56)*(b.size||1),angle=b.angle||0;
      const y=.9+(big?Math.sin(Math.PI*Math.min(1,(b.travel||0)/b.range))*2.2:0),parts=jack?this.pumpkinParts:this.shotParts,index=jack?pumpkins++:eggs++;
      this.tmp.position.set(b.x,y,b.z);this.tmp.rotation.set(0,-angle,Math.sin(b.life*10)*.09);this.tmp.scale.setScalar(size);this.tmp.updateMatrix();
      for(const m of parts){m.setMatrixAt(index,this.tmp.matrix);m.setColorAt(index,b.kind==='companion'&&m.userData.tintBody?this.projectileRed:this.projectileWhite);}
      if(jack){this.tmp.position.set(b.x,y+.55*size,b.z);this.tmp.rotation.set(0,0,Math.sin(b.life*18)*.15);this.tmp.scale.set(size,size*(1+Math.sin(b.life*16)*.12),size);this.tmp.updateMatrix();this.pumpkinFlame.setMatrixAt(index,this.tmp.matrix);}
      this.tmp.position.set(b.x-Math.sin(angle)*.52,y,b.z+Math.cos(angle)*.52);this.tmp.rotation.set(Math.PI/2,0,angle);this.tmp.scale.set(1,1.1,1);this.tmp.updateMatrix();this.shotTrail.setMatrixAt(i,this.tmp.matrix);this.shotTrail.setColorAt(i,jack?this.pumpkinColor:b.kind==='companion'?this.projectileRed:this.projectileWhite);
    });
    this.pumpkinFlame.count=pumpkins;this.pumpkinFlame.instanceMatrix.needsUpdate=true;
    for(const m of this.shotParts)m.count=eggs;for(const m of this.pumpkinParts)m.count=pumpkins;
    for(const m of [...this.shotParts,...this.pumpkinParts,this.shotTrail]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  }
  shoot(x,z,damage,pet=false,target=null,kind='egg',range=22,angle=0,size=1){if(this.shots.length>=155)return;this.shots.push({x,y:.9,z,damage,pet,target,kind,range,angle,size,radius:(kind==='bomb'||kind==='pumpkin'?.36:.28)*size,travel:0,life:0,previousZ:z});}
  beam(x,z,range,angle=0,width=.2){const m=mesh(new T.BoxGeometry(width,.12,range),new T.MeshBasicMaterial({color:'#edffd3',transparent:true,opacity:.88,depthWrite:false,toneMapped:false}),this.scene,[x+Math.sin(angle)*range/2,.95,z-Math.cos(angle)*range/2]);m.rotation.y=-angle;this.beams.push({mesh:m,age:0});}
  setWeapon(weapon){if(this.staff)this.staff.visible=weapon==='pumpkin';}
  petLunge(index,target){const pet=this.petRoots.find(p=>p.userData.name==='naigou'&&p.userData.index===index);if(pet)pet.userData.attack={age:0,toX:target.x-this.hero.position.x,toZ:target.z-this.hero.position.z};}
  chargeMouse(index){const pet=this.petRoots.find(p=>p.userData.name==='naishu'&&p.userData.index===index);if(pet)pet.userData.charge=0;}
  dropCoins(x,z,value=1){const n=Math.min(5,Math.ceil(value));for(let i=0;i<n;i++){const coin=mesh(coinGeometry,mat('#f0c96a',.3,{metalness:.5,emissive:'#b57c28',emissiveIntensity:.2}),this.scene,[x+(i-(n-1)/2)*.32,.6,z]);coin.rotation.x=Math.PI/2;this.coins.push({group:coin,at:this.distance+5-z,value:Math.floor(value/n)+(i<value%n?1:0)});}}
  clearCoins(){for(const c of this.coins)this.scene.remove(c.group);for(const p of this.potions){this.scene.remove(p.group);p.group.traverse(o=>{if(o.isMesh&&o.geometry!==box)o.geometry.dispose();});}this.coins=[];this.potions=[];for(const r of this.rewards){this.scene.remove(r.sprite);r.sprite.material.map.dispose();r.sprite.material.dispose();}this.rewards=[];}
  dropPotion(x,z){const g=new T.Group();this.scene.add(g);g.position.set(x,.25,z);mesh(new T.CylinderGeometry(.22,.17,.42,12),mat('#e77482',.25,{transparent:true,opacity:.85,emissive:'#a13455',emissiveIntensity:.2}),g,[0,.22,0]);mesh(new T.CylinderGeometry(.09,.09,.18,10),mat('#f4d3d0',.15,{transparent:true,opacity:.7}),g,[0,.49,0]);mesh(new T.CylinderGeometry(.11,.11,.08,10),mat('#d6b37a'),g,[0,.6,0]);mesh(box,mat('#fff4db'),g,[0,.24,.21],[.19,.07,.025]);mesh(box,mat('#fff4db'),g,[0,.24,.212],[.07,.19,.025]);this.potions.push({group:g,at:this.distance+5-z,heal:2});}
  collectPotions(x,distance,dt,health,max){let amount=0;this.potions=this.potions.filter((p,i)=>{p.group.position.z=5-(p.at-distance);p.group.position.y=.23+Math.sin(this.time*3+i)*.08;const dz=p.group.position.z-5;if(Math.abs(dz)<2&&Math.abs(p.group.position.x-x)<1.3&&health+amount<max){amount+=Math.min(p.heal,max-health-amount);this.scene.remove(p.group);p.group.traverse(o=>{if(o.isMesh&&o.geometry!==box)o.geometry.dispose();});return false;}if(dz>7){this.scene.remove(p.group);p.group.traverse(o=>{if(o.isMesh&&o.geometry!==box)o.geometry.dispose();});return false;}return true;});return amount;}
  rewardText(x,z,text){if(this.rewards.length>=12)return;const sprite=label(text,'','#ffeaa7',4,.8),{c,texture}=sprite.userData;c.clearRect(0,0,640,300);c.font='600 46px "Microsoft YaHei",sans-serif';c.fillText(text,320,145,610);texture.needsUpdate=true;sprite.position.set(x,1.9,z);this.scene.add(sprite);this.rewards.push({sprite,age:0});}
  collectCoins(x,distance,dt){let value=0;this.coins=this.coins.filter((c,i)=>{c.group.position.z=5-(c.at-distance);c.group.position.y=.55+Math.sin(this.time*4+i)*.1;c.group.rotation.z+=dt*2;const dz=c.group.position.z-5,dx=c.group.position.x-x;if(Math.abs(dz)<2.4&&Math.abs(dx)<1.5){value+=c.value;this.scene.remove(c.group);return false;}if(dz>7){this.scene.remove(c.group);return false;}return true;});return value;}
  buildParticles(){this.particles=[];this.particleMesh=new T.InstancedMesh(new T.SphereGeometry(1,6,5),mat('#fff6c2'),200);this.particleMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.particleMesh.frustumCulled=false;this.particleMesh.count=0;this.scene.add(this.particleMesh);this.rings=[];}
  burst(x,y,z,color='#f8d45e',n=18){for(let i=0;i<n&&this.particles.length<195;i++){const a=Math.random()*Math.PI*2,s=Math.random()*2+1;this.particles.push({x,y,z,vx:Math.cos(a)*s,vy:Math.random()*3+1,vz:Math.sin(a)*s,life:.5+Math.random()*.5,max:1,color:new T.Color(color),size:.055+Math.random()*.06});}}
  ring(x,z,color='#f5d365',radius=.6){if(this.rings.length>=24)return;const r=mesh(new T.RingGeometry(radius,radius+.08,48),new T.MeshBasicMaterial({color,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}),this.scene,[x,.08,z]);r.rotation.x=-Math.PI/2;r.userData.life=0;this.rings.push(r);}
  updateParticles(dt){
    this.particles=this.particles.filter(p=>{p.life-=dt;if(p.life<=0)return false;p.vy-=6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;return true;});this.particleMesh.count=this.particles.length;
    this.particles.forEach((p,i)=>{this.tmp.position.set(p.x,Math.max(.03,p.y),p.z);this.tmp.rotation.set(0,0,0);this.tmp.scale.setScalar(p.size*Math.min(1,p.life*3));this.tmp.updateMatrix();this.particleMesh.setMatrixAt(i,this.tmp.matrix);this.particleMesh.setColorAt(i,p.color);});this.particleMesh.instanceMatrix.needsUpdate=true;if(this.particleMesh.instanceColor)this.particleMesh.instanceColor.needsUpdate=true;
    this.rings=this.rings.filter(r=>{r.userData.life+=dt;r.scale.setScalar(1+r.userData.life*4);r.material.opacity=Math.max(0,.7-r.userData.life);if(r.userData.life>.75){this.scene.remove(r);r.geometry.dispose();r.material.dispose();return false;}return true;});
  }
  rebuildScenery(theme){
    for(const d of this.decor){d.traverse(o=>{if(o.userData.merged)o.geometry.dispose();});this.environment.remove(d);}this.decor=[];const data=THEMES[theme];this.theme=theme;
    this.scene.background=new T.Color(data.sky);this.scene.fog=new T.Fog(data.sky,theme==='halloween'?30:45,120);this.water.material=mat(data.ground,.42);this.road.material=mat(data.road);this.edges.forEach(e=>e.material=mat(data.edge));
    for(let i=0;i<26;i++){
      const g=new T.Group(),side=i%2?-1:1;g.position.set(side*(7.1+((i*13)%17)*.4),-.15,10-i*5.4);g.userData.baseZ=g.position.z;
      const island=ell(g,theme==='halloween'?'#493451':theme==='coast'?'#efd7a3':'#71956e',[0,-.25,0],[2.8,.4,3.3]);island.receiveShadow=true;
      const plant=theme==='halloween'?pumpkin():theme==='coast'?palm():tree();plant.scale.setScalar(.75+(i%4)*.16);g.add(plant);g.userData.plant=plant;
      for(let j=0;j<3;j++)ell(g,theme==='coast'?'#f5e5bc':'#90aa78',[(j-1)*.7,.11,.7+j*.3],[.25,.15,.32]);
      if(theme==='forest')for(let j=0;j<4;j++){const fern=new T.Group();fern.position.set((j-2)*.8,0,.7);for(let k=0;k<5;k++){const fan=new T.Group();fan.rotation.y=k*Math.PI*2/5;fern.add(fan);leaf(fan,[0,0,0],.7,.3,'#a3bc7e');}g.add(fern);}
      if(theme==='halloween'){const web=cobweb();web.position.set(.4,2,-.5);web.rotation.y=side*.3;g.add(web);ell(g,'#35263f',[.6,1.2,-.45],[.15,.2,.15]);for(let k=0;k<4;k++)for(const s of [-1,1]){const leg=mesh(box,mat('#32213e'),g,[.6+s*.22,1.16+k*.05,-.45],[.43,.025,.025]);leg.rotation.z=s*(k-1.5)*.3;}}
      g.remove(plant);consolidate(g);consolidate(plant);g.add(plant);if(theme==='halloween'&&i%3===0){const spirit=ghost();spirit.position.set(.8,2.7,0);g.add(spirit);g.userData.ghost=spirit;}this.environment.add(g);this.decor.push(g);
    }
    if(!this.moon){this.moon=ell(this.environment,'#e7d8ec',[20,19,-65],[5,5,1]);this.moon.material=mat('#d9bfe7',1,{emissive:'#9b82bd',emissiveIntensity:.5});}this.moon.visible=theme==='halloween';
    this.clouds.forEach(c=>c.visible=theme!=='halloween');
    if(!this.clouds.length)for(let i=0;i<8;i++){const cloud=new T.Group();for(let j=0;j<3;j++)ell(cloud,'#eaf4e6',[(j-1)*1.2,j===1?.3:0,0],[1.6,.48,.7]);cloud.position.set((i%2?-1:1)*(10+i*2),10+i%3*2,-30-i*11);this.environment.add(cloud);this.clouds.push(cloud);}
  }
  setMode(home){this.hurtAge=Infinity;for(const p of this.petRoots){p.userData.attack=null;p.userData.charge=0;}this.home=home;this.platform.visible=home;this.crowd.visible=!home;if(this.eggHome)this.eggHome.visible=home;this.hero.scale.setScalar(home?2.2:1);this.hero.position.set(home?3:0,0,home?1:5);if(this.main)this.main.rotation.y=home?.38:Math.PI;
    if(home){this.clearCourse();this.shots=[];this.drawShots();}this.resize();}
  resize(){const w=innerWidth,h=innerHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.fov=w<700?48:43;this.camera.updateProjectionMatrix();if(this.home){this.hero.scale.setScalar(w<700?1.65:2.2);this.camera.position.set(w<700?7:10,w<700?6.4:7.5,w<700?15:16);this.camera.lookAt(w<700?2.4:-1.7,w<700?-2.1:.9,0);}else{this.camera.position.set(0,w<700?18:16.5,w<700?27:24);this.camera.lookAt(0,0,w<700?-12:-12);}}
  clearCourse(){this.pruneCourse(Infinity);this.rows=[];this.entities=[];if(this.enemyShadows)this.enemyShadows.count=0;for(const batch of this.enemyBatches?.values()||[])for(const part of batch)part.count=0;}
  createCourse(course,append=false){if(!append)this.clearCourse();for(const row of course){const group=new T.Group();group.position.z=5-row.at;this.scene.add(group);row.group=group;this.rows.push(row);
    if(row.type==='gate')row.options.forEach((g,i)=>{
      const frame=new T.Group();frame.position.x=i===0?-2.55:2.55;group.add(frame);const color=g.stat==='count'?'#76b89e':g.stat==='rate'?'#d1b15f':'#7eacd0';
      const pane=mesh(new T.PlaneGeometry(4.4,2.7),new T.MeshStandardMaterial({color,transparent:true,opacity:.30,side:T.DoubleSide,depthWrite:false}),frame,[0,1.65,0]);pane.userData.disposable=true;
      for(const x of [-2.25,2.25])mesh(new T.CylinderGeometry(.075,.075,3.05,8),mat(color),frame,[x,1.5,0]);mesh(box,mat(color),frame,[0,3.0,0],[4.6,.11,.12]);
      const text=gateText(g),sprite=label(text.value,text.label,this.theme==='halloween'?'#fff3d2':g.stat==='count'?'#234f37':g.stat==='rate'?'#654615':'#234c70',4.2,2.1);sprite.position.y=1.85;frame.add(sprite);
      mesh(box,mat(color,.5,{transparent:true,opacity:.55}),frame,[0,.015,0],[4.4,.025,1.7]);
    });else if(row.type==='card'){
      const marker=label('✦','成长卡牌','#9a78b9',3.1,1.7);marker.position.y=1.4;group.add(marker);mesh(box,mat('#b28bc2',.5,{emissive:'#9869b7',emissiveIntensity:.2}),group,[0,.03,0],[3.6,.06,.7]);
    }else if(row.type==='coins'){for(const x of row.positions)this.dropCoins(x,5-(row.at-this.distance),1);
    }else if(row.type==='potion'){for(const x of row.positions)this.dropPotion(x,5-(row.at-this.distance));
    }else row.pendingEnemies=[...row.enemies];
  }}
  makeEnemy(type,definition,row,index){
    const g=new T.Group(),body=new T.Group();g.add(body);g.position.set(definition.x,0,definition.z||0);const boss=type==='boss',crate=type==='crate',size=boss?2:crate?1:.72;
    const bossSpec=boss?(row.major?bossFor(this.theme,Math.floor(((row.stage||0)+1)/3)):eliteFor(this.theme)):null;
    const kind=definition.kind||'blob',role=MINIONS[kind]||MINIONS.blob;
    this.enemyBodies??=new Map();const key=boss?'boss:'+bossSpec.id:crate?'crate':this.theme+':'+kind;
    if(!this.enemyBodies.has(key)){
      const template=new T.Group();
      if(boss)template.add(bossBody(bossSpec.id));else if(crate)mesh(box,mat('#a9ad94'),template,[0,.9,0],[1.65,1.8,1.1]);else template.add(minionBody(kind,THEMES[this.theme].enemy));
      consolidate(template);template.traverse(o=>{if(o.isMesh)o.userData.sharedEnemy=true;});this.enemyBodies.set(key,template);
    }
    if(boss&&!row.major)body.scale.setScalar(.82);
    const shade=shadow(g,0,0,size);body.visible=false;shade.visible=false;
    const hp=label(String(Math.ceil(definition.hp)),crate?'金币补给':'',this.theme==='halloween'?'#ffefd0':'#4d4967',boss?3.5:2.1,boss?1.4:1.05,!boss);hp.position.set(0,boss?4.45:crate?2.5:2.0,0);g.add(hp);
    return {group:g,body,bodyKey:key,shadow:shade,label:hp,row,type,index,boss:bossSpec,kind,advanceSpeed:role.speed,hp:definition.hp,maxHp:definition.hp,radius:crate?1:boss?2.0:role.radius,dead:false,reward:definition.reward??(boss?5:1),offset:definition.z||0,contact:0,hit:0};
  }
  drawEnemies(){
    this.enemyBatches??=new Map();
    if(!this.enemyShadows){this.enemyShadows=new T.InstancedMesh(shadowGeometry,shadowMaterial,110);this.enemyShadows.instanceMatrix.setUsage(T.DynamicDrawUsage);this.enemyShadows.frustumCulled=false;this.scene.add(this.enemyShadows);this.enemyMatrix=new T.Matrix4();}
    for(const batch of this.enemyBatches.values())for(const part of batch)part.count=0;
    let shadows=0;
    for(const enemy of this.entities){
      if(enemy.dead||enemy.escaped||!enemy.group.visible||!enemy.row.group.visible)continue;
      if(!this.enemyBatches.has(enemy.bodyKey)){
        const batch=this.enemyBodies.get(enemy.bodyKey).children.map(source=>{const part=new T.InstancedMesh(source.geometry,source.material,110);part.instanceMatrix.setUsage(T.DynamicDrawUsage);part.frustumCulled=false;part.count=0;this.scene.add(part);return part;});this.enemyBatches.set(enemy.bodyKey,batch);
      }
      enemy.body.updateWorldMatrix(true,false);
      for(const part of this.enemyBatches.get(enemy.bodyKey))if(part.count<110)part.setMatrixAt(part.count++,enemy.body.matrixWorld);
      if(shadows<110){enemy.shadow.updateMatrix();this.enemyMatrix.multiplyMatrices(enemy.group.matrixWorld,enemy.shadow.matrix);this.enemyShadows.setMatrixAt(shadows++,this.enemyMatrix);}
    }
    for(const batch of this.enemyBatches.values())for(const part of batch)part.instanceMatrix.needsUpdate=true;
    this.enemyShadows.count=shadows;this.enemyShadows.instanceMatrix.needsUpdate=true;
  }
  positionRows(distance){
    this.distance=distance;let live=this.entities.filter(e=>!e.dead&&!e.escaped).length;
    for(const row of this.rows){
      row.group.position.z=5-(row.at-distance);row.group.visible=!row.used&&row.at-distance<90&&row.at+(row.tail||0)-distance>-25;
      if(!row.pendingEnemies)continue;
      row.pendingEnemies=row.pendingEnemies.filter((definition,i)=>{
        const z=row.group.position.z+(definition.z||0);if(z>14)return false;if(z< -72||live>=110)return true;
        const enemy=this.makeEnemy(row.type,definition,row,i);row.group.add(enemy.group);this.entities.push(enemy);live++;return false;
      });
    }
  }
  pruneCourse(distance){const dispose=group=>group.traverse(o=>{if(o.isSprite){o.material.map?.dispose();o.material.dispose();}else if(o.isMesh&&!o.userData.sharedEnemy&&![sphere,lowSphere,box].includes(o.geometry)){o.geometry.dispose();if(o.userData.disposable)o.material.dispose();}});for(const e of this.entities)if(e.dead||e.escaped){e.row.group.remove(e.group);dispose(e.group);}this.entities=this.entities.filter(e=>!e.dead&&!e.escaped);const old=this.rows.filter(r=>r.at+(r.tail||0)<distance-25);for(const row of old){this.scene.remove(row.group);dispose(row.group);}const retired=new Set(old);this.rows=this.rows.filter(r=>!retired.has(r));this.entities=this.entities.filter(e=>!retired.has(e.row));}
  updateEnemies(time,dt){for(const e of this.entities){if(e.dead||e.escaped)continue;e.group.visible=e.row.group.position.z+e.offset> -74;e.body.scale.set(1+Math.sin(time*3+e.index)*.025,1-Math.sin(time*3+e.index)*.035,1);e.body.position.y=Math.max(0,e.hit)*.12;e.hit=Math.max(0,e.hit-dt*5);e.group.position.z=e.offset;updateLabel(e.label,String(Math.max(0,Math.ceil(e.hp))));}this.drawEnemies();}
  hit(enemy,damage){enemy.hp-=damage;enemy.hit=1;this.burst(enemy.group.getWorldPosition(new T.Vector3()).x,.8,enemy.group.getWorldPosition(new T.Vector3()).z,'#fff0ab',3);if(enemy.hp<=0){enemy.hp=0;enemy.dead=true;enemy.group.visible=false;const p=enemy.group.getWorldPosition(new T.Vector3());this.burst(p.x,1,p.z,'#c6b7da',24);this.ring(p.x,p.z,'#d6c4df');return true;}return false;}
  update(state,dt,wallTime){
    this.time+=dt;this.hurtAge+=dt;const t=this.time,moving=!this.home&&state.phase!=='lost'&&state.phase!=='boss';this.rangeMarker.visible=!this.home;this.rangeMarker.position.z=4.25-state.range;
    this.modeAura.visible=!this.home&&state.modeLeft>0;this.modeShield.visible=!this.home&&state.activeMode==='god'&&state.modeLeft>0;if(this.modeAura.visible){this.modeAura.material.color.set(MODES[state.activeMode].color);this.modeAura.scale.setScalar(1+Math.sin(t*7)*.06);this.modeAura.rotation.z=t*.6;}
    this.strideMix+=((moving?1:0)-this.strideMix)*Math.min(1,dt*12);
    if(this.main)applyJellyPose(this.heroBody,jellyPose(t,{moving:this.strideMix,hurtAge:this.hurtAge}));
    this.petRoots.forEach((root,i)=>{
      const d=root.userData;root.visible=d.index<(state.pets?.[d.name]||0);applyJellyPose(d.motion,jellyPose(t,{moving:this.strideMix,phase:.2+i*.25}));root.rotation.y=this.home?.4:Math.PI;
      const side=d.name==='naigou'?-1:1;root.position.set(side*(1.2+d.index*.36),0,.5+d.index*.8);
      if(d.attack&&!this.home){d.attack.age+=dt;const p=Math.min(1,d.attack.age/.65),f=Math.sin(Math.PI*p);root.position.x+=(d.attack.toX-root.position.x)*f;root.position.z+=(d.attack.toZ-root.position.z)*f;root.position.y=Math.sin(Math.PI*p)*.7;if(p===1)d.attack=null;}
      if(d.orb){d.charge=(d.charge??0)+dt;d.orb.scale.setScalar(.10+Math.min(1,d.charge/1.8)*.14);}
    });
    if(this.home){this.hero.position.y=Math.sin(t*1.5)*.025;if(this.main)this.main.rotation.y=.40+Math.sin(t*.24)*.1;

      if(this.eggHome){this.eggHome.position.set(-.90,.25+Math.sin(t*2)*.10,-.15);const p=this.eggHome.getWorldPosition(this.target);this.eggHome.rotation.y=Math.atan2(this.camera.position.x-p.x,this.camera.position.z-p.z)+Math.sin(t*.7)*.045;}
    }else{
      this.hero.position.x=state.x;this.hero.position.y=0;this.main.rotation.y=Math.PI+(state.x-this.previousX||0)*-.4;this.previousX=state.x;
      this.updateCrowd(state,t);this.positionRows(state.distance);
    }
    const scroll=this.home?0:state.distance;
    for(const d of this.decor){d.position.z=((d.userData.baseZ+scroll+150)%150)-130;d.visible=!this.home||d.position.z< -7;d.userData.plant.rotation.z=Math.sin(t*.65+d.position.z)*.018;}
    this.dashes.forEach((d,i)=>d.position.z=((10-Math.floor(i/2)*6+scroll+165)%165)-145);
    const p=this.water.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*.24+t*.8)*Math.cos(p.getY(i)*.15+t*.35)*.065);p.needsUpdate=true;
    this.clouds.forEach((c,i)=>c.position.x+=Math.sin(wallTime*.05+i)*dt*.03);
    for(const d of this.decor){if(d.userData.ghost){const ghost=d.userData.ghost;ghost.position.y=2.7+Math.sin(t*1.1+d.position.z)*.22;ghost.rotation.z=Math.sin(t*.8+d.position.z)*.06;const p=ghost.getWorldPosition(this.target);ghost.rotation.y=Math.atan2(this.camera.position.x-p.x,this.camera.position.z-p.z)+Math.sin(t*.55+d.userData.baseZ)*.55;}}
    this.rewards=this.rewards.filter(r=>{r.age+=dt;r.sprite.position.y+=dt*.75;r.sprite.material.opacity=Math.max(0,1-r.age/1.5);if(r.age>1.5){this.scene.remove(r.sprite);r.sprite.material.map.dispose();r.sprite.material.dispose();return false;}return true;});
    this.beams=this.beams.filter(b=>{b.age+=dt;b.mesh.material.opacity=Math.max(0,1-b.age/.16);if(b.age>.16){this.scene.remove(b.mesh);b.mesh.geometry.dispose();b.mesh.material.dispose();return false;}return true;});
    this.updateEnemies(t,dt);this.updateParticles(dt);this.drawShots();this.renderer.render(this.scene,this.camera);
  }
}
