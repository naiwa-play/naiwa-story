import {addTravel} from './travels.js?v=10';
import {rebuildMain} from './main-story.js?v=10';
import {completePortraits} from './portraits.js?v=10';
import {expandDreams} from './dream-expansion.js?v=10';
import {expandJourneys} from './journeys.js?v=10';
import {chapters,newScenes,newStory,newEndings} from './adventure.js?v=10';
import {nightmareChapter,nightmareScenes,nightmareStory,nightmareEndings,canEnterNightmares} from './nightmares.js?v=10';
export {canEnterNightmares};
export {chapters};
// Character portraits are defined in portraits.js; owner-selected voice clips are pending.
export const media={voices:{}};
export const scenes={street:'雨后的街角',room:'留一盏灯',park:'傍晚的公园'};
export const story={
 arrival:{scene:'street',speaker:'旁白',text:'雨刚停。你在便利店门口，发现了一封没有收件人的信。信封旁边，还站着一位不肯走的小客人。',next:'hello'},
 hello:{scene:'street',speaker:'奶蛙',mood:'normal',text:'……你终于来了。\n别误会，我只是站累了。',next:'question'},
 question:{scene:'street',speaker:'你',text:'我们认识吗？',next:'answer'},
 answer:{scene:'street',speaker:'奶蛙',mood:'happy',text:'现在认识了。\n你看，交朋友是不是很简单？',next:'umbrella'},
 umbrella:{scene:'street',speaker:'旁白',text:'它抬头看看你的伞，又看看那封被雨水打湿的信。你决定——',choices:[{text:'把伞往它那边挪一点',to:'kind'},{text:'先问问信里写了什么',to:'letter'},{text:'邀请它一起去买点吃的',to:'snack'}]},
 kind:{scene:'street',speaker:'奶蛙',mood:'shy',text:'其实我不怕淋雨。\n不过……两个人撑伞，好像是比较好。',next:'home'},
 letter:{scene:'street',speaker:'奶蛙',mood:'normal',text:'上面写着：今天，请做一件平时不会做的事。\n所以我在这里，等一个愿意停下来的人。',next:'home'},
 snack:{scene:'street',speaker:'奶蛙',mood:'happy',text:'有眼光。\n我宣布，你已经通过了交朋友的第一轮面试。',next:'home'},
 home:{scene:'room',speaker:'旁白',text:'你们借了一处临窗的位置躲雨。热茶冒着气，信封在桌角慢慢变干。刚认识的陌生人，竟然也能安静地坐在一起。',next:'wish'},
 wish:{scene:'room',speaker:'奶蛙',mood:'normal',text:'如果今天可以一直不结束，你最想做什么？',choices:[{text:'什么也不做，就在这里陪你',to:'stay'},{text:'出去走走，把这封信送到远方',to:'walk'},{text:'研究一下明天的零食清单',to:'food'}]},
 stay:{scene:'room',speaker:'奶蛙',mood:'shy',text:'那我小声一点。\n……不是没话说，是想把这一会儿留久一点。',next:'lamp'},
 lamp:{scene:'room',speaker:'旁白',text:'窗外又落起小雨。你们没有急着出发。原来有些相遇，不需要一份详细的计划。',ending:'light'},
 walk:{scene:'park',speaker:'旁白',text:'你们沿着湿漉漉的小路走到公园。奶蛙在信纸背面，认真添了一行字：下一个收到信的人，也要开心。',next:'trip'},
 trip:{scene:'park',speaker:'奶蛙',mood:'happy',text:'走吧。\n如果没有目的地，我们就把路过的地方，都叫作目的地。',ending:'journey'},
 food:{scene:'room',speaker:'奶蛙',mood:'happy',text:'先声明，我对零食的要求很严格。\n第一条：好吃。第二条：再来一份。',next:'laugh'},
 laugh:{scene:'room',speaker:'旁白',text:'你们最后写了满满一页清单，却忘记买晚饭。没关系，今天最先被填满的，是屋子里的笑声。',ending:'snacks'}
};
export const endings={light:{title:'为你留一盏灯',note:'有时候，陪伴就是最好的回答。'},journey:{title:'下一站，一起去',note:'故事没有结束，只是换了一条路。'},snacks:{title:'零食同盟成立',note:'从今天起，快乐按双人份计算。'}};
Object.assign(scenes,newScenes);Object.assign(story,newStory);Object.assign(endings,newEndings);
chapters.nightmares=nightmareChapter;Object.assign(scenes,nightmareScenes);Object.assign(story,nightmareStory);Object.assign(endings,nightmareEndings);
story.lamp.text+='\n雨停时，奶蛙展开信背面的海图：明天，和我一起去冒险吧。';
story.trip.text+='\n它把地图递给你：第一站，星图失落之岛。你愿意来吗？';
story.laugh.text+='\n奶蛙把清单塞进旅行包：补给准备好了。明天，我们去地图上的岛冒险！';
for(const n of Object.values(story))n.chapter??='prologue';
for(const e of Object.values(endings))e.chapter??='prologue';
story.arrival.text+=' 信封角落，绣着十三道细小的蓝线。';
story.letter.text+='\n奇怪的是，信里还写着：如果钟敲十三下，别急着回头。';
story.departure_3.text+=' 你摸了摸信封上的蓝线，数目恰好与钟声一致。';
story.open_horizon_3.text+=' 你终于看懂那十三道蓝线：它们不是倒计时，而是十三条等待被重新连接的航路。';
export const secrets={
 home:{title:'信纸的另一面',text:'把信纸对着窗光，能看见一行很淡的字：给未来的旅伴——请别只寻找宝藏，也看看等你经过的人。字迹和奶蛙刚写的零食清单并不相同。'},
 cloud:{title:'第十四张票',text:'气球篮底有一张盖着“第十四航次”的旧票。背面写着：前十三次，我都一个人出发。这一次，想试试有人同行。署名处画着一盏小灯。'},
 forest_start:{title:'第一页的折角',text:'观察册的折角里夹着一枚贝壳。小字写着：海边的风，也会来到森林。你想起信上的蓝线——也许不同的路线，一直在悄悄连接。'}
};
expandJourneys(story,endings,secrets);
expandDreams(story,endings,secrets);
rebuildMain(story,endings,chapters,secrets);
addTravel(story,endings,chapters,scenes,secrets);
completePortraits(story);
export const fresh=(chapter='prologue')=>({version:1,node:chapters[chapter]?.entry||'arrival',history:[]});
export function validSave(s){return !!s&&s.version===1&&Object.hasOwn(story,s.node)&&Array.isArray(s.history)&&s.history.length<=200&&s.history.every(id=>typeof id==='string'&&Object.hasOwn(story,id));}
export function advance(s,choice){if(!validSave(s))throw Error('Invalid save');const n=story[s.node];const target=n.choices?n.choices[choice]?.to:n.next;if(!target)return s;return {...s,node:target,history:[...s.history,s.node].slice(-200)};}
