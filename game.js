/* RAVENWOOD: THE LAST MISSION | game.js
   Game flow: interactions, items, objectives, zone transitions, HUD, dialog. */
(function(){
'use strict';
var Z=window.Z,G=Z.Game={},E=Z.Engine,$=Z.$,T=64;
var dlgOpen=false,dlgCb=null,bannerTimer=null,hintShown=false;

G.has=function(i){return !!Z.state.items[i];};
G.objectiveInfo=function(){
  var z=E.zone||Z.ZONES[Z.state.zone],steps=z.steps,cur=null,doneN=0;
  steps.forEach(function(s,i){if(s.done())doneN++;else if(!cur)cur=s;});
  return {zone:z,cur:cur,steps:steps,doneN:doneN,all:!cur};
};
G.refresh=function(){
  var z=E.zone;if(!z)return;
  E.rebuild();
  var o=G.objectiveInfo();
  $('#hz').textContent='Zone '+z.id+' of 6: '+z.name;
  var text;
  if(o.all){text=z.id===6?(Z.certReady()?'Mission complete. Open your certificate from the Menu.':'Finish the final verdict at the command console.'):'Zone complete. Use the exit door to continue.';}
  else text=o.cur.t;
  $('#ho').innerHTML='<b>Objective:</b> '+Z.esc(text);
  var hint=o.cur&&o.cur.hint?o.cur.hint:'Look around for glowing diamond markers marked E. Open the Journal for your evidence.';
  $('#hint-text').textContent=hint;
  if(!hintShown){$('#hint-text').hidden=true;$('#b-hint').setAttribute('aria-expanded','false');}
  Z.Save.queue();
  if(Z.UI&&Z.UI.refreshPanels)Z.UI.refreshPanels();
};
G.toggleHint=function(){
  hintShown=!hintShown;$('#hint-text').hidden=!hintShown;$('#b-hint').setAttribute('aria-expanded',hintShown?'true':'false');
  $('#b-hint').textContent=hintShown?'Hide hint':'Hint';
};
function promptText(o){
  if(!o)return '';
  if(o.kind==='door'){var d=o.door;return d.openIf()?'Go through the door':'Inspect the sealed door';}
  var l=o.label;if(typeof l==='function')l=l();
  if(o.labelDone&&o.flag&&Z.state.flags[o.flag])l=o.labelDone;
  return l;
}
G.onPrompt=function(o){
  var p=$('#hud-prompt');
  if(!o||dlgOpen){p.hidden=true;return;}
  var t=promptText(o);p.innerHTML='Press <b>E</b> to '+Z.esc(t.charAt(0).toLowerCase()+t.slice(1));p.hidden=false;p.setAttribute('aria-label','Press E to '+t);
};
G.interact=function(o){
  if(!o||dlgOpen||E.isBlocked())return;
  if(o.enabledIf){var m=o.enabledIf();if(m!==true&&m){G.dialog(m);return;}}
  if(o.kind==='pickup'){
    if(Z.state.items[o.item])return;
    Z.state.items[o.item]=true;Z.Audio.pickup();
    var it=Z.ITEMS[o.item];
    G.dialog('You picked up: '+it.name+'. '+it.desc+(it.use?' '+it.use:''),null,'Item added to your inventory (I).');
    G.refresh();E.onPrompt(null);
  }else if(o.kind==='use'){
    if(Z.state.flags[o.flag]){G.dialog(o.done);return;}
    if(o.item&&!G.has(o.item)){Z.Audio.bad();G.dialog(o.missing);return;}
    Z.state.flags[o.flag]=true;if(o.item)Z.state.used[o.item]=true;Z.Audio.use();G.dialog(o.done);E.rebuild();G.refresh();E.onPrompt(null);
  }else if(o.kind==='puzzle'){
    if(o.item&&!Z.state.flags[o.flag]){
      if(!G.has(o.item)){Z.Audio.bad();G.dialog(o.missing);return;}
      Z.state.flags[o.flag]=true;Z.state.used[o.item]=true;Z.Audio.use();
      G.dialog(o.insert,function(){G.interact(o);});G.refresh();return;
    }
    if(o.ready){var m2=o.ready();if(m2!==true&&m2){Z.Audio.bad();G.dialog(m2);return;}}
    G.openPuzzle(o);
  }else if(o.kind==='note'){
    var first=!Z.state.lore[o.id];Z.state.lore[o.id]=true;Z.Audio.click();
    G.dialog(o.text,null,first?'Added to your Journal notes (J).':null);G.refresh();
  }else if(o.kind==='cert'){Z.Audio.terminal();Z.Cert.open();}
  else if(o.kind==='door'){G.useDoor(o.door);}
};
G.openPuzzle=function(o){
  Z.Audio.terminal();
  Z.Puzzles.open(o.puzzle,o);
};
G.onPuzzleChange=function(){G.refresh();};
G.dialog=function(text,cb,extra){
  dlgOpen=true;dlgCb=cb||null;
  text+=Z.Investigators.equipmentTip(text);
  $('#dlg-text').textContent=text+(extra?'  ('+extra+')':'');
  $('#dialog').hidden=false;E.block();E.onPrompt(null);
  setTimeout(function(){$('#dlg-close').focus();},0);
  Z.announce(text);
};
G.closeDialog=function(){
  if(!dlgOpen)return;
  dlgOpen=false;$('#dialog').hidden=true;E.unblock();
  var cb=dlgCb;dlgCb=null;$('#game').focus();
  if(cb)cb();
  E.onPrompt(E.nearest);
};
G.dialogOpen=function(){return dlgOpen;};
G.banner=function(z){
  var b=$('#banner');b.innerHTML='<div class="k">Zone '+z.id+' of 6</div><div class="t">'+Z.esc(z.name)+'</div><div class="l">'+Z.esc(z.location)+'</div>';
  b.hidden=false;clearTimeout(bannerTimer);bannerTimer=setTimeout(function(){b.hidden=true;},Z.reduced()?3500:3200);
  Z.announce('Zone '+z.id+': '+z.name+'. '+z.location+'.');
};
G.useDoor=function(d){
  if(!d.openIf()||d.to==null){Z.Audio.bad();G.dialog(d.locked);return;}
  G.travel(d.to,d.kind==='exit'?'forward':'back');
};
G.travel=function(id,mode){
  if(!Z.ZONES[id])return;
  if(Z.UI&&Z.UI.closeAll)Z.UI.closeAll(true);
  E.block();
  E.fadeTo(function(){
    var tz=Z.ZONES[id],sp;
    var dd=tz.doors.filter(function(x){return mode==='back'?x.kind==='exit':x.kind==='return';})[0]||tz.doors[0];
    sp=mode==='map'?{x:tz.spawn.x,y:tz.spawn.y,dir:'down'}:{x:dd.x*T+64,y:270,dir:'down'};
    Z.state.visited[id]=true;E.loadZone(id,sp);Z.Audio.setZone(id);
    E.unblock();G.afterLoad(true);
  });
  if(Z.reduced()){E.unblock();}
};
G.afterLoad=function(showBanner){
  G.refresh();if(showBanner)G.banner(E.zone);
  if(Z.UI)Z.UI.updateStageSize();
  Z.Save.saveNow(true);$('#game').focus();
};
G.restart=function(resume){
  var s=Z.state;
  Z.TTS.stop(true);if(Z.UI)Z.UI.closeAll(true);
  if(!s.investigator){Z.Investigators.select(function(){G.restart(resume);});return;}
  var id=s.zone||1,z=Z.ZONES[id],sp=(resume&&s.px>=0)?{x:s.px,y:s.py,dir:s.dir}:null;
  E.loadZone(id,sp);Z.Audio.setZone(id);
  if(!s.introDone){Z.UI.intro();}
  G.afterLoad(!resume||!s.introDone);
};
G.useItem=function(id){
  var cand=E.nearest;
  if(cand&&((cand.kind==='use'&&cand.item===id)||(cand.kind==='puzzle'&&cand.item===id))){Z.UI.closeAll(true);G.interact(cand);return true;}
  Z.notice('Nothing nearby needs this item right now. '+(Z.ITEMS[id].use||''),'warn');return false;
};
G.init=function(){
  E.onPrompt=G.onPrompt;E.onInteract=G.interact;
  $('#hud-prompt').addEventListener('click',function(){if(E.nearest)G.interact(E.nearest);});
  $('#dlg-close').addEventListener('click',G.closeDialog);
  $('#b-hint').addEventListener('click',G.toggleHint);
  window.addEventListener('keydown',function(e){
    if(dlgOpen&&(e.key==='e'||e.key==='E'||e.key==='Escape'||e.key==='Enter')){e.preventDefault();e.stopPropagation();G.closeDialog();}
  },true);
};
})();
