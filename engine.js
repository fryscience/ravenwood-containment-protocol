/* RAVENWOOD: THE LAST MISSION | engine.js
   Canvas renderer, input, player physics, collision, camera, interaction detection, auto-walk. */
(function(){
'use strict';
var Z=window.Z,Art=Z.Art,E=Z.Engine={},T=64;
var VW=1280,VH=720;E.VW=VW;E.VH=VH;
var canvas,ctx,scale=1,zone=null,bake=null,props=[],objs=[],solids=[],lights=[],doors=[],gates=[],fog=null,dust=[];
var keys={},player={x:200,y:470,vx:0,vy:0,dir:'down',phase:0,moving:false};
var cam={x:0,y:0},time=0,last=0,fade=0,fadeDir=0,fadeCb=null,blocked=0,running=false,walkAcc=0;
var auto=null,nearest=null,stepSnd=0;
E.player=player;E.cam=cam;E.keys=keys;
Object.defineProperty(E,'zone',{get:function(){return zone;}});
Object.defineProperty(E,'nearest',{get:function(){return nearest;}});
Object.defineProperty(E,'objs',{get:function(){return objs;}});
E.screenLive=function(p){var o=zone&&zone.objects.filter(function(x){return x.id===p.id;})[0];if(!o)return true;if(o.powerFlag)return !!Z.state.flags[o.powerFlag];if(o.flag&&o.item)return !!Z.state.flags[o.flag];return true;};
E.onPrompt=function(){};E.onInteract=function(){};E.onZoneLoaded=function(){};
var DIRV={down:{x:0,y:1},up:{x:0,y:-1},left:{x:-1,y:0},right:{x:1,y:0}};
var SPEED=205,ACC=1700,DEC=2100,FW=24,FH=8;

E.init=function(cv){
  canvas=cv;ctx=cv.getContext('2d');fog=Art.makeFog();
  for(var i=0;i<70;i++)dust.push({x:Math.random()*VW,y:Math.random()*VH,s:0.4+Math.random()*1.2,v:3+Math.random()*7,p:Math.random()*6});
  window.addEventListener('resize',E.resize);E.resize();
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKeyUp);
  window.addEventListener('blur',function(){for(var k in keys)delete keys[k];});
  canvas.addEventListener('mousedown',function(){canvas.focus();});
  if(!running){running=true;requestAnimationFrame(loop);}
};
E.resize=function(){
  if(!canvas)return;
  var wrap=canvas.parentNode,w=wrap.clientWidth||VW,dpr=window.devicePixelRatio||1;
  var k=Math.max(1,Math.min(2,Math.ceil(w/VW*dpr)));
  if(canvas.width!==VW*k){canvas.width=VW*k;canvas.height=VH*k;}
  scale=k;
};
E.block=function(){blocked++;for(var k in keys)delete keys[k];};
E.unblock=function(){blocked=Math.max(0,blocked-1);};
E.isBlocked=function(){return blocked>0;};

var MOVE={'ArrowLeft':'l','a':'l','A':'l','ArrowRight':'r','d':'r','D':'r','ArrowUp':'u','w':'u','W':'u','ArrowDown':'d','s':'d','S':'d'};
function typing(e){var t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT');}
function onKey(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(typing(e))return;
  var m=MOVE[e.key];
  if(blocked>0)return;
  if(m){keys[m]=true;auto=null;e.preventDefault();return;}
  if(e.key==='e'||e.key==='E'||e.key==='Enter'&&document.activeElement===canvas){
    if(nearest){e.preventDefault();E.onInteract(nearest);}
  }
}
function onKeyUp(e){var m=MOVE[e.key];if(m)delete keys[m];}

/* ---------- zone loading ---------- */
E.loadZone=function(id,spawn){
  zone=Z.ZONES[id];Z.state.zone=id;
  var th=Art.THEMES[zone.theme];
  if(!zone._bake)zone._bake=Art.bakeZone(zone);
  bake=zone._bake;
  props=zone.props.map(function(p){var s=Art.propSprite(p,th),s2=null;if(p.altOpt){var q={};for(var k in p)q[k]=p[k];q.opt=p.altOpt;s2=Art.propSprite(q,th);}return {p:p,spr:s,spr2:s2};});
  props.sort(function(a,b){return (a.p.y+a.p.d)-(b.p.y+b.p.d);});
  objs=zone.objects;
  doors=zone.doors.map(function(d){return {d:d,open:d.openIf()?1:0,tgt:d.openIf()?1:0};});
  gates=zone.gates.map(function(g){return {g:g,open:g.openIf()?1:0,tgt:g.openIf()?1:0};});
  lights=zone.lights.slice();
  zone.props.forEach(function(p){if(p.t==='console'||p.t==='server')lights.push({x:p.x+p.w/2,y:p.y+p.d-p.h*0.5,r:120,color:th.screen});});
  zone.props.forEach(function(p){if(p.t==='tube')lights.push({x:p.x+p.w/2,y:p.y+p.d-p.h*0.5,r:110,color:'#6dc28f'});});
  buildSolids();
  var s=spawn||zone.spawn;
  player.x=s.x;player.y=s.y;player.vx=player.vy=0;player.dir=s.dir||'down';auto=null;
  cam.x=0;cam.y=0;updateCam(true);
  E.onZoneLoaded(zone);
};
function buildSolids(){
  var W=zone.w*T,H=zone.h*T;solids=[];
  solids.push({x:0,y:0,w:W,h:3*T});solids.push({x:0,y:(zone.h-1)*T,w:W,h:T});
  var cols=[0].concat(zone.parts).concat([zone.w-1]);
  cols.forEach(function(cx){
    var y0=3,list=zone.gates.filter(function(g){return g.x===cx;}).sort(function(a,b){return a.y0-b.y0;});
    list.forEach(function(g){if(g.y0>y0)solids.push({x:cx*T,y:y0*T,w:T,h:(g.y0-y0)*T});y0=g.y0+g.n;});
    if(y0<zone.h-1)solids.push({x:cx*T,y:y0*T,w:T,h:(zone.h-1-y0)*T});
  });
  gates.forEach(function(g){if(!g.g.openIf())solids.push({x:g.g.x*T+8,y:g.g.y0*T,w:T-16,h:g.g.n*T,gate:g.g.id});});
  props.forEach(function(pr){var p=pr.p;if(p.solid===false)return;if(p.showIf&&!p.showIf())return;solids.push({x:p.x,y:p.y,w:p.w,h:p.d});});
}
E.rebuild=function(){if(zone)buildSolids();};
function hit(x,y){
  var l=x-FW/2,r=x+FW/2,t=y-FH,b=y;
  for(var i=0;i<solids.length;i++){var s=solids[i];if(r>s.x&&l<s.x+s.w&&b>s.y&&t<s.y+s.h)return true;}
  return false;
}
E.hit=hit;
function updateCam(snap){
  var W=zone.w*T,H=zone.h*T,tx=Math.max(0,Math.min(W-VW,player.x-VW/2)),ty=Math.max(0,Math.min(H-VH,player.y-48-VH/2));
  if(snap||Z.reduced()){cam.x=tx;cam.y=ty;}else{cam.x+=(tx-cam.x)*0.12;cam.y+=(ty-cam.y)*0.12;}
  cam.x=Math.max(0,Math.min(W-VW,cam.x));cam.y=Math.max(0,Math.min(H-VH,cam.y));
}

/* ---------- auto-walk (accessible alternative to precise movement, and used in tests) ---------- */
var walkMargin=true;
function freeCell(x,y){if(hit(x,y))return false;if(!walkMargin)return true;return !hit(x-8,y)&&!hit(x+8,y)&&!hit(x,y-8)&&!hit(x,y+8);}
E.walkTo=function(tx,ty,done){
  walkMargin=true;if(walkPlan(tx,ty,done))return true;
  walkMargin=false;var r=walkPlan(tx,ty,done);walkMargin=true;return r;
};
function walkPlan(tx,ty,done){
  var G=16,W=zone.w*T,H=zone.h*T,cols=Math.ceil(W/G),rows=Math.ceil(H/G);
  var sx=Math.round(player.x/G),sy=Math.round(player.y/G),gx=Math.round(tx/G),gy=Math.round(ty/G);
  function ok(cx,cy){return cx>=0&&cy>=0&&cx<cols&&cy<rows&&freeCell(cx*G,cy*G);}
  // find nearest free goal cell
  var best=null;for(var r=0;r<12&&!best;r++){for(var dx=-r;dx<=r&&!best;dx++)for(var dy=-r;dy<=r&&!best;dy++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(ok(gx+dx,gy+dy))best=[gx+dx,gy+dy];}}
  if(!best)return false;
  gx=best[0];gy=best[1];
  var prev={},q=[[sx,sy]],seen={};seen[sx+','+sy]=1;var found=false,qi=0;
  while(qi<q.length){var c=q[qi++];if(c[0]===gx&&c[1]===gy){found=true;break;}
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=c[0]+d[0],ny=c[1]+d[1],k=nx+','+ny;if(!seen[k]&&ok(nx,ny)){seen[k]=1;prev[k]=c;q.push([nx,ny]);}});}
  if(!found)return false;
  var path=[],c2=[gx,gy];while(c2&&!(c2[0]===sx&&c2[1]===sy)){path.push({x:c2[0]*G,y:c2[1]*G});c2=prev[c2[0]+','+c2[1]];}
  path.reverse();
  // simplify collinear points
  var sp=[];path.forEach(function(p,i){var a=sp[sp.length-1],pp=path[i-1],nn=path[i+1];if(!pp||!nn||((p.x-pp.x)!==(nn.x-p.x)||(p.y-pp.y)!==(nn.y-p.y)))sp.push(p);});
  auto={path:sp,i:0,done:done,stuck:0};return true;
}
E.cancelWalk=function(){auto=null;};
E.isWalking=function(){return !!auto;};

/* ---------- update ---------- */
function inputVec(){
  var x=(keys.r?1:0)-(keys.l?1:0),y=(keys.d?1:0)-(keys.u?1:0);
  if(!x&&!y&&auto){
    var p=auto.path[auto.i];
    if(!p){var d=auto.done;auto=null;if(d)d(true);return {x:0,y:0};}
    var dx=p.x-player.x,dy=p.y-player.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<6){auto.i++;return {x:0,y:0};}
    x=dx/dist;y=dy/dist;
    // path segments are axis-aligned: ignore tiny cross offsets so facing stays clean
    if(Math.abs(dx)<5)x=0;if(Math.abs(dy)<5)y=0;
  }
  if(x&&y&&Math.abs(x)===1&&Math.abs(y)===1){x*=0.7071;y*=0.7071;}
  return {x:x,y:y};
}
function update(dt){
  time+=dt;
  if(Z.Net)Z.Net.frame(dt);
  if(fadeDir!==0){fade+=fadeDir*dt/0.28;if(fadeDir>0&&fade>=1){fade=1;fadeDir=0;var cb=fadeCb;fadeCb=null;if(cb)cb();fadeDir=-1;}else if(fadeDir<0&&fade<=0){fade=0;fadeDir=0;}}
  // doors and gates animation and state
  doors.forEach(function(o){var t=o.d.openIf()?1:0;if(t!==o.tgt){o.tgt=t;if(t&&Z.Audio)Z.Audio.door();}o.open+= (o.tgt-o.open)*Math.min(1,dt*(Z.reduced()?60:4));});
  var gchanged=false;
  gates.forEach(function(o){var t=o.g.openIf()?1:0;if(t!==o.tgt){o.tgt=t;gchanged=true;if(Z.Audio)Z.Audio.door();}o.open+=(o.tgt-o.open)*Math.min(1,dt*(Z.reduced()?60:4));});
  if(gchanged)buildSolids();
  if(blocked>0||fadeDir>0){player.moving=false;decel(dt);updateCam(false);return;}
  var v=inputVec(),speed=SPEED*Z.Investigators.speed(),tvx=v.x*speed,tvy=v.y*speed;
  var a=(v.x||v.y)?ACC:DEC;
  player.vx=approach(player.vx,tvx,a*dt);player.vy=approach(player.vy,tvy,a*dt);
  var mx=player.vx*dt,my=player.vy*dt;
  var nx=player.x+mx;if(!hit(nx,player.y))player.x=nx;else player.vx=0;
  var ny=player.y+my;if(!hit(player.x,ny))player.y=ny;else player.vy=0;
  // unstick if somehow inside a solid
  if(hit(player.x,player.y)){for(var r=2;r<40;r+=2){var done=false;[[r,0],[-r,0],[0,r],[0,-r]].some(function(d){if(!hit(player.x+d[0],player.y+d[1])){player.x+=d[0];player.y+=d[1];done=true;return true;}return false;});if(done)break;}}
  var sp=Math.sqrt(player.vx*player.vx+player.vy*player.vy);
  player.moving=sp>20;
  if(player.moving){
    player.phase+=sp*dt*0.058;
    if(Math.abs(player.vx)>=Math.abs(player.vy)*0.9&&Math.abs(player.vx)>15)player.dir=player.vx>0?'right':'left';
    else if(Math.abs(player.vy)>15)player.dir=player.vy>0?'down':'up';
    stepSnd+=sp*dt;if(stepSnd>62){stepSnd=0;if(Z.Audio)Z.Audio.step();}
  }else{stepSnd=40;}
  if(auto&&auto.path.length&&!(keys.l||keys.r||keys.u||keys.d)){auto.stuck=sp<8?auto.stuck+dt:0;if(auto.stuck>1.2){var d2=auto.done;auto=null;if(d2)d2(false);}}
  updateCam(false);
  Z.Investigators.update(dt);
  // interaction
  var best=null,bd=1e9;
  for(var i=0;i<objs.length;i++){var o=objs[i];if(o.visibleIf&&!o.visibleIf())continue;if(o.kind==='pickup'&&Z.state.items[o.item])continue;
    var dx=o.x-player.x,dy=o.y-player.y,d=Math.sqrt(dx*dx+dy*dy);if(d<(o.r||72)&&d<bd){bd=d;best=o;}}
  // doors
  for(var j=0;j<doors.length;j++){var dd=doors[j].d,cx=dd.x*T+64,dx2=cx-player.x,dy2=200-player.y,dist2=Math.sqrt(dx2*dx2+dy2*dy2);if(dist2<100&&dist2<bd){bd=dist2;best=doorObj(dd);}}
  if(best!==nearest){nearest=best;E.onPrompt(best);}
}
var doorObjs={};
function doorObj(d){if(!doorObjs[zone.id+d.id])doorObjs[zone.id+d.id]={id:'door_'+d.id,kind:'door',door:d,x:d.x*T+64,y:204,r:100};return doorObjs[zone.id+d.id];}
E.doorObj=doorObj;
function decel(dt){player.vx=approach(player.vx,0,DEC*dt);player.vy=approach(player.vy,0,DEC*dt);}
function approach(v,t,a){if(v<t)return Math.min(t,v+a);if(v>t)return Math.max(t,v-a);return v;}
E.fadeTo=function(cb){if(Z.reduced()){cb();return;}fadeDir=1;fadeCb=cb;};
E.setPlayer=function(x,y,dir){player.x=x;player.y=y;player.vx=player.vy=0;if(dir)player.dir=dir;auto=null;updateCam(true);};

/* ---------- render ---------- */
function frame(ts){
  requestAnimationFrame(loop);
}
function loop(ts){
  if(!running)return;
  var dt=Math.min(0.05,(ts-last)/1000||0.016);last=ts;
  if(!document.hidden&&zone){update(dt);render();}
  requestAnimationFrame(loop);
}
function render(){
  var g=ctx;g.setTransform(scale,0,0,scale,0,0);
  var cx=Math.round(cam.x),cy=Math.round(cam.y);
  g.fillStyle='#030507';g.fillRect(0,0,VW,VH);
  var sh=Math.min(VH,bake.height-cy);g.drawImage(bake,cx,cy,VW,sh,0,0,VW,sh);
  g.save();g.translate(-cx,-cy);
  var th=Art.THEMES[zone.theme];
  // gates and doors (dynamic)
  gates.forEach(function(o){Art.drawGate(g,o.g,o.open,time,th,!o.g.openIf());});
  doors.forEach(function(o){Art.drawDoor(g,o.d,o.open,time,th,!o.d.openIf());
    if(o.d.sign){Art.DECO.sign(g,o.d.x*T+20,22,88,36,th,function(){return 0.5;},{text:o.d.sign,fs:9});}});
  // drawables
  var list=[];
  props.forEach(function(pr){list.push({y:pr.p.y+pr.p.d,pr:pr});});
  list.push({y:player.y,pl:true});
  if(Z.Net)Z.Net.renderPlayers().forEach(function(p){list.push({y:p.y,remote:p});});
  objs.forEach(function(o){if(o.kind==='pickup'&&!Z.state.items[o.item]&&(!o.visibleIf||o.visibleIf()))list.push({y:o.y+6,it:o});});
  list.sort(function(a,b){return a.y-b.y;});
  var vx0=cx-120,vx1=cx+VW+120,vy0=cy-260,vy1=cy+VH+80;
  list.forEach(function(d){
    if(d.remote){Z.Net.drawRemote(g,d.remote);return;}
    if(d.pl){Art.drawPlayer(g,player.x,player.y,player.dir,player.phase,player.moving,time,!!Z.state.items.flashlight);return;}
    if(d.it){var o=d.it;if(o.x<vx0||o.x>vx1)return;Art.drawItem(g,o.item,o.x,o.y,time);return;}
    var p=d.pr.p,s=(d.pr.spr2&&p.alt&&p.alt())?d.pr.spr2:d.pr.spr;if(p.showIf&&!p.showIf())return;if(p.x+p.w<vx0||p.x>vx1||p.y+p.d<vy0||p.y>vy1)return;
    g.drawImage(s.c,p.x+s.ox,p.y+p.d-s.oy);
    if(s.screen)drawScreen(g,p,s);
    if(p.t==='breaker'||p.t==='valve'){/* dynamic state props redrawn below */}
    if(p.t==='tube')drawBubbles(g,p);
    if(p.t==='server')drawLeds(g,p);
  });
  g.restore();
  // lighting
  var dv=DIRV[player.dir];
  Art.drawLighting(g,VW,VH,{x:cx,y:cy},player,dv,lights,zone.ambient,time,!!Z.state.items.flashlight);
  // fog and dust
  drawFog(g);drawDust(g,cx,cy);
  // vignette
  var vg=g.createRadialGradient(VW/2,VH/2,VH*0.35,VW/2,VH/2,VH*0.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.5)');g.fillStyle=vg;g.fillRect(0,0,VW,VH);
  // interaction markers (drawn after lighting so objects stay findable in the dark)
  drawMarkers(g,cx,cy);
  Z.Investigators.drawObservation(g,cx,cy);
  if(Z.Net)Z.Net.drawLabels(g,cx,cy);
  if(fade>0){g.fillStyle='rgba(0,0,0,'+Math.min(1,fade)+')';g.fillRect(0,0,VW,VH);}
}
function drawScreen(g,p,s){
  var sc=s.screen,t=time,live=p.id&&Z.Engine.screenLive?Z.Engine.screenLive(p):true;
  g.save();
  g.fillStyle=live?'#06140d':'#05080a';g.fillRect(p.x+sc.x-4,p.y+p.d-s.oy+sc.y,sc.w,sc.h);
  if(live){g.strokeStyle='rgba(109,194,143,0.9)';g.lineWidth=1.6;g.beginPath();var yy=p.y+p.d-s.oy+sc.y+sc.h*0.55;g.moveTo(p.x+sc.x-4+2,yy);for(var k=0;k<20;k++){g.lineTo(p.x+sc.x-4+2+k*(sc.w-4)/19,yy+Math.sin(t*3+k*0.9)*sc.h*0.28*Math.sin(k*0.37+t));}g.stroke();
    g.fillStyle='rgba(109,194,143,0.65)';for(var l=0;l<3;l++)g.fillRect(p.x+sc.x,p.y+p.d-s.oy+sc.y+3+l*4,sc.w*0.35*(0.5+0.5*Math.sin(t+l)),2);
  }else{g.fillStyle='rgba(224,82,74,0.5)';g.font='bold 10px '+Art.fontMono;g.fillText('NO POWER',p.x+sc.x,p.y+p.d-s.oy+sc.y+sc.h/2+3);}
  g.restore();
}
function drawLeds(g,p){for(var i=0;i<7;i++){var on=Math.sin(time*(2+i*0.7)+p.x)>0;g.fillStyle=on?'#6dc28f':'#1f3a2b';g.fillRect(p.x+p.w-20,p.y+p.d-p.h+14+i*16,5,5);}}
function drawBubbles(g,p){
  if(Z.reduced())return;
  var gx=p.x+14,gw=p.w-28;
  for(var i=0;i<5;i++){var ph=(time*0.25+i*0.37+p.x*0.01)%1,bx=gx+((i*37+p.x)%gw),by=p.y+p.d-30-ph*(p.h-60);g.fillStyle='rgba(200,245,220,'+(0.45*(1-ph))+')';g.beginPath();g.arc(bx,by,2+((i*3)%3),0,6.28);g.fill();}
}
function drawFog(g){
  var a=Z.reduced()?0:time;
  g.save();g.globalAlpha=0.55;
  var ox=(a*9)%512,oy=(a*3)%256;
  for(var x=-512+ox;x<VW;x+=512)for(var y=-256+oy;y<VH;y+=256)g.drawImage(fog,x,y);
  g.globalAlpha=0.35;ox=(-a*5)%512;oy=(a*2)%256;
  for(var x2=-512+ox;x2<VW;x2+=512)for(var y2=-256+oy;y2<VH;y2+=256)g.drawImage(fog,x2+120,y2+60);
  g.restore();
}
function drawDust(g,cx,cy){
  g.save();g.fillStyle='rgba(210,225,220,0.35)';
  dust.forEach(function(d){
    if(!Z.reduced()){d.y-=d.v*0.016;d.x+=Math.sin(time*0.5+d.p)*0.15;if(d.y<0){d.y=VH;d.x=Math.random()*VW;}}
    g.globalAlpha=0.15+0.25*Math.abs(Math.sin(time*0.6+d.p));g.beginPath();g.arc(d.x,d.y,d.s,0,6.28);g.fill();
  });
  g.restore();
}
function drawMarkers(g,cx,cy){
  var pulse=Z.reduced()?0.5:(0.5+0.5*Math.sin(time*3));
  function mark(x,y,active){
    var sx=x-cx,sy=y-cy;if(sx<-30||sx>VW+30||sy<-30||sy>VH+30)return;
    g.save();g.translate(sx,sy-(Z.reduced()?0:Math.sin(time*2.5)*3));
    var s=active?1.15:0.85;
    g.fillStyle='rgba(5,8,10,0.85)';g.strokeStyle=active?'#ffe28a':'#d8b24e';g.lineWidth=active?3:2;
    g.beginPath();g.moveTo(0,-14*s);g.lineTo(13*s,0);g.lineTo(0,14*s);g.lineTo(-13*s,0);g.closePath();g.fill();g.stroke();
    g.fillStyle=active?'#ffe28a':'#d8b24e';g.font='bold '+(active?15:13)+'px '+Art.fontMono;g.textAlign='center';g.textBaseline='middle';g.fillText('E',0,1);
    if(active){g.strokeStyle='rgba(255,226,138,'+(0.35+0.4*pulse)+')';g.lineWidth=2;g.beginPath();g.arc(0,0,20+pulse*5,0,6.28);g.stroke();}
    g.restore();
  }
  objs.forEach(function(o){
    if(o.visibleIf&&!o.visibleIf())return;
    if(o.kind==='pickup'&&Z.state.items[o.item])return;
    if(o.hideDone&&o.hideDone())return;
    if(o.kind==='use'&&Z.state.flags[o.flag])return;
    mark(o.mx||o.x,(o.my||o.y)-(o.kind==='pickup'?34:92),nearest===o);
  });
  doors.forEach(function(o){var d=o.d;mark(d.x*T+64,148-0,nearest&&nearest.door===d);});
}
E.time=function(){return time;};
E.pointOf=function(o){return {x:o.x,y:o.y};};
E.snapshot=function(){return {x:player.x,y:player.y,dir:player.dir};};
})();
