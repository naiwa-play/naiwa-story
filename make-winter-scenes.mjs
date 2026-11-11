import fs from 'node:fs';

const dir = new URL('./assets/winter/', import.meta.url);
fs.mkdirSync(dir, {recursive:true});
const row = (n, draw) => Array.from({length:n}, (_, i) => draw(i)).join('');
const tree = (x,y,s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round"><path d="M0 0Q12-128-7-295M4-93Q-30-141-62-176M1-151Q42-181 62-234M-4-202Q-33-227-45-270M28-176l36-18M-32-145l-43-5M46-204l-3-28M-5-244l19-30" stroke="#233749" stroke-width="8"/><path d="M-61-180q34 33 64 83M6-154q39-31 58-84M-46-272l30 57" stroke="#abc0c6" opacity=".45" stroke-width="3"/></g>`;
const skyline = `<path d="M0 383V271h130v-36h107v74h100V198h156v43h80v110h95V244h111v-42h169v108h113V261h94v-37h115v110h130v313H0Z" fill="#334b61"/><path d="M0 438V357h193v-41h214v72h125v-61h175v56h124v-55h205v80h89v-52h315v229H0Z" fill="#405a6e"/>`+
 row(20,i=>`<path d="M${22+i*73} ${368+(i%3)*21}h20v26h-20Z" fill="${i%5===0?'#ad9b86':'#88a3ab'}" opacity=".38"/>`);
const wall = `<path d="M0 458Q340 442 650 482L1110 547v124H0Z" fill="#3b4c5c"/><path d="M0 459Q342 440 650 479L1110 542v13L650 493Q342 455 0 475Z" fill="#b3c2c7"/><path d="M0 503Q310 487 655 515l455 63M0 543q310-21 649 11l460 57M0 586q300-25 642 7l463 51" stroke="#778b96" opacity=".35" fill="none" stroke-width="2"/>`+
 row(12,i=>`<path d="M${i*88} ${475+i*5}v137h-7V${475+i*5}Z" fill="#2d4353" opacity=".55"/>`);
const ground = `<path d="M0 595Q480 535 807 582T1440 637V860H0Z" fill="#90a4af"/><path d="M0 692Q380 606 779 625T1440 726v134H0Z" fill="#536a7e"/><path d="M0 718Q410 626 795 649T1440 747" fill="none" stroke="#c0ced2" stroke-opacity=".7" stroke-width="8"/><path d="M0 798Q316 744 591 752T1054 823Q1210 844 1440 813v47H0Z" fill="#8c9da7"/><path d="M110 838q280-44 481-38m571-40 188 22" fill="none" stroke="#c0ced2" stroke-opacity=".5" stroke-width="3"/>`;
const lamp = `<ellipse cx="1000" cy="643" rx="151" ry="37" fill="url(#spill)"/><path d="M989 231h18l126 412H861Z" fill="url(#beam)"/><ellipse cx="998" cy="232" rx="120" ry="110" fill="url(#halo)"/><path d="M1064 636V272q0-53-44-53h-22" fill="none" stroke="#223341" stroke-width="10"/><path d="M982 218h34l9 12h-52Z" fill="#334754"/><path d="M978 230h42l-6 11h-30Z" fill="#d6b987"/><path d="M1049 641h31" stroke="#293c4a" stroke-width="8" stroke-linecap="round"/><path d="M864 588h115m-103 0v28m92-28v26m-106-48h116v15H862Z" stroke="#334a59" stroke-width="7" fill="none"/><path d="M864 562h113" stroke="#c0cbd0" stroke-width="5" stroke-linecap="round"/>`;
const gate = skyline + tree(225,575,1.4) + tree(620,530,.83) + wall + ground + lamp + tree(1375,667,1.65);
const shop = `<path d="M0 625h1440v235H0Z" fill="#727b7d"/><path d="M0 618h1440" stroke="#c4c5b0" stroke-width="6"/><path d="M110 92h500v520H110Z" fill="#4d626c"/><path d="M131 117h458v470H131Z" fill="#607b91"/><path d="M132 495q141-85 260-30l196 49v73H131Z" fill="#9aafb6"/><path d="M354 117v470M131 348h458" stroke="#344c5b" stroke-width="10"/><path d="M704 112h630v410H704Z" fill="#6d827d"/><path d="M710 288h615m-615 137h615" stroke="#425b5e" stroke-width="10"/>`+
 row(15,i=>`<rect x="${723+i*39}" y="${233-(i%3)*6}" width="21" height="${50+(i%3)*6}" rx="4" fill="${['#a9a18d','#82989a','#b9b49e'][i%3]}"/>`)+
 `<path d="M668 508h697v135H668Z" fill="#455b62"/><path d="M642 492h750v28H642Z" fill="#a5aaa0"/><path d="M204 629h303l76 119H142Z" fill="#a6a394"/><path d="M174 745v104m375-104v104" stroke="#445a62" stroke-width="13"/><path d="M313 626h34l-5 44h-24Zm55 7h34l-5 44h-24Z" fill="#e3dbc2"/>`;
const stop = skyline+wall+ground+`<path d="M469 342h529v279H469Z" fill="#afc5c8" fill-opacity=".22" stroke="#9eafb9" stroke-width="5"/><path d="M448 331h570l38 19H412Z" fill="#a7b9be"/><path d="M475 347v281m518-281v281M699 350v278" stroke="#445c6e" stroke-width="10"/><path d="M521 565h449m-425 0v56m392-56v56" stroke="#657f8b" stroke-width="12"/><path d="M1085 340v293" stroke="#273e51" stroke-width="10"/><rect x="1047" y="310" width="77" height="65" rx="6" fill="#9eb3ba"/><path d="M1061 330h48m-48 16h32" stroke="#4a6579" stroke-width="5"/><path d="M469 330h535" stroke="#dae2e1" stroke-width="5"/>`;
const river = skyline+`<path d="M0 475q370-33 740 13t700 2v370H0Z" fill="#476377"/><path d="M0 605q370-52 776-4t664 0v259H0Z" fill="#728e9e"/>`+
 row(18,i=>`<path d="M${(i*131)%1410} ${507+(i*19)%145}h${30+i%5*24}" stroke="${i%5===0?'#bcb7a3':'#b4c8cd'}" opacity=".28" stroke-width="3"/>`)+
 `<path d="M0 717q641-99 1440-38v181H0Z" fill="#455b6e"/><path d="M0 716q641-102 1440-38" stroke="#b6c7cd" stroke-width="10" fill="none"/>`+
 row(12,i=>`<path d="M${i*132} ${664+((i-7)**2)*1.06}v86" stroke="#2e475a" stroke-width="7"/>`)+
 `<path d="M0 705q648-123 1440-37" fill="none" stroke="#8ca2af" stroke-width="9"/>`+tree(1360,790,1.5);
const defs = `<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#202f48"/><stop offset="1" stop-color="#788e9f"/></linearGradient><radialGradient id="halo"><stop stop-color="#e3ca9e" stop-opacity=".27"/><stop offset="1" stop-color="#e3ca9e" stop-opacity="0"/></radialGradient><radialGradient id="spill"><stop stop-color="#e4c9a0" stop-opacity=".29"/><stop offset="1" stop-color="#e4c9a0" stop-opacity="0"/></radialGradient><linearGradient id="beam" x2="0" y2="1"><stop stop-color="#e3cba4" stop-opacity=".18"/><stop offset="1" stop-color="#e3cba4" stop-opacity="0"/></linearGradient>`;
for(const [name, scene] of Object.entries({street:gate,shop,stop,river})){
 const sky = name === 'shop' ? '#687a7a' : 'url(#sky)';
 fs.writeFileSync(new URL(name+'.svg',dir),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 860"><defs>${defs}</defs><path d="M0 0h1440v860H0Z" fill="${sky}"/>${scene}</svg>\n`);
}

const windows = (x,y,columns,rows,spacing,ink) => row(columns*rows, i=>{
 const col=i%columns, level=Math.floor(i/columns);
 return `<rect x="${x+col*spacing}" y="${y+level*48}" width="${spacing*.44}" height="26" rx="1" fill="${(col+2*level)%4===0?'#c4ac9e':ink}" opacity="${.35+(i%3)*.15}"/>`;
});
const threshold = skyline + `
 <path d="M220 130h900v462H220Z" fill="#516880"/><path d="M220 132l82-62h818v80H220Z" fill="#475d76"/>
 <path d="M308 102h762v9H297Z" fill="#9baebb" opacity=".62"/><path d="M270 186h781m-781 58h781m-781 58h781" stroke="#91a6b8" stroke-width="3" opacity=".4"/>
 ${windows(336,158,12,4,56,'#829caf')}${tree(1370,630,1.52)}
 <path d="M0 635q600-104 1440 6v219H0Z" fill="#9bb2bf"/><path d="M399 860 682 553h175l176 307Z" fill="#61798a"/>
 <path d="M0 524 596 493v105L0 663Zm907-35 533 57v114l-533-84Z" fill="#3d5264"/>
 <path d="M0 523 596 491v11L0 537Zm907-36 533 59v12l-533-59Z" fill="#c4d0d6"/>
 <path d="M595 589V412h67v165m189-5V403h58v182M616 421h276v22H616Z" fill="#6f8591"/>
 <path d="M586 410h85v10h-85Zm257-8h74v10h-74Z" fill="#d0d9da"/>
 <path d="M485 768q270-56 542 1m-569 41q280-58 602 0" stroke="#c7d4d9" opacity=".64" fill="none" stroke-width="3"/>
 ` + tree(160,710,1.9);
const guardhouse = skyline + `
 <path d="M0 610q810-67 1440 50v200H0Z" fill="#a7b5c1"/><path d="M0 788q890-176 1440-72v144H0Z" fill="#68798b"/>
 <path d="M0 472 730 524v98L0 610Z" fill="#586577"/><path d="M0 472 730 522v12L0 485Z" fill="#b9c7cb"/>
 <path d="M762 364h442v287H762Z" fill="#5c6779"/><path d="M726 375l102-86h345l75 86Z" fill="#667b90"/><path d="M735 366l94-78h343l22 21H848l-70 60Z" fill="#c2cdd1"/>
 <rect x="797" y="407" width="211" height="138" rx="4" fill="#3b4b60"/><rect x="807" y="417" width="191" height="118" rx="2" fill="#ae9c8c"/><path d="M885 413v128m-82-66h195" stroke="#556578" stroke-width="6"/>
 <path d="M1041 646V407h108v239Z" fill="#415266"/><path d="M1064 427h62v67h-62Z" fill="#768899"/><path d="M1099 519h11" stroke="#b0afb0" stroke-width="4"/>
 <path d="M748 650h484v16H748Z" fill="#c4ccd0"/>
 <path d="M645 690q252-40 532 13" stroke="#b7a48f" stroke-opacity=".48" fill="none" stroke-width="9"/>
 ` + tree(440,642,1.25) + tree(1370,693,1.55);
const lastBus = skyline + `
 <path d="M0 580q486 50 1440-59v339H0Z" fill="#8499ac"/><path d="M0 698q572-10 1440-124v286H0Z" fill="#485c75"/>
 <path d="M0 671q594-12 1440-112" fill="none" stroke="#c0cbd6" stroke-width="7"/>
 <path d="M580 540q218-47 404 31" fill="none" stroke="#b290a2" stroke-width="8" opacity=".44"/>
 <path d="M718 435h298q54 3 73 43l24 66v80H712v-150q0-32 6-39Z" fill="#66738b"/>
 <path d="M738 457h243q52 4 80 75H731v-52Z" fill="#a59fb3"/><path d="M798 459v72m77-72v72m77-72v72" stroke="#545f76" stroke-width="8"/>
 <path d="M730 550h364v9H730Z" fill="#bdafb2"/><path d="M1051 573h37v15h-37Z" fill="#d0a6a6"/><path d="M1080 601h-20" stroke="#cbd1d9" stroke-width="3"/>
 <path d="M764 623h67m152 0h69" stroke="#293b51" stroke-width="32" stroke-linecap="round"/>
 <path d="M223 371h418v20H223Zm22 19h8v239h-8Zm350 0h8v218h-8Z" fill="#4d6175"/><path d="M220 365h420v10H220Z" fill="#becbd4"/>
 <path d="M241 635q255-24 388-12" fill="none" stroke="#d6dfe2" stroke-opacity=".58" stroke-width="3"/>
 ` + tree(1305,605,1.22);
const violetStreet = `
 <path d="M409 224q119-45 258-30t239-24q93-39 205-18m-514 89q172-24 274-14t220-38" fill="none" stroke="#d2b7d4" stroke-width="4" stroke-linecap="round" opacity=".31"/>
 <path d="M732 293q91-12 180-5t232-37" fill="none" stroke="#d8b7d0" stroke-width="2" opacity=".36"/>
 <path d="M0 443Q278 367 448 386t420-47q284-67 572 30v269H0Z" fill="#706889" opacity=".75"/>
 <path d="M0 513V352h252v-66h173v127h164v70h133v-78h158v57h137V351h270v48h153v240H0Z" fill="#4d506e"/>
 ${windows(80,386,6,2,48,'#9e9bb4')}${windows(1041,386,8,3,44,'#a4a1b8')}
 <path d="M0 619q409-116 800-23t640 17v247H0Z" fill="#adaec3"/>
 <path d="M0 739q278-98 648-64t792 113v72H0Z" fill="#646781"/>
 <path d="M0 755q280-100 650-67t790 108" fill="none" stroke="#d4cede" stroke-width="6"/>
 <path d="M991 617V276q0-43-42-43h-42" stroke="#35415a" fill="none" stroke-width="10"/>
 <ellipse cx="911" cy="240" rx="108" ry="88" fill="url(#halo)"/><path d="M890 231h45l12 10h-69Z" fill="#44475d"/><path d="M890 241h45l-10 9h-26Z" fill="#dec49b"/>
 <ellipse cx="912" cy="625" rx="153" ry="38" fill="url(#spill)"/>
 <path d="M1090 602v-71a24 24 0 0 1 24-24h55a24 24 0 0 1 24 24v71Z" fill="#74627b" stroke="#534d69" stroke-width="5"/>
 <path d="M1096 516q39-19 83-1" stroke="#d6cddd" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M1114 546h56m-28 55v50" stroke="#4b445d" stroke-width="7"/>
 <path d="M661 715q154-20 302 30m-276-10q111-13 215 23" fill="none" stroke="#d5cedb" stroke-width="3" opacity=".62"/>
 `+tree(1333,633,1.39)+tree(218,632,1.25);
const room = `
 <path d="M0 0h1440v860H0Z" fill="#454b60"/>
 <path d="M634 70h690v540H634Z" fill="#2c354d"/><path d="M650 84h656v507H650Z" fill="url(#sky)"/>
 <path d="M652 532V379h128v-38h128v86h90v-46h166v-51h139v259H652Z" fill="#5f667d"/>
 ${windows(684,413,11,2,55,'#9ba5b5')}
 <path d="M650 525q319-48 658-7v74H650Z" fill="#a4aabb"/>
 <path d="M960 88v502m-309-256h654" stroke="#3c455c" stroke-width="11"/>
 <path d="M618 590h733v27H618Z" fill="#697587"/><path d="M607 55h52v580h-52Zm695 0h40v580h-40Z" fill="#596278"/>
 <path d="M123 639h973l153 119H0Z" fill="#606377"/><path d="M0 757h1246v103H0Z" fill="#343c51"/>
 <path d="M701 668l156-14 61 43-158 21Z" fill="#adaeb2"/><path d="M778 658l53 52m-81-35 36-4" stroke="#6e7184" fill="none" stroke-width="2"/>
 <ellipse cx="984" cy="670" rx="138" ry="32" fill="url(#spill)"/>
 <path d="M1081 669V548q0-31-31-31h-30" fill="none" stroke="#41475e" stroke-width="8"/><path d="M995 514h42l17 33h-78Z" fill="#b3a691"/>
 <ellipse cx="1018" cy="549" rx="77" ry="56" fill="url(#halo)"/><path d="M978 547h76" stroke="#e5caa1" stroke-width="5"/>
 <path d="M523 270h58v367h-58Z" fill="#3b4359"/>
 `;
const frostStreet = `
 <path d="M0 409V297h227v-35h224v120h154v50h222v-89h283v61h330v239H0Z" fill="#3a5066"/>
 <path d="M0 466q490 67 1440-34v154H0Z" fill="#536a7b"/><path d="M0 471q490 67 1440-34" stroke="#96aebb" stroke-width="9" fill="none"/>
 <path d="M0 588q395-54 1440-21v293H0Z" fill="#8099aa"/><path d="M0 749q659-139 1440-62v173H0Z" fill="#526b7e"/>
 <path d="M0 730q659-143 1440-63" fill="none" stroke="#b3c6ce" stroke-width="8"/>
 <path d="M759 384h374v206H759Z" fill="#8ea7ba" fill-opacity=".26" stroke="#859caf" stroke-width="4"/><path d="M732 380h412v15H719Z" fill="#8199ac"/>
 <path d="M761 398v202m369-201v201m-183-199v200" stroke="#3f556b" stroke-width="8"/>
 <path d="M793 543h275m-250 0v42m228-42v42" stroke="#657e90" stroke-width="9"/>
 <path d="M1045 584V332h-72" stroke="#3e556b" stroke-width="8" fill="none"/><ellipse cx="971" cy="335" rx="100" ry="70" fill="url(#iceLamp)"/>
 <path d="M952 331h38l-7 8h-23Z" fill="#bdcdd9"/>
 <path d="M110 673q200-31 381-35m-380 67q228-27 352-25m603 86 294 16" fill="none" stroke="#bed0da" stroke-width="3" opacity=".42"/>
 `+tree(115,659,1.55)+tree(1360,660,1.72);
const additional = {
 gate:[threshold,'#243650','#8396aa'],
 return:[guardhouse,'#2b3a56','#8695a8'],
 letter:[lastBus,'#363d5c','#9594aa'],
 post:[violetStreet,'#45365f','#bca0c0'],
 room:[room,'#393c5c','#969bb2'],
 cold:[frostStreet,'#14283e','#6f879d']
};
for(const [name,[scene,top,bottom]] of Object.entries(additional)){
 const sceneDefs=defs.replace('#202f48',top).replace('#788e9f',bottom)+
  '<radialGradient id="iceLamp"><stop stop-color="#c3d3dc" stop-opacity=".27"/><stop offset="1" stop-color="#c3d3dc" stop-opacity="0"/></radialGradient>';
 fs.writeFileSync(new URL(name+'.svg',dir),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 860"><defs>${sceneDefs}</defs><path d="M0 0h1440v860H0Z" fill="url(#sky)"/>${scene}</svg>\n`);
}
