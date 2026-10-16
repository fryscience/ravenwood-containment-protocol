/* RAVENWOOD: THE LAST MISSION | world.js
   Zone data: maps, rooms, props, objects, gates, doors, lights, objectives.
   Layout: every zone is 40 x 11 tiles (64 px each). Rows 0 to 2 are the back wall,
   rows 3 to 9 are floor, row 10 is the south wall. Three rooms are separated by
   partition columns 13 and 26, with 2-tile (128 px) gate openings. */
(function(){
'use strict';
var Z=window.Z,T=64;
function f(k){return function(){return !!Z.state.flags[k];};}
function has(i){return function(){return !!Z.state.items[i];};}
function pd(n){return function(){return Z.puzzleDone(n);};}
function vis(n){return function(){return !!Z.state.visited[n];};}
Z.ZONES={};
function P(t,x,y,w,d,h,opt,extra){var o={t:t,x:x,y:y,w:w,d:d,h:h,opt:opt||null};if(extra)for(var k in extra)o[k]=extra[k];return o;}

/* ===================== ZONE 1: CONTAINMENT BREACH ===================== */
Z.ZONES[1]={id:1,name:'Containment Breach',location:'Ravenwood Security Wing',theme:'security',w:40,h:11,ambient:0.55,
 spawn:{x:230,y:470},parts:[13,26],
 rooms:[
  {name:'Security Lobby',x0:1,x1:12,floorStyle:'plate',stripe:'#d8b24e',deco:[
   {t:'pipes',x:1,y:44,w:12*T},{t:'sign',x:4,y:70,w:192,h:44,text:'SECURITY WING|MAIN LOBBY',fs:14},{t:'window',x:7,y:70,w:176,h:84},
   {t:'logo',x:9.6,y:86,w:56,h:56},{t:'vent',x:11,y:96,w:64,h:40},{t:'lamp',x:2,y:40,w:56,color:'#e0a33c'},{t:'lamp',x:8,y:40,w:56,color:'#e0a33c'},{t:'cracks',x:6,y:90,w:40,h:50}]},
  {name:'Surveillance Office',x0:14,x1:25,floorStyle:'tile',deco:[
   {t:'pipes',x:14,y:44,w:12*T},{t:'sign',x:14.4,y:70,w:192,h:44,text:'SURVEILLANCE|OFFICE',fs:14},{t:'monitors',x:17.4,y:70,w:288,h:74,n:3},{t:'monitors',x:22,y:78,w:192,h:62,n:2},
   {t:'lamp',x:15,y:40,w:56,color:'#e0a33c'},{t:'lamp',x:21,y:40,w:56,color:'#6dc28f'}]},
  {name:'Containment Corridor',x0:27,x1:38,floorStyle:'grate',stripe:'#e0524a',deco:[
   {t:'pipes',x:27,y:44,w:12*T},{t:'sign',x:27.4,y:70,w:176,h:44,text:'CONTAINMENT|CORRIDOR C',fs:14,color:'#f0716a'},{t:'tubeglass',x:29.4,y:78,w:128,h:100},
   {t:'sign',x:36.4,y:70,w:192,h:44,text:'LEVEL 3 ACCESS|AUTHORIZED ONLY',fs:12},{t:'lamp',x:28,y:40,w:56,color:'#e0524a'},{t:'lamp',x:34,y:40,w:56,color:'#e0a33c'},{t:'cracks',x:32.1,y:96,w:50,h:60}]}
 ],
 gates:[
  {id:'g1',x:13,y0:5,n:3,openIf:f('z1_gate1')},
  {id:'g2',x:26,y0:5,n:3,openIf:pd(1)}
 ],
 doors:[
  {id:'entry',x:2,kind:'return',to:null,openIf:function(){return false;},locked:'The main entrance is sealed from the outside. The only way forward is deeper into the facility.',sign:'MAIN ENTRANCE|SEALED'},
  {id:'exit',x:33,kind:'exit',to:2,openIf:pd(1),locked:'The containment corridor exit is locked. Restore the surveillance console to unlock it.',sign:'TO CELLULAR|ENERGY LAB'}
 ],
 props:[
  P('desk',320,230,192,64,52,null),
  P('chair',396,300,40,30,48,null),
  P('locker',640,196,128,48,128,{dent:true}),
  P('shelf',96,196,96,48,120,null),
  P('cart',100,560,60,40,50,null),
  P('crate',704,560,64,64,52,null),
  P('desk',960,230,128,64,52,null),
  P('chair',1010,300,40,30,48,null),
  P('console',1150,300,128,60,84,{},{id:'z1_console'}),
  P('server',1500,196,80,56,128,null),
  P('server',1590,196,80,56,128,null),
  P('crate',1560,540,64,64,52,null),
  P('crate',1620,570,64,64,52,null),
  P('tube',1780,196,72,72,160,{broken:true}),
  P('tube',1880,196,72,72,160,{}),
  P('tube',1980,196,72,72,160,{broken:true}),
  P('gurney',2290,520,128,56,44,null),
  P('crate',2420,300,64,64,52,null)
 ],
 decals:[
  {t:'glass',x:420,y:560,w:120,h:60,n:20},{t:'blood',x:560,y:470,w:70,h:30},{t:'cable',x:200,y:620,w:220,h:30},
  {t:'stain',x:760,y:360,r:60},{t:'stain',x:1200,y:520,r:80},{t:'cable',x:1000,y:640,w:260,h:34},
  {t:'text',x:448,y:612,text:'KEEP CLEAR',fs:18},{t:'blood',x:2000,y:430,w:120,h:50},{t:'glass',x:1990,y:300,w:140,h:50,n:24},
  {t:'blood',x:2200,y:600,w:100,h:40},{t:'puddle',x:1370,y:600,w:90,h:34}
 ],
 lights:[
  {x:130,y:140,r:230,color:'#e0a33c',flick:true},{x:520,y:140,r:230,color:'#e0a33c'},{x:900,y:300,r:140,color:'#e0a33c'},
  {x:1000,y:140,r:230,color:'#e0a33c',flick:true},{x:1380,y:140,r:260,color:'#6dc28f'},{x:1800,y:140,r:230,color:'#e0524a',flick:true},{x:2200,y:140,r:240,color:'#e0a33c'}
 ],
 objects:[
  {id:'z1_log',kind:'pickup',item:'doc_log',x:432,y:290,label:'Pick up Security shift log'},
  {id:'z1_card',kind:'pickup',item:'access_card',x:480,y:575,label:'Pick up Damaged access card'},
  {id:'z1_reader',kind:'use',x:13*T-30,y:384,r:96,item:'access_card',flag:'z1_gate1',label:'Swipe card at the card reader',
   labelDone:'Card reader (unlocked)',missing:'The card reader is dark and the door is sealed. It needs a card with a readable strip.',done:'The damaged card still reads. The reader beeps and the sealed door to the Surveillance Office slides open.'},
  {id:'z1_cell',kind:'pickup',item:'power_cell',x:1592,y:520,label:'Pick up Backup power cell',visibleIf:f('z1_gate1')},
  {id:'z1_note1',kind:'note',x:700,y:330,r:80,label:'Read the security whiteboard',text:'WHITEBOARD: "Z-03 containment test, night shift. Door 3 alarm at 02:17. Footage requested by executives. Reminder: official reports must match the approved footage reel." Someone has underlined "approved footage reel" twice.'},
  {id:'z1_note2',kind:'note',x:2062,y:410,r:90,label:'Examine the broken containment cell',text:'The glass of Containment Cell 3 is shattered outward, not inward. Fluid has dried on the floor. Whatever was inside was able to move, but the cell door shows no sign of being forced.'},
  {id:'z1_console',kind:'puzzle',puzzle:1,x:1214,y:372,r:100,item:'power_cell',flag:'z1_console',label:'Use the surveillance console',
   missing:'The surveillance console is dead. A small emergency power cell could revive it.',insert:'You seat the power cell. The console hums and the screens flicker to life.'}
 ],
 steps:[
  {t:'Search the Security Lobby for a way through the sealed door. Look for an access card.',done:has('access_card')},
  {t:'Swipe the access card at the card reader beside the sealed door.',done:f('z1_gate1')},
  {t:'Find a backup power cell in the Surveillance Office.',done:has('power_cell')},
  {t:'Insert the power cell and examine the surveillance timeline at the console.',done:pd(1)},
  {t:'The containment corridor is unlocked. Go through the exit door to the Cellular Energy Lab.',done:vis(2)}
 ]};
})();
