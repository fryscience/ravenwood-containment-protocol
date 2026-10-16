/* RAVENWOOD: THE LAST MISSION | core.js
   Namespace, utilities, science content, game state, derived logic,
   simulations (all values are fictional simulation units), save and backup. */
(function(){
'use strict';
var Z=window.Z=window.Z||{};
Z.APP_ID='ravenwood-last-mission-z03';Z.APP_VERSION=1;
Z.KEY='ravenwood.lastmission.z03.v1';Z.PREFS_KEY='ravenwood.lastmission.prefs.v1';

/* ---------- utils ---------- */
Z.$=function(s,r){return (r||document).querySelector(s);};
Z.$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
Z.esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
Z.isObj=function(o){return !!o&&typeof o==='object'&&!Array.isArray(o);};
Z.int=function(v,d,lo,hi){v=parseInt(v,10);if(isNaN(v))return d;return Math.max(lo,Math.min(hi,v));};
Z.num=function(v,d,lo,hi){v=parseFloat(v);if(isNaN(v)||!isFinite(v))return d;return Math.max(lo,Math.min(hi,v));};
Z.reduced=function(){return document.documentElement.classList.contains('reduce')||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);};
Z.announce=function(msg){var l=Z.$('#live');if(!l)return;l.textContent='';setTimeout(function(){l.textContent=msg;},30);};
var nt=null;
Z.notice=function(msg,kind){var n=Z.$('#notice');if(!n)return;n.textContent=msg;n.className=kind==='warn'?'warn':'';n.hidden=false;Z.announce(msg);clearTimeout(nt);nt=setTimeout(function(){n.hidden=true;},6000);};
Z.words=function(t){return (String(t).trim().match(/[A-Za-z][A-Za-z'+-]*/g)||[]);};

/* ---------- items (every item has a purpose) ---------- */
Z.CATS=[['tools','Tools'],['access','Access items'],['evidence','Evidence'],['records','Scientific records']];
Z.ITEMS={
 flashlight:{cat:'tools',name:'Flashlight',desc:'Your investigator flashlight. It lights the way ahead and makes dark rooms readable.',use:'Always on. Walk in a direction to aim it.',start:true},
 access_card:{cat:'access',name:'Damaged access card',desc:'A cracked Security Wing card. The strip is scratched but may still read.',use:'Use it at the card reader beside the sealed door in the Security Lobby.'},
 power_cell:{cat:'access',name:'Backup power cell',desc:'A small emergency cell from a security desk. It still holds a charge.',use:'Insert it into the surveillance console in the Surveillance Office.'},
 fuse:{cat:'access',name:'Replacement fuse',desc:'A heavy-duty fuse from a laboratory drawer.',use:'Install it in the breaker panel in the Cellular Energy Lab.'},
 valve:{cat:'tools',name:'Valve handle',desc:'A steel handle for a pressure valve.',use:'Turn the pressure valve beside the sealed door in the Respiratory Wing.'},
 chip:{cat:'access',name:'Calibration chip',desc:'A sensor calibration chip for the oxygen monitor.',use:'Insert it into the oxygen monitoring station.'},
 keycard5:{cat:'access',name:'Level 5 keycard',desc:'A restricted keycard for the Underground Research Wing.',use:'Swipe it at the classified research terminal.'},
 rec1:{cat:'records',name:'Nerve recording A',desc:'A nerve-response recording labeled "Hot vent contact".',use:'Load it into the signal-routing console in the Neurobiology Laboratory.',text:'RECORDING A: Hand contacts a hot surface. The arm pulls away in about 0.3 seconds. The head does not turn.'},
 rec2:{cat:'records',name:'Nerve recording B',desc:'A nerve-response recording labeled "Corridor noise".',use:'Load it into the signal-routing console.',text:'RECORDING B: A metal cart rolls by. About two seconds later the head turns toward the corridor.'},
 rec3:{cat:'records',name:'Nerve recording C',desc:'A nerve-response recording labeled "Obstacle test".',use:'Load it into the signal-routing console.',text:'RECORDING C: A cart blocks the path. The subject walks into it, stops, and pushes. The path does not change.'},
 rec_pump:{cat:'records',name:'Circulation pump log',desc:'Printout of the Support Rig ZR-7 circulation pump log.',use:'Compare it with other records on the classified terminal.',text:'PUMP LOG: ON 02:17:00. REDUCED 02:18:30. OFF 02:18:50. RESTORED 02:19:30. Flow values appear on the terminal.'},
 rec_o2:{cat:'records',name:'Oxygen delivery record',desc:'A record of oxygen delivered through the rig line.',use:'Compare it with other records on the classified terminal.',text:'OXYGEN RECORD: Delivery in simulation units per time slot. The terminal shows each value.'},
 rec_nut:{cat:'records',name:'Nutrient delivery log',desc:'A log of glucose delivered through the rig line.',use:'Compare it with other records on the classified terminal.',text:'NUTRIENT LOG: Glucose delivery in simulation units per time slot. The terminal shows each value.'},
 rec_cam:{cat:'records',name:'Camera timestamp index',desc:'An index of camera timestamps and which ones made the highlight reel.',use:'Compare it with other records on the classified terminal.',text:'CAMERA INDEX: Movement bursts and highlight-reel inclusion per time slot. The terminal shows each entry.'},
 doc_log:{cat:'records',name:'Security shift log',desc:'A torn shift log from the Security Lobby desk.',use:'Read it for background on the breach.',text:'SHIFT LOG, 02:10 AM: Perimeter sensors normal. 02:17 AM: Containment Door 3 alarm. Cause unknown. Footage review requested. NOTE: Do not release unedited footage to executive staff.'},
 doc_metab:{cat:'records',name:'Classified metabolic report',desc:'A report recovered from the locked cabinet in the Cellular Energy Lab.',use:'Read it. It summarizes the ATP model results.',text:'METABOLIC REPORT (summary): Stored ATP in muscle cells is a small short-term buffer. Sustained movement requires ATP to be regenerated continuously. Activity pauses allow regeneration. All values in the model are fictional simulation units.'},
 doc_neuro:{cat:'records',name:'Restricted neurological record',desc:'A restricted record from the Neurobiology Laboratory.',use:'Read it. It summarizes the neural findings.',text:'NEUROLOGICAL RECORD (summary): Spinal reflex arcs can operate without the brain. Reflexes and simple responses do not demonstrate awareness or coordinated brain control.'},
 doc_memo:{cat:'records',name:'Support rig memo',desc:'The classified memo about Support Rig ZR-7.',use:'Read it. It explains the hidden experiment.',text:'MEMO RBRT-ZR7: Subject Z-03 was connected to Support Rig ZR-7 (circulation pump, oxygenator and nutrient line) during containment testing. The pump log must not be released with the footage.'}
};

/* ---------- puzzle science content (all values fictional simulation units) ---------- */
Z.T1=[
 {id:'t1',time:'02:17:04',src:'CAMERA C-4',kind:'Frame description',text:'Z-03 stands upright beside Containment Door 3. The door panel is open about 30 cm.',ans:'obs',why:'A camera recorded what is visible. Nothing is concluded from it yet.'},
 {id:'t2',time:'02:17:31 to 02:20:30',src:'MOTION SENSOR M-2',kind:'Motion reading',text:'Five separate movement bursts are logged. Burst lengths: 8 s, 11 s, 3 s, 9 s and 7 s. The sensor shows stillness of at least 20 s between bursts. (Motion index values are simulation units.)',ans:'obs',ev:'e_bursts',why:'A sensor measured this directly. The pattern of bursts with stillness between them is an important clue.'},
 {id:'t3',time:'02:18:02',src:'STAFF NOTE: Exec. Voss',kind:'Staff note',text:'"Z-03 no longer needs oxygen or energy. The virus has overcome every biological limit."',ans:'uns',ev:'e_c1',why:'No camera frame or sensor measures oxygen use or energy use. "No longer needs" and "every limit" go far beyond any record.'},
 {id:'t4',time:'02:18:21',src:'CAMERA C-4',kind:'Frame description',text:'A metal cart rolls past in the corridor at 02:18:19. Z-03 turns its head toward the corridor at 02:18:21.',ans:'obs',ev:'e_sound',why:'Both events were recorded with timestamps. Whether one caused the other is a separate question.'},
 {id:'t5',time:'02:18:40',src:'ANALYST NOTE: Dr. Imani',kind:'Analyst note',text:'"The head turn may be a response to the cart noise, because it followed the sound by about two seconds."',ans:'inf',why:'This is a reasonable conclusion built on recorded observations, with careful words ("may be"). It can be tested, so it is an inference.'},
 {id:'t6',time:'02:19:41',src:'CAMERA C-4',kind:'Frame description',text:'Z-03 lies still on the floor from 02:18:50 until 02:19:40. A limb twitch at 02:19:41 is followed by movement resuming.',ans:'obs',ev:'e_rest',why:'The camera recorded a long still period and then movement resuming. You will test what explains it.'},
 {id:'t7',time:'02:20:05',src:'STAFF NOTE: Exec. Voss',kind:'Staff note',text:'"Z-03 recovers instantly from anything and can never be stopped."',ans:'uns',why:'The footage shows a recovery that took tens of seconds, not an instant one, and no record shows that Z-03 "can never be stopped".'},
 {id:'t8',time:'02:20:30',src:'ANALYST NOTE: Dr. Imani',kind:'Analyst note',text:'"Because Z-03 rested before moving again, its activity may depend on recovery periods."',ans:'inf',why:'This links an observation (rest, then movement) to a possible explanation. It is testable, which makes it an inference.'}
];
Z.CLS={obs:'Observation',inf:'Inference',uns:'Unsupported claim'};
Z.CLS_FB={
 obs_inf:'This was recorded directly by a camera or sensor, so it is an observation. Nothing has been concluded from it yet.',
 obs_uns:'A camera or sensor recorded this, so it is not unsupported. It is an observation.',
 inf_obs:'Look for words like "may" and "because". Those mark a conclusion drawn from observations. It is not something a camera or sensor recorded.',
 inf_uns:'This conclusion is tied to recorded observations and it can be tested. That makes it an inference, not an unsupported claim.',
 uns_obs:'Nobody measured this. No camera frame or sensor reading shows it.',
 uns_inf:'An inference must be built from recorded observations. This claim goes beyond every record (watch for words like "never", "instantly" and "no longer needs").'
};
Z.EVID={
 e_bursts:{ph:1,t:'Five bursts, then stillness',d:'The motion sensor logged five bursts (3 to 11 s each) with at least 20 s of stillness between them.',claim:false},
 e_rest:{ph:1,t:'A long rest before movement resumed',d:'Z-03 lay still from 02:18:50 to 02:19:40, then movement resumed.',claim:false},
 e_sound:{ph:1,t:'Head turn about 2 s after a noise',d:'A cart rolled past at 02:18:19 and Z-03 turned its head at 02:18:21.',claim:false},
 e_c1:{ph:1,t:'Rejected claim: "needs no oxygen or energy"',d:'Exec. Voss said Z-03 needs no oxygen or energy. No record measures this, so it is an unsupported claim.',claim:true},
 e_regen:{ph:2,t:'Bursts work when ATP can regenerate',d:'In the model, repeating bursts stayed sustainable when rest time let ATP regenerate between bursts.',claim:false},
 e_deficit:{ph:2,t:'Nonstop activity outruns ATP supply',d:'When rest was removed, demand outran regeneration and the stored ATP ran out in seconds (simulation units).',claim:false},
 e_glyc:{ph:3,t:'Glycolysis can make ATP without oxygen, briefly',d:'Glycolysis nets a small amount of ATP without oxygen. Fermentation regenerates NAD+ so glycolysis can continue, but fermentation itself does not make ATP.',claim:false},
 e_o2gap:{ph:3,t:'Oxygen-free supply fell short of demand',d:'With severely limited oxygen, supply stayed far below the movement demand and the stored buffer lasted only seconds (simulation units).',claim:false},
 e_c3:{ph:3,t:'Rejected claim: "moved without oxygen" for minutes',d:'The model shows only brief movement is possible without oxygen, so sustained movement is inconsistent with that claim.',claim:true},
 e_reflex:{ph:4,t:'The withdrawal fits a spinal reflex',d:'Pulling away from the hot vent needs only a receptor, sensory neuron, spinal cord circuit, motor neuron and muscle. No brain integration is required.',claim:false},
 e_nocoord:{ph:4,t:'Z-03 collided with the cart',d:'Z-03 walked into the cart instead of steering around it, so the footage does not show coordinated, brain-guided avoidance.',claim:false},
 e_c4:{ph:4,t:'Rejected claim: "aware" or "normal brain function"',d:'Reflexes and simple responses do not prove awareness or normal brain function.',claim:true},
 e_pump:{ph:5,t:'Movement matched pump delivery',d:'Every large burst happened while the circulation pump was delivering oxygen and nutrients.',claim:false},
 e_off:{ph:5,t:'No movement while the pump was off',d:'From 02:18:50 to 02:19:40 delivery was zero and Z-03 did not move. Movement resumed after delivery was restored.',claim:false},
 e_edit:{ph:5,t:'The highlight reel left out the pump-off section',d:'Ravenwood\'s highlight reel omitted the two time slots when the pump was reduced or off.',claim:false},
 e_c5:{ph:5,t:'Rejected claim: "biologically immortal" or "restored"',d:'Support can keep some living tissue working. It cannot automatically restore irreversibly dead cells.',claim:true}
};
Z.EVID_ORDER=['e_bursts','e_rest','e_sound','e_c1','e_regen','e_deficit','e_glyc','e_o2gap','e_c3','e_reflex','e_nocoord','e_c4','e_pump','e_off','e_edit','e_c5'];
Z.CONCEPTS={
 c_obs:{t:'Observation, inference and unsupported claim',d:'Observations are recorded. Inferences are reasoned from observations. Unsupported claims go beyond the records.'},
 c_atp:{t:'ATP must be regenerated',d:'Cells use ATP for work and must keep regenerating it. Stored ATP is only a small, short-term buffer.'},
 c_gly:{t:'Glycolysis and fermentation',d:'Glycolysis makes a little ATP without directly using oxygen. Fermentation regenerates NAD+ so glycolysis can continue, but it does not make ATP itself.'},
 c_aer:{t:'Oxygen and aerobic respiration',d:'Oxygen is the final electron acceptor of the electron transport chain, which makes most of the ATP.'},
 c_ref:{t:'Reflex arcs versus coordinated control',d:'A reflex can use a spinal circuit alone. Coordinated movement needs brain regions to integrate information.'},
 c_sup:{t:'External support has limits',d:'Pumps and nutrient lines can sustain living tissue but cannot undo irreversible cell death.'}
};
Z.HYP=[
 'Not yet formed. Ravenwood claims Z-03 has overcome biological limits.',
 'Movement comes in bursts with rest between them. Claims that Z-03 needs no energy are unsupported.',
 'Short bursts can run on regenerated ATP plus recovery time. Nonstop activity outruns the supply.',
 'Brief movement without oxygen is plausible through glycolysis. Sustained movement is not.',
 'Some neural pathways (such as reflexes) still work, but there is no sign of coordinated brain control or awareness.',
 'Outside support delivering oxygen and nutrients best explains the sustained pattern of movement.',
 'Final verdict submitted. Some movement is temporarily plausible because tissue, pathways, neural circuits, recovery and outside support remain.'
];

/* ---------- state ---------- */
Z.defState=function(){return {
 zone:1,px:-1,py:-1,dir:'down',introDone:false,investigator:null,
 items:{flashlight:true},used:{},flags:{},lore:{},visited:{1:true},
 p1:{ok:{},pick:{}},
 p2:{ints:6,burst:4,rest:12,goalA:false,goalB:false,qok:false,qpick:'',runs:0},
 p3:{cond:'adequate',tested:{},sel:{},selOk:false,whyPick:'',whyOk:false,node:'gly'},
 p4:{t1:[],t2:[],ok1:false,ok2:false,intr:'none',goalOk:false,stmt:{},stmtOk:false},
 p5:{views:{},match:{},matchOk:false,claims:{},claimsOk:false},
 p6:{choice:'',sel:{},cer:{claim:'',evidence:'',reasoning:''},submitted:false,tries:0},
 cert:{name:'',id:'',date:''}
};};
Z.state=Z.defState();

/* ---------- derived logic ---------- */
var S=function(){return Z.state;};
Z.STARTERS={
 claim:['I claim that explanation ... is best supported because ...','The most defensible explanation is ...'],
 evidence:['Evidence from Zone ... shows that ...','Another piece of evidence, from Zone ..., is that ...'],
 reasoning:['This evidence supports my claim because ATP and oxygen ...','Together, these results show that ... which means ...']
};
function stripStarters(t,f){var s=String(t);(Z.STARTERS[f]||[]).forEach(function(x){s=s.split(x).join(' ');});return s;}
Z.meaningful=function(t,f){
  var s=stripStarters(t,f).trim();
  if(s.length<20)return false;
  var w=Z.words(s);if(w.length<4)return false;
  var d={};w.forEach(function(x){d[x.toLowerCase()]=1;});if(Object.keys(d).length<3)return false;
  var c={};s.replace(/\s/g,'').toLowerCase().split('').forEach(function(ch){c[ch]=1;});if(Object.keys(c).length<6)return false;
  return true;
};
Z.puzzleDone=function(n){
  var s=S();
  if(n===1)return Z.T1.every(function(e){return s.p1.ok[e.id]===true;});
  if(n===2)return s.p2.goalA&&s.p2.goalB&&s.p2.qok;
  if(n===3){var t=s.p3.tested;return !!(t.adequate&&t.reduced&&t.severe&&s.p3.selOk&&s.p3.whyOk);}
  if(n===4)return s.p4.ok1&&s.p4.ok2&&s.p4.goalOk&&s.p4.stmtOk;
  if(n===5){var v=s.p5.views;return !!(v.cam&&v.pump&&v.o2&&v.nut&&s.p5.matchOk&&s.p5.claimsOk);}
  if(n===6)return s.p6.submitted===true&&Z.p6Eval().all;
  return false;
};
Z.doneCount=function(){var c=0;for(var i=1;i<=6;i++)if(Z.puzzleDone(i))c++;return c;};
Z.certReady=function(){return Z.doneCount()===6;};
Z.evCollected=function(){
  var e={},p=S();
  Z.T1.forEach(function(t){if(p.p1.ok[t.id]&&t.ev)e[t.ev]=true;});
  if(p.p2.goalA)e.e_regen=true;
  if(p.p2.goalB)e.e_deficit=true;
  if(p.p3.selOk)e.e_glyc=true;
  if(p.p3.tested.adequate&&p.p3.tested.reduced&&p.p3.tested.severe)e.e_o2gap=true;
  if(p.p3.whyOk)e.e_c3=true;
  if(p.p4.goalOk)e.e_reflex=true;
  if(p.p4.stmtOk){e.e_nocoord=true;e.e_c4=true;}
  if(p.p5.matchOk){e.e_pump=true;e.e_off=true;}
  if(p.p5.claimsOk){e.e_edit=true;e.e_c5=true;}
  return e;
};
Z.conceptsUnlocked=function(){
  var c={},p=S();
  if(Z.puzzleDone(1))c.c_obs=true;
  if(p.p2.goalA||p.p2.goalB)c.c_atp=true;
  if(p.p3.selOk)c.c_gly=true;
  if(p.p3.tested.severe||p.p3.tested.reduced)c.c_aer=true;
  if(p.p4.goalOk)c.c_ref=true;
  if(p.p5.matchOk)c.c_sup=true;
  return c;
};
Z.hypIndex=function(){var i=0;while(i<6&&Z.puzzleDone(i+1))i++;return i;};
Z.p6Eval=function(){
  var p=S().p6,r={choiceOk:p.choice==='B',valid:[],invalid:[],phases:{},cer:{}},col=Z.evCollected();
  Object.keys(p.sel).forEach(function(id){
    if(!Z.EVID[id]||!col[id])return;
    if(Z.EVID[id].claim)r.invalid.push(id);else{r.valid.push(id);r.phases[Z.EVID[id].ph]=true;}
  });
  r.evOk=r.valid.length>=3&&Object.keys(r.phases).length>=3&&r.invalid.length===0;
  ['claim','evidence','reasoning'].forEach(function(f){r.cer[f]=Z.meaningful(p.cer[f],f);});
  r.cerOk=r.cer.claim&&r.cer.evidence&&r.cer.reasoning;
  r.all=r.choiceOk&&r.evOk&&r.cerOk;
  return r;
};

/* ---------- ATP model (fictional simulation units) ---------- */
Z.ATP_CAP=60;Z.ATP_REGEN=5;Z.ATP_DEM=3;Z.CYCLES=6;
Z.simATP=function(I,B,R){
  var CAP=Z.ATP_CAP,RG=Z.ATP_REGEN,dem=Z.ATP_DEM*I,pool=CAP,pts=[[0,pool]],t=0,cyc=[],defT=0,burstT=0;
  for(var c=0;c<Z.CYCLES;c++){
    var start=pool,def=0,min=pool;
    for(var s=0;s<B;s++){pool+=RG-dem;if(pool<0){pool=0;def++;}if(pool>CAP)pool=CAP;if(pool<min)min=pool;t++;pts.push([t,pool]);}
    burstT+=B;defT+=def;
    for(var r=0;r<R;r++){pool=Math.min(CAP,pool+RG);t++;pts.push([t,pool]);}
    cyc.push({n:c+1,start:start,min:min,def:def,after:pool});
  }
  var cls='steady';
  var notRec=cyc.some(function(x,i){return i>0&&x.start<0.9*CAP;});
  if(notRec||(burstT>0&&defT/burstT>0.5))cls='sustained';else if(defT>0)cls='brief';
  return {pts:pts,cyc:cyc,cls:cls,total:t,dem:dem,defT:defT,burstT:burstT,minAll:Math.min.apply(null,cyc.map(function(x){return x.min;})),B:B,R:R,I:I};
};
/* ---------- oxygen model (fictional simulation units) ---------- */
Z.O2_DEMAND=25;Z.BUFFER=60;Z.TRIAL=120;
Z.CONDS={adequate:{name:'Adequate oxygen',gly:4,aer:36,fer:0},reduced:{name:'Reduced oxygen',gly:6,aer:14,fer:2},severe:{name:'Severely limited oxygen',gly:8,aer:0,fer:6}};
Z.supplyAt=function(c,t){if(c==='adequate')return 40;if(c==='reduced')return 20;return Math.max(2,8-0.05*t);};
Z.trialO2=function(c){
  var pts=[],buf=Z.BUFFER,fail=null;
  for(var t=0;t<=Z.TRIAL;t++){var s=Z.supplyAt(c,t);pts.push([t,s]);if(t>0&&fail===null){buf-=Math.max(0,Z.O2_DEMAND-s);if(buf<=0)fail=t;}}
  return {pts:pts,fail:fail,sup0:Z.supplyAt(c,0),sup1:Z.supplyAt(c,Z.TRIAL)};
};
})();
