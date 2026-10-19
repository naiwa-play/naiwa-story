import {showLetter} from './letter.js?v=4';
import {nodes,places,studyOptions,questions} from './story.js?v=4';
import {fresh,valid,apply,report,assignClass,destination,STREAMS,enterSecond} from './model.js?v=4';
import {placement,createScore} from './presentation.js?v=4';
const $=id=>document.getElementById(id),termNames=['雾中序幕','高一 · 上','高一 · 下','高二 · 上','高二 · 下','高三 · 上','高三 · 下'];
export function start({preview=false}={}){
 if(preview){const b=document.createElement('button');b.textContent='校样工具';b.onclick=proofTools;document.querySelector('.tools').prepend(b);}
 const key=preview?'naiwa-damiao-preview-v1':'naiwa-damiao-v1';let state=fresh(),artRevision=0,busy=false;const portraitCache=new Map();
 try{const saved=JSON.parse(localStorage.getItem(key));if(valid(saved,nodes))state=saved;}catch{}
 const score=createScore(new Audio(),document,({wanted,paused,failed,title})=>{$('sound').textContent=failed?'配乐 · 点按重试':wanted?(paused?'配乐 · 已暂停':'配乐 · '+title):'配乐 · 关';$('sound').setAttribute('aria-pressed',String(wanted));});
 $('sound').onclick=()=>score.toggle();
 window.addEventListener('pagehide',()=>score.stop());
 let softEffects=false;try{softEffects=localStorage.getItem('naiwa-damiao-soft-effects')==='yes';}catch{}
 function effects(n){$('scene').dataset.noise=n.noise||(n.round===5?'heavy':n.round===4?'light':'clear');$('scene').dataset.effects=softEffects?'soft':'full';$('effects').hidden=(n.round??1)<4;$('effects').textContent=softEffects?'画面动效 · 轻':'画面动效 · 完整';$('effects').setAttribute('aria-pressed',String(!softEffects));}
 $('effects').onclick=()=>{softEffects=!softEffects;try{localStorage.setItem('naiwa-damiao-soft-effects',softEffects?'yes':'no');}catch{}effects(nodes[state.node]);};
 $('leave').onclick=()=>{$('reader').hidden=true;$('gate').hidden=false;for(const id of ['effects','sound','journal'])$(id).hidden=true;score.stop();window.scrollTo({top:0,behavior:'instant'});};
 document.addEventListener('damiao-resume',()=>{for(const id of ['sound','journal'])$(id).hidden=false;effects(nodes[state.node]);});
 $('close').onclick=()=>$('notebook').close();let outside=false;
 const off=e=>{const r=$('notebook').getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
 $('notebook').onpointerdown=e=>{outside=e.target===$('notebook')&&off(e);};$('notebook').onclick=e=>{if(outside&&e.target===$('notebook')&&off(e))$('notebook').close();outside=false;};
 function save(){try{localStorage.setItem(key,JSON.stringify(state));$('save-status').textContent=preview?'本机测试存档 · 与正式游玩分开':'这一页已收好';}catch{$('save-status').textContent='暂时无法保存，请保持此页面打开。';}}
 function text(tag,content,parent,cls){const e=document.createElement(tag);e.textContent=content;if(cls)e.className=cls;parent.append(e);return e;}
 function button(label,fn,parent=$('interaction'),detail){const b=text('button',label,parent);if(detail)text('small',detail,b);b.onclick=fn;return b;}
 function proofTools(){
  const body=$('notebook-body');body.replaceChildren();$('notebook-title').textContent='本机校样';text('p','试读会更换本机测试进度，正式存档不变。也可以只展开画册或预览作者来信。',body);
  function trial(label,node,group){button(label,()=>{body.replaceChildren();text('p','这会重置本机测试卷的阅读位置，正式存档不变。',body);button('确认试读',()=>{state=fresh();state.node=node;enterSecond(state);if(group){state.second.group=group;state.second.study=group==='励志一班'?10:6;}$('notebook').close();render();},body);button('返回校样工具',proofTools,body);},body);}
  trial('从第二轮开头试读','second-gate');trial('试读普通四班后半程','second-pause','普通四班');trial('试读励志一班后半程','second-one-pause','励志一班');
  trial('从林照微的故事试读','third-register');trial('试读第四回 · 时间错位','fourth-gate');trial('试读第五回 · 雪花与回声','fifth-gate');
  button('预览故事之后的来信',()=>{$('notebook').close();showLetter('second-normal',{preview:true});},body);text('h3','场景画册',body);const gallery=text('div','',body,'proof-gallery');
  for(const [id,label]of [...Object.entries(places),['student',['第二轮 · 水彩少年背影']]]){const figure=text('figure','',gallery);const img=document.createElement('img');img.src=id==='student'?'./art/student-watercolor.webp?v=4':'./art/'+id+'.svg?v=4';img.alt=label[0];img.loading='lazy';figure.append(img);text('figcaption',label[0],figure);}
  if(!$('notebook').open)$('notebook').showModal();body.scrollTop=0;
 }
 $('scene-expand').onclick=()=>{const body=$('notebook-body');body.replaceChildren();$('notebook-title').textContent=places[nodes[state.node].scene][0];const img=document.createElement('img');img.className='full-landscape';img.alt=$('landscape').alt;img.src=$('landscape').src;body.append(img);$('notebook').showModal();};
 function effect(e){state=apply(state,e);}
 function move(id,entry){if(busy||!nodes[id])return;busy=true;if(entry)state.log.push(entry);delete state.pendingChoice;state.node=id;save();render();busy=false;$('title').focus({preventScroll:true});}
 function scoresTable(rows,parent){const t=document.createElement('table');t.className='scores';const cap=text('caption','这一程的学习记录',t);for(const r of rows){const tr=document.createElement('tr');text('th',r.name,tr);text('td',r.score+' / '+r.max,tr);t.append(tr);}parent.append(t);}
 function journal(){$('notebook-title').textContent='拾年簿';const body=$('notebook-body');body.replaceChildren();text('p','只记下走过的路。心里的倾向不必被一排数字定义。',body);text('h3','留在手中的东西',body);for(const m of state.memories)text('p',m,body,'memory-line');if(!state.memories.length)text('p','书页还很新，慢慢去遇见。',body);if(state.group)text('p','选科：'+STREAMS[state.stream].name+' · '+state.group,body);if(state.second?.group)text('p','我的班级：'+state.second.group,body);if(state.round===2&&state.marks.length)text('h3','奶蛙走过的三年 · 学习留档',body);for(const m of state.marks){text('h3',m.phase===6?'离校之前':m.phase===2?'高一期末':'阶段测验',body);scoresTable(m.scores,body);}text('h3','最近的脚步',body);for(const item of state.log.slice(-18))text('p',item,body);const restart=button('另启一份回忆',()=>{restart.hidden=true;const row=document.createElement('div');body.append(row);text('p','当前这份大庙千秋进度将重新开始，其他故事存档不受影响。',row);button('确认，从雾中重来',()=>{state=fresh();save();$('notebook').close();render();},row);button('保留这份回忆',()=>{row.remove();restart.hidden=false;},row);},body);$('notebook').showModal();body.scrollTop=0;}
 $('journal').onclick=()=>{$('notebook-title').textContent='拾年簿';journal();};
 async function portrait(n){const revision=++artRevision;const round=n.round??1,show=round===1||n.frog;
  const shot=placement(n);$('silhouette').hidden=!shot;$('person-ground').hidden=!shot;
  if(shot){const [left,bottom,height]=shot;for(const [key,value]of Object.entries({left,bottom,height,width:height/2.16}))$('silhouette').style.setProperty('--person-'+key,value+'%');for(const [key,value]of Object.entries({left:left+height/4.32,bottom:bottom+height*.027,width:height*.17}))$('person-ground').style.setProperty('--ground-'+key,value+'%');}
  if(!show){$('frog').hidden=true;return;}
  const id=n.frog||'normal',src='../assets/portraits/'+id+'.webp';if($('frog').getAttribute('src')===src&&!$('frog').hidden)return;
  if(!portraitCache.has(id)){const img=new Image();img.src=src;portraitCache.set(id,img.decode().catch(error=>{portraitCache.delete(id);throw error;}));}
  try{await portraitCache.get(id);if(revision!==artRevision)return;$('frog').src=src;$('frog').className=['happy','sad','eager'].includes(id)?'portrait head':'portrait';$('frog').hidden=false;}catch{if(revision===artRevision){$('frog').hidden=true;$('silhouette').hidden=true;}}
 }
 function finishExam(n){const rows=report(state,n.phase).filter((r,i)=>n.phase<3||[0,1,2,...STREAMS[state.stream].indices].includes(i));state.marks.push({phase:n.phase,scores:rows});state.done.push(state.node);if(n.phase===2)state.group=assignClass(state);save();render();}
 function exam(n){if(state.done.includes(state.node)){scoresTable(state.marks.find(m=>m.phase===n.phase).scores,$('interaction'));text('p','这是故事内的学习模拟，不能换算真实考试成绩或录取线。',$('interaction'),'note');return;}
  $('next').hidden=true;const progress=state.exam?.node===state.node?state.exam:{node:state.node,index:0,right:0,selected:null};state.exam=progress;const items=questionsFor(n.phase).filter((q,i)=>n.phase<3||[0,1,2,...STREAMS[state.stream].indices].includes(i)),q=items[progress.index];
  text('p',`第 ${progress.index+1} 科 / ${items.length} 科 · ${q[0]}`,$('interaction'),'eyebrow');text('h3',q[1],$('interaction'));const choices=document.createElement('div');choices.className='exam-choices';$('interaction').append(choices);
  q[2].forEach((label,i)=>{const b=button(label,()=>{progress.selected=i;if(i===q[3])progress.right++;save();render();},choices);b.disabled=progress.selected!==null;if(progress.selected===i)b.className=i===q[3]?'correct':'selected';});
  if(progress.selected!==null){text('p',(progress.selected===q[3]?'这一题理解对了。':'先把这一处理清。')+q[4],$('interaction'),'explanation');button(progress.index===items.length-1?'收起答卷，看看这一程':'带着理解继续',()=>{if(progress.index===items.length-1){state.answers[n.phase]=Math.round(progress.right*9/items.length);delete state.exam;finishExam(n);}else{progress.index++;progress.selected=null;save();render();}});}
 }
 function render(){const n=nodes[state.node];if(n.round===2)enterSecond(state);const nextId=n.route?n.route(state):n.next;$('gate').hidden=true;$('reader').hidden=false;$('journal').hidden=false;$('sound').hidden=false;
  if(!state.visited.includes(state.node))state.visited.push(state.node);if(n.memory&&!state.memories.includes(n.memory))state.memories.push(n.memory);state.round=n.round??1;score.select(state.round);effects(n);
  $('era').textContent=['雾中','第一回 · 奶蛙','第二回 · 我','第三回 · 林照微','第四回 · 再访','第五回 · 归来'][state.round]+' / '+termNames[n.term];$('title').textContent=n.title;$('folio').textContent=n.round===0?'山中有回声':n.round===2?'同一座山 · 另一种心境':termNames[n.term];$('prose').replaceChildren();for(const p of n.text)text('p',p,$('prose'));if(n.variant)text('p',n.variant(state),$('prose'),'aside');
  $('place').textContent=n.scene==='classroom'&&n.term>=5?'怀真楼 · 教室':places[n.scene][0];$('season').textContent=places[n.scene][1];const art='./art/'+n.scene+'.svg?v=4';if($('landscape').getAttribute('src')!==art)$('landscape').src=art;$('landscape').alt=places[n.scene].join('，');$('scene').style.setProperty('--scene-art',`url("${art}")`);$('scene').dataset.round=n.round??1;$('scene-verse').textContent=n.scene==='corridor'?'再长的石阶\n也有一天会走完':n.scene==='terrace'?'山河不语\n回声有期':n.scene==='field'?'在倒数之前\n记住这一片天':'风经过这里\n也经过你';void portrait(n);
  $('paper').classList.remove('arrive');void $('paper').offsetWidth;$('paper').classList.add('arrive');$('interaction').replaceChildren();$('feedback').textContent='';$('next').hidden=!nextId;$('next').textContent=n.type==='ending'?'听见另一份回声':'翻过这一页';$('next').onclick=()=>move(nextId);
  if(n.inspect){const wrap=document.createElement('div');wrap.className='inspect';$('interaction').append(wrap);for(const [label,detail]of n.inspect){const d=document.createElement('details');text('summary',label,d);text('p',detail,d);wrap.append(d);}}
  if(n.choices){$('next').hidden=true;for(const [index,o] of n.choices.entries()){const b=button(o.label,()=>{if(state.pendingChoice)return;effect(o.effect);if(n.type==='song'){state.song=o.reply;state.adopted=state.bond+state.voice>=9||o.reply==='dance';if(state.adopted)effect({bond:1,voice:1});}if(o.reply&&n.type!=='song'){state.pendingChoice={node:state.node,index};save();for(const b of $('interaction').querySelectorAll('button'))b.disabled=true;$('feedback').textContent=o.reply;$('next').hidden=false;$('next').onclick=()=>move(o.to,n.title+' · '+o.label);}else move(o.to,n.title+' · '+o.label);});if(o.locked||(o.when&&!o.when(state))){b.disabled=true;text('small',o.locked||o.unavailable,b);}}}
  if(state.pendingChoice){const o=n.choices[state.pendingChoice.index];for(const b of $('interaction').querySelectorAll('button'))b.disabled=true;$('feedback').textContent=o.reply;$('next').hidden=false;$('next').onclick=()=>move(o.to,n.title+' · '+o.label);}
  if(n.type==='study'){$('next').hidden=true;for(const o of studyOptions)button(o.label,()=>{if(!state.done.includes(state.node)){effect(o.effect);state.done.push(state.node);}move(n.next,n.title+' · '+o.label);},$('interaction'),o.detail);}
  if(n.type==='stream'){$('next').hidden=true;for(const [id,s]of Object.entries(STREAMS))button(s.name,()=>{state.stream=id;move(n.next,'选科 · '+s.name);});}
  if(n.type==='exam')exam(n);
  if(n.type==='second-placement'){state.second.group=nextId==='second-one'?'励志一班':'普通四班';text('div',state.second.group,$('interaction'),'class-result');text('p','名单由这一轮此前的学习安排确定。换班后的生活，将从这间教室继续。',$('interaction'),'note');}
  if(n.type==='placement'){text('div',state.group,$('interaction'),'class-result');text('p',state.group.startsWith('励志')?'期末表现达到这一方向的励志班分配标准，名单已确定。':'你被分入这一方向的班级。平行班的分配随本次旅程确定，刷新不会重新抽签。',$('interaction'),'note');}
  if(n.type==='song-result'){const songs={campus:'校园歌',ballad:'小众情歌',dance:'扭秧歌'};text('p',state.adopted?'大家采纳了你的'+songs[state.song]+'，排练从一句认真商量开始。':'你的建议没能说服多数同学，大家最终排起了扭秧歌。没有被采纳确实遗憾，但你没有因此退出这次共同的排练。',$('interaction'),'aside');}
  if(n.type==='ending'){const result=destination(state);const message=state.bond>=9?'灯下有故人':state.study>=30?'山外有长路':'岁月有余温';text('div',message,$('interaction'),'ending-name');text('p',result.tier,$('interaction'));text('p',state.bond>=9?'总有人记得你的歌声、你的笨拙，还有你说过会来的那一次。':'你把认真生活的证据，留在了那些没有被排名的日子里。',$('interaction'));text('small','升学去向为剧情模拟，不对应现实招生分数线。',$('interaction'));}
  $('paper').classList.toggle('closing-page',['second-ending','rest-ending'].includes(n.type));
  if(n.type==='second-ending'){
   const c=text('div','',$('interaction'),'closing-verses');text('span',n.ending==='fifth-dawn'?'山风不替谁重写过去，':'风把那年的名字，',c);text('span',n.ending==='fifth-dawn'?'它只是，又翻开了明天。':'留在一张不必重写的纸上。',c);
   button('合上故事，看看桌上的来信',()=>{score.stop();showLetter(n.ending,{onClose:()=>{$('save-status').textContent='故事已读完，信已收好；可以随时重新打开。';}});});
   button('收好回忆，回到山门',()=>$('leave').click());
  }
  if(n.type==='rest-ending'){text('p','这一夜，先回到有人等你的地方。',$('interaction'),'closing-verses');button('收好回忆，回到山门',()=>$('leave').click());button('翻看拾年簿',journal);}
  if(n.type==='volume-end'){text('p',n.note||'这一卷暂告一段落，后面的山中旧事仍在续写。',$('interaction'),'volume-note');button('收好这一卷，回到山门',()=>$('leave').click());button('翻看这次拾到的回忆',journal);}
  $('terms').replaceChildren();for(let i=1;i<=6;i++){const e=text('span',termNames[i],$('terms'));if(n.term===i)e.setAttribute('aria-current','step');}
  save();const next=nodes[nextId];if(next){const img=new Image();img.src='./art/'+next.scene+'.svg?v=4';}window.scrollTo({top:0,behavior:'instant'});
 }
 render();
}
function questionsFor(phase){return questions.map((q,i)=>{const changes={
 2:{1:['若 2x + 3 = 11，x 等于？',['3','4','7'],1,'先两边减去 3，再除以 2，得到 x = 4。'],2:['Choose: We have lived here ___ 2020.',['since','for','at'],0,'since 接时间起点；for 常接一段持续时间。'],3:['质量为 2 kg 的物体，加速度为 3 m/s²，合力为？',['5 N','6 N','1.5 N'],1,'根据 F = ma，合力为 2 × 3 = 6 N。'],4:['NaCl 是哪种物质的化学式？',['氯化钠','二氧化碳','水'],0,'Na 表示钠，Cl 表示氯，NaCl 是氯化钠。']},
 3:{1:['等差数列 2、5、8、11 的下一项是？',['12','13','14'],2,'相邻两项相差 3，所以接下来是 14。'],2:['Choose: If it rains tomorrow, we ___ indoors.',['will stay','stayed','staying'],0,'此处 if 从句用一般现在时，主句用将来时。'],3:['电阻 2 Ω，通过电流 3 A，两端电压为？',['5 V','6 V','1.5 V'],1,'欧姆定律 U = IR，因此电压为 6 V。'],5:['绿色植物光合作用主要发生在哪种细胞器？',['叶绿体','核糖体','细胞核'],0,'叶绿体是绿色植物进行光合作用的主要场所。']},
 6:{1:['一个袋中有 3 个白球、2 个黑球，随机取一球，取到黑球概率为？',['2/5','3/5','1/2'],0,'五个等可能结果中有两个黑球，因此概率为 2/5。'],2:['Choose the correct sentence.',['He enjoy reading.','He enjoys reading.','He enjoying reading.'],1,'第三人称单数的谓语用 enjoys，enjoy 后可接动名词。'],3:['从静止开始，以 2 m/s² 匀加速运动 3 s，末速度为？',['5 m/s','6 m/s','9 m/s'],1,'v = v₀ + at，初速度为 0，因此末速度为 6 m/s。'],4:['在通常条件下，pH 小于 7 的水溶液呈？',['酸性','中性','碱性'],0,'通常条件下，pH 小于 7 表示酸性。']}
 };const v=changes[phase]?.[i];return v?[q[0],...v]:q;});}
