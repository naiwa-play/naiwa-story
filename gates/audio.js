// Original lightweight score and effects. No remote audio requests or autoplay.
export class Soundtrack {
  constructor(){this.enabled=false;this.theme='coast';this.timer=null;this.step=0;this.playing=false;}
  async enable(){this.ctx??=new (window.AudioContext||window.webkitAudioContext)();await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio playback has not started');this.enabled=true;await this.resume();}
  tone(frequency,length=.12,volume=.025,type='sine',delay=0){if(!this.enabled||this.ctx.state!=='running')return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),start=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(frequency,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+length);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+length+.03);}
  effect(kind){if(kind==='ready'){[659,831,987,1318].forEach((f,i)=>this.tone(f,.32,.04,'sine',i*.09));}else if(kind==='gate'){[523.25,659.25,783.99].forEach((f,i)=>this.tone(f,.25,.035,'sine',i*.06));}else if(kind==='hit')this.tone(220+Math.random()*120,.065,.009,'triangle');else if(kind==='hurt')this.tone(130,.18,.035,'triangle');else if(kind==='win')[523,659,784,1046].forEach((f,i)=>this.tone(f,.65,.04,'sine',i*.16));else if(kind==='burst')[262,392,523,784].forEach((f,i)=>this.tone(f,.5,.035,'triangle',i*.06));}
  pause(){this.playing=false;clearInterval(this.timer);this.timer=null;}
  disable(){this.pause();this.enabled=false;this.ctx?.suspend();}
  async resume(){
    if(!this.enabled)return;this.playing=true;
    if(this.ctx.state!=='running'){try{await this.ctx.resume();}catch{return;}}
    if(!this.enabled||!this.playing||this.ctx.state!=='running'||this.timer!==null)return;
    const beat=()=>{const coast=[60,64,67,71,67,64,62,67,59,62,67,69,67,62,64,67],forest=[57,60,64,69,64,60,55,64,53,57,60,65,60,57,55,60];const halloween=[57,60,63,69,63,60,56,63,53,56,60,65,60,56,55,60],notes=this.theme==='halloween'?halloween:this.theme==='forest'?forest:coast,n=notes[this.step%notes.length];this.tone(440*2**((n-69)/12),.55,.065,'sine');if(this.step%4===0)this.tone(440*2**((n-81)/12),1.3,.045,'triangle');this.step++;};
    beat();this.timer=setInterval(beat,310);
  }
}
