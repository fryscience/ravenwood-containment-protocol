/* Multiplayer bootstrap: no saved single-player state or preview mode. */
(function(){'use strict';var Z=window.Z;
async function start(){Z.UI.init();Z.Game.init();Z.TTS.init();Z.Engine.init(Z.$('#game'));await Z.Investigators.loadArt();await Z.Net.init();Z.ready=true;}
function boot(){start().catch(function(e){Z.notice('Startup did not complete: '+e.message,'warn');});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
