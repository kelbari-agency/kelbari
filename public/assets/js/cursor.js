/* Kelbari custom cursor — built from the Node K mark.
   - A solid node sits exactly on the pointer; a ring (the hub) trails behind it,
     joined by a thin edge while you move.
   - Over buttons and links the ring snaps around the element as an outline that
     matches its shape, and buttons drift slightly toward the pointer (magnetic).
   - A click sends a small signal pulse out from the node.
   - Colours follow the brand: Deep on light sections, Aqua and light on Deep.
   Mouse/trackpad only. Off on touch and with reduced motion (the system cursor
   stays). Hidden over text fields so the normal text cursor shows. */
(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const el = (tag, cls) => { const n = document.createElementNS(NS, tag); n.setAttribute('class', cls); return n; };
  const svg = el('svg', 'kcursor');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const pulses = el('g', 'kc-pulses');
  const edge = el('line', 'kc-edge');
  const ring = el('rect', 'kc-ring');
  const dot = el('circle', 'kc-dot');
  svg.append(pulses, edge, ring, dot);

  const R_REST = 15, R_HOVER = 22, R_PRESS = 10, DOT = 4, PAD = 7, MAGNET = 0.2, MAGNET_MAX = 8;
  const SNAP = '.btn, .nav a, .wa, a.hl-value, .brand, .menu-btn, .project .more, .site-footer a';
  const INTERACTIVE = 'a, button, select, summary, label, [role="button"], [tabindex]:not([tabindex="-1"])';
  const TEXT = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
  const MAGNETIC = '.btn, .wa';
  const DARK = '.on-deep, .site-footer, .wa';

  const p = { x: -100, y: -100 };                       // pointer = node
  const c = { x: -100, y: -100, w: 30, h: 30, rx: 15 };  // ring, eased
  let snapEl = null, hover = false, press = false, seen = false, raf = 0;

  const ease = (a, b, k) => a + (b - a) * k;
  const radiusOf = (node) => parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;

  function release() {
    if (snapEl && snapEl.matches(MAGNETIC)) snapEl.style.translate = '';
    snapEl = null;
  }

  function frame() {
    raf = 0;
    let tx, ty, tw, th, trx;
    if (snapEl && snapEl.isConnected) {
      const r = snapEl.getBoundingClientRect();
      // magnetic pull: offset from the element's own centre (minus any pull already applied)
      if (snapEl.matches(MAGNETIC)) {
        const cur = (snapEl.style.translate || '0px 0px').split(' ').map(parseFloat);
        const bx = r.left + r.width / 2 - (cur[0] || 0), by = r.top + r.height / 2 - (cur[1] || 0);
        const mx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (p.x - bx) * MAGNET));
        const my = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (p.y - by) * MAGNET));
        snapEl.style.translate = `${mx.toFixed(2)}px ${my.toFixed(2)}px`;
      }
      tw = r.width + PAD * 2; th = r.height + PAD * 2;
      tx = r.left + r.width / 2; ty = r.top + r.height / 2;
      trx = Math.min(radiusOf(snapEl) + PAD, th / 2);
    } else {
      if (snapEl) release();
      const R = press ? R_PRESS : hover ? R_HOVER : R_REST;
      tx = p.x; ty = p.y; tw = th = R * 2; trx = R;
    }
    const kPos = snapEl ? 0.28 : 0.2, kSize = 0.25;
    c.x = ease(c.x, tx, kPos); c.y = ease(c.y, ty, kPos);
    c.w = ease(c.w, tw, kSize); c.h = ease(c.h, th, kSize); c.rx = ease(c.rx, trx, kSize);

    ring.setAttribute('x', c.x - c.w / 2); ring.setAttribute('y', c.y - c.h / 2);
    ring.setAttribute('width', Math.max(0, c.w)); ring.setAttribute('height', Math.max(0, c.h));
    ring.setAttribute('rx', Math.max(0, c.rx));
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', snapEl ? 3 : DOT);

    // edge: only while free and the node has pulled out of the hub
    const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy), rr = c.w / 2;
    if (!snapEl && d > rr + DOT) {
      const ux = dx / d, uy = dy / d;
      edge.setAttribute('x1', c.x + ux * rr); edge.setAttribute('y1', c.y + uy * rr);
      edge.setAttribute('x2', p.x - ux * DOT); edge.setAttribute('y2', p.y - uy * DOT);
      edge.style.opacity = String(Math.min(1, (d - rr) / 30));
    } else edge.style.opacity = '0';

    const settling = Math.abs(c.x - tx) + Math.abs(c.y - ty) + Math.abs(c.w - tw) + Math.abs(c.h - th) > 0.3;
    if (settling || snapEl) raf = requestAnimationFrame(frame); // keep tracking while snapped (scroll moves the element)
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function onMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    p.x = e.clientX; p.y = e.clientY;
    if (!seen) { seen = true; c.x = p.x; c.y = p.y; svg.classList.add('is-visible'); }
    const t = e.target instanceof Element ? e.target : null;
    const inText = !!(t && t.closest(TEXT));
    svg.classList.toggle('is-hidden', inText);
    svg.classList.toggle('is-dark', !!(t && t.closest(DARK)));

    const nextSnap = !inText && t ? t.closest(SNAP) : null;
    if (nextSnap !== snapEl) { release(); snapEl = nextSnap; }
    hover = !inText && !snapEl && !!(t && t.closest(INTERACTIVE));
    svg.classList.toggle('is-snap', !!snapEl);
    svg.classList.toggle('is-hover', hover);
    kick();
  }

  function pulse() {
    const g = el('circle', 'kc-pulse');
    g.setAttribute('cx', p.x); g.setAttribute('cy', p.y); g.setAttribute('r', '26');
    pulses.appendChild(g);
    g.addEventListener('animationend', () => g.remove(), { once: true });
    setTimeout(() => g.remove(), 900);
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    press = true; svg.classList.add('is-press'); pulse(); kick();
  });
  document.addEventListener('pointerup', () => { press = false; svg.classList.remove('is-press'); kick(); });
  document.addEventListener('mouseleave', () => { svg.classList.remove('is-visible'); seen = false; release(); });
  window.addEventListener('blur', () => { press = false; svg.classList.remove('is-press'); release(); kick(); });
  window.addEventListener('scroll', () => { if (snapEl) kick(); }, { passive: true });

  // Hand back the system cursor if the user turns on reduced motion or switches to touch.
  const off = () => {
    if (reduce.matches || !fine.matches) { release(); root.classList.remove('has-kcursor'); svg.remove(); }
  };
  reduce.addEventListener('change', off);
  fine.addEventListener('change', off);

  document.body.appendChild(svg);
  root.classList.add('has-kcursor');
})();
