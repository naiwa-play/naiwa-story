// Original, deterministic ambient scores. Circular tails make the WAV loop seamless.
import fs from 'node:fs';
const rate=22050;
const scores=[
 {file:'thirteenth-bell',bpm:48,bars:16,beats:4,voice:'bell', chords:[[45,52,59,60],[41,48,55,59],[43,50,57,58],[40,47,53,59]], melody:[76,null,72,null,71,null,67,null,72,null,71,67,null,64,null,null], dark:true},
 {file:'white-echo',bpm:56,bars:16,beats:4,voice:'air',chords:[[38,45,52,57],[43,50,57,62],[35,42,50,57],[40,47,54,59]],melody:[74,null,78,81,null,78,74,null,71,null,74,78,null,76,74,null]},
 {file:'sea-letter',bpm:60,bars:24,beats:3,voice:'piano',chords:[[48,55,59,64],[45,52,59,64],[41,48,55,60],[43,50,57,62]],melody:[76,79,null,83,81,79,76,null,74,76,79,null,76,74,72,null]}
];
fs.mkdirSync('assets/music',{recursive:true});
for(const s of scores){
 const beat=60/s.bpm,seconds=s.bars*s.beats*beat,N=Math.round(seconds*rate),mix=new Float64Array(N);
 function note(midi,start,duration,gain,pad=false){
  const freq=440*2**((midi-69)/12),len=Math.ceil(duration*rate),offset=Math.round(start*rate);
  for(let i=0;i<len;i++){
   const t=i/rate,u=t/duration,phase=2*Math.PI*freq*t;
   let env,wave;
   if(pad){
    env=(1-Math.exp(-t/.9))*Math.sin(Math.PI*u)**1.4;
    wave=Math.sin(phase)+.15*Math.sin(phase*1.002);
    if(s.voice==='air')wave=wave*.7+.12*Math.sin(phase*3)*Math.sin(t*1.4);
   }else if(s.voice==='bell'){
    env=(1-Math.exp(-t/.012))*Math.exp(-t/2.8)*(1-u)**2;
    wave=Math.sin(phase)+.35*Math.sin(phase*2.71)*Math.exp(-t*.6)+.16*Math.sin(phase*4.08)*Math.exp(-t*1.2);
   }else if(s.voice==='air'){
    env=(1-Math.exp(-t/1.2))*Math.sin(Math.PI*u)**1.6;
    wave=Math.sin(phase+.014*Math.sin(t*3))+.12*Math.sin(phase*2);
   }else{
    env=(1-Math.exp(-t/.008))*Math.exp(-t/1.1)*(1-u)**2;
    wave=Math.sin(phase)+.35*Math.sin(phase*2)*Math.exp(-t*1.2)+.17*Math.sin(phase*3)*Math.exp(-t*2)+.06*Math.sin(phase*4)*Math.exp(-t*3);
   }
   const value=wave*env*gain;
   mix[(offset+i)%N]+=value;
   if(!pad)for(const [delay,level]of [[.19,.18],[.41,.12],[.73,.07]])mix[(offset+i+Math.round(delay*rate))%N]+=value*level;
  }
 }
 for(let bar=0;bar<s.bars;bar++){
  const chord=s.chords[bar%4],start=bar*s.beats*beat;
  if(s.voice==='piano'){
   // A gentle waltz: bass, then two broken-chord responses, with a separate melody.
   note(chord[0]-12,start,beat*2.8,.055);
   for(let k=1;k<3;k++)for(let j=1;j<4;j++)note(chord[j],start+k*beat+(j-1)*.055,beat*1.8,.026);
   for(let k=0;k<3;k++){const pitch=s.melody[(bar*3+k)%s.melody.length];if(pitch!==null)note(pitch,start+k*beat,beat*2,.065);}
  }else if(s.voice==='bell'){
   note(chord[0]-12,start,beat*5,.05,true);
   note(chord[1]-12,start+beat,beat*4,.023,true);
   if(bar%2===0)note( s.melody[(bar*2)%s.melody.length]-12,start+.5*beat,beat*5,.07);
   if(bar%4===3)note(chord[3],start+3*beat,beat*3,.035);
  }else{
   chord.forEach((pitch,j)=>note(pitch,start+j*.18,beat*6,.026,true));
   note(chord[0]-12,start,beat*5,.02,true);
   const pitch=s.melody[(bar*2)%s.melody.length];
   if(pitch!==null)note(pitch,start+beat,beat*5,.055);
   if(bar%4===2)note(chord[2]+24,start+2*beat,beat*4,.025);
  }
 }
 let peak=0,sum=0;for(const x of mix){peak=Math.max(peak,Math.abs(x));sum+=x*x;}
 const scale=.56/peak,buf=Buffer.alloc(44+N*2);
 buf.write('RIFF');buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
 for(let i=0;i<N;i++)buf.writeInt16LE(Math.round(mix[i]*scale*32767),44+i*2);
 fs.writeFileSync(`assets/music/${s.file}.wav`,buf);
 console.log(`${s.file}: ${seconds.toFixed(2)}s, ${(buf.length/1048576).toFixed(2)} MiB, RMS ${(Math.sqrt(sum/N)*scale).toFixed(3)}, seam ${Math.abs(mix[0]-mix[N-1]).toFixed(5)}`);
}
