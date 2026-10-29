import assert from 'node:assert/strict';
import test from 'node:test';
import {Soundtrack} from '../audio.js';

const timers=new Map();let nextTimer=1;
globalThis.setInterval=callback=>{const id=nextTimer++;timers.set(id,callback);return id;};
globalThis.clearInterval=id=>timers.delete(id);
class AudioContext {
  state='suspended';currentTime=0;destination={};notes=[];gains=[];sources=[];resumes=0;
  async resume(){this.resumes++;this.state='running';}
  async suspend(){this.state='suspended';}
  createOscillator(){const note={frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}};this.notes.push(note);return note;}
  createGain(){const events=[],gain={setValueAtTime(value){events.push(value);},exponentialRampToValueAtTime(value){events.push(value);}};this.gains.push(events);return {gain,connect(){},disconnect(){}};}
  async decodeAudioData(){return {duration:1.2};}
  createBufferSource(){const source={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;this.onended?.();}};this.sources.push(source);return source;}
}
globalThis.window={AudioContext};
globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
async function check(callback){const sound=new Soundtrack();try{await sound.enable();await sound.loadVoices();await callback(sound);}finally{sound.disable();}}
await test('click immediately starts background music',()=>check(sound=>{
  assert.ok(sound.ctx.notes.length>0,'Enabling sound must immediately start music');
}));
await test('music is audible and keeps looping',()=>check(sound=>{
  const before=sound.ctx.notes.length;timers.values().next().value();
  assert.ok(sound.ctx.notes.length>before);
  assert.ok(Math.max(...sound.ctx.gains.flat())>=.05,'Background music must have an audible peak level');
}));
await test('interrupted phone audio wakes up without creating duplicate loops',()=>check(async sound=>{
  sound.ctx.state='interrupted';await sound.resume();
  assert.equal(sound.ctx.state,'running');assert.equal(timers.size,1);
  sound.pause();assert.equal(timers.size,0);
  sound.ctx.state='suspended';await sound.resume();
  assert.equal(sound.ctx.state,'running');assert.equal(timers.size,1);
  sound.disable();assert.equal(sound.enabled,false);assert.equal(timers.size,0);
  await sound.enable();assert.equal(sound.ctx.state,'running');assert.equal(timers.size,1);
}));
await test('pausing while the audio context wakes up keeps the music paused',()=>check(async sound=>{
  let finishResume;sound.ctx.state='interrupted';sound.ctx.resume=()=>new Promise(resolve=>{finishResume=()=>{sound.ctx.state='running';resolve();};});
  const waking=sound.resume();sound.pause();finishResume();await waking;
  assert.equal(timers.size,0);
}));
await test('card, boss, hurt and full charge use the matching user voice clips',async()=>{
  for(const [event,clip] of [['card','andy'],['boss','laugh'],['ready','laugh'],['hurt','gaga'],['kill','andy']])await check(sound=>{
    sound.effect(event);assert.equal(sound.voiceActive.source.buffer,sound.buffers[clip]);assert.equal(sound.ctx.sources.length,1);
  });
});
await test('crowded enemy kills respect an eight second voice cooldown',()=>check(sound=>{
  sound.effect('kill');for(let i=0;i<50;i++)sound.effect('kill');assert.equal(sound.ctx.sources.length,1);
  sound.ctx.currentTime=2;sound.voiceActive.source.onended();
  sound.ctx.currentTime=7.99;sound.effect('kill');assert.equal(sound.ctx.sources.length,1);
  sound.ctx.currentTime=8;sound.effect('kill');assert.equal(sound.ctx.sources.length,2);
}));
await test('hurt interrupts a minor kill voice and boss/full charge laughter does not overlap',()=>check(sound=>{
  sound.effect('kill');const first=sound.voiceActive.source;sound.effect('hurt');assert.equal(first.stopped,true);assert.equal(sound.voiceActive.source.buffer,sound.buffers.gaga);
  sound.effect('boss');const boss=sound.voiceActive.source;sound.effect('ready');assert.equal(sound.voiceActive.source,boss);assert.equal(sound.pendingVoice,null);
}));
await test('boss laughter finishes over reward cards, then the selected card voice plays',()=>check(sound=>{
  sound.effect('boss');const boss=sound.voiceActive.source;sound.pause(false);assert.equal(boss.stopped,undefined);
  sound.effect('card');assert.equal(sound.pendingVoice,'card');assert.equal(sound.ctx.sources.length,1);
  sound.ctx.currentTime=2.2;boss.onended();assert.equal(sound.voiceActive.source.buffer,sound.buffers.andy);assert.equal(sound.ctx.sources.length,2);
  sound.pause();assert.equal(sound.voiceActive,null);assert.equal(sound.pendingVoice,null);
}));
await test('voice ducks the music and muting stops all voice playback',()=>check(sound=>{
  sound.effect('card');timers.values().next().value();assert.ok(Math.max(...sound.ctx.gains.at(-1))<.03);
  const voice=sound.voiceActive.source;voice.onended();timers.values().next().value();assert.ok(Math.max(...sound.ctx.gains.at(-1))>=.05);
  sound.ctx.currentTime=2;sound.effect('hurt');const hurt=sound.voiceActive.source;sound.disable();assert.equal(hurt.stopped,true);
  const count=sound.ctx.sources.length;sound.effect('boss');assert.equal(sound.ctx.sources.length,count);assert.equal(sound.pendingVoice,null);
}));
