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

  /* ---------- Selected work ----------
     The build step renders the cards into the HTML (crawlable, no layout shift) and embeds the
     project data as JSON. Without the build (plain local preview) this reads /data/projects.json
     and renders the cards itself. Gallery projects open in an on-page viewer at /work/<slug>/;
     the same address is a full standalone page for search engines and direct visits. */
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
    const ARROW_OUT = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11L11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const slugOf = (p) => (/^[a-z0-9-]+$/.test(p.slug || '') ? p.slug : '');
    const galleryOf = (p) => (p.gallery || []).filter((g) => g && g.image && safeUrl(g.image));

    function buildCard(p) {
      const card = el('article', 'project');
      const src = p.image ? safeUrl(p.image) : '';
      const body = el('div', 'pbody');
      if (p.category) body.appendChild(el('p', 'cat', p.category));
      body.appendChild(el('h3', '', p.title));
      const meta = [p.client && p.client !== p.title ? p.client : '', p.location].filter(Boolean).join(' · ');
      if (meta) body.appendChild(el('p', 'pmeta', meta));
      if (p.description) body.appendChild(el('p', '', p.description));
      const highlights = (p.highlights || []).filter(Boolean);
      if (highlights.length) {
        const ul = el('ul', 'phigh');
        highlights.forEach((h) => ul.appendChild(el('li', '', typeof h === 'string' ? h : h.item)));
        body.appendChild(ul);
      }
      const stack = (p.built_with || []).filter(Boolean);
      if (stack.length) {
        const wrap = el('div', 'pstack');
        wrap.appendChild(el('span', 'pstack-label', 'Built with'));
        stack.forEach((t) => wrap.appendChild(el('span', 'ptag', typeof t === 'string' ? t : t.tool)));
        body.appendChild(wrap);
      }
      const slug = slugOf(p), href = p.link ? safeUrl(p.link) : '';
      // One real link (the button). Its ::after stretches over the card, so the whole card is clickable.
      if (galleryOf(p).length && slug) {
        const a = el('a', 'btn btn-cobalt pbtn');
        a.href = `/work/${slug}/`;
        a.setAttribute('aria-label', `View project: ${p.title}`);
        a.append(el('span', '', 'View project'));
        a.insertAdjacentHTML('beforeend', ARROW);
        body.appendChild(a); card.classList.add('is-link');
      } else if (href) {
        const a = el('a', 'btn btn-cobalt pbtn');
        a.href = href; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('aria-label', `View site: ${p.title} (opens in a new tab)`);
        a.append(el('span', '', 'View site'));
        a.insertAdjacentHTML('beforeend', ARROW_OUT);
        body.appendChild(a); card.classList.add('is-link');
      }
      card.dataset.cat = p.category || '';
      if (src) {
        const thumb = el('div', 'thumb');
        const img = el('img');
        img.src = src; img.alt = `${p.title} project`; img.loading = 'lazy'; img.decoding = 'async';
        img.width = 1600; img.height = 1000;
        if (p.image_srcset) { img.srcset = p.image_srcset; img.sizes = '(max-width: 760px) calc(100vw - 52px), (max-width: 1180px) 45vw, 380px'; }
        thumb.appendChild(img); card.appendChild(thumb);
      }
      card.appendChild(body);
      return card;
    }

    function setupFilters(items) {
      const filters = $('[data-filters]');
      const cats = [...new Set(items.map((p) => p.category).filter(Boolean))];
      if (!filters || cats.length < 2) return;
      const cards = [...grid.children];
      const chips = ['All', ...cats].map((c) => {
        const b = el('button', 'filter', c);
        b.type = 'button';
        const n = c === 'All' ? cards.length : cards.filter((k) => k.dataset.cat === c).length;
        b.append(el('span', 'count', String(n)));
        b.setAttribute('aria-pressed', String(c === 'All'));
        b.addEventListener('click', () => {
          const apply = () => {
            chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            cards.forEach((k) => { k.hidden = !(c === 'All' || k.dataset.cat === c); });
          };
          // Cards glide to their new places where the browser supports view transitions
          if (document.startViewTransition && !reduceQuery.matches) {
            cards.forEach((k, i) => { k.style.viewTransitionName = `p${i}`; });
            const vt = document.startViewTransition(apply);
            vt.finished.finally(() => cards.forEach((k) => { k.style.viewTransitionName = ''; }));
          } else apply();
        });
        filters.appendChild(b);
        return b;
      });
      filters.hidden = false;
    }

    /* Project viewer: the full gallery in a dialog, at /work/<slug>/ in the address bar. */
    function setupViewer(list) {
      const dlg = $('[data-viewer]');
      if (!dlg || !list.length || typeof dlg.showModal !== 'function') return;
      const q = (s) => dlg.querySelector(s);
      const bySlug = new Map(list.map((p) => [p.slug, p]));
      const home = location.pathname;
      let current = null, pushed = false, silent = false;

      function fill(p) {
        q('[data-v-cat]').textContent = p.category || '';
        q('[data-v-title]').textContent = p.title;
        q('[data-v-h]').textContent = p.title;
        q('[data-v-desc]').textContent = p.description || '';
        const high = q('[data-v-high]'); high.replaceChildren();
        (p.highlights || []).filter(Boolean).forEach((h) => high.appendChild(el('li', '', typeof h === 'string' ? h : h.item)));
        high.hidden = !high.children.length;
        const stack = q('[data-v-stack]'); stack.replaceChildren();
        const tools = (p.built_with || []).filter(Boolean);
        if (tools.length) {
          stack.appendChild(el('span', 'pstack-label', 'Built with'));
          tools.forEach((t) => stack.appendChild(el('span', 'ptag', typeof t === 'string' ? t : t.tool)));
        }
        stack.hidden = !tools.length;
        const gal = q('[data-v-gallery]'); gal.replaceChildren();
        p.gallery.forEach((g, i) => {
          const img = el('img');
          img.src = safeUrl(g.image);
          if (g.srcset) { img.srcset = g.srcset; img.sizes = '(max-width: 1180px) 100vw, 1116px'; }
          if (g.width && g.height) { img.width = g.width; img.height = g.height; }
          img.alt = i === 0 ? `${p.title}: project showcase` : '';
          img.loading = i < 2 ? 'eager' : 'lazy';
          img.decoding = 'async';
          gal.appendChild(img);
        });
        const next = list[(list.indexOf(p) + 1) % list.length];
        const nx = q('[data-v-next]');
        nx.href = `/work/${next.slug}/`;
        nx.replaceChildren(el('span', '', `Next: ${next.title}`));
        nx.insertAdjacentHTML('beforeend', ARROW);
        q('[data-v-scroll]').scrollTop = 0;
      }

      function open(p) {
        current = p; fill(p);
        document.title = `${p.title} — Kelbari`;
        if (!dlg.open) {
          dlg.showModal();
          document.documentElement.classList.add('viewer-open');
        }
        q('[data-v-close]').focus({ preventScroll: true });
      }
      const baseTitle = document.title;
      dlg.addEventListener('close', () => {
        document.documentElement.classList.remove('viewer-open');
        document.title = baseTitle;
        const was = current; current = null;
        if (!silent) {
          if (pushed) { pushed = false; history.back(); }
          else history.replaceState(null, '', `${home}#work`);
        }
        silent = false;
        if (was) { // return focus to the card the visitor came from
          const a = document.querySelector(`.project a[href="/work/${was.slug}/"]`);
          if (a) setTimeout(() => a.focus({ preventScroll: true }), 60);
        }
      });
      q('[data-v-close]').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop
      q('[data-v-contact]').addEventListener('click', (e) => {
        e.preventDefault(); dlg.close();
        setTimeout(() => {
          const c = document.getElementById('contact');
          if (c) c.scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth' });
        }, 80);
      });
      q('[data-v-next]').addEventListener('click', (e) => {
        const m = e.currentTarget.getAttribute('href').match(/^\/work\/([a-z0-9-]+)\/$/);
        const p = m && bySlug.get(m[1]);
        if (!p) return;
        e.preventDefault();
        history.replaceState({ kviewer: p.slug }, '', `/work/${p.slug}/`);
        open(p);
      });

      // Open from the cards (plain left click only; modified clicks open the real page)
      grid.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a[href^="/work/"]');
        const m = a && a.getAttribute('href').match(/^\/work\/([a-z0-9-]+)\/$/);
        const p = m && bySlug.get(m[1]);
        if (!p) return;
        e.preventDefault();
        history.pushState({ kviewer: p.slug }, '', `/work/${p.slug}/`);
        pushed = true;
        open(p);
      });
      window.addEventListener('popstate', (e) => {
        const p = e.state && e.state.kviewer && bySlug.get(e.state.kviewer);
        if (p) { pushed = false; open(p); }
        else if (dlg.open) { pushed = false; silent = true; dlg.close(); }
      });
      // Old-style links (#work/<slug>) still open the project
      const legacy = location.hash.match(/^#work\/([a-z0-9-]+)$/);
      if (legacy && bySlug.get(legacy[1])) {
        history.replaceState({ kviewer: legacy[1] }, '', `/work/${legacy[1]}/`);
        open(bySlug.get(legacy[1]));
      }
    }

    function start(data) {
      const list = (Array.isArray(data) ? data : data && data.projects) || [];
      const items = list.filter((p) => p && p.title);
      if (!items.length) return;
      if (!grid.querySelector('[data-prerendered]')) items.forEach((p) => grid.appendChild(buildCard(p)));
      setupFilters(items);
      grid.hidden = false;
      empty.hidden = true;
      setupViewer(items.filter((p) => slugOf(p) && galleryOf(p).length).map((p) => ({ ...p, slug: slugOf(p), gallery: galleryOf(p) })));
      document.dispatchEvent(new CustomEvent('kelbari:projects'));
    }

    const inline = document.getElementById('projects-data');
    if (inline) {
      try { start(JSON.parse(inline.textContent)); return; } catch (_) { /* fall back to fetching */ }
    }
    fetch('/data/projects.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no data'))))
      .then(start)
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
