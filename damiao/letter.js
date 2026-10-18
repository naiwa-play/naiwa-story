// The author will supply the text later. Do not invent a letter in their name.
export const graduationLetter='';
export const letterEndings=['second-normal','fifth-dawn'];
export function showLetter(ending,{preview=false,onClose=()=>{}}={}){
 if(!letterEndings.includes(ending))return false;
 const section=document.createElement('section');section.className='letter-afterword';section.setAttribute('role','dialog');section.setAttribute('aria-modal','true');section.setAttribute('aria-label','故事之后的一封信');
 const backgrounds=[...document.body.children].map(el=>[el,el.inert]);for(const [el] of backgrounds)el.inert=true;
 const savedFocus=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';
 section.innerHTML='<div class="letter-room" aria-hidden="true"></div><div class="letter-ray" aria-hidden="true"></div><div class="letter-dust" aria-hidden="true"></div><div class="afterword-caption"><small>故事之后</small><h2>风把一封信，留在课桌上。</h2></div><button class="envelope" aria-label="打开写给2025级同学的信"><span class="envelope-flap"></span><span class="envelope-label">致 · 2025 级的你们</span><span class="envelope-stamp">秋</span></button><div class="letter-sheet" hidden><div class="letter-topline">给 2025 级的同学</div><div class="letter-content"></div><div class="letter-sign">山风翻过的这一页</div></div><button class="letter-return">收好信，返回</button>';
 const sheet=section.querySelector('.letter-sheet'),button=section.querySelector('.envelope'),content=section.querySelector('.letter-content'),back=section.querySelector('.letter-return');
 content.textContent=graduationLetter;
 if(preview){const note=document.createElement('p');note.className='letter-preview-note';note.textContent='后记效果预览 · 信件正文留白，等待作者提供';section.append(note);}
 button.onclick=()=>{section.classList.add('opened');button.hidden=true;sheet.hidden=false;sheet.tabIndex=0;sheet.focus({preventScroll:true});};
 function close(){section.remove();for(const [el,inert] of backgrounds)el.inert=inert;document.body.style.overflow=overflow;savedFocus?.focus();onClose();}
 back.onclick=close;section.onkeydown=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const targets=[button.hidden?sheet:button,back];e.preventDefault();targets[(targets.indexOf(document.activeElement)+1)%2].focus();}};
 document.body.append(section);button.focus({preventScroll:true});return true;
}
