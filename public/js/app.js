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

  function initFriends(){
    const searchInput = document.getElementById('friendSearchInput');
    const addBtn = document.getElementById('addFriendBtn');
    const friendsList = document.getElementById('friendsList');
    const requestsList = document.getElementById('friendRequestsList');
    const friendsCount = document.getElementById('friendsCount');
    const pendingCount = document.getElementById('pendingCount');
    
    const friends = load('orkut2025_friends', []);
    const requests = load('orkut2025_friend_requests', []);
    
    function updateCounts(){
      if(friendsCount) friendsCount.textContent = friends.length;
      if(pendingCount) pendingCount.textContent = requests.length;
    }
    
    function renderFriends(){
      if(!friendsList) return;
      if(friends.length === 0){
        friendsList.innerHTML = '<div class="center" style="color:#6b7280">Nenhum amigo ainda</div>';
        return;
      }
      friendsList.innerHTML = friends.map(f=> 
        `<div class="card" style="margin-bottom:8px">
          <strong>${f.name}</strong> <span style="color:#6b7280">(${f.id})</span>
          <div style="margin-top:4px;font-size:12px;color:#6b7280">Amigos desde ${new Date(f.since).toLocaleDateString()}</div>
        </div>`
      ).join('');
    }
    
    function renderRequests(){
      if(!requestsList) return;
      if(requests.length === 0){
        requestsList.innerHTML = '<div class="center" style="color:#6b7280">Nenhuma solicitação pendente</div>';
        return;
      }
      requestsList.innerHTML = requests.map(r=>
        `<div class="card" style="margin-bottom:8px">
          <strong>${r.name}</strong> quer ser seu amigo
          <div style="margin-top:8px">
            <button class="btn" onclick="App.acceptFriend('${r.id}')">Aceitar</button>
            <button class="btn secondary" onclick="App.rejectFriend('${r.id}')" style="margin-left:8px">Recusar</button>
          </div>
        </div>`
      ).join('');
    }
    
    updateCounts();
    renderFriends();
    renderRequests();
    
    addBtn && addBtn.addEventListener('click', async ()=>{
      const query = (searchInput?.value||'').trim();
      if(!query) return;
      const newFriend = { id: query, name: query, since: Date.now() };
      friends.push(newFriend);
      save('orkut2025_friends', friends);
      updateCounts();
      renderFriends();
      searchInput.value = '';
      try{ await sync('friend_add', newFriend); }catch(e){ console.warn('Sync error:', e); }
    });
  }
  
  function initMessages(){
    const toInput = document.getElementById('messageToInput');
    const subjectInput = document.getElementById('messageSubjectInput');
    const contentInput = document.getElementById('messageContentInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const messagesList = document.getElementById('messagesList');
    const statusDiv = document.getElementById('messageStatus');
    
    const messages = load('orkut2025_messages', []);
    
    function renderMessages(){
      if(!messagesList) return;
      if(messages.length === 0){
        messagesList.innerHTML = '<div class="center" style="color:#6b7280">Nenhuma mensagem</div>';
        return;
      }
      messagesList.innerHTML = messages.map(m=>
        `<div class="card" style="margin-bottom:8px">
          <div style="font-weight:600">${m.subject || 'Sem assunto'}</div>
          <div style="color:#6b7280;font-size:12px">De: ${m.from} • ${new Date(m.created).toLocaleString()}</div>
          <div style="margin-top:4px">${m.content}</div>
        </div>`
      ).join('');
    }
    
    renderMessages();
    
    sendBtn && sendBtn.addEventListener('click', async ()=>{
      const to = (toInput?.value||'').trim();
      const subject = (subjectInput?.value||'').trim();
      const content = (contentInput?.value||'').trim();
      if(!to || !content) return;
      
      const message = { id: Date.now(), to, subject, content, from: 'Você', created: Date.now() };
      messages.unshift(message);
      save('orkut2025_messages', messages);
      renderMessages();
      
      toInput.value = '';
      subjectInput.value = '';
      contentInput.value = '';
      
      if(statusDiv) statusDiv.textContent = 'Mensagem enviada!';
      try{ await sync('message', message); }catch(e){ console.warn('Sync error:', e); }
    });
  }
  
  function initCommunities(){
    const nameInput = document.getElementById('communityNameInput');
    const categoryInput = document.getElementById('communityCategoryInput');
    const descInput = document.getElementById('communityDescInput');
    const createBtn = document.getElementById('createCommunityBtn');
    const myCommunities = document.getElementById('myCommunities');
    const popularCommunities = document.getElementById('popularCommunities');
    const statusDiv = document.getElementById('communityStatus');
    
    const communities = load('orkut2025_communities', []);
    const mockPopular = [
      {name: 'Eu odeio acordar cedo', category: 'Humor', members: 150000},
      {name: 'Nostalgia anos 2000', category: 'Nostalgia', members: 89000},
      {name: 'Programadores', category: 'Tecnologia', members: 45000}
    ];
    
    function renderMyCommunities(){
      if(!myCommunities) return;
      if(communities.length === 0){
        myCommunities.innerHTML = '<div class="center" style="color:#6b7280">Você ainda não participa de nenhuma comunidade</div>';
        return;
      }
      myCommunities.innerHTML = communities.map(c=>
        `<div class="card" style="margin-bottom:8px">
          <strong>${c.name}</strong> <span style="color:#6b7280">(${c.category})</span>
          <div style="margin-top:4px;font-size:12px">${c.description}</div>
        </div>`
      ).join('');
    }
    
    function renderPopular(){
      if(!popularCommunities) return;
      popularCommunities.innerHTML = mockPopular.map(c=>
        `<div class="card" style="margin-bottom:8px">
          <strong>${c.name}</strong> <span style="color:#6b7280">(${c.category})</span>
          <div style="color:#6b7280;font-size:12px">${c.members.toLocaleString()} membros</div>
          <button class="btn" onclick="App.joinCommunity('${c.name}', '${c.category}')">Participar</button>
        </div>`
      ).join('');
    }
    
    renderMyCommunities();
    renderPopular();
    
    createBtn && createBtn.addEventListener('click', async ()=>{
      const name = (nameInput?.value||'').trim();
      const category = (categoryInput?.value||'').trim();
      const description = (descInput?.value||'').trim();
      if(!name) return;
      
      const community = { id: Date.now(), name, category: category||'Geral', description, created: Date.now() };
      communities.push(community);
      save('orkut2025_communities', communities);
      renderMyCommunities();
      
      nameInput.value = '';
      categoryInput.value = '';
      descInput.value = '';
      
      if(statusDiv) statusDiv.textContent = 'Comunidade criada!';
      try{ await sync('community', community); }catch(e){ console.warn('Sync error:', e); }
    });
  }
  
  function acceptFriend(id){
    const requests = load('orkut2025_friend_requests', []);
    const friends = load('orkut2025_friends', []);
    const request = requests.find(r=>r.id === id);
    if(request){
      friends.push({...request, since: Date.now()});
      save('orkut2025_friends', friends);
      save('orkut2025_friend_requests', requests.filter(r=>r.id !== id));
      initFriends(); // re-render
    }
  }
  
  function rejectFriend(id){
    const requests = load('orkut2025_friend_requests', []);
    save('orkut2025_friend_requests', requests.filter(r=>r.id !== id));
    initFriends(); // re-render
  }
  
  function joinCommunity(name, category){
    const communities = load('orkut2025_communities', []);
    if(!communities.find(c=>c.name === name)){
      communities.push({id: Date.now(), name, category, description: 'Comunidade popular', created: Date.now()});
      save('orkut2025_communities', communities);
      initCommunities(); // re-render
    }
  }

  window.App = { 
    initHome, initFeed, initProfile, initSettings, initFriends, initMessages, initCommunities, 
    sync, acceptFriend, rejectFriend, joinCommunity 
  };
})();
