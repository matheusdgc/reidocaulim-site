(() => {
  'use strict';

  const cfg = window.SITE_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  // Protótipo: 'auto' liga só em endereços *.vercel.app (ver config.js)
  const isDemo = () => cfg.modoDemonstracao === true
    || (cfg.modoDemonstracao === 'auto' && location.hostname.endsWith('.vercel.app'));
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- Dados de contato (config.js) ---------- */
  const caulimChoice = { cor: 'Branco', embalagem: 'Saca de 25 kg' };

  function waMessage(product) {
    if (product === 'Caulim') {
      return `Olá! Vim pelo site e gostaria de uma cotação de Caulim ${caulimChoice.cor}, ${caulimChoice.embalagem.toLowerCase()}.`;
    }
    if (product) return `Olá! Vim pelo site e gostaria de uma cotação de ${product}.`;
    return cfg.whatsappMensagem || '';
  }

  function updateWhatsLinks() {
    if (!cfg.whatsapp) return;
    $$('[data-wa]').forEach((a) => {
      const number = a.dataset.waNumber || cfg.whatsapp;
      a.href = `https://wa.me/${number}?text=${encodeURIComponent(waMessage(a.dataset.waProduct))}`;
    });
  }

  function applyConfig() {
    updateWhatsLinks();
    if (cfg.email) {
      $$('[data-email]').forEach((a) => { a.href = `mailto:${cfg.email}`; a.textContent = cfg.email; });
    }
    if (cfg.cidade) $$('[data-city]').forEach((el) => { el.textContent = cfg.cidade; });
    if (cfg.cnpj) $$('[data-cnpj]').forEach((el) => { el.textContent = cfg.cnpj; });
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Cabeçalho ---------- */
  const header = $('[data-header]');
  const navToggle = $('[data-nav-toggle]');
  const navList = $('[data-nav-list]');

  function setMenu(open) {
    if (!navToggle || !navList) return;
    navToggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', navToggle).textContent = open ? 'Fechar menu' : 'Abrir menu';
    navList.classList.toggle('is-open', open);
    if (open) header.classList.remove('is-hidden');
  }

  function initHeader() {
    if (!header) return;
    let lastY = scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const menuOpen = navList && navList.classList.contains('is-open');
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (!menuOpen && goingDown && y > 480) header.classList.add('is-hidden');
      else if (goingUp || y < 480) header.classList.remove('is-hidden');
      if (goingDown || goingUp) lastY = y;
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // Mostra o cabeçalho quando algo dentro dele recebe foco pelo teclado
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    if (navToggle && navList) {
      navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
      navList.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
      });
      document.addEventListener('click', (e) => {
        if (navList.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
      });
    }

    // Link ativo conforme a seção visível
    const links = new Map();
    $$('.nav-list a[href^="#"]:not(.btn)').forEach((a) => links.set(a.getAttribute('href').slice(1), a));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = links.get(entry.target.id);
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    // A abertura não tem link no menu: ao voltar para ela, nenhum item fica ativo
    ['inicio', ...links.keys()].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Abertura ---------- */
  function initHero() {
    const hero = $('[data-hero]');
    if (!hero) return;
    // O Chrome não cria transição para elementos que ainda não foram pintados: se a classe
    // entrar antes do primeiro quadro, a abertura pula direto para o estado final.
    // Por isso a entrada espera a fonte (ou 800 ms), a aba visível e dois quadros pintados.
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      hero.classList.add('is-in');
    };
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(start));
    const whenVisible = () => {
      if (!document.hidden) { afterPaint(); return; }
      document.addEventListener('visibilitychange', function onVisible() {
        if (document.hidden) return;
        document.removeEventListener('visibilitychange', onVisible);
        afterPaint();
      });
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 800))]).then(whenVisible);
  }

  /* ---------- Revelações ao rolar ---------- */
  function initReveals() {
    const targets = $$('[data-reveal], [data-mask], [data-arc]');
    if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
    const stagger = parseFloat(cssVar('--stagger')) || 70;
    // Um elemento todo recortado por clip-path conta como invisível para o observer,
    // então as máscaras são observadas pelo elemento pai.
    const watched = new Map();
    targets.forEach((el) => {
      const key = el.matches('[data-mask]') ? el.parentElement : el;
      if (!watched.has(key)) watched.set(key, []);
      watched.get(key).push(el);
    });
    let order = 0;
    const io = new IntersectionObserver((entries) => {
      order = 0;
      entries.filter((e) => e.isIntersecting).forEach((entry) => {
        (watched.get(entry.target) || []).forEach((el) => {
          el.style.setProperty('--delay', `${order++ * stagger}ms`);
          el.classList.add('is-in');
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    watched.forEach((_, key) => io.observe(key));
  }

  /* ---------- Pó mineral na abertura ---------- */
  function initDust() {
    const canvas = $('[data-dust]');
    const hero = $('[data-hero]');
    if (!canvas || !hero || reducedQuery.matches) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(140, Math.round((width * height) / 9000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        a: Math.random() * 0.5 + 0.25
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) { p.y = height + 6; p.x = Math.random() * width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 188, 180, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const play = () => { if (!raf && visible && !document.hidden && !reducedQuery.matches) raf = requestAnimationFrame(frame); };
    const pause = () => { cancelAnimationFrame(raf); raf = 0; };

    resize();
    let resizeTimer;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? play() : pause(); }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    reducedQuery.addEventListener('change', () => { if (reducedQuery.matches) { pause(); ctx.clearRect(0, 0, width, height); } else play(); });
    play();
  }

  /* ---------- Inclinação 3D nas fotos de produto ---------- */
  function initTilt() {
    const max = parseFloat(cssVar('--tilt-max')) || 4;
    $$('[data-tilt]').forEach((box) => {
      const target = $('.tilt-target', box);
      if (!target) return;
      let raf = 0;
      box.addEventListener('pointermove', (e) => {
        if (!finePointer.matches || reducedQuery.matches || e.pointerType !== 'mouse') return;
        const r = box.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          target.style.transform = `rotateY(${(x * 2 * max).toFixed(2)}deg) rotateX(${(-y * 2 * max).toFixed(2)}deg) scale(1.03)`;
        });
      });
      box.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); target.style.transform = ''; });
    });
  }

  /* ---------- Variações do caulim ---------- */
  function initVariants() {
    const form = $('[data-variants]');
    if (!form) return;
    const media = $('#caulim .product-media');
    const ripple = $('[data-ripple]');
    const powder = $('[data-powder]');
    const powderLabel = $('[data-powder-label]');
    const summary = $('[data-variant-summary] strong');

    const colorOf = (input) => cssVar(input.dataset.swatch);
    const initial = $('input[name="cor"]:checked', form);
    if (initial && media) media.style.backgroundColor = colorOf(initial);
    if (initial && powder) powder.style.setProperty('--powder', colorOf(initial));

    const spread = (input) => {
      if (!media || !ripple) return;
      const color = colorOf(input);
      const m = media.getBoundingClientRect();
      const chip = input.closest('.chip').getBoundingClientRect();
      const fromChip = chip.left + chip.width / 2 - m.left;
      ripple.style.setProperty('--rx', `${Math.max(0, Math.min(m.width, fromChip))}px`);
      ripple.style.setProperty('--ry', `${m.height}px`);
      ripple.style.setProperty('--ripple-color', color);
      ripple.classList.remove('is-on');
      void ripple.offsetWidth;
      ripple.classList.add('is-on');
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        media.style.backgroundColor = color;
        ripple.classList.remove('is-on');
      };
      ripple.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, (parseFloat(cssVar('--t-ripple')) || 600) + 100);
    };

    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('change', (e) => {
      const input = e.target;
      if (input.name === 'cor') {
        caulimChoice.cor = input.value;
        if (powder) powder.style.setProperty('--powder', colorOf(input));
        if (powderLabel) powderLabel.textContent = `Cor: ${input.value}`;
        spread(input);
      }
      if (input.name === 'embalagem') caulimChoice.embalagem = input.value;
      if (summary) summary.textContent = `Caulim ${caulimChoice.cor}, ${caulimChoice.embalagem.toLowerCase()}`;
      updateWhatsLinks();
    });
  }

  /* ---------- Botões "Solicitar cotação" dos produtos ---------- */
  let lastPrefill = '';
  function initQuoteLinks() {
    const select = $('[data-product-select]');
    const message = $('[data-message]');
    // Delegado: os cards do catálogo são recriados quando a lista atualizada chega
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-quote], [data-quote-item]');
      if (!a) return;
      const product = a.dataset.quote || a.dataset.quoteItem;
      if (select) select.value = product === 'Caulim' ? 'Caulim' : 'ACM Argamassas';
      if (message && (message.value.trim() === '' || message.value === lastPrefill)) {
        lastPrefill = product === 'Caulim'
          ? `Gostaria de uma cotação de Caulim ${caulimChoice.cor}, ${caulimChoice.embalagem.toLowerCase()}. Volume aproximado: `
          : `Gostaria de uma cotação de ${product}. Quantidade aproximada: `;
        message.value = lastPrefill;
      }
      setTimeout(() => { const nome = $('#f-nome'); if (nome) nome.focus({ preventScroll: true }); }, reducedQuery.matches ? 0 : 700);
    });
  }

  /* ---------- Catálogo ACM Argamassas ----------
     O HTML já traz uma cópia da lista (gerada por scripts/gerar_catalogo.py).
     A cada visita o site busca a lista atual na API pública do fabricante e, se a
     busca der certo, troca a cópia pela versão atual. Se falhar, a cópia fica. */
  const CATALOGO_ORIGEM = 'https://alvaxaditivos.com.br';
  const CATALOGO_API = `${CATALOGO_ORIGEM}/wp-json/wp/v2/product?per_page=100&_embed=wp:featuredmedia,wp:term`;

  const plainText = (htmlText) => new DOMParser().parseFromString(htmlText || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
  const slugify = (text) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function toCatalogItem(p) {
    const emb = p._embedded || {};
    const media = (emb['wp:featuredmedia'] || [])[0] || {};
    const sizes = (media.media_details && media.media_details.sizes) || {};
    const pic = sizes.medium || { source_url: media.source_url, width: 300, height: 300 };
    const terms = (emb['wp:term'] || []).flat().filter((t) => t && t.taxonomy === 'product_cat');
    let imagem = '';
    try { if (pic.source_url && new URL(pic.source_url).origin === CATALOGO_ORIGEM) imagem = pic.source_url; } catch (_) { /* URL inválida */ }
    return {
      nome: plainText(p.title && p.title.rendered),
      categoria: terms.length ? plainText(terms[0].name) : 'Outros',
      resumo: plainText(p.excerpt && p.excerpt.rendered),
      imagem,
      imagemW: pic.width || 300,
      imagemH: pic.height || 300
    };
  }

  function renderCatalog(items, grid, filtersBox) {
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    const counts = new Map();
    items.forEach((it) => counts.set(it.categoria, (counts.get(it.categoria) || 0) + 1));

    const current = ($('.filter[aria-pressed="true"]', filtersBox) || {}).dataset;
    const keep = current && (current.filter === 'todos' || [...counts.keys()].some((c) => slugify(c) === current.filter)) ? current.filter : 'todos';

    const buttons = [['todos', 'Todos', items.length], ...[...counts].map(([c, n]) => [slugify(c), c, n])].map(([key, label, n]) => {
      const b = el('button', 'filter', `${label} `);
      b.type = 'button';
      b.dataset.filter = key;
      b.setAttribute('aria-pressed', String(key === keep));
      b.appendChild(el('span', null, String(n)));
      return b;
    });
    filtersBox.replaceChildren(...buttons);

    grid.replaceChildren(...items.map((it) => {
      const li = el('li', 'catalog-item');
      li.dataset.categoria = slugify(it.categoria);
      li.hidden = keep !== 'todos' && li.dataset.categoria !== keep;
      const art = el('article', 'catalog-card');
      const figure = el('div', 'catalog-img');
      if (it.imagem) {
        const img = el('img');
        img.src = it.imagem; img.width = it.imagemW; img.height = it.imagemH; img.loading = 'lazy';
        img.alt = `Embalagem do ${it.nome}`;
        figure.appendChild(img);
      }
      const body = el('div', 'catalog-body');
      const btn = el('a', 'btn btn-secondary btn-sm', 'Solicitar cotação');
      btn.href = '#contato';
      btn.dataset.quoteItem = it.nome;
      body.append(el('span', 'catalog-cat', it.categoria), el('h4', 'catalog-name', it.nome), el('p', 'catalog-desc', it.resumo), btn);
      art.append(figure, body);
      li.appendChild(art);
      return li;
    }));
  }

  function initCatalog() {
    const grid = $('[data-catalog-grid]');
    const filtersBox = $('[data-catalog-filters]');
    if (!grid || !filtersBox) return;

    filtersBox.addEventListener('click', (e) => {
      const b = e.target.closest('.filter');
      if (!b) return;
      $$('.filter', filtersBox).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.catalog-item', grid).forEach((li) => { li.hidden = b.dataset.filter !== 'todos' && li.dataset.categoria !== b.dataset.filter; });
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(CATALOGO_API, { signal: controller.signal, credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        const items = Array.isArray(data) ? data.map(toCatalogItem).filter((it) => it.nome) : [];
        if (items.length) renderCatalog(items, grid, filtersBox);
      })
      .catch(() => { /* mantém a cópia que veio no HTML */ })
      .finally(() => clearTimeout(timer));
  }

  /* ---------- Formulário de contato ---------- */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-form-status]');
    const submit = $('[data-submit]');
    const timeField = $('[data-form-time]');
    if (timeField) timeField.value = String(Math.floor(Date.now() / 1000));

    const rules = {
      nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
      empresa: (v) => (v.trim().length >= 2 ? '' : 'Informe o nome da empresa.'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido.'),
      telefone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Informe telefone ou WhatsApp com DDD.'),
      mensagem: (v) => (v.trim().length >= 10 ? '' : 'Escreva uma mensagem com pelo menos 10 caracteres.'),
      lgpd: (_, el) => (el.checked ? '' : 'É preciso concordar para enviarmos o retorno.')
    };

    const showError = (name, msg) => {
      const field = form.elements[name];
      const slot = $(`[data-error-for="${name}"]`, form);
      if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (slot) slot.textContent = msg;
    };
    const validate = (name) => {
      const el = form.elements[name];
      const msg = rules[name](el.value, el);
      showError(name, msg);
      return msg;
    };

    Object.keys(rules).forEach((name) => {
      const el = form.elements[name];
      el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') validate(name); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(name); });
      el.addEventListener('change', () => { if (el.getAttribute('aria-invalid') === 'true') validate(name); });
    });

    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.classList.toggle('is-success', type === 'success');
      status.classList.toggle('is-error', type === 'error');
    };
    const setLoading = (on) => {
      submit.disabled = on;
      submit.classList.toggle('is-loading', on);
      $('.btn-label', submit).textContent = on ? 'Enviando...' : 'Enviar mensagem';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', '');
      const invalid = Object.keys(rules).filter((name) => validate(name));
      if (invalid.length) { form.elements[invalid[0]].focus(); return; }

      setLoading(true);
      if (isDemo()) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        form.reset();
        lastPrefill = '';
        setLoading(false);
        setStatus('Protótipo: o formulário está funcionando, e o envio por e-mail será ativado na hospedagem final.', 'success');
        return;
      }
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        let data = {};
        try { data = await res.json(); } catch (_) { /* resposta não JSON */ }
        if (res.ok && data.ok) {
          form.reset();
          lastPrefill = '';
          if (timeField) timeField.value = String(Math.floor(Date.now() / 1000));
          setStatus(data.message || 'Mensagem enviada. Em breve entraremos em contato.', 'success');
        } else {
          if (data.errors) Object.entries(data.errors).forEach(([name, msg]) => showError(name, msg));
          setStatus(data.message || 'Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.', 'error');
        }
      } catch (_) {
        setStatus('Sem conexão com o servidor. Tente de novo ou chame no WhatsApp.', 'error');
      } finally {
        setLoading(false);
      }
    });

    // Retorno do envio sem JavaScript (enviar.php redireciona com ?enviado=1 ou ?erro=1)
    const params = new URLSearchParams(location.search);
    if (params.has('enviado')) setStatus('Mensagem enviada. Em breve entraremos em contato.', 'success');
    if (params.has('erro')) setStatus('Não foi possível enviar. Confira os campos e tente de novo.', 'error');
  }

  /* ---------- Selo de protótipo ---------- */
  function initDemoBadge() {
    if (!isDemo()) return;
    const badge = document.createElement('p');
    badge.className = 'proto-badge';
    badge.setAttribute('role', 'note');
    badge.textContent = 'Protótipo para aprovação';
    document.body.appendChild(badge);
  }

  applyConfig();
  initDemoBadge();
  initHeader();
  initHero();
  initReveals();
  initDust();
  initTilt();
  initVariants();
  initQuoteLinks();
  initCatalog();
  initForm();
})();
