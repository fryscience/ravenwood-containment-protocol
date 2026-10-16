/* RAVENWOOD: THE LAST MISSION | save.js
   Automatic localStorage saving, JSON backup export, validated import, confirmed reset.
   Imported data is never executed: it is copied field by field into a fresh default state. */
(function(){
'use strict';
var Z=window.Z,Sv=Z.Save={},isObj=Z.isObj,int=Z.int,num=Z.num;
var timer=null,storageOK=true;
function bmap(src,allowed){var o={};allowed.forEach(function(k){if(isObj(src)&&src[k]===true)o[k]=true;});return o;}
function emap(src,allowed,vals){var o={};allowed.forEach(function(k){if(isObj(src)&&vals.indexOf(src[k])>=0)o[k]=src[k];});return o;}
function earr(src,allowed,max){var a=[];if(Array.isArray(src))src.forEach(function(v){if(a.length<max&&allowed.indexOf(v)>=0)a.push(v);});return a;}
function str(v,max){return typeof v==='string'?v.slice(0,max):'';}
Z.cleanName=function(v){return String(v==null?'':v).replace(/[^A-Za-zÀ-ɏ '.\-]/g,'').replace(/\s+/g,' ').trim().slice(0,40);};
Z.knownFlags=function(){var f={};Object.keys(Z.ZONES).forEach(function(k){Z.ZONES[k].objects.forEach(function(o){if(o.flag)f[o.flag]=1;});});return Object.keys(f);};
Z.knownLore=function(){var f=[];Object.keys(Z.ZONES).forEach(function(k){Z.ZONES[k].objects.forEach(function(o){if(o.kind==='note')f.push(o.id);});});return f;};
Sv.sanitize=function(s){
  if(!isObj(s))return null;
  var d=Z.defState(),PZ=Z.PZ||{};
  d.investigator=s.investigator===null?null:Z.Investigators.clean(s.investigator,true);
  var zz=parseInt(s.zone,10);d.zone=(zz>=1&&zz<=6)?zz:1;d.px=num(s.px,-1,-1,6000);d.py=num(s.py,-1,-1,2000);
  d.dir=['up','down','left','right'].indexOf(s.dir)>=0?s.dir:'down';d.introDone=s.introDone===true;
  var ik=Object.keys(Z.ITEMS);d.items=bmap(s.items,ik);d.items.flashlight=true;d.used=bmap(s.used,ik);
  d.flags=bmap(s.flags,Z.knownFlags());d.lore=bmap(s.lore,Z.knownLore());
  d.visited=bmap(s.visited&&Object.keys(s.visited).reduce(function(a,k){a[k]=s.visited[k];return a;},{}),['1','2','3','4','5','6']);
  var vis={};Object.keys(d.visited).forEach(function(k){vis[parseInt(k,10)]=true;});vis[1]=true;vis[d.zone]=true;d.visited=vis;
  var ids1=Z.T1.map(function(e){return e.id;});
  d.p1={ok:bmap(s.p1&&s.p1.ok,ids1),pick:emap(s.p1&&s.p1.pick,ids1,['obs','inf','uns'])};
  var p2=s.p2||{};
  d.p2={ints:int(p2.ints,6,1,10),burst:int(p2.burst,4,2,20),rest:int(p2.rest,12,0,60),goalA:p2.goalA===true,goalB:p2.goalB===true,qok:p2.qok===true,qpick:['a','b','c'].indexOf(p2.qpick)>=0?p2.qpick:'',runs:int(p2.runs,0,0,9999)};
  var p3=s.p3||{};
  d.p3={cond:['adequate','reduced','severe'].indexOf(p3.cond)>=0?p3.cond:'adequate',tested:bmap(p3.tested,['adequate','reduced','severe']),sel:bmap(p3.sel,PZ.p3ids||[]),selOk:p3.selOk===true,whyPick:['a','b','c','d'].indexOf(p3.whyPick)>=0?p3.whyPick:'',whyOk:p3.whyOk===true,node:['gly','aer','fer','out'].indexOf(p3.node)>=0?p3.node:'gly'};
  var p4=s.p4||{};
  d.p4={t1:earr(p4.t1,PZ.compIds||[],8),t2:earr(p4.t2,PZ.compIds||[],8),ok1:p4.ok1===true,ok2:p4.ok2===true,intr:['none','sens','spinal','brain','motor','muscle'].indexOf(p4.intr)>=0?p4.intr:'none',goalOk:p4.goalOk===true,stmt:emap(p4.stmt,PZ.stmtIds||[],['sup','not']),stmtOk:p4.stmtOk===true};
  var p5=s.p5||{};
  d.p5={views:bmap(p5.views,['cam','pump','o2','nut']),match:emap(p5.match,PZ.matchIds||[],['A','B','C']),matchOk:p5.matchOk===true,claims:emap(p5.claims,PZ.claimIds||[],['sup','tmp','uns']),claimsOk:p5.claimsOk===true};
  var p6=s.p6||{},cer=p6.cer||{};
  d.p6={choice:['A','B','C'].indexOf(p6.choice)>=0?p6.choice:'',sel:bmap(p6.sel,Z.EVID_ORDER),cer:{claim:str(cer.claim,1200),evidence:str(cer.evidence,1200),reasoning:str(cer.reasoning,1200)},submitted:p6.submitted===true,tries:int(p6.tries,0,0,9999)};
  var c=s.cert||{};
  d.cert={name:Z.cleanName(c.name),id:/^Z03-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c.id||'')?c.id:'',date:/^[A-Za-z0-9 ,.\/-]{0,40}$/.test(c.date||'')?(c.date||''):''};
  return d;
};
Sv.record=function(){
  var s=JSON.parse(JSON.stringify(Z.state)),p=Z.Engine.player;
  if(Z.Engine.zone&&s.investigator&&Z.Engine.zone.id===s.zone){s.px=Math.round(p.x);s.py=Math.round(p.y);s.dir=p.dir;s.zone=Z.Engine.zone.id;}
  return s;
};
Sv.saveNow=function(silent){
  try{window.localStorage.setItem(Z.KEY,JSON.stringify(Sv.record()));storageOK=true;if(!silent)Z.notice('Progress saved in this browser on this device.');return true;}
  catch(e){storageOK=false;if(!silent)Z.notice('This browser is blocking saving. Use Download Backup to keep your progress.','warn');return false;}
};
Sv.queue=function(){clearTimeout(timer);timer=setTimeout(function(){Sv.saveNow(true);},350);};
Sv.load=function(){
  try{var raw=window.localStorage.getItem(Z.KEY);if(!raw)return false;var o=JSON.parse(raw);var c=Sv.sanitize(o);if(!c)return false;Z.state=c;return true;}catch(e){return false;}
};
Sv.storageOK=function(){return storageOK;};
Sv.exportFile=function(){
  var payload={app:Z.APP_ID,version:Z.APP_VERSION,exportedAt:new Date().toISOString(),purpose:'Progress backup for Ravenwood: The Last Mission. Keep this file to restore your game. It is not a submission.',state:Sv.record()};
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download='Ravenwood_LastMission_Progress.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},1500);
  Z.notice('A backup file was created. Check your Downloads folder. Use Import Backup to restore it on any device.');
};
Sv.importFile=function(file,done){
  if(!file)return;
  if(file.size>500000){Z.notice('That file is too large to be a game backup, so it was not loaded.','warn');return;}
  var rd=new FileReader();
  rd.onerror=function(){Z.notice('That file could not be read, so it was not loaded.','warn');};
  rd.onload=function(){
    var obj;try{obj=JSON.parse(String(rd.result));}catch(e){Z.notice('That file is not a valid backup, so it was not loaded. Your current progress was not changed.','warn');return;}
    if(!isObj(obj)||obj.app!==Z.APP_ID||obj.version!==Z.APP_VERSION||!isObj(obj.state)){Z.notice('That file is not a backup for this game, so it was not loaded. Your current progress was not changed.','warn');return;}
    var clean=Sv.sanitize(obj.state);
    if(!clean){Z.notice('That backup has missing or unexpected content, so it was not loaded. Your current progress was not changed.','warn');return;}
    Z.UI.confirm('Loading this backup replaces the progress currently in this browser. Continue?','Yes, load it',function(){
      Z.state=clean;Z.Game.restart(true);Z.notice('Backup loaded. Your progress was restored.');
    });
  };
  rd.readAsText(file);
};
Sv.reset=function(){
  Z.UI.confirm('Reset Game will erase your saved progress in this browser and start over. This cannot be undone. Reset?','Yes, erase and restart',function(){
    try{window.localStorage.removeItem(Z.KEY);}catch(e){}
    Z.state=Z.defState();Z.Game.restart(false);Z.notice('Game reset. Starting a new investigation.');
  });
};
})();
