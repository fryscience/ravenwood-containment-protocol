/* Shared scientific projections and proof generation; same original simulations and answer checks. */
(function(){'use strict';var Z=window.Z,X=Z.TeamScience={};
X.finalKey={2:'Q',3:'why',4:'judgments',5:'claims',6:'final'};
X.keys={2:['ints','burst','rest','qpick','runs','lastRun'],3:['cond','sel','whyPick','node'],4:['t1','t2','intr','stmt'],5:['views','match','claims'],6:['choice','sel','cer','tries']};
X.pack=function(n,s){var out={};X.keys[n].forEach(function(k){if(s[k]!==undefined)out[k]=JSON.parse(JSON.stringify(s[k]));});return out;};
X.project=function(n,model,proof){var p=Object.assign(Z.defState()['p'+n],JSON.parse(JSON.stringify(model||{}))),f=proof||{};
 if(n===2){p.goalA=!!f.A;p.goalB=!!f.B;p.qok=!!f.Q;if(f.Q)p.qpick='b';}
 if(n===3){p.tested={};['adequate','reduced','severe'].forEach(k=>{if(f[k])p.tested[k]=true;});p.selOk=!!f.analysis;p.whyOk=!!f.why;if(f.analysis)p.sel=f.analysis.sel;if(f.why)p.whyPick='b';}
 if(n===4){p.ok1=!!f.reflex;p.ok2=!!f.avoid;p.goalOk=!!f.interruption;p.stmtOk=!!f.judgments;if(f.reflex)p.t1=f.reflex.route.split('>');if(f.avoid)p.t2=f.avoid.route.split('>');if(f.judgments)p.stmt=f.judgments.answers;p.t1=Array.isArray(p.t1)?p.t1:Object.values(p.t1||{});p.t2=Array.isArray(p.t2)?p.t2:Object.values(p.t2||{});}
 if(n===5){p.matchOk=!!f.matches;p.claimsOk=!!f.claims;p.views={};['cam','pump','o2','nut'].forEach(k=>{if(f[k])p.views[k]=true;});if(f.matches)p.match=f.matches.answers;if(f.claims)p.claims=f.claims.answers;}
 if(n===6){p.submitted=!!f.final;if(f.final){p.choice=f.final.choice;p.sel=f.final.sel;p.cer=f.final.cer;}}
 return p;
};
X.ready=function(n,f){var keys={2:['A','B','Q'],3:['adequate','reduced','severe','analysis','why'],4:['reflex','avoid','interruption','judgments'],5:['cam','pump','o2','nut','matches','claims'],6:['final']};return keys[n].every(k=>!!f?.[k]);};
X.candidates=function(n,s,a){var out=[];function add(key,data){out.push({key:key,data:data});}
 if(n===2){if(a.type==='click'&&a.name==='run'){var r=Z.simATP(s.ints,s.burst,s.rest);if(s.ints>=6){var d={intensity:s.ints,burst:s.burst,rest:s.rest,cycles:{}};r.cyc.forEach((c,i)=>d.cycles[i]={start:c.start,end:c.min,def:c.def,after:c.after});if(s.burst>=3&&r.cls!=='sustained')add('A',d);if(r.cls==='sustained')add('B',d);}}if(a.name==='qcheck'&&s.qok)add('Q',{answer:s.qpick});}
 if(n===3){if(a.name==='run')add(s.cond,{condition:s.cond});if(a.name==='selcheck'&&s.selOk)add('analysis',{sel:s.sel});if(a.name==='whycheck'&&s.whyOk)add('why',{answer:s.whyPick});}
 if(n===4){if(a.name==='tcheck'&&a.data.s==='t1'&&s.ok1)add('reflex',{route:s.t1.join('>')});if(a.name==='tcheck'&&a.data.s==='t2'&&s.ok2)add('avoid',{route:s.t2.join('>')});if(a.name==='p4intr'&&s.intr==='brain')add('interruption',{component:'brain'});if(a.name==='scheck'&&s.stmtOk)add('judgments',{answers:s.stmt});}
 if(n===5){if(a.name==='view'&&s.views[a.data.k])add(a.data.k,{record:a.data.k});if(a.name==='mcheck'&&s.matchOk)add('matches',{answers:s.match});if(a.name==='ccheck'&&s.claimsOk)add('claims',{answers:s.claims});}
 if(n===6&&a.name==='submit'&&s.submitted)add('final',{choice:s.choice,sel:s.sel,cer:s.cer});
 return out;
};
})();
