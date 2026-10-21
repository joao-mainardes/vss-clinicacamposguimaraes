(function () {
  const SITE = { wa: '5541998550200' };
  const doc = document.documentElement;
  doc.classList.add('js');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(pointer: fine)').matches;
  const waLink = (txt) => 'https://wa.me/' + SITE.wa + '?text=' + encodeURIComponent(txt);
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa || 'Olá!'); a.target = '_blank'; a.rel = 'noopener'; });

  // entrada do hero
  const hero = $('.hero');
  requestAnimationFrame(() => setTimeout(() => hero.classList.add('pronto'), 80));

  // header
  const header = $('.topo');
  const flut = $('.wa-flut');
  const agenda = $('#agenda');

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
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('.rev').forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => c.classList.contains('rev'));
    el.style.transitionDelay = Math.min(irmaos.indexOf(el), 5) * 70 + 'ms';
    io.observe(el);
  });

  // acordeão de cuidados
  $$('.item button').forEach((b) => b.addEventListener('click', () => {
    const li = b.parentElement, abre = !li.classList.contains('aberto');
    $$('.item.aberto').forEach((o) => { o.classList.remove('aberto'); $('button', o).setAttribute('aria-expanded', 'false'); });
    li.classList.toggle('aberto', abre); b.setAttribute('aria-expanded', String(abre));
  }));
  const primeiro = $('.item button'); if (primeiro) primeiro.click();

  // relógio: marcas + arco + contador
  const rel = $('.relogio'), g = $('.relogio__marcas', rel), ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2, gr = i % 5 === 0, r1 = gr ? 168 : 174, r2 = 182;
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', 200 + Math.cos(a) * r1); l.setAttribute('y1', 200 + Math.sin(a) * r1);
    l.setAttribute('x2', 200 + Math.cos(a) * r2); l.setAttribute('y2', 200 + Math.sin(a) * r2);
    if (gr) l.setAttribute('class', 'g'); g.appendChild(l);
  }
  const arco = $('.relogio__arco', rel), num = $('[data-min]', rel);
  new IntersectionObserver((ents, obs) => {
    if (!ents[0].isIntersecting) return; obs.disconnect();
    if (calmo) { arco.style.strokeDasharray = '45 60'; num.textContent = 45; return; }
    const t0 = performance.now(), dur = 2200;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4), v = 45 * e;
      arco.style.strokeDasharray = v + ' 60'; num.textContent = Math.round(v);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }, { threshold: .4 }).observe(rel);

  // scroll: header, parallax dos médicos, botão flutuante
  const pv = $('.duo__p--v'), pg = $('.duo__p--g');
  let agendaVisivel = true, tick = false;
  new IntersectionObserver((ents) => { agendaVisivel = ents[0].isIntersecting; flut.classList.toggle('some', agendaVisivel); }, { threshold: .1 }).observe(agenda);
  const noScroll = () => {
    tick = false;
    const y = scrollY;
    header.classList.toggle('sujo', y > 30);
    if (calmo) return;
    if (y < innerHeight * 1.2) {
      pv.style.setProperty('--py', (y * -0.06) + 'px');
      pg.style.setProperty('--py', (y * -0.12) + 'px');
    }
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(noScroll); } }, { passive: true });
  noScroll();

  // brilho que acompanha o cursor no cartão de agenda
  if (fino && !calmo) {
    agenda.addEventListener('pointermove', (e) => {
      const r = agenda.getBoundingClientRect();
      agenda.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      agenda.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    // botões magnéticos
    $$('.btn--p, .btn--wa').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12) + 'px,' + ((e.clientY - r.top - r.height / 2) * .2) + 'px)';
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

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
