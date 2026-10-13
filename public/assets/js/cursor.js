/* Kelbari custom cursor — built from the Node K mark.
   A solid node sits exactly on the pointer; a ring (the hub) trails behind it,
   joined by a thin edge while you move. Colours follow the brand: Deep on light
   sections, Aqua and white on Deep sections.
   Only for mouse/trackpad devices. Off for touch, and off with reduced motion
   (the normal system cursor stays). Text fields keep the normal text cursor. */
(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'kcursor');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const edge = document.createElementNS(NS, 'line');
  edge.setAttribute('class', 'kc-edge');
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('class', 'kc-ring');
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('class', 'kc-dot');
  svg.append(edge, ring, dot);

  const R_REST = 15, R_HOVER = 24, R_PRESS = 10, DOT = 4;
  const p = { x: -100, y: -100 };          // pointer (node)
  const h = { x: -100, y: -100, r: R_REST }; // hub ring (eased)
  let target = R_REST, hover = false, press = false, raf = 0, seen = false;

  const INTERACTIVE = 'a, button, select, summary, label, [role="button"], [tabindex]:not([tabindex="-1"])';
  const TEXT = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
  const DARK = '.on-deep, .site-footer, .wa';

  function frame() {
    raf = 0;
    h.x += (p.x - h.x) * 0.2;
    h.y += (p.y - h.y) * 0.2;
    h.r += (target - h.r) * 0.22;

    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', DOT);
    ring.setAttribute('cx', h.x); ring.setAttribute('cy', h.y); ring.setAttribute('r', h.r);

    // The edge shows only while the node is outside the hub: the "branch going out".
    const dx = p.x - h.x, dy = p.y - h.y, d = Math.hypot(dx, dy);
    if (d > h.r + DOT) {
      const ux = dx / d, uy = dy / d;
      edge.setAttribute('x1', h.x + ux * h.r); edge.setAttribute('y1', h.y + uy * h.r);
      edge.setAttribute('x2', p.x - ux * DOT); edge.setAttribute('y2', p.y - uy * DOT);
      edge.style.opacity = String(Math.min(1, (d - h.r) / 30));
    } else {
      edge.style.opacity = '0';
    }

    if (d > 0.2 || Math.abs(target - h.r) > 0.2) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function setTarget() {
    target = press ? R_PRESS : hover ? R_HOVER : R_REST;
    svg.classList.toggle('is-hover', hover);
    svg.classList.toggle('is-press', press);
    kick();
  }

  function onMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    p.x = e.clientX; p.y = e.clientY;
    if (!seen) { seen = true; h.x = p.x; h.y = p.y; svg.classList.add('is-visible'); }
    const t = e.target instanceof Element ? e.target : null;
    const inText = !!(t && t.closest(TEXT));
    svg.classList.toggle('is-hidden', inText);
    svg.classList.toggle('is-dark', !!(t && t.closest(DARK)));
    const nowHover = !!(t && !inText && t.closest(INTERACTIVE));
    if (nowHover !== hover) { hover = nowHover; setTarget(); }
    kick();
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { press = true; setTarget(); } });
  document.addEventListener('pointerup', () => { press = false; setTarget(); });
  document.addEventListener('mouseleave', () => { svg.classList.remove('is-visible'); seen = false; });
  document.addEventListener('mouseenter', () => { /* shown again on the next move */ });
  window.addEventListener('blur', () => { press = false; setTarget(); });

  // If the user switches to reduced motion or a touch screen, hand back the system cursor.
  const off = () => { if (reduce.matches || !fine.matches) { root.classList.remove('has-kcursor'); svg.remove(); } };
  reduce.addEventListener('change', off);
  fine.addEventListener('change', off);

  document.body.appendChild(svg);
  root.classList.add('has-kcursor');
})();
