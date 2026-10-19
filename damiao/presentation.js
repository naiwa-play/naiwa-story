// Positions are camera blocking, not random decoration: feet land on the painted
// floor, track or path. Indoor first-person scenes do not need a standing avatar.
export function placement(n){
 const round=n.round??1;
 if(![2,4,5].includes(round)||n.frog||n.portrait===false)return null;
 const shots={
  field:[17,2,28],sealed:[18,1,30],small:[70,4,36],
  gate:[40,5,45],corridor:[65,3,49],dawn:[60,3,45],
  terrace:[39,13,30],jinyin:[16,0,36],'jinyin-night':[16,0,36],
  observatory:[66,1,43],'observatory-reverse':[10,0,34]
 };
 return n.portrait||shots[n.scene]||null;
}

export const tracks={
 campus:{src:'./music/mountain-pages.mp3?v=4',title:'山中旧页',volume:.32},
 fifth:{src:'./music/fifth-memory.mp3?v=4',title:'第五回 · 回声',volume:.18}
};

// One audio element owns the whole chapter. Changing rounds replaces its source;
// no second player is left running beneath a different score.
export function createScore(audio,doc,onChange){
 let wanted=false,current='',revision=0,failed=false;
 audio.loop=true;audio.preload='none';
 const notify=()=>onChange({wanted,paused:audio.paused,failed,title:tracks[current]?.title||''});
 async function resume(){
  if(!wanted||doc.hidden)return;
  const turn=revision;
  try{await audio.play();if(!wanted||doc.hidden)audio.pause();}
  catch{if(turn===revision){failed=true;wanted=false;}}
  notify();
 }
 const stop=()=>{wanted=false;revision++;audio.pause();notify();};
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)audio.pause();else void resume();notify();});
 audio.addEventListener('error',()=>{if(wanted){wanted=false;failed=true;}notify();});
 return {
  select(round){const name=round===5?'fifth':'campus';if(current===name)return;current=name;revision++;audio.pause();audio.src=tracks[name].src;audio.volume=tracks[name].volume;audio.load();failed=false;notify();void resume();},
  toggle(){if(wanted)stop();else{wanted=true;failed=false;void resume();notify();}},
  stop
 };
}
