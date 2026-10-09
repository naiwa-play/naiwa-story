// All character images and voice clips are intentionally empty until selected by the owner.
export const media={portraits:{normal:null,happy:null,shy:null},voices:{}};
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
export const fresh=()=>({version:1,node:'arrival',history:[]});
export function validSave(s){return !!s&&s.version===1&&Object.hasOwn(story,s.node)&&Array.isArray(s.history)&&s.history.length<=200&&s.history.every(id=>typeof id==='string'&&Object.hasOwn(story,id));}
export function advance(s,choice){if(!validSave(s))throw Error('Invalid save');const n=story[s.node];const target=n.choices?n.choices[choice]?.to:n.next;if(!target)return s;return {...s,node:target,history:[...s.history,s.node].slice(-200)};}
