import http from 'node:http';
import {randomBytes,randomInt} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {WebSocketServer,WebSocket} from 'ws';

const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',themes=new Set(['coast','forest','halloween','cyber','abyss','dream','lantern']);
export function createRoomService({port=Number(process.env.PORT||5198),host=process.env.HOST||'127.0.0.1',origins=(process.env.ALLOWED_ORIGINS||'https://naiwa-play.github.io,http://127.0.0.1:5197,http://127.0.0.1:5191,http://localhost:5197').split(',')}={}){
 const rooms=new Map(),server=http.createServer((req,res)=>{res.writeHead(req.url==='/health'?200:404,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:req.url==='/health',version:22}));});
 const wss=new WebSocketServer({noServer:true,maxPayload:96*1024,perMessageDeflate:false});
 const send=(ws,data)=>{if(ws?.readyState===WebSocket.OPEN&&ws.bufferedAmount<192*1024)ws.send(JSON.stringify(data));};
 const broadcast=(room,data)=>room.members.forEach(m=>send(m?.ws,data));
 const lobby=room=>broadcast(room,{type:'room',code:room.code,theme:room.theme,status:room.status,members:room.members.map(m=>m?{name:m.name,ready:m.ready,online:!!m.ws}:null)});
 const error=(ws,message)=>send(ws,{type:'error',message});
 function endRoom(room,reason){rooms.delete(room.code);for(const m of room.members)if(m){send(m.ws,{type:'ended',reason});if(m.ws)m.ws.member=null;}room.members=[];}
 function attach(ws,room,index,name,token=randomBytes(24).toString('hex')){const member=room.members[index]||{name,token,ready:false};member.ws=ws;member.lostAt=0;room.members[index]=member;ws.member={room,index,member};send(ws,{type:'joined',code:room.code,index,token:member.token,theme:room.theme});lobby(room);return member;}
 server.on('upgrade',(req,socket,head)=>{if(!origins.includes(req.headers.origin)||wss.clients.size>=100){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));});
 wss.on('connection',ws=>{ws.alive=true;ws.windowAt=Date.now();ws.inputCount=0;ws.stateAt=0;ws.controlCount=0;ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});
  ws.on('message',(raw,binary)=>{if(binary)return ws.close(1003,'JSON only');let msg;try{msg=JSON.parse(raw.toString());}catch{return error(ws,'消息格式不正确');}if(!msg||typeof msg.type!=='string')return;
   const now=Date.now();if(now-ws.windowAt>=1000){ws.windowAt=now;ws.inputCount=ws.controlCount=0;}if(++ws.controlCount>90)return ws.close(1008,'Too many messages');
   if(msg.type==='ping')return send(ws,{type:'pong',at:msg.at});
   if(msg.type==='create'||msg.type==='join'||msg.type==='resume'){
    if(ws.member)return error(ws,'请先离开当前房间');if(msg.version!==22)return error(ws,'游戏版本不同，请双方刷新后重试');
    const name=typeof msg.name==='string'?msg.name.trim().slice(0,12):'奶蛙朋友';
    if(msg.type==='create'){if(rooms.size>=50)return error(ws,'房间暂时已满，请稍后再试');let code;do{code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');}while(rooms.has(code));const room={code,theme:themes.has(msg.theme)?msg.theme:'coast',status:'lobby',members:[null,null],created:now};rooms.set(code,room);attach(ws,room,0,name||'奶蛙朋友');return;}
    const room=rooms.get(String(msg.code||'').toUpperCase());if(!room)return error(ws,'房间不存在或已结束');
    if(msg.type==='resume'){const index=room.members.findIndex(m=>m?.token===msg.token&&!m.ws&&m.lostAt&&now-m.lostAt<20000);if(index<0)return error(ws,'重连已过期，请重新创建房间');attach(ws,room,index,room.members[index].name);broadcast(room,{type:'reconnected',index});if(index===1&&room.snapshot)send(ws,{type:'snapshot',data:room.snapshot});return;}
    if(room.members[1])return error(ws,'房间已满，最多 2 人');if(room.status!=='lobby')return error(ws,'冒险已经开始，请等待下一局');attach(ws,room,1,name||'奶蛙朋友');return;
   }
   if(!ws.member)return error(ws,'请先创建或加入房间');const {room,index,member}=ws.member;
   if(msg.type==='leave'){if(index===0){endRoom(room,'房主离开了房间');return;}room.members[1]=null;ws.member=null;send(ws,{type:'ended',reason:'已离开房间'});if(room.status==='playing')endRoom(room,'伙伴离开了本次远征');else lobby(room);return;}
   if(msg.type==='ready'&&room.status==='lobby'){member.ready=msg.ready===true;lobby(room);return;}
   if(msg.type==='start'){if(index!==0||room.status!=='lobby')return; if(!room.members.every(m=>m?.ws&&m.ready))return error(ws,'需要两位伙伴都准备好');room.status='playing';room.seed=randomBytes(8).toString('hex');broadcast(room,{type:'start',theme:room.theme,seed:room.seed});return;}
   if(room.status!=='playing')return;
   if(msg.type==='snapshot'&&index===0){if(now-ws.stateAt<65)return;if(!msg.data||!Array.isArray(msg.data.players)||msg.data.players.length!==2)return;ws.stateAt=now;room.snapshot=msg.data;send(room.members[1]?.ws,{type:'snapshot',data:msg.data});return;}
   if(msg.type==='input'&&index===1&&++ws.inputCount<=35){if(!Number.isFinite(msg.x))return;send(room.members[0]?.ws,{type:'input',x:Math.max(-3.8,Math.min(3.8,msg.x)),burst:msg.burst===true});return;}
   if(msg.type==='action'&&index===1){if(typeof msg.id!=='string'||msg.id.length>64)return;send(room.members[0]?.ws,{type:'action',id:msg.id,kind:msg.kind,choice:typeof msg.choice==='string'?msg.choice.slice(0,64):'',paused:msg.paused===true});}
  });
  ws.on('close',()=>{if(!ws.member)return;const{room,index,member}=ws.member;if(member.ws!==ws)return;member.ws=null;member.lostAt=Date.now();member.ready=false;broadcast(room,{type:'disconnected',index,seconds:20});lobby(room);});
 });
 const timer=setInterval(()=>{const now=Date.now();for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue;}ws.alive=false;ws.ping();}for(const room of rooms.values()){if(room.members.some(m=>m?.lostAt&&now-m.lostAt>=20000))endRoom(room,'连接中断超过 20 秒，本次房间已结束');else if(room.status==='lobby'&&now-room.created>20*60000)endRoom(room,'等待房间已到期，请重新创建');}},10000);timer.unref();
 server.listen(port,host);return{server,wss,rooms,close:()=>new Promise(resolve=>{clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();server.close(resolve);})};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){createRoomService();console.log('Naiwa two-player rooms listening on '+(process.env.PORT||5198));}
