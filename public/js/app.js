(function(){
  const LS_KEYS = {
    settings: 'orkut2025_settings',
    profile: 'orkut2025_profile',
    feed: 'orkut2025_feed'
  };

  function load(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(_){ return fallback; }
  }
  function save(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function sync(type, payload){
    // Envia atualização ao backend
    try {
      const userId = (load(LS_KEYS.settings,{userId:null})||{}).userId;
      if(!userId) throw new Error('Defina um ID do usuário em Configurações.');
      const res = await window.Api.postJSON('/api/sync', { userId, type, payload, ts: Date.now() });
      return res;
    } catch (e){
      console.error('Falha ao sincronizar', e);
      throw e;
    }
  }

  function initHome(){
    const statusInput = document.getElementById('statusInput');
    const saveBtn = document.getElementById('saveStatusBtn');
    const clearBtn = document.getElementById('clearLocalBtn');
    const msg = document.getElementById('statusMsg');

    const feed = load(LS_KEYS.feed, []);
    if(statusInput) statusInput.value = '';

    function render(){
      // no index não listamos, apenas salvar
    }
    render();

    saveBtn && saveBtn.addEventListener('click', async ()=>{
      const text = (statusInput?.value || '').trim();
      if(!text){ msg.textContent = 'Digite algo para salvar.'; return; }
      const entry = { id: 'loc_'+Date.now(), text, createdAt: Date.now() };
      feed.unshift(entry);
      save(LS_KEYS.feed, feed);
      msg.textContent = 'Salvo localmente. Sincronizando...';
      try { await sync('status', entry); msg.textContent = 'Sincronizado com sucesso!'; }
      catch(e){ msg.textContent = 'Salvo localmente. Erro ao sincronizar: '+e.message; }
      statusInput.value='';
    });

    clearBtn && clearBtn.addEventListener('click', ()=>{
      localStorage.removeItem(LS_KEYS.feed);
      msg.textContent = 'Cache local do feed limpo.';
    });
  }

  function initFeed(){
    const list = document.getElementById('feedList');
    const feed = load(LS_KEYS.feed, []);
    function itemHtml(it){
      const d = new Date(it.createdAt||Date.now()).toLocaleString();
      return `<div class="card"><div>${it.text}</div><div style="color:#6b7280;font-size:12px;margin-top:6px">${d}</div></div>`;
    }
    if(list) list.innerHTML = feed.map(itemHtml).join('') || '<div class="card">Sem posts ainda.</div>';
  }

  function initProfile(){
    const nameI = document.getElementById('nameInput');
    const bioI = document.getElementById('bioInput');
    const btn = document.getElementById('saveProfileBtn');
    const msg = document.getElementById('profileMsg');
    const profile = load(LS_KEYS.profile, { name:'', bio:'' });
    if(nameI) nameI.value = profile.name || '';
    if(bioI) bioI.value = profile.bio || '';

    btn && btn.addEventListener('click', async ()=>{
      const data = { name: nameI?.value||'', bio: bioI?.value||'' };
      save(LS_KEYS.profile, data);
      msg.textContent = 'Perfil salvo localmente. Sincronizando...';
      try { await sync('profile', data); msg.textContent = 'Perfil sincronizado!'; }
      catch(e){ msg.textContent = 'Salvo localmente. Erro ao sincronizar: '+e.message; }
    });
  }

  function initSettings(){
    const userI = document.getElementById('userIdInput');
    const btn = document.getElementById('saveSettingsBtn');
    const msg = document.getElementById('settingsMsg');
    const settings = load(LS_KEYS.settings, { userId: '' });
    if(userI) userI.value = settings.userId || '';

    btn && btn.addEventListener('click', ()=>{
      const userId = (userI?.value||'').trim();
      if(!userId){ msg.textContent = 'Informe um ID de usuário.'; return; }
      save(LS_KEYS.settings, { userId });
      msg.textContent = 'Configurações salvas localmente.';
    });
  }

  window.App = { initHome, initFeed, initProfile, initSettings, sync };
})();
