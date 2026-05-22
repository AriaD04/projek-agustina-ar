// ============================================================
// scene-7.js — Scene 7: Desain Ekosistem (RPG Builder v2)
// FIXES: 1) EcoBot kanan-bawah  2) Anti-collision radius  3) Terrain EPIC
// ============================================================
"use strict";

window.addEventListener('unhandledrejection',function(e){e.preventDefault();},true);
(function(){var _w=console.warn.bind(console);console.warn=function(){var m=String(arguments[0]||'');if(m.indexOf('Custom UV')+m.indexOf('not yet supported')>-2)return;_w.apply(console,arguments);};})();

function buildCurrentScene(){buildScene7();}

// ── Slot grid per type — ALL positions clamped inside island radius 18 ──
var S7_SLOTS={
  tree:    [[-10,0,-5],[-8,0,0],[-10,0,5],[-6,0,-4],[-6,0,4],[-4,0,-6],[-4,0,2],[-3,0,-2],[-3,0,6],[-11,0,1],[-9,0,-3],[-7,0,5]],
  forest:  [[-11,0,-2],[-9,0,4],[-7,0,-5],[-5,0,3],[-11,0,5],[-8,0,-3]],
  water:   [[-1,0,-5],[-1,0,0],[-1,0,5],[1,0,-3],[1,0,3],[0,0,2],[0,0,-2],[1,0,5],[1,0,-5]],
  water2:  [[-0.5,0,-3],[0.5,0,3],[1.5,0,-4],[1.5,0,4]],
  solar:   [[5,0,-6],[7,0,-5],[9,0,-6],[11,0,-4],[5,0,-2],[7,0,-2],[9,0,-3],[10,0,-2],[6,0,-5],[9,0,-5]],
  animal:  [[5,0,2],[7,0,4],[9,0,2],[10,0,4],[5,0,6],[8,0,5],[6,0,6],[10,0,2],[7,0,6],[9,0,4]],
  lion:    [[6,0,3],[8,0,4],[10,0,3],[7,0,5]],
  recycle: [[2,0,-4],[4,0,-5],[3,0,2],[1,0,-2],[3,0,3]],
  building:[[2,0,-3],[4,0,-4],[4,0,4],[3,0,6],[1,0,4]],
  rock:    [[-2,0,-7],[-4,0,7],[11,0,-6],[11,0,6],[-11,0,-4],[-11,0,4],[-1,0,-7],[0,0,7]],
};

// ── Item catalog ──
var S7_ITEMS=[
  {key:'tree',    icon:'🌳',label:'Pohon',         glb:'pohon.glb',                                                       targetSize:4.5, xp:50,  color:'#2d9e50',category:'flora', desc:'Penghasil O₂ & habitat makhluk hidup'},
  {key:'forest',  icon:'🌲',label:'Hutan Lebat',   glb:'low_poly_tree_scene_free-compressed.glb',                         targetSize:9,   xp:120, color:'#00e676',category:'flora', desc:'Hutan lebat meningkatkan biodiversitas & penyerapan karbon'},
  {key:'water',   icon:'💧',label:'Kolam Air',      glb:'genangan_air.glb',                                                targetSize:4,   xp:60,  color:'#42a5f5',category:'air',   desc:'Sumber air bersih untuk ekosistem'},
  {key:'solar',   icon:'⚡',label:'Panel Surya',    glb:'sceen_5_bagian_2_energi_terbarukan_solar_panel_1.glb',            targetSize:4,   xp:80,  color:'#ffca28',category:'energi',desc:'Energi bersih nol emisi karbon'},
  {key:'animal',  icon:'🦌',label:'Habitat Rusa',   glb:'rusa.glb',                                                        targetSize:3.5, xp:90,  color:'#ff7043',category:'fauna', desc:'Rusa herbivora penjaga keseimbangan rantai makanan'},
  {key:'recycle', icon:'♻️',label:'Daur Ulang',     glb:'sceen_5_bagian_1_recycle_1.glb',                                  targetSize:4.5, xp:70,  color:'#26c6da',category:'urban', desc:'Pengolahan sampah menjadi sumber daya baru'},
  {key:'building',icon:'🏡',label:'Bangunan Hijau', glb:'sceen_5_bagian_4_ruang_hijau_kota_1.glb',                         targetSize:5,   xp:75,  color:'#558b2f',category:'urban', desc:'Ruang hijau kota kurangi heat island'},
  {key:'water2',  icon:'🚿',label:'Pengelolaan Air',glb:'sceen_5_bagian_3_pengelolaan_air_traktor_air_1.glb',              targetSize:5,   xp:85,  color:'#29b6f6',category:'air',   desc:'Irigasi cerdas & konservasi air bersih'},
  {key:'rock',    icon:'🪨',label:'Batu Alam',      glb:'batu.glb',                                                        targetSize:2.5, xp:20,  color:'#90a4ae',category:'flora', desc:'Elemen abiotik penyeimbang ekosistem'},
  {key:'lion',    icon:'🦁',label:'Singa',          glb:'singa.glb',                                                       targetSize:3.5, xp:110, color:'#ffa726',category:'fauna', desc:'Predator puncak penjaga keseimbangan populasi'},
];

// ── Collision radius per type ──
var S7_RADIUS={tree:2.8,forest:5.5,water:3.2,water2:4,solar:2.5,animal:3,lion:3.5,recycle:3,building:3.5,rock:1.8};

// ── State ──
var s7_ticker7=0,s7_animObjs=[],s7_particles7=[],s7_lights7=[],s7_glbModels={};
var s7_usedSlots={},s7_slotIdx={},s7_placedList=[];
var s7_totalXP=0,s7_baseXP=0,s7_sceneRef7=null;
// Registered positions for collision check
var s7_occupiedPos=[];

// ============================================================
// BUILD
// ============================================================
function buildScene7(){
  s7_ticker7=0;s7_animObjs=[];s7_particles7=[];s7_lights7=[];s7_glbModels={};
  s7_usedSlots={};s7_slotIdx={};s7_placedList=[];s7_occupiedPos=[];
  s7_totalXP=s7_baseXP;s7_sceneRef7=scene;
  for(var k in S7_SLOTS)s7_slotIdx[k]=0;

  scene.background=new THREE.Color(0x030a05);
  scene.fog=new THREE.FogExp2(0x030a05,0.011);

  // Lighting
  scene.add(new THREE.AmbientLight(0x102010,1.4));
  var sun=new THREE.DirectionalLight(0xfff5d0,2.5);sun.position.set(20,40,15);sun.castShadow=true;scene.add(sun);
  var fill=new THREE.DirectionalLight(0x4488ff,0.55);fill.position.set(-25,15,-12);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x88ddff,0x224422,0.5));

  _s7_buildEpicTerrain();
  _s7_spawnAtmosphere();

  // Camera like image-2: bird's eye, island fills screen, centered
  orbit.radius = 52;       // zoom out enough to see whole island
  orbit.phi    = 0.72;     // ~41° tilt — matches image-2 perspective
  orbit.theta  = 0.0;      // straight ahead
  orbit.tx = 0; orbit.ty = 1; orbit.tz = 0;
  // Zoom: close enough to see detail, not too far out
  orbit.minR   = 8;        // zoom in very close (detail)
  orbit.maxR   = 58;       // max zoom out — keeps island visible
  // Phi clamp: never look from below terrain (minPhi > 0 = always above)
  orbit.minPhi = 0.28;     // ~16° — floor; prevents going below terrain
  orbit.maxPhi = Math.PI * 0.46; // normal shared default
  applyOrbit();

  _s7_restoreFromStorage();
  _s7_injectUI();

  var nEl=document.getElementById('narasi-text');
  if(nEl)nEl.textContent='🏗️ Mode Builder aktif! Pilih komponen di panel kiri — objek akan muncul di zona yang tepat.';

  _s7_updateBalance();
  _s7_startLoop();
}

// ============================================================
// TERRAIN EPIK — Pulau ekosistem mengambang di luar angkasa
// ============================================================
function _s7_buildEpicTerrain(){

  // ── 1. BINTANG — 250 titik tersebar di seluruh langit ──
  for(var s=0;s<250;s++){
    var star=new THREE.Mesh(
      new THREE.SphereGeometry(0.03+Math.random()*0.07,4,4),
      new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3+Math.random()*0.7})
    );
    star.position.set((Math.random()-0.5)*200,(Math.random()-0.5)*100,(Math.random()-0.5)*200);
    if(star.position.y<4) star.position.y+=15;
    scene.add(star);
  }

  // ── 2. PULAU — body batu coklat ──
  var islandGeo=new THREE.CylinderGeometry(21.5,17,3.8,72,1);
  var islandMesh=new THREE.Mesh(islandGeo,new THREE.MeshPhongMaterial({color:0x5a3e28,shininess:5}));
  islandMesh.position.y=-1.9;
  scene.add(islandMesh);

  // ── 3. LANTAI RUMPUT — bersih, tidak ada dekorasi ──
  var grass=new THREE.Mesh(
    new THREE.CylinderGeometry(21.5,21.5,0.5,72),
    new THREE.MeshPhongMaterial({color:0x2d6a1f,shininess:10})
  );
  grass.position.y=0.25;
  scene.add(grass);

  // Inner highlight ring (subtle zona center)
  var innerRing=new THREE.Mesh(
    new THREE.CylinderGeometry(8,8,0.08,48),
    new THREE.MeshPhongMaterial({color:0x3a8a25,transparent:true,opacity:0.5})
  );
  innerRing.position.y=0.54;
  scene.add(innerRing);

  // ── 4. SUNGAI — strip air biru di tengah ──
  var riverBed=new THREE.Mesh(
    new THREE.PlaneGeometry(5,38),
    new THREE.MeshPhongMaterial({color:0x0a3060,side:THREE.DoubleSide})
  );
  riverBed.rotation.x=-Math.PI/2;
  riverBed.position.set(0.5,-0.02,0);
  scene.add(riverBed);

  var waterMat=new THREE.MeshPhongMaterial({
    color:0x1565c0,transparent:true,opacity:0.80,
    emissive:new THREE.Color(0x0d47a1),emissiveIntensity:0.15,
    shininess:200,side:THREE.DoubleSide
  });
  var water=new THREE.Mesh(new THREE.PlaneGeometry(4.4,36),waterMat);
  water.rotation.x=-Math.PI/2;
  water.position.set(0.5,0.06,0);
  water.userData.waterSurface=true;
  scene.add(water);
  s7_animObjs.push(water);

  // Caustic highlights di air
  for(var ca=0;ca<10;ca++){
    var caustic=new THREE.Mesh(
      new THREE.PlaneGeometry(0.5+Math.random()*0.7,0.08+Math.random()*0.12),
      new THREE.MeshBasicMaterial({color:0x90caf9,transparent:true,opacity:0.2+Math.random()*0.18,side:THREE.DoubleSide})
    );
    caustic.rotation.x=-Math.PI/2;
    caustic.position.set(-1.2+Math.random()*2.4,0.07+ca*0.001,-13+Math.random()*26);
    caustic.userData.caustic=true;
    caustic.userData.causticPhase=Math.random()*Math.PI*2;
    scene.add(caustic);
    s7_animObjs.push(caustic);
  }

  // ── 5. TEBING BAWAH — batu menopang pulau ──
  var cliffColors=[0x6d4c41,0x5d4037,0x795548,0x8d6e63];
  for(var cl=0;cl<20;cl++){
    var ca2=cl/20*Math.PI*2;
    var cr=19.5+Math.random()*1.5;
    var cliff=new THREE.Mesh(
      new THREE.BoxGeometry(2.5+Math.random()*2.5,2.5+Math.random()*3,2+Math.random()*2),
      new THREE.MeshPhongMaterial({color:cliffColors[Math.floor(Math.random()*cliffColors.length)]})
    );
    cliff.position.set(Math.cos(ca2)*cr,-2.2-Math.random()*1.2,Math.sin(ca2)*cr);
    cliff.rotation.y=ca2;
    scene.add(cliff);
  }

  // Kabut bawah pulau
  for(var cf=0;cf<12;cf++){
    var cfang=Math.random()*Math.PI*2,cfr=5+Math.random()*14;
    var cloud=new THREE.Mesh(
      new THREE.SphereGeometry(2+Math.random()*3.5,8,6),
      new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.03+Math.random()*0.05})
    );
    cloud.scale.set(1,0.3,1);
    cloud.position.set(Math.cos(cfang)*cfr,-5-Math.random()*1.5,Math.sin(cfang)*cfr);
    cloud.userData.cloudBase=cloud.position.clone();
    cloud.userData.cloudPhase=Math.random()*Math.PI*2;
    scene.add(cloud);
    s7_animObjs.push(cloud);
  }

  // ── 6. GLOW RING ekosistem ──
  for(var og=0;og<3;og++){
    var outerR=new THREE.Mesh(
      new THREE.TorusGeometry(22+og*1.4,0.07+og*0.02,8,80),
      new THREE.MeshBasicMaterial({color:[0x00e676,0x42a5f5,0xffca28][og],transparent:true,opacity:0.14-og*0.04})
    );
    outerR.rotation.x=Math.PI/2;
    outerR.position.y=0.12+og*0.04;
    outerR.userData.rotSpeed=(og%2===0?0.05:-0.035);
    scene.add(outerR);
    s7_animObjs.push(outerR);
  }

  // ── 7. MATAHARI / BINTANG BESAR ──
  var sunball=new THREE.Mesh(
    new THREE.SphereGeometry(5,20,20),
    new THREE.MeshBasicMaterial({color:0xfff5a0,transparent:true,opacity:0.88})
  );
  sunball.position.set(55,35,-70);
  scene.add(sunball);
  var halo=new THREE.Mesh(
    new THREE.SphereGeometry(8,16,16),
    new THREE.MeshBasicMaterial({color:0xffec40,transparent:true,opacity:0.18})
  );
  halo.position.copy(sunball.position);
  scene.add(halo);
  scene.add(new THREE.PointLight(0xfff5a0,1.0,220)).position.copy(sunball.position);

  // ══════════════════════════════════════════════════════════════
  // ── 8. BACKGROUND SCI-FI / CYBERPUNK — menggantikan gunung ──
  // ══════════════════════════════════════════════════════════════

  // ── 8a. GROUND PLANE sci-fi luar ── (alas untuk semua struktur)
  var groundPlane=new THREE.Mesh(
    new THREE.CircleGeometry(120,64),
    new THREE.MeshPhongMaterial({color:0x050c12,shininess:20,side:THREE.DoubleSide})
  );
  groundPlane.rotation.x=-Math.PI/2;
  groundPlane.position.y=-8;
  scene.add(groundPlane);

  // Grid neon luar — cyberpunk floor
  var bigGrid=new THREE.GridHelper(200,40,0x003322,0x001a10);
  bigGrid.position.y=-7.9;
  bigGrid.material.transparent=true;
  bigGrid.material.opacity=0.55;
  scene.add(bigGrid);

  // Glow ring besar di lantai luar
  for(var gr=0;gr<4;gr++){
    var floorRing=new THREE.Mesh(
      new THREE.TorusGeometry(30+gr*18,0.15+gr*0.05,8,80),
      new THREE.MeshBasicMaterial({
        color:[0x00e676,0x00bcd4,0xffca28,0xff6d00][gr],
        transparent:true,opacity:0.08-gr*0.015
      })
    );
    floorRing.rotation.x=Math.PI/2;
    floorRing.position.y=-7.8;
    floorRing.userData.rotSpeed=(gr%2===0?0.03:-0.022)*(1+gr*0.3);
    scene.add(floorRing);
    s7_animObjs.push(floorRing);
  }

  // ── 8b. MENARA ENERGI SCI-FI — 8 menara melingkari pulau ──
  var towerAngles=[0,45,90,135,180,225,270,315];
  towerAngles.forEach(function(deg,ti){
    var rad=deg*Math.PI/180;
    var tDist=38+Math.sin(ti*1.3)*4; // jarak bervariasi
    var tx=Math.cos(rad)*tDist, tz=Math.sin(rad)*tDist;
    var tH=18+Math.sin(ti*0.8)*8; // tinggi bervariasi 18-26

    // Base pedestal
    var pedestal=new THREE.Mesh(
      new THREE.CylinderGeometry(1.8,2.4,1.5,8),
      new THREE.MeshPhongMaterial({color:0x0a1a14,emissive:new THREE.Color(0x003322),emissiveIntensity:0.4,shininess:60})
    );
    pedestal.position.set(tx,-7.2,tz);
    scene.add(pedestal);

    // Shaft utama menara
    var shaft=new THREE.Mesh(
      new THREE.CylinderGeometry(0.35,0.55,tH,8),
      new THREE.MeshPhongMaterial({color:0x0d2218,emissive:new THREE.Color(0x003322),emissiveIntensity:0.3,shininess:80})
    );
    shaft.position.set(tx,-7.2+tH/2,tz);
    scene.add(shaft);

    // Ring-ring di tengah menara
    var ringCount=Math.floor(tH/5);
    for(var rr=0;rr<ringCount;rr++){
      var towerRing=new THREE.Mesh(
        new THREE.TorusGeometry(0.6+rr*0.08,0.08,6,16),
        new THREE.MeshBasicMaterial({color:ti%2===0?0x00e676:0x00bcd4,transparent:true,opacity:0.5+rr*0.05})
      );
      towerRing.rotation.x=Math.PI/2;
      towerRing.position.set(tx,-7.2+3+rr*5,tz);
      towerRing.userData.rotSpeed=(rr%2===0?1.2:-0.9)*(0.5+rr*0.1);
      scene.add(towerRing);
      s7_animObjs.push(towerRing);
    }

    // Crystal puncak — octahedron bercahaya
    var crystalTop=new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9,0),
      new THREE.MeshBasicMaterial({color:ti%3===0?0x00e676:ti%3===1?0x42a5f5:0xffca28,transparent:true,opacity:0.85})
    );
    crystalTop.position.set(tx,-7.2+tH+0.5,tz);
    crystalTop.userData.crystalPulse=true;
    crystalTop.userData.crystalPhase=(ti/8)*Math.PI*2;
    scene.add(crystalTop);
    s7_animObjs.push(crystalTop);

    // Aura ring di puncak
    var auraRing=new THREE.Mesh(
      new THREE.TorusGeometry(1.4,0.06,6,20),
      new THREE.MeshBasicMaterial({color:ti%3===0?0x00e676:ti%3===1?0x42a5f5:0xffca28,transparent:true,opacity:0.35})
    );
    auraRing.rotation.x=Math.PI/2;
    auraRing.position.set(tx,-7.2+tH+0.5,tz);
    auraRing.userData.rotSpeed=(ti%2===0?1.5:-1.2);
    scene.add(auraRing);
    s7_animObjs.push(auraRing);

    // Point light per menara
    var towerLight=new THREE.PointLight(ti%3===0?0x00e676:ti%3===1?0x42a5f5:0xffca28,0.7,18);
    towerLight.position.set(tx,-7.2+tH+1,tz);
    towerLight.userData.baseInt=0.7;
    towerLight.userData.pulseOff=(ti/8)*Math.PI*2;
    scene.add(towerLight);
    s7_lights7.push(towerLight);
  });

  // ── 8c. LASER BEAM — garis cahaya antara menara ke pulau ──
  towerAngles.forEach(function(deg,ti){
    var rad=deg*Math.PI/180;
    var tDist=38+Math.sin(ti*1.3)*4;
    var tx=Math.cos(rad)*tDist, tz=Math.sin(rad)*tDist;
    var tH=18+Math.sin(ti*0.8)*8;
    // Beam dari puncak menara ke pusat pulau (halus, tipis)
    var beamPts=[
      new THREE.Vector3(tx,-7.2+tH,tz),
      new THREE.Vector3(0,4,0)
    ];
    var beam=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(beamPts),
      new THREE.LineBasicMaterial({color:ti%3===0?0x00e676:ti%3===1?0x42a5f5:0xffca28,transparent:true,opacity:0.06})
    );
    scene.add(beam);
  });

  // ── 8d. PLATFORM HEXAGONAL di background — struktur melayang ──
  var hexPositions=[
    {x:-55,z:-45,y:-5,r:10,h:1.2},{x:58,z:-42,y:-4,r:9,h:1.0},
    {x:-52,z:38,y:-6,r:11,h:1.4},{x:55,z:40,y:-5,r:8,h:1.0},
    {x:0,z:-65,y:-3,r:13,h:1.5},{x:0,z:65,y:-4,r:12,h:1.3},
  ];
  hexPositions.forEach(function(hp,hi){
    var hexPlat=new THREE.Mesh(
      new THREE.CylinderGeometry(hp.r,hp.r*1.1,hp.h,6),
      new THREE.MeshPhongMaterial({
        color:0x0a1a12,
        emissive:new THREE.Color(0x001a0e),emissiveIntensity:0.5,shininess:80
      })
    );
    hexPlat.position.set(hp.x,hp.y,hp.z);
    scene.add(hexPlat);

    // Neon edge ring
    var hexRing=new THREE.Mesh(
      new THREE.TorusGeometry(hp.r+0.3,0.1,6,6),
      new THREE.MeshBasicMaterial({color:[0x00e676,0x42a5f5,0xffca28,0xff6d00,0x00bcd4,0xce93d8][hi],transparent:true,opacity:0.55})
    );
    hexRing.rotation.x=Math.PI/2;
    hexRing.position.set(hp.x,hp.y+hp.h/2+0.05,hp.z);
    hexRing.userData.rotSpeed=(hi%2===0?0.3:-0.25);
    scene.add(hexRing);
    s7_animObjs.push(hexRing);

    // Grid di atas platform
    var hexGrid=new THREE.GridHelper(hp.r*1.8,5,[0x003322,0x001a33][hi%2],[0x002211,0x00112a][hi%2]);
    hexGrid.position.set(hp.x,hp.y+hp.h/2+0.06,hp.z);
    hexGrid.material.transparent=true;hexGrid.material.opacity=0.4;
    scene.add(hexGrid);

    // Mini menara di sudut platform
    for(var mt=0;mt<3;mt++){
      var ma=(mt/3)*Math.PI*2;
      var mtr=hp.r*0.65;
      var miniTower=new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.24,4+hi*0.5,6),
        new THREE.MeshPhongMaterial({color:0x0d2218,emissive:new THREE.Color(0x001a0e),emissiveIntensity:0.4})
      );
      miniTower.position.set(hp.x+Math.cos(ma)*mtr, hp.y+hp.h/2+2, hp.z+Math.sin(ma)*mtr);
      scene.add(miniTower);
      var miniCrystal=new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3,0),
        new THREE.MeshBasicMaterial({color:[0x00e676,0x42a5f5,0xffca28,0xff6d00,0x00bcd4,0xce93d8][hi],transparent:true,opacity:0.8})
      );
      miniCrystal.position.set(hp.x+Math.cos(ma)*mtr, hp.y+hp.h/2+4.5, hp.z+Math.sin(ma)*mtr);
      miniCrystal.userData.crystalPulse=true;
      miniCrystal.userData.crystalPhase=ma+hi;
      scene.add(miniCrystal);
      s7_animObjs.push(miniCrystal);
    }

    // Point light per hex platform
    var hexLight=new THREE.PointLight([0x00e676,0x42a5f5,0xffca28,0xff6d00,0x00bcd4,0xce93d8][hi],0.6,25);
    hexLight.position.set(hp.x,hp.y+3,hp.z);
    hexLight.userData.baseInt=0.6;
    hexLight.userData.pulseOff=hi*1.05;
    scene.add(hexLight);
    s7_lights7.push(hexLight);
  });

  // ── 8e. HOLOGRAM SPHERE di langit — bola cincin transparan ──
  var holoColors=[0x00e676,0x42a5f5,0xffca28];
  [[0,25,-80],[60,20,60],[-65,18,50]].forEach(function(hPos,hi2){
    var holoR=6+hi2*2;
    // Outer sphere
    var holoSph=new THREE.Mesh(
      new THREE.SphereGeometry(holoR,12,12),
      new THREE.MeshBasicMaterial({color:holoColors[hi2],transparent:true,opacity:0.04,wireframe:true})
    );
    holoSph.position.set(hPos[0],hPos[1],hPos[2]);
    holoSph.userData.holoSpin=0.15+hi2*0.08;
    scene.add(holoSph);
    s7_animObjs.push(holoSph);

    // Ring cincin di setiap hologram
    for(var hr=0;hr<3;hr++){
      var holoRing=new THREE.Mesh(
        new THREE.TorusGeometry(holoR*(0.6+hr*0.25),0.1,8,32),
        new THREE.MeshBasicMaterial({color:holoColors[hi2],transparent:true,opacity:0.18-hr*0.04})
      );
      holoRing.rotation.set(hr*1.1,hr*0.7,0);
      holoRing.position.set(hPos[0],hPos[1],hPos[2]);
      holoRing.userData.rotSpeed=(hr%2===0?0.4:-0.5)*(1+hr*0.2);
      scene.add(holoRing);
      s7_animObjs.push(holoRing);
    }

    // Center glow dot
    var centerDot=new THREE.Mesh(
      new THREE.SphereGeometry(holoR*0.15,8,8),
      new THREE.MeshBasicMaterial({color:holoColors[hi2],transparent:true,opacity:0.75})
    );
    centerDot.position.set(hPos[0],hPos[1],hPos[2]);
    centerDot.userData.crystalPulse=true;
    centerDot.userData.crystalPhase=hi2*2.1;
    scene.add(centerDot);
    s7_animObjs.push(centerDot);
  });

  // ── 8f. DATA STREAM — garis partikel vertikal naik ──
  var streamPositions=[[35,-8,-35],[-38,-8,-30],[40,-8,38],[-35,-8,42],[0,-8,-55],[0,-8,58]];
  streamPositions.forEach(function(sp2,si2){
    for(var sd=0;sd<12;sd++){
      var dot=new THREE.Mesh(
        new THREE.SphereGeometry(0.12+Math.random()*0.1,5,5),
        new THREE.MeshBasicMaterial({color:[0x00e676,0x42a5f5,0xffca28][si2%3],transparent:true,opacity:0.5+Math.random()*0.4})
      );
      dot.position.set(
        sp2[0]+(Math.random()-0.5)*1.5,
        sp2[1]+sd*2.5+Math.random()*2,
        sp2[2]+(Math.random()-0.5)*1.5
      );
      dot.userData.streamBase=dot.position.clone();
      dot.userData.streamSpeed=0.8+Math.random()*0.6;
      dot.userData.streamPhase=Math.random()*Math.PI*2;
      dot.userData.isStream=true;
      scene.add(dot);
      s7_animObjs.push(dot);
    }
  });

} // end _s7_buildEpicTerrain

// ============================================================
// ATMOSPHERE PARTICLES
// ============================================================
function _s7_spawnAtmosphere(){
  var colors=[0x00e676,0x42a5f5,0xffca28,0xff7043,0xffffff,0x80deea];
  for(var i=0;i<70;i++){
    var c=colors[i%colors.length];
    var p=new THREE.Mesh(
      new THREE.SphereGeometry(0.04+Math.random()*0.07,6,6),
      new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.2+Math.random()*0.35})
    );
    p.position.set((Math.random()-0.5)*50,0.5+Math.random()*10,(Math.random()-0.5)*32);
    p.userData.pvy=0.003+Math.random()*0.007;
    p.userData.pvx=(Math.random()-0.5)*0.002;
    p.userData.pvz=(Math.random()-0.5)*0.002;
    p.userData.pmaxY=11+Math.random()*3;
    p.userData.pBaseX=p.position.x;
    p.userData.pBaseZ=p.position.z;
    p.userData.isAtmos=true;
    scene.add(p);
    s7_particles7.push(p);
  }
}

// ── Hard boundary — nothing may exceed this radius from center ──
var S7_ISLAND_RADIUS = 18.5; // grass cylinder radius 21.5 minus safe margin

function _s7_insideBounds(x,z,objRadius){
  var dist=Math.sqrt(x*x+z*z);
  return dist+objRadius <= S7_ISLAND_RADIUS;
}

function _s7_isTooClose(x,z,radius){
  for(var i=0;i<s7_occupiedPos.length;i++){
    var op=s7_occupiedPos[i];
    var dist=Math.sqrt(Math.pow(x-op.x,2)+Math.pow(z-op.z,2));
    var minDist=radius+(op.r||2.5);
    if(dist<minDist)return true;
  }
  return false;
}

function _s7_findFreeSlot(key){
  var slotKey=(S7_SLOTS[key])?key:'building';
  var slots=S7_SLOTS[slotKey];
  var radius=S7_RADIUS[key]||2.8;
  var idx=s7_slotIdx[slotKey]||0;

  // Try predefined slots first
  var tried=0;
  while(tried<slots.length){
    var si=idx%slots.length;
    var sx=slots[si][0],sz=slots[si][2];
    if(_s7_insideBounds(sx,sz,radius) && !_s7_isTooClose(sx,sz,radius)){
      s7_slotIdx[slotKey]=si+1;
      return{x:sx,y:0,z:sz};
    }
    idx++;tried++;
  }
  // All predefined slots taken — spiral search staying inside island
  var base=slots[0];
  for(var sp=1;sp<30;sp++){
    var ang=sp*2.4,dist2=Math.min(sp*1.5, S7_ISLAND_RADIUS-radius-1);
    var fx=base[0]+Math.cos(ang)*dist2;
    var fz=base[2]+Math.sin(ang)*dist2;
    // Hard clamp: if computed position puts it outside, pull toward center
    var posR=Math.sqrt(fx*fx+fz*fz);
    if(posR+radius>S7_ISLAND_RADIUS){
      var scale=(S7_ISLAND_RADIUS-radius-0.5)/posR;
      fx*=scale; fz*=scale;
    }
    if(!_s7_isTooClose(fx,fz,radius)){
      return{x:fx,y:0,z:fz};
    }
  }
  return null;
}

// ============================================================
// PLACE ITEM
// ============================================================
function _s7_placeItem(itemKey){
  var item=null;
  for(var i=0;i<S7_ITEMS.length;i++){if(S7_ITEMS[i].key===itemKey){item=S7_ITEMS[i];break;}}
  if(!item)return;

  var slot=_s7_findFreeSlot(itemKey);
  if(!slot){
    _s7_showAreaPenuhPopup(item);
    return;
  }

  // Register collision
  s7_occupiedPos.push({x:slot.x,z:slot.z,r:S7_RADIUS[itemKey]||2.8});

  loadGLB(itemKey+'_s7',item.glb,function(model){
    if(!model||!scene||scene!==s7_sceneRef7)return;
    fitModelToBox(model,item.targetSize);

    // Compute bounding box to find bottom of model
    // so it sits exactly ON top of terrain (y=0.5 = top of grass layer)
    var bbox=new THREE.Box3().setFromObject(model);
    var modelBottomOffset=bbox.min.y; // negative = model center is above its feet
    var terrainY=0.52; // top surface of grass cylinder
    var targetY=terrainY-modelBottomOffset;

    // Posisi awal di bawah tanah (rise animation)
    model.position.set(slot.x,targetY-6,slot.z);
    model.userData.s7TargetY=targetY;
    model.userData.s7Rising=true;
    model.userData.s7Item=itemKey;
    model.userData.s7BaseY=targetY;
    model.userData.s7Float=0.10+Math.random()*0.08; // subtle float, not too much
    model.userData.s7FloatPhase=Math.random()*Math.PI*2;
    model.rotation.y=Math.random()*Math.PI*2;

    scene.add(model);
    s7_animObjs.push(model);
    s7_placedList.push({key:itemKey,model:model,slot:slot});

    s7_totalXP+=item.xp;
    _s7_updateBalance();
    _s7_updateXpDisplay();
    _s7_spawnXpChip(item.xp,item.color);
    _s7_spawnLandingFX(slot.x,slot.z,item.color);
    _s7_ecoBot(item.icon+' '+item.label+' berhasil ditanam! '+item.desc);
    _s7_saveToStorage();
  });
}

// ============================================================
// AREA PENUH POPUP — fullscreen overlay
// ============================================================
function _s7_showAreaPenuhPopup(item){
  var pop=document.getElementById('s7-areafull-popup');
  if(!pop)return;

  // Update label
  var lbl=document.getElementById('s7-full-itemname');
  if(lbl) lbl.textContent=item.label;

  // Shake animation reset
  var card=document.getElementById('s7-full-card');
  if(card){ card.style.animation='none'; requestAnimationFrame(function(){ card.style.animation='s7fullCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards, s7fullShake 0.5s ease 0.45s'; }); }

  pop.classList.add('open');

  // Auto-close after 5s
  clearTimeout(pop._autoClose);
  pop._autoClose=setTimeout(function(){ _s7_closeAreaFull(); },5000);
}

window._s7_closeAreaFull=function(){
  var pop=document.getElementById('s7-areafull-popup');
  if(pop) pop.classList.remove('open');
};

// ============================================================
// LANDING FX
// ============================================================
function _s7_spawnLandingFX(x,z,colorHex){
  var hex=parseInt(colorHex.replace('#',''),16);
  for(var i=0;i<12;i++){
    var p=new THREE.Mesh(
      new THREE.SphereGeometry(0.07+Math.random()*0.07,6,6),
      new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:0.9})
    );
    var ang=(i/12)*Math.PI*2;
    p.position.set(x+Math.cos(ang)*0.3,0.4+Math.random()*1,z+Math.sin(ang)*0.3);
    p.userData.pvx=Math.cos(ang)*0.055;
    p.userData.pvy=0.055+Math.random()*0.07;
    p.userData.pvz=Math.sin(ang)*0.055;
    p.userData.pLife=1.0;
    p.userData.isLandingP=true;
    scene.add(p);
    s7_particles7.push(p);
  }
  // Ring shockwave
  var ring=new THREE.Mesh(
    new THREE.TorusGeometry(0.3,0.06,6,20),
    new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:0.7})
  );
  ring.rotation.x=Math.PI/2;
  ring.position.set(x,0.1,z);
  ring.userData.shockwave=true;
  ring.userData.swLife=1.0;
  scene.add(ring);
  s7_particles7.push(ring);
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function _s7_startLoop(){
  var lastT=performance.now();var ref=s7_sceneRef7;
  function tick(now){
    if(!scene||scene!==ref)return;
    var dt=Math.min((now-lastT)/1000,0.1);lastT=now;s7_ticker7+=dt;var t=s7_ticker7;

    s7_animObjs.forEach(function(obj){
      if(!obj.parent)return;
      // Water surface shimmer
      if(obj.userData.waterSurface){
        obj.material.opacity=0.78+Math.sin(t*1.8)*0.06;
        obj.material.emissiveIntensity=0.14+Math.sin(t*2.2)*0.06;
        return;
      }
      // Caustic
      if(obj.userData.caustic){
        obj.material.opacity=0.15+Math.sin(t*2.5+obj.userData.causticPhase)*0.12;
        obj.position.x+=Math.sin(t*0.8+obj.userData.causticPhase)*0.004;
        return;
      }
      // Outer rings rotate
      if(obj.userData.rotSpeed!==undefined){
        obj.rotation.z+=obj.userData.rotSpeed*dt;
        return;
      }
      // Energy crystal pulse
      if(obj.userData.crystalPulse){
        var sc=0.85+Math.sin(t*3+obj.userData.crystalPhase)*0.2;
        obj.scale.setScalar(sc);
        obj.rotation.y+=1.5*dt;
        obj.material.opacity=0.5+Math.sin(t*3+obj.userData.crystalPhase)*0.35;
        return;
      }
      // holoSpin sphere
      if(obj.userData.holoSpin){
        obj.rotation.y+=obj.userData.holoSpin*dt;
        obj.rotation.x+=obj.userData.holoSpin*0.4*dt;
        return;
      }
      // Data stream dots rising
      if(obj.userData.isStream){
        obj.position.y+=obj.userData.streamSpeed*dt;
        obj.material.opacity=0.3+Math.sin(t*3+obj.userData.streamPhase)*0.35;
        if(obj.position.y>obj.userData.streamBase.y+30){
          obj.position.y=obj.userData.streamBase.y;
        }
        return;
      }
      // Cloud drift
      if(obj.userData.cloudBase){
        obj.position.x=obj.userData.cloudBase.x+Math.sin(t*0.2+obj.userData.cloudPhase)*1.5;
        obj.position.y=obj.userData.cloudBase.y+Math.sin(t*0.35+obj.userData.cloudPhase)*0.4;
        return;
      }
      // GLB rise
      if(obj.userData.s7Rising){
        obj.position.y+=(obj.userData.s7TargetY-obj.position.y)*0.09;
        if(Math.abs(obj.position.y-obj.userData.s7TargetY)<0.02){
          obj.position.y=obj.userData.s7TargetY;obj.userData.s7Rising=false;
        }
        return;
      }
      // GLB float
      if(obj.userData.s7Float!==undefined&&!obj.userData.s7Rising){
        var by=obj.userData.s7BaseY||0;
        obj.position.y=by+Math.sin(t*obj.userData.s7Float+obj.userData.s7FloatPhase)*0.07;
      }
    });

    // Lights pulse
    s7_lights7.forEach(function(lt){
      lt.intensity=lt.userData.baseInt+Math.sin(t*2.2+lt.userData.pulseOff)*0.25;
    });

    // Particles
    for(var j=0;j<s7_particles7.length;j++){
      var pt=s7_particles7[j];
      if(!pt.parent)continue;
      if(pt.userData.isAtmos){
        pt.position.y+=pt.userData.pvy;
        pt.position.x+=pt.userData.pvx;
        pt.position.z+=pt.userData.pvz;
        if(pt.position.y>pt.userData.pmaxY){
          pt.position.y=0.2;
          pt.position.x=pt.userData.pBaseX+(Math.random()-0.5)*2;
          pt.position.z=pt.userData.pBaseZ+(Math.random()-0.5)*2;
        }
        continue;
      }
      if(pt.userData.shockwave){
        pt.userData.swLife-=dt*2;
        var sc2=1+(1-pt.userData.swLife)*6;
        pt.scale.setScalar(sc2);
        pt.material.opacity=pt.userData.swLife*0.6;
        if(pt.userData.swLife<=0){scene.remove(pt);s7_particles7.splice(j,1);j--;}
        continue;
      }
      if(pt.userData.isLandingP){
        pt.position.x+=pt.userData.pvx;
        pt.position.y+=pt.userData.pvy;
        pt.position.z+=pt.userData.pvz;
        pt.userData.pvx*=0.9;
        pt.userData.pvy-=0.004;
        pt.userData.pvz*=0.9;
        pt.userData.pLife-=dt*1.6;
        pt.material.opacity=Math.max(0,pt.userData.pLife*0.8);
        if(pt.userData.pLife<=0){scene.remove(pt);s7_particles7.splice(j,1);j--;}
        continue;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============================================================
// BALANCE
// ============================================================
function _s7_updateBalance(){
  var counts={flora:0,fauna:0,energi:0,air:0,urban:0};
  s7_placedList.forEach(function(p){
    for(var i=0;i<S7_ITEMS.length;i++){
      if(S7_ITEMS[i].key===p.key){counts[S7_ITEMS[i].category]=(counts[S7_ITEMS[i].category]||0)+1;break;}
    }
  });
  var total=Math.max(s7_placedList.length,1);
  var floraS=Math.min(Math.round((counts.flora/total)*2.5*100),100);
  var faunaS=Math.min(Math.round((counts.fauna/total)*4*100),100);
  var enrgS =Math.min(Math.round((counts.energi/total)*5*100),100);
  var airS  =Math.min(Math.round((counts.air/total)*5*100),100);
  var urbS  =Math.min(Math.round((counts.urban/total)*5*100),100);
  _s7_setMeter('flora',floraS);_s7_setMeter('fauna',faunaS);
  _s7_setMeter('energy',enrgS);_s7_setMeter('air',airS,'#29b6f6');_s7_setMeter('urban',urbS,'#558b2f');
  var avg=(floraS+faunaS+enrgS+airS+urbS)/5;
  var st=document.getElementById('s7-balance-status');
  if(!st)return;
  if(s7_placedList.length===0){st.textContent='🌱 Tambah komponen!';st.style.color='#888';}
  else if(avg>=70){st.textContent='✅ Ekosistem Seimbang!';st.style.color='#00e676';st.style.textShadow='0 0 12px #00e67655';}
  else if(avg>=40){st.textContent='⚠️ Hampir Seimbang';st.style.color='#ffca28';st.style.textShadow='none';}
  else{st.textContent='❌ Belum Seimbang';st.style.color='#ff5252';st.style.textShadow='none';}
  // Shared compat
  ['flora','fauna','energy'].forEach(function(id,ii){
    var v=[floraS,faunaS,enrgS][ii];
    var f=document.getElementById(id+'-fill');if(f)f.style.width=v+'%';
    var l=document.getElementById(id+'-val');if(l)l.textContent=v+'%';
  });
  var bst=document.getElementById('balance-status');
  if(bst)bst.textContent=avg>=70?'✅ Seimbang!':avg>=40?'⚠️ Hampir':'❌ Belum';
  builtObjects.tree=counts.flora;builtObjects.animal=counts.fauna;
  builtObjects.solar=counts.energi;builtObjects.water=counts.air;builtObjects.building=counts.urban;
  try{localStorage.setItem('ar_builtObjects',JSON.stringify(builtObjects));}catch(e){}
}
function _s7_setMeter(id,val,color){
  var f=document.getElementById('s7m-'+id+'-fill');
  var l=document.getElementById('s7m-'+id+'-val');
  if(f){f.style.width=val+'%';if(color)f.style.background=color;}
  if(l)l.textContent=val+'%';
}
function _s7_updateXpDisplay(){
  var x=document.getElementById('s7-xp-val');if(x)x.textContent=s7_totalXP;
  var c=document.getElementById('s7-count-val');if(c)c.textContent=s7_placedList.length;
}

// ============================================================
// STORAGE
// ============================================================
function _s7_saveToStorage(){
  try{
    localStorage.setItem('ar_s7_placed',JSON.stringify(s7_placedList.map(function(p){return p.key;})));
    localStorage.setItem('ar_s7_xp',s7_totalXP);
    localStorage.setItem('ar_builtObjects',JSON.stringify(builtObjects));
  }catch(e){}
}
function _s7_restoreFromStorage(){
  try{
    var raw=localStorage.getItem('ar_s7_placed');
    var xp=localStorage.getItem('ar_s7_xp');
    if(xp)s7_baseXP=parseInt(xp)||0;
    s7_totalXP=s7_baseXP;
    if(raw)JSON.parse(raw).forEach(function(k){_s7_placeItem(k);});
  }catch(e){}
}

// ============================================================
// XP CHIP
// ============================================================
function _s7_spawnXpChip(xp,color){
  for(var k=0;k<2;k++){
    (function(k){
      setTimeout(function(){
        var chip=document.createElement('div');
        chip.className='s7-xp-chip';
        chip.textContent='+'+xp+' XP';
        chip.style.color=color;
        chip.style.textShadow='0 0 10px '+color;
        chip.style.left=(30+Math.random()*40)+'%';
        chip.style.top=(35+Math.random()*25)+'%';
        document.body.appendChild(chip);
        setTimeout(function(){if(chip.parentNode)chip.remove();},1400);
      },k*180);
    })(k);
  }
}

// ============================================================
// ECOBOT — typing
// ============================================================
var _s7_typeTO=null;
function _s7_ecoBot(msg){
  var el=document.getElementById('s7-bot-text');if(!el)return;
  if(_s7_typeTO)clearTimeout(_s7_typeTO);
  el.textContent='';var i=0;
  function next(){
    if(!document.getElementById('s7-bot-text'))return;
    if(i<msg.length){el.textContent+=msg[i++];_s7_typeTO=setTimeout(next,20);}
  }next();
}

// ============================================================
// INJECT UI
// ============================================================
function _s7_injectUI(){
  ['s7-style','s7-panel','s7-meter','s7-bot','s7-topbar','s7-confirm-modal'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.remove();
  });
  document.getElementById('builder-ui').style.display='none';
  document.getElementById('balance-meter').style.display='none';

  var style=document.createElement('style');
  style.id='s7-style';
  style.textContent=`
    .s7-xp-chip{position:fixed;pointer-events:none;z-index:500;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;animation:s7chipFly 1.4s ease-out forwards;}
    @keyframes s7chipFly{0%{opacity:1;transform:translateY(0) scale(1.2);}100%{opacity:0;transform:translateY(-70px) scale(0.7);}}

    /* TOP BAR */
    #s7-topbar{position:fixed;top:38px;left:50%;transform:translateX(-50%);z-index:80;display:flex;align-items:center;gap:18px;background:rgba(3,8,14,0.93);border:1.5px solid rgba(0,230,118,0.28);border-radius:30px;padding:7px 22px;backdrop-filter:blur(16px);animation:s7fadeIn 0.6s ease 0.3s both;white-space:nowrap;}
    @keyframes s7fadeIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    .s7-tb-item{display:flex;align-items:center;gap:7px;}
    .s7-tb-icon{font-size:16px;}
    .s7-tb-label{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.35);font-family:'Syne',sans-serif;}
    .s7-tb-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;}
    .s7-tb-sep{width:1px;height:22px;background:rgba(255,255,255,0.1);}

    /* CATALOG PANEL — kiri, scrollable */
    #s7-panel{position:fixed;left:12px;top:50%;transform:translateY(-50%);z-index:75;width:178px;display:flex;flex-direction:column;gap:5px;max-height:78vh;overflow-y:auto;overflow-x:hidden;animation:s7slideL 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both;}
    #s7-panel::-webkit-scrollbar{width:3px;}
    #s7-panel::-webkit-scrollbar-thumb{background:rgba(0,230,118,0.3);border-radius:2px;}
    @keyframes s7slideL{from{opacity:0;transform:translateY(-50%) translateX(-30px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
    .s7-p-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(0,230,118,0.65);padding:0 4px 6px;border-bottom:1px solid rgba(0,230,118,0.15);flex-shrink:0;}
    .s7-item-btn{background:rgba(3,8,18,0.93);border:1.5px solid rgba(255,255,255,0.07);border-radius:11px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s ease;backdrop-filter:blur(10px);flex-shrink:0;}
    .s7-item-btn:hover{border-color:var(--s7c,rgba(0,230,118,0.5));box-shadow:0 0 12px rgba(0,230,118,0.1);transform:translateX(3px);}
    .s7-item-btn:active{transform:translateX(1px) scale(0.97);}
    .s7-item-icon{width:28px;height:28px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;}
    .s7-item-info{flex:1;min-width:0;}
    .s7-item-name{font-family:'Syne',sans-serif;font-size:10.5px;font-weight:700;color:#f0f4f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .s7-item-xp{font-size:9.5px;font-weight:600;margin-top:1px;font-family:'Syne',sans-serif;}
    .s7-reset-btn{background:rgba(244,67,54,0.1);border:1.5px solid rgba(244,67,54,0.3);border-radius:11px;padding:8px;cursor:pointer;text-align:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:#ff5252;transition:all 0.2s ease;margin-top:4px;flex-shrink:0;}
    .s7-reset-btn:hover{background:rgba(244,67,54,0.22);transform:scale(1.02);}

    /* METER PANEL — kanan, lebih ke atas */
    #s7-meter{position:fixed;right:12px;top:44%;transform:translateY(-50%);z-index:75;width:210px;background:rgba(3,8,14,0.95);border:1.5px solid rgba(0,230,118,0.2);border-radius:18px;padding:14px 15px 12px;backdrop-filter:blur(16px);display:flex;flex-direction:column;gap:9px;animation:s7slideR 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s both;}
    @keyframes s7slideR{from{opacity:0;transform:translateY(-50%) translateX(30px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
    .s7-m-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(0,230,118,0.65);padding-bottom:7px;border-bottom:1px solid rgba(0,230,118,0.15);}
    .s7-m-row{display:flex;flex-direction:column;gap:3px;}
    .s7-m-label-row{display:flex;justify-content:space-between;align-items:center;}
    .s7-m-name{font-size:10.5px;color:rgba(200,230,210,0.75);}
    .s7-m-pct{font-family:'Syne',sans-serif;font-size:10.5px;font-weight:700;color:#f0f4f0;}
    .s7-m-track{height:4px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;}
    .s7-m-fill{height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1);}
    #s7-balance-status{font-family:'Syne',sans-serif;font-size:12px;font-weight:800;text-align:center;margin-top:3px;padding:7px;border-radius:9px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);transition:color 0.4s;}
    .s7-next-btn{width:100%;padding:9px;border-radius:11px;margin-top:2px;background:linear-gradient(135deg,rgba(0,230,118,0.18),rgba(66,165,245,0.1));border:1.5px solid rgba(0,230,118,0.45);color:#00e676;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;transition:all 0.3s;text-transform:uppercase;}
    .s7-next-btn:hover{background:linear-gradient(135deg,rgba(0,230,118,0.3),rgba(66,165,245,0.18));box-shadow:0 0 20px rgba(0,230,118,0.25);transform:scale(1.03);}

    /* ECOBOT — KANAN BAWAH (FIX #1) */
    #s7-bot{position:fixed;bottom:76px;right:14px;z-index:74;display:flex;align-items:flex-end;gap:10px;flex-direction:row-reverse;animation:s7fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.8s both;}
    @keyframes s7fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    #s7-bot-avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;border:2px solid rgba(0,230,118,0.5);background:radial-gradient(circle at 35% 35%,#1a3a2a,#050d18);display:flex;align-items:center;justify-content:center;font-size:22px;animation:s7botFloat 3s ease-in-out infinite;box-shadow:0 0 14px rgba(0,230,118,0.25);}
    @keyframes s7botFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    #s7-bot-bubble{background:rgba(3,10,20,0.96);border:1.5px solid rgba(0,230,118,0.25);border-radius:12px 12px 4px 12px;padding:9px 13px;max-width:195px;backdrop-filter:blur(14px);}
    #s7-bot-name{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;color:#00e676;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
    #s7-bot-text{font-size:11px;line-height:1.55;color:rgba(200,240,220,0.82);min-height:28px;}
    #s7-bot-cursor{display:inline-block;width:2px;height:10px;background:#00e676;margin-left:1px;vertical-align:middle;animation:s7blinkC 0.7s ease-in-out infinite;}
    @keyframes s7blinkC{0%,100%{opacity:1}50%{opacity:0}}

    /* CONFIRM MODAL */
    #s7-confirm-modal{display:none;position:fixed;inset:0;z-index:300;background:rgba(2,6,14,0.85);backdrop-filter:blur(14px);align-items:center;justify-content:center;}
    #s7-confirm-modal.open{display:flex;}
    #s7-conf-card{background:rgba(4,10,22,0.98);border:1.5px solid rgba(244,67,54,0.4);border-radius:22px;padding:32px 28px;max-width:300px;width:90%;text-align:center;animation:s7confIn 0.35s cubic-bezier(0.22,1,0.36,1);}
    @keyframes s7confIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
    #s7-conf-icon{font-size:44px;margin-bottom:10px;display:block;}
    #s7-conf-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#ff5252;margin-bottom:8px;}
    #s7-conf-sub{font-size:13px;color:rgba(200,200,200,0.7);margin-bottom:20px;line-height:1.5;}
    .s7-conf-btns{display:flex;gap:10px;justify-content:center;}
    .s7-conf-btn{flex:1;padding:11px;border-radius:12px;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;transition:all 0.2s;}
    #s7-conf-yes{background:rgba(244,67,54,0.15);border:1.5px solid rgba(244,67,54,0.4);color:#ff5252;}
    #s7-conf-yes:hover{background:rgba(244,67,54,0.3);}
    #s7-conf-no{background:rgba(0,230,118,0.1);border:1.5px solid rgba(0,230,118,0.35);color:#00e676;}
    #s7-conf-no:hover{background:rgba(0,230,118,0.22);}

    /* NARASI */
    #narasi{background:rgba(3,10,20,0.9)!important;border:1.5px solid rgba(0,230,118,0.2)!important;backdrop-filter:blur(16px)!important;border-radius:14px!important;font-size:12px!important;padding:9px 16px!important;max-width:360px!important;left:50%!important;transform:translateX(-50%)!important;top:auto!important;bottom:76px!important;box-shadow:0 8px 32px rgba(0,0,0,0.5)!important;}
    #interact-ui{display:none!important;}
    .nav-btn.primary{background:rgba(0,230,118,0.15)!important;border-color:rgba(0,230,118,0.5)!important;color:#00e676!important;}
    .nav-btn.primary:hover{background:rgba(0,230,118,0.28)!important;transform:scale(1.04);}
    .ar-corner{animation:s7cornerpulse 2.5s ease-in-out infinite!important;}
    @keyframes s7cornerpulse{0%,100%{opacity:0.4;border-color:rgba(0,230,118,0.4)}50%{opacity:1;border-color:#00e676;box-shadow:0 0 10px rgba(0,230,118,0.5)}}
    #scene-title{background:linear-gradient(135deg,#00e676,#42a5f5)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;background-clip:text!important;font-weight:800!important;}
    body:has(#s7-confirm-modal.open) #canvas-container{filter:brightness(0.5);transition:filter 0.3s;}

    /* ── AREA PENUH FULLSCREEN POPUP ── */
    #s7-areafull-popup{
      display:none;position:fixed;inset:0;z-index:400;
      background:rgba(2,5,12,0.88);backdrop-filter:blur(18px);
      align-items:center;justify-content:center;
    }
    #s7-areafull-popup.open{display:flex;}
    #s7-full-card{
      background:linear-gradient(145deg,rgba(5,14,28,0.98),rgba(8,20,12,0.98));
      border:2px solid rgba(255,202,40,0.45);border-radius:28px;
      padding:40px 36px 32px;max-width:400px;width:92%;text-align:center;
      box-shadow:0 0 60px rgba(255,202,40,0.12),0 30px 80px rgba(0,0,0,0.7);
      animation:s7fullCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
      position:relative;overflow:hidden;
    }
    #s7-full-card::before{
      content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(255,202,40,0.06),transparent);
      pointer-events:none;
    }
    @keyframes s7fullCardIn{
      from{opacity:0;transform:scale(0.8) translateY(30px);}
      to{opacity:1;transform:scale(1) translateY(0);}
    }
    @keyframes s7fullShake{
      0%,100%{transform:translateX(0);}
      15%{transform:translateX(-8px);}
      30%{transform:translateX(8px);}
      45%{transform:translateX(-5px);}
      60%{transform:translateX(5px);}
      75%{transform:translateX(-2px);}
    }
    #s7-full-icon{font-size:60px;display:block;margin-bottom:12px;animation:s7fullBounce 1s ease infinite;}
    @keyframes s7fullBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    #s7-full-title{
      font-family:'Syne',sans-serif;font-size:28px;font-weight:900;
      background:linear-gradient(135deg,#ffca28,#ff7043);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      margin-bottom:10px;letter-spacing:0.5px;
    }
    #s7-full-sub{
      font-size:14px;color:rgba(200,230,210,0.75);line-height:1.7;margin-bottom:22px;
    }
    #s7-full-tip{
      background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
      border-radius:14px;padding:14px 16px;text-align:left;margin-bottom:22px;
      display:flex;flex-direction:column;gap:9px;
    }
    .s7-ft-row{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:rgba(200,225,210,0.75);line-height:1.5;}
    .s7-ft-row b{color:#f0f4f0;}
    #s7-full-btns{display:flex;gap:10px;justify-content:center;margin-bottom:18px;}
    .s7-full-btn{flex:1;padding:12px 10px;border-radius:13px;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;transition:all 0.2s;letter-spacing:0.5px;}
    .s7-full-ok{background:rgba(0,230,118,0.15);border:1.5px solid rgba(0,230,118,0.5);color:#00e676;}
    .s7-full-ok:hover{background:rgba(0,230,118,0.28);transform:scale(1.04);}
    .s7-full-reset{background:rgba(244,67,54,0.1);border:1.5px solid rgba(244,67,54,0.4);color:#ff5252;}
    .s7-full-reset:hover{background:rgba(244,67,54,0.24);transform:scale(1.04);}
    #s7-full-bar-wrap{height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;}
    #s7-full-bar{height:100%;background:linear-gradient(90deg,#ffca28,#ff7043);border-radius:2px;
      animation:s7fullBarCount 5s linear forwards;}
    @keyframes s7fullBarCount{from{width:100%;}to{width:0%;}}
    #s7-areafull-popup.open~#canvas-container,
    body:has(#s7-areafull-popup.open) #canvas-container{filter:brightness(0.45);transition:filter 0.3s;}
  `;
  document.body.appendChild(style);

  // TOP BAR
  var topbar=document.createElement('div');topbar.id='s7-topbar';
  topbar.innerHTML=
    '<div class="s7-tb-item"><div class="s7-tb-icon">⚔️</div><div><div class="s7-tb-label">Scene</div><div class="s7-tb-val" style="color:#00e676">7 / 10</div></div></div>'+
    '<div class="s7-tb-sep"></div>'+
    '<div class="s7-tb-item"><div class="s7-tb-icon">⭐</div><div><div class="s7-tb-label">Total XP</div><div class="s7-tb-val" style="color:#ffca28" id="s7-xp-val">0</div></div></div>'+
    '<div class="s7-tb-sep"></div>'+
    '<div class="s7-tb-item"><div class="s7-tb-icon">🧩</div><div><div class="s7-tb-label">Komponen</div><div class="s7-tb-val" style="color:#42a5f5" id="s7-count-val">0</div></div></div>';
  document.body.appendChild(topbar);

  // CATALOG PANEL
  var panel=document.createElement('div');panel.id='s7-panel';
  var phtml='<div class="s7-p-title">🏗️ Tambah Komponen</div>';
  S7_ITEMS.forEach(function(it){
    phtml+='<div class="s7-item-btn" onclick="s7_addItem(\''+it.key+'\')" style="--s7c:'+it.color+';">'+
      '<div class="s7-item-icon" style="background:'+it.color+'18;">'+it.icon+'</div>'+
      '<div class="s7-item-info">'+
        '<div class="s7-item-name">'+it.label+'</div>'+
        '<div class="s7-item-xp" style="color:'+it.color+'">+'+it.xp+' XP</div>'+
      '</div></div>';
  });
  phtml+='<div class="s7-reset-btn" onclick="s7_confirmReset()">🗑️ Reset Desain</div>';
  panel.innerHTML=phtml;document.body.appendChild(panel);

  // METER PANEL
  var meter=document.createElement('div');meter.id='s7-meter';
  var mlist=[
    {id:'flora', label:'🌿 Flora',         color:'#2d9e50'},
    {id:'fauna', label:'🦌 Fauna',          color:'#ff7043'},
    {id:'energy',label:'⚡ Energi Bersih',  color:'#ffca28'},
    {id:'air',   label:'💧 Pengelolaan Air',color:'#29b6f6'},
    {id:'urban', label:'🏡 Kota Hijau',     color:'#558b2f'},
  ];
  var mhtml='<div class="s7-m-title">⚖️ Indikator Ekosistem</div>';
  mlist.forEach(function(m){
    mhtml+='<div class="s7-m-row"><div class="s7-m-label-row"><span class="s7-m-name">'+m.label+'</span><span class="s7-m-pct" id="s7m-'+m.id+'-val">0%</span></div>'+
      '<div class="s7-m-track"><div class="s7-m-fill" id="s7m-'+m.id+'-fill" style="width:0%;background:'+m.color+'"></div></div></div>';
  });
  mhtml+='<div id="s7-balance-status">🌱 Tambah komponen!</div>'+
    '<button class="s7-next-btn" onclick="s7_goNext()">Lanjut Evaluasi ›</button>';
  meter.innerHTML=mhtml;document.body.appendChild(meter);

  // ECOBOT — kanan bawah
  var bot=document.createElement('div');bot.id='s7-bot';
  bot.innerHTML=
    '<div id="s7-bot-avatar">🌱</div>'+
    '<div id="s7-bot-bubble">'+
      '<div id="s7-bot-name">🤖 EcoBot</div>'+
      '<div id="s7-bot-text"><span id="s7-typed2"></span><span id="s7-bot-cursor"></span></div>'+
    '</div>';
  document.body.appendChild(bot);

  // CONFIRM MODAL
  var modal=document.createElement('div');modal.id='s7-confirm-modal';
  modal.innerHTML='<div id="s7-conf-card">'+
    '<span id="s7-conf-icon">⚠️</span>'+
    '<div id="s7-conf-title">Reset Desain?</div>'+
    '<div id="s7-conf-sub">Semua komponen dihapus & XP direset. Yakin?</div>'+
    '<div class="s7-conf-btns">'+
      '<button class="s7-conf-btn" id="s7-conf-yes" onclick="s7_doReset()">Ya, Reset!</button>'+
      '<button class="s7-conf-btn" id="s7-conf-no" onclick="s7_closeConfirm()">Batal</button>'+
    '</div></div>';
  modal.addEventListener('click',function(e){if(e.target===modal)s7_closeConfirm();});
  document.body.appendChild(modal);

  // AREA PENUH POPUP — fullscreen
  var fullPop=document.createElement('div');
  fullPop.id='s7-areafull-popup';
  fullPop.innerHTML=
    '<div id="s7-full-card">'+
      '<div id="s7-full-icon">🏝️</div>'+
      '<div id="s7-full-title">Area Penuh!</div>'+
      '<div id="s7-full-sub">Tidak ada ruang tersisa untuk<br><span id="s7-full-itemname" style="color:#ffca28;font-weight:800"></span></div>'+
      '<div id="s7-full-tip">'+
        '<div class="s7-ft-row">💡 <span>Coba pilih jenis komponen <b>berbeda</b> yang masih ada slot tersedia</span></div>'+
        '<div class="s7-ft-row">🗑️ <span>Atau <b>Reset Desain</b> untuk mulai dari awal</span></div>'+
        '<div class="s7-ft-row">⚖️ <span>Cek Indikator Ekosistem — mungkin ada zona yang belum seimbang</span></div>'+
      '</div>'+
      '<div id="s7-full-btns">'+
        '<button class="s7-full-btn s7-full-ok" onclick="_s7_closeAreaFull()">✅ Mengerti!</button>'+
        '<button class="s7-full-btn s7-full-reset" onclick="_s7_closeAreaFull();s7_confirmReset()">🗑️ Reset Desain</button>'+
      '</div>'+
      '<div id="s7-full-bar-wrap"><div id="s7-full-bar"></div></div>'+
    '</div>';
  fullPop.addEventListener('click',function(e){if(e.target===fullPop)_s7_closeAreaFull();});
  document.body.appendChild(fullPop);

  _s7_ecoBot('Selamat datang di Mode Builder! 🏗️ Pilih komponen — setiap objek akan muncul di zona yang tepat. Tidak boleh saling tumpuk!');
  _s7_updateXpDisplay();
}

// ============================================================
// PUBLIC API
// ============================================================
window.s7_addItem=function(key){_s7_placeItem(key);};
window.s7_confirmReset=function(){document.getElementById('s7-confirm-modal').classList.add('open');};
window.s7_closeConfirm=function(){document.getElementById('s7-confirm-modal').classList.remove('open');};
window.s7_doReset=function(){
  s7_closeConfirm();
  s7_placedList.forEach(function(p){if(p.model&&p.model.parent)scene.remove(p.model);});
  s7_placedList=[];s7_slotIdx={};s7_occupiedPos=[];
  for(var k in S7_SLOTS)s7_slotIdx[k]=0;
  s7_totalXP=0;s7_baseXP=0;
  builtObjects={tree:0,water:0,solar:0,animal:0,bush:0,building:0};
  try{localStorage.removeItem('ar_s7_placed');localStorage.removeItem('ar_s7_xp');}catch(e){}
  _s7_updateBalance();_s7_updateXpDisplay();
  _s7_ecoBot('Desain direset. Mulai dari nol! 🌱');
};
window.s7_goNext=function(){
  _s7_saveToStorage();
  var flash=document.createElement('div');
  flash.style.cssText='position:fixed;inset:0;z-index:9999;background:#00e676;opacity:0;pointer-events:none;transition:opacity 0.25s ease;';
  document.body.appendChild(flash);
  requestAnimationFrame(function(){
    flash.style.opacity='0.5';
    setTimeout(function(){flash.style.opacity='0';setTimeout(function(){flash.remove();nextScene();},350);},220);
  });
};
function addBuildItem(type){s7_addItem(type);}
function updateBalance(){_s7_updateBalance();}

window.addEventListener('DOMContentLoaded',function(){startSceneApp(6);});
