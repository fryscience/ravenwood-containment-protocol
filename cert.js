/* RAVENWOOD: THE LAST MISSION | cert.js
   Level Z-03 Clearance certificate: locked until the investigation is complete, text only (no external libraries),
   printed through the browser (Save as PDF), one landscape Letter page. */
(function(){
'use strict';
var Z=window.Z,C=Z.Cert={},$=Z.$,esc=Z.esc;
var rec=null;

function makeId(){
  var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',out=[];
  var rnd=function(n){var a=new Uint8Array(n);try{(window.crypto||window.msCrypto).getRandomValues(a);}catch(e){for(var i=0;i<n;i++)a[i]=Math.floor(Math.random()*256);}return a;};
  var b=rnd(12);for(var i=0;i<12;i++)out.push(A.charAt(b[i]%A.length));
  return 'Z03-'+out.slice(0,4).join('')+'-'+out.slice(4,8).join('')+'-'+out.slice(8,12).join('');
}
function today(){try{return new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}catch(e){return '';}}

function emblem(){
  var h='<svg class="emb" viewBox="0 0 120 120" role="img" aria-label="Ravenwood emblem"><circle cx="60" cy="60" r="56" fill="none" stroke="#d8b24e" stroke-width="3"/><circle cx="60" cy="60" r="50" fill="#0e1a15" stroke="#6d5a22" stroke-width="1.5"/>';
  h+='<polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill="none" stroke="#7fcf9f" stroke-width="2"/>';
  h+='<path d="M60 92 L60 52 M60 70 L44 56 M60 62 L76 48 M60 78 L74 66 M60 58 L48 46" stroke="#7fcf9f" stroke-width="3" stroke-linecap="round" fill="none"/>';
  h+='<path d="M40 40 Q60 22 80 40 Q70 36 60 38 Q50 36 40 40 Z" fill="#d8b24e"/>';
  h+='<text x="60" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#d8b24e" letter-spacing="2">RAVENWOOD</text></svg>';
  return h;
}
function seal(){
  var pts=[],n=28,i,a,r;
  for(i=0;i<n*2;i++){a=Math.PI*2*i/(n*2);r=i%2?56:62;pts.push((65+Math.cos(a)*r).toFixed(1)+','+(65+Math.sin(a)*r).toFixed(1));}
  return '<svg class="seal" viewBox="0 0 130 130" role="img" aria-label="Gold clearance seal"><defs><radialGradient id="gold" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#f3dc8a"/><stop offset=".55" stop-color="#d8b24e"/><stop offset="1" stop-color="#8b6d1f"/></radialGradient></defs>'+
   '<polygon points="'+pts.join(' ')+'" fill="url(#gold)" stroke="#7d6420" stroke-width="1.5"/><circle cx="65" cy="65" r="46" fill="none" stroke="#5a4510" stroke-width="2"/><circle cx="65" cy="65" r="40" fill="none" stroke="#5a4510" stroke-width="1"/>'+
   '<text x="65" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#3a2c08" letter-spacing="2">CLEARANCE</text>'+
   '<text x="65" y="78" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#3a2c08">Z-03</text>'+
   '<text x="65" y="96" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#3a2c08" letter-spacing="2">CLEARED</text></svg>';
}
function certHTML(name,id,date){
  return '<div id="certificate" aria-label="Certificate preview"><div class="grid"></div><div class="frame"></div><div class="frame2"></div>'+
   '<div class="cls">TOP SECRET // RAVENWOOD // LEVEL Z-03</div>'+emblem()+seal()+
   '<div class="inner"><div class="org">RAVENWOOD BIOLOGICAL RESPONSE TEAM</div><div class="t1">ELITE OUTBREAK INVESTIGATOR</div><div class="t2">LEVEL Z-03 CLEARANCE</div>'+
   '<div class="cl">This certifies that</div><div class="nm" id="cert-name">'+esc(name)+'</div>'+
   '<div class="msg2">the investigator successfully analyzed classified evidence from Subject Z-03 and demonstrated advanced scientific reasoning in the Ravenwood outbreak investigation.</div>'+
   '<div class="close">The outbreak was only the beginning. You uncovered what Ravenwood tried to keep classified.</div>'+
   '<div class="meta"><div>Completion date<br><b>'+esc(date)+'</b></div><div style="text-align:center;font-size:11px;color:#8d886f">Clearance ID generated on this device</div><div style="text-align:right">Clearance ID<br><b>'+esc(id)+'</b></div></div></div></div>';
}
function sizeName(){var e=$('#cert-name');if(!e)return;var n=e.textContent.length;e.style.fontSize=n>30?'34px':(n>22?'42px':'');}
function fit(){
  var fr=$('#cert-frame'),c=$('#certificate');if(!fr||!c)return;
  var w=fr.clientWidth||1056,sc=Math.min(1,w/1056);
  c.style.transform='scale('+sc+')';fr.style.height=Math.round(816*sc)+'px';
}
function fname(name){
  var n=Z.cleanName(name).replace(/\s+/g,'_').replace(/[^A-Za-z0-9_\-]/g,'');
  return 'Ravenwood_Z03_Certificate'+(n?'_'+n:'');
}
function lockedHTML(){
  var s=Z.state,ev=Z.p6Eval(),z5=0,i,col=Z.evCollected(),n=0;
  for(i=1;i<=5;i++)if(Z.puzzleDone(i))z5++;
  Z.EVID_ORDER.forEach(function(id){if(col[id]&&!Z.EVID[id].claim)n++;});
  var need=Z.EVID_ORDER.filter(function(id){return !Z.EVID[id].claim;}).length;
  function row(ok,t){return '<li>'+(ok?'<span class="chip ok">Done</span> ':'<span class="chip gold">To do</span> ')+esc(t)+'</li>';}
  return '<div class="card"><h3>Certificate locked</h3><p>Your Level Z-03 Clearance certificate unlocks when the investigation is complete. Here is what is left:</p><ul style="list-style:none;padding:0;display:grid;gap:.35rem">'+
   row(z5===5,'Zones 1 to 5 complete ('+z5+' of 5)')+
   row(n===need,'Required evidence collected ('+n+' of '+need+')')+
   row(ev.choiceOk,'Correct scientific interpretation chosen in Zone 6')+
   row(ev.valid.length>=3&&Object.keys(ev.phases).length>=3&&ev.invalid.length===0,'At least three valid evidence items from three different zones, and no rejected claims')+
   row(ev.cerOk,'A meaningful Claim, Evidence and Reasoning response')+
   row(Z.puzzleDone(6),'Final verdict submitted at the Central Command console in Zone 6')+
   '</ul><p>Nothing is lost. Go back to any zone from the Map and keep working.</p></div>';
}
C.open=function(){
  var s=Z.state;
  var r=Z.UI.modal({title:'Level Z-03 Clearance',cls:'cert-modal'});
  rec=r;
  if(!Z.certReady()){r.body.innerHTML=lockedHTML();setTimeout(function(){r.focusFirst();},0);return;}
  var first=!s.cert.id;
  if(first){s.cert.id=makeId();s.cert.date=today();Z.Audio.unlock();Z.Save.saveNow(true);}
  else if(!s.cert.date){s.cert.date=today();}
  var h='';
  if(first)h+='<div class="unlock" role="status"><div class="big">CLEARANCE GRANTED</div><p style="margin:.3rem 0 0">Zones 1 to 6 verified. Evidence verified. Final verdict accepted. You now hold Level Z-03 Clearance.</p></div>';
  h+='<div class="cert-ui"><div class="row"><div><label for="cert-in"><b>Your name for the certificate</b> (optional, letters only)</label><br><input type="text" id="cert-in" maxlength="40" autocomplete="off" value="'+esc(s.cert.name)+'"></div><button type="button" class="btn gold" id="cert-print">Print / Save Certificate as PDF</button></div>';
  h+='<div class="card"><h3>Next steps</h3><ol><li>Type your name above. Check that it looks right in the preview.</li><li>Select Print / Save Certificate as PDF. In the print window, set the destination to Save as PDF. Use landscape and set margins to None if the choice appears.</li><li>Save your personalized certificate as a PDF. Open the Ravenwood Wall of Survivors Padlet and upload your certificate to your class period\'s squad column.</li></ol></div></div>';
  h+='<div id="cert-frame">'+certHTML(Z.cleanName(s.cert.name),s.cert.id,s.cert.date)+'</div>';
  r.body.innerHTML=h;
  fit();sizeName();
  var inp=r.body.querySelector('#cert-in');
  inp.addEventListener('input',function(){
    var nm=Z.cleanName(inp.value);s.cert.name=nm;$('#cert-name').textContent=nm;sizeName();Z.Save.queue();
  });
  r.body.querySelector('#cert-print').addEventListener('click',function(){
    var old=document.title;document.title=fname(s.cert.name);
    var back=function(){document.title=old;window.removeEventListener('afterprint',back);};
    window.addEventListener('afterprint',back);
    try{window.print();}catch(e){Z.notice('Printing is blocked in this window. Open the game in its own browser tab and try again.','warn');back();}
    setTimeout(function(){document.title=old;},4000);
  });
  window.addEventListener('resize',fit);
  r.onClose=function(){window.removeEventListener('resize',fit);};
  setTimeout(function(){r.focusFirst();},0);
};
C.fit=fit;C.fname=fname;
})();
