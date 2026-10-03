/**
 * Partículas e rastro da nave em canvas (GPU-friendly, baixo custo).
 */

import { prefersReducedMotion } from "../gameExperience.js";

export function createSpaceFxCanvas(canvas) {
  const ctx2d = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  const reduced = prefersReducedMotion();

  const resize = () => {
    if (!canvas.parentElement) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const laneX = (lane) => ((lane * 2 + 1) / 6) * width;

  function spawnParticle(x, y, vx, vy, life, color, size = 3) {
    particles.push({ x, y, vx, vy, life, max: life, color, size });
  }

  function burst(x, y, color = "#ffe14a", count = 14) {
    if (reduced) return;
    const n = Math.min(32, count + 4);
    for (let i = 0; i < n; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.2 + Math.random() * 2.8;
      spawnParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        28 + Math.random() * 22,
        color,
        2 + Math.random() * 3,
      );
    }
  }

  function muzzle(lane) {
    if (reduced) return;
    const x = laneX(lane);
    const y = height * 0.78;
    for (let i = 0; i < 6; i += 1) {
      spawnParticle(x, y, (Math.random() - 0.5) * 1.5, -3 - Math.random() * 2, 16, "#fff3bf", 2);
      spawnParticle(x, y, (Math.random() - 0.5) * 2, -4 - Math.random() * 3, 20, "#ff922b", 3);
    }
  }

  function engineTrail(lane, time) {
    if (reduced) return;
    const x = laneX(lane) + Math.sin(time / 120) * 2;
    const y = height * 0.88;
    spawnParticle(x, y, (Math.random() - 0.5) * 0.6, 1.2 + Math.random(), 22, "#74c0fc", 2);
    spawnParticle(x, y, (Math.random() - 0.5) * 0.8, 1.5 + Math.random(), 18, "#4dabf7", 2);
  }

  function render(dtMs) {
    if (!ctx2d || width <= 0) return;
    ctx2d.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dtMs;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      const alpha = Math.max(0, p.life / p.max);
      ctx2d.globalAlpha = alpha;
      ctx2d.fillStyle = p.color;
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx2d.fill();
    }
    ctx2d.globalAlpha = 1;
  }

  resize();
  return { resize, burst, muzzle, engineTrail, render, laneX };
}
