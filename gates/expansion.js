import {MAX_STAT,CARDS,makeCourse,STAGE_LENGTH,rewardGrowth} from './core.js?v=24';

export const PLAY_MODES={expedition:{name:'分岔远征',copy:'选路、奇遇与进化 · 无尽冒险'},guard:{name:'三分钟守卫',copy:'守住孵化器 · 生存 180 秒'},bossrush:{name:'首领连战',copy:'六场首领战 · 场间补给'},daily:{name:'每日远征',copy:'相同起点与路线 · 本地成绩'}};
export function seededRandom(seed){let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export const dayKey=(date=new Date())=>new Date(date.getTime()+8*3600000).toISOString().slice(0,10);
export const EVENTS=[
 {id:'workshop',title:'叮当作响的改造所',copy:'师傅把一枚温热的齿轮递给奶蛙。走进轰鸣的车间，还是沿着灯光回营地？',choices:[{id:'forge',title:'工厂捷径',copy:'本段敌人生命 +20%，立即获得一次武器改造选卡。',risk:1.2,card:true,weaponOnly:true},{id:'camp',title:'伙伴营地',copy:'恢复 2 点生命；本段恢复正常敌情。',heal:2}]},
 {id:'lab',title:'没有名字的实验室',copy:'玻璃柜里浮着一枚奶蛋。标签上写着：有些勇气，需要一点代价。',choices:[{id:'experiment',title:'接受实验',copy:'生命上限降低 1（至少为 2），攻击力提高 25%。',power:1.25,heart:-1},{id:'observe',title:'记录后离开',copy:'射程增加 3 米，最多 52 米。',range:3}]},
 {id:'rescue',title:'路边的求救纸条',copy:'纸条被小石头压着，旁边还留着一串细细的脚印。',choices:[{id:'rescue',title:'绕路救援',copy:'本段敌人生命 +15%；已有宠物攻击提高 20%，没有宠物则伙伴 +2。',risk:1.15,petPower:1.2},{id:'supply',title:'留下补给',copy:'花费本局 3 金币（不足则不花费），恢复全部生命。',cost:3,fullHeal:true}]},
 {id:'trader',title:'云游商人的小推车',copy:'商人说，今天的货架只为远征者打开。他的帽檐上停着一只金色蝴蝶。',choices:[{id:'purchase',title:'换一份灵感',copy:'花费本局 5 金币，获得一次成长选卡；金币不足时改为恢复 1 点生命。',cost:5,card:true,fallbackHeal:1},{id:'road',title:'听一段故事',copy:'伙伴 +1，并收好一枚旅途邮票。',company:1,stamp:true}]},
 {id:'shrine',title:'风里的小小许愿台',copy:'奶蛙闭上眼睛，许了一个不愿说出来的愿望。你把手放在发光的石头上。',choices:[{id:'courage',title:'把勇气装进口袋',copy:'攻击力提高 15%，本段敌人生命 +10%。',power:1.15,risk:1.1},{id:'kindness',title:'愿伙伴平安',copy:'生命上限 +1（最多 99），并恢复 1 点生命。',heart:1,heal:1}]},
 {id:'secret',title:'门后还有一条路',copy:'地图到这里断了，墙后却传来奶蛙熟悉的笑声。',choices:[{id:'secret',title:'推开隐藏的门',copy:'本段敌人生命 +30%；立即获得主题首领级选卡。',risk:1.3,major:true,card:true},{id:'rest',title:'坐下来看看风景',copy:'恢复 2 点生命，攻击力提高 5%。',heal:2,power:1.05}]},
];
export function expeditionCourse(stage,random,theme,mode='expedition',risk=1){
 let rows=makeCourse(stage,random,theme);
 if(mode==='bossrush'){const boss=rows.find(r=>r.type==='boss');rows=[{id:stage*100+91,type:'potion',positions:[0],at:stage*STAGE_LENGTH+8,stage},{id:stage*100+92,type:'card',at:stage*STAGE_LENGTH+12,stage},{...boss,bossIndex:stage,at:stage*STAGE_LENGTH+35,major:true,enemies:boss.enemies.map(e=>({...e,hp:Math.min(MAX_STAT,e.hp*(1+stage*.1))}))}];}
 else if(mode==='guard')rows=rows.filter(r=>r.type!=='gate'&&r.type!=='coins').map(r=>({...r,at:stage*STAGE_LENGTH+(r.at%STAGE_LENGTH)*.6}));
 else if(stage>0)rows.push({id:stage*100+90,at:stage*STAGE_LENGTH+8,stage,type:'event',event:EVENTS[Math.floor(random()*EVENTS.length)],used:false});
 return rows.map(r=>({...r,...(r.enemies?{enemies:r.enemies.map(e=>({...e,hp:Math.min(MAX_STAT,Math.round(e.hp*risk))}))}:{}),tail:r.tail||0})).sort((a,b)=>a.at-b.at);
}
export function applyEvent(s,choice){
 if(choice.cost&&s.coins<choice.cost&&choice.fallbackHeal){s.health=Math.min(s.maxHealth,s.health+choice.fallbackHeal);return {card:false};}
 if(choice.cost)s.coins=Math.max(0,s.coins-choice.cost);
 s.maxHealth=Math.max(2,Math.min(99,s.maxHealth+(choice.heart||0)));s.health=choice.fullHeal?s.maxHealth:Math.min(s.maxHealth,s.health+(choice.heal||0));
 s.damage=Math.min(MAX_STAT,s.damage*(choice.power||1));s.range=Math.min(52,s.range+(choice.range||0));s.count=Math.min(MAX_STAT,s.count+Math.max(0,Math.round((choice.company||0)*rewardGrowth(s.stage))));
 if(choice.petPower){if(s.pets.naigou||s.pets.naishu){for(const id of ['naigou','naishu'])if(s.pets[id])s.petDamage[id]=Math.min(MAX_STAT,s.petDamage[id]*choice.petPower);}else s.count=Math.min(MAX_STAT,s.count+2);}
 s.routeRisk=choice.risk||1;return {card:!!choice.card,major:!!choice.major,weaponOnly:!!choice.weaponOnly};
}
export function rollModification(s,random=Math.random){const pool=CARDS.filter(c=>(['武器','攻击形式','复制枪专属'].includes(c.tag)||c.id==='projectiles')&&(!c.eligible||c.eligible(s))),out=[];while(pool.length&&out.length<3){const c=pool.splice(Math.min(pool.length-1,Math.floor(random()*pool.length)),1)[0];out.push({...c,description:c.describe?c.describe(s):c.description});}return out;}
export const EVOLUTIONS=[
 {id:'mother',title:'母巢复制器',weapon:'replicator',copy:'末代奶蛋命中后，留下最多 3 座短暂存在的奶蛋炮台。',condition:'复制枪 · 分裂至少 6 层 · 每次至少 3 枚',ready:s=>s.weapon==='replicator'&&s.splitDepth>=6&&s.splitCount>=3},
 {id:'meteor',title:'奶蛋流星雨',weapon:'bomb',copy:'爆炸半径扩大 35%；每次爆炸追加一次 35% 伤害的余波。',condition:'投掷奶蛋 · 扇形散射 · 额外弹道至少 1',ready:s=>s.weapon==='bomb'&&s.pattern==='spread'&&s.projectileBonus>=1},
 {id:'chain',title:'星链奶光',weapon:'laser',copy:'光束命中标记敌人时，向附近最多 3 个敌人传导 45% 伤害。',condition:'奶光激光 · 已召唤奶鼠',ready:s=>s.weapon==='laser'&&s.pets.naishu>0},
 {id:'ghostfire',title:'南瓜鬼火',weapon:'pumpkin',copy:'火焰南瓜爆炸后留下 2 秒鬼火；最多同时存在 4 片。',condition:'南瓜法杖 · 重型弹药',ready:s=>s.weapon==='pumpkin'&&s.pattern==='heavy'},
 {id:'comet',title:'晨星奶蛋',weapon:'egg',copy:'每第 4 次齐射追加一枚穿透奶蛋，伤害为 220%。',condition:'奶蛋射击 · 连续速射 · 额外弹道至少 1',ready:s=>s.weapon==='egg'&&s.pattern==='rapid'&&s.projectileBonus>=1},
];
export const availableEvolutions=s=>EVOLUTIONS.filter(e=>e.ready(s)&&!s.evolutions?.includes(e.id));
export const evolutionActive=(s,id)=>s.evolutions?.includes(id)&&EVOLUTIONS.find(e=>e.id===id)?.weapon===s.weapon;
export function evolve(s,id){if(!availableEvolutions(s).some(e=>e.id===id))return false;(s.evolutions??=[]).push(id);return true;}
export const MILESTONES=[{id:'first-boss',name:'出发的勇气',copy:'击败第一位主题首领',reward:'晨光奶蛋',test:s=>s.bosses>=1},{id:'traveller',name:'路有千种可能',copy:'一局经历 3 次分岔事件',reward:'远征邮票',test:s=>s.events>=3},{id:'evolution',name:'新的可能',copy:'完成一次武器进化',reward:'星尘奶蛋',test:s=>s.evolutions?.length>0},{id:'last-heart',name:'最后一滴勇气',copy:'剩余 1 点生命时击败主题首领',reward:'勇气徽章',test:s=>s.lastHeartBoss},{id:'pet-team',name:'并肩同行',copy:'同一局召唤奶狗与奶鼠',reward:'伙伴相框',test:s=>s.pets.naigou>0&&s.pets.naishu>0},{id:'guardian',name:'把快乐守住',copy:'完成三分钟守卫战',reward:'孵化器纪念章',test:s=>s.mode==='guard'&&s.victory},{id:'champion',name:'六重奏',copy:'完成六场首领连战',reward:'首领皇冠',test:s=>s.mode==='bossrush'&&s.victory}];
export function recordRun(saved,s){saved.journal??={enemies:[],evolutions:[],milestones:[],themes:[],daily:{}};const j=saved.journal;for(const kind of s.seenEnemies||[])if(!j.enemies.includes(kind))j.enemies.push(kind);for(const id of s.evolutions||[])if(!j.evolutions.includes(id))j.evolutions.push(id);if(!j.themes.includes(s.theme))j.themes.push(s.theme);const unlocked=MILESTONES.filter(m=>m.test(s)&&!j.milestones.includes(m.id));j.milestones.push(...unlocked.map(m=>m.id));if(s.mode==='daily'){const key=s.dailyKey||dayKey();j.daily[key]=Math.max(j.daily[key]||0,Math.floor(s.distance));}return unlocked;}
