/* RAVENWOOD: THE LAST MISSION | audio.js
   Web Audio synthesis only (no audio files). OFF by default. Nothing plays until the player unmutes. */
(function(){
'use strict';
var Z=window.Z,A=Z.Audio={on:false,sfx:true,music:false,vol:0.5,zone:1};
var ctx=null,master=null,musicBus=null,mTimer=null,mNodes=[],lastStep=0;
function ensure(){
  if(ctx)return true;
  try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);return true;}catch(e){return false;}
}
function applyVol(){if(master)master.gain.setTargetAtTime(A.on?A.vol*0.7:0,ctx.currentTime,0.03);}
A.supported=function(){return !!(window.AudioContext||window.webkitAudioContext);};
A.setOn=function(on){
  A.on=!!on;
  if(on){if(!ensure()){A.on=false;return false;}try{ctx.resume();}catch(e){}applyVol();if(A.music)startMusic();}
  else{applyVol();stopMusic();}
  return A.on;
};
A.setVol=function(v){A.vol=Math.max(0,Math.min(1,v));if(ctx)applyVol();};
A.setSfx=function(b){A.sfx=!!b;};
A.setMusic=function(b){A.music=!!b;if(A.on){if(b)startMusic();else stopMusic();}};
A.setZone=function(n){A.zone=n;if(A.on&&A.music){stopMusic();startMusic();}};
function tone(f,dur,type,gain,delay,slideTo){
  if(!A.on||!A.sfx||!ctx)return;
  var t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(gain||0.1,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);
}
function noise(dur,gain,freq,delay){
  if(!A.on||!A.sfx||!ctx)return;
  var t=ctx.currentTime+(delay||0),n=Math.floor(ctx.sampleRate*dur),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  var s=ctx.createBufferSource();s.buffer=buf;var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=freq||600;
  var g=ctx.createGain();g.gain.value=gain||0.08;s.connect(f);f.connect(g);g.connect(master);s.start(t);
}
A.step=function(){var n=Date.now();if(n-lastStep<150)return;lastStep=n;noise(0.07,0.07,500+Math.random()*250);};
A.door=function(){noise(0.5,0.06,380);tone(110,0.4,'sawtooth',0.04,0,70);tone(220,0.12,'square',0.03,0.35);};
A.pickup=function(){tone(660,0.12,'triangle',0.08);tone(990,0.2,'triangle',0.07,0.1);};
A.use=function(){tone(180,0.18,'square',0.05);tone(360,0.25,'sine',0.07,0.12);};
A.terminal=function(){tone(880,0.05,'square',0.035);tone(1180,0.05,'square',0.03,0.07);tone(740,0.08,'square',0.03,0.14);};
A.click=function(){tone(520,0.04,'square',0.025);};
A.good=function(){tone(587,0.12,'triangle',0.07);tone(880,0.2,'triangle',0.07,0.1);};
A.bad=function(){tone(180,0.22,'sawtooth',0.05,0,140);};
A.discover=function(){tone(523,0.2,'sine',0.08);tone(659,0.2,'sine',0.07,0.1);tone(784,0.35,'sine',0.07,0.2);};
A.alarm=function(){tone(440,0.25,'square',0.05);tone(330,0.3,'square',0.05,0.3);};
A.unlock=function(){[392,523,659,784,1047].forEach(function(f,i){tone(f,0.5,'triangle',0.08,i*0.14);});tone(130,1.4,'sine',0.07,0);};
/* music: low drone, slow filtered pad, soft pulse, sparse notes. Intensity rises with the zone. */
function startMusic(){
  if(!ctx||!A.on||musicBus)return;
  musicBus=ctx.createGain();musicBus.gain.value=0.0001;musicBus.connect(master);
  musicBus.gain.exponentialRampToValueAtTime(0.5,ctx.currentTime+2);
  var z=A.zone||1,base=[55,49,46.25,51.9,41.2,55][z-1]||55;
  var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260+z*40;lp.connect(musicBus);
  var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=0.07+z*0.01;lg.gain.value=90;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();mNodes.push(lfo);
  [1,1.005,1.5].forEach(function(m,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type=i===2?'sine':'sawtooth';o.frequency.value=base*m;g.gain.value=i===2?0.05:0.08;o.connect(g);g.connect(lp);o.start();mNodes.push(o);});
  var beat=0;
  mTimer=setInterval(function(){
    if(!A.on||!A.music||!ctx)return;
    beat++;var t=ctx.currentTime;
    var rate=Math.max(1,4-Math.floor(z/2));
    if(beat%rate===0){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(base*1.2,t);o.frequency.exponentialRampToValueAtTime(base*0.6,t+0.35);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.16+z*0.02,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.4);o.connect(g);g.connect(musicBus);o.start(t);o.stop(t+0.45);}
    if(beat%5===0&&Math.random()<0.7){var sc=[1,1.2,1.5,1.8,2,2.4],f=base*4*sc[(Math.random()*sc.length)|0],o2=ctx.createOscillator(),g2=ctx.createGain();o2.type='sine';o2.frequency.value=f;g2.gain.setValueAtTime(0.0001,t);g2.gain.exponentialRampToValueAtTime(0.03,t+0.05);g2.gain.exponentialRampToValueAtTime(0.0001,t+1.8);o2.connect(g2);g2.connect(musicBus);o2.start(t);o2.stop(t+2);}
  },500);
}
function stopMusic(){
  if(mTimer){clearInterval(mTimer);mTimer=null;}
  mNodes.forEach(function(n){try{n.stop();}catch(e){}});mNodes=[];
  if(musicBus){var b=musicBus;musicBus=null;try{b.gain.setTargetAtTime(0.0001,ctx.currentTime,0.1);setTimeout(function(){try{b.disconnect();}catch(e){}},600);}catch(e){}}
}
})();
