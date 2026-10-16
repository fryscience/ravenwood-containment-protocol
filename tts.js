/* RAVENWOOD: THE LAST MISSION | tts.js  Optional read-aloud with SpeechSynthesis. Never autoplays. */
(function(){
'use strict';
var Z=window.Z,$=Z.$,T=Z.TTS={};
var tts={supported:false,state:'idle',chunks:[],idx:0,token:0,rate:1,needsRestart:false};
var BLOCK={DIV:1,P:1,LI:1,UL:1,OL:1,H1:1,H2:1,H3:1,H4:1,H5:1,SECTION:1,ARTICLE:1,FIELDSET:1,LEGEND:1,LABEL:1,TR:1,TD:1,TH:1,TABLE:1,CAPTION:1,FIGURE:1,FIGCAPTION:1,BLOCKQUOTE:1,BUTTON:1,ASIDE:1,DL:1,DT:1,DD:1,BR:1,HEADER:1};
var SKIP={SCRIPT:1,STYLE:1,SVG:1,CANVAS:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,NOSCRIPT:1};
function skip(el){
  if(el.hidden||el.getAttribute('aria-hidden')==='true')return true;
  var c=el.classList;if(c.contains('no-read')||c.contains('sr-only'))return true;
  if(SKIP[el.tagName.toUpperCase()])return true;
  var cs=window.getComputedStyle(el);if(cs&&(cs.display==='none'||cs.visibility==='hidden'))return true;
  return false;
}
function clean(t){return t.replace(/\bZ-0(\d)\b/g,'Z zero $1').replace(/NAD\+/g,'N A D plus').replace(/\bATP\b/g,'A T P').replace(/\bCER\b/g,'C E R').replace(/\.\.\./g,' dot dot dot').replace(/\s+/g,' ').trim();}
function collect(roots){
  var out=[],cur='';
  function flush(){var t=clean(cur);cur='';if(!t)return;if(!/[.!?:;]$/.test(t))t+='.';out.push(t);}
  function walk(n){
    if(n.nodeType===3){cur+=n.textContent;return;}
    if(n.nodeType!==1)return;if(skip(n))return;
    var b=BLOCK[n.tagName.toUpperCase()];if(b)flush();
    for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
    if(b)flush();
  }
  roots.forEach(function(r){if(r){walk(r);flush();}});
  var chunks=[];
  out.forEach(function(s){
    if(s.length<=220){chunks.push(s);return;}
    var parts=s.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g)||[s],buf='';
    parts.forEach(function(p){if((buf+p).length>220&&buf){chunks.push(buf.trim());buf='';}buf+=p+' ';});
    if(buf.trim())chunks.push(buf.trim());
  });
  return chunks;
}
T.collect=collect;
function roots(){
  var modal=document.querySelector('#modal-root .modal');
  if(modal)return [modal.querySelector('.body')||modal];
  var r=[$('#banner'),$('#hud-obj'),$('#dialog'),$('#hud-prompt')];
  return r.filter(function(e){return e&&!e.hidden;});
}
function buttons(){
  var s=tts.state;
  $('#tts-play').disabled=!tts.supported;$('#tts-pause').disabled=!(tts.supported&&s==='speaking');
  $('#tts-resume').disabled=!(tts.supported&&s==='paused');$('#tts-stop').disabled=!(tts.supported&&(s==='speaking'||s==='paused'));
  $('#tts-speed').disabled=!tts.supported;
}
function msg(m){var e=$('#tts-msg');if(m){e.textContent=m;e.hidden=false;}else{e.textContent='';e.hidden=true;}}
function voice(){try{var vs=window.speechSynthesis.getVoices()||[],en=vs.filter(function(v){return /^en(-|_|$)/i.test(v.lang);});return en.filter(function(v){return /en-US/i.test(v.lang);})[0]||en[0]||null;}catch(e){return null;}}
function next(tok){
  if(tok!==tts.token)return;
  if(tts.idx>=tts.chunks.length){tts.state='idle';buttons();Z.announce('Finished reading.');return;}
  var u=new window.SpeechSynthesisUtterance(tts.chunks[tts.idx]);u.rate=tts.rate;u.lang='en-US';var v=voice();if(v)u.voice=v;
  u.onend=function(){if(tok!==tts.token)return;tts.idx++;next(tok);};
  u.onerror=function(e){if(tok!==tts.token)return;var er=e&&e.error;if(er==='interrupted'||er==='canceled')return;T.stop(true);msg('Read-aloud could not start in this browser. The game works without it.');};
  try{window.speechSynthesis.speak(u);}catch(err){T.stop(true);msg('Read-aloud could not start in this browser. The game works without it.');}
}
T.start=function(){
  if(!tts.supported)return;msg('');
  var chunks=collect(roots());
  try{window.speechSynthesis.cancel();window.speechSynthesis.resume();}catch(e){}
  tts.token++;tts.chunks=chunks;tts.idx=0;tts.needsRestart=false;
  if(!chunks.length){tts.state='idle';buttons();Z.announce('There is nothing to read right now.');return;}
  tts.state='speaking';buttons();Z.announce('Reading aloud.');next(tts.token);
};
T.pause=function(){if(!tts.supported||tts.state!=='speaking')return;try{window.speechSynthesis.pause();}catch(e){}tts.state='paused';buttons();Z.announce('Reading paused.');};
T.resume=function(){
  if(!tts.supported||tts.state!=='paused')return;
  if(tts.needsRestart){tts.needsRestart=false;tts.token++;tts.state='speaking';buttons();next(tts.token);Z.announce('Reading resumed.');return;}
  try{window.speechSynthesis.resume();}catch(e){}tts.state='speaking';buttons();Z.announce('Reading resumed.');
};
T.stop=function(quiet){
  tts.token++;tts.chunks=[];tts.idx=0;tts.needsRestart=false;var was=tts.state;tts.state='idle';
  if(tts.supported){try{window.speechSynthesis.cancel();}catch(e){}}
  buttons();if(!quiet&&was!=='idle')Z.announce('Reading stopped.');
};
T.speed=function(){
  tts.rate=parseFloat($('#tts-speed').value)||1;
  if(tts.state==='speaking'){tts.token++;try{window.speechSynthesis.cancel();}catch(e){}next(tts.token);}
  else if(tts.state==='paused'){tts.token++;try{window.speechSynthesis.cancel();}catch(e){}tts.needsRestart=true;}
};
T.state=function(){return tts.state;};
T.init=function(){
  tts.supported=('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window);
  if(!tts.supported)msg('Read-aloud is not available in this browser. The game works without it. Chrome or Edge usually supports it.');
  else{try{window.speechSynthesis.getVoices();}catch(e){}}
  $('#tts-play').addEventListener('click',T.start);$('#tts-pause').addEventListener('click',T.pause);
  $('#tts-resume').addEventListener('click',T.resume);$('#tts-stop').addEventListener('click',function(){T.stop();});
  $('#tts-speed').addEventListener('change',T.speed);buttons();
};
})();
