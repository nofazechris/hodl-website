// @ts-nocheck
/*
 * HODL interactive engine — hero scene (rigged soldier, rolling vault, candle volleys),
 * vault scroll story, fee simulator, reinvest mock, lookbook drag, oath, dossier, finale, rank HUD.
 *
 * This module is a direct port of the original vanilla engine. It is type-checked at its
 * boundary (see ./types.ts and initEngine below); the internals are imperative DOM/SVG/canvas
 * code and are excluded from strict checking with @ts-nocheck.
 */
import type { EngineHandle } from './types';

const Engine = (function () {

  var NS = 'http://www.w3.org/2000/svg';
  var OR = '#ff6a1f', OR2 = '#ff8a3d', GR = '#2bff74';
  var TAU = Math.PI * 2, D2R = Math.PI / 180;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeBack(t) { var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function now() { return performance.now(); }
  function q(root, sel) { return root.querySelector(sel); }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgRoot(mount, cls) {
    var s = sv('svg', { 'aria-hidden': 'true', focusable: 'false', 'class': cls || '' });
    mount.appendChild(s);
    return s;
  }
  function fitCanvas(c, w, h, dprCap) {
    var dpr = Math.min(window.devicePixelRatio || 1, dprCap || 2);
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    c.style.width = w + 'px'; c.style.height = h + 'px';
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }
  function store(k, v) {
    try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function sstore(k, v) {
    try { if (v === undefined) return window.sessionStorage.getItem(k); window.sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ───────────────────────── Sound (off by default) ───────────────────────── */
  function Sfx() {
    this.on = false; this.ctx = null;
  }
  Sfx.prototype.ensure = function () {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { this.ctx = new AC(); } catch (e) { return null; }
      this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  };
  Sfx.prototype.noise = function (dur, type) {
    var ctx = this.ctx, len = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    var s = ctx.createBufferSource(); s.buffer = b; return s;
  };
  Sfx.prototype.env = function (node, t0, a, peak, dec) {
    var g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec);
    node.connect(g); g.connect(this.master); return g;
  };
  Sfx.prototype.shot = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    var n = this.noise(0.22), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5200, t); f.frequency.exponentialRampToValueAtTime(380, t + 0.18);
    n.connect(f); this.env(f, t, 0.002, 0.7, 0.2); n.start(t); n.stop(t + 0.24);
    var o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    this.env(o, t, 0.002, 0.6, 0.14); o.start(t); o.stop(t + 0.18);
  };
  Sfx.prototype.clunk = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    var o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.3);
    this.env(o, t, 0.004, 0.9, 0.35); o.start(t); o.stop(t + 0.4);
    var n = this.noise(0.3), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2;
    n.connect(f); this.env(f, t, 0.002, 0.5, 0.25); n.start(t); n.stop(t + 0.3);
    var p = c.createOscillator(); p.type = 'sine'; p.frequency.value = 2100; this.env(p, t + 0.02, 0.002, 0.08, 0.5); p.start(t); p.stop(t + 0.6);
  };
  Sfx.prototype.whir = function (dur) {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    var n = this.noise(dur), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(700, t + dur);
    n.connect(f); this.env(f, t, 0.08, 0.25, dur - 0.08); n.start(t); n.stop(t + dur);
  };
  Sfx.prototype.stamp = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    var n = this.noise(0.1), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
    n.connect(f); this.env(f, t, 0.001, 0.8, 0.09); n.start(t); n.stop(t + 0.12);
    var o = c.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    this.env(o, t, 0.002, 0.6, 0.12); o.start(t); o.stop(t + 0.15);
  };
  Sfx.prototype.chime = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    [660, 990, 1320].forEach(function (fr, i) { var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr; this.env(o, t + i * 0.09, 0.01, 0.18, 0.5); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.6); }, this);
  };
  Sfx.prototype.thunder = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime + 0.25;
    var n = this.noise(2.2, 'brown'), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
    n.connect(f); this.env(f, t, 0.15, 0.9, 1.9); n.start(t); n.stop(t + 2.2);
  };
  Sfx.prototype.tick = function () {
    if (!this.on || !this.ensure()) return; var c = this.ctx, t = c.currentTime;
    var o = c.createOscillator(); o.type = 'square'; o.frequency.value = 1800; this.env(o, t, 0.001, 0.05, 0.03); o.start(t); o.stop(t + 0.05);
  };

  /* ───────────────────────── Shared SVG defs ───────────────────────── */
  function buildDefs() {
    if (document.getElementById('hodl-defs')) return;
    var s = sv('svg', { id: 'hodl-defs', width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute;width:0;height:0;overflow:hidden' });
    s.innerHTML = '' +
      '<defs>' +
      '<linearGradient id="hg-armor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2d33"/><stop offset=".55" stop-color="#16171b"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>' +
      '<linearGradient id="hg-plate" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#3a3d44"/><stop offset=".5" stop-color="#1d1f24"/><stop offset="1" stop-color="#121316"/></linearGradient>' +
      '<linearGradient id="hg-plate-r" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a30"/><stop offset=".35" stop-color="#22232a"/><stop offset="1" stop-color="#101114"/></linearGradient>' +
      '<linearGradient id="hg-visor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1d24"/><stop offset=".45" stop-color="#050608"/><stop offset=".7" stop-color="#2a1608"/><stop offset="1" stop-color="#050506"/></linearGradient>' +
      '<linearGradient id="hg-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4c52"/><stop offset=".4" stop-color="#25272c"/><stop offset="1" stop-color="#0f1013"/></linearGradient>' +
      '<radialGradient id="hg-door" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#3e4046"/><stop offset=".6" stop-color="#1e2024"/><stop offset="1" stop-color="#0c0d0f"/></radialGradient>' +
      '<radialGradient id="hg-doorin" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#26282d"/><stop offset=".8" stop-color="#131417"/><stop offset="1" stop-color="#0a0a0c"/></radialGradient>' +
      '<radialGradient id="hg-vaultglow" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#fff1c2"/><stop offset=".25" stop-color="#ffb347"/><stop offset=".6" stop-color="#c2410c"/><stop offset="1" stop-color="#1a0b04"/></radialGradient>' +
      '<radialGradient id="hg-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff7a2a" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hg-poolw" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2b8" stop-opacity=".6"/><stop offset="1" stop-color="#ffe2b8" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hg-cloud" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2a2f3a" stop-opacity=".85"/><stop offset=".6" stop-color="#1b1f28" stop-opacity=".45"/><stop offset="1" stop-color="#11141b" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hg-cloudlit" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#5a3a26" stop-opacity=".55"/><stop offset="1" stop-color="#2a1c14" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hg-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff4dc" stop-opacity=".55"/><stop offset=".5" stop-color="#fff4dc" stop-opacity=".12"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="hg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030406"/><stop offset=".55" stop-color="#090b11"/><stop offset=".82" stop-color="#121119"/><stop offset="1" stop-color="#22160f"/></linearGradient>' +
      '<linearGradient id="hg-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16120f"/><stop offset=".15" stop-color="#0c0b0b"/><stop offset="1" stop-color="#050506"/></linearGradient>' +
      '<linearGradient id="hg-bunker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a2c"/><stop offset=".5" stop-color="#1c1c1e"/><stop offset="1" stop-color="#121213"/></linearGradient>' +
      '<linearGradient id="hg-bside" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0d0e"/><stop offset="1" stop-color="#1b1b1d"/></linearGradient>' +
      '<linearGradient id="hg-bside2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#0d0d0e"/><stop offset="1" stop-color="#1b1b1d"/></linearGradient>' +
      '<linearGradient id="hg-neon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb070"/><stop offset=".45" stop-color="#ff6a1f"/><stop offset="1" stop-color="#e2470e"/></linearGradient>' +
      '<linearGradient id="hg-streak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a1f" stop-opacity=".5"/><stop offset="1" stop-color="#ff6a1f" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="hg-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc77a" stop-opacity=".5"/><stop offset="1" stop-color="#ffc77a" stop-opacity="0"/></linearGradient>' +
      '<pattern id="hp-chain" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H16M0 0V16" stroke="#3a3b40" stroke-width="1.2" fill="none"/></pattern>' +
      '<pattern id="hp-haz" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#ff6a1f"/><rect x="14" width="14" height="28" fill="#0b0b0c"/></pattern>' +
      '<filter id="hf-rim" x="-40%" y="-30%" width="180%" height="160%" color-interpolation-filters="sRGB">' +
        '<feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="d"/>' +
        '<feOffset in="d" dx="2.2" dy="-0.8" result="o"/>' +
        '<feFlood flood-color="#ff7a2a"/><feComposite in2="o" operator="in" result="rim"/>' +
        '<feOffset in="d" dx="-1.6" dy="-0.4" result="o2"/>' +
        '<feFlood flood-color="#7d8cab" flood-opacity=".55"/><feComposite in2="o2" operator="in" result="rim2"/>' +
        '<feGaussianBlur in="rim" stdDeviation="6" result="g"/>' +
        '<feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope=".75"/></feComponentTransfer>' +
        '<feMerge><feMergeNode in="g2"/><feMergeNode in="rim2"/><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="hf-rim-soft" x="-40%" y="-30%" width="180%" height="160%" color-interpolation-filters="sRGB">' +
        '<feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="d"/>' +
        '<feOffset in="d" dx="1.6" dy="-0.6" result="o"/>' +
        '<feFlood flood-color="#c4501a" flood-opacity=".8"/><feComposite in2="o" operator="in" result="rim"/>' +
        '<feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="hf-glow" x="-30%" y="-60%" width="160%" height="220%" color-interpolation-filters="sRGB">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b1"/>' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2"/>' +
        '<feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="hf-glow-s" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="hf-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
      '<filter id="hf-concrete" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".9 .6" numOctaves="3" seed="7" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 -1.1 1.15" />' +
      '</filter>' +
      '</defs>';
    document.body.appendChild(s);
  }

  /* ───────────────────────── Brand mark (own drawing) ───────────────────────── */
  function logoMarkup(cx, cy, s, fill, stroke, extra) {
    var hex = [];
    for (var i = 0; i < 6; i++) { var a = (-90 + i * 60) * D2R; hex.push((Math.cos(a)).toFixed(3) + ',' + (Math.sin(a)).toFixed(3)); }
    return '<g transform="translate(' + cx + ',' + cy + ') scale(' + s + ')" ' + (extra || '') + '>' +
      '<polygon points="' + hex.join(' ') + '" fill="none" stroke="' + stroke + '" stroke-width=".17" stroke-linejoin="round"/>' +
      '<path d="M-.5 -.22 V.42 M.5 -.22 V.42" stroke="' + stroke + '" stroke-width=".1" stroke-linecap="round"/>' +
      '<path d="M0 -.66 C.2 -.46 .23 -.12 .17 .24 L-.17 .24 C-.23 -.12 -.2 -.46 0 -.66 Z" fill="' + fill + '"/>' +
      '<circle cx="0" cy="-.2" r=".075" fill="#0b0b0c"/>' +
      '<path d="M-.17 .02 L-.34 .26 L-.34 .38 L-.17 .28 Z M.17 .02 L.34 .26 L.34 .38 L.17 .28 Z" fill="' + fill + '"/>' +
      '<path d="M-.09 .32 V.56 M0 .32 V.62 M.09 .32 V.56" stroke="' + fill + '" stroke-width=".055" stroke-linecap="round"/>' +
      '</g>';
  }

  /* ───────────────────────── Soldier rig ───────────────────────── */
  var SH_L = { x: -64, y: -326 }, SH_R = { x: 64, y: -326 };
  var L1 = 64, L2 = 64;

  function legMarkup(m) {
    // m = 1 left, -1 mirrored
    var t = m === 1 ? '' : ' transform="scale(-1,1)"';
    return '<g' + t + '>' +
      '<path d="M-54 -208 L-6 -208 L-12 -120 L-48 -114 Z" fill="url(#hg-armor)"/>' +
      '<path d="M-48 -198 L-18 -198 L-22 -138 L-45 -134 Z" fill="url(#hg-plate)" opacity=".9"/>' +
      '<path d="M-47 -170 L-22 -172" class="hp-pipe"/>' +
      '<path d="M-50 -128 Q-31 -142 -12 -128 L-15 -98 Q-31 -90 -47 -98 Z" fill="url(#hg-plate)"/>' +
      '<path d="M-48 -126 Q-31 -139 -14 -126" class="hp-pipe" fill="none"/>' +
      '<path d="M-49 -98 L-12 -98 L-17 -32 L-45 -32 Z" fill="url(#hg-armor)"/>' +
      '<path d="M-44 -92 L-19 -92 L-23 -44 L-41 -44 Z" fill="url(#hg-plate)"/>' +
      '<path d="M-40 -86 L-38 -50" class="hp-pipe"/>' +
      '<path d="M-50 -36 L-14 -36 L-10 -12 L2 -4 L2 0 L-56 0 L-54 -14 Z" fill="#141518"/>' +
      '<path d="M-52 -8 L-4 -8" stroke="#2a2b30" stroke-width="2"/>' +
      '<path d="M-54 -1 L0 -1" stroke="' + OR + '" stroke-width="1.6" opacity=".55"/>' +
      '</g>';
  }

  function soldierMarkup() {
    var abs = '';
    for (var i = 0; i < 3; i++) {
      var y0 = -272 + i * 15;
      abs += '<path d="M-38 ' + y0 + ' L-4 ' + y0 + ' L-4 ' + (y0 + 12) + ' L-35 ' + (y0 + 12) + ' Z" fill="url(#hg-plate)"/>';
      abs += '<path d="M38 ' + y0 + ' L4 ' + y0 + ' L4 ' + (y0 + 12) + ' L35 ' + (y0 + 12) + ' Z" fill="url(#hg-plate-r)"/>';
    }
    var pauld = function (m) {
      var t = m === 1 ? '' : ' transform="scale(-1,1)"';
      return '<g' + t + '>' +
        '<path d="M-92 -314 C-98 -344 -74 -360 -48 -348 L-44 -316 C-58 -302 -80 -300 -92 -314 Z" fill="url(' + (m === 1 ? '#hg-plate' : '#hg-plate-r') + ')"/>' +
        '<path d="M-94 -310 C-90 -292 -70 -288 -50 -298 L-52 -286 C-68 -278 -86 -282 -94 -296 Z" fill="url(#hg-armor)"/>' +
        '<path d="M-88 -322 C-90 -340 -72 -350 -54 -343" class="hp-pipe" fill="none"/>' +
        (m === 1 ? logoMarkup(-70, -328, 9, OR, OR) : '<path d="M-84 -330 L-62 -336 M-84 -322 L-62 -328" stroke="' + OR + '" stroke-width="2" opacity=".8"/>') +
        '</g>';
    };
    var arm = function (k) {
      return '<g data-k="arm' + k + '">' +
        '<path data-k="u' + k + '" stroke="#1b1c20" stroke-width="30" stroke-linecap="round" fill="none"/>' +
        '<path data-k="f' + k + '" stroke="#17181c" stroke-width="27" stroke-linecap="round" fill="none"/>' +
        '<path data-k="fp' + k + '" stroke="#30333a" stroke-width="18" stroke-linecap="round" fill="none"/>' +
        '<path data-k="fs' + k + '" class="hp-pipe" fill="none"/>' +
        '<circle data-k="e' + k + '" r="14" fill="url(#hg-plate)"/>' +
        '</g>';
    };
    return '' +
      '<g data-k="body">' +
        '<ellipse cx="0" cy="2" rx="70" ry="9" fill="#000" opacity=".55"/>' +
        '<g data-k="pack">' +
          '<path d="M-58 -352 L58 -352 L62 -250 L-62 -250 Z" fill="#101114"/>' +
          '<path d="M44 -352 L48 -470" stroke="#2a2c31" stroke-width="3" stroke-linecap="round"/>' +
          '<circle data-k="antled" cx="48" cy="-472" r="3.2" fill="' + GR + '"/>' +
          '<rect x="-66" y="-344" width="14" height="60" rx="4" fill="#17181c"/>' +
        '</g>' +
        legMarkup(1) + '<g transform="translate(6,0)">' + legMarkup(-1) + '</g>' +
        '<path d="M-52 -224 L52 -224 L48 -194 L-48 -194 Z" fill="#101114"/>' +
        '<rect x="-46" y="-221" width="18" height="22" rx="3" fill="#1d1e22"/><rect x="28" y="-221" width="18" height="22" rx="3" fill="#1d1e22"/>' +
        '<rect x="-24" y="-221" width="14" height="20" rx="3" fill="#1a1b1f"/>' +
        '<rect x="-6" y="-216" width="12" height="9" rx="2" fill="' + OR + '" opacity=".9"/>' +
        '<path d="M-16 -198 L16 -198 L10 -168 L-10 -168 Z" fill="url(#hg-plate)"/>' +
        '<g data-k="upper">' +
          arm('B') +
          '<path d="M-68 -340 Q0 -356 68 -340 L60 -290 L48 -226 L-48 -226 L-60 -290 Z" fill="url(#hg-armor)"/>' +
          '<path d="M-56 -332 Q0 -348 56 -332 L50 -284 Q0 -270 -50 -284 Z" fill="url(#hg-plate)"/>' +
          '<path d="M0 -346 L0 -276" stroke="#0a0a0c" stroke-width="2"/>' +
          '<path d="M-50 -284 Q0 -270 50 -284" class="hp-pipe" fill="none"/>' +
          '<text x="0" y="-298" text-anchor="middle" font-family="Archivo, Impact, sans-serif" font-weight="900" font-size="21" letter-spacing="1" fill="' + OR + '" class="hp-chest">HODL</text>' +
          '<rect x="-48" y="-326" width="16" height="22" rx="3" fill="#121316"/><circle data-k="radioled" cx="-40" cy="-320" r="2" fill="' + GR + '"/>' +
          '<path d="M-44 -312 H-36 M-44 -308 H-36" stroke="#3a3c42" stroke-width="1.2"/>' +
          abs +
          '<path d="M-44 -270 L-44 -232 M44 -270 L44 -232" class="hp-pipe"/>' +
          '<rect x="-30" y="-246" width="17" height="20" rx="3" fill="#1b1c20" stroke="#0a0a0c" stroke-width="1.5"/>' +
          '<rect x="-8" y="-246" width="17" height="20" rx="3" fill="#1b1c20" stroke="#0a0a0c" stroke-width="1.5"/>' +
          '<rect x="14" y="-246" width="17" height="20" rx="3" fill="#1b1c20" stroke="#0a0a0c" stroke-width="1.5"/>' +
          '<path d="M-28 -240 H-15 M-6 -240 H7 M16 -240 H29" stroke="' + OR + '" stroke-width="1.4" opacity=".7"/>' +
          '<path d="M-28 -350 L28 -350 L22 -336 L-22 -336 Z" fill="#141518"/>' +
          '<g data-k="head"><g transform="translate(0,-352) scale(1.14) translate(0,352)">' +
            '<rect x="-12" y="-360" width="24" height="18" fill="#0d0e10"/>' +
            '<path d="M-32 -372 C-34 -412 -18 -432 0 -432 C18 -432 34 -412 32 -372 L27 -351 Q0 -342 -27 -351 Z" fill="url(#hg-armor)"/>' +
            '<path d="M-28 -404 C-24 -424 -12 -430 0 -430 C12 -430 24 -424 28 -404 Q0 -414 -28 -404 Z" fill="url(#hg-plate)" opacity=".85"/>' +
            '<path d="M-24 -414 C-18 -426 -6 -429 4 -429" stroke="#ffb27a" stroke-width="1.5" fill="none" opacity=".35"/>' +
            '<path d="M0 -431 L0 -408" class="hp-pipe"/>' +
            '<rect x="20" y="-414" width="12" height="9" rx="2" fill="#26282d"/><circle data-k="lamp" cx="30" cy="-409.5" r="2.6" fill="#fff2d0"/>' +
            '<g data-k="visor">' +
              '<path d="M-27 -396 Q0 -405 27 -396 L25 -373 Q0 -366 -25 -373 Z" fill="url(#hg-visor)"/>' +
              '<path d="M-25 -395 Q0 -403 25 -395" class="hp-pipe" fill="none" opacity=".9"/>' +
              '<rect data-k="glint" x="-9" y="-389" width="18" height="3.2" rx="1.6" fill="' + OR2 + '" class="hp-glint"/>' +
              '<path d="M-22 -376 Q0 -370 22 -376" stroke="#ff6a1f" stroke-width="1" fill="none" opacity=".45"/>' +
            '</g>' +
            '<g data-k="earL"><circle cx="-31" cy="-380" r="8" fill="#1e1f24"/><circle cx="-31" cy="-380" r="2.4" fill="' + OR + '"/></g>' +
            '<g data-k="earR"><circle cx="31" cy="-380" r="8" fill="#1e1f24"/><circle cx="31" cy="-380" r="2.4" fill="' + OR + '"/></g>' +
            '<path d="M-20 -362 L20 -362 L14 -349 L-14 -349 Z" fill="#17181c"/>' +
            '<path d="M-12 -358 H12" stroke="#ff6a1f" stroke-width="1" opacity=".55"/>' +
          '</g></g>' +
          '<g data-k="rifle">' +
            '<path d="M-74 -8 L-30 -12 L-28 8 L-70 18 Z" fill="#26282e"/>' +
            '<path d="M-72 -4 L-34 -7" class="hp-pipe"/>' +
            '<path d="M-32 -13 L42 -13 L44 6 L-30 8 Z" fill="#2f3238"/>' +
            '<path d="M-32 -13 L42 -13 M40 -11 L96 -10" stroke="#6a6e78" stroke-width="1.6"/>' +
            '<g data-k="mag"><path d="M2 6 L17 6 L24 36 L9 38 Z" fill="#1a1b1f"/><path d="M5 10 L19 10" stroke="' + OR + '" stroke-width="1.2" opacity=".7"/></g>' +
            '<path d="M-19 6 L-6 6 L-10 27 L-23 25 Z" fill="#111214"/>' +
            '<path d="M40 -11 L96 -10 L96 4 L40 6 Z" fill="#23252a"/>' +
            '<path d="M44 -4 L92 -4" class="hp-pipe"/>' +
            '<rect x="96" y="-6" width="34" height="6" fill="#3a3d44"/>' +
            '<rect x="128" y="-8.5" width="13" height="11" rx="1.5" fill="#1d1e22"/>' +
            '<path d="M-8 -13 L26 -13 L24 -24 L-4 -24 Z" fill="#0f1012"/>' +
            '<circle cx="24" cy="-18.5" r="3" fill="' + OR2 + '"/>' +
            '<circle cx="8" cy="-3" r="2" fill="' + GR + '" class="hp-led"/>' +
            '<path d="M96 -6 L140 -6" stroke="' + OR + '" stroke-width="1" opacity=".5"/>' +
            '<g data-k="flash" transform="translate(146,-3)" opacity="0">' +
              '<path d="M0 0 L46 -8 L18 0 L46 8 Z M0 0 L22 -22 L10 0 L22 22 Z" fill="#fff3c4"/>' +
              '<circle r="16" fill="#ffd27a" opacity=".85"/><circle r="30" fill="' + GR + '" opacity=".35"/>' +
            '</g>' +
          '</g>' +
          arm('F') +
          '<circle data-k="hB" r="12.5" fill="#0f1012"/>' +
          '<circle data-k="hF" r="12.5" fill="#0f1012"/>' +
          pauld(1) + pauld(-1) +
        '</g>' +
      '</g>';
  }

  function ik(sx, sy, tx, ty, l1, l2, side) {
    var dx = tx - sx, dy = ty - sy, d = Math.sqrt(dx * dx + dy * dy);
    d = clamp(d, Math.abs(l1 - l2) + 2, l1 + l2 - 0.5);
    var base = Math.atan2(dy, dx);
    var a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    var e1 = { x: sx + Math.cos(base + a) * l1, y: sy + Math.sin(base + a) * l1 };
    var e2 = { x: sx + Math.cos(base - a) * l1, y: sy + Math.sin(base - a) * l1 };
    // prefer elbow outward (side) and lower
    var s1 = side * (e1.x - sx) + 0.35 * (e1.y - sy), s2 = side * (e2.x - sx) + 0.35 * (e2.y - sy);
    var e = s1 >= s2 ? e1 : e2;
    return { ex: e.x, ey: e.y, hx: sx + Math.cos(base) * d, hy: sy + Math.sin(base) * d };
  }

  function Soldier(parent, opt) {
    this.x = opt.x; this.y = opt.y; this.s = opt.s || 1; this.flip = opt.flip ? -1 : 1;
    this.g = sv('g', { 'class': 'hodl-soldier', filter: opt.filter || 'url(#hf-rim)' }, parent);
    if (opt.tint) this.g.setAttribute('opacity', opt.tint);
    this.g.innerHTML = soldierMarkup();
    var k = {}; qa(this.g, '[data-k]').forEach(function (e) { k[e.getAttribute('data-k')] = e; });
    this.k = k;
    this.aim = 0; this.aimAngle = -92; this.look = 0; this.lookTarget = 0; this.salute = 0; this.recoil = 0;
    this.victory = 0; this.reload = 0; this.radio = 0; this.hop = 0; this.guard = 0; this.lookUp = 0;
    this.phase = rand(0, 10); this.flash = 0; this.flashRot = 0;
    this.idleLook = opt.idleLook !== false; this.nextIdleLook = rand(2, 5);
    this.place();
  }
  Soldier.prototype.place = function () {
    this.g.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ') scale(' + (this.s * this.flip) + ',' + this.s + ')');
  };
  Soldier.prototype.rifleFrame = function (br) {
    var b = easeIO(clamp(this.aim, 0, 1));
    var A0 = 16, G0 = { x: -40, y: -218 + br };
    var th = this.aimAngle;
    var sh = { x: SH_L.x, y: SH_L.y + br };
    var reach = 84;
    var G1 = { x: sh.x + Math.cos((th - 6) * D2R) * reach, y: sh.y + Math.sin((th - 6) * D2R) * reach };
    var ang = lerp(A0, th, b);
    var gx = lerp(G0.x, G1.x, b), gy = lerp(G0.y, G1.y, b);
    // reload: tilt the rifle up and in
    var rl = Math.sin(clamp(this.reload, 0, 1) * Math.PI);
    ang += rl * -22; gx += rl * 8; gy += rl * -10;
    // victory: rifle held overhead with both hands
    var v = easeIO(clamp(this.victory, 0, 1));
    if (v > 0) {
      gx = lerp(gx, -52, v); gy = lerp(gy, -448 + br, v);
      ang = lerp(ang, -6, v);
    }
    var ca = Math.cos(ang * D2R), sa = Math.sin(ang * D2R);
    gx -= ca * this.recoil; gy -= sa * this.recoil;
    return { gx: gx, gy: gy, ang: ang, ca: ca, sa: sa, sc: 1.02, b: b };
  };
  Soldier.prototype.local = function (f, lx, ly) {
    return { x: f.gx + (f.ca * lx - f.sa * ly) * f.sc, y: f.gy + (f.sa * lx + f.ca * ly) * f.sc };
  };
  Soldier.prototype.toWorld = function (p) {
    return { x: this.x + this.s * this.flip * (p.x + this.sway), y: this.y + this.s * p.y };
  };
  Soldier.prototype.update = function (t, dt) {
    var k = this.k;
    var br = Math.sin(t * 1.7 + this.phase) * 1.5;
    this.sway = Math.sin(t * 0.6 + this.phase) * 1.2;
    this.br = br;
    // idle glances
    if (this.idleLook) {
      this.nextIdleLook -= dt;
      if (this.nextIdleLook <= 0 && this.aim < 0.05 && !this.lockLook) {
        this.lookTarget = Math.random() < 0.4 ? 0 : rand(-1, 1);
        this.nextIdleLook = rand(2.2, 5.5);
      }
    }
    this.look += (this.lookTarget - this.look) * Math.min(1, dt * 7);
    this.recoil *= Math.pow(0.0005, dt);
    this.flash = Math.max(0, this.flash - dt * 14);

    var hop = this.hop > 0 ? -Math.abs(Math.sin(this.hop * Math.PI)) * 14 : 0;
    k.body.setAttribute('transform', 'translate(' + this.sway.toFixed(2) + ',' + hop.toFixed(2) + ')');
    var blink = Math.sin(t * 3 + this.phase) > 0.6;
    if (blink !== this._blink) { this._blink = blink; k.antled.setAttribute('opacity', blink ? '1' : '.2'); k.radioled.setAttribute('opacity', (this.radio > 0.5 || blink) ? '1' : '.3'); }
    k.upper.setAttribute('transform', 'translate(0,' + br.toFixed(2) + ')');
    var lk = this.look;
    var up = Math.max(this.aim, this.victory, this.lookUp);
    k.head.setAttribute('transform', 'translate(' + (lk * 3).toFixed(2) + ',' + (up * -2).toFixed(2) + ') rotate(' + (lk * 5 - up * 4 + this.radio * 7).toFixed(2) + ' 0 -360)');
    k.visor.setAttribute('transform', 'translate(' + (lk * 6).toFixed(2) + ',' + (-up * 3).toFixed(2) + ')');
    var gl = this.victory > 0.5 ? GR : this.guard > 0.5 ? '#ff3b2a' : OR2;
    if (gl !== this._gl) { this._gl = gl; k.glint.setAttribute('fill', gl); }
    k.glint.setAttribute('x', (-9 + lk * 11).toFixed(2));
    k.earL.setAttribute('transform', 'translate(' + (lk * 4).toFixed(2) + ',0) scale(' + (1 - Math.max(0, lk) * 0.4).toFixed(3) + ',1)');
    k.earR.setAttribute('transform', 'translate(' + (lk * 4).toFixed(2) + ',0) scale(' + (1 + Math.min(0, lk) * 0.4).toFixed(3) + ',1)');

    // rifle (coords relative to upper group, so subtract br)
    var f = this.rifleFrame(0);
    k.rifle.setAttribute('transform', 'translate(' + f.gx.toFixed(2) + ',' + f.gy.toFixed(2) + ') rotate(' + f.ang.toFixed(2) + ') scale(' + f.sc + ')');
    if (this.flash > 0) {
      k.flash.setAttribute('opacity', Math.min(1, this.flash).toFixed(2));
      k.flash.setAttribute('transform', 'translate(146,-3) rotate(' + this.flashRot + ') scale(' + (0.7 + this.flash * 0.5).toFixed(2) + ')');
    } else k.flash.setAttribute('opacity', '0');

    // hands
    var grip = this.local(f, -12, 12);
    var supR = this.local(f, 64, 6);
    var free = { x: 72, y: -246 };
    var ab = smooth(0.15, 0.8, this.aim) * (1 - easeIO(clamp(this.victory, 0, 1)));
    var sup = { x: lerp(supR.x, free.x, ab), y: lerp(supR.y, free.y, ab) };
    // reload: support hand pulls the mag out and seats a fresh one
    var r = clamp(this.reload, 0, 1);
    if (r > 0 && r < 1) {
      var magDrop = r < 0.45 ? smooth(0.15, 0.45, r) : 1 - smooth(0.55, 0.85, r);
      k.mag.setAttribute('transform', 'translate(0,' + (magDrop * 46).toFixed(1) + ')');
      k.mag.setAttribute('opacity', (r > 0.42 && r < 0.56) ? '0' : '1');
      var magPt = this.local(f, 14, 30 + magDrop * 46);
      var hr = Math.sin(r * Math.PI);
      sup = { x: lerp(sup.x, magPt.x, Math.min(1, hr * 1.6)), y: lerp(sup.y, magPt.y, Math.min(1, hr * 1.6)) };
      if (r > 0.44 && !this._dropped) { this._dropped = true; this.onMagDrop && this.onMagDrop(this.toWorld(this.local(f, 14, 76))); }
    } else if (this._magSet !== true) { k.mag.setAttribute('transform', ''); k.mag.setAttribute('opacity', '1'); this._magSet = true; }
    if (r > 0 && r < 1) this._magSet = false; else this._dropped = false;
    // radio check: hand to the side of the helmet
    var rd = easeIO(clamp(this.radio, 0, 1));
    if (rd > 0) { sup = { x: lerp(sup.x, 36, rd), y: lerp(sup.y, -386, rd) }; }
    var sal = easeIO(clamp(this.salute, 0, 1));
    var brow = { x: -22, y: -404 };
    grip = { x: lerp(grip.x, brow.x, sal), y: lerp(grip.y, brow.y, sal) };
    this.drawArm('B', SH_L, grip, 1);
    this.drawArm('F', SH_R, sup, -1);
  };
  Soldier.prototype.drawArm = function (id, sh, tgt, side) {
    var k = this.k, r = ik(sh.x, sh.y, tgt.x, tgt.y, L1, L2, side);
    var u = 'M' + sh.x + ' ' + sh.y + ' L' + r.ex.toFixed(1) + ' ' + r.ey.toFixed(1);
    var fdx = r.hx - r.ex, fdy = r.hy - r.ey, fl = Math.sqrt(fdx * fdx + fdy * fdy) || 1;
    var nx = -fdy / fl * 6 * side, ny = fdx / fl * 6 * side;
    k['u' + id].setAttribute('d', u);
    k['f' + id].setAttribute('d', 'M' + r.ex.toFixed(1) + ' ' + r.ey.toFixed(1) + ' L' + r.hx.toFixed(1) + ' ' + r.hy.toFixed(1));
    k['fp' + id].setAttribute('d', 'M' + (r.ex + fdx * 0.2).toFixed(1) + ' ' + (r.ey + fdy * 0.2).toFixed(1) + ' L' + (r.ex + fdx * 0.78).toFixed(1) + ' ' + (r.ey + fdy * 0.78).toFixed(1));
    k['fs' + id].setAttribute('d', 'M' + (r.ex + fdx * 0.25 + nx).toFixed(1) + ' ' + (r.ey + fdy * 0.25 + ny).toFixed(1) + ' L' + (r.ex + fdx * 0.72 + nx).toFixed(1) + ' ' + (r.ey + fdy * 0.72 + ny).toFixed(1));
    k['e' + id].setAttribute('cx', r.ex.toFixed(1)); k['e' + id].setAttribute('cy', r.ey.toFixed(1));
    k['h' + id].setAttribute('cx', r.hx.toFixed(1)); k['h' + id].setAttribute('cy', r.hy.toFixed(1));
  };
  Soldier.prototype.muzzle = function () {
    var f = this.rifleFrame(this.br || 0);
    var p = this.local(f, 146, -3);
    var w = this.toWorld(p);
    return { x: w.x, y: w.y, dx: f.ca * this.flip, dy: f.sa };
  };
  Soldier.prototype.shoulderWorld = function () {
    return this.toWorld({ x: SH_L.x, y: SH_L.y });
  };
  Soldier.prototype.angleTo = function (wx, wy, allowDown) {
    var sh = this.shoulderWorld();
    var a = Math.atan2((wy - sh.y) / this.s, (wx - sh.x) * this.flip / this.s) / D2R;
    if (a > 120) a -= 360;
    return clamp(a, -165, allowDown ? 45 : -18);
  };

  /* ───────────────────────── Vault door ───────────────────────── */
  function doorMarkup(r) {
    var bolts = '', ticks = '', spokes = '', locks = '';
    for (var i = 0; i < 30; i++) {
      var a = i / 30 * TAU, x = Math.cos(a) * (r - 13), y = Math.sin(a) * (r - 13);
      bolts += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r * 0.026).toFixed(1) + '" fill="#55575e"/>';
    }
    for (var j = 0; j < 72; j++) {
      var b = j / 72 * TAU, r1 = r * 0.74, r2 = r * (j % 6 === 0 ? 0.68 : 0.715);
      ticks += '<line x1="' + (Math.cos(b) * r1).toFixed(1) + '" y1="' + (Math.sin(b) * r1).toFixed(1) + '" x2="' + (Math.cos(b) * r2).toFixed(1) + '" y2="' + (Math.sin(b) * r2).toFixed(1) + '" stroke="#5a5c63" stroke-width="' + (j % 6 === 0 ? 2.2 : 1) + '"/>';
    }
    for (var s = 0; s < 8; s++) {
      var c = s / 8 * TAU;
      spokes += '<g transform="rotate(' + (s * 45) + ')"><rect x="' + (r * 0.5).toFixed(1) + '" y="-5" width="' + (r * 0.13).toFixed(1) + '" height="10" rx="3" fill="#2a2c31"/><circle cx="' + (r * 0.64).toFixed(1) + '" cy="0" r="7" fill="#3c3e44"/></g>';
    }
    for (var l = 0; l < 8; l++) {
      locks += '<g transform="rotate(' + (l * 45 + 22.5) + ')"><rect data-bolt x="' + (r * 0.86).toFixed(1) + '" y="-9" width="' + (r * 0.12).toFixed(1) + '" height="18" rx="2" fill="url(#hg-metal)" stroke="#0b0b0c" stroke-width="1.5"/></g>';
    }
    return '' +
      '<g data-k="locks">' + locks + '</g>' +
      '<circle r="' + r + '" fill="url(#hg-door)" stroke="#45474d" stroke-width="5"/>' +
      '<circle r="' + (r - 4) + '" fill="none" stroke="#0a0a0c" stroke-width="2"/>' +
      bolts +
      '<circle r="' + (r * 0.84) + '" fill="url(#hg-doorin)" stroke="#08080a" stroke-width="3"/>' +
      '<circle r="' + (r * 0.8) + '" fill="none" stroke="#3a3c42" stroke-width="1.5"/>' +
      ticks +
      '<g data-k="ledring" opacity=".25"><circle r="' + (r * 0.77) + '" fill="none" stroke="' + OR + '" stroke-width="2.5" stroke-dasharray="10 14"/></g>' +
      '<g data-k="wheel">' + spokes + '<circle r="' + (r * 0.5) + '" fill="none" stroke="#2a2c31" stroke-width="6"/></g>' +
      '<circle r="' + (r * 0.46) + '" fill="#121316" stroke="#2e3036" stroke-width="3"/>' +
      '<g filter="url(#hf-glow-s)">' + logoMarkup(0, 0, r * 0.33, OR, OR) + '</g>' +
      '<path d="M' + (-r * 0.5) + ' ' + (-r * 0.86) + ' A' + r + ' ' + r + ' 0 0 1 ' + (r * 0.62) + ' ' + (-r * 0.78) + '" stroke="#ffffff" stroke-opacity=".08" stroke-width="3" fill="none"/>';
  }

  function Door(parent, cx, cy, r) {
    this.cx = cx; this.cy = cy; this.r = r;
    this.g = sv('g', {}, parent);
    this.g.innerHTML = doorMarkup(r);
    this.wheel = q(this.g, '[data-k="wheel"]');
    this.ledring = q(this.g, '[data-k="ledring"]');
    this.bolts = qa(this.g, '[data-bolt]');
    this.open = 0; this.lock = 1; this.wheelAng = 0; this.travel = 2.18;
    this.apply();
  }
  Door.prototype.apply = function () {
    var o = easeIO(clamp(this.open, 0, 1));
    var dx = o * this.r * this.travel, rot = dx / this.r / D2R;
    this.g.setAttribute('transform', 'translate(' + (this.cx + dx).toFixed(2) + ',' + this.cy + ') rotate(' + rot.toFixed(2) + ')');
    this.wheel.setAttribute('transform', 'rotate(' + this.wheelAng.toFixed(2) + ')');
    var lk = clamp(this.lock, 0, 1), sh = (-1 + lk) * this.r * 0.11;
    for (var i = 0; i < this.bolts.length; i++) this.bolts[i].setAttribute('transform', 'translate(' + sh.toFixed(2) + ',0)');
    this.ledring.setAttribute('opacity', (0.18 + lk * 0.75).toFixed(2));
  };

  /* ───────────────────────── Hero world ───────────────────────── */
  var BX = 1500, GY = 900, DOOR_R = 168, DOOR_CY = 690;

  function towerMarkup(x, h, m) {
    var top = GY - h;
    return '<g opacity=".9">' +
      '<path d="M' + (x - 34) + ' ' + GY + ' L' + (x - 14) + ' ' + top + ' M' + (x + 34) + ' ' + GY + ' L' + (x + 14) + ' ' + top + ' M' + (x - 30) + ' ' + (GY - h * 0.3) + ' L' + (x + 26) + ' ' + (GY - h * 0.62) + ' M' + (x + 30) + ' ' + (GY - h * 0.3) + ' L' + (x - 26) + ' ' + (GY - h * 0.62) + '" stroke="#15161a" stroke-width="6"/>' +
      '<rect x="' + (x - 46) + '" y="' + (top - 46) + '" width="92" height="46" fill="#121316"/>' +
      '<rect x="' + (x - 40) + '" y="' + (top - 40) + '" width="80" height="18" fill="#2a1a0e"/>' +
      '<path d="M' + (x - 56) + ' ' + (top - 46) + ' L' + (x + 56) + ' ' + (top - 46) + ' L' + (x + 40) + ' ' + (top - 62) + ' L' + (x - 40) + ' ' + (top - 62) + ' Z" fill="#0e0f11"/>' +
      '<g filter="url(#hf-glow-s)"><circle cx="' + (x + m * 4 - 9) + '" cy="' + (top - 84) + '" r="5" fill="#fff6e0"/><circle cx="' + (x + m * 4 + 9) + '" cy="' + (top - 84) + '" r="5" fill="#fff6e0"/></g>' +
      '<line x1="' + x + '" y1="' + (top - 74) + '" x2="' + x + '" y2="' + (top - 62) + '" stroke="#15161a" stroke-width="5"/>' +
      '<circle cx="' + (x + m * 4) + '" cy="' + (top - 86) + '" r="70" fill="url(#hg-poolw)" opacity=".5"/>' +
      '</g>';
  }

  function fenceMarkup(x0, x1) {
    var top = 700, out = '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (GY - top) + '" fill="url(#hp-chain)" opacity=".55"/>';
    out += '<path d="M' + x0 + ' ' + (top + 2) + ' H' + x1 + ' M' + x0 + ' ' + (top + 70) + ' H' + x1 + '" stroke="#24252a" stroke-width="3"/>';
    out += '<path d="M' + x0 + ' ' + (top + 70) + ' H' + x1 + '" stroke="' + OR + '" stroke-width="1.6" opacity=".55" filter="url(#hf-glow-s)"/>';
    for (var x = x0; x <= x1; x += 110) out += '<rect x="' + (x - 3) + '" y="' + (top - 26) + '" width="6" height="' + (GY - top + 26) + '" fill="#17181b"/>';
    var coil = 'M' + x0 + ' ' + (top - 12);
    for (var cx = x0; cx < x1; cx += 14) coil += ' a9 10 0 1 1 14 0';
    out += '<path d="' + coil + '" stroke="#2c2d32" stroke-width="1.6" fill="none"/>';
    return out;
  }

  function bunkerMarkup() {
    var L = BX - 320, R = BX + 320;
    var out = '';
    // pools of light on ground
    out += '<ellipse cx="' + BX + '" cy="' + (GY + 18) + '" rx="420" ry="46" fill="url(#hg-pool)" data-k="pool"/>';
    out += '<rect x="' + (BX - 40) + '" y="' + (GY + 4) + '" width="80" height="230" fill="url(#hg-streak)" opacity=".5"/>';
    out += '<rect x="' + (BX - 258) + '" y="' + (GY + 4) + '" width="16" height="150" fill="url(#hg-streak)" opacity=".7"/>';
    out += '<rect x="' + (BX + 242) + '" y="' + (GY + 4) + '" width="16" height="150" fill="url(#hg-streak)" opacity=".7"/>';
    // side buttresses
    out += '<path d="M' + (L - 120) + ' ' + GY + ' L' + (L - 40) + ' 360 L' + L + ' 330 L' + (L + 30) + ' ' + GY + ' Z" fill="url(#hg-bside)"/>';
    out += '<path d="M' + (R + 120) + ' ' + GY + ' L' + (R + 40) + ' 360 L' + R + ' 330 L' + (R - 30) + ' ' + GY + ' Z" fill="url(#hg-bside2)"/>';
    // main block
    out += '<path data-k="bunker" d="M' + (L + 10) + ' ' + GY + ' L' + (L + 34) + ' 330 L' + (R - 34) + ' 330 L' + (R - 10) + ' ' + GY + ' Z" fill="url(#hg-bunker)"/>';
    out += '<path d="M' + (L + 10) + ' ' + GY + ' L' + (L + 34) + ' 330 L' + (R - 34) + ' 330 L' + (R - 10) + ' ' + GY + ' Z" fill="#000" filter="url(#hf-concrete)" opacity=".35" style="mix-blend-mode:overlay"/>';
    for (var y = 400; y < GY; y += 82) out += '<path d="M' + (L + 30 - (y - 330) * 0.04) + ' ' + y + ' H' + (R - 30 + (y - 330) * 0.04) + '" stroke="#0b0b0c" stroke-width="2" opacity=".7"/>';
    // sign housing
    out += '<path d="M' + (BX - 268) + ' 340 L' + (BX - 252) + ' 186 L' + (BX + 252) + ' 186 L' + (BX + 268) + ' 340 Z" fill="#141416"/>';
    out += '<path d="M' + (BX - 252) + ' 186 L' + (BX + 252) + ' 186" stroke="#2a2a2d" stroke-width="3"/>';
    return out;
  }
  function signMarkup() {
    var out = '<g data-k="sign" filter="url(#hf-glow)">' +
      '<text data-k="sH" x="' + (BX - 214) + '" y="312" font-family="Archivo, Impact, sans-serif" font-weight="900" font-size="132" fill="url(#hg-neon)" stroke="#ffc08a" stroke-width="1.5">H</text>' +
      logoMarkup(BX - 40, 262, 62, 'url(#hg-neon)', 'url(#hg-neon)', 'data-k="sLogo"') +
      '<text data-k="sDL" x="' + (BX + 34) + '" y="312" font-family="Archivo, Impact, sans-serif" font-weight="900" font-size="132" fill="url(#hg-neon)" stroke="#ffc08a" stroke-width="1.5">DL</text>' +
      '</g>';
    return out;
  }
  function bunkerMidMarkup() {
    var out = '<ellipse cx="' + BX + '" cy="350" rx="300" ry="40" fill="url(#hg-pool)" opacity=".7"/>';
    return out;
  }
  function camerasMarkup() {
    var out = '';
    [[BX - 236, 1], [BX + 236, -1]].forEach(function (c, i) {
      out += '<g transform="translate(' + c[0] + ',360)"><rect x="-4" y="0" width="8" height="18" fill="#141416"/>' +
        '<g data-k="cam' + i + '"><rect x="' + (c[1] > 0 ? -34 : -14) + '" y="-12" width="48" height="22" rx="4" fill="#1d1e22"/><rect x="' + (c[1] > 0 ? -40 : 12) + '" y="-8" width="8" height="14" fill="#0c0c0e"/><circle data-k="camled' + i + '" cx="' + (c[1] > 0 ? 8 : -8) + '" cy="-4" r="2.6" fill="#ff2a2a"/></g></g>';
    });
    return out;
  }
  function interiorMarkup() {
    return '<g data-k="interior">' +
      '<circle cx="' + BX + '" cy="' + DOOR_CY + '" r="' + (DOOR_R - 2) + '" fill="url(#hg-vaultglow)"/>' +
      coinPiles() +
      '</g>';
  }
  function bunkerLowerMarkup() {
    var out = '';
    // door recess + frame
    out += '<rect x="' + (BX - 200) + '" y="455" width="400" height="' + (GY - 455) + '" fill="#0b0b0c"/>';
    out += '<rect x="' + (BX - 200) + '" y="455" width="400" height="10" fill="#202024"/>';
    out += '<circle data-k="lamp" cx="' + BX + '" cy="470" r="5" fill="#fff2d0" filter="url(#hf-glow-s)"/>';
    out += '<path d="M' + (BX - 60) + ' 476 L' + (BX + 60) + ' 476 L' + (BX + 150) + ' ' + GY + ' L' + (BX - 150) + ' ' + GY + ' Z" fill="url(#hg-ray)" opacity=".12"/>';
    out += '<circle cx="' + BX + '" cy="' + DOOR_CY + '" r="' + (DOOR_R + 14) + '" fill="none" stroke="#2c2d32" stroke-width="22"/>';
    out += '<circle cx="' + BX + '" cy="' + DOOR_CY + '" r="' + (DOOR_R + 25) + '" fill="none" stroke="#0a0a0b" stroke-width="3"/>';
    out += '<circle cx="' + BX + '" cy="' + DOOR_CY + '" r="' + (DOOR_R + 4) + '" fill="none" stroke="#0a0a0b" stroke-width="3"/>';
    // rail + hazard step
    out += '<rect x="' + (BX - 210) + '" y="' + (GY - 24) + '" width="' + (420 + DOOR_R * 2.3) + '" height="10" fill="#2a2b2f"/>';
    out += '<rect x="' + (BX - 210) + '" y="' + (GY - 14) + '" width="420" height="14" fill="url(#hp-haz)" opacity=".85"/>';
    // wall lamps
    [BX - 262, BX + 262].forEach(function (lx, i) {
      out += '<g data-k="wl' + i + '"><circle cx="' + lx + '" cy="560" r="90" fill="url(#hg-pool)"/>' +
        '<rect x="' + (lx - 11) + '" y="540" width="22" height="40" rx="5" fill="#1b1b1e"/>' +
        '<rect x="' + (lx - 6) + '" y="546" width="12" height="28" rx="4" fill="#ffb066" filter="url(#hf-glow-s)"/>' +
        '<path d="M' + (lx - 11) + ' 552 H' + (lx + 11) + ' M' + (lx - 11) + ' 562 H' + (lx + 11) + '" stroke="#1b1b1e" stroke-width="2"/></g>';
    });
    return out;
  }

  function coinPiles() {
    var out = '<g opacity=".95">';
    var piles = [[BX - 70, 820, 6], [BX + 10, 836, 9], [BX + 85, 826, 5], [BX - 15, 760, 3]];
    piles.forEach(function (p) {
      for (var i = 0; i < p[2]; i++) {
        var y = p[1] - i * 9;
        out += '<ellipse cx="' + p[0] + '" cy="' + (y + 3) + '" rx="34" ry="9" fill="#7a2e08"/>';
        out += '<ellipse cx="' + p[0] + '" cy="' + y + '" rx="34" ry="9" fill="#ffb347" stroke="#c2410c" stroke-width="1.5"/>';
      }
      out += logoMarkup(p[0], p[1] - (p[2] - 1) * 9, 7, '#c2410c', '#c2410c', 'transform-origin="0 0"');
    });
    out += '<path d="M' + (BX - 120) + ' 600 L' + (BX - 40) + ' 560 M' + (BX + 30) + ' 552 L' + (BX + 110) + ' 590" stroke="#fff3d6" stroke-width="2" opacity=".35"/>';
    return out + '</g>';
  }

  function skyMarkup() {
    var out = '<rect x="-2000" y="-3200" width="6400" height="4200" fill="url(#hg-sky)"/>' +
      '<ellipse cx="' + BX + '" cy="420" rx="900" ry="520" fill="url(#hg-pool)" opacity=".38"/>' +
      '<ellipse cx="' + BX + '" cy="860" rx="1400" ry="220" fill="url(#hg-pool)" opacity=".3"/>';
    // stars
    var s = '';
    for (var i = 0; i < 90; i++) s += '<circle cx="' + rand(0, 2400).toFixed(0) + '" cy="' + rand(-1600, 420).toFixed(0) + '" r="' + rand(0.5, 1.6).toFixed(1) + '" fill="#cfd6e6" opacity="' + rand(0.15, 0.6).toFixed(2) + '"/>';
    out += '<g data-k="stars">' + s + '</g>';
    return out + skylineMarkup();
  }
  function skylineMarkup() {
    var out = '<path d="M-400 900 L-400 760 L120 760 L120 720 L260 720 L260 770 L640 770 L640 742 L820 742 L820 900 Z M1980 900 L1980 760 L2200 760 L2200 720 L2420 720 L2420 770 L2900 770 L2900 900 Z" fill="#0b0c10"/>';
    out += towerMarkup(560, 330, 1) + towerMarkup(2010, 380, -1) + towerMarkup(150, 280, 1);
    return out;
  }
  function cloudsMarkup() {
    var cl = '', out = '';
    for (var j = 0; j < 22; j++) {
      var cx = rand(-400, 3400), cy = rand(-500, 380), rx = rand(220, 520), ry = rand(60, 140);
      cl += '<ellipse cx="' + cx.toFixed(0) + '" cy="' + cy.toFixed(0) + '" rx="' + rx.toFixed(0) + '" ry="' + ry.toFixed(0) + '" fill="url(#' + (cy > 150 && Math.abs(cx - BX) < 600 ? 'hg-cloudlit' : 'hg-cloud') + ')"/>';
    }
    out += '<g>' + cl + '</g>';
    out += '<g opacity=".8" transform="translate(0,-120)">' + cl.replace(/cx="(-?\d+)"/g, function (m, v) { return 'cx="' + (+v + 1100) + '"'; }) + '</g>';
    return out;
  }

  /* ───────────────────────── Candle FX ───────────────────────── */
  function makeCandleSprite() {
    var c = document.createElement('canvas'); c.width = 48; c.height = 128;
    var x = c.getContext('2d');
    x.shadowColor = '#2bff74'; x.shadowBlur = 14;
    x.strokeStyle = '#b8ffd0'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(24, 10); x.lineTo(24, 118); x.stroke();
    var g = x.createLinearGradient(0, 30, 0, 98); g.addColorStop(0, '#8dffb6'); g.addColorStop(0.5, '#2bff74'); g.addColorStop(1, '#0fbf4a');
    x.fillStyle = g; x.fillRect(15, 30, 18, 68);
    x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(17, 32, 4, 64);
    return c;
  }
  function makeSpark() {
    var c = document.createElement('canvas'); c.width = 32; c.height = 32;
    var x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(220,255,230,1)'); g.addColorStop(0.3, 'rgba(43,255,116,.8)'); g.addColorStop(1, 'rgba(43,255,116,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
  }
  var SPRITE = null, SPARK = null;

  function CandleFX(front, back) {
    this.front = front; this.back = back; this.p = []; this.sparks = []; this.shells = []; this.rain = [];
    this.slots = []; this.slotN = 26; this.filled = 0; this.chartFade = 1; this.resetting = 0;
    if (!SPRITE) { SPRITE = makeCandleSprite(); SPARK = makeSpark(); }
  }
  CandleFX.prototype.resize = function (w, h, mobile) {
    this.w = w; this.h = h; this.mobile = mobile;
    this.fctx = fitCanvas(this.front, w, h); this.bctx = fitCanvas(this.back, w, h);
    this.buildSlots();
    var n = mobile ? 70 : 150; this.rain = [];
    for (var i = 0; i < n; i++) this.rain.push({ x: rand(0, w), y: rand(0, h), l: rand(10, 22), v: rand(700, 1100) });
  };
  CandleFX.prototype.buildSlots = function () {
    var N = this.slotN = this.mobile ? 14 : 26, w = this.w, h = this.h;
    var x0 = w * (this.mobile ? 0.08 : 0.05), x1 = w * (this.mobile ? 0.92 : 0.5);
    var yTop = h * (this.mobile ? 0.12 : 0.11), yBot = h * (this.mobile ? 0.36 : 0.31);
    var prev = yBot, old = this.slots;
    this.slots = [];
    var seed = 3;
    for (var i = 0; i < N; i++) {
      seed = (seed * 9301 + 49297) % 233280; var r = seed / 233280;
      var trend = lerp(yBot, yTop, i / (N - 1));
      var close = trend + (r - 0.35) * (yBot - yTop) * 0.16;
      if (close > prev) close = prev - 6;
      var open = prev + (i ? (yBot - yTop) * 0.015 : 10);
      this.slots.push({ x: lerp(x0, x1, i / (N - 1)), open: open, close: close, hiW: close - rand(6, 20), loW: open + rand(6, 18), filled: old[i] ? old[i].filled : false, flash: 0 });
      prev = close;
    }
  };
  CandleFX.prototype.fire = function (x, y, dx, dy, n, toChart) {
    for (var i = 0; i < n; i++) {
      var spread = rand(-0.22, 0.22), ca = Math.cos(spread), sa = Math.sin(spread);
      var vx = dx * ca - dy * sa, vy = dx * sa + dy * ca, sp = rand(900, 1500);
      var slot = -1;
      if (toChart && i === 0) {
        for (var s = 0; s < this.slots.length; s++) if (!this.slots[s].filled && !this.slots[s].claimed) { slot = s; this.slots[s].claimed = true; break; }
      }
      this.p.push({ x: x, y: y, vx: vx * sp, vy: vy * sp, rot: Math.atan2(vy, vx) + Math.PI / 2, vr: rand(-3, 3), life: 0, ttl: rand(1.6, 2.6), sc: rand(0.5, 0.8), slot: slot });
    }
    for (var k = 0; k < 10; k++) this.sparks.push({ x: x, y: y, vx: dx * rand(100, 500) + rand(-160, 160), vy: dy * rand(100, 500) + rand(-160, 160), life: 0, ttl: rand(0.2, 0.5), s: rand(6, 16) });
  };
  CandleFX.prototype.tracer = function (x, y, tx, ty) {
    var dx = tx - x, dy = ty - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    this.p.push({ tr: true, x: x, y: y, vx: dx / d * 2600, vy: dy / d * 2600, left: d, rot: Math.atan2(dy, dx) + Math.PI / 2, life: 0, ttl: 1, sc: 0.42, slot: -1, tx: tx, ty: ty });
    for (var k = 0; k < 8; k++) this.sparks.push({ x: x, y: y, vx: dx / d * rand(100, 400) + rand(-120, 120), vy: dy / d * rand(100, 400) + rand(-120, 120), life: 0, ttl: rand(0.15, 0.35), s: rand(6, 14) });
  };
  CandleFX.prototype.mag = function (x, y) {
    this.shells.push({ x: x, y: y, vx: rand(-40, 40), vy: rand(-60, 0), r: 0.2, vr: rand(-4, 4), ground: this.groundY || this.h * 0.85, b: 0, big: true });
  };
  CandleFX.prototype.shell = function (x, y, dir) {
    this.shells.push({ x: x, y: y, vx: dir * rand(120, 260), vy: rand(-380, -240), r: rand(0, 6), vr: rand(-18, 18), ground: this.groundY || this.h * 0.85, b: 0 });
  };
  CandleFX.prototype.burst = function (x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = rand(-Math.PI * 0.9, -Math.PI * 0.1), sp = rand(300, 800);
      this.p.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: a + Math.PI / 2, vr: rand(-4, 4), life: 0, ttl: rand(0.8, 1.4), sc: rand(0.25, 0.45), slot: -1 });
    }
  };
  CandleFX.prototype.update = function (dt, reduced) {
    var w = this.w, h = this.h, f = this.fctx, b = this.bctx, i;
    f.clearRect(0, 0, w, h); b.clearRect(0, 0, w, h);
    // rain
    if (!reduced) {
      f.strokeStyle = 'rgba(170,185,215,.13)'; f.lineWidth = 1; f.beginPath();
      for (i = 0; i < this.rain.length; i++) {
        var r = this.rain[i]; r.y += r.v * dt; r.x -= r.v * dt * 0.16;
        if (r.y > h) { r.y = -20; r.x = rand(0, w * 1.15); }
        f.moveTo(r.x, r.y); f.lineTo(r.x + r.l * 0.16, r.y - r.l);
      }
      f.stroke();
    }
    // chart (back layer)
    var allFilled = true;
    b.globalCompositeOperation = 'lighter';
    for (i = 0; i < this.slots.length; i++) {
      var s = this.slots[i];
      if (!s.filled) { allFilled = false; continue; }
      s.flash = Math.max(0, s.flash - dt * 2.5);
      var a = this.chartFade * (0.75 + s.flash * 0.25);
      var bw = this.mobile ? 11 : 16;
      b.globalAlpha = a * 0.9;
      b.strokeStyle = '#9dffbf'; b.lineWidth = 1.5;
      b.beginPath(); b.moveTo(s.x, s.hiW); b.lineTo(s.x, s.loW); b.stroke();
      b.globalAlpha = a;
      b.shadowColor = '#2bff74'; b.shadowBlur = 16 + s.flash * 30;
      b.fillStyle = s.flash > 0.3 ? '#d8ffe6' : '#2bff74';
      b.fillRect(s.x - bw / 2, s.close, bw, Math.max(4, s.open - s.close));
      b.shadowBlur = 0;
      if (i > 0 && this.slots[i - 1].filled) {
        b.globalAlpha = a * 0.25; b.strokeStyle = '#2bff74'; b.lineWidth = 1;
        b.setLineDash([3, 5]); b.beginPath(); b.moveTo(this.slots[i - 1].x, this.slots[i - 1].close); b.lineTo(s.x, s.close); b.stroke(); b.setLineDash([]);
      }
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
    if (allFilled && this.slots.length && !this.resetting) { this.resetting = 3.2; this.onComplete && this.onComplete(); }
    if (this.resetting) {
      this.resetting -= dt;
      if (this.resetting < 1.2) this.chartFade = Math.max(0, this.resetting / 1.2);
      if (this.resetting <= 0) {
        this.resetting = 0; this.chartFade = 1;
        for (i = 0; i < this.slots.length; i++) {
          var sl = this.slots[i]; sl.filled = false; sl.claimed = false;
          for (var k = 0; k < 6; k++) this.sparks.push({ x: sl.x, y: (sl.open + sl.close) / 2, vx: rand(-80, 80), vy: rand(-120, 40), life: 0, ttl: rand(0.4, 0.9), s: rand(8, 16) });
        }
      }
    }
    // flying candles
    f.globalCompositeOperation = 'lighter';
    for (i = this.p.length - 1; i >= 0; i--) {
      var p = this.p[i]; p.life += dt;
      if (p.tr) {
        var stp = 2600 * dt; p.left -= stp; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.left <= 0) {
          this.p.splice(i, 1);
          for (var q2 = 0; q2 < 16; q2++) { var a2 = rand(0, TAU), v2 = rand(80, 420); this.sparks.push({ x: p.tx, y: p.ty, vx: Math.cos(a2) * v2, vy: Math.sin(a2) * v2, life: 0, ttl: rand(0.2, 0.55), s: rand(8, 18) }); }
          this.onImpact && this.onImpact(p.tx, p.ty);
          continue;
        }
        f.globalAlpha = 1; f.save(); f.translate(p.x, p.y); f.rotate(p.rot); f.scale(p.sc, p.sc * 1.6); f.drawImage(SPRITE, -24, -64); f.restore();
        continue;
      }
      if (p.slot >= 0 && p.life > 0.38) {
        var tgt = this.slots[p.slot], ty = (tgt.open + tgt.close) / 2;
        var k2 = Math.min(1, dt * 7);
        p.x += (tgt.x - p.x) * k2; p.y += (ty - p.y) * k2;
        p.rot += (0 - p.rot) * k2; p.sc += ((tgt.open - tgt.close) / 68 - p.sc) * k2 * 0.6;
        if (Math.abs(tgt.x - p.x) < 2 && Math.abs(ty - p.y) < 2) {
          tgt.filled = true; tgt.claimed = false; tgt.flash = 1; this.p.splice(i, 1);
          for (var m = 0; m < 6; m++) this.sparks.push({ x: tgt.x, y: ty, vx: rand(-120, 120), vy: rand(-120, 120), life: 0, ttl: rand(0.25, 0.5), s: rand(6, 14) });
          continue;
        }
      } else {
        p.vx *= Math.pow(0.18, dt); p.vy *= Math.pow(0.18, dt); p.vy += 30 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt * 0.3;
      }
      var al = p.slot >= 0 ? 1 : 1 - smooth(p.ttl * 0.55, p.ttl, p.life);
      if (p.life > p.ttl && p.slot < 0) { this.p.splice(i, 1); continue; }
      if (p.slot < 0 && p.life > 0.25) { p.vy -= 60 * dt; }
      f.globalAlpha = al; f.save(); f.translate(p.x, p.y); f.rotate(p.rot); f.scale(p.sc, p.sc);
      f.drawImage(SPRITE, -24, -64); f.restore();
    }
    for (i = this.sparks.length - 1; i >= 0; i--) {
      var sp = this.sparks[i]; sp.life += dt; if (sp.life > sp.ttl) { this.sparks.splice(i, 1); continue; }
      sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vx *= 0.94; sp.vy *= 0.94;
      f.globalAlpha = 1 - sp.life / sp.ttl; var z = sp.s * (1 - sp.life / sp.ttl * 0.5);
      f.drawImage(SPARK, sp.x - z / 2, sp.y - z / 2, z, z);
    }
    f.globalAlpha = 1; f.globalCompositeOperation = 'source-over';
    for (i = this.shells.length - 1; i >= 0; i--) {
      var sh = this.shells[i]; sh.vy += 1400 * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.r += sh.vr * dt;
      if (sh.y > sh.ground) { sh.y = sh.ground; sh.vy *= -0.35; sh.vx *= 0.6; sh.vr *= 0.5; sh.b++; }
      if (sh.b > (sh.big ? 1 : 3)) { sh.life = (sh.life || 0) + dt; if (sh.life > 1.2) { this.shells.splice(i, 1); continue; } }
      f.save(); f.translate(sh.x, sh.y); f.rotate(sh.r);
      if (sh.big) { f.fillStyle = '#1d1e22'; f.fillRect(-4, -11, 8, 22); f.fillStyle = '#ff6a1f'; f.fillRect(-4, -9, 8, 1.6); }
      else { f.fillStyle = '#d9a441'; f.fillRect(-1.6, -4, 3.2, 8); }
      f.restore();
    }
  };
  CandleFX.prototype.filledCount = function () { var n = 0; for (var i = 0; i < this.slots.length; i++) if (this.slots[i].filled) n++; return n; };

  /* ───────────────────────── Tween helper ───────────────────────── */
  function Tweens() { this.list = []; }
  Tweens.prototype.to = function (obj, key, to, dur, ease, delay, done) {
    this.list = this.list.filter(function (t) { return !(t.obj === obj && t.key === key); });
    this.list.push({ obj: obj, key: key, from: null, to: to, dur: dur, ease: ease || easeIO, t: -(delay || 0), done: done });
  };
  Tweens.prototype.update = function (dt) {
    for (var i = this.list.length - 1; i >= 0; i--) {
      var t = this.list[i]; t.t += dt;
      if (t.t < 0) continue;
      if (t.from === null) t.from = t.obj[t.key];
      var p = clamp(t.t / t.dur, 0, 1);
      t.obj[t.key] = lerp(t.from, t.to, t.ease(p));
      if (p >= 1) { this.list.splice(i, 1); if (t.done) t.done(); }
    }
  };

  /* ───────────────────────── Engine ───────────────────────── */
  function Engine(root) {
    this.root = root;
    this.cleanup = [];
    this.reduced = false;
    try { this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    this.fine = true;
    try { this.fine = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
    this.sfx = new Sfx();
    buildDefs();
    this.setupGlobalFX();
    this.setupHero();
    this.setupNav();
    this.setupMenu();
    this.setupSell();
    this.setupRank();
    this.setupReveal();
    this.setupVaultScrub();
    this.setupFees();
    this.setupReinvest();
    this.setupCrates();
    this.setupInterstitial();
    this.setupOath();
    this.setupDossier();
    this.setupFinale();
    this.setupIntro();
    this.setupScroll();
    var self = this;
    this.last = now();
    this.raf = requestAnimationFrame(function loop() { self.frame(); self.raf = requestAnimationFrame(loop); });
  }
  Engine.prototype.after = function (sec, fn, tag) {
    (this.sched = this.sched || []).push({ t: sec, fn: fn, tag: tag });
  };
  Engine.prototype.cancel = function (tag) {
    this.sched = (this.sched || []).filter(function (x) { return x.tag !== tag; });
  };
  Engine.prototype.on = function (el, ev, fn, opt) {
    if (!el) return; el.addEventListener(ev, fn, opt); this.cleanup.push(function () { el.removeEventListener(ev, fn, opt); });
  };
  Engine.prototype.destroy = function () {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    qa(this.root, '.hodl-svg, .sub').forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    this.root.classList.remove('is-menu', 'is-alarm', 'is-lite', 'hodl-js');
    this.cleanup.forEach(function (f) { try { f(); } catch (e) {} });
    (this.observers || []).forEach(function (o) { o.disconnect(); });
  };
  Engine.prototype.observe = function (els, cb, opt) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { cb(e, true); }); return; }
    var o = new IntersectionObserver(function (ents) { ents.forEach(function (en) { cb(en.target, en.isIntersecting, en); }); }, opt || { threshold: 0.15 });
    els.forEach(function (e) { o.observe(e); });
    (this.observers = this.observers || []).push(o);
  };

  /* global FX canvas for CTA bursts */
  Engine.prototype.setupGlobalFX = function () {
    var c = q(this.root, '[data-k="gfx"]'); if (!c) return;
    this.gfx = new CandleFX(c, document.createElement('canvas'));
    this.gfx.slots = []; this.gfx.buildSlots = function () { this.slots = []; };
    var self = this;
    var rs = function () { self.gfx.resize(window.innerWidth, window.innerHeight, window.innerWidth < 700); self.gfx.rain = []; };
    rs(); this.on(window, 'resize', rs);
    qa(this.root, '[data-burst]').forEach(function (b) {
      var fire = function () {
        if (self.reduced) return;
        var r = b.getBoundingClientRect();
        self.gfx.burst(r.left + r.width / 2, r.top + 4, 10);
        self.gfxAwake = 1.6;
        if (self.salute) self.salute();
      };
      self.on(b, 'pointerenter', fire);
      self.on(b, 'focus', fire);
    });
  };

  /* hero */
  Engine.prototype.setupHero = function () {
    var root = this.root, self = this;
    var hero = this.hero = q(root, '[data-hero]');
    if (!hero) return;
    var M = {};
    qa(hero, '[data-k]').forEach(function (e) { M[e.getAttribute('data-k')] = e; });
    this.svgs = [];
    var mk = function (mount, html) { var s = svgRoot(mount, 'hodl-svg'); s.innerHTML = html; self.svgs.push(s); return s; };
    mk(M.skyBase, skyMarkup());
    this.cloudSvg = svgRoot(M.cloudL, 'hodl-svg'); this.cloudSvg.innerHTML = cloudsMarkup();
    this.boltSvg = mk(M.boltL, '<path data-k="bolt" d="" stroke="#e8eeff" stroke-width="3" fill="none" opacity="0" filter="url(#hf-glow-s)"/>');
    mk(M.wStatic, '<rect x="-2000" y="' + GY + '" width="6400" height="2600" fill="url(#hg-ground)"/>' +
      fenceMarkup(-600, BX - 430) + fenceMarkup(BX + 430, 3000) + bunkerMarkup() + bunkerMidMarkup() + bunkerLowerMarkup());
    mk(M.signL, signMarkup());
    mk(M.wDyn, camerasMarkup() + interiorMarkup());
    // each moving actor gets its own small layer so a frame only repaints around it
    this.subs = [];
    var sub = function (box) {
      var d = document.createElement('div'); d.className = 'sub';
      M.world.insertBefore(d, M.front);
      var sg = svgRoot(d, 'hodl-svg'); sg.setAttribute('preserveAspectRatio', 'none');
      sg.setAttribute('viewBox', box.join(' '));
      self.subs.push({ d: d, box: box });
      return sg;
    };
    var doorSvg = sub([BX - 230, DOOR_CY - 230, 460 + DOOR_R * 2.3, 460]);
    var sq0 = sub([BX - 480 - 200, GY - 520, 400, 560]);
    var sq1 = sub([BX + 660 - 200, GY - 520, 400, 560]);
    var heroSvg = sub([BX - 290 - 330, GY - 820, 660, 860]);
    var K = this.hk = {};
    qa(hero, '[data-k]').forEach(function (e) { K[e.getAttribute('data-k')] = e; });
    K.doorG = doorSvg; K.sq0 = sq0; K.sq1 = sq1; K.hero = heroSvg;
    this.door = new Door(K.doorG, BX, DOOR_CY, DOOR_R);
    this.door.open = 1; this.door.lock = 0; this.door.apply();
    this.squad = [
      new Soldier(K.sq0, { x: BX - 480, y: GY - 8, s: 0.62, filter: 'url(#hf-rim-soft)', tint: '.9' }),
      new Soldier(K.sq1, { x: BX + 660, y: GY - 8, s: 0.62, flip: true, filter: 'url(#hf-rim-soft)', tint: '.9' })
    ];
    this.soldier = new Soldier(K.hero, { x: BX - 290, y: GY + 4, s: 1.02 });
    this.fx = new CandleFX(K.front, K.back);
    this.tw = new Tweens();
    this.nextVolley = this.reduced ? 1e9 : 2.4;
    this.busy = false; this.menuOpen = false;
    this.mouse = { x: 0.5, y: 0.5, sx: -1, sy: -1, inHero: false };
    this.camAng = [0, 0];
    this.nextBolt = rand(6, 12); this.boltT = 0;
    this.heroVisible = true;
    this.fx.onComplete = function () { self.celebrate(); };
    this.fx.onImpact = function (x, y) { self.shake = Math.max(self.shake || 0, 1.4); };
    this.soldier.onMagDrop = function (w) { var sp = self.toScreen(w.x, w.y); self.fx.mag(sp.x, sp.y); self.sfx.tick(); };
    this.doorTarget = true; this.intrudeT = 0; this.nextRadio = rand(9, 14);
    this.layoutHero();
    this.on(window, 'resize', function () { self.layoutHero(); });
    this.on(hero, 'pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      self.mouse.x = (e.clientX - r.left) / r.width; self.mouse.y = (e.clientY - r.top) / r.height;
      self.mouse.sx = e.clientX - r.left; self.mouse.sy = e.clientY - r.top; self.mouse.inHero = true;
      var interactive = e.target.closest && e.target.closest('a,button,input,[data-noret]');
      if (K.reticle) {
        K.reticle.style.opacity = interactive || !self.fine ? '0' : '1';
        K.reticle.style.transform = 'translate3d(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px,0)';
      }
    });
    this.on(hero, 'pointerleave', function () { self.mouse.inHero = false; if (K.reticle) K.reticle.style.opacity = '0'; });
    this.on(hero, 'click', function (e) {
      if (e.target.closest && e.target.closest('a,button,input,[data-noret]')) return;
      var r = hero.getBoundingClientRect();
      var w = self.toWorld(e.clientX - r.left, e.clientY - r.top);
      if (self.nearVault(w, 0)) self.intrude(w, e.clientX - r.left, e.clientY - r.top);
      else self.volley(w.x, w.y, 4, true);
      if (K.hint) K.hint.style.opacity = '0';
      if (K.reticle) { K.reticle.classList.remove('is-fire'); void K.reticle.offsetWidth; K.reticle.classList.add('is-fire'); }
    });
    this.observe([hero], function (el, vis) { self.heroVisible = vis; }, { threshold: 0 });
    var fl = function () { self.layoutSign(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fl);
    setTimeout(fl, 600);
  };
  Engine.prototype.layoutSign = function () {
    var K = this.hk; if (!K || !K.sH || !K.sH.getComputedTextLength) return;
    try {
      var hw = K.sH.getComputedTextLength(), dw = K.sDL.getComputedTextLength();
      if (!hw || !dw) return;
      var gap = 14, logoW = 2 * 62 * 0.95, total = hw + gap + logoW + gap + dw, x0 = BX - total / 2;
      K.sH.setAttribute('x', x0.toFixed(1));
      K.sLogo.setAttribute('transform', 'translate(' + (x0 + hw + gap + logoW / 2).toFixed(1) + ',262) scale(62)');
      K.sDL.setAttribute('x', (x0 + hw + gap + logoW + gap).toFixed(1));
    } catch (e) {}
  };
  Engine.prototype.layoutHero = function () {
    var hero = this.hero; if (!hero) return;
    var w = hero.clientWidth, h = hero.clientHeight, a = w / h, W, H, x0, y0;
    var mobile = a < 1.05;
    if (!mobile) {
      H = a > 2 ? 900 : a > 1.5 ? 1040 : 1120; W = H * a;
      var fx = a > 1.45 ? 0.63 : 0.6; x0 = 1380 - fx * W; y0 = GY - 0.86 * H;
    } else {
      W = clamp(900 + (a - 0.46) * 700, 900, 1250); H = W / a;
      x0 = 1370 - 0.5 * W; y0 = GY - Math.min(0.72, 0.5 + (a - 0.46) * 0.3) * H;
    }
    this.vb = { x: x0, y: y0, w: W, h: H, s: h / H, mobile: mobile };
    var vbs = x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + W.toFixed(1) + ' ' + H.toFixed(1);
    this.svgs.forEach(function (sg) { sg.setAttribute('viewBox', vbs); sg.setAttribute('preserveAspectRatio', 'none'); });
    this.cloudSvg.setAttribute('viewBox', x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + (W * 1.5).toFixed(1) + ' ' + H.toFixed(1));
    this.cloudSvg.setAttribute('preserveAspectRatio', 'none');
    var s = h / H, K = this.hk;
    this.subs.forEach(function (u) {
      var b = u.box;
      u.d.style.left = ((b[0] - x0) * s).toFixed(1) + 'px'; u.d.style.top = ((b[1] - y0) * s).toFixed(1) + 'px';
      u.d.style.width = (b[2] * s).toFixed(1) + 'px'; u.d.style.height = (b[3] * s).toFixed(1) + 'px';
    });
    [[K.beam0, 564, 476], [K.beam1, 2006, 426]].forEach(function (b) {
      b[0].style.left = ((b[1] - x0) * s).toFixed(1) + 'px'; b[0].style.top = ((b[2] - y0) * s).toFixed(1) + 'px';
      b[0].style.setProperty('--bw', (260 * s).toFixed(0) + 'px'); b[0].style.setProperty('--bh', (1500 * s).toFixed(0) + 'px');
    });
    this.fx.resize(w, h, mobile);
    this.fx.groundY = (GY - y0) * this.vb.s + 2;
  };
  Engine.prototype.toScreen = function (wx, wy) { var v = this.vb; return { x: (wx - v.x) * v.s, y: (wy - v.y) * v.s }; };
  Engine.prototype.toWorld = function (sx, sy) { var v = this.vb; return { x: v.x + sx / v.s, y: v.y + sy / v.s }; };
  Engine.prototype.status = function (txt) {
    var el = this.hk && this.hk.status; if (!el) return;
    el.textContent = txt;
  };

  Engine.prototype.nearVault = function (w, pad) {
    var D = this.door, dx0 = w.x - BX, dy0 = w.y - DOOR_CY;
    var cx = BX + easeIO(clamp(D.open, 0, 1)) * D.r * D.travel, dx1 = w.x - cx;
    var R = DOOR_R + 26 + (pad || 0);
    return dx0 * dx0 + dy0 * dy0 < R * R || dx1 * dx1 + dy0 * dy0 < (DOOR_R + (pad || 0)) * (DOOR_R + (pad || 0));
  };
  /* the vault: open only while nobody threatens it, the menu is closed and the visitor is at the top */
  Engine.prototype.setDoor = function (open, fast) {
    if (this.doorTarget === open) return;
    this.doorTarget = open;
    var D = this.door, tw = this.tw, self = this;
    if (!open) {
      tw.to(D, 'lock', 0, 0.1);
      this.sfx.whir(fast ? 0.3 : 0.55);
      tw.to(D, 'open', 0, fast ? 0.34 : 0.62, fast ? easeOut : easeIO, 0.02, function () {
        if (self.doorTarget !== false) return;
        tw.to(D, 'wheelAng', D.wheelAng + 180, 0.5, easeOut);
        tw.to(D, 'lock', 1, 0.16, easeBack, 0.06, function () { self.shake = Math.max(self.shake || 0, fast ? 3 : 2); self.sfx.clunk(); });
      });
    } else {
      tw.to(D, 'wheelAng', D.wheelAng - 180, 0.4, easeIO);
      tw.to(D, 'lock', 0, 0.18, easeIO, 0.25);
      tw.to(D, 'open', 1, 0.8, easeIO, 0.45);
      this.after(0.45, function () { self.sfx.whir(0.7); });
    }
  };
  Engine.prototype.intrude = function (w, sx, sy) {
    var self = this, S = this.soldier, K = this.hk;
    if (this.menuOpen) return;
    this.cancel('volley'); this.cancel('intr');
    this.volleyActive = false; this.busy = true;
    this.tw.to(S, 'victory', 0, 0.2); this.tw.to(S, 'radio', 0, 0.15); this.tw.to(S, 'reload', 0, 0.01);
    this.intrudeT = 4.2;
    S.lockLook = true; S.guard = 1; S.lookTarget = 1;
    S.aimAngle = S.angleTo(w.x, w.y, true);
    this.tw.to(S, 'aim', 1, S.aim > 0.5 ? 0.06 : 0.22, easeOut);
    this.status('INTRUDER · HANDS OFF THE VAULT');
    this.root.classList.add('is-alarm');
    var warn = K.warn;
    if (warn) {
      warn.style.transform = 'translate3d(' + sx + 'px,' + sy + 'px,0)';
      warn.classList.toggle('is-left', sx > this.hero.clientWidth - 240);
      warn.classList.remove('is-on'); void warn.offsetWidth; warn.classList.add('is-on');
    }
    var t0 = S.aim > 0.5 ? 0.08 : 0.26;
    for (var i = 0; i < 3; i++) this.after(t0 + i * 0.11, function () {
      var off = { x: rand(-26, 26), y: rand(-20, 20) };
      self.shoot(false, { x: sx + off.x, y: sy + off.y });
    }, 'intr');
    this.after(t0 + 0.12, function () { self.setDoor(false, true); }, 'intr');
    this.after(t0 + 1.1, function () {
      self.tw.to(S, 'aim', 0, 0.5, easeIO, 0, function () { S.guard = 0; self.reloadAfter(); });
      self.status('VAULT SEALED · STAND DOWN');
    }, 'intr');
    this.after(3.2, function () { self.root.classList.remove('is-alarm'); }, 'intr');
  };
  Engine.prototype.reloadAfter = function () {
    var self = this, S = this.soldier;
    S.reload = 0;
    this.tw.to(S, 'reload', 1, 1.15, function (x) { return x; }, 0.05, function () { S.reload = 0; self.busy = false; S.lockLook = false; });
  };
  Engine.prototype.celebrate = function () {
    var self = this, S = this.soldier, tw = this.tw;
    this.status('CHART COMPLETE · CONVICTION MAX');
    if (this.menuOpen || this.intrudeT > 0) return;
    this.cancel('volley'); this.cancel('cel');
    this.busy = true; this.volleyActive = false; S.lockLook = true; S.lookTarget = 0;
    tw.to(S, 'aim', 0, 0.3); tw.to(S, 'radio', 0, 0.2);
    tw.to(S, 'victory', 1, 0.55, easeBack, 0.1);
    this.squad.forEach(function (g) { tw.to(g, 'lookUp', 1, 0.5); });
    [0.55, 1.15].forEach(function (d) {
      self.after(d, function () { S.hop = 0; tw.to(S, 'hop', 1, 0.42, function (x) { return x; }); }, 'cel');
    });
    [0.7, 1.1, 1.5].forEach(function (d) {
      self.after(d, function () { var p = self.toScreen(S.x - 10, S.y - 470); self.fx.burst(p.x, p.y, 12); self.sfx.chime && d === 0.7 && self.sfx.chime(); }, 'cel');
    });
    var b = this.hk.victory;
    if (b) { b.classList.remove('is-on'); void b.offsetWidth; b.classList.add('is-on'); }
    this.after(2.6, function () {
      tw.to(S, 'victory', 0, 0.5, easeIO, 0, function () { S.hop = 0; self.reloadAfter(); });
      self.squad.forEach(function (g) { tw.to(g, 'lookUp', 0, 0.5); });
      self.status('ON WATCH · VAULT OPEN');
    }, 'cel');
  };
  Engine.prototype.salute = function () {
    var S = this.soldier, self = this;
    if (!S || this.busy || this.menuOpen || !this.heroVisible) return;
    this.cancel('sal');
    this.tw.to(S, 'salute', 1, 0.35, easeOut);
    this.after(1.3, function () { self.tw.to(S, 'salute', 0, 0.4); }, 'sal');
  };
  Engine.prototype.volley = function (tx, ty, shots, toChart) {
    var self = this, S = this.soldier;
    if (!S || this.menuOpen) return;
    if (this.busy && !this.volleyActive) return;
    if (tx === undefined) {
      var next = null;
      for (var i0 = 0; i0 < this.fx.slots.length; i0++) if (!this.fx.slots[i0].filled && !this.fx.slots[i0].claimed) { next = this.fx.slots[i0]; break; }
      if (next) { var tw0 = this.toWorld(next.x, (next.open + next.close) / 2); tx = tw0.x; ty = tw0.y; }
      else { tx = S.x + rand(-60, 160); ty = S.y - 900; }
    }
    S.lockLook = true; S.lookTarget = clamp((tx - S.x) / 600, -1, 1) * 0.6;
    S.aimAngle = S.angleTo(tx, ty);
    this.tw.to(S, 'radio', 0, 0.15); this.tw.to(S, 'salute', 0, 0.15); this.tw.to(S, 'reload', 0, 0.01); this.cancel('sal');
    this.volleyActive = true; this.busy = true;
    this.status('VOLLEY · BUYING CONVICTION');
    var raiseDur = S.aim > 0.8 ? 0.08 : 0.42;
    this.tw.to(S, 'aim', 1, raiseDur, easeOut);
    this.cancel('volley');
    for (var i = 0; i < shots; i++) this.after(raiseDur + 0.06 + i * 0.12, function () { self.shoot(toChart); }, 'volley');
    this.after(raiseDur + 0.06 + shots * 0.12 + 0.6, function () {
      self.tw.to(S, 'aim', 0, 0.6, easeIO, 0, function () { self.reloadAfter(); });
      self.volleyActive = false;
      self.status(self.menuOpen ? 'VAULT SEALED' : 'ON WATCH · VAULT OPEN');
    }, 'volley');
  };
  Engine.prototype.shoot = function (toChart, at) {
    var S = this.soldier; if (!S) return;
    S.flash = 1.2; S.flashRot = rand(-12, 12); S.recoil = 7;
    var m = S.muzzle(), sc = this.toScreen(m.x, m.y);
    if (at) this.fx.tracer(sc.x, sc.y, at.x, at.y);
    else this.fx.fire(sc.x, sc.y, m.dx, m.dy, 3, toChart !== false);
    var ej = this.toScreen(S.x - 20, S.y - 300);
    this.fx.shell(ej.x, ej.y, -1);
    this.shake = 1;
    this.sfx.shot();
  };

  Engine.prototype.frame = function () {
    var t = now(), dt = Math.min(0.1, (t - this.last) / 1000); this.last = t;
    var ts = t / 1000;
    if (this.sched && this.sched.length) {
      var due = [];
      for (var i = this.sched.length - 1; i >= 0; i--) { this.sched[i].t -= dt; if (this.sched[i].t <= 0) due.push(this.sched.splice(i, 1)[0]); }
      due.reverse().forEach(function (x) { x.fn(); });
    }
    if (this.tw) this.tw.update(dt);
    // adaptive quality: if the device can't keep up, drop the expensive extras
    this._age = (this._age || 0) + dt;
    if (!this.liteChecked && this._age > 1.5 && this.heroVisible) {
      this._fpsN = (this._fpsN || 0) + 1; this._fpsT = (this._fpsT || 0) + (t - (this._fpsLast || t)) / 1000; this._fpsLast = t;
      if (this._fpsT > 3) {
        this.liteChecked = true;
        if (this._fpsN / this._fpsT < 28) this.goLite();
      }
    }
    if (this.hero && this.heroVisible) this.heroFrame(ts, dt);
    if (this.gfx && (this.gfxAwake > 0 || this.gfx.p.length || this.gfx.sparks.length)) { this.gfxAwake -= dt; this.gfx.update(dt, true); }
    if (this.vaultFrame) this.vaultFrame(ts, dt);
    if (this.feeFrame) this.feeFrame(ts, dt);
    if (this.finaleFrame) this.finaleFrame(ts, dt);
    if (this.rankFrame) this.rankFrame(ts, dt);
  };
  Engine.prototype.heroFrame = function (t, dt) {
    var K = this.hk, S = this.soldier, self = this;
    // auto volleys
    if (!this.menuOpen && !this.busy) {
      this.nextVolley -= dt;
      if (this.nextVolley <= 0 && S.radio < 0.05) { this.volley(undefined, undefined, this.vb.mobile ? 4 : 5, true); this.nextVolley = rand(5.5, 8); }
    }
    if (this.hk.next) {
      var nv = Math.max(0, this.nextVolley);
      this.hk.next.textContent = this.menuOpen ? '--' : ('00:0' + Math.min(9, Math.ceil(nv)));
    }
    // the vault decides for itself
    if (this.intrudeT > 0) this.intrudeT -= dt;
    var hs = this.heroScroll || 0;
    var want = !this.menuOpen && this.intrudeT <= 0 && hs < (this.doorTarget ? 0.3 : 0.12);
    this.setDoor(want, !want && this.intrudeT > 0);
    // pointer near the vault: guard stance, rifle on the intruder
    var mw = this.mouse.inHero && this.fine ? this.toWorld(this.mouse.sx, this.mouse.sy) : null;
    var threat = mw && this.nearVault(mw, 40) && this.doorTarget;
    if (threat !== this._threat) { this._threat = threat; if (K.reticle) K.reticle.classList.toggle('is-threat', !!threat); if (!this.busy) this.status(threat ? 'STEP AWAY FROM THE VAULT' : 'ON WATCH · VAULT OPEN'); }
    if (!this.busy && !this.menuOpen) {
      if (threat) {
        S.guard = 1; S.lockLook = true; S.lookTarget = 1;
        var ga = S.angleTo(mw.x, mw.y, true); S.aimAngle += (ga - S.aimAngle) * Math.min(1, dt * 8);
        S.aim += (0.62 - S.aim) * Math.min(1, dt * 6);
        this.nextVolley = Math.max(this.nextVolley, 1.5);
      } else if (S.guard) {
        S.aim += (0 - S.aim) * Math.min(1, dt * 5);
        if (S.aim < 0.02) { S.aim = 0; S.guard = 0; S.lockLook = false; }
      }
      // idle radio check
      this.nextRadio -= dt;
      if (this.nextRadio <= 0 && !threat && S.aim < 0.02) {
        this.nextRadio = rand(11, 17);
        var self2 = this;
        this.tw.to(S, 'radio', 1, 0.45, easeIO);
        this.status('RADIO · VAULT SECURE');
        this.after(1.9, function () { self2.tw.to(S, 'radio', 0, 0.45); if (!self2.busy) self2.status('ON WATCH · VAULT OPEN'); }, 'radio');
        this.nextVolley = Math.max(this.nextVolley, 2.6);
      }
    }
    // cursor-follow glance
    if (this.mouse.inHero && !S.lockLook && S.aim < 0.05) {
      S.lookTarget = clamp((this.mouse.x - this.toScreen(S.x, 0).x / this.hero.clientWidth) * 2.2, -1, 1);
      S.nextIdleLook = 2;
    }
    S.update(t, dt);
    this._sqf = (this._sqf || 0) + 1;
    if (this._sqf % 2 === 0) for (var i = 0; i < this.squad.length; i++) this.squad[i].update(t, dt * 2);
    this.door.apply();
    // interior glow follows door
    var o = clamp(this.door.open, 0, 1);
    var io = (0.15 + o * 0.85).toFixed(2);
    if (io !== this._io) { this._io = io; K.interior.setAttribute('opacity', io); }
    // sign flicker
    if (!this.reduced) {
      var fl = (Math.sin(t * 37) > 0.97 || Math.random() < 0.004) ? 0.5 : 1;
      if (fl !== this._signO) { this._signO = fl; K.signL.style.opacity = fl; }
      // lightning
      this.nextBolt -= dt;
      if (this.nextBolt <= 0) { this.lightning(); this.nextBolt = rand(9, 18); }
      if (this.boltT > 0) {
        this.boltT -= dt;
        var fo = this.boltT > 0.25 ? (Math.random() < 0.5 ? 0.22 : 0.08) : Math.max(0, this.boltT) * 0.6;
        K.flashsky.style.opacity = fo.toFixed(3); K.bolt.setAttribute('opacity', Math.min(1, this.boltT * 2.5).toFixed(2));
        if (this.boltT <= 0) { K.flashsky.style.opacity = '0'; K.bolt.setAttribute('opacity', '0'); }
      }
    }
    // cameras track cursor (or soldier's target)
    for (var c = 0; c < 2; c++) {
      var cam = K['cam' + c]; if (!cam) continue;
      var cx = BX + (c ? 236 : -236);
      var targ = this.mouse.inHero ? this.toWorld(this.mouse.sx, this.mouse.sy) : { x: S.x, y: S.y - 200 };
      var ang;
      if (c === 0) ang = -clamp(Math.atan2(targ.y - 360, cx - targ.x) / D2R, -40, 40); // lens faces -x
      else ang = clamp(Math.atan2(targ.y - 360, targ.x - cx) / D2R, -40, 40);          // lens faces +x
      this.camAng[c] += (ang - this.camAng[c]) * Math.min(1, dt * 4);
      cam.setAttribute('transform', 'rotate(' + this.camAng[c].toFixed(2) + ')');
      K['camled' + c].setAttribute('opacity', (Math.sin(t * 4 + c) > 0 ? 1 : 0.25));
    }
    // parallax
    var px = (this.mouse.x - 0.5), py = (this.mouse.y - 0.5);
    this.shake = (this.shake || 0) * Math.pow(0.002, dt);
    var shx = (Math.random() - 0.5) * this.shake * 4, shy = (Math.random() - 0.5) * this.shake * 4;
    if (!this.reduced) {
      K.sky.style.transform = 'translate3d(' + (-px * 10).toFixed(2) + 'px,' + (-py * 6 + this.heroScroll * 60).toFixed(2) + 'px,0) scale(1.04)';
      K.world.style.transform = 'translate3d(' + (-px * 18 + shx).toFixed(2) + 'px,' + (-py * 8 + shy + this.heroScroll * 20).toFixed(2) + 'px,0) scale(' + (1.02 + this.heroScroll * 0.06).toFixed(3) + ')';
    }
    this.fx.update(dt, this.reduced);
  };
  Engine.prototype.goLite = function () {
    this.lite = true;
    this.root.classList.add('is-lite');
    if (this.fx) this.fx.rain = [];
    if (this.soldier) this.soldier.g.setAttribute('filter', 'url(#hf-rim-soft)');
  };
  Engine.prototype.lightning = function () {
    var K = this.hk, x = rand(this.vb.x + 100, this.vb.x + this.vb.w - 100), y = this.vb.y + 40, d = 'M' + x.toFixed(0) + ' ' + y.toFixed(0);
    var cx = x, cy = y;
    for (var i = 0; i < 9; i++) { cx += rand(-40, 40); cy += rand(30, 60); d += ' L' + cx.toFixed(0) + ' ' + cy.toFixed(0); }
    K.bolt.setAttribute('d', d); this.boltT = 0.6;
    this.sfx.thunder();
  };

  /* nav: sound toggle, menu button */
  Engine.prototype.setupNav = function () {
    var self = this, snd = q(this.root, '[data-k="sound"]');
    if (snd) this.on(snd, 'click', function () {
      self.sfx.on = !self.sfx.on;
      if (self.sfx.on) { self.sfx.ensure(); self.sfx.tick(); }
      snd.setAttribute('aria-pressed', self.sfx.on ? 'true' : 'false');
      snd.querySelector('[data-k="soundlbl"]').textContent = self.sfx.on ? 'SOUND ON' : 'SOUND OFF';
    });
    var nav = q(this.root, '[data-k="nav"]');
    this.navEl = nav;
  };

  /* menu: soldier seals the vault, checks both flanks */
  Engine.prototype.setupMenu = function () {
    var self = this, btn = q(this.root, '[data-k="menubtn"]'), panel = q(this.root, '[data-k="menu"]');
    if (!btn || !panel) return;
    this.menuBtn = btn; this.menuPanel = panel;
    this.on(btn, 'click', function () { self.menuOpen ? self.closeMenu() : self.openMenu(); });
    qa(this.root, '[data-close]').forEach(function (c) { self.on(c, 'click', function () { self.closeMenu(); }); });
    qa(panel, 'a').forEach(function (a) { self.on(a, 'click', function () { self.closeMenu(true); }); });
    this.on(document, 'keydown', function (e) { if (e.key === 'Escape' && self.menuOpen) self.closeMenu(); });
  };
  Engine.prototype.openMenu = function () {
    var self = this, S = this.soldier;
    this.menuOpen = true;
    this.root.classList.add('is-menu');
    this.menuBtn.setAttribute('aria-expanded', 'true');
    this.menuPanel.setAttribute('aria-hidden', 'false');
    this.status('SEALING VAULT');
    this.cancel('volley'); this.cancel('look'); this.cancel('cel'); this.cancel('intr');
    this.volleyActive = false; this.busy = true;
    if (S) {
      this.tw.to(S, 'aim', 0, 0.3); this.tw.to(S, 'victory', 0, 0.3); this.tw.to(S, 'radio', 0, 0.2); this.tw.to(S, 'reload', 0, 0.01);
      S.guard = 0; S.lockLook = true; S.lookTarget = 1;
      // the door logic seals the vault (menuOpen); the guard then checks both flanks
      var seq = [[0.75, -1], [1.25, -1], [1.6, 0.9], [2.15, 0]];
      seq.forEach(function (st) { self.after(st[0], function () { if (self.menuOpen) S.lookTarget = st[1]; }, 'look'); });
      this.after(2.2, function () { if (self.menuOpen) self.status('ALL CLEAR · VAULT SEALED'); }, 'look');
    }
    this.after(0.42, function () {
      var first = self.menuPanel.querySelector('a'); if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
    });
  };
  Engine.prototype.closeMenu = function (viaLink) {
    var self = this, S = this.soldier;
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.root.classList.remove('is-menu');
    this.menuBtn.setAttribute('aria-expanded', 'false');
    this.menuPanel.setAttribute('aria-hidden', 'true');
    if (!viaLink) try { this.menuBtn.focus({ preventScroll: true }); } catch (e) {}
    this.cancel('look');
    if (S) { S.lockLook = false; S.lookTarget = 0; }
    this.after(1.2, function () { self.busy = false; self.nextVolley = Math.max(self.nextVolley, 1.2); self.status('ON WATCH · VAULT OPEN'); });
  };

  /* SELL button dodges */
  Engine.prototype.setupSell = function () {
    var self = this, b = q(this.root, '[data-k="sell"]'), deny = q(this.root, '[data-k="deny"]');
    if (!b) return;
    var off = { x: 0, y: 0 };
    if (this.fine && !this.reduced) {
      this.on(document, 'pointermove', function (e) {
        var r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - off.x, cy = r.top + r.height / 2 - off.y;
        var dx = e.clientX - (cx + off.x), dy = e.clientY - (cy + off.y), d = Math.sqrt(dx * dx + dy * dy);
        if (d < 70) {
          var nx = off.x - dx / d * 46, ny = off.y - dy / d * 18;
          if (Math.abs(nx) > 140) nx = -Math.sign(nx) * 40;
          off.x = clamp(nx, -150, 150); off.y = clamp(ny, -10, 26);
          b.style.transform = 'translate(' + off.x.toFixed(0) + 'px,' + off.y.toFixed(0) + 'px) rotate(' + (off.x * 0.06).toFixed(1) + 'deg)';
          b.classList.add('is-run');
          clearTimeout(self._sellBack);
          self._sellBack = setTimeout(function () { off.x = 0; off.y = 0; b.style.transform = ''; b.classList.remove('is-run'); }, 1600);
        }
      });
    }
    this.on(b, 'click', function () {
      self.sfx.stamp();
      if (deny) {
        deny.classList.remove('is-on'); void deny.offsetWidth; deny.classList.add('is-on');
        clearTimeout(self._denyT); self._denyT = setTimeout(function () { deny.classList.remove('is-on'); }, 2300);
      }
      if (self.hero && self.hero.getBoundingClientRect().bottom > 100) {
        var S = self.soldier; self.busy = false; self.volley(S.x + 260, S.y - 700, 6, true);
      }
      self.shake = 2.5;
    });
  };

  /* Rank / time on duty */
  var RANKS = [[0, 'RECRUIT'], [20, 'PRIVATE'], [60, 'CORPORAL'], [150, 'SERGEANT'], [300, 'LIEUTENANT'], [600, 'CAPTAIN'], [1200, 'MAJOR'], [2400, 'COLONEL'], [3600, 'GENERAL']];
  Engine.prototype.setupRank = function () {
    var self = this, hud = q(this.root, '[data-k="rank"]'); if (!hud) return;
    var lbl = q(hud, '[data-k="rankname"]'), tm = q(hud, '[data-k="ranktime"]'), bar = q(hud, '[data-k="rankbar"]'), toast = q(this.root, '[data-k="promo"]');
    var secs = parseFloat(store('hodl-duty') || '0') || 0, lastSave = 0, rankIdx = -1, visible = true;
    this.on(document, 'visibilitychange', function () { visible = !document.hidden; });
    function idxFor(s) { var i = 0; for (var k = 0; k < RANKS.length; k++) if (s >= RANKS[k][0]) i = k; return i; }
    rankIdx = idxFor(secs);
    this.rankFrame = function (t, dt) {
      if (!visible) return;
      secs += dt;
      var i = idxFor(secs);
      if (i !== rankIdx) {
        rankIdx = i; self.sfx.chime();
        if (toast) {
          q(toast, '[data-k="promoname"]').textContent = RANKS[i][1];
          toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on');
          clearTimeout(self._promoT); self._promoT = setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
        }
      }
      var m = Math.floor(secs / 60), s = Math.floor(secs % 60);
      var txt = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if (tm.textContent !== txt) {
        tm.textContent = txt; lbl.textContent = RANKS[i][1];
        var nxt = RANKS[i + 1], p = nxt ? (secs - RANKS[i][0]) / (nxt[0] - RANKS[i][0]) : 1;
        bar.style.transform = 'scaleX(' + clamp(p, 0, 1).toFixed(3) + ')';
      }
      if (t - lastSave > 5) { lastSave = t; store('hodl-duty', String(secs.toFixed(1))); }
    };
  };

  Engine.prototype.setupReveal = function () {
    var els = qa(this.root, '[data-reveal]');
    if (this.reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var self = this;
    this.observe(els, function (el, vis) {
      if (vis) { var d = +(el.getAttribute('data-reveal-delay') || 0); setTimeout(function () { el.classList.add('is-in'); }, d); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  };

  /* 01 · Vault scroll-scrub */
  Engine.prototype.setupVaultScrub = function () {
    var self = this, track = q(this.root, '[data-k="vtrack"]'), mount = q(this.root, '[data-k="vstage"]');
    if (!track || !mount) return;
    var svg = svgRoot(mount, 'hodl-svg'); svg.setAttribute('viewBox', '-380 -290 760 640');
    var R = 200;
    var coins = '';
    for (var i = 0; i < 16; i++) coins += '<g data-coin><circle r="22" fill="#ffb347" stroke="#c2410c" stroke-width="3"/><circle r="15" fill="none" stroke="#c2410c" stroke-width="1.5"/>' + logoMarkup(0, 0, 10, '#c2410c', '#c2410c') + '</g>';
    svg.innerHTML = '' +
      '<circle r="' + (R + 70) + '" fill="url(#hg-pool)" opacity=".5"/>' +
      '<rect x="-370" y="300" width="740" height="10" rx="5" fill="#1c1c1f"/>' +
      '<path d="M-370 305 H370" stroke="' + OR + '" stroke-width="1.5" stroke-dasharray="8 10" opacity=".5"/>' +
      '<text x="-366" y="338" font-family="Space Mono, monospace" font-size="13" letter-spacing="3" fill="#8C8882">BUYBACK INTAKE →</text>' +
      '<circle r="' + (R + 26) + '" fill="#141416" stroke="#2c2d32" stroke-width="18"/>' +
      '<g data-k="vin"><circle r="' + (R - 2) + '" fill="url(#hg-vaultglow)"/></g>' +
      '<g data-k="vcoins">' + coins + '</g>' +
      '<g data-k="vdoor"></g>' +
      '<g data-k="vstamp" opacity="0" transform="rotate(-12)"><rect x="-150" y="-44" width="300" height="88" rx="8" fill="none" stroke="' + OR + '" stroke-width="6"/>' +
      '<text y="16" text-anchor="middle" font-family="Archivo, Impact, sans-serif" font-weight="900" font-size="54" letter-spacing="4" fill="' + OR + '">SEALED</text></g>';
    var door = new Door(q(svg, '[data-k="vdoor"]'), 0, 0, R); door.travel = 3.1;
    var coinEls = qa(svg, '[data-coin]'), stamp = q(svg, '[data-k="vstamp"]');
    var steps = qa(this.root, '[data-vstep]'), readDoor = q(this.root, '[data-k="vdoorstate"]'), readCount = q(this.root, '[data-k="vcount"]');
    var seeds = coinEls.map(function (_, i) { return { a: rand(0, TAU), r: rand(20, 130), d: i / coinEls.length }; });
    var visible = false, lastP = -1, lastStep = -1, stamped = false;
    this.observe([track], function (el, v) { visible = v; }, { threshold: 0 });
    this.vaultFrame = function () {
      if (!visible) return;
      var r = track.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      if (Math.abs(p - lastP) < 0.0005) return; lastP = p;
      // door: open during 0..0.62, closes 0.62..0.85, locks 0.85..0.95
      door.open = 1 - smooth(0.6, 0.84, p);
      door.lock = smooth(0.86, 0.94, p);
      door.wheelAng = smooth(0.84, 1, p) * 270;
      door.apply();
      var inside = 0;
      coinEls.forEach(function (c, i) {
        var sd = seeds[i];
        var appear = smooth(0.02 + sd.d * 0.22, 0.08 + sd.d * 0.22, p);
        var fly = smooth(0.3 + sd.d * 0.24, 0.44 + sd.d * 0.24, p);
        // ride a conveyor along the bottom, then queue under the vault
        var hx = -330 + i * 44, hy = 276;
        var x = lerp(-460, hx, appear), y = hy;
        var tx = Math.cos(sd.a) * sd.r * 0.6, ty = Math.sin(sd.a) * sd.r * 0.4 + 40;
        var arcH = -220 * Math.sin(fly * Math.PI);
        x = lerp(x, tx, fly); y = lerp(y, ty, fly) + arcH * (fly > 0 && fly < 1 ? 1 : 0);
        var sc = lerp(1, 0.55, fly) * appear;
        c.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') scale(' + sc.toFixed(3) + ') rotate(' + (fly * 360).toFixed(0) + ')');
        c.setAttribute('opacity', appear.toFixed(2));
        if (fly >= 1) inside++;
      });
      var st = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
      if (st !== lastStep) {
        lastStep = st;
        steps.forEach(function (s, i) { s.classList.toggle('is-on', i === st); s.classList.toggle('is-done', i < st); });
      }
      if (readCount) readCount.textContent = inside + ' / ' + coinEls.length;
      var locked = door.lock > 0.95;
      if (readDoor) readDoor.textContent = locked ? 'LOCKED' : door.open > 0.98 ? 'OPEN · INTAKE' : 'CLOSING';
      stamp.setAttribute('opacity', smooth(0.93, 0.98, p).toFixed(2));
      stamp.setAttribute('transform', 'rotate(-12) scale(' + (1 + (1 - smooth(0.93, 0.98, p)) * 0.6).toFixed(3) + ')');
      if (locked && !stamped) { stamped = true; self.sfx.clunk(); }
      if (!locked) stamped = false;
    };
  };

  /* 02 · Fee allocation simulator */
  Engine.prototype.setupFees = function () {
    var self = this, wrap = q(this.root, '[data-k="fees"]'); if (!wrap) return;
    var sl = q(wrap, '[data-k="feeslider"]'), out = qa(wrap, '[data-k="feepct"]'), cv = q(wrap, 'canvas'), box = q(wrap, '[data-k="feecv"]');
    var MIN = 0.1, MAX = 10, pct = 1, shown = 1, parts = [], visible = false, ctx, w, h, pulse = 0, dragging = false, lastTick = 0;
    function set(v, user) {
      v = Math.round(clamp(v, MIN, MAX) * 10) / 10;
      if (v === pct && !user) return;
      var changed = v !== pct; pct = v;
      var f = (pct - MIN) / (MAX - MIN);
      sl.style.setProperty('--p', (f * 100).toFixed(2) + '%');
      sl.setAttribute('aria-valuenow', pct.toFixed(1)); sl.setAttribute('aria-valuetext', pct.toFixed(1) + '%');
      if (changed && user) {
        var t = now(); if (t - lastTick > 40) { lastTick = t; self.sfx.tick(); }
        // a little gush of green on every change so the stream answers the drag
        for (var k = 0; k < 3; k++) parts.push({ t: 0.45 + rand(0, 0.04), br: true, sp: rand(0.5, 0.7), j: rand(-4, 4) });
      }
    }
    function fromX(x) { var r = sl.getBoundingClientRect(); set(MIN + clamp((x - r.left) / r.width, 0, 1) * (MAX - MIN), true); }
    this.on(sl, 'pointerdown', function (e) {
      e.preventDefault(); dragging = true; sl.classList.add('is-drag');
      try { sl.setPointerCapture(e.pointerId); } catch (er) {}
      fromX(e.clientX);
    });
    this.on(sl, 'pointermove', function (e) { if (dragging) { e.preventDefault(); fromX(e.clientX); } });
    var end = function () { dragging = false; sl.classList.remove('is-drag'); };
    this.on(sl, 'pointerup', end); this.on(sl, 'pointercancel', end); this.on(sl, 'lostpointercapture', end);
    this.on(sl, 'keydown', function (e) {
      var st = e.shiftKey ? 1 : 0.1, k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowUp') set(pct + st, true);
      else if (k === 'ArrowLeft' || k === 'ArrowDown') set(pct - st, true);
      else if (k === 'Home') set(MIN, true); else if (k === 'End') set(MAX, true);
      else return;
      e.preventDefault();
    });
    set(1, false);
    function rs() { w = box.clientWidth; h = box.clientHeight; ctx = fitCanvas(cv, w, h); }
    rs(); this.on(window, 'resize', rs);
    this.observe([wrap], function (el, v) { visible = v; }, { threshold: 0 });
    var acc = 0;
    for (var pi = 0; pi < 90; pi++) parts.push({ t: rand(0, 1), br: Math.random() < 0.08, sp: rand(0.32, 0.42), j: rand(-6, 6) });
    this.feeFrame = function (t, dt) {
      if (!visible || !ctx) return;
      shown += (pct - shown) * Math.min(1, dt * 10);
      var label = shown.toFixed(1) + '%';
      out.forEach(function (o) { if (o.textContent !== label) o.textContent = label; });
      var f = (shown - MIN) / (MAX - MIN);
      var c = ctx; c.clearRect(0, 0, w, h);
      var y0 = h * 0.3, splitX = w * 0.42, endX = w - 30, vaultX = w * 0.8, vaultY = h * 0.72;
      var mainW = 22, brW = 4 + f * 26, vr = 26 + f * 18;
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(236,231,225,.12)'; c.lineWidth = mainW;
      c.beginPath(); c.moveTo(24, y0); c.lineTo(endX, y0); c.stroke();
      // branch pipe grows with the share
      c.strokeStyle = 'rgba(43,255,116,' + (0.12 + f * 0.25).toFixed(3) + ')'; c.lineWidth = brW;
      c.shadowColor = '#2bff74'; c.shadowBlur = 6 + f * 18;
      c.beginPath(); c.moveTo(splitX, y0); c.bezierCurveTo(splitX + 60, y0, vaultX - 120, vaultY, vaultX - vr, vaultY); c.stroke();
      c.shadowBlur = 0;
      // vault grows and spins faster with the share
      c.save(); c.translate(vaultX, vaultY);
      c.fillStyle = '#151517'; c.strokeStyle = '#ff6a1f'; c.lineWidth = 3;
      c.shadowColor = '#ff6a1f'; c.shadowBlur = 10 + pulse * 30 + f * 20;
      c.beginPath(); c.arc(0, 0, vr + pulse * 4, 0, TAU); c.fill(); c.stroke(); c.shadowBlur = 0;
      self._feeSpin = (self._feeSpin || 0) + dt * (0.4 + f * 3.5);
      c.rotate(self._feeSpin); c.strokeStyle = 'rgba(255,106,31,.75)'; c.lineWidth = 2; c.setLineDash([5, 6]); c.beginPath(); c.arc(0, 0, vr * 0.72, 0, TAU); c.stroke(); c.setLineDash([]);
      for (var sp = 0; sp < 6; sp++) { var a = sp / 6 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * vr * 0.3, Math.sin(a) * vr * 0.3); c.lineTo(Math.cos(a) * vr * 0.55, Math.sin(a) * vr * 0.55); c.stroke(); }
      c.restore();
      c.fillStyle = '#ff6a1f'; c.beginPath(); c.arc(vaultX, vaultY, 5 + pulse * 5, 0, TAU); c.fill();
      pulse = Math.max(0, pulse - dt * 2.5);
      var rate = 60; acc += dt * rate;
      var brP = 0.03 + f * 0.6;
      while (acc > 1) { acc -= 1; parts.push({ t: 0, br: Math.random() < brP, sp: rand(0.32, 0.42), j: rand(-6, 6) }); }
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.t += dt * p.sp;
        var x, y, col;
        if (p.t < 0.45) { x = lerp(24, splitX, p.t / 0.45); y = y0 + p.j; col = 'rgba(236,231,225,.7)'; }
        else if (!p.br) { var u = (p.t - 0.45) / 0.55; x = lerp(splitX, endX, u); y = y0 + p.j; col = 'rgba(236,231,225,.35)'; }
        else {
          var v = clamp((p.t - 0.45) / 0.55, 0, 1), it = 1 - v, ex = vaultX - vr;
          x = it * it * it * splitX + 3 * it * it * v * (splitX + 60) + 3 * it * v * v * (vaultX - 120) + v * v * v * ex;
          y = it * it * it * y0 + 3 * it * it * v * y0 + 3 * it * v * v * vaultY + v * v * v * vaultY;
          col = '#2bff74';
        }
        if (p.t >= 1) { if (p.br) pulse = Math.min(1, pulse + 0.35); parts.splice(i, 1); continue; }
        c.fillStyle = col;
        if (col === '#2bff74') { c.shadowColor = '#2bff74'; c.shadowBlur = 10; c.fillRect(x - 3, y - 6, 6, 12); c.shadowBlur = 0; }
        else { c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill(); }
      }
      c.font = '700 10px "Space Mono", monospace'; c.fillStyle = '#8C8882'; c.textAlign = 'left';
      c.fillText('HODL FEES · 100%', 24, y0 - 22);
      c.textAlign = 'right'; c.fillText('REST OF FEES', endX, y0 - 22);
      c.fillStyle = '#ff6a1f'; c.fillText('INTO THE VAULT', vaultX - vr - 12, vaultY + 4);
      c.fillStyle = '#2bff74'; c.textAlign = 'left'; c.fillText('BUYS PROJECT TOKEN · ' + label, 24, y0 + 40);
    };
  };

  /* 03 · Reinvest mock */
  Engine.prototype.setupReinvest = function () {
    var self = this, w = q(this.root, '[data-k="reinvest"]'); if (!w) return;
    var tg = qa(w, '[data-cur]'), rng = q(w, 'input[type=range]'), coins = q(w, '[data-k="coins"]'), lbl = q(w, '[data-k="rilabel"]'), pct = q(w, '[data-k="ripct"]'), badge = q(w, '[data-k="ribadge"]');
    var cur = 'SOL';
    var html = '';
    for (var i = 0; i < 10; i++) html += '<span class="hodl-coin"><b>SOL</b></span>';
    coins.innerHTML = html;
    var cs = qa(coins, '.hodl-coin');
    function render() {
      var share = cur === 'HODL' ? parseInt(rng.value, 10) : 0;
      rng.disabled = cur !== 'HODL';
      w.classList.toggle('is-hodl', cur === 'HODL');
      pct.textContent = (cur === 'HODL' ? rng.value : '0') + '%';
      rng.style.setProperty('--p', rng.value + '%');
      cs.forEach(function (c, i) {
        var h = i < Math.round(share / 10);
        if (c.classList.contains('is-h') !== h) {
          c.classList.toggle('is-h', h);
          c.style.transitionDelay = (i * 40) + 'ms';
          c.querySelector('b').textContent = h ? 'HODL' : 'SOL';
        }
      });
      tg.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cur') === cur ? 'true' : 'false'); });
      var full = share === 100;
      lbl.textContent = cur !== 'HODL' ? 'Payout in SOL · nothing compounding' : full ? 'Auto-reinvest on · 100% HODL' : 'Auto-reinvest on · ' + share + '% HODL';
      badge.classList.toggle('is-on', full);
    }
    tg.forEach(function (b) { self.on(b, 'click', function () { cur = b.getAttribute('data-cur'); if (cur === 'HODL' && rng.value === '0') rng.value = '100'; self.sfx.tick(); render(); }); });
    this.on(rng, 'input', function () { render(); });
    render();
  };

  /* 04 · Lookbook: drag to browse */
  Engine.prototype.setupCrates = function () {
    var self = this, el = q(this.root, '[data-k="look"]'); if (!el) return;
    var down = false, moved = 0, sx = 0, sl = 0, v = 0, lx = 0, lt = 0, raf = 0;
    this.on(el, 'pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = el.scrollLeft; lx = e.clientX; lt = now(); v = 0; cancelAnimationFrame(raf);
    });
    this.on(window, 'pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) el.classList.add('is-drag');
      el.scrollLeft = sl - dx;
      var t = now(); v = (e.clientX - lx) / Math.max(1, t - lt); lx = e.clientX; lt = t;
    });
    this.on(window, 'pointerup', function () {
      if (!down) return; down = false;
      setTimeout(function () { el.classList.remove('is-drag'); }, 0);
      var vel = -v * 16;
      (function glide() { if (Math.abs(vel) < 0.5) return; el.scrollLeft += vel; vel *= 0.92; raf = requestAnimationFrame(glide); })();
    });
    this.on(el, 'click', function (e) { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
    this.on(el, 'dragstart', function (e) { e.preventDefault(); });
  };

  /* WE NEVER SELL interstitial — rows move with scroll */
  Engine.prototype.setupInterstitial = function () {
    var rows = qa(this.root, '[data-ntrack]'), sec = q(this.root, '[data-k="never"]');
    if (!sec || !rows.length) return;
    this.neverRows = rows; this.neverSec = sec;
    var self = this, started = false;
    var start = function () {
      if (started) return; started = true;
      import('./diamond').then(function (mod) {
        if (self.dead) return;
        self.diamond = mod.initDiamond(sec, {
          lite: !!self.lite, touch: !self.fine,
          onSteal: function () { self.sfx.chime(); if (self.gfx && !self.reduced) { self.gfx.burst(window.innerWidth / 2, window.innerHeight / 2, 24); self.gfxAwake = 2; } },
          onBlock: function () { self.sfx.stamp(); if (self.gfx && !self.reduced) { var r = sec.getBoundingClientRect(); self.gfx.burst(window.innerWidth / 2, r.top > 0 ? r.top + window.innerHeight / 2 : window.innerHeight / 2, 14); self.gfxAwake = 1.5; } }
        });
        if (self.diamond) self.cleanup.push(function () { self.diamond.destroy(); });
      }, function () { sec.classList.add('no-gl'); });
    };
    if (this.reduced) { sec.classList.add('no-gl'); return; }
    this.observe([sec], function (el, v) { if (v) start(); }, { rootMargin: '150% 0px 150% 0px' });
  };

  /* 05 · Hold-to-enlist */
  Engine.prototype.setupOath = function () {
    var self = this, b = q(this.root, '[data-k="oath"]'); if (!b) return;
    var ring = q(b, '[data-k="oathring"]'), msg = q(this.root, '[data-k="oathmsg"]'), done = q(this.root, '[data-k="oathdone"]');
    var p = 0, holding = false, raf = 0, last = 0, complete = false, DUR = 3;
    var C = 2 * Math.PI * 92;
    ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
    function tick() {
      var t = now(), dt = (t - last) / 1000; last = t;
      if (holding) p = Math.min(1, p + dt / DUR); else p = Math.max(0, p - dt * 1.6);
      ring.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
      b.style.setProperty('--hp', p.toFixed(3));
      var label = q(b, '[data-k="oathlbl"]');
      if (holding && !complete) label.textContent = p < 0.34 ? 'HOLDING…' : p < 0.67 ? 'STILL HOLDING…' : 'DON’T LET GO…';
      if (p >= 1 && !complete) {
        complete = true; holding = false;
        b.classList.add('is-done'); label.textContent = 'ENLISTED';
        msg.textContent = 'Diamond hands confirmed. Welcome to the garrison.';
        if (done) done.classList.add('is-on');
        self.sfx.chime();
        var r = b.getBoundingClientRect(); if (self.gfx && !self.reduced) { self.gfx.burst(r.left + r.width / 2, r.top + r.height / 2, 26); self.gfxAwake = 2; }
      }
      if (holding || (p > 0 && !complete)) raf = requestAnimationFrame(tick); else raf = 0;
    }
    function start(e) {
      if (complete) return; if (e && e.preventDefault) e.preventDefault();
      holding = true; last = now(); b.classList.add('is-holding'); msg.textContent = 'Keep holding. Selling is not an option.';
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!holding) return; holding = false; b.classList.remove('is-holding');
      if (!complete) { msg.textContent = p > 0.15 ? 'Paper hands detected. Try again — and don’t let go.' : 'Press and hold for 3 seconds.'; q(b, '[data-k="oathlbl"]').textContent = 'HOLD TO ENLIST'; }
      if (!raf) { last = now(); raf = requestAnimationFrame(tick); }
    }
    this.on(b, 'pointerdown', start); this.on(window, 'pointerup', stop); this.on(b, 'pointerleave', stop); this.on(window, 'pointercancel', stop);
    this.on(b, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    this.on(b, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') stop(); });
    this.on(b, 'contextmenu', function (e) { e.preventDefault(); });
  };

  /* 06 · Dossier copy */
  Engine.prototype.setupDossier = function () {
    var self = this;
    qa(this.root, '[data-copy]').forEach(function (b) {
      self.on(b, 'click', function () {
        var v = b.getAttribute('data-copy'), row = b.closest('[data-row]');
        var ok = function () {
          if (row) { row.classList.remove('is-stamped'); void row.offsetWidth; row.classList.add('is-stamped'); }
          var l = b.querySelector('span'); if (l) { l.textContent = 'COPIED'; setTimeout(function () { l.textContent = 'COPY'; }, 1600); }
          self.sfx.stamp();
        };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, function () { fallback(v); ok(); });
          else { fallback(v); ok(); }
        } catch (e) { fallback(v); ok(); }
      });
    });
    function fallback(v) {
      try { var ta = document.createElement('textarea'); ta.value = v; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
    }
    var dos = qa(this.root, '[data-declass]');
    this.observe(dos, function (el, v) { if (v) el.classList.add('is-in'); }, { threshold: 0.35 });
  };

  /* 07 · Finale: soldier salutes before a sealed vault */
  Engine.prototype.setupFinale = function () {
    var self = this, m = q(this.root, '[data-k="finale"]'); if (!m) return;
    var svg = svgRoot(m, 'hodl-svg'); svg.setAttribute('viewBox', '-330 -520 660 560'); svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    svg.innerHTML = '<ellipse cx="0" cy="0" rx="300" ry="34" fill="url(#hg-pool)"/><g data-k="fdoor"></g><g data-k="fsol"></g>';
    var door = new Door(q(svg, '[data-k="fdoor"]'), 120, -190, 170); door.open = 0; door.lock = 1; door.apply();
    var S = new Soldier(q(svg, '[data-k="fsol"]'), { x: -120, y: 0, s: 1.1, idleLook: false });
    this.finSoldier = S; this._finVis = function () { return visible; };
    var visible = false, saluteT = 0;
    this.observe([m], function (el, v) { visible = v; if (v) { saluteT = 0; } }, { threshold: 0.35 });
    this.finaleFrame = function (t, dt) {
      if (!visible) return;
      saluteT += dt;
      var target = saluteT > 0.5 && saluteT < 3.6 ? 1 : 0;
      if (saluteT > 7) saluteT = 0;
      S.salute += (target - S.salute) * Math.min(1, dt * 5);
      S.lookTarget = 0;
      door.wheelAng = Math.sin(t * 0.3) * 4; door.apply();
      S.update(t, dt);
    };
  };

  /* Boot intro (once per session) */
  Engine.prototype.setupIntro = function () {
    var self = this, el = q(this.root, '[data-k="intro"]'); if (!el) return;
    if (this.reduced || sstore('hodl-booted')) { el.remove(); return; }
    sstore('hodl-booted', '1');
    var lines = qa(el, '[data-line]');
    lines.forEach(function (l, i) { setTimeout(function () { l.classList.add('is-on'); self.sfx.tick(); }, 140 + i * 170); });
    var end = function () { el.classList.add('is-out'); setTimeout(function () { if (el.parentNode) el.remove(); }, 900); };
    var t = setTimeout(end, 140 + lines.length * 170 + 380);
    this.on(el, 'click', function () { clearTimeout(t); end(); });
  };

  /* scroll: progress bar, hero parallax, interstitial rows */
  Engine.prototype.setupScroll = function () {
    var self = this, bar = q(this.root, '[data-k="progress"]'), nav = q(this.root, '[data-k="nav"]');
    this.heroScroll = 0;
    var tick = false;
    var on = function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var y = window.scrollY || 0, doc = document.documentElement, max = (doc.scrollHeight - window.innerHeight) || 1;
        if (bar) bar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
        var vh = window.innerHeight || 1;
        self.heroScroll = clamp(y / vh, 0, 1);
        if (nav) nav.classList.toggle('is-solid', y > vh * 0.6);
        if (self.neverRows && self.neverSec && !self.reduced) {
          var r = self.neverSec.getBoundingClientRect(), p = (vh - r.top) / (vh + r.height);
          self.neverRows.forEach(function (row, i) { row.style.transform = 'translate3d(' + ((i % 2 ? -1 : 1) * (p - 0.5) * 40).toFixed(2) + '%,0,0)'; });
        }
        var rk = q(self.root, '[data-k="rank"]'); if (rk) rk.classList.toggle('is-on', y > vh * 0.5);
      });
    };
    this.on(window, 'scroll', on, { passive: true });
    this.on(window, 'resize', on);
    on();
  };

  return Engine;
})();

/** Start the HODL engine on the page root. Call from a client effect; call destroy() on unmount. */
export function initEngine(root: HTMLElement): EngineHandle {
  return new Engine(root) as EngineHandle;
}
