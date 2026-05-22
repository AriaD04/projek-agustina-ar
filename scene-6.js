// ============================================================
// scene-6.js — Scene 6: Tantangan Proyek (ANIME RPG EDITION)
// Konsep: Mission Briefing ala RPG dengan karakter guide anime,
// typing effect, misi card, partikel & efek GG
// ============================================================
"use strict";

window.addEventListener('unhandledrejection', function(e){ e.preventDefault(); }, true);

function buildCurrentScene() { buildScene6(); }

// ── State ──
var s6_ticker = 0;
var s6_particles = [];
var s6_rings = [];
var s6_orbs = [];
var s6_crystals = [];
var s6_lights6 = [];
var s6_sceneRef = null;

// ── Misi Data ──
var S6_MISSIONS = [
  { id:'flora',  icon:'🌿', title:'Flora',       desc:'Tanam pohon & tanaman hijau untuk menghasilkan oksigen dan habitat makhluk hidup.',    color:'#00e676', hex: 0x00e676, xp: 150 },
  { id:'air',    icon:'💧', title:'Air Bersih',   desc:'Kelola sumber air bersih untuk mendukung kehidupan seluruh makhluk di ekosistem.',      color:'#42a5f5', hex: 0x42a5f5, xp: 120 },
  { id:'energy', icon:'⚡', title:'Energi Hijau', desc:'Pasang panel surya & turbin angin untuk mengurangi emisi karbon berbahaya.',            color:'#ffca28', hex: 0xffca28, xp: 130 },
  { id:'fauna',  icon:'🦎', title:'Fauna',        desc:'Buat habitat hewan agar biodiversitas ekosistem tetap seimbang dan lestari.',           color:'#ff7043', hex: 0xff7043, xp: 140 },
  { id:'balance',icon:'⚖️', title:'Keseimbangan', desc:'Raih keseimbangan sempurna antara semua komponen untuk ekosistem yang berkelanjutan.', color:'#ce93d8', hex: 0xce93d8, xp: 200 },
];

// ============================================================
// BUILD SCENE 6
// ============================================================
function buildScene6() {
  s6_ticker = 0;
  s6_particles = [];
  s6_rings = [];
  s6_orbs = [];
  s6_crystals = [];
  s6_lights6 = [];

  scene.background = new THREE.Color(0x04080f);
  s6_sceneRef = scene;

  // Fog dramatis
  scene.fog = new THREE.FogExp2(0x04080f, 0.018);

  // ── Pencahayaan ──
  scene.add(new THREE.AmbientLight(0x0a1a10, 1.0));
  var sun = new THREE.DirectionalLight(0x00ff88, 1.8);
  sun.position.set(10, 30, 10);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x4466ff, 0.6);
  fill.position.set(-15, 10, -10);
  scene.add(fill);

  // ── Lantai hex grid ──
  _s6_buildFloor();

  // ── Kristal tengah (trophy/goal) ──
  _s6_buildCenterCrystal();

  // ── Misi orbs melingkar ──
  _s6_buildMissionOrbs();

  // ── Partikel ambient ──
  _s6_spawnParticles();

  // ── Kamera ──
  orbit.radius = 35;
  orbit.phi = 0.72;
  orbit.theta = 0.2;
  orbit.tx = 0; orbit.ty = 3; orbit.tz = 0;
  applyOrbit();

  // ── Inject UI RPG ──
  _s6_injectUI();

  // ── Update narasi ──
  var nEl = document.getElementById('narasi-text');
  if (nEl) nEl.textContent = 'Misi menantimu, Pahlawan Ekosistem! Pelajari tantanganmu sebelum memulai desain.';

  // ── Loop ──
  _s6_startLoop();
}

// ============================================================
// FLOOR — Hex Grid Cyberpunk
// ============================================================
function _s6_buildFloor() {
  // Base plate
  var floor = new THREE.Mesh(
    new THREE.CircleGeometry(28, 64),
    new THREE.MeshPhongMaterial({ color: 0x050d18, side: THREE.DoubleSide })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid rings
  for (var r = 4; r <= 24; r += 4) {
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.04, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x003322, transparent: true, opacity: 0.4 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
  }

  // Radial lines
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2;
    var lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(Math.cos(angle) * 26, 0.02, Math.sin(angle) * 26)
    ]);
    var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x003322, transparent: true, opacity: 0.35 }));
    scene.add(line);
  }

  // Glowing outer ring
  var outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(25, 0.12, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.25 })
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.03;
  outerRing.userData.pulseRing = true;
  scene.add(outerRing);
  s6_rings.push(outerRing);
}

// ============================================================
// CENTER CRYSTAL — Goal Trophy
// ============================================================
function _s6_buildCenterCrystal() {
  // Base pedestal
  var ped = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.8, 0.5, 8),
    new THREE.MeshPhongMaterial({ color: 0x0d2f1a, emissive: new THREE.Color(0x00e676).multiplyScalar(0.12) })
  );
  ped.position.set(0, 0.25, 0);
  scene.add(ped);

  // Glow ring around pedestal
  for (var j = 0; j < 3; j++) {
    var gr = new THREE.Mesh(
      new THREE.TorusGeometry(2.5 + j * 0.6, 0.06, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.2 - j * 0.05 })
    );
    gr.rotation.x = Math.PI / 2;
    gr.position.y = 0.5;
    gr.userData.rotSpeed = (j % 2 === 0 ? 0.4 : -0.3);
    scene.add(gr);
    s6_rings.push(gr);
  }

  // Crystal body — pyramid + inverted pyramid = diamond
  var crystalMat = new THREE.MeshPhongMaterial({
    color: 0x00e676,
    emissive: new THREE.Color(0x00e676).multiplyScalar(0.3),
    transparent: true,
    opacity: 0.85,
    shininess: 200
  });

  var top = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 6), crystalMat);
  top.position.set(0, 2.5, 0);
  top.userData.floatY = true; top.userData.baseY = 2.5;
  scene.add(top);
  s6_crystals.push(top);

  var bot = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.4, 6), crystalMat.clone());
  bot.rotation.x = Math.PI;
  bot.position.set(0, 1.2, 0);
  bot.userData.floatY = true; bot.userData.baseY = 1.2;
  scene.add(bot);
  s6_crystals.push(bot);

  // Inner glow orb
  var glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.55 })
  );
  glow.position.set(0, 1.85, 0);
  glow.userData.floatY = true; glow.userData.baseY = 1.85;
  glow.userData.isGlow = true;
  scene.add(glow);
  s6_crystals.push(glow);

  // Point light at crystal
  var pl = new THREE.PointLight(0x00ff88, 3.5, 18);
  pl.position.set(0, 3, 0);
  pl.userData.baseInt = 3.5;
  pl.userData.pulseOff = 0;
  scene.add(pl);
  s6_lights6.push(pl);

  // Stars/sparkles around crystal
  for (var k = 0; k < 16; k++) {
    var ang = (k / 16) * Math.PI * 2;
    var rad = 1.8 + Math.random() * 0.8;
    var sp = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08 + Math.random() * 0.06, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    );
    sp.position.set(Math.cos(ang)*rad, 1.5 + Math.random()*1.5, Math.sin(ang)*rad);
    sp.userData.sparkAngle = ang;
    sp.userData.sparkRad = rad;
    sp.userData.sparkSpeed = 0.3 + Math.random() * 0.4;
    sp.userData.sparkPhase = Math.random() * Math.PI * 2;
    scene.add(sp);
    s6_particles.push(sp);
  }
}

// ============================================================
// MISSION ORBS — 5 orb melingkar
// ============================================================
function _s6_buildMissionOrbs() {
  for (var i = 0; i < S6_MISSIONS.length; i++) {
    var m = S6_MISSIONS[i];
    var ang = (i / S6_MISSIONS.length) * Math.PI * 2 - Math.PI / 2;
    var radius = 11;
    var ox = Math.cos(ang) * radius;
    var oz = Math.sin(ang) * radius;

    // Platform
    var plat = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.3, 0.3, 6),
      new THREE.MeshPhongMaterial({
        color: m.hex,
        emissive: new THREE.Color(m.hex).multiplyScalar(0.15),
        transparent: true, opacity: 0.75
      })
    );
    plat.position.set(ox, 0.15, oz);
    scene.add(plat);

    // Glow ring
    var orbRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.07, 8, 24),
      new THREE.MeshBasicMaterial({ color: m.hex, transparent: true, opacity: 0.45 })
    );
    orbRing.rotation.x = Math.PI / 2;
    orbRing.position.set(ox, 0.3, oz);
    orbRing.userData.rotSpeed = (i % 2 === 0 ? 0.8 : -0.7);
    scene.add(orbRing);
    s6_rings.push(orbRing);

    // Orb sphere
    var orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 20, 20),
      new THREE.MeshPhongMaterial({
        color: m.hex,
        emissive: new THREE.Color(m.hex).multiplyScalar(0.35),
        transparent: true,
        opacity: 0.88,
        shininess: 150
      })
    );
    orb.position.set(ox, 1.9, oz);
    orb.userData.floatY = true;
    orb.userData.baseY = 1.9;
    orb.userData.floatSpeed = 0.5 + i * 0.12;
    orb.userData.floatPhase = (i / S6_MISSIONS.length) * Math.PI * 2;
    orb.userData.missionId = m.id;
    scene.add(orb);
    s6_orbs.push(orb);

    // Icon label (text sprite simulation via small plane)
    var orbLight = new THREE.PointLight(m.hex, 1.2, 8);
    orbLight.position.set(ox, 2.8, oz);
    orbLight.userData.baseInt = 1.2;
    orbLight.userData.pulseOff = (i / S6_MISSIONS.length) * Math.PI * 2;
    scene.add(orbLight);
    s6_lights6.push(orbLight);

    // Energy beam from orb to crystal
    var pts = [];
    var steps = 20;
    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var cx = ox * (1-t);
      var cz = oz * (1-t);
      var cy = 1.9 + Math.sin(t * Math.PI) * 2.5;
      pts.push(new THREE.Vector3(cx, cy, cz));
    }
    var beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
    var beam = new THREE.Line(beamGeo,
      new THREE.LineBasicMaterial({ color: m.hex, transparent: true, opacity: 0.12 })
    );
    scene.add(beam);
  }
}

// ============================================================
// AMBIENT PARTICLES
// ============================================================
function _s6_spawnParticles() {
  var colors = [0x00e676, 0x42a5f5, 0xffca28, 0xff7043, 0xce93d8, 0x80deea];
  for (var i = 0; i < 80; i++) {
    var c = colors[Math.floor(Math.random() * colors.length)];
    var p = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 + Math.random() * 0.07, 6, 6),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3 + Math.random() * 0.4 })
    );
    var ang = Math.random() * Math.PI * 2;
    var dist = 3 + Math.random() * 22;
    p.position.set(Math.cos(ang)*dist, 0.3 + Math.random() * 7, Math.sin(ang)*dist);
    p.userData.pvy = 0.004 + Math.random() * 0.008;
    p.userData.pvx = (Math.random() - 0.5) * 0.003;
    p.userData.pvz = (Math.random() - 0.5) * 0.003;
    p.userData.pmaxY = 8 + Math.random() * 3;
    p.userData.pBaseX = p.position.x;
    p.userData.pBaseZ = p.position.z;
    p.userData.isParticle = true;
    scene.add(p);
    s6_particles.push(p);
  }
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function _s6_startLoop() {
  var lastT = performance.now();
  var ref = s6_sceneRef;
  function tick(now) {
    if (!scene || scene !== ref) return;
    var dt = Math.min((now - lastT)/1000, 0.1);
    lastT = now;
    s6_ticker += dt;
    var t = s6_ticker;

    // Crystals float & rotate
    for (var i = 0; i < s6_crystals.length; i++) {
      var c = s6_crystals[i];
      if (c.userData.floatY) {
        c.position.y = c.userData.baseY + Math.sin(t * 1.1) * 0.25;
      }
      if (!c.userData.isGlow) {
        c.rotation.y += 0.4 * dt;
      }
      if (c.userData.isGlow) {
        var sc = 0.9 + Math.sin(t * 2.2) * 0.15;
        c.scale.setScalar(sc);
        c.material.opacity = 0.4 + Math.sin(t * 2.5) * 0.2;
      }
    }

    // Rings rotate
    for (var j = 0; j < s6_rings.length; j++) {
      var rn = s6_rings[j];
      if (rn.userData.rotSpeed !== undefined) {
        rn.rotation.z += rn.userData.rotSpeed * dt;
      }
      if (rn.userData.pulseRing) {
        rn.material.opacity = 0.15 + Math.sin(t * 1.5) * 0.12;
      }
    }

    // Orbs float
    for (var k = 0; k < s6_orbs.length; k++) {
      var ob = s6_orbs[k];
      ob.position.y = ob.userData.baseY + Math.sin(t * ob.userData.floatSpeed + ob.userData.floatPhase) * 0.3;
      ob.rotation.y += 0.25 * dt;
    }

    // Lights pulse
    for (var l = 0; l < s6_lights6.length; l++) {
      var lt = s6_lights6[l];
      lt.intensity = lt.userData.baseInt + Math.sin(t * 2.0 + lt.userData.pulseOff) * 0.3;
    }

    // Particles
    for (var p = 0; p < s6_particles.length; p++) {
      var pt = s6_particles[p];
      if (pt.userData.isParticle) {
        pt.position.y += pt.userData.pvy;
        pt.position.x += pt.userData.pvx;
        pt.position.z += pt.userData.pvz;
        if (pt.position.y > pt.userData.pmaxY) {
          pt.position.y = 0.2;
          pt.position.x = pt.userData.pBaseX + (Math.random()-0.5)*2;
          pt.position.z = pt.userData.pBaseZ + (Math.random()-0.5)*2;
        }
      } else {
        // sparkle around crystal
        pt.userData.sparkAngle += pt.userData.sparkSpeed * dt;
        var sa = pt.userData.sparkAngle;
        var sr = pt.userData.sparkRad;
        pt.position.x = Math.cos(sa) * sr;
        pt.position.z = Math.sin(sa) * sr;
        pt.position.y = 1.5 + Math.sin(t * 2 + pt.userData.sparkPhase) * 0.8;
        pt.rotation.x += 1.5 * dt;
        pt.rotation.y += 2.0 * dt;
        var sOpacity = 0.4 + Math.sin(t*3 + pt.userData.sparkPhase) * 0.35;
        pt.material.opacity = Math.max(0.05, sOpacity);
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============================================================
// UI INJECTION — RPG Mission Briefing
// ============================================================
function _s6_injectUI() {
  // Cleanup old
  ['s6-style','s6-panel','s6-mission-modal','s6-guide-char'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.remove();
  });

  // ── STYLES ──
  var style = document.createElement('style');
  style.id = 's6-style';
  style.textContent = `
    /* ── RPG Badge ── */
    #s6-badge {
      position:fixed; top:9px; left:50%; transform:translateX(-50%); z-index:80;
      background:rgba(0,15,5,0.88); border:1.5px solid rgba(0,230,118,0.38);
      border-radius:20px; padding:5px 22px;
      font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
      color:#00e676; letter-spacing:1.5px; text-transform:uppercase;
      pointer-events:none; backdrop-filter:blur(12px);
      animation: s6badgePop 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both;
    }
    @keyframes s6badgePop {
      from { opacity:0; transform:translateX(-50%) scale(0.8); }
      to   { opacity:1; transform:translateX(-50%) scale(1); }
    }

    /* ── Guide Character Panel ── */
    #s6-guide-char {
      position:fixed; bottom:110px; left:16px; z-index:75;
      display:flex; align-items:flex-end; gap:10px;
      animation: s6slideIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s both;
    }
    @keyframes s6slideIn {
      from { opacity:0; transform:translateX(-40px); }
      to   { opacity:1; transform:translateX(0); }
    }
    #s6-avatar {
      width:68px; height:68px; border-radius:50%;
      border:2.5px solid rgba(0,230,118,0.55);
      background: radial-gradient(circle at 35% 35%, #1a3a2a 0%, #050d18 100%);
      display:flex; align-items:center; justify-content:center;
      font-size:32px; flex-shrink:0;
      box-shadow:0 0 18px rgba(0,230,118,0.3);
      animation: s6avatarFloat 3s ease-in-out infinite;
    }
    @keyframes s6avatarFloat {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-5px); }
    }
    #s6-speech-bubble {
      background:rgba(4,12,22,0.96); border:1.5px solid rgba(0,230,118,0.3);
      border-radius:14px 14px 14px 4px; padding:12px 16px;
      max-width:230px; backdrop-filter:blur(16px);
      font-size:12.5px; line-height:1.6; color:rgba(200,240,220,0.85);
      position:relative;
    }
    #s6-speech-bubble::before {
      content:''; position:absolute; left:-8px; bottom:14px;
      border:8px solid transparent;
      border-right-color:rgba(0,230,118,0.3);
    }
    #s6-guide-name {
      font-family:'Syne',sans-serif; font-size:10px; font-weight:700;
      color:#00e676; letter-spacing:1px; text-transform:uppercase;
      margin-bottom:5px;
    }
    #s6-typing-text { min-height:40px; }
    #s6-cursor { display:inline-block; width:2px; height:12px;
      background:#00e676; margin-left:1px; vertical-align:middle;
      animation: s6blink 0.7s ease-in-out infinite; }
    @keyframes s6blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

    /* ── Mission Cards Panel ── */
    #s6-panel {
      position:fixed; top:50%; right:14px; transform:translateY(-50%); z-index:70;
      width:220px; display:flex; flex-direction:column; gap:8px;
      animation: s6panelIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.7s both;
    }
    @keyframes s6panelIn {
      from { opacity:0; transform:translateY(-50%) translateX(30px); }
      to   { opacity:1; transform:translateY(-50%) translateX(0); }
    }
    .s6-panel-title {
      font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
      color:rgba(0,230,118,0.65); letter-spacing:2px; text-transform:uppercase;
      padding:0 4px 6px; border-bottom:1px solid rgba(0,230,118,0.15);
    }
    .s6-mcard {
      background:rgba(4,10,20,0.92); border:1.5px solid rgba(255,255,255,0.07);
      border-radius:12px; padding:10px 12px; cursor:pointer;
      display:flex; align-items:center; gap:10px;
      transition:all 0.25s ease; backdrop-filter:blur(10px);
      animation: s6cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }
    .s6-mcard:nth-child(2) { animation-delay:0.85s; }
    .s6-mcard:nth-child(3) { animation-delay:0.95s; }
    .s6-mcard:nth-child(4) { animation-delay:1.05s; }
    .s6-mcard:nth-child(5) { animation-delay:1.15s; }
    .s6-mcard:nth-child(6) { animation-delay:1.25s; }
    @keyframes s6cardIn {
      from { opacity:0; transform:translateX(20px); }
      to   { opacity:1; transform:translateX(0); }
    }
    .s6-mcard:hover {
      transform:translateX(-4px) scale(1.02);
      box-shadow: 0 0 16px rgba(0,230,118,0.15);
    }
    .s6-mcard-icon {
      width:34px; height:34px; border-radius:10px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-size:18px; background:rgba(255,255,255,0.06);
    }
    .s6-mcard-info { flex:1; min-width:0; }
    .s6-mcard-name {
      font-family:'Syne',sans-serif; font-size:11.5px; font-weight:700;
      color:#f0f4f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .s6-mcard-xp {
      font-size:10px; font-weight:600; margin-top:2px;
      font-family:'Syne',sans-serif; letter-spacing:0.5px;
    }

    /* ── XP Bar ── */
    #s6-xp-bar-wrap {
      background:rgba(4,10,20,0.92); border:1.5px solid rgba(0,230,118,0.15);
      border-radius:10px; padding:8px 12px; margin-top:4px;
      animation: s6cardIn 0.5s cubic-bezier(0.22,1,0.36,1) 1.4s both;
    }
    .s6-xp-label {
      font-family:'Syne',sans-serif; font-size:9.5px; font-weight:700;
      color:rgba(0,230,118,0.6); letter-spacing:1.5px; text-transform:uppercase;
      margin-bottom:5px; display:flex; justify-content:space-between;
    }
    .s6-xp-track {
      height:5px; background:rgba(255,255,255,0.07); border-radius:4px; overflow:hidden;
    }
    .s6-xp-fill {
      height:100%; width:0%; border-radius:4px;
      background:linear-gradient(90deg,#00e676,#42a5f5);
      animation: s6xpFill 2s cubic-bezier(0.4,0,0.2,1) 1.6s both;
    }
    @keyframes s6xpFill { from{width:0%} to{width:78%} }

    /* ── CTA Button ── */
    #s6-cta-btn {
      width:100%; padding:12px; margin-top:6px; border-radius:12px;
      background:linear-gradient(135deg,rgba(0,230,118,0.2),rgba(66,165,245,0.1));
      border:1.5px solid rgba(0,230,118,0.5);
      color:#00e676; font-family:'Syne',sans-serif;
      font-size:13px; font-weight:800; letter-spacing:1px;
      cursor:pointer; transition:all 0.3s ease;
      text-transform:uppercase;
      animation: s6cardIn 0.5s cubic-bezier(0.22,1,0.36,1) 1.6s both;
      box-shadow: 0 0 20px rgba(0,230,118,0.15);
    }
    #s6-cta-btn:hover {
      background:linear-gradient(135deg,rgba(0,230,118,0.35),rgba(66,165,245,0.2));
      transform:scale(1.04); box-shadow:0 0 30px rgba(0,230,118,0.35);
    }
    #s6-cta-btn:active { transform:scale(0.97); }

    /* ── Mission Modal Popup ── */
    #s6-mission-modal {
      display:none; position:fixed; inset:0; z-index:200;
      background:rgba(3,8,18,0.82); backdrop-filter:blur(14px);
      align-items:center; justify-content:center;
    }
    #s6-mission-modal.open { display:flex; }
    #s6-modal-card {
      background:rgba(5,12,24,0.98); border-radius:24px;
      padding:36px 32px; max-width:340px; width:90%;
      text-align:center; position:relative;
      animation: s6modalIn 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes s6modalIn {
      from { opacity:0; transform:scale(0.85) translateY(20px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    #s6-modal-close {
      position:absolute; top:14px; right:16px;
      font-size:18px; color:rgba(255,255,255,0.3);
      cursor:pointer; transition:color 0.2s; line-height:1;
    }
    #s6-modal-close:hover { color:rgba(255,255,255,0.8); }
    #s6-modal-icon { font-size:52px; margin-bottom:10px; display:block; }
    #s6-modal-title {
      font-family:'Syne',sans-serif; font-size:22px; font-weight:800;
      margin-bottom:8px; letter-spacing:0.5px;
    }
    #s6-modal-desc {
      font-size:13.5px; line-height:1.75;
      color:rgba(200,230,210,0.78); margin-bottom:18px;
    }
    #s6-modal-xp-badge {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.3);
      border-radius:20px; padding:6px 16px; margin-bottom:18px;
      font-family:'Syne',sans-serif; font-size:12px; font-weight:700;
      color:#00e676; letter-spacing:0.5px;
    }
    #s6-modal-bar-wrap {
      height:6px; background:rgba(255,255,255,0.07);
      border-radius:4px; overflow:hidden; margin-top:4px;
    }
    #s6-modal-bar-fill {
      height:100%; border-radius:4px;
      transition:width 0.8s cubic-bezier(0.4,0,0.2,1);
    }

    /* ── Floating XP Chips (confetti-like) ── */
    .s6-xp-chip {
      position:fixed; pointer-events:none; z-index:300;
      font-family:'Syne',sans-serif; font-size:13px; font-weight:800;
      color:#00e676; text-shadow:0 0 8px rgba(0,230,118,0.8);
      animation: s6chipFly 1.2s ease-out forwards;
    }
    @keyframes s6chipFly {
      0%   { opacity:1; transform:translateY(0) scale(1); }
      100% { opacity:0; transform:translateY(-60px) scale(0.6); }
    }

    /* ── LEVEL Badge ── */
    #s6-level-badge {
      position:fixed; top:52px; left:16px; z-index:76;
      background:rgba(4,10,20,0.92); border:1.5px solid rgba(255,202,40,0.4);
      border-radius:14px; padding:7px 14px;
      display:flex; align-items:center; gap:8px;
      animation: s6cardIn 0.5s cubic-bezier(0.22,1,0.36,1) 1.8s both;
      backdrop-filter:blur(12px);
    }
    #s6-lv-icon { font-size:18px; }
    #s6-lv-info { display:flex; flex-direction:column; }
    #s6-lv-label {
      font-size:9px; letter-spacing:2px; text-transform:uppercase;
      color:rgba(255,202,40,0.6); font-family:'Syne',sans-serif; font-weight:700;
    }
    #s6-lv-val {
      font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#ffca28;
      line-height:1.1;
    }
  `;
  document.body.appendChild(style);

  // ── Badge ──
  var badge = document.createElement('div');
  badge.id = 's6-badge';
  badge.textContent = '⚔️ Mission Briefing — Ekosistem Quest';
  document.body.appendChild(badge);

  // ── Level Badge ──
  var lvBadge = document.createElement('div');
  lvBadge.id = 's6-level-badge';
  lvBadge.innerHTML =
    '<div id="s6-lv-icon">🏆</div>' +
    '<div id="s6-lv-info"><div id="s6-lv-label">Level</div><div id="s6-lv-val">6 / 10</div></div>';
  document.body.appendChild(lvBadge);

  // ── Guide Character ──
  var guide = document.createElement('div');
  guide.id = 's6-guide-char';
  guide.innerHTML =
    '<div id="s6-avatar">🌱</div>' +
    '<div id="s6-speech-bubble">' +
      '<div id="s6-guide-name">🤖 EcoBot — Panduan</div>' +
      '<div id="s6-typing-text"><span id="s6-typed"></span><span id="s6-cursor"></span></div>' +
    '</div>';
  document.body.appendChild(guide);

  // ── Mission Cards ──
  var panel = document.createElement('div');
  panel.id = 's6-panel';
  var html = '<div class="s6-panel-title">📋 Misi Aktif</div>';
  for (var i = 0; i < S6_MISSIONS.length; i++) {
    var m = S6_MISSIONS[i];
    html +=
      '<div class="s6-mcard" onclick="s6_openMission(\'' + m.id + '\')" style="border-color:' + m.color + '22;">' +
        '<div class="s6-mcard-icon" style="background:' + m.color + '18;">' + m.icon + '</div>' +
        '<div class="s6-mcard-info">' +
          '<div class="s6-mcard-name">' + m.title + '</div>' +
          '<div class="s6-mcard-xp" style="color:' + m.color + '">+' + m.xp + ' XP</div>' +
        '</div>' +
      '</div>';
  }
  html +=
    '<div id="s6-xp-bar-wrap">' +
      '<div class="s6-xp-label"><span>Progress EXP</span><span style="color:#f0f4f0">740 / 950</span></div>' +
      '<div class="s6-xp-track"><div class="s6-xp-fill"></div></div>' +
    '</div>' +
    '<button id="s6-cta-btn" onclick="s6_startMission()">⚔️ Mulai Misi!</button>';
  panel.innerHTML = html;
  document.body.appendChild(panel);

  // ── Mission Modal ──
  var modal = document.createElement('div');
  modal.id = 's6-mission-modal';
  modal.innerHTML =
    '<div id="s6-modal-card">' +
      '<span id="s6-modal-close" onclick="s6_closeModal()">✕</span>' +
      '<span id="s6-modal-icon">🌿</span>' +
      '<div id="s6-modal-title">Judul Misi</div>' +
      '<div id="s6-modal-xp-badge">⭐ +150 XP</div>' +
      '<div id="s6-modal-desc">Deskripsi misi.</div>' +
      '<div id="s6-modal-bar-wrap"><div id="s6-modal-bar-fill" style="width:0%"></div></div>' +
    '</div>';
  document.body.appendChild(modal);

  // Click modal backdrop close
  modal.addEventListener('click', function(e){
    if (e.target === modal) s6_closeModal();
  });

  // ── Start typing animation ──
  _s6_typeText("Hei, Pahlawan Ekosistem! 🌍 Bumi membutuhkanmu. Pelajari setiap misi, lalu rancang ekosistemmu sendiri dan selamatkan lingkungan!");
}

// ── Typing Effect ──
var _s6_typeTimeout = null;
function _s6_typeText(msg) {
  var el = document.getElementById('s6-typed');
  if (!el) return;
  if (_s6_typeTimeout) clearTimeout(_s6_typeTimeout);
  el.textContent = '';
  var i = 0;
  function next() {
    if (!document.getElementById('s6-typed')) return;
    if (i < msg.length) {
      el.textContent += msg[i];
      i++;
      _s6_typeTimeout = setTimeout(next, 28);
    }
  }
  next();
}

// ── Open Mission Modal ──
window.s6_openMission = function(id) {
  var m = null;
  for (var i = 0; i < S6_MISSIONS.length; i++) {
    if (S6_MISSIONS[i].id === id) { m = S6_MISSIONS[i]; break; }
  }
  if (!m) return;

  document.getElementById('s6-modal-icon').textContent = m.icon;
  document.getElementById('s6-modal-title').textContent = m.title;
  document.getElementById('s6-modal-title').style.color = m.color;
  document.getElementById('s6-modal-title').style.textShadow = '0 0 20px ' + m.color + '55';
  document.getElementById('s6-modal-xp-badge').textContent = '⭐ +' + m.xp + ' XP';
  document.getElementById('s6-modal-xp-badge').style.borderColor = m.color + '55';
  document.getElementById('s6-modal-xp-badge').style.color = m.color;
  document.getElementById('s6-modal-desc').textContent = m.desc;
  document.getElementById('s6-modal-card').style.borderColor = m.color + '55';
  document.getElementById('s6-modal-card').style.boxShadow = '0 0 40px ' + m.color + '22, 0 20px 60px rgba(0,0,0,0.6)';

  var fill = document.getElementById('s6-modal-bar-fill');
  fill.style.background = m.color;
  fill.style.width = '0%';
  setTimeout(function(){ fill.style.width = '100%'; }, 100);

  document.getElementById('s6-mission-modal').classList.add('open');

  // Update EcoBot speech
  _s6_typeText(m.icon + ' Misi: ' + m.title + ' — ' + m.desc);

  // Spawn XP chip
  _s6_spawnXpChip(m.xp, m.color);
};

window.s6_closeModal = function() {
  document.getElementById('s6-mission-modal').classList.remove('open');
};

window.s6_startMission = function() {
  // Flash effect then go to next scene
  var flashEl = document.createElement('div');
  flashEl.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#00e676;opacity:0;pointer-events:none;transition:opacity 0.25s ease;';
  document.body.appendChild(flashEl);
  requestAnimationFrame(function(){
    flashEl.style.opacity = '0.6';
    setTimeout(function(){
      flashEl.style.opacity = '0';
      setTimeout(function(){ flashEl.remove(); nextScene(); }, 350);
    }, 220);
  });
};

// ── XP Chip spawn ──
function _s6_spawnXpChip(xp, color) {
  for (var k = 0; k < 3; k++) {
    (function(k){
      setTimeout(function(){
        var chip = document.createElement('div');
        chip.className = 's6-xp-chip';
        chip.textContent = '+' + xp + ' XP';
        chip.style.color = color;
        chip.style.textShadow = '0 0 8px ' + color;
        chip.style.left = (30 + Math.random() * 40) + '%';
        chip.style.top = (50 + Math.random() * 30) + '%';
        document.body.appendChild(chip);
        setTimeout(function(){ chip.remove(); }, 1200);
      }, k * 200);
    })(k);
  }
}

// ============================================================
// ENTRY POINT
// ============================================================
window.addEventListener('DOMContentLoaded', function() {
  startSceneApp(5);
});
