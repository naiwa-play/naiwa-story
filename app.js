import {relics,collectedRelics,rewardFor} from './relics.js?v=14';
import {portraits,portraitFor,endingMood} from './portraits.js?v=14';
import {story,scenes,endings,chapters,secrets,media,fresh,validSave,advance,canEnterNightmares} from './story.js?v=14';
import {imageCache,mediaCache,preloadAssets,loadImage} from './loader.js?v=14';
const $=id=>document.getElementById(id),KEY='naiwa-letter-save-v1',AUTO='naiwa-letter-auto-v1',ENDS='naiwa-letter-endings-v1',PATHS='naiwa-paths-v1';
let state=fresh(),unlocked=[],auto=false,timer,noticeTimer,playing=false,ready=false,textOnly=false;
let lastPortrait=null;
let celebrationTimer;
function stopCelebration(){clearTimeout(celebrationTimer);$('celebration').hidden=true;$('celebration').className='';}
function celebrate(ending){stopCelebration();if(!ending?.celebration)return;$('celebration').hidden=false;void $('celebration').offsetWidth;$('celebration').className='wildlife-finale';celebrationTimer=setTimeout(stopCelebration,window.matchMedia('(prefers-reduced-motion: reduce)').matches?3500:9000);}
const bgm=$('bgm'),voice=$('voice');bgm.volume=.18;bgm.loop=true;
// Keep the user's choice separate from browser/OS pauses; never restart music they switched off.
let musicWanted=false,musicPending=false,musicBuffering=false,musicRevision=0,musicTrack='daily';
const musicSources={daily:'assets/calm.ogg',nightmares:'assets/music/thirteenth-bell.wav?v=14',polar:'assets/music/white-echo.wav?v=14',iceland:'assets/music/sea-letter.wav?v=14'};
const musicTitles={daily:'日常 · calm bgm',nightmares:'惊悚故事集 · 第十三声之后',polar:'白色回声 · 冰的呼吸',iceland:'冰岛海信 · 寄往海风'};
function selectMusic(chapter){const track=Object.hasOwn(musicSources,chapter)?chapter:'daily';if(track===musicTrack)return;
 musicTrack=track;musicRevision++;musicPending=false;musicBuffering=false;bgm.pause();bgm.src=musicSources[track];bgm.loop=true;bgm.load();
 if(musicWanted&&!document.hidden)void resumeMusic();else musicLabel();
}
function musicLabel(){
 $('music').setAttribute('title',musicTitles[musicTrack]);
 const active=musicWanted&&!bgm.paused&&!document.hidden;
 $('music').textContent=!musicWanted?'音乐 · 关':document.hidden?'音乐 · 暂歇':musicBuffering?'音乐 · 缓冲中':active?'音乐 · 开':'音乐 · 点按继续';
 $('music').setAttribute('aria-pressed',String(musicWanted));
}
async function resumeMusic(explicit=false){
 if(!musicWanted||document.hidden||musicPending)return;
 musicPending=true;const revision=musicRevision;
 try{await bgm.play();if(revision!==musicRevision)return;if(!musicWanted||document.hidden)bgm.pause();}
 catch{if(revision===musicRevision&&explicit&&musicWanted&&!document.hidden)notify('音乐暂未播放，请点按音乐按钮重试');}
 finally{if(revision===musicRevision){musicPending=false;musicBuffering=false;musicLabel();}}
}
bgm.onplaying=()=>{musicBuffering=false;musicLabel();};
bgm.onpause=()=>{musicBuffering=false;musicLabel();};
bgm.onwaiting=()=>{musicBuffering=true;musicLabel();};
bgm.onerror=()=>{musicBuffering=false;musicLabel();if(musicWanted)notify('音乐加载失败，请点按音乐按钮重试');};
// Native looping is primary; recover if a browser nevertheless emits ended.
bgm.onended=()=>{if(musicWanted&&!document.hidden){bgm.currentTime=0;void resumeMusic();}};
function resumeAfterGesture(event){if(event.target!==$('music')&&musicWanted&&bgm.paused)void resumeMusic();}
document.addEventListener('pointerdown',resumeAfterGesture);
document.addEventListener('keydown',resumeAfterGesture);
window.addEventListener('pageshow',()=>{if(musicWanted&&bgm.paused)void resumeMusic();});
function notify(text){$('notice').textContent=text;$('notice').className='show';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').className='',3500);}
function read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{notify('浏览器无法保存，关闭页面后进度可能丢失');return false;}}
const stored=read(AUTO);if(validSave(stored))state=stored;
const found=read(ENDS);if(Array.isArray(found))unlocked=found.filter(id=>Object.hasOwn(endings,id));
const secretSaved=read('naiwa-secrets-v1'),discovered=Array.isArray(secretSaved)?secretSaved.filter(id=>Object.hasOwn(secrets,id)):[];
const rawPaths=read(PATHS),paths=Object.create(null);
if(rawPaths&&typeof rawPaths==='object')for(const [id,s]of Object.entries(rawPaths))if(id===s?.node&&validSave(s))paths[id]=s;
const WAKE='naiwa-before-dream-v1';
// A resumable DLC save is itself evidence of an earlier unlock, including old devices' route ledgers.
function dlcOpen(){return canEnterNightmares(state,paths,unlocked)||Object.values(paths).some(s=>story[s.node].chapter==='nightmares')||story[state.node].chapter==='nightmares';}
let wasDlcOpen=dlcOpen();
function updateDlc(){const open=dlcOpen();$('dlc-start').disabled=!open;$('dlc-tree').disabled=!open;$('dlc-start').textContent=open?'翻开惊悚故事集':'主线中途解锁';$('dlc-status').textContent=open?'已解锁 · 四篇噩梦，路线选择与线索逃生':'解锁条件：主线推进至岛城地下检修门。旧版主线已解锁的进度继续有效。';if(open&&!wasDlcOpen)notify('惊悚故事集已解锁，可从旅行地图进入。');wasDlcOpen=open;}
function button(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
const visibleEndings=()=>Object.entries(endings).filter(([id,e])=>!e.legacy||unlocked.includes(id));
function album(){
 $('endings').replaceChildren();$('collection-count').textContent=unlocked.length+' / '+visibleEndings().length+' 份回忆';
 for(const [id,e]of visibleEndings()){const card=document.createElement('article');card.className='memory'+(unlocked.includes(id)?' unlocked':'');const no=document.createElement('small');no.textContent=e.legacy?'旧版主线 · 已珍藏':chapters[e.chapter].tag;const title=document.createElement('h3');title.textContent=unlocked.includes(id)?e.title:'未发现的回忆';const note=document.createElement('p');note.textContent=unlocked.includes(id)?e.note:'沿着不同选择，发现另一种可能。';card.append(no,title,note);$('endings').append(card);}
}
function stopAuto(){auto=false;clearTimeout(timer);$('auto').textContent='自动 · 关';$('auto').setAttribute('aria-pressed','false');}
function schedule(){clearTimeout(timer);const n=story[state.node];if(auto&&playing&&!n.choices&&!n.ending&&!document.hidden&&!$('modal').open)timer=setTimeout(go,Math.max(3500,n.text.length*95));}
function paintPortrait(p){
 const wrap=$('portrait-wrap'),image=p&&imageCache.get(p.src);wrap.hidden=!image||textOnly;
 if(!image||textOnly){wrap.replaceChildren();lastPortrait=null;return;}
 if(lastPortrait===p.src)return;wrap.replaceChildren();image.alt='奶蛙 · '+p.label;image.id='portrait';wrap.className='portrait '+p.frame;wrap.append(image);lastPortrait=p.src;
 image.animate?.([{opacity:0,transform:'translateX(24px) scale(.98)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420,easing:'ease-out'});
}
function requestPortrait(p){
 const at=state.node;if(!p||textOnly)return;
 $('retry-portrait').hidden=true;$('portrait-status').textContent='';
 if(imageCache.has(p.src)){paintPortrait(p);return;}
 // Keep a decoded neutral portrait visible while the requested expression arrives.
 if(lastPortrait===null&&imageCache.has(portraits.normal.src))paintPortrait(portraits.normal);
 $('portrait-status').textContent='立绘正在加载…';
 loadImage(p.src).then(()=>{if(!playing||state.node!==at||textOnly)return;paintPortrait(p);$('portrait-status').textContent='';$('retry-portrait').hidden=true;}).catch(()=>{if(!playing||state.node!==at||textOnly)return;$('portrait-status').textContent='当前立绘下载失败，可以重试';$('retry-portrait').hidden=false;});
}
function prepareNext(id){
 if(textOnly)return;const seen=new Set(),queue=[[id,0]],art={};
 while(queue.length){const [node,depth]=queue.shift();if(seen.has(node)||depth>8)continue;seen.add(node);const n=story[node],p=portraitFor(node);if(p)art[p.src]=p;if(n.ending){const m=endingMood(n.ending,endings[n.ending]);art[m.portrait.src]=m.portrait;}for(const next of n.choices?.map(c=>c.to)||[n.next])if(next)queue.push([next,depth+1]);}
 void preloadAssets(art,()=>{});
 const backgrounds=[...new Set([...seen].map(key=>story[key].scene).filter(scene=>/^(ice|polar|city)-/.test(scene)))];
 for(const scene of backgrounds)void loadImage('./assets/'+(scene.startsWith('city-')?'urban/':'travels/')+scene+'.svg').catch(()=>{});
}
function render(){
 selectMusic(story[state.node].chapter);stopCelebration();
 const n=story[state.node],chapter=chapters[n.chapter],p=portraitFor(state.node);
 $('stage').className='stage '+n.scene+(n.chapter==='nightmares'?' nightmare-stage':'')+(p&&!textOnly?'':' no-portrait');
 $('dream-return').hidden=n.chapter!=='nightmares';
 $('chapter-title').textContent=chapter.title;$('chapter-tag').textContent=chapter.tag;$('scene-name').textContent=scenes[n.scene];$('scene-chapter').textContent=chapter.tag;
 if(textOnly)paintPortrait(null);else requestPortrait(p);
 prepareNext(state.node);
 $('speaker').textContent=n.speaker;$('line').textContent=n.text;$('page-count').textContent='第 '+(state.history.length+1)+' 幕';$('choices').replaceChildren();
 voice.pause();voice.onended=null;const clip=media.voices[state.node];bgm.volume=.18;
 if(clip){voice.src=clip;bgm.volume=.05;voice.onended=()=>bgm.volume=.18;voice.play().catch(()=>{bgm.volume=.18;});}
 if(n.choices){stopAuto();n.choices.forEach((c,index)=>$('choices').append(button(c.text,()=>go(index))));}
 $('next').hidden=!!n.choices;$('next').textContent=n.ending?(n.chapter==='prologue'?'接受邀请，开启大冒险':'返回旅行地图'):'下一句';$('ending').hidden=!n.ending;
 $('clue').hidden=!secrets[state.node];$('reward').hidden=!n.ending||!rewardFor(n.ending);
 $('ending').className='';if(n.ending){void $('ending').offsetWidth;const mood=endingMood(n.ending,endings[n.ending]);$('ending').className='ending-reveal '+mood.tone+' theme-'+mood.theme;const mini=$('ending-frog');mini.hidden=textOnly||!imageCache.has(mood.portrait.src);mini.src=mood.portrait.src;mini.alt='奶蛙 · '+mood.portrait.label;mini.className=mood.portrait.frame;}
 if(n.ending){const gift=rewardFor(n.ending);$('reward').hidden=!gift;if(gift)$('reward').textContent=(unlocked.includes(n.ending)?'已珍藏 · ':'获得回忆物品 · ')+gift.name+' — '+gift.text;stopAuto();$('ending-title').textContent=endings[n.ending].title;$('ending-note').textContent=endings[n.ending].note;if(!unlocked.includes(n.ending)){unlocked.push(n.ending);write(ENDS,unlocked);}album();}
 if(n.ending&&!textOnly){const at=state.node,mood=endingMood(n.ending,endings[n.ending]);loadImage(mood.portrait.src).then(()=>{if(playing&&state.node===at&&!textOnly)$('ending-frog').hidden=false;}).catch(()=>{});}
 if(n.ending)celebrate(endings[n.ending]);
 $('rewind').hidden=!state.history.some(id=>story[id].choices);
 paths[state.node]=state;write(PATHS,paths);write(AUTO,state);$('load').disabled=!validSave(read(KEY));updateDlc();schedule();
}
function enter(s){if(!ready||!validSave(s))return;if(story[s.node].chapter==='nightmares'&&story[state.node].chapter!=='nightmares'){if(!dlcOpen()){notify('请先推进主线至岛城地下检修门，解锁惊悚故事集。');return;}if(!write(WAKE,state))return;}stopAuto();state=s;lastPortrait=null;playing=true;$('home').hidden=true;$('reader').hidden=false;$('back-home').hidden=false;render();window.scrollTo({top:0,behavior:'instant'});}
function home(){selectMusic('daily');stopCelebration();playing=false;stopAuto();voice.pause();bgm.volume=.18;$('home').hidden=false;$('reader').hidden=true;$('back-home').hidden=true;$('resume').hidden=!validSave(read(AUTO));$('resume').textContent='继续旅程 · '+chapters[story[state.node].chapter].title+(story[state.node].legacy?'（旧版存档）':'');album();updateDlc();window.scrollTo({top:0,behavior:'instant'});}
function go(choice){if(!playing)return;if(story[state.node].ending){if(story[state.node].chapter==='prologue')enter(fresh('adventure'));else home();return;}state=advance(state,choice);render();}
function modal(title){stopAuto();$('modal-title').textContent=title;$('modal-body').replaceChildren();$('modal').showModal();$('modal-body').scrollTop=0;}
function routeTree(chapter){
 if(chapter==='nightmares'&&!dlcOpen()){notify('请先推进主线至岛城地下检修门。');return;}
 modal(chapters[chapter].title+' · 路线树');const intro=document.createElement('p');intro.textContent='亮起的节点可以回看与改选；未发现的结局隐藏名称。跳转会更新自动进度，手动存档保留。';$('modal-body').append(intro);
 const shown=new Set();function branch(id){let n=story[id];while(n.next&&!n.choices&&!n.ending){id=n.next;n=story[id];}const li=document.createElement('li');
 const label=n.ending?(unlocked.includes(n.ending)?endings[n.ending].title:'未发现的结局'):scenes[n.scene]+' · 选择';
 const b=button(n.choices?'回溯选择点 · '+label:'回看结局 · '+label,()=>{$('modal').close();enter(paths[id]);});b.disabled=!paths[id];li.append(b);
 if(shown.has(id)){const hint=document.createElement('small');hint.textContent='后续与上方同名节点汇合';li.append(hint);return li;}shown.add(id);if(n.choices){const ul=document.createElement('ul');for(const c of n.choices){const item=document.createElement('li'),name=document.createElement('span');name.textContent=c.text;item.append(name);const sub=document.createElement('ul');sub.append(branch(c.to));item.append(sub);ul.append(item);}li.append(ul);}return li;}
 const checkpoints=document.createElement('div');checkpoints.className='checkpoint-list';for(const [id,saved]of Object.entries(paths)){const n=story[id];if(n.chapter!==chapter||!n.choices)continue;const card=document.createElement('article'),p=document.createElement('p');p.textContent=n.text;card.append(p,button('回到这个选择 · 第 '+(saved.history.length+1)+' 幕',()=>{$('modal').close();enter(saved);}));checkpoints.append(card);}$('modal-body').append(checkpoints);
 const tree=document.createElement('ul');tree.className='route-tree';tree.append(branch(chapters[chapter].entry));$('modal-body').append(tree);
}
function startChapter(id){if(id==='nightmares'){if(!dlcOpen()){notify('请先推进主线至岛城地下检修门。');return;}enter(fresh(id));return;}if(validSave(read(AUTO))&&state.node!==chapters[id].entry){modal('开始一段新的旅程？');const p=document.createElement('p');p.textContent='这会替换当前自动进度。手动存档、已读路线和已收集结局都会保留。';$('modal-body').append(p,button('开始 · '+chapters[id].title,()=>{$('modal').close();enter(fresh(id));}));}else enter(fresh(id));}
for(const [id,ch]of Object.entries(chapters)){
 if(id==='nightmares'||id==='polar')continue;
 const card=document.createElement('article');card.className='chapter-card '+ch.scene;const art=document.createElement('div');art.className='chapter-art';art.setAttribute('aria-hidden','true');const tag=document.createElement('small');tag.textContent=ch.tag;const title=document.createElement('h2');title.textContent=ch.title;const p=document.createElement('p');p.textContent=ch.description;const actions=document.createElement('div');actions.className='card-actions';actions.append(button('开始阅读',()=>startChapter(id)),button('路线树',()=>routeTree(id)));card.append(art,tag,title,p,actions);$('chapters').append(card);
}
$('resume').onclick=()=>enter(state);$('back-home').onclick=home;$('next').onclick=()=>go();
$('retry-portrait').onclick=()=>requestPortrait(portraitFor(state.node));
$('polar-start').onclick=()=>startChapter('polar');$('polar-tree').onclick=()=>routeTree('polar');
for(const [id,label] of [['dream','惊悚故事集'],['polar','白色回声']]){const control=$(id+'-motion');control.onclick=()=>{const paused=control.getAttribute('aria-pressed')!=='true';control.setAttribute('aria-pressed',String(paused));control.setAttribute('aria-label',(paused?'播放':'暂停')+label+'背景动画');control.textContent=paused?'播放动画':'暂停动画';$(id+'-showcase').classList.toggle('motion-paused',paused);};}
$('dlc-start').onclick=()=>startChapter('nightmares');$('dlc-tree').onclick=()=>routeTree('nightmares');
$('dream-return').onclick=()=>{const s=read(WAKE);if(validSave(s)&&story[s.node].chapter!=='nightmares')enter(s);else enter(fresh('adventure'));};
$('rewind').onclick=()=>{const id=[...state.history].reverse().find(id=>story[id].choices);if(!id)return;const cut=state.history.lastIndexOf(id);enter({version:1,node:id,history:state.history.slice(0,cut)});};
function showRelics(){const available=relics.filter(r=>r.ends.some(id=>!endings[id].legacy||unlocked.includes(id)));modal('回忆图鉴 · '+collectedRelics(unlocked).length+' / '+available.length);const grid=document.createElement('div');grid.className='relic-grid';for(const r of available){const owned=r.ends.some(id=>unlocked.includes(id)),card=document.createElement('article'),art=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p'),small=document.createElement('small');card.className='relic-card'+(owned?' owned':'');art.className='relic-art '+(owned?r.kind:'locked');art.textContent=owned?r.icon:'?';art.setAttribute('aria-hidden','true');h.textContent=owned?r.name:'尚未获得的纪念';small.textContent=owned?r.from:chapters[endings[r.ends[0]].chapter].title+' · 待探索';p.textContent=owned?r.text:'完成不同路线，收下旅途中赠送的物品。';card.append(art,h,small,p);grid.append(card);}$('modal-body').append(grid);}
$('relics').onclick=showRelics;$('relics-home').onclick=showRelics;
$('save').onclick=()=>{if(write(KEY,state)){notify('进度已保存');$('load').disabled=false;}};
$('load').onclick=()=>{const s=read(KEY);if(!validSave(s)){notify('没有可读取的有效存档');return;}enter(s);notify('已回到保存的位置');};
$('restart').onclick=()=>{modal('重新开始当前章节？');const p=document.createElement('p');p.textContent='手动存档和已收集回忆会保留。';$('modal-body').append(p,button('确认重新开始',()=>{$('modal').close();enter(fresh(story[state.node].chapter));}));};
$('routes').onclick=()=>routeTree(story[state.node].chapter);
$('clue').onclick=()=>{const secret=secrets[state.node];if(!secret)return;if(!discovered.includes(state.node)){discovered.push(state.node);write('naiwa-secrets-v1',discovered);}modal(secret.title);const p=document.createElement('p');p.textContent=secret.text;$('modal-body').append(p);};
$('secrets').onclick=()=>{modal('旅途拾遗 · '+discovered.length+' / '+Object.keys(secrets).length);for(const [id,s]of Object.entries(secrets)){const p=document.createElement('p');p.textContent=discovered.includes(id)?s.title+'：'+s.text:'尚未发现 · 留意故事中可以查看的小物件。';$('modal-body').append(p);}};
$('auto').onclick=()=>{auto=!auto;$('auto').textContent=auto?'自动 · 开':'自动 · 关';$('auto').setAttribute('aria-pressed',String(auto));if(story[state.node].choices||story[state.node].ending){stopAuto();notify('请先选择回答，自动播放不会替你选择');}else schedule();};
$('history').onclick=()=>{modal('已经说过的话');for(const id of [...state.history,state.node]){const n=story[id],p=document.createElement('p'),b=document.createElement('strong');b.textContent=n.speaker+'：';p.append(b,document.createTextNode(n.text));$('modal-body').append(p);}};
$('music').onclick=async()=>{if(musicWanted&&(!bgm.paused||musicPending)){musicWanted=false;bgm.pause();musicLabel();}else{musicWanted=true;if(bgm.error)bgm.load();await resumeMusic(true);}};
$('credits').onclick=()=>{modal('关于这段旅程');$('modal-body').innerHTML='<p>序章《奶蛙来信》、大冒险主线、三篇旅行支线与两篇都市支线，以及需主线进度解锁的 DLC《惊悚故事集》。另有浪漫远行《冰岛海信》与环保远行《白色回声》。新增表情立绘已按情节接入；服装造型可在角色图鉴欣赏，语音等待主人提供。</p><p>奶蛙图片由项目主人挑选提供，已去背景并生成 WebP 交付版本；原 PNG 保留。</p><p>背景元素：<a href="https://kenney.nl/assets/background-elements" target="_blank" rel="noreferrer">Kenney · Background Elements</a>，CC0；新场景以 CSS 绘制；惊悚故事集四幅夜景与远行篇十七幅风景为项目原创 SVG 插画，极地庆典动物由 CSS 绘制。回声站与人物为虚构，动物感谢呈现为奶蛙画中的愿望。</p><p>配乐：<a href="https://opengameart.org/content/calm-bgm" target="_blank" rel="noreferrer">calm bgm — syncopika</a>，<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>。另有项目原创配乐：惊悚《第十三声之后》、极地《冰的呼吸》、冰岛《寄往海风》。进入对应故事自动切换，返回地图恢复日常配乐；默认关闭。</p><p>非官方同人作品。存档仅在当前浏览器，无账号、无云端同步。</p>';};
$('close').onclick=()=>$('modal').close();
let backdropStarted=false;
function outsideModal(event){const r=$('modal').getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;}
$('modal').onpointerdown=e=>{backdropStarted=e.target===$('modal')&&outsideModal(e);};
$('modal').onclick=e=>{if(backdropStarted&&e.target===$('modal')&&outsideModal(e))$('modal').close();backdropStarted=false;};
$('gallery').onclick=()=>{modal('奶蛙的表情与姿态');const grid=document.createElement('div');grid.className='portrait-grid';for(const p of Object.values(portraits)){const card=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption');img.loading='lazy';img.src=p.src;img.alt=p.label;label.textContent=p.label;card.append(img,label);grid.append(card);}$('modal-body').append(grid);};
document.addEventListener('keydown',e=>{if(!playing||e.repeat||$('modal').open||['BUTTON','A','INPUT'].includes(document.activeElement?.tagName))return;if((e.code==='Space'||e.code==='ArrowRight')&&!story[state.node].choices){e.preventDefault();go();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();bgm.pause();voice.pause();}else if(musicWanted){void resumeMusic();}musicLabel();});
let loading=false;
async function boot(){
 if(loading)return;loading=true;$('retry-load').disabled=true;$('loading-actions').hidden=true;$('loading-label').textContent='正在打包这次旅行的行李…';
 const timeout=setTimeout(()=>{$('loading-label').textContent='当前网络加载较慢，你可以继续等待，或先以纯文字模式进入。';$('loading-actions').hidden=false;},5000);
 const initial=portraitFor(state.node)||portraits.normal;const failed=await preloadAssets({initial},(done,total)=>{$('loading-progress').value=done/total;$('loading-count').textContent=done+' / '+total;});
 clearTimeout(timeout);loading=false;$('retry-load').disabled=false;
 if(mediaCache.has('music'))bgm.src=mediaCache.get('music');
 if(ready)return;
 if(failed.length)notify('已进入游戏：有 '+failed.length+' 张图片暂未加载，文字与已加载图片可正常使用。慢速图片会继续下载，无需刷新。');
 ready=true;$('loading-screen').hidden=true;$('app-shell').hidden=false;home();prepareNext(state.node);
}
$('text-mode').onclick=()=>{textOnly=true;ready=true;$('loading-screen').hidden=true;$('app-shell').hidden=false;home();notify('已进入纯文字模式，刷新页面可重新加载立绘');};
$('retry-load').onclick=boot;
const bootPromise=boot();
