// ============================================================
// scene-4.js — Scene 4: Dampak Aktivitas Manusia  (FIXED v3)
// Fixes: button re-enable, no badge overlap, model ground fix,
//        promise error suppressed
// ============================================================
"use strict";

// ── Suppress browser/extension errors ──
window.addEventListener('unhandledrejection', function(e) {
  e.preventDefault(); // Suppress semua unhandled promise rejections
}, true);

// Suppress THREE.js GLTFLoader warnings tentang UV sets (harmless, r128 limitation)
(function() {
  const _warn = console.warn.bind(console);
  console.warn = function(...args) {
    const msg = String(args[0] || '');
    if (msg.includes('Custom UV set') || msg.includes('not yet supported')) return;
    _warn(...args);
  };
})();

function buildCurrentScene() { buildScene4(); }

// ── State definitions ──
const S4_STATES = {
  bagus: {
    key:'bagus', glbKey:'s4_bagus',
    label:'Lingkungan Sehat', icon:'🌿',
    desc:'Ekosistem seimbang — flora & fauna terjaga',
    health:100, healthClr:'#00e676',
    bgTop:0x0d2615, ambClr:0xffffff, ambInt:0.75,
    dirClr:0xfff5cc, dirInt:1.0,
    narasi:'Ekosistem yang sehat memiliki keseimbangan antara flora, fauna, air, dan udara bersih.',
    impact:'Semua komponen ekosistem berfungsi normal. Keanekaragaman hayati terjaga dengan baik.',
    impactIcon:'✅',
  },
  gundul: {
    key:'gundul', glbKey:'s4_gundul',
    label:'Pengundulan Hutan', icon:'🪓',
    desc:'Deforestasi — habitat & siklus air rusak',
    health:38, healthClr:'#ff7043',
    bgTop:0x1a1005, ambClr:0xffe0b0, ambInt:0.5,
    dirClr:0xffd090, dirInt:0.8,
    narasi:'Pengundulan hutan menghancurkan habitat, memicu erosi tanah, dan mengganggu siklus air.',
    impact:'Habitat rusak, erosi tanah meningkat, siklus air terganggu, fauna berkurang drastis.',
    impactIcon:'⚠️',
  },
  kota: {
    key:'kota', glbKey:'s4_kota',
    label:'Urbanisasi & Polusi', icon:'🏭',
    desc:'Kota beton — polusi udara & hilang ruang hijau',
    health:5, healthClr:'#f44336',
    bgTop:0x0f0f0f, ambClr:0xffddaa, ambInt:0.4,
    dirClr:0xff8844, dirInt:0.6,
    narasi:'Urbanisasi berlebihan menciptakan pulau panas kota, polusi udara, dan hilangnya ruang hijau.',
    impact:'Polusi udara parah, pulau panas kota, banjir urban, hilangnya biodiversitas.',
    impactIcon:'🔴',
  },
};

// ── Global state ──
let s4_activeState    = 'bagus';
let s4_models         = { bagus:null, gundul:null, kota:null };
let s4_transitioning  = false;
let s4_smokeInterval  = null;
let s4_smokeParticles = [];
let s4_dustInterval   = null;
let s4_dustParticles  = [];
let s4_ambientLight   = null;
let s4_dirLight       = null;

// ============================================================
// BUILD
// ============================================================
function buildScene4() {
  s4_activeState   = 'bagus';
  s4_models        = { bagus:null, gundul:null, kota:null };
  s4_transitioning = false;
  s4_smokeParticles = []; s4_dustParticles = [];

  const st = S4_STATES.bagus;
  scene.background = new THREE.Color(st.bgTop);

  s4_ambientLight = new THREE.AmbientLight(st.ambClr, st.ambInt);
  scene.add(s4_ambientLight);
  s4_dirLight = new THREE.DirectionalLight(st.dirClr, st.dirInt);
  s4_dirLight.position.set(10, 20, 10);
  s4_dirLight.castShadow = true;
  scene.add(s4_dirLight);
  scene.add(new THREE.HemisphereLight(0x88ccff, 0x443322, 0.35));

  // Kamera
  // Orbit defaults — akan di-update setelah model selesai load (lihat s4_updateOrbitForModel)
  orbit.radius = 42; orbit.phi = 1.0; orbit.theta = 0.25;
  orbit.tx = 0; orbit.ty = 4; orbit.tz = 0;
  applyOrbit();

  // UI
  s4_injectUI();

  // Load model pertama
  s4_loadModel('bagus', (model) => {
    s4_models.bagus = model;
    s4_setModelOpacity(model, 0);
    model.visible = true;
    scene.add(model);
    s4_fadeIn(model, 1.0, () => {
      // Setelah fade in selesai, re-enable buttons
      s4_setButtonsEnabled(true);
    });
  });
}

// ============================================================
// LOAD MODEL (dengan fix posisi ground)
// ============================================================
function s4_loadModel(stateKey, callback) {
  if (s4_models[stateKey]) { callback(s4_models[stateKey]); return; }

  const st      = S4_STATES[stateKey];
  const glbPath = GLB_PATHS[st.glbKey];

  if (!glbPath) {
    const fb = s4_makeFallback(stateKey);
    s4_models[stateKey] = fb;
    callback(fb);
    return;
  }

  loadGLB('s4_' + stateKey, glbPath, (model) => {
    // ── Smart fitting: deteksi model lama (underground besar) vs model baru ──
    {
      const rawBox  = new THREE.Box3().setFromObject(model);
      const rawSize = new THREE.Vector3();
      rawBox.getSize(rawSize);

      const hasDeepBase = rawSize.y > rawSize.x * 3; // lama: Y >> XZ
      if (hasDeepBase) {
        // Model lama (underground -1864): scale pakai fitModelToBox normal
        fitModelToBox(model, 30);
        const b2 = new THREE.Box3().setFromObject(model);
        if (b2.min.y < 0) model.position.y -= b2.min.y;
      } else {
        // Model baru: scale supaya tinggi gedung = 8 world units (lebih proporsional)
        const targetH = 8;
        const scl     = targetH / rawSize.y;
        model.scale.setScalar(scl);
        // Center XZ, Y=0 di alas gedung
        const b3 = new THREE.Box3().setFromObject(model);
        const c3 = new THREE.Vector3();
        b3.getCenter(c3);
        model.position.x = -c3.x;
        model.position.z = -c3.z;
        model.position.y = -b3.min.y;  // geser atas supaya min.y = 0
      }
    }

    model.position.x = model.position.x; // keep centered X
    model.position.z = model.position.z; // keep centered Z
    model.rotation.y = 0;

    model.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true; c.receiveShadow = true;
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => { m.transparent = true; });
      }
    });

    s4_models[stateKey] = model;

    // Hitung posisi asap + orbit kamera DINAMIS dari bounding box aktual
    if (stateKey === 'kota') {
      const finalBox = new THREE.Box3().setFromObject(model);
      const topY     = finalBox.max.y;
      const midX     = (finalBox.max.x + finalBox.min.x) * 0.5;
      const midZ     = (finalBox.max.z + finalBox.min.z) * 0.5;
      const halfX    = (finalBox.max.x - finalBox.min.x) * 0.38;
      const halfZ    = (finalBox.max.z - finalBox.min.z) * 0.38;
      const footW    = finalBox.max.x - finalBox.min.x;
      const footD    = finalBox.max.z - finalBox.min.z;

      // ── Update chimney positions TEPAT di atas gedung ──
      for (let ci = 0; ci < S4_CHIMNEYS.length; ci++) {
        S4_CHIMNEYS[ci][0] = midX + (Math.random()*2-1) * halfX;
        S4_CHIMNEYS[ci][1] = topY + 0.2 + Math.random() * (topY * 0.3);
        S4_CHIMNEYS[ci][2] = midZ + (Math.random()*2-1) * halfZ;
      }

      // ── Update orbit kamera sesuai tinggi gedung aktual ──
      const buildingH = topY - finalBox.min.y;
      const cityW     = Math.max(footW, footD);
      const midBuildY = finalBox.min.y + buildingH * 0.4;

      // Jarak kamera = 2× lebar kota supaya kota penuh di layar
      orbit.radius = cityW * 1.2;
      orbit.phi    = 1.05;      // sudut cukup miring untuk lihat sisi gedung
      orbit.theta  = 0.3;
      orbit.tx     = midX;
      orbit.ty     = midBuildY; // look AT tengah gedung
      orbit.tz     = midZ;
      applyOrbit();
    }

    callback(model);
  });
}

// ============================================================
// SWITCH STATE
// ============================================================
function s4_switchTo(newKey) {
  if (s4_transitioning) return;           // Sedang transisi — abaikan
  if (newKey === s4_activeState) return;  // Sudah di state ini
  if (!S4_STATES[newKey]) return;

  s4_transitioning = true;
  s4_setButtonsEnabled(false);           // Disable semua tombol selama transisi

  const fromKey   = s4_activeState;
  const fromModel = s4_models[fromKey];
  const toSt      = S4_STATES[newKey];

  // Update narasi & health UI langsung
  const nEl = document.getElementById('narasi-text');
  if (nEl) nEl.textContent = toSt.narasi;
  s4_updateHealthUI(newKey);
  _s4_animateLighting(toSt);

  // Hentikan efek lama
  _s4_stopEffects(fromKey);

  const doFadeIn = () => {
    s4_loadModel(newKey, (newModel) => {
      s4_setModelOpacity(newModel, 0);
      newModel.visible = true;
      if (!newModel.parent) scene.add(newModel);

      // Mulai efek state baru
      _s4_startEffects(newKey, newModel);

      s4_fadeIn(newModel, 0.85, () => {
        // ── Transisi selesai ──
        s4_activeState   = newKey;
        s4_transitioning = false;
        s4_setButtonsEnabled(true);   // Re-enable semua tombol
        s4_updateButtons(newKey);     // Highlight tombol aktif
      });
    });
  };

  if (fromModel && fromModel.parent) {
    s4_fadeOut(fromModel, 0.7, () => {
      fromModel.visible = false;
      doFadeIn();
    });
  } else {
    doFadeIn();
  }
}

// ============================================================
// BUTTON ENABLE / DISABLE (fix bug tombol stuck)
// ============================================================
function s4_setButtonsEnabled(enabled) {
  ['bagus','gundul','kota'].forEach(k => {
    const btn = document.getElementById('s4-btn-' + k);
    if (!btn) return;
    // Aktif state tetap disabled (tidak perlu klik lagi)
    const isActive = (k === s4_activeState);
    if (enabled) {
      btn.classList.toggle('s4-disabled', isActive);
      btn.style.pointerEvents = isActive ? 'none' : 'auto';
    } else {
      btn.classList.add('s4-disabled');
      btn.style.pointerEvents = 'none';
    }
  });
}

// ============================================================
// FADE HELPERS
// ============================================================
function s4_setModelOpacity(model, opacity) {
  model.traverse(c => {
    if (!c.isMesh || !c.material) return;
    const mats = Array.isArray(c.material) ? c.material : [c.material];
    mats.forEach(m => {
      m.transparent = true;
      m.opacity     = Math.max(0, Math.min(1, opacity));
    });
  });
}

function s4_fadeOut(model, durationSec, onDone) {
  const STEPS = 36;
  const dt    = (durationSec * 1000) / STEPS;
  let   step  = 0;
  const id = setInterval(() => {
    step++;
    s4_setModelOpacity(model, 1 - step / STEPS);
    if (step >= STEPS) {
      clearInterval(id);
      s4_setModelOpacity(model, 0);
      if (onDone) onDone();
    }
  }, dt);
}

function s4_fadeIn(model, durationSec, onDone) {
  const STEPS = 36;
  const dt    = (durationSec * 1000) / STEPS;
  let   step  = 0;
  s4_setModelOpacity(model, 0);
  const id = setInterval(() => {
    step++;
    s4_setModelOpacity(model, step / STEPS);
    if (step >= STEPS) {
      clearInterval(id);
      s4_setModelOpacity(model, 1);
      if (onDone) onDone();
    }
  }, dt);
}

// ============================================================
// EFFECTS
// ============================================================
function _s4_startEffects(stateKey) {
  if (stateKey === 'kota')   _s4_startSmoke();
  if (stateKey === 'gundul') _s4_startDust();
  // Update orbit saat switch ke model baru
  _s4_updateOrbitForModel(stateKey);
}

function _s4_updateOrbitForModel(stateKey) {
  const m = s4_models[stateKey];
  if (!m) return;
  const box = new THREE.Box3().setFromObject(m);
  const size = new THREE.Vector3(); box.getSize(size);
  const midY = box.min.y + size.y * 0.4;
  const cityW = Math.max(size.x, size.z);
  orbit.radius = Math.max(cityW * 1.1, 25);
  orbit.phi    = 1.05;
  orbit.theta  = 0.3;
  orbit.tx     = (box.min.x + box.max.x) / 2;
  orbit.ty     = midY;
  orbit.tz     = (box.min.z + box.max.z) / 2;
  applyOrbit();
}

function _s4_stopEffects(stateKey) {
  if (s4_smokeInterval) { clearInterval(s4_smokeInterval); s4_smokeInterval = null; }
  s4_smokeParticles.slice().forEach(p => { if(scene) scene.remove(p); });
  s4_smokeParticles = [];
  if (s4_dustInterval)  { clearInterval(s4_dustInterval);  s4_dustInterval  = null; }
  s4_dustParticles.slice().forEach(p => { if(scene) scene.remove(p); });
  s4_dustParticles = [];
}

// Titik cerobong asap — DALAM batas kota (footprint ±5.12 X, ±5.83 Z)
// Y akan diupdate dinamis setelah model load (topY + offset)
// X dan Z harus dalam ±4 supaya tepat di atas gedung
const S4_CHIMNEYS = [
  [-4,32,-3],[0,32,-4],[4,32,1],[3,32,0],[-3,32,4],
  [2,32,3],[-4,32,0],[4,32,4],[0,32,-1],[-4,32,-4],[4,32,4],[-1,32,3],
  [-3,32,-2],[2,32,1],[3,32,-3],[-4,32,2],[1,32,4],[4,32,-2]
];

function _s4_startSmoke() {
  s4_smokeInterval = setInterval(() => {
    // 4-6 partikel kecil tiap interval — tampak seperti asap tipis
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const ch  = S4_CHIMNEYS[Math.floor(Math.random() * S4_CHIMNEYS.length)];
      const pos = new THREE.Vector3(ch[0], ch[1], ch[2]);
      _s4_spawnSmoke(pos);
    }
  }, 80);
}

function _s4_spawnSmoke(pos) {
  // Partikel kecil & realistis — tidak besar seperti balon
  // Partikel asap kota: abu gelap, kecil, naik perlahan
  const g  = 0.18 + Math.random() * 0.16;   // abu-abu gelap
  const sz = 0.08 + Math.random() * 0.18;   // sangat kecil
  const p  = new THREE.Mesh(
    new THREE.SphereGeometry(sz, 6, 6),
    new THREE.MeshBasicMaterial({
      color:       new THREE.Color(g, g * 0.88, g * 0.82),
      transparent: true,
      opacity:     0.1 + Math.random() * 0.12,
      depthWrite:  false,
    })
  );
  p.position.copy(pos).add(new THREE.Vector3(
    (Math.random()-0.5)*0.5, Math.random()*0.2, (Math.random()-0.5)*0.5
  ));
  scene.add(p);
  s4_smokeParticles.push(p);

  // Gerakan naik + angin tipis
  const vx = (Math.random()-0.5)*0.025;
  const vy = 0.04 + Math.random() * 0.045;
  const vz = (Math.random()-0.5)*0.025;
  let life = 0;
  const maxLife = 90 + Math.floor(Math.random()*60);
  const id = setInterval(() => {
    p.position.x += vx; p.position.y += vy; p.position.z += vz;
    p.scale.multiplyScalar(1.014);       // membesar perlahan
    p.material.opacity -= 0.0018;        // memudar pelan
    life++;
    if (p.material.opacity <= 0 || life >= maxLife) {
      clearInterval(id);
      if (scene) scene.remove(p);
      const i = s4_smokeParticles.indexOf(p);
      if (i > -1) s4_smokeParticles.splice(i, 1);
    }
  }, 28);
}

function _s4_startDust() {
  s4_dustInterval = setInterval(() => {
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.15+Math.random()*0.2, 6, 6),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(0.55, 0.42, 0.26),
          transparent: true, opacity: 0.5
        })
      );
      p.position.set(
        (Math.random()-0.5)*24, 0.5+Math.random()*2, (Math.random()-0.5)*24
      );
      scene.add(p);
      s4_dustParticles.push(p);
      const vx=(Math.random()-0.5)*0.07, vy=0.02+Math.random()*0.04, vz=(Math.random()-0.5)*0.07;
      let life=0;
      const id=setInterval(()=>{
        p.position.x+=vx; p.position.y+=vy; p.position.z+=vz;
        p.material.opacity-=0.008; life++;
        if(p.material.opacity<=0||life>80){
          clearInterval(id); if(scene)scene.remove(p);
          const i=s4_dustParticles.indexOf(p); if(i>-1)s4_dustParticles.splice(i,1);
        }
      }, 30);
    }
  }, 220);
}

function _s4_animateLighting(toSt) {
  if (!s4_ambientLight || !s4_dirLight) return;
  const ta = new THREE.Color(toSt.ambClr);
  const td = new THREE.Color(toSt.dirClr);
  const tb = new THREE.Color(toSt.bgTop);
  const STEPS=28; let step=0;
  const id = setInterval(()=>{
    step++; const t=step/STEPS;
    s4_ambientLight.color.lerp(ta,t);
    s4_ambientLight.intensity += (toSt.ambInt - s4_ambientLight.intensity) * t * 0.25;
    s4_dirLight.color.lerp(td,t);
    s4_dirLight.intensity += (toSt.dirInt - s4_dirLight.intensity) * t * 0.25;
    if(scene&&scene.background) scene.background.lerp(tb,t);
    if(step>=STEPS) clearInterval(id);
  },40);
}

// ── Fallback ──
function s4_makeFallback(stateKey) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(24,1,24),
    new THREE.MeshPhongMaterial({
      color: stateKey==='bagus'?0x2e6b1f : stateKey==='gundul'?0x8a6a35 : 0x4a4a4a,
      transparent:true
    })
  );
  g.add(base);
  return g;
}

// ============================================================
// INJECT UI  (badge dihapus → tidak overlap dengan narasi)
// ============================================================
function s4_injectUI() {
  ['s4-panel','s4-style','s4-health-panel','s4-state-badge'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.remove();
  });

  const style = document.createElement('style');
  style.id = 's4-style';
  style.textContent = `
    /* ── Tombol state ── */
    #s4-panel {
      position:fixed; bottom:80px; left:50%;
      transform:translateX(-50%); z-index:60;
      display:flex; flex-direction:column; align-items:center; gap:8px;
    }
    .s4-section-label {
      font-family:'Syne',sans-serif; font-size:10px; font-weight:700;
      color:rgba(255,255,255,0.32); letter-spacing:1.5px; text-transform:uppercase;
    }
    .s4-btns { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }

    .s4-btn {
      display:flex; flex-direction:column; align-items:center; gap:4px;
      padding:11px 18px; border-radius:16px; cursor:pointer; min-width:128px;
      font-family:'DM Sans',sans-serif; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      background:rgba(8,18,8,0.9); border:1.5px solid rgba(255,255,255,0.12);
      backdrop-filter:blur(14px); box-shadow:0 4px 18px rgba(0,0,0,0.35);
    }
    .s4-btn:hover:not(.s4-disabled) { transform:translateY(-3px); border-color:rgba(255,255,255,0.32); }
    .s4-btn .s4-icon { font-size:20px; }
    .s4-btn .s4-lbl  { font-size:12px; font-weight:700; color:rgba(255,255,255,0.85); }
    .s4-btn .s4-sub  { font-size:10px; color:rgba(255,255,255,0.33); text-align:center; line-height:1.3; }

    /* Active states */
    .s4-active-bagus  { border-color:#00e676 !important; background:rgba(0,70,25,0.8) !important; box-shadow:0 0 22px rgba(0,230,118,0.22),0 4px 18px rgba(0,0,0,0.4) !important; }
    .s4-active-gundul { border-color:#ff7043 !important; background:rgba(70,25,0,0.8)  !important; box-shadow:0 0 22px rgba(255,112,67,0.22),0 4px 18px rgba(0,0,0,0.4) !important; }
    .s4-active-kota   { border-color:#f44336 !important; background:rgba(55,0,0,0.8)   !important; box-shadow:0 0 22px rgba(244,67,54,0.25),0 4px 18px rgba(0,0,0,0.4) !important; }
    .s4-active-bagus  .s4-lbl { color:#00e676; }
    .s4-active-gundul .s4-lbl { color:#ff7043; }
    .s4-active-kota   .s4-lbl { color:#f44336; }

    /* Disabled */
    .s4-disabled { opacity:0.38 !important; cursor:not-allowed !important; pointer-events:none !important; transform:none !important; }

    /* ── Health panel ── */
    #s4-health-panel {
      position:fixed; top:88px; right:14px; z-index:60; min-width:196px;
      background:rgba(3,12,3,0.93); border-radius:18px; padding:15px 17px;
      font-family:'DM Sans',sans-serif; backdrop-filter:blur(14px);
      border:1.5px solid rgba(0,230,118,0.18);
      box-shadow:0 8px 30px rgba(0,0,0,0.45);
    }
    #s4-bar-wrap { height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden; margin:7px 0 5px; }
    #s4-bar { height:100%; border-radius:4px; transition:width 1s cubic-bezier(0.4,0,0.2,1),background 0.8s ease; }
    #s4-hp-state {
      display:flex; align-items:center; gap:6px;
      font-size:11px; font-weight:700;
      margin-bottom:2px; transition:color 0.5s;
    }
    #s4-hp-pct { font-size:15px; font-weight:800; transition:color 0.5s; }
    #s4-hp-impact {
      font-size:10.5px; line-height:1.65; color:rgba(180,240,200,0.5);
      transition:color 0.4s; margin-top:8px; padding-top:7px;
      border-top:1px solid rgba(255,255,255,0.07);
    }
    @keyframes s4-kritis { 0%,100%{opacity:1}50%{opacity:0.2} }
    .s4-kritis-anim { animation:s4-kritis 0.75s ease infinite; }
  `;
  document.body.appendChild(style);

  // ── Panel tombol ──
  const panel = document.createElement('div');
  panel.id = 's4-panel';
  panel.innerHTML = `
    <div class="s4-section-label">Pilih Kondisi Lingkungan</div>
    <div class="s4-btns">
      <button class="s4-btn s4-disabled" id="s4-btn-bagus"
        onclick="s4_switchTo('bagus')" style="pointer-events:none;">
        <span class="s4-icon">🌿</span>
        <span class="s4-lbl">Lingkungan Sehat</span>
        <span class="s4-sub">Hutan lebat, air bersih,<br/>satwa beragam</span>
      </button>
      <button class="s4-btn" id="s4-btn-gundul"
        onclick="s4_switchTo('gundul')">
        <span class="s4-icon">🪓</span>
        <span class="s4-lbl">Pengundulan Hutan</span>
        <span class="s4-sub">Deforestasi, erosi,<br/>habitat hilang</span>
      </button>
      <button class="s4-btn" id="s4-btn-kota"
        onclick="s4_switchTo('kota')">
        <span class="s4-icon">🏭</span>
        <span class="s4-lbl">Urbanisasi & Polusi</span>
        <span class="s4-sub">Gedung beton, asap,<br/>hilang ruang hijau</span>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // ── Health panel ──
  const hp = document.createElement('div');
  hp.id = 's4-health-panel';
  hp.innerHTML = `
    <div style="font-size:10px;font-weight:800;color:#00e676;letter-spacing:0.8px;
      text-transform:uppercase;margin-bottom:2px;">Indeks Kesehatan Ekosistem</div>
    <div id="s4-bar-wrap"><div id="s4-bar" style="width:100%;background:#00e676;"></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div id="s4-hp-state" style="color:#00e676;">🌿 Lingkungan Sehat</div>
      <div id="s4-hp-pct"   style="color:#00e676;">100%</div>
    </div>
    <div id="s4-hp-impact">Semua komponen ekosistem berfungsi normal. Keanekaragaman hayati terjaga.</div>
  `;
  document.body.appendChild(hp);

  // Narasi awal
  const nEl = document.getElementById('narasi-text');
  if (nEl) nEl.textContent = S4_STATES.bagus.narasi;
}

// ── Update button highlight ──
function s4_updateButtons(activeKey) {
  ['bagus','gundul','kota'].forEach(k => {
    const btn = document.getElementById('s4-btn-'+k);
    if (!btn) return;
    // Reset class
    btn.className = 's4-btn';
    if (k === activeKey) {
      btn.classList.add('s4-active-'+activeKey, 's4-disabled');
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.pointerEvents = 'auto';
    }
  });
}

// ── Update health UI ──
function s4_updateHealthUI(stateKey) {
  const st  = S4_STATES[stateKey];
  if (!st) return;
  const bar = document.getElementById('s4-bar');
  const hst = document.getElementById('s4-hp-state');
  const hpc = document.getElementById('s4-hp-pct');
  const him = document.getElementById('s4-hp-impact');
  const pan = document.getElementById('s4-health-panel');

  if (bar)  { bar.style.width = st.health+'%'; bar.style.background = st.healthClr; }
  if (hst)  { hst.textContent = st.icon+' '+st.label; hst.style.color = st.healthClr; }
  if (hpc)  { hpc.textContent = st.health+'%';         hpc.style.color = st.healthClr; }
  if (pan)  { pan.style.borderColor = st.healthClr+'44'; }
  if (him)  {
    him.textContent = st.impactIcon+' '+st.impact;
    him.style.color = stateKey==='bagus'
      ? 'rgba(140,255,170,0.5)' : stateKey==='gundul'
      ? 'rgba(255,190,100,0.65)' : 'rgba(255,110,90,0.7)';
    him.className = 's4-hp-impact' + (stateKey==='kota' ? ' s4-kritis-anim' : '');
  }
}

// ── Entry point ──
window.addEventListener('DOMContentLoaded', () => startSceneApp(3));
