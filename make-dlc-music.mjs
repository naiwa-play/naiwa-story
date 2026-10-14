// Original, deterministic ambient scores. Circular tails make the WAV loop seamless.
import fs from 'node:fs';
const rate=22050, bars=16, beats=4;
const scores=[
 {file:'thirteenth-bell',bpm:54, chords:[[45,52,59,60],[41,48,55,59],[43,50,57,58],[40,47,53,59]], melody:[76,null,72,null,71,null,67,null,72,null,71,67,null,64,null,null], dark:true},
 {file:'white-echo',bpm:56,chords:[[38,45,52,57],[43,50,57,62],[35,42,50,57],[40,47,54,59]],melody:[74,null,78,81,null,78,74,null,71,null,74,78,null,76,74,null]},
 {file:'sea-letter',bpm:64,chords:[[48,55,59,64],[45,52,59,64],[41,48,55,60],[43,50,57,62]],melody:[76,79,null,83,81,79,76,null,74,76,79,null,76,74,72,null]}
];
fs.mkdirSync('assets/music',{recursive:true});
for(const s of scores){
 const beat=60/s.bpm,seconds=bars*beats*beat,N=Math.round(seconds*rate),mix=new Float64Array(N);
 function note(midi,start,duration,gain,pad=false){
  const freq=440*2**((midi-69)/12),len=Math.ceil(duration*rate),offset=Math.round(start*rate);
  for(let i=0;i<len;i++){
   const t=i/rate,u=t/duration,attack=1-Math.exp(-t/(pad?.8:.018));
   const env=attack*(pad?Math.sin(Math.PI*u)**1.4:Math.exp(-t/1.5)*(1-u)**2);
   const wave=pad?(Math.sin(2*Math.PI*freq*t)+.22*Math.sin(2*Math.PI*freq*1.0015*t)+.13*Math.sin(4*Math.PI*freq*t)):(Math.sin(2*Math.PI*freq*t)+.19*Math.sin(2*Math.PI*freq*2.002*t)*Math.exp(-t*2));
   const value=wave*env*gain;
   mix[(offset+i)%N]+=value;
   if(!pad)for(const [delay,level]of [[.19,.18],[.41,.12],[.73,.07]])mix[(offset+i+Math.round(delay*rate))%N]+=value*level;
  }
 }
 for(let bar=0;bar<bars;bar++){
  const chord=s.chords[bar%4],start=bar*4*beat,phrase=Math.floor(bar/4);
  chord.forEach((pitch,j)=>note(pitch,start+j*.07,beat*5,.025,true));
  note(chord[0]-12,start,beat*4,.026,true);
  for(let step=0;step<4;step++){
   const pitch=s.melody[(bar*2+step)%s.melody.length];
   if(pitch!==null&&(!s.dark||step===0||bar%4===3))note(pitch,start+step*beat,beat*3,s.dark?.035:.048);
  }
  if(!s.dark&&phrase%2===1)note(chord[2]+12,start+1.5*beat,beat*2,.025);
 }
 let peak=0,sum=0;for(const x of mix){peak=Math.max(peak,Math.abs(x));sum+=x*x;}
 const scale=.56/peak,buf=Buffer.alloc(44+N*2);
 buf.write('RIFF');buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
 for(let i=0;i<N;i++)buf.writeInt16LE(Math.round(mix[i]*scale*32767),44+i*2);
 fs.writeFileSync(`assets/music/${s.file}.wav`,buf);
 console.log(`${s.file}: ${seconds.toFixed(2)}s, ${(buf.length/1048576).toFixed(2)} MiB, RMS ${(Math.sqrt(sum/N)*scale).toFixed(3)}, seam ${Math.abs(mix[0]-mix[N-1]).toFixed(5)}`);
}
