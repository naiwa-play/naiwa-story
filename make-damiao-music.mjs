// Original 64-second pentatonic miniature, “山中旧页”. Render to a local WAV,
// then encode the delivery MP3. Delayed tails wrap into the start of the loop.
import fs from 'node:fs';
const output=process.argv[2];if(!output)throw Error('Pass an output WAV path.');
const rate=44100,N=64*rate,L=new Float64Array(N),R=new Float64Array(N);
function tone(midi,at,duration,gain,pan=0,air=false){
 const f=440*2**((midi-69)/12),length=Math.round(duration*rate),offset=Math.round(at*rate);
 for(let i=0;i<length;i++){
  const t=i/rate,u=i/length,p=2*Math.PI*f*t;
  const env=air?Math.sin(Math.PI*u)**2:(1-Math.exp(-t/.014))*Math.exp(-t/1.1)*(1-u)**2;
  const wave=air?Math.sin(p+.008*Math.sin(t*4))+.08*Math.sin(p*2):Math.sin(p)+.28*Math.sin(p*2)*Math.exp(-t*2)+.09*Math.sin(p*3)*Math.exp(-t*3);
  const v=env*wave*gain,k=(offset+i)%N;L[k]+=v*(1-pan);R[k]+=v*(1+pan);
  for(const [delay,level]of [[.29,.12],[.61,.08],[1.07,.04]]){const j=(k+Math.round(delay*rate))%N;L[j]+=v*level*(1+pan);R[j]+=v*level*(1-pan);}
 }
}
const roots=[50,47,43,45],notes=[[74,78,81,78],[76,74,71,69],[74,78,81,83],[81,78,76,74]];
for(let bar=0;bar<16;bar++){
 const at=bar*4,root=roots[bar%4];tone(root-12,at,6,.035,-.12,true);tone(root+7,at+.2,5,.018,.18,true);
 tone(root,at,2.8,.13,-.32);tone(root+12,at+1.8,3,.045,.32);
 const phrase=notes[Math.floor(bar/4)];tone(phrase[bar%4],at+.65,3.5,.095,.1);
 if(bar%4===1)tone(phrase[2],at+2.7,2.8,.04,-.25);
 if(bar%4===3)tone(74,at+2.3,3,.035,.25);
}
let peak=0;for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
const scale=.63/peak,b=Buffer.alloc(44+N*4);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){b.writeInt16LE(Math.round(L[i]*scale*32767),44+i*4);b.writeInt16LE(Math.round(R[i]*scale*32767),46+i*4);}
fs.writeFileSync(output,b);console.log('山中旧页: 64s stereo, circular decay, '+output);
