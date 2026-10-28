// Usage: node scripts/import-rodin.mjs <extracted Rodin folder> <build-tools/node_modules> [naiwa|naigou|naishu]
// Original textures remain untouched. Meshoptimizer and Sharp are build-time tools only.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL,fileURLToPath } from 'node:url';
import { BufferGeometry,Float32BufferAttribute } from '../vendor/three.module.min.js';
const source=path.resolve(process.argv[2]||'');
const tools=path.resolve(process.argv[3]||'node_modules');
const character=process.argv[4]||'naiwa';
const sourceIds={naiwa:'efe70d84-2b6f-4dec-b340-6cf787845531',naigou:'e47ffdf8-ed0a-4538-9ba0-52b23d4b4605',naishu:'769db8ea-c7c0-4bae-8a4e-606af7b45a80'};
if(!(character in sourceIds))throw new Error('Unknown character');
const {MeshoptSimplifier}=await import(pathToFileURL(path.join(tools,'meshoptimizer/meshopt_simplifier.js')));
const {default:sharp}=await import(process.env.NAIWA_SHARP||'sharp');
await MeshoptSimplifier.ready;
const out=new URL(`../assets/models/${character==='naiwa'?'rodin-v4':'rodin-'+character}/`,import.meta.url);await fs.mkdir(out,{recursive:true});
const positions=[],uvs=[],normals=[],points=[],attributes=[],indices=[],vertices=new Map();
for(const line of (await fs.readFile(path.join(source,'base.obj'),'utf8')).split('\n')){
  const t=line.trim().split(/\s+/);
  if(t[0]==='v')positions.push(t.slice(1,4).map(Number));
  else if(t[0]==='vt')uvs.push(t.slice(1,3).map(Number));
  else if(t[0]==='vn')normals.push(t.slice(1,4).map(Number));
  else if(t[0]==='f'){
    const face=t.slice(1).map(key=>{
      if(vertices.has(key))return vertices.get(key);
      const [p,u,n]=key.split('/').map(Number),index=points.length/3;vertices.set(key,index);
      points.push(...positions[p>0?p-1:positions.length+p]);
      attributes.push(...(normals[n-1]||[0,1,0]),...(uvs[u-1]||[0,0]));return index;
    });
    for(let i=1;i<face.length-1;i++)indices.push(face[0],face[i],face[i+1]);
  }
}
const srcPositions=new Float32Array(points),srcAttributes=new Float32Array(attributes),srcIndices=new Uint32Array(indices);
const positionSeams=new Map(),locks=new Uint8Array(srcPositions.length/3);
for(let i=0;i<srcPositions.length/3;i++){const key=[srcPositions[i*3],srcPositions[i*3+1],srcPositions[i*3+2]].join(',');if(positionSeams.has(key)){locks[i]=1;locks[positionSeams.get(key)]=1;}else positionSeams.set(key,i);}
const diffuse=await fs.readFile(path.join(source,'texture_diffuse.png'));
const raw=await sharp(diffuse).raw().toBuffer({resolveWithObject:true});
let front=0,back=0;
for(let i=0;character==='naiwa'&&i<srcPositions.length/3;i++){
  const y=srcPositions[i*3+1],z=srcPositions[i*3+2];if(y<1.35)continue;
  const u=srcAttributes[i*5+3],v=srcAttributes[i*5+4],x=Math.min(raw.info.width-1,Math.max(0,Math.round(u*(raw.info.width-1)))),ty=Math.min(raw.info.height-1,Math.max(0,Math.round((1-v)*(raw.info.height-1))));
  const offset=(ty*raw.info.width+x)*raw.info.channels,[r,g,b]=raw.data.subarray(offset,offset+3);
  if(g>r*1.03&&g>b*1.12){if(z>0)front++;else back++;}
}
const facing=front>=back?1:-1;console.log('Source:',{triangles:srcIndices.length/3,vertices:srcPositions.length/3,facing,greenFront:front,greenBack:back});
const diffuseUrl=`./${character}-color.png`,normalUrl=`./${character}-normal.png`,roughUrl=`./${character}-surface.png`;
await fs.writeFile(new URL(diffuseUrl,out),diffuse);
const normalImage=await sharp(path.join(source,'texture_normal.png')).raw().toBuffer({resolveWithObject:true});
// V changes handedness of the tangent frame. Preserve the original world normals.
for(let i=1;i<normalImage.data.length;i+=normalImage.info.channels)normalImage.data[i]=255-normalImage.data[i];
await sharp(normalImage.data,{raw:{width:normalImage.info.width,height:normalImage.info.height,channels:normalImage.info.channels}}).png().toFile(fileURLToPath(new URL(normalUrl,out)));
const rough=await sharp(path.join(source,'texture_roughness.png')).resize(1024,1024).greyscale().raw().toBuffer();
const packed=Buffer.alloc(1024*1024*3);
for(let i=0;i<rough.length;i++){packed[i*3]=255;packed[i*3+1]=Math.round(Math.max(.46,Math.min(.78,rough[i]/255)) *255);packed[i*3+2]=0;}
await sharp(packed,{raw:{width:1024,height:1024,channels:3}}).png().toFile(fileURLToPath(new URL(roughUrl,out)));

function makeGlb(targetTriangles,highQuality){
  const [simplified,error]=targetTriangles===0?[srcIndices,0]:MeshoptSimplifier.simplifyWithAttributes(srcIndices,srcPositions,3,srcAttributes,5,highQuality?[1,1,1,4,4]:[.15,.15,.15,1,1],highQuality?locks:null,targetTriangles*3,highQuality?.0015:.09,highQuality?['Regularize','LockBorder']:['Regularize','Permissive']);
  const remap=new Map();let p=[],n=[],uv=[],ind=[];
  for(const index of simplified){
    if(!remap.has(index)){
      remap.set(index,p.length/3);p.push(srcPositions[index*3]*facing,srcPositions[index*3+1],srcPositions[index*3+2]*facing);
      n.push(srcAttributes[index*5]*facing,srcAttributes[index*5+1],srcAttributes[index*5+2]*facing);
      // OBJ has a bottom-left texture origin; glTF images start at the top-left.
      uv.push(srcAttributes[index*5+3],1-srcAttributes[index*5+4]);
    }ind.push(remap.get(index));
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(p,3));geometry.setAttribute('normal',new Float32BufferAttribute(n,3));geometry.setAttribute('uv',new Float32BufferAttribute(uv,2));geometry.setIndex(ind);geometry.computeTangents();
  const tangents=geometry.attributes.tangent.array;
  for(let i=0;i<tangents.length;i+=4)if(Math.hypot(tangents[i],tangents[i+1],tangents[i+2])<.1){const j=i/4*3,[x,y,z]=n.slice(j,j+3),t=Math.abs(y)<.9?[z,0,-x]:[0,-z,y],length=Math.hypot(...t);tangents.set([...t.map(v=>v/length),1],i);}
  geometry.dispose();
  const binary=[],bufferViews=[],accessors=[];let offset=0;
  function append(typed){const data=Buffer.from(typed.buffer,typed.byteOffset,typed.byteLength),padding=(4-data.length%4)%4;const index=bufferViews.length;bufferViews.push({buffer:0,byteOffset:offset,byteLength:data.length});binary.push(data,Buffer.alloc(padding));offset+=data.length+padding;return index;}
  function attr(values,components,type='VEC3',bounds=false){
    const data=values instanceof Uint16Array||values instanceof Uint32Array?values:new Float32Array(values),a={bufferView:append(data),componentType:data instanceof Uint16Array?5123:data instanceof Uint32Array?5125:5126,count:data.length/components,type};
    if(bounds){a.min=Array(components).fill(Infinity);a.max=Array(components).fill(-Infinity);for(let i=0;i<data.length;i++){const k=i%components;a.min[k]=Math.min(a.min[k],data[i]);a.max[k]=Math.max(a.max[k],data[i]);}}
    return accessors.push(a)-1;
  }
  const primitive={attributes:{POSITION:attr(p,3,'VEC3',true),NORMAL:attr(n,3),TANGENT:attr(tangents,4,'VEC4'),TEXCOORD_0:attr(uv,2,'VEC2')},indices:attr(p.length/3<65536?new Uint16Array(ind):new Uint32Array(ind),1,'SCALAR'),material:0};
  const rig={nodes:[{name:character,children:[1]},{name:character+'_Rodin_Complete',mesh:0}],meshes:[{name:character+'_Rodin_Complete',primitives:[primitive]}]};
  const roots=[0];
  const g={asset:{version:'2.0',generator:'Naiwa Expedition - Rodin painted model import'},scene:0,scenes:[{nodes:roots}],...rig,materials:[{name:'User painted - soft rubber',pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:1,metallicRoughnessTexture:{index:2}},normalTexture:{index:1,scale:.25},extensions:{KHR_materials_clearcoat:{clearcoatFactor:.16,clearcoatRoughnessFactor:.43}},doubleSided:false}],textures:[{source:0,sampler:0},{source:1,sampler:0},{source:2,sampler:0}],images:[{uri:diffuseUrl},{uri:normalUrl},{uri:roughUrl}],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],bufferViews,accessors,buffers:[{byteLength:offset}],extensionsUsed:['KHR_materials_clearcoat']};
  const json=Buffer.from(JSON.stringify(g)),jsonPad=(4-json.length%4)%4,jsonChunk=Buffer.concat([json,Buffer.alloc(jsonPad,32)]),bin=Buffer.concat(binary),header=Buffer.alloc(20);header.write('glTF',0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jsonChunk.length+bin.length,8);header.writeUInt32LE(jsonChunk.length,12);header.writeUInt32LE(0x4e4f534a,16);const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(bin.length,0);binHeader.writeUInt32LE(0x004e4942,4);
  console.log(highQuality?'Game':targetTriangles===0?'Original':'Crowd',{triangles:ind.length/3,vertices:p.length/3,error});
  return Buffer.concat([header,jsonChunk,binHeader,bin]);
}
await fs.writeFile(new URL(`${character}-original.glb`,out),makeGlb(0,false));
await fs.writeFile(new URL(`${character}-jelly.glb`,out),makeGlb(160000,true));
if(character==='naiwa')await fs.writeFile(new URL('naiwa-crowd.glb',out),makeGlb(1200,false));
await fs.writeFile(new URL('rodin-source.json',out),JSON.stringify({id:sourceIds[character],source:'User-supplied Rodin OBJ and textures',originalTriangles:srcIndices.length/3,paint:'Original diffuse texture preserved byte for byte; OBJ V converted to glTF image coordinates',material:'Nonmetallic soft rubber, original tangent normal and bounded roughness',animation:'Whole-model squash/stretch and hit rotation in jelly-motion.js. No cuts, caps, skinning or vertex deformation.',sourceFacing:facing},null,2)+'\n');
