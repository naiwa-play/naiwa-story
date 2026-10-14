// Original editorial-style city illustrations; light SVGs need no image service.
import fs from 'node:fs';
fs.mkdirSync('assets/urban',{recursive:true});
const rect=(x,y,w,h,c,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" rx="${r}"/>`;
const line=(x,y,X,Y,c,w=2)=>`<path d="M${x} ${y}L${X} ${Y}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
function skyline(day){let a='';for(let i=0;i<19;i++){const x=i*78-30,h=80+(i*47)%190,y=460-h;a+=rect(x,y,66,h,day?'#a4b8b6':'#35475f',2);for(let k=0;k<3;k++)for(let j=0;j<4;j++)if((i+j+k)%3)a+=rect(x+10+k*17,y+18+j*35,7,13,day?'#dbe0cf':'#bcae86',1);}return a;}
function pot(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${rect(-22,0,44,42,'#b78165',4)}<path d="M0 5Q-45-25-28-62Q6-57 0 5Q35-80 50-58Q55-28 0 5Q-15-96 12-106Q34-74 0 5" fill="#527b70"/></g>`;}
function chair(x,y,c='#a79079'){return `<g transform="translate(${x} ${y})">${rect(0,0,46,43,c,5)}${rect(-2,48,52,10,c,3)}${line(5,57,1,91,c,5)}${line(42,57,49,91,c,5)}</g>`;}
function windowFrame(x,y,w,h,day=false){return rect(x-9,y-9,w+18,h+18,'#727b79',4)+rect(x,y,w,h,day?'#d4e4dd':'#35465e')+line(x+w/2,y,x+w/2,y+h,'#b1b9aa',5)+line(x,y+h*.58,x+w,y+h*.58,'#b1b9aa',5);}
const ids=['city-stop','city-store','city-laundry','city-arcade','city-river','city-bus','city-lobby','city-workshop','city-roof','city-roof-night'];
for(const id of ids){const day=['city-lobby','city-workshop','city-roof'].includes(id),indoor=['city-store','city-laundry','city-lobby','city-workshop','city-bus'].includes(id);let a=rect(0,0,1440,900,'url(#sky)')+circle(1090,135,day?54:30,day?'#fff4ce':'#e7dcb8')+skyline(day)+rect(0,460,1440,440,day?'#b9c2b7':'#44566a');
 if(!day)a+='<g fill="#e7e7d0" opacity=".5">'+Array.from({length:23},(_,i)=>circle(65+i*61,45+(i*71)%165,i%3===0?1.6:.9,'#f5edcf')).join('')+'</g>';
 if(indoor){a=rect(0,0,1440,900,day?'#dfd8c5':'#d1c2a4')+rect(0,590,1440,310,day?'#b8b0a0':'#a29483')+rect(0,579,1440,13,'#8d9287')+windowFrame(910,95,370,420,day)+rect(84,85,640,420,day?'#eae3d2':'#eee2c2',6);for(let i=0;i<7;i++)a+=line(i*220-80,900,720+(i-3)*60,590,'#b5ab98');a+=pot(1335,570,1.1);}
 if(id==='city-stop'){
  a+=rect(0,655,1440,245,'#3b4659')+rect(0,635,1440,15,'#b0b2a5')+rect(160,210,640,26,'#bdbaaa',8)+rect(193,235,12,400,'#7f9b9e')+rect(750,235,12,400,'#7f9b9e')+rect(212,246,529,277,'#67838c88')+rect(260,494,414,18,'#bdae91',4)+line(286,511,278,624,'#8b9b9b',8)+line(645,511,653,624,'#8b9b9b',8)+rect(864,181,12,459,'#9faca7')+rect(827,171,85,110,'#e9dec0',9)+rect(842,191,55,12,'#648e89',3)+rect(845,220,48,40,'#8baba2',5);
  a+='<path d="M160 642L800 642L1100 900H0Z" fill="#e9dbad" opacity=".07"/>';
 }else if(id==='city-store'){
  for(let r=0;r<3;r++){a+=rect(112,187+r*92,585,9,'#a19a7e');for(let j=0;j<14;j++)a+=rect(121+j*40,143+r*92,24,44,['#b38c73','#b9b67a','#7d9d95','#d2ba8d'][j%4],3);}
  a+=rect(700,440,540,154,'#7b9487',5)+rect(682,427,570,20,'#e7d8b3',5)+rect(795,378,69,49,'#405d60',5)+rect(170,535,370,18,'#b29b7b',4)+rect(190,553,14,105,'#8e8976')+rect(505,553,14,105,'#8e8976')+chair(245,580,'#a59e80')+chair(401,580,'#a59e80')+rect(275,510,70,22,'#eee7d2',6);
 }else if(id==='city-laundry'){
  for(let i=0;i<4;i++){const x=123+i*143;a+=rect(x,233,129,270,'#e9e7d4',9)+rect(x+10,248,109,34,'#a6b8af',3)+circle(x+65,382,48,'#839b99')+circle(x+65,382,37,'#4e6b78')+`<path d="M${x+34} 394q20-36 61-10q-3 33-39 30Z" fill="#a4bcc1"/>`;}
  a+=rect(870,540,363,15,'#af997b',4)+chair(920,569)+chair(1050,569);
 }else if(id==='city-arcade'){
  a+=rect(0,0,1440,95,'#555d67')+rect(0,450,1440,180,'#697774');for(let i=0;i<4;i++){const x=i*390;a+=`<path d="M${x} 650V190Q${x+155} 5 ${x+310} 190V650" stroke="#9a9d8e" stroke-width="53" fill="none"/>`;}a+=rect(460,238,240,325,'#9caa99')+rect(483,265,194,150,'#d7c69a')+rect(740,430,80,120,'#d9cfb0',4)+pot(895,610);
 }else if(id==='city-river'){
  a+=rect(0,470,1440,210,'#6d8790');for(let j=0;j<17;j++)a+=rect((j*173)%1400,490+j*10,40+(j*13)%90,2,'#c7c6aa66');a+=rect(0,690,1440,210,'#586873')+line(0,611,1440,611,'#aeb9af',5);for(let i=0;i<16;i++)a+=line(i*101,612,i*101,760,'#aeb9af',4);a+=rect(1050,257,9,354,'#c0bba2')+circle(1054,250,21,'#fff0bd')+circle(1054,250,55,'#f8dfa51c');
 }else if(id==='city-bus'){
  a=rect(0,0,1440,900,'#c8c7b5')+rect(0,110,1440,380,'#384c64');for(let j=0;j<6;j++)a+=rect(j*253+18,130,220,310,'#60778a',20)+rect(j*253+18,380,220,37,'#d4ba8855')+line(j*253+10,30,j*253+10,680,'#d3cab1',13);a+=rect(0,590,1440,310,'#717e7e');for(let i=0;i<6;i++)a+=rect(i*250-40,478,178,170,'#78968d',30)+rect(i*250-40,647,180,35,'#9caf9b',12);a+=rect(800,30,220,44,'#425c5f',6)+rect(824,45,168,10,'#d1d9ac',4);
 }else if(id==='city-lobby'){
  a+=rect(160,141,475,315,'#b49f7e',4);for(let i=0;i<5;i++)a+=`<g transform="translate(${195+i*83} ${190+(i%2)*46}) rotate(${i%2?5:-4})">${rect(0,0,68,120,['#f2e6ca','#d2dfce','#c6d9d6'][i%3],2)}${line(12,24,54,24,'#9ca597',3)}${line(12,38,43,38,'#9ca597',3)}</g>`;a+=rect(780,425,75,170,'#a5b7aa')+pot(110,570,1.4)+rect(896,559,350,27,'#b79c7d',4)+rect(910,586,15,65,'#908773')+rect(1210,586,15,65,'#908773');
 }else if(id==='city-workshop'){
  a+=rect(130,126,550,342,'#f5edd6',8)+rect(158,151,490,285,'#d6dfcf')+rect(244,455,720,30,'#a88d6e',5)+rect(270,485,20,158,'#8c846e')+rect(908,485,20,158,'#8c846e')+rect(580,386,139,69,'#667d79',9)+circle(711,419,24,'#9ab2aa')+circle(711,419,13,'#455c63')+rect(380,435,95,15,'#e9ddbd',3)+chair(350,532)+chair(799,532)+pot(1302,570);
 }else{
  a+=rect(0,515,1440,385,day?'#b5b7a7':'#5e6d78')+rect(0,460,1440,55,day?'#d8d7bd':'#97a69f')+rect(145,125,12,390,'#8c9d92')+rect(876,125,12,390,'#8c9d92')+`<path d="M157 145Q510 165 876 145V437Q510 420 157 437Z" fill="${day?'#f5edd8':'#e1e7d2'}"/>`+`<path d="M157 145Q510 165 876 145" stroke="#e8dfc4" stroke-width="6" fill="none"/>`;
  if(!day)a+=`<path d="M250 338Q370 200 490 300T780 280V399H250Z" fill="#93b3ae"/><circle cx="690" cy="220" r="33" fill="#f7e5b3"/><path d="M1125 652L157 145L876 145Z" fill="#e9e5bc" opacity=".08"/>`;
  a+=rect(714,166,35,25,'#e8e0c5',3);for(let r=0;r<2;r++)for(let j=0;j<5;j++)a+=chair(210+j*158+r*32,535+r*119,day?'#a89076':'#a39781');a+=pot(78,520,1.3)+pot(1290,548,1.5)+line(0,70,1440,120,day?'#8d9e8f':'#a2afa1',2);for(let i=0;i<12;i++)a+=circle(i*128+26,72+i*4,5,day?'#e7d8b4':'#fce7b0');
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${day?'#a9c7c8':'#233a56'}"/><stop offset="1" stop-color="${day?'#eee1c2':'#b1a7a2'}"/></linearGradient><linearGradient id="wash" x2="0" y2="1"><stop stop-color="#fff1ce" stop-opacity=".06"/><stop offset="1" stop-color="#344c62" stop-opacity=".12"/></linearGradient></defs>${a}${rect(0,0,1440,900,'url(#wash)')}</svg>`;
 fs.writeFileSync(`assets/urban/${id}.svg`,svg);
}
fs.writeFileSync('urban.css',`[class*="city-"].stage .scenery{background:var(--city-art) center 35%/cover no-repeat}[class*="city-"].stage .scenery>*{display:none}[class*="city-"].chapter-card .chapter-art{background:var(--city-art) center 35%/cover no-repeat}[class*="city-"].chapter-card .chapter-art:before,[class*="city-"].chapter-card .chapter-art:after{display:none}\n${ids.map(id=>'.'+id+"{--city-art:url('assets/urban/"+id+".svg')}").join('\n')}\n.city-stop .scene-meta,.city-river .scene-meta,.city-roof-night .scene-meta,.city-arcade .scene-meta{color:#fff3d6;text-shadow:0 1px 6px #263a50}\n`);
console.log('Created ten original urban illustrations.');
