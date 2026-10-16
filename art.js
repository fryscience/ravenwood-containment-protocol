/* RAVENWOOD: THE LAST MISSION | art.js
   All graphics are drawn procedurally with the Canvas 2D API. No image files.
   World scale: 1 tile = 64 px. Adult player = 96 px tall. Doors = 128 x 128 px. */
(function(){
'use strict';
var Z=window.Z,Art=Z.Art={};
var TILE=64;Art.TILE=TILE;Art.PLAYER_H=96;
function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hex(c){c=c.replace('#','');return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)];}
function shade(c,a){var r=hex(c);function f(v){return Math.max(0,Math.min(255,Math.round(a>=0?v+(255-v)*a:v*(1+a))));}return 'rgb('+f(r[0])+','+f(r[1])+','+f(r[2])+')';}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function lg(g,x0,y0,x1,y1,stops){var gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach(function(s){gr.addColorStop(s[0],s[1]);});return gr;}
function mk(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
Art.mk=mk;Art.shade=shade;Art.rr=rr;

Art.THEMES={
 security:{floor:['#2a353f','#252f38'],seam:'#151c22',wall:'#33434f',wallHi:'#4a5d6e',wallLo:'#202b34',trim:'#8a6a2a',glow:'#e0a33c',screen:'#6dc28f',style:'plate'},
 energy:{floor:['#222e2c','#273430'],seam:'#121a19',wall:'#2c403d',wallHi:'#436561',wallLo:'#1b2a28',trim:'#4f7f63',glow:'#6dc28f',screen:'#6dc28f',style:'tile'},
 resp:{floor:['#232f3a','#293845'],seam:'#131b23',wall:'#2e4456',wallHi:'#486a82',wallLo:'#1d2d3a',trim:'#6fa0b3',glow:'#8cc3d4',screen:'#8cc3d4',style:'tile'},
 neuro:{floor:['#26283a','#2b2e42'],seam:'#14151f',wall:'#353a52',wallHi:'#50587a',wallLo:'#222638',trim:'#7d92c8',glow:'#8fa7d6',screen:'#7fd0c0',style:'grate'},
 under:{floor:['#2b2724','#26221f'],seam:'#171412',wall:'#3a332d',wallHi:'#564b41',wallLo:'#25201c',trim:'#a46d2c',glow:'#d58a3a',screen:'#6dc28f',style:'concrete'},
 command:{floor:['#1d2228','#20262d'],seam:'#0f1317',wall:'#232b33',wallHi:'#3a4753',wallLo:'#161b21',trim:'#b8953e',glow:'#d8b24e',screen:'#6dc28f',style:'inlay'}
};
Art.fontMono='Consolas, Menlo, "Courier New", monospace';

/* ================= floors, walls (baked once per zone) ================= */
function floorTile(g,x,y,th,style,r,i,j){
  var base=th.floor[(i+j)%2];
  g.fillStyle=base;g.fillRect(x,y,TILE,TILE);
  if(style==='plate'){
    g.strokeStyle='rgba(255,255,255,0.045)';g.lineWidth=2;
    for(var k=0;k<5;k++){var ox=x+8+(k%2)*28+(r()*4|0),oy=y+8+(k>>1)*18+(r()*4|0);g.beginPath();g.moveTo(ox,oy);g.lineTo(ox+12,oy+8);g.stroke();g.beginPath();g.moveTo(ox+24,oy+8);g.lineTo(ox+14,oy+16);g.stroke();}
  }else if(style==='tile'){
    g.fillStyle='rgba(255,255,255,0.035)';g.fillRect(x+2,y+2,TILE/2-3,TILE/2-3);g.fillRect(x+TILE/2+1,y+TILE/2+1,TILE/2-3,TILE/2-3);
  }else if(style==='grate'){
    g.fillStyle='rgba(0,0,0,0.28)';for(var a=0;a<4;a++){g.fillRect(x+6,y+6+a*14,TILE-12,6);}
    g.fillStyle='rgba(255,255,255,0.03)';g.fillRect(x+6,y+6,TILE-12,2);
  }else if(style==='concrete'){
    for(var n=0;n<14;n++){g.fillStyle='rgba('+(r()<0.5?'255,255,255':'0,0,0')+','+(0.03+r()*0.04)+')';g.fillRect(x+r()*60,y+r()*60,2+r()*6,2+r()*5);}
  }else if(style==='inlay'){
    g.fillStyle='rgba(255,255,255,0.02)';g.fillRect(x,y,TILE,TILE);
    g.strokeStyle='rgba(184,149,62,0.12)';g.lineWidth=1;g.strokeRect(x+10.5,y+10.5,TILE-21,TILE-21);
  }
  g.strokeStyle=th.seam;g.lineWidth=1;g.strokeRect(x+0.5,y+0.5,TILE-1,TILE-1);
  g.fillStyle='rgba(255,255,255,0.03)';g.fillRect(x+1,y+1,TILE-2,1);
}
function hazard(g,x,y,w,h){
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  g.fillStyle='#1a1a1a';g.fillRect(x,y,w,h);g.fillStyle='#a78626';
  for(var i=-h;i<w+h;i+=16){g.beginPath();g.moveTo(x+i,y+h);g.lineTo(x+i+8,y+h);g.lineTo(x+i+8+h,y);g.lineTo(x+i+h,y);g.closePath();g.fill();}
  g.restore();
}
Art.hazard=hazard;
function wallFace(g,x,y,w,h,th,r){
  // back wall face region (y = top of face, h = face height)
  g.fillStyle=lg(g,0,y,0,y+h,[[0,shade(th.wall,-0.25)],[0.6,th.wall],[1,shade(th.wall,-0.1)]]);g.fillRect(x,y,w,h);
  // vertical panel seams every 64
  g.fillStyle='rgba(0,0,0,0.28)';for(var px=x;px<x+w;px+=TILE){g.fillRect(px,y,2,h);}
  g.fillStyle='rgba(255,255,255,0.05)';for(var px2=x;px2<x+w;px2+=TILE){g.fillRect(px2+2,y,1,h);}
  // wainscot lower panel
  var wy=y+h-56;
  g.fillStyle=th.wallLo;g.fillRect(x,wy,w,56);
  g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x,wy,w,2);
  g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,wy+2,w,2);
  g.fillStyle=th.trim;g.fillRect(x,wy-4,w,3);
  // rivets
  g.fillStyle='rgba(255,255,255,0.12)';for(var rx=x+8;rx<x+w;rx+=32){g.fillRect(rx,wy+10,3,3);g.fillRect(rx,wy+38,3,3);}
  // base shadow
  g.fillStyle=lg(g,0,y+h-14,0,y+h,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.55)']]);g.fillRect(x,y+h-14,w,14);
  // grime
  for(var i=0;i<26;i++){g.fillStyle='rgba(0,0,0,'+(0.04+r()*0.07)+')';g.fillRect(x+r()*w,y+r()*h,1+r()*3,6+r()*28);}
}
/* wall decorations: all drawn onto the back wall face */
var DECO={
 window:function(g,x,y,w,h,th,r,o){
  g.fillStyle='#0a0e11';rr(g,x,y,w,h,4);g.fill();
  g.fillStyle=lg(g,0,y,0,y+h,[[0,'#10202a'],[1,'#07090c']]);g.fillRect(x+5,y+5,w-10,h-10);
  // silhouettes behind glass
  g.fillStyle='rgba(0,0,0,0.55)';for(var i=0;i<4;i++){g.fillRect(x+14+i*(w/4.2),y+h-38-(r()*22),18+r()*20,38+r()*22);}
  g.fillStyle=th.glow;g.globalAlpha=0.16;g.fillRect(x+5,y+h*0.55,w-10,3);g.globalAlpha=1;
  g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=2;g.beginPath();g.moveTo(x+w*0.18,y+h-6);g.lineTo(x+w*0.46,y+6);g.stroke();
  g.strokeStyle=th.trim;g.lineWidth=3;rr(g,x,y,w,h,4);g.stroke();
  g.fillStyle='#000';g.fillRect(x+w/2-1,y,2,h);
 },
 monitors:function(g,x,y,w,h,th,r,o){
  var n=o.n||3,mw=(w-(n-1)*8)/n;
  for(var i=0;i<n;i++){var mx=x+i*(mw+8);
   g.fillStyle='#0b0f12';rr(g,mx,y,mw,h,4);g.fill();
   g.fillStyle='#06100c';g.fillRect(mx+4,y+4,mw-8,h-12);
   g.strokeStyle='rgba(109,194,143,0.55)';g.lineWidth=1.5;g.beginPath();
   var yy=y+h*0.55;g.moveTo(mx+6,yy);for(var k=0;k<14;k++){g.lineTo(mx+6+k*(mw-12)/13,yy+(r()-0.5)*(h*0.5));}g.stroke();
   g.fillStyle='rgba(109,194,143,0.5)';for(var l=0;l<3;l++){g.fillRect(mx+8,y+8+l*5,mw*0.3*(0.4+r()*0.6),2);}
  }
 },
 vent:function(g,x,y,w,h,th){
  g.fillStyle='#0b0e11';g.fillRect(x,y,w,h);g.strokeStyle=th.trim;g.lineWidth=2;g.strokeRect(x+1,y+1,w-2,h-2);
  g.fillStyle='#1c242b';for(var i=0;i<h/8-1;i++){g.fillRect(x+4,y+6+i*8,w-8,4);}
 },
 pipes:function(g,x,y,w,h,th){
  [0,12,22].forEach(function(o,i){g.fillStyle=lg(g,0,y+o,0,y+o+9,[[0,shade(th.wallHi,0.1)],[0.5,th.wallLo],[1,'#0a0d10']]);g.fillRect(x,y+o,w,9);
   for(var px=x+20;px<x+w;px+=96){g.fillStyle='rgba(0,0,0,0.45)';g.fillRect(px,y+o-2,6,13);}});
 },
 lamp:function(g,x,y,w,h,th,r,o){
  g.fillStyle='#0b0e11';rr(g,x,y,w,14,3);g.fill();
  g.fillStyle=o.color||th.glow;g.globalAlpha=0.85;g.fillRect(x+4,y+4,w-8,6);g.globalAlpha=1;
 },
 sign:function(g,x,y,w,h,th,r,o){
  g.fillStyle='#0b0e11';rr(g,x,y,w,h,3);g.fill();
  g.strokeStyle=o.color||th.trim;g.lineWidth=2;rr(g,x+2,y+2,w-4,h-4,2);g.stroke();
  g.fillStyle=o.color||th.glow;g.font='bold '+(o.fs||13)+'px '+Art.fontMono;g.textAlign='center';g.textBaseline='middle';
  var lines=String(o.text).split('|');lines.forEach(function(t,i){g.fillText(t,x+w/2,y+h/2+(i-(lines.length-1)/2)*((o.fs||13)+3));});
  g.textAlign='left';g.textBaseline='alphabetic';
 },
 board:function(g,x,y,w,h,th,r){
  g.fillStyle='#8c9591';rr(g,x,y,w,h,3);g.fill();g.fillStyle='#cdd5d1';g.fillRect(x+4,y+4,w-8,h-8);
  g.strokeStyle='#2c4a7a';g.lineWidth=2;for(var i=0;i<5;i++){g.beginPath();g.moveTo(x+10,y+12+i*(h-24)/4);g.lineTo(x+10+(w-30)*(0.3+r()*0.7),y+12+i*(h-24)/4+(r()-0.5)*4);g.stroke();}
  g.strokeStyle='#8a2f2a';g.beginPath();g.arc(x+w-28,y+h-26,12,0,6.28);g.stroke();
 },
 chart:function(g,x,y,w,h,th,r,o){
  g.fillStyle='#0b0f12';g.fillRect(x,y,w,h);g.fillStyle='#d8d4c4';g.fillRect(x+3,y+3,w-6,h-6);
  g.strokeStyle='#33433c';g.lineWidth=2;g.fillStyle='#33433c';
  if(o.kind==='atp'){g.beginPath();g.arc(x+w/2,y+h/2,Math.min(w,h)/3,0,6.28);g.stroke();g.fillRect(x+w/2-3,y+10,6,10);g.fillRect(x+w/2-3,y+h-20,6,10);}
  else if(o.kind==='lung'){g.beginPath();g.moveTo(x+w/2,y+10);g.lineTo(x+w/2,y+h/2);g.stroke();g.beginPath();g.ellipse(x+w/2-14,y+h/2+6,12,20,0,0,6.28);g.stroke();g.beginPath();g.ellipse(x+w/2+14,y+h/2+6,12,20,0,0,6.28);g.stroke();}
  else if(o.kind==='neuron'){g.beginPath();g.arc(x+w/2-16,y+h/2,8,0,6.28);g.fill();g.beginPath();g.moveTo(x+w/2-8,y+h/2);g.lineTo(x+w/2+22,y+h/2);g.stroke();for(var k=0;k<4;k++){g.beginPath();g.moveTo(x+w/2-16,y+h/2);g.lineTo(x+w/2-30,y+h/2+(k-1.5)*10);g.stroke();}}
  else {g.beginPath();g.moveTo(x+10,y+h-12);g.lineTo(x+w*0.4,y+14);g.lineTo(x+w*0.7,y+h*0.6);g.lineTo(x+w-10,y+12);g.stroke();}
 },
 logo:function(g,x,y,w,h,th){
  g.save();g.translate(x+w/2,y+h/2);g.strokeStyle=th.trim;g.fillStyle=th.trim;g.lineWidth=3;
  g.beginPath();g.arc(0,0,Math.min(w,h)/2-3,0,6.28);g.stroke();
  g.beginPath();g.moveTo(-14,8);g.lineTo(-4,-12);g.lineTo(4,-14);g.lineTo(18,-6);g.lineTo(6,-4);g.lineTo(12,12);g.lineTo(0,4);g.closePath();g.globalAlpha=0.85;g.fill();
  g.restore();
 },
 cabwall:function(g,x,y,w,h,th,r){
  g.fillStyle='#10161a';g.fillRect(x,y,w,h);var n=Math.max(1,Math.round(w/48));
  for(var i=0;i<n;i++){g.fillStyle=shade(th.wall,-0.05);g.fillRect(x+3+i*(w/n),y+3,w/n-6,h-6);g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x+3+i*(w/n),y+3,w/n-6,2);g.fillStyle=th.trim;g.fillRect(x+w/n*(i+1)-12,y+h/2-6,3,12);}
 },
 hazard:function(g,x,y,w,h){hazard(g,x,y,w,h);},
 cracks:function(g,x,y,w,h){g.strokeStyle='rgba(0,0,0,0.6)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+w*0.3,y+h*0.3);g.lineTo(x+w*0.2,y+h*0.6);g.lineTo(x+w*0.6,y+h);g.stroke();},
 tubeglass:function(g,x,y,w,h,th,r){
  // large wall-mounted glass tank: scenery
  g.fillStyle='#0a0e11';g.fillRect(x,y,w,h);g.fillStyle=lg(g,0,y,0,y+h,[[0,'#10261c'],[1,'#07130e']]);g.fillRect(x+4,y+4,w-8,h-8);
  g.fillStyle='rgba(109,194,143,0.22)';for(var i=0;i<12;i++){g.beginPath();g.arc(x+8+r()*(w-16),y+h-10-r()*(h-20),1.5+r()*3,0,6.28);g.fill();}
 }
};
Art.DECO=DECO;

Art.bakeZone=function(zone){
  var th=Art.THEMES[zone.theme],W=zone.w*TILE,H=zone.h*TILE,c=mk(W,H),g=c.getContext('2d'),r=rng(zone.id*7919+13);
  var wallRows=3,southRow=zone.h-1;
  g.fillStyle='#05080a';g.fillRect(0,0,W,H);
  // rooms: floor styles
  zone.rooms.forEach(function(rm,ri){
    var st=rm.floorStyle||th.style;
    for(var ty=wallRows;ty<southRow;ty++)for(var tx=rm.x0;tx<=rm.x1;tx++)floorTile(g,tx*TILE,ty*TILE,th,st,r,tx,ty);
    // floor markings
    if(rm.stripe){g.fillStyle=rm.stripe;g.globalAlpha=0.35;g.fillRect(rm.x0*TILE,(wallRows+4)*TILE-3,(rm.x1-rm.x0+1)*TILE,6);g.globalAlpha=1;}
  });
  // partition columns and gate floor
  var cols=[0].concat(zone.parts||[]).concat([zone.w-1]);
  cols.forEach(function(cx){
    for(var ty=wallRows;ty<southRow;ty++){
      var inGate=zone.gates&&zone.gates.some(function(gt){return gt.x===cx&&ty>=gt.y0&&ty<gt.y0+gt.n;});
      if(inGate){floorTile(g,cx*TILE,ty*TILE,th,'plate',r,cx,ty);}
      else{
        var x=cx*TILE,y=ty*TILE;
        g.fillStyle=lg(g,x,0,x+TILE,0,[[0,th.wallLo],[0.15,th.wall],[0.85,th.wall],[1,th.wallLo]]);g.fillRect(x,y,TILE,TILE);
        g.fillStyle='rgba(255,255,255,0.10)';g.fillRect(x+3,y,2,TILE);g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(x+TILE-5,y,2,TILE);
        g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(x,y+TILE-2,TILE,2);
        g.fillStyle='rgba(255,255,255,0.1)';g.fillRect(x+TILE/2-1,y+8,3,3);g.fillRect(x+TILE/2-1,y+TILE-12,3,3);
      }
    }
    // soft shadows on both sides
    var sx=cx*TILE;
    g.fillStyle=lg(g,sx-14,0,sx,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.45)']]);g.fillRect(sx-14,wallRows*TILE,14,(southRow-wallRows)*TILE);
    g.fillStyle=lg(g,sx+TILE,0,sx+TILE+14,0,[[0,'rgba(0,0,0,0.45)'],[1,'rgba(0,0,0,0)']]);g.fillRect(sx+TILE,wallRows*TILE,14,(southRow-wallRows)*TILE);
  });
  // gate frames (static part)
  (zone.gates||[]).forEach(function(gt){
    var x=gt.x*TILE,y=gt.y0*TILE,h=gt.n*TILE;
    hazard(g,x+6,y-10,TILE-12,10);hazard(g,x+6,y+h,TILE-12,10);
    g.fillStyle=th.wallLo;g.fillRect(x,y-14,TILE,5);g.fillRect(x,y+h+10,TILE,5);
  });
  // south wall (top-down cap) with plates and hazard strip
  var sy=southRow*TILE;
  g.fillStyle=lg(g,0,sy,0,sy+TILE,[[0,th.wallLo],[1,'#0a0d10']]);g.fillRect(0,sy,W,TILE);
  g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(0,sy,W,3);
  hazard(g,0,sy+4,W,8);
  g.fillStyle=lg(g,0,sy-18,0,sy,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.45)']]);g.fillRect(0,sy-18,W,18);
  // back wall band: cap and face
  g.fillStyle=lg(g,0,0,0,34,[[0,'#0b0f12'],[1,shade(th.wallLo,-0.15)]]);g.fillRect(0,0,W,34);
  g.fillStyle='rgba(255,255,255,0.10)';g.fillRect(0,32,W,2);
  wallFace(g,0,34,W,wallRows*TILE-34,th,r);
  // per-room decorations
  zone.rooms.forEach(function(rm){
    (rm.deco||[]).forEach(function(d){
      var f=DECO[d.t];if(!f)return;
      f(g,d.x*TILE,d.y,d.w||64,d.h||40,th,rng((d.x*31+(d.y|0))|0),d);
    });
  });
  // floor decals (debris, stains, glass, cables)
  (zone.decals||[]).forEach(function(d){drawDecal(g,d,th,rng((d.x*13+d.y)|0));});
  // wall shading at floor line and overall room vignette
  g.fillStyle=lg(g,0,wallRows*TILE,0,wallRows*TILE+36,[[0,'rgba(0,0,0,0.5)'],[1,'rgba(0,0,0,0)']]);g.fillRect(0,wallRows*TILE,W,36);
  // outer wall lettering for return doors etc is handled dynamically
  return c;
};
function drawDecal(g,d,th,r){
  g.save();
  if(d.t==='stain'){var gr=g.createRadialGradient(d.x,d.y,2,d.x,d.y,d.r||40);gr.addColorStop(0,d.color||'rgba(0,0,0,0.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(d.x-(d.r||40),d.y-(d.r||40),(d.r||40)*2,(d.r||40)*2);}
  else if(d.t==='glass'){for(var i=0;i<(d.n||14);i++){var gx=d.x+(r()-0.5)*(d.w||90),gy=d.y+(r()-0.5)*(d.h||50);g.fillStyle='rgba(200,230,240,'+(0.25+r()*0.35)+')';g.beginPath();g.moveTo(gx,gy);g.lineTo(gx+3+r()*6,gy+r()*3);g.lineTo(gx+r()*4,gy+3+r()*5);g.closePath();g.fill();}}
  else if(d.t==='cable'){g.strokeStyle='#0a0c0e';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(d.x,d.y);g.bezierCurveTo(d.x+d.w*0.3,d.y+d.h,d.x+d.w*0.7,d.y-d.h,d.x+d.w,d.y);g.stroke();g.strokeStyle='rgba(255,255,255,0.08)';g.lineWidth=1.5;g.beginPath();g.moveTo(d.x,d.y-2);g.bezierCurveTo(d.x+d.w*0.3,d.y+d.h-2,d.x+d.w*0.7,d.y-d.h-2,d.x+d.w,d.y-2);g.stroke();}
  else if(d.t==='hazard'){hazard(g,d.x,d.y,d.w,d.h);}
  else if(d.t==='line'){g.fillStyle=d.color||'rgba(216,178,78,0.35)';g.fillRect(d.x,d.y,d.w,d.h);}
  else if(d.t==='text'){g.fillStyle=d.color||'rgba(255,255,255,0.25)';g.font='bold '+(d.fs||16)+'px '+Art.fontMono;g.textAlign='center';g.fillText(d.text,d.x,d.y);}
  else if(d.t==='puddle'){g.fillStyle='rgba(120,170,190,0.12)';g.beginPath();g.ellipse(d.x,d.y,d.w/2,d.h/2,0,0,6.28);g.fill();g.fillStyle='rgba(255,255,255,0.08)';g.beginPath();g.ellipse(d.x-d.w*0.15,d.y-d.h*0.1,d.w*0.2,d.h*0.12,0,0,6.28);g.fill();}
  else if(d.t==='blood'){g.fillStyle='rgba(110,20,18,0.55)';for(var b=0;b<8;b++){g.beginPath();g.ellipse(d.x+(r()-0.5)*(d.w||60),d.y+(r()-0.5)*(d.h||30),3+r()*9,2+r()*5,r()*3,0,6.28);g.fill();}}
  g.restore();
}
Art.drawDecal=drawDecal;

/* ================= props (cached sprites) ================= */
/* each prop: footprint (w x d) on the floor, visual height H (front face), top face depth tf */
var PR={};
function box(g,x,bottom,w,H,tf,front,top,edge){
  g.fillStyle=front;g.fillRect(x,bottom-H,w,H);
  g.fillStyle=top;g.fillRect(x,bottom-H-tf,w,tf);
  g.fillStyle='rgba(255,255,255,0.12)';g.fillRect(x,bottom-H-tf,w,1.5);
  g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,bottom-H-0,w,2);
  g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(x,bottom-H,2,H);g.fillRect(x+w-2,bottom-H,2,H);
  g.strokeStyle=edge||'rgba(0,0,0,0.6)';g.lineWidth=1.5;g.strokeRect(x+0.5,bottom-H-tf+0.5,w-1,H+tf-1);
}
function shadowUnder(g,x,bottom,w,d){var gr=g.createRadialGradient(x+w/2,bottom-d/2,2,x+w/2,bottom-d/2,w*0.6);gr.addColorStop(0,'rgba(0,0,0,0.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-14,bottom-d-10,w+28,d+22);}
PR.bench=function(g,x,b,w,d,H,th,o){
  box(g,x,b,w,H,Math.min(34,d*0.55),shade(th.wall,-0.1),'#aeb8b5');
  var n=Math.max(2,Math.floor(w/64)),cw=w/n;
  for(var i=0;i<n;i++){g.fillStyle=shade(th.wall,-0.2);g.fillRect(x+4+i*cw,b-H+6,cw-8,H-12);g.fillStyle='rgba(255,255,255,0.1)';g.fillRect(x+4+i*cw,b-H+6,cw-8,2);g.fillStyle='#b9bfc2';g.fillRect(x+cw*(i+0.5)-8,b-H+14,16,3);}
  var ty=b-H-Math.min(34,d*0.55);
  // items on top
  var kinds=o&&o.kit||'beakers';
  if(kinds==='beakers'){
    [[0.12,'#6dc28f'],[0.26,'#d8b24e'],[0.7,'#8cc3d4']].forEach(function(p){var bx=x+w*p[0],by=ty+22;g.fillStyle='rgba(200,230,240,0.35)';g.fillRect(bx,by-24,16,24);g.fillStyle=p[1];g.globalAlpha=0.8;g.fillRect(bx+2,by-14,12,12);g.globalAlpha=1;g.strokeStyle='rgba(255,255,255,0.35)';g.strokeRect(bx+0.5,by-23.5,15,23);});
    g.fillStyle='#202a2f';g.fillRect(x+w*0.46,ty+8,20,22);g.fillStyle='#38464d';g.fillRect(x+w*0.46+4,ty-8,6,18);g.fillStyle='#10161a';g.fillRect(x+w*0.46-2,ty+26,26,5);
  }else if(kinds==='papers'){
    g.fillStyle='#cfd3cb';g.fillRect(x+w*0.15,ty+10,34,22);g.fillStyle='#bfc4bb';g.fillRect(x+w*0.15+10,ty+6,34,22);g.fillStyle='#33433c';g.fillRect(x+w*0.15+14,ty+12,22,2);g.fillRect(x+w*0.15+14,ty+17,18,2);
    g.fillStyle='#10161a';g.fillRect(x+w*0.6,ty+8,40,22);g.fillStyle='#6dc28f';g.globalAlpha=0.5;g.fillRect(x+w*0.6+3,ty+11,34,14);g.globalAlpha=1;
  }else if(kinds==='scope'){
    g.fillStyle='#161d21';g.fillRect(x+w*0.3,ty+12,34,18);g.fillStyle='#2b363c';g.fillRect(x+w*0.3+12,ty-14,10,30);g.fillStyle='#8a949a';g.fillRect(x+w*0.3+8,ty-18,18,8);
    g.fillStyle='#202a2f';g.fillRect(x+w*0.62,ty+8,26,22);g.fillStyle='#d8b24e';g.globalAlpha=0.6;g.fillRect(x+w*0.62+3,ty+11,20,10);g.globalAlpha=1;
  }
};
PR.desk=function(g,x,b,w,d,H,th){
  box(g,x,b,w,H,Math.min(32,d*0.5),'#3a3f42','#5a6165');
  g.fillStyle='#262a2d';g.fillRect(x+6,b-H+6,w*0.28,H-12);g.fillStyle='#b9bfc2';g.fillRect(x+6+w*0.14-6,b-H+14,12,3);g.fillRect(x+6+w*0.14-6,b-H+30,12,3);
  var ty=b-H-Math.min(32,d*0.5);
  g.fillStyle='#0b0f12';g.fillRect(x+w*0.5,ty-26,44,30);g.fillStyle='#0a1812';g.fillRect(x+w*0.5+3,ty-23,38,22);g.fillStyle='rgba(109,194,143,0.45)';g.fillRect(x+w*0.5+6,ty-19,24,2);g.fillRect(x+w*0.5+6,ty-14,30,2);g.fillRect(x+w*0.5+6,ty-9,18,2);
  g.fillStyle='#0b0f12';g.fillRect(x+w*0.5+18,ty+2,8,5);
  g.fillStyle='#cfd3cb';g.fillRect(x+10,ty+8,30,16);g.fillStyle='#33433c';g.fillRect(x+14,ty+13,20,2);
  g.strokeStyle='#d8b24e';g.lineWidth=3;g.beginPath();g.moveTo(x+w-30,ty+16);g.lineTo(x+w-22,ty-10);g.lineTo(x+w-8,ty-12);g.stroke();
};
PR.chair=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#14181b';g.fillRect(x+w/2-3,b-18,6,18);g.fillRect(x+4,b-6,w-8,5);
  g.fillStyle='#1d2327';rr(g,x+4,b-H+14,w-8,16,4);g.fill();
  g.fillStyle='#252d32';rr(g,x+6,b-H-2,w-12,26,5);g.fill();g.strokeStyle='rgba(255,255,255,0.1)';g.stroke();
};
PR.cabinet=function(g,x,b,w,d,H,th,o){
  box(g,x,b,w,H,10,shade(th.wall,-0.2),shade(th.wall,0.05));
  var shelves=4,sh=(H-18)/shelves;
  g.fillStyle='#0a0f12';g.fillRect(x+6,b-H+8,w-12,H-16);
  for(var s=0;s<shelves;s++){var sy=b-H+8+s*sh;g.fillStyle='#2a343a';g.fillRect(x+6,sy+sh-4,w-12,4);
    var r=rng(s*17+w);for(var k=0;k<4;k++){var col=['#6dc28f','#8cc3d4','#d8b24e','#a9b6af'][(r()*4)|0];g.fillStyle=col;g.globalAlpha=0.7;g.fillRect(x+10+k*(w-20)/4,sy+sh-4-14-r()*8,10,14+r()*6);g.globalAlpha=1;}}
  g.fillStyle='rgba(180,220,235,0.09)';g.fillRect(x+6,b-H+8,(w-12)/2,H-16);
  g.fillStyle=th.trim;g.fillRect(x+w/2-1,b-H+8,2,H-16);
  if(o&&o.lock){g.fillStyle='#0b0f12';g.fillRect(x+w/2-12,b-H*0.45,24,14);g.fillStyle='#e0524a';g.fillRect(x+w/2-6,b-H*0.45+4,12,6);}
};
PR.locker=function(g,x,b,w,d,H,th,o){
  box(g,x,b,w,H,8,shade(th.wall,-0.05),shade(th.wall,0.1));
  var n=Math.max(1,Math.round(w/32)),cw=w/n;
  for(var i=0;i<n;i++){var lx=x+i*cw;g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(lx+cw-2,b-H,2,H);g.fillStyle='#0b0f12';for(var v=0;v<5;v++)g.fillRect(lx+6,b-H+10+v*5,cw-12,2);
    g.fillStyle='#b9bfc2';g.fillRect(lx+cw/2-2,b-H*0.45,4,14);}
  if(o&&o.dent){g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(x+w*0.7,b-H*0.5,10,18,0.3,0,6.28);g.fill();}
};
PR.console=function(g,x,b,w,d,H,th,o){
  shadowUnder(g,x,b,w,d);
  box(g,x,b,w,H-30,Math.min(26,d*0.45),'#242d33','#39464e');
  var ty=b-(H-30)-Math.min(26,d*0.45);
  // angled screen housing
  g.fillStyle='#0b0f12';rr(g,x+8,ty-44,w-16,48,5);g.fill();
  g.fillStyle='#050a08';g.fillRect(x+13,ty-39,w-26,36);
  g.fillStyle='#1a2227';g.fillRect(x+10,b-(H-30)+4,w-20,6);
  for(var i=0;i<6;i++){g.fillStyle=i%2?'#6dc28f':'#d8b24e';g.globalAlpha=0.7;g.fillRect(x+12+i*14,b-(H-30)+18,8,4);g.globalAlpha=1;}
  o=o||{};o._screen={x:x+13,y:ty-39,w:w-26,h:36};
};
PR.server=function(g,x,b,w,d,H,th){
  box(g,x,b,w,H,8,'#1b2227','#2c373e');
  for(var i=0;i<7;i++){var yy=b-H+10+i*16;g.fillStyle='#0b0f12';g.fillRect(x+6,yy,w-12,12);g.fillStyle='#2c373e';g.fillRect(x+8,yy+2,w-34,8);}
  g.fillStyle='rgba(255,255,255,0.06)';g.fillRect(x,b-H,w,2);
};
PR.tube=function(g,x,b,w,d,H,th,o){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#161d21';g.fillRect(x+2,b-22,w-4,22);g.fillStyle='#2c373e';g.fillRect(x+2,b-22,w-4,4);
  g.fillStyle='#10161a';g.fillRect(x+6,b-H,w-12,18);g.fillStyle='#2c373e';g.fillRect(x+6,b-H,w-12,4);
  var gx=x+10,gw=w-20;
  g.fillStyle=lg(g,gx,0,gx+gw,0,[[0,'rgba(109,194,143,0.12)'],[0.3,'rgba(109,194,143,0.34)'],[1,'rgba(109,194,143,0.12)']]);g.fillRect(gx,b-H+18,gw,H-40);
  g.strokeStyle='rgba(220,240,235,0.35)';g.lineWidth=2;g.strokeRect(gx+0.5,b-H+18.5,gw-1,H-41);
  g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(gx+5,b-H+24,3,H-52);
  if(o&&o.broken){g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(gx+4,b-H*0.62);g.lineTo(gx+gw*0.5,b-H*0.5);g.lineTo(gx+gw-3,b-H*0.58);g.moveTo(gx+gw*0.5,b-H*0.5);g.lineTo(gx+gw*0.4,b-H*0.3);g.stroke();
    g.fillStyle='rgba(0,0,0,0.55)';g.fillRect(gx+2,b-H*0.45,gw-4,H*0.4);}
  g.strokeStyle='#0a0d10';g.lineWidth=3;g.beginPath();g.moveTo(x+w/2,b-H);g.lineTo(x+w/2,b-H-6);g.stroke();
};
PR.crate=function(g,x,b,w,d,H,th){
  box(g,x,b,w,H,Math.min(24,d*0.4),'#4a4234','#6a5d47');
  g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=2;g.strokeRect(x+6,b-H+6,w-12,H-12);g.beginPath();g.moveTo(x+6,b-H+6);g.lineTo(x+w-6,b-6);g.moveTo(x+w-6,b-H+6);g.lineTo(x+6,b-6);g.stroke();
  g.fillStyle='#d8b24e';g.globalAlpha=0.7;g.fillRect(x+w/2-10,b-H+12,20,8);g.globalAlpha=1;
};
PR.barrel=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  g.fillStyle=lg(g,x,0,x+w,0,[[0,'#2a2e30'],[0.4,'#4a5256'],[1,'#1c2022']]);rr(g,x+2,b-H,w-4,H,6);g.fill();
  g.fillStyle='#d8b24e';g.globalAlpha=0.8;g.fillRect(x+2,b-H*0.6,w-4,8);g.globalAlpha=1;
  g.fillStyle='rgba(0,0,0,0.4)';g.fillRect(x+2,b-H*0.3,w-4,3);
  g.fillStyle='#14181a';g.beginPath();g.ellipse(x+w/2,b-H,w/2-2,6,0,0,6.28);g.fill();
};
PR.gurney=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#262c30';g.fillRect(x+8,b-18,6,18);g.fillRect(x+w-14,b-18,6,18);
  g.fillStyle='#8a949a';g.fillRect(x+4,b-H,w-8,10);
  g.fillStyle=lg(g,0,b-H-14,0,b-H,[[0,'#b6bdb7'],[1,'#8e968f']]);rr(g,x+8,b-H-14,w-16,18,5);g.fill();
  g.fillStyle='#6a7570';g.fillRect(x+w*0.55,b-H-10,6,10);g.fillRect(x+w*0.7,b-H-10,6,10);
  g.fillStyle='rgba(110,20,18,0.5)';g.beginPath();g.ellipse(x+w*0.4,b-H-6,12,5,0,0,6.28);g.fill();
};
PR.pump=function(g,x,b,w,d,H,th,o){
  shadowUnder(g,x,b,w,d);
  box(g,x,b,w,H-30,16,'#2a3238','#46535b');
  var ty=b-(H-30)-16;
  g.fillStyle='rgba(200,225,235,0.3)';rr(g,x+10,ty-34,24,40,6);g.fill();g.fillStyle='rgba(110,20,18,0.65)';g.fillRect(x+12,ty-14,20,18);g.strokeStyle='rgba(255,255,255,0.4)';g.stroke();
  g.fillStyle='#0b0f12';g.fillRect(x+w-36,ty-34,26,22);g.fillStyle='#6dc28f';g.globalAlpha=0.6;g.fillRect(x+w-33,ty-31,20,8);g.globalAlpha=1;
  g.strokeStyle='#c9d2d6';g.globalAlpha=0.5;g.lineWidth=5;g.beginPath();g.moveTo(x+34,ty-8);g.bezierCurveTo(x+50,ty-40,x+w-50,ty+20,x+w-36,ty-4);g.stroke();g.globalAlpha=1;
};
PR.anatomy=function(g,x,b,w,d,H,th,o){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#161d21';g.fillRect(x+4,b-34,w-8,34);g.fillStyle=th.trim;g.fillRect(x+4,b-34,w-8,3);
  g.fillStyle='rgba(180,220,235,0.18)';rr(g,x+4,b-H,w-8,H-34,6);g.fill();g.strokeStyle='rgba(220,240,235,0.4)';g.stroke();
  var k=o&&o.kind||'brain';g.fillStyle=k==='lung'?'#9a6a6a':(k==='brain'?'#b58a95':'#8a3a3a');
  if(k==='lung'){g.beginPath();g.ellipse(x+w/2-10,b-H*0.5,9,22,0.1,0,6.28);g.fill();g.beginPath();g.ellipse(x+w/2+10,b-H*0.5,9,22,-0.1,0,6.28);g.fill();}
  else if(k==='brain'){g.beginPath();g.ellipse(x+w/2,b-H*0.55,20,14,0,0,6.28);g.fill();g.strokeStyle='rgba(0,0,0,0.3)';g.beginPath();g.moveTo(x+w/2-12,b-H*0.55);g.quadraticCurveTo(x+w/2,b-H*0.55-10,x+w/2+12,b-H*0.55);g.stroke();}
  else {g.beginPath();g.ellipse(x+w/2,b-H*0.55,14,17,0,0,6.28);g.fill();}
};
PR.scan=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#1b2227';g.fillRect(x+w/2-4,b-60,8,60);g.fillRect(x+6,b-8,w-12,8);
  g.fillStyle='#0b0f12';rr(g,x+2,b-H,w-4,H-56,5);g.fill();g.fillStyle='#07100d';g.fillRect(x+7,b-H+5,w-14,H-66);
  g.strokeStyle='rgba(143,167,214,0.7)';g.lineWidth=1.5;g.beginPath();g.ellipse(x+w/2,b-H+(H-56)/2,w*0.28,(H-70)*0.38,0,0,6.28);g.stroke();
};
PR.table=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  box(g,x,b,w,H,Math.min(44,d*0.5),'#1c2228','#2c3640');
  var ty=b-H-Math.min(44,d*0.5);
  g.strokeStyle=th.trim;g.lineWidth=2;g.strokeRect(x+10,ty+8,w-20,Math.min(44,d*0.5)-14);
  g.fillStyle='rgba(216,178,78,0.12)';g.fillRect(x+10,ty+8,w-20,Math.min(44,d*0.5)-14);
  g.fillStyle='#0b0f12';g.fillRect(x+w/2-40,b-H+8,80,H-16);
  g.fillStyle=th.trim;g.fillRect(x+w/2-40,b-H+8,80,3);
};
PR.breaker=function(g,x,b,w,d,H,th,o){
  box(g,x,b,w,H,6,'#2b333a','#3b464f');
  g.fillStyle='#0b0f12';g.fillRect(x+8,b-H+10,w-16,H-52);
  for(var i=0;i<6;i++){g.fillStyle=i===2?'#a33d37':'#d8b24e';g.globalAlpha=o&&o.on?0.95:0.35;g.fillRect(x+12+(i%3)*14,b-H+16+(i>>1)*16,8,10);g.globalAlpha=1;}
  g.fillStyle='#d8b24e';g.fillRect(x+w/2-14,b-34,28,16);g.fillStyle='#0b0f12';g.font='bold 9px '+Art.fontMono;g.textAlign='center';g.fillText('POWER',x+w/2,b-23);g.textAlign='left';
  hazard(g,x+4,b-14,w-8,8);
};
PR.valve=function(g,x,b,w,d,H,th,o){
  shadowUnder(g,x,b,w,d);
  g.fillStyle=lg(g,x,0,x+w,0,[[0,'#2c3338'],[0.5,'#59656c'],[1,'#242a2e']]);g.fillRect(x+w/2-9,b-H,18,H);
  g.fillStyle='#161b1f';g.fillRect(x+4,b-14,w-8,14);g.fillRect(x+4,b-H,w-8,12);
  g.strokeStyle=o&&o.fitted?'#d8b24e':'#4a535a';g.lineWidth=4;g.beginPath();g.ellipse(x+w/2,b-H*0.55,20,20,0,0,6.28);g.stroke();
  if(o&&o.fitted){g.beginPath();g.moveTo(x+w/2-20,b-H*0.55);g.lineTo(x+w/2+20,b-H*0.55);g.moveTo(x+w/2,b-H*0.55-20);g.lineTo(x+w/2,b-H*0.55+20);g.stroke();}
  else{g.fillStyle='#0b0f12';g.fillRect(x+w/2-5,b-H*0.55-5,10,10);g.fillStyle='#a33d37';g.fillRect(x+w/2-3,b-H*0.55-3,6,6);}
};
PR.generator=function(g,x,b,w,d,H,th){
  box(g,x,b,w,H,20,'#2b3337','#414e55');
  g.fillStyle='#0b0f12';for(var i=0;i<6;i++)g.fillRect(x+10,b-H+10+i*10,w*0.5,4);
  g.fillStyle='#d8b24e';g.fillRect(x+w-40,b-H+12,26,26);g.fillStyle='#0b0f12';g.fillRect(x+w-36,b-H+16,18,18);
  hazard(g,x+4,b-12,w-8,8);
};
PR.cart=function(g,x,b,w,d,H,th){
  shadowUnder(g,x,b,w,d);
  g.fillStyle='#14181b';g.beginPath();g.arc(x+8,b-5,5,0,6.28);g.arc(x+w-8,b-5,5,0,6.28);g.fill();
  g.fillStyle='#7f8a90';g.fillRect(x+2,b-H,w-4,6);g.fillRect(x+2,b-H*0.5,w-4,5);g.fillStyle='#59656c';g.fillRect(x+4,b-H,3,H-8);g.fillRect(x+w-7,b-H,3,H-8);
  g.fillStyle='#d8b24e';g.globalAlpha=0.7;g.fillRect(x+10,b-H-12,18,12);g.globalAlpha=1;
};
PR.bench2=PR.bench;
PR.shelf=function(g,x,b,w,d,H,th){
  box(g,x,b,w,H,8,'#353b3e','#4b5357');
  for(var s=0;s<4;s++){var sy=b-H+10+s*((H-18)/4);g.fillStyle='#14181b';g.fillRect(x+4,sy,w-8,(H-18)/4-4);
    var r=rng(s*11+w);for(var k=0;k<5;k++){g.fillStyle=['#6a5d47','#4a5256','#3a4a40','#5a4a3a'][(r()*4)|0];g.fillRect(x+8+k*(w-16)/5,sy+(H-18)/4-4-12-r()*6,(w-16)/5-4,12+r()*6);}}
};
PR.rig=function(g,x,b,w,d,H,th,o){
  // Support rig ZR-7: pump, oxygenator and bags (hidden experiment scenery)
  box(g,x,b,w,H-50,18,'#262d32','#3b474f');
  var ty=b-(H-50)-18;
  g.fillStyle='rgba(200,225,235,0.26)';rr(g,x+10,ty-46,26,52,6);g.fill();g.fillStyle='rgba(110,20,18,0.6)';g.fillRect(x+12,ty-22,22,26);
  g.fillStyle='rgba(200,225,235,0.26)';rr(g,x+44,ty-40,22,46,6);g.fill();g.fillStyle='rgba(150,190,210,0.45)';g.fillRect(x+46,ty-26,18,30);
  g.fillStyle='#0b0f12';g.fillRect(x+w-44,ty-38,32,26);g.fillStyle='#d8b24e';g.globalAlpha=0.55;g.fillRect(x+w-41,ty-35,26,10);g.globalAlpha=1;
  g.strokeStyle='#b8c0c4';g.globalAlpha=0.55;g.lineWidth=4;g.beginPath();g.moveTo(x+36,ty-8);g.bezierCurveTo(x+40,ty-50,x+w-60,ty-50,x+w-44,ty-20);g.stroke();g.globalAlpha=1;
  g.fillStyle='#d8b24e';g.font='bold 11px '+Art.fontMono;g.fillText('ZR-7',x+8,b-(H-50)+16);
};
Art.propSprite=function(p,th){
  var key=p.t+'|'+p.w+'|'+p.d+'|'+p.h+'|'+(p.opt?JSON.stringify(p.opt):'');
  var cache=Art._pc||(Art._pc={});
  var ck=key+'|'+th.wall;
  if(cache[ck])return cache[ck];
  var padTop=60,W=p.w+8,Hc=p.h+padTop,c=mk(W,Hc),g=c.getContext('2d');
  var o=p.opt?JSON.parse(JSON.stringify(p.opt)):{};
  var f=PR[p.t];if(f)f(g,4,Hc,p.w,p.d,p.h,th,o);
  var spr={c:c,ox:-4,oy:Hc,screen:o._screen||null};
  cache[ck]=spr;return spr;
};
Art.propSpriteInvalidate=function(){Art._pc={};};

/* ================= doors (back wall, 128 x 128) and gates ================= */
Art.drawDoor=function(g,d,open,t,th,locked){
  var x=d.x*TILE,y=64,w=128,h=128;
  g.save();
  g.fillStyle='#07090b';g.fillRect(x,y,w,h);
  // corridor beyond
  g.fillStyle=lg(g,0,y,0,y+h,[[0,'#050709'],[1,'#10181d']]);g.fillRect(x+8,y+8,w-16,h-8);
  // panels slide apart by open amount (0..1), clipped to the door opening
  var pw=(w-16)/2,off=open*(pw-6);
  g.save();g.beginPath();g.rect(x+8,y+8,w-16,h-8);g.clip();
  g.fillStyle=lg(g,0,y,0,y+h,[[0,shade(th.wallHi,-0.1)],[1,shade(th.wall,-0.2)]]);
  g.fillRect(x+8-off,y+8,pw,h-8);g.fillRect(x+8+pw+off,y+8,pw,h-8);
  g.fillStyle='rgba(0,0,0,0.45)';g.fillRect(x+8+pw-3-off,y+8,3,h-8);g.fillRect(x+8+pw+off,y+8,3,h-8);
  g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x+8-off,y+8,pw,2);g.fillRect(x+8+pw+off,y+8,pw,2);
  g.restore();
  // frame
  g.fillStyle='#0b0e11';g.fillRect(x,y,8,h);g.fillRect(x+w-8,y,8,h);g.fillRect(x,y,w,10);
  hazard(g,x,y+10,w,8);
  // indicator
  var lit=locked?'#e0524a':'#6dc28f';
  g.fillStyle='#0b0e11';g.fillRect(x+w/2-18,y-14,36,14);
  g.fillStyle=lit;g.globalAlpha=locked?(0.6+0.4*Math.sin(t*3)):0.95;g.fillRect(x+w/2-12,y-10,24,6);g.globalAlpha=1;
  g.restore();
};
Art.drawGate=function(g,gt,open,t,th,locked){
  var x=gt.x*TILE,y=gt.y0*TILE,h=gt.n*TILE;
  g.save();
  // two vertical panels (seen from above) sliding up and down into the frame
  var ph=h/2,off=open*(ph-4);
  g.fillStyle=lg(g,x,0,x+TILE,0,[[0,shade(th.wallHi,-0.15)],[0.5,th.wallHi],[1,shade(th.wall,-0.25)]]);
  g.fillRect(x+10,y-off,TILE-20,ph);g.fillRect(x+10,y+ph+off,TILE-20,ph);
  g.fillStyle='rgba(0,0,0,0.5)';g.fillRect(x+10,y-off+ph-4,TILE-20,4);g.fillRect(x+10,y+ph+off,TILE-20,4);
  g.fillStyle='#0b0e11';g.fillRect(x+TILE/2-3,y-off+8,6,ph-16);g.fillRect(x+TILE/2-3,y+ph+off+8,6,ph-16);
  // reader box
  var lit=locked?'#e0524a':'#6dc28f';
  g.fillStyle='#0b0e11';g.fillRect(x+TILE-4,y+h/2-16,8,32);g.fillStyle=lit;g.globalAlpha=locked?(0.6+0.4*Math.sin(t*3)):0.95;g.fillRect(x+TILE-3,y+h/2-6,6,12);g.globalAlpha=1;
  g.restore();
};

/* ================= items on the floor ================= */
Art.drawItem=function(g,it,x,y,t){
  var bob=Math.sin(t*2.2+x)*2;
  g.save();g.translate(x,y+bob);
  // glow ring on ground
  g.fillStyle='rgba(216,178,78,0.18)';g.beginPath();g.ellipse(0,10,22,8,0,0,6.28);g.fill();
  var k=it;
  g.lineWidth=2;
  if(k==='access_card'||k==='keycard5'){g.fillStyle=k==='keycard5'?'#d8b24e':'#9fb0bf';rr(g,-14,-9,28,18,3);g.fill();g.fillStyle='#10161a';g.fillRect(-14,-4,28,5);g.strokeStyle='#0b0f12';g.stroke();if(k==='access_card'){g.strokeStyle='#0b0f12';g.beginPath();g.moveTo(2,-9);g.lineTo(-2,0);g.lineTo(4,9);g.stroke();}}
  else if(k==='power_cell'){g.fillStyle='#1d2a24';rr(g,-8,-13,16,26,3);g.fill();g.fillStyle='#6dc28f';g.fillRect(-6,-6,12,14);g.fillStyle='#8a949a';g.fillRect(-4,-17,8,5);g.strokeStyle='#0b0f12';rr(g,-8,-13,16,26,3);g.stroke();}
  else if(k==='fuse'){g.fillStyle='rgba(220,235,240,0.55)';rr(g,-16,-6,32,12,4);g.fill();g.fillStyle='#8a949a';g.fillRect(-18,-7,6,14);g.fillRect(12,-7,6,14);g.strokeStyle='#d8b24e';g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.stroke();}
  else if(k==='valve'){g.strokeStyle='#d8b24e';g.beginPath();g.arc(0,0,12,0,6.28);g.stroke();g.beginPath();g.moveTo(-12,0);g.lineTo(12,0);g.moveTo(0,-12);g.lineTo(0,12);g.stroke();}
  else if(k==='chip'){g.fillStyle='#1d2a24';g.fillRect(-10,-10,20,20);g.fillStyle='#6dc28f';g.fillRect(-5,-5,10,10);g.fillStyle='#b9bfc2';for(var i=-8;i<=8;i+=8){g.fillRect(i-1,-14,2,4);g.fillRect(i-1,10,2,4);}}
  else if(k.indexOf('rec')===0&&k!=='rec_pump'&&k!=='rec_o2'&&k!=='rec_nut'&&k!=='rec_cam'){g.fillStyle='#2a3238';rr(g,-14,-9,28,18,3);g.fill();g.fillStyle='#8fa7d6';g.beginPath();g.arc(-6,0,4,0,6.28);g.arc(6,0,4,0,6.28);g.fill();g.strokeStyle='#0b0f12';rr(g,-14,-9,28,18,3);g.stroke();}
  else {g.fillStyle='#cfd3cb';g.fillRect(-9,-12,18,24);g.fillStyle='#33433c';for(var l=0;l<4;l++)g.fillRect(-6,-8+l*5,12,2);g.strokeStyle='#0b0f12';g.strokeRect(-9,-12,18,24);}
  g.restore();
};

/* ================= player: adult investigator, 96 px tall ================= */
Art.drawPlayer=function(g,x,y,dir,phase,moving,t,flash){
  var bob=moving?Math.abs(Math.sin(phase))*2.2:Math.sin(t*1.8)*0.7;
  var sw=moving?Math.sin(phase):0, sw2=-sw;
  g.save();g.translate(Math.round(x),Math.round(y));
  // ground shadow
  g.fillStyle='rgba(0,0,0,0.45)';g.beginPath();g.ellipse(0,1,19,7,0,0,6.28);g.fill();
  var out='#0b0e11',skin='#d9a98b',hair='#2a1f1a',coat='#9aa8a6',coatD='#7b8987',pants='#2b3540',boot='#15181b',pack='#3a3f46';
  g.lineWidth=1.6;g.lineJoin='round';g.strokeStyle=out;
  var hipY=-43-bob*0.4;
  function legs(){
    if(dir==='left'||dir==='right'){
      var s=dir==='right'?1:-1;
      [[sw,pants],[sw2,shade(pants,-0.2)]].forEach(function(p){
        var lx=p[0]*9*s;g.fillStyle=p[1];rr(g,lx-5,hipY,10,41-Math.max(0,p[0])*3+Math.max(0,-p[0])*0,3);g.fill();g.stroke();
        g.fillStyle=boot;rr(g,lx-5+(s>0?1:-3),-7-Math.max(0,p[0])*3,12,8,3);g.fill();g.stroke();
      });
    }else{
      [[-8,sw],[8,sw2]].forEach(function(p){
        var lift=Math.max(0,p[1])*4;
        g.fillStyle=pants;rr(g,p[0]-5.5,hipY,11,40-lift,3);g.fill();g.stroke();
        g.fillStyle=boot;rr(g,p[0]-6.5,-8-lift,13,9,3);g.fill();g.stroke();
      });
    }
  }
  function pack_(){g.fillStyle=pack;rr(g,-14,hipY-34-bob*0.2,28,30,5);g.fill();g.stroke();g.fillStyle='#2a2e34';g.fillRect(-10,hipY-20,20,4);}
  function head(){
    var hy=-85-bob;
    g.fillStyle=skin;g.beginPath();g.arc(0,hy,11,0,6.28);g.fill();g.stroke();
    g.fillStyle=skin;g.fillRect(-4,hy+8,8,6);
    g.fillStyle=hair;
    if(dir==='up'){g.beginPath();g.arc(0,hy,11.4,0,6.28);g.fill();g.stroke();}
    else if(dir==='down'){g.beginPath();g.arc(0,hy-1,11.4,Math.PI,0);g.lineTo(11,hy-1);g.quadraticCurveTo(0,hy-6,-11,hy-1);g.fill();g.stroke();g.fillStyle='#14181b';g.fillRect(-6,hy+1,3,3);g.fillRect(3,hy+1,3,3);g.strokeStyle='rgba(0,0,0,0.5)';g.beginPath();g.moveTo(-3,hy+7);g.lineTo(3,hy+7);g.stroke();g.strokeStyle=out;}
    else{var s=dir==='right'?1:-1;g.beginPath();g.arc(-s*2,hy-1,11.4,Math.PI*(s>0?0.35:-0.0),Math.PI*(s>0?2:1.65));g.fill();g.stroke();g.fillStyle=skin;g.beginPath();g.moveTo(s*10,hy+1);g.lineTo(s*14,hy+4);g.lineTo(s*10,hy+5);g.closePath();g.fill();g.stroke();g.fillStyle='#14181b';g.fillRect(s*5-1.5,hy+0,3,3);}
  }
  function torso(){
    var ty=hipY-30-bob*0.3;
    g.fillStyle=lg(g,-16,0,16,0,[[0,coatD],[0.5,coat],[1,coatD]]);
    rr(g,-16,ty,32,36,6);g.fill();g.stroke();
    g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(-1,ty+2,2,34);
    g.fillStyle='#2b3540';g.fillRect(-9,ty+5,18,3);
    if(dir==='down'){g.fillStyle='#f2efe0';g.fillRect(6,ty+14,9,12);g.fillStyle='#2b6a8a';g.fillRect(7,ty+15,7,4);g.fillStyle=coatD;g.fillRect(-14,ty+24,8,8);g.fillRect(6,ty+27,8,8);}
    g.fillStyle='#8a949a';g.fillRect(-16,ty+33,32,3);
  }
  function arm(side,swing,front){
    var ty=hipY-27-bob*0.3,ax=side*(dir==='left'||dir==='right'?0:19);
    if(dir==='left'||dir==='right'){var s=dir==='right'?1:-1;ax=swing*7*s*(side);}
    g.fillStyle=coat;rr(g,ax-4.5,ty,9,28+swing*(-3)*side,4);g.fill();g.stroke();
    g.fillStyle=skin;g.beginPath();g.arc(ax,ty+30+swing*(-3)*side,4.5,0,6.28);g.fill();g.stroke();
  }
  function lamp(){
    // flashlight in the hand
    var lx=0,ly=hipY-0;
    if(dir==='down'){lx=-19;ly=hipY-8;}else if(dir==='up'){lx=19;ly=hipY-8;}else if(dir==='right'){lx=12;ly=hipY-10;}else{lx=-12;ly=hipY-10;}
    g.fillStyle='#222a30';g.fillRect(lx-3,ly-4,6,12);g.fillStyle=flash?'#ffe9a8':'#6a6f72';g.fillRect(lx-4,ly-6,8,3);
  }
  if(dir==='up'){legs();arm(-1,sw2);arm(1,sw);torso();pack_();lamp();head();}
  else if(dir==='down'){legs();pack_();torso();arm(-1,sw);arm(1,sw2);lamp();head();}
  else {legs();pack_();torso();arm(-1,sw);arm(1,sw2);lamp();head();}
  g.restore();
};

/* ================= atmosphere ================= */
Art.makeFog=function(){
  var c=mk(512,256),g=c.getContext('2d'),r=rng(99);
  for(var i=0;i<22;i++){var x=r()*512,y=r()*256,rad=40+r()*80,gr=g.createRadialGradient(x,y,1,x,y,rad);gr.addColorStop(0,'rgba(150,170,175,0.11)');gr.addColorStop(1,'rgba(150,170,175,0)');g.fillStyle=gr;
    [-512,0,512].forEach(function(o){g.fillRect(x-rad+o,y-rad,rad*2,rad*2);var gr2=g.createRadialGradient(x+o,y,1,x+o,y,rad);gr2.addColorStop(0,'rgba(150,170,175,0.11)');gr2.addColorStop(1,'rgba(150,170,175,0)');g.fillStyle=gr2;g.fillRect(x-rad+o,y-rad,rad*2,rad*2);});}
  return c;
};
Art.lightBuf=null;
/* lights: [{x,y,r,color,flick}] in world coords. cam: camera. */
Art.drawLighting=function(g,vw,vh,cam,player,dirVec,lights,ambient,t,flashOn){
  var lb=Art.lightBuf;if(!lb||lb.width!==vw||lb.height!==vh){lb=Art.lightBuf=mk(vw,vh);}
  var lg_=lb.getContext('2d');
  lg_.globalCompositeOperation='source-over';lg_.clearRect(0,0,vw,vh);
  lg_.fillStyle='rgba(2,5,8,'+ambient+')';lg_.fillRect(0,0,vw,vh);
  lg_.globalCompositeOperation='destination-out';
  var px=player.x-cam.x,py=player.y-cam.y-46;
  // self light
  var gr=lg_.createRadialGradient(px,py,6,px,py,170);gr.addColorStop(0,'rgba(0,0,0,0.95)');gr.addColorStop(1,'rgba(0,0,0,0)');lg_.fillStyle=gr;lg_.beginPath();lg_.arc(px,py,170,0,6.28);lg_.fill();
  // flashlight cone
  if(flashOn){
    var ang=Math.atan2(dirVec.y,dirVec.x),len=460,sp=0.55;
    var fg=lg_.createRadialGradient(px,py,10,px,py,len);fg.addColorStop(0,'rgba(0,0,0,0.98)');fg.addColorStop(0.6,'rgba(0,0,0,0.6)');fg.addColorStop(1,'rgba(0,0,0,0)');
    lg_.fillStyle=fg;lg_.beginPath();lg_.moveTo(px,py);lg_.arc(px,py,len,ang-sp,ang+sp);lg_.closePath();lg_.fill();
  }
  lights.forEach(function(L){
    var lx=L.x-cam.x,ly=L.y-cam.y;if(lx<-L.r||lx>vw+L.r||ly<-L.r||ly>vh+L.r)return;
    var f=L.flick?(0.82+0.18*Math.sin(t*(7+L.x%5))*Math.sin(t*3.1+L.y)):1;
    var rg=lg_.createRadialGradient(lx,ly,4,lx,ly,L.r);rg.addColorStop(0,'rgba(0,0,0,'+(0.9*f)+')');rg.addColorStop(1,'rgba(0,0,0,0)');lg_.fillStyle=rg;lg_.beginPath();lg_.arc(lx,ly,L.r,0,6.28);lg_.fill();
  });
  g.drawImage(lb,0,0);
  // colored light glow
  g.save();g.globalCompositeOperation='lighter';
  lights.forEach(function(L){
    var lx=L.x-cam.x,ly=L.y-cam.y;if(lx<-L.r||lx>vw+L.r||ly<-L.r||ly>vh+L.r)return;
    var f=L.flick?(0.8+0.2*Math.sin(t*(7+L.x%5))*Math.sin(t*3.1+L.y)):1;
    var rg=g.createRadialGradient(lx,ly,2,lx,ly,L.r*0.9);rg.addColorStop(0,hexA(L.color,0.20*f));rg.addColorStop(1,hexA(L.color,0));g.fillStyle=rg;g.beginPath();g.arc(lx,ly,L.r*0.9,0,6.28);g.fill();
  });
  g.restore();
};
function hexA(c,a){var r=hex(c);return 'rgba('+r[0]+','+r[1]+','+r[2]+','+a+')';}
Art.hexA=hexA;
})();
