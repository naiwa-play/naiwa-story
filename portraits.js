// User-selected artwork. Framing is explicit: never stretch cropped heads to full-body size.
export const portraits={
 normal:{label:'正面',frame:'full'},back:{label:'背面',frame:'full'},
 daily1:{label:'日常 · 站立',frame:'half'},daily2:{label:'日常 · 招呼',frame:'full'},daily3:{label:'日常 · 握拳',frame:'half'},
 happy:{label:'开心',frame:'head'},sad:{label:'委屈',frame:'head'},sideeye:{label:'斜眼',frame:'head'},tongue:{label:'吐舌头',frame:'head'},
 peace1:{label:'比耶',frame:'half'},peace2:{label:'双手比耶',frame:'half'},arms:{label:'叉腰 / 抱臂',frame:'half'},angry:{label:'愤怒',frame:'half'},
 rest:{label:'趴着',frame:'wide'},flowers:{label:'手捧鲜花',frame:'full'},angel:{label:'天使',frame:'full'},hero:{label:'侠客',frame:'half'},
 boss:{label:'霸总',frame:'full'},unhappy:{label:'不高兴',frame:'full'},shocked:{label:'吃惊',frame:'half'},laughing:{label:'大笑',frame:'full'},hush:{label:'噤声',frame:'half'},glance:{label:'惊鸿一瞥',frame:'full'},nose:{label:'抠鼻',frame:'full'},crying:{label:'哭泣',frame:'head'},eager:{label:'期待',frame:'head'},disappointed:{label:'失望',frame:'full'},thinking:{label:'思考',frame:'half'},warrior:{label:'战士',frame:'full'},formal:{label:'正装',frame:'half'},dress:{label:'JK装',frame:'full'}
};
for(const [id,p] of Object.entries(portraits))p.src='./assets/portraits/'+id+'.webp';
export const scenePortraits={arrival:'normal',hello:'arms',question:'normal',answer:'happy',umbrella:'normal',kind:'happy',letter:'normal',snack:'tongue',home:'normal',wish:'normal',stay:'happy',lamp:'normal',walk:'back',trip:'daily2',food:'tongue',laugh:'happy'};
export function portraitFor(node){return portraits[scenePortraits[node]]||null;}
export function completePortraits(story){for(const id of Object.keys(story))scenePortraits[id]??='normal';}
// Deliberate dialogue cues, rather than a random emotion per page.
Object.assign(scenePortraits,{
 departure_1:'nose',departure_4:'eager',coast_2:'thinking',lighthouse_2:'unhappy',station_2:'shocked',whale_1:'disappointed',wish_rain_1:'happy',forest_home_1:'crying',root_archive_1:'thinking',island_tomorrow_1:'laughing',
 beach_start_1:'boss',beach_start_3:'glance',crab_castle_3:'laughing',sea_photo_1:'glance',sunset_post_1:'disappointed',rain_orchestra_1:'thinking',
 dream_entry_2:'glance',dream_entry_4:'hush',ship_start_1:'shocked',ship_dinner_2:'glance',ship_pipe_1:'thinking',ship_valve_1:'thinking',wood_pavilion_1:'thinking',wood_silence_1:'hush',wood_stream_2:'glance',wood_memory_1:'laughing',hospital_start_1:'unhappy',hospital_archive_1:'thinking',hospital_courtyard_1:'shocked',hospital_signature_1:'crying',opera_start_1:'thinking',opera_lights_1:'hush',opera_audience_1:'glance',opera_script_1:'unhappy',opera_script_2:'laughing'
});
export function endingMood(id,ending){
 if(ending.theme)return {theme:ending.theme,tone:ending.chapter==='iceland'?'tender':'dawn',portrait:portraits[ending.celebration?'laughing':'glance']};
 const mainThemes={main_lights:'stars',main_bridge:'tide',main_shift:'rays',main_morning:'aurora',main_reunion:'fireflies',main_homeward:'rays'};
 if(mainThemes[id])return {theme:mainThemes[id],tone:id==='main_morning'?'dawn':id==='main_homeward'?'tender':'joy',portrait:portraits[id==='main_morning'?'glance':id==='main_homeward'?'eager':'laughing']};
 const theme=ending.chapter==='nightmares'?(id.startsWith('opera_')?'curtain':ending.note.includes('困局')?'dream':id.startsWith('ship_')?'tide':id.startsWith('wood_')?'fireflies':'aurora'):ending.chapter==='beach'||/harbor|compass|silver|tide_|shared_lantern/.test(id)?'tide':ending.chapter==='forest'||/forest_|root_|island_|season_map/.test(id)?'fireflies':ending.chapter==='balloon'||/train|station|wish_|whale|horizon|cloud_post/.test(id)?'stars':'rays';
 if(ending.note.includes('困局'))return {theme,tone:'dream',portrait:portraits.disappointed};
 if(['forest_home','sea_photo','sunset_post','last_train','whale_keeper'].includes(id))return {theme,tone:'tender',portrait:portraits.eager};
 if(ending.chapter==='nightmares')return {theme,tone:'dawn',portrait:portraits.glance};
 return {theme,tone:'joy',portrait:portraits.laughing};
}
