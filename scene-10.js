// ============================================================
// scene-10.js — Scene 10: Penutup — CYBER EARTH 3D
// ============================================================
"use strict";

function buildCurrentScene() {
  buildScene10();
}

// ── SCENE 10 ──────────────────────────────────────────────────
function buildScene10() {
  // Deep space background
  scene.background = new THREE.Color(0x000205);
  addLight();

  // Inject static space BG
  injectSpaceBackground();

  setTimeout(() => {
    const outro = document.getElementById("outro");
    outro.innerHTML = buildOutroHTML();
    outro.style.display = "flex";

    // Launch cyber globe
    initCyberGlobe();

    // Glitch title
    const h1 = outro.querySelector("h1");
    setTimeout(() => {
      if (h1) glitchText(h1);
    }, 2000);
    setInterval(() => {
      if (h1) glitchText(h1);
    }, 8000);
  }, 300);
}

// ── Build HTML for outro ──
function buildOutroHTML() {
  return `
    <!-- HUD corners -->
    <div class="hud-corner tl"></div>
    <div class="hud-corner tr"></div>
    <div class="hud-corner bl"></div>
    <div class="hud-corner br"></div>
    <div id="s10-scanbar"></div>

    <!-- Cyber Globe -->
    <div id="globe-container">
      <canvas id="earth-canvas"></canvas>
      <div class="orbit-ring orbit-ring-1"></div>
      <div class="orbit-ring orbit-ring-2"></div>
      <div class="orbit-ring orbit-ring-3"></div>
      <div id="zoom-controls">
        <button class="zoom-btn" onclick="cyberGlobeZoom(1.2)" title="Zoom In">＋</button>
        <button class="zoom-btn" onclick="cyberGlobeZoom(0.8)" title="Zoom Out">－</button>
        <button class="zoom-btn" onclick="cyberGlobeReset()" title="Reset" style="font-size:0.7rem;letter-spacing:0.05em;">RST</button>
        <span id="zoom-label">ZOOM</span>
      </div>
      <div id="globe-tip">drag to rotate • scroll to zoom</div>
    </div>

    <!-- Text Content -->
    <div class="outro-content">
      <div class="outro-sublabel">// MISI SELESAI — EKOSISTEM_TERJAGA //</div>
      <h1>Bersama Kita Jaga<br/><span class="highlight">Ekosistem Bumi</span></h1>
      <div class="outro-divider"></div>
      <p>Setiap keputusan desain yang kamu buat hari ini<br/>adalah investasi untuk generasi mendatang.</p>
      <div class="outro-tags">
        <span class="outro-tag">🌿 FLORA</span>
        <span class="outro-tag">🦋 FAUNA</span>
        <span class="outro-tag">☀ ENERGI</span>
        <span class="outro-tag">🌊 AIR</span>
        <span class="outro-tag">🌍 BUMI</span>
      </div>
      <button onclick="restartApp()">↺ &nbsp;MULAI ULANG</button>
    </div>
  `;
}

// ── Inject space background elements ──
function injectSpaceBackground() {
  // Star field
  const sf = document.createElement("div");
  sf.id = "starfield";
  document.body.appendChild(sf);

  const starCount = 180;
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = 0.5 + Math.random() * 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 2 + Math.random() * 4;
    const delay = Math.random() * 5;
    s.style.cssText = `
      left:${x}%;top:${y}%;
      width:${size}px;height:${size}px;
      animation-duration:${dur}s;
      animation-delay:-${delay}s;
      opacity:${0.2 + Math.random() * 0.6};
    `;
    sf.appendChild(s);
  }

  // Nebula glow
  const neb = document.createElement("div");
  neb.id = "nebula";
  document.body.appendChild(neb);
}

// ── CYBER GLOBE ──────────────────────────────────────────────
let _globeState = {
  canvas: null,
  ctx: null,
  radius: 0,
  rotX: 0.3,
  rotY: 0,
  zoom: 1,
  isDragging: false,
  lastX: 0,
  lastY: 0,
  animId: null,
  time: 0,
  dataPoints: [],
  continentData: null,
};

// Simplified continent outlines as lat/lng polygons (simplified)
function generateContinents() {
  // We'll draw procedural "land" using noise-like patterns
  // Return key lat/lng points per continent
  return [
    // North America (simplified polygon)
    {
      name: "NA",
      color: [0, 200, 100],
      points: [
        [70, -140],
        [72, -100],
        [60, -85],
        [50, -60],
        [45, -65],
        [30, -85],
        [25, -90],
        [20, -100],
        [30, -115],
        [45, -130],
        [55, -135],
        [60, -140],
      ],
    },
    // South America
    {
      name: "SA",
      color: [0, 180, 80],
      points: [
        [12, -72],
        [5, -52],
        [0, -50],
        [-10, -37],
        [-20, -40],
        [-35, -57],
        [-55, -65],
        [-55, -70],
        [-45, -72],
        [-25, -70],
        [-15, -75],
        [0, -78],
        [10, -75],
      ],
    },
    // Europe
    {
      name: "EU",
      color: [0, 200, 100],
      points: [
        [72, 15],
        [68, 25],
        [60, 28],
        [55, 20],
        [48, 18],
        [42, 14],
        [38, 12],
        [40, 28],
        [45, 35],
        [50, 30],
        [58, 25],
        [65, 20],
      ],
    },
    // Africa
    {
      name: "AF",
      color: [0, 210, 90],
      points: [
        [38, 10],
        [30, 32],
        [10, 42],
        [0, 40],
        [-10, 38],
        [-25, 32],
        [-35, 20],
        [-35, 10],
        [-20, -15],
        [-5, -10],
        [10, -15],
        [20, -15],
        [25, 10],
        [32, 20],
        [38, 15],
      ],
    },
    // Asia
    {
      name: "AS",
      color: [0, 190, 110],
      points: [
        [70, 50],
        [65, 90],
        [55, 135],
        [40, 130],
        [25, 120],
        [15, 100],
        [10, 80],
        [25, 55],
        [30, 45],
        [45, 35],
        [55, 40],
        [60, 50],
        [68, 45],
      ],
    },
    // Australia
    {
      name: "AU",
      color: [0, 200, 90],
      points: [
        [-20, 115],
        [-15, 130],
        [-15, 140],
        [-25, 152],
        [-38, 145],
        [-38, 140],
        [-32, 120],
        [-20, 115],
      ],
    },
    // Greenland
    {
      name: "GL",
      color: [0, 200, 120],
      points: [
        [83, -45],
        [80, -20],
        [74, -18],
        [65, -38],
        [65, -52],
        [72, -55],
        [78, -48],
      ],
    },
  ];
}

function latLngToXY(lat, lng, rotX, rotY, radius, zoom) {
  // Convert lat/lng to 3D sphere coordinates
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  let x = Math.cos(latR) * Math.sin(lngR);
  let y = Math.sin(latR);
  let z = Math.cos(latR) * Math.cos(lngR);

  // Rotate around Y axis (longitude rotation)
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x2 = x * cosY + z * sinY;
  const z2 = -x * sinY + z * cosY;
  x = x2;
  z = z2;

  // Rotate around X axis (tilt)
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = y * cosX - z * sinX;
  const z3 = y * sinX + z * cosX;
  y = y2;
  z = z2;

  return { x: x * radius * zoom, y: -y * radius * zoom, z: z };
}

// Generate random data connection points on globe
function generateDataPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({
      lat: (Math.random() - 0.5) * 160,
      lng: (Math.random() - 0.5) * 360,
      pulseOffset: Math.random() * Math.PI * 2,
      type: Math.random() > 0.5 ? "node" : "hotspot",
      size: 1.5 + Math.random() * 3,
    });
  }
  return pts;
}

// Generate arc connections between points
function generateArcs(dataPoints) {
  const arcs = [];
  for (let i = 0; i < 12; i++) {
    const a = dataPoints[Math.floor(Math.random() * dataPoints.length)];
    const b = dataPoints[Math.floor(Math.random() * dataPoints.length)];
    if (a !== b)
      arcs.push({
        from: a,
        to: b,
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random(),
      });
  }
  return arcs;
}

function initCyberGlobe() {
  const canvas = document.getElementById("earth-canvas");
  if (!canvas) return;

  const container = document.getElementById("globe-container");
  const size = container
    ? Math.min(container.offsetWidth, container.offsetHeight)
    : 300;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const radius = (size / 2) * 0.85;
  const cx = size / 2;
  const cy = size / 2;

  const g = _globeState;
  g.canvas = canvas;
  g.ctx = ctx;
  g.radius = radius;
  g.cx = cx;
  g.cy = cy;
  g.zoom = 1;
  g.rotX = 0.3;
  g.rotY = 0;
  g.continentData = generateContinents();
  g.dataPoints = generateDataPoints(35);
  g.arcs = generateArcs(g.dataPoints);

  // Mouse/touch interaction
  canvas.addEventListener("mousedown", (e) => {
    g.isDragging = true;
    g.lastX = e.clientX;
    g.lastY = e.clientY;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!g.isDragging) return;
    g.rotY += (e.clientX - g.lastX) * 0.007;
    g.rotX += (e.clientY - g.lastY) * 0.004;
    g.rotX = Math.max(-1.2, Math.min(1.2, g.rotX));
    g.lastX = e.clientX;
    g.lastY = e.clientY;
  });
  canvas.addEventListener("mouseup", () => {
    g.isDragging = false;
  });
  canvas.addEventListener("mouseleave", () => {
    g.isDragging = false;
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      cyberGlobeZoom(e.deltaY < 0 ? 1.1 : 0.91);
    },
    { passive: false },
  );

  // Touch
  let lastTouchDist = 0;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        g.isDragging = true;
        g.lastX = e.touches[0].clientX;
        g.lastY = e.touches[0].clientY;
      }
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      }
    },
    { passive: true },
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && g.isDragging) {
        g.rotY += (e.touches[0].clientX - g.lastX) * 0.007;
        g.rotX += (e.touches[0].clientY - g.lastY) * 0.004;
        g.rotX = Math.max(-1.2, Math.min(1.2, g.rotX));
        g.lastX = e.touches[0].clientX;
        g.lastY = e.touches[0].clientY;
      }
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        cyberGlobeZoom(dist / lastTouchDist);
        lastTouchDist = dist;
      }
    },
    { passive: false },
  );
  canvas.addEventListener("touchend", () => {
    g.isDragging = false;
  });

  // Start render loop
  drawGlobe();
}

window.cyberGlobeZoom = function (factor) {
  _globeState.zoom = Math.max(0.4, Math.min(3.5, _globeState.zoom * factor));
};
window.cyberGlobeReset = function () {
  _globeState.zoom = 1;
  _globeState.rotX = 0.3;
  _globeState.rotY = 0;
};

function drawGlobe() {
  const g = _globeState;
  if (!g.canvas) return;

  const ctx = g.ctx;
  const W = g.canvas.width;
  const H = g.canvas.height;
  const cx = g.cx,
    cy = g.cy;
  const R = g.radius * g.zoom;
  const t = (g.time += 0.012);

  ctx.clearRect(0, 0, W, H);

  // Auto-rotate slowly
  if (!g.isDragging) g.rotY += 0.004;

  // ── Deep space sphere base ──
  const sphereGrad = ctx.createRadialGradient(
    cx - R * 0.25,
    cy - R * 0.25,
    R * 0.05,
    cx,
    cy,
    R,
  );
  sphereGrad.addColorStop(0, "rgba(0,30,60,0.97)");
  sphereGrad.addColorStop(0.4, "rgba(0,15,35,0.98)");
  sphereGrad.addColorStop(1, "rgba(0,5,15,0.99)");

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = sphereGrad;
  ctx.fill();
  ctx.restore();

  // ── Grid lines (lat/lng) ──
  drawGridLines(ctx, cx, cy, R, g.rotX, g.rotY, t);

  // ── Continents ──
  drawContinents(ctx, cx, cy, R, g.rotX, g.rotY, g.continentData, t);

  // ── Data points ──
  drawDataPoints(ctx, cx, cy, R, g.rotX, g.rotY, g.dataPoints, t);

  // ── Arc connections ──
  drawArcs(ctx, cx, cy, R, g.rotX, g.rotY, g.arcs, t);

  // ── Equator highlight ──
  drawEquatorRing(ctx, cx, cy, R, g.rotX, g.rotY, t);

  // ── Atmosphere glow ──
  drawAtmosphere(ctx, cx, cy, R, t);

  // ── Specular highlight ──
  const specGrad = ctx.createRadialGradient(
    cx - R * 0.35,
    cy - R * 0.35,
    0,
    cx - R * 0.2,
    cy - R * 0.2,
    R * 0.7,
  );
  specGrad.addColorStop(0, "rgba(100,220,255,0.07)");
  specGrad.addColorStop(0.3, "rgba(50,150,200,0.03)");
  specGrad.addColorStop(1, "transparent");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();
  ctx.restore();

  // ── Clip everything to sphere ──
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.restore();

  // ── North pole glow ──
  const northPt = latLngToXY(90, 0, g.rotX, g.rotY, R, 1);
  if (northPt.z > 0) {
    const ng = ctx.createRadialGradient(
      cx + northPt.x,
      cy + northPt.y,
      0,
      cx + northPt.x,
      cy + northPt.y,
      R * 0.2,
    );
    ng.addColorStop(0, `rgba(100,220,255,${0.2 + 0.1 * Math.sin(t)})`);
    ng.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx + northPt.x, cy + northPt.y, R * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = ng;
    ctx.fill();
  }

  requestAnimationFrame(drawGlobe);
}

function drawGridLines(ctx, cx, cy, R, rotX, rotY, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  const alpha = 0.12 + 0.03 * Math.sin(t * 0.5);
  ctx.strokeStyle = `rgba(0,230,118,${alpha})`;
  ctx.lineWidth = 0.4;

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    ctx.beginPath();
    let first = true;
    for (let lng = -180; lng <= 180; lng += 4) {
      const p = latLngToXY(lat, lng, rotX, rotY, R, 1);
      if (p.z < 0) {
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(cx + p.x, cy + p.y);
        first = false;
      } else ctx.lineTo(cx + p.x, cy + p.y);
    }
    ctx.stroke();
  }

  // Longitude lines
  for (let lng = -180; lng < 180; lng += 20) {
    ctx.beginPath();
    let first = true;
    for (let lat = -90; lat <= 90; lat += 4) {
      const p = latLngToXY(lat, lng, rotX, rotY, R, 1);
      if (p.z < 0) {
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(cx + p.x, cy + p.y);
        first = false;
      } else ctx.lineTo(cx + p.x, cy + p.y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawContinents(ctx, cx, cy, R, rotX, rotY, continents, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  continents.forEach((cont) => {
    const [r, g2, b] = cont.color;
    ctx.beginPath();
    let first = true;
    let allHidden = true;

    cont.points.forEach(([lat, lng]) => {
      const p = latLngToXY(lat, lng, rotX, rotY, R, 1);
      if (p.z > -0.1) allHidden = false;
      if (p.z < 0) {
        first = true;
        return;
      }
      if (first) {
        ctx.moveTo(cx + p.x, cy + p.y);
        first = false;
      } else ctx.lineTo(cx + p.x, cy + p.y);
    });

    if (!allHidden) {
      ctx.closePath();
      // Fill with cyber green glow
      const pulse = 0.7 + 0.15 * Math.sin(t + cont.name.charCodeAt(0));
      ctx.fillStyle = `rgba(${r},${g2},${b},${0.2 * pulse})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g2},${b},${0.6 * pulse})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Bright outline glow
      ctx.strokeStyle = `rgba(${Math.min(r + 50, 255)},${Math.min(g2 + 30, 255)},${Math.min(b + 20, 255)},${0.3 * pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  ctx.restore();
}

function drawDataPoints(ctx, cx, cy, R, rotX, rotY, points, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  points.forEach((pt) => {
    const p = latLngToXY(pt.lat, pt.lng, rotX, rotY, R, 1);
    if (p.z < 0.05) return;

    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + pt.pulseOffset);
    const px = cx + p.x,
      py = cy + p.y;

    if (pt.type === "hotspot") {
      // Pulsing ring
      ctx.beginPath();
      ctx.arc(px, py, pt.size * (1 + pulse * 1.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,230,118,${0.5 * (1 - pulse * 0.5)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,230,118,${0.7 + pulse * 0.3})`;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, pt.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,180,220,${0.6 + pulse * 0.4})`;
      ctx.fill();
    }
  });

  ctx.restore();
}

function drawArcs(ctx, cx, cy, R, rotX, rotY, arcs, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  arcs.forEach((arc) => {
    const from = latLngToXY(arc.from.lat, arc.from.lng, rotX, rotY, R, 1);
    const to = latLngToXY(arc.to.lat, arc.to.lng, rotX, rotY, R, 1);
    if (from.z < 0 || to.z < 0) return;

    const fx = cx + from.x,
      fy = cy + from.y;
    const tx = cx + to.x,
      ty = cy + to.y;
    const mx = (fx + tx) / 2;
    const my = (fy + ty) / 2;
    // Arc bulge toward center
    const bulge = 0.6;
    const cpx = mx + (cx - mx) * bulge;
    const cpy = my + (cy - my) * bulge;

    const progress = (Math.sin(t * arc.speed + arc.offset) + 1) / 2;
    const alpha = 0.2 + progress * 0.4;

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(cpx, cpy, tx, ty);
    ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Moving dot along arc
    const bx =
      (1 - progress) * (1 - progress) * fx +
      2 * (1 - progress) * progress * cpx +
      progress * progress * tx;
    const by =
      (1 - progress) * (1 - progress) * fy +
      2 * (1 - progress) * progress * cpy +
      progress * progress * ty;
    ctx.beginPath();
    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,230,255,${alpha * 1.5})`;
    ctx.fill();
  });

  ctx.restore();
}

function drawEquatorRing(ctx, cx, cy, R, rotX, rotY, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.beginPath();
  let first = true;
  for (let lng = -180; lng <= 180; lng += 2) {
    const p = latLngToXY(0, lng, rotX, rotY, R, 1);
    if (p.z < 0) {
      first = true;
      continue;
    }
    if (first) {
      ctx.moveTo(cx + p.x, cy + p.y);
      first = false;
    } else ctx.lineTo(cx + p.x, cy + p.y);
  }
  const equatorAlpha = 0.3 + 0.1 * Math.sin(t);
  ctx.strokeStyle = `rgba(0,230,118,${equatorAlpha})`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function drawAtmosphere(ctx, cx, cy, R, t) {
  // Outer atmosphere glow
  const atmoR = R * 1.08;
  const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, atmoR);
  const pulse = 0.06 + 0.02 * Math.sin(t * 0.7);
  atmoGrad.addColorStop(0, `rgba(0,180,255,${pulse * 1.5})`);
  atmoGrad.addColorStop(0.4, `rgba(0,230,118,${pulse})`);
  atmoGrad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(cx, cy, atmoR, 0, Math.PI * 2);
  ctx.fillStyle = atmoGrad;
  ctx.fill();
}

// ── Glitch text effect ──
function glitchText(el) {
  if (!el) return;
  const orig = el.innerHTML;
  const chars = "01ABCDEF#アイウエ$@%";
  let frame = 0;
  const iv = setInterval(() => {
    frame++;
    if (frame > 10) {
      el.innerHTML = orig;
      clearInterval(iv);
      return;
    }
    el.style.textShadow =
      frame % 2 === 0
        ? "2px 0 rgba(255,0,100,0.8), -2px 0 rgba(0,200,255,0.8), 0 0 20px rgba(0,230,118,0.5)"
        : "0 0 30px rgba(0,230,118,0.8)";
  }, 60);
}

window.addEventListener("DOMContentLoaded", () => startSceneApp(9));
