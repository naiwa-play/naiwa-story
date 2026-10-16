import {night} from './urban-night.js?v=14';
import {roof} from './urban-roof.js?v=14';
import {scenePortraits} from './portraits.js?v=14';
export function addUrban(story,endings,chapters,scenes,secrets){
 Object.assign(scenes,{'city-stop':'夜间站台 · 错过之后','city-store':'街角便利店 · 热饭与灯','city-laundry':'自助洗衣店 · 最后一桶衣物','city-arcade':'骑楼下 · 放慢脚步','city-river':'河边站台 · 回家的地图','city-bus':'夜间公交 · 有人同行','city-lobby':'公寓门厅 · 一张邀请','city-workshop':'社区活动室 · 准备的午后','city-roof':'公共屋顶 · 预留空位','city-roof-night':'屋顶银幕 · 灯光亮起'});
 const names={旁:'旁白',蛙:'奶蛙',你:'你',周:'小周',程:'阿程',林:'林姨',陈:'陈师傅',岚:'阿岚',许:'老许'};
 function seq(id,chapter,scene,text,last){const lines=text.trim().split('\n');lines.forEach((line,i)=>{const cut=line.indexOf('|'),[who,mood]=line.slice(0,cut).split('.');story[id+'_'+i]={chapter,scene,speaker:names[who]||who,text:line.slice(cut+1),...(i===lines.length-1?last:{next:id+'_'+(i+1)})};scenePortraits[id+'_'+i]=mood||'normal';});return id+'_0';}
 for(const book of [night,roof]){const id=book.id;chapters[id]={title:book.title,tag:book.tag,description:book.description,scene:book.sections[0].scene,entry:id+'_s0_0'};
 book.sections.forEach((s,k)=>{const prefix=id+'_s'+k;const choices=k===5?book.endings.map(e=>({text:e.label,to:id+'_'+e.id+'_0'})):s.options.map((o,j)=>({text:o.label,to:prefix+'_b'+j+'_0'}));seq(prefix,id,s.scene,s.text,{choices});for(const [j,o]of s.options.entries())seq(prefix+'_b'+j,id,s.scene,o.text,{next:id+'_s'+(k+1)+'_0'});});
 for(const e of book.endings){endings[e.id]={title:e.title,note:e.note,chapter:id,theme:e.theme};seq(id+'_'+e.id,id,book.sections[5].scene,e.text,{ending:e.id});}
 }
 secrets.citynight_s2_11={title:'灯也需要休息',text:'便签上的开放时间、林姨最后一轮洗衣、陈师傅的卡片都在提醒同一件事：可持续的善意允许人下班。夜归地图与晚归约定，是这条伏笔的两种回答。'};
 secrets.cityroof_s0_4={title:'银幕上的一小片云',text:'补丁最初让奶蛙担心，后来却不再抢走它的注意。它不会神奇消失，但可以在不影响观看时被接纳，也可以在有余力时慢慢修好。'};
}
