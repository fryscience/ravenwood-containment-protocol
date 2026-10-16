/* RAVENWOOD: THE LAST MISSION | world2.js
   Zones 2 to 6, plus hint text for Zone 1 steps. Same layout rules as world.js. */
(function(){
'use strict';
var Z=window.Z,T=64;
function f(k){return function(){return !!Z.state.flags[k];};}
function has(i){return function(){return !!Z.state.items[i];};}
function pd(n){return function(){return Z.puzzleDone(n);};}
function vis(n){return function(){return !!Z.state.visited[n];};}
function nf(k){return function(){return !Z.state.flags[k];};}
function yes(){return true;}
function P(t,x,y,w,d,h,opt,extra){var o={t:t,x:x,y:y,w:w,d:d,h:h,opt:opt||null};if(extra)for(var k in extra)o[k]=extra[k];return o;}
function need(list){ // returns true or a message naming what is missing
  return function(){
    var miss=list.filter(function(i){return !Z.state.items[i];});
    if(!miss.length)return true;
    return 'Still missing: '+miss.map(function(i){return Z.ITEMS[i].name;}).join(', ')+'. Search the rest of this zone.';
  };
}

/* hints for Zone 1 (steps defined in world.js) */
(function(){
  var h=['Look at the shelf, desk and floor in the Security Lobby for something that glows with an E marker. A damaged card is near the glass on the floor.',
   'The card reader is on the wall beside the sealed door at the east end of the lobby.',
   'The Surveillance Office is through the door you opened. Check the floor near the crates for a small power cell.',
   'The surveillance console is the green screen at the east end of the Surveillance Office. Sort each entry by who or what recorded it.',
   'The exit door on the back wall of the Containment Corridor is now unlocked.'];
  Z.ZONES[1].steps.forEach(function(s,i){s.hint=h[i];});
})();

var RET=function(to,sign){return {id:'return',x:2,kind:'return',to:to,openIf:yes,locked:'',sign:sign};};

/* ===================== ZONE 2: THE ATP REACTOR ===================== */
Z.ZONES[2]={id:2,name:'The ATP Reactor',location:'Cellular Energy Research Laboratory',theme:'energy',w:40,h:11,ambient:0.5,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Reactor Access Hall',x0:1,x1:12,floorStyle:'plate',stripe:'#6dc28f',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4.4,y:70,w:192,h:44,text:'REACTOR ACCESS|HALL',fs:14},{t:'chart',x:7.2,y:82,w:96,h:84,kind:'atp'},
   {t:'vent',x:9,y:96,w:64,h:40},{t:'lamp',x:5,y:40,w:56,color:'#6dc28f'},{t:'lamp',x:10,y:40,w:56,color:'#e0a33c'},{t:'hazard',x:11,y:150,w:140,h:14}]},
  {name:'ATP Monitoring Lab',x0:14,x1:25,floorStyle:'tile',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'ATP MONITORING|LABORATORY',fs:13},{t:'monitors',x:17.4,y:70,w:288,h:74,n:3},
   {t:'chart',x:22.2,y:82,w:96,h:84,kind:'atp'},{t:'lamp',x:15,y:40,w:56,color:'#6dc28f'},{t:'lamp',x:21,y:40,w:56,color:'#6dc28f'}]},
  {name:'Records Vault',x0:27,x1:38,floorStyle:'grate',stripe:'#d8b24e',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:176,h:44,text:'RECORDS VAULT|LEVEL 2',fs:13},{t:'cabwall',x:30,y:76,w:150,h:96},
   {t:'sign',x:36.4,y:70,w:192,h:44,text:'CLASSIFIED|STORAGE',fs:13,color:'#f0716a'},{t:'lamp',x:28,y:40,w:56,color:'#e0a33c'},{t:'lamp',x:36,y:40,w:56,color:'#e0524a',},{t:'cracks',x:31.2,y:100,w:40,h:50}]}
 ],
 gates:[{id:'g1',x:13,y0:5,n:3,openIf:f('z2_power')},{id:'g2',x:26,y0:5,n:3,openIf:pd(2)}],
 doors:[RET(1,'TO CONTAINMENT|CORRIDOR'),
  {id:'exit',x:33,kind:'exit',to:3,openIf:has('doc_metab'),locked:'The vault door is locked. The report in the Records Vault is the key to this wing. Check the cabinet once the monitor finishes its analysis.',sign:'TO RESPIRATORY|WING'}],
 props:[
  P('bench',300,230,192,64,56,{kit:'beakers'}),
  P('cabinet',96,196,96,48,140,null),
  P('breaker',640,196,96,44,128,{on:false},{altOpt:{on:true},alt:f('z2_power')}),
  P('generator',110,520,128,64,84,null),
  P('barrel',560,560,48,48,60,null),
  P('cart',420,540,60,40,50,null),
  P('crate',760,540,64,64,52,null),
  P('bench',960,230,192,64,56,{kit:'beakers'}),
  P('console',1150,300,128,60,84,{},{id:'z2_console'}),
  P('tube',1420,196,72,72,150,{}),
  P('tube',1510,196,72,72,150,{broken:true}),
  P('cart',1000,540,60,40,50,null),
  P('crate',1360,560,64,64,52,null),
  P('bench',1280,520,160,64,52,{kit:'beakers'}),
  P('cabinet',1790,196,96,48,140,{lock:true}),
  P('shelf',1940,196,96,48,120,null),
  P('server',2300,196,80,56,128,null),
  P('server',2390,196,80,56,128,null),
  P('crate',1790,540,64,64,52,null),
  P('table',2040,330,128,80,52,null),
  P('barrel',2380,540,48,48,60,null)
 ],
 decals:[{t:'cable',x:200,y:620,w:240,h:30},{t:'stain',x:760,y:380,r:70},{t:'glass',x:520,y:470,w:100,h:50,n:18},{t:'puddle',x:1240,y:620,w:100,h:30},
  {t:'stain',x:1500,y:450,r:80},{t:'text',x:480,y:612,text:'POWER OFF',fs:18},{t:'cable',x:1700,y:610,w:260,h:34},{t:'blood',x:2000,y:560,w:100,h:40}],
 lights:[{x:200,y:140,r:230,color:'#6dc28f',flick:true},{x:700,y:140,r:230,color:'#e0a33c'},{x:1000,y:140,r:230,color:'#6dc28f'},{x:1500,y:140,r:240,color:'#6dc28f',flick:true},
  {x:1900,y:140,r:230,color:'#e0a33c'},{x:2300,y:140,r:240,color:'#e0524a',flick:true}],
 objects:[
  {id:'z2_fuse',kind:'pickup',item:'fuse',x:400,y:292,label:'Pick up Replacement fuse'},
  {id:'z2_note0',kind:'note',x:190,y:256,r:80,label:'Read the notice on the cabinet',text:'NOTICE ON CABINET: "Main reactor breaker tripped during the incident. Replacement fuses are kept on the lab bench. Do not restart the monitoring system without a fuse in the panel."'},
  {id:'z2_breaker',kind:'use',x:688,y:262,r:84,item:'fuse',flag:'z2_power',label:'Install the fuse in the breaker panel',labelDone:'Breaker panel (powered)',
   missing:'The breaker panel has an empty fuse slot. A replacement fuse should be somewhere in this hall.',done:'You seat the fuse and throw the main breaker. The lights surge, a deep hum builds, and the laboratory bulkhead unlocks.'},
  {id:'z2_console',kind:'puzzle',puzzle:2,x:1214,y:372,r:100,label:'Use the biological energy monitor',powerFlag:'z2_power'},
  {id:'z2_note1',kind:'note',x:1000,y:300,r:90,label:'Read the sticky note on the bench',text:'STICKY NOTE: "Model runs 6 cycles. Intensity is how hard the cells work. Burst is how many seconds of activity. Rest is how many seconds to recover. All numbers are SIMULATION UNITS, not real measurements. Remember: ATP is not created from nothing. It is made again from ADP and phosphate using energy from food."'},
  {id:'z2_note2',kind:'note',x:1546,y:272,r:90,label:'Examine the cracked sample tube',text:'The sample tube is cracked and dry. A tag reads: "Muscle cell culture. Stored ATP is a small short-term buffer. Cells must keep regenerating it."'},
  {id:'z2_lock',kind:'note',x:1838,y:262,r:80,label:'Inspect the locked cabinet',visibleIf:nf2,text:'The cabinet has an electronic lock tied to the monitoring system. A label reads: "Releases when the ATP analysis is verified."'},
  {id:'z2_report',kind:'pickup',item:'doc_metab',x:1838,y:292,label:'Take the Classified metabolic report',visibleIf:pd(2)}
 ],
 steps:[
  {t:'Find a replacement fuse in the Reactor Access Hall.',done:has('fuse'),hint:'Look at the lab bench near the west end of the hall. A fuse glows with an E marker.'},
  {t:'Install the fuse in the breaker panel on the back wall.',done:f('z2_power'),hint:'The breaker panel is on the back wall in the east half of the hall, near the bulkhead.'},
  {t:'Run the ATP simulations at the biological energy monitor.',done:pd(2),hint:'The monitor is the large console in the ATP Monitoring Lab. Try a short burst with plenty of rest, then try nonstop activity.'},
  {t:'Take the classified metabolic report from the Records Vault cabinet.',done:has('doc_metab'),hint:'The cabinet with the red lock light in the Records Vault is unlocked now.'},
  {t:'Go through the vault door to the Respiratory Wing.',done:vis(3),hint:'The exit door is on the back wall at the east end of the Records Vault.'}
 ]};
function nf2(){return !Z.puzzleDone(2);}

/* ===================== ZONE 3: OXYGEN BLACKOUT ===================== */
Z.ZONES[3]={id:3,name:'Oxygen Blackout',location:'Respiratory and Circulatory Research Wing',theme:'resp',w:40,h:11,ambient:0.5,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Pressure Corridor',x0:1,x1:12,floorStyle:'plate',stripe:'#8cc3d4',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4.4,y:70,w:192,h:44,text:'PRESSURE|CORRIDOR',fs:14},{t:'chart',x:7.2,y:82,w:96,h:84,kind:'lung'},
   {t:'vent',x:9.4,y:96,w:64,h:40},{t:'lamp',x:5,y:40,w:56,color:'#8cc3d4'},{t:'lamp',x:10,y:40,w:56,color:'#e0a33c'}]},
  {name:'Oxygen Monitoring Lab',x0:14,x1:25,floorStyle:'tile',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'OXYGEN|MONITORING LAB',fs:14},{t:'monitors',x:17.4,y:70,w:288,h:74,n:3},
   {t:'window',x:22,y:72,w:160,h:84},{t:'lamp',x:15,y:40,w:56,color:'#8cc3d4'},{t:'lamp',x:21,y:40,w:56,color:'#8cc3d4',}]},
  {name:'Circulatory Annex',x0:27,x1:38,floorStyle:'grate',stripe:'#e0524a',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:192,h:44,text:'CIRCULATORY|ANNEX',fs:14},{t:'chart',x:30.2,y:82,w:96,h:84,kind:'lung'},
   {t:'sign',x:36.4,y:70,w:192,h:44,text:'DELIVERY|RECORDS',fs:13,color:'#f0716a'},{t:'lamp',x:28,y:40,w:56,color:'#e0524a'},{t:'lamp',x:36,y:40,w:56,color:'#8cc3d4'}]}
 ],
 gates:[{id:'g1',x:13,y0:5,n:3,openIf:f('z3_gate')},{id:'g2',x:26,y0:5,n:3,openIf:pd(3)}],
 doors:[RET(2,'TO RECORDS|VAULT'),
  {id:'exit',x:33,kind:'exit',to:4,openIf:pd(3),locked:'The annex door is locked. Finish the oxygen analysis at the monitoring station to unlock it.',sign:'TO NEUROBIOLOGY|LAB'}],
 props:[
  P('cart',380,540,60,40,50,null),
  P('barrel',140,560,48,48,60,null),
  P('pump',100,196,112,56,100,null),
  P('valve',700,300,60,40,112,{fitted:false},{altOpt:{fitted:true},alt:f('z3_gate')}),
  P('crate',560,560,64,64,52,null),
  P('crate',260,230,64,64,52,null),
  P('bench',960,230,192,64,56,{kit:'beakers'}),
  P('console',1150,300,128,60,84,{},{id:'z3_console'}),
  P('anatomy',1480,196,72,56,150,{kind:'lung'}),
  P('anatomy',1570,196,72,56,150,{kind:'lung'}),
  P('scan',1380,520,90,40,130,null),
  P('cart',1000,540,60,40,50,null),
  P('table',1760,330,128,80,52,null),
  P('shelf',1900,196,96,48,120,null),
  P('pump',2320,196,112,56,100,null),
  P('server',2200,196,80,56,128,null),
  P('crate',1780,560,64,64,52,null),
  P('gurney',2230,520,128,56,44,null)
 ],
 decals:[{t:'puddle',x:500,y:470,w:120,h:40},{t:'cable',x:200,y:620,w:240,h:30},{t:'stain',x:1100,y:560,r:70},{t:'glass',x:1300,y:420,w:90,h:40,n:16},
  {t:'puddle',x:1900,y:540,w:100,h:34},{t:'blood',x:2100,y:420,w:110,h:40},{t:'text',x:430,y:612,text:'PRESSURE LOCK',fs:16}],
 lights:[{x:200,y:140,r:230,color:'#8cc3d4',flick:true},{x:700,y:140,r:230,color:'#e0a33c'},{x:1050,y:140,r:230,color:'#8cc3d4'},{x:1500,y:140,r:240,color:'#8cc3d4',flick:true},
  {x:1900,y:140,r:230,color:'#e0524a'},{x:2300,y:140,r:240,color:'#8cc3d4'}],
 objects:[
  {id:'z3_valve',kind:'pickup',item:'valve',x:410,y:566,label:'Pick up Valve handle'},
  {id:'z3_note0',kind:'note',x:156,y:268,r:90,label:'Read the pump label',text:'PUMP LABEL: "Circulation pump A. Moves blood plasma through the wing. Blood carries oxygen from the lungs to cells. It does not make oxygen."'},
  {id:'z3_turn',kind:'use',x:730,y:352,r:90,item:'valve',flag:'z3_gate',label:'Fit the valve handle and turn the pressure valve',labelDone:'Pressure valve (open)',
   missing:'The pressure valve has no handle. A steel handle should be somewhere in this corridor.',done:'The handle fits. You heave the valve around and the pressure door to the Oxygen Monitoring Lab hisses open.'},
  {id:'z3_chip',kind:'pickup',item:'chip',x:1050,y:292,label:'Pick up Calibration chip'},
  {id:'z3_console',kind:'puzzle',puzzle:3,x:1214,y:372,r:100,item:'chip',flag:'z3_chip',label:'Use the oxygen monitoring station',
   missing:'The oxygen monitoring station is waiting for a sensor calibration chip. Look on the bench in this lab.',insert:'The chip clicks in. The station recalibrates and the oxygen display comes alive.'},
  {id:'z3_note1',kind:'note',x:1526,y:268,r:100,label:'Examine the lung model',text:'LUNG MODEL: Air reaches tiny sacs called alveoli. Oxygen diffuses into nearby capillaries and blood carries it to every cell. Inside cells, oxygen is the final electron acceptor at the end of the electron transport chain, where most ATP is made.'},
  {id:'z3_note2',kind:'note',x:1424,y:562,r:90,label:'Read the scan display',text:'SCAN DISPLAY: Cell energy pathways. Glycolysis in the cytoplasm nets a small amount of ATP without using oxygen. Aerobic respiration in the mitochondria makes far more ATP. When oxygen is very low, fermentation can regenerate NAD+ so glycolysis can keep going, but fermentation itself makes no ATP.'},
  {id:'z3_note3',kind:'note',x:1824,y:372,r:100,label:'Read the delivery log on the table',text:'DELIVERY LOG vs FOOTAGE: The oxygen display at Z-03\'s containment cell shows delivery far below what sustained movement needs. The footage shows repeated movement during the same minutes. Either the sensors are wrong, or something other than ordinary breathing was supplying Z-03. The logs here do not say what.'}
 ],
 steps:[
  {t:'Find a valve handle in the Pressure Corridor.',done:has('valve'),hint:'A steel handle sits on the floor near the cart at the lower left of the corridor.'},
  {t:'Fit the handle and turn the pressure valve.',done:f('z3_gate'),hint:'The pressure valve is the tall pipe fixture near the east end of the corridor.'},
  {t:'Find the calibration chip in the Oxygen Monitoring Lab.',done:has('chip'),hint:'The chip is on the bench near the west end of the lab.'},
  {t:'Calibrate the oxygen monitoring station and compare the three conditions.',done:pd(3),hint:'Test every oxygen condition, then explain what each pathway does. Remember: fermentation regenerates NAD+ and does not directly make ATP.'},
  {t:'Go through the annex door to the Neurobiology Laboratory.',done:vis(4),hint:'The exit door is on the back wall at the east end of the Circulatory Annex.'}
 ]};

/* ===================== ZONE 4: NEURAL OVERRIDE ===================== */
Z.ZONES[4]={id:4,name:'Neural Override',location:'Neurobiology Laboratory',theme:'neuro',w:40,h:11,ambient:0.5,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Neural Monitoring Hall',x0:1,x1:12,floorStyle:'plate',stripe:'#8fa7d6',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4.4,y:70,w:192,h:44,text:'NEURAL|MONITORING HALL',fs:13},{t:'chart',x:7.2,y:82,w:96,h:84,kind:'neuron'},
   {t:'monitors',x:9.2,y:80,w:192,h:62,n:2},{t:'lamp',x:5,y:40,w:56,color:'#8fa7d6'},{t:'lamp',x:10,y:40,w:56,color:'#e0a33c',}]},
  {name:'Specimen Review Room',x0:14,x1:25,floorStyle:'tile',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'SPECIMEN|REVIEW ROOM',fs:13},{t:'chart',x:17.4,y:82,w:96,h:84,kind:'neuron'},
   {t:'window',x:19.4,y:72,w:160,h:84},{t:'monitors',x:22.4,y:78,w:192,h:62,n:2},{t:'lamp',x:15,y:40,w:56,color:'#8fa7d6'},{t:'lamp',x:21,y:40,w:56,color:'#7fd0c0'}]},
  {name:'Signal-Routing Room',x0:27,x1:38,floorStyle:'grate',stripe:'#7fd0c0',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:192,h:44,text:'SIGNAL-ROUTING|ROOM',fs:13},{t:'monitors',x:30,y:70,w:240,h:74,n:3},
   {t:'sign',x:36.4,y:70,w:192,h:44,text:'RESTRICTED|NEURAL RECORDS',fs:12,color:'#f0716a'},{t:'lamp',x:28,y:40,w:56,color:'#7fd0c0'},{t:'lamp',x:36,y:40,w:56,color:'#e0524a'}]}
 ],
 gates:[{id:'g1',x:13,y0:5,n:3,openIf:f('z4_a')},{id:'g2',x:26,y0:5,n:3,openIf:f('z4_b')}],
 doors:[RET(3,'TO CIRCULATORY|ANNEX'),
  {id:'exit',x:33,kind:'exit',to:5,openIf:has('doc_neuro'),locked:'The restricted records door is locked. The neurological record from the Signal-Routing Room is the access key.',sign:'TO UNDERGROUND|WING'}],
 props:[
  P('bench',300,230,192,64,56,{kit:'beakers'}),
  P('scan',640,196,96,44,132,null),
  P('anatomy',150,196,72,56,150,{kind:'brain'}),
  P('cart',140,540,60,40,50,null),
  P('crate',560,560,64,64,52,null),
  P('gurney',380,540,128,56,44,null),
  P('bench',960,230,192,64,56,{kit:'beakers'}),
  P('scan',1250,196,96,44,132,null),
  P('cart',1500,520,60,40,50,null),
  P('anatomy',1400,196,72,56,150,{kind:'brain'}),
  P('crate',1020,570,64,64,52,null),
  P('table',1520,300,128,80,52,null),
  P('console',1960,300,128,60,84,{},{id:'z4_console'}),
  P('server',1780,196,80,56,128,null),
  P('server',1870,196,80,56,128,null),
  P('cabinet',2290,196,96,48,140,{lock:true}),
  P('shelf',2400,196,80,48,120,null),
  P('crate',1800,560,64,64,52,null),
  P('barrel',2380,560,48,48,60,null)
 ],
 decals:[{t:'cable',x:240,y:620,w:240,h:30},{t:'glass',x:700,y:520,w:100,h:50,n:18},{t:'stain',x:1100,y:380,r:70},{t:'blood',x:560,y:470,w:70,h:30},
  {t:'cable',x:1700,y:620,w:260,h:34},{t:'puddle',x:2150,y:600,w:90,h:34},{t:'text',x:1240,y:612,text:'KEEP CLEAR',fs:16}],
 lights:[{x:200,y:140,r:230,color:'#8fa7d6',flick:true},{x:700,y:140,r:230,color:'#8fa7d6'},{x:1100,y:140,r:230,color:'#7fd0c0'},{x:1500,y:140,r:240,color:'#8fa7d6',flick:true},
  {x:1950,y:140,r:230,color:'#7fd0c0'},{x:2350,y:140,r:240,color:'#e0524a',flick:true}],
 objects:[
  {id:'z4_rec1',kind:'pickup',item:'rec1',x:420,y:292,label:'Pick up Nerve recording A'},
  {id:'z4_note0',kind:'note',x:186,y:268,r:90,label:'Examine the brain model',text:'BRAIN MODEL: Sensory neurons carry information toward the central nervous system. The brain integrates information from many sources. Motor neurons carry commands out to muscles.'},
  {id:'z4_stA',kind:'use',x:688,y:258,r:90,item:'rec1',flag:'z4_a',label:'Load Nerve recording A into the monitoring station',labelDone:'Monitoring station A (played)',
   missing:'This station plays nerve recordings, but nothing is loaded. A recording should be somewhere in this hall.',done:'The station plays Recording A. A hand touches a hot surface and the arm pulls away in about 0.3 seconds. The head does not turn. The shutter to the next room unlocks.'},
  {id:'z4_rec2',kind:'pickup',item:'rec2',x:1050,y:292,label:'Pick up Nerve recording B'},
  {id:'z4_rec3',kind:'pickup',item:'rec3',x:1530,y:546,label:'Pick up Nerve recording C'},
  {id:'z4_stB',kind:'use',x:1298,y:258,r:90,item:'rec2',flag:'z4_b',label:'Load Nerve recording B into the monitoring station',labelDone:'Monitoring station B (played)',
   missing:'This station is waiting for a recording. Look for one on the bench in this room.',done:'The station plays Recording B. A metal cart rolls by and about two seconds later the head turns toward the corridor. The shutter to the Signal-Routing Room unlocks.'},
  {id:'z4_note1',kind:'note',x:1584,y:372,r:90,label:'Read the technician note',text:'TECHNICIAN NOTE: "A reflex is fast and automatic. A coordinated response usually needs signals to reach the brain, be processed, and travel back out. Check the timing of each recording."'},
  {id:'z4_console',kind:'puzzle',puzzle:4,x:2024,y:372,r:100,label:'Use the signal-routing console',powerFlag:'z4_b',ready:need(['rec1','rec2','rec3'])},
  {id:'z4_doc',kind:'pickup',item:'doc_neuro',x:2338,y:292,label:'Take the Restricted neurological record',visibleIf:pd(4)},
  {id:'z4_lock',kind:'note',x:2338,y:262,r:80,label:'Inspect the locked cabinet',visibleIf:function(){return !Z.puzzleDone(4);},text:'The cabinet is locked. A label reads: "Restricted neurological records. Releases after pathway verification at the signal-routing console."'}
 ],
 steps:[
  {t:'Find Nerve recording A in the Neural Monitoring Hall.',done:has('rec1'),hint:'Look at the bench near the west end of the hall.'},
  {t:'Load Recording A into the monitoring station.',done:f('z4_a'),hint:'The monitoring station is the tall scanner on the back wall to the east.'},
  {t:'Find Nerve recording B in the Specimen Review Room.',done:has('rec2'),hint:'Recording B is on the bench at the west end of the room.'},
  {t:'Load Recording B into the second monitoring station.',done:f('z4_b'),hint:'The second station is the tall scanner near the east end of the room.'},
  {t:'Find Nerve recording C in the Specimen Review Room.',done:has('rec3'),hint:'It is on the floor near the cart in the lower right of the room.'},
  {t:'Trace the pathways at the signal-routing console.',done:pd(4),hint:'Build the reflex arc first. Then compare it with coordinated movement and decide what each recording proves.'},
  {t:'Take the restricted neurological record from the cabinet.',done:has('doc_neuro'),hint:'The cabinet is at the east end of the Signal-Routing Room.'},
  {t:'Go through the door to the Underground Wing.',done:vis(5),hint:'The exit door is on the back wall at the east end of the room.'}
 ]};

/* ===================== ZONE 5: THE HIDDEN EXPERIMENT ===================== */
Z.ZONES[5]={id:5,name:'The Hidden Experiment',location:'Restricted Underground Research Wing',theme:'under',w:40,h:11,ambient:0.45,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Service Tunnel',x0:1,x1:12,floorStyle:'concrete',stripe:'#d58a3a',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4.4,y:70,w:192,h:44,text:'SERVICE TUNNEL|LEVEL 5',fs:13},{t:'vent',x:7.4,y:96,w:64,h:40},
   {t:'hazard',x:9,y:150,w:140,h:14},{t:'lamp',x:5,y:40,w:56,color:'#d58a3a',},{t:'lamp',x:10,y:40,w:56,color:'#e0a33c'},{t:'cracks',x:11,y:90,w:40,h:50}]},
  {name:'Restricted Archive',x0:14,x1:25,floorStyle:'concrete',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'RESTRICTED|ARCHIVE',fs:14,color:'#f0716a'},{t:'cabwall',x:17.4,y:76,w:240,h:96},
   {t:'board',x:21.6,y:82,w:120,h:80},{t:'lamp',x:15,y:40,w:56,color:'#d58a3a'},{t:'lamp',x:22,y:40,w:56,color:'#e0a33c',}]},
  {name:'Hidden Experiment Chamber',x0:27,x1:38,floorStyle:'grate',stripe:'#e0524a',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:192,h:44,text:'EXPERIMENT|CHAMBER',fs:14,color:'#f0716a'},{t:'monitors',x:30,y:76,w:240,h:70,n:3},
   {t:'logo',x:36.5,y:86,w:56,h:56},{t:'lamp',x:28,y:40,w:56,color:'#e0524a'},{t:'lamp',x:36,y:40,w:56,color:'#d58a3a'}]}
 ],
 gates:[{id:'g1',x:13,y0:5,n:3,openIf:f('z5_gate1')},{id:'g2',x:26,y0:5,n:3,openIf:f('z5_gate2')}],
 doors:[RET(4,'TO NEUROBIOLOGY|LAB'),
  {id:'exit',x:33,kind:'exit',to:6,openIf:has('doc_memo'),locked:'The lift to Central Command is locked. The memo from the research terminal is the clearance it needs.',sign:'TO CENTRAL|COMMAND'}],
 props:[
  P('locker',300,196,128,48,128,{dent:true}),
  P('crate',100,540,64,64,52,null),
  P('barrel',230,560,48,48,60,null),
  P('barrel',290,580,48,48,60,null),
  P('cart',470,540,60,40,50,null),
  P('crate',700,300,64,64,52,null),
  P('shelf',960,196,96,48,120,null),
  P('shelf',1060,196,96,48,120,null),
  P('crate',1480,560,64,64,52,null),
  P('desk',1180,300,128,60,52,null),
  P('cabinet',1420,196,96,48,140,null),
  P('cart',1000,540,60,40,50,null),
  P('desk',1760,230,160,64,52,null),
  P('console',1960,300,128,60,84,{},{id:'z5_console'}),
  P('crate',2240,230,128,64,90,null,{showIf:function(){return !Z.state.p5.matchOk;}}),
  P('rig',2240,214,148,70,130,{},{showIf:function(){return !!Z.state.p5.matchOk;}}),
  P('gurney',2060,520,128,56,44,null),
  P('server',1780,540,80,56,128,null)
 ],
 decals:[{t:'stain',x:500,y:400,r:80},{t:'cable',x:200,y:620,w:240,h:30},{t:'stain',x:1300,y:450,r:80},{t:'glass',x:1750,y:470,w:100,h:50,n:18},
  {t:'cable',x:2020,y:440,w:260,h:34},{t:'cable',x:2140,y:420,w:180,h:30},{t:'blood',x:2090,y:560,w:120,h:44},{t:'text',x:430,y:612,text:'LEVEL 5',fs:18},{t:'puddle',x:760,y:520,w:100,h:34}],
 lights:[{x:200,y:140,r:220,color:'#d58a3a',flick:true},{x:700,y:140,r:230,color:'#d58a3a'},{x:1050,y:140,r:230,color:'#e0a33c'},{x:1500,y:140,r:230,color:'#d58a3a',flick:true},
  {x:1950,y:140,r:230,color:'#e0524a'},{x:2350,y:140,r:240,color:'#e0524a',flick:true}],
 objects:[
  {id:'z5_key',kind:'pickup',item:'keycard5',x:366,y:262,label:'Take the Level 5 keycard'},
  {id:'z5_note0',kind:'note',x:760,y:372,r:90,label:'Read the stencil on the crate',text:'STENCIL: "LEVEL 5. RESTRICTED. Records are filed by delivery type: circulation, oxygen, nutrient. Camera indexes are kept in the experiment chamber."'},
  {id:'z5_reader',kind:'use',x:13*T-30,y:384,r:96,item:'keycard5',flag:'z5_gate1',label:'Swipe the keycard at the Level 5 door reader',labelDone:'Door reader (unlocked)',
   missing:'The door reader glows red. It needs a Level 5 keycard. Search the tunnel.',done:'The keycard reads. The heavy door to the Restricted Archive grinds open.'},
  {id:'z5_nut',kind:'pickup',item:'rec_nut',x:1010,y:292,label:'Take the Nutrient delivery log'},
  {id:'z5_o2',kind:'pickup',item:'rec_o2',x:1512,y:586,label:'Take the Oxygen delivery record'},
  {id:'z5_panel',kind:'note',x:1334,y:248,r:80,label:'Examine the loose wall panel',text:'A wall panel sits slightly crooked. Behind it is a hidden compartment holding a printed Circulation pump log.'},
  {id:'z5_pump',kind:'pickup',item:'rec_pump',x:1334,y:292,label:'Take the Circulation pump log',visibleIf:function(){return !!Z.state.lore.z5_panel;}},
  {id:'z5_lever',kind:'use',x:26*T-30,y:384,r:96,flag:'z5_gate2',label:'Pull the archive shutter lever',labelDone:'Archive shutter lever (pulled)',
   done:'The lever clunks and the shutter to the Hidden Experiment Chamber rises.'},
  {id:'z5_cam',kind:'pickup',item:'rec_cam',x:1840,y:292,label:'Take the Camera timestamp index'},
  {id:'z5_console',kind:'puzzle',puzzle:5,x:2024,y:372,r:100,item:'keycard5',flag:'z5_term',label:'Use the classified research terminal',
   missing:'The terminal requires a Level 5 keycard.',insert:'You swipe the keycard. The terminal wakes and asks for records to compare.',ready:need(['rec_pump','rec_o2','rec_nut','rec_cam'])},
  {id:'z5_memo',kind:'pickup',item:'doc_memo',x:1900,y:300,label:'Take the printed memo',visibleIf:pd(5)}
 ],
 steps:[
  {t:'Find the Level 5 keycard in the Service Tunnel.',done:has('keycard5'),hint:'The keycard is on the locker at the west end of the tunnel.'},
  {t:'Swipe the keycard at the door reader.',done:f('z5_gate1'),hint:'The reader is on the wall beside the heavy door at the east end of the tunnel.'},
  {t:'Collect the nutrient log, the oxygen record and the pump log in the Restricted Archive.',done:function(){return has('rec_nut')()&&has('rec_o2')()&&has('rec_pump')();},hint:'One record is behind a loose panel on the back wall. Examine anything that looks out of place.'},
  {t:'Pull the lever to open the shutter to the experiment chamber.',done:f('z5_gate2'),hint:'The lever is beside the shutter at the east end of the archive.'},
  {t:'Find the camera timestamp index in the Hidden Experiment Chamber.',done:has('rec_cam'),hint:'It is on the desk near the west end of the chamber.'},
  {t:'Compare all four records at the classified research terminal.',done:pd(5),hint:'Turn on every record, then ask: what was the equipment doing at the moment of each big movement? What is missing from the highlight reel?'},
  {t:'Take the printed memo.',done:has('doc_memo'),hint:'The memo printed beside the terminal.'},
  {t:'Take the lift to Central Command.',done:vis(6),hint:'The exit door is on the back wall at the east end of the chamber.'}
 ]};

/* ===================== ZONE 6: FINAL CLEARANCE ===================== */
function fivePuzzles(){return [1,2,3,4,5].every(function(n){return Z.puzzleDone(n);});}
Z.ZONES[6]={id:6,name:'Final Clearance',location:'Ravenwood Central Command',theme:'command',w:40,h:11,ambient:0.55,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Command Lobby',x0:1,x1:12,floorStyle:'inlay',stripe:'#d8b24e',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4.4,y:70,w:208,h:44,text:'RAVENWOOD|CENTRAL COMMAND',fs:13},{t:'logo',x:8,y:84,w:64,h:64},
   {t:'window',x:9.6,y:72,w:160,h:84},{t:'lamp',x:5,y:40,w:56,color:'#d8b24e'},{t:'lamp',x:11,y:40,w:56,color:'#d8b24e'}]},
  {name:'Evidence Review Room',x0:14,x1:25,floorStyle:'inlay',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'EVIDENCE|REVIEW ROOM',fs:13},{t:'board',x:18,y:76,w:288,h:92},
   {t:'monitors',x:23,y:78,w:160,h:62,n:2},{t:'lamp',x:15,y:40,w:56,color:'#d8b24e'},{t:'lamp',x:21,y:40,w:56,color:'#6dc28f'}]},
  {name:'Central Command',x0:27,x1:38,floorStyle:'inlay',stripe:'#d8b24e',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:192,h:44,text:'CENTRAL|COMMAND',fs:14},{t:'monitors',x:30,y:70,w:240,h:74,n:3},
   {t:'logo',x:36.6,y:84,w:60,h:60},{t:'lamp',x:28,y:40,w:56,color:'#d8b24e'},{t:'lamp',x:36,y:40,w:56,color:'#6dc28f'}]}
 ],
 gates:[{id:'g1',x:13,y0:5,n:3,openIf:f('z6_door')},{id:'g2',x:26,y0:5,n:3,openIf:f('z6_board')}],
 doors:[RET(5,'TO UNDERGROUND|WING'),
  {id:'exit',x:33,kind:'exit',to:null,openIf:function(){return false;},locked:'The main facility exit stays sealed. Your work here is the verdict. Use the clearance terminal to open your certificate once the verdict is accepted.',sign:'FACILITY|EXIT'}],
 props:[
  P('desk',320,230,192,64,52,null),
  P('chair',396,300,40,30,48,null),
  P('shelf',100,196,96,48,120,null),
  P('cabinet',640,196,96,48,140,null),
  P('crate',150,560,64,64,52,null),
  P('desk',500,520,160,64,52,null),
  P('table',1000,330,160,90,52,null),
  P('server',1380,196,80,56,128,null),
  P('server',1470,196,80,56,128,null),
  P('desk',1010,520,160,64,52,null),
  P('chair',1220,520,40,30,48,null),
  P('crate',1540,560,64,64,52,null),
  P('console',1960,300,160,60,84,{},{id:'z6_console'}),
  P('console',2290,300,128,60,84,{},{id:'z6_cert'}),
  P('server',1780,196,80,56,128,null),
  P('desk',1760,520,160,64,52,null),
  P('shelf',2400,196,80,48,120,null)
 ],
 decals:[{t:'line',x:100,y:430,w:640,h:4},{t:'cable',x:200,y:620,w:240,h:30},{t:'stain',x:1250,y:450,r:70},{t:'glass',x:1700,y:470,w:100,h:50,n:14},
  {t:'text',x:430,y:612,text:'AUTHORIZED ONLY',fs:16},{t:'line',x:1800,y:560,w:600,h:4}],
 lights:[{x:200,y:140,r:230,color:'#d8b24e'},{x:700,y:140,r:230,color:'#d8b24e',flick:true},{x:1050,y:140,r:230,color:'#6dc28f'},{x:1500,y:140,r:240,color:'#d8b24e'},
  {x:1950,y:140,r:230,color:'#6dc28f'},{x:2350,y:140,r:240,color:'#d8b24e'}],
 objects:[
  {id:'z6_note0',kind:'note',x:380,y:340,r:90,label:'Read the executive desk memo',text:'EXECUTIVE MEMO: "Public statement approved: Subject Z-03 has overcome biological limits. Do not release the pump log. Do not release unedited footage. The story must stay simple."'},
  {id:'z6_door',kind:'use',x:13*T-30,y:384,r:96,flag:'z6_door',label:'Use the command door control',labelDone:'Command door control (authorized)',
   enabledIf:function(){return fivePuzzles()?true:'The command lock needs verified findings from all five earlier zones. Return to any zone from the Map.';},
   done:'The control reads your five verified findings and accepts them. The door to the Evidence Review Room opens.'},
  {id:'z6_board',kind:'use',x:1340,y:264,r:100,flag:'z6_board',label:'Examine the evidence board',labelDone:'Evidence board (reviewed)',
   done:'The board lists your five findings: observation versus inference, ATP that must be regenerated, oxygen and fermentation, reflexes versus coordinated control, and outside support. Three competing explanations are pinned at the bottom. Your final verdict must choose one and defend it with evidence. The door to Central Command opens.'},
  {id:'z6_note1',kind:'note',x:1080,y:440,r:90,label:'Read the reviewer\'s note',text:'REVIEWER\'S NOTE: "Count the evidence for each explanation. A claim that fails one piece of evidence needs a very good reason to survive. Strong answers use evidence from several zones."'},
  {id:'z6_console',kind:'puzzle',puzzle:6,x:2040,y:372,r:110,label:'Use the central command console',powerFlag:'z6_board',
   ready:function(){return fivePuzzles()?true:'The final verdict needs your verified findings from Zones 1 to 5.';}},
  {id:'z6_cert',kind:'cert',x:2354,y:372,r:100,label:'Open the clearance terminal',powerFlag:'z6_board'}
 ],
 steps:[
  {t:'Use the command door control to enter the Evidence Review Room.',done:f('z6_door'),hint:'The control is on the wall beside the door at the east end of the Command Lobby.'},
  {t:'Examine the evidence board.',done:f('z6_board'),hint:'The board covers the back wall at the east end of the room.'},
  {t:'Submit your final verdict at the central command console.',done:pd(6),hint:'Choose the best-supported explanation, pick at least three pieces of valid evidence from different zones, then write your Claim, Evidence and Reasoning.'},
  {t:'Open the clearance terminal to see your certificate.',done:function(){return !!Z.state.cert.id;},hint:'The clearance terminal is the smaller console east of the command console.'}
 ]};
})();
