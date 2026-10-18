// Second painted edition. The approved corridor, dawn and observatory are retained.
// All paths are original illustrations; reference photographs stay outside the site.
import fs from 'node:fs';
const R=(x,y,w,h,c,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const P=(d,c='none',s='',w=1)=>`<path d="${d}" fill="${c}" ${s?`stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
const E=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const G=(x,y,s,a)=>`<g transform="translate(${x} ${y}) scale(${s})">${a}</g>`;
const C=(x,y,r,c)=>E(x,y,r,r,c);
const defs=`<defs>
<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#8faeae"/><stop offset=".58" stop-color="#e6ddc0"/><stop offset="1" stop-color="#bdc8b0"/></linearGradient>
<linearGradient id="sunset" x2=".15" y2="1"><stop stop-color="#698f97"/><stop offset=".5" stop-color="#e1bd9f"/><stop offset="1" stop-color="#f0d6a7"/></linearGradient>
<linearGradient id="wall" x2="1" y2=".7"><stop stop-color="#d7d6be"/><stop offset="1" stop-color="#96aba0"/></linearGradient>
<linearGradient id="floor" x2=".2" y2="1"><stop stop-color="#a6b3a0"/><stop offset="1" stop-color="#5b7973"/></linearGradient>
<linearGradient id="wood" x2=".3" y2="1"><stop stop-color="#e2c695"/><stop offset="1" stop-color="#ad8f64"/></linearGradient>
<linearGradient id="night" x2="0" y2="1"><stop stop-color="#183c4b"/><stop offset="1" stop-color="#6f9790"/></linearGradient>
<linearGradient id="mist" x2="0" y2="1"><stop stop-color="#eff0dc" stop-opacity="0"/><stop offset="1" stop-color="#e4e8d1" stop-opacity=".7"/></linearGradient>
<radialGradient id="light"><stop stop-color="#fff2c9" stop-opacity=".6"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient>
<pattern id="stone" width="88" height="52" patternUnits="userSpaceOnUse"><rect width="88" height="52" fill="#aab8aa"/><path d="M0 1H88M44 1V26M0 27H88M1 27V52" fill="none" stroke="#dde0c8" stroke-width="1.3" opacity=".65"/></pattern>
<pattern id="paper" width="7" height="11" patternUnits="userSpaceOnUse"><path d="M0 1h2M4 7h1" stroke="#243e37" stroke-opacity=".09" stroke-width=".5"/></pattern>
<filter id="soft"><feGaussianBlur stdDeviation="12"/></filter>
</defs>`;
function frame(name,a){fs.writeFileSync(`damiao/art/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1000" role="img"><title>${name}</title>${defs}${a}${R(0,0,1440,1000,'url(#paper)')}</svg>`);}
// Irregular leaf masses sit over forked trunks; smaller leaves break the contour.
function tree(x,y,s=1,far=false){let a=P('M-16 30C-4-85 11-161-14-275L-2-278C28-171 18-90 27 30Z',far?'#7d8e78':'#645f4c');a+=P('M8-105Q-50-175-99-185M7-169Q52-234 93-245M6-217L-42-287','none',far?'#7d8e78':'#645f4c',9);
 const tones=far?['#9eae94','#adb99b','#b8c1a1']:['#3a655c','#507b67','#789477'];
 for(let j=0;j<8;j++){const cx=Math.sin(j*2.39)*(52+j%3*18),cy=-145-j*23;let d='';for(let i=0;i<21;i++){const ang=i/20*Math.PI*2,rx=55+12*Math.sin(i*3.1+j),ry=30+8*Math.cos(i*2.7+j);d+=(i?'L':'M')+(cx+Math.cos(ang)*rx).toFixed(1)+' '+(cy+Math.sin(ang)*ry).toFixed(1);}a+=P(d+'Z',tones[j%3]);}
 for(let j=0;j<36;j++){const xx=Math.sin(j*2.4)*(50+j%6*11),yy=-150-j*5;a+=P(`M${xx} ${yy}q12-13 25-8q-11 14-25 8Z`,tones[(j+1)%3]);}return G(x,y,s,a);}
function hills(dusk=false){return R(0,0,1440,1000,dusk?'url(#sunset)':'url(#sky)')+E(1000,195,440,290,'url(#light)')+P('M0 415Q95 304 188 368L349 282 501 364 694 243 895 355 1086 292 1260 383 1440 307V1000H0Z','#aab9a4')+P('M0 478Q124 367 278 440Q461 331 672 417Q872 354 1039 427Q1245 361 1440 442V1000H0Z','#839e8d')+P('M0 550Q174 442 330 493Q568 423 790 520Q1080 442 1440 527V1000H0Z','#658a7b');}
function rail(x,y,w,s=1){let a=P(`M0 0H${w}M0 65H${w}`,'none','#c4ceba',7);for(let i=0;i<w;i+=45)a+=R(i,0,6,70,'#afc0af')+P(`M${i+8} 12h28v40h-28Z`,'none','#d5dcc6',3);return G(x,y,s,a);}
function arches(x,y,w=56,h=96,lit=false){return P(`M${x} ${y+h}V${y+w/2}a${w/2} ${w/2} 0 0 1 ${w} 0v${h-w/2}Z`,'#ad7964')+P(`M${x+7} ${y+h-2}V${y+w/2}a${w/2-7} ${w/2-7} 0 0 1 ${w-14} 0v${h-w/2-2}Z`,lit?'#dcca95':'#40635e')+P(`M${x+w/2} ${y+13}V${y+h}M${x+8} ${y+51}H${x+w-8}`,'none',lit?'#a59e78':'#8b9b83',2);}
function block(x,y,s=1,lit=false){let a=P('M0 5L460 5 536 48 536 335 460 307H0Z','#829c8f')+R(0,5,460,302,'url(#wall)')+P('M460 5L536 48V335L460 307Z','#688d82');for(let r=0;r<3;r++){a+=R(-9,r*99+4,478,9,'#e0dec4');for(let c=0;c<6;c++)a+=arches(18+c*74,22+r*99,52,78,lit);a+=rail(6,85+r*99,448,.99);}a+=P('M-20 4L9-13 452-13 480 4Z','#6c8173')+P('M-21 4H480','none','#e5dfbd',4);a+=P('M0 307H460L536 335H60Z','#526f64');return G(x,y,s,a);}
function paving(y=700){let a=P(`M0 ${y}H1440V1000H0Z`,'url(#floor)');for(let i=0;i<9;i++){let yy=y+(1000-y)*(i/8)**1.65;a+=P(`M0 ${yy}H1440`,'none','#c4cbb244',1.5);}for(let i=-5;i<13;i++)a+=P(`M720 ${y-80}L${i*180} 1000`,'none','#c4cbb233',1.5);return a;}
function grass(x,y,s=1){return G(x,y,s,P('M0 0Q-14-20-19-39M0 0Q6-32 18-44M1 0Q22-20 36-19M-1 0Q-31-14-40-9','none','#6a8766',3));}
function desk(x,y,s=1){let a=P('M0 0L150-7 192 30 18 43Z','url(#wood)','#b29670',1.5)+P('M18 43L192 30v11L18 55Z','#99845f')+P('M22 54L17 146M174 43L181 134','none','#506961',7)+P('M32 80L159 69M45 71L161 61V85L45 96Z','#76877a','#536f65',2)+P('M39 113L125 107 153 121 53 132Z','#bfaa80')+P('M49 131L49 169M142 123L149 159','none','#5d7365',5)+P('M45 90L126 83 133 112 51 119Z','#a9a888');a+=P('M27 8L79 6 94 22 40 25Z','#e9e3c9')+P('M84 7L130 4 146 19 98 23Z','#d4d6bb')+P('M50 11l25-1M55 17l24-1','none','#8c9d88',1);return G(x,y,s,a);}

// Gate: stone pylons, an open accordion gate, a receding lane and arched windows.
let a=hills()+block(535,340,.95)+tree(1190,675,1.45)+tree(315,560,1.45)+tree(1410,680,1.6);
a+=P('M0 1000L645 638H870L1440 1000Z','#b9c5b0')+P('M487 1000L705 637M1000 1000L817 637','none','#dbe0c8',3);
a+=P('M323 413L390 382 390 836 323 863Z','#758f81')+R(213,413,110,450,'url(#stone)')+P('M1050 372L1155 399 1155 873 1050 845Z','#6e8c80')+R(942,372,108,473,'url(#stone)');
a+=P('M188 409L377 378 401 391 328 430H202Z','#d0d4bc')+P('M925 363H1065L1174 392 1155 409 1051 384H930Z','#ccd3bc');
a+=P('M325 422L942 382V433L325 474Z','#536f64')+P('M332 428L942 389','none','#d5d5ad',2);
a+=R(965,410,65,324,'#5a7568')+'<text x="998" y="458" text-anchor="middle" fill="#e2d4aa" font-family="serif" font-size="30" letter-spacing="24" writing-mode="vertical-rl">照岚中学</text>';
for(let i=0;i<7;i++){const x=355+i*27;a+=P(`M${x} 642v163M${x} 650l27 145M${x+27} 650l-27 145`,'none','#7e9588',3)+C(x,810,6,'#526d61');}a+=P('M352 639H550M353 799H551','none','#bbc6af',4);
a+=P('M260 880Q700 760 1087 864L1320 1000H0Z','#afbfac55')+tree(43,932,1.95)+tree(1376,954,1.58);
a+=P('M854 857L1142 880 1130 922 850 895Z','url(#stone)');for(let i=0;i<18;i++){a+=grass(870+i*14,872+(i%3)*4,.65)+C(885+i*13,851+(i%4)*5,4,['#b48d6c','#d1b17d','#e0c99c'][i%3]);}a+=E(640,910,290,38,'#e6dec344');frame('gate',a);

// Quiet stone terrace, with a seated scholar drawn at an intentionally distant scale.
a=hills()+P('M0 1000L590 533 1264 522 1440 1000Z','url(#floor)');for(let i=0;i<13;i++)a+=P(`M${590-i*49} ${555+i*i*2.9}L${1250+i*20} ${548+i*i*2.9}`,'none','#ced1b799',2);
a+=P('M575 563L1237 548 1328 660 464 689Z','#b0bfaa')+P('M464 689L1328 660v20L448 711Z','#7d9685')+rail(610,476,600,.94);
a+=P('M1110 538L1119 319Q1160 284 1205 312L1220 531Z','url(#stone)','#d8dcc4',3)+P('M1136 333L1192 327 1204 505 1132 508Z','none','#718c79',2)+'<text x="1167" y="357" font-family="serif" font-size="20" letter-spacing="13" fill="#4d6959" writing-mode="vertical-rl">大庙千秋</text>';
let scholar=E(0,111,72,12,'#57786b55')+P('M-18 7Q-33 24-42 73L-63 103Q-31 119-3 109L30 116 62 99Q40 76 22 21Z','#e9e7cf','#b4c3b0',1.5)+P('M-8 10L0 56 10 15M-24 40L-34 85M21 38L37 85','none','#b8c9b9',2)+P('M-10-17Q4-29 17-13L15 5 8 16-8 10-16-2Z','#d3c7aa')+P('M-16-5Q-24-31 2-33Q25-35 20-8L9-15-11-10Z','#465a50')+E(4,-35,10,6,'#465a50')+P('M-34 55L-5 72 29 57M23 47L40 68','none','#e6e6d1',14)+P('M-62 77L64 65 70 82-58 95Z','#775f45')+P('M-53 80L60 69M-50 85L60 74','none','#c7ae7b',1);
a+=G(920,488,.9,scholar)+tree(233,743,2.15)+tree(-10,780,2.6)+tree(1370,661,1.35)+R(0,700,1440,300,'url(#mist)')+E(810,810,760,100,'#dce3cb44');frame('terrace',a);

function field(sealed=false){let b=hills(true)+C(1027,210,56,'#f4d7a6')+P('M360 185Q735 240 1280 201M137 281Q680 322 1340 270','none','#eed4b466',8)+block(250,395,.48)+block(990,376,.55);for(let i=0;i<14;i++)b+=tree(i*112,625,.65+i%3*.1,i%2===0);
 b+=R(0,626,1440,374,'#ae866a')+E(730,883,850,239,'#bd8b71')+E(730,883,639,159,'#8fa28a');for(let i=0;i<6;i++)b+=`<ellipse cx="730" cy="883" rx="${660+i*33}" ry="${173+i*13}" fill="none" stroke="#e6cfac" stroke-width="2" opacity=".7"/>`;
 b+=P('M0 640H1440M0 706H1440','none','#b6c3a5',4);for(let i=0;i<49;i++)b+=P(`M${i*30} 640V706`,'none','#6f8978',2);
 b+=P('M619 669H820L864 697H584Z','#ceceb1')+P('M584 697H864v15H584Z','#899a83')+P('M659 651H799L820 669H637Z','#ded6b5')+P('M732 648V368','none','#d8d8be',5)+P('M735 373Q771 388 803 372L799 416Q766 429 735 414Z','#a65f4c');
 b+=P('M670 940H1030M320 839H505','none','#d6d7b670',2)+P('M732 711L438 920 462 922Z','#576f5f44');
 if(sealed){b+=P('M0 780L1440 740V1000H0Z','#577c72');for(let i=0;i<49;i++)b+=P(`M${i*31} ${780-i*.8}V1000`,'none','#96ab9666',2);b+=P('M0 777L1440 737','none','#d2d2b6',7)+P('M565 844L873 835 873 930 565 939Z','#dcd7b7')+'<text x="720" y="881" text-anchor="middle" font-family="serif" font-size="19" fill="#526f60" letter-spacing="3">王月恒铭操场</text><text x="720" y="911" text-anchor="middle" font-family="serif" font-size="14" fill="#788575" letter-spacing="5">改造期间 · 暂停开放</text>';}
 else b+=grass(50,974,1.6)+grass(1360,979,1.8);return b;}
frame('field',field());frame('sealed',field(true));

// Upper basketball court: green playing surface, red platform, a hillside of arched windows.
a=hills()+block(655,244,1.2)+block(-80,346,.92)+tree(1345,710,1.6)+tree(95,708,1.22);
a+=paving(700)+P('M78 963L443 717H1120L1373 963Z','#699389')+P('M141 949L457 739H1102L1319 949Z','none','#d8d8b8',3)+P('M730 738L738 949','none','#d8d8b8',2)+E(733,832,101,36,'none').replace('/>',' stroke="#d8d8b8" stroke-width="2"/>');
a+=P('M300 951L482 806 568 806 423 951M1090 951L970 806 1053 806 1203 951','none','#d8d8b8',2)+P('M465 717V570','none','#54756b',6)+P('M417 545H514V605H417Z','#e0dfc0','#9ba890',3)+P('M447 569h37v27h-37Z','none','#967b60',2)+E(464,606,25,7,'none').replace('/>',' stroke="#ad8260" stroke-width="3"/>');
a+=P('M560 686H1040L1081 717H522Z','#ad7f65')+P('M522 717H1081v18H522Z','#8c6d58')+rail(554,623,490,1)+tree(-62,925,2)+tree(1470,937,1.8);frame('small',a);

// A separate camera on the opposite roof terrace. The original frontal view is untouched.
a=R(0,0,1440,1000,'url(#night)')+E(1150,183,480,340,'url(#light)');for(let i=0;i<55;i++)a+=C(70+(i*157)%1320,45+(i*71)%345,i%4===0?1.7:.8,'#ece2be99');
for(let i=0;i<20;i++){let x=i*81,h=110+(i*37)%150;a+=R(x,548-h,63,h,'#6b929188');for(let j=0;j<5;j++)a+=P(`M${x+8} ${555-h+j*22}h44`,'none','#c7ccb740',2);}
a+=P('M0 620L680 470 1440 604V1000H0Z','url(#floor)')+P('M322 548L885 459 1237 591 690 684Z','#b8c5b2')+P('M322 548V815L690 987V684Z','#94ab9d')+P('M690 684L1237 591V884L690 987Z','#648c82');
a+=P('M410 503L746 460 983 539 656 592Z','#e0debf')+P('M410 503V608L656 699V592Z','#b4c4af')+P('M656 592L983 539V639L656 699Z','#849f92');
a+=P('M423 501C402 326 503 196 663 192C824 190 951 332 965 534L656 584Z','#d1d4bd','#e0e0c6',3);
a+=P('M423 501Q564 546 656 584Q819 561 965 534','none','#6f9288',7);
for(let i=0;i<9;i++)a+=P(`M${441+i*62} ${507+i*3}Q${495+i*46} ${257-i%2*30} 663 192`,'none','#a4b9a7',2);
a+=P('M635 195Q780 254 839 555L867 550Q811 263 666 192Z','#4e7470')+P('M635 195Q780 254 839 555','none','#e4dfbe',4);
a+=arches(482,636,66,100)+arches(570,674,58,93)+P('M343 817L670 971M1271 717L1396 741','none','#dae0c6',5)+rail(948,756,420,.95);
a+=P('M0 1000L206 757 516 823 817 1000Z','#afbea6')+P('M0 941L209 725 521 787','none','#d8ddc2',10);for(let i=0;i<7;i++)a+=P(`M${34+i*67} ${928-i*19}v80`,'none','#b5c6ad',9);
a+=tree(1397,1031,1.7)+P('M92 953L132 957 172 920 130 918Z','#d8d8bc')+P('M138 922L150 896','none','#556f61',2);frame('observatory-reverse',a);

function classroom(night=false,close=false){let b=R(0,0,1440,1000,night?'#8c9e8b':'#d6dac2')+P('M0 0H1440L1110 242H362Z',night?'#b3b69b':'#ebe5cd')+P('M0 0L362 242V704L0 1000Z','#acbeb0')+P('M362 242H1440V704H362Z',night?'#9eaa91':'url(#wall)');
 b+=P('M0 77L362 270M0 134L362 304','none','#849f9144',3)+R(504,316,712,262,'#a99169',4)+R(516,327,689,238,'#2f514b',2)+P('M532 556H1205','none','#d0c5a0',5)+P('M594 377h189M601 407h286M598 438h169','none','#b8cab022',2)+C(1291,299,28,'#e5dfbf')+P('M1291 277v23l14 9','none','#748b77',2);
 // Windows are on the left wall, with receding perspective and garden outside.
 for(let i=0;i<3;i++){let x=20+i*104,top=185+i*43,bot=721-i*39,w=87;let win=`M${x} ${top}L${x+w} ${top+37}V${bot-31}L${x} ${bot}Z`;b+=P(win,night?'url(#night)':'#b9d0b4','#e4e1c8',8)+P(`M${x+w/2} ${top+18}V${bot-16}M${x} ${(top+bot)/2}l${w} 3`,'none','#e6e5cb',5)+P(`M${x+6} ${top+5}Q${x+25} ${top+160} ${x+9} ${bot-15}L${x-1} ${bot}V${top}Z`,'#e8e5cda6');}
 b+=P('M0 1000L362 704H1440V1000Z','url(#floor)');for(let i=0;i<9;i++)b+=P(`M${360+i*150} 705L${-160+i*212} 1000`,'none','#cad2bb44',1.2);for(let i=0;i<6;i++)b+=P(`M${355-i*65} ${705+i*i*12}H1440`,'none','#cad2bb44',1.2);
 b+=P('M28 692L98 669 612 864 444 930ZM140 650L207 627 848 805 702 845ZM250 609L314 586 1035 752 923 782Z',night?'#c9d5c419':'#fff0bf55');
 b+=R(1132,598,173,29,'#b9a27a')+P('M1145 627v86M1283 627v86','none','#6f8777',7);b+=G(401,676,.6,tree(0,0,.38))+P('M383 665h40l-6 40h-27Z','#b38c68');
 if(close){b+=desk(915,693,1.1)+desk(1180,706,1.2);b+=P('M-80 901L1003 753 1500 916 412 1132Z','url(#wood)','#b29a70',3)+P('M-64 904L419 1117M0 909L465 1102M125 896L602 1084M262 877L751 1064M429 852L935 1041','none','#91795433',2)+P('M1098 853L1257 888 1224 918 1055 883Z','#e2d4ad')+P('M1117 880L1249 903','none','#667e6e',3);}
 else {for(let row=0;row<3;row++)for(let c=0;c<4;c++)b+=desk(430+c*241-row*62,675+row*103,.78+row*.24);}
 for(let i=0;i<3;i++)b+=P(`M${576+i*289} 104v57`,'none','#8fa38f',2)+P(`M${532+i*289} 161h100l13 13H520Z`,night?'#f1e2ad':'#dadcc6');
 if(night)b+=E(900,500,670,450,'url(#light)');else b+=E(20,440,740,540,'url(#light)');return b;}
frame('classroom',classroom());frame('night',classroom(true));frame('desk',classroom(false,true));

// Home has its own quiet room instead of the school blackboard and rows of desks.
a=R(0,0,1440,1000,'#d4d6bc')+P('M0 0H1440L1150 150H0Z','#e5dfc5')+R(77,130,581,520,'#7d9b8b')+R(93,145,547,484,'#c6d4b6');
a+=P('M93 459Q216 326 336 432Q460 319 641 404V629H93Z','#7f9e86')+tree(193,684,1.25,true)+P('M364 145V629M93 360H640','none','#e4e3c7',12)+P('M70 124Q191 245 110 637L55 656V124Z','#ede4c6d9')+P('M667 124Q574 245 625 637L686 656V124Z','#e2dec1cc');
a+=R(987,205,350,409,'#b0b899')+R(1005,224,314,371,'#8c9b81');for(let r=0;r<3;r++){a+=R(994,319+r*98,330,9,'#d4c7a4');for(let j=0;j<8;j++)a+=R(1022+j*34,249+r*98,18+(j%3)*4,67,['#b5bf9a','#a37c63','#d7c79d','#708d7a'][j%4]);}
a+=P('M0 797L1026 648 1440 783V1000H0Z','url(#wood)')+P('M0 821L1440 1000M286 752L1440 943','none','#b1936933',2)+P('M581 569L905 574 935 776 563 769Z','#45685f','#a4b59e',5)+P('M594 583L890 587 914 752 580 747Z','#acc7ad')+P('M563 769L935 776 1007 842 498 830Z','#a2b3a0');
for(let i=0;i<6;i++){let x=617+i%3*84,y=615+Math.floor(i/3)*63;a+=R(x,y,67,50,['#789d86','#b7c5a6','#d4cda7'][i%3],3)+C(x+33,y+17,7,'#e6dcc1')+P(`M${x+17} ${y+44}q0-22 16-21q17 0 17 21Z`,'#758d78');}
a+=P('M140 823L379 790 502 846 264 889Z','#efdfbc')+P('M160 825L281 853M208 814L323 842M258 808L372 831','none','#b6ad88',2)+P('M366 851L455 882','none','#557b6b',5)+P('M1094 769h105l-12 100h-82Z','#d8d4b1')+P('M1198 787q60-12 43 40q-11 22-49 15','none','#d8d4b1',11)+tree(1173,713,.43)+P('M1146 704h56l-10 57h-36Z','#af8e69')+E(330,460,710,610,'url(#light)');frame('home',a);

// The hand-painted student is an independently generated transparent WebP.
// Rebuilding campus SVGs must never replace that portrait.
console.log('Rebuilt nine revised campus scenes and reverse observatory.');
