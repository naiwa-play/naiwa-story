import {portraits,portraitFor} from './portraits.js?v=2';
import {story,scenes,endings,media,fresh,validSave,advance} from './story.js?v=2';
const $=id=>document.getElementById(id),KEY='naiwa-letter-save-v1',AUTO='naiwa-letter-auto-v1',ENDS='naiwa-letter-endings-v1';
let state=fresh(),unlocked=[],auto=false,timer,noticeTimer;
const bgm=$('bgm'),voice=$('voice');bgm.volume=.18;
function notify(text){$('notice').textContent=text;$('notice').className='show';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').className='',3500);}
function read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{notify('浏览器无法保存，关闭页面后进度可能丢失');return false;}}
const stored=read(AUTO);if(validSave(stored))state=stored;
const found=read(ENDS);if(Array.isArray(found))unlocked=found.filter(id=>Object.hasOwn(endings,id));
function album(){$('endings').replaceChildren();Object.entries(endings).forEach(([id,e],i)=>{const card=document.createElement('article');card.className='memory';const no=document.createElement('small');no.textContent='MEMORY / 0'+(i+1);const title=document.createElement('h3');title.textContent=unlocked.includes(id)?e.title:'尚未寄达';const note=document.createElement('p');note.textContent=unlocked.includes(id)?e.note:'走过这段故事，收下一份回忆。';card.append(no,title,note);$('endings').append(card);});}
function stopAuto(){auto=false;clearTimeout(timer);$('auto').textContent='自动 · 关';$('auto').setAttribute('aria-pressed','false');}
function schedule(){clearTimeout(timer);const n=story[state.node];if(auto&&!n.choices&&!n.ending&&!document.hidden&&!$('modal').open)timer=setTimeout(()=>go(),Math.max(3500,n.text.length*95));}
function render(){const n=story[state.node];$('stage').className='stage '+n.scene;$('scene-name').textContent=scenes[n.scene];$('speaker').textContent=n.speaker;$('line').textContent=n.text;$('page-count').textContent='第 '+(state.history.length+1)+' 幕';$('choices').replaceChildren();
voice.pause();voice.onended=null;const clip=media.voices[state.node];bgm.volume=.18;if(clip){voice.src=clip;bgm.volume=.05;voice.onended=()=>bgm.volume=.18;voice.play().catch(()=>{bgm.volume=.18;});}
const portrait=portraitFor(state.node), image=$('portrait');$('portrait-wrap').className='portrait '+portrait.frame;image.alt='奶蛙 · '+portrait.label;image.hidden=false;$('placeholder').hidden=true;image.onerror=()=>{image.hidden=true;$('placeholder').hidden=false;};image.src=portrait.src;
if(n.choices){stopAuto();for(const [index,c]of n.choices.entries()){const b=document.createElement('button');b.textContent=c.text;b.onclick=()=>go(index);$('choices').append(b);}}
$('next').hidden=!!n.choices;$('next').textContent=n.ending?'再读一次 ↗':'继续故事 ↗';$('ending').hidden=!n.ending;
if(n.ending){stopAuto();$('ending-title').textContent=endings[n.ending].title;$('ending-note').textContent=endings[n.ending].note;if(!unlocked.includes(n.ending)){unlocked.push(n.ending);write(ENDS,unlocked);}album();}
write(AUTO,state);$('load').disabled=!validSave(read(KEY));schedule();}
function go(choice){if(story[state.node].ending){restart();return;}state=advance(state,choice);render();}
function restart(){stopAuto();state=fresh();render();}
function modal(title){stopAuto();$('modal-title').textContent=title;$('modal-body').replaceChildren();$('modal').showModal();}
$('next').onclick=()=>go();$('save').onclick=()=>{if(write(KEY,state)){notify('进度已保存');$('load').disabled=false;}};
$('load').onclick=()=>{const s=read(KEY);if(!validSave(s)){notify('没有可读取的有效存档');return;}stopAuto();state=s;render();notify('已回到保存的位置');};
$('restart').onclick=()=>{modal('重新翻开这封信？');const p=document.createElement('p');p.textContent='当前自动进度会重新开始，手动存档和已收集结局会保留。';const b=document.createElement('button');b.textContent='确认重新开始';b.onclick=()=>{$('modal').close();restart();};$('modal-body').append(p,b);};
$('auto').onclick=()=>{auto=!auto;$('auto').textContent=auto?'自动 · 开':'自动 · 关';$('auto').setAttribute('aria-pressed',String(auto));if(story[state.node].choices||story[state.node].ending){stopAuto();notify('请先选择回答，自动播放不会替你选择');}else schedule();};
$('history').onclick=()=>{modal('已经说过的话');for(const id of [...state.history,state.node]){const n=story[id],p=document.createElement('p'),b=document.createElement('strong');b.textContent=n.speaker+'：';p.append(b,document.createTextNode(n.text));$('modal-body').append(p);}};
$('music').onclick=async()=>{if(!bgm.paused){bgm.pause();$('music').textContent='音乐 · 关';$('music').setAttribute('aria-pressed','false');}else{try{await bgm.play();$('music').textContent='音乐 · 开';$('music').setAttribute('aria-pressed','true');}catch{notify('音乐暂时无法播放，请稍后重试');}}};
$('credits').onclick=()=>{modal('关于这封信');$('modal-body').innerHTML='<p>序章体验框架，约 3～5 分钟。已接入项目主人提供的 17 张角色图片并处理透明背景，角色语音待补充。</p><p>背景元素：<a href="https://kenney.nl/assets/background-elements" target="_blank" rel="noreferrer">Kenney · Background Elements</a>，CC0。页面中进行了排布、缩放与颜色调整。</p><p>配乐：<a href="https://opengameart.org/content/calm-bgm" target="_blank" rel="noreferrer">calm bgm — syncopika</a>，<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>，原文件未修改。默认关闭，播放语音时降低音乐音量。</p><p>界面与演示剧情为本项目编写。非官方同人原型；无账号、无联网存档。</p>';};
$('close').onclick=()=>$('modal').close();
document.addEventListener('keydown',e=>{if(e.repeat||$('modal').open||['BUTTON','A','INPUT'].includes(document.activeElement?.tagName))return;if((e.code==='Space'||e.code==='ArrowRight')&&!story[state.node].choices){e.preventDefault();go();}});
let resumeMusic=false;document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();resumeMusic=!bgm.paused;bgm.pause();voice.pause();}else if(resumeMusic){bgm.play().catch(()=>{$('music').textContent='音乐 · 关';$('music').setAttribute('aria-pressed','false');});resumeMusic=false;}});
album();render();

$('gallery').onclick=()=>{modal('奶蛙的表情与姿态');const grid=document.createElement('div');grid.className='portrait-grid';for(const p of Object.values(portraits)){const card=document.createElement('figure'),img=document.createElement('img'),label=document.createElement('figcaption');img.src=p.src;img.alt=p.label;img.loading='lazy';label.textContent=p.label;card.append(img,label);grid.append(card);}$('modal-body').append(grid);};
