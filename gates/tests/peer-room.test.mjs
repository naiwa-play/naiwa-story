import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {webcrypto} from 'node:crypto';
import {PeerRoom} from '../peer-room.js';

const flush = () => new Promise(resolve => setImmediate(resolve));
class Channel extends EventEmitter {
 constructor(metadata) { super(); this.metadata = metadata; this.open = false; this.bufferSize = 0; this.dataChannel = {bufferedAmount: 0}; }
 send(message) {
  if (!this.open) throw new Error('closed');
  const copy = JSON.parse(JSON.stringify(message));
  queueMicrotask(() => this.other.emit('data', copy));
 }
 close() {
  if (this.closed) return;
  this.closed = true; this.open = false; this.emit('close');
  if (this.other && !this.other.closed) this.other.close();
 }
}
class FakePeer extends EventEmitter {
 static peers = new Map();
 static count = 0;
 constructor(id, options) {
  super(); this.id = id || 'guest-' + ++FakePeer.count; this.options = options; this.channels = [];
  queueMicrotask(() => {
   if (this.destroyed) return;
   if (FakePeer.peers.has(this.id)) { this.emit('error', {type: 'unavailable-id'}); return; }
   FakePeer.peers.set(this.id, this); this.emit('open', this.id);
  });
 }
 connect(id, options) {
  const local = new Channel(options.metadata), remote = new Channel(options.metadata);
  local.other = remote; remote.other = local; this.channels.push(local);
  queueMicrotask(() => {
   const host = FakePeer.peers.get(id);
   if (!host) { this.emit('error', {type: 'peer-unavailable'}); return; }
   host.channels.push(remote); host.emit('connection', remote);
   queueMicrotask(() => {
    if (local.closed || remote.closed) return;
    local.open = remote.open = true; remote.emit('open'); local.emit('open');
   });
  });
  return local;
 }
 destroy() {
  this.destroyed = true;
  if (FakePeer.peers.get(this.id) === this) FakePeer.peers.delete(this.id);
  for (const channel of this.channels) channel.close();
  this.emit('close');
 }
}
const make = (options = {}) => {
 const messages = [], room = new PeerRoom(message => messages.push(message), {Peer: FakePeer, crypto: webcrypto, ...options});
 return {room, messages};
};
const create = room => room.send({type: 'create', version: 22, theme: 'cyber', name: '房主'});
const join = (room, code) => room.send({type: 'join', version: 22, code, name: '朋友'});
const last = (messages, type) => messages.filter(m => m.type === type).at(-1);

// Constructors stay usable in Node/VM callers; RTC is checked only on connect.
const lazy = new PeerRoom(() => {});
assert.equal(lazy.index, null);
assert.equal(lazy.mode, 'p2p');
const host = make(), guest = make();
await host.room.connect();
const creating = create(host.room);
assert.equal(host.room.index, null, 'create must wait for signaling to open');
await creating;
assert.equal(host.room.index, 0);
assert.match(host.room.code, /^[A-HJ-NP-Z2-9]{6}$/);
assert.deepEqual(host.room.peer.options.config.iceServers, [{urls: 'stun:stun.cloudflare.com:3478'}]);
const joining = join(guest.room, host.room.code);
assert.equal(guest.room.index, null, 'guest must wait for a welcome handshake');
await joining;
assert.equal(guest.room.index, 1);
assert.equal(guest.room.code, host.room.code);
assert.equal(last(host.messages, 'room').members.length, 2);
assert.equal(last(guest.messages, 'room').members[0].name, '房主');

const third = make();
await assert.rejects(join(third.room, host.room.code), /最多 2 人/);
assert.equal(third.room.index, null);
assert.equal(host.room.index, 0, 'a rejected third player must not close the room');
assert.equal(host.room.send({type: 'start'}), false);
assert.match(last(host.messages, 'error').message, /准备/);
host.room.send({type: 'ready', ready: true});
guest.room.send({type: 'ready', ready: true});
await flush();
assert.equal(host.room.send({type: 'start'}), true);
await flush();
assert.equal(last(host.messages, 'start').seed, last(guest.messages, 'start').seed);
assert.equal(last(guest.messages, 'start').theme, 'cyber');

assert.equal(guest.room.send({type: 'snapshot', data: {players: [{}, {}]}}), false);
assert.equal(host.room.send({type: 'input', x: 2}), false);
guest.room.send({type: 'input', x: 99, burst: true});
guest.room.send({type: 'action', id: 'choice-1', kind: 'choice', choice: 'dog'});
host.room.send({type: 'snapshot', data: {players: [{health: 4}, {health: 3}], paused: false}});
await flush();
assert.deepEqual(last(host.messages, 'input'), {type: 'input', x: 3.8, burst: true});
assert.equal(last(host.messages, 'action').choice, 'dog');
assert.equal(last(guest.messages, 'snapshot').data.players[1].health, 3);
const snapshots = guest.messages.filter(m => m.type === 'snapshot').length;
host.room.connection.dataChannel.bufferedAmount = 200 * 1024;
assert.equal(host.room.send({type: 'snapshot', data: {players: [{}, {}]}}), false);
await flush();
assert.equal(guest.messages.filter(m => m.type === 'snapshot').length, snapshots);
host.room.connection.dataChannel.bufferedAmount = 0;
host.room.peer.emit('disconnected');
host.room.peer.emit('error', {type: 'network'});
assert.equal(host.room.index, 0, 'signaling loss must preserve an established data channel');
guest.room.connection.close();
assert.match(last(host.messages, 'ended').reason, /中断/);
assert.equal(host.room.index, null);
assert.equal(guest.room.index, null);
assert.equal(host.room.peer, null);

const missing = make();
await assert.rejects(join(missing.room, 'ABC234'), /房间不存在/);
assert.equal(missing.room.peer, null);
const invalid = make();
await assert.rejects(join(invalid.room, 'bad'), /六位/);
assert.equal(invalid.room.peer, null);

const cancellation = make();
const pending = create(cancellation.room);
cancellation.room.leave();
await assert.rejects(pending, /取消/);
await flush();
assert.equal(cancellation.messages.some(m => m.type === 'joined'), false);

class StalledPeer extends EventEmitter { destroy() { this.destroyed = true; } }
let timeout;
const stalled = make({Peer: StalledPeer, setTimeout: fn => (timeout = fn, 1), clearTimeout: () => {}});
const waiting = create(stalled.room), timedPeer = stalled.room.peer;
timeout();
await assert.rejects(waiting, /15 秒/);
assert.equal(timedPeer.destroyed, true);
assert.equal(stalled.room.peer, null);
for (const participant of [host, guest, third, missing, invalid, cancellation, stalled]) participant.room.leave();
console.log('Peer rooms: handshake, two-player cap, ready/start, authoritative messages, backpressure, disconnect, cancellation and timeout passed');
