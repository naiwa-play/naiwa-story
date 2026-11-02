import * as T from './vendor/three.module.min.js';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
const geometries=new Map(),materials=new Map();
function geometry(kind,args){const key=kind+args.join(',');if(!geometries.has(key))geometries.set(key,new T[kind](...args));return geometries.get(key);}
function piece(g,color,p=[0,0,0],s=[1,1,1],kind='SphereGeometry',args=[1,16,12],glow=0){const key=color+':'+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.55,emissive:color,emissiveIntensity:glow}));const m=new T.Mesh(geometry(kind,args),materials.get(key));m.position.set(...p);m.scale.set(...s);g.add(m);return m;}
const block=(g,c,p,s)=>piece(g,c,p,s,'BoxGeometry',[1,1,1]);
const rod=(g,c,p,s)=>piece(g,c,p,s,'CylinderGeometry',[1,1,1,12]);
const ring=(g,c,p,r,t=.06)=>piece(g,c,p,[1,1,1],'TorusGeometry',[r,t,8,32],.15);
function eyes(g,y,z,space=.22){for(const x of [-space,space]){piece(g,'#fcf3dc',[x,y,z],[.15,.19,.09]);piece(g,'#334459',[x,y,z+.08],[.064,.10,.035]);}}
function star(g,color,p,size=1){const key='star:'+size;if(!geometries.has(key)){const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=(i%2?.43:1)*size;i?shape.lineTo(Math.sin(a)*r,Math.cos(a)*r):shape.moveTo(Math.sin(a)*r,Math.cos(a)*r);}shape.closePath();geometries.set(key,new T.ShapeGeometry(shape));}if(!materials.has(color+':0'))materials.set(color+':0',new T.MeshStandardMaterial({color,side:T.DoubleSide}));const m=new T.Mesh(geometries.get(key),materials.get(color+':0'));m.position.set(...p);g.add(m);return m;}
function lantern(g,p,size=1){const root=new T.Group();root.position.set(...p);root.scale.setScalar(size);g.add(root);piece(root,'#edb17c',[0,0,0],[.38,.52,.32],'SphereGeometry',[1,16,12],.35);for(const y of [-.42,.42])rod(root,'#805d68',[0,y,0],[.26,.05,.24]);rod(root,'#e1c18d',[0,-.7,0],[.025,.24,.025]);for(let i=0;i<4;i++){const a=i*Math.PI/2;rod(root,'#cf8f70',[Math.cos(a)*.35,0,Math.sin(a)*.3],[.014,.4,.014]);}return root;}
function jelly(g,p,size=1){const root=new T.Group();root.position.set(...p);root.scale.setScalar(size);g.add(root);piece(root,'#9fded9',[0,.7,0],[.68,.44,.6],'SphereGeometry',[1,20,12,0,Math.PI*2,0,Math.PI*.6],.3);ring(root,'#d2eee0',[0,.48,0],.63).rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;const leg=rod(root,i%2?'#b6afd8':'#88c6d6',[Math.sin(a)*.4,0,Math.cos(a)*.4],[.025,.44+(i%2)*.1,.025]);leg.rotation.z=Math.sin(a)*.2;}return root;}
function wheel(g,p,size=1){const support=new T.Group();support.position.set(...p);support.scale.setScalar(size);g.add(support);for(const x of [-1.7,1.7]){const leg=block(support,'#bca0b5',[x/2,2.2,-.2],[.16,4.6,.22]);leg.rotation.z=-Math.sign(x)*.38;}const rotor=new T.Group();rotor.position.y=4;support.add(rotor);ring(rotor,'#fff0cd',[0,0,0],3,.12);ring(rotor,'#d69cba',[0,0,-.04],2.7,.055);for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.sin(a),y=Math.cos(a),spoke=block(rotor,'#eac9bd',[x*1.5,y*1.5,0],[.04,3,.05]);spoke.rotation.z=-a;piece(rotor,['#b5c7d9','#f0bdb5','#e5d9ab'][i%3],[x*3,y*3,.05],[.36,.28,.30]);}piece(support,'#f4dba9',[0,4,.2],[.55,.55,.25]);return rotor;}
export function destinationEnemy(kind){
 const g=new T.Group();
 if(['bubble','manta','diver','anemone'].includes(kind)){
  if(kind==='bubble'){piece(g,'#81b7c5',[0,.5,0],[.6,.38,.5]);piece(g,'#c2e9df',[0,.85,-.1],[.48,.50,.43]);ring(g,'#94ddde',[0,.85,.25],.44,.04);for(const x of [-.65,.65])piece(g,'#deb18d',[x,.5,.16],[.22,.16,.23]);eyes(g,.58,.46);}
  if(kind==='manta'){piece(g,'#a5b2db',[0,.65,0],[.38,.20,.6]);for(const side of [-1,1]){const wing=piece(g,'#8fc9d5',[side*.45,.62,-.08],[.67,.09,.42]);wing.rotation.z=side*.18;}rod(g,'#82aaba',[0,.63,-.8],[.035,.035,.6]).rotation.x=Math.PI/2;eyes(g,.73,.45,.15);}
  if(kind==='diver'){piece(g,'#c6b18f',[0,.65,0],[.55,.6,.48]);ring(g,'#5b788b',[0,.78,.42],.31,.08);piece(g,'#94e6e1',[0,.78,.44],[.28,.28,.12],'SphereGeometry',[1,16,12],.2);for(const x of [-.6,.6])block(g,'#7296a5',[x,.45,0],[.25,.55,.30]);}
  if(kind==='anemone'){jelly(g,[0,0,0],.8);eyes(g,.65,.46,.18);}
 }else if(['balloon','duck','candy','star'].includes(kind)){
  if(kind==='balloon'){piece(g,'#eaa8bd',[0,.95,0],[.5,.65,.4]);rod(g,'#bf9ab2',[0,.28,0],[.015,.3,.015]);piece(g,'#e0bc8c',[0,.05,0],[.28,.08,.3]);eyes(g,1,.36);}
  if(kind==='duck'){piece(g,'#f5d281',[0,.45,0],[.6,.42,.5]);piece(g,'#fae1a0',[0,.95,.22],[.4,.4,.37]);piece(g,'#d9966f',[0,.84,.59],[.27,.10,.23]);eyes(g,1,.52,.16);for(const side of [-1,1])ring(g,'#b5a2b5',[side*.58,.5,0],.19,.04).rotation.y=Math.PI/2;}
  if(kind==='candy'){block(g,'#d5b3d2',[0,.6,0],[.95,1.05,.72]);for(let i=0;i<3;i++)block(g,'#f6d9bb',[0,.32+i*.3,.38],[.98,.08,.04]);eyes(g,.83,.4);}
  if(kind==='star'){star(g,'#f1d69a',[0,.75,.05],.68);eyes(g,.83,.08,.15);}
 }else if(['paper','lanternling','umbrella','fox'].includes(kind)){
  if(kind==='paper'){piece(g,'#eee1c3',[0,.97,0],[.37,.37,.25],'IcosahedronGeometry',[1,0]);block(g,'#bc8692',[0,.45,0],[.45,.6,.3]);for(const x of [-.39,.39]){const arm=block(g,'#e4cba7',[x,.58,0],[.42,.12,.16]);arm.rotation.z=-x*.8;}eyes(g,1,.23,.15);}
  if(kind==='lanternling'){lantern(g,[0,.8,0],1.15);eyes(g,.87,.37);for(const x of [-.22,.22])rod(g,'#7b657e',[x,.15,0],[.04,.2,.04]);}
  if(kind==='umbrella'){piece(g,'#a395bf',[0,1.05,0],[.77,.42,.77],'ConeGeometry',[1,1,16]);rod(g,'#b5937c',[0,.5,0],[.045,.65,.045]);piece(g,'#edc7a0',[.1,.08,.15],[.25,.09,.25]);eyes(g,1,.52,.18);}
  if(kind==='fox'){piece(g,'#e4ccb1',[0,.55,0],[.45,.35,.4]);piece(g,'#f0e2c6',[0,.95,.1],[.43,.31,.3]);for(const x of [-.28,.28])piece(g,'#bd8c92',[x,1.28,.05],[.15,.35,.12],'ConeGeometry',[1,1,4]);eyes(g,1,.36,.18);piece(g,'#b77a87',[0,.88,.43],[.08,.055,.06]);const tail=piece(g,'#e1bea2',[.45,.4,-.4],[.28,.25,.55]);tail.rotation.y=-.5;}
 }else return null;
 return g;
}
export function destinationBoss(id){
 const g=new T.Group();
 if(['abyss-elite','dream-elite','lantern-elite'].includes(id)){const unit=destinationEnemy({'abyss-elite':'diver','dream-elite':'star','lantern-elite':'fox'}[id]);unit.scale.setScalar(2);g.add(unit);for(const x of [-.4,0,.4])piece(g,'#e7c487',[x,2.7,.05],[.12,.35,.12],'ConeGeometry',[1,1,6]);return g;}
 if(id==='octopus'){piece(g,'#77afc5',[0,2,0],[1.1,1.25,.85]);ring(g,'#e6c196',[0,2,.78],.7,.13);eyes(g,2.2,.85,.35);for(let i=0;i<8;i++){const a=(i/7-.5)*Math.PI,root=new T.Group();root.position.set(Math.sin(a),.8,Math.cos(a)*.3);root.rotation.z=-a*.5;g.add(root);for(let j=0;j<3;j++)piece(root,j%2?'#b9d4cb':'#819ab5',[Math.sin(j*.5)*.4,.2-j*.28,.4+j*.25],[.23,.25,.33]);}}
 else if(id==='submarine'){piece(g,'#bda88a',[0,1.6,0],[1.7,1,1]);for(const x of [-.8,0,.8])ring(g,'#77bbcb',[x,1.7,.87],.26,.08);rod(g,'#7394a6',[0,2.75,0],[.35,.65,.3]);block(g,'#e4ce9e',[.3,3.35,.1],[.9,.12,.18]);for(const x of [-1.8,1.8])piece(g,'#789ba9',[x,1.1,0],[.45,.2,.9]);}
 else if(id==='ferris'){wheel(g,[0,0,0],.65);eyes(g,2.65,.5,.2);}
 else if(id==='carousel'){rod(g,'#e4c6b3',[0,.3,0],[1.7,.2,1.7]);rod(g,'#b49cba',[0,1.5,0],[.15,1.5,.15]);piece(g,'#d09bb6',[0,3,0],[1.8,.8,1.8],'ConeGeometry',[1,1,20]);for(const x of [-1.1,1.1]){rod(g,'#e7c78b',[x,1.6,.1],[.045,1.3,.045]);const duck=destinationEnemy('duck');duck.position.set(x,.6,.3);g.add(duck);}star(g,'#ffe3a1',[0,3.8,.1],.35);}
 else if(id==='paperking'){piece(g,'#eee1c5',[0,2.6,0],[.88,.92,.55],'IcosahedronGeometry',[1,1]);piece(g,'#aa849e',[0,1.1,0],[1,2, .65],'ConeGeometry',[1,1,6]);eyes(g,2.8,.52,.32);for(const x of [-1.3,1.3]){const arm=block(g,'#e8cda8',[x,1.8,0],[1.2,.22,.4]);arm.rotation.z=x*.2;lantern(g,[x*1.4,1.2,.1],.65);}star(g,'#e5b77d',[0,3.7,.1],.45);}
 else if(id==='operamask'){piece(g,'#9f85ab',[0,1.1,0],[1.15,2.2,.8],'ConeGeometry',[1,1,16]);piece(g,'#f1dec7',[0,2.7,.1],[.85,1,.4]);for(const side of [-1,1]){const brow=piece(g,side<0?'#b46b7d':'#7e88af',[side*.34,2.85,.48],[.3,.46,.06]);brow.rotation.z=-side*.25;for(let i=0;i<3;i++)piece(g,'#dfb985',[side*(.7+i*.18),3.3+i*.18,0],[.10,.20,.1]);}eyes(g,2.7,.51,.26);piece(g,'#b66d7e',[0,2.25,.51],[.19,.05,.035]);}
 else return null;return g;
}
function batch(g,owned){g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert(),batches=new Map();g.traverse(o=>{if(!o.isMesh)return;if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));});g.clear();for(const [material,parts] of batches){const merged=mergeGeometries(parts);parts.forEach(p=>p.dispose());owned.add(merged);g.add(new T.Mesh(merged,material));}}
export class DestinationScenery{
 constructor(theme){this.group=new T.Group();this.owned=new Set();this.cells=[];this.theme=theme;this.homeAccent=new T.Group();this.group.add(this.homeAccent);
  if(theme==='dream')this.homeWheel=wheel(this.homeAccent,[-1.5,0,-2.5],.43);
  else if(theme==='abyss'){this.homeJelly=jelly(this.homeAccent,[-1.8,1,-2.5],.8);for(const x of [-2.5,-1,1])piece(this.homeAccent,'#83b6ca',[x,.8,-3],[.08,.08,.08],'SphereGeometry',[1,10,8],.15);}
  else{block(this.homeAccent,'#66516d',[-2,.6,-3],[2.8,1.2,1.5]);piece(this.homeAccent,'#8a7182',[-2,1.5,-3],[2.1,.55,1.5],'ConeGeometry',[1,1,4]).rotation.y=Math.PI/4;for(const x of [-2.8,-1.9,-1])block(this.homeAccent,'#e5b980',[x,.7,-2.22],[.45,.5,.03]);lantern(this.homeAccent,[-.3,1.2,-2.3],.6);}
  for(let i=0;i<12;i++){const cell=new T.Group(),side=i%2?-1:1;cell.position.set(side*(8.5+i%3*1.8),0,6-i*12);cell.userData.baseZ=cell.position.z;const fixed=new T.Group();cell.add(fixed);const movers=[];
   if(theme==='abyss'){
    piece(fixed,'#2e6678',[0,-.6,0],[3,.6,4]);for(let j=0;j<5;j++){const coral=new T.Group();coral.position.set((j-2)*.65,0,(j%2)*1.2);fixed.add(coral);for(let k=0;k<3;k++){const stem=rod(coral,j%2?'#a4a4b7':'#7abbb3',[(k-1)*.25,.4,0],[.07,.4+(j%3)*.12,.07]);stem.rotation.z=(k-1)*.4;piece(coral,'#b9dacd',[(k-1)*.38,.85,0],[.12,.13,.12],'SphereGeometry',[1,12,8],.1);}}
    if(i%3===0){const arch=ring(fixed,'#71a5b6',[-side*8,3.8,0],5,.13);arch.scale.set(1,1.1,1);const glass=ring(fixed,'#96d7d6',[-side*8,3.8,-.2],4.85,.025);glass.scale.y=1.1;}
    const spirit=jelly(cell,[0,3+i%3,0],1.1);batch(spirit,this.owned);movers.push({g:spirit,y:spirit.position.y,kind:'float'});
    if(i%2===0){block(fixed,'#40677e',[0,.6,-1],[2.6,1.2,1.8]);block(fixed,'#b7e6df',[0,1,-.06],[1.8,.45,.04]);rod(fixed,'#93cbd0',[1.2,2,-1],[.08,1.1,.08]);}
    for(let j=0;j<3;j++){const bubble=piece(cell,'#95bfcf',[j-1,2+j*1.4,-1],[.10+j*.04,.10+j*.04,.10+j*.04],'SphereGeometry',[1,10,8],.12);movers.push({g:bubble,y:bubble.position.y,kind:'bubble'});}
   }else if(theme==='dream'){
    for(let j=0;j<3;j++)piece(fixed,'#eadde1',[(j-1)*1.6,-.5,j%2],[2,.7,2.2]);
    if(i%4===0){const rotor=wheel(cell,[0,0,-1],1);batch(rotor,this.owned);movers.push({g:rotor,kind:'wheel'});}
    else{rod(fixed,'#c2a1b8',[0,2,0],[.10,2,.10]);piece(fixed,i%2?'#e7adc5':'#b4c7dc',[0,4,0],[1.1,1.45,.9]);block(fixed,'#d3b493',[0,2.3,0],[.6,.35,.55]);star(fixed,'#f0daaa',[0,4.1,.95],.4);}
    for(let j=0;j<4;j++){const lamp=piece(fixed,['#f6dfb0','#c8c1e3','#efc2c4'][j%3],[(j-1.5)*1.2,.65,1.8],[.30,.30,.30],'SphereGeometry',[1,12,8],.2);rod(fixed,'#b29bb4',[lamp.position.x,.27,1.8],[.025,.28,.025]);}
    if(i%3===0){const pad=ring(fixed,'#e7bc8e',[-side*6,.06,1],.9,.14);pad.rotation.x=Math.PI/2;}
   }else{
    block(fixed,'#43506a',[0,.65,0],[3.5,1.3,2.5]);block(fixed,'#a47c88',[0,1.8,0],[3.2,1,2.2]);piece(fixed,'#51546e',[0,2.6,0],[2.6,.85,1.9],'ConeGeometry',[1,1,4]).rotation.y=Math.PI/4;
    for(const x of [-1.1,0,1.1])block(fixed,'#e6bb87',[x,1.7,1.12],[.55,.6,.045]);block(fixed,'#57485e',[0,.75,1.3],[3.8,.15,.6]);
    for(const x of [-1.5,1.5])rod(fixed,'#74566b',[x,1,1.3],[.045,1,.045]);
    const light=lantern(cell,[-side*1.7,2.65,1.4],.85);batch(light,this.owned);movers.push({g:light,kind:'lantern'});
    if(i%3===0){const bridge=new T.Group();bridge.position.set(-side*7.5,0,-1);fixed.add(bridge);for(const x of [-4.9,4.9]){rod(bridge,'#8f687b',[x,2.7,0],[.12,2.7,.12]);lantern(bridge,[x,4.8,0],.65);}block(bridge,'#a27d89',[0,5.4,0],[10.8,.18,.22]);}
   }
   batch(fixed,this.owned);this.group.add(cell);this.cells.push({g:cell,movers});
  }
 }
 update(time,distance,home){this.homeAccent.visible=home;if(this.homeWheel)this.homeWheel.rotation.z=time*.1;if(this.homeJelly)this.homeJelly.position.y=1+Math.sin(time)*.15;for(const {g,movers} of this.cells){g.position.z=((g.userData.baseZ+(home?0:distance)+142)%144+144)%144-142;g.visible=!home||g.position.z< -6;for(const m of movers){if(m.kind==='wheel')m.g.rotation.z=time*.10;else if(m.kind==='lantern')m.g.rotation.z=Math.sin(time*.9+g.userData.baseZ)*.12;else if(m.kind==='bubble')m.g.position.y=m.y+(time*.4+m.y)%4;else{m.g.position.y=m.y+Math.sin(time*.8+g.userData.baseZ)*.4;m.g.rotation.y=Math.sin(time*.3)*.3;}}}}
 dispose(){this.group.removeFromParent();for(const g of this.owned)g.dispose();}
}
