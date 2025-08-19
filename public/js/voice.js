(function(){
  const HAS_SR = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function createCallModal(){
    let el = document.getElementById('callModal');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'callModal';
    el.style.position='fixed';
    el.style.inset='0';
    el.style.background='rgba(0,0,0,.5)';
    el.style.display='none';
    el.style.alignItems='center';
    el.style.justifyContent='center';
    el.innerHTML = `
      <div style="background:#fff;padding:20px;border-radius:10px;min-width:300px;text-align:center">
        <div id="callTitle" style="font-weight:600;margin-bottom:8px">Ligando...</div>
        <div id="callTimer" style="color:#6b7280;margin-bottom:16px">00:00</div>
        <button id="endCallBtn" class="btn" style="background:#ef4444">Encerrar</button>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function startFakeCall(nome){
    const modal = createCallModal();
    const title = modal.querySelector('#callTitle');
    const timer = modal.querySelector('#callTimer');
    const endBtn = modal.querySelector('#endCallBtn');
    title.textContent = `Ligando para ${nome}...`;
    modal.style.display='flex';
    let s=0; let int = setInterval(()=>{ s++; const mm = String(Math.floor(s/60)).padStart(2,'0'); const ss = String(s%60).padStart(2,'0'); timer.textContent = `${mm}:${ss}`; },1000);
    function end(){ clearInterval(int); modal.style.display='none'; }
    endBtn.onclick = end;
    // encerra automático após 20s na demo
    setTimeout(end, 20000);
  }

  function normalize(txt){
    return (txt||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
  }

  function parseCommand(text){
    const t = normalize(text);
    // abrir perfil de fulano
    let m = t.match(/abrir\s+perfil\s+de\s+(.+)/);
    if(m){ return { action:'open_profile', target: m[1].trim() }; }
    m = t.match(/abrir\s+perfil\s+(.+)/);
    if(m){ return { action:'open_profile', target: m[1].trim() }; }

    // poste no perfil de fulano, mensagem...
    m = t.match(/post(ar|e)?\s+(no|no\s+perfil\s+de|no\s+perfil|no\s+perfil\s+do)?\s*(de\s+)?(.+?)\s*,\s*(.+)/);
    if(m){
      const name = (m[4]||'').trim();
      const msg = (m[5]||'').trim();
      return { action:'post_to', target:name, message: msg };
    }

    // festa sexta as 22:00 (postar rápido sem alvo)
    m = t.match(/festa\b.*|\b(as|às)\s+\d{1,2}(:\d{2})?/);
    if(m){ return { action:'quick_post', message: text.trim() }; }

    // ligue para fulano
    m = t.match(/(ligar|ligue|chamar|telefonar)\s+(para\s+)?(.+)/);
    if(m){ return { action:'call', target: (m[3]||'').trim() }; }

    return { action:'unknown', raw:text };
  }

  async function execute(cmd){
    switch(cmd.action){
      case 'open_profile':{
        const user = encodeURIComponent(cmd.target);
        window.location.href = `/profile.html?user=${user}`;
        break;
      }
      case 'post_to':{
        const feed = JSON.parse(localStorage.getItem('orkut2025_feed')||'[]');
        const entry = { id: 'v_'+Date.now(), text: `@${cmd.target}: ${cmd.message}`, createdAt: Date.now(), to: cmd.target };
        feed.unshift(entry);
        localStorage.setItem('orkut2025_feed', JSON.stringify(feed));
        try{ await window.App.sync('status', entry); notify('Post publicado e sincronizado.'); }
        catch(e){ notify('Post salvo localmente. Erro ao sincronizar.'); }
        break;
      }
      case 'quick_post':{
        const feed = JSON.parse(localStorage.getItem('orkut2025_feed')||'[]');
        const entry = { id:'v_'+Date.now(), text: cmd.message, createdAt: Date.now() };
        feed.unshift(entry);
        localStorage.setItem('orkut2025_feed', JSON.stringify(feed));
        try{ await window.App.sync('status', entry); notify('Post publicado e sincronizado.'); }
        catch(e){ notify('Post salvo localmente. Erro ao sincronizar.'); }
        break;
      }
      case 'call':{
        startFakeCall(cmd.target);
        break;
      }
      default:
        notify('Não entendi. Exemplos: "abrir perfil de Fulano", "poste no perfil de Fulano, festa sexta às 22:00", "ligue para Fulano".');
    }
  }

  function notify(msg){
    let n = document.getElementById('voiceNotify');
    if(!n){ n = document.createElement('div'); n.id='voiceNotify'; n.style.position='fixed'; n.style.bottom='16px'; n.style.left='50%'; n.style.transform='translateX(-50%)'; n.style.background='#111'; n.style.color='#fff'; n.style.padding='10px 14px'; n.style.borderRadius='8px'; n.style.zIndex='9999'; document.body.appendChild(n);} 
    n.textContent = msg; n.style.opacity='1';
    setTimeout(()=>{ n.style.transition='opacity .5s'; n.style.opacity='0'; }, 2500);
  }

  function initButton(button){
    if(!button) return;
    if(!HAS_SR){ button.disabled=true; button.title='Seu navegador não suporta reconhecimento de voz'; return; }
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    let listening = false;

    function start(){
      if(listening) return;
      listening = true;
      button.textContent = '🎙️ Ouvindo...';
      rec.start();
    }
    function stop(){ try{ rec.stop(); }catch(_){} }

    rec.onresult = (e)=>{
      const transcript = Array.from(e.results).map(r=>r[0].transcript).join(' ').trim();
      if(transcript) {
        notify('Você disse: '+transcript);
        const cmd = parseCommand(transcript);
        execute(cmd);
      }
    };
    rec.onend = ()=>{ listening=false; button.textContent='🎤 Voz'; };
    rec.onerror = ()=>{ listening=false; button.textContent='🎤 Voz'; notify('Erro no reconhecimento de voz.'); };

    button.addEventListener('click', ()=>{ listening ? stop() : start(); });
  }

  function ensureVoiceButton(){
    let btn = document.getElementById('voiceBtn');
    if(!btn){
      // tenta inserir no header
      const header = document.querySelector('header nav');
      if(header){
        btn = document.createElement('button');
        btn.id='voiceBtn';
        btn.className='btn';
        btn.style.marginLeft='8px';
        btn.textContent='🎤 Voz';
        header.appendChild(btn);
      }
    }
    return btn;
  }

  function init(){
    const btn = ensureVoiceButton();
    initButton(btn);
  }

  window.Voice = { init };
})();
