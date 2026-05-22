// ============================================================
// scene-5.js — Scene 5: Prinsip Ramah Lingkungan (GLB Version)
// 4 prinsip masing-masing ditampilkan dengan objek 3D GLB:
//   1. Daur Ulang        → sceen_5_bagian_1_recycle_1.glb
//   2. Energi Terbarukan → sceen_5_bagian_2_energi_terbarukan_solar_panel_1.glb
//   3. Pengelolaan Air   → sceen_5_bagian_3_pengelolaan_air_traktor_air_1.glb
//   4. Ruang Hijau       → sceen_5_bagian_4_ruang_hijau_kota_1.glb
// ============================================================
"use strict";

// Suppress unhandled promise rejections (GLB loader quirks)
window.addEventListener(
  "unhandledrejection",
  function (e) {
    e.preventDefault();
  },
  true,
);

// Suppress THREE r128 UV warnings
(function () {
  var _warn = console.warn.bind(console);
  console.warn = function () {
    var msg = String(arguments[0] || "");
    if (
      msg.indexOf("Custom UV set") !== -1 ||
      msg.indexOf("not yet supported") !== -1
    )
      return;
    _warn.apply(console, arguments);
  };
})();

function buildCurrentScene() {
  buildScene5();
}

// ============================================================
// DATA PRINSIP
// ============================================================
var S5_PRINCIPLES = [
  {
    key: "recycle",
    label: "\u267b\ufe0f Daur Ulang",
    icon: "\u267b\ufe0f",
    color: 0x2d9e50,
    glowHex: "#2d9e50",
    glbFile: "sceen_5_bagian_1_recycle_1.glb",
    title: "Daur Ulang",
    desc: "Mengolah kembali sampah menjadi bahan baru. Proses ini mengurangi limbah, menghemat energi, dan menekan polusi lingkungan secara signifikan.",
    x: -24,
    targetSize: 12,
  },
  {
    key: "solar",
    label: "\u26a1 Energi Terbarukan",
    icon: "\u26a1",
    color: 0xf4a800,
    glowHex: "#f4a800",
    glbFile: "sceen_5_bagian_2_energi_terbarukan_solar_panel_1.glb",
    title: "Energi Terbarukan",
    desc: "Memanfaatkan matahari, angin, dan air sebagai sumber energi bersih tanpa menghasilkan emisi karbon. Kunci transisi menuju masa depan berkelanjutan.",
    x: -8,
    targetSize: 12,
  },
  {
    key: "water",
    label: "\ud83d\udca7 Pengelolaan Air",
    icon: "\ud83d\udca7",
    color: 0x1565c0,
    glowHex: "#42a5f5",
    glbFile: "sceen_5_bagian_3_pengelolaan_air_traktor_air_1.glb",
    title: "Pengelolaan Air",
    desc: "Konservasi air, daur ulang air limbah, dan penangkapan air hujan. Memastikan ketersediaan air bersih untuk ekosistem dan kehidupan manusia.",
    x: 8,
    targetSize: 12,
  },
  {
    key: "green",
    label: "\ud83c\udf33 Ruang Hijau",
    icon: "\ud83c\udf33",
    color: 0x1a6b2f,
    glowHex: "#00e676",
    glbFile: "sceen_5_bagian_4_ruang_hijau_kota_1.glb",
    title: "Ruang Hijau",
    desc: "Hutan kota, taman, dan koridor hijau untuk biodiversitas, produksi oksigen, penyerapan karbon, dan kesehatan mental masyarakat kota.",
    x: 24,
    targetSize: 12,
  },
];

// ============================================================
// STATE
// ============================================================
var s5_models = {};
var s5_rings = [];
var s5_lights = [];
var s5_activeKey = null;
var s5_loadedCount = 0;
var s5_particles = [];
var s5_ticker_t = 0;

// ============================================================
// BUILD
// ============================================================
function buildScene5() {
  s5_models = {};
  s5_rings = [];
  s5_lights = [];
  s5_particles = [];
  s5_activeKey = null;
  s5_loadedCount = 0;
  s5_ticker_t = 0;

  scene.background = new THREE.Color(0x060f1a);

  // Pencahayaan
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  var sun = new THREE.DirectionalLight(0xfff8dc, 2.0);
  sun.position.set(20, 40, 20);
  sun.castShadow = true;
  scene.add(sun);

  var sun2 = new THREE.DirectionalLight(0xffffff, 0.8);
  sun2.position.set(-20, 20, -10);
  scene.add(sun2);

  scene.add(new THREE.HemisphereLight(0x88ccff, 0x223322, 0.5));

  // Lantai & grid
  _s5_buildFloor();

  // Partikel ambient
  _s5_spawnAmbientParticles();

  // Kamera
  orbit.radius = 42;
  orbit.phi = 0.56;
  orbit.theta = 0.1;
  orbit.tx = 0;
  orbit.ty = 5;
  orbit.tz = 0;
  applyOrbit();

  // Inject UI
  _s5_injectUI();

  // Bangun tiap prinsip
  for (var i = 0; i < S5_PRINCIPLES.length; i++) {
    var p = S5_PRINCIPLES[i];
    _s5_buildPlatform(p);
    _s5_buildRings(p);
    _s5_buildPointLight(p);
    (function (pk) {
      addInteractBtn(
        S5_PRINCIPLES.find(function (x) {
          return x.key === pk;
        }).label,
        function () {
          _s5_openInfo(pk);
        },
      );
    })(p.key);
    _s5_loadPrincipleGLB(p);
  }

  // Narasi
  var nEl = document.getElementById("narasi-text");
  if (nEl)
    nEl.textContent =
      "Memuat objek 3D... Klik tombol di bawah untuk mempelajari tiap prinsip ramah lingkungan!";

  // Start custom animation loop
  _s5_startCustomLoop();
}

// ── Lantai ──
function _s5_buildFloor() {
  var base = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 50),
    new THREE.MeshPhongMaterial({ color: 0x060f1a, side: THREE.DoubleSide }),
  );
  base.rotation.x = -Math.PI / 2;
  base.receiveShadow = true;
  scene.add(base);

  var grid = new THREE.GridHelper(100, 50, 0x0d2f0d, 0x0d2520);
  grid.position.y = 0.01;
  scene.add(grid);
}

// ── Platform hexagonal ──
function _s5_buildPlatform(p) {
  var pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(6.2, 6.2, 0.42, 6),
    new THREE.MeshPhongMaterial({
      color: p.color,
      transparent: true,
      opacity: 0.82,
      emissive: new THREE.Color(p.color).multiplyScalar(0.18),
    }),
  );
  pedestal.position.set(p.x, 0.21, 0);
  pedestal.castShadow = true;
  scene.add(pedestal);

  var edge = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.11, 8, 6),
    new THREE.MeshBasicMaterial({
      color: p.color,
      transparent: true,
      opacity: 0.55,
    }),
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.set(p.x, 0.42, 0);
  scene.add(edge);
}

// ── Torus rings dekoratif ──
function _s5_buildRings(p) {
  for (var j = 0; j < 2; j++) {
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.8 + j * 1.6, 0.09, 8, 24),
      new THREE.MeshBasicMaterial({
        color: p.color,
        transparent: true,
        opacity: 0.18 - j * 0.06,
      }),
    );
    ring.position.set(p.x, 0.46, 0);
    ring.rotation.x = Math.PI / 2;
    ring.userData.rotZ = (j % 2 === 0 ? 0.55 : -0.4) + j * 0.08;
    ring.userData.ringOwner = p.key;
    scene.add(ring);
    s5_rings.push(ring);
  }
}

// ── Point light ──
function _s5_buildPointLight(p) {
  var pl = new THREE.PointLight(p.color, 1.4, 30);
  pl.position.set(p.x, 12, 0);
  pl.userData.baseInt = 1.4;
  pl.userData.pulseOff = Math.random() * Math.PI * 2;
  scene.add(pl);
  s5_lights.push(pl);
}

// ── Load GLB ──
function _s5_loadPrincipleGLB(p) {
  loadGLB("s5_" + p.key, p.glbFile, function (model) {
    // --- FIT UKURAN ---
    // Tambahkan model ke scene SEMENTARA agar matrix world terhitung dengan benar
    // (menangani kasus model dengan nested scale seperti GLB Sketchfab cm-unit)
    scene.add(model);
    model.updateMatrixWorld(true);
    var box = new THREE.Box3().setFromObject(model);
    scene.remove(model);

    var size = box.getSize(new THREE.Vector3());
    var maxD = Math.max(size.x, size.y, size.z);

    // Simpan native maxD sebelum scaling (untuk rescale setelah semua model loaded)
    model.userData.s5NativeMaxD = maxD > 0 ? maxD : 1.0;

    if (maxD > 0) model.scale.setScalar(p.targetSize / maxD);

    // Posisi center XZ, di atas platform (hitung ulang setelah scale)
    scene.add(model);
    model.updateMatrixWorld(true);
    var box2 = new THREE.Box3().setFromObject(model);
    scene.remove(model);
    var ctr = box2.getCenter(new THREE.Vector3());
    model.position.x = p.x - ctr.x;
    model.position.z = -ctr.z;
    model.position.y = -box2.min.y + 0.55;

    // Shadow
    model.traverse(function (c) {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    // Data animasi (pakai prefix s5_ agar tidak bentrok shared.js)
    model.userData.s5Float = 0.28 + Math.random() * 0.12;
    model.userData.s5BaseY = model.position.y;
    model.userData.s5RotY = 0.18 + Math.random() * 0.12;
    model.userData.s5Seed = Math.random() * Math.PI * 2;
    model.userData.s5Key = p.key;
    model.userData.s5Hl = false; // highlighted
    // PENTING: simpan scale hasil normalisasi agar animasi tidak override ke 1.0
    model.userData.s5BaseScale = model.scale.x;

    // Disable shared.js float/rotY traverse agar tidak konflik
    model.traverse(function (c) {
      delete c.userData.floatY;
      delete c.userData.rotY;
      delete c.userData.pulse;
    });

    s5_models[p.key] = model;
    scene.add(model);

    s5_loadedCount++;
    if (s5_loadedCount === S5_PRINCIPLES.length) {
      // Semua model loaded → rescale 1-3 agar sama ukurannya dengan model 4
      _s5_rescaleToMatchGreen();

      var nEl2 = document.getElementById("narasi-text");
      if (nEl2)
        nEl2.textContent =
          "Semua objek 3D siap! Klik tombol di bawah untuk mempelajari tiap prinsip.";
    }
  });
}

// ============================================================
// REPOSISI MODEL setelah semua load — tidak rescale ulang
// karena semua model sudah pakai targetSize yang sama (9 unit)
// ============================================================
function _s5_rescaleToMatchGreen() {
  // Tidak melakukan rescale (semua sudah dinormalisasi ke targetSize=9).
  // Hanya perbaiki posisi agar duduk rapi di atas platform.
  var keys = ["recycle", "solar", "water", "green"];
  keys.forEach(function (key) {
    var m = s5_models[key];
    if (!m) return;
    var princ = null;
    for (var i = 0; i < S5_PRINCIPLES.length; i++) {
      if (S5_PRINCIPLES[i].key === key) {
        princ = S5_PRINCIPLES[i];
        break;
      }
    }
    if (!princ) return;
    m.position.set(0, 0, 0);
    m.updateMatrixWorld(true);
    var box = new THREE.Box3().setFromObject(m);
    var ctr = box.getCenter(new THREE.Vector3());
    m.position.x = princ.x - ctr.x;
    m.position.z = -ctr.z;
    m.position.y = -box.min.y + 0.65;
    m.userData.s5BaseY = m.position.y;
    m.updateMatrixWorld(true);
  });
}

// ============================================================
// PARTIKEL AMBIENT
// ============================================================
function _s5_spawnAmbientParticles() {
  var colors = [0x2d9e50, 0xf4a800, 0x1565c0, 0x1a6b2f, 0x00e676];
  for (var i = 0; i < 60; i++) {
    var clr = colors[Math.floor(Math.random() * colors.length)];
    var pm = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + Math.random() * 0.1, 6, 6),
      new THREE.MeshBasicMaterial({
        color: clr,
        transparent: true,
        opacity: 0.25 + Math.random() * 0.3,
      }),
    );
    pm.position.set(
      -22 + Math.random() * 44,
      0.5 + Math.random() * 8,
      (Math.random() - 0.5) * 10,
    );
    pm.userData.pvx = (Math.random() - 0.5) * 0.004;
    pm.userData.pvy = 0.005 + Math.random() * 0.008;
    pm.userData.pvz = (Math.random() - 0.5) * 0.003;
    pm.userData.pmaxY = 9 + Math.random() * 4;
    pm.userData.pstX = pm.position.x;
    pm.userData.floatY = undefined;
    pm.userData.rotY = undefined;
    scene.add(pm);
    s5_particles.push(pm);
  }
}

// ============================================================
// CUSTOM ANIMATION LOOP
// ============================================================
function _s5_startCustomLoop() {
  var lastTime = performance.now();
  var sceneRef = scene; // capture saat build

  function tick(now) {
    // Hentikan jika scene berganti (background berubah atau null)
    if (!scene || scene !== sceneRef) return;

    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    s5_ticker_t += dt;
    var t = s5_ticker_t;

    // Update partikel
    for (var ip = 0; ip < s5_particles.length; ip++) {
      var pm = s5_particles[ip];
      pm.position.x += pm.userData.pvx;
      pm.position.y += pm.userData.pvy;
      pm.position.z += pm.userData.pvz;
      if (pm.position.y > pm.userData.pmaxY) {
        pm.position.y = 0.3;
        pm.position.x = pm.userData.pstX + (Math.random() - 0.5) * 2;
        pm.position.z = (Math.random() - 0.5) * 5;
      }
    }

    // Update point light pulse
    for (var il = 0; il < s5_lights.length; il++) {
      var pl = s5_lights[il];
      pl.intensity =
        pl.userData.baseInt + Math.sin(t * 1.8 + pl.userData.pulseOff) * 0.18;
    }

    // Update ring rotasi
    for (var ir = 0; ir < s5_rings.length; ir++) {
      s5_rings[ir].rotation.z += s5_rings[ir].userData.rotZ * dt;
    }

    // Update model float + highlight + rotasi
    for (var ip2 = 0; ip2 < S5_PRINCIPLES.length; ip2++) {
      var p = S5_PRINCIPLES[ip2];
      var m = s5_models[p.key];
      if (!m) continue;

      var seed = m.userData.s5Seed || 0;
      var baseY = m.userData.s5BaseY || 0;
      var fY = m.userData.s5Float || 0.3;
      m.position.y = baseY + Math.sin(t * fY + seed) * 0.22;

      m.rotation.y += (m.userData.s5RotY || 0.2) * dt;

      // Gunakan s5BaseScale sebagai referensi agar normalisasi tidak di-override ke 1.0
      var baseScale =
        m.userData.s5BaseScale !== undefined ? m.userData.s5BaseScale : 1.0;
      var tgtSc = m.userData.s5Hl ? baseScale * 1.13 : baseScale;
      var curSc = m.scale.x;
      m.scale.setScalar(curSc + (tgtSc - curSc) * 0.09);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ============================================================
// INFO PANEL
// ============================================================
function _s5_openInfo(key) {
  var p = null;
  for (var i = 0; i < S5_PRINCIPLES.length; i++) {
    if (S5_PRINCIPLES[i].key === key) {
      p = S5_PRINCIPLES[i];
      break;
    }
  }
  if (!p) return;
  s5_activeKey = key;

  var panel = document.getElementById("s5-detail-panel");
  if (!panel) return;

  document.getElementById("s5-dp-icon").textContent = p.icon;
  document.getElementById("s5-dp-title").textContent = p.title;
  document.getElementById("s5-dp-body").textContent = p.desc;

  var barFill = document.getElementById("s5-dp-bar-fill");
  if (barFill) {
    barFill.style.background = p.glowHex;
    barFill.style.width = "100%";
  }

  panel.style.borderColor = p.glowHex + "55";
  panel.style.boxShadow =
    "0 0 32px " + p.glowHex + "22, 0 8px 30px rgba(0,0,0,0.5)";
  panel.style.display = "flex";

  for (var j = 0; j < S5_PRINCIPLES.length; j++) {
    var m = s5_models[S5_PRINCIPLES[j].key];
    if (m) m.userData.s5Hl = S5_PRINCIPLES[j].key === key;
  }
}

function _s5_closeDetailPanel() {
  var panel = document.getElementById("s5-detail-panel");
  if (panel) panel.style.display = "none";
  s5_activeKey = null;
  for (var i = 0; i < S5_PRINCIPLES.length; i++) {
    var m = s5_models[S5_PRINCIPLES[i].key];
    if (m) m.userData.s5Hl = false;
  }
}
window._s5_closeDetailPanel = _s5_closeDetailPanel;

// ============================================================
// UI INJECTION
// ============================================================
function _s5_injectUI() {
  ["s5-style", "s5-detail-panel", "s5-header-badge"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });

  var style = document.createElement("style");
  style.id = "s5-style";
  style.textContent =
    "#s5-detail-panel{display:none;flex-direction:column;position:fixed;top:88px;right:16px;z-index:70;" +
    "width:240px;background:rgba(4,12,22,0.96);border:1.5px solid rgba(0,230,118,0.22);" +
    'border-radius:20px;padding:18px 18px 16px;font-family:"DM Sans",sans-serif;' +
    "backdrop-filter:blur(18px);box-shadow:0 8px 32px rgba(0,0,0,0.5);" +
    "transition:border-color 0.4s,box-shadow 0.4s;}" +
    "#s5-dp-close{position:absolute;top:10px;right:12px;font-size:16px;" +
    "color:rgba(255,255,255,0.38);cursor:pointer;line-height:1;transition:color 0.2s;}" +
    "#s5-dp-close:hover{color:rgba(255,255,255,0.8);}" +
    "#s5-dp-icon{font-size:28px;margin-bottom:6px;display:block;}" +
    '#s5-dp-title{font-family:"Syne",sans-serif;font-size:15px;font-weight:800;' +
    "color:#f0f4f0;letter-spacing:0.3px;margin-bottom:8px;}" +
    "#s5-dp-body{font-size:12px;line-height:1.7;color:rgba(200,230,210,0.72);margin-bottom:12px;}" +
    "#s5-dp-bar{height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;}" +
    "#s5-dp-bar-fill{height:100%;width:0%;border-radius:3px;transition:width 0.9s cubic-bezier(0.4,0,0.2,1);}" +
    "#s5-header-badge{position:fixed;top:9px;left:50%;transform:translateX(-50%);z-index:80;" +
    "background:rgba(10,30,10,0.82);border:1.5px solid rgba(0,230,118,0.28);" +
    'border-radius:20px;padding:5px 20px;font-family:"Syne",sans-serif;' +
    "font-size:11px;font-weight:700;color:#00e676;letter-spacing:1px;" +
    "text-transform:uppercase;pointer-events:none;backdrop-filter:blur(10px);}";
  document.body.appendChild(style);

  var badge = document.createElement("div");
  badge.id = "s5-header-badge";
  badge.textContent = "\ud83c\udf0d Prinsip Ramah Lingkungan";
  document.body.appendChild(badge);

  var panel = document.createElement("div");
  panel.id = "s5-detail-panel";
  panel.innerHTML =
    '<span id="s5-dp-close" onclick="window._s5_closeDetailPanel()">\u2715</span>' +
    '<span id="s5-dp-icon">\u267b\ufe0f</span>' +
    '<div id="s5-dp-title">Judul</div>' +
    '<div id="s5-dp-body">Deskripsi prinsip.</div>' +
    '<div id="s5-dp-bar"><div id="s5-dp-bar-fill"></div></div>';
  document.body.appendChild(panel);
}

// ============================================================
// ENTRY POINT
// ============================================================
window.addEventListener("DOMContentLoaded", function () {
  startSceneApp(4);
});
