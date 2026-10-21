(function () {
  const SITE = { wa: '5541998550200' };
  const doc = document.documentElement;
  doc.classList.add('js');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (txt) => 'https://wa.me/' + SITE.wa + '?text=' + encodeURIComponent(txt);
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa || 'Olá!'); a.target = '_blank'; a.rel = 'noopener'; });

  // entrada do hero
  const hero = $('.hero');
  requestAnimationFrame(() => setTimeout(() => hero.classList.add('pronto'), 60));

  // menu mobile
  const hamb = $('.hamb'), menu = $('#menu');
  const fechar = () => { menu.classList.remove('aberto'); hamb.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  hamb.addEventListener('click', () => {
    const abre = hamb.getAttribute('aria-expanded') !== 'true';
    hamb.setAttribute('aria-expanded', String(abre)); menu.classList.toggle('aberto', abre);
    document.body.style.overflow = abre ? 'hidden' : '';
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', fechar));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });

  // reveal
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rev').forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => c.classList.contains('rev'));
    el.style.transitionDelay = Math.min(irmaos.indexOf(el), 5) * 80 + 'ms';
    io.observe(el);
  });

  // relógio: marcas
  const rel = $('.relogio'), g = $('.relogio__marcas', rel), ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2, gr = i % 5 === 0, r1 = gr ? 168 : 174, r2 = 182;
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', 200 + Math.cos(a) * r1); l.setAttribute('y1', 200 + Math.sin(a) * r1);
    l.setAttribute('x2', 200 + Math.cos(a) * r2); l.setAttribute('y2', 200 + Math.sin(a) * r2);
    if (gr) l.setAttribute('class', 'g'); g.appendChild(l);
  }
  const arco = $('.relogio__arco', rel), num = $('[data-min]', rel);
  const fases = $$('.fases li');
  const pinta = (p) => {
    const v = 45 * p;
    arco.style.strokeDasharray = v.toFixed(2) + ' 60';
    num.textContent = Math.round(v);
    const k = Math.min(fases.length - 1, Math.floor(p * fases.length * .999));
    fases.forEach((li, i) => li.classList.toggle('ativa', i === k));
  };

  // cena fixa no desktop: o relógio anda com a rolagem; no celular, anima ao entrar
  const consulta = $('.consulta'), palco = $('.consulta__palco');
  const largo = matchMedia('(min-width: 901px)');
  let cena = false;
  const montaCena = () => {
    cena = largo.matches && !calmo;
    consulta.classList.toggle('consulta--cena', cena);
    if (!cena) { fases.forEach((li) => li.classList.remove('ativa')); arco.style.strokeDasharray = '45 60'; num.textContent = 45; }
  };
  montaCena(); largo.addEventListener('change', () => { montaCena(); noScroll(); });
  if (!calmo) {
    new IntersectionObserver((ents, obs) => {
      if (cena || !ents[0].isIntersecting) return; obs.disconnect();
      const t0 = performance.now(), dur = 2000;
      const passo = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        arco.style.strokeDasharray = (45 * e).toFixed(2) + ' 60'; num.textContent = Math.round(45 * e);
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: .4 }).observe(rel);
  }

  // rolagem: header, cena, botão flutuante
  const header = $('.topo'), flut = $('.wa-flut'), agenda = $('#agenda');
  let tick = false;
  new IntersectionObserver((ents) => { flut.classList.toggle('some', ents[0].isIntersecting); }, { threshold: .1 }).observe(agenda);
  const escuras = $$('.consulta, .rodape');
  function noScroll() {
    tick = false;
    header.classList.toggle('sujo', scrollY > 24);
    const meio = 36;
    header.classList.toggle('escuro', escuras.some((s) => { const r = s.getBoundingClientRect(); return r.top <= meio && r.bottom >= meio; }));
    if (cena) {
      const r = palco.getBoundingClientRect(), total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (total * .85)));
      pinta(p);
    }
  }
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(noScroll); } }, { passive: true });
  noScroll();

  // agenda vira mensagem de WhatsApp
  const erro = $('.agenda__erro', agenda);
  agenda.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = agenda.elements, nome = f.nome.value.trim(), motivo = (agenda.querySelector('input[name=motivo]:checked') || {}).value;
    const ok = nome.length > 1 && motivo;
    agenda.classList.toggle('erro', !motivo); f.nome.classList.toggle('erro-c', nome.length < 2); erro.hidden = !!ok;
    if (!ok) { (motivo ? f.nome : agenda.querySelector('input[name=motivo]')).focus(); return; }
    const msg = [
      'Olá! Gostaria de agendar uma consulta na Clínica Campos Guimarães.', '',
      'Nome: ' + nome,
      'Modalidade: ' + agenda.querySelector('input[name=mod]:checked').value,
      'Motivo: ' + motivo,
      'Melhor período: ' + f.periodo.value
    ].join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
  });
  agenda.addEventListener('change', () => { agenda.classList.remove('erro'); erro.hidden = true; });

  // copiar endereço
  const toast = $('.toast');
  $$('[data-copiar]').forEach((b) => b.addEventListener('click', async () => {
    const txt = b.dataset.copiar;
    try { await navigator.clipboard.writeText(txt); }
    catch (_) { const t = document.createElement('textarea'); t.value = txt; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); }
    const s = $('span', b); s.textContent = 'Copiado!';
    toast.textContent = 'Endereço copiado. É só colar no app.'; toast.classList.add('on');
    setTimeout(() => { s.textContent = 'Copiar endereço'; toast.classList.remove('on'); }, 2200);
  }));
})();
