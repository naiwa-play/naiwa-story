import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
// Usage: node scripts/compact-models.mjs <build-tools/node_modules>
// Build tools: @gltf-transform/core and extensions 4.5.1, meshoptimizer 1.3.0, sharp.
const tools=pathToFileURL(path.resolve(process.argv[2]||'node_modules')+'/'),require=createRequire(new URL('package.json',tools));
const {NodeIO}=await import(new URL('@gltf-transform/core/dist/index.js',tools));
const {ALL_EXTENSIONS,EXTMeshoptCompression,EXTTextureWebP}=await import(new URL('@gltf-transform/extensions/dist/index.js',tools));
const {MeshoptEncoder,MeshoptDecoder}=await import(new URL('meshoptimizer/index.js',tools));
const {default:sharp}=await import(process.env.NAIWA_SHARP||pathToFileURL(require.resolve('sharp')).href);
const root=fileURLToPath(new URL('../',import.meta.url));
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const output=path.join(root,'assets/models/compact');await fs.mkdir(output,{recursive:true});
for(const [name,folder] of [['naiwa','rodin-v4'],['naigou','rodin-naigou'],['naishu','rodin-naishu'],['naiwa-crowd','rodin-v4']]){
  const input=path.join(root,'assets/models',folder,name==='naiwa-crowd'?'naiwa-crowd.glb':name+'-jelly.glb'),document=await io.read(input),primitive=document.getRoot().listMeshes()[0].listPrimitives()[0];
  const arrays=Object.fromEntries(primitive.listSemantics().map(semantic=>[semantic,primitive.getAttribute(semantic).getArray().slice()])),indices=primitive.getIndices().getArray().slice();
  if(name==='naiwa-crowd')for(const texture of document.getRoot().listTextures())texture.dispose();
  else{
    document.createExtension(EXTTextureWebP).setRequired(true);
    for(const texture of document.getRoot().listTextures()){
      const original=texture.getImage(),compressed=await sharp(original).webp({lossless:true,effort:6}).toBuffer();
      assert.deepEqual(await sharp(original).ensureAlpha().raw().toBuffer(),await sharp(compressed).ensureAlpha().raw().toBuffer(),'Texture pixels must be identical');
      texture.setImage(compressed).setMimeType('image/webp').setURI(texture.getURI().replace(/\.png$/,'.webp'));
      console.log(name,texture.getURI(),original.length,'->',compressed.length);
    }
  }
  document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  // No quantize, reorder or simplify transform: the codec must preserve every accessor value.
  const binary=await io.writeBinary(document),file=path.join(output,name+'.glb');await fs.writeFile(file,binary);
  const decoded=await io.read(file);
  const restored=decoded.getRoot().listMeshes()[0].listPrimitives()[0];
  for(const [semantic,expected] of Object.entries(arrays)){const actual=restored.getAttribute(semantic).getArray();assert.equal(actual.length,expected.length);for(let i=0;i<actual.length;i++)assert.ok(actual[i]===expected[i],semantic+' mismatch at '+i);}
  const actualIndices=restored.getIndices().getArray();assert.equal(actualIndices.length,indices.length);
  for(let i=0;i<indices.length;i+=3)assert.ok([0,1,2].some(shift=>[0,1,2].every(k=>actualIndices[i+k]===indices[i+(k+shift)%3])),'Triangle must retain original winding and vertices: '+i);
  console.log('VERIFIED',name,binary.byteLength,'bytes; unchanged geometry and texture pixels');
}
await fs.copyFile(new URL('meshoptimizer/meshopt_decoder.mjs',tools),path.join(root,'vendor/meshopt_decoder.mjs'));
await fs.copyFile(new URL('meshoptimizer/LICENSE.md',tools),path.join(root,'vendor/MESHOPT-LICENSE.md'));
