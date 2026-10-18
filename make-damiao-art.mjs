// Original SVG paintings informed by the owner's campus photographs.
// No photographs, logos, addresses or real inscriptions are embedded.
import fs from 'node:fs';fs.mkdirSync('damiao/art',{recursive:true});
const rect=(x,y,w,h,c,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const path=(d,c,stroke='',sw=1)=>`<path d="${d}" fill="${c}" ${stroke?`stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"`:''}/>`;
const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const ellipse=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
function tree(x,y,s=1,tone=0){const colors=tone?['#59746b','#718876','#94a17e']:['#2b5450','#3d6960','#618473'];let a=path('M-10 35Q7-145-21-302L-7-307Q28-155 18 35Z','#635e4a');for(let i=0;i<8;i++){const X=(i%2?1:-1)*(30+(i*13)%60),Y=-80-i*27;a+=path(`M5 ${Y+45}Q${X/2} ${Y+15} ${X} ${Y-10}`,'none','#6d6d51',6);}for(let i=0;i<35;i++){const X=Math.sin(i*2.4)*(65+(i*17)%60),Y=-130-(i*29)%220;a+=ellipse(X,Y,32+(i*11)%35,22+(i*7)%28,colors[i%3]);}return `<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;}
function railing(x,y,w,h=90){let a=path(`M${x} ${y}H${x+w}M${x} ${y+h}H${x+w}`,'none','#c6c8b0',9);for(let i=0;i<=w;i+=70)a+=rect(x+i,y,8,h,'#bcc2af')+path(`M${x+i} ${y+25}h55v42h-55`,'none','#d4d3bb',5);return a;}
function building(x,y,s=1,observatory=false){let a=rect(0,0,430,370,'#768f89')+rect(13,0,404,370,'#afbaab')+rect(0,0,430,18,'#e2ddbf');for(let r=0;r<3;r++){a+=rect(-12,100+r*112,455,12,'#d9d4b7');for(let c=0;c<6;c++){const X=25+c*66,Y=30+r*112;a+=path(`M${X} ${Y+70}V${Y+24}A23 23 0 0 1 ${X+46} ${Y+24}V${Y+70}Z`,'#9e6655')+path(`M${X+7} ${Y+67}V${Y+25}A16 16 0 0 1 ${X+39} ${Y+25}V${Y+67}Z`,'#395d5d')+rect(X+12,Y+23,3,40,'#d0c39b');}a+=railing(5,90+r*112,420,14);}if(observatory){a+=rect(120,-75,190,75,'#b2bba7')+path('M110-75A105 105 0 0 1 320-75Z','#dddac4');for(let i=1;i<6;i++)a+=path(`M${110+i*35}-75Q${170+i*14}-220 215-180`,'none','#b1b9a7',1.5);a+=rect(110,-78,210,7,'#a2b09f');}return `<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;}
function desk(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${path('M0 0L170 0 198 40H-25Z','#c6b68b','#a6936c',2)}${rect(-20,40,215,15,'#ab9875')}${path('M0 55L-8 140M172 55L180 140','none','#6d827a',9)}${rect(22,91,128,52,'#9f9e81',5)}${rect(30,148,114,12,'#b3a982',3)}</g>`;}
const ids=['terrace','gate','field','corridor','classroom','home','observatory','small','sealed','night','dawn','desk'];
for(const id of ids){const dusk=['field','sealed','night','terrace','observatory'].includes(id);let a=rect(0,0,1440,1000,'url(#sky)');a+=circle(1050,175,dusk?85:60,dusk?'#ead3a0':'#f1e3bd');
 a+=path('M0 380Q150 240 350 370Q520 180 720 330Q940 220 1100 350Q1300 280 1440 330V1000H0Z',dusk?'#6f8c80':'#a1b5a1')+path('M0 450Q180 335 400 430Q650 320 840 470Q1120 350 1440 420V1000H0Z',dusk?'#466c64':'#779e8e');
 if(id==='terrace'){
  a+=path('M-100 1000L600 475 1470 510 1500 1000Z','url(#stone)');for(let i=0;i<10;i++){const Y=510+i*i*5;a+=path(`M${600-i*65} ${Y}L1440 ${Y+35}`,'none','#87978a',2);}a+=path('M620 560L1310 580 1330 630 570 605Z','#aeb5a0')+path('M650 510L1290 530 1310 580 620 560Z','#c0c1a5');a+=railing(680,430,600,80);
  a+=path('M1070 480L1083 290Q1145 245 1190 290L1200 486Z','#9daba0','#d0ceb2',3)+path('M1098 305H1175V461H1098Z','none','#6e877b',1);
  a+='<text x="1136" y="327" fill="#536e60" font-family="serif" font-size="19" writing-mode="tb" letter-spacing="12">大庙千秋</text>';
  a+=tree(1310,590,1.5)+tree(270,695,2)+tree(-40,660,2.7);
  // A distant scholar is a gesture and silhouette, without identifiable facial details.
  a+=ellipse(934,553,76,12,'#344f4844')+circle(931,461,15,'#dad8c0')+path('M913 477Q897 492 884 545Q938 563 986 543L951 477Z','#e9e5cb')+path('M890 515L984 526L987 541L883 532Z','#665e48')+path('M916 490L945 520M952 491L930 519','none','#d0d3bb',9);
  a+=ellipse(800,745,830,100,'#d2decd25')+ellipse(1050,900,900,115,'#d2decd30');
 }else if(id==='corridor'||id==='dawn'){
  a=rect(0,0,1440,1000,'url(#sky)');a+=tree(90,800,2.1,1)+tree(320,670,1.2)+tree(1200,650,1.7);
  a+=path('M0 1000L615 325H830L1440 1000Z','#657c72');for(let i=0;i<23;i++){const u=i/22,Y=330+670*u*u,L=615-615*u,R=830+610*u;a+=path(`M${L} ${Y}L${R} ${Y}v${5+u*10}L${L} ${Y+5+u*10}Z`,i%2?'#9daca0':'#b2b9a4')+path(`M${L} ${Y}L${R} ${Y}`,'none','#d9d5b6',2);}
  a+=path('M0 0H1440L850 295H590Z','#526e61')+path('M0 955L575 333 591 340 80 970Z','#c7c8aa')+path('M1360 970L852 338 868 330 1440 955Z','#c7c8aa');
  for(let i=0;i<7;i++){const u=i/7,L=45+570*u,R=1395-560*u,T=35+260*u,B=940-590*u,w=24*(1-u)+7;a+=rect(L,T,w,B-T,'#a6b09a')+rect(R-w,T,w,B-T,'#809583')+path(`M${L} ${T}H${R}v${22*(1-u)+7}H${L}Z`,'#bec3a9')+path(`M${L+w} ${T+22}H${R-w}`,'none','#e0d9b5',3);}
  for(let i=0;i<32;i++){const X=20+(i*59)%480,Y=25+(i*97)%470;a+=path(`M${X} ${Y}q45 80 30 130`,'none','#536d48',2)+ellipse(X+14,Y+42,15,29,['#6c8c58','#94a66d','#b1b97c'][i%3]);}a+=path('M600 332H845V420H600Z','#d9dfc0');a+=tree(732,426,.32,1);
 }else if(['classroom','night','home','desk'].includes(id)){
  a=rect(0,0,1440,1000,id==='night'?'#8b9b87':'#d5d6be')+rect(0,610,1440,390,'#9eaa94');a+=rect(88,143,665,340,'#6b8474',4)+rect(103,158,635,309,'#314f48',3)+path('M140 430H690','none','#d5d8ba44',2);
  for(let c=0;c<3;c++){const X=870+c*186;a+=rect(X-8,90,178,465,'#c2c8ae')+rect(X,100,158,440,id==='night'?'#27494e':'#b9d0ba')+path(`M${X+79} 100V540M${X} 300h158`,'none','#e3debf',6);a+=path(`M${X} 100Q${X+45} 190 ${X+18} 498L${X-8} 520V100Z`,'#eee6ca77');}
  a+=path('M0 620L1440 620M0 760H1440M0 940H1440M120 1000L700 610M1120 1000L960 610','none','#7f958550',3);
  if(id==='home'){a+=desk(450,550,3.2)+rect(567,518,250,150,'#3e5c58',8)+rect(578,529,228,125,'#a7c8b5',3)+path('M552 673H832L867 692H520Z','#aebdb0')+rect(345,656,148,10,'#efe6c5')+rect(343,668,145,9,'#a19a73');}
  else if(id==='desk'){a+=desk(325,610,4)+path('M850 650L1090 665 1070 690 830 674Z','#e8dfbe')+path('M900 681L1060 685','none','#8a9d88',3);}
  else {for(let row=0;row<3;row++)for(let c=0;c<4;c++){const s=.8+row*.25;a+=desk(170+c*300-row*35,540+row*140,s);}a+=tree(1170,602,.35,1)+rect(1149,591,43,55,'#a58e6e',3);}
  a+=path('M1440 100L1440 830 640 1000 300 830Z','#fff1c127');
 }else if(id==='field'||id==='sealed'){
  a+=building(130,310,.7,true)+building(890,320,.8);for(let i=0;i<12;i++)a+=tree(i*135,595,.65+(i%3)*.16);
  a+=path('M-100 1000V730Q0 575 720 575T1540 730V1000Z','#b79a77')+ellipse(720,820,900,224,'#a77762')+ellipse(720,820,660,154,'#8a9d77');for(let i=0;i<5;i++)a+=`<ellipse cx="720" cy="820" rx="${705+i*36}" ry="${166+i*14}" fill="none" stroke="#e4c6a0" stroke-width="2" opacity=".7"/>`;
  a+=railing(0,580,1440,80)+path('M750 585H960L990 635H725Z','#d6d0ae')+rect(770,573,170,18,'#c6c6a6')+path('M850 575V290','none','#dbdfc1',5)+path('M852 293Q890 305 923 286V337Q892 350 852 334Z','#a95747');a+=ellipse(1080,780,300,50,'#efc99b20');
  if(id==='sealed'){a+=path('M-50 645L1500 670V1000H-50Z','#65877c');for(let i=0;i<28;i++)a+=path(`M${i*55} 645V1000`,'none','#446b63',3);a+=rect(550,740,310,100,'#d2d0b0',4)+'<text x="705" y="796" text-anchor="middle" font-size="22" fill="#5a7466" font-family="serif" letter-spacing="4">暂别 · 待重逢</text>';}
 }else if(id==='gate'){
  a+=building(500,310,1.1,true)+tree(1160,660,1.6)+tree(290,610,1.8);a+=path('M0 1000L640 590H920L1440 1000Z','#c0c5af');a+=rect(230,345,140,500,'url(#masonry)')+rect(1085,345,140,500,'url(#masonry)')+path('M180 350Q710 395 1280 350L1240 295Q710 342 220 295Z','#566f61')+rect(370,620,715,8,'#8fa28e');for(let i=0;i<24;i++)a+=path(`M${380+i*30} 560v230`,'none','#718d7b',5);a+='<text x="1155" y="420" writing-mode="tb" font-family="serif" font-size="30" letter-spacing="20" fill="#c7bb84">照岚中学</text>';a+=tree(87,855,1.8,1)+tree(1360,860,1.4);
 }else{
  a+=building(530,250,id==='observatory'?1.5:1.15,true)+building(-160,420,.9)+tree(1300,700,1.7)+tree(140,710,1.6);
  a+=path('M0 810L450 620H1100L1440 780V1000H0Z','#8fa78b')+path('M75 985L425 700H1100L1370 970Z','none','#d0d2ac',3)+ellipse(740,850,180,70,'#acaa82');a+=railing(20,700,350,80);if(id==='observatory')a+=circle(1030,130,30,'#e9dfb8');
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${dusk?'#527b7b':'#abc6ba'}"/><stop offset=".63" stop-color="${dusk?'#cfb797':'#e4dfbd'}"/><stop offset="1" stop-color="#93aa94"/></linearGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="#c7cbb2"/><stop offset="1" stop-color="#829689"/></linearGradient><pattern id="masonry" width="100" height="55" patternUnits="userSpaceOnUse"><rect width="100" height="55" fill="#a6b09a"/><path d="M0 0H100M0 55H100M50 0V55" stroke="#d0cfb3" stroke-width="2"/></pattern><linearGradient id="wash" x2="1" y2="1"><stop stop-color="#ffe8b0" stop-opacity=".09"/><stop offset="1" stop-color="#1b4b50" stop-opacity=".17"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".035"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter></defs><g>${a}${rect(0,0,1440,1000,'url(#wash)')}</g><rect width="1440" height="1000" opacity=".32" filter="url(#grain)" fill="transparent"/></svg>`;
 fs.writeFileSync('damiao/art/'+id+'.svg',svg);
}
console.log('Created twelve original mountain-campus scenes.');

// Apply the revised edition after generating the retained originals.
await import('./repaint-damiao.mjs');
