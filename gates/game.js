import * as T from './vendor/three.module.min.js';
import {ExpeditionScene} from './scene.js?v=16';
import {THEMES,WEAPONS,PATTERNS,attackProfile,STAGE_LENGTH,SHOP,MODES,bossFor,eliteFor,modeActive,effectiveRate,chargeMode,activateMode,tickMode,squadContact,clamp,formation,freshRun,runMultiplier,applyGate,damageSquad,killReward,makeCourse,reward,gateText,crossed,rollCards,chooseCard,buyUpgrade,shopPrice,sweepHit} from './core.js?v=16';
import {Soundtrack} from './audio.js?v=17';

const $=id=>document.getElementById(id),sound=new Soundtrack(),storeKey='naiwa-expedition-v1';
let saved={coins:0,best:0,bestDistance:0,upgrades:{},startingPet:null,tutorialSeen:false};
try{const old=JSON.parse(localStorage.getItem(storeKey));if(old&&typeof old==='object'){saved={...saved,...old,coins:Math.max(0,Number(old.coins??old.stars)||0),upgrades:old.upgrades||{}};for(const item of SHOP)saved.upgrades[item.id]=clamp(Math.floor(Number(saved.upgrades[item.id])||0),0,item.max);if(!['naigou','naishu'].includes(saved.startingPet)||!saved.upgrades[saved.startingPet])saved.startingPet=null;}}catch{}
let theme='coast',state=freshRun(),course=[],scene,paused=false,active=null,fireTimer=0,petTimer=0,dogTimer=0,bossTimer=0,toastTimer,accumulator=0,lastTime=0,displayedResult=false,settled=false,nextStage=1,pendingCards=null;
let pressed=new Set(),pointer=null,dragOrigin=0,dragStart=0,targetX=0,activeThreats=[],dogBites=[],petSummary='',companionReady=[],modeUIKey='',lastReadyMode='',pendingMajorReward=false;
const playerZ=5,step=1/60;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200);}
function save(){try{localStorage.setItem(storeKey,JSON.stringify(saved));}catch{}updateBest();}
function updateBest(){$('best').textContent='金币 '+saved.coins+' · 最远 '+Math.floor(saved.bestDistance)+' 米';$('wallet').textContent=saved.coins;}
function clearThreats(){for(const t of activeThreats){scene.scene.remove(t.group);t.group.geometry.dispose();t.group.material.dispose();}activeThreats=[];dogBites=[];}
function showModal(title,content,kicker='FIELD NOTES',kind='normal'){
 if(!scene||pendingCards&&kind!=='cards')return;
 paused=true;pressed.clear();pointer=null;accumulator=0;sound.pause(kind!=='cards');$('modal').className=kind;$('modal-close').hidden=kind==='cards';$('modal-kicker').textContent=kicker;$('modal-content').innerHTML='<h2>'+title+'</h2>'+content;if(!$('modal').open)$('modal').showModal();$('modal-content').scrollTop=0;
}
$('modal-close').onclick=()=>$('modal').close();
$('modal').addEventListener('cancel',e=>{if(pendingCards)e.preventDefault();});
$('modal').addEventListener('click',event=>{if(pendingCards||event.target!==$('modal'))return;const r=$('modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('modal').close();});
$('modal').addEventListener('close',()=>{paused=false;pressed.clear();pointer=null;accumulator=0;if(!document.hidden)sound.resume();lastTime=0;});
$('help').onclick=()=>showModal('一只奶蛙，也能出发。','<ol><li><b>自动前进与攻击。</b> 手机按住画面左右拖动，电脑使用 A / D、方向键或拖动鼠标。敌人会持续向你靠近，侧移可以躲开，碰撞只扣生命，不扣队伍数量。红色血瓶可恢复 2 点生命，补给较少。Boss 攻击命中主角或奶蛙伙伴都会扣除共享生命。</li><li><b>看准射程。</b> 脚下前方的光圈标记最远攻击位置，超出射程不能造成伤害。瞄准后会自动射击。</li><li><b>三选一，决定成长。</b> 经过卡牌路标时暂停选卡：增加追踪伙伴、攻速、威力、移速和射程。武器与攻击形式独立搭配：投掷奶蛋配散射会分散投掷；激光配散射会展开扇形光束。召唤宠物后才会出现对应成长卡。</li><li><b>两种伙伴，两种打法。</b> 奶狗会扑向敌人咬击，奶鼠搓出奶球进行追踪攻击。没有召唤时不会出场。</li><li><b>第一段是热身，之后没有终点。</b> 完成 260 米初行路后直接进入无尽，推进速度逐渐提高，最高 3 倍。遇到 Boss 会停步交战，左右闪避它的墨团。击败小怪增加攻击力，击败 Boss 还会增加伙伴数量和攻速。</li><li><b>能量模式。</b> 能量未满时隐藏效果，蓄满揭晓愤怒、忧郁、恶魔、天使或神格模式。点击右下按钮或按空格进入限时增益；开启声音可听就绪提示。连续击杀的充能有上限，两次模式切换至少间隔 45 秒。</li><li><b>金币带回口袋。</b> 靠近金币即可拾取。结束或返回主界面会保存金币，可在口袋商店购买永久开局强化；记录保存在当前浏览器。</li></ol>');
$('collection').onclick=()=>showModal('伙伴会在路上相遇。','<div class="pet-entry"><span class="pet-number">01</span><div><b>奶蛙 · 最初的勇气</b><p>主角负责普通射击或散射。增加的奶蛙伙伴各自定时发出红色追踪奶蛋，攻速和攻击力升级也对它们生效。</p></div></div><div class="pet-entry"><span class="pet-number">02</span><div><b>奶狗 · 扑咬搭档</b><p>召唤后冲向敌人、扑咬再返回。可通过专属卡增加数量和咬击伤害。</p></div></div><div class="pet-entry"><span class="pet-number">03</span><div><b>奶鼠 · 奶球法师</b><p>在身前搓出奶球，追踪射程内的敌人。可通过专属卡增加数量和奶球伤害。</p></div></div><a class="credit-link" href="./CREDITS.md" target="_blank" rel="noopener">模型来源与制作说明 ↗</a>','MEET YOUR LITTLE SQUAD');
$('pause').onclick=()=>{if(scene.home||state.phase==='lost'||pendingCards)return;showModal('歇一口气，等你回来。','<p>画面、敌人和音乐都已暂停。返回主界面也会保存本次拾取的金币。</p><button class="start-button" id="resume">继续冒险 <span>↗</span></button><button class="text-button" id="exit-run">收好金币，返回主界面</button>','TAKE A LITTLE BREAK');$('resume').onclick=()=>$('modal').close();$('exit-run').onclick=()=>{$('modal').close();home();};};
$('sound').onclick=async()=>{
 const button=$('sound');button.disabled=true;
 try{
  if(sound.enabled)sound.disable();else{sound.theme=theme;await sound.enable();if(paused||document.hidden)sound.pause();else sound.effect('gate');}
  const label=sound.enabled?'关闭声音':'开启声音';button.setAttribute('aria-pressed',String(sound.enabled));button.setAttribute('aria-label',label);button.title=label;
  button.querySelector('svg').innerHTML='<path d="M11 5 6 9H3v6h3l5 4z"/><path d="'+(sound.enabled?'M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14':'M16 8l5 8M21 8l-5 8')+'"/>';
  toast(sound.enabled?'音乐已开启':'音乐已关闭');
 }catch{toast('声音尚未启动，请再点一次试试');}finally{button.disabled=false;}
};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;sound.theme=theme;state=freshRun(theme,1,saved.upgrades,saved.startingPet);scene.rebuildScenery(theme);document.body.classList.toggle('theme-halloween',theme==='halloween');document.querySelectorAll('[data-theme]').forEach(v=>{v.classList.toggle('selected',v===b);v.setAttribute('aria-pressed',String(v===b));});});
function openShop(){
 const items=SHOP.map(item=>{const level=saved.upgrades[item.id]||0,max=level>=item.max,cost=shopPrice(item,level);return '<article class="shop-item"><span class="shop-icon">'+item.icon+'</span><div><h3>'+item.title+'</h3><p>'+item.description+' · '+level+'/'+item.max+'</p></div><button data-buy="'+item.id+'" '+(max||saved.coins<cost?'disabled':'')+'>'+(max?'已收好':cost+' 金币')+'</button></article>';}).join('');
 const pets=[['','独自出发'],['naigou','奶狗同行'],['naishu','奶鼠同行']].filter(([id])=>!id||saved.upgrades[id]).map(([id,label])=>'<button class="loadout-option" data-loadout="'+id+'" aria-pressed="'+((saved.startingPet||'')===id)+'">'+label+'</button>').join('');
 showModal('把下一次出发，准备得更好。','<p class="shop-wallet">口袋里有 <b>'+saved.coins+'</b> 枚金币</p><p>购买后永久生效。开局伙伴可在下面选择；每次最多携带一种。</p><div class="shop-items">'+items+'</div><h3>这次和谁出发？</h3><div class="loadouts">'+pets+'</div>','THE POCKET SHOP','shop');
 document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{if(buyUpgrade(saved,b.dataset.buy)){save();state=freshRun(theme,1,saved.upgrades,saved.startingPet);sound.effect('gate');openShop();}});
 document.querySelectorAll('[data-loadout]').forEach(b=>b.onclick=()=>{saved.startingPet=b.dataset.loadout||null;save();state=freshRun(theme,1,saved.upgrades,saved.startingPet);openShop();});
}
$('shop').onclick=openShop;
function chooseCards(major=false){
 pendingCards=rollCards(state,Math.random,major);
 showModal(major?'征服者，这是你的馈赠。':'下一份快乐，由你决定。','<p class="choice-intro">'+(major?'主题首领已击败 · 选择一项强力成长':'选一张带走 · 选择期间时间暂停')+'</p><div class="choice-grid">'+pendingCards.map((c,i)=>'<button class="upgrade-card '+(['武器','攻击形式'].includes(c.tag)||c.rare||c.majorReward||c.id==='pumpkin'?'rare':'')+'" data-card="'+c.id+'"><small>'+c.tag+'</small><span class="card-art" aria-hidden="true">'+c.icon+'</span><h3>'+c.title+'</h3><p>'+c.description+'</p><span class="card-select">选择这张 <b>'+(i+1)+'</b></span></button>').join('')+'</div>',major?'A GIFT FROM THE CONQUERED WORLD.':'A LITTLE CHOICE. A NEW POSSIBILITY.','cards');
 document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{if(!pendingCards?.some(c=>c.id===b.dataset.card))return;if(chooseCard(state,b.dataset.card)){const title=pendingCards.find(c=>c.id===b.dataset.card).title;pendingCards=null;scene.setWeapon(state.weapon);$('modal').close();sound.effect('card');toast(title);}});
}
function start(){
 if($('modal').open)$('modal').close();pendingCards=null;state=freshRun(theme,1,saved.upgrades,saved.startingPet);course=makeCourse(0,Math.random,theme);nextStage=1;pendingMajorReward=false;active=null;clearThreats();fireTimer=petTimer=dogTimer=bossTimer=0;companionReady=[];paused=false;displayedResult=settled=false;targetX=0;pressed.clear();accumulator=0;scene.shots=[];scene.clearCoins();scene.setMode(false);scene.setWeapon('egg');scene.createCourse(course);
 $('home').hidden=true;$('hud').hidden=false;$('result').hidden=true;$('pause').hidden=false;$('boss-hud').hidden=true;$('hint').style.opacity='1';document.body.classList.add('playing');sound.resume();lastTime=0;updateHUD();
 if(!saved.tutorialSeen){showModal('第一段路，从这里开始。','<p>主角自动向前跑、发射奶蛋；增加的奶蛙伙伴会定时发出红色追踪奶蛋。<b>按住画面左右拖动</b>，电脑也可使用 <b>A / D 或方向键</b>。</p><p>选数字门提升数值，遇到卡牌再挑选伙伴。先试着移动到一侧，敌人会一直向你靠近。</p><button class="start-button" id="tutorial-go">准备好啦，出发 ↗</button>','YOUR FIRST LITTLE ADVENTURE');$('tutorial-go').onclick=()=>{saved.tutorialSeen=true;save();$('modal').close();};}else toast('初行路 · 260 米后无缝进入无尽');
}
function settle(){if(settled)return;settled=true;saved.coins+=reward(state);saved.best=Math.max(saved.best,state.count);saved.bestDistance=Math.max(saved.bestDistance,state.distance);save();}
function home(){if(!scene.home)settle();pendingCards=null;$('result').hidden=true;$('hud').hidden=true;$('home').hidden=false;$('pause').hidden=true;document.body.classList.remove('playing');scene.setMode(true);scene.setWeapon('egg');scene.clearCoins();clearThreats();active=null;pressed.clear();state=freshRun(theme,1,saved.upgrades,saved.startingPet);sound.resume();}
$('start').onclick=start;$('again').onclick=start;$('back-home').onclick=home;
function hit(enemy,damage){if(enemy.dead||enemy.escaped)return;if(scene.hit(enemy,damage)){state.kills++;const boss=enemy.type==='boss',multiplier=modeActive(state,'demon')?2:1,text=killReward(state,boss,multiplier),p=enemy.group.getWorldPosition(new T.Vector3());scene.dropCoins(p.x,p.z,Math.round(enemy.reward*multiplier));chargeMode(state,boss?15:2,Math.random,!boss);scene.rewardText(p.x,p.z,text);if(boss){state.bosses++;if(enemy.row.major)pendingMajorReward=true;if(state.phase==='boss'){state.phase=state.endless?'endless':'run';active=null;clearThreats();}toast('击败 Boss · '+text);sound.effect('boss');}else sound.effect('kill');}sound.effect('hit');}
function targetEnemies(){return scene.entities.filter(e=>!e.dead&&!e.escaped&&e.group.visible&&(()=>{const p=e.group.getWorldPosition(new T.Vector3());return p.z<playerZ+1&&p.z>=playerZ-state.range-3;})());}
function volley(){
 const profile=attackProfile(state);
 for(let i=0;i<profile.count;i++){
  const angle=profile.angles[i],x=state.x+(state.pattern==='spread'?0:(i-(profile.count-1)/2)*.4);
  if(state.weapon==='laser'){
   const startZ=playerZ-.75,endX=x+Math.sin(angle)*state.range,endZ=startZ-Math.cos(angle)*state.range,width=.2*profile.size;
   scene.beam(x,startZ,state.range,angle,width);
   for(const e of targetEnemies()){const p=e.group.getWorldPosition(new T.Vector3());if(sweepHit(x-p.x,startZ-p.z,endX-p.x,endZ-p.z,e.radius+width/2)!==null)hit(e,profile.damage);}
  }else scene.shoot(x,playerZ-.75,profile.damage,false,null,state.weapon,state.range,angle,profile.size);
 }
}
function companionAttack(){
 const points=formation(state.count),targets=targetEnemies();if(points.length<2||!targets.length)return;
 const represented=(state.count-1)/(points.length-1);let launched=0;
 for(let i=1;i<points.length&&launched<6;i++){
  companionReady[i]??=state.elapsed+(i%6)*.09;if(companionReady[i]>state.elapsed)continue;
  const x=state.x+points[i].x,z=5.45+points[i].z;
  const nearby=targets.filter(e=>{const p=e.group.getWorldPosition(new T.Vector3());return p.z<z&&Math.hypot(p.x-x,p.z-z)<=state.range;});
  if(!nearby.length)continue;const target=nearby[(i-1)%nearby.length];
  scene.shoot(x,z,state.damage*1.8*represented,true,target,'companion',state.range);
  companionReady[i]=state.elapsed+Math.max(.9,3.2*1.5/effectiveRate(state));launched++;
 }
}
function petAttack(){const targets=targetEnemies().filter(e=>e.group.getWorldPosition(new T.Vector3()).z>=playerZ-state.range);if(!targets.length)return;for(let i=0;i<state.pets.naishu;i++){const target=targets[i%targets.length];scene.shoot(state.x+1.05+i*.4,playerZ+.2,2.4*state.petDamage.naishu,true,target,'milkball',state.range);scene.chargeMouse(i);}}
function dogAttack(){const targets=targetEnemies().filter(e=>e.group.getWorldPosition(new T.Vector3()).z>=playerZ-Math.min(22,state.range));if(!targets.length)return;for(let i=0;i<state.pets.naigou;i++){const enemy=targets[i%targets.length];scene.petLunge(i,enemy.group.getWorldPosition(new T.Vector3()));dogBites.push({enemy,age:0,damage:3.2*state.petDamage.naigou});}}
const MODE_ICONS={
 unknown:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16v.2"/>',
 anger:'<path d="M13 2c2 6-4 6-2 10 1-2 3-2 4-4 3 4 5 6 3 10-2 5-10 5-12 0-2-4 0-7 3-10-1 4 1 5 2 5-3-6 1-7 2-11Z"/>',
 melancholy:'<path d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z"/><path d="M9 16c0 2 1 3 3 3"/>',
 demon:'<path d="m6 9-3-6 7 4m8 2 3-6-7 4"/><path d="M5 10c-1 8 3 11 7 11s8-3 7-11M8 12l2 1m6-1-2 1m-5 4c2 2 4 2 6 0"/>',
 angel:'<path d="M10 16C2 16 2 10 3 5c2 4 6 2 8 7m3 4c8 0 8-6 7-11-2 4-6 2-8 7M9 20h6m-5-4 2-5 2 5"/><ellipse cx="12" cy="4" rx="4" ry="1.4"/>',
 god:'<path d="m12 4 2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2Z"/><path d="M12 1v1m0 20v1M1 12h1m20 0h1M4 4l1 1m14 14 1 1M20 4l-1 1M5 19l-1 1"/>',
};
function burst(){
 if(scene.home||paused||state.phase==='lost'||!activateMode(state))return;
 const spec=MODES[state.activeMode];if(state.activeMode==='angel'){scene.shots=[];dogBites=[];scene.drawShots();}
 fireTimer=0;scene.burst(state.x,1,playerZ,spec.color,40);scene.ring(state.x,playerZ,spec.color,1.1);sound.effect('burst');toast('已切换'+spec.name+'模式 · '+spec.description);
}
$('burst').onclick=burst;
function updateModeHUD(){
 const id=state.activeMode||state.readyMode,spec=id?MODES[id]:null,active=state.modeLeft>0,ready=!!state.readyMode&&!active,button=$('burst'),key=(active?'active:':ready?'ready:':'')+(id||'charging');
 button.disabled=!ready;button.classList.toggle('ready',ready);button.classList.toggle('mode-active',active);button.style.setProperty('--mode-color',spec?.color||'#8b9590');button.style.setProperty('--charge',Math.floor(state.joy)+'%');
 $('mode-name').textContent=active?spec.name+'模式':ready?'切换'+spec.name+'模式':'未知模式';
 $('burst-value').textContent=active?'剩余 '+Math.ceil(state.modeLeft)+' 秒':ready?'能量已满 · 点击 / 空格':state.joy>=100&&state.elapsed<state.modeNextAt?'稳定能量 · '+Math.ceil(state.modeNextAt-state.elapsed)+' 秒':Math.floor(state.joy)+'% · 正在蓄力';
 $('mode-description').textContent=spec?spec.description:'蓄满后揭晓增益';
 button.setAttribute('aria-label',active?spec.name+'模式生效中':ready?'切换'+spec.name+'模式，'+spec.description:'未知模式，正在充能 '+Math.floor(state.joy)+'%');
 if(key!==modeUIKey){modeUIKey=key;$('mode-icon').innerHTML='<svg viewBox="0 0 24 24">'+MODE_ICONS[id||'unknown']+'</svg>';}
 if(ready&&lastReadyMode!==id){lastReadyMode=id;sound.effect('ready');toast(spec.name+'模式已就绪！');scene.ring(state.x,playerZ,spec.color,1);}else if(!ready)lastReadyMode='';
}
function launchThreat(enemy,{color='#cf91a5',kind='orb',angle=0,speed=11,homing=false,x=null}={}){
 const p=enemy.group.getWorldPosition(new T.Vector3()),aim=Math.atan2(state.x-p.x,playerZ-p.z)+angle;
 const geometry=kind==='bone'?new T.CylinderGeometry(.12,.12,.9,8):new T.SphereGeometry(kind==='wave'?.42:.32,12,9);
 const group=new T.Mesh(geometry,new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.32,roughness:.4}));if(kind==='bone')group.rotation.x=Math.PI/2;group.position.set(x??p.x,.6,p.z+1);scene.scene.add(group);
 activeThreats.push({group,vx:Math.sin(aim)*speed,vz:Math.cos(aim)*speed,speed,homing,age:0,radius:kind==='wave'?.43:.32,damage:1});
}
function markHazard(x,color,width=1.8){const group=new T.Mesh(new T.PlaneGeometry(width,7),new T.MeshBasicMaterial({color,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false}));group.rotation.x=-Math.PI/2;group.position.set(x,.045,6);scene.scene.add(group);activeThreats.push({group,kind:'area',age:0,delay:1.05,width,damage:1,triggered:false});}
function bossAttack(enemy){
 const spec=enemy.boss||(enemy.row.major?bossFor(state.theme,Math.floor(((enemy.row.stage||0)+1)/3)):eliteFor(state.theme));enemy.attackCount=(enemy.attackCount||0)+1;const n=enemy.attackCount,color=spec.color;
 if(spec.attack==='ink')launchThreat(enemy,{color,speed:11});
 else if(spec.attack==='tide'){for(const angle of [-.2,0,.2])launchThreat(enemy,{color,angle,kind:'wave',speed:10});if(n%2===0)for(const x of [-3,3])markHazard(x,color,1.7);}
 else if(spec.attack==='storm'){markHazard(state.x,color,1.9);if(n%2===0)for(const x of [-2.7,2.7])markHazard(x,color,1.5);else launchThreat(enemy,{color,speed:12});}
 else if(spec.attack==='roots'){markHazard(state.x,color,1.8);for(const angle of [-.24,.24])launchThreat(enemy,{color,angle,speed:9});}
 else if(spec.attack==='spores'){for(const angle of [-.26,-.13,0,.13,.26])launchThreat(enemy,{color,angle,speed:7.5});if(n%2===0)markHazard(n%4===0?-2.6:2.6,color,2.4);}
 else if(spec.attack==='haunt'){launchThreat(enemy,{color,homing:true,speed:9.5});if(n%2===0)markHazard(state.x,'#e59455',2);}
 else if(spec.attack==='bones'){for(const x of [-2.8,0,2.8])launchThreat(enemy,{color,kind:'bone',speed:14,x});if(n%2===0){const safe=n%3;[-2.7,0,2.7].forEach((x,i)=>{if(i!==safe)markHazard(x,'#d1899e',1.7);});}}
 return spec.cooldown;
}
function updateThreats(dt){
 const slow=modeActive(state,'melancholy')?.55:1;
 activeThreats=activeThreats.filter(t=>{
  t.age=(t.age||0)+dt;
  if(t.kind==='area'){
   t.group.material.opacity=.18+Math.sin(t.age*16)*.1;
   if(t.age>=t.delay&&!t.triggered){t.triggered=true;t.group.material.opacity=.75;scene.burst(t.group.position.x,.5,playerZ,'#efacba',14);if(squadContact(state,t.group.position.x,3,t.group.position.x,9,t.width/2))takeHit(t.damage);}
   if(t.age<t.delay+.65)return true;
  }else{
   const px=t.group.position.x,pz=t.group.position.z;
   if(t.homing&&t.age<.8){const dx=state.x-px,dz=playerZ-pz,len=Math.hypot(dx,dz)||1;t.vx=dx/len*t.speed;t.vz=dz/len*t.speed;}
   t.group.position.x+=(t.vx||0)*dt*slow;t.group.position.z+=(t.vz??12)*dt*slow;
   if(squadContact(state,px,pz,t.group.position.x,t.group.position.z,t.radius??.32)){takeHit(t.damage||1);}
   else if(t.group.position.z<15&&Math.abs(t.group.position.x)<14&&t.age<9)return true;
  }
  scene.scene.remove(t.group);t.group.geometry.dispose();t.group.material.dispose();return false;
 });
}
function end(){if(displayedResult)return;displayedResult=true;state.phase='lost';settle();$('result-kicker').textContent=state.endless?'UNTIL THE NEXT ADVENTURE':'A LITTLE REST. ANOTHER TRY.';$('result-title').textContent='这一程，也很了不起。';$('result-copy').textContent='前进 '+Math.floor(state.distance)+' 米，击退 '+state.kills+' 位对手。已将拾取的金币收进口袋，去商店准备下一次出发吧。';$('result-crowd').textContent=Math.floor(state.distance);$('result-walls').textContent=state.cards;$('result-coins').textContent=reward(state);$('again').innerHTML='再来一次 <span>↗</span>';$('result').hidden=false;$('pause').hidden=true;sound.effect('hurt');}
function explode(b){const radius=(b.kind==='pumpkin'?4:3)*(b.size||1);scene.burst(b.x,.7,b.z,b.kind==='pumpkin'?'#ec965d':'#ffe8a1',22);scene.ring(b.x,b.z,b.kind==='pumpkin'?'#b891ef':'#f2c566',radius);for(const e of scene.entities){if(e.dead||e.escaped)continue;const p=e.group.getWorldPosition(new T.Vector3());if(Math.hypot(p.x-b.x,p.z-b.z)<radius+e.radius)hit(e,b.damage);}}
function updateShots(dt){
 const targets=targetEnemies();
 scene.shots=scene.shots.filter(b=>{
  b.life+=dt;const previousX=b.x,previousZ=b.z;
  let vx=Math.sin(b.angle||0)*27,vz=-Math.cos(b.angle||0)*27;
  if(b.pet&&(!b.target||b.target.dead||b.target.escaped))b.target=targets.find(e=>{const p=e.group.getWorldPosition(new T.Vector3());return Math.hypot(p.x-b.x,p.z-b.z)<=(b.range??22)-(b.travel??0);});
  if(b.pet&&b.target&&!b.target.dead&&!b.target.escaped){const p=b.target.group.getWorldPosition(new T.Vector3()),dx=p.x-b.x,dz=p.z-b.z,len=Math.hypot(dx,dz)||1;vx=dx/len*25;vz=dz/len*25;b.angle=Math.atan2(vx,-vz);}
  const remaining=(b.range??22)-(b.travel??0),length=Math.min(Math.hypot(vx,vz)*dt,remaining),factor=length/(Math.hypot(vx,vz)||1);b.previousZ=b.z;b.x+=vx*factor;b.z+=vz*factor;b.travel=(b.travel??0)+length;
  let nearest=null,impact=Infinity;
  for(const enemy of targets){const p=enemy.group.getWorldPosition(new T.Vector3());if(p.z>playerZ+1)continue;const t=sweepHit(previousX-(enemy.previousX??p.x),previousZ-(enemy.previousZ??p.z),b.x-p.x,b.z-p.z,enemy.radius+(b.radius??.14));if(t!==null&&t<impact){impact=t;nearest=enemy;}}
  if(nearest){b.x=previousX+(b.x-previousX)*impact;b.z=previousZ+(b.z-previousZ)*impact;if(b.kind==='bomb'||b.kind==='pumpkin')explode(b);else hit(nearest,b.damage);return false;}
  if(b.travel>=(b.range??22)){if(b.kind==='bomb'||b.kind==='pumpkin')explode(b);return false;}return b.life<6;
 });
}
function takeHit(amount=1){if(damageSquad(state,amount)){scene.hurt();sound.effect('hurt');toast('生命 −'+amount+' · 侧移闪避攻击');document.body.classList.add('hit-flash');setTimeout(()=>document.body.classList.remove('hit-flash'),220);}}
function update(dt){
 if(scene.home||paused||state.phase==='lost')return;
 state.elapsed+=dt;state.invincible=Math.max(0,state.invincible-dt);if(state.endless)state.endlessTime+=dt;tickMode(state,dt);
 const axis=(pressed.has('ArrowRight')||pressed.has('d')?1:0)-(pressed.has('ArrowLeft')||pressed.has('a')?1:0);if(axis)targetX=clamp(targetX+axis*dt*7*state.speed,-3.8,3.8);state.x+=(targetX-state.x)*(1-Math.exp(-dt*16));
 for(const e of scene.entities){const p=e.group.getWorldPosition(new T.Vector3());e.previousX=p.x;e.previousZ=p.z;}
 const old=state.distance;if(state.phase!=='boss')state.distance+=6*runMultiplier(state)*dt;
 if(state.distance>=STAGE_LENGTH&&!state.endless){state.endless=true;state.phase='endless';toast('无尽远征开始 · 速度将逐渐提升');sound.effect('win');}
 state.stage=Math.floor(state.distance/STAGE_LENGTH);
 if(state.distance+100>=nextStage*STAGE_LENGTH){const rows=makeCourse(nextStage++,Math.random,theme);course.push(...rows);scene.createCourse(rows,true);}
 for(const row of course){if(row.used)continue;if(row.type==='gate'&&crossed(old,state.distance,row.at)){const g=row.options[state.x<0?0:1];applyGate(state,g);row.used=true;toast(gateText(g).label+' '+gateText(g).value);sound.effect('gate');scene.burst(state.x,.6,playerZ,'#efd789',18);}
  else if(row.type==='card'&&crossed(old,state.distance,row.at)){row.used=true;chooseCards();break;}}
 // Every live monster advances at a constant velocity; contact never cancels it.
 for(const e of scene.entities)if(!e.dead&&!e.escaped&&!e.engaged&&(e.activated||e.row.at-state.distance<75)){e.activated=true;e.offset+=dt*(e.advanceSpeed||1.1)*runMultiplier(state);}
 scene.positionRows(state.distance);scene.entities.forEach(e=>e.group.position.z=e.offset);scene.scene.updateMatrixWorld(true);
 if(paused)return;
 const encounter=scene.entities.find(e=>!e.dead&&!e.escaped&&e.type==='boss'&&e.group.getWorldPosition(new T.Vector3()).z>=playerZ-Math.min(18,state.range-2));
 if(encounter&&state.phase!=='boss'){state.phase='boss';active=encounter.row;encounter.engaged=true;bossTimer=1.3;toast('Boss 战 · 停步攻击，左右闪避墨团');}
 if(!modeActive(state,'angel')){
  fireTimer-=dt;if(fireTimer<=0){volley();fireTimer+=1/attackProfile(state).rate;}
  companionAttack();const attackBoost=modeActive(state,'anger')?1.8:1;
  petTimer-=dt;dogTimer-=dt;if(petTimer<=0){petAttack();petTimer+=1.8/attackBoost;}if(dogTimer<=0){dogAttack();dogTimer+=2.2/attackBoost;}
  dogBites=dogBites.filter(b=>{b.age+=dt;if(b.age<.28)return true;if(!b.enemy.dead&&!b.enemy.escaped){const p=b.enemy.group.getWorldPosition(new T.Vector3());if(p.z>=playerZ-state.range&&p.z<playerZ+1)hit(b.enemy,b.damage);}return false;});
 }else{
  for(const e of targetEnemies()){const p=e.group.getWorldPosition(new T.Vector3());if(e.type==='boss'||p.z<playerZ-12)continue;e.dead=true;e.peaceful=true;e.group.visible=false;state.blessings++;const text=killReward(state,false,1.5);scene.rewardText(p.x,p.z,'祝福 · '+text);scene.burst(p.x,1,p.z,'#f4e7b1',14);}
  state.angelClock-=dt;if(state.phase==='boss'&&state.angelClock<=0){state.angelClock=2;state.blessings++;scene.rewardText(state.x,playerZ,'祝福 · '+killReward(state,false,1.5));}
 }
 updateShots(dt);
 const bosses=targetEnemies().filter(e=>e.type==='boss');active=bosses[0]?.row||null;bossTimer-=dt;if(bosses.length&&bossTimer<=0){bossTimer=bossAttack(bosses[0]);}
 for(const e of scene.entities){if(e.dead||e.escaped)continue;const p=e.group.getWorldPosition(new T.Vector3());const contact=sweepHit((e.previousX??p.x)-state.x,(e.previousZ??p.z)-playerZ,p.x-state.x,p.z-playerZ,e.radius+.35);if(contact!==null&&Math.abs(p.x-state.x)<e.radius+.4)takeHit(e.type==='boss'?2:1);if(p.z>playerZ+5){e.escaped=true;e.group.visible=false;}}
 updateThreats(dt);
 const collected=scene.collectCoins(state.x,state.distance,dt);state.coins+=collected*state.coinBonus;
 const healed=scene.collectPotions(state.x,state.distance,dt,state.health,state.maxHealth);if(healed){state.health=Math.min(state.maxHealth,state.health+healed);toast('拾取血瓶 · 生命 +'+healed);sound.effect('gate');}
 if(state.health===0){end();return;}
 if(pendingMajorReward){pendingMajorReward=false;chooseCards(true);}
 scene.pruneCourse(state.distance);course=course.filter(r=>r.at>state.distance-25);
}
function updateHUD(){
 $('count').textContent=state.count;$('squad-role').textContent=state.count>1?'追踪伙伴 '+(state.count-1):'独自出发';$('rate').textContent=attackProfile(state).rate.toFixed(1);$('power').textContent=attackProfile(state).damage.toFixed(2);$('health').textContent='♡ '+state.health+' / '+state.maxHealth;$('run-coins').textContent='◈ '+Math.floor(state.coins);$('run-distance').textContent=Math.floor(state.distance)+' m';$('run-range').textContent=state.range.toFixed(0)+' m';$('run-speed').textContent=runMultiplier(state).toFixed(2)+'×';$('run-weapon').textContent=WEAPONS[state.weapon]+' · '+PATTERNS[state.pattern];
 $('progress-fill').style.width=(state.endless?state.distance%STAGE_LENGTH:state.distance)/STAGE_LENGTH*100+'%';$('progress-caption').textContent=state.endless?'无尽远征 · 第 '+state.stage+' 段':'初行路 → 无尽';
 $('scene-name').textContent=THEMES[theme].name;$('phase-label').textContent=state.phase==='boss'?'Boss 战 · 停步射击，侧移闪避':state.endless?'无尽前进 · '+state.stage+' 段':'初行路 · 敌人持续靠近';
 const summary=state.pets.naigou+','+state.pets.naishu;if(summary!==petSummary){petSummary=summary;$('pet-status').innerHTML='<span><b>奶狗 '+state.pets.naigou+'</b><small>'+(state.pets.naigou?'扑咬搭档':'等待召唤')+'</small></span><i></i><span><b>奶鼠 '+state.pets.naishu+'</b><small>'+(state.pets.naishu?'奶球追踪':'等待召唤')+'</small></span>';}
 updateModeHUD();if(state.elapsed>9)$('hint').style.opacity='0';
 const boss=targetEnemies().find(e=>e.type==='boss');$('boss-hud').hidden=!boss;$('next-gate').hidden=!!boss;if(boss){$('boss-name').textContent=(boss.boss||(boss.row.major?bossFor(theme,Math.floor(((boss.row.stage||0)+1)/3)):eliteFor(theme))).name;$('boss-value').textContent=Math.ceil(boss.hp)+' / '+Math.ceil(boss.maxHp);$('boss-fill').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';}
 const next=course.find(r=>!r.used&&r.type==='gate'&&r.at>state.distance);$('next-gate').textContent=next&&next.at-state.distance<50?'下一道门：'+next.options.map(g=>gateText(g).label+' '+gateText(g).value).join('  /  '):'卡牌塑造你的队伍 · 侧移避开敌人';
}
function frame(now){requestAnimationFrame(frame);if(!scene?.main)return;const delta=lastTime?Math.min(.1,(now-lastTime)/1000):0;lastTime=now;if(!paused&&!document.hidden){accumulator+=delta;while(accumulator>=step){accumulator-=step;update(step);if(paused){accumulator=0;break;}}scene.update(state,state.phase==='lost'?0:delta,now/1000);}else scene.renderer.render(scene.scene,scene.camera);if(!scene.home)updateHUD();}
const canvas=$('world');
canvas.addEventListener('pointerdown',e=>{if(scene?.home||paused||displayedResult||pointer!==null)return;pointer=e.pointerId;dragOrigin=e.clientX;dragStart=targetX;canvas.setPointerCapture(e.pointerId);$('hint').style.opacity='0';});
canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||paused)return;targetX=clamp(dragStart+(e.clientX-dragOrigin)/Math.min(innerWidth,650)*10*state.speed,-3.8,3.8);});
function releasePointer(e){if(pointer===e.pointerId)pointer=null;}
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,releasePointer);
window.addEventListener('keydown',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(pendingCards&&['1','2','3'].includes(key)){e.preventDefault();const selected=pendingCards[Number(key)-1];if(selected)document.querySelector('[data-card="'+selected.id+'"]')?.click();return;}if($('modal').open)return;if(['ArrowLeft','ArrowRight','a','d',' '].includes(key)&&scene&&!scene.home){e.preventDefault();pressed.add(key);if(key===' '&&!e.repeat)burst();}if((key==='p'||key==='Escape')&&!e.repeat)$('pause').click();});
window.addEventListener('keyup',e=>pressed.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{pressed.clear();pointer=null;if(scene&&!scene.home&&!paused&&!displayedResult)$('pause').click();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){sound.pause();pressed.clear();pointer=null;if(scene&&!scene.home&&!paused&&!displayedResult)$('pause').click();}else if(!paused)sound.resume();lastTime=0;});
window.addEventListener('resize',()=>scene?.resize());
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;sound.pause();toast('画面暂时中断，请刷新页面继续');});
async function boot(){try{scene=new ExpeditionScene(canvas,(n,total)=>{$('load-bar').style.width=Math.round(n/total*100)+'%';$('load-note').textContent='正在唤醒伙伴 · '+n+' / '+total;});await scene.ready;state=freshRun(theme,1,saved.upgrades,saved.startingPet);$('loading').classList.add('leaving');setTimeout(()=>$('loading').hidden=true,600);updateBest();requestAnimationFrame(frame);}catch(error){console.error(error);$('load-note').textContent='加载遇到了一点问题，请检查网络后重试。';const retry=document.createElement('button');retry.className='text-button';retry.textContent='重新加载';retry.onclick=()=>location.reload();$('loading').append(retry);}}
boot();
