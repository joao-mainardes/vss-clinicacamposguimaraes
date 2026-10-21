(function () {
  const SITE = {
    wa: '5541998550200',
    endereco: 'Rua Desembargador Motta, 1499, 1º andar, sala 106 (Edifício Bristol Brasil 500) – Batel, Curitiba – PR, 80420-164'
  };
  const doc = document.documentElement;
  doc.classList.add('js');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (txt) => 'https://wa.me/' + SITE.wa + '?text=' + encodeURIComponent(txt);

  // links de WhatsApp a partir da fonte única
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa || 'Olá!');
    a.target = '_blank'; a.rel = 'noopener';
  });

  // header
  const header = document.querySelector('.topo');
  const onScroll = () => header.classList.toggle('sujo', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  const hamb = document.querySelector('.hamb');
  const menu = document.getElementById('menu');
  const fechar = () => { menu.classList.remove('aberto'); hamb.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  hamb.addEventListener('click', () => {
    const abre = hamb.getAttribute('aria-expanded') !== 'true';
    hamb.setAttribute('aria-expanded', String(abre));
    menu.classList.toggle('aberto', abre);
    document.body.style.overflow = abre ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', fechar));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });

  // reveal
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rev').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

  // relógio: marcas de minuto + arco que percorre os 45 minutos
  const relogio = document.querySelector('.relogio');
  const g = relogio.querySelector('.relogio__marcas');
  const ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2, gr = i % 5 === 0;
    const r1 = gr ? 160 : 164, r2 = 170;
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', 200 + Math.cos(a) * r1); l.setAttribute('y1', 200 + Math.sin(a) * r1);
    l.setAttribute('x2', 200 + Math.cos(a) * r2); l.setAttribute('y2', 200 + Math.sin(a) * r2);
    if (gr) l.setAttribute('class', 'g');
    g.appendChild(l);
  }
  const etapas = relogio.querySelectorAll('.relogio__etapas li');
  const num = relogio.querySelector('[data-min]');
  const liga = () => {
    relogio.classList.add('on');
    if (calmo) { etapas.forEach((e) => e.classList.add('on')); return; }
    const t0 = performance.now(), dur = 2400;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(ease * 45);
      etapas.forEach((e, i) => { if (ease > i * 0.25 + 0.05) e.classList.add('on'); });
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  setTimeout(liga, 400);

  // manifesto: palavras acendem com o scroll
  const manif = document.querySelector('[data-palavras]');
  manif.innerHTML = manif.textContent.trim().split(/\s+/).map((w) => '<span>' + w + '</span> ').join('');
  const palavras = manif.querySelectorAll('span');
  const acende = () => {
    const r = manif.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const n = Math.round(p * palavras.length);
    palavras.forEach((s, i) => s.classList.toggle('on', i < n));
  };
  if (!calmo) { addEventListener('scroll', acende, { passive: true }); acende(); }

  // abas fachada / mapa, com carregamento tardio dos iframes
  const carrega = (painel) => { const f = painel.querySelector('iframe[data-src]'); if (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); } };
  const tabs = document.querySelectorAll('.abas [role=tab]');
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((o) => {
      const sel = o === t;
      o.setAttribute('aria-selected', String(sel));
      document.getElementById(o.getAttribute('aria-controls')).hidden = !sel;
    });
    carrega(document.getElementById(t.getAttribute('aria-controls')));
  }));
  const local = document.getElementById('local');
  new IntersectionObserver((ents, obs) => {
    if (ents[0].isIntersecting) { carrega(document.getElementById('v-fachada')); obs.disconnect(); }
  }, { rootMargin: '400px' }).observe(local);

  // copiar endereço
  const toast = document.querySelector('.toast');
  const avisa = (msg) => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(avisa.t); avisa.t = setTimeout(() => toast.classList.remove('on'), 2400); };
  document.querySelectorAll('[data-copiar]').forEach((b) => b.addEventListener('click', async () => {
    const txt = b.dataset.copiar || SITE.endereco;
    try { await navigator.clipboard.writeText(txt); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {} ta.remove();
    }
    const s = b.querySelector('span'), orig = s.textContent;
    s.textContent = 'Endereço copiado'; avisa('Endereço copiado. É só colar no app de transporte.');
    setTimeout(() => { s.textContent = orig; }, 2400);
  }));

  // formulário que vira mensagem de WhatsApp
  const form = document.getElementById('form');
  const erro = form.querySelector('.form__erro');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const obrig = ['nome', 'tel', 'motivo'].map((n) => form.elements[n]);
    let ok = true;
    obrig.forEach((c) => { const v = c.value.trim().length > 1; c.classList.toggle('invalido', !v); if (!v) ok = false; });
    erro.hidden = ok;
    if (!ok) { obrig.find((c) => c.classList.contains('invalido')).focus(); return; }
    const f = form.elements;
    const linhas = [
      'Olá! Gostaria de agendar uma consulta na Clínica Campos Guimarães.',
      '',
      'Nome: ' + f.nome.value.trim(),
      'WhatsApp: ' + f.tel.value.trim(),
      'Modalidade: ' + f.mod.value,
      'Motivo: ' + f.motivo.value,
      'Médico: ' + f.medico.value,
      'Melhor período: ' + f.periodo.value
    ];
    if (f.obs.value.trim()) linhas.push('Observação: ' + f.obs.value.trim());
    window.open(waLink(linhas.join('\n')), '_blank', 'noopener');
  });

  // WhatsApp flutuante some quando o formulário está visível
  const flut = document.querySelector('.wa-flut');
  new IntersectionObserver((ents) => flut.classList.toggle('some', ents[0].isIntersecting), { threshold: .2 })
    .observe(document.getElementById('agendar'));
})();
