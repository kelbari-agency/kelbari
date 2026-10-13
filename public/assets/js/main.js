/* Kelbari — page behaviour: menu, scroll-linked tree + process line, portfolio data, contact form. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SVG_NS = 'http://www.w3.org/2000/svg';

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
      nav.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 860px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  })();

  /* ---------- Scroll scheduler (one rAF for all scroll-linked bits) ---------- */
  const scrollTasks = [];
  let ticking = false;
  const runScroll = () => { ticking = false; scrollTasks.forEach((fn) => fn()); };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Services: hub with three branches, drawn as you scroll ---------- */
  (() => {
    const tree = $('[data-tree]');
    if (!tree) return;
    const svg = $('.tree-lines', tree);
    const hubDot = $('[data-hub-dot]', tree);
    const cards = $$('.pillar', tree);
    const wide = window.matchMedia('(min-width: 900px)');
    let paths = [], ends = [];
    const R = 16;

    function build() {
      const tr = tree.getBoundingClientRect();
      svg.setAttribute('width', tr.width);
      svg.setAttribute('height', tr.height);
      svg.setAttribute('viewBox', `0 0 ${tr.width} ${tr.height}`);
      svg.replaceChildren();
      paths = []; ends = [];
      const hr = hubDot.getBoundingClientRect();
      const hx = hr.left + hr.width / 2 - tr.left;
      const hy = hr.top + hr.height / 2 - tr.top;
      const y0 = hy + hr.height / 2 - 2;

      cards.forEach((card) => {
        const cr = card.getBoundingClientRect();
        let d, ex, ey;
        if (wide.matches) {
          ex = cr.left + cr.width / 2 - tr.left;
          ey = cr.top - tr.top;
          const bus = ey - 40;
          if (Math.abs(ex - hx) < 2) {
            d = `M${hx} ${y0} V${ey}`;
          } else {
            const s = ex > hx ? 1 : -1;
            d = `M${hx} ${y0} V${bus - R} Q${hx} ${bus} ${hx + s * R} ${bus} H${ex - s * R} Q${ex} ${bus} ${ex} ${bus + R} V${ey}`;
          }
        } else {
          ex = cr.left - tr.left;
          ey = cr.top - tr.top + 34;
          d = `M${hx} ${y0} V${ey - R} Q${hx} ${ey} ${hx + R} ${ey} H${ex}`;
        }
        const p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('class', 'branch');
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1 2';
        svg.appendChild(p);
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('class', 'end');
        c.setAttribute('cx', ex);
        c.setAttribute('cy', ey);
        c.setAttribute('r', '7');
        svg.appendChild(c);
        paths.push(p); ends.push(c);
      });
      update();
    }

    function update() {
      if (!paths.length) return;
      const r = tree.getBoundingClientRect();
      const vh = window.innerHeight;
      let p;
      if (reduceQuery.matches) p = 1;
      else if (wide.matches) p = clamp((vh * 0.88 - r.top) / (Math.min(r.height, vh * 0.9) * 0.8), 0, 1);
      else p = clamp((vh * 0.82 - r.top) / r.height, 0, 1);
      paths.forEach((path, i) => {
        const q = wide.matches ? clamp((p - 0.12 * i) / 0.64, 0, 1) : clamp((p - 0.06) * 1.25 - i * 0.18, 0, 1);
        path.style.strokeDashoffset = String(1 - q);
        const linked = q >= 0.999;
        ends[i].classList.toggle('is-linked', linked);
        cards[i].classList.toggle('is-linked', linked);
      });
    }

    scrollTasks.push(update);
    new ResizeObserver(build).observe(tree);
    wide.addEventListener('change', build);
    reduceQuery.addEventListener('change', update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    build();
  })();

  /* ---------- Process: a node travels the connected line ---------- */
  (() => {
    const wrap = $('[data-steps]');
    if (!wrap) return;
    const steps = $$('.step', wrap);
    const dots = steps.map((s) => $('.dot', s));
    const track = $('.rail-track', wrap);
    const fill = $('.rail-fill', wrap);
    const trav = $('.traveler', wrap);
    let pts = [], horizontal = true;

    function measure() {
      const wr = wrap.getBoundingClientRect();
      pts = dots.map((d) => {
        const r = d.getBoundingClientRect();
        return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top };
      });
      const a = pts[0], b = pts[pts.length - 1];
      horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      const w = 2;
      if (horizontal) {
        Object.assign(track.style, { left: a.x + 'px', top: a.y - w / 2 + 'px', width: b.x - a.x + 'px', height: w + 'px' });
        Object.assign(fill.style, { left: a.x + 'px', top: a.y - w / 2 + 'px', width: b.x - a.x + 'px', height: w + 'px' });
      } else {
        Object.assign(track.style, { left: a.x - w / 2 + 'px', top: a.y + 'px', width: w + 'px', height: b.y - a.y + 'px' });
        Object.assign(fill.style, { left: a.x - w / 2 + 'px', top: a.y + 'px', width: w + 'px', height: b.y - a.y + 'px' });
      }
      fill.dataset.orient = horizontal ? 'h' : 'v';
      update();
    }

    function update() {
      if (!pts.length) return;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      let p;
      if (reduceQuery.matches) p = 1;
      else if (horizontal) p = clamp((vh * 0.82 - r.top) / (vh * 0.5), 0, 1);
      else p = clamp((vh * 0.6 - r.top) / (r.height * 0.9), 0, 1);
      const a = pts[0], b = pts[pts.length - 1];
      const x = a.x + (b.x - a.x) * p, y = a.y + (b.y - a.y) * p;
      trav.style.transform = `translate(${x}px, ${y}px)`;
      fill.style.transform = horizontal ? `scaleX(${p})` : `scaleY(${p})`;
      steps.forEach((s, i) => s.classList.toggle('is-reached', p >= i / (steps.length - 1) - 0.001));
    }

    scrollTasks.push(update);
    new ResizeObserver(measure).observe(wrap);
    reduceQuery.addEventListener('change', update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
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
