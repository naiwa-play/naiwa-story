export const MAX_STAT=999_999_999;
export const STAT_BOUNDS={count:[1,MAX_STAT],rate:[.6,8],damage:[.5,MAX_STAT],range:[12,52],speed:[.7,1.6]};
export const rewardGrowth=stage=>Math.min(MAX_STAT,1.14**Math.max(0,stage||0));
export const formatStat=value=>Math.abs(value)>=1e8?Number((value/1e8).toFixed(2))+'亿':Math.abs(value)>=1e4?Number((value/1e4).toFixed(2))+'万':String(Number(value.toFixed(2)));
const scaledReward=(stat,value,stage)=>stat==='count'?Math.min(MAX_STAT,Math.max(1,Math.round(value*rewardGrowth(stage)))):stat==='damage'?Math.min(MAX_STAT,Math.round(value*rewardGrowth(stage)*100)/100):value;
export const THEMES={
 coast:{name:'柠檬海岸',sky:0xc9e9e7,ground:0x63c5bc,road:0xffedc7,edge:0xf4c46c,enemy:0x7975aa},
 forest:{name:'蜜光密林',sky:0xb9d4c0,ground:0x568a70,road:0xcdd3ac,edge:0x8fba7d,enemy:0x9a739e},
 halloween:{name:'南瓜幽境',sky:0x21182f,ground:0x30223f,road:0x51425f,edge:0xd59153,enemy:0xae7fb8},
 cyber:{name:'霓虹荒原',sky:0x272136,ground:0x51313e,road:0x263945,edge:0x65e1d8,enemy:0x628c9d},
 abyss:{name:'深海失落研究所',sky:0x123d55,ground:0x17465d,road:0x557d8c,edge:0x90e5db,enemy:0x85c8d6},
 dream:{name:'云端甜梦游乐园',sky:0xf0c8ca,ground:0xb9bddb,road:0xf5e5cf,edge:0xd497b4,enemy:0xb096cb},
 lantern:{name:'百鬼夜市',sky:0x242945,ground:0x303b57,road:0x6c6274,edge:0xe2ad7d,enemy:0xc7a0a5},
};
export const BOSSES={
 coast:[{id:'crab',name:'潮汐寄居蟹王',attack:'tide',color:'#79cbd1',cooldown:2.8},{id:'jellyfish',name:'风暴水母',attack:'storm',color:'#a8c7f2',cooldown:2.8}],
 forest:[{id:'treant',name:'荆棘古树',attack:'roots',color:'#95bd6e',cooldown:2.8},{id:'mushroom',name:'孢子巨菇',attack:'spores',color:'#c695ad',cooldown:3}],
 halloween:[{id:'witch',name:'南瓜巫师',attack:'haunt',color:'#c493ef',cooldown:2.5},{id:'skeleton',name:'骷髅王',attack:'bones',color:'#f1d9be',cooldown:2.6}],
 cyber:[{id:'sheriff',name:'霓虹警长',attack:'crossfire',color:'#72e8e4',cooldown:2.8},{id:'foundry',name:'铸蛙核心',attack:'assembly',color:'#ffad73',cooldown:3}],
 abyss:[{id:'octopus',name:'深渊机械章鱼',attack:'tentacles',color:'#75e7df',cooldown:3},{id:'submarine',name:'沉眠潜航者',attack:'torpedoes',color:'#f5c88a',cooldown:2.8}],
 dream:[{id:'ferris',name:'微笑摩天轮',attack:'fireworks',color:'#f4b2cc',cooldown:3},{id:'carousel',name:'发条旋转木马',attack:'parade',color:'#bba5e5',cooldown:2.8}],
 lantern:[{id:'paperking',name:'千面纸偶',attack:'papercut',color:'#efb483',cooldown:2.8},{id:'operamask',name:'夜雨戏中人',attack:'curtain',color:'#c2b8ed',cooldown:3}],
};
export const bossFor=(theme,stage=0)=>BOSSES[theme][stage%2];
export const eliteFor=theme=>({id:({cyber:'cyber-elite',abyss:'abyss-elite',dream:'dream-elite',lantern:'lantern-elite'}[theme]||'elite'),name:{coast:'潮岸墨团统领',forest:'苔原墨团统领',halloween:'幽境暗影统领',cyber:'边境巡逻队长',abyss:'失落研究员',dream:'乐园巡游队长',lantern:'巡夜提灯人'}[theme],attack:'ink',color:theme==='cyber'?'#70dce0':theme==='halloween'?'#c48bcc':'#91a8ba',cooldown:2.6});
export const MINIONS={
 blob:{name:'小墨团',health:1,speed:1.1,radius:.75},runner:{name:'疾行者',health:.75,speed:1.8,radius:.6},
 tank:{name:'甲壳卫士',health:1.65,speed:.7,radius:.9},shell:{name:'小寄居蟹',health:1.25,speed:.95,radius:.8},
 sprout:{name:'树芽精',health:1.1,speed:1.1,radius:.75},flyer:{name:'泡泡灵',health:.85,speed:1.35,radius:.65},
 pumpkinling:{name:'南瓜仔',health:1.1,speed:1.1,radius:.75},skeletonling:{name:'骷髅兵',health:1.3,speed:1.15,radius:.7},bat:{name:'蝙蝠影',health:.7,speed:1.7,radius:.6},
 drone:{name:'巡检无人机',health:.85,speed:1.35,radius:.65},crawler:{name:'机械爬行兵',health:1,speed:1.4,radius:.7},sentinel:{name:'装甲守卫',health:1.65,speed:.7,radius:.9},coil:{name:'线圈精灵',health:.75,speed:1.7,radius:.6},
 bubble:{name:'泡泡寄居蟹',health:1.3,speed:.9,radius:.8},manta:{name:'荧光鳐',health:.8,speed:1.6,radius:.7},diver:{name:'失控潜水机',health:1.6,speed:.8,radius:.85},anemone:{name:'幽光海葵',health:1,speed:1.2,radius:.65},
 balloon:{name:'逃跑的气球',health:.75,speed:1.6,radius:.65},duck:{name:'发条小鸭',health:1.2,speed:1.15,radius:.75},candy:{name:'焦糖守卫',health:1.65,speed:.75,radius:.85},star:{name:'迷路星星',health:.8,speed:1.5,radius:.65},
 paper:{name:'折纸小偶',health:1,speed:1.3,radius:.65},lanternling:{name:'提灯小鬼',health:1.3,speed:1,radius:.8},umbrella:{name:'独脚纸伞',health:.9,speed:1.5,radius:.7},fox:{name:'纸面狐',health:1.1,speed:1.4,radius:.7},
};
export const MONSTER_POOLS={coast:['blob','runner','shell','flyer'],forest:['blob','sprout','tank','runner'],halloween:['pumpkinling','skeletonling','bat','tank'],cyber:['crawler','drone','sentinel','coil'],abyss:['bubble','manta','diver','anemone'],dream:['balloon','duck','candy','star'],lantern:['paper','lanternling','umbrella','fox']};
export const MODES={
 anger:{name:'愤怒',duration:10,color:'#d96a52',description:'攻速提高 80%，持续 10 秒'},
 melancholy:{name:'忧郁',duration:12,color:'#719bc7',description:'前进与敌人推进减速 45%，持续 12 秒'},
 demon:{name:'恶魔',duration:12,color:'#a374c7',description:'击杀金币与成长奖励翻倍，持续 12 秒'},
 angel:{name:'天使',duration:10,color:'#d4b976',description:'停火感化小怪，获得 1.5 倍成长；Boss 仍需闪避'},
 god:{name:'神格',duration:6,color:'#e4ba52',description:'免疫伤害，持续 6 秒'},
};
export const modeActive=(s,id)=>s.activeMode===id&&s.modeLeft>0;
export const effectiveRate=s=>s.rate*(modeActive(s,'anger')?1.8:1);
export function chargeMode(s,amount,random=Math.random,combat=false){if(s.modeLeft>0)return false;if(combat){amount=Math.min(amount,s.modeTokens);s.modeTokens-=amount;}s.joy=Math.min(100,s.joy+amount);if(s.joy>=100&&!s.readyMode&&s.elapsed>=s.modeNextAt){const ids=Object.keys(MODES);s.readyMode=ids[Math.min(ids.length-1,Math.floor(random()*ids.length))];return true;}return false;}
export function activateMode(s){if(s.joy<100||!s.readyMode||s.modeLeft>0)return false;s.activeMode=s.readyMode;s.modeLeft=MODES[s.activeMode].duration;s.readyMode=null;s.joy=0;s.angelClock=0;s.modeNextAt=s.elapsed+45;return true;}
export function tickMode(s,dt,random=Math.random){s.modeTokens=Math.min(3,s.modeTokens+dt*2);if(s.modeLeft>0){s.modeLeft=Math.max(0,s.modeLeft-dt);if(s.modeLeft===0)s.activeMode=null;}else chargeMode(s,dt*.8,random);}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const STAGE_LENGTH=260;
export const WEAPONS={egg:'奶蛋射击',bomb:'投掷奶蛋',laser:'奶光激光',pumpkin:'南瓜法杖',replicator:'机器复制枪'};
export const PATTERNS={standard:'标准射击',spread:'扇形散射',heavy:'重型弹药',rapid:'急速连发'};
export function attackProfile(s){const pattern=s.pattern||'standard',bonus=s.projectileBonus||0,n=pattern==='spread'?5+bonus*2:1+bonus;
 return {count:n,angles:Array.from({length:n},(_,i)=>pattern==='spread'?(i-(n-1)/2)*.48/Math.max(1,n-1):0),damage:Math.min(MAX_STAT,s.damage*(pattern==='spread'?.7:pattern==='heavy'?1.8:pattern==='rapid'?.65:1)*(s.weapon==='bomb'?1.35:s.weapon==='pumpkin'?1.15:1)),rate:effectiveRate(s)*(pattern==='heavy'?.7:pattern==='rapid'?1.65:1),size:pattern==='heavy'?1.6:1};}
export function freshRun(theme='coast',level=1,upgrades={},startingPet=null){return {theme,level,phase:'run',distance:0,x:0,count:1+(upgrades.company||0),rate:1.5,damage:1.1+(upgrades.power||0)*.15,range:22+(upgrades.range||0)*2,speed:1,health:4+(upgrades.heart||0),maxHealth:4+(upgrades.heart||0),weapon:'egg',pattern:'standard',projectileBonus:0,splitDepth:5,splitCount:2,pets:{naigou:startingPet==='naigou'?1:0,naishu:startingPet==='naishu'?1:0},petDamage:{naigou:1.05,naishu:1.05},coins:0,kills:0,gates:0,cards:0,joy:0,activeMode:null,modeLeft:0,readyMode:null,modeNextAt:0,modeTokens:3,angelClock:0,blessings:0,elapsed:0,endless:false,endlessTime:0,stage:0,bosses:0,invincible:0,coinBonus:1+(upgrades.purse||0)*.1};}
export function runMultiplier(s){return Math.min(3,(1+s.elapsed/80)*s.speed)*(modeActive(s,'melancholy')?.55:1);}
export function applyGate(s,g,random=Math.random){const old=s[g.stat];s[g.stat]=g.op==='multiply'?old*g.value:old+g.value;const [a,b]=STAT_BOUNDS[g.stat];s[g.stat]=clamp(s[g.stat],a,b);if(g.stat==='count')s.count=Math.floor(s.count);s.gates++;chargeMode(s,7,random);return s[g.stat]-old;}
export function damageSquad(s,amount){if(s.invincible>0||s.phase==='lost'||modeActive(s,'god'))return false;s.health=Math.max(0,s.health-amount);s.invincible=.9;if(s.health===0)s.phase='lost';return true;}
export function killReward(s,boss=false,multiplier=1){
 const growth=rewardGrowth(s.stage),damage=(boss?.2:.02)*multiplier*growth,companions=Math.max(1,Math.round(multiplier*growth));s.damage=Math.min(MAX_STAT,Math.round((s.damage+damage)*10000)/10000);
 for(const pet of ['naigou','naishu'])if(s.pets[pet])s.petDamage[pet]=Math.min(MAX_STAT,s.petDamage[pet]+(boss?.08:.008)*multiplier*growth);
 if(boss){s.count=Math.min(MAX_STAT,s.count+companions);s.rate=Math.min(8,s.rate+.1*multiplier);}
 return boss?'伙伴 +'+formatStat(companions)+' · 攻击 +'+formatStat(damage)+' · 攻速 +'+(.1*multiplier).toFixed(1):'攻击 +'+formatStat(damage);
}
export const crossed=(previous,current,at)=>previous<at&&current>=at;
export function formation(count){const points=[];for(let i=0;i<Math.min(64,count);i++){const row=Math.floor(Math.sqrt(i));points.push({x:(i-row*row-row)*.43,z:row*.4});}return points;}
const gate=(stat,op,value)=>({stat,op,value});
export function makeCourse(stage=0,random=Math.random,theme='coast'){
 const offset=stage*STAGE_LENGTH,major=stage===0||(stage+1)%3===0,pool=MONSTER_POOLS[theme],health=12*1.43**stage;
 const swarm=(count,weight)=>Array.from({length:count},(_,i)=>{const kind=pool[(i+stage)%pool.length],role=MINIONS[kind],row=Math.floor(i/4),col=i%4;
 return {x:clamp((col-1.5)*2.05+(random()-.5)*1.1,-3.95,3.95),z:-row*3.2-random()*1.3,kind,hp:Math.min(MAX_STAT,Math.round(health*weight*role.health*(.93+random()*.14))),reward:1};});
 const rows=stage===0?[
 {at:16,type:'gate',options:[gate('count','add',1),gate('damage','add',.4)]},{at:38,type:'card'},
 {at:72,type:'fight',enemies:[{x:0,kind:pool[0],hp:4,reward:1}]},{at:98,type:'gate',options:[gate('rate','add',.25),gate('range','add',4)]},
 {at:124,type:'coins',positions:[-2,-1,0,1,2]},{at:142,type:'card'},
 {at:176,type:'fight',enemies:[{x:-2.5,kind:pool[1],hp:12,reward:1},{x:2.5,kind:pool[2],hp:16,reward:1}]},{at:204,type:'card'},
 {at:212,type:'potion',positions:[0]},{at:246,type:'boss',enemies:[{x:0,hp:40,reward:5}]},
 ]:[
 {at:22,type:'gate',options:[gate('count','add',1),gate('damage','add',.3)]},
 {at:48,type:'fight',enemies:swarm(Math.min(72,3+stage*3),1)},
 {at:76,type:'card'},{at:108,type:'coins',positions:[-2.5,-1.5,-.5,.5,1.5,2.5]},
 {at:130,type:'fight',enemies:swarm(Math.min(84,4+stage*4),1.35)},
 {at:158,type:'gate',options:[gate('rate','add',.2),gate('count','add',2)]},{at:184,type:'card'},
 ...(stage%2===0?[{at:208,type:'potion',positions:[0]}]:[]),{at:218,type:'fight',enemies:swarm(Math.min(96,6+stage*4),1.15)},
 {at:250,type:'boss',enemies:[{x:0,hp:Math.min(MAX_STAT,Math.round(95*1.48**stage*(major?1.25:1))),reward:5}]},
 ];
 return rows.map((r,id)=>({...r,...(r.options?{options:r.options.map(g=>({...g,value:scaledReward(g.stat,g.value,stage)}))}:{}),at:r.at+offset,id:stage*100+id,stage,major:r.type==='boss'&&major,tail:Math.max(0,...(r.enemies||[]).map(e=>-(e.z||0))),used:false}));
}
export const reward=s=>Math.floor(s.coins);
export function gateText(g){return {value:(g.op==='multiply'?'×':g.value<0?'−':'+')+formatStat(Math.abs(g.value)),label:{count:'伙伴数量',rate:'攻击速度',damage:'攻击力',range:'攻击距离',speed:'移动速度'}[g.stat]};}
const statCard=(id,title,description,stat,value,icon)=>({id,title,description,icon,weight:8,tag:'基础成长',eligible:s=>s[stat]<STAT_BOUNDS[stat][1],describe:s=>stat==='count'?'增加 '+formatStat(scaledReward(stat,value,s.stage))+' 只奶蛙伙伴，定时发出红色追踪奶蛋。':stat==='damage'?'每只奶蛙的攻击力增加 '+formatStat(scaledReward(stat,value,s.stage))+'。':description,apply:s=>applyGate(s,{stat,op:'add',value:scaledReward(stat,value,s.stage)})});
export const CARDS=[
 {id:'growth',title:'小小的全能选手',description:'攻击力与攻速提高 10%。',icon:'✦',tag:'综合成长',eligible:s=>s.damage<MAX_STAT||s.rate<8,apply:s=>{s.damage=Math.min(MAX_STAT,s.damage*1.1);s.rate=Math.min(8,s.rate*1.1);}},
 statCard('company','再多一点热闹','增加 1 只奶蛙伙伴，定时发出红色追踪奶蛋。','count',1,'＋'),
 statCard('speed','轻盈脚步','前进与左右移动速度提高 12%。前进最高 3 倍。','speed',.12,'➜'),
 statCard('rate','快乐连发','每秒攻击次数增加 0.3。','rate',.3,'»'),
 statCard('damage','浓缩小奶蛋','每只奶蛙的攻击力增加 0.5。','damage',.5,'◆'),
 statCard('range','把快乐送远一点','攻击距离增加 4 米。','range',4,'⌁'),
 {id:'scatter',title:'扇形齐射',description:'攻击形式：5 路散射，每路伤害 70%。可搭配任意武器。',icon:'⋔',tag:'攻击形式',weight:5,eligible:s=>s.pattern!=='spread',apply:s=>s.pattern='spread'},
 {id:'heavy',title:'重型弹药',description:'弹体增大 60%，伤害提高 80%，攻速降低 30%。',icon:'◆',tag:'攻击形式',weight:5,eligible:s=>s.pattern!=='heavy',apply:s=>s.pattern='heavy'},
 {id:'rapid',title:'急速连发',description:'攻速提高 65%，每发伤害降低 35%。',icon:'»',tag:'攻击形式',weight:5,eligible:s=>s.pattern!=='rapid',apply:s=>s.pattern='rapid'},
 {id:'pattern-normal',title:'回归标准',description:'恢复标准弹体和攻速，保留当前武器。',icon:'●',tag:'攻击形式',weight:3,eligible:s=>s.pattern!=='standard',apply:s=>s.pattern='standard'},
 {id:'projectiles',title:'并肩弹道',description:'每次额外发射 1 发；散射形式额外增加 2 路。',icon:'＋',tag:'弹道成长',weight:3,eligible:s=>s.projectileBonus<3,apply:s=>s.projectileBonus++},
 {id:'laser',title:'奶光激光',description:'武器：穿透直线上所有敌人，可搭配散射、重型或连发。',icon:'╱',tag:'武器',weight:5,eligible:s=>s.weapon!=='laser',apply:s=>s.weapon='laser'},
 {id:'replicator',title:'机器复制枪',description:'平射奶蛋，命中后分裂为 2 枚小奶蛋，每代伤害保留 65%，基础最多分裂 5 次。',describe:s=>'平射奶蛋，命中分裂为 '+s.splitCount+' 枚小奶蛋，最多 '+s.splitDepth+' 层；每代伤害保留 65%。可搭配攻击形式和专属升级。',icon:'⋈',tag:'武器',weight:5,eligible:s=>s.weapon!=='replicator',apply:s=>s.weapon='replicator'},
 {id:'replicator-depth',title:'复制协议 · 递归',description:'复制枪专属：分裂层数 +1，最多 8 层。',describe:s=>'复制枪专属：分裂层数 '+s.splitDepth+' → '+(s.splitDepth+1)+'，最多 8 层。',icon:'⤨',tag:'复制枪专属',weight:4,eligible:s=>s.weapon==='replicator'&&s.splitDepth<8,apply:s=>s.splitDepth=Math.min(8,s.splitDepth+1)},
 {id:'replicator-count',title:'复制协议 · 增殖',description:'复制枪专属：每次多分裂 1 枚小奶蛋，最多 4 枚。',describe:s=>'复制枪专属：每次分裂 '+s.splitCount+' → '+(s.splitCount+1)+' 枚小奶蛋，最多 4 枚。',icon:'⋈',tag:'复制枪专属',weight:4,eligible:s=>s.weapon==='replicator'&&s.splitCount<4,apply:s=>s.splitCount=Math.min(4,s.splitCount+1)},
 {id:'bomb',title:'奶蛋爆破手',description:'武器：投掷爆炸奶蛋，保留当前攻击形式。',icon:'◉',tag:'武器',weight:5,eligible:s=>s.weapon!=='bomb',apply:s=>s.weapon='bomb'},
 {id:'egg',title:'熟悉的小奶蛋',description:'武器：切回奶蛋射击，保留当前攻击形式。',icon:'●',tag:'武器',weight:3,eligible:s=>s.weapon!=='egg',apply:s=>s.weapon='egg'},
 {id:'pumpkin',title:'南瓜法杖',description:'挥动南瓜法杖，投出幽火南瓜，炸开大片敌人。',icon:'✧',tag:'幽境限定',eligible:s=>s.theme==='halloween'&&s.weapon!=='pumpkin',apply:s=>s.weapon='pumpkin'},
 {id:'dog',title:'听见快乐的汪汪声',description:'召唤 1 只奶狗。它会冲到敌人面前扑咬。',icon:'♧',tag:'召唤伙伴',eligible:s=>!s.pets.naigou,apply:s=>s.pets.naigou=1},
 {id:'mouse',title:'大耳朵的小帮手',description:'召唤 1 只奶鼠。搓出奶球追踪攻击敌人。',icon:'♧',tag:'召唤伙伴',eligible:s=>!s.pets.naishu,apply:s=>s.pets.naishu=1},
 ...[['naigou','奶狗'],['naishu','奶鼠']].flatMap(([name,label])=>[
 {id:name+'-pack',title:label+'小分队',description:'再召唤 1 只'+label+'，最多同时拥有 3 只。',icon:'＋',tag:'伙伴成长',eligible:s=>s.pets[name]>0&&s.pets[name]<3,apply:s=>s.pets[name]++},
 {id:name+'-power',title:label+'的拿手好戏',description:label+'的攻击力提高 35%。',icon:'✦',tag:'伙伴成长',eligible:s=>s.pets[name]>0&&s.petDamage[name]<MAX_STAT,apply:s=>s.petDamage[name]=Math.min(MAX_STAT,s.petDamage[name]*1.35)},
 ]),
 ...[['naigou','guard','忠诚守卫','每 8 秒替你抵挡一次伤害。'],['naigou','strike','勇敢突击','奶狗扑咬伤害提高 25%。'],['naishu','support','星光标记','奶球标记持续 8 秒；配合奶狗触发协同。'],['naishu','burst','奶球扩散','奶球对附近敌人造成 25% 的范围伤害。']].map(([pet,role,title,description])=>({id:pet+'-'+role,title,description,icon:'✧',tag:'宠物专精',weight:3,eligible:s=>s.pets[pet]>0&&s.petRoles?.[pet]!==role,apply:s=>{(s.petRoles??={})[pet]=role;}})),
 {id:'squad-multiplier',title:'奶蛙大集合',description:'奶蛙队伍数量提高 50%，向上取整。',icon:'×',tag:'稀有成长',weight:.25,majorReward:true,rare:true,eligible:s=>s.count<MAX_STAT,apply:s=>s.count=Math.min(MAX_STAT,Math.ceil(s.count*1.5))},
 {id:'major-coins',title:'远征补给',description:'额外获得 5 枚金币。主题首领专属馈赠。',icon:'◈',tag:'首领馈赠',weight:0,majorReward:true,apply:s=>s.coins+=5},
 {id:'major-rest',title:'远征者的余裕',description:'恢复全部生命，上限增加 1 点，最多 99 点。',icon:'♡',tag:'首领馈赠',weight:0,majorReward:true,apply:s=>{s.maxHealth=Math.min(99,s.maxHealth+1);s.health=s.maxHealth;}},
 {id:'major-power',title:'征服者的勇气',description:'攻击力提高 35%。主题首领专属馈赠。',icon:'✦',tag:'首领馈赠',weight:0,majorReward:true,eligible:s=>s.damage<MAX_STAT,apply:s=>s.damage=Math.min(MAX_STAT,s.damage*1.35)},
 {id:'major-projectiles',title:'星群弹道',description:'额外弹道增加 2 发。主题首领专属馈赠。',icon:'⋔',tag:'首领馈赠',weight:0,majorReward:true,eligible:s=>s.projectileBonus<3,apply:s=>s.projectileBonus=Math.min(3,s.projectileBonus+2)},
 {id:'major-range',title:'远征者的目光',description:'攻击距离增加 8 米。主题首领专属馈赠。',icon:'⌁',tag:'首领馈赠',weight:0,majorReward:true,eligible:s=>s.range<52,apply:s=>s.range=Math.min(52,s.range+8)},
 {id:'major-rate',title:'不息的回响',description:'基础攻速提高 30%。主题首领专属馈赠。',icon:'»',tag:'首领馈赠',weight:0,majorReward:true,eligible:s=>s.rate<8,apply:s=>s.rate=Math.min(8,s.rate*1.3)},
 {id:'heal',title:'先喝一口热牛奶',description:'恢复 2 点生命，继续向前。',icon:'♡',tag:'补给',eligible:s=>s.health<s.maxHealth,apply:s=>s.health=Math.min(s.maxHealth,s.health+2)},
];
export function rollCards(s,random=Math.random,major=false){
 let pool=CARDS.filter(c=>(major?c.majorReward:(c.weight??6)>0)&&(!c.eligible||c.eligible(s))),out=[];
 if(!major&&s.cards===0)for(const id of ['dog','mouse']){const c=pool.find(c=>c.id===id);if(c){out.push(c);pool=pool.filter(v=>v!==c);}}
 if(!major&&s.cards===0&&s.theme==='cyber'){const gun=pool.find(card=>card.id==='replicator');if(gun){out.push(gun);pool=pool.filter(card=>card!==gun);}}
 while(out.length<3&&pool.length){const weights=pool.map(c=>major?1:(c.weight??6)),total=weights.reduce((a,b)=>a+b,0);let n=random()*total,index=0;for(;index<weights.length-1;index++){n-=weights[index];if(n<0)break;}out.push(pool.splice(index,1)[0]);}
 return out.map(card=>({...card,description:card.describe?card.describe(s):card.description}));
}
export function chooseCard(s,id){const c=CARDS.find(c=>c.id===id);if(!c||(c.eligible&&!c.eligible(s)))return false;const gates=s.gates;c.apply(s);s.gates=gates;s.cards++;return true;}
export const SHOP=[
 {id:'heart',title:'口袋护符',description:'开局生命 +1',price:28,max:3,icon:'♡'},
 {id:'power',title:'浓缩奶瓶',description:'开局攻击力 +0.15',price:32,max:5,icon:'◆'},
 {id:'range',title:'远行镜片',description:'开局攻击距离 +2 米',price:24,max:4,icon:'⌁'},
 {id:'company',title:'同行车票',description:'开局追踪奶蛙伙伴 +1',price:60,max:2,icon:'＋'},
 {id:'purse',title:'幸运钱袋',description:'拾取金币收益 +10%',price:38,max:4,icon:'◈'},
 {id:'naigou',title:'奶狗的邀请函',description:'解锁开局召唤奶狗',price:90,max:1,icon:'♧'},
 {id:'naishu',title:'奶鼠的邀请函',description:'解锁开局召唤奶鼠',price:90,max:1,icon:'♧'},
];
export const shopPrice=(item,level=0)=>Math.ceil(item.price*Math.pow(1.65,level));
export function buyUpgrade(saved,id){const item=SHOP.find(v=>v.id===id);if(!item)return false;saved.upgrades??={};const level=saved.upgrades[id]||0,cost=shopPrice(item,level);if(level>=item.max||saved.coins<cost)return false;saved.coins-=cost;saved.upgrades[id]=level+1;if(id==='naigou'||id==='naishu')saved.startingPet=id;return true;}
// Relative swept collision catches fast bullets and advancing enemies.
export function sweepHit(ax,az,bx,bz,radius){const dx=bx-ax,dz=bz-az,a=dx*dx+dz*dz,c=ax*ax+az*az-radius*radius;if(c<=0)return 0;if(a<1e-12)return null;const b=2*(ax*dx+az*dz),d=b*b-4*a*c;if(d<0)return null;const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:null;}
export function squadContact(s,ax,az,bx,bz,radius){return formation(s.count).some((p,i)=>{const x=s.x+p.x,z=i===0?5:5.8+p.z;return sweepHit(ax-x,az-z,bx-x,bz-z,radius+(i===0?.42:.28))!==null;});}
