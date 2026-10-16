/* RAVENWOOD: THE LAST MISSION | puzzles.js
   The six scientific puzzles, shown as terminal panels. Every number labeled SU is a fictional
   simulation unit, not a real measurement. Each puzzle has: objective, instructions on demand,
   optional hints, immediate feedback, unlimited retries and a clear completion state. */
(function(){
'use strict';
var Z=window.Z,esc=Z.esc,Pz=Z.Puzzles={},PZ=Z.PZ={};
function S(){return Z.state;}
function radio(name,val,label,checked,id,extra){return '<label class="opt'+(extra||'')+'"><input type="radio" name="'+name+'" value="'+val+'" data-c="'+name+'" '+(id?'id="'+id+'" ':'')+(checked?'checked':'')+'><span>'+label+'</span></label>';}
function hintBox(txt){return '<details class="hint"><summary>Need a scientific hint?</summary><div>'+txt+'</div></details>';}
function instr(txt){return '<details class="hint"><summary>Instructions</summary><div>'+txt+'</div></details>';}
function done(n,msg){var d=Z.puzzleDone(n);return '<div class="done-box'+(d?' complete':'')+'"><span class="chip '+(d?'ok':'gold')+'">'+(d?'Complete':'In progress')+'</span><span>'+esc(d?msg:'Finish every goal to complete this console. You can retry as often as you like.')+'</span></div>';}
var FB={};function setFb(n,cls,html){FB[n]={cls:cls,html:html};}
function fbHtml(n,id){var f=FB[n];return '<div class="fb '+(f?f.cls:'')+'" id="'+(id||'fb')+'" role="status">'+(f?f.html:'')+'</div>';}
function fbClear(n){FB[n]=null;}
function checkDone(n){
  var was=Pz._wasDone[n];var now=Z.puzzleDone(n);
  if(now&&!was){Pz._wasDone[n]=true;Z.Audio.discover();Z.notice(Pz.doneMsg[n]);}
  if(!now)Pz._wasDone[n]=false;
  Z.Game.onPuzzleChange();
}
Pz._wasDone={};
Pz.doneMsg={1:'Console decrypted. The containment corridor is now unlocked.',2:'Energy trace complete. A classified cabinet has unlocked.',3:'Oxygen contradiction found. The pressure door can now be passed.',4:'Neural override complete. A restricted record has unlocked.',5:'Hidden support system uncovered. The classified memo is available.',6:'Final verdict accepted. Level Z-03 clearance unlocked.'};

/* ===================== PUZZLE 1: SURVEILLANCE CONSOLE ===================== */
var sel1='t1';
function cam1(){
  var e=Z.T1.filter(function(x){return x.id===sel1;})[0],ts=e.time.split(' ')[0];
  return '<div class="cam"><svg viewBox="0 0 320 180" role="img" aria-label="Security camera view with timestamp '+esc(ts)+'"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1318"/><stop offset="1" stop-color="#05080a"/></linearGradient></defs><rect width="320" height="180" fill="url(#cg)"/><rect x="40" y="30" width="70" height="110" fill="#10181d" stroke="#2b373e"/><rect x="120" y="60" width="26" height="80" fill="#0b1014"/><rect x="190" y="90" width="90" height="50" fill="#121c21"/><ellipse cx="170" cy="150" rx="18" ry="5" fill="#000" opacity=".5"/><rect x="162" y="96" width="16" height="50" rx="5" fill="#26333b"/><circle cx="170" cy="88" r="9" fill="#2a3a42"/><g stroke="#6dc28f" stroke-opacity=".1">'+(function(){var s='';for(var i=0;i<180;i+=4)s+='<line x1="0" y1="'+i+'" x2="320" y2="'+i+'"/>';return s;})()+'</g><text x="8" y="16" fill="#6dc28f" font-family="monospace" font-size="11">CAM C-4</text><text x="8" y="172" fill="#6dc28f" font-family="monospace" font-size="11">'+esc(ts)+'</text><circle cx="302" cy="12" r="4" fill="#f0716a"/><text x="270" y="16" fill="#f0716a" font-family="monospace" font-size="10">REC</text></svg></div>';
}
function r1(){
  var s=S().p1,okN=Z.T1.filter(function(e){return s.ok[e.id];}).length,cur=Z.T1.filter(function(e){return e.id===sel1;})[0];
  var h='<p class="objective"><b>Objective:</b> Sort all 8 entries into <b>observation</b>, <b>inference</b> or <b>unsupported claim</b>. '+okN+' of 8 verified.</p>';
  h+=instr('Select a timestamp on the left. Read the entry. Choose a type, then press Check. A wrong answer only gives feedback. You can change it and try again as many times as you like.');
  h+=hintBox('An observation was recorded by a camera or sensor. An inference is a conclusion reasoned from observations (look for "may" and "because"). An unsupported claim goes beyond every record.');
  h+='<div class="grid2"><div>'+cam1()+'<h3 style="margin-top:.6rem">Security timeline</h3><ul class="tl" role="list">';
  Z.T1.forEach(function(e){h+='<li><button type="button" id="t1_'+e.id+'" data-a="sel" data-id="'+e.id+'" aria-current="'+(e.id===sel1)+'"><span><span class="tm">'+esc(e.time)+'</span><span class="sr">'+esc(e.src)+'</span></span><span class="chip '+(s.ok[e.id]?'ok':'')+'">'+(s.ok[e.id]?esc(Z.CLS[e.ans]):'Not verified')+'</span></button></li>';});
  h+='</ul></div><div><div class="card"><h3>'+esc(cur.kind)+' | '+esc(cur.src)+'</h3><p class="mono" style="font-family:Consolas,monospace">'+esc(cur.time)+'</p><p>'+esc(cur.text)+'</p></div>';
  h+='<fieldset><legend>What is this entry?</legend><div class="opts">';
  ['obs','inf','uns'].forEach(function(k){h+=radio('p1pick',k,esc(Z.CLS[k]),s.pick[cur.id]===k,'p1r_'+k);});
  h+='</div><button class="btn primary" type="button" id="p1check" data-a="check">Check my answer</button></fieldset>';
  h+=fbHtml(1)+'</div></div>'+done(1,'All entries verified. The containment corridor is unlocked.');
  return h;
}
function a1(a,el){
  var s=S().p1;
  if(a==='sel'){sel1=el.dataset.id;fbClear(1);return 't1_'+sel1;}
  if(a==='check'){
    var e=Z.T1.filter(function(x){return x.id===sel1;})[0],p=s.pick[e.id];
    if(!p){setFb(1,'warn','Choose a type first, then check.');return 'p1check';}
    if(p===e.ans&&Z.Net){
      setFb(1,'warn','Saving this scientific verification to the team…');
      Z.Net.verifyTimeline(e.id,p).then(function(){Z.Audio.good();setFb(1,'ok','<b>Team verification saved.</b> '+esc(e.why));checkDone(1);if(Pz.redraw)Pz.redraw('p1check');}).catch(function(err){setFb(1,'warn',esc(err.message));if(Pz.redraw)Pz.redraw('p1check');});return 'p1check';
    }
    if(p===e.ans){s.ok[e.id]=true;Z.Audio.good();setFb(1,'ok','<b>Correct: '+esc(Z.CLS[e.ans])+'.</b> '+esc(e.why)+(e.ev?' New evidence added to your Journal.':'')+(e.ans==='uns'&&e.ev?' This claim was logged as rejected.':''));checkDone(1);}
    else{Z.Audio.bad();setFb(1,'warn','<b>Not yet.</b> '+esc(Z.CLS_FB[e.ans+'_'+p]));}
    return 'p1check';
  }
}
function c1(a,el){S().p1.pick[sel1]=el.value;fbClear(1);return 'p1r_'+el.value;}

/* ===================== PUZZLE 2: BIOLOGICAL ENERGY MONITOR ===================== */
function chart2(res){
  var W=640,H=230,L=46,R=10,Tp=14,B=34,pw=W-L-R,ph=H-Tp-B,tot=Math.max(1,res.total);
  function X(t){return L+t/tot*pw;}function Y(v){return Tp+ph-(v/Z.ATP_CAP)*ph;}
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Graph of the ATP pool over time in simulation units. Result: '+esc(res.cls)+'.">';
  s+='<rect x="'+L+'" y="'+Tp+'" width="'+pw+'" height="'+ph+'" fill="#05090b" stroke="#2b373e"/>';
  var t=0;for(var c=0;c<Z.CYCLES;c++){s+='<rect x="'+X(t)+'" y="'+Tp+'" width="'+(res.B/tot*pw)+'" height="'+ph+'" fill="#d8b24e" opacity="0.14"/>';t+=res.B+res.R;}
  [0,15,30,45,60].forEach(function(v){s+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#1d2a30"/><text x="'+(L-6)+'" y="'+(Y(v)+4)+'" fill="#aab7b0" font-size="11" text-anchor="end" font-family="monospace">'+v+'</text>';});
  s+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+Y(Z.ATP_CAP*0.9)+'" y2="'+Y(Z.ATP_CAP*0.9)+'" stroke="#6dc28f" stroke-dasharray="4 4" opacity="0.6"/><text x="'+(L+pw-4)+'" y="'+(Y(Z.ATP_CAP*0.9)-4)+'" fill="#6dc28f" font-size="10" text-anchor="end" font-family="monospace">90% refill line</text>';
  var pts=res.pts.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);}).join(' ');
  s+='<polyline points="'+pts+'" fill="none" stroke="#6dc28f" stroke-width="2.5" stroke-linejoin="round"/>';
  s+='<text x="'+(L+pw/2)+'" y="'+(H-8)+'" fill="#aab7b0" font-size="11" text-anchor="middle" font-family="monospace">Time in seconds (shaded = activity bursts)</text><text x="12" y="'+(Tp+ph/2)+'" fill="#aab7b0" font-size="11" text-anchor="middle" font-family="monospace" transform="rotate(-90 12 '+(Tp+ph/2)+')">ATP pool (SU)</text></svg>';
  return '<div class="chart">'+s+'</div>';
}
var res2=null;
var CLS2={steady:['ok','No deficit. Regeneration kept up with demand.'],brief:['ok','Brief deficits during bursts, but ATP fully recovered between bursts.'],sustained:['alert','Sustained deficit. ATP did not recover, so output could not be maintained.']};
function r2(){
  var s=S().p2,h='<p class="objective"><b>Objective:</b> Use the model to learn which activity patterns Z-03 could repeat and which cannot be sustained. All values are fictional simulation units (SU).</p>';
  h+=instr('Move the three sliders, then press Run. The model repeats 6 bursts. Demand is 3 SU per second for each intensity level. Regeneration is a fixed 5 SU per second, and the ATP pool holds at most 60 SU. Goal 1 and Goal 2 are checked automatically each time you run.');
  h+=hintBox('Compare demand with regeneration. If demand is higher than 5 SU per second, the pool drains during a burst. Does the pool refill before the next burst starts?');
  h+='<div class="card"><h3>Controls</h3>';
  h+='<div class="sl"><label for="p2i">Activity intensity (1 to 10)</label><input type="range" id="p2i" min="1" max="10" value="'+s.ints+'" data-i="ints"><output id="o2i">'+s.ints+' (demand '+(s.ints*3)+' SU/s)</output></div>';
  h+='<div class="sl"><label for="p2b">Burst length (2 to 20 s)</label><input type="range" id="p2b" min="2" max="20" value="'+s.burst+'" data-i="burst"><output id="o2b">'+s.burst+' s</output></div>';
  h+='<div class="sl"><label for="p2r">Recovery between bursts (0 to 60 s)</label><input type="range" id="p2r" min="0" max="60" value="'+s.rest+'" data-i="rest"><output id="o2r">'+s.rest+' s</output></div>';
  h+='<button class="btn primary" type="button" id="p2run" data-a="run">Run simulation</button> <button class="btn" type="button" data-a="reset2" id="p2reset">Reset sliders</button></div>';
  if(res2){
    var c=CLS2[res2.cls];
    h+='<div class="fb '+c[0]+'" role="status"><b>Result:</b> '+esc(c[1])+' Demand '+res2.dem+' SU/s, regeneration 5 SU/s. Lowest ATP pool: '+res2.minAll.toFixed(0)+' SU. Seconds in deficit: '+res2.defT+' of '+res2.burstT+' burst seconds.</div>'+chart2(res2);
    h+='<table class="data"><caption class="sr-only">Per-cycle results</caption><thead><tr><th>Cycle</th><th>ATP at start (SU)</th><th>Lowest (SU)</th><th>Seconds in deficit</th></tr></thead><tbody>';
    res2.cyc.forEach(function(x){h+='<tr><td>'+x.n+'</td><td>'+x.start.toFixed(0)+'</td><td>'+x.min.toFixed(0)+'</td><td>'+x.def+'</td></tr>';});
    h+='</tbody></table>';
  }else h+='<div class="fb">Press Run simulation to see the ATP pool graph.</div>';
  h+='<div class="card"><h3>Goals</h3><ul><li>'+(s.goalA?'Done: ':'To do: ')+'<b>Goal 1.</b> Find a repeating pattern with intensity 6 or higher and bursts of at least 3 s that fully recovers between bursts.</li><li>'+(s.goalB?'Done: ':'To do: ')+'<b>Goal 2.</b> Show what happens when demand outruns regeneration and recovery is not enough (intensity 6 or higher).</li></ul></div>';
  if(s.goalA&&s.goalB){
    h+='<fieldset><legend>Interpret your runs</legend><p>Which statement is best supported by your runs?</p><div class="opts">';
    h+=radio('p2q','a','Stored ATP alone can power movement indefinitely.',s.qpick==='a','p2q_a');
    h+=radio('p2q','b','Repeated bursts are sustainable only when rest lets ATP regenerate. With no recovery, demand outruns regeneration and the stored ATP runs out in seconds.',s.qpick==='b','p2q_b');
    h+=radio('p2q','c','Longer rest means the cells no longer need ATP.',s.qpick==='c','p2q_c');
    h+='</div><button class="btn primary" type="button" id="p2qcheck" data-a="qcheck">Check my answer</button>'+fbHtml(2,'fb2')+'</fieldset>';
  }
  return h+done(2,'Energy trace complete. The classified cabinet in this lab has unlocked.');
}
function a2(a){
  var s=S().p2;
  if(a==='run'){
    res2=Z.simATP(s.ints,s.burst,s.rest);s.runs++;
    if(s.ints>=6&&s.burst>=3&&(res2.cls==='steady'||res2.cls==='brief')&&!s.goalA){s.goalA=true;Z.Audio.good();}
    if(s.ints>=6&&res2.cls==='sustained'&&!s.goalB){s.goalB=true;Z.Audio.good();}
    checkDone(2);return 'p2run';
  }
  if(a==='reset2'){s.ints=6;s.burst=4;s.rest=12;res2=null;return 'p2reset';}
  if(a==='qcheck'){
    if(!s.qpick){setFb(2,'warn','Choose an answer first.');return 'p2qcheck';}
    if(s.qpick==='b'){s.qok=true;Z.Audio.good();setFb(2,'ok','<b>Correct.</b> ATP must be regenerated. Rest gives regeneration time. Without it, stored ATP (a small buffer) is used up quickly.');checkDone(2);}
    else{Z.Audio.bad();s.qok=false;setFb(2,'warn',s.qpick==='a'?'Look at your continuous run. The stored supply drained in seconds. Stored ATP is only a small short-term buffer.':'Cells always need ATP for work. Rest does not remove the need. It gives time to regenerate ATP.');}
    return 'p2qcheck';
  }
}
function c2(a,el){if(a==='p2q'){S().p2.qpick=el.value;fbClear(2);return 'p2q_'+el.value;}}
function i2(a,el){
  var s=S().p2,v=parseInt(el.value,10);s[a]=v;
  if(a==='ints')document.getElementById('o2i').textContent=v+' (demand '+(v*3)+' SU/s)';
  if(a==='burst')document.getElementById('o2b').textContent=v+' s';
  if(a==='rest')document.getElementById('o2r').textContent=v+' s';
  Z.Save.queue();return false;
}

/* ===================== PUZZLE 3: OXYGEN MONITORING STATION ===================== */
PZ.p3ids=['a','b','c','d','e','f'];
var P3S={
 a:{t:'Glycolysis can make some ATP without oxygen.',ok:true,y:'Glycolysis nets a small amount of ATP and does not directly use oxygen.',n:'This statement is supported. Glycolysis does not directly need oxygen, so it can make a little ATP.'},
 b:{t:'Fermentation lets glycolysis continue by regenerating NAD+, but fermentation does not directly make ATP.',ok:true,y:'Fermentation regenerates NAD+ so glycolysis can keep running. The ATP comes from glycolysis.',n:'This statement is supported. Check the Fermentation node: it keeps glycolysis going but does not make ATP itself.'},
 c:{t:'With severely limited oxygen, ATP supply stayed above Ravenwood\'s movement demand.',ok:false,y:'',n:'In your severe trial the supply started at about 8 SU/s and fell, far below the 25 SU/s demand.'},
 d:{t:'Aerobic respiration can keep running without oxygen if given enough time.',ok:false,y:'',n:'Oxygen is the final electron acceptor. Without it the electron transport chain stops. More time does not fix that.'},
 e:{t:'Brief movement without oxygen is possible, but it cannot be sustained at this demand.',ok:true,y:'The stored buffer plus glycolysis covers only a few seconds of the gap.',n:'This statement is supported. Check the "buffer lasts" time in your severe trial.'},
 f:{t:'Stored ATP alone could power the full 120 seconds of movement.',ok:false,y:'',n:'The stored buffer (60 SU) was used up within seconds in the reduced and severe trials.'}
};
var NODE={
 gly:{n:'Glycolysis',w:'in the cytoplasm',t:{adequate:['run','Running. Glycolysis nets a small amount of ATP. It makes NADH, so it needs NAD+ to continue. Here the electron transport chain returns NAD+.'],reduced:['run','Running faster. Cells lean on glycolysis when oxygen is limited, but it still nets only a small amount of ATP per glucose.'],severe:['slow','Running only while NAD+ is regenerated. It does not directly use oxygen, so it can continue briefly, but its output is small and it slows as by-products build up.']}},
 aer:{n:'Aerobic respiration',w:'in the mitochondria',t:{adequate:['run','Running. Oxygen is the final electron acceptor of the electron transport chain, which makes most of the ATP and regenerates NAD+.'],reduced:['slow','Slowed. With less oxygen the electron transport chain backs up and makes less ATP.'],severe:['stop','Stopped. Without oxygen as the final electron acceptor, the electron transport chain cannot keep moving electrons, so aerobic ATP production halts.']}},
 fer:{n:'Fermentation',w:'in the cytoplasm',t:{adequate:['idle','Idle. Oxygen lets the electron transport chain regenerate NAD+, so fermentation is not needed.'],reduced:['slow','Partly active. Some NAD+ is regenerated by fermentation. Fermentation does not make ATP itself. It keeps glycolysis going.'],severe:['run','Active. Fermentation regenerates NAD+ so glycolysis can continue. It does not directly generate ATP. Its by-products (such as lactate and acid) build up and contribute to fatigue.']}}
};
var res3={};
function chart3(cond){
  var r=Z.trialO2(cond),W=640,H=210,L=46,R=10,Tp=12,B=32,pw=W-L-R,ph=H-Tp-B,maxY=50;
  function X(t){return L+t/Z.TRIAL*pw;}function Y(v){return Tp+ph-(v/maxY)*ph;}
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Supply versus demand over 120 seconds for '+esc(Z.CONDS[cond].name)+'"><rect x="'+L+'" y="'+Tp+'" width="'+pw+'" height="'+ph+'" fill="#05090b" stroke="#2b373e"/>';
  [0,10,20,30,40,50].forEach(function(v){s+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#1d2a30"/><text x="'+(L-6)+'" y="'+(Y(v)+4)+'" fill="#aab7b0" font-size="11" text-anchor="end" font-family="monospace">'+v+'</text>';});
  s+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+Y(Z.O2_DEMAND)+'" y2="'+Y(Z.O2_DEMAND)+'" stroke="#f0716a" stroke-width="2" stroke-dasharray="6 4"/><text x="'+(L+6)+'" y="'+(Y(Z.O2_DEMAND)-5)+'" fill="#f0716a" font-size="11" font-family="monospace">Movement demand 25 SU/s</text>';
  s+='<polyline fill="none" stroke="#6dc28f" stroke-width="2.5" points="'+r.pts.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);}).join(' ')+'"/>';
  if(r.fail!==null)s+='<line x1="'+X(r.fail)+'" x2="'+X(r.fail)+'" y1="'+Tp+'" y2="'+(Tp+ph)+'" stroke="#d8b24e" stroke-dasharray="3 3"/><text x="'+(X(r.fail)+4)+'" y="'+(Tp+14)+'" fill="#d8b24e" font-size="11" font-family="monospace">Buffer empty at '+r.fail+' s</text>';
  s+='<text x="'+(L+pw/2)+'" y="'+(H-8)+'" fill="#aab7b0" font-size="11" text-anchor="middle" font-family="monospace">Time in seconds (green = ATP supply in SU/s)</text></svg>';
  return '<div class="chart">'+s+'</div>';
}
function r3(){
  var s=S().p3,cond=Z.CONDS[s.cond],t=s.tested,allT=t.adequate&&t.reduced&&t.severe;
  var h='<p class="objective"><b>Objective:</b> Test Ravenwood\'s claim that Z-03 moved without oxygen. Run all three oxygen conditions, inspect the pathway, then judge the claim. (SU = fictional simulation units.)</p>';
  h+=instr('Choose an oxygen condition, then press Run 120 s trial. Select a pathway box to read what it is doing under that condition. Run all three conditions to unlock the analysis questions.');
  h+=hintBox('Ask two questions: which processes can still run without oxygen, and is the ATP they make enough to meet the demand of 25 SU per second for 120 seconds?');
  h+='<fieldset><legend>Oxygen condition</legend><div class="seg" role="radiogroup" aria-label="Oxygen condition">';
  ['adequate','reduced','severe'].forEach(function(k){h+=radio('p3cond',k,esc(Z.CONDS[k].name)+(t[k]?' (tested)':''),s.cond===k,'p3c_'+k,' inline');});
  h+='</div><button class="btn primary" type="button" id="p3run" data-a="run">Run 120 s trial</button></fieldset>';
  h+='<div class="card"><h3>Pathway model: '+esc(cond.name)+'</h3><div class="flow" role="group" aria-label="Energy pathway">';
  h+='<div class="node idle" aria-hidden="true" style="flex:0 1 90px;cursor:default"><b>Glucose</b></div><span class="arrow" aria-hidden="true">&rarr;</span>';
  ['gly','fer','aer'].forEach(function(k,i){var nd=NODE[k],st=nd.t[s.cond];h+='<button type="button" class="node '+st[0]+'" data-a="node" data-k="'+k+'" id="p3n_'+k+'" aria-pressed="'+(s.node===k)+'"><b>'+nd.n+'</b><span style="font-size:.78rem;color:#aab7b0">'+nd.w+'</span><span class="st">'+({run:'Running',slow:'Slowed',stop:'Stopped',idle:'Idle'})[st[0]]+'</span></button>'+(i<2?'<span class="arrow" aria-hidden="true">+</span>':'');});
  h+='</div>';
  var nd2=NODE[s.node]||NODE.gly;h+='<div class="fb ok"><b>'+nd2.n+':</b> '+esc(nd2.t[s.cond][1])+'</div>';
  h+='<p>ATP production (SU/s): glycolysis '+cond.gly+', aerobic respiration '+cond.aer+'. NAD+ regeneration: '+(s.cond==='adequate'?'electron transport chain':(s.cond==='reduced'?'electron transport chain (slowed) plus fermentation':'fermentation only'))+'.</p></div>';
  if(res3[s.cond]){
    var r=Z.trialO2(s.cond);
    h+=chart3(s.cond)+'<div class="fb '+(r.fail===null?'ok':'warn')+'" role="status"><b>Trial result:</b> supply '+r.sup0.toFixed(0)+' SU/s at 0 s and '+r.sup1.toFixed(0)+' SU/s at 120 s against a demand of 25 SU/s. '+(r.fail===null?'Demand was met for the whole trial.':'The 60 SU stored buffer ran out after '+r.fail+' seconds, so movement could not continue.')+'</div>';
  }
  if(allT){
    h+='<fieldset><legend>Analysis 1: Select every statement your data supports</legend><div class="opts">';
    Z.PZ.p3ids.forEach(function(k){h+='<label class="opt"><input type="checkbox" data-c="p3sel" value="'+k+'" id="p3s_'+k+'" '+(s.sel[k]?'checked':'')+'><span>'+esc(P3S[k].t)+'</span></label>';});
    h+='</div><button class="btn primary" type="button" id="p3selcheck" data-a="selcheck">Check my analysis</button>'+fbHtml(3,'fb3')+'</fieldset>';
    if(s.selOk){
      h+='<fieldset><legend>Analysis 2: What does this mean for Ravenwood\'s claim?</legend><div class="opts">';
      h+=radio('p3why','a','Z-03 needs no ATP.',s.whyPick==='a','p3w_a');
      h+=radio('p3why','b','Brief movement is plausible without oxygen, but sustained movement means oxygen or another ATP supply must have been present. The claim is inconsistent.',s.whyPick==='b','p3w_b');
      h+=radio('p3why','c','Fermentation makes most of the ATP in Z-03.',s.whyPick==='c','p3w_c');
      h+=radio('p3why','d','Glycolysis makes more ATP than aerobic respiration, so oxygen is not needed.',s.whyPick==='d','p3w_d');
      h+='</div><button class="btn primary" type="button" id="p3whycheck" data-a="whycheck">Check my answer</button>'+fbHtml(30,'fb30')+'</fieldset>';
    }
  }else h+='<div class="fb">Run all three oxygen conditions to unlock the analysis questions ('+['adequate','reduced','severe'].filter(function(k){return t[k];}).length+' of 3 done).</div>';
  return h+done(3,'Contradiction found. The pressure door can now be passed.');
}
function a3(a,el){
  var s=S().p3;
  if(a==='run'){res3[s.cond]=true;s.tested[s.cond]=true;Z.Audio.terminal();checkDone(3);return 'p3run';}
  if(a==='node'){s.node=el.dataset.k;return 'p3n_'+s.node;}
  if(a==='selcheck'){
    var wrong=[],miss=[];
    Z.PZ.p3ids.forEach(function(k){var on=!!s.sel[k];if(on&&!P3S[k].ok)wrong.push(k);if(!on&&P3S[k].ok)miss.push(k);});
    if(!wrong.length&&!miss.length){s.selOk=true;Z.Audio.good();setFb(3,'ok','<b>Correct.</b> Glycolysis and fermentation allow brief oxygen-free movement, but the supply cannot meet the demand for long.');}
    else{s.selOk=false;Z.Audio.bad();var m='<b>Not yet.</b> ';wrong.forEach(function(k){m+='<br>Not supported: "'+esc(P3S[k].t)+'" '+esc(P3S[k].n);});miss.forEach(function(k){m+='<br>Missing: "'+esc(P3S[k].t)+'" '+esc(P3S[k].n);});setFb(3,'warn',m);}
    checkDone(3);return 'p3selcheck';
  }
  if(a==='whycheck'){
    if(!s.whyPick){setFb(30,'warn','Choose an answer first.');return 'p3whycheck';}
    if(s.whyPick==='b'){s.whyOk=true;Z.Audio.good();setFb(30,'ok','<b>Correct.</b> Ravenwood\'s claim does not match the model. Movement for minutes needs a steady ATP supply, which points to oxygen or another source being delivered. That leads to the next question: what could have supplied it?');checkDone(3);}
    else{s.whyOk=false;Z.Audio.bad();setFb(30,'warn',({a:'Cells always need ATP. Nothing in your trials shows otherwise.',c:'Fermentation regenerates NAD+. The ATP in this pathway comes from glycolysis, and it is small.',d:'Glycolysis makes only a small amount of ATP per glucose compared with aerobic respiration.'})[s.whyPick]);checkDone(3);}
    return 'p3whycheck';
  }
}
function c3(a,el){
  var s=S().p3;
  if(a==='p3cond'){s.cond=el.value;return 'p3c_'+el.value;}
  if(a==='p3sel'){if(el.checked)s.sel[el.value]=true;else delete s.sel[el.value];s.selOk=false;fbClear(3);Z.Save.queue();return 'p3s_'+el.value;}
  if(a==='p3why'){s.whyPick=el.value;s.whyOk=false;fbClear(30);return 'p3w_'+el.value;}
}

/* ===================== PUZZLE 4: NEURAL SIGNAL-ROUTING CONSOLE ===================== */
var COMPS=[['rec','Receptor (skin or sense organ)'],['sn','Sensory neuron'],['sc','Spinal cord circuit'],['br','Brain regions'],['mn','Motor neuron'],['mu','Muscle']];
PZ.compIds=['rec','sn','sc','br','mn','mu'];
function cname(id){return COMPS.filter(function(c){return c[0]===id;})[0][1];}
PZ.stmtIds=['s1','s2','s3','s4','s5'];
var STM={
 s1:{t:'A sensory-to-motor pathway still works (Recording A).',ans:'sup',fb:'Supported. The arm pulled away in 0.3 s, which a spinal reflex arc can produce.'},
 s2:{t:'Z-03 still responds to some sound input (Recording B).',ans:'sup',fb:'Supported as a simple response: the head turn followed the noise. It shows remaining neural function, nothing more.'},
 s3:{t:'Z-03 is consciously aware of its surroundings.',ans:'not',fb:'Not supported. Reflexes and simple responses do not prove awareness.'},
 s4:{t:'Z-03 steers around obstacles using integrated brain control (Recording C).',ans:'not',fb:'Not supported. In Recording C Z-03 walked into the cart and pushed, so there is no sign of coordinated avoidance.'},
 s5:{t:'Z-03\'s brain is functioning normally.',ans:'not',fb:'Not supported. Nothing in the recordings shows normal brain function.'}
};
var INTR={none:'No interruption',sens:'Sensory neurons',spinal:'Spinal cord circuit',brain:'Brain regions',motor:'Motor neurons',muscle:'Muscle'};
var NEEDS={reflex:['sens','spinal','motor','muscle'],avoid:['sens','spinal','brain','motor','muscle']};
var HELP4={t1:false,t2:false};
var ROLE4={rec:'detects a change such as heat, pressure, or light',sn:'carries the incoming message toward the central nervous system',sc:'connects sensory input to a motor response in a reflex; also carries messages to and from the brain',br:'integrates information and plans a coordinated response',mn:'carries the outgoing command toward the muscle',mu:'contracts to produce the movement'};
function teaching4(){
 return '<section class="card neural-teaching" aria-labelledby="neural-start"><h3 id="neural-start">Start here: how a nerve message becomes movement</h3><p>You are building the <b>route of a message</b>, not listing body parts at random. Something detects a change, a message travels inward, the nervous system processes it, and an outgoing command makes a muscle contract.</p>'+
 '<p><b>Remember:</b> <em>Sensory = information IN.</em> <em>Motor = a movement command OUT.</em> A receptor detects the change; a muscle performs the response.</p>'+
 '<table class="data"><caption>What each component does</caption><thead><tr><th>Component</th><th>Job in the route</th></tr></thead><tbody>'+COMPS.map(function(c){return '<tr><th scope="row">'+esc(c[1])+'</th><td>'+esc(ROLE4[c[0]])+'.</td></tr>';}).join('')+'</tbody></table>'+
 '<div class="grid2"><div><h4>A fast withdrawal reflex</h4><p>The spinal cord circuit can organize the immediate pull-away without waiting for a decision from the brain. The brain can receive information too; it is not required for the initial withdrawal.</p></div><div><h4>A planned, coordinated movement</h4><p>Steering around an obstacle requires the brain to combine sensory information and plan a response. Commands then travel toward the muscles, including through spinal pathways for the limbs.</p></div></div>'+
 '<details><summary>Worked example: pulling a foot away from a sharp object</summary><p><b>1. Receptor:</b> receptors in the skin detect a potentially damaging stimulus.<br><b>2. Sensory neuron:</b> the message travels into the spinal cord.<br><b>3. Spinal cord circuit:</b> local connections activate a withdrawal response.<br><b>4. Motor neuron:</b> a command travels out toward a leg muscle.<br><b>5. Muscle:</b> it contracts and pulls the foot away.</p><p><b>Why this order?</b> Detection must happen before the incoming message. The circuit processes that message before the outgoing command. Contraction produces the observable movement. Use the same jobs to reason through the hot-vent recording.</p></details>'+
 '<p><b>Your plan:</b> A: build two routes. B: compare what happens when one part is interrupted. C: use the recordings to judge claims. You can retry and use help as often as you need.</p></section>';
}
function routeHint4(key){
 var seq=S().p4[key],routes=key==='t1'?[['rec','sn','sc','mn','mu']]:[['rec','sn','br','mn','mu'],['rec','sn','br','sc','mn','mu']],best=routes[0],count=-1;
 routes.forEach(function(r){var n=0;while(n<seq.length&&n<r.length&&seq[n]===r[n])n++;if(n>count){count=n;best=r;}});
 if(count<seq.length&&count>=best.length)return 'The route already reaches the muscle at step '+best.length+'. Remove the extra step'+(seq.length-best.length===1?'':'s')+' with Undo last, then select Check pathway.';
 if(count<seq.length)return 'Revisit step '+(count+1)+'. This part of the route needs '+cname(best[count])+', which '+ROLE4[best[count]]+'. Use Undo last to remove the steps after your last correct connection, then rebuild from there.';
 if(count===best.length)return 'Your components form a complete route. Select Check pathway to verify your work. Then explain to yourself why the message travels in that order.';
 var next=best[count];return (count?'Your first '+count+' component'+(count===1?' is':'s are')+' in a sensible order. ':'Start with detection. ')+'For step '+(count+1)+', consider '+cname(next)+': it '+ROLE4[next]+'. Choose that component yourself, then ask for another hint if needed.';
}
function r4(){
  var s=S().p4,h='<p class="objective"><b>Objective:</b> Trace the signal pathways, find which part of the nervous system separates a reflex from coordinated movement, then judge what the recordings show.</p>';
  h+=instr('Part A: build each pathway by pressing components in order, then check. Part B: interrupt one component at a time and watch which behaviors stop. Part C: judge each statement against the recordings.');
  h+=hintBox('A reflex arc can run through the spinal cord without waiting for the brain. Coordinated obstacle avoidance needs brain regions that integrate sensory information.');
  h+=teaching4();
  h+='<div class="card"><h3>Loaded recordings</h3><div class="grid3">';
  ['rec1','rec2','rec3'].forEach(function(k){h+='<div><b>'+esc(Z.ITEMS[k].name)+'</b><p style="font-size:.88rem">'+esc(Z.ITEMS[k].text)+'</p></div>';});
  h+='</div></div>';
  [['t1','ok1','Part A1: Hot vent withdrawal (Recording A)'],['t2','ok2','Part A2: Avoiding an obstacle (what Recording C would need)']].forEach(function(sc,idx){
    var seq=s[sc[0]];
    h+='<fieldset><legend>'+sc[2]+(s[sc[1]]?' (verified)':'')+'</legend><p>Press components in the order the signal travels. Each press adds one step below. <b>Undo last</b> removes your last choice; <b>Clear</b> starts this route over.</p>'+ (idx===0?'<p><b>Think:</b> detect heat → bring the message in → make the immediate spinal response → send a command out → contract.</p>':'<p><b>Think:</b> detect the obstacle → bring the message in → plan a route around it → send a command out → contract. This is a proposed pathway for successful avoidance, not a claim that Z-03 actually avoided the cart. The spinal cord may be included after the brain in this simplified limb pathway.</p>')+'<div class="pool">';
    COMPS.forEach(function(c){h+='<button type="button" class="btn" data-a="add" data-s="'+sc[0]+'" data-c="'+c[0]+'" id="p4a_'+sc[0]+'_'+c[0]+'" title="'+esc(ROLE4[c[0]])+'">'+esc(c[1])+'</button>';});
    h+='</div><div class="path" aria-label="Your pathway">'+(seq.length?seq.map(function(c,i){return '<span class="step">'+(i+1)+'. '+esc(cname(c))+'</span>';}).join(' &rarr; '):'<span style="color:#aab7b0">Your pathway is empty.</span>')+'</div>';
    h+='<p><button type="button" class="btn" data-a="routehelp" data-s="'+sc[0]+'" id="p4help_'+sc[0]+'" aria-expanded="'+HELP4[sc[0]]+'">'+(HELP4[sc[0]]?'Refresh my next-step hint':'Help me choose the next step')+'</button></p>'+(HELP4[sc[0]]?'<div class="fb" role="status">'+esc(routeHint4(sc[0]))+'</div>':'');
    h+='<button class="btn" type="button" data-a="undo" data-s="'+sc[0]+'" id="p4u_'+sc[0]+'">Undo last</button> <button class="btn" type="button" data-a="clear" data-s="'+sc[0]+'" id="p4cl_'+sc[0]+'">Clear</button> <button class="btn primary" type="button" data-a="tcheck" data-s="'+sc[0]+'" id="p4tc_'+sc[0]+'">Check pathway</button>'+fbHtml(40+idx,'fbt'+idx)+'</fieldset>';
  });
  h+='<fieldset><legend>Part B: Interrupt one component'+(s.goalOk?' (goal met)':'')+'</legend><p><b>What does interrupt mean?</b> Temporarily prevent that component from doing its job in this model. This does not remove a component from your Part A routes.</p><p><b>Try it:</b> Start with No interruption and read both results. Choose Sensory neurons and compare again. Then test another part. The results change as soon as you choose; there is no Run button.</p><p><b>Goal:</b> Find one interruption that makes the reflex say Works and obstacle avoidance say Stopped. Ask: which processing component does coordinated avoidance need that the immediate withdrawal does not?</p><div class="seg" role="radiogroup" aria-label="Interrupt a component">';
  Object.keys(INTR).forEach(function(k){h+=radio('p4intr',k,esc(INTR[k]),s.intr===k,'p4i_'+k,' inline');});
  h+='</div>';
  var rf=NEEDS.reflex.indexOf(s.intr)<0,av=NEEDS.avoid.indexOf(s.intr)<0;
  h+='<table class="data"><thead><tr><th>Behavior</th><th>Needs</th><th>With this interruption</th></tr></thead><tbody><tr><td>Withdrawal reflex</td><td>Sensory neurons, spinal cord circuit, motor neurons, muscle</td><td><span class="chip '+(rf?'ok':'red')+'">'+(rf?'Works':'Stopped')+'</span></td></tr><tr><td>Coordinated obstacle avoidance</td><td>Sensory neurons, brain regions, spinal cord (carries commands), motor neurons, muscle</td><td><span class="chip '+(av?'ok':'red')+'">'+(av?'Works':'Stopped')+'</span></td></tr></tbody></table>';
  h+=(s.goalOk?'<div class="fb ok">Goal met. With the brain regions interrupted, the reflex still works but coordinated avoidance stops. This is a simplified model.</div>':'<div class="fb">Try different interruptions and compare the two behaviors.</div>')+'</fieldset>';
  h+='<fieldset><legend>Part C: What do the recordings show?'+(s.stmtOk?' (verified)':'')+'</legend><p><b>Supported</b> means the recording gives evidence for the claim. <b>Not supported</b> means the recording does not establish it; that is not the same as proving it impossible.</p><p>For each claim, find the relevant recording above. Ask: what action was actually observed, and does the claim go beyond it? A response to a stimulus does not, by itself, demonstrate conscious awareness or a normally functioning brain.</p><details><summary>Practice judgment: an automatic blink</summary><p>A person blinks after a puff of air. This supports the claim that a response pathway worked in that trial. It does not, on its own, show what the person was thinking. Apply the same evidence rule to Ravenwood’s claims.</p></details>';
  PZ.stmtIds.forEach(function(k){h+='<div class="card"><p><b>'+esc(STM[k].t)+'</b></p><div class="opts">'+radio('p4s_'+k,'sup','Supported by the recordings',s.stmt[k]==='sup','p4s_'+k+'_sup',' inline')+radio('p4s_'+k,'not','Not supported by the recordings',s.stmt[k]==='not','p4s_'+k+'_not',' inline')+'</div></div>';});
  h+='<button class="btn primary" type="button" data-a="scheck" id="p4sc">Check my judgments</button>'+fbHtml(43,'fbs')+'</fieldset>';
  return h+done(4,'Neural override complete. The restricted neurological record has unlocked.');
}
function a4(a,el){
  var s=S().p4;
  if(a==='routehelp'){HELP4[el.dataset.s]=true;return 'p4help_'+el.dataset.s;}
  if(a==='add'){var q=s[el.dataset.s];if(q.length<8)q.push(el.dataset.c);s[el.dataset.s==='t1'?'ok1':'ok2']=false;return 'p4a_'+el.dataset.s+'_'+el.dataset.c;}
  if(a==='undo'){s[el.dataset.s].pop();s[el.dataset.s==='t1'?'ok1':'ok2']=false;return 'p4u_'+el.dataset.s;}
  if(a==='clear'){s[el.dataset.s]=[];s[el.dataset.s==='t1'?'ok1':'ok2']=false;return 'p4cl_'+el.dataset.s;}
  if(a==='tcheck'){
    var key=el.dataset.s,q2=s[key],id=key==='t1'?40:41,ok;
    var names=q2.join(',');
    if(!q2.length){setFb(id,'warn','Build a pathway first. '+esc(routeHint4(key)));return 'p4tc_'+key;}
    if(q2[0]!=='rec'){setFb(id,'warn','<b>Not yet.</b> '+esc(routeHint4(key)));return 'p4tc_'+key;}
    if(q2[q2.length-1]!=='mu'){setFb(id,'warn','<b>Keep building or revise your route.</b> '+esc(routeHint4(key)));return 'p4tc_'+key;}
    if(key==='t1'){
      ok=(names==='rec,sn,sc,mn,mu');
      if(ok){s.ok1=true;Z.Audio.good();setFb(id,'ok','<b>Correct.</b> A withdrawal reflex runs receptor, sensory neuron, spinal cord circuit, motor neuron, muscle. The brain is not needed for the pull-away itself.');}
      else{s.ok1=false;Z.Audio.bad();setFb(id,'warn','<b>Not yet.</b> '+(q2.indexOf('br')>=0?'A withdrawal reflex does not wait for the brain. The spinal cord circuit connects the sensory and motor neurons directly.':(q2.indexOf('sc')<0?'Something must connect the sensory neuron to the motor neuron. In a reflex that connection is in the spinal cord.':'Check the order: receptor, sensory neuron, spinal cord circuit, motor neuron, muscle.')));}
    }else{
      ok=(names==='rec,sn,br,mn,mu'||names==='rec,sn,br,sc,mn,mu');
      if(ok){s.ok2=true;Z.Audio.good();setFb(id,'ok','<b>Correct.</b> Avoiding an obstacle needs brain regions to integrate sensory information and plan the movement before commands travel to motor neurons and muscles.');}
      else{s.ok2=false;Z.Audio.bad();setFb(id,'warn','<b>Not yet.</b> '+(q2.indexOf('br')<0?'Steering around an obstacle needs brain regions to integrate what the senses report and plan a path.':'Check the order. Sensory information goes up to the brain regions first, then commands travel down to the motor neurons.'));}
    }
    checkDone(4);return 'p4tc_'+key;
  }
  if(a==='scheck'){
    var bad=[],blank=0;PZ.stmtIds.forEach(function(k){if(!s.stmt[k])blank++;else if(s.stmt[k]!==STM[k].ans)bad.push(k);});
    if(blank){setFb(43,'warn','Judge every statement first ('+blank+' left).');return 'p4sc';}
    if(!bad.length){s.stmtOk=true;Z.Audio.good();setFb(43,'ok','<b>Correct.</b> The recordings show remaining neural function (a reflex and a simple response). They do not show awareness, normal brain function or coordinated avoidance.');}
    else{s.stmtOk=false;Z.Audio.bad();setFb(43,'warn','<b>Not yet.</b> '+bad.map(function(k){return '<br>"'+esc(STM[k].t)+'" '+esc(STM[k].fb);}).join(''));}
    checkDone(4);return 'p4sc';
  }
}
function c4(a,el){
  var s=S().p4;
  if(a==='p4intr'){s.intr=el.value;if(el.value==='brain'&&!s.goalOk){s.goalOk=true;Z.Audio.good();checkDone(4);}return 'p4i_'+el.value;}
  if(a.indexOf('p4s_')===0){var k=a.slice(4);s.stmt[k]=el.value;s.stmtOk=false;fbClear(43);return 'p4s_'+k+'_'+el.value;}
}

/* ===================== PUZZLE 5: CLASSIFIED RESEARCH TERMINAL ===================== */
var SLOTS=['02:17:00','02:17:30','02:18:00','02:18:30','02:19:00','02:19:30','02:20:00','02:20:30'];
var REC5={pump:{l:'Circulation pump log',item:'rec_pump',v:[100,100,100,25,0,100,100,100],u:'% flow'},o2:{l:'Oxygen delivery record',item:'rec_o2',v:[40,40,40,10,0,40,40,40],u:'SU'},nut:{l:'Nutrient delivery log',item:'rec_nut',v:[6,6,6,2,0,6,6,6],u:'SU'},cam:{l:'Camera timestamps',item:'rec_cam',v:[0,8,11,3,0,9,7,0],u:'s moving'}};
var REEL=[1,1,1,0,0,1,1,1];
PZ.matchIds=['m1','m2','m3','m4','m5'];
var MATCH={
 m1:{t:'Burst at 02:17:34 (8 s)',ans:'A',fb:'Full pump flow, oxygen and nutrient delivery were present in this time slot.'},
 m2:{t:'Burst at 02:18:05 (11 s)',ans:'A',fb:'Full pump flow, oxygen and nutrient delivery were present in this time slot.'},
 m3:{t:'Brief burst at 02:18:38 (3 s)',ans:'B',fb:'Pump flow had dropped to about 25 percent. A 3 second burst fits stored ATP plus glycolysis.'},
 m4:{t:'No movement from 02:18:50 to 02:19:40',ans:'C',fb:'The pump was OFF, so oxygen and nutrient delivery were zero. No movement happened.'},
 m5:{t:'Movement resumes at 02:19:41',ans:'A',fb:'The pump was restored at 02:19:30. Movement resumed about 11 seconds later, not instantly.'}
};
var MOPT=[['A','Pump on: full oxygen and nutrient delivery'],['B','Pump reduced: low oxygen and nutrient delivery'],['C','Pump off: no delivery']];
PZ.claimIds=['c1','c2','c3','c4','c5','c6','c7'];
var CL={
 c1:{t:'Z-03 moved with no oxygen at all.',ans:'uns',fb:'Movement stopped when delivery was zero and returned after delivery was restored. Only a 3 second burst happened under low delivery.'},
 c2:{t:'Z-03 recovered instantly after the long stillness.',ans:'uns',fb:'Movement resumed about 11 seconds after the pump restarted, and the stillness lasted about 50 seconds.'},
 c3:{t:'Z-03\'s bursts matched times when the pump was supplying oxygen and nutrients.',ans:'sup',fb:'The records line up: every large burst happened with the pump on.'},
 c4:{t:'A very brief burst during low delivery could run on stored ATP and glycolysis.',ans:'tmp',fb:'Temporarily plausible. It can work for a few seconds (Zones 2 and 3) but cannot be sustained.'},
 c5:{t:'The highlight reel shows everything Z-03 did.',ans:'uns',fb:'The reel omitted the two time slots when the pump was reduced or off.'},
 c6:{t:'Life support proves Z-03\'s tissue has been restored to normal healthy function.',ans:'uns',fb:'Support can keep some living tissue working. It cannot automatically restore irreversibly dead cells. The evidence shows limited, support-dependent movement.'},
 c7:{t:'Z-03\'s movement depends on continuing outside support.',ans:'sup',fb:'Movement stopped when support stopped and resumed when support returned.'}
};
var CLV={sup:'Supported',tmp:'Temporarily plausible',uns:'Unsupported'};
function r5(){
  var s=S().p5,h='<p class="objective"><b>Objective:</b> Compare four records to see what really happened. Switch every record on, match equipment activity to each movement, then judge seven claims.</p>';
  h+=instr('Press each record button to overlay it on the timeline. Switch on all four to unlock the matching step. Then match each movement to the equipment state. Finally judge each claim. Retry as often as you like. All values are fictional simulation units (SU).');
  h+=hintBox('Look for movement and delivery in the same time slot. What happens in the slots where delivery is low or zero? Which slots are missing from the highlight reel?');
  h+='<fieldset><legend>Records on the timeline</legend><div class="seg">';
  Object.keys(REC5).forEach(function(k){var on=!!s.views[k],have=Z.state.items[REC5[k].item];h+='<button type="button" class="btn" data-a="view" data-k="'+k+'" id="p5v_'+k+'" aria-pressed="'+on+'">'+esc(REC5[k].l)+(on?' (shown)':' (hidden)')+'</button>';});
  h+='</div><div class="tl8"><table class="data"><caption class="sr-only">Timeline of records by 30 second slot</caption><thead><tr><th scope="col">Record</th>'+SLOTS.map(function(t){return '<th scope="col">'+t+'</th>';}).join('')+'</tr></thead><tbody>';
  ['pump','o2','nut','cam'].forEach(function(k){if(!s.views[k])return;var r=REC5[k],mx=Math.max.apply(null,r.v)||1;h+='<tr><th scope="row">'+esc(r.l)+' ('+r.u+')</th>'+r.v.map(function(v){return '<td>'+v+'<span class="bar-cell" style="width:'+Math.round(v/mx*100)+'%;'+(v===0?'visibility:hidden':'')+'"></span></td>';}).join('')+'</tr>';});
  if(s.views.cam)h+='<tr><th scope="row">In highlight reel?</th>'+REEL.map(function(v){return '<td>'+(v?'Yes':'<b style="color:#f0716a">No</b>')+'</td>';}).join('')+'</tr>';
  h+='</tbody></table></div></fieldset>';
  var all=s.views.cam&&s.views.pump&&s.views.o2&&s.views.nut;
  if(!all)h+='<div class="fb">Switch on all four records to unlock the matching step ('+Object.keys(s.views).length+' of 4).</div>';
  else{
    h+='<fieldset><legend>Match equipment activity to movements'+(s.matchOk?' (verified)':'')+'</legend>';
    PZ.matchIds.forEach(function(k){h+='<div class="card"><label for="p5m_'+k+'"><b>'+esc(MATCH[k].t)+'</b></label><br><select id="p5m_'+k+'" data-c="p5m" data-k="'+k+'"><option value="">Choose the equipment state</option>'+MOPT.map(function(o){return '<option value="'+o[0]+'"'+(s.match[k]===o[0]?' selected':'')+'>'+esc(o[1])+'</option>';}).join('')+'</select></div>';});
    h+='<button class="btn primary" type="button" id="p5mc" data-a="mcheck">Check my matches</button>'+fbHtml(50,'fb50')+'</fieldset>';
    if(s.matchOk){
      h+='<div class="memo"><span class="stamp">CLASSIFIED</span><br>MEMO RBRT-ZR7: Subject Z-03 was connected to Support Rig ZR-7 (circulation pump, oxygenator and nutrient line) during containment testing. The pump log must not be released with the footage.</div>';
      h+='<fieldset style="margin-top:.7rem"><legend>Judge each claim'+(s.claimsOk?' (verified)':'')+'</legend>';
      PZ.claimIds.forEach(function(k){h+='<div class="card"><p><b>'+esc(CL[k].t)+'</b></p><div class="opts">'+['sup','tmp','uns'].map(function(v){return radio('p5c_'+k,v,CLV[v],s.claims[k]===v,'p5c_'+k+'_'+v,' inline');}).join('')+'</div></div>';});
      h+='<button class="btn primary" type="button" id="p5cc" data-a="ccheck">Check my judgments</button>'+fbHtml(51,'fb51')+'</fieldset>';
    }
  }
  return h+done(5,'Hidden support system uncovered. Take the classified memo from the terminal drawer.');
}
function a5(a,el){
  var s=S().p5;
  if(a==='view'){var k=el.dataset.k;if(s.views[k])delete s.views[k];else s.views[k]=true;checkDone(5);return 'p5v_'+k;}
  if(a==='mcheck'){
    var bad=[],blank=0;PZ.matchIds.forEach(function(k){if(!s.match[k])blank++;else if(s.match[k]!==MATCH[k].ans)bad.push(k);});
    if(blank){setFb(50,'warn','Match every movement first ('+blank+' left).');return 'p5mc';}
    if(!bad.length){s.matchOk=true;Z.Audio.discover();setFb(50,'ok','<b>All matched.</b> Movement lined up with delivery every time. A hidden document has been unsealed below.');}
    else{s.matchOk=false;Z.Audio.bad();setFb(50,'warn','<b>Not yet.</b> '+bad.map(function(k){return '<br>"'+esc(MATCH[k].t)+'": '+esc(MATCH[k].fb);}).join(''));}
    checkDone(5);return 'p5mc';
  }
  if(a==='ccheck'){
    var b2=[],bl=0;PZ.claimIds.forEach(function(k){if(!s.claims[k])bl++;else if(s.claims[k]!==CL[k].ans)b2.push(k);});
    if(bl){setFb(51,'warn','Judge every claim first ('+bl+' left).');return 'p5cc';}
    if(!b2.length){s.claimsOk=true;Z.Audio.good();setFb(51,'ok','<b>Every claim judged correctly.</b> The mystery is solved by evidence: outside support, recovery time and a few seconds of stored energy explain what Ravenwood called impossible.');}
    else{s.claimsOk=false;Z.Audio.bad();setFb(51,'warn','<b>Not yet.</b> '+b2.map(function(k){return '<br>"'+esc(CL[k].t)+'": '+esc(CL[k].fb);}).join(''));}
    checkDone(5);return 'p5cc';
  }
}
function c5(a,el){
  var s=S().p5;
  if(a==='p5m'){s.match[el.dataset.k]=el.value;s.matchOk=false;fbClear(50);checkDone(5);return 'p5m_'+el.dataset.k;}
  if(a.indexOf('p5c_')===0){var k=a.slice(4);s.claims[k]=el.value;s.claimsOk=false;fbClear(51);checkDone(5);return 'p5c_'+k+'_'+el.value;}
}

/* ===================== PUZZLE 6: CENTRAL COMMAND CONSOLE ===================== */
var EXPL={A:'The virus eliminates the need for ATP and oxygen.',B:'Some movement is temporarily plausible because functioning tissue, metabolic pathways, neural circuits, recovery periods, and external support remain.',C:'The footage alone proves that Z-03 is fully conscious and biologically immortal.'};
var EXFB={A:'Your own trials show the opposite: movement tracked ATP supply and oxygen delivery, and stopped when delivery stopped. Review the Energy, Oxygen and Hidden Support evidence in your Journal.',C:'Reflexes and simple responses do not prove awareness, and the footage was selectively edited and tied to outside support. Review the Neural and Hidden Support evidence in your Journal.'};
function r6(){
  var s=S().p6,ev=Z.evCollected(),r=Z.p6Eval();
  var h='<p class="objective"><b>Objective:</b> Choose the best-supported explanation, pick at least three pieces of evidence from at least three different zones, and write a short Claim, Evidence, Reasoning response.</p>';
  h+=instr('Step 1: pick an explanation. Step 2: tick evidence cards from your Journal. Rejected claims are not evidence. Step 3: write your Claim, Evidence and Reasoning. A few sentences is enough. Then press Submit. If you need to revise, change your answers and submit again.');
  h+=hintBox('Which explanation is supported by evidence from several zones? Which claims did you reject along the way, and why?');
  h+='<fieldset><legend>1. Which explanation is best supported?</legend><div class="opts">';
  ['A','B','C'].forEach(function(k){h+=radio('p6choice',k,'<b>'+k+'.</b> '+esc(EXPL[k]),s.choice===k,'p6c_'+k);});
  h+='</div></fieldset><fieldset><legend>2. Select your supporting evidence ('+r.valid.length+' valid from '+Object.keys(r.phases).length+' zones)</legend>';
  var any=false;Z.EVID_ORDER.forEach(function(id){if(!ev[id])return;any=true;var e=Z.EVID[id];h+='<label class="ecard'+(e.claim?' claim':'')+'"><input type="checkbox" data-c="p6ev" value="'+id+'" id="p6e_'+id+'" '+(s.sel[id]?'checked':'')+'><span><b>Zone '+e.ph+(e.claim?' (rejected claim)':'')+':</b> '+esc(e.t)+'<br><span style="font-size:.86rem;color:#aab7b0">'+esc(e.d)+'</span></span></label>';});
  if(!any)h+='<p>No evidence collected yet. Complete the earlier zones first.</p>';
  h+='</fieldset><fieldset><legend>3. Claim, Evidence, Reasoning</legend>';
  [['claim','Claim','1 to 2 sentences. Which explanation do you support?'],['evidence','Evidence','2 to 3 sentences. Name at least two pieces of evidence and the zone each came from.'],['reasoning','Reasoning','2 to 3 sentences. Explain how the evidence supports your claim using biology (ATP, oxygen, glycolysis, reflexes, support systems).']].forEach(function(f){
    h+='<p><label for="p6t_'+f[0]+'"><b>'+f[1]+'</b></label></p><p class="len">Expected length: '+f[2]+'</p><textarea id="p6t_'+f[0]+'" data-i="cer" data-f="'+f[0]+'" rows="3" maxlength="1200">'+esc(s.cer[f[0]])+'</textarea><div class="starters">Optional starters: '+Z.STARTERS[f[0]].map(function(x,i){return '<button type="button" class="btn small" data-a="starter" data-f="'+f[0]+'" data-i="'+i+'">'+esc(x)+'</button>';}).join('')+'</div>';
  });
  h+='</fieldset><button class="btn gold" type="button" id="p6submit" data-a="submit">Submit final verdict</button>'+fbHtml(60,'fb60');
  if(s.submitted&&r.all)h+='<div class="unlock"><div class="big">LEVEL Z-03 CLEARANCE UNLOCKED</div><p>Your verdict is accepted. You uncovered what Ravenwood tried to keep classified.</p><button class="btn gold" type="button" id="p6cert" data-a="cert">Open my certificate</button></div>';
  return h+done(6,'Final verdict accepted.');
}
function a6(a,el){
  var s=S().p6;
  if(a==='starter'){var f=el.dataset.f,t=document.getElementById('p6t_'+f);var x=Z.STARTERS[f][parseInt(el.dataset.i,10)];t.value=(t.value?t.value+' ':'')+x;s.cer[f]=t.value;s.submitted=false;t.focus();Z.Save.queue();return false;}
  if(a==='cert'){Z.Cert.open();return false;}
  if(a==='submit'){
    s.tries++;var r=Z.p6Eval(),m=[];
    if(!r.choiceOk){m.push(s.choice?('<b>Explanation:</b> '+esc(EXFB[s.choice])):'<b>Explanation:</b> choose an explanation first.');}
    if(!r.evOk){
      if(r.invalid.length)m.push('<b>Evidence:</b> a rejected claim is selected. Rejected claims are not evidence. Untick it.');
      if(r.valid.length<3)m.push('<b>Evidence:</b> select at least 3 valid evidence cards (you have '+r.valid.length+').');
      else if(Object.keys(r.phases).length<3)m.push('<b>Evidence:</b> your cards come from '+Object.keys(r.phases).length+' zone(s). Use cards from at least 3 different zones.');
    }
    if(!r.cerOk){
      var miss=[];['claim','evidence','reasoning'].forEach(function(f){if(!r.cer[f])miss.push(f);});
      m.push('<b>Response:</b> add a meaningful '+miss.join(', ')+' (a few real sentences, not just a starter or repeated characters).');
    }
    if(r.all){
      s.submitted=true;Z.Audio.unlock();
      var tips=[];if(!/ATP|oxygen|glycoly|ferment|NAD|reflex|neuron|pump|support/i.test(s.cer.reasoning))tips.push('Tip: strengthen your reasoning by naming a biology idea such as ATP, oxygen or reflexes.');
      setFb(60,'ok','<b>Verdict accepted.</b> Level Z-03 clearance unlocked.'+(tips.length?' '+esc(tips[0]):'')+' You can still revise your answers and submit again.');
      checkDone(6);
    }else{s.submitted=false;Z.Audio.bad();setFb(60,'warn','<b>Not ready yet.</b><br>'+m.join('<br>')+'<br>You can revise and submit again as many times as you like.');checkDone(6);}
    return 'p6submit';
  }
}
function c6(a,el){
  var s=S().p6;
  if(a==='p6choice'){s.choice=el.value;s.submitted=false;fbClear(60);return 'p6c_'+el.value;}
  if(a==='p6ev'){if(el.checked)s.sel[el.value]=true;else delete s.sel[el.value];s.submitted=false;fbClear(60);Z.Save.queue();return 'p6e_'+el.value;}
}
function i6(a,el){if(a==='cer'){var s=S().p6;s.cer[el.dataset.f]=el.value.slice(0,1200);s.submitted=false;Z.Save.queue();}return false;}

/* ===================== framework ===================== */
var DEF={
 1:{title:'Surveillance Console: Timeline Review',r:r1,a:a1,c:c1},
 2:{title:'Biological Energy Monitor: ATP Trace',r:r2,a:a2,c:c2,i:i2},
 3:{title:'Oxygen Monitoring Station',r:r3,a:a3,c:c3},
 4:{title:'Signal-Routing Console: Neural Override',r:r4,a:a4,c:c4},
 5:{title:'Classified Research Terminal',r:r5,a:a5,c:c5},
 6:{title:'Central Command Console: Final Verdict',r:r6,a:a6,c:c6,i:i6}
};
Pz.open=function(n){
  var d=DEF[n];if(!d)return;
  Pz._wasDone[n]=Z.puzzleDone(n);
  var M=Z.UI.modal({title:d.title,cls:'puzzle',onClose:function(){Pz.redraw=null;if(Z.Net)Z.Net.consoleClose(n);Z.Game.refresh();}});
  function draw(focusId){
    var sc=M.body.scrollTop,active=document.activeElement,selection=active&&active.selectionStart,review=M.body.querySelector('#cp-review-reason')?.value,reviewEvidence=M.body.querySelector('#cp-review-evidence')?.value,expanded=Array.from(M.body.querySelectorAll('details')).map(function(el){return !!el.open;});if(n===2&&S().p2.lastRun){var run=S().p2.lastRun;res2=Z.simATP(run.ints,run.burst,run.rest);}if(n===3){Object.keys(S().p3.tested).forEach(function(c){res3[c]=true;});}M.body.innerHTML=(Z.Net?Z.Net.panel(n):'')+Z.Investigators.guidance(n)+d.r();if(Z.Net)Z.Net.bindConsole(n,M.body);if(review&&M.body.querySelector('#cp-review-reason'))M.body.querySelector('#cp-review-reason').value=review;if(reviewEvidence&&M.body.querySelector('#cp-review-evidence'))M.body.querySelector('#cp-review-evidence').value=reviewEvidence;Array.from(M.body.querySelectorAll('details')).forEach(function(el,i){if(expanded[i])el.open=true;});
    if(focusId){var f=M.body.querySelector('#'+focusId);if(f){try{f.focus({preventScroll:true});if(typeof selection==='number'&&f.setSelectionRange)f.setSelectionRange(selection,selection);}catch(e){f.focus();}}}
    M.body.scrollTop=sc;
  }
  M.body.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b||!M.body.contains(b))return;var r=Z.Net?Z.Net.dispatchPuzzle(n,{type:'click',name:b.dataset.a,data:b.dataset},function(){return d.a(b.dataset.a,b);}):d.a(b.dataset.a,b);if(r!==false)draw(r);});
  M.body.addEventListener('change',function(e){var b=e.target.closest('[data-c]');if(!b)return;var r=Z.Net?Z.Net.dispatchPuzzle(n,{type:'change',name:b.dataset.c,data:b.dataset},function(){return d.c&&d.c(b.dataset.c,b);}):d.c&&d.c(b.dataset.c,b);if(r!==false&&r!==undefined)draw(r);Z.Game.onPuzzleChange();});
  M.body.addEventListener('input',function(e){var b=e.target.closest('[data-i]');if(!b||!d.i)return;var r=Z.Net?Z.Net.dispatchPuzzle(n,{type:'input',name:b.dataset.i,data:b.dataset},function(){return d.i(b.dataset.i,b);}):d.i(b.dataset.i,b);if(r!==false&&r!==undefined)draw(r);});
  Pz.redraw=draw;if(Z.Net)Z.Net.consoleOpen(n);
  if(n===1)sel1='t1';
  draw();
  setTimeout(function(){M.focusFirst();},0);
};
Pz.reset=function(){res2=null;res3={};FB={};};
})();
