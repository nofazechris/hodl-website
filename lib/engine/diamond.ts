// @ts-nocheck
/*
 * Diamond Hands — Three.js scene: faceted crystal hands catch the HODL token; scroll closes the grip;
 * grab the token and fling it out of frame before the hands catch it.
 * Ported from the vanilla build; public surface typed in ./types.ts.
 */
import * as THREE from 'three';
import type { DiamondHandle, DiamondOptions } from './types';

const T = THREE;
/* HODL — Diamond Hands (Three.js). Crystal hands catch the HODL token and never let go. */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeBack(t) { var c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

  /* ---------- textures ---------- */
  function hexLogo(ctx, cx, cy, s, col) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 0.17;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) { var a = (-90 + i * 60) * Math.PI / 180; if (i) ctx.lineTo(Math.cos(a), Math.sin(a)); else ctx.moveTo(Math.cos(a), Math.sin(a)); }
    ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 0.1; ctx.beginPath(); ctx.moveTo(-0.5, -0.22); ctx.lineTo(-0.5, 0.42); ctx.moveTo(0.5, -0.22); ctx.lineTo(0.5, 0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -0.66); ctx.bezierCurveTo(0.2, -0.46, 0.23, -0.12, 0.17, 0.24); ctx.lineTo(-0.17, 0.24); ctx.bezierCurveTo(-0.23, -0.12, -0.2, -0.46, 0, -0.66); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-0.17, 0.02); ctx.lineTo(-0.34, 0.26); ctx.lineTo(-0.34, 0.38); ctx.lineTo(-0.17, 0.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0.17, 0.02); ctx.lineTo(0.34, 0.26); ctx.lineTo(0.34, 0.38); ctx.lineTo(0.17, 0.28); ctx.fill();
    ctx.lineWidth = 0.055; ctx.beginPath(); ctx.moveTo(-0.09, 0.32); ctx.lineTo(-0.09, 0.56); ctx.moveTo(0, 0.32); ctx.lineTo(0, 0.62); ctx.moveTo(0.09, 0.32); ctx.lineTo(0.09, 0.56); ctx.stroke();
    ctx.restore();
  }
  function coinFace() {
    var c = document.createElement('canvas'); c.width = c.height = 512; var x = c.getContext('2d');
    var g = x.createRadialGradient(200, 180, 20, 256, 256, 260);
    g.addColorStop(0, '#ffe2a8'); g.addColorStop(0.45, '#ff9a3c'); g.addColorStop(1, '#a8360a');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(80,20,0,.55)'; x.lineWidth = 10; x.beginPath(); x.arc(256, 256, 226, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(255,240,210,.5)'; x.lineWidth = 3; x.beginPath(); x.arc(256, 256, 210, 0, Math.PI * 2); x.stroke();
    for (var i = 0; i < 60; i++) { var a = i / 60 * Math.PI * 2; x.beginPath(); x.moveTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); x.lineTo(256 + Math.cos(a) * 224, 256 + Math.sin(a) * 224); x.stroke(); }
    hexLogo(x, 256, 236, 120, '#3b1203');
    x.fillStyle = '#3b1203'; x.font = '900 46px Archivo, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('HODL', 256, 420);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function coinEdge() {
    var c = document.createElement('canvas'); c.width = 512; c.height = 32; var x = c.getContext('2d');
    x.fillStyle = '#c4571a'; x.fillRect(0, 0, 512, 32);
    x.fillStyle = '#ffb067'; for (var i = 0; i < 512; i += 8) x.fillRect(i, 0, 3, 32);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = T.RepeatWrapping; t.repeat.x = 4; return t;
  }
  function radial(col, inner) {
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, col); g.addColorStop(inner || 0.25, col.replace(/[\d.]+\)$/, '.35)')); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }
  function star() {
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 20); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(255,255,255,.95)';
    x.beginPath(); x.moveTo(64, 0); x.lineTo(68, 60); x.lineTo(128, 64); x.lineTo(68, 68); x.lineTo(64, 128); x.lineTo(60, 68); x.lineTo(0, 64); x.lineTo(60, 60); x.closePath(); x.fill();
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }

  /* ---------- studio environment so the facets have something to reflect ---------- */
  function studioEnv(renderer) {
    var es = new T.Scene();
    es.add(new T.Mesh(new T.BoxGeometry(20, 20, 20), new T.MeshBasicMaterial({ color: 0x07090c, side: T.BackSide })));
    function panel(col, w, h, x, y, z, ry, rx) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }));
      m.position.set(x, y, z); m.rotation.y = ry || 0; m.rotation.x = rx || 0; es.add(m);
    }
    panel(0xffffff, 6, 1.2, 0, 8, 0, 0, Math.PI / 2);
    panel(0xbff4ff, 3, 8, -9, 1, 0, Math.PI / 2);
    panel(0xff7a2a, 3, 7, 9, 0, -2, -Math.PI / 2);
    panel(0x2bff74, 10, 1, 0, -6, 3, 0, -Math.PI / 2);
    panel(0xffffff, 1.2, 6, 3, 2, 9, Math.PI);
    panel(0x9fd8ff, 2, 2, -4, 3, -9, 0);
    var pm = new T.PMREMGenerator(renderer);
    var tex = pm.fromScene(es, 0.03).texture; pm.dispose();
    return tex;
  }

  /* ---------- crystal hand ---------- */
  function Hand(mat, edge, mirror) {
    var root = new T.Group();
    var gems = [];
    function gem(geo) {
      var m = new T.Mesh(geo, mat);
      m.add(new T.LineSegments(new T.EdgesGeometry(geo, 1), edge));
      gems.push(m); return m;
    }
    // palm: a faceted heptagonal slab
    var palmGeo = new T.CylinderGeometry(0.5, 0.44, 0.17, 8, 1); palmGeo.scale(1, 1, 1.1);
    var palm = gem(palmGeo); root.add(palm);
    // heel of the palm
    var heel = gem(new T.CylinderGeometry(0.27, 0.33, 0.21, 6, 1)); heel.position.set(0, -0.02, -0.42); heel.scale.set(1.15, 1, 0.8); root.add(heel);
    // forearm reaching back out of frame
    var armGeo = new T.CylinderGeometry(0.2, 0.27, 2.4, 6, 1); armGeo.rotateX(Math.PI / 2); armGeo.translate(0, 0, -1.2);
    var arm = gem(armGeo); arm.position.set(0, -0.04, -0.62); root.add(arm);
    var cuff = gem(new T.CylinderGeometry(0.3, 0.3, 0.12, 8, 1)); cuff.rotation.x = Math.PI / 2; cuff.position.set(0, -0.04, -0.82); root.add(cuff);

    function seg(len, r0, r1) {
      var g = new T.CylinderGeometry(r1, r0, len, 6, 1); g.translate(0, len / 2, 0); g.rotateX(Math.PI / 2); return g;
    }
    var fingers = [];
    var defs = [
      { x: -0.32, l: [0.34, 0.25, 0.19], r: 0.07, sp: -0.16 },
      { x: -0.11, l: [0.42, 0.3, 0.23], r: 0.079, sp: -0.05 },
      { x: 0.1, l: [0.44, 0.31, 0.24], r: 0.081, sp: 0.04 },
      { x: 0.31, l: [0.4, 0.28, 0.22], r: 0.077, sp: 0.13 }
    ];
    defs.forEach(function (d) {
      var j1 = new T.Group(); j1.position.set(d.x, 0.02, 0.5); root.add(j1);
      var k = gem(new T.IcosahedronGeometry(d.r * 1.12, 0)); j1.add(k);
      j1.add(gem(seg(d.l[0], d.r, d.r * 0.92)));
      var j2 = new T.Group(); j2.position.z = d.l[0]; j1.add(j2);
      j2.add(gem(new T.IcosahedronGeometry(d.r * 0.95, 0)));
      j2.add(gem(seg(d.l[1], d.r * 0.92, d.r * 0.84)));
      var j3 = new T.Group(); j3.position.z = d.l[1]; j2.add(j3);
      j3.add(gem(new T.IcosahedronGeometry(d.r * 0.86, 0)));
      j3.add(gem(seg(d.l[2], d.r * 0.84, d.r * 0.62)));
      var tip = gem(new T.OctahedronGeometry(d.r * 0.7, 0)); tip.position.z = d.l[2]; tip.scale.z = 1.5; j3.add(tip);
      fingers.push({ j: [j1, j2, j3], sp: d.sp });
    });
    // thumb on the outer side
    var t1 = new T.Group(); t1.position.set(0.45, 0.0, -0.06); root.add(t1);
    t1.add(gem(new T.IcosahedronGeometry(0.1, 0)));
    t1.add(gem(seg(0.32, 0.1, 0.09)));
    var t2 = new T.Group(); t2.position.z = 0.32; t1.add(t2);
    t2.add(gem(new T.IcosahedronGeometry(0.085, 0)));
    t2.add(gem(seg(0.26, 0.09, 0.065)));
    var ttip = gem(new T.OctahedronGeometry(0.06, 0)); ttip.position.z = 0.26; ttip.scale.z = 1.5; t2.add(ttip);

    if (mirror) root.scale.x = -1;
    this.root = root; this.fingers = fingers; this.t1 = t1; this.t2 = t2; this.gems = gems; this.mirror = mirror;
  }
  Hand.prototype.pose = function (c, t, shake, h) {
    // c: 0 open → 1 closed (→ ~1.15 clenched). Every joint moves on all three axes.
    var cc = Math.max(0, c), open = 1 - Math.min(1, cc);
    h = h || 0;
    this.fingers.forEach(function (f, i) {
      // pinky closes first, index last: a rolling grip instead of a robot clamp
      var ci = cc > 1 ? cc : clamp(cc * 1.35 - (3 - i) * 0.0 - i * 0.1, 0, 1);
      var wave = Math.sin(t * 2.1 - i * 0.75 + h);
      var drift = Math.sin(t * 0.83 + i * 1.9 + h * 1.3);
      var tw = Math.sin(t * 1.17 + i * 2.6 + h * 0.7);
      var jit = shake ? Math.sin(t * 55 + i * 3) * 0.05 : 0;
      var o = 1 - ci;
      // knuckle: curl, spread, twist
      f.j[0].rotation.x = -ci * 1.3 + o * (0.16 * wave - 0.04) + jit;
      f.j[0].rotation.y = f.sp * o + drift * 0.13 * o + (ci > 0.9 ? Math.sin(t * 1.4 + i) * 0.02 : 0);
      f.j[0].rotation.z = tw * 0.22 * o + jit * 0.6;
      // middle joint
      f.j[1].rotation.x = -ci * 1.5 - o * (0.22 * Math.max(0, wave) + 0.04);
      f.j[1].rotation.y = drift * 0.08 * o;
      f.j[1].rotation.z = -tw * 0.12 * o;
      // tip joint
      f.j[2].rotation.x = -ci * 1.08 - o * (0.18 * Math.max(0, Math.sin(t * 2.1 - i * 0.75 - 0.6 + h)) + 0.03);
      f.j[2].rotation.y = -drift * 0.06 * o;
      f.j[2].rotation.z = tw * 0.1 * o;
    });
    var tc = cc > 1 ? 1 : clamp(cc * 1.2 - 0.15, 0, 1);
    this.t1.rotation.y = lerp(0.85, -0.6, tc) + Math.sin(t * 0.9 + h) * 0.12 * open;
    this.t1.rotation.x = -tc * 0.55 + Math.sin(t * 1.3 + h) * 0.08 * open;
    this.t1.rotation.z = Math.sin(t * 0.7 + h) * 0.25 * open + tc * 0.3;
    this.t2.rotation.x = -tc * 0.75 - Math.max(0, Math.sin(t * 1.6 + h)) * 0.2 * open;
    this.t2.rotation.z = Math.sin(t * 1.1 + h) * 0.12 * open;
  };

  /* ---------- scene ---------- */
  function Diamond(sec, opts) {
    this.sec = sec; this.opts = opts || {};
    var q = function (s) { return sec.querySelector(s); };
    this.stage = q('[data-k="dhstage"]'); this.track = q('[data-k="dhtrack"]') || sec;
    this.grip = q('[data-k="dhgrip"]'); this.hint = q('[data-k="dhhint"]'); this.msg = q('[data-k="dhmsg"]'); this.count = q('[data-k="dhcount"]'); this.stealsEl = q('[data-k="dhsteals"]');
    this.p = 0; this.close = 0; this.clench = 0; this.tug = { x: 0, y: 0 }; this.tugT = { x: 0, y: 0 }; this.blocked = 0;
    this.visible = false; this.dead = false;
    try { this.build(); } catch (e) { console.error(e); sec.classList.add('no-gl'); return; }
    this.bind();
    var self = this;
    this.last = performance.now();
    var loop = function () { if (self.dead) return; self.raf = requestAnimationFrame(loop); if (self.visible) self.frame(); };
    loop();
  }
  Diamond.prototype.build = function () {
    var stage = this.stage;
    var r = this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.opts.lite ? 1.25 : 1.75));
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    r.setClearColor(0x000000, 0);
    stage.appendChild(r.domElement);
    var sc = this.scene = new T.Scene();
    sc.environment = studioEnv(r);
    var cam = this.cam = new T.PerspectiveCamera(30, 1, 0.1, 60);
    cam.position.set(0, 3.6, 6.4); cam.lookAt(0, 0.05, 0.5);

    var lite = this.opts.lite;
    var mat = this.mat = new T.MeshPhysicalMaterial(true ? {
      color: 0x6fc4ee, metalness: 0.35, roughness: 0.0, envMapIntensity: 3.2, clearcoat: 1, clearcoatRoughness: 0,
      iridescence: 1, iridescenceIOR: 2.0, iridescenceThicknessRange: [220, 720], emissive: 0x041822, flatShading: true,
      transparent: true, opacity: 0.58, depthWrite: false, side: T.DoubleSide
    } : {
      color: 0xc8f1ff, metalness: 0, roughness: 0.0, transmission: 1, thickness: 0.6, ior: 2.4, attenuationColor: new T.Color(0x6fc8ff), attenuationDistance: 1.6,
      envMapIntensity: 2.6, clearcoat: 1, clearcoatRoughness: 0, iridescence: 0.7, iridescenceIOR: 1.9, iridescenceThicknessRange: [200, 700],
      specularIntensity: 1, specularColor: new T.Color(0xffffff), emissive: 0x041820, flatShading: true, side: T.DoubleSide
    });
    var edge = this.edge = new T.LineBasicMaterial({ color: 0xeafcff, transparent: true, opacity: 0.5 });

    var rig = this.rig = new T.Group(); sc.add(rig);
    rig.rotation.x = -0.12; rig.position.y = -0.05; rig.scale.setScalar(1.22);
    this.R = new Hand(mat, edge, false); this.L = new Hand(mat, edge, true);
    rig.add(this.R.root); rig.add(this.L.root);

    // the token
    var face = coinFace(), side = coinEdge();
    var cm = new T.MeshStandardMaterial({ map: face, metalness: 0.75, roughness: 0.28, emissive: 0xff6a1f, emissiveIntensity: 0.25, emissiveMap: face, envMapIntensity: 1.6 });
    var sm = new T.MeshStandardMaterial({ map: side, metalness: 0.8, roughness: 0.3, envMapIntensity: 1.6 });
    var coin = this.coin = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.09, 64), [sm, cm, cm]);
    rig.add(coin);
    var halo = this.halo = new T.Sprite(new T.SpriteMaterial({ map: radial('rgba(255,122,42,1)', 0.18), blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.set(2.6, 2.6, 1); rig.add(halo);
    var halo2 = this.halo2 = new T.Sprite(new T.SpriteMaterial({ map: radial('rgba(43,255,116,1)', 0.12), blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.0 }));
    halo2.scale.set(5, 5, 1); halo2.position.set(0, 0.2, -1); sc.add(halo2);

    // lights
    sc.add(new T.AmbientLight(0x22384a, 1.4));
    var key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(3, 5, 4); sc.add(key);
    var rim = new T.DirectionalLight(0x7fe0ff, 3.2); rim.position.set(-4, 2, -3); sc.add(rim);
    var under = this.under = new T.PointLight(0x2bff74, 18, 9, 1.4); under.position.set(0, -1.6, 1.6); sc.add(under);
    var cl = this.coinLight = new T.PointLight(0xff7a2a, 0, 5, 1.5); rig.add(cl);
    var glint = this.glint = new T.PointLight(0xffffff, 26, 7, 1.6); sc.add(glint);

    // sparkles riding on the fingertips and knuckles
    var stex = star(); this.sparks = [];
    var hosts = [];
    [this.R, this.L].forEach(function (h) { h.fingers.forEach(function (f) { hosts.push(f.j[2]); hosts.push(f.j[0]); }); hosts.push(h.t2); });
    for (var i = 0; i < hosts.length; i++) {
      var s = new T.Sprite(new T.SpriteMaterial({ map: stex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, color: i % 3 ? 0xffffff : 0xbff4ff }));
      s.position.set(Math.random() * 0.1 - 0.05, 0.1, Math.random() * 0.25); s.scale.set(0.001, 0.001, 1);
      hosts[i].add(s); this.sparks.push({ s: s, ph: Math.random() * 10, sp: 0.6 + Math.random() * 1.6 });
    }
    // drifting diamond dust
    var n = this.opts.lite ? 70 : 160, pos = new Float32Array(n * 3);
    for (var k = 0; k < n; k++) { pos[k * 3] = (Math.random() - 0.5) * 9; pos[k * 3 + 1] = (Math.random() - 0.3) * 5; pos[k * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5; }
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(pos, 3));
    this.dust = new T.Points(dg, new T.PointsMaterial({ size: 0.06, map: stex, color: 0xbff4ff, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false }));
    sc.add(this.dust);
    this.resize();
  };
  Diamond.prototype.resize = function () {
    var w = this.stage.clientWidth, h = this.stage.clientHeight;
    if (!w || !h) return;
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%';
    this.cam.aspect = w / h;
    // keep both hands in frame on tall phones
    var a = w / h, k = a < 1 ? 1 + (1 - a) * 2.1 : 1;
    this.cam.position.set(0, 3.3 * k, 6.2 * k); this.cam.lookAt(0, 0.15, 0.35);
    this.cam.updateProjectionMatrix();
  };
  Diamond.prototype.bind = function () {
    var self = this, st = this.stage;
    this._rs = function () { self.resize(); }; window.addEventListener('resize', this._rs);
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; self.last = performance.now(); }, { threshold: 0 });
      this.io.observe(this.sec);
    } else this.visible = true;
    var orb = false, ox = 0, oy = 0;
    this.ray = new T.Raycaster(); this.ndc = new T.Vector2(); this.plane = new T.Plane(); this.tmpV = new T.Vector3(); this.tmpN = new T.Vector3();
    var hit = this.hit = document.createElement('div'); hit.className = 'dh-coinhit'; hit.setAttribute('aria-hidden', 'true');
    st.appendChild(hit);
    hit.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (!self.dropDone || self.st) return;
      self.px = e.clientX; self.py = e.clientY;
      self.st = { t: 0, held: true, phase: 'pull', tt: 0, off: self.pointerLocal(e.clientX, e.clientY, true), vel: new T.Vector3(), prev: null, hv: new T.Vector3() };
      st.classList.add('is-grab'); self.sec.classList.add('is-game');
      if (self.hint) self.hint.textContent = 'GO — drag it out of frame!';
      try { hit.setPointerCapture(e.pointerId); } catch (er) {}
    });
    st.addEventListener('pointerdown', function (e) {
      self.px = e.clientX; self.py = e.clientY;
      if (e.pointerType !== 'mouse') return;
      orb = true; self.orbiting = true; ox = e.clientX; oy = e.clientY; st.classList.add('is-grab');
    });
    window.addEventListener('pointermove', this._pm = function (e) {
      var r = st.getBoundingClientRect();
      self.mx = (e.clientX / (window.innerWidth || 1) - 0.5);
      self.my = (e.clientY / (window.innerHeight || 1) - 0.5);
      self.px = e.clientX; self.py = e.clientY;
      if (orb) {
        var ddx = e.clientX - ox, ddy = e.clientY - oy; ox = e.clientX; oy = e.clientY;
        var o2 = self.orbit || (self.orbit = { x: 0, y: 0, vx: 0, vy: 0 });
        o2.vy = ddx * 0.008; o2.vx = ddy * 0.006; o2.y += o2.vy; o2.x += o2.vx;
      }
      self.hover = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;

    });
    var up = function () {
      if (orb) { orb = false; self.orbiting = false; st.classList.remove('is-grab'); }
      if (self.st) { self.st.held = false; st.classList.remove('is-grab'); }
      if (self.hit) try { self.hit.releasePointerCapture && 0; } catch (er) {}
    };
    window.addEventListener('pointerup', this._pu = up);
    window.addEventListener('pointercancel', this._pc = up);
  };
  Diamond.prototype.coinScreen = function () {
    var r = this.stage.getBoundingClientRect(), c = this.coin;
    var w = new T.Vector3().setFromMatrixPosition(c.matrixWorld), e = w.clone();
    e.add(new T.Vector3(1, 0, 0).applyQuaternion(this.cam.quaternion).multiplyScalar(0.6 * this.rig.scale.x));
    w.project(this.cam); e.project(this.cam);
    return { x: (w.x + 1) / 2 * r.width, y: (1 - w.y) / 2 * r.height, r: Math.abs((e.x - w.x) / 2 * r.width), W: r.width, H: r.height };
  };
  Diamond.prototype.outOfFrame = function () {
    var p = this.coinScreen(), m = Math.min(p.W, p.H) * 0.03;
    return p.x < m || p.x > p.W - m || p.y < m || p.y > p.H - m;
  };
  Diamond.prototype.placeHit = function (S) {
    var h = this.hit; if (!h) return;
    var on = this.dropDone && !S;
    if (on !== this._hitOn) { this._hitOn = on; h.style.display = on ? 'block' : 'none'; }
    if (!on) return;
    var p = this.coinScreen(), d = Math.max(64, p.r * 2.6);
    h.style.transform = 'translate3d(' + (p.x - d / 2).toFixed(1) + 'px,' + (p.y - d / 2).toFixed(1) + 'px,0)';
    h.style.width = h.style.height = d.toFixed(0) + 'px';
  };
  Diamond.prototype.flash = function (txt, win) {
    var m = this.msg; if (!m) return;
    m.textContent = txt; m.classList.toggle('is-win', !!win);
    m.classList.remove('is-on'); void m.offsetWidth; m.classList.add('is-on');
  };
  Diamond.prototype.endGame = function () {
    this.st = null; this.sec.classList.remove('is-game');
    if (this.hint) this.hint.textContent = this.opts.touch ? 'Tap & fling the token out of frame' : 'Grab the token — fling it out of frame';
  };
  Diamond.prototype.onCoin = function (x, y) {
    var r = this.stage.getBoundingClientRect(), c = this.coin;
    var w = this.tmpV.setFromMatrixPosition(c.matrixWorld).clone(), e = w.clone();
    var right = this.tmpN.set(1, 0, 0).applyQuaternion(this.cam.quaternion).multiplyScalar(0.6 * this.rig.scale.x);
    e.add(right); w.project(this.cam); e.project(this.cam);
    var cx = r.left + (w.x + 1) / 2 * r.width, cy = r.top + (1 - w.y) / 2 * r.height;
    var rad = Math.abs((e.x - w.x) / 2 * r.width);
    var dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy < (rad * 2.1) * (rad * 2.1);
  };
  // pointer → a point in rig space on a plane through the token's rest spot, facing the camera
  Diamond.prototype.pointerLocal = function (x, y, free) {
    var r = this.stage.getBoundingClientRect();
    this.ndc.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.cam);
    var rest = this.rig.localToWorld(new T.Vector3(0, 0.3, 0.05));
    this.cam.getWorldDirection(this.tmpN);
    this.plane.setFromNormalAndCoplanarPoint(this.tmpN, rest);
    var hit = new T.Vector3();
    if (!this.ray.ray.intersectPlane(this.plane, hit)) return new T.Vector3();
    this.rig.worldToLocal(hit);
    hit.sub(new T.Vector3(0, 0.3, 0.05));
    var MAX = free ? 6 : 1.25; if (hit.length() > MAX) hit.setLength(MAX);
    return hit;
  };
  Diamond.prototype.frame = function () {
    if (this.stage.clientWidth !== this.w || this.stage.clientHeight !== this.h) this.resize();
    var t0 = performance.now(), dt = Math.min(0.05, (t0 - this.last) / 1000); this.last = t0;
    var t = t0 / 1000;
    // scroll progress through the pinned track
    var r = this.track.getBoundingClientRect(), vh = window.innerHeight || 1;
    var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    this.p += (p - this.p) * Math.min(1, dt * 8);
    var drop = smooth(0.04, 0.36, this.p);
    var closeT = smooth(0.34, 0.54, this.p);
    this.close += (closeT - this.close) * Math.min(1, dt * 7);
    var cl = this.close;
    this.dropDone = drop > 0.97;
    // ---- the game: drag the token out of frame before the diamond hands catch it ----
    var S = this.st, cxT = cl, shake = 0, grabbing = false;
    if (!this.coinOff) { this.coinOff = new T.Vector3(); this.handOff = new T.Vector3(); this.tmpD = new T.Vector3(); }
    if (S) {
      S.t += dt; grabbing = true;
      if (S.phase === 'pull') {
        if (S.held) S.off.copy(this.pointerLocal(this.px, this.py, true));
        var prevC = this.coinOff.clone();
        if (S.held) this.coinOff.copy(S.off);
        else { this.coinOff.addScaledVector(S.vel, dt); S.vel.multiplyScalar(Math.pow(0.02, dt)); }
        if (S.held && dt > 0) S.vel.copy(this.coinOff).sub(prevC).divideScalar(dt);
        // hands react almost instantly and chase hard
        var react = 0.07;
        cxT = S.t < react ? 0.4 : 0.02;
        if (S.t > react) {
          var d = this.tmpD.copy(this.coinOff).sub(this.handOff), dist = d.length();
          var speed = 8.5 * Math.min(1, 0.35 + dist * 1.6);
          var want = dist > 0.0001 ? d.multiplyScalar(speed / dist) : d.set(0, 0, 0);
          S.hv.lerp(want, Math.min(1, dt * 16));
          this.handOff.addScaledVector(S.hv, dt);
          if (this.handOff.length() > 3.4) this.handOff.setLength(3.4);
          if (this.handOff.distanceTo(this.coinOff) < 0.34) {
            S.phase = 'caught'; S.tt = 0; this.blocked++;
            if (this.count) this.count.textContent = String(this.blocked);
            this.flash('NICE TRY.', false);
            if (this.hint) this.hint.textContent = 'Caught. Diamond hands never let go.';
            if (this.opts.onBlock) this.opts.onBlock();
          }
        }
        // out of frame = stolen
        if (S.phase === 'pull' && this.outOfFrame()) {
          S.phase = 'stolen'; S.tt = 0; this.steals = (this.steals || 0) + 1;
          if (this.stealsEl) this.stealsEl.textContent = String(this.steals);
          if (S.vel.length() < 2) S.vel.copy(this.coinOff).setLength(4);
          this.flash('STOLEN?!', true);
          if (this.hint) this.hint.textContent = 'You got it out… for now.';
          if (this.opts.onSteal) this.opts.onSteal();
        }
      } else if (S.phase === 'caught') {
        S.tt += dt;
        cxT = S.tt < 0.9 ? 1.16 : cl;
        shake = S.tt < 0.4 ? 1 : 0;
        if (S.tt > 0.15) this.handOff.lerp(new T.Vector3(), Math.min(1, dt * 7));
        this.coinOff.lerp(this.handOff, Math.min(1, dt * 30));
        if (S.tt > 0.9 && this.handOff.length() < 0.03 && !S.held) this.endGame();
      } else if (S.phase === 'stolen') {
        S.tt += dt;
        this.coinOff.addScaledVector(S.vel, dt);
        cxT = 0.0; shake = S.tt < 0.3 ? 1 : 0;
        this.handOff.lerp(new T.Vector3(), Math.min(1, dt * 3));
        if (S.tt > 1.1) { S.phase = 'return'; S.tt = 0; this.coinOff.set(0, 4.2, 0); this.handOff.set(0, 0, 0);
          if (this.hint) this.hint.textContent = 'It always comes back.'; }
      } else if (S.phase === 'return') {
        S.tt += dt;
        var k = smooth(0, 0.7, S.tt);
        this.coinOff.set(0, lerp(4.2, 0, k), 0);
        cxT = S.tt < 0.65 ? 0.05 : Math.max(cl, 1.08);
        if (S.tt > 0.7 && S.tt < 0.95) shake = 1;
        if (S.tt > 1.4 && !S.held) this.endGame();
      }
    } else { this.coinOff.lerp(new T.Vector3(), Math.min(1, dt * 10)); this.handOff.lerp(new T.Vector3(), Math.min(1, dt * 8)); }
    this.cx = (this.cx || 0) + (cxT - (this.cx || 0)) * Math.min(1, dt * (S ? 26 : 10));
    this.R.pose(this.cx, t, shake, 0); this.L.pose(this.cx, t, shake, 2.3);
    // hands roll inward and come together as they close
    var roll = cl * 0.95, gap = lerp(0.6, 0.47, cl);
    var sh = grabbing ? Math.sin(t * 70) * 0.012 : 0;
    var ho = this.handOff;
    var gap2 = gap - (S && S.phase === 'caught' ? 0.08 : 0);
    this.R.root.position.set(gap2 + sh + ho.x, lerp(0, 0.1, cl) + ho.y, ho.z); this.R.root.rotation.z = roll;
    this.L.root.position.set(-gap2 - sh + ho.x, lerp(0, 0.1, cl) + ho.y, ho.z); this.L.root.rotation.z = -roll;
    var op = 1 - cl * 0.7;
    this.R.root.rotation.y = -0.12 * (1 - cl) + Math.sin(t * 0.55) * 0.1 * op;
    this.L.root.rotation.y = 0.12 * (1 - cl) + Math.sin(t * 0.55 + 2) * 0.1 * op;
    this.R.root.rotation.x = Math.sin(t * 0.7) * 0.09 * op - ho.y * 0.5;
    this.L.root.rotation.x = Math.sin(t * 0.7 + 1.6) * 0.09 * op - ho.y * 0.5;
    this.R.root.rotation.z += Math.sin(t * 0.62 + 0.5) * 0.07 * op;
    this.L.root.rotation.z -= Math.sin(t * 0.62 + 2.1) * 0.07 * op;
    // idle float of the whole rig
    this.rig.position.y = -0.25 + Math.sin(t * 1.1) * 0.05;
    // orbit: drag to spin in 3D (with inertia), otherwise lean toward the pointer
    var ob = this.orbit || (this.orbit = { x: 0, y: 0, vx: 0, vy: 0 });
    if (!this.orbiting) {
      ob.y += ob.vy; ob.x += ob.vx; ob.vy *= 0.92; ob.vx *= 0.92;
      if (Math.abs(ob.vy) < 0.0005) ob.y += (0 - ob.y) * Math.min(1, dt * 0.8);
      if (Math.abs(ob.vx) < 0.0005) ob.x += (0 - ob.x) * Math.min(1, dt * 1.2);
    }
    ob.x = clamp(ob.x, -0.6, 0.55);
    var ly = (this.my || 0), lx = (this.mx || 0);
    this.rig.rotation.y = Math.sin(t * 0.4) * 0.12 + lx * 0.32 + ob.y;
    this.rig.rotation.x = -0.12 + ly * 0.3 + ob.x;
    this.rig.rotation.z = Math.sin(t * 0.33) * 0.04 - lx * 0.08;
    // token: falls spinning, lands, gets wrapped
    var restY = 0.3, fallY = 4.6;
    var y = lerp(fallY, restY, drop);
    if (drop > 0.98 && drop < 1) y += Math.sin((drop - 0.98) * 50 * Math.PI) * 0.02;
    var c = this.coin;
    var co = this.coinOff, jig = 0;
    c.position.set(co.x + jig, y + co.y, 0.05 + co.z);
    var spin = (1 - drop) * t * 7 + (1 - drop) * 3;
    c.rotation.set(lerp(Math.PI / 2, 0, smooth(0.6, 1, drop)), spin + Math.sin(t * 0.8) * 0.15 * drop + (S && (S.phase === 'stolen' || S.phase === 'return') ? t * 14 : 0), co.x * -0.5);
    this.halo.position.copy(c.position); this.halo.position.z += 0.1;
    var glow = 0.35 + cl * 0.65 + (grabbing ? 0.4 : 0);
    this.halo.material.opacity = glow * (0.55 + Math.sin(t * 3) * 0.08);
    this.halo.scale.setScalar(2.2 + cl * 1.2);
    this.coinLight.position.copy(c.position); this.coinLight.position.y += 0.2;
    this.coinLight.intensity = cl * 22 + (grabbing ? 10 : 0);
    this.halo2.material.opacity = cl * 0.35;
    // crystal glows warmer once it holds the token
    this.mat.emissive.setRGB(lerp(0.04, 0.18, cl), lerp(0.22, 0.12, cl), lerp(0.29, 0.06, cl));
    this.edge.opacity = 0.45 + cl * 0.25 + (grabbing ? 0.2 : 0);
    // moving glint makes the facets flash
    this.glint.position.set(Math.cos(t * 1.6) * 3, 1.6 + Math.sin(t * 2.3) * 1.2, 2.2 + Math.sin(t * 1.6) * 1.2);
    for (var i = 0; i < this.sparks.length; i++) {
      var s = this.sparks[i], v = Math.max(0, Math.sin(t * s.sp + s.ph)); v = Math.pow(v, 12) * (0.35 + cl * 0.9);
      s.s.scale.set(v * 0.5, v * 0.5, 1); s.s.material.rotation = t * 0.5 + s.ph;
    }
    this.dust.rotation.y = t * 0.03; this.dust.position.y = Math.sin(t * 0.3) * 0.1;
    this.placeHit(S);
    // HUD
    var gp = Math.round(cl * 100 + (grabbing ? 10 + Math.random() * 4 : 0));
    if (this.grip && gp !== this._gp) { this._gp = gp; this.grip.textContent = gp + '%'; }
    var closed = cl > 0.92;
    if (closed !== this._closed) {
      this._closed = closed; this.sec.classList.toggle('is-closed', closed);
      if (this.hint && !this.st) this.hint.textContent = closed ? (this.opts.touch ? 'Tap & fling the token out of frame' : 'Grab the token — fling it out of frame') : (this.opts.touch ? 'Scroll to drop it in' : 'Drag to spin · scroll to drop it in');
    }
    this.renderer.render(this.scene, this.cam);
  };
  Diamond.prototype.pointer = function (mx) { this.mx = mx; };
  Diamond.prototype.destroy = function () {
    this.dead = true; cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._rs); window.removeEventListener('pointermove', this._pm);
    window.removeEventListener('pointerup', this._pu); window.removeEventListener('pointercancel', this._pc);
    if (this.io) this.io.disconnect();
    try { this.renderer.dispose(); } catch (e) {}
    if (this.renderer && this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    if (this.hit && this.hit.parentNode) this.hit.parentNode.removeChild(this.hit);
  };


/** Mount the diamond-hands scene into its section. Returns null when WebGL is unavailable. */
export function initDiamond(sec: HTMLElement, opts: DiamondOptions): DiamondHandle | null {
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) { sec.classList.add('no-gl'); return null; }
  } catch (e) { sec.classList.add('no-gl'); return null; }
  return new (Diamond as any)(sec, opts) as DiamondHandle;
}
