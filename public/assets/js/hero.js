/* Kelbari hero — the Node K mark grows into a live, quiet network.
   - Seeds sit on the mark's own nodes (64-unit grid), so the network visibly grows out of it.
   - Nodes drift slowly; the pointer (mouse or touch) gently pulls nearby nodes and links to them.
   - Pauses when the hero is off screen or the tab is hidden.
   - prefers-reduced-motion: draws one static frame, no drift, no pointer response. */
(() => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const canvas = hero.querySelector('canvas');
  const mark = hero.querySelector('[data-hero-mark] svg');
  if (!canvas || !mark || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Brand colours as rgb triplets (alpha is applied per draw).
  const AQUA = '52,211,180';
  const MINT = '227,247,242';
  const MIST = '169,180,177';

  // Mark geometry on its 64-unit grid.
  const SEEDS = [
    { x: 48, y: 12, w: 3 }, // aqua nodes: "the work going out"
    { x: 48, y: 52, w: 3 },
    { x: 14, y: 12, w: 1 },
    { x: 14, y: 52, w: 1 },
  ];
  const BBOX = { l: 8, r: 54, t: 6, b: 58 }; // symbol extents on the grid
  const CLEAR = 12; // clear space = one node diameter = 12 grid units

  let W = 0, H = 0, dpr = 1;
  let nodes = [], seeds = [], keepOut = null, link = 140, soft = 1;
  let t0 = performance.now();
  let raf = 0, inView = true;
  const pointer = { x: 0, y: 0, active: false, fade: 0, timer: 0 };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  function rng(seed) { // mulberry32 — same layout on every load
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function layout() {
    const hr = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(hr.width));
    H = Math.max(1, Math.round(hr.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mr = mark.getBoundingClientRect();
    const u = mr.width / 64;
    const ox = mr.left - hr.left, oy = mr.top - hr.top;
    seeds = SEEDS.map((s) => ({ x: ox + s.x * u, y: oy + s.y * u, w: s.w }));
    keepOut = {
      l: ox + (BBOX.l - CLEAR) * u, r: ox + (BBOX.r + CLEAR) * u,
      t: oy + (BBOX.t - CLEAR) * u, b: oy + (BBOX.b + CLEAR) * u,
    };

    // keep nodes off the headline, intro text and buttons so the copy stays calm
    const pad = 14;
    const textBoxes = Array.from(hero.querySelectorAll('.tagline, h1, .lede, .cta .btn, .facts')).map((n) => {
      const r = n.getBoundingClientRect();
      return { l: r.left - hr.left - pad, r: r.right - hr.left + pad, t: r.top - hr.top - pad, b: r.bottom - hr.top + pad };
    });

    const narrow = W < 700;
    link = narrow ? 104 : clamp(W / 9, 110, 160);
    const count = Math.round(clamp((W * H) / (narrow ? 21000 : 21000), narrow ? 16 : 22, 62));
    soft = narrow ? 0.7 : 1;
    const minGap = narrow ? 42 : 54;
    const rand = rng(11);
    const pts = [];
    let tries = 0;
    while (pts.length < count && tries < count * 60) {
      tries++;
      const x = rand() * W, y = rand() * H;
      // lean the network toward the mark (right on wide screens, top on narrow)
      const bias = narrow ? 0.45 + 0.55 * (1 - smooth(0.2, 0.9, y / H)) : 0.22 + 0.78 * smooth(0.18, 0.7, x / W);
      if (rand() > bias) continue;
      if (x > keepOut.l && x < keepOut.r && y > keepOut.t && y < keepOut.b) continue;
      if (textBoxes.some((b) => x > b.l && x < b.r && y > b.t && y < b.b)) continue;
      if (pts.some((p) => Math.hypot(p.hx - x, p.hy - y) < minGap)) continue;
      pts.push({ hx: x, hy: y });
    }
    nodes = pts.map((p) => {
      let s = seeds[0], best = Infinity;
      for (const c of seeds) {
        const d = Math.hypot(c.x - p.hx, c.y - p.hy) / c.w;
        if (d < best) { best = d; s = c; }
      }
      const r = rand();
      return {
        hx: p.hx, hy: p.hy, x: p.hx, y: p.hy, ox: 0, oy: 0,
        seed: s, dist: Math.hypot(s.x - p.hx, s.y - p.hy),
        size: 1.5 + rand() * 1.9,
        amp: 5 + rand() * 13, phase: rand() * 6.283, spd: 0.00018 + rand() * 0.00026,
        birth: 950 + Math.hypot(s.x - p.hx, s.y - p.hy) * 1.15 + rand() * 260,
        tone: r < 0.26 ? AQUA : r < 0.62 ? MINT : MIST,
        g: 0,
      };
    });
  }

  function step(now, frozen) {
    const t = now - t0;
    const R = 150;
    for (const n of nodes) {
      n.g = frozen ? 1 : clamp((t - n.birth) / 720, 0, 1);
      const e = ease(n.g);
      const a = n.phase + (frozen ? 0 : now * n.spd * 6.283);
      let tx = 0, ty = 0;
      if (!frozen && pointer.fade > 0.01 && n.g > 0.6) {
        const dx = pointer.x - n.x, dy = pointer.y - n.y, d = Math.hypot(dx, dy);
        if (d < R && d > 0.1) { const pull = (1 - d / R) * 18 * pointer.fade; tx = (dx / d) * pull; ty = (dy / d) * pull; }
      }
      n.ox += (tx - n.ox) * 0.08; n.oy += (ty - n.oy) * 0.08;
      const hx = n.hx + Math.cos(a) * n.amp + n.ox, hy = n.hy + Math.sin(a * 1.3) * n.amp * 0.8 + n.oy;
      n.x = n.seed.x + (hx - n.seed.x) * e;
      n.y = n.seed.y + (hy - n.seed.y) * e;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    // growing branches from each node back to the mark
    for (const n of nodes) {
      if (n.g <= 0) continue;
      const near = Math.hypot(n.seed.x - n.x, n.seed.y - n.y);
      const a = soft * (n.g < 1 ? 0.34 : 0.2) * Math.min(1, n.g * 3) * clamp(1.15 - near / (link * 2.1), 0, 1);
      if (a <= 0.01) continue;
      ctx.strokeStyle = `rgba(${AQUA},${a})`;
      ctx.beginPath(); ctx.moveTo(n.seed.x, n.seed.y); ctx.lineTo(n.x, n.y); ctx.stroke();
    }

    // edges between neighbours
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]; if (a.g <= 0.2) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]; if (b.g <= 0.2) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > link) continue;
        const al = soft * (1 - d / link) * 0.3 * Math.min(a.g, b.g);
        ctx.strokeStyle = `rgba(${AQUA},${al})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // pointer links
    if (pointer.fade > 0.01) {
      for (const n of nodes) {
        if (n.g < 0.6) continue;
        const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
        if (d > link * 1.25) continue;
        const al = (1 - d / (link * 1.25)) * 0.55 * pointer.fade;
        ctx.strokeStyle = `rgba(${AQUA},${al})`;
        ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      }
      if (!document.documentElement.classList.contains('has-kcursor')) {
        ctx.fillStyle = `rgba(${AQUA},${0.9 * pointer.fade})`;
        ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 3, 0, 6.283); ctx.fill();
      }
    }

    // nodes
    for (const n of nodes) {
      if (n.g <= 0) continue;
      const r = n.size * ease(n.g);
      ctx.fillStyle = `rgba(${n.tone},${n.tone === AQUA ? 0.9 : 0.6})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 6.283); ctx.fill();
    }
  }

  function frame(now) {
    raf = 0;
    if (reduceQuery.matches) return;
    pointer.fade += ((pointer.active ? 1 : 0) - pointer.fade) * 0.1;
    step(now, false);
    draw();
    if (inView && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduceQuery.matches && inView && !document.hidden) raf = requestAnimationFrame(frame); }

  function renderStatic() {
    layout(); step(performance.now(), true); draw();
  }
  function rebuild() {
    layout();
    if (reduceQuery.matches) { step(0, true); draw(); }
  }

  // Pointer / touch
  function setPointer(e) {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.active = true;
    clearTimeout(pointer.timer);
    if (e.pointerType !== 'mouse') pointer.timer = setTimeout(() => { pointer.active = false; }, 900);
    start();
  }
  hero.addEventListener('pointermove', setPointer, { passive: true });
  hero.addEventListener('pointerdown', setPointer, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });
  hero.addEventListener('pointercancel', () => { pointer.active = false; });

  // Lifecycle
  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { rebuild(); start(); }, 120);
  }).observe(hero);
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) start(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', start);
  reduceQuery.addEventListener('change', () => {
    if (reduceQuery.matches) { cancelAnimationFrame(raf); raf = 0; renderStatic(); }
    else { t0 = performance.now(); layout(); start(); }
  });

  layout();
  if (reduceQuery.matches) { step(0, true); draw(); } else { t0 = performance.now(); start(); }
})();
