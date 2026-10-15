// Decode upcoming portraits and share in-flight requests.
export const imageCache=new Map(),mediaCache=new Map();
const pending=new Map();
export function loadImage(src,timeout=20000){
 if(imageCache.has(src))return Promise.resolve(imageCache.get(src));
 if(pending.has(src))return pending.get(src);
 const img=new Image();let timer;
 const job=Promise.race([(async()=>{img.src=src;await img.decode();return img;})(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Image timeout')),timeout);})]).then(image=>{imageCache.set(src,image);return image;}).catch(error=>{img.src='';throw error;}).finally(()=>{clearTimeout(timer);pending.delete(src);});
 pending.set(src,job);return job;
}
export async function preloadAssets(portraits,onProgress,backgrounds=[]){
 const sources=[...new Set([...Object.values(portraits).map(p=>p.src),...backgrounds])];
 const deadline=Date.now()+2500;let cursor=0,done=0;const failed=[];
 await Promise.all(Array.from({length:3},async()=>{while(cursor<sources.length){const i=cursor++;if(imageCache.has(sources[i])){onProgress(++done,sources.length);continue;}let timer;try{await Promise.race([loadImage(sources[i]),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Preload wait ended')),Math.max(1,deadline-Date.now()));})]);}catch{failed.push(i);}finally{clearTimeout(timer);}onProgress(++done,sources.length);}}));
 return failed;
}
