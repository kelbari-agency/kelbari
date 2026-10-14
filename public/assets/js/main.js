/* Kelbari — page behaviour: menu, services spine, stacking process cards, reveals, header and nav state, portfolio data, contact form. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  /* ---------- Year ---------- */
  const yr = $('[data-year]');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- Mobile menu ---------- */
  (() => {
    const btn = $('[data-menu-btn]');
    const nav = $('[data-nav]');
    if (!btn || !nav) return;
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  })();

  /* ---------- Scroll scheduler (one rAF for all scroll-linked bits) ---------- */
  const scrollTasks = [];
  let ticking = false;
  const runScroll = () => { ticking = false; scrollTasks.forEach((fn) => fn()); };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* The "draw line": a fixed height in the viewport. Scroll-linked pieces fill
     up to it, so what is drawn always lines up with what you see. */
  const drawLine = () => window.innerHeight * (window.innerWidth < 900 ? 0.7 : 0.72);

  /* ---------- Services: the spine fills and each pillar connects as it is reached ---------- */
  (() => {
    const wrap = $('[data-pillars]');
    if (!wrap) return;
    const spine = $('.spine', wrap);
    const fill = $('.spine-fill', spine);
    const pillars = $$('.pillar', wrap);
    const nodes = pillars.map((p) => $('.p-node', p));

    function update() {
      const sr = spine.getBoundingClientRect();
      const tip = drawLine();
      const p = reduceQuery.matches ? 1 : clamp((tip - sr.top) / sr.height, 0, 1);
      fill.style.transform = `scaleY(${p})`;
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        pillars[i].classList.toggle('is-linked', reduceQuery.matches || r.top + r.height / 2 <= tip);
      });
    }
    scrollTasks.push(update);
    window.addEventListener('resize', update);
    reduceQuery.addEventListener('change', update);
    update();
  })();

  /* ---------- Process: cards stack; the one underneath settles back as the next arrives ---------- */
  (() => {
    const cards = $$('.stack .card');
    if (cards.length < 2) return;
    function update() {
      if (reduceQuery.matches) { cards.forEach((c) => { c.style.transform = ''; c.style.filter = ''; }); return; }
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const a = card.getBoundingClientRect(), b = next.getBoundingClientRect();
        const covered = clamp((a.bottom - b.top) / a.height, 0, 1);
        card.style.transform = covered > 0 ? `scale(${(1 - covered * 0.06).toFixed(4)})` : '';
        card.style.filter = covered > 0 ? `brightness(${(1 - covered * 0.18).toFixed(3)})` : '';
      });
    }
    scrollTasks.push(update);
    window.addEventListener('resize', update);
    reduceQuery.addEventListener('change', update);
    update();
  })();

  /* ---------- Reveal on scroll ---------- */
  (() => {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduceQuery.matches || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  })();

  /* ---------- Hero numbers count up once ---------- */
  (() => {
    const facts = $('[data-facts]');
    if (!facts || reduceQuery.matches || !('IntersectionObserver' in window)) return;
    const nums = $$('[data-count]', facts);
    nums.forEach((n) => { n.textContent = '0' + (n.dataset.suffix || ''); });
    const run = () => {
      const t0 = performance.now(), dur = 1100;
      const tick = (now) => {
        const t = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 3);
        nums.forEach((n) => { n.textContent = Math.round(Number(n.dataset.count) * e) + (n.dataset.suffix || ''); });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); setTimeout(run, 250); } }, { threshold: 0.4 });
    io.observe(facts);
  })();

  /* ---------- Header: glass firms up once scrolled, tucks away on the way down, returns on the way up ---------- */
  (() => {
    const header = $('[data-header]');
    if (header) {
      let lastY = window.scrollY;
      const set = () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 8);
        const menuOpen = document.documentElement.classList.contains('menu-open');
        const focusInside = header.contains(document.activeElement);
        if (!menuOpen && !focusInside && y > 320 && y > lastY + 4) header.classList.add('is-hidden');
        else if (y < lastY - 4 || y <= 320 || menuOpen || focusInside) header.classList.remove('is-hidden');
        lastY = y;
      };
      scrollTasks.push(set); set();
      header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    }
    const links = $$('[data-nav] > a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = byId.get(en.target.id);
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...byId.keys()].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ---------- Selected work: reads /data/projects.json ---------- */
  (() => {
    const grid = $('[data-projects]');
    const empty = $('[data-empty]');
    if (!grid || !empty) return;

    const safeUrl = (value) => {
      try {
        const u = new URL(value, location.origin);
        return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
      } catch (_) { return ''; }
    };
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };

    fetch('/data/projects.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no data'))))
      .then((data) => {
        const list = (Array.isArray(data) ? data : data && data.projects) || [];
        const items = list.filter((p) => p && p.title);
        if (!items.length) return;
        items.forEach((p) => {
          const card = el('article', 'project');
          const thumb = el('div', 'thumb');
          const src = p.image ? safeUrl(p.image) : '';
          if (src) {
            const img = el('img');
            img.src = src; img.alt = p.title; img.loading = 'lazy';
            thumb.appendChild(img);
          }
          const body = el('div', 'pbody');
          if (p.category) body.appendChild(el('p', 'cat', p.category));
          body.appendChild(el('h3', '', p.title));
          if (p.description) body.appendChild(el('p', '', p.description));
          const href = p.link ? safeUrl(p.link) : '';
          if (href) {
            const a = el('a', 'more', 'View project');
            a.href = href; a.target = '_blank'; a.rel = 'noopener';
            a.setAttribute('aria-label', `View project: ${p.title}`);
            body.appendChild(a);
          }
          if (src) card.appendChild(thumb);
          card.appendChild(body);
          grid.appendChild(card);
        });
        grid.hidden = false;
        empty.hidden = true;
      })
      .catch(() => { /* keep the "coming soon" state */ });
  })();

  /* ---------- Contact form: open WhatsApp or the mail app with the brief pre-filled ---------- */
  (() => {
    const form = $('[data-brief-form]');
    if (!form) return;
    const WA = '923019233246';
    const MAIL = 'kelbariofficial@gmail.com';
    const status = $('[data-form-status]', form);
    const f = {
      name: $('#f-name', form), company: $('#f-company', form),
      service: $('#f-service', form), brief: $('#f-brief', form),
    };

    const flag = (input, bad) => { if (bad) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); return bad; };
    const check = () => {
      const badName = flag(f.name, !f.name.value.trim());
      const badBrief = flag(f.brief, !f.brief.value.trim());
      if (badName) { f.name.focus(); return false; }
      if (badBrief) { f.brief.focus(); return false; }
      return true;
    };
    Object.values(f).forEach((input) => input.addEventListener('input', () => input.removeAttribute('aria-invalid')));

    const details = () => {
      const lines = ['Name: ' + f.name.value.trim()];
      if (f.company.value.trim()) lines.push('Company: ' + f.company.value.trim());
      lines.push('Service: ' + f.service.value, '', 'Brief:', f.brief.value.trim());
      return lines;
    };

    form.addEventListener('submit', (e) => e.preventDefault());

    $('[data-send-wa]', form).addEventListener('click', () => {
      status.textContent = '';
      if (!check()) return;
      const text = ['Hi Kelbari,', ''].concat(details()).join('\n');
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });

    $('[data-send-email]', form).addEventListener('click', () => {
      if (!check()) return;
      const who = f.company.value.trim() || f.name.value.trim();
      const subject = `Project brief: ${f.service.value} — ${who}`;
      const body = ['Hi Kelbari,', ''].concat(details()).join('\r\n');
      window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // If no mail app is set up, nothing visible happens, so leave a fallback.
      status.textContent = '';
      const note = document.createElement('span');
      note.append('Your mail app should open with the brief filled in. If it didn’t, email ');
      const a = document.createElement('a');
      a.href = `mailto:${MAIL}`; a.textContent = MAIL;
      note.append(a, ' directly.');
      status.append(note);
    });
  })();
})();
