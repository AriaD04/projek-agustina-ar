// ============================================================
// scene-8.js — Scene 8: Simulasi Hasil
// Membaca desain dari scene-7 (localStorage) dan merender
// SEMUA 3D GLB objek yang sama persis di terrain yang sama.
// ============================================================
"use strict";

window.addEventListener(
  "unhandledrejection",
  function (e) {
    e.preventDefault();
  },
  true,
);
(function () {
  var _w = console.warn.bind(console);
  console.warn = function () {
    var m = String(arguments[0] || "");
    if (m.indexOf("Custom UV") + m.indexOf("not yet supported") > -2) return;
    _w.apply(console, arguments);
  };
})();

function buildCurrentScene() {
  buildScene8();
}

// ── Catalog from scene-7 (mirror) ──
var S8_ITEMS = {
  tree: { glb: "pohon.glb", targetSize: 4.5 },
  forest: { glb: "low_poly_tree_scene_free-compressed.glb", targetSize: 9 },
  water: { glb: "genangan_air.glb", targetSize: 4 },
  solar: {
    glb: "sceen_5_bagian_2_energi_terbarukan_solar_panel_1.glb",
    targetSize: 4,
  },
  animal: { glb: "rusa.glb", targetSize: 3.5 },
  recycle: { glb: "sceen_5_bagian_1_recycle_1.glb", targetSize: 4.5 },
  building: { glb: "sceen_5_bagian_4_ruang_hijau_kota_1.glb", targetSize: 5 },
  water2: {
    glb: "sceen_5_bagian_3_pengelolaan_air_traktor_air_1.glb",
    targetSize: 5,
  },
  rock: { glb: "batu.glb", targetSize: 2.5 },
  lion: { glb: "singa.glb", targetSize: 3.5 },
};

// State
var s8_ticker = 0,
  s8_animObjs = [],
  s8_sceneRef8 = null,
  s8_particles8 = [];
var s8_lights8 = [],
  s8_placedKeys = [],
  s8_isBuilt = false;

// ============================================================
// BUILD SCENE 8
// ============================================================
function buildScene8() {
  s8_ticker = 0;
  s8_animObjs = [];
  s8_particles8 = [];
  s8_lights8 = [];
  s8_placedKeys = [];
  s8_sceneRef8 = scene;

  scene.background = new THREE.Color(0x030a05);
  scene.fog = new THREE.FogExp2(0x030a05, 0.011);

  // Lighting — same as scene-7
  scene.add(new THREE.AmbientLight(0x102010, 1.4));
  var sun = new THREE.DirectionalLight(0xfff5d0, 2.5);
  sun.position.set(20, 40, 15);
  sun.castShadow = true;
  scene.add(sun);
  scene
    .add(new THREE.DirectionalLight(0x4488ff, 0.55))
    .position.set(-25, 15, -12);
  scene.add(new THREE.HemisphereLight(0x88ddff, 0x224422, 0.5));

  // Terrain — exact copy from scene-7 (keep context consistent)
  _s8_buildTerrain();
  _s8_spawnAtmosphere();

  // Camera — identik dengan scene-7
  orbit.radius = 55;
  orbit.phi = 0.72;
  orbit.theta = 0.2;
  orbit.tx = 0;
  orbit.ty = 1;
  orbit.tz = 0;
  applyOrbit();

  // ── READ SCENE-7 DESIGN from localStorage ──
  _s8_restoreDesign();

  // Narasi
  var nEl = document.getElementById("narasi-text");
  if (nEl)
    nEl.textContent =
      '🌍 Ini adalah hasil desain ekosistemmu! Tekan "Simulasi Waktu" untuk melihat dampak jangka panjang.';

  // Update shared balance meter dari data scene-7
  _s8_updateBalanceMeter();

  // Inject UI scene-8
  _s8_injectUI();

  // Animation loop
  _s8_startLoop();
}

// ============================================================
// TERRAIN — identik dengan scene-7 supaya objek pas posisinya
// ============================================================
function _s8_buildTerrain() {
  // Bintang
  for (var s = 0; s < 200; s++) {
    var star = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 4, 4),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.7,
      }),
    );
    star.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 200,
    );
    if (star.position.y < 4) star.position.y += 15;
    scene.add(star);
  }

  // Island body
  var island = new THREE.Mesh(
    new THREE.CylinderGeometry(21.5, 17, 3.8, 72),
    new THREE.MeshPhongMaterial({ color: 0x5a3e28, shininess: 5 }),
  );
  island.position.y = -1.9;
  scene.add(island);

  // Grass top
  var grass = new THREE.Mesh(
    new THREE.CylinderGeometry(21.5, 21.5, 0.5, 72),
    new THREE.MeshPhongMaterial({ color: 0x2d6a1f, shininess: 10 }),
  );
  grass.position.y = 0.25;
  scene.add(grass);

  // Inner ring
  var innerRing = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 0.08, 48),
    new THREE.MeshPhongMaterial({
      color: 0x3a8a25,
      transparent: true,
      opacity: 0.5,
    }),
  );
  innerRing.position.y = 0.54;
  scene.add(innerRing);

  // River
  scene.add(
    (function () {
      var rb = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 38),
        new THREE.MeshPhongMaterial({
          color: 0x0a3060,
          side: THREE.DoubleSide,
        }),
      );
      rb.rotation.x = -Math.PI / 2;
      rb.position.set(0.5, -0.02, 0);
      return rb;
    })(),
  );
  var waterMat = new THREE.MeshPhongMaterial({
    color: 0x1565c0,
    transparent: true,
    opacity: 0.8,
    emissive: new THREE.Color(0x0d47a1),
    emissiveIntensity: 0.15,
    shininess: 200,
    side: THREE.DoubleSide,
  });
  var water = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 36), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0.5, 0.06, 0);
  water.userData.waterSurface = true;
  scene.add(water);
  s8_animObjs.push(water);

  // Cliff blocks bawah
  var cliffColors = [0x6d4c41, 0x5d4037, 0x795548, 0x8d6e63];
  for (var cl = 0; cl < 20; cl++) {
    var ca = (cl / 20) * Math.PI * 2;
    var cr = 19.5 + Math.random() * 1.5;
    var cliff = new THREE.Mesh(
      new THREE.BoxGeometry(
        2.5 + Math.random() * 2.5,
        2.5 + Math.random() * 3,
        2 + Math.random() * 2,
      ),
      new THREE.MeshPhongMaterial({ color: cliffColors[cl % 4] }),
    );
    cliff.position.set(
      Math.cos(ca) * cr,
      -2.2 - Math.random() * 1.2,
      Math.sin(ca) * cr,
    );
    cliff.rotation.y = ca;
    scene.add(cliff);
  }

  // Kabut bawah pulau
  for (var cf = 0; cf < 10; cf++) {
    var cfang = Math.random() * Math.PI * 2,
      cfr = 5 + Math.random() * 13;
    var cloud = new THREE.Mesh(
      new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.025 + Math.random() * 0.04,
      }),
    );
    cloud.scale.set(1, 0.3, 1);
    cloud.position.set(
      Math.cos(cfang) * cfr,
      -5 - Math.random() * 1.5,
      Math.sin(cfang) * cfr,
    );
    cloud.userData.cloudBase = cloud.position.clone();
    cloud.userData.cloudPhase = Math.random() * Math.PI * 2;
    scene.add(cloud);
    s8_animObjs.push(cloud);
  }

  // Glow rings
  for (var og = 0; og < 3; og++) {
    var outerR = new THREE.Mesh(
      new THREE.TorusGeometry(22 + og * 1.4, 0.07 + og * 0.02, 8, 80),
      new THREE.MeshBasicMaterial({
        color: [0x00e676, 0x42a5f5, 0xffca28][og],
        transparent: true,
        opacity: 0.12 - og * 0.03,
      }),
    );
    outerR.rotation.x = Math.PI / 2;
    outerR.position.y = 0.12 + og * 0.04;
    outerR.userData.rotSpeed = og % 2 === 0 ? 0.05 : -0.035;
    scene.add(outerR);
    s8_animObjs.push(outerR);
  }

  // Matahari
  var sunball = new THREE.Mesh(
    new THREE.SphereGeometry(5, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xfff5a0,
      transparent: true,
      opacity: 0.88,
    }),
  );
  sunball.position.set(55, 35, -70);
  scene.add(sunball);
  var halo = new THREE.Mesh(
    new THREE.SphereGeometry(8, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffec40,
      transparent: true,
      opacity: 0.18,
    }),
  );
  halo.position.copy(sunball.position);
  scene.add(halo);

  // Sci-fi ground + towers (condensed)
  var groundPlane = new THREE.Mesh(
    new THREE.CircleGeometry(120, 64),
    new THREE.MeshPhongMaterial({
      color: 0x050c12,
      shininess: 20,
      side: THREE.DoubleSide,
    }),
  );
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -8;
  scene.add(groundPlane);
  var bigGrid = new THREE.GridHelper(200, 40, 0x003322, 0x001a10);
  bigGrid.position.y = -7.9;
  bigGrid.material.transparent = true;
  bigGrid.material.opacity = 0.5;
  scene.add(bigGrid);

  // 8 menara sci-fi
  [0, 45, 90, 135, 180, 225, 270, 315].forEach(function (deg, ti) {
    var rad = (deg * Math.PI) / 180,
      tDist = 38 + Math.sin(ti * 1.3) * 4;
    var tx = Math.cos(rad) * tDist,
      tz = Math.sin(rad) * tDist;
    var tH = 18 + Math.sin(ti * 0.8) * 8;
    var shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.55, tH, 8),
      new THREE.MeshPhongMaterial({
        color: 0x0d2218,
        emissive: new THREE.Color(0x003322),
        emissiveIntensity: 0.3,
      }),
    );
    shaft.position.set(tx, -7.2 + tH / 2, tz);
    scene.add(shaft);
    var pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.4, 1.5, 8),
      new THREE.MeshPhongMaterial({
        color: 0x0a1a14,
        emissive: new THREE.Color(0x003322),
        emissiveIntensity: 0.4,
      }),
    );
    pedestal.position.set(tx, -7.2, tz);
    scene.add(pedestal);
    var crystalTop = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9, 0),
      new THREE.MeshBasicMaterial({
        color: ti % 3 === 0 ? 0x00e676 : ti % 3 === 1 ? 0x42a5f5 : 0xffca28,
        transparent: true,
        opacity: 0.85,
      }),
    );
    crystalTop.position.set(tx, -7.2 + tH + 0.5, tz);
    crystalTop.userData.crystalPulse = true;
    crystalTop.userData.crystalPhase = (ti / 8) * Math.PI * 2;
    scene.add(crystalTop);
    s8_animObjs.push(crystalTop);
    var auraRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.06, 6, 20),
      new THREE.MeshBasicMaterial({
        color: ti % 3 === 0 ? 0x00e676 : ti % 3 === 1 ? 0x42a5f5 : 0xffca28,
        transparent: true,
        opacity: 0.35,
      }),
    );
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.set(tx, -7.2 + tH + 0.5, tz);
    auraRing.userData.rotSpeed = ti % 2 === 0 ? 1.5 : -1.2;
    scene.add(auraRing);
    s8_animObjs.push(auraRing);
    var towerLight = new THREE.PointLight(
      ti % 3 === 0 ? 0x00e676 : ti % 3 === 1 ? 0x42a5f5 : 0xffca28,
      0.7,
      18,
    );
    towerLight.position.set(tx, -7.2 + tH + 1, tz);
    towerLight.userData.baseInt = 0.7;
    towerLight.userData.pulseOff = (ti / 8) * Math.PI * 2;
    scene.add(towerLight);
    s8_lights8.push(towerLight);
  });
}

// ============================================================
// RESTORE SCENE-7 DESIGN — WAJIB & MUTLAK: semua objek muncul persis sama
// ============================================================
function _s8_restoreDesign() {
  // ── Baca data LENGKAP dari scene-7 (posisi + rotasi per objek) ──
  var fullRaw = null,
    simpleRaw = null;
  try {
    fullRaw = localStorage.getItem("ar_s7_placed_full");
    simpleRaw = localStorage.getItem("ar_s7_placed");
  } catch (e) {}

  // Tidak ada desain sama sekali
  if (
    (!fullRaw || fullRaw === "[]") &&
    (!simpleRaw || simpleRaw === "[]" || simpleRaw === "null")
  ) {
    _s8_showEmptyHint();
    return;
  }

  var placements = []; // [{key, x, z, rotY}]

  // Prioritas: pakai data full (ada posisi eksak)
  if (fullRaw && fullRaw !== "[]" && fullRaw !== "null") {
    try {
      placements = JSON.parse(fullRaw);
    } catch (e) {}
  }

  // Fallback: hanya ada keys, rekonstruksi posisi pakai slot system
  if (placements.length === 0 && simpleRaw) {
    var keys = [];
    try {
      keys = JSON.parse(simpleRaw);
    } catch (e) {}

    if (!keys || !keys.length) {
      _s8_showEmptyHint();
      return;
    }

    // Rebuild slot positions (same logic as scene-7)
    var s8SlotIdx = {},
      s8OccupiedPos = [];
    var S8_ISLAND_R = 18.5;
    var S8_SLOTS = {
      tree: [
        [-10, 0, -5],
        [-8, 0, 0],
        [-10, 0, 5],
        [-6, 0, -4],
        [-6, 0, 4],
        [-4, 0, -6],
        [-4, 0, 2],
        [-3, 0, -2],
        [-3, 0, 6],
        [-11, 0, 1],
        [-9, 0, -3],
        [-7, 0, 5],
      ],
      forest: [
        [-11, 0, -2],
        [-9, 0, 4],
        [-7, 0, -5],
        [-5, 0, 3],
        [-11, 0, 5],
        [-8, 0, -3],
      ],
      water: [
        [-1, 0, -5],
        [-1, 0, 0],
        [-1, 0, 5],
        [1, 0, -3],
        [1, 0, 3],
        [0, 0, 2],
        [0, 0, -2],
        [1, 0, 5],
        [1, 0, -5],
      ],
      water2: [
        [-0.5, 0, -3],
        [0.5, 0, 3],
        [1.5, 0, -4],
        [1.5, 0, 4],
      ],
      solar: [
        [5, 0, -6],
        [7, 0, -5],
        [9, 0, -6],
        [11, 0, -4],
        [5, 0, -2],
        [7, 0, -2],
        [9, 0, -3],
        [10, 0, -2],
        [6, 0, -5],
        [9, 0, -5],
      ],
      animal: [
        [5, 0, 2],
        [7, 0, 4],
        [9, 0, 2],
        [10, 0, 4],
        [5, 0, 6],
        [8, 0, 5],
        [6, 0, 6],
        [10, 0, 2],
        [7, 0, 6],
        [9, 0, 4],
      ],
      lion: [
        [6, 0, 3],
        [8, 0, 4],
        [10, 0, 3],
        [7, 0, 5],
      ],
      recycle: [
        [2, 0, -4],
        [4, 0, -5],
        [3, 0, 2],
        [1, 0, -2],
        [3, 0, 3],
      ],
      building: [
        [2, 0, -3],
        [4, 0, -4],
        [4, 0, 4],
        [3, 0, 6],
        [1, 0, 4],
      ],
      rock: [
        [-2, 0, -7],
        [-4, 0, 7],
        [11, 0, -6],
        [11, 0, 6],
        [-11, 0, -4],
        [-11, 0, 4],
        [-1, 0, -7],
        [0, 0, 7],
      ],
    };
    var S8_RADIUS = {
      tree: 2.8,
      forest: 5.5,
      water: 3.2,
      water2: 4,
      solar: 2.5,
      animal: 3,
      lion: 3.5,
      recycle: 3,
      building: 3.5,
      rock: 1.8,
    };
    for (var k in S8_SLOTS) s8SlotIdx[k] = 0;

    function isTooClose2(x, z, r) {
      for (var i = 0; i < s8OccupiedPos.length; i++) {
        var op = s8OccupiedPos[i];
        if (
          Math.sqrt(Math.pow(x - op.x, 2) + Math.pow(z - op.z, 2)) <
          r + (op.r || 2.5)
        )
          return true;
      }
      return false;
    }
    function insideBounds2(x, z, r) {
      return Math.sqrt(x * x + z * z) + r <= S8_ISLAND_R;
    }
    function findSlot2(key) {
      var sk = S8_SLOTS[key] ? key : "building";
      var slots = S8_SLOTS[sk];
      var radius = S8_RADIUS[key] || 2.8;
      var idx = s8SlotIdx[sk] || 0;
      var tried = 0;
      while (tried < slots.length) {
        var si = idx % slots.length;
        var sx = slots[si][0],
          sz = slots[si][2];
        if (insideBounds2(sx, sz, radius) && !isTooClose2(sx, sz, radius)) {
          s8SlotIdx[sk] = si + 1;
          return { x: sx, z: sz };
        }
        idx++;
        tried++;
      }
      var base = slots[0];
      for (var sp = 1; sp < 25; sp++) {
        var ang = sp * 2.4,
          dist = Math.min(sp * 1.5, S8_ISLAND_R - radius - 1);
        var fx = base[0] + Math.cos(ang) * dist,
          fz = base[2] + Math.sin(ang) * dist;
        var posR = Math.sqrt(fx * fx + fz * fz);
        if (posR + radius > S8_ISLAND_R) {
          var sc = (S8_ISLAND_R - radius - 0.5) / posR;
          fx *= sc;
          fz *= sc;
        }
        if (!isTooClose2(fx, fz, radius)) return { x: fx, z: fz };
      }
      return null;
    }

    keys.forEach(function (key) {
      var slot = findSlot2(key);
      var radius = S8_RADIUS[key] || 2.8;
      if (slot) {
        s8OccupiedPos.push({ x: slot.x, z: slot.z, r: radius });
        placements.push({
          key: key,
          x: slot.x,
          z: slot.z,
          rotY: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  if (!placements.length) {
    _s8_showEmptyHint();
    return;
  }

  // ── Track keys for stats panel ──
  s8_placedKeys = placements.map(function (p) {
    return p.key;
  });

  // ── Load setiap GLB di posisi PERSIS sama dengan scene-7 ──
  placements.forEach(function (pl) {
    var def = S8_ITEMS[pl.key];
    if (!def) return;

    loadGLB(pl.key + "_s8", def.glb, function (model) {
      if (!model || !scene || scene !== s8_sceneRef8) return;
      fitModelToBox(model, def.targetSize);

      // Hitung Y supaya objek duduk tepat di atas terrain
      var bbox = new THREE.Box3().setFromObject(model);
      var bottomOff = bbox.min.y;
      var targetY = 0.52 - bottomOff;

      // Posisi PERSIS dari scene-7
      model.position.set(pl.x, targetY - 5, pl.z); // mulai di bawah utk rise anim
      model.rotation.y = pl.rotY || 0; // rotasi PERSIS sama

      model.userData.s8TargetY = targetY;
      model.userData.s8Rising = true;
      model.userData.s8BaseY = targetY;
      model.userData.s8Float = 0.1 + Math.random() * 0.08;
      model.userData.s8FloatPhase = Math.random() * Math.PI * 2;

      scene.add(model);
      s8_animObjs.push(model);
    });
  });
}

// ============================================================
// EMPTY HINT — when user placed nothing
// ============================================================
function _s8_showEmptyHint() {
  var hint = document.createElement("div");
  hint.id = "s8-empty-hint";
  hint.style.cssText =
    "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:80;" +
    "background:rgba(4,12,22,0.95);border:2px solid rgba(0,230,118,0.3);border-radius:24px;" +
    "padding:36px 40px;text-align:center;backdrop-filter:blur(16px);max-width:380px;width:90%;" +
    "animation:s8hintIn 0.5s cubic-bezier(0.22,1,0.36,1);";
  hint.innerHTML =
    '<div style="font-size:52px;margin-bottom:12px">🏝️</div>' +
    '<div style="font-family:Syne,sans-serif;font-size:20px;font-weight:800;color:#ffca28;margin-bottom:10px">Ekosistem Kosong</div>' +
    '<div style="font-size:13px;line-height:1.7;color:rgba(200,230,210,0.75);margin-bottom:20px">' +
    "Kamu belum mendesain ekosistem di Scene 7.<br>Kembali ke Scene 7 dan tambahkan komponen terlebih dahulu!" +
    "</div>" +
    '<button onclick="prevScene()" style="background:rgba(0,230,118,0.15);border:1.5px solid rgba(0,230,118,0.5);' +
    "border-radius:12px;padding:11px 24px;color:#00e676;font-family:Syne,sans-serif;font-size:13px;" +
    'font-weight:700;cursor:pointer;letter-spacing:1px;">‹ Kembali ke Builder</button>';
  var styleEl = document.createElement("style");
  styleEl.textContent =
    "@keyframes s8hintIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}";
  document.head.appendChild(styleEl);
  document.body.appendChild(hint);
}

// ============================================================
// BALANCE METER — update from saved data
// ============================================================
function _s8_updateBalanceMeter() {
  try {
    var raw = localStorage.getItem("ar_builtObjects");
    if (!raw) return;
    var bo = JSON.parse(raw);
    builtObjects = bo;
  } catch (e) {}
}

// ============================================================
// ATMOSPHERE PARTICLES
// ============================================================
function _s8_spawnAtmosphere() {
  var colors = [0x00e676, 0x42a5f5, 0xffca28, 0xff7043, 0xffffff];
  for (var i = 0; i < 50; i++) {
    var c = colors[i % colors.length];
    var p = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.07, 6, 6),
      new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: 0.2 + Math.random() * 0.3,
      }),
    );
    p.position.set(
      (Math.random() - 0.5) * 50,
      0.5 + Math.random() * 9,
      (Math.random() - 0.5) * 32,
    );
    p.userData.pvy = 0.003 + Math.random() * 0.006;
    p.userData.pvx = (Math.random() - 0.5) * 0.002;
    p.userData.pvz = (Math.random() - 0.5) * 0.002;
    p.userData.pmaxY = 10 + Math.random() * 3;
    p.userData.pBaseX = p.position.x;
    p.userData.pBaseZ = p.position.z;
    p.userData.isAtmos = true;
    scene.add(p);
    s8_particles8.push(p);
  }
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function _s8_startLoop() {
  var lastT = performance.now();
  var ref = s8_sceneRef8;
  function tick(now) {
    if (!scene || scene !== ref) return;
    var dt = Math.min((now - lastT) / 1000, 0.1);
    lastT = now;
    s8_ticker += dt;
    var t = s8_ticker;

    s8_animObjs.forEach(function (obj) {
      if (!obj.parent) return;
      if (obj.userData.waterSurface) {
        obj.material.opacity = 0.78 + Math.sin(t * 1.8) * 0.05;
        return;
      }
      if (obj.userData.rotSpeed !== undefined) {
        obj.rotation.z += obj.userData.rotSpeed * dt;
        return;
      }
      if (obj.userData.crystalPulse) {
        var sc = 0.85 + Math.sin(t * 3 + obj.userData.crystalPhase) * 0.2;
        obj.scale.setScalar(sc);
        obj.rotation.y += 1.5 * dt;
        obj.material.opacity =
          0.5 + Math.sin(t * 3 + obj.userData.crystalPhase) * 0.35;
        return;
      }
      if (obj.userData.cloudBase) {
        obj.position.x =
          obj.userData.cloudBase.x +
          Math.sin(t * 0.2 + obj.userData.cloudPhase) * 1.5;
        return;
      }
      if (obj.userData.s8Rising) {
        obj.position.y += (obj.userData.s8TargetY - obj.position.y) * 0.08;
        if (Math.abs(obj.position.y - obj.userData.s8TargetY) < 0.02) {
          obj.position.y = obj.userData.s8TargetY;
          obj.userData.s8Rising = false;
        }
        return;
      }
      if (obj.userData.s8Float !== undefined && !obj.userData.s8Rising) {
        obj.position.y =
          (obj.userData.s8BaseY || 0) +
          Math.sin(t * obj.userData.s8Float + obj.userData.s8FloatPhase) * 0.07;
      }
    });

    s8_lights8.forEach(function (lt) {
      lt.intensity =
        lt.userData.baseInt + Math.sin(t * 2.2 + lt.userData.pulseOff) * 0.25;
    });

    for (var j = 0; j < s8_particles8.length; j++) {
      var pt = s8_particles8[j];
      if (!pt.parent) continue;
      if (pt.userData.isAtmos) {
        pt.position.y += pt.userData.pvy;
        pt.position.x += pt.userData.pvx;
        pt.position.z += pt.userData.pvz;
        if (pt.position.y > pt.userData.pmaxY) {
          pt.position.y = 0.2;
          pt.position.x = pt.userData.pBaseX + (Math.random() - 0.5) * 2;
          pt.position.z = pt.userData.pBaseZ + (Math.random() - 0.5) * 2;
        }
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============================================================
// INJECT UI — Scene 8 evaluation overlay
// ============================================================
function _s8_injectUI() {
  var style = document.createElement("style");
  style.id = "s8-style";
  style.textContent = `
    #s8-eval-panel{
      position:fixed;right:14px;top:44%;transform:translateY(-50%);z-index:75;
      width:215px;background:rgba(3,8,14,0.95);border:1.5px solid rgba(0,230,118,0.2);
      border-radius:18px;padding:14px 15px 12px;backdrop-filter:blur(16px);
      display:flex;flex-direction:column;gap:9px;
      animation:s8panelIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both;
    }
    @keyframes s8panelIn{from{opacity:0;transform:translateY(-50%) translateX(30px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
    .s8-ep-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(0,230,118,0.65);padding-bottom:7px;border-bottom:1px solid rgba(0,230,118,0.15);}
    .s8-stat-row{display:flex;justify-content:space-between;align-items:center;font-size:11px;}
    .s8-stat-lbl{color:rgba(200,230,210,0.72);}
    .s8-stat-val{font-family:'Syne',sans-serif;font-weight:700;color:#00e676;}
    .s8-sim-btn{width:100%;padding:11px;border-radius:11px;margin-top:4px;
      background:linear-gradient(135deg,rgba(0,230,118,0.18),rgba(66,165,245,0.1));
      border:1.5px solid rgba(0,230,118,0.45);color:#00e676;
      font-family:'Syne',sans-serif;font-size:12px;font-weight:800;
      letter-spacing:1px;cursor:pointer;transition:all 0.3s;text-transform:uppercase;}
    .s8-sim-btn:hover{background:linear-gradient(135deg,rgba(0,230,118,0.3),rgba(66,165,245,0.18));box-shadow:0 0 20px rgba(0,230,118,0.25);transform:scale(1.03);}
    #s8-result-modal{display:none;position:fixed;inset:0;z-index:300;background:rgba(2,5,12,0.88);backdrop-filter:blur(16px);align-items:center;justify-content:center;}
    #s8-result-modal.open{display:flex;}
    #s8-result-card{background:linear-gradient(145deg,rgba(5,14,28,0.98),rgba(4,12,10,0.98));border:2px solid rgba(0,230,118,0.4);border-radius:28px;padding:36px 32px;max-width:420px;width:92%;text-align:center;animation:s8resIn 0.45s cubic-bezier(0.22,1,0.36,1);}
    @keyframes s8resIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
    #s8-res-icon{font-size:58px;display:block;margin-bottom:10px;animation:s8resFloat 2s ease-in-out infinite;}
    @keyframes s8resFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    #s8-res-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:900;background:linear-gradient(135deg,#00e676,#42a5f5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;}
    #s8-res-body{font-size:13px;line-height:1.8;color:rgba(200,230,215,0.80);margin-bottom:22px;text-align:left;}
    .s8-res-close{background:rgba(0,230,118,0.15);border:1.5px solid rgba(0,230,118,0.45);border-radius:12px;padding:11px 28px;color:#00e676;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .s8-res-close:hover{background:rgba(0,230,118,0.28);transform:scale(1.04);}
    #narasi{background:rgba(3,10,20,0.9)!important;border:1.5px solid rgba(0,230,118,0.2)!important;backdrop-filter:blur(16px)!important;border-radius:14px!important;font-size:12px!important;padding:9px 16px!important;max-width:380px!important;left:50%!important;transform:translateX(-50%)!important;top:auto!important;bottom:76px!important;}
    .nav-btn.primary{background:rgba(0,230,118,0.15)!important;border-color:rgba(0,230,118,0.5)!important;color:#00e676!important;}
    #scene-title{background:linear-gradient(135deg,#00e676,#42a5f5)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;background-clip:text!important;font-weight:800!important;}
  `;
  document.head.appendChild(style);

  // Build stat counts from placedKeys
  var counts = {};
  s8_placedKeys.forEach(function (k) {
    counts[k] = (counts[k] || 0) + 1;
  });
  var total = s8_placedKeys.length;
  var flora = (counts.tree || 0) + (counts.forest || 0) + (counts.rock || 0);
  var fauna = (counts.animal || 0) + (counts.lion || 0);
  var energi = counts.solar || 0;
  var air = (counts.water || 0) + (counts.water2 || 0);
  var urban = (counts.recycle || 0) + (counts.building || 0);

  var panel = document.createElement("div");
  panel.id = "s8-eval-panel";
  panel.innerHTML =
    '<div class="s8-ep-title">📊 Hasil Desainmu</div>' +
    '<div class="s8-stat-row"><span class="s8-stat-lbl">🌿 Komponen Flora</span><span class="s8-stat-val">' +
    flora +
    "</span></div>" +
    '<div class="s8-stat-row"><span class="s8-stat-lbl">🦌 Komponen Fauna</span><span class="s8-stat-val">' +
    fauna +
    "</span></div>" +
    '<div class="s8-stat-row"><span class="s8-stat-lbl">⚡ Energi Bersih</span><span class="s8-stat-val">' +
    energi +
    "</span></div>" +
    '<div class="s8-stat-row"><span class="s8-stat-lbl">💧 Sumber Air</span><span class="s8-stat-val">' +
    air +
    "</span></div>" +
    '<div class="s8-stat-row"><span class="s8-stat-lbl">🏡 Urban Hijau</span><span class="s8-stat-val">' +
    urban +
    "</span></div>" +
    '<div class="s8-stat-row" style="padding-top:6px;border-top:1px solid rgba(255,255,255,0.07)"><span class="s8-stat-lbl">🧩 Total Komponen</span><span class="s8-stat-val">' +
    total +
    "</span></div>" +
    '<button class="s8-sim-btn" onclick="s8_runSimulation()">⏩ Simulasi Waktu</button>';
  document.body.appendChild(panel);

  // Simulation result modal
  var modal = document.createElement("div");
  modal.id = "s8-result-modal";
  modal.innerHTML =
    '<div id="s8-result-card">' +
    '<span id="s8-res-icon">🌍</span>' +
    '<div id="s8-res-title">Hasil Simulasi</div>' +
    '<div id="s8-res-body"></div>' +
    "<button class=\"s8-res-close\" onclick=\"document.getElementById('s8-result-modal').classList.remove('open')\">Tutup</button>" +
    "</div>";
  modal.addEventListener("click", function (e) {
    if (e.target === modal) modal.classList.remove("open");
  });
  document.body.appendChild(modal);
}

// ============================================================
// SIMULATION
// ============================================================
window.s8_runSimulation = function () {
  var total = s8_placedKeys.length;
  var counts = {};
  s8_placedKeys.forEach(function (k) {
    counts[k] = (counts[k] || 0) + 1;
  });
  var flora = (counts.tree || 0) + (counts.forest || 0) + (counts.rock || 0);
  var fauna = (counts.animal || 0) + (counts.lion || 0);
  var energi = counts.solar || 0;
  var air = (counts.water || 0) + (counts.water2 || 0);
  var urban = (counts.recycle || 0) + (counts.building || 0);

  var score = 0;
  if (flora > 0) score += 20;
  if (fauna > 0) score += 20;
  if (energi > 0) score += 20;
  if (air > 0) score += 20;
  if (urban > 0) score += 20;
  // Bonus keragaman
  if (flora >= 2) score += 5;
  if (fauna >= 2) score += 5;
  if (energi >= 2) score += 5;
  if (air >= 2) score += 5;
  score = Math.min(score, 100);

  var icon, title, body;
  if (total === 0) {
    icon = "❌";
    title = "Ekosistem Kosong";
    body =
      "Tidak ada komponen yang ditambahkan. Kembali ke Scene 7 dan desain ekosistemmu!";
  } else if (score >= 90) {
    icon = "🏆";
    title = "Ekosistem Sempurna!";
    body =
      "<b>Hari 1 → Tahun 5:</b><br>" +
      "✅ Pohon bertumbuh lebat, O₂ melimpah<br>" +
      "✅ Satwa liar berkembang biak dengan seimbang<br>" +
      "✅ Energi terbarukan mengurangi emisi 95%<br>" +
      "✅ Air bersih tersedia untuk semua makhluk hidup<br>" +
      "✅ Kota hijau mengurangi suhu urban 3°C<br><br>" +
      "<b>🎉 Ekosistemmu berkelanjutan selama 100 tahun ke depan!</b>";
  } else if (score >= 60) {
    icon = "⚠️";
    title = "Ekosistem Hampir Seimbang";
    body =
      "<b>Hari 1 → Tahun 5:</b><br>" +
      (flora > 0 ? "✅" : "❌") +
      " Flora: " +
      (flora > 0 ? "Berkembang baik" : "Perlu ditambah") +
      "\n" +
      (fauna > 0 ? "✅" : "❌") +
      " Fauna: " +
      (fauna > 0 ? "Populasi stabil" : "Tidak ada satwa liar") +
      "\n" +
      (energi > 0 ? "✅" : "❌") +
      " Energi: " +
      (energi > 0 ? "Emisi berkurang" : "Masih bergantung energi fosil") +
      "\n" +
      (air > 0 ? "✅" : "❌") +
      " Air: " +
      (air > 0 ? "Sumber air terjaga" : "Kekurangan air bersih") +
      "\n\n" +
      "<b>💡 Tambahkan komponen yang masih kurang untuk ekosistem sempurna!</b>";
  } else {
    icon = "❌";
    title = "Ekosistem Tidak Seimbang";
    body =
      "<b>Hari 1 → Tahun 5:</b><br>" +
      "❌ Keanekaragaman hayati rendah (" +
      total +
      " komponen saja)<br>" +
      "❌ Rantai makanan tidak terbentuk<br>" +
      "❌ Sumber daya alam tidak mencukupi<br><br>" +
      "<b>⚠️ Kembali ke Scene 7 dan desain ekosistem yang lebih lengkap!</b>";
  }

  document.getElementById("s8-res-icon").textContent = icon;
  document.getElementById("s8-res-title").textContent = title;
  document.getElementById("s8-res-body").innerHTML = body;
  var card = document.getElementById("s8-result-card");
  if (score >= 90) card.style.borderColor = "rgba(0,230,118,0.5)";
  else if (score >= 60) card.style.borderColor = "rgba(255,202,40,0.5)";
  else card.style.borderColor = "rgba(244,67,54,0.5)";
  document.getElementById("s8-result-modal").classList.add("open");
};

window.addEventListener("DOMContentLoaded", function () {
  startSceneApp(7);
});
