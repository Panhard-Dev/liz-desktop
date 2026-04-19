
  const P = {
    pro:   {m:'R$ 19,90', a:'R$ 15,92'},
    max:   {m:'R$ 49,90', a:'R$ 39,92'},
    ultra: {m:'R$ 99,90', a:'R$ 79,92'},
  };
  let ann = false;
  const tt = document.getElementById('tt');
  const planButtons = Array.from(document.querySelectorAll('[data-plan-target]'));
  const cardsRoot = document.querySelector('.cards');

  function update() {
    const k = ann ? 'a' : 'm';
    [['vp','op','pro'],['vm','om','max'],['vu','ou','ultra']].forEach(([vi,oi,pl])=>{
      document.getElementById(vi).textContent = P[pl][k];
      const o = document.getElementById(oi);
      o.textContent = P[pl].m;
      o.classList.toggle('show', ann);
    });
    document.getElementById('lm').classList.toggle('on', !ann);
    document.getElementById('la').classList.toggle('on', ann);
    tt.classList.toggle('on', ann);
  }

  function setPlan(planId){
    const safe = String(planId || '').toLowerCase();
    planButtons.forEach(btn=>{
      const on = btn.dataset.planTarget === safe;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    if(cardsRoot) cardsRoot.dataset.currentPlan = safe;
  }

  tt.addEventListener('click', ()=>{ ann=!ann; update(); });
  planButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>setPlan(btn.dataset.planTarget));
  });
  setPlan('pro');

  function choose(p){ alert('Redirecionando para o plano ' + p + '...'); }

