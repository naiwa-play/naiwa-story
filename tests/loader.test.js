import assert from 'node:assert/strict';
import {preloadAssets,imageCache,loadImage} from '../loader.js';
let release,attempts=0;
globalThis.Image=class {decode(){if(this.src==='retry.webp'&&attempts++===0)return Promise.reject(Error('temporary'));return this.src.includes('stalled')?new Promise(r=>release=r):this.src.includes('broken')?Promise.reject(Error('decode failed')):Promise.resolve();}};
globalThis.fetch=()=>{throw Error('Optional audio must not block startup');};
let start=Date.now(),progress=[];
assert.deepEqual(await preloadAssets({good:{src:'good.webp'}},(n,total)=>progress.push([n,total])),[]);
assert(Date.now()-start<1000);assert.deepEqual(progress.at(-1),[1,1]);
start=Date.now();progress=[];
const failures=await preloadAssets({good:{src:'good.webp'},slow:{src:'stalled.webp'},bad:{src:'broken.webp'}},(n,total)=>progress.push([n,total]));
assert.deepEqual(failures.sort(),[1,2]);assert(Date.now()-start<3500);assert.deepEqual(progress.at(-1),[3,3]);assert(imageCache.has('good.webp'));assert(!imageCache.has('stalled.webp'));
const waiting=loadImage('stalled.webp');release();await waiting;assert(imageCache.has('stalled.webp'),'Slow image survives preload deadline and is usable without reload');
await assert.rejects(loadImage('retry.webp'));await loadImage('retry.webp');assert(imageCache.has('retry.webp'),'Failed downloads can retry');
await assert.rejects(loadImage('stalled-timeout.webp',25));
console.log('PASS: nonblocking preload, late image retained, retry after failure, permanent download timeout.');

// Cached assets should report progress without allocating any timeout or decoding again.
const originalTimeout=globalThis.setTimeout;
globalThis.setTimeout=()=>{throw Error('Cached images must not create timeout work');};
try{
 const cachedProgress=[];
 assert.deepEqual(await preloadAssets({one:{src:'good.webp'},duplicate:{src:'good.webp'},two:{src:'retry.webp'}},(done,total)=>cachedProgress.push([done,total])),[]);
 assert.deepEqual(cachedProgress,[[1,2],[2,2]]);
}finally{globalThis.setTimeout=originalTimeout;}
console.log('PASS: cached preload skips timers and preserves deduplicated progress.');
