/* Enhanced Edition: canonical personnel profiles; additive support, unchanged science gates. */
(function(){
'use strict';
var Z=window.Z,I=Z.Investigators={},esc=Z.esc;
var profiles=[
{id:'vale',name:'Dr. Morgan Vale',specialty:'Molecular Biologist',ratings:[5,2,3,3],ability:'Molecular context: connect observations to cellular processes.'},
{id:'carter',name:'Alex Carter',specialty:'Emergency Response Specialist',ratings:[3,5,3,2],ability:'Rapid response: a modest walking-speed advantage.'},
{id:'chen',name:'Dr. Riley Chen',specialty:'Neuroscientist',ratings:[4,3,5,2],ability:'Pattern recognition: notice evidence from farther away.'},
{id:'reyes',name:'Jordan Reyes',specialty:'Systems Engineer',ratings:[3,3,2,5],ability:'Systems diagnosis: expanded equipment troubleshooting guidance.'}
];
var labels=['Scientific Insight','Mobility','Observation','Technical Skill'];
I.profiles=profiles;
function profile(id){return profiles.filter(function(p){return p.id===id;})[0]||profiles[0];}
I.current=function(){return profile(Z.state.investigator&&Z.state.investigator.id);};
I.clean=function(raw,migrate){
 if(!raw||typeof raw!=='object')return migrate?I.make('vale',''):null;
 return I.make(profile(raw.id).id,raw.codename);
};
I.make=function(id,codename){var p=profile(id);return {id:p.id,codename:typeof codename==='string'?codename.replace(/[\x00-\x1f\x7f<>]/g,'').trim().slice(0,32):'',appearance:p.id+'-atlas-v1',attributes:{insight:p.ratings[0],mobility:p.ratings[1],observation:p.ratings[2],technical:p.ratings[3]}};};
I.speed=function(){return 1+(I.current().ratings[1]-2)*0.025;};
I.radius=function(){return 110+I.current().ratings[2]*28;};
var science=[
'Build a timeline first. Separate directly recorded events from interpretations of why they happened.',
'Compare energy use and recovery over the same time interval. ATP stores and ATP regeneration are different quantities.',
'Compare all oxygen conditions. A pathway can continue briefly without supporting every energy demand.',
'Trace a signal from its input through each connection to an output. Circuit activity alone does not establish conscious control.',
'Align the timestamps of independent records before comparing patterns. Correlation alone does not establish a mechanism.',
'Use evidence from more than one zone. Explain how the biological mechanism connects the evidence to your claim.'
];
var deep=[
'An image can document movement without measuring metabolism or neural activity. Consider what each instrument actually recorded.',
'Cells transfer usable energy through ATP. Ask what replenishes ATP after each burst rather than treating ATP as a permanent fuel tank.',
'Consider both pathway location and what happens when oxygen availability changes. A partial process may not meet sustained demand.',
'Local neural circuits can produce responses. Distinguish the presence of a response from evidence about its source.',
'Consider what oxygen, nutrient delivery and circulation each contribute to living tissue. Compare records without assuming the report is correct.',
'Address the limits of the proposed mechanism as well as the observations it can explain.'
];
I.guidance=function(n){
 var p=I.current(),a=p.ratings,txt='<details class="personnel-guidance"><summary>'+esc(p.name)+' — Scientific Insight '+a[0]+'/5: contextual field notes</summary><p>'+science[n-1]+'</p>';
 if(a[0]>=4)txt+='<p>'+deep[n-1]+'</p>';
 if(a[0]===5)txt+='<p>Check which variables were measured and which were inferred. State what further evidence would distinguish competing explanations.</p>';
 txt+='</details>';
 if([1,2,3,4,5].indexOf(n)>=0){txt+='<details class="personnel-guidance"><summary>Technical Skill '+a[3]+'/5: console workflow</summary><p>Read the console instructions, change one input or classification, then inspect the feedback before revising.</p>';
 if(a[3]>=3)txt+='<p>Record the starting condition. Compare each trial with that baseline and check every unfinished goal before leaving the console.</p>';
 if(a[3]>=4)txt+='<p>Trace input → connection or supply → output. Verify power and required inventory components before diagnosing the displayed result. A powered screen does not validate a scientific conclusion.</p>';
 txt+='</details>';}
 return txt;
};
I.equipmentTip=function(text){
 if(!/needs|dead\.|seat the|insert|power|repair|fuse|reader/i.test(text))return '';
 var a=I.current().ratings[3];
 return ' [Technical Skill '+a+'/5: Check the required component and its intended use in Inventory.'+(a>=3?' Follow the supply or connection to the device; verify the status after installation.':'')+(a>=4?' Diagnose in order: supply, connection, then output. Change one component at a time; distinguish equipment failure from biological evidence.':'')+']';
};
I.journal=function(){var p=I.current(),s=Z.state.investigator||I.make(p.id,'');return '<div class="card personnel-record"><h3>Assigned investigator</h3><p><b>'+esc(p.name)+'</b> — '+esc(p.specialty)+(s.codename?'<br>Codename: '+esc(s.codename):'')+'</p><p>'+esc(p.ability)+'</p><p>'+labels.map(function(l,i){return l+': '+p.ratings[i]+'/5';}).join(' · ')+'</p></div>';};
var art={},frames={"vale":[{"x":104,"y":5,"w":111,"h":299},{"x":411,"y":5,"w":110,"h":294},{"x":707,"y":6,"w":117,"h":298},{"x":1010,"y":5,"w":111,"h":297},{"x":77,"y":317,"w":169,"h":296},{"x":421,"y":315,"w":121,"h":302},{"x":682,"y":317,"w":169,"h":298},{"x":1021,"y":316,"w":113,"h":300},{"x":76,"y":631,"w":185,"h":303},{"x":403,"y":631,"w":131,"h":303},{"x":681,"y":631,"w":189,"h":303},{"x":1010,"y":631,"w":125,"h":304},{"x":103,"y":950,"w":116,"h":304},{"x":417,"y":948,"w":119,"h":307},{"x":713,"y":949,"w":127,"h":306},{"x":1014,"y":948,"w":114,"h":307}],"carter":[{"x":162,"y":10,"w":128,"h":293},{"x":433,"y":10,"w":122,"h":289},{"x":689,"y":10,"w":126,"h":293},{"x":949,"y":10,"w":122,"h":289},{"x":134,"y":314,"w":169,"h":281},{"x":461,"y":311,"w":75,"h":286},{"x":674,"y":312,"w":171,"h":284},{"x":983,"y":312,"w":74,"h":286},{"x":129,"y":613,"w":175,"h":286},{"x":454,"y":613,"w":75,"h":291},{"x":658,"y":613,"w":190,"h":288},{"x":972,"y":613,"w":76,"h":292},{"x":142,"y":921,"w":138,"h":315},{"x":419,"y":921,"w":128,"h":315},{"x":679,"y":921,"w":133,"h":317},{"x":952,"y":921,"w":128,"h":314}],"chen":[{"x":187,"y":5,"w":116,"h":316},{"x":441,"y":7,"w":114,"h":309},{"x":662,"y":6,"w":115,"h":312},{"x":917,"y":3,"w":111,"h":312},{"x":171,"y":330,"w":133,"h":300},{"x":461,"y":329,"w":65,"h":302},{"x":650,"y":330,"w":172,"h":300},{"x":947,"y":329,"w":64,"h":302},{"x":169,"y":646,"w":135,"h":303},{"x":467,"y":647,"w":74,"h":301},{"x":649,"y":647,"w":182,"h":302},{"x":956,"y":646,"w":71,"h":303},{"x":180,"y":955,"w":122,"h":318},{"x":442,"y":957,"w":112,"h":310},{"x":662,"y":953,"w":122,"h":322},{"x":911,"y":952,"w":118,"h":316}],"reyes":[{"x":144,"y":7,"w":129,"h":300},{"x":445,"y":5,"w":120,"h":302},{"x":742,"y":8,"w":128,"h":299},{"x":1009,"y":5,"w":120,"h":302},{"x":109,"y":319,"w":198,"h":299},{"x":455,"y":318,"w":88,"h":302},{"x":715,"y":318,"w":194,"h":300},{"x":1027,"y":318,"w":84,"h":302},{"x":109,"y":630,"w":198,"h":300},{"x":458,"y":631,"w":84,"h":301},{"x":712,"y":632,"w":197,"h":300},{"x":1035,"y":631,"w":79,"h":301},{"x":142,"y":944,"w":133,"h":301},{"x":444,"y":941,"w":115,"h":301},{"x":738,"y":942,"w":132,"h":300},{"x":1008,"y":942,"w":115,"h":304}]};
I.loadArt=function(){return Promise.all(profiles.map(function(p){return new Promise(function(resolve){var im=new Image();im.onload=function(){art[p.id]=im;resolve();};im.onerror=function(){resolve();};im.src='assets/'+p.id+'-walk.png';});}));};
// Atlas alpha bounds are compiled at build time for file:// compatibility.
I.artReady=function(){return profiles.every(function(p){return !!art[p.id];});};
var original=Z.Art.drawPlayer;
Z.Art.drawPlayer=function(g,x,y,dir,phase,moving,t,flash){return Z.Art.drawInvestigator(g,I.current().id,x,y,dir,phase,moving,t,flash);};
Z.Art.drawInvestigator=function(g,id,x,y,dir,phase,moving,t,flash){
 var im=art[id];if(!im){original(g,x,y,dir,phase,moving,t,flash);return;}
 var row={down:0,left:1,right:2,up:3}[dir]||0,col=moving&&!Z.reduced()?Math.floor(phase*1.3)%4:1,flip=false;
 // Correct individual atlas poses verified visually; preserve facing throughout each walk cycle.
 if(id==='reyes'&&(dir==='left'||dir==='right'))row=dir==='left'?2:1;
 if((id==='carter'||id==='chen')&&dir==='left'&&col===2)flip=true;
 if(id==='chen'&&(dir==='right'||dir==='left'&&col===0))flip=true;
 if(id==='reyes'&&dir==='left')flip=true;
 var f=frames[id][row*4+col],h=96,w=f.w/f.h*h;
 g.save();g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(x,y+1,19,6,0,0,Math.PI*2);g.fill();g.translate(Math.round(x),Math.round(y));if(flip)g.scale(-1,1);g.drawImage(im,f.x,f.y,f.w,f.h,-w/2,-h,w,h);g.restore();
};
I.frameBounds=function(id){return frames[id];};
I.select=function(done){
 var m=Z.UI.modal({title:'Ravenwood Personnel Selection',cls:'personnel',required:true}),chosen='vale';
 m.el.querySelector('#modal-close').hidden=true;
 // Keep speech and sound controls available; prevent competing progress/panel modals.
 var controls=Array.from(document.querySelectorAll('.bar-main button, .tools [aria-label="Progress"] button'));
 var old=controls.map(function(b){var d=b.disabled;b.disabled=true;return d;});
 m.body.innerHTML='<p class="personnel-kicker">RAVENWOOD / FIELD OPERATIONS / PERSONNEL CLEARANCE</p><p>Choose your adult investigator. Every investigator can solve every case and earn Level Z-03 Clearance.</p><fieldset><legend>Select an investigator</legend><div class="personnel-grid">'+profiles.map(function(p,i){return '<label class="personnel-card"><input type="radio" name="investigator" value="'+p.id+'" '+(!i?'checked':'')+'><span class="portrait portrait-'+p.id+'" role="img" aria-label="Portrait of '+p.name+'"></span><strong>'+p.name+'</strong><span>'+p.specialty+'</span></label>';}).join('')+'</div></fieldset><div id="personnel-preview" aria-live="polite"></div><label for="investigator-code">Optional investigator codename (32 characters maximum)</label><input id="investigator-code" type="text" maxlength="32" autocomplete="off" placeholder="For example: Night Owl"><p class="muted">Use a fictional codename. A real name is optional only when you generate your final certificate.</p><p id="personnel-error" role="alert"></p><button type="button" class="btn primary" id="personnel-confirm">Confirm investigator and begin</button>';
 function preview(){var p=profile(chosen),a=p.ratings; m.body.querySelector('#personnel-preview').innerHTML='<div class="personnel-preview"><canvas id="personnel-model" width="160" height="200" role="img" aria-label="Full-body preview of '+p.name+'"></canvas><div><h3>'+p.name+'</h3><p>'+p.ability+'</p>'+labels.map(function(l,i){var effect=[a[0]>=4?'Expanded scientific context notes':'Scientific context notes','Walking speed +'+Math.round((1+(a[1]-2)*.025-1)*1000)/10+'%', 'Evidence detection within '+(110+a[2]*28)+' world pixels',a[3]>=4?'Detailed equipment troubleshooting':a[3]>=3?'Equipment checks and baseline guidance':'Component checks and console workflow'][i];return '<p><b>'+l+': '+a[i]+' of 5</b> <span aria-hidden="true">'+('■'.repeat(a[i])+'□'.repeat(5-a[i]))+'</span><br>'+effect+'</p>';}).join('')+'</div></div>';
 var cv=m.body.querySelector('canvas'),g=cv.getContext('2d'),im=art[p.id];if(im){var f=frames[p.id][1],h=184,w=f.w/f.h*h;g.drawImage(im,f.x,f.y,f.w,f.h,80-w/2,8,w,h);}
 }
 m.body.addEventListener('change',function(e){if(e.target.name==='investigator'){chosen=e.target.value;preview();}});
 m.body.querySelector('#personnel-confirm').addEventListener('click',function(){
 if(!I.artReady()){m.body.querySelector('#personnel-error').textContent='Character artwork could not load. Keep the assets folder beside index.html and reopen the game.';return;}
 Z.state.investigator=I.make(chosen,m.body.querySelector('#investigator-code').value);controls.forEach(function(b,i){b.disabled=old[i];});m.allowClose=true;m.close();done();
 });preview();setTimeout(function(){m.focusFirst();},0);
};
var observed=[],acc=0,lastStatus='';
I.scan=function(){var p=Z.Engine.player;return (Z.Engine.objs||[]).filter(function(o){
 if(o.visibleIf&&!o.visibleIf()||o.kind==='pickup'&&Z.state.items[o.item]||o.hideDone&&o.hideDone()||o.kind==='use'&&Z.state.flags[o.flag]||o.kind==='note'&&Z.state.lore[o.id]||o.kind==='puzzle'&&Z.puzzleDone(o.puzzle))return false;
 if(Math.hypot(o.x-p.x,o.y-p.y)>I.radius())return false;
 // Stop at walls and sealed gates. Final object may be placed on furniture.
 for(var t=.1;t<.8;t+=.1)if(Z.Engine.hit(p.x+(o.x-p.x)*t,p.y+(o.y-p.y)*t))return false;
 return true;
});};
I.update=function(dt){acc+=dt;if(acc<.3)return;acc=0;observed=I.scan();var el=Z.$('#ability-hud'),p=I.current();var text=observed.length?'Observation '+p.ratings[2]+'/5: '+observed.length+' nearby lead'+(observed.length===1?'':'s')+' — '+observed.map(function(o){return typeof o.label==='function'?o.label():o.label;}).join('; '):'';
 if(text!==lastStatus){el.textContent=text;el.hidden=!text;lastStatus=text;}
};
I.drawObservation=function(g,cx,cy){g.save();g.strokeStyle='#e8edf1';g.fillStyle='#fff';g.lineWidth=2;g.font='bold 12px sans-serif';observed.forEach(function(o){if((o.visibleIf&&!o.visibleIf())||(o.kind==='pickup'&&Z.state.items[o.item]))return;var x=o.x-cx,y=(o.my||o.y)-(o.kind==='pickup'?34:92)-cy;g.strokeRect(x-23,y-22,46,44);g.fillText('LEAD',x-16,y-28);});g.restore();};
})();
