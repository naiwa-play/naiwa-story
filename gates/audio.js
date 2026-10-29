// Local voice clips and original lightweight score. Playback requires the sound switch.
const VOICE_FILES={andy:'andy.mp3',laugh:'laugh.mp3',gaga:'gaga.mp3'};
const VOICES={card:{clip:'andy',cooldown:.8,priority:2},boss:{clip:'laugh',cooldown:3,priority:4},ready:{clip:'laugh',cooldown:3,priority:4},hurt:{clip:'gaga',cooldown:1.5,priority:3},kill:{clip:'andy',cooldown:8,priority:1}};
export class Soundtrack {
  constructor(){this.enabled=false;this.theme='coast';this.timer=null;this.step=0;this.playing=false;this.buffers={};this.voiceLoad=null;this.voiceActive=null;this.pendingVoice=null;this.lastVoice={};this.lastVoiceAt=-Infinity;}
  async enable(){this.ctx??=new (window.AudioContext||window.webkitAudioContext)();await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio playback has not started');this.enabled=true;await this.resume();this.loadVoices();}
  async loadVoices(){
    if(this.voiceLoad)return this.voiceLoad;
    this.voiceLoad=Promise.all(Object.entries(VOICE_FILES).filter(([name])=>!this.buffers[name]).map(async([name,file])=>{
      try{const response=await fetch(new URL('./assets/audio/'+file,import.meta.url));if(!response.ok)throw new Error('Audio HTTP '+response.status);this.buffers[name]=await this.ctx.decodeAudioData(await response.arrayBuffer());}catch(error){console.warn('Voice clip could not load: '+name,error);}
    }));
    try{await this.voiceLoad;}finally{this.voiceLoad=null;}
  }
  stopVoice(clearPending=true){const active=this.voiceActive;this.voiceActive=null;if(clearPending)this.pendingVoice=null;if(active)active.source.stop();}
  voice(kind){
    const spec=VOICES[kind],now=this.ctx?.currentTime;
    if(!spec||!this.enabled||this.ctx?.state!=='running'||!this.buffers[spec.clip])return false;
    if(now-(this.lastVoice[kind]??-Infinity)<spec.cooldown)return true;
    if(kind==='kill'&&(this.voiceActive||now-this.lastVoiceAt<2))return true;
    if(this.voiceActive){
      if(this.voiceActive.clip===spec.clip)return true;
      if(spec.priority<=this.voiceActive.priority){if(!this.pendingVoice||spec.priority>VOICES[this.pendingVoice].priority)this.pendingVoice=kind;return true;}
      this.stopVoice(false);
    }
    const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=this.buffers[spec.clip];gain.gain.setValueAtTime(.85,now);source.connect(gain);gain.connect(this.ctx.destination);
    this.voiceActive={source,gain,clip:spec.clip,priority:spec.priority};this.lastVoice[kind]=now;this.lastVoiceAt=now;
    source.onended=()=>{source.disconnect();gain.disconnect();if(this.voiceActive?.source!==source)return;this.voiceActive=null;const next=this.pendingVoice;this.pendingVoice=null;if(next)this.voice(next);};
    source.start();return true;
  }
  tone(frequency,length=.12,volume=.025,type='sine',delay=0){if(!this.enabled||this.ctx.state!=='running')return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),start=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(frequency,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+length);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+length+.03);}
  effect(kind){if(this.voice(kind)||kind==='hit'&&this.voiceActive)return;if(kind==='ready'){[659,831,987,1318].forEach((f,i)=>this.tone(f,.32,.04,'sine',i*.09));}else if(kind==='gate'||kind==='card'){[523.25,659.25,783.99].forEach((f,i)=>this.tone(f,.25,.035,'sine',i*.06));}else if(kind==='hit')this.tone(220+Math.random()*120,.065,.009,'triangle');else if(kind==='hurt')this.tone(130,.18,.035,'triangle');else if(kind==='win'||kind==='boss')[523,659,784,1046].forEach((f,i)=>this.tone(f,.65,.04,'sine',i*.16));else if(kind==='burst')[262,392,523,784].forEach((f,i)=>this.tone(f,.5,.035,'triangle',i*.06));}
  pause(stopVoice=true){this.playing=false;clearInterval(this.timer);this.timer=null;if(stopVoice)this.stopVoice();}
  disable(){this.pause();this.enabled=false;this.ctx?.suspend();}
  async resume(){
    if(!this.enabled)return;this.playing=true;
    if(this.ctx.state!=='running'){try{await this.ctx.resume();}catch{return;}}
    if(!this.enabled||!this.playing||this.ctx.state!=='running'||this.timer!==null)return;
    const beat=()=>{
      const coast=[60,64,67,72,71,67,64,67,62,65,69,74,72,69,67,64],forest=[60,65,69,72,69,67,65,64,62,65,69,74,72,69,67,65];
      const halloween=[57,60,63,69,67,63,60,63,56,59,62,68,67,62,59,56],notes=this.theme==='halloween'?halloween:this.theme==='forest'?forest:coast,n=notes[this.step%notes.length],frequency=440*2**((n-69)/12),duck=this.voiceActive ? .16 : 1;
      this.tone(frequency,.35,.16*duck,'triangle');
      if(this.step%4===0)this.tone(frequency/2,.65,.08*duck,'triangle');
      if(this.step%2===1)this.tone(frequency*2,.13,.025*duck,'sine',.135);
      this.step++;
    };
    beat();this.timer=setInterval(beat,270);
  }
}
