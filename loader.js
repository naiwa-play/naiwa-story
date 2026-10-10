// Decode before exposing the story. Keep decoded images alive for instant swaps.
export const imageCache=new Map();
export const mediaCache=new Map();
export async function preloadAssets(portraits,onProgress){
 const images=[...Object.values(portraits).map(p=>p.src),'./assets/landscape.png'];
 const jobs=images.map(src=>async()=>{if(imageCache.has(src))return;const img=new Image();img.src=src;await img.decode();imageCache.set(src,img);});
 jobs.push(async()=>{if(mediaCache.has('music'))return;const r=await fetch('./assets/calm.ogg');if(!r.ok)throw Error('Music unavailable');mediaCache.set('music',URL.createObjectURL(await r.blob()));});
 let done=0;const failed=[];
 // Six concurrent requests avoid opening a connection for every file at once.
 let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<jobs.length){const i=cursor++;try{await jobs[i]();}catch{failed.push(i);}onProgress(++done,jobs.length);}}));
 return failed;
}
