/**
 * HERO NETWORK BACKGROUND
 * A living supply-chain network: drifting nodes, distance-faded links and
 * glowing "shipments" travelling between them. Nodes lean towards the cursor.
 * Pauses when the hero is off-screen or the tab is hidden; draws a single
 * static frame for prefers-reduced-motion.
 */
(() => {
  'use strict';

  const hero = document.getElementById('hero');
  if (!hero || !window.HTMLCanvasElement) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = {
    dark:  { node: [125, 211, 252], link: [56, 189, 248], packets: [[34, 211, 238], [167, 139, 250], [52, 211, 153], [251, 191, 36], [251, 113, 133]] },
    light: { node: [37, 99, 235],  link: [37, 99, 235],  packets: [[8, 145, 178], [124, 58, 237], [5, 150, 105], [217, 119, 6], [225, 29, 72]] }
  };
  const theme = () => (document.body.classList.contains('theme-light') ? PALETTE.light : PALETTE.dark);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  let W = 0, H = 0, dpr = 1, nodes = [], packets = [], linkDist = 150;
  const mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    linkDist = Math.max(120, Math.min(190, W / 9));
    const count = Math.round(Math.min(95, Math.max(34, (W * H) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() < 0.14 ? 2.6 : 1.4 + Math.random() * 0.8,
      hub: false,
      phase: Math.random() * Math.PI * 2
    }));
    nodes.forEach(n => { n.hub = n.r > 2.5; });
    packets = [];
  }

  function spawnPacket() {
    const a = nodes[(Math.random() * nodes.length) | 0];
    let best = null, bestD = Infinity;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < linkDist && d > 40 && d < bestD && Math.random() < 0.6) { best = b; bestD = d; }
    }
    if (!best) return;
    const colors = theme().packets;
    packets.push({ a, b: best, t: 0, speed: 0.006 + Math.random() * 0.01, c: colors[(Math.random() * colors.length) | 0] });
  }

  function step(time) {
    const pal = theme();
    ctx.clearRect(0, 0, W, H);

    for (const n of nodes) {
      if (!reduced) {
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < 200 && d > 1) { n.vx += (dx / d) * 0.012; n.vy += (dy / d) * 0.012; }
        }
        n.vx *= 0.985; n.vy *= 0.985;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp < 0.08) { n.vx += (Math.random() - 0.5) * 0.04; n.vy += (Math.random() - 0.5) * 0.04; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      }
    }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (Math.abs(dx) > linkDist || Math.abs(dy) > linkDist) continue;
        const d = Math.hypot(dx, dy);
        if (d > linkDist) continue;
        let alpha = (1 - d / linkDist) * 0.22;
        if (mouse.active) {
          const md = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y);
          if (md < 180) alpha += (1 - md / 180) * 0.35;
        }
        ctx.strokeStyle = rgba(pal.link, alpha);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      const pulse = reduced ? 1 : 0.75 + 0.25 * Math.sin(time / 900 + n.phase);
      if (n.hub) {
        ctx.fillStyle = rgba(pal.node, 0.12 * pulse);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = rgba(pal.node, n.hub ? 0.9 : 0.55 * pulse);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    // shipments
    if (!reduced) {
      if (packets.length < Math.min(26, nodes.length / 3) && Math.random() < 0.18) spawnPacket();
      packets = packets.filter(p => p.t <= 1 && Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) < linkDist * 1.25);
      for (const p of packets) {
        p.t += p.speed;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const tx = p.a.x + (p.b.x - p.a.x) * Math.max(0, p.t - 0.18);
        const ty = p.a.y + (p.b.y - p.a.y) * Math.max(0, p.t - 0.18);
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, rgba(p.c, 0));
        grad.addColorStop(1, rgba(p.c, 0.85));
        ctx.strokeStyle = grad; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = rgba(p.c, 0.25);
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(p.c, 1);
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 1;
    }
  }

  let running = false, visible = true, raf = 0;
  const loop = t => { step(t); raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !reduced && visible && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  if (reduced) step(0); else start();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduced) step(0); }, 150);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  hero.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { mouse.active = false; });
  // theme switches redraw immediately in reduced-motion mode
  new MutationObserver(() => { if (reduced) step(0); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
