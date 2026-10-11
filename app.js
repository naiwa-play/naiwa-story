import {portraits,portraitFor,endingMood} from './portraits.js?v=6';
import {story,scenes,endings,chapters,secrets,media,fresh,validSave,advance,canEnterNightmares} from './story.js?v=4';
import {imageCache,mediaCache,preloadAssets} from './loader.js?v=6';
const $=id=>document.getElementById(id),KEY='naiwa-letter-save-v1',AUTO='naiwa-letter-auto-v1',ENDS='naiwa-letter-endings-v1',PATHS='naiwa-paths-v1';
let state=fresh(),unlocked=[],auto=false,timer,noticeTimer,playing=false,ready=false,textOnly=false;
let lastPortrait=null;
const bgm=$('bgm'),voice=$('voice');bgm.volume=.18;
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
function updateDlc(){const open=dlcOpen();$('dlc-start').disabled=!open;$('dlc-tree').disabled=!open;$('dlc-start').textContent=open?'翻开惊悚故事集':'主线中途解锁';$('dlc-status').textContent=open?'已解锁 · 四篇噩梦，路线选择与线索逃生':'解锁条件：主线完成第二次路线选择，抵达灯塔、潮池、云端车站、纸鲸、溪边或石门之一。已通关主线也可进入。';if(open&&!wasDlcOpen)notify('惊悚故事集已解锁，可从旅行地图进入。');wasDlcOpen=open;}
function button(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
function album(){
 $('endings').replaceChildren();$('collection-count').textContent=unlocked.length+' / '+Object.keys(endings).length+' 份回忆';
 for(const [id,e]of Object.entries(endings)){const card=document.createElement('article');card.className='memory'+(unlocked.includes(id)?' unlocked':'');const no=document.createElement('small');no.textContent=chapters[e.chapter].tag;const title=document.createElement('h3');title.textContent=unlocked.includes(id)?e.title:'未发现的回忆';const note=document.createElement('p');note.textContent=unlocked.includes(id)?e.note:'沿着不同选择，发现另一种可能。';card.append(no,title,note);$('endings').append(card);}
}
function stopAuto(){auto=false;clearTimeout(timer);$('auto').textContent='自动 · 关';$('auto').setAttribute('aria-pressed','false');}
function schedule(){clearTimeout(timer);const n=story[state.node];if(auto&&playing&&!n.choices&&!n.ending&&!document.hidden&&!$('modal').open)timer=setTimeout(go,Math.max(3500,n.text.length*95));}
function render(){
 const n=story[state.node],chapter=chapters[n.chapter],p=portraitFor(state.node);
 $('stage').className='stage '+n.scene+(n.chapter==='nightmares'?' nightmare-stage':'')+(p&&!textOnly?'':' no-portrait');
 $('dream-return').hidden=n.chapter!=='nightmares';
 $('chapter-title').textContent=chapter.title;$('chapter-tag').textContent=chapter.tag;$('scene-name').textContent=scenes[n.scene];$('scene-chapter').textContent=chapter.tag;
 // Reuse the already decoded image element: portrait and text update in one turn.
 const wrap=$('portrait-wrap');wrap.hidden=!p||textOnly;
 if(p&&!textOnly){const image=imageCache.get(p.src);if(image){if(lastPortrait!==p.src){wrap.replaceChildren();image.alt='奶蛙 · '+p.label;image.id='portrait';wrap.className='portrait '+p.frame;wrap.append(image);image.animate?.([{opacity:0,transform:'translateX(24px) scale(.98)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:420,easing:'ease-out'});}lastPortrait=p.src;}else wrap.hidden=true;}else{wrap.replaceChildren();lastPortrait=null;}
 $('speaker').textContent=n.speaker;$('line').textContent=n.text;$('page-count').textContent='第 '+(state.history.length+1)+' 幕';$('choices').replaceChildren();
 voice.pause();voice.onended=null;const clip=media.voices[state.node];bgm.volume=.18;
 if(clip){voice.src=clip;bgm.volume=.05;voice.onended=()=>bgm.volume=.18;voice.play().catch(()=>{bgm.volume=.18;});}
 if(n.choices){stopAuto();n.choices.forEach((c,index)=>$('choices').append(button(c.text,()=>go(index))));}
 $('next').hidden=!!n.choices;$('next').textContent=n.ending?(n.chapter==='prologue'?'接受邀请，开启大冒险':'返回旅行地图'):'下一句';$('ending').hidden=!n.ending;
 $('clue').hidden=!secrets[state.node];
 $('ending').className='';if(n.ending){void $('ending').offsetWidth;const mood=endingMood(n.ending,endings[n.ending]);$('ending').className='ending-reveal '+mood.tone+' theme-'+mood.theme;const mini=$('ending-frog');mini.hidden=textOnly||!imageCache.has(mood.portrait.src);mini.src=mood.portrait.src;mini.alt='奶蛙 · '+mood.portrait.label;mini.className=mood.portrait.frame;}
 if(n.ending){stopAuto();$('ending-title').textContent=endings[n.ending].title;$('ending-note').textContent=endings[n.ending].note;if(!unlocked.includes(n.ending)){unlocked.push(n.ending);write(ENDS,unlocked);}album();}
 paths[state.node]=state;write(PATHS,paths);write(AUTO,state);$('load').disabled=!validSave(read(KEY));updateDlc();schedule();
}
function enter(s){if(!ready||!validSave(s))return;if(story[s.node].chapter==='nightmares'&&story[state.node].chapter!=='nightmares'){if(!dlcOpen()){notify('请先完成主线第二次路线选择，解锁惊悚故事集。');return;}if(!write(WAKE,state))return;}stopAuto();state=s;lastPortrait=null;playing=true;$('home').hidden=true;$('reader').hidden=false;$('back-home').hidden=false;render();window.scrollTo({top:0,behavior:'instant'});}
function home(){playing=false;stopAuto();voice.pause();bgm.volume=.18;$('home').hidden=false;$('reader').hidden=true;$('back-home').hidden=true;$('resume').hidden=!validSave(read(AUTO));$('resume').textContent='继续旅程 · '+chapters[story[state.node].chapter].title;album();updateDlc();window.scrollTo({top:0,behavior:'instant'});}
function go(choice){if(!playing)return;if(story[state.node].ending){if(story[state.node].chapter==='prologue')enter(fresh('adventure'));else home();return;}state=advance(state,choice);render();}
function modal(title){stopAuto();$('modal-title').textContent=title;$('modal-body').replaceChildren();$('modal').showModal();}
function routeTree(chapter){
 if(chapter==='nightmares'&&!dlcOpen()){notify('请先推进主线，完成第二次路线选择。');return;}
 modal(chapters[chapter].title+' · 路线树');const intro=document.createElement('p');intro.textContent='亮起的节点可以回看与改选；未发现的结局隐藏名称。跳转会更新自动进度，手动存档保留。';$('modal-body').append(intro);
 function branch(id){let n=story[id];while(n.next&&!n.choices&&!n.ending){id=n.next;n=story[id];}const li=document.createElement('li');
 const label=n.ending?(unlocked.includes(n.ending)?endings[n.ending].title:'未发现的结局'):scenes[n.scene]+' · 选择';
 const b=button(label,()=>{$('modal').close();enter(paths[id]);});b.disabled=!paths[id];li.append(b);
 if(n.choices){const ul=document.createElement('ul');for(const c of n.choices){const item=document.createElement('li'),name=document.createElement('span');name.textContent=c.text;item.append(name);const sub=document.createElement('ul');sub.append(branch(c.to));item.append(sub);ul.append(item);}li.append(ul);}return li;}
 const tree=document.createElement('ul');tree.className='route-tree';tree.append(branch(chapters[chapter].entry));$('modal-body').append(tree);
}
function startChapter(id){if(id==='nightmares'){if(!dlcOpen()){notify('请先推进主线，完成第二次路线选择。');return;}enter(fresh(id));return;}if(validSave(read(AUTO))&&state.node!==chapters[id].entry){modal('开始一段新的旅程？');const p=document.createElement('p');p.textContent='这会替换当前自动进度。手动存档、已读路线和已收集结局都会保留。';$('modal-body').append(p,button('开始 · '+chapters[id].title,()=>{$('modal').close();enter(fresh(id));}));}else enter(fresh(id));}
for(const [id,ch]of Object.entries(chapters)){
 if(id==='nightmares')continue;
 const card=document.createElement('article');card.className='chapter-card '+ch.scene;const art=document.createElement('div');art.className='chapter-art';art.setAttribute('aria-hidden','true');const tag=document.createElement('small');tag.textContent=ch.tag;const title=document.createElement('h2');title.textContent=ch.title;const p=document.createElement('p');p.textContent=ch.description;const actions=document.createElement('div');actions.className='card-actions';actions.append(button('开始阅读',()=>startChapter(id)),button('路线树',()=>routeTree(id)));card.append(art,tag,title,p,actions);$('chapters').append(card);
}
$('resume').onclick=()=>enter(state);$('back-home').onclick=home;$('next').onclick=()=>go();
$('dlc-start').onclick=()=>startChapter('nightmares');$('dlc-tree').onclick=()=>routeTree('nightmares');
$('dream-return').onclick=()=>{const s=read(WAKE);if(validSave(s)&&story[s.node].chapter!=='nightmares')enter(s);else enter(fresh('adventure'));};
$('save').onclick=()=>{if(write(KEY,state)){notify('进度已保存');$('load').disabled=false;}};
$('load').onclick=()=>{const s=read(KEY);if(!validSave(s)){notify('没有可读取的有效存档');return;}enter(s);notify('已回到保存的位置');};
$('restart').onclick=()=>{modal('重新开始当前章节？');const p=document.createElement('p');p.textContent='手动存档和已收集回忆会保留。';$('modal-body').append(p,button('确认重新开始',()=>{$('modal').close();enter(fresh(story[state.node].chapter));}));};
$('routes').onclick=()=>routeTree(story[state.node].chapter);
$('clue').onclick=()=>{const secret=secrets[state.node];if(!secret)return;if(!discovered.includes(state.node)){discovered.push(state.node);write('naiwa-secrets-v1',discovered);}modal(secret.title);const p=document.createElement('p');p.textContent=secret.text;$('modal-body').append(p);};
$('secrets').onclick=()=>{modal('旅途拾遗 · '+discovered.length+' / '+Object.keys(secrets).length);for(const [id,s]of Object.entries(secrets)){const p=document.createElement('p');p.textContent=discovered.includes(id)?s.title+'：'+s.text:'尚未发现 · 留意故事中可以查看的小物件。';$('modal-body').append(p);}};
$('auto').onclick=()=>{auto=!auto;$('auto').textContent=auto?'自动 · 开':'自动 · 关';$('auto').setAttribute('aria-pressed',String(auto));if(story[state.node].choices||story[state.node].ending){stopAuto();notify('请先选择回答，自动播放不会替你选择');}else schedule();};
$('history').onclick=()=>{modal('已经说过的话');for(const id of [...state.history,state.node]){const n=story[id],p=document.createElement('p'),b=document.createElement('strong');b.textContent=n.speaker+'：';p.append(b,document.createTextNode(n.text));$('modal-body').append(p);}};
$('music').onclick=async()=>{if(!bgm.paused){bgm.pause();$('music').textContent='音乐 · 关';$('music').setAttribute('aria-pressed','false');}else{try{await bgm.play();$('music').textContent='音乐 · 开';$('music').setAttribute('aria-pressed','true');}catch{notify('音乐暂时无法播放，请稍后重试');}}};
$('credits').onclick=()=>{modal('关于这段旅程');$('modal-body').innerHTML='<p>序章《奶蛙来信》、大冒险主线、三篇独立支线，以及需主线进度解锁的 DLC《惊悚故事集》。新增表情立绘已按情节接入；服装造型可在角色图鉴欣赏，语音等待主人提供。</p><p>奶蛙图片由项目主人挑选提供，已去背景并生成 WebP 交付版本；原 PNG 保留。</p><p>背景元素：<a href="https://kenney.nl/assets/background-elements" target="_blank" rel="noreferrer">Kenney · Background Elements</a>，CC0；新场景以 CSS 绘制；DLC 四幅夜景为项目原创 SVG 插画。</p><p>配乐：<a href="https://opengameart.org/content/calm-bgm" target="_blank" rel="noreferrer">calm bgm — syncopika</a>，<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>。默认关闭。</p><p>非官方同人作品。存档仅在当前浏览器，无账号、无云端同步。</p>';};
$('close').onclick=()=>$('modal').close();
$('gallery').onclick=()=>{modal('奶蛙的表情与姿态');const grid=document.createElement('div');grid.className='portrait-grid';for(const p of Object.values(portraits)){const card=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption');img.src=p.src;img.alt=p.label;label.textContent=p.label;card.append(img,label);grid.append(card);}$('modal-body').append(grid);};
document.addEventListener('keydown',e=>{if(!playing||e.repeat||$('modal').open||['BUTTON','A','INPUT'].includes(document.activeElement?.tagName))return;if((e.code==='Space'||e.code==='ArrowRight')&&!story[state.node].choices){e.preventDefault();go();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();bgm.pause();voice.pause();$('music').textContent='音乐 · 关';$('music').setAttribute('aria-pressed','false');}});
let loading=false;
async function boot(){
 if(loading)return;loading=true;$('retry-load').disabled=true;$('loading-actions').hidden=true;$('loading-label').textContent='正在打包这次旅行的行李…';
 const timeout=setTimeout(()=>{$('loading-label').textContent='当前网络加载较慢，你可以继续等待，或先以纯文字模式进入。';$('loading-actions').hidden=false;},5000);
 const failed=await preloadAssets(portraits,(done,total)=>{$('loading-progress').value=done/total;$('loading-count').textContent=done+' / '+total;});
 clearTimeout(timeout);loading=false;$('retry-load').disabled=false;
 if(mediaCache.has('music'))bgm.src=mediaCache.get('music');
 if(ready)return;
 if(failed.length)notify('已进入游戏：有 '+failed.length+' 张图片暂未加载，文字与已加载图片可正常使用。网络恢复后刷新可补齐。');
 ready=true;$('loading-screen').hidden=true;$('app-shell').hidden=false;home();
}
$('text-mode').onclick=()=>{textOnly=true;ready=true;$('loading-screen').hidden=true;$('app-shell').hidden=false;home();notify('已进入纯文字模式，刷新页面可重新加载立绘');};
$('retry-load').onclick=boot;
const bootPromise=boot();
