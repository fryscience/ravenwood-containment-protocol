/* Containment Protocol, complete six-zone cooperative source. Netlify Function transport; no mock online mode. */
(function(){
'use strict';
var Z=window.Z,P=window.RavenwoodProtocol,N=Z.Net={},A=null,uid='',code='',slot='',session='',isConnected=false,started=false,inWorld=false,presenceReady=false;
var slots={},presence={},facts={},timeline={},notes={},positions={},messages={},remotes={},subscriptions=[],connectionSub=null,disconnectOp=null;
var lobby=null,view='menu',busy=false,chosen=null,networkBlock=false,sendAcc=0,idleAcc=0,lastPose=null,sending=false,seq=0,generation=0,seenMessages={},lastStart=false;
var $=Z.$,esc=Z.esc,X=Z.TeamScience,proofs={},consoleStates={},leases={},reviews={},queues={},pending={},buffers={},inputTimers={},openConsole=0,leaseAcc=0;
var scienceDone=Z.puzzleDone;Z.puzzleDone=function(n){return scienceDone(n)&&(n===1||Object.keys(reviews[n]||{}).length>0);};
var originalCertReady=Z.certReady;Z.certReady=function(){return originalCertReady()&&N.eligible();};
Z.APP_ID='ravenwood-containment-protocol';Z.KEY='ravenwood.containment.netlify.local.v3';Z.PREFS_KEY='ravenwood.containment.prefs.v1';
N.active=function(){return !!code&&started&&presenceReady&&isConnected;};
N.room=function(){return code;};
function store(k,v){try{sessionStorage.setItem('rwcp.'+k,v);}catch(e){}}
function restore(k){try{return sessionStorage.getItem('rwcp.'+k)||'';}catch(e){return '';}}
function say(t,warn){Z.notice(t,warn?'warn':undefined);}
function failure(e){say(P.error(e),true);}
function path(s){return 'rooms/'+code+'/'+s;}
function closeLobby(){if(lobby){lobby.allowClose=true;lobby.close();lobby=null;}}
function disableGameControls(disabled){Z.$$('.bar-main button,.tools [aria-label="Progress"] button').forEach(function(b){b.disabled=disabled;});$('#b-team').disabled=false;['import-btn','export-btn','reset-btn'].forEach(function(id){$('#'+id).disabled=true;});}
function profileRecord(){return Z.Investigators.make(chosen?.id||'vale',chosen?.codename||'');}
function label(player){var profile=Z.Investigators.profiles.find(function(p){return p.id===player.investigator;});return player.codename||(profile?profile.name:'Investigator');}
function isMember(){return P.roster(slots,presence).some(function(p){return p.uid===uid;});}
function setNetworkBlocked(block){if(block&&!networkBlock){Z.Engine.block();Z.Engine.cancelWalk();networkBlock=true;}else if(!block&&networkBlock){Z.Engine.unblock();networkBlock=false;}}
function status(){var text=!A?'Not connected':!isConnected?'Connection lost — movement paused':!code?'Connected to mission service':!presenceReady?'Restoring room presence…':'Room '+code+' · '+P.roster(slots,presence).filter(p=>p.online).length+'/4 connected';var rounds=A?.summary?.();if(rounds&&started)text+=' · Round '+rounds.round+'/3 · Team '+rounds.teamScore+'/600';$('#team-status').textContent=text;$('#team-status').setAttribute('aria-label',text);}
function mainBody(){return '<p class="personnel-kicker">RAVENWOOD / CONTAINMENT PROTOCOL</p><h3>Multiplayer Edition — complete six-zone mission</h3><p>Investigate the containment breach with 2–4 adult investigators. One teammate restores the surveillance console; a different teammate verifies the records. Explore all six zones, share scientific controls, and review one another’s evidence. The mission service connects automatically on a supported Netlify deployment.</p><p class="cp-build-note">All six zones are implemented. Live multiplayer has not yet been verified in two independent browsers.</p><div class="cp-menu"><button class="btn primary" id="cp-host">HOST MISSION</button><label for="cp-code">Room code</label><input id="cp-code" maxlength="12" autocomplete="off" spellcheck="false" placeholder="8-character room code"><button class="btn gold" id="cp-join">JOIN MISSION</button><button class="btn" id="cp-resume" '+(!restore('room')?'disabled':'')+'>REJOIN '+esc(restore('room'))+'</button><button class="btn" id="cp-how">HOW TO PLAY</button><button class="btn" id="cp-settings">ACCESSIBILITY SETTINGS</button><button class="btn" id="cp-character">CHOOSE INVESTIGATOR</button></div><p>Selected: <b>'+esc(chosen?.name||Z.Investigators.profiles.find(p=>p.id===chosen?.id)?.name||'Morgan Vale')+'</b>'+ (chosen?.codename?' · Codename '+esc(chosen.codename):'')+'</p><p>No student email or real name is needed. Room codes are private invitation codes; share only with your team.</p>';
}
function showLobby(){
 closeLobby();disableGameControls(true);lobby=Z.UI.modal({title:'Ravenwood: Containment Protocol',cls:'cp-lobby',required:true});lobby.el.querySelector('#modal-close').hidden=true;
 lobby.body.innerHTML=code?roomBody():mainBody();bindLobby();setTimeout(function(){lobby?.focusFirst();},0);status();
}
function roomBody(){var roster=P.roster(slots,presence),host=P.host(slots,presence),me=roster.find(p=>p.uid===uid);
 return '<p class="personnel-kicker">TEAM ASSEMBLY / SECURITY WING</p><p>Room code: <strong class="cp-code">'+esc(code)+'</strong> <button class="btn small" id="cp-copy">Copy code</button></p><p>'+ (isConnected&&presenceReady?'Connected to mission service.':'Waiting for connection and presence…')+'</p><ul class="cp-roster">'+roster.map(function(p){return '<li><b>'+esc(label(p))+'</b> — '+esc(Z.Investigators.profiles.find(x=>x.id===p.investigator)?.specialty||'Investigator')+'<br>'+ (p.uid===host?'Host · ':'')+(p.uid===uid?'You · ':'')+(p.online?'Online':'Disconnected')+' · '+(p.ready?'Ready':'Not ready')+'</li>';}).join('')+'</ul><p>Host status passes to the first connected occupied slot if the host disconnects. Up to four players can join before the mission starts.</p><p><button class="btn primary" id="cp-ready" '+(started||!presenceReady?'disabled':'')+'>'+(me?.ready?'Mark not ready':'I AM READY')+'</button> <button class="btn gold" id="cp-start" '+(!P.canStart(uid,slots,presence)||started||!presenceReady?'disabled':'')+'>START MISSION</button></p><p>At least two connected investigators must be ready. Starting locks the roster; existing members can reconnect.</p><p><button class="btn" id="cp-leave">Leave room</button></p>';
}
function refreshLobby(){if(!lobby||!code||view!=='menu')return;var focus=document.activeElement?.id,scroll=lobby.body.scrollTop;lobby.body.innerHTML=roomBody();bindLobby();lobby.body.scrollTop=scroll;if(focus)lobby.body.querySelector('#'+focus)?.focus();}
function bindLobby(){if(!lobby)return;var b=lobby.body;function on(id,fn){b.querySelector('#'+id)?.addEventListener('click',function(){Promise.resolve().then(fn).catch(failure);});}
 on('cp-host',function(){return guard(host);});on('cp-join',function(){var c=P.code(b.querySelector('#cp-code').value);return guard(function(){return join(c);});});on('cp-resume',function(){return guard(function(){return join(restore('room'));});});
 on('cp-how',showHow);on('cp-settings',showSettings);on('cp-character',chooseInvestigator);on('cp-ready',async function(){var me=slots[slot];if(me)await A.patch(path('slots/'+slot),{ready:!me.ready});});
 on('cp-start',async function(){if(!P.canStart(uid,slots,presence))throw Error('Two connected investigators must be ready, and only the current host can start.');await A.transaction(path('control/started'),function(v){return v?undefined:{uid:uid,at:A.stamp()};});});
 on('cp-copy',async function(){try{await navigator.clipboard.writeText(code);say('Room code copied.');}catch(e){say('Your room code is '+code+'. Select and copy it from the screen.');}});on('cp-leave',leave);
}
async function guard(fn){if(busy)return;busy=true;try{await fn();}finally{busy=false;}}
function chooseInvestigator(){closeLobby();Z.Investigators.select(function(){chosen=Object.assign({},Z.state.investigator);store('investigator',JSON.stringify(chosen));showLobby();});}
function showHow(){view='how';closeLobby();lobby=Z.UI.modal({title:'How to play — Containment Protocol',required:true});lobby.el.querySelector('#modal-close').hidden=true;lobby.body.innerHTML='<h3>Explore together</h3><ol><li>Host or join the same room. Each player chooses an investigator and marks Ready. The host starts after two players are ready.</li><li>Use WASD or arrow keys to move. Press E to interact. I opens Inventory; J opens the shared Journal; M opens the map; Escape opens your local menu.</li><li>Find the access card and use the reader. Find a backup power cell. Any teammate can use shared quest items.</li><li>One investigator installs the power cell. A different investigator classifies the surveillance records as observations, inferences or unsupported claims. Discuss the evidence; one correct shared verification is enough for the team.</li><li>Use preset team messages to coordinate. No voice chat is required.</li></ol><p>The Investigation Menu provides access to objects for players who have difficulty with precise movement. Read Aloud, sound controls, larger text and reduced motion remain available. Opening a panel or pausing affects your browser only.</p><p>Complete each scientific console, then have a different teammate add an evidence-based review. Continue through all six zones. For final clearance, each participant contributes to the final evidence review; certificate names stay in that player’s browser.</p><button class="btn primary" id="cp-back">Back</button>';lobby.body.querySelector('#cp-back').onclick=function(){view='menu';showLobby();};lobby.focusFirst();}
function showSettings(){closeLobby();Z.UI.openMenu();say('Accessibility controls are available in the menu. Choose Team / Lobby to return.');}
async function connect(){
 if(!Z.Investigators.artReady())throw Error('Investigator artwork did not load. Keep the assets folder intact and reload before connecting.');
 if(location.protocol==='file:')throw Error('Open this game through an HTTP or HTTPS website. Multiplayer requires a deployed game service; opening a local file cannot connect.');
 if(!A){say('Connecting to the mission service…');A=await RavenwoodTransport.connect();uid=A.uid;
 connectionSub=A.watch('.info/connected',function(value){isConnected=value===true;if(!isConnected){presenceReady=false;setNetworkBlocked(inWorld);status();}else if(code)establishPresence().catch(failure);else status();},failure);
 }
 if(!isConnected)await new Promise(function(resolve,reject){var elapsed=0,t=setInterval(function(){elapsed+=100;if(isConnected){clearInterval(t);resolve();}else if(elapsed>=12000){clearInterval(t);reject(Error('The game service did not connect. Check that the Netlify Function was deployed.'));}},100);});
}
function randomCode(){var bytes=new Uint8Array(8);crypto.getRandomValues(bytes);return Array.from(bytes,b=>P.ALPHABET[b%P.ALPHABET.length]).join('');}
async function host(){await connect();for(var attempt=0;attempt<6;attempt++){var c=randomCode(),r=await A.transaction('rooms/'+c+'/meta',function(v){return v?undefined:{version:P.VERSION,creator:uid,createdAt:A.stamp(),expiresAt:Date.now()+23*60*60*1000};});if(r.committed){await join(c);return;}}throw Error('A unique room code could not be allocated. Try hosting again.');}
async function join(c){
 if(!P.validCode(c))throw Error('Enter the eight-character room code. Letters I and O are not used.');if(code)throw Error('Leave your current room before joining another.');
 await connect();var base='rooms/'+c+'/',meta=await A.read(base+'meta');if(!meta||meta.expiresAt<=Date.now())throw Error('That room does not exist or has expired. Ask the host for a current code.');if(meta.version!==P.VERSION)throw Error('This room belongs to an older game version. Host a new six-zone mission.');
 var foundSlots=await A.read(base+'slots')||{},own=Object.keys(foundSlots).find(k=>foundSlots[k].uid===uid);
 if(own!==undefined){slot=own;chosen=Z.Investigators.make(foundSlots[own].investigator,foundSlots[own].codename);}else{
 if(await A.read(base+'control/started').catch(()=>null))throw Error('This mission has started. Only its existing members can reconnect.');
 var accepted=false;for(var i=0;i<4;i++){var result=await A.transaction(base+'slots/'+i,function(v){return P.claim(v,uid,chosen.id,chosen.codename,A.stamp());});if(result.committed&&result.value?.uid===uid){slot=String(i);accepted=true;break;}}
 if(!accepted)throw Error('The room is full. Four investigators are already assigned.');
 }
 code=c;generation++;view='menu';store('room',code);facts={};timeline={};notes={};proofs={};consoleStates={};leases={};reviews={};positions={};presence={};slots=foundSlots;started=false;lastStart=false;inWorld=false;seq=0;remotes={};seenMessages={};lastPose=null;
 try{await establishPresence();showLobby();subscribeRoom();}catch(e){await detach();throw e;}
}
var presenceTask=null;
function establishPresence(){
 if(presenceTask)return presenceTask;
 if(!code||!isConnected||presenceReady)return Promise.resolve();
 var c=code,g=generation,id=A.unique('rooms/'+code+'/presence/'+uid),p='rooms/'+code+'/presence/'+uid+'/'+id,op=A.disconnect(p);
 presenceTask=(async function(){
  await op.remove();await A.write(p,{at:A.stamp()});
  if(c!==code||g!==generation){await A.remove(p).catch(function(){});await op.cancel().catch(function(){});return;}
  session=id;disconnectOp=op;presenceReady=true;status();refreshLobby();if(started)await enterWorld();
 })().finally(function(){presenceTask=null;});return presenceTask;
}

function watch(name,fn){var g=generation;subscriptions.push(A.watch(path(name),function(v){if(g!==generation)return;fn(v||{});},function(e){if(g!==generation)return;failure(e);setNetworkBlocked(inWorld);}));}
function subscribeRoom(){
 watch('slots',function(v){slots=v;if(!isMember()){say('Your room membership is no longer available.',true);leave().catch(failure);return;}refreshLobby();status();});
 watch('presence',function(v){presence=v;refreshLobby();status();});
 watch('control',function(v){started=!!v.started;if(started&&presenceReady)enterWorld().catch(failure);refreshLobby();});
 watch('facts',function(v){facts=v;applyShared();});watch('timeline',function(v){timeline=v;applyShared();});watch('notes',function(v){notes=v;applyShared();});
 watch('proofs',function(v){proofs=v;applyShared();});watch('consoleStates',function(v){consoleStates=v;applyShared();});watch('leases',function(v){leases=v;if(Z.Puzzles.redraw)Z.Puzzles.redraw(document.activeElement?.id);});watch('reviews',function(v){reviews=v;applyShared();});
 watch('positions',function(v){positions=v;});
 watch('messages',function(v){messages=v;Object.keys(v).forEach(function(id){var m=v[id];if(id!==uid&&m.at>Date.now()-12000&&m.at!==(seenMessages[id]||0)){seenMessages[id]=m.at;var p=P.roster(slots,presence).find(p=>p.uid===id);var text=(p?label(p):'Teammate')+': '+m.kind;$('#team-message').textContent=text;Z.announce(text);}});});
}
function applyShared(){
 var v=P.project(facts,timeline,notes);Z.state.items=v.items;Z.state.flags=v.flags;Z.state.lore=v.lore;Z.state.p1.ok=v.ok;Z.state.used={};if(v.flags.z1_gate1)Z.state.used.access_card=true;if(v.flags.z1_console)Z.state.used.power_cell=true;
 for(var n=2;n<=6;n++){var local=Z.state['p'+n],dirty=(pending[n]||buffers[n])&&leases[n]?.uid===uid;Z.state['p'+n]=X.project(n,dirty?local:consoleStates[n]?.state,proofs[n]);}
 Object.keys(facts.flags||{}).forEach(function(k){var o;Object.values(Z.ZONES).some(function(z){o=z.objects.find(o=>o.flag===k);return !!o;});if(o?.item)Z.state.used[o.item]=true;});
 Z.state.visited={1:true};for(var vzone=2;vzone<=6;vzone++)if(N.zoneAllowed(vzone))Z.state.visited[vzone]=true;
 if(inWorld){status();Z.Game.refresh();if(Z.Puzzles.redraw&&!pending[openConsole]&&!buffers[openConsole])Z.Puzzles.redraw(document.activeElement?.id);if(Z.puzzleDone(6)&&!lastStart){lastStart=true;say('Team mission complete. Contribute your final review to unlock your individual clearance certificate.');}}
}
async function enterWorld(){
 if(inWorld){setNetworkBlocked(!isConnected||!presenceReady);return;}inWorld=true;closeLobby();disableGameControls(false);chosen=profileRecord();Z.state=Z.defState();Z.state.investigator=chosen;Z.state.introDone=true;applyShared();
 var enterGeneration=generation;var own=await A.read(path('positions/'+uid)).catch(()=>null);if(!code||enterGeneration!==generation)return;seq=own?.seq||0;if(own&&N.zoneAllowed(own.zone))Z.state.zone=own.zone;loadLocalCertificate();Z.Game.restart(true);if(own&&own.zone===Z.state.zone&&!Z.Engine.hit(own.x,own.y))Z.Engine.setPlayer(own.x,own.y,own.dir);
 if(!own)await sendPosition(true);setNetworkBlocked(!isConnected||!presenceReady);$('#team-controls').hidden=false;say('Zone 1: share tools, restore power, then have a different teammate analyze the timeline.');
}
async function sendPosition(force){
 if(!N.active()||sending||!inWorld)return;var p=Z.Engine.player,snapshot={zone:Z.state.zone,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,dir:p.dir,moving:p.moving,seq:seq+1,at:A.stamp()};if(!force&&lastPose&&snapshot.zone===lastPose.zone&&snapshot.x===lastPose.x&&snapshot.y===lastPose.y&&snapshot.dir===lastPose.dir&&snapshot.moving===lastPose.moving&&idleAcc<2)return;
 sending=true;var g=generation;try{await A.write(path('positions/'+uid),snapshot);if(g===generation){seq=snapshot.seq;lastPose=snapshot;idleAcc=0;}}catch(e){if(g===generation){failure(e);var old=await A.read(path('positions/'+uid)).catch(()=>null);if(old){seq=old.seq;if(old.zone!==Z.state.zone)Z.Engine.loadZone(old.zone,old);else Z.Engine.setPlayer(old.x,old.y,old.dir);}}}finally{sending=false;}
}
N.frame=function(dt){
 Object.keys(positions).forEach(function(id){if(id===uid||!P.online(id,presence)||positions[id].zone!==Z.state.zone)return;var target=positions[id],cur=remotes[id];if(Z.Engine.zone&&Z.Engine.hit(target.x,target.y))return;var point=P.interpolate(cur,target,dt,Z.reduced());if(Z.Engine.zone&&Z.Engine.hit(point.x,point.y))point=cur||target;remotes[id]={x:point.x,y:point.y,dir:target.dir,moving:target.moving,phase:(cur?.phase||0)+(target.moving?dt*12:0)};});
 Object.keys(remotes).forEach(function(id){if(!positions[id]||!P.online(id,presence)||positions[id].zone!==Z.state.zone)delete remotes[id];});
 if(!inWorld)return;leaseAcc+=dt;if(leaseAcc>=5){leaseAcc=0;if(openConsole>=2&&leases[openConsole]?.uid===uid)N.takeControl(openConsole).catch(failure);}
 sendAcc+=dt;idleAcc+=dt;if(sendAcc>=.25){sendAcc=0;sendPosition(false).catch(failure);}
};
N.renderPlayers=function(){return P.roster(slots,presence).filter(p=>p.uid!==uid&&p.online&&positions[p.uid]?.zone===Z.state.zone&&remotes[p.uid]).map(function(p){return Object.assign({},p,remotes[p.uid]);});};
N.drawRemote=function(g,p){Z.Art.drawInvestigator(g,p.investigator,p.x,p.y,p.dir,p.phase,p.moving,Z.Engine.time(),true);};
N.drawLabels=function(g,cx,cy){g.save();g.font='bold 13px sans-serif';g.textAlign='center';N.renderPlayers().forEach(function(p){var x=p.x-cx,y=p.y-cy-108,text=label(p);var w=g.measureText(text).width+12;g.fillStyle='rgba(4,12,16,.9)';g.fillRect(x-w/2,y-14,w,20);g.fillStyle='#f3e6b9';g.fillText(text,x,y);});g.restore();};
N.action=async function(group,id){if(!N.active())throw Error('Reconnect to the room before interacting.');var target=group==='notes'?path('notes/'+id):path('facts/'+group+'/'+id),r=await A.transaction(target,function(v){return v?undefined:{uid:uid,at:A.stamp()};});if(!r.committed&&!r.value)throw Error('The team action was not saved. Try again.');return r;};
N.verifyTimeline=async function(id,answer){if(!N.active())throw Error('Reconnect before verifying evidence.');if(facts.flags?.z1_console?.uid===uid)throw Error('You restored console power. Ask a different investigator to verify the timeline. You can help discuss the evidence.');var r=await A.transaction(path('timeline/'+id),function(v){return v?undefined:{uid:uid,answer:answer,at:A.stamp()};});if(!r.committed&&!r.value)throw Error('That verification was not saved.');};
N.teamMessage=async function(kind){if(!N.active())throw Error('Join and start a mission before sending team messages.');if(!P.MESSAGES.includes(kind))return;await A.write(path('messages/'+uid),{uid:uid,kind:kind,at:A.stamp()});$('#team-message').textContent='You: '+kind;};
async function detach(){
 generation++;subscriptions.forEach(fn=>fn());subscriptions=[];var old=code,oldSession=session;code='';presenceReady=false;inWorld=false;started=false;setNetworkBlocked(false);
 if(old&&oldSession)try{await A.remove('rooms/'+old+'/presence/'+uid+'/'+oldSession);await disconnectOp?.cancel();}catch(e){/* onDisconnect still removes presence if immediate removal fails */}
 remotes={};positions={};$('#team-controls').hidden=true;status();
}
async function leave(){var old=code,s=slot,wasStarted=started;await detach();if(old&&!wasStarted)try{await A.remove('rooms/'+old+'/slots/'+s);}catch(e){failure(e);}Z.UI.closeAll(true);Z.state=Z.defState();Z.state.investigator=chosen;view='menu';showLobby();}
N.openLobby=function(){if(code&&inWorld){var m=Z.UI.modal({title:'Team and connection'});m.body.innerHTML=N.roundPanel()+'<p>Room <b>'+esc(code)+'</b></p><ul>'+P.roster(slots,presence).map(p=>'<li>'+esc(label(p))+' — '+(p.online?'Online':'Disconnected')+' · Zone '+(positions[p.uid]?.zone||1)+'</li>').join('')+'</ul><p>Current host: '+esc(label(P.roster(slots,presence).find(p=>p.uid===P.host(slots,presence))||{investigator:'vale'}))+'</p><p><button class="btn" id="cp-quit">Leave mission</button></p><p>Your membership and shared progress are retained after leaving a started mission. Use Rejoin in this browser tab to return.</p>';m.body.querySelector('#cp-quit').onclick=function(){leave().catch(failure);};m.focusFirst();}else{view='menu';showLobby();}};
N.zoneAllowed=function(n){return n===1||(n>=2&&n<=6&&Z.puzzleDone(n-1)&&(n!==3||Z.state.items.doc_metab)&&(n!==5||Z.state.items.doc_neuro)&&(n!==6||Z.state.items.doc_memo));};
N.eligible=function(){var final=proofs[6]?.final;return !!final&&(final.uid===uid||!!reviews[6]?.[uid]);};
function certificateKey(){return 'rwcp.cert.'+code+'.'+uid;}
function saveLocalCertificate(){if(code&&uid)try{localStorage.setItem(certificateKey(),JSON.stringify(Z.state.cert));}catch(e){}}
function loadLocalCertificate(){try{var c=JSON.parse(localStorage.getItem(certificateKey())||'null');if(c&&typeof c.name==='string'&&typeof c.id==='string')Z.state.cert=c;}catch(e){}}
N.consoleOpen=function(n){openConsole=n;leaseAcc=0;};
N.takeControl=async function(n){if(!N.active())throw Error('Reconnect before taking controls.');if(X.ready(n,proofs[n]))return;var result=await A.transaction(path('leases/'+n),function(v){return !v||v.uid===uid||Date.now()-v.at>20000||!P.online(v.uid,presence)?{uid:uid,at:A.stamp()}:undefined;});if(!result.committed)say('Another investigator is using these controls. You can observe or ask them to pass control.');};
N.releaseControl=async function(n){await N.flush(n);await (queues[n]||Promise.resolve()).catch(function(){});await A.transaction(path('leases/'+n),function(v){return v?.uid===uid?null:undefined;});};
N.consoleClose=function(n){openConsole=0;N.releaseControl(n).catch(failure);};
N.flush=function(n){if(inputTimers[n]){clearTimeout(inputTimers[n]);delete inputTimers[n];}var b=buffers[n];if(!b)return queues[n]||Promise.resolve();delete buffers[n];return enqueue(n,b);};
function enqueue(n,job){pending[n]=(pending[n]||0)+1;var g=generation;queues[n]=(queues[n]||Promise.resolve()).catch(function(){}).then(async function(){if(g!==generation||!N.active())throw Error('Reconnect and reopen this console before editing.');var result=await A.transaction(path('consoleStates/'+n),function(v){return {uid:uid,at:A.stamp(),revision:(v?.revision||0)+1,state:job.state};});if(!result.committed)throw Error('Shared console state was not saved.');for(var p of job.proofs)await A.transaction(path('proofs/'+n+'/'+p.key),function(v){return v?undefined:Object.assign({uid:uid,at:A.stamp()},p.data);});}).catch(failure).finally(function(){pending[n]--;if(g===generation&&!pending[n]&&!buffers[n])applyShared();});return queues[n];}
N.dispatchPuzzle=function(n,a,fn){if(n<2||a.name==='cert'||a.name==='routehelp')return fn();if(leases[n]?.uid!==uid||!N.active()||X.ready(n,proofs[n])){say('Take console control to edit. Completed investigations remain available to read.');return false;}if(a.type!=='input')N.flush(n);var r=fn(),s=Z.state['p'+n];if(n===2&&a.name==='run')s.lastRun={ints:s.ints,burst:s.burst,rest:s.rest};var job={state:X.pack(n,s),proofs:X.candidates(n,s,a)};if(a.type==='input'){buffers[n]=job;if(inputTimers[n])clearTimeout(inputTimers[n]);inputTimers[n]=setTimeout(function(){N.flush(n);},350);}else enqueue(n,job);return r;};
N.panel=function(n){if(n<2)return '';var owner=leases[n]?.uid,person=P.roster(slots,presence).find(p=>p.uid===owner),ready=X.ready(n,proofs[n]),reviewed=Object.keys(reviews[n]||{}).length>0;var h='<section class="card" aria-label="Cooperative console"><h3>Team investigation</h3><p>'+esc(ready?'Scientific work saved. An independent teammate must review the evidence.':owner===uid?'You have console control. Changes are shared with your team.':person?label(person)+' has console control. You can observe the shared investigation.':'Console controls are available.')+'</p>';
 if(!ready)h+='<button class="btn" id="cp-control" type="button">'+(owner===uid?'Pass controls':'Take controls')+'</button>';
 if(ready){h+='<p>'+ (reviewed?'Independent evidence review saved.':'Awaiting independent review.')+'</p>';if(proofs[n]?.[X.finalKey[n]]?.uid!==uid&&!reviews[n]?.[uid]){h+='<label for="cp-review-evidence">Evidence to review</label><select id="cp-review-evidence">';var col=Z.evCollected();Z.EVID_ORDER.forEach(function(id){var e=Z.EVID[id];if(col[id]&&!e.claim&&(n===6||e.ph===n))h+='<option value="'+id+'">'+esc(e.t)+'</option>';});h+='</select><label for="cp-review-reason">Explain how this evidence supports or limits the team’s conclusion (at least 20 characters; use your own reasoning).</label><textarea id="cp-review-reason" rows="3" maxlength="1200"></textarea><button class="btn primary" type="button" id="cp-review">Save my independent review</button>';}
 if(n===6&&Z.certReady())h+='<button class="btn gold" type="button" id="cp-certificate">Open my certificate</button>';}
 return h+'</section>';
};
N.bindConsole=function(n,body){if(n<2)return;var mine=leases[n]?.uid===uid&&!X.ready(n,proofs[n]);body.querySelectorAll('[data-a],[data-c],[data-i]').forEach(function(el){if(el.dataset.a!=='cert'&&el.dataset.a!=='routehelp')el.disabled=!mine;});body.querySelector('#cp-control')?.addEventListener('click',function(){(leases[n]?.uid===uid?N.releaseControl(n):N.takeControl(n)).catch(failure);});body.querySelector('#cp-certificate')?.addEventListener('click',function(){Z.Cert.open();});body.querySelector('#cp-review')?.addEventListener('click',async function(){var reason=body.querySelector('#cp-review-reason').value.trim(),evidence=body.querySelector('#cp-review-evidence').value;if(reason.length<20||!Z.meaningful(reason)){say('Add a few words explaining the scientific evidence in your own reasoning.',true);return;}try{await A.transaction(path('reviews/'+n+'/'+uid),function(v){return v?undefined:{uid:uid,at:A.stamp(),evidence:evidence,reason:reason};});say('Your independent review was saved.');}catch(e){failure(e);}});};

// Network-backed actions for all six zones.
var interact=Z.Game.interact;
Z.Game.interact=function(o){
 if(!o||Z.Game.dialogOpen()||Z.Engine.isBlocked())return;if(!N.active()){say('A connected, started room is required for interactions.',true);return;}
 if(o.kind==='door'){interact(o);return;}
 var work,actionGeneration=generation;
 function feedback(text,extra,cb){if(actionGeneration!==generation||!N.active())return;if(Z.UI.isModalOpen()||Z.Game.dialogOpen())say(text);else Z.Game.dialog(text,cb||null,extra);}
 if(o.kind==='pickup'){if(Z.state.items[o.item])return;if(o.visibleIf&&!o.visibleIf())return;work=N.action('items',o.item).then(function(){feedback('Shared quest item collected: '+Z.ITEMS[o.item].name+'. All teammates can use it.');});}
 else if(o.kind==='use'&&!Z.state.flags[o.flag]){if(o.item&&!Z.state.items[o.item]){interact(o);return;}work=N.action('flags',o.flag).then(function(){feedback(o.done);});}
 else if(o.kind==='note'&&!Z.state.lore[o.id]){work=N.action('notes',o.id).then(function(){feedback(o.text,'Shared in the team Journal.');});}
 else if(o.kind==='puzzle'&&o.item&&!Z.state.flags[o.flag]){if(!Z.state.items[o.item]){interact(o);return;}work=N.action('flags',o.flag).then(function(){feedback(o.puzzle===1?'You restored security console power. A different teammate must verify the surveillance records.':o.insert,null,function(){Z.Game.interact(o);});});}
 else{interact(o);return;}
 if(work){Z.Engine.block();work.catch(failure).finally(function(){Z.Engine.unblock();});}
};
var refresh=Z.Game.refresh;Z.Game.refresh=function(){refresh();if(Z.Engine.zone)$('#hz').textContent='Containment Protocol · Zone '+Z.state.zone+' of 6';};
var travel=Z.Game.travel;Z.Game.travel=function(id,mode){if(!N.zoneAllowed(id)){say('Your team must finish the preceding investigation, receive a teammate review, and collect its clearance record before entering that zone.');return;}travel(id,mode);};
Z.Save.reset=function(){say('Use Team / Lobby to leave. Resetting a shared room from a client is disabled.');};
Z.Save.importFile=function(){say('Shared room progress comes from the mission service. Single-player backups cannot overwrite a multiplayer room.');};
Z.Save.exportFile=function(){say('This build restores shared progress by room code and your anonymous browser-tab identity. See SETUP.txt for retention details.');};
Z.Save.saveNow=function(silent){saveLocalCertificate();if(!silent)say(N.active()?'Committed team actions are saved automatically to the mission service. Personal certificate names are never sent.':'Reconnect to the mission service to save team actions.');return N.active();};Z.Save.queue=function(){};
N.roundPanel=function(){var r=A?.summary?.();if(!r)return '';return '<section class="card"><h3>Three-round team mission</h3><ol>'+r.rounds.map(function(x){return '<li>Zones '+x.zones.join('–')+': '+(x.complete?'Complete':'In progress')+' · '+x.score+'/200 points</li>';}).join('')+'</ol><p><b>Team score: '+r.teamScore+'/600</b></p>'+(r.winner?'<p class="chip ok">Mission winners: '+esc(r.winner)+'</p>':'')+'<p>100 points for each investigation and its required independent review. No speed bonuses, retry penalties or individual ranking.</p></section>';};
N.init=async function(){
 $('#b-team').addEventListener('click',N.openLobby);$('#team-ping').addEventListener('change',function(e){var kind=e.target.value;e.target.value='';if(kind)N.teamMessage(kind).catch(failure);});
 disableGameControls(true);try{chosen=JSON.parse(restore('investigator'));}catch(e){}if(!chosen||!P.profile(chosen.id))chosen=Z.Investigators.make('vale','');
 Z.state.investigator=chosen;status();showLobby();
 document.addEventListener('visibilitychange',function(){if(!document.hidden&&code)sendPosition(true).catch(failure);});
};
N.debugStatus=function(){return {endpoint:'/.netlify/functions/game',connected:isConnected,room:code,active:N.active(),started:started,zone:Z.state.zone,implementedZones:6,verifiedLive:false};};
})();
