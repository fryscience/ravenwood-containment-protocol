/* Short, bounded HTTP requests to a standard Netlify Function. No WebSocket server. */
(function(){'use strict';
window.RavenwoodTransport={connect:async function(){
 const endpoint='/.netlify/functions/game';
 let token=sessionStorage.getItem('rwcp.netlify.session');if(!/^[a-f0-9]{64}$/.test(token||'')){token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');sessionStorage.setItem('rwcp.netlify.session',token);}
 let online=false,watches=[],room='',pulling=null,stopped=false,heartbeat=null,summary=null;
 const clone=v=>v===undefined?null:JSON.parse(JSON.stringify(v));
 function connected(value){if(value!==online){online=value;watches.filter(w=>w.path==='.info/connected').forEach(w=>w.cb(value));}}
 async function request(body){
  let controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
   if(response.status===404)throw Error('The multiplayer Function is missing from this deployment. Netlify Drop alone does not deploy Functions.');
   let result;try{result=await response.json();}catch{throw Error('The multiplayer service did not return game data. Check the Function deployment.');}
   if(!response.ok){const error=Error(result.error||'The game action was rejected.');error.status=response.status;error.value=result.value;throw error;}
   connected(true);if(result.summary)summary=result.summary;return result;
  }catch(error){if(!error.status||error.status>=500)connected(false);throw error;}finally{clearTimeout(timeout);}
 }
 const session=await request({op:'session'});
 function notify(data){for(const w of watches.slice()){if(w.path==='.info/connected')continue;let parts=w.path.split('/');if(parts[1]!==room)continue;let value=parts.slice(2).reduce((o,k)=>o?.[k],data)??null;const fingerprint=JSON.stringify(value);if(fingerprint!==w.last){w.last=fingerprint;try{w.cb(clone(value));}catch(e){w.error?.(e);}}}}
 async function pull(){if(stopped||!room)return;if(pulling)return pulling;pulling=request({op:'poll',room}).then(r=>notify(r.room)).catch(e=>{if(e.status&&e.status!==409)watches.filter(w=>w.path!=='.info/connected').forEach(w=>w.error?.(e));}).finally(()=>pulling=null);return pulling;}
 const adapter={uid:session.uid,stamp:()=>({'.sv':'timestamp'}),summary:()=>summary,
 read:async path=>(await request({op:'read',path})).value,
 write:async(path,value)=>{const r=await request({op:'write',path,value});await pull();return r.value;},
 patch:async(path,changes)=>adapter.transaction(path,v=>Object.assign({},v||{},changes)),
 remove:path=>adapter.write(path,null),
 transaction:async(path,fn)=>{for(let i=0;i<12;i++){let previous=await adapter.read(path),value=fn(clone(previous));if(value===undefined)return {committed:false,value:previous};try{const r=await request({op:'write',path,value,expected:previous});await pull();return {committed:true,value:r.value};}catch(e){if(e.status!==409)throw e;}}throw Error('The team changed this action. Try again.');},
 watch:(path,cb,error)=>{const w={path,cb,error,last:undefined};watches.push(w);if(path==='.info/connected')queueMicrotask(()=>cb(online));else{room=path.split('/')[1];pull();}if(!heartbeat){heartbeat=setInterval(()=>pull(),500);heartbeat.unref?.();}return ()=>{watches=watches.filter(x=>x!==w);if(!watches.some(w=>w.path!=='.info/connected'))room='';};},
 // Presence is renewed by bounded polls and expires server-side after 20 seconds.
 disconnect:()=>({remove:async()=>{},cancel:async()=>{}}),unique:()=> 'session',
 offline:()=>{stopped=true;connected(false);},online:()=>{stopped=false;pull();},refresh:pull,
 destroy:()=>{stopped=true;clearInterval(heartbeat);watches=[];}
 };
 return adapter;
}};
})();
