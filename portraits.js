// User-selected artwork. Framing is explicit: never stretch cropped heads to full-body size.
export const portraits={
 normal:{label:'正面',frame:'full'},back:{label:'背面',frame:'full'},
 daily1:{label:'日常 · 站立',frame:'half'},daily2:{label:'日常 · 招呼',frame:'full'},daily3:{label:'日常 · 握拳',frame:'half'},
 happy:{label:'开心',frame:'head'},sad:{label:'委屈',frame:'head'},sideeye:{label:'斜眼',frame:'head'},tongue:{label:'吐舌头',frame:'head'},
 peace1:{label:'比耶',frame:'half'},peace2:{label:'双手比耶',frame:'half'},arms:{label:'叉腰 / 抱臂',frame:'half'},angry:{label:'愤怒',frame:'half'},
 rest:{label:'趴着',frame:'wide'},flowers:{label:'手捧鲜花',frame:'full'},angel:{label:'天使',frame:'full'},hero:{label:'侠客',frame:'half'}
};
for(const [id,p] of Object.entries(portraits))p.src='./assets/portraits/'+id+'.webp';
export const scenePortraits={arrival:'normal',hello:'arms',question:'normal',answer:'happy',umbrella:'normal',kind:'happy',letter:'normal',snack:'tongue',home:'normal',wish:'normal',stay:'happy',lamp:'normal',walk:'back',trip:'daily2',food:'tongue',laugh:'happy'};
export function portraitFor(node){return portraits[scenePortraits[node]]||null;}
