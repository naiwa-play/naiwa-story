// Reference motion: compress on the floor, stretch on take-off, settle on landing.
// Applied to the whole asset; geometry, UVs and individual limbs stay untouched.
const keys=[[0,.70,0],[.13,.84,0],[.30,1.15,.08],[.50,1.03,.16],[.74,.94,.07],[.89,.70,0],[1,.70,0]];
export const HURT_DURATION=.8;
export function jellyPose(time,{moving=false,phase=0,hurtAge=Infinity}={}){
  const hurt=hurtAge>=0&&hurtAge<HURT_DURATION;
  const strength=hurt?1:Math.max(0,Math.min(1,Number(moving)));
  const cycle=((time/.72+phase)%1+1)%1;
  let sy=1,y=0;
  for(let i=1;i<keys.length;i++)if(cycle<=keys[i][0]){
    const a=keys[i-1],b=keys[i],t=(cycle-a[0])/(b[0]-a[0]),ease=t*t*(3-2*t);
    sy=1+(a[1]+(b[1]-a[1])*ease-1)*strength;
    y=(a[2]+(b[2]-a[2])*ease)*strength;break;
  }
  sy+=Math.sin(time*1.8+phase)*.012*(1-strength);
  let turn=0;
  if(hurt){const p=hurtAge/HURT_DURATION;sy*=1-.26*Math.exp(-hurtAge*7)*Math.cos(hurtAge*22);y+=Math.sin(p*Math.PI)*.075;turn=Math.PI*2*(1-(1-p)**3);}
  const wide=1/Math.sqrt(sy);
  return {scaleX:wide,scaleY:sy,scaleZ:wide,y,turn};
}
export function applyJellyPose(target,pose){
  target.scale.set(pose.scaleX,pose.scaleY,pose.scaleZ);
  target.position.y=pose.y;target.rotation.y=pose.turn;
}
