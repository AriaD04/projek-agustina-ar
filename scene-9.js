// ============================================================
// scene-9.js — Scene 9: Evaluasi & Refleksi — CYBER FUTURISTIC
// ============================================================
"use strict";

function buildCurrentScene() { buildScene9(); }

// ── SCENE 9 ──────────────────────────────────────────────────
function buildScene9() {
  scene.background = new THREE.Color(0x000810);
  addLight();

  // Inject futuristic background layers
  injectS9Background();

  // Calculate scores
  const total = Object.values(builtObjects).reduce((a, b) => a + b, 0);
  const flora  = builtObjects.tree + builtObjects.bush;
  const fauna  = builtObjects.animal;
  const energy = builtObjects.solar;
  const sc1 = Math.min(Math.round(((flora + fauna) / Math.max(total, 1)) * 100 + 20), 100);
  const sc2 = Math.min(Math.round((fauna / Math.max(total, 1)) * 300 + total * 5), 100);
  const sc3 = Math.min(Math.round((energy / Math.max(total, 1)) * 300 + flora * 3), 100);

  // Add holographic 3D ring to scene
  addHolographicRings();

  setTimeout(() => {
    const ui = document.getElementById("score-ui");
    ui.style.display = "flex";

    // Add hex stats row
    injectHexStats(flora, fauna, energy, total);

    // Animate scores with cyber effect
    animScoreCyber("s1", sc1);
    animScoreCyber("s2", sc2);
    animScoreCyber("s3", sc3);

    // Animate cards in
    const cards = document.querySelectorAll('.score-card');
    cards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(30px) scale(0.9)';
      c.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => {
        c.style.opacity = '1';
        c.style.transform = 'translateY(0) scale(1)';
      }, 200 + i * 150);
    });
  }, 600);
}

// ── Inject futuristic background elements ──
function injectS9Background() {
  // Grid
  const grid = document.createElement('div');
  grid.id = 's9-grid';
  document.body.appendChild(grid);

  // Radar ring
  const radar = document.createElement('div');
  radar.id = 's9-radar';
  document.body.appendChild(radar);

  // Data streams
  const ds = document.createElement('div');
  ds.id = 's9-datastream';
  document.body.appendChild(ds);
  for (let i = 0; i < 8; i++) {
    const line = document.createElement('div');
    line.className = 'data-line';
    const left = 5 + Math.random() * 90;
    const height = 60 + Math.random() * 160;
    const delay = Math.random() * 5;
    const dur = 3 + Math.random() * 4;
    line.style.cssText = `left:${left}%;height:${height}px;animation-duration:${dur}s;animation-delay:-${delay}s;`;
    ds.appendChild(line);
  }

  // Floating particles
  const pts = document.createElement('div');
  pts.id = 's9-particles';
  document.body.appendChild(pts);
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 's9-dot';
    const left = Math.random() * 100;
    const size = 1 + Math.random() * 3;
    const dur = 6 + Math.random() * 10;
    const delay = Math.random() * 10;
    dot.style.cssText = `left:${left}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:-${delay}s;`;
    pts.appendChild(dot);
  }

  // Glitch title effect on scene-title
  const title = document.getElementById('scene-title');
  if (title) {
    title.style.cssText += `
      font-family:'Syne',monospace;
      letter-spacing:0.18em;
      text-transform:uppercase;
      font-size:0.65rem;
      color:rgba(0,230,118,0.7);
    `;
    title.textContent = '// SCENE_09 — ECOSYSTEM.EVAL //';
    setInterval(() => glitchEl(title), 4000);
  }
}

// ── Glitch animation ──
function glitchEl(el) {
  const orig = el.textContent;
  const chars = '01アイウエオカキクケコABCDEF#$@%';
  let it = 0;
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((c, i) =>
      i < it ? c : chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    it++;
    if (it > orig.length) { el.textContent = orig; clearInterval(iv); }
  }, 40);
}

// ── Holographic rings in Three.js ──
function addHolographicRings() {
  if (typeof THREE === 'undefined') return;

  const colors = [0x00e676, 0x00b4d8, 0x7b2ff7];
  colors.forEach((col, i) => {
    const geo = new THREE.TorusGeometry(2.5 + i * 1.2, 0.015, 8, 120);
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.25 - i * 0.05,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2 + i * 0.3;
    ring.userData.spin = 0.004 - i * 0.001;
    ring.userData.axis = i % 2 === 0 ? 'y' : 'x';
    scene.add(ring);

    // Store for animation
    if (!window._s9Rings) window._s9Rings = [];
    window._s9Rings.push(ring);
  });

  // Override animate to spin rings
  const origAnimate = window._s9OrigAnimate || null;
  const tick = () => {
    if (window._s9Rings) {
      window._s9Rings.forEach(r => {
        r.rotation[r.userData.axis] += r.userData.spin;
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Floating hex particles in 3D
  const hexGeo = new THREE.OctahedronGeometry(0.08, 0);
  for (let i = 0; i < 40; i++) {
    const hmat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x00e676 : 0x00b4d8,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.4,
      wireframe: true,
    });
    const hex = new THREE.Mesh(hexGeo, hmat);
    hex.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 3
    );
    hex.userData.floatSpeed = 0.005 + Math.random() * 0.01;
    hex.userData.floatOffset = Math.random() * Math.PI * 2;
    hex.userData.rotSpeed = 0.01 + Math.random() * 0.02;
    scene.add(hex);
    if (!window._s9Hexes) window._s9Hexes = [];
    window._s9Hexes.push(hex);
  }

  const tickHex = () => {
    const t = performance.now() * 0.001;
    if (window._s9Hexes) {
      window._s9Hexes.forEach(h => {
        h.position.y += Math.sin(t + h.userData.floatOffset) * h.userData.floatSpeed;
        h.rotation.x += h.userData.rotSpeed;
        h.rotation.z += h.userData.rotSpeed * 0.7;
      });
    }
    requestAnimationFrame(tickHex);
  };
  requestAnimationFrame(tickHex);
}

// ── Inject hex stat badges ──
function injectHexStats(flora, fauna, energy, total) {
  const ui = document.getElementById("score-ui");
  if (!ui) return;

  const existing = document.querySelector('.s9-hex-row');
  if (existing) existing.remove();

  const row = document.createElement('div');
  row.className = 's9-hex-row';

  const items = [
    { label: 'FLORA', val: flora },
    { label: 'FAUNA', val: fauna },
    { label: 'ENERGI', val: energy },
    { label: 'TOTAL', val: total },
    { label: 'STATUS', val: total > 5 ? 'OPTIMAL' : total > 2 ? 'STABIL' : 'KRITIS' },
  ];
  items.forEach(item => {
    const hex = document.createElement('div');
    hex.className = 's9-hex';
    hex.textContent = `${item.label}: ${item.val}`;
    row.appendChild(hex);
  });

  // Insert before score-cards
  const cards = ui.querySelector('.score-cards');
  if (cards) ui.insertBefore(row, cards);
}

// ── Cyber score animation ──
function animScoreCyber(id, target) {
  let val = 0;
  const el = document.getElementById(id);
  if (!el) return;

  const chars = '0123456789ABCDEF%';
  let scrambleIter = 0;
  const totalFrames = 60;
  const step = Math.max(1, Math.floor(target / totalFrames));

  const iv = setInterval(() => {
    val = Math.min(val + step, target);

    // Scramble effect on the way up
    if (val < target) {
      el.textContent = Math.floor(val) + '%';
      el.style.color = `hsl(${140 + (val / target) * 20}, 100%, ${50 + (val / target) * 15}%)`;
    } else {
      el.textContent = target + '%';
      el.style.color = '#00e676';
      el.style.textShadow = '0 0 30px rgba(0,230,118,1), 0 0 60px rgba(0,230,118,0.5)';
      clearInterval(iv);

      // Final flash
      el.style.transform = 'scale(1.2)';
      setTimeout(() => { el.style.transform = 'scale(1)'; el.style.transition = 'transform 0.3s ease'; }, 100);
    }
  }, 30);
}

window.addEventListener('DOMContentLoaded', () => startSceneApp(8));