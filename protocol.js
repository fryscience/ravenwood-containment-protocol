/* Pure protocol helpers, shared by the UI and offline tests. No simulated network. */
(function(root){
'use strict';
var P={VERSION:3,MAX_PLAYERS:4,ZONES:6,SDK_VERSION:'13.0.0',ALPHABET:'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',MESSAGES:['NEED HELP','FOUND EVIDENCE','COME HERE','READY','CHECK THE JOURNAL','ACTIVATE NOW']};
P.code=function(v){return String(v||'').toUpperCase().replace(/[\s-]/g,'');};
P.validCode=function(v){return /^[A-HJ-NP-Z2-9]{8}$/.test(v);};
P.online=function(uid,presence){return !!(presence&&presence[uid]&&Object.keys(presence[uid]).length);};
P.roster=function(slots,presence){return Object.keys(slots||{}).sort().map(function(k){return Object.assign({slot:k,online:P.online(slots[k].uid,presence)},slots[k]);});};
P.host=function(slots,presence){return P.roster(slots,presence).filter(function(p){return p.online;})[0]?.uid||null;};
P.readyCount=function(slots,presence){return P.roster(slots,presence).filter(function(p){return p.ready&&p.online;}).length;};
P.canStart=function(uid,slots,presence){return P.host(slots,presence)===uid&&P.readyCount(slots,presence)>=2;};
P.profile=function(id){return ['vale','carter','chen','reyes'].indexOf(id)>=0;};
P.claim=function(existing,uid,profile,codeName,now){if(existing)return existing.uid===uid?existing:undefined;return {uid:uid,investigator:profile,codename:String(codeName||'').replace(/[\x00-\x1f\x7f<>]/g,'').trim().slice(0,32),ready:false,joinedAt:now};};
P.project=function(facts,timeline,notes){var items={flashlight:true},flags={},lore={},ok={};Object.keys(facts?.items||{}).forEach(function(k){items[k]=true;});Object.keys(facts?.flags||{}).forEach(function(k){flags[k]=true;});Object.keys(timeline||{}).forEach(function(k){ok[k]=true;});Object.keys(notes||{}).forEach(function(k){lore[k]=true;});return {items:items,flags:flags,lore:lore,ok:ok};};
P.interpolate=function(a,b,dt,reduced){if(!a||reduced||Math.hypot(a.x-b.x,a.y-b.y)>400)return {x:b.x,y:b.y};var k=1-Math.exp(-14*Math.min(.1,dt));return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};};
P.error=function(error){return error?.message||'The mission service did not respond. Please retry.';};
if(typeof module!=='undefined')module.exports=P;else root.RavenwoodProtocol=P;
})(typeof window==='undefined'?globalThis:window);
