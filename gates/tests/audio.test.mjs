import assert from 'node:assert/strict';
import test from 'node:test';
import {Soundtrack} from '../audio.js';

const timers=new Map();let nextTimer=1;
globalThis.setInterval=callback=>{const id=nextTimer++;timers.set(id,callback);return id;};
globalThis.clearInterval=id=>timers.delete(id);
class AudioContext {
  state='suspended';currentTime=0;destination={};notes=[];gains=[];resumes=0;
  async resume(){this.resumes++;this.state='running';}
  async suspend(){this.state='suspended';}
  createOscillator(){const note={frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}};this.notes.push(note);return note;}
  createGain(){const events=[],gain={setValueAtTime(value){events.push(value);},exponentialRampToValueAtTime(value){events.push(value);}};this.gains.push(events);return {gain,connect(){}};}
}
globalThis.window={AudioContext};
async function check(callback){const sound=new Soundtrack();try{await sound.enable();await callback(sound);}finally{sound.disable();}}
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
