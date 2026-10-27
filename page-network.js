/**
 * PAGE NETWORK BACKGROUND
 * A living supply-chain network behind the whole page: drifting nodes,
 * distance-faded links and glowing "shipments" travelling between them.
 * The canvas is fixed to the viewport; it is brightest over the hero and
 * calmer behind content sections so text stays readable. Nodes lean towards
 * the cursor. Pauses when the tab is hidden; draws a single static frame for
 * prefers-reduced-motion.
 */
(() => {
  'use strict';

  if (!window.HTMLCanvasElement) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'page-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const hero = document.getElementById('hero');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = {
    dark:  { node: [125, 211, 252], link: [56, 189, 248], packets: [[34, 211, 238], [167, 139, 250], [52, 211, 153], [251, 191, 36], [251, 113, 133]] },
    light: { node: [37, 99, 235],  link: [37, 99, 235],  packets: [[8, 145, 178], [124, 58, 237], [5, 150, 105], [217, 119, 6], [225, 29, 72]] }
  };
  const theme = () => (document.body.classList.contains('theme-light') ? PALETTE.light : PALETTE.dark);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  let W = 0, H = 0, dpr = 1, nodes = [], packets = [], linkDist = 150;
  let intensity = 1; // 1 over the hero, eases towards CALM elsewhere
  const CALM = 0.55;
  const mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    linkDist = Math.max(115, Math.min(185, W / 9));
    const count = Math.round(Math.min(90, Math.max(30, (W * H) / 17000)));
    nodes = Array.from({ length: count }, () => {
      const hub = Math.random() < 0.14;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: hub ? 2.6 : 1.4 + Math.random() * 0.8,
        hub,
        phase: Math.random() * Math.PI * 2
      };
    });
    packets = [];
    measureHero();
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

  // Share of the viewport covered by the hero, measured on scroll/resize only
  // so the animation loop never forces a layout read.
  let heroRatio = 1;
  function measureHero() {
    if (!hero) { heroRatio = 0; return; }
    const r = hero.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
    heroRatio = H ? visible / H : 0;
  }
  const heroShare = () => heroRatio;
  window.addEventListener('scroll', measureHero, { passive: true });

  function step(time) {
    const pal = theme();
    const target = CALM + (1 - CALM) * heroShare();
    intensity += (target - intensity) * 0.06;
    const k = intensity;
    ctx.clearRect(0, 0, W, H);

    if (!reduced) {
      for (const n of nodes) {
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < 200 && d > 1) { n.vx += (dx / d) * 0.012; n.vy += (dy / d) * 0.012; }
        }
        n.vx *= 0.985; n.vy *= 0.985;
        if (Math.hypot(n.vx, n.vy) < 0.08) { n.vx += (Math.random() - 0.5) * 0.04; n.vy += (Math.random() - 0.5) * 0.04; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (Math.abs(dx) > linkDist || Math.abs(dy) > linkDist) continue;
        const d = Math.hypot(dx, dy);
        if (d > linkDist) continue;
        let alpha = (1 - d / linkDist) * 0.22 * k;
        if (mouse.active) {
          const md = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y);
          if (md < 180) alpha += (1 - md / 180) * 0.3;
        }
        ctx.strokeStyle = rgba(pal.link, alpha);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    for (const n of nodes) {
      const pulse = reduced ? 1 : 0.75 + 0.25 * Math.sin(time / 900 + n.phase);
      if (n.hub) {
        ctx.fillStyle = rgba(pal.node, 0.12 * pulse * k);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = rgba(pal.node, (n.hub ? 0.9 : 0.55 * pulse) * k);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    if (!reduced) {
      const maxPackets = Math.min(26, nodes.length / 3) * (0.5 + 0.5 * k);
      if (packets.length < maxPackets && Math.random() < 0.18) spawnPacket();
      packets = packets.filter(p => p.t <= 1 && Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) < linkDist * 1.25);
      ctx.lineWidth = 2;
      for (const p of packets) {
        p.t += p.speed;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const tt = Math.max(0, p.t - 0.18);
        const tx = p.a.x + (p.b.x - p.a.x) * tt;
        const ty = p.a.y + (p.b.y - p.a.y) * tt;
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, rgba(p.c, 0));
        grad.addColorStop(1, rgba(p.c, 0.85 * k));
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = rgba(p.c, 0.25 * k);
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(p.c, k);
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 1;
    }
  }

  // Phones and tablets get ~30 fps: the motion still reads as smooth and the
  // main thread stays free for scrolling and taps.
  const frameGap = window.matchMedia('(pointer: coarse)').matches ? 32 : 0;
  let running = false, raf = 0, last = 0;
  const loop = t => {
    if (t - last >= frameGap) { last = t; step(t); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!running && !reduced && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // Start once the page is loaded and the browser is idle, so the network
  // never competes with first paint or the first tap.
  const boot = () => {
    resize();
    if (reduced) { intensity = 1; step(0); } else start();
  };
  const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(boot, { timeout: 2000 }) : setTimeout(boot, 600));
  if (document.readyState === 'complete') whenIdle(); else window.addEventListener('load', whenIdle, { once: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduced) step(0); }, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.active = false; });
  window.addEventListener('blur', () => { mouse.active = false; });
  new MutationObserver(() => { if (reduced) step(0); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
