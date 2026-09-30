(() => {
  'use strict';
  const panel = document.querySelector('[data-kaitori-contact]');
  if (!panel) return;
  const reveal = panel.querySelector('[data-email-reveal]');
  const result = panel.querySelector('[data-email-result]');
  const field = panel.querySelector('[data-email-field]');
  const copy = panel.querySelector('[data-email-copy]');
  const status = panel.querySelector('[data-email-status]');
  const container = panel.querySelector('[data-turnstile-container]');
  let loading = null; let widget = null; let attempt = 0;
  const observe = alias => document.dispatchEvent(new CustomEvent('shimarisu:email-success',{detail:{alias}}));
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      const fail = () => { clearTimeout(timer); script.remove(); loading=null; reject(new Error('unavailable')); };
      const timer = setTimeout(fail,15000);
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => { clearTimeout(timer); if(window.turnstile) resolve(); else fail(); };
      script.onerror = fail;
      document.head.appendChild(script);
    });
    return loading;
  }
  function fail(current) {
    if(current!==attempt) return;
    reveal.disabled=false; reveal.textContent='もう一度、メールアドレスを表示';
    status.textContent='確認できませんでした。通信環境を確かめて、もう一度お試しください。';
  }
  reveal.addEventListener('click',async () => {
    const current=++attempt;
    reveal.disabled=true; status.textContent='確認しています…';
    try {
      const response=await fetch('/api/kaitori-config',{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(15000)});
      if(!response.ok) throw new Error('unavailable');
      const config=await response.json();
      if(typeof config.sitekey!=='string'||!config.sitekey) throw new Error('unavailable');
      await loadTurnstile();
      if(widget!==null) { window.turnstile.remove(widget); widget=null; }
      widget=window.turnstile.render(container,{
        sitekey:config.sitekey,action:'kaitori_email',appearance:'interaction-only',size:'compact',theme:'light',
        'response-field':false,
        callback:async token => {
          if(current!==attempt) return;
          try {
            const res=await fetch('/api/kaitori-email',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),signal:AbortSignal.timeout(15000)});
            if(!res.ok) throw new Error('unavailable');
            const data=await res.json();
            if(typeof data.email!=='string'||!data.email) throw new Error('unavailable');
            if(current!==attempt) return;
            field.value=data.email; result.hidden=false; reveal.hidden=true; status.textContent='';
            if(widget!==null) { window.turnstile.remove(widget); widget=null; }
            field.focus(); observe('kaitori_email_reveal');
          } catch { fail(current); }
        },
        'error-callback':()=>{fail(current);return true;},
        'expired-callback':()=>fail(current),
        'timeout-callback':()=>fail(current),
        'unsupported-callback':()=>fail(current)
      });
    } catch { fail(current); }
  });
  copy.addEventListener('click',async () => {
    if(!field.value) return;
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent='メールアドレスをコピーしました。';
      observe('kaitori_email_copy');
    } catch {
      field.focus(); field.select(); field.setSelectionRange(0,field.value.length);
      status.textContent='選択してコピーしてください。';
    }
  });
})();
