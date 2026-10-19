// Author-supplied text, preserved verbatim apart from paragraph spacing.
export const graduationLetter=`各位好呀，非常感谢能够游玩到这里，作者感激不尽。今天是26年10月20日写下的这封信，也是我们距离25年高考的第500天，如今的你们，又身在何方呢？

回望我的高中三年，有些许确幸穿插，但更多的还是遗憾为主色彩。我总觉得，当初的我能够改变更多事情，但很遗憾，结局就是结局，当大家被时代的潮流推的不得不向前的时候，沉浮兴衰，对与错，似乎都不那么重要了。

可是，每当我躺在床上，我常常会梦见我又一次回到了高中，我又一次做出了选择。哈哈，也许这段时光真的对我太过重要，又太过沉重……所以我决定，重新开始回忆属于我的高中三年会是什么样的，不同的抉择又会带来什么样的结果。

我立马开始了，一刻不停，这次的故事呢并非我真实体验的高中生活，一切情节只是虚构，不过之后呢我会做一个更大型的质量更好的游戏，就叫它 大庙千秋吧。

我还是希望，就算在梦里，我也能够遇见属于我的最完美的高中，不过完美并不代表我喜欢的，相反，当下的这份体验让我知道，我最喜欢的，还是我经历过的，切身体验过的，听过尖叫，洒下汗水，流下青涩的泪的高中。

如今的我很好，过的不错（也许是我已经麻痹了吧），我珍惜如今的生活，但我知道，高中的这段旅途承载着我无数美好的梦想，所以我想继续完成它，回忆我们的一切。

所有的回忆凝聚而成的星河，将永远留在天文台上的星空，金银台见证心雨泪，登高石见证荣光，我想大庙山上，一定有一座水晶丰碑，能够铭刻下我们一路走来的所有奇迹吧。`;
export const letterEndings=['second-normal','fifth-dawn'];
export function showLetter(ending,{preview=false,onClose=()=>{}}={}){
 if(!letterEndings.includes(ending))return false;
 const section=document.createElement('section');section.className='letter-afterword';section.setAttribute('role','dialog');section.setAttribute('aria-modal','true');section.setAttribute('aria-label','故事之后的一封信');
 const backgrounds=[...document.body.children].map(el=>[el,el.inert]);for(const [el] of backgrounds)el.inert=true;
 const savedFocus=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';
 section.innerHTML='<div class="letter-room" aria-hidden="true"></div><div class="letter-ray" aria-hidden="true"></div><div class="letter-dust" aria-hidden="true"></div><div class="afterword-caption"><small>故事之后</small><h2>风把一封信，留在课桌上。</h2></div><button class="envelope" aria-label="打开写给2025级同学的信"><span class="envelope-flap"></span><span class="envelope-label">致 · 2025 级的你们</span><span class="envelope-stamp">秋</span></button><div class="letter-sheet" hidden><div class="letter-topline">给 2025 级的同学</div><div class="letter-content"></div><div class="letter-sign">山风翻过的这一页</div></div><button class="letter-return">收好信，返回</button>';
 const sheet=section.querySelector('.letter-sheet'),button=section.querySelector('.envelope'),content=section.querySelector('.letter-content'),back=section.querySelector('.letter-return');
 content.textContent=graduationLetter;
 if(preview){const note=document.createElement('p');note.className='letter-preview-note';note.textContent='作者来信 · 本机排版校样';section.append(note);}
 button.onclick=()=>{section.classList.add('opened');button.hidden=true;sheet.hidden=false;sheet.tabIndex=0;section.scrollTop=0;sheet.focus({preventScroll:true});};
 function close(){section.remove();for(const [el,inert] of backgrounds)el.inert=inert;document.body.style.overflow=overflow;savedFocus?.focus();onClose();}
 back.onclick=close;section.onkeydown=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const targets=[button.hidden?sheet:button,back];e.preventDefault();targets[(targets.indexOf(document.activeElement)+1)%2].focus();}};
 document.body.append(section);button.focus({preventScroll:true});return true;
}
