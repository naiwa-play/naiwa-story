import * as T from './vendor/three.module.min.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {jellyPose,applyJellyPose} from './jelly-motion.js';
const canvas=document.querySelector('canvas'),status=document.querySelector('#status');
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#f5f3e9');
const camera=new T.PerspectiveCamera(32,1,.05,100),motion=new T.Group();scene.add(motion);
scene.add(new T.HemisphereLight('#fffaf0','#9b9c87',2.05));
const key=new T.DirectionalLight('#fff6e5',2.4);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-3,right:3,top:4,bottom:-3});key.shadow.normalBias=.015;scene.add(key);
const fill=new T.DirectionalLight('#f3f7ff',.7);fill.position.set(3,3,-2);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:'#f5f3e9',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.006;floor.receiveShadow=true;scene.add(floor);
const lane=new T.Group();scene.add(lane);for(let i=0;i<18;i++)for(const x of [-.85,.85]){const dash=new T.Mesh(new T.BoxGeometry(.025,.003,.24),new T.MeshBasicMaterial({color:'#cad4b7'}));dash.position.set(x,.001,i*.6-6);lane.add(dash);}
let time=0,hurtAge=Infinity,mode='run',angle=0,pitch=.08,distance=5,model,spinning=false,stride=1;
const characterNames={naiwa:'奶蛙',naigou:'奶狗',naishu:'奶鼠'};
const requestedCharacter=new URLSearchParams(location.search).get('character');
let character=Object.hasOwn(characterNames,requestedCharacter)?requestedCharacter:'naiwa';
const loader=new GLTFLoader(),cache=new Map();
async function loadModel(original=false){
  status.hidden=false;status.textContent='正在载入模型与贴图…';document.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const name=character+(original?'-original':'-jelly'),folder=character==='naiwa'?'rodin-v4':'rodin-'+character;if(!cache.has(name))cache.set(name,await loader.loadAsync(`./assets/models/${folder}/${name}.glb?v=8`));if(model)motion.remove(model);model=cache.get(name).scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;}});motion.add(model);document.querySelector('#original').setAttribute('aria-pressed',String(original));document.querySelector('#model-title').textContent=characterNames[character]+' · Q 弹预览';document.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===character)));status.hidden=true;}
  catch(e){status.textContent='模型加载失败，请刷新重试。';console.error(e);}
  finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();distance=Math.max(4.8,2.0/(2*Math.tan(T.MathUtils.degToRad(16))*camera.aspect)*1.1);}
addEventListener('resize',resize);resize();
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));});
document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>{angle=Number(b.dataset.angle);pitch=.08;});
document.querySelector('#hurt').onclick=()=>{hurtAge=0;};
document.querySelector('#spin').onclick=e=>{spinning=!spinning;e.currentTarget.setAttribute('aria-pressed',String(spinning));};
document.querySelector('#original').onclick=e=>loadModel(e.currentTarget.getAttribute('aria-pressed')!=='true');
document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{character=b.dataset.character;hurtAge=Infinity;loadModel(document.querySelector('#original').getAttribute('aria-pressed')==='true');});
const pointers=new Map();let pinch=0;
canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);pinch=0;});
canvas.addEventListener('pointermove',e=>{const prev=pointers.get(e.pointerId);if(!prev)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch)distance=T.MathUtils.clamp(distance*pinch/d,2.5,12);pinch=d;}else{angle-=(e.clientX-prev[0])*.008;pitch=T.MathUtils.clamp(pitch+(e.clientY-prev[1])*.005,-.12,.8);}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{pointers.delete(e.pointerId);pinch=0;});
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.004,2.5,12);},{passive:false});
const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(!document.hidden){time+=dt;hurtAge+=dt;stride+=((mode==='run'?1:0)-stride)*Math.min(1,dt*12);if(spinning)angle+=dt*.25;}applyJellyPose(motion,jellyPose(time,{moving:stride,hurtAge}));lane.position.z=mode==='run'?(time*1.4)%.6:0;const r=distance*Math.cos(pitch);camera.position.set(Math.sin(angle)*r,.96+distance*Math.sin(pitch),Math.cos(angle)*r);camera.lookAt(0,.96,0);renderer.render(scene,camera);}frame();
await loadModel();
