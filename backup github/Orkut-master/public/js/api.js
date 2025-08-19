(function(){
  const API_BASE = '';
  async function postJSON(path, body){
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if(!res.ok){
      const text = await res.text();
      throw new Error(text || ('HTTP '+res.status));
    }
    return res.json().catch(()=>({ ok:true }));
  }
  window.Api = { postJSON };
})();
