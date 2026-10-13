/* Kelbari — page behaviour: menu, scroll-linked tree + process line, reveals, nav state, portfolio data, contact form. */
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

  /* The "draw line": a fixed height in the viewport. Scroll-linked lines grow
     until they reach it, so what is drawn always lines up with what you see. */
  const drawLine = () => window.innerHeight * (window.innerWidth < 900 ? 0.7 : 0.75);

  /* ---------- Services: hub with three branches, drawn as you scroll ---------- */
  (() => {
    const tree = $('[data-tree]');
    if (!tree) return;
    const svg = $('.tree-lines', tree);
    const hubDot = $('[data-hub-dot]', tree);
    const cards = $$('.pillar', tree);
    const wide = window.matchMedia('(min-width: 900px)');
    const R = 16;
    let geo = null;

    const mk = (tag, attrs) => {
      const n = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      svg.appendChild(n);
      return n;
    };

    function build() {
      const tr = tree.getBoundingClientRect();
      svg.setAttribute('width', tr.width);
      svg.setAttribute('height', tr.height);
      svg.setAttribute('viewBox', `0 0 ${tr.width} ${tr.height}`);
      svg.replaceChildren();
      const hr = hubDot.getBoundingClientRect();
      const hx = hr.left + hr.width / 2 - tr.left;
      const y0 = hr.top + hr.height - tr.top - 2;

      if (wide.matches) {
        // One trunk down from the hub, a bus, and a drop into each card.
        const ends = cards.map((c) => {
          const cr = c.getBoundingClientRect();
          return { x: cr.left + cr.width / 2 - tr.left, y: cr.top - tr.top };
        });
        const bus = ends[0].y - 40;
        const paths = ends.map((e) => {
          let d;
          if (Math.abs(e.x - hx) < 2) d = `M${hx} ${y0} V${e.y}`;
          else {
            const s = e.x > hx ? 1 : -1;
            d = `M${hx} ${y0} V${bus - R} Q${hx} ${bus} ${hx + s * R} ${bus} H${e.x - s * R} Q${e.x} ${bus} ${e.x} ${bus + R} V${e.y}`;
          }
          const p = mk('path', { class: 'branch', d, pathLength: '1' });
          p.style.strokeDasharray = '1 2';
          return p;
        });
        const nodes = ends.map((e) => mk('circle', { class: 'end', cx: e.x, cy: e.y, r: '7' }));
        geo = { mode: 'wide', y0, yEnd: ends[0].y, paths, nodes };
      } else {
        // One continuous spine down the left, with a short branch into each card.
        const rows = cards.map((c) => {
          const cr = c.getBoundingClientRect();
          return { y: cr.top - tr.top + 46, x: cr.left - tr.left };
        });
        const last = rows[rows.length - 1].y;
        const spine = mk('path', { class: 'branch', d: `M${hx} ${y0} V${last}`, pathLength: '1' });
        spine.style.strokeDasharray = '1 2';
        const stubs = rows.map((r) => {
          const p = mk('path', { class: 'branch', d: `M${hx} ${r.y} H${r.x}`, pathLength: '1' });
          p.style.strokeDasharray = '1 2';
          return p;
        });
        const nodes = rows.map((r) => mk('circle', { class: 'end', cx: hx, cy: r.y, r: '7' }));
        geo = { mode: 'narrow', y0, last, rows, spine, stubs, nodes };
      }
      update();
    }

    function setLinked(i, on) {
      geo.nodes[i].classList.toggle('is-linked', on);
      cards[i].classList.toggle('is-linked', on);
    }

    function update() {
      if (!geo) return;
      const reduce = reduceQuery.matches;
      const tip = drawLine() - tree.getBoundingClientRect().top; // draw line in tree coordinates
      if (geo.mode === 'wide') {
        const p = reduce ? 1 : clamp((tip - geo.y0) / (geo.yEnd - geo.y0), 0, 1);
        geo.paths.forEach((path, i) => {
          path.style.strokeDashoffset = String(1 - p);
          setLinked(i, p >= 0.999);
        });
      } else {
        const p = reduce ? 1 : clamp((tip - geo.y0) / (geo.last - geo.y0), 0, 1);
        geo.spine.style.strokeDashoffset = String(1 - p);
        geo.rows.forEach((r, i) => {
          const q = reduce ? 1 : clamp((tip - r.y) / 36, 0, 1);
          geo.stubs[i].style.strokeDashoffset = String(1 - q);
          setLinked(i, q >= 0.999);
        });
      }
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
      const box = horizontal
        ? { left: a.x + 'px', top: a.y - w / 2 + 'px', width: b.x - a.x + 'px', height: w + 'px' }
        : { left: a.x - w / 2 + 'px', top: a.y + 'px', width: w + 'px', height: b.y - a.y + 'px' };
      Object.assign(track.style, box);
      Object.assign(fill.style, box);
      fill.dataset.orient = horizontal ? 'h' : 'v';
      update();
    }

    function update() {
      if (!pts.length) return;
      const wr = wrap.getBoundingClientRect();
      const a = pts[0], b = pts[pts.length - 1];
      let p;
      if (reduceQuery.matches) p = 1;
      else if (horizontal) p = clamp((drawLine() - wr.top) / (window.innerHeight * 0.45), 0, 1);
      else p = clamp((drawLine() - wr.top - a.y) / (b.y - a.y), 0, 1);
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

  /* ---------- Header: shadow once scrolled, current section in the nav ---------- */
  (() => {
    const header = $('.site-header');
    if (header) {
      const set = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      scrollTasks.push(set); set();
    }
    const links = $$('[data-nav] a[href^="#"]:not(.btn)');
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
