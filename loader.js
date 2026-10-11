// Decode before exposing the story. Keep decoded images alive for instant swaps.
export const imageCache=new Map();
export const mediaCache=new Map();
export async function preloadAssets(portraits,onProgress){
 const images=[...Object.values(portraits).map(p=>p.src),'./assets/landscape.png',...['liner','trail','hospital','opera'].map(id=>'./assets/nightmares/'+id+'.svg')];
 // Music is optional and loads only when the player presses its button.
 // One deadline covers the whole queue, including stalled image decoding.
 const deadline=Date.now()+4500;
 const jobs=images.map(src=>async()=>{if(imageCache.has(src))return;const img=new Image();let timer;try{await Promise.race([(async()=>{img.src=src;await img.decode();})(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Image timeout')),Math.max(0,deadline-Date.now()));})]);imageCache.set(src,img);}catch(error){img.src='';throw error;}finally{clearTimeout(timer);}});
 let done=0;const failed=[];
 // Six concurrent requests avoid opening a connection for every file at once.
 let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<jobs.length){const i=cursor++;try{await jobs[i]();}catch{failed.push(i);}onProgress(++done,jobs.length);}}));
 return failed;
}
