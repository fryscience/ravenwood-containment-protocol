/* RAVENWOOD: THE LAST MISSION | ui.js
   Modal framework, inventory, journal, map, Investigation Menu, pause menu, intro,
   confirmation bar, toolbar wiring, global keys, preferences, stage sizing. */
(function(){
'use strict';
var Z=window.Z,U=Z.UI={},E=Z.Engine,$=Z.$,esc=Z.esc;
var cur=null;          // current modal record
var panelKind=null;    // 'inv','jour','map','guide','menu' when a panel is open
var panelState={inv:'',jour:'over',menu:'main'};
var confirmCb=null,confirmOpener=null;

/* ---------- preferences ---------- */
var prefs={reduce:false,hc:false,size:0};
function loadPrefs(){try{var o=JSON.parse(window.localStorage.getItem(Z.PREFS_KEY)||'null');if(Z.isObj(o)){prefs.reduce=o.reduce===true;prefs.hc=o.hc===true;prefs.size=Z.int(o.size,0,0,2);}}catch(e){}}
function savePrefs(){try{window.localStorage.setItem(Z.PREFS_KEY,JSON.stringify(prefs));}catch(e){}}
function applyPrefs(){
  var h=document.documentElement;
  h.classList.toggle('reduce',prefs.reduce);h.classList.toggle('hc',prefs.hc);
  h.classList.remove('size-1','size-2');if(prefs.size>0)h.classList.add('size-'+prefs.size);
  U.updateStageSize();
}

/* ---------- stage sizing ---------- */
U.updateStageSize=function(){
  var bar=$('#bar'),h=(bar?bar.offsetHeight:0)+($('#team-panel')?$('#team-panel').offsetHeight:0);
  document.documentElement.style.setProperty('--barh',h+'px');
  if(E.resize)E.resize();
};

/* ---------- modal framework ---------- */
var FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function visibleFocusables(root){return Z.$$(FOCUSABLE,root).filter(function(e){return !e.hidden&&e.offsetParent!==null;});}
U.modal=function(o){
  var opener=document.activeElement;
  if(cur){var prev=cur;prev.opener=null;prev.close();}
  var root=$('#modal-root');
  var ov=document.createElement('div');ov.className='overlay';
  var m=document.createElement('div');m.className='modal '+(o.cls||'');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','modal-title');
  m.innerHTML='<header><h2 id="modal-title"></h2><button type="button" class="btn small" id="modal-close">Close <kbd>Esc</kbd></button></header><div class="body" tabindex="-1"></div>';
  m.querySelector('h2').textContent=o.title||'';
  ov.appendChild(m);root.appendChild(ov);
  var rec={required:o.required===true,el:m,ov:ov,body:m.querySelector('.body'),onClose:o.onClose,opener:opener,closed:false};
  E.block();Z.TTS.stop(true);
  m.querySelector('#modal-close').addEventListener('click',function(){rec.close();});
  m.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var f=visibleFocusables(m);if(!f.length)return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  rec.focusFirst=function(){
    var f=visibleFocusables(rec.body);
    var t=f[0]||m.querySelector('#modal-close');
    try{t.focus({preventScroll:true});}catch(e){t.focus();}
  };
  rec.close=function(){
    if(rec.required&&!rec.allowClose)return;
    if(rec.closed)return;rec.closed=true;
    Z.TTS.stop(true);
    if(ov.parentNode)ov.parentNode.removeChild(ov);
    if(cur===rec){cur=null;panelKind=null;}
    E.unblock();
    if(rec.onClose)rec.onClose();
    var op=rec.opener;
    if(op&&document.body.contains(op)&&op!==document.body&&!op.disabled){try{op.focus();}catch(e){$('#game').focus();}}else $('#game').focus();
    E.onPrompt(E.nearest);
  };
  cur=rec;panelKind=null;
  return rec;
};
U.closeAll=function(quiet){
  if(cur){var c=cur;if(quiet)c.opener=null;c.close();}
  if(!$('#confirm').hidden)hideConfirm(true);
};
U.isModalOpen=function(){return !!cur;};

/* ---------- confirmation bar ---------- */
function hideConfirm(silent){
  $('#confirm').hidden=true;confirmCb=null;U.updateStageSize();
  var op=confirmOpener;confirmOpener=null;
  if(!silent&&op&&document.body.contains(op)){try{op.focus();}catch(e){}}
}
U.confirm=function(msg,yesLabel,cb){
  confirmOpener=document.activeElement;confirmCb=cb;
  $('#confirm-msg').textContent=msg;$('#confirm-yes').textContent=yesLabel||'Yes';$('#confirm').hidden=false;
  U.updateStageSize();Z.announce(msg);
  $('#confirm').scrollIntoView&&$('#confirm').scrollIntoView({block:'nearest'});
  $('#confirm-no').focus();
};
function initConfirm(){
  $('#confirm-yes').addEventListener('click',function(){var cb=confirmCb;hideConfirm(false);if(cb)cb();});
  $('#confirm-no').addEventListener('click',function(){hideConfirm(false);Z.notice('Cancelled. Nothing was changed.');});
}

/* ---------- helpers ---------- */
function roomAt(zone,x){
  var t=Math.floor(x/64),r=null;
  zone.rooms.forEach(function(rm){if(t>=rm.x0&&t<=rm.x1+1)r=rm;});
  return r?r.name:zone.name;
}
function tabs(list,sel,id){
  return '<div class="tabs" role="tablist" aria-label="'+esc(id)+'">'+list.map(function(t){
    return '<button type="button" class="btn" role="tab" id="tab-'+t[0]+'" data-tab="'+t[0]+'" aria-selected="'+(sel===t[0])+'">'+esc(t[1])+'</button>';
  }).join('')+'</div>';
}
function openPanel(kind,title,cls,render,after){
  var already=cur&&panelKind===kind;
  if(already){cur.close();return;}
  var rec=U.modal({title:title,cls:cls});
  panelKind=kind;rec.render=render;rec.after=after;
  render(rec);
  setTimeout(function(){rec.focusFirst();},0);
  return rec;
}
function rerender(){
  if(!cur||!panelKind||!cur.render)return;
  var rec=cur,sc=rec.body.scrollTop,ae=document.activeElement,id=ae&&ae.id&&rec.body.contains(ae)?ae.id:'',tab=ae&&ae.dataset&&ae.dataset.tab&&rec.body.contains(ae)?ae.dataset.tab:'';
  rec.render(rec);rec.body.scrollTop=sc;
  var t=id?rec.body.querySelector('#'+id):null;if(!t&&tab)t=rec.body.querySelector('[data-tab="'+tab+'"]');
  if(t){try{t.focus({preventScroll:true});}catch(e){t.focus();}}
}
U.refreshPanels=function(){if(cur&&panelKind&&panelKind!=='menu')rerender();};

/* ---------- INVENTORY ---------- */
function invEntries(){
  var out={tools:[],access:[],evidence:[],records:[]},s=Z.state;
  Object.keys(Z.ITEMS).forEach(function(id){
    if(!s.items[id])return;var it=Z.ITEMS[id];out[it.cat].push({id:id,name:it.name,item:it,used:!!s.used[id]});
  });
  var col=Z.evCollected();
  Z.EVID_ORDER.forEach(function(id){if(col[id]){var e=Z.EVID[id];out.evidence.push({id:id,name:e.t,ev:e});}});
  return out;
}
function renderInv(rec){
  var list=invEntries(),sel=panelState.inv,all=[];
  Z.CATS.forEach(function(c){list[c[0]].forEach(function(x){all.push(x);});});
  if(!all.some(function(x){return x.id===sel;}))sel=panelState.inv=(all[0]&&all[0].id)||'';
  var h='<p class="no-read">Your flashlight is a personal tool. Access cards and power cells are shared quest items; records and verified evidence belong to the team. Select an entry to read about it.</p><div class="inv-grid"><div>';
  Z.CATS.forEach(function(c){
    h+='<h3>'+esc(c[1])+' <span class="chip">'+list[c[0]].length+'</span></h3>';
    if(!list[c[0]].length)h+='<p class="muted" style="color:var(--muted)">'+(c[0]==='evidence'?'No evidence proven yet. Solve the puzzles to add evidence.':'Nothing here yet.')+'</p>';
    list[c[0]].forEach(function(x){
      h+='<button type="button" class="itembtn" id="it-'+x.id+'" data-item="'+x.id+'" aria-pressed="'+(sel===x.id)+'"><span>'+esc(x.name)+'</span>'+(x.used?'<span class="chip ok">Used</span>':'')+(x.ev&&x.ev.claim?'<span class="chip red">Rejected claim</span>':'')+'</button>';
    });
  });
  h+='</div><div class="card" aria-live="polite">';
  var cur2=all.filter(function(x){return x.id===sel;})[0];
  if(!cur2)h+='<h3>Nothing selected</h3><p>Pick up items in the facility to fill your inventory.</p>';
  else if(cur2.item){
    var it=cur2.item;
    h+='<h3>'+esc(it.name)+'</h3><p>'+esc(it.desc)+'</p>';
    if(it.use)h+='<p><b>Purpose:</b> '+esc(it.use)+'</p>';
    if(it.text)h+='<div class="memo"><span class="stamp">'+(it.cat==='records'?'RECORD':'NOTE')+'</span><br>'+esc(it.text)+'</div>';
    if(it.cat==='access'||it.cat==='tools'&&cur2.id!=='flashlight'){
      h+='<p style="margin-top:.6rem">'+(cur2.used?'<span class="chip ok">Already used</span>':'<button type="button" class="btn gold" id="use-btn" data-use="'+cur2.id+'">Use this item here</button>')+'</p>';
    }
  }else{
    h+='<h3>'+esc(cur2.ev.t)+'</h3><p>'+esc(cur2.ev.d)+'</p><p><span class="chip '+(cur2.ev.claim?'red':'ok')+'">'+(cur2.ev.claim?'Rejected claim':'Supported evidence')+'</span> <span class="chip">Zone '+cur2.ev.ph+'</span></p>';
  }
  h+='</div></div>';
  rec.body.innerHTML=h;
}
function bindInv(rec){
  rec.body.addEventListener('click',function(e){
    var b=e.target.closest('[data-item]');if(b){panelState.inv=b.dataset.item;Z.Audio.click();rerender();return;}
    var u=e.target.closest('[data-use]');if(u){Z.Game.useItem(u.dataset.use);}
  });
}
U.openInventory=function(){var r=openPanel('inv','Inventory','',renderInv);if(r)bindInv(r);};

/* ---------- JOURNAL ---------- */
function loreNotes(){
  var out=[];Object.keys(Z.ZONES).forEach(function(k){Z.ZONES[k].objects.forEach(function(o){if(o.kind==='note'&&Z.state.lore[o.id])out.push({z:Z.ZONES[k],o:o});});});return out;
}
function renderJour(rec){
  var sel=panelState.jour,h=Z.Investigators.journal()+'<p>Team Journal: scientific evidence and field notes are shared with every room member.</p>'+tabs([['over','Case overview'],['evid','Evidence'],['conc','Concepts'],['notes','Field notes']],sel,'Journal sections');
  if(sel==='over'){
    var o=Z.Game.objectiveInfo(),hi=Z.hypIndex();
    h+='<div class="card"><h3>Working hypothesis</h3><p>'+esc(Z.HYP[hi])+'</p></div>';
    h+='<div class="card"><h3>Team mission progress</h3><p>'+Z.doneCount()+' of 6 investigations verified, including independent teammate reviews.</p><div class="meter" role="img" aria-label="'+Z.doneCount()+' of 6 complete"><i style="width:'+Math.round(Z.doneCount()/6*100)+'%"></i></div></div>';
    h+='<div class="card"><h3>Zone '+o.zone.id+' objectives: '+esc(o.zone.name)+'</h3><ol>';
    o.steps.forEach(function(s){var d=s.done();h+='<li>'+(d?'<span class="chip ok">Done</span> ':'')+esc(s.t)+'</li>';});
    h+='</ol>';
    var cs=o.cur;if(cs&&cs.hint)h+='<details class="hint"><summary>Hint for the current objective</summary><div>'+esc(cs.hint)+'</div></details>';
    h+='</div>';
  }else if(sel==='evid'){
    var col=Z.evCollected(),n=0;Z.EVID_ORDER.forEach(function(id){if(col[id])n++;});
    h+='<p>'+n+' of '+Z.EVID_ORDER.length+' evidence cards collected. Rejected claims are kept so you can see why they fail.</p>';
    Z.EVID_ORDER.forEach(function(id){
      var e=Z.EVID[id];
      if(col[id])h+='<div class="card"><h3>'+esc(e.t)+'</h3><p>'+esc(e.d)+'</p><span class="chip '+(e.claim?'red':'ok')+'">'+(e.claim?'Rejected claim':'Supported evidence')+'</span> <span class="chip">Zone '+e.ph+'</span></div>';
      else h+='<div class="card" style="opacity:.7"><h3>Locked evidence</h3><p>Found by solving the puzzle in Zone '+e.ph+'.</p></div>';
    });
  }else if(sel==='conc'){
    var cu=Z.conceptsUnlocked();
    Object.keys(Z.CONCEPTS).forEach(function(id){var c=Z.CONCEPTS[id];
      if(cu[id])h+='<div class="card"><h3>'+esc(c.t)+'</h3><p>'+esc(c.d)+'</p></div>';
      else h+='<div class="card" style="opacity:.7"><h3>Locked concept</h3><p>Unlocked by your investigation.</p></div>';});
  }else{
    var ln=loreNotes();
    if(!ln.length)h+='<p>No field notes yet. Examine whiteboards, damaged equipment and other details in the facility.</p>';
    ln.forEach(function(x){h+='<div class="card"><h3>Zone '+x.z.id+': '+esc(roomAt(x.z,x.o.x))+'</h3><p>'+esc(x.o.text)+'</p></div>';});
  }
  rec.body.innerHTML=h;
}
function bindTabs(key){return function(rec){rec.body.addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(!b)return;panelState[key]=b.dataset.tab;Z.Audio.click();rerender();});};}
U.openJournal=function(){var r=openPanel('jour','Investigator Journal','',renderJour);if(r)bindTabs('jour')(r);};

/* ---------- MAP ---------- */
function drawMap(cv){
  var g=cv.getContext('2d'),W=cv.width,H=cv.height,s=Z.state;
  g.clearRect(0,0,W,H);g.fillStyle='#05080a';g.fillRect(0,0,W,H);
  var cz=E.zone?E.zone.id:s.zone;
  // chain of six zones
  var bw=92,gap=16,x0=(W-(6*bw+5*gap))/2;
  g.font='bold 13px Segoe UI,Arial';g.textAlign='center';
  for(var i=1;i<=6;i++){
    var x=x0+(i-1)*(bw+gap),y=24,vis=!!s.visited[i],dn=Z.puzzleDone(i);
    if(i<6){g.strokeStyle=vis?'#6dc28f':'#2b373e';g.lineWidth=2;g.beginPath();g.moveTo(x+bw,y+28);g.lineTo(x+bw+gap,y+28);g.stroke();}
    g.fillStyle=dn?'#173126':(vis?'#1a2328':'#0b1014');g.fillRect(x,y,bw,56);
    g.strokeStyle=i===cz?'#d8b24e':(vis?'#6dc28f':'#2b373e');g.lineWidth=i===cz?3:1.5;g.strokeRect(x,y,bw,56);
    g.fillStyle=vis?'#e8eeea':'#6b7a72';g.fillText('Zone '+i,x+bw/2,y+22);
    g.font='11px Segoe UI,Arial';g.fillStyle=dn?'#6dc28f':(vis?'#aab7b0':'#4a5a52');g.fillText(dn?'Complete':(vis?(i===cz?'You are here':'Visited'):'Locked'),x+bw/2,y+42);g.font='bold 13px Segoe UI,Arial';
  }
  // current zone layout
  var z=E.zone;if(!z)return;
  var lx=30,ly=130,lw=W-60,lh=150,sc=lw/(z.w*64);
  g.fillStyle='#0b1014';g.fillRect(lx,ly,lw,lh);g.strokeStyle='#2b373e';g.lineWidth=1;g.strokeRect(lx,ly,lw,lh);
  g.textAlign='center';
  z.rooms.forEach(function(rm,idx){
    var rx=lx+rm.x0*64*sc,rw=(rm.x1-rm.x0+1)*64*sc;
    g.fillStyle=idx%2?'#10181c':'#131d22';g.fillRect(rx,ly+4,rw,lh-8);
    g.fillStyle='#aab7b0';g.font='12px Segoe UI,Arial';g.fillText(rm.name,rx+rw/2,ly+20);
  });
  z.gates.forEach(function(gt){var open=gt.openIf();g.fillStyle=open?'#6dc28f':'#e0524a';g.fillRect(lx+gt.x*64*sc-1,ly+lh*0.5-12,6,24);});
  z.doors.forEach(function(d){var open=d.openIf();g.fillStyle=open?'#d8b24e':'#7d6420';g.fillRect(lx+(d.x*64+64)*sc-8,ly+6,16,8);});
  z.objects.forEach(function(o){
    if(o.visibleIf&&!o.visibleIf())return;if(o.kind==='pickup'&&s.items[o.item])return;
    var done=(o.kind==='puzzle'&&Z.puzzleDone(o.puzzle))||(o.kind==='use'&&s.flags[o.flag])||(o.kind==='note'&&s.lore[o.id]);
    g.fillStyle=done?'#3d5a4a':(o.kind==='note'?'#aab7b0':'#d8b24e');
    g.beginPath();g.arc(lx+o.x*sc,ly+60+(o.y/(z.h*64))*70,4,0,6.3);g.fill();
  });
  var p=E.player;g.fillStyle='#fff';g.beginPath();g.arc(lx+p.x*sc,ly+60+(p.y/(z.h*64))*70,6,0,6.3);g.fill();g.strokeStyle='#d8b24e';g.lineWidth=2;g.stroke();
  g.fillStyle='#aab7b0';g.font='11px Segoe UI,Arial';g.textAlign='left';
  g.fillText('White dot: you.  Gold dots: things to examine.  Dim dots: finished.  Green and red bars: open and closed gates.',lx,ly+lh+16);
}
function renderMap(rec){
  var s=Z.state,h='<p class="no-read">The map shows every zone and the rooms of the zone you are in. You can return to any zone you have already reached.</p><canvas class="minimap" id="mm" width="900" height="320" role="img" aria-label="Facility map. Zone '+(E.zone?E.zone.id:1)+' is the current zone."></canvas>';
  h+='<div class="card"><h3>Travel</h3><ul style="list-style:none;padding:0;margin:0;display:grid;gap:.4rem">';
  for(var i=1;i<=6;i++){
    var z=Z.ZONES[i],vis=!!s.visited[i]&&z,here=E.zone&&E.zone.id===i;
    h+='<li>';
    if(!z){h+='<span class="chip">Zone '+i+'</span> Not available';}
    else if(!vis)h+='<span class="chip">Zone '+i+'</span> Locked. Reach this zone through the exit door of the previous zone.';
    else h+='<button type="button" class="btn" data-go="'+i+'"'+(here?' aria-current="true"':'')+'>Zone '+i+': '+esc(z.name)+(here?' (you are here)':'')+'</button> '+(Z.puzzleDone(i)?'<span class="chip ok">Puzzle complete</span>':'<span class="chip gold">In progress</span>');
    h+='</li>';
  }
  h+='</ul></div>';
  rec.body.innerHTML=h;drawMap(rec.body.querySelector('#mm'));
}
U.openMap=function(){
  var r=openPanel('map','Facility Map','',renderMap);
  if(r)r.body.addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(!b)return;var id=parseInt(b.dataset.go,10);if(E.zone&&E.zone.id===id){Z.notice('You are already in this zone.');return;}Z.Game.travel(id,'map');});
};

/* ---------- INVESTIGATION MENU (walk-free access) ---------- */
function objName(o){
  var l=o.label;if(typeof l==='function')l=l();
  if(o.labelDone&&o.flag&&Z.state.flags[o.flag])l=o.labelDone;
  return l;
}
function objStatus(o){
  if(o.kind==='puzzle'&&Z.puzzleDone(o.puzzle))return 'Complete';
  if(o.kind==='use'&&Z.state.flags[o.flag])return 'Done';
  if(o.kind==='note'&&Z.state.lore[o.id])return 'Read';
  return '';
}
function renderGuide(rec){
  var z=E.zone,h='<p>This menu lets you reach anything in the room without walking. Choose an entry and your investigator walks there and interacts for you. It does the same thing as walking up and pressing <kbd>E</kbd>. Use it if movement is hard or you prefer menus.</p>';
  h+='<h3>Zone '+z.id+': '+esc(z.name)+'</h3><div class="card"><h3>Things to examine</h3><ul style="list-style:none;padding:0;margin:0;display:grid;gap:.4rem">';
  var n=0;
  z.objects.forEach(function(o,i){
    if(o.visibleIf&&!o.visibleIf())return;if(o.kind==='pickup'&&Z.state.items[o.item])return;
    n++;var st=objStatus(o);
    h+='<li style="display:flex;flex-wrap:wrap;gap:.4rem .8rem;align-items:center;justify-content:space-between"><span><b>'+esc(objName(o))+'</b><br><span style="color:var(--muted);font-size:.84rem">'+esc(roomAt(z,o.x))+'</span> '+(st?'<span class="chip ok">'+st+'</span>':'')+'</span><button type="button" class="btn small primary" id="go-o'+i+'" data-obj="'+i+'">Go and use</button></li>';
  });
  if(!n)h+='<li>Nothing new to examine here.</li>';
  h+='</ul></div><div class="card"><h3>Doors</h3><ul style="list-style:none;padding:0;margin:0;display:grid;gap:.4rem">';
  z.doors.forEach(function(d,i){
    var open=d.openIf()&&d.to!=null;
    h+='<li style="display:flex;flex-wrap:wrap;gap:.4rem .8rem;align-items:center;justify-content:space-between"><span><b>'+esc((d.sign||d.id).replace('|',' '))+'</b> <span class="chip '+(open?'ok':'red')+'">'+(open?'Open':'Locked')+'</span></span><button type="button" class="btn small" id="go-d'+i+'" data-door="'+i+'">Go to door</button></li>';
  });
  h+='</ul></div>';
  rec.body.innerHTML=h;
}
function walkAndInteract(obj,tx,ty,name){
  U.closeAll(true);
  Z.announce('Walking to '+name+'.');
  var ok=E.walkTo(tx,ty,function(arrived){
    if(!arrived){Z.notice('You cannot get there yet. Something is blocking the way, such as a closed gate or a locked door. Check your objective.','warn');return;}
    E.setPlayer(E.player.x,E.player.y,E.player.dir);
    Z.Game.interact(obj);
  });
  if(!ok)Z.notice('You cannot get there yet. Something is blocking the way, such as a closed gate or a locked door. Check your objective.','warn');
}
U.openGuide=function(){
  var r=openPanel('guide','Investigation Menu','',renderGuide);
  if(!r)return;
  r.body.addEventListener('click',function(e){
    var z=E.zone,b=e.target.closest('[data-obj]');
    if(b){var o=z.objects[parseInt(b.dataset.obj,10)];walkAndInteract(o,o.x,o.y+30,objName(o));return;}
    b=e.target.closest('[data-door]');
    if(b){var d=z.doors[parseInt(b.dataset.door,10)];walkAndInteract(E.doorObj(d),d.x*64+64,270,'the door');}
  });
};

/* ---------- PAUSE MENU ---------- */
var CONTROLS=[['W A S D or Arrow keys','Move'],['E','Interact with the highlighted object (a prompt shows what it will do)'],['I','Inventory'],['J','Journal'],['M','Map'],['Esc','Pause menu, or close the open panel'],['Tab','Move between buttons in a panel'],['Hint button','Shows an optional hint for the current objective']];
function renderMenu(rec){
  var sel=panelState.menu,h=tabs([['main','Pause'],['ctl','Controls'],['acc','Accessibility'],['sv','Saving'],['about','About']],sel,'Menu sections');
  if(sel==='main'){
    h+='<p>The game is paused. Nothing in the facility can hurt you, and there is no timer.</p><div style="display:grid;gap:.5rem;max-width:420px"><button type="button" class="btn primary" id="m-resume">Resume investigation</button><button type="button" class="btn" id="m-cert">Level Z-03 Clearance certificate'+(Z.certReady()?'':' (locked)')+'</button><button type="button" class="btn" id="m-intro">Read the mission briefing again</button></div>';
    h+='<p style="margin-top:.8rem">Progress: '+Z.doneCount()+' of 6 zone investigations complete.</p>';
  }else if(sel==='ctl'){
    h+='<table class="data"><thead><tr><th>Key</th><th>Action</th></tr></thead><tbody>'+CONTROLS.map(function(c){return '<tr><td><kbd>'+esc(c[0])+'</kbd></td><td>'+esc(c[1])+'</td></tr>';}).join('')+'</tbody></table><p style="margin-top:.6rem">Prefer menus? The Investigation Menu reaches every object and door without walking. Every puzzle can be done with a keyboard or mouse and none needs fast reflexes.</p>';
  }else if(sel==='acc'){
    h+='<div class="card"><h3>Display</h3><label class="chk"><input type="checkbox" id="pf-reduce"'+(prefs.reduce?' checked':'')+'> Reduce motion (no screen fades, drifting dust or fog, and no camera easing)</label><br><label class="chk"><input type="checkbox" id="pf-hc"'+(prefs.hc?' checked':'')+'> Higher contrast text and borders</label><p style="margin-top:.5rem"><label for="pf-size">Text size </label><select id="pf-size"><option value="0">Normal</option><option value="1">Large</option><option value="2">Extra large</option></select></p></div>';
    h+='<div class="card"><h3>Other supports</h3><ul><li>Read-aloud buttons in the top bar read the open panel or the on-screen objective. You can pause, resume, stop and change speed.</li><li>Sound and music are off until you turn them on. Effects are gentle and there are no jump scares.</li><li>Optional hints are in the Hint button and in the Journal.</li><li>Your browser may also have its own reduced-motion setting, which this game respects.</li></ul></div>';
  }else if(sel==='sv'){
    h+='<div class="card"><h3>How saving works</h3><p>Your progress saves automatically in this browser on this device. It does not follow you to another computer or after clearing site data.</p><p>To keep progress safe or move it, use Download Backup in the top bar. Import Backup restores the file. A backup is a record of progress only. It is not what you submit for the certificate.</p><div style="display:flex;flex-wrap:wrap;gap:.5rem"><button type="button" class="btn" id="m-save">Save progress now</button><button type="button" class="btn" id="m-exp">Download Backup</button></div></div>';
  }else{
    h+='<div class="card"><h3>About this case file</h3><p>RAVENWOOD: THE LAST MISSION is an optional, ungraded bonus investigation for the Zombie Files unit. All numbers, units and events are fictional. The biology behind them is real: ATP, oxygen, glycolysis, fermentation, reflex arcs and the limits of outside support.</p><p>It follows the Z-02 Final Verdict. Completing it unlocks a personalized certificate you can save as a PDF and upload to your class period\'s squad column on the Ravenwood Wall of Survivors Padlet.</p></div>';
  }
  rec.body.innerHTML=h;
  var s=rec.body.querySelector('#pf-size');if(s)s.value=String(prefs.size);
}
function bindMenu(rec){
  rec.body.addEventListener('click',function(e){
    var t=e.target.closest('[data-tab]');if(t){panelState.menu=t.dataset.tab;Z.Audio.click();rerenderMenu();return;}
    var id=e.target.id;
    if(id==='m-resume')rec.close();
    else if(id==='m-cert'){rec.close();Z.Cert.open();}
    else if(id==='m-intro'){rec.close();U.intro(true);}
    else if(id==='m-save')Z.Save.saveNow(false);
    else if(id==='m-exp')Z.Save.exportFile();
  });
  rec.body.addEventListener('change',function(e){
    var id=e.target.id;
    if(id==='pf-reduce'){prefs.reduce=e.target.checked;savePrefs();applyPrefs();}
    else if(id==='pf-hc'){prefs.hc=e.target.checked;savePrefs();applyPrefs();}
    else if(id==='pf-size'){prefs.size=Z.int(e.target.value,0,0,2);savePrefs();applyPrefs();}
  });
}
function rerenderMenu(){
  var rec=cur,ae=document.activeElement,tab=ae&&ae.dataset&&ae.dataset.tab;
  renderMenu(rec);
  var t=tab?rec.body.querySelector('[data-tab="'+tab+'"]'):null;if(t)t.focus();
}
U.openMenu=function(){
  if(cur&&panelKind==='menu'){cur.close();return;}
  var r=openPanel('menu','Pause Menu','narrow',renderMenu);
  if(r){bindMenu(r);}
};

/* ---------- INTRO ---------- */
U.intro=function(replay){
  var rec=U.modal({title:'Mission Briefing',cls:'narrow',onClose:function(){
    if(!Z.state.introDone){Z.state.introDone=true;Z.Save.saveNow(true);}
    Z.Game.refresh();
  }});
  rec.body.innerHTML='<div class="memo"><span class="stamp">TOP SECRET</span><br>CASE FILE Z-03. LEVEL Z-03 CLEARANCE PENDING.</div>'+
   '<p style="margin-top:.8rem">Your Z-02 verdict exposed the gaps in Ravenwood\'s story about Subject Z-03. Now the company has gone silent and the facility has been abandoned. The doors are sealed. The power is failing. What is left inside is evidence.</p>'+
   '<p>You are the investigator. Walk the facility, collect what Ravenwood left behind, and test every claim against real biology. Nothing here can hurt you, there is no timer, and every puzzle can be retried as often as you like.</p>'+
   '<p><b>Optional and ungraded.</b> This case file is a bonus. Finish all six zones to unlock your Level Z-03 certificate.</p>'+
   '<div class="card"><h3>Quick controls</h3><p><kbd>W A S D</kbd> or <kbd>Arrows</kbd> move. <kbd>E</kbd> interacts. <kbd>I</kbd> inventory, <kbd>J</kbd> journal, <kbd>M</kbd> map, <kbd>Esc</kbd> pause. The Investigation Menu in the top bar gets you to any object without walking. Sound is off until you turn it on.</p></div>'+
   '<p><button type="button" class="btn primary" id="intro-go">'+(replay?'Back to the investigation':'Begin investigation')+'</button></p>';
  rec.body.querySelector('#intro-go').addEventListener('click',function(){rec.close();});
  setTimeout(function(){rec.focusFirst();},0);
};

/* ---------- toolbar and keys ---------- */
function initToolbar(){
  $('#b-inv').addEventListener('click',U.openInventory);
  $('#b-jour').addEventListener('click',U.openJournal);
  $('#b-map').addEventListener('click',U.openMap);
  $('#b-guide').addEventListener('click',U.openGuide);
  $('#b-menu').addEventListener('click',U.openMenu);
  $('#save-btn').addEventListener('click',function(){Z.Save.saveNow(false);});
  $('#export-btn').addEventListener('click',Z.Save.exportFile);
  $('#import-btn').addEventListener('click',function(){$('#file-input').click();});
  $('#file-input').addEventListener('change',function(e){var f=e.target.files&&e.target.files[0];if(f)Z.Save.importFile(f);e.target.value='';});
  $('#reset-btn').addEventListener('click',Z.Save.reset);
  // sound
  var tg=$('#snd-toggle');
  function sndLabel(){tg.textContent=Z.Audio.on?'Sound is on. Mute':'Sound is off. Unmute';tg.setAttribute('aria-pressed',Z.Audio.on?'true':'false');}
  if(!Z.Audio.supported()){tg.disabled=true;tg.textContent='Sound not available';}
  tg.addEventListener('click',function(){var on=!Z.Audio.on;var ok=Z.Audio.setOn(on);if(on&&!ok)Z.notice('Sound could not start in this browser.','warn');sndLabel();if(Z.Audio.on)Z.Audio.click();});
  $('#snd-vol').addEventListener('input',function(e){Z.Audio.setVol(Z.int(e.target.value,50,0,100)/100);});
  $('#snd-music').addEventListener('change',function(e){Z.Audio.setMusic(e.target.checked);});
  $('#snd-sfx').addEventListener('change',function(e){Z.Audio.setSfx(e.target.checked);});
  Z.Audio.setVol(Z.int($('#snd-vol').value,50,0,100)/100);Z.Audio.setMusic($('#snd-music').checked);Z.Audio.setSfx($('#snd-sfx').checked);
  sndLabel();
}
function typing(e){var t=e.target;return t&&(t.tagName==='INPUT'&&t.type!=='checkbox'&&t.type!=='range'||t.tagName==='TEXTAREA'||t.tagName==='SELECT');}
function onKey(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  var k=e.key;
  if(k==='Escape'){
    if(!$('#confirm').hidden){e.preventDefault();$('#confirm-no').click();return;}
    if(Z.Game.dialogOpen())return;
    if(cur){e.preventDefault();cur.close();return;}
    e.preventDefault();U.openMenu();return;
  }
  if(typing(e))return;
  if(Z.Game.dialogOpen())return;
  if(cur&&!panelKind)return;   // a puzzle or intro is open: ignore panel shortcuts
  var l=k.toLowerCase();
  if(l==='i'){e.preventDefault();U.openInventory();}
  else if(l==='j'){e.preventDefault();U.openJournal();}
  else if(l==='m'){e.preventDefault();U.openMap();}
}
U.init=function(){
  loadPrefs();initConfirm();initToolbar();
  window.addEventListener('keydown',onKey);
  window.addEventListener('resize',U.updateStageSize);
  if(window.ResizeObserver)new ResizeObserver(function(){U.updateStageSize();}).observe($('#bar'));
  applyPrefs();
};
})();
