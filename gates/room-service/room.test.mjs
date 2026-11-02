import assert from 'node:assert/strict';
import {once} from 'node:events';
import WebSocket from 'ws';
import {createRoomService} from './server.mjs';
const origin='http://localhost:5197',service=createRoomService({port:0,origins:[origin]});await once(service.server,'listening');const url='ws://127.0.0.1:'+service.server.address().port,clients=[];
async function client(){const ws=new WebSocket(url,{origin});clients.push(ws);const queue=[],waiters=[];ws.on('message',raw=>{const message=JSON.parse(raw);const i=waiters.findIndex(w=>w.type===message.type);if(i<0)queue.push(message);else{const waiter=waiters.splice(i,1)[0];clearTimeout(waiter.timer);waiter.resolve(message);}});await once(ws,'open');return{ws,send:obj=>ws.send(JSON.stringify(obj)),next:type=>new Promise((resolve,reject)=>{const i=queue.findIndex(m=>m.type===type);if(i>=0)return resolve(queue.splice(i,1)[0]);const waiter={type,resolve};waiter.timer=setTimeout(()=>{const j=waiters.indexOf(waiter);if(j>=0)waiters.splice(j,1);reject(new Error('Timed out: '+type));},2000);waiters.push(waiter);})};}
try{
 const host=await client(),guest=await client(),third=await client();host.send({type:'create',version:22,name:'主人',theme:'abyss'});const room=await host.next('joined');assert.match(room.code,/^[A-HJ-NP-Z2-9]{6}$/);guest.send({type:'join',version:22,code:room.code,name:'好友'});const membership=await guest.next('joined');assert.equal(membership.index,1);third.send({type:'join',version:22,code:room.code});assert.match((await third.next('error')).message,/最多 2 人/);
 host.send({type:'start'});assert.match((await host.next('error')).message,/准备好/);host.send({type:'ready',ready:true});guest.send({type:'ready',ready:true});await new Promise(r=>setTimeout(r,30));host.send({type:'start'});const start=await guest.next('start');assert.equal(start.theme,'abyss');assert.ok(start.seed);
 guest.send({type:'input',x:99,burst:true});const input=await host.next('input');assert.equal(input.x,3.8);assert.equal(input.burst,true);
 host.send({type:'snapshot',data:{players:[{health:4},{health:3}],distance:100}});assert.equal((await guest.next('snapshot')).data.players[1].health,3);
 guest.send({type:'action',kind:'choice',id:'3',choice:'mouse'});assert.equal((await host.next('action')).choice,'mouse');
 guest.ws.close();await host.next('disconnected');const returned=await client();returned.send({type:'resume',version:22,code:room.code,token:membership.token});assert.equal((await returned.next('joined')).index,1);await host.next('reconnected');assert.equal((await returned.next('snapshot')).data.distance,100);
 host.send({type:'leave'});assert.match((await returned.next('ended')).reason,/房主离开/);assert.equal(service.rooms.size,0);
 console.log('PASS: two-player cap, readiness, room codes, bounded input, authoritative snapshots, choices, reconnect and room cleanup.');
}finally{for(const ws of clients)ws.close();await service.close();}
