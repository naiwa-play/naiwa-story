const VERSION = 22;
const PREFIX = 'naiwa-room-22-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const THEMES = new Set(['coast', 'forest', 'halloween', 'cyber', 'abyss', 'dream', 'lantern']);
const LIMIT = 96 * 1024;
const TIMEOUT = 15000;
const DIRECT_FAILED = '双方未能建立直连。请让房主保持游戏页面打开，双方用 Safari 或 Chrome 并连接同一个 Wi-Fi 后重试。';
const cleanName = value => typeof value === 'string' ? value.trim().slice(0, 12) || '奶蛙朋友' : '奶蛙朋友';
const validCode = code => typeof code === 'string' && /^[A-HJ-NP-Z2-9]{6}$/.test(code);
const validMembers = members => Array.isArray(members) && members.length === 2 && members.every(m => m === null || (m && typeof m.name === 'string' && m.name.length <= 12 && typeof m.ready === 'boolean'));
function packet(value) {
 try {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.type !== 'string') return null;
  const text = JSON.stringify(value);
  return text.length <= LIMIT && new TextEncoder().encode(text).length <= LIMIT ? value : null;
 } catch { return null; }
}

// Public signaling only; Cloudflare STUN does not relay blocked peer connections.
export class PeerRoom {
 constructor(onMessage, options = {}) {
  this.onMessage = onMessage;
  this.Peer = options.Peer;
  this.crypto = options.crypto || globalThis.crypto;
  this.setTimeout = options.setTimeout || globalThis.setTimeout.bind(globalThis);
  this.clearTimeout = options.clearTimeout || globalThis.clearTimeout.bind(globalThis);
  this.index = null;
  this.code = '';
  this.token = '';
  this.peer = null;
  this.connection = null;
  this.members = [null, null];
  this.status = '';
  this.busy = false;
  this.manual = false;
  this.timer = null;
  this.connections = new Set();
  this.rejectTimers = new Set();
  this.pending = null;
  this.mode = 'p2p';
 }
 async connect() {
  if (!this.Peer) {
   if (!globalThis.RTCPeerConnection) throw new Error('当前浏览器不支持双人直连，请用 Safari 或 Chrome 打开');
   const module = await import('./vendor/peerjs.mjs');
   this.Peer = module.Peer || module.default;
  }
 }
 random(length, alphabet = '0123456789abcdef') {
  const bytes = new Uint8Array(length);
  this.crypto.getRandomValues(bytes);
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join('');
 }
 emit(message) { this.onMessage(message); }
 deliver(message) {
  if (message.type === 'joined') {
   this.index = message.index;
   this.code = message.code;
   this.token = message.token;
   this.pending?.resolve(true);
   this.pending = null;
  }
  this.emit(message);
 }
 fail(message) {
  const joined = this.index !== null;
  this.pending?.reject(new Error(message));
  this.pending = null;
  this.cleanup();
  this.emit(joined ? {type: 'ended', reason: message} : {type: 'error', message});
 }
 connectionFailed(message) {
  if (this.index !== 0 || this.status !== 'lobby' || this.members[1]) {
   this.fail(message);
   return;
  }
  // A guest who never joined should not destroy the host's waiting room.
  const connection = this.connection;
  this.connection = null;
  this.clearDeadline();
  this.connections.delete(connection);
  connection.close();
  this.emit({type: 'error', message: '好友未能完成连接，可用原房间码重试。'});
 }
 armTimeout(onTimeout) {
  this.clearTimeout(this.timer);
  this.timer = this.setTimeout(onTimeout, TIMEOUT);
 }
 clearDeadline() { this.clearTimeout(this.timer); this.timer = null; }
 makePeer(id, onOpen) {
  this.manual = false;
  this.busy = true;
  this.armTimeout(() => {
   if (!this.connection) this.fail('连接房间服务超过 15 秒，请检查网络后重试。');
   else if (!this.connection.open) this.fail(DIRECT_FAILED);
   else this.fail('直连已建立，但房主尚未确认加入。请房主保持游戏页面打开，再用原房间码重试。');
  });
  let peer;
  try {
   peer = new this.Peer(id, {secure: true, config: {iceServers: [{urls: 'stun:stun.cloudflare.com:3478'}]}});
  } catch {
   this.fail('当前浏览器不支持双人直连，请用 Safari 或 Chrome 打开');
   return;
  }
  this.peer = peer;
  peer.on('open', () => { if (this.peer === peer && !this.manual) onOpen(peer); });
  peer.on('connection', connection => {
   if (this.peer !== peer || this.manual) { connection.close(); return; }
   this.accept(connection);
  });
  peer.on('error', error => {
   if (this.peer !== peer || this.manual) return;
   // Losing signaling does not stop an already-open WebRTC data channel.
   if (this.connection?.open && ['network', 'socket-error', 'socket-closed', 'server-error'].includes(error.type)) return;
   const messages = {
    'peer-unavailable': '房间不存在或房主已离开，请核对房间码',
    'unavailable-id': '房间码发生冲突，请重新创建房间',
    'browser-incompatible': '当前浏览器不支持双人直连，请用 Safari 或 Chrome 打开',
    'network': '无法连接免费联机信令，请检查网络后重试',
    'server-error': '免费联机信令暂时不可用，请稍后重试',
    'socket-error': '无法连接免费联机信令，请检查网络后重试',
    'socket-closed': '免费联机信令连接已关闭，请重新创建或加入房间'
   };
   this.fail(messages[error.type] || '双人直连失败，请换用浏览器或网络后重试');
  });
  peer.on('disconnected', () => {
   if (this.peer === peer && !this.manual && !this.connection?.open) this.fail('联机信令已断开，请重新创建或加入房间');
  });
  peer.on('close', () => {
   if (this.peer === peer && !this.manual) this.fail('双人直连已关闭，请重新创建房间');
  });
 }
 create(message) {
  this.role = 'host';
  this.theme = THEMES.has(message.theme) ? message.theme : 'coast';
  this.code = this.random(6, ALPHABET);
  this.members = [{name: cleanName(message.name), ready: false, online: true}, null];
  this.status = 'lobby';
  this.makePeer(PREFIX + this.code, () => {
   this.busy = false;
   this.clearDeadline();
   this.deliver({type: 'joined', code: this.code, index: 0, token: this.random(24), theme: this.theme});
   this.lobby();
  });
 }
 join(message) {
  const code = String(message.code || '').toUpperCase();
  if (!validCode(code)) { this.emit({type: 'error', message: '请输入完整的六位房间码'}); return false; }
  this.role = 'guest';
  this.expectedCode = code;
  this.name = cleanName(message.name);
  // A client-generated ID avoids the guest-only HTTP request to allocate one.
  this.makePeer('naiwa-guest-' + this.random(24), peer => {
   this.emit({type: 'connecting', message: '已连接房间服务，正在尝试和房主直连…'});
   let connection;
   try {
    connection = peer.connect(PREFIX + code, {serialization: 'json', reliable: true, metadata: {version: VERSION, name: this.name}});
   } catch { this.fail('无法连接好友，请检查网络后重试'); return; }
   this.connection = connection;
   this.watch(connection);
   connection.on('open', () => {
    if (this.connection !== connection) return;
    this.emit({type: 'connecting', message: '直连已建立，正在等待房主确认…'});
    this.post({type: 'join', version: VERSION, code, name: this.name});
   });
  });
  return true;
 }
 accept(connection) {
  if (this.role !== 'host' || this.index !== 0 || this.connection || this.status !== 'lobby') {
   this.reject(connection, '房间已满或冒险已经开始，最多 2 人');
   return;
  }
  if (connection.metadata?.version !== VERSION) {
   this.reject(connection, '游戏版本不同，请双方刷新后重试');
   return;
  }
  // Reserve the only guest slot before waiting for the channel to open.
  this.connection = connection;
  this.watch(connection);
  this.armTimeout(() => this.connectionFailed(DIRECT_FAILED));
 }
 reject(connection, message) {
  this.connections.add(connection);
  const close = () => {
   try { connection.send({type: 'error', message}); } catch {}
   const timer = this.setTimeout(() => { this.rejectTimers.delete(timer); this.connections.delete(connection); connection.close(); }, 50);
   this.rejectTimers.add(timer);
  };
  if (connection.open) close(); else connection.on('open', close);
  connection.on('close', () => this.connections.delete(connection));
  connection.on('error', () => { this.connections.delete(connection); connection.close(); });
 }
 watch(connection) {
  this.connections.add(connection);
  connection.on('data', raw => {
   if (this.connection !== connection || this.manual) return;
   const message = packet(raw);
   if (!message) { this.connectionFailed('收到无效房间数据，连接已结束，请重新创建房间'); return; }
   this.receive(message);
  });
  connection.on('close', () => {
   this.connections.delete(connection);
   if (this.connection === connection && !this.manual) {
    const message = this.index === null ? DIRECT_FAILED : '伙伴连接已中断，本次房间已结束，请重新创建房间';
    this.connectionFailed(message);
   }
  });
  connection.on('error', error => {
   if (this.connection === connection && !this.manual) {
    const message = this.index === null && error.type === 'negotiation-failed' ? DIRECT_FAILED : '伙伴连接发生错误，请重试。';
    this.connectionFailed(message);
   }
  });
 }
 post(message) {
  const connection = this.connection;
  if (!connection?.open) return false;
  if (['snapshot', 'input'].includes(message.type) && (connection.bufferSize > 0 || connection.dataChannel?.bufferedAmount > 192 * 1024)) return false;
  if (!packet(message)) return false;
  try { connection.send(message); return true; }
  catch { this.connectionFailed('伙伴连接已中断，请重试。'); return false; }
 }
 lobby() {
  const message = {type: 'room', code: this.code, theme: this.theme, status: this.status, members: this.members.map(m => m ? {...m} : null)};
  if (this.members[1] && !this.post(message)) return;
  this.deliver(message);
 }
 start() {
  if (this.status !== 'lobby') return false;
  if (!this.connection?.open || !this.members.every(m => m?.ready)) {
   this.emit({type: 'error', message: '需要两位伙伴都准备好'});
   return false;
  }
  this.status = 'playing';
  const message = {type: 'start', theme: this.theme, seed: this.random(16)};
  if (!this.post(message)) return false;
  this.deliver(message);
  return true;
 }
 receive(message) {
  if (message.type === 'error') {
   if (typeof message.message === 'string' && message.message.length <= 160) this.connectionFailed(message.message);
   return;
  }
  if (this.role === 'host') {
   if (message.type === 'join' && !this.members[1]) {
    if (message.version !== VERSION || message.code !== this.code) { this.connectionFailed('游戏版本或房间码不匹配，请双方刷新后重试'); return; }
    const guest = {name: cleanName(message.name || this.connection.metadata?.name), ready: false, online: true};
    const welcome = {type: 'welcome', version: VERSION, code: this.code, index: 1, token: this.random(24), theme: this.theme, members: [this.members[0], guest]};
    if (!this.post(welcome)) return;
    this.members[1] = guest;
    this.clearDeadline();
    this.lobby();
    return;
   }
   if (!this.members[1]) return;
   if (message.type === 'ready' && this.status === 'lobby' && typeof message.ready === 'boolean') { this.members[1].ready = message.ready; this.lobby(); return; }
   if (message.type === 'leave') {
    if (this.status === 'playing') { this.fail('伙伴离开了本次远征'); return; }
    const connection = this.connection;
    this.connection = null;
    this.members[1] = null;
    this.connections.delete(connection);
    connection.close();
    this.lobby();
    return;
   }
   if (this.status !== 'playing') return;
   if (message.type === 'input' && Number.isFinite(message.x)) this.deliver({type: 'input', x: Math.max(-3.8, Math.min(3.8, message.x)), burst: message.burst === true});
   if (message.type === 'action' && typeof message.id === 'string' && message.id.length <= 64 && ['loaded', 'pause', 'choice'].includes(message.kind)) {
    this.deliver({type: 'action', id: message.id, kind: message.kind, choice: typeof message.choice === 'string' ? message.choice.slice(0, 64) : '', paused: message.paused === true});
   }
   return;
  }
  if (message.type === 'welcome' && this.index === null) {
   if (message.version !== VERSION || message.code !== this.expectedCode || message.index !== 1 || typeof message.token !== 'string' || !message.token || message.token.length > 128 || !THEMES.has(message.theme) || !validMembers(message.members) || !message.members.every(Boolean)) {
    this.fail('房间握手失败，请双方刷新后重试'); return;
   }
   this.clearDeadline();
   this.busy = false;
   this.theme = message.theme;
   this.status = 'lobby';
   this.members = message.members;
   this.deliver({type: 'joined', code: message.code, index: 1, token: message.token, theme: message.theme});
   this.deliver({type: 'room', code: message.code, theme: message.theme, status: 'lobby', members: this.members});
   return;
  }
  if (this.index !== 1) return;
  if (message.type === 'room' && message.code === this.code && validMembers(message.members)) { this.members = message.members; this.deliver(message); return; }
  if (message.type === 'start' && this.status === 'lobby' && THEMES.has(message.theme) && typeof message.seed === 'string' && /^[a-f0-9]{16}$/.test(message.seed)) { this.status = 'playing'; this.deliver(message); return; }
  if (message.type === 'snapshot' && this.status === 'playing' && message.data && Array.isArray(message.data.players) && message.data.players.length === 2 && message.data.players.every(p => p && typeof p === 'object' && !Array.isArray(p))) { this.deliver(message); return; }
  if (message.type === 'ended' && typeof message.reason === 'string') this.fail(message.reason.slice(0, 160));
  if (message.type === 'leave') this.fail('房主离开了房间');
 }
 send(message) {
  if (!packet(message)) return false;
  if (['create', 'join'].includes(message.type)) {
   if (this.busy || this.peer || this.index !== null) { this.emit({type: 'error', message: '请先离开当前房间'}); return false; }
   if (!this.Peer) { this.emit({type: 'error', message: '请先连接双人直连服务'}); return false; }
   if (message.version !== VERSION) { this.emit({type: 'error', message: '游戏版本不同，请双方刷新后重试'}); return false; }
   return new Promise((resolve, reject) => {
    this.pending = {resolve, reject};
    if (message.type === 'create') this.create(message);
    else if (!this.join(message)) { this.pending = null; reject(new Error('请输入完整的六位房间码')); }
   });
  }
  if (message.type === 'leave') { this.leave(); return true; }
  if (this.index === null) return false;
  if (message.type === 'ready' && this.status === 'lobby' && typeof message.ready === 'boolean') {
   if (this.index === 0) { this.members[0].ready = message.ready; this.lobby(); return true; }
   return this.post(message);
  }
  if (message.type === 'start' && this.index === 0) return this.start();
  if (this.status !== 'playing') return false;
  if (message.type === 'snapshot' && this.index === 0 && message.data && Array.isArray(message.data.players) && message.data.players.length === 2) return this.post(message);
  if (message.type === 'input' && this.index === 1 && Number.isFinite(message.x)) return this.post({type: 'input', x: Math.max(-3.8, Math.min(3.8, message.x)), burst: message.burst === true});
  if (message.type === 'action' && this.index === 1 && typeof message.id === 'string' && message.id.length <= 64 && ['loaded', 'pause', 'choice'].includes(message.kind)) return this.post(message);
  return false;
 }
 cleanup() {
  this.pending?.reject(new Error('已取消连接房间'));
  this.pending = null;
  this.manual = true;
  this.clearDeadline();
  for (const timer of this.rejectTimers) this.clearTimeout(timer);
  this.rejectTimers.clear();
  const peer = this.peer;
  this.peer = null;
  this.connection = null;
  this.index = null;
  this.code = '';
  this.token = '';
  this.busy = false;
  this.status = '';
  this.members = [null, null];
  for (const connection of this.connections) { try { connection.close(); } catch {} }
  this.connections.clear();
  try { peer?.destroy(); } catch {}
 }
 leave() { this.post({type: 'leave'}); this.cleanup(); }
 destroy() { this.leave(); }
}
