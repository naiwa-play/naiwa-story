import * as T from './vendor/three.module.min.js';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';

// Procedural scenery: no additional images or model downloads. Only the small crowd mesh is instanced.
export class CyberFrontier {
  constructor(crowdParts=[]){
    this.group=new T.Group();this.group.name='霓虹荒原 · 奶蛙制造局';this.stations=[];this.materials=new Map();this.geometry=new Set();this.textures=[];this.pose=new T.Object3D();
    this.box=new T.BoxGeometry(1,1,1);this.cylinder=new T.CylinderGeometry(1,1,1,12);this.ring=new T.TorusGeometry(1,.045,6,24);
    this.geometry.add(this.box);this.geometry.add(this.cylinder);this.geometry.add(this.ring);
    const city=new T.Group();this.group.add(city);
    // Terraced mesas and water towers place the neon factory in a western desert.
    for(const side of [-1,1]){
      for(let i=0;i<6;i++){
        const x=side*(25+(i%3)*8),z=-30-i*15,h=3+(i*7%9);
        const mesa=new T.CylinderGeometry(1,1.22,1,7);this.geometry.add(mesa);
        for(let tier=0;tier<3;tier++)this.shape(mesa,city,tier===2?'#66414c':'#472c40',[x,h*(1-tier*.29)/2-1,z],[5-tier*1.2,h*(1-tier*.29),4.5-tier*.5]);
        if(i%2===0){this.block(city,'#201d32',[side*(18+i),3,-35-i*15],[4,6,5]);for(let y=1;y<6;y++)this.block(city,i%4?'#ec9271':'#5ce6dd',[side*(18+i),y,-32.45-i*15],[2.8,.07,.03],true);}
      }
      const tower=new T.Group();tower.position.set(side*18,0,-19);city.add(tower);
      for(const x of [-1.2,1.2])for(const z of [-1.2,1.2])this.block(tower,'#72534f',[x,3.7,z],[.16,7.4,.16]);
      this.shape(this.cylinder,tower,'#a67559',[0,7.6,0],[2,2.1,2]);this.shape(this.ring,tower,'#6bebe0',[0,7.4,0],[2.03,2.03,2.03],true).rotation.x=Math.PI/2;
      for(let i=0;i<5;i++){
        const cactus=new T.Group();cactus.position.set(side*(7.1+i%2*8),0,1-i*28);city.add(cactus);
        this.block(cactus,'#486b68',[0,1,0],[.28,2.6,.28]);this.block(cactus,'#66e5cd',[.16,1.1,.16],[.025,2.2,.025],true);
        for(const arm of [-1,1]){this.block(cactus,'#486b68',[arm*.38,1.1+arm*.3,0],[.6,.22,.24]);this.block(cactus,'#486b68',[arm*.65,1.5+arm*.3,0],[.22,.8,.24]);}
      }
    }
    const sunset=this.material('#f2a071',true);sunset.fog=false;const sun=new T.Mesh(new T.CircleGeometry(9,48),sunset);this.geometry.add(sun.geometry);sun.position.set(3,13,-104);city.add(sun);
    for(let i=0;i<6;i++)this.block(city,'#362537',[3,8+i*.73,-103.8],[19,.14+i*.03,.03]);
    for(let i=0;i<30;i++)for(const side of [-1,1])this.block(city,'#38535e',[side*21,-.39,14-i*4.8],[30,.025,.035],true);
    this.batch(city);
    const parts=crowdParts.map(part=>part.mesh);
    // Six staggered working cells make the production line continue along the endless road.
    for(let i=0;i<6;i++){
      const side=i%2?-1:1,root=new T.Group(),body=new T.Group(),z=-7-Math.floor(i/2)*44-(i%2)*12;
      root.position.set(side*9.8,0,z);root.rotation.y=-side*.20;root.add(body);root.userData.baseZ=z;this.group.add(root);
      this.block(body,'#201e31',[0,.38,0],[5,.76,13]);
      this.block(body,'#977259',[0,.84,0],[4.7,.18,12.4]);
      this.block(body,'#30404a',[0,.98,0],[3.25,.18,11.9]);
      for(const x of [-2,2]){this.block(body,'#e19c68',[x,1.1,0],[.10,.18,12]);this.block(body,'#65ede5',[x,1.24,0],[.055,.055,12],true);}
      for(const z of [-5.6,-4.2,-2.8,-1.4,0,1.4,2.8,4.2,5.6])this.shape(this.cylinder,body,'#526271',[0,.97,z],[.18,3.3,.18]).rotation.z=Math.PI/2;
      // An open fabrication arch keeps the forming character clearly visible.
      for(const x of [-1.95,1.95]){this.block(body,'#394450',[x,3,-2.6],[.42,4.1,.6]);this.block(body,'#b67d59',[x,3.2,-2.28],[.17,3.3,.06]);}
      this.block(body,'#394450',[0,5,-2.6],[4.5,.7,1.5]);
      this.block(body,'#77fff1',[0,4.65,-2.58],[3.2,.07,.8],true);
      for(const x of [-1.2,0,1.2])this.shape(this.cylinder,body,'#bd8a66',[x,4.45,-2.6],[.16,.4,.16]);
      const hood=this.shape(this.cylinder,body,'#665466',[-2.55,2.9,-4.1],[.45,5.8,.45]);
      this.shape(this.ring,body,'#f6ad72',[-2.55,5.4,-4.1],[.49,.49,.49],true).rotation.x=Math.PI/2;
      this.block(body,'#2d293a',[2.65,2.1,-3.8],[1.1,3.9,3.4]);
      for(let n=0;n<4;n++)this.block(body,'#60c9cb',[3.22,1.2+n*.5,-3.8],[.035,.12,2.2],true);
      this.block(body,'#b67d59',[0,1.6,-6],[4.3,.18,.18]);
      for(const x of [-1.8,1.8])this.block(body,'#b67d59',[x,2,-6],[.13,2,.13]);
      this.batch(body);
      const sign=this.sign(i%2?'SOFTWORKS / 02':'奶 蛙 制 造 局',i%2?'MILKY · AUTOMATION':'N. / FRONTIER FOUNDRY');sign.position.set(0,6.1,-2.6);root.add(sign);
      const scanner=this.block(root,'#71fff4',[0,1.5,-2.6],[3.35,.045,1.6],true);
      const beam=new T.Mesh(new T.PlaneGeometry(3.3,3),new T.MeshBasicMaterial({color:'#60e7e0',transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false}));this.geometry.add(beam.geometry);root.add(beam);beam.position.set(0,2.65,-2.9);
      const arm=new T.Group();arm.position.set(2.1,1.1,.5);root.add(arm);
      this.shape(this.cylinder,arm,'#bf875d',[0,.2,0],[.6,.4,.6]);
      const shoulder=new T.Group();shoulder.position.y=.4;arm.add(shoulder);
      this.block(shoulder,'#aa7c60',[0,1.05,0],[.3,2.1,.36]);this.shape(this.cylinder,shoulder,'#75eae4',[0,0,0],[.27,.5,.27],true).rotation.x=Math.PI/2;
      const elbow=new T.Group();elbow.position.y=2.1;shoulder.add(elbow);this.block(elbow,'#60767b',[-.75,0,0],[1.65,.24,.28]);
      for(const x of [-1.4,-1.8])this.block(elbow,'#c69363',[x,-.3,0],[.10,.65,.18]);
      const wheel=new T.Group();wheel.position.set(2.67,2.1,-3);root.add(wheel);
      this.shape(this.ring,wheel,'#e7aa73',[0,0,0],[.72,.72,.72],true);for(let k=0;k<3;k++)this.block(wheel,'#a67965',[0,0,0],[1.4,.07,.08]).rotation.z=k*Math.PI/3;
      arm.remove(shoulder);this.batch(arm);arm.add(shoulder);shoulder.remove(elbow);this.batch(shoulder);shoulder.add(elbow);this.batch(elbow);this.batch(wheel);
      const frogs=parts.map(source=>{const instance=new T.InstancedMesh(source.geometry,source.material,3);instance.instanceMatrix.setUsage(T.DynamicDrawUsage);instance.frustumCulled=false;root.add(instance);return instance;});
      const packages=new T.InstancedMesh(this.box,this.material('#6ee5dc',true),14);packages.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(packages);
      this.stations.push({root,scanner,beam,shoulder,elbow,wheel,frogs,packages,phase:i*.37});
    }
    this.update(0,0,false);
  }
  material(color,glow=false){const key=color+glow;if(!this.materials.has(key))this.materials.set(key,glow?new T.MeshBasicMaterial({color}):new T.MeshStandardMaterial({color,roughness:.65,metalness:.26}));return this.materials.get(key);}
  shape(geometry,parent,color,position,scale,glow=false){const object=new T.Mesh(geometry,this.material(color,glow));object.position.set(...position);object.scale.set(...scale);parent.add(object);return object;}
  block(parent,color,position,scale,glow=false){return this.shape(this.box,parent,color,position,scale,glow);}
  sign(title,subtitle){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=180;const c=canvas.getContext('2d');c.fillStyle='#1e2438';c.fillRect(0,0,640,180);c.strokeStyle='#6de8e1';c.lineWidth=4;c.strokeRect(10,10,620,160);c.textAlign='center';c.fillStyle='#a0fff0';c.font='600 48px "Microsoft YaHei",sans-serif';c.fillText(title,320,83);c.fillStyle='#e7b08a';c.font='22px sans-serif';c.fillText(subtitle,320,134);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;this.textures.push(texture);const geometry=new T.PlaneGeometry(5.5,1.55);this.geometry.add(geometry);const material=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});const object=new T.Mesh(geometry,material);return object;
  }
  batch(group){
    group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map();group.traverse(object=>{if(!object.isMesh)return;if(!batches.has(object.material))batches.set(object.material,[]);batches.get(object.material).push(object.geometry.clone().applyMatrix4(inverse.clone().multiply(object.matrixWorld)));});group.clear();
    for(const [material,list] of batches){const geometry=mergeGeometries(list);list.forEach(g=>g.dispose());this.geometry.add(geometry);group.add(new T.Mesh(geometry,material));}
  }
  update(time,distance,home){
    for(const cell of this.stations){
      const {root,scanner,beam,shoulder,elbow,wheel,frogs,packages,phase}=cell,t=time+phase;
      root.position.z=((root.userData.baseZ+(home?0:distance)+112)%132+132)%132-112;
      scanner.position.y=1.3+(Math.sin(t*2.5)+1)*1.25;beam.material.opacity=.035+(Math.sin(t*2.5)+1)*.025;
      shoulder.rotation.z=.35+Math.sin(t*1.6)*.25;elbow.rotation.z=-.4+Math.sin(t*1.6-.8)*.35;wheel.rotation.z=t*.7;
      for(let i=0;i<3;i++){
        const progress=(t*.12+i/3)%1,z=-4.6+progress*9.3,forming=T.MathUtils.smoothstep(progress,0,.24),size=.85*forming;
        this.pose.position.set(0,1.06,z);this.pose.rotation.set(0,0,0);this.pose.scale.set(size,size*(1+Math.sin(t*6+i)*.035),size);this.pose.updateMatrix();frogs.forEach(frog=>frog.setMatrixAt(i,this.pose.matrix));
      }
      frogs.forEach(frog=>frog.instanceMatrix.needsUpdate=true);
      for(let i=0;i<14;i++){this.pose.position.set(i%2?1.68:-1.68,1.09,((i*.9+t*1.2)%11.6)-5.8);this.pose.rotation.set(0,0,0);this.pose.scale.set(.08,.04,.35);this.pose.updateMatrix();packages.setMatrixAt(i,this.pose.matrix);}packages.instanceMatrix.needsUpdate=true;
    }
  }
  dispose(){
    this.group.traverse(object=>{if(object.isInstancedMesh)object.dispose();else if(object.isMesh){this.geometry.add(object.geometry);if(![...this.materials.values()].includes(object.material))object.material.dispose();}});
    this.geometry.forEach(geometry=>geometry.dispose());this.materials.forEach(material=>material.dispose());this.textures.forEach(texture=>texture.dispose());this.group.removeFromParent();
  }
}
