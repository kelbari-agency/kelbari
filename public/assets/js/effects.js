/* Kelbari — motion and effects layer.
   - Headlines rise in word by word (hero on load, section titles on scroll).
   - A thin progress line tracks how far down the page you are.
   - Project cards stagger in, tilt toward a mouse pointer with a soft glare, and their covers drift.
   - Hero tiles and buttons get a pointer spotlight; the footer wordmark rises letter by letter.
   - Gallery images in the project viewer fade in as they load.
   Everything is off with prefers-reduced-motion. Pointer effects need a real mouse/trackpad. */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (reduce.matches) return;
  root.classList.add('fx');

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Split headlines into words ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.wi', el).forEach((w, k) => w.style.setProperty('--d', `${k * 0.055}s`));
  }

  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    splitWords(heroTitle); heroTitle.classList.add('fx-split');
    requestAnimationFrame(() => requestAnimationFrame(() => heroTitle.classList.add('is-in'))); // let the hidden state paint first
  }

  const titles = $$('main section h2[id]').filter((h) => !h.closest('.hero'));
  titles.forEach((h) => { splitWords(h); h.classList.add('fx-split'); });

  /* ---------- Footer wordmark letters ---------- */
  const word = document.querySelector('[data-letters]');
  if (word) {
    const txt = word.textContent;
    word.textContent = '';
    [...txt].forEach((ch, k) => {
      const s = document.createElement('span'); s.className = 'l'; s.textContent = ch;
      s.style.setProperty('--d', `${k * 0.06}s`); word.appendChild(s);
    });
  }

  /* ---------- One observer for everything that enters on scroll ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    : null;
  const watch = (el) => (io ? io.observe(el) : el.classList.add('is-in'));
  titles.forEach(watch);
  if (word) watch(word);

  /* ---------- Scroll progress line ---------- */
  const bar = document.createElement('div');
  bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  // Page height is measured only when it can change (resize, content growing), never on each scroll.
  let ticking = false, max = 1;
  const measure = () => { max = Math.max(1, root.scrollHeight - window.innerHeight); };
  const setProgress = () => {
    ticking = false;
    bar.style.transform = `scaleX(${clamp(window.scrollY / max, 0, 1)})`;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(setProgress); } }, { passive: true });
  window.addEventListener('resize', () => { measure(); setProgress(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); setProgress(); }).observe(document.body);
  else window.addEventListener('load', () => { measure(); setProgress(); });

  /* ---------- Pointer spotlight (stat tiles, buttons, filter chips) ---------- */
  function spotlight(el) {
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
  if (finePointer.matches) $$('.stat').forEach((el) => { el.classList.add('spot'); spotlight(el); });

  /* ---------- Project cards: stagger in, tilt, glare, cover drift ---------- */
  function setupCards() {
    const cards = $$('.projects .project');
    cards.forEach((card, i) => {
      if (card.dataset.fx) return;
      card.dataset.fx = '1';
      card.classList.add('fx-card');
      card.style.setProperty('--stagger', `${(i % 3) * 0.09}s`);
      watch(card);
      if (!finePointer.matches) return;
      const glare = document.createElement('span'); glare.className = 'glare'; glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
      let raf = 0, tx = 0, ty = 0;
      const apply = () => {
        raf = 0;
        card.style.setProperty('--rx', `${(-ty * 5).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(tx * 6).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${((tx + 1) * 50).toFixed(1)}%`);
        card.style.setProperty('--gy', `${((ty + 1) * 50).toFixed(1)}%`);
        card.style.setProperty('--px', `${(-tx * 10).toFixed(1)}px`);
        card.style.setProperty('--py', `${(-ty * 8).toFixed(1)}px`);
      };
      card.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        card.classList.add('is-tilt');
        if (!raf) raf = requestAnimationFrame(apply);
      });
      card.addEventListener('pointerleave', () => {
        tx = 0; ty = 0; card.classList.remove('is-tilt');
        if (!raf) raf = requestAnimationFrame(apply);
      });
    });
  }
  if (document.querySelector('.projects .project')) setupCards();
  document.addEventListener('kelbari:projects', setupCards);

  /* ---------- Viewer gallery images fade in as they arrive ---------- */
  const gallery = document.querySelector('[data-v-gallery]');
  if (gallery) {
    new MutationObserver(() => {
      $$('img:not([data-fx])', gallery).forEach((img) => {
        img.dataset.fx = '1';
        if (img.complete && img.naturalWidth) { img.classList.add('is-loaded'); return; }
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
      });
    }).observe(gallery, { childList: true });
  }

  // If the visitor switches reduced motion on mid-visit, show everything in its final state.
  reduce.addEventListener('change', () => { if (reduce.matches) root.classList.remove('fx'); });
})();
