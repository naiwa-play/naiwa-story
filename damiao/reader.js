import {showLetter} from './letter.js?v=1';
import {nodes,places,studyOptions,questions} from './story.js?v=1';
import {fresh,valid,apply,report,assignClass,destination,STREAMS} from './model.js?v=1';
const $=id=>document.getElementById(id),termNames=['雾中序幕','高一 · 上','高一 · 下','高二 · 上','高二 · 下','高三 · 上','高三 · 下'];
export function start({preview=false}={}){
 if(preview){const b=document.createElement('button');b.textContent='终幕后记预览';b.onclick=()=>showLetter('second-normal',{preview:true});document.querySelector('.tools').prepend(b);}
 const key=preview?'naiwa-damiao-preview-v1':'naiwa-damiao-v1';let state=fresh(),artRevision=0,busy=false;
 try{const saved=JSON.parse(localStorage.getItem(key));if(valid(saved,nodes))state=saved;}catch{}
 // Optional ambience is only created after the player's explicit gesture.
 const music=new Audio('../assets/calm.ogg');music.loop=true;music.volume=.13;let wanted=false;
 function soundLabel(){$('sound').textContent=wanted?(music.paused?'配乐 · 点按继续':'配乐 · 开'):'配乐 · 关';$('sound').setAttribute('aria-pressed',String(wanted));}
 async function resume(){if(!wanted||document.hidden)return;try{await music.play();if(!wanted||document.hidden)music.pause();}catch{}soundLabel();}
 $('sound').onclick=()=>{if(wanted&&!music.paused){wanted=false;music.pause();soundLabel();}else{wanted=true;void resume();}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();else void resume();soundLabel();});
 $('leave').onclick=()=>{$('reader').hidden=true;$('gate').hidden=false;wanted=false;music.pause();soundLabel();window.scrollTo({top:0,behavior:'instant'});};
 $('close').onclick=()=>$('notebook').close();let outside=false;
 const off=e=>{const r=$('notebook').getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
 $('notebook').onpointerdown=e=>{outside=e.target===$('notebook')&&off(e);};$('notebook').onclick=e=>{if(outside&&e.target===$('notebook')&&off(e))$('notebook').close();outside=false;};
 function save(){try{localStorage.setItem(key,JSON.stringify(state));$('save-status').textContent=preview?'本机测试存档 · 与正式游玩分开':'这一页已收好';}catch{$('save-status').textContent='暂时无法保存，请保持此页面打开。';}}
 function text(tag,content,parent,cls){const e=document.createElement(tag);e.textContent=content;if(cls)e.className=cls;parent.append(e);return e;}
 function button(label,fn,parent=$('interaction'),detail){const b=text('button',label,parent);if(detail)text('small',detail,b);b.onclick=fn;return b;}
 function effect(e){state=apply(state,e);}
 function move(id,entry){if(busy||!nodes[id])return;busy=true;if(entry)state.log.push(entry);delete state.pendingChoice;state.node=id;save();render();busy=false;$('title').focus({preventScroll:true});}
 function scoresTable(rows,parent){const t=document.createElement('table');t.className='scores';const cap=text('caption','这一程的学习记录',t);for(const r of rows){const tr=document.createElement('tr');text('th',r.name,tr);text('td',r.score+' / '+r.max,tr);t.append(tr);}parent.append(t);}
 function journal(){const body=$('notebook-body');body.replaceChildren();text('p','只记下走过的路。心里的倾向不必被一排数字定义。',body);text('h3','留在手中的东西',body);for(const m of state.memories)text('p',m,body,'memory-line');if(!state.memories.length)text('p','书页还很新，慢慢去遇见。',body);if(state.group)text('p','选科：'+STREAMS[state.stream].name+' · '+state.group,body);for(const m of state.marks){text('h3',m.phase===6?'离校之前':m.phase===2?'高一期末':'阶段测验',body);scoresTable(m.scores,body);}text('h3','最近的脚步',body);for(const item of state.log.slice(-18))text('p',item,body);const restart=button('另启一份回忆',()=>{restart.hidden=true;const row=document.createElement('div');body.append(row);text('p','当前这份大庙千秋进度将重新开始，其他故事存档不受影响。',row);button('确认，从雾中重来',()=>{state=fresh();save();$('notebook').close();render();},row);button('保留这份回忆',()=>{row.remove();restart.hidden=false;},row);},body);$('notebook').showModal();body.scrollTop=0;}
 $('journal').onclick=journal;
 async function portrait(n){const revision=++artRevision;const round=n.round??1,show=round===1||n.frog;
  $('silhouette').hidden=round!==2||!!n.frog;$('frog').hidden=true;if(!show)return;
  const id=n.frog||'normal',src='../assets/portraits/'+id+'.webp';const img=new Image();img.src=src;
  try{await img.decode();if(revision!==artRevision)return;$('frog').src=src;$('frog').className=['happy','sad','eager'].includes(id)?'portrait head':'portrait';$('frog').hidden=false;}catch{if(revision===artRevision)$('silhouette').hidden=round!==2;}
 }
 function finishExam(n){const rows=report(state,n.phase).filter((r,i)=>n.phase<3||[0,1,2,...STREAMS[state.stream].indices].includes(i));state.marks.push({phase:n.phase,scores:rows});state.done.push(state.node);if(n.phase===2)state.group=assignClass(state);save();render();}
 function exam(n){if(state.done.includes(state.node)){scoresTable(state.marks.find(m=>m.phase===n.phase).scores,$('interaction'));text('p','这是故事内的学习模拟，不能换算真实考试成绩或录取线。',$('interaction'),'note');return;}
  $('next').hidden=true;const progress=state.exam?.node===state.node?state.exam:{node:state.node,index:0,right:0,selected:null};state.exam=progress;const items=questionsFor(n.phase).filter((q,i)=>n.phase<3||[0,1,2,...STREAMS[state.stream].indices].includes(i)),q=items[progress.index];
  text('p',`第 ${progress.index+1} 科 / ${items.length} 科 · ${q[0]}`,$('interaction'),'eyebrow');text('h3',q[1],$('interaction'));const choices=document.createElement('div');choices.className='exam-choices';$('interaction').append(choices);
  q[2].forEach((label,i)=>{const b=button(label,()=>{progress.selected=i;if(i===q[3])progress.right++;save();render();},choices);b.disabled=progress.selected!==null;if(progress.selected===i)b.className=i===q[3]?'correct':'selected';});
  if(progress.selected!==null){text('p',(progress.selected===q[3]?'这一题理解对了。':'先把这一处理清。')+q[4],$('interaction'),'explanation');button(progress.index===items.length-1?'收起答卷，看看这一程':'带着理解继续',()=>{if(progress.index===items.length-1){state.answers[n.phase]=Math.round(progress.right*9/items.length);delete state.exam;finishExam(n);}else{progress.index++;progress.selected=null;save();render();}});}
 }
 function render(){const n=nodes[state.node];$('gate').hidden=true;$('reader').hidden=false;$('journal').hidden=false;$('sound').hidden=false;
  if(!state.visited.includes(state.node))state.visited.push(state.node);if(n.memory&&!state.memories.includes(n.memory))state.memories.push(n.memory);if(n.round===2)state.round=2;
  $('era').textContent=(n.round===0?'雾中':(n.round===2?'第二回 · 我':'第一回 · 奶蛙'))+' / '+termNames[n.term];$('title').textContent=n.title;$('folio').textContent=n.round===0?'山中有回声':n.round===2?'同一座山 · 另一种心境':termNames[n.term];$('prose').replaceChildren();for(const p of n.text)text('p',p,$('prose'));if(n.variant)text('p',n.variant(state),$('prose'),'aside');
  $('place').textContent=places[n.scene][0];$('season').textContent=places[n.scene][1];$('landscape').src='./art/'+n.scene+'.svg';$('landscape').alt=places[n.scene].join('，');$('scene').dataset.round=n.round??1;$('scene-verse').textContent=n.scene==='corridor'?'再长的石阶\n也有一天会走完':n.scene==='terrace'?'山河不语\n回声有期':n.scene==='field'?'在倒数之前\n记住这一片天':'风经过这里\n也经过你';void portrait(n);
  $('paper').classList.remove('arrive');void $('paper').offsetWidth;$('paper').classList.add('arrive');$('interaction').replaceChildren();$('feedback').textContent='';$('next').hidden=!n.next;$('next').textContent=n.type==='ending'?'听见另一份回声':'翻过这一页';$('next').onclick=()=>move(n.next);
  if(n.inspect){const wrap=document.createElement('div');wrap.className='inspect';$('interaction').append(wrap);for(const [label,detail]of n.inspect){const d=document.createElement('details');text('summary',label,d);text('p',detail,d);wrap.append(d);}}
  if(n.choices){$('next').hidden=true;for(const [index,o] of n.choices.entries()){const b=button(o.label,()=>{if(state.pendingChoice)return;effect(o.effect);if(n.type==='song'){state.song=o.reply;state.adopted=state.bond+state.voice>=9||o.reply==='dance';if(state.adopted)effect({bond:1,voice:1});}if(o.reply&&n.type!=='song'){state.pendingChoice={node:state.node,index};save();for(const b of $('interaction').querySelectorAll('button'))b.disabled=true;$('feedback').textContent=o.reply;$('next').hidden=false;$('next').onclick=()=>move(o.to,n.title+' · '+o.label);}else move(o.to,n.title+' · '+o.label);});if(o.locked){b.disabled=true;text('small',o.locked,b);}}}
  if(state.pendingChoice){const o=n.choices[state.pendingChoice.index];for(const b of $('interaction').querySelectorAll('button'))b.disabled=true;$('feedback').textContent=o.reply;$('next').hidden=false;$('next').onclick=()=>move(o.to,n.title+' · '+o.label);}
  if(n.type==='study'){$('next').hidden=true;for(const o of studyOptions)button(o.label,()=>{if(!state.done.includes(state.node)){effect(o.effect);state.done.push(state.node);}move(n.next,n.title+' · '+o.label);},$('interaction'),o.detail);}
  if(n.type==='stream'){$('next').hidden=true;for(const [id,s]of Object.entries(STREAMS))button(s.name,()=>{state.stream=id;move(n.next,'选科 · '+s.name);});}
  if(n.type==='exam')exam(n);
  if(n.type==='placement'){text('div',state.group,$('interaction'),'class-result');text('p',state.group.startsWith('励志')?'期末表现达到这一方向的励志班分配标准，名单已确定。':'你被分入这一方向的班级。平行班的分配随本次旅程确定，刷新不会重新抽签。',$('interaction'),'note');}
  if(n.type==='song-result'){const songs={campus:'校园歌',ballad:'小众情歌',dance:'扭秧歌'};text('p',state.adopted?'大家采纳了你的'+songs[state.song]+'，排练从一句认真商量开始。':'你的建议没能说服多数同学，大家最终排起了扭秧歌。没有被采纳确实遗憾，但你没有因此退出这次共同的排练。',$('interaction'),'aside');}
  if(n.type==='ending'){const result=destination(state);const message=state.bond>=9?'灯下有故人':state.study>=30?'山外有长路':'岁月有余温';text('div',message,$('interaction'),'ending-name');text('p',result.tier,$('interaction'));text('p',state.bond>=9?'总有人记得你的歌声、你的笨拙，还有你说过会来的那一次。':'你把认真生活的证据，留在了那些没有被排名的日子里。',$('interaction'));text('small','升学去向为剧情模拟，不对应现实招生分数线。',$('interaction'));}
  if(n.type==='volume-end'){text('p','第一卷到这里。第二轮后续、学姐视角、自由轮回与终章仍在续写中。',$('interaction'),'volume-note');button('收好这一卷，回到山门',()=>$('leave').click());button('翻看这次拾到的回忆',journal);}
  $('terms').replaceChildren();for(let i=1;i<=6;i++){const e=text('span',termNames[i],$('terms'));if(n.term===i)e.setAttribute('aria-current','step');}
  save();const next=nodes[n.next];if(next){const img=new Image();img.src='./art/'+next.scene+'.svg';}window.scrollTo({top:0,behavior:'instant'});
 }
 render();
}
function questionsFor(phase){return questions.map((q,i)=>{const changes={
 2:{1:['若 2x + 3 = 11，x 等于？',['3','4','7'],1,'先两边减去 3，再除以 2，得到 x = 4。'],2:['Choose: We have lived here ___ 2020.',['since','for','at'],0,'since 接时间起点；for 常接一段持续时间。'],3:['质量为 2 kg 的物体，加速度为 3 m/s²，合力为？',['5 N','6 N','1.5 N'],1,'根据 F = ma，合力为 2 × 3 = 6 N。'],4:['NaCl 是哪种物质的化学式？',['氯化钠','二氧化碳','水'],0,'Na 表示钠，Cl 表示氯，NaCl 是氯化钠。']},
 3:{1:['等差数列 2、5、8、11 的下一项是？',['12','13','14'],2,'相邻两项相差 3，所以接下来是 14。'],2:['Choose: If it rains tomorrow, we ___ indoors.',['will stay','stayed','staying'],0,'此处 if 从句用一般现在时，主句用将来时。'],3:['电阻 2 Ω，通过电流 3 A，两端电压为？',['5 V','6 V','1.5 V'],1,'欧姆定律 U = IR，因此电压为 6 V。'],5:['绿色植物光合作用主要发生在哪种细胞器？',['叶绿体','核糖体','细胞核'],0,'叶绿体是绿色植物进行光合作用的主要场所。']},
 6:{1:['一个袋中有 3 个白球、2 个黑球，随机取一球，取到黑球概率为？',['2/5','3/5','1/2'],0,'五个等可能结果中有两个黑球，因此概率为 2/5。'],2:['Choose the correct sentence.',['He enjoy reading.','He enjoys reading.','He enjoying reading.'],1,'第三人称单数的谓语用 enjoys，enjoy 后可接动名词。'],3:['从静止开始，以 2 m/s² 匀加速运动 3 s，末速度为？',['5 m/s','6 m/s','9 m/s'],1,'v = v₀ + at，初速度为 0，因此末速度为 6 m/s。'],4:['在通常条件下，pH 小于 7 的水溶液呈？',['酸性','中性','碱性'],0,'通常条件下，pH 小于 7 表示酸性。']}
 };const v=changes[phase]?.[i];return v?[q[0],...v]:q;});}
