(() => {
  'use strict';

  // ======================================================================
  // Utilities
  // ======================================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase() || '?';
  const firstName = name => name.trim().split(/\s+/)[0];
  const blurActive = () => document.activeElement && document.activeElement.blur && document.activeElement.blur();
  const DAY = 864e5;

  const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  const money = (n, sign) => (sign ? (n > 0 ? '+' : '−') : '') + eur.format(Math.abs(n));

  function dayLabel(ms) {
    const d = new Date(ms), today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today - new Date(d).setHours(0, 0, 0, 0)) / DAY);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  }
  const timeLabel = ms => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  // iOS native switch (<input switch>) where supported, styled fallback elsewhere
  const NATIVE_SWITCH = 'switch' in document.createElement('input');
  const SWITCH = NATIVE_SWITCH ? 'switch' : 'class="switch-fallback"';
  const upgradeSwitch = el => (NATIVE_SWITCH ? el.setAttribute('switch', '') : el.classList.add('switch-fallback'));

  // Haptic tick: iOS plays one when a native switch is toggled through its label
  const haptic = (() => {
    const label = document.createElement('label');
    label.className = 'haptic';
    label.setAttribute('aria-hidden', 'true');
    label.innerHTML = `<input type="checkbox" tabindex="-1" ${NATIVE_SWITCH ? 'switch' : ''}>`;
    document.body.appendChild(label);
    return () => { if (NATIVE_SWITCH) label.click(); };
  })();

  const ICONS = {
    cup: '<path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5v2M12 3.5v2"/>',
    cart: '<path d="M3 4h2.2l2.1 10.1a1.6 1.6 0 0 0 1.6 1.3h7.8a1.6 1.6 0 0 0 1.6-1.2L20 7.5H6.1"/><circle cx="9.5" cy="19.5" r="1.2"/><circle cx="17" cy="19.5" r="1.2"/>',
    income: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    car: '<path d="M5 17v-4.5L7 7h10l2 5.5V17M5 17h14M4 12.5h16M6.5 17v2M17.5 17v2"/>',
    play: '<path d="M8.5 6.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L9.7 5.5a.8.8 0 0 0-1.2.7z"/>',
    bolt: '<path d="M13 2.5L5 13.5h6.5L10.5 21.5 19 10h-6.5z"/>',
    bag: '<path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20.5h17"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M7 17L17 7M9 7h8v8"/>',
    down: '<path d="M17 7L7 17M15 17H7V9"/>',
    downRight: '<path d="M7 7l10 10M17 9v8H9"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    snow: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 4.5L12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18M7 15h4"/>',
    face: '<path d="M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2M9 9.5v1.5M15 9.5v1.5M12.2 9.5v4h-1M9.3 16q2.7 1.8 5.4 0"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    del: '<path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const icon = (name, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24">${ICONS[name]}</svg>`;

  // ======================================================================
  // Motion: springs pre-baked into GPU keyframe animations
  // ======================================================================
  // A spring curve (SwiftUI-style response + damping, optional start velocity)
  // is sampled once and handed to the browser as keyframes on transform/opacity,
  // so iOS runs it on the GPU at full frame rate with no per-frame JS.
  const curves = new Map();
  function springCurve(response, damping, v0 = 0) {
    const key = `${response}/${damping}/${v0.toFixed(1)}`;
    if (curves.has(key)) return curves.get(key);
    const w0 = 2 * Math.PI / response;
    let f;
    if (damping < 1) {
      const a = damping * w0, wd = w0 * Math.sqrt(1 - damping * damping);
      f = t => 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a - v0) / wd * Math.sin(wd * t));
    } else {
      f = t => 1 - Math.exp(-w0 * t) * (1 + (w0 - v0) * t);
    }
    let dur = 0;
    for (let t = 0; t < 4; t += 1 / 240) if (Math.abs(1 - f(t)) > 0.0015) dur = t;
    dur += 1 / 60;
    const n = Math.max(16, Math.ceil(dur * 90));
    const samples = [];
    for (let i = 0; i <= n; i++) samples.push(i === n ? 1 : f(i / n * dur));
    const c = { dur: dur * 1000, samples };
    curves.set(key, c);
    return c;
  }

  function play(el, keyframes, options) {
    const a = el.animate(keyframes, { fill: 'both', easing: 'linear', ...options });
    if (el._anim) el._anim.cancel();
    el._anim = a;
    return a.finished.catch(() => {});
  }

  function stop(el) {
    if (el._anim) { el._anim.cancel(); el._anim = null; }
  }

  // frame(v) maps spring progress (0 -> 1, may overshoot) to styles
  function spring(el, frame, { response = 0.5, damping = 1, delay = 0, velocity = 0 } = {}) {
    const { dur, samples } = springCurve(response, damping, velocity);
    const n = samples.length - 1;
    return play(el, samples.map((v, i) => ({ offset: i / n, ...frame(v) })), { duration: dur, delay });
  }

  function shake(el) {
    el.animate([
      { transform: 'translateX(0px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(3px)' },
      { transform: 'translateX(0px)' },
    ], { duration: 420, easing: 'ease-out', composite: 'add' });
  }

  // ======================================================================
  // Store: accounts live in localStorage on this device only.
  // Passwords are never stored, only a salted PBKDF2 hash.
  // ======================================================================
  const CONTACTS = [
    { name: 'Alex Petrov', color: '#bf5af2' },
    { name: 'Maria Koleva', color: '#ff375f' },
    { name: 'Georgi Dimitrov', color: '#ff9f0a' },
    { name: 'Elena Stoyanova', color: '#30d158' },
    { name: 'Ivan Todorov', color: '#0a84ff' },
    { name: 'Sofia Marinova', color: '#32ade6' },
  ];
  const THEMES = ['indigo', 'graphite', 'mint', 'sunset'];

  function newCard() {
    const digits = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b % 10).join('');
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 4);
    return {
      theme: 'indigo',
      frozen: false,
      number: '9' + digits(15),
      cvv: digits(3),
      exp: String(exp.getMonth() + 1).padStart(2, '0') + '/' + String(exp.getFullYear()).slice(-2),
    };
  }

  function seedData(card = newCard()) {
    const now = Date.now(), H = 36e5;
    const t = (hours, name, cat, icon, color, amount) => ({ id: uid(), name, cat, icon, color, amount, date: now - hours * H, status: 'completed' });
    return {
      card,
      tx: [
        t(1.5, 'Coffee House', 'Food & Drink', 'cup', '#ff9f0a', -4.8),
        t(3, 'FreshMart', 'Groceries', 'cart', '#30d158', -62.35),
        t(20, 'City Taxi', 'Transport', 'car', '#d4a20a', -14.2),
        t(46, 'Streamly', 'Subscriptions', 'play', '#ff375f', -11.99),
        t(70, 'Alex Petrov', 'Transfer', 'person', '#bf5af2', 40),
        t(98, 'Power & Light', 'Utilities', 'bolt', '#32ade6', -78.4),
        t(120, 'Urban Store', 'Shopping', 'bag', '#ff6482', -129),
        t(140, 'Salary', 'Income', 'income', '#0a84ff', 2850),
        t(150, 'Opening deposit', 'Deposit', 'bank', '#5e5ce6', 9250),
      ],
    };
  }

  const store = (() => {
    const KEY = 'vault-demo.v1';
    let db = null;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || typeof db !== 'object' || !db.users) db = { users: {}, session: null, last: null };

    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage full or blocked */ } };
    const norm = e => e.trim().toLowerCase();
    const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

    async function hash(password, salt) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 120000 }, key, 256);
      return b64(bits);
    }

    return {
      get user() { return (db.session && db.users[db.session]) || null; },
      get lastUser() { return (db.last && db.users[db.last]) || null; },
      async register({ name, email, password, faceId }) {
        email = norm(email);
        if (db.users[email]) throw new Error('An account with this email already exists.');
        const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
        db.users[email] = { name: name.trim(), email, salt, hash: await hash(password, salt), faceId, created: Date.now(), data: seedData() };
        db.session = db.last = email;
        save();
      },
      async login(email, password) {
        const u = db.users[norm(email)];
        if (!u || (await hash(password, u.salt)) !== u.hash) throw new Error('Incorrect email or password.');
        db.session = db.last = u.email;
        save();
      },
      resume(email) {
        if (!db.users[email]) return;
        db.session = db.last = email;
        save();
      },
      logout() { db.session = null; save(); },
      remove() {
        delete db.users[db.session];
        if (db.last === db.session) db.last = null;
        db.session = null;
        save();
      },
      save,
    };
  })();

  // ======================================================================
  // Dynamic Island: Face ID + notification banners
  // ======================================================================
  const shape = $('#shape');
  shape.innerHTML = '<div class="pc"></div><div class="pc"></div>' + '<div class="pc c"></div>'.repeat(4);
  const pieces = [...shape.children];

  let islandTop = 11;
  function measure() {
    // Line up with the hardware Dynamic Island when running from the Home Screen
    const inset = parseFloat(getComputedStyle($('#probe')).paddingTop) || 0;
    islandTop = inset >= 60 ? 14 : 11;
  }

  const PILL = () => ({ w: 126, h: 37, r: 18.5, y: islandTop + 18.5 });
  const BOX = () => ({ w: 160, h: 160, r: 44, y: islandTop + 80 });
  const WIDE = () => ({ w: Math.min(innerWidth - 20, 380), h: 88, r: 40, y: islandTop + 44 });
  const mix = (a, b, t) => ({ w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), r: lerp(a.r, b.r, t), y: lerp(a.y, b.y, t) });

  // The rounded shape is 2 bars + 4 circles, so scaling keeps perfect corners at every size
  function pieceTransforms({ w, h, r, y }) {
    const cx = innerWidth / 2;
    const dx = w / 2 - r, dy = h / 2 - r, cs = (2 * r) / 200;
    const t = (x, yy, sx, sy) => `translate(${x.toFixed(2)}px, ${yy.toFixed(2)}px) scale(${Math.max(1e-4, sx).toFixed(4)}, ${Math.max(1e-4, sy).toFixed(4)})`;
    return [
      t(cx, y, w / 200, (h - 2 * r) / 200),
      t(cx, y, (w - 2 * r) / 200, h / 200),
      t(cx - dx, y - dy, cs, cs),
      t(cx + dx, y - dy, cs, cs),
      t(cx - dx, y + dy, cs, cs),
      t(cx + dx, y + dy, cs, cs),
    ];
  }

  function morphShape(from, to, opts) {
    pieces.forEach((el, i) => spring(el, v => ({ transform: pieceTransforms(mix(from, to, v))[i] }), opts));
  }

  const glyph = $('#glyph');
  const glyphAt = (y, scale) => `translate(${(innerWidth / 2).toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;

  // Spinner ring: 4 arcs in the same spots as the corner brackets
  (() => {
    const R = 36, sweep = 64;
    let d = '';
    for (let i = 0; i < 4; i++) {
      const mid = 225 + 90 * i;
      const a0 = (mid - sweep / 2) * Math.PI / 180, a1 = (mid + sweep / 2) * Math.PI / 180;
      d += `M${(50 + R * Math.cos(a0)).toFixed(2)} ${(50 + R * Math.sin(a0)).toFixed(2)}` +
           `A${R} ${R} 0 0 1 ${(50 + R * Math.cos(a1)).toFixed(2)} ${(50 + R * Math.sin(a1)).toFixed(2)}`;
    }
    $('#ring').innerHTML = `<path d="${d}"/>`;
  })();

  const g = {
    corners: $('#corners'), face: $('#face'), eyes: $('#eyes'), nose: $('#nose'),
    ringWrap: $('#ringWrap'), ring: $('#ring'), circle: $('#circle'), check: $('#check'),
  };

  function resetGlyph() {
    [g.corners, g.face, g.eyes, g.nose, g.ringWrap, g.circle, g.check].forEach(stop);
    g.ring.getAnimations().forEach(a => a.cancel());
  }

  // Demo: authentication always succeeds for now
  async function authenticate() {
    await wait(1100);
    return true;
  }

  async function dropDown() {
    const A = PILL(), B = BOX();
    play(shape, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
    const opts = { response: 0.6, damping: 0.76 };
    morphShape(A, B, opts);
    spring(glyph, v => ({
      transform: glyphAt(lerp(A.y, B.y, v), lerp(0.55, 1, v)),
      opacity: clamp((v - 0.35) / 0.45),
    }), opts);
    await wait(520);
  }

  async function scan() {
    // A gentle head turn, like the real glyph
    const ease = 'cubic-bezier(0.45, 0, 0.55, 1)';
    const look = (amp, squish) => [
      { offset: 0, transform: 'translateX(0px) scaleX(1)', easing: ease },
      { offset: 0.32, transform: `translateX(${-amp}px) scaleX(${squish})`, easing: ease },
      { offset: 0.72, transform: `translateX(${amp}px) scaleX(${squish})`, easing: ease },
      { offset: 1, transform: 'translateX(0px) scaleX(1)' },
    ];
    play(g.face, look(2.6, 0.95), { duration: 1000 });
    play(g.eyes, look(1.8, 1), { duration: 1000 });
    await play(g.nose, look(2.8, 1), { duration: 1000 });

    // Brackets swirl away as the spinning ring fades in
    spring(g.face, v => ({ transform: `translateX(0px) scaleX(1) scale(${lerp(1, 0.6, v)})`, opacity: clamp(1 - v * 1.4) }), { response: 0.45 });
    spring(g.corners, v => ({ transform: `rotate(${(95 * v).toFixed(2)}deg) scale(${lerp(1, 0.8, v)})`, opacity: clamp(1 - v * 1.25) }), { response: 0.55 });
    spring(g.ringWrap, v => ({ transform: `rotate(${lerp(-110, 0, v).toFixed(2)}deg) scale(${lerp(1.22, 1, v)})`, opacity: clamp(v * 1.5) }), { response: 0.6 });
    g.ring.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 950, iterations: Infinity });

    const ok = await authenticate();
    if (!ok) return false;

    // Ring closes into a full circle, then folds into the check
    spring(g.circle, v => ({ opacity: v }), { response: 0.22 });
    await spring(g.ringWrap, v => ({ transform: 'rotate(0deg) scale(1)', opacity: 1 - v }), { response: 0.22 });
    spring(g.circle, v => ({ transform: `scale(${lerp(1, 0.5, v)})`, opacity: clamp(1 - v * 1.3) }), { response: 0.45 });
    spring(g.check, v => ({ transform: `scale(${lerp(0.35, 1, v)})`, opacity: clamp(v * 2) }), { response: 0.5, damping: 0.62 });
    haptic();
    await wait(600);
    g.ring.getAnimations().forEach(a => a.cancel());
    return true;
  }

  // Square folds back up into the island
  async function tuckAway() {
    const A = PILL(), B = BOX();
    const opts = { response: 0.55, damping: 1 };
    morphShape(B, A, opts);
    spring(glyph, v => ({ transform: glyphAt(lerp(B.y, A.y, v), lerp(1, 0.45, v)), opacity: clamp(1 - v * 1.8) }), opts);
    spring(shape, v => ({ opacity: 1 - v }), { response: 0.3, delay: 380 });
    await wait(160);
  }

  // Island jobs run one after another (Face ID, banners)
  let islandChain = Promise.resolve();
  function withIsland(job) {
    const run = islandChain.then(job);
    islandChain = run.catch(() => {});
    return run;
  }

  function faceId() {
    return withIsland(async () => {
      measure();
      resetGlyph();
      await dropDown();
      const ok = await scan();
      await tuckAway();
      return ok;
    });
  }

  // Island widens into a notification banner
  const banner = $('#banner');
  function notify({ title, sub = '', icon: ic = 'check', color = 'var(--green)' }) {
    return withIsland(async () => {
      measure();
      const A = PILL(), W = WIDE();
      const bx = innerWidth / 2 - W.w / 2;
      banner.style.width = W.w + 'px';
      banner.innerHTML = `<span class="b-icon" style="background:${color}">${icon(ic)}</span>` +
        `<span class="b-text"><div class="b-title">${esc(title)}</div>${sub ? `<div class="b-sub">${esc(sub)}</div>` : ''}</span>`;
      const at = (dy, s) => `translate(${bx.toFixed(2)}px, ${(islandTop + dy).toFixed(2)}px) scale(${s.toFixed(4)})`;

      play(shape, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
      morphShape(A, W, { response: 0.55, damping: 0.78 });
      spring(banner, v => ({ opacity: clamp((v - 0.2) / 0.5), transform: at(lerp(-10, 0, v), lerp(0.9, 1, v)) }), { response: 0.55, damping: 0.86, delay: 90 });
      await wait(2500);
      spring(banner, v => ({ opacity: clamp(1 - v * 1.7), transform: at(lerp(0, -8, v), lerp(1, 0.92, v)) }), { response: 0.35 });
      await wait(110);
      morphShape(W, A, { response: 0.5, damping: 1 });
      await spring(shape, v => ({ opacity: 1 - v }), { response: 0.3, delay: 300 });
    });
  }

  // ======================================================================
  // Bottom sheet (drag down to dismiss, app pushes back behind it)
  // ======================================================================
  const Sheet = (() => {
    const sheet = $('#sheet'), dim = $('#dim'), push = $('#push'), content = $('#sheetContent');
    let H = 1, isOpen = false, drag = null, onClose = null, closing = Promise.resolve();

    const frame = y => {
      const p = clamp(1 - y / H);
      return {
        sheet: `translateY(${y.toFixed(2)}px)`,
        dim: p,
        push: `translateY(${(p * 10).toFixed(2)}px) scale(${(1 - 0.07 * p).toFixed(4)})`,
      };
    };
    const apply = y => {
      const f = frame(y);
      sheet.style.transform = f.sheet;
      dim.style.opacity = f.dim;
      push.style.transform = f.push;
    };
    const currentY = () => new DOMMatrix(getComputedStyle(sheet).transform).m42;

    function move(fromY, toY, velocityPx = 0) {
      const dist = toY - fromY;
      const velocity = dist ? clamp(velocityPx / dist, -25, 25) : 0;
      const opts = { response: 0.5, damping: toY === 0 ? 0.86 : 1, velocity };
      const at = v => frame(lerp(fromY, toY, v));
      spring(dim, v => ({ opacity: at(v).dim }), opts);
      spring(push, v => ({ transform: at(v).push }), opts);
      return spring(sheet, v => ({ transform: at(v).sheet }), opts);
    }

    function show(build, { tall = false, onClose: cb = null } = {}) {
      content.innerHTML = '';
      sheet.classList.toggle('tall', tall);
      build(content);
      sheet.style.visibility = dim.style.visibility = 'visible';
      push.style.borderRadius = '18px';
      H = sheet.offsetHeight + 16;
      isOpen = true;
      onClose = cb;
      return move(H, 0);
    }

    function hide(velocityPx = 0) {
      if (!isOpen) return closing;
      isOpen = false;
      blurActive();
      H = sheet.offsetHeight + 16;
      closing = move(currentY(), H, velocityPx).then(() => {
        if (isOpen) return;
        sheet.style.visibility = dim.style.visibility = 'hidden';
        push.style.borderRadius = '';
        content.innerHTML = '';
        const cb = onClose;
        onClose = null;
        if (cb) cb();
      });
      return closing;
    }

    sheet.addEventListener('pointerdown', e => {
      if (!isOpen || e.target.closest('button, input, label, .sheet-scroll, .contacts')) return;
      H = sheet.offsetHeight + 16;
      const y = currentY();
      [sheet, dim, push].forEach(stop);
      apply(y);
      drag = { startY: e.clientY, y0: y, y, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
      sheet.setPointerCapture(e.pointerId);
    });
    sheet.addEventListener('pointermove', e => {
      if (!drag) return;
      let y = drag.y0 + (e.clientY - drag.startY);
      if (y < 0) y *= 0.25; // rubber band upwards
      const dt = (e.timeStamp - drag.lastT) / 1000;
      if (dt > 0) drag.v = 0.8 * ((e.clientY - drag.lastY) / dt) + 0.2 * drag.v;
      drag.lastY = e.clientY;
      drag.lastT = e.timeStamp;
      drag.y = y;
      apply(y);
    });
    const endDrag = () => {
      if (!drag) return;
      const { y, v } = drag;
      drag = null;
      if (y > H * 0.3 || v > 700) hide(v);
      else move(y, 0, v);
    };
    sheet.addEventListener('pointerup', endDrag);
    sheet.addEventListener('pointercancel', endDrag);
    $('#sheetClose').addEventListener('click', () => hide());
    dim.addEventListener('click', () => hide());

    return { show, hide, get isOpen() { return isOpen; } };
  })();

  // Slide a detail page over the current sheet content, with a Back button
  function pushPage(root, html, wire) {
    const page = document.createElement('div');
    page.className = 'sheet-page';
    page.innerHTML = `<button class="sheet-back" type="button">${icon('back')}Back</button><div class="sheet-title">Details</div>${html}`;
    root.appendChild(page);
    wire(page);
    const W = root.offsetWidth;
    spring(page, v => ({ transform: `translateX(${lerp(W, 0, v).toFixed(2)}px)` }), { response: 0.45 });
    $('.sheet-back', page).addEventListener('click', async () => {
      await spring(page, v => ({ transform: `translateX(${lerp(0, W, v).toFixed(2)}px)` }), { response: 0.4 });
      page.remove();
    });
  }

  // ======================================================================
  // iOS alert
  // ======================================================================
  function alertDialog({ title, message, actions }) {
    const wrap = $('#alertWrap'), box = $('#alert');
    box.innerHTML = `<div class="alert-body"><div class="alert-title">${esc(title)}</div><div class="alert-msg">${esc(message)}</div></div>` +
      `<div class="alert-actions">${actions.map((a, i) => `<button type="button" data-i="${i}" class="${a.style || ''}">${esc(a.label)}</button>`).join('')}</div>`;
    wrap.classList.add('on');
    spring(wrap, v => ({ opacity: clamp(v) }), { response: 0.3 });
    spring(box, v => ({ transform: `scale(${lerp(1.18, 1, v).toFixed(4)})`, opacity: clamp(v * 1.5) }), { response: 0.4, damping: 0.82 });
    return new Promise(resolve => {
      box.onclick = async e => {
        const b = e.target.closest('button');
        if (!b) return;
        box.onclick = null;
        spring(wrap, v => ({ opacity: 1 - v }), { response: 0.25 });
        await spring(box, v => ({ transform: `scale(${lerp(1, 0.94, v).toFixed(4)})`, opacity: 1 - v }), { response: 0.25 });
        wrap.classList.remove('on');
        resolve(actions[+b.dataset.i].value);
      };
    });
  }

  // ======================================================================
  // Auth: welcome / register / login
  // ======================================================================
  const auth = $('#auth');
  const views = { welcome: $('#vWelcome'), register: $('#vRegister'), login: $('#vLogin') };
  const registerForm = $('#registerForm'), loginForm = $('#loginForm');
  let curView = null;
  let busy = false;

  function setView(name) {
    for (const [k, v] of Object.entries(views)) {
      stop(v);
      v.style.zIndex = '';
      v.classList.toggle('on', k === name);
    }
    curView = name;
  }

  // iOS push / pop navigation between auth screens
  async function navigate(name, dir) {
    const from = views[curView], to = views[name];
    if (!from || from === to) return;
    blurActive();
    if (name === 'login') prepareLogin();
    to.classList.add('on');
    to.scrollTop = 0;
    $$('[data-in]', to).forEach(stop);
    from.style.zIndex = dir > 0 ? 1 : 2;
    to.style.zIndex = dir > 0 ? 2 : 1;
    const W = innerWidth, opts = { response: 0.5, damping: 1 };
    curView = name;
    spring(to, v => ({ transform: `translateX(${lerp(dir > 0 ? W : -W * 0.3, 0, v).toFixed(2)}px)`, opacity: dir > 0 ? 1 : clamp(0.5 + 0.5 * v) }), opts);
    await spring(from, v => ({ transform: `translateX(${lerp(0, dir > 0 ? -W * 0.3 : W, v).toFixed(2)}px)`, opacity: dir > 0 ? clamp(1 - 0.5 * v) : 1 }), opts);
    if (curView !== name) return;
    from.classList.remove('on');
    stop(from);
  }

  function prepareLogin() {
    const last = store.lastUser;
    $('#faceLogin').style.display = last && last.faceId ? '' : 'none';
    if (last) {
      $('#faceLoginName').textContent = last.email;
      loginForm.elements.email.value = last.email;
    }
    loginForm.elements.password.value = '';
    $('#loginError').textContent = '';
  }

  function showAuth(name) {
    if (name === 'login') prepareLogin();
    setView(name);
    auth.classList.remove('leaving');
    auth.classList.add('on');
    spring(auth, v => ({ opacity: clamp(v * 1.4) }), { response: 0.5 });
    $$('[data-in]', views[name]).forEach((el, i) => spring(el, v => ({
      opacity: clamp(v * 1.3),
      transform: `translateY(${lerp(26, 0, v).toFixed(2)}px)`,
    }), { response: 0.7, damping: 0.86, delay: 80 + i * 60 }));
  }

  async function hideAuth() {
    blurActive();
    auth.classList.add('leaving');
    await spring(auth, v => ({ opacity: clamp(1 - v * 1.2), transform: `scale(${lerp(1, 1.04, v).toFixed(4)})` }), { response: 0.45 });
    auth.classList.remove('on', 'leaving');
    Object.values(views).forEach(v => { stop(v); v.classList.remove('on'); });
    registerForm.reset();
    $('#regError').textContent = '';
    loginForm.elements.password.value = '';
  }

  // Focusing a field must never scroll the screen container itself
  auth.addEventListener('scroll', () => { auth.scrollTop = 0; auth.scrollLeft = 0; });

  auth.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    const back = e.target.closest('[data-back]');
    if (go) navigate(go.dataset.go, 1);
    else if (back) navigate(back.dataset.back, -1);
  });

  // Return on a field moves to the next one instead of submitting early
  for (const form of [registerForm, loginForm]) {
    form.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      const fields = $$('input:not([type=checkbox])', form);
      const next = fields[fields.indexOf(e.target) + 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  }

  function formFail(form, errEl, msg, input) {
    errEl.textContent = msg;
    shake($('.field-group', form));
    haptic();
    if (input) input.focus();
  }

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const f = registerForm.elements, err = $('#regError'), btn = $('button[type=submit]', registerForm);
    const name = f.fullname.value.trim(), email = f.email.value.trim(), pw = f.password.value;
    if (name.length < 2) return formFail(registerForm, err, 'Please enter your name.', f.fullname);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return formFail(registerForm, err, 'Please enter a valid email.', f.email);
    if (pw.length < 6) return formFail(registerForm, err, 'Password must be at least 6 characters.', f.password);
    if (pw !== f.confirm.value) return formFail(registerForm, err, 'Passwords don’t match.', f.confirm);
    err.textContent = '';
    btn.classList.add('loading');
    try {
      await store.register({ name, email, password: pw, faceId: f.faceid.checked });
    } catch (x) {
      btn.classList.remove('loading');
      return formFail(registerForm, err, x.message, f.email);
    }
    btn.classList.remove('loading');
    busy = true;
    await hideAuth();
    if (store.user.faceId) await faceId();
    enterBank();
    notify({ title: `Welcome, ${firstName(name)}!`, sub: 'Your account is ready', icon: 'check', color: 'var(--green)' });
    busy = false;
  });

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const f = loginForm.elements, err = $('#loginError'), btn = $('button[type=submit]', loginForm);
    if (!f.email.value.trim() || !f.password.value) return formFail(loginForm, err, 'Enter your email and password.', f.email.value.trim() ? f.password : f.email);
    err.textContent = '';
    btn.classList.add('loading');
    try {
      await store.login(f.email.value, f.password.value);
    } catch (x) {
      btn.classList.remove('loading');
      f.password.value = '';
      return formFail(loginForm, err, x.message, f.password);
    }
    btn.classList.remove('loading');
    busy = true;
    await hideAuth();
    enterBank();
    busy = false;
  });

  $('#faceLoginBtn').addEventListener('click', async () => {
    const last = store.lastUser;
    if (!last || busy) return;
    busy = true;
    await hideAuth();
    const ok = await faceId();
    if (ok) {
      store.resume(last.email);
      enterBank();
    } else {
      showAuth('login');
    }
    busy = false;
  });

  // ======================================================================
  // Bank
  // ======================================================================
  const bank = $('#bank'), scroller = $('#scroller'), navbar = $('#navbar');
  const cardEl = $('#card'), recentEl = $('#recent'), amountEl = $('#amount');
  let user = null;
  let revealUntil = 0, revealTimer = 0;

  const balanceOf = u => Math.round(u.data.tx.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0) * 100) / 100;
  const sortedTx = () => [...user.data.tx].sort((a, b) => b.date - a.date);
  const findTx = id => user.data.tx.find(t => t.id === id);

  function save() { store.save(); }

  function addTx(t) {
    const tx = { id: uid(), date: Date.now(), status: 'completed', ...t };
    user.data.tx.push(tx);
    save();
    refresh(tx.id);
    return tx;
  }

  // ---------- balance with rolling digits ----------
  let shownBalance = '';
  function setBalance(value, mode) {
    const str = money(value), old = shownBalance;
    shownBalance = str;
    amountEl.innerHTML = '';
    amountEl.setAttribute('aria-label', str);
    let i = 0;
    for (const [idx, ch] of [...str].entries()) {
      if (!/\d/.test(ch)) {
        const s = document.createElement('span');
        s.className = 'sym';
        s.textContent = ch;
        amountEl.appendChild(s);
        continue;
      }
      const d = +ch;
      const roll = document.createElement('span');
      roll.className = 'roll';
      roll.innerHTML = '<span class="strip">' + '0123456789'.split('').map(n => `<span>${n}</span>`).join('') + '</span>';
      amountEl.appendChild(roll);
      const strip = roll.firstChild;
      strip.style.transform = `translateY(${-d * 1.3}em)`;
      // digits are matched from the right, so cents roll into cents
      const oldCh = old[old.length - (str.length - idx)];
      const from = mode === 'enter' ? 0 : /\d/.test(oldCh || '') ? +oldCh : 0;
      if (mode !== 'none' && from !== d) {
        spring(strip, v => ({ transform: `translateY(${(-lerp(from, d, v) * 1.3).toFixed(3)}em)` }), {
          response: mode === 'enter' ? 0.85 : 0.7, damping: 0.86, delay: mode === 'enter' ? 200 + i * 40 : i * 30,
        });
      }
      i++;
    }
  }

  function renderDelta() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const net = user.data.tx.filter(t => t.status === 'completed' && t.date >= start).reduce((s, t) => s + t.amount, 0);
    const el = $('#delta');
    el.classList.toggle('neg', net < 0);
    el.innerHTML = `${icon(net < 0 ? 'downRight' : 'up')}<span>${money(net, true)} this month</span>`;
  }

  $('#eye').addEventListener('click', () => {
    const masked = $('#balance').classList.toggle('masked');
    $('#eyeIcon').innerHTML = ICONS[masked ? 'eyeOff' : 'eye'];
    haptic();
  });

  // ---------- card ----------
  function cardHTML() {
    return `<div class="card-inner">
      <div class="face front">
        <div class="gloss"></div>
        <div class="card-top">
          <span class="card-name">Vault</span>
          <svg class="i" viewBox="0 0 24 24" style="width:24px;height:24px;opacity:.9"><path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17"/></svg>
        </div>
        <svg class="chip" viewBox="0 0 40 30"><rect x="0.5" y="0.5" width="39" height="29" rx="6" fill="#e9d8a6" stroke="#c9b27a"/><path d="M0.5 10.5h12M0.5 19.5h12M27.5 10.5h12M27.5 19.5h12M12.5 0.5v29M27.5 0.5v29" stroke="#b59a5c" fill="none"/></svg>
        <div class="card-bottom">
          <span class="card-num" data-k="short"></span>
          <span class="card-type">DEBIT</span>
        </div>
        <div class="frost">${icon('snow')}Frozen</div>
      </div>
      <div class="face back">
        <div class="stripe"></div>
        <div class="back-info">
          <div>Card number<b data-k="number"></b></div>
          <div>CVV<b data-k="cvv"></b></div>
          <div>Card holder<b data-k="holder"></b></div>
          <div>Expires<b data-k="exp"></b></div>
        </div>
      </div>
    </div>`;
  }

  function paintCard(root) {
    const c = user.data.card, shown = Date.now() < revealUntil, last4 = c.number.slice(-4);
    THEMES.forEach(t => root.classList.toggle('theme-' + t, t === c.theme));
    root.classList.toggle('frozen', c.frozen);
    $('[data-k="short"]', root).textContent = '•••• ' + last4;
    $('[data-k="number"]', root).textContent = shown ? c.number.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• •••• •••• ' + last4;
    $('[data-k="cvv"]', root).textContent = shown ? c.cvv : '•••';
    $('[data-k="holder"]', root).textContent = user.name.toUpperCase();
    $('[data-k="exp"]', root).textContent = c.exp;
  }

  cardEl.innerHTML = cardHTML();
  let flipped = false;
  function flipCard(back) {
    if (back === flipped) return;
    const from = flipped ? 180 : 0, to = back ? 180 : 0;
    flipped = back;
    spring($('.card-inner', cardEl), v => ({ transform: `rotateY(${lerp(from, to, v).toFixed(2)}deg)` }), { response: 0.6, damping: 0.78 });
  }
  cardEl.addEventListener('click', () => flipCard(!flipped));

  // ---------- weekly spending ----------
  $('#bars').innerHTML = Array.from({ length: 7 }, (_, i) =>
    `<div class="bar-col"><div class="bar-track"><div class="bar"></div></div><div class="bar-label">${'MTWTFSS'[i]}</div></div>`).join('');
  const barEls = $$('.bar', $('#bars')), barLabels = $$('.bar-label', $('#bars'));

  function weekStats() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
    const days = Array(7).fill(0);
    let lastWeek = 0;
    for (const t of user.data.tx) {
      if (t.status !== 'completed' || t.amount >= 0) continue;
      const diff = Math.floor((t.date - start) / DAY);
      if (diff >= 0 && diff < 7) days[diff] -= t.amount;
      else if (diff >= -7 && diff < 0) lastWeek -= t.amount;
    }
    return { days, total: days.reduce((a, b) => a + b, 0), lastWeek, today: (now.getDay() + 6) % 7 };
  }

  function renderWeek(mode) {
    const s = weekStats();
    $('#spendTotal').textContent = eur.format(s.total);
    const d = $('#spendDelta');
    if (s.lastWeek > 0) {
      const pct = Math.round((s.total / s.lastWeek - 1) * 100);
      d.textContent = `${pct > 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs last week`;
      d.classList.toggle('up', pct > 0);
    } else {
      d.textContent = '';
    }
    const max = Math.max(...s.days, 1);
    barEls.forEach((bar, i) => {
      const h = Math.round(8 + (s.days[i] / max) * 84);
      const old = bar._h || h;
      bar._h = h;
      bar.style.height = h + 'px';
      bar.classList.toggle('today', i === s.today);
      barLabels[i].classList.toggle('today', i === s.today);
      if (mode === 'enter') {
        spring(bar, v => ({ transform: `scaleY(${v.toFixed(4)})` }), { response: 0.75, damping: 0.72, delay: 420 + i * 45 });
      } else if (mode === 'change' && old !== h) {
        spring(bar, v => ({ transform: `scaleY(${lerp(old / h, 1, v).toFixed(4)})` }), { response: 0.6, damping: 0.75 });
      }
    });
  }

  // ---------- activity ----------
  function tileHTML(t) {
    return t.icon === 'person'
      ? `<span class="tile round" style="background:${t.color}">${esc(initials(t.name))}</span>`
      : `<span class="tile" style="background:${t.color}">${icon(t.icon)}</span>`;
  }

  function rowHTML(t) {
    const pending = t.status === 'pending';
    const cls = pending ? ' pending' : t.amount > 0 ? ' in' : '';
    return `<button class="row" type="button" data-tx="${t.id}">${tileHTML(t)}` +
      `<span class="row-text"><div class="row-name">${esc(t.name)}</div><div class="row-sub">${esc(pending ? 'Pending request' : t.cat)} · ${esc(dayLabel(t.date))}</div></span>` +
      `<span class="row-amt${cls}">${money(t.amount, true)}</span></button>`;
  }

  function renderRecent(highlightId) {
    const list = sortedTx().slice(0, 6);
    recentEl.innerHTML = list.length ? list.map(rowHTML).join('') : '<div class="empty">No activity yet</div>';
    const row = highlightId && $(`[data-tx="${highlightId}"]`, recentEl);
    if (row) spring(row, v => ({ opacity: clamp(v * 1.4), transform: `translateY(${lerp(-14, 0, v).toFixed(2)}px) scale(${lerp(0.96, 1, v).toFixed(4)})` }), { response: 0.55, damping: 0.8 });
  }

  recentEl.addEventListener('click', e => {
    const row = e.target.closest('[data-tx]');
    const t = row && findTx(row.dataset.tx);
    if (t) openTx(t);
  });

  // ---------- render ----------
  function renderAll(mode) {
    user = store.user;
    $('#avatarBtn').textContent = initials(user.name);
    $('#greet').textContent = greeting();
    $('#hello').textContent = firstName(user.name);
    $('#navTitle').textContent = firstName(user.name);
    $('#eyeIcon').innerHTML = ICONS[$('#balance').classList.contains('masked') ? 'eyeOff' : 'eye'];
    setBalance(balanceOf(user), mode);
    renderDelta();
    paintCard(cardEl);
    renderWeek(mode);
    renderRecent();
  }

  function refresh(highlightId) {
    setBalance(balanceOf(user), 'change');
    renderDelta();
    renderWeek('change');
    renderRecent(highlightId);
  }

  scroller.addEventListener('scroll', () => navbar.classList.toggle('show', scroller.scrollTop > 56), { passive: true });

  function enterBank() {
    settlePending();
    renderAll('enter');
    bank.classList.add('on');
    spring(bank, v => ({ opacity: clamp(v * 1.3), transform: `scale(${lerp(0.965, 1, v).toFixed(4)})` }), { response: 0.7 });
    $$('[data-enter]', bank).forEach((el, i) => spring(el, v => ({
      opacity: clamp(v * 1.3),
      transform: `translateY(${lerp(28, 0, v).toFixed(2)}px)`,
    }), { response: 0.7, damping: 0.86, delay: 40 + i * 45 }));
    $$('.row', recentEl).forEach((row, i) => spring(row, v => ({
      opacity: clamp(v * 1.3),
      transform: `translateY(${lerp(16, 0, v).toFixed(2)}px)`,
    }), { response: 0.7, damping: 0.86, delay: 320 + i * 40 }));
    play($('.gloss', cardEl), [
      { transform: 'translateX(-120%) skewX(-14deg)' },
      { transform: 'translateX(260%) skewX(-14deg)' },
    ], { duration: 1400, delay: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
  }

  async function exitBank() {
    await Sheet.hide();
    await spring(bank, v => ({ opacity: clamp(1 - v * 1.3), transform: `scale(${lerp(1, 0.96, v).toFixed(4)})` }), { response: 0.45 });
    bank.classList.remove('on');
    scroller.scrollTop = 0;
    navbar.classList.remove('show');
    stop($('.card-inner', cardEl));
    flipped = false;
    revealUntil = 0;
    clearTimeout(revealTimer);
  }

  // ---------- requests get "paid" after a few seconds ----------
  function settlePending() {
    for (const t of user ? user.data.tx : store.user ? store.user.data.tx : []) {
      if (t.status === 'pending' && Date.now() - t.date > 10000) t.status = 'completed';
    }
    save();
  }

  function scheduleRequest(id) {
    setTimeout(() => {
      const u = store.user;
      const t = u && u.data.tx.find(x => x.id === id);
      if (!t || t.status !== 'pending') return;
      t.status = 'completed';
      t.date = Date.now();
      save();
      if (!bank.classList.contains('on') || u !== user) return;
      refresh(t.id);
      notify({ title: `${firstName(t.name)} paid you`, sub: `${money(t.amount)} received`, icon: 'down', color: 'var(--green)' });
    }, 6000 + Math.random() * 3000);
  }

  // ---------- Send / Request / Top up ----------
  function openAmountSheet(mode, preset = {}) {
    const cfg = {
      send: { title: 'Send money', cta: 'Send', contacts: true },
      request: { title: 'Request money', cta: 'Request', contacts: true },
      topup: { title: 'Add money', cta: 'Add money', contacts: false },
    }[mode];
    let value = preset.value || '';
    let contact = preset.contact || null;

    Sheet.show(root => {
      root.innerHTML = `
        <div class="sheet-title">${cfg.title}</div>
        ${cfg.contacts
          ? `<div class="contacts">${CONTACTS.map((c, i) => `<button class="contact${c === contact ? ' sel' : ''}" type="button" data-c="${i}"><span class="av" style="background:${c.color}">${esc(initials(c.name))}</span>${esc(firstName(c.name))}</button>`).join('')}</div>`
          : `<div class="source"><span class="tile" style="background:#3a3a3c">${icon('card')}</span><div><div>Debit card •••• 9921</div><small>Arrives instantly · No fees</small></div></div>`}
        <div class="amount-entry" id="amt"></div>
        <div class="amount-hint" id="hint"></div>
        <div class="keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k => `<button class="key" type="button" data-k="${k}" aria-label="${k === 'del' ? 'Delete' : k}">${k === 'del' ? icon('del') : k}</button>`).join('')}</div>
        <button class="btn blue" type="button" id="go"><span>${cfg.cta}</span></button>`;

      const amtEl = $('#amt', root), hint = $('#hint', root), go = $('#go', root);
      let wasOver = false;

      const update = bump => {
        const [int, dec] = value.split('.');
        amtEl.textContent = '€' + Number(int || 0).toLocaleString('en-IE') + (value.includes('.') ? '.' + dec : '');
        amtEl.classList.toggle('zero', !value);
        const amt = parseFloat(value) || 0;
        const over = mode === 'send' && amt > balanceOf(user);
        hint.classList.toggle('err', over);
        hint.textContent = over ? 'Not enough money'
          : mode === 'send' ? `Available ${money(balanceOf(user))}`
          : mode === 'request' ? (contact ? `Ask ${firstName(contact.name)} to pay you` : 'Choose who to ask')
          : 'Add money to your Vault balance';
        if (over && !wasOver) { shake(amtEl); haptic(); }
        wasOver = over;
        go.disabled = !(amt > 0 && !over && (!cfg.contacts || contact));
        if (bump) amtEl.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 200, easing: 'ease-out' });
      };

      const press = k => {
        if (k === 'del') {
          if (!value) return false;
          value = value.slice(0, -1);
        } else if (k === '.') {
          if (value.includes('.')) return false;
          value = (value || '0') + '.';
        } else {
          const [int, dec] = value.split('.');
          if (dec !== undefined ? dec.length >= 2 : (int || '').length >= 6) return false;
          value = value === '0' ? k : value + k;
        }
        return true;
      };

      $('.keypad', root).addEventListener('click', e => {
        const key = e.target.closest('[data-k]');
        if (!key) return;
        if (press(key.dataset.k)) update(true);
        else shake(amtEl);
      });

      const contactsEl = $('.contacts', root);
      if (contactsEl) contactsEl.addEventListener('click', e => {
        const b = e.target.closest('[data-c]');
        if (!b) return;
        contact = CONTACTS[+b.dataset.c];
        $$('.contact', contactsEl).forEach(x => x.classList.toggle('sel', x === b));
        haptic();
        update();
      });

      go.addEventListener('click', async () => {
        const amt = Math.round((parseFloat(value) || 0) * 100) / 100, c = contact;
        await Sheet.hide();
        if (mode === 'send') {
          if (user.faceId && !(await faceId())) return;
          addTx({ name: c.name, cat: 'Transfer', icon: 'person', color: c.color, amount: -amt });
          notify({ title: `Sent ${money(amt)}`, sub: `to ${c.name}`, icon: 'up', color: 'var(--blue)' });
        } else if (mode === 'request') {
          const t = addTx({ name: c.name, cat: 'Request', icon: 'person', color: c.color, amount: amt, status: 'pending' });
          notify({ title: 'Request sent', sub: `${money(amt)} from ${c.name}`, icon: 'down', color: 'var(--orange)' });
          scheduleRequest(t.id);
        } else {
          addTx({ name: 'Top up', cat: 'Debit card •••• 9921', icon: 'plus', color: '#30d158', amount: amt });
          notify({ title: `${money(amt)} added`, sub: 'Top up from debit card', icon: 'plus', color: 'var(--green)' });
        }
      });

      update();
    });
  }

  // ---------- transaction details ----------
  function txDetailHTML(t) {
    const pending = t.status === 'pending';
    const d = new Date(t.date);
    const cls = pending ? ' pending' : t.amount > 0 ? ' in' : '';
    return `
      <div class="sheet-head">
        ${tileHTML(t)}
        <div class="sheet-name">${esc(t.name)}</div>
        <div class="sheet-amt${cls}">${money(t.amount, true)}</div>
        <div class="status${pending ? ' pending' : ''}">${icon(pending ? 'clock' : 'check')}${pending ? 'Pending' : 'Completed'}</div>
      </div>
      <div class="list-group">
        <div class="lrow"><span class="lr-text">Date</span><span class="lr-value">${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, ${timeLabel(t.date)}</span></div>
        <div class="lrow"><span class="lr-text">Category</span><span class="lr-value">${esc(t.cat)}</span></div>
        ${t.amount < 0 ? `<div class="lrow"><span class="lr-text">Paid with</span><span class="lr-value">Vault •••• ${user.data.card.number.slice(-4)}</span></div>` : ''}
        <div class="lrow"><span class="lr-text">Reference</span><span class="lr-value">${esc(t.id.toUpperCase())}</span></div>
      </div>
      ${pending ? '<button class="btn glass danger" type="button" data-action="cancel"><span>Cancel request</span></button>' : ''}
      ${t.cat === 'Transfer' && t.amount < 0 ? '<button class="btn glass" type="button" data-action="again"><span>Send again</span></button>' : ''}`;
  }

  function wireDetail(root, t) {
    root.addEventListener('click', async e => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      if (b.dataset.action === 'cancel') {
        user.data.tx = user.data.tx.filter(x => x.id !== t.id);
        save();
        await Sheet.hide();
        refresh();
        notify({ title: 'Request cancelled', sub: `${money(t.amount)} from ${t.name}`, icon: 'x', color: '#636366' });
      } else if (b.dataset.action === 'again') {
        await Sheet.hide();
        openAmountSheet('send', { contact: CONTACTS.find(c => c.name === t.name) || null, value: String(Math.abs(t.amount)) });
      }
    });
  }

  function openTx(t) {
    Sheet.show(root => {
      root.innerHTML = txDetailHTML(t);
      wireDetail(root, t);
    });
  }

  // ---------- all activity: search + filter ----------
  function openAll() {
    let filter = 'all', q = '';
    Sheet.show(root => {
      root.innerHTML = `
        <div class="sheet-title">Activity</div>
        <label class="search">${icon('search')}<input type="search" placeholder="Search" enterkeyhint="search" autocomplete="off" id="q"></label>
        <div class="seg" id="seg"><span class="thumb"></span><button type="button" data-f="all">All</button><button type="button" data-f="in">Income</button><button type="button" data-f="out">Spending</button></div>
        <div class="sheet-scroll" id="allList"></div>`;
      const list = $('#allList', root), thumb = $('.thumb', root);

      const draw = () => {
        const items = sortedTx().filter(t =>
          (filter === 'all' || (filter === 'in' ? t.amount > 0 : t.amount < 0)) &&
          (!q || `${t.name} ${t.cat}`.toLowerCase().includes(q)));
        if (!items.length) { list.innerHTML = '<div class="empty">No results</div>'; return; }
        let html = '', last = '';
        for (const t of items) {
          const day = dayLabel(t.date);
          if (day !== last) {
            if (last) html += '</div>';
            html += `<div class="day-h">${esc(day)}</div><div class="group list">`;
            last = day;
          }
          html += rowHTML(t);
        }
        list.innerHTML = html + '</div>';
      };

      $('#q', root).addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
      $('#seg', root).addEventListener('click', e => {
        const b = e.target.closest('[data-f]');
        if (!b || b.dataset.f === filter) return;
        filter = b.dataset.f;
        thumb.style.transform = `translateX(${['all', 'in', 'out'].indexOf(filter) * 100}%)`;
        haptic();
        draw();
      });
      list.addEventListener('click', e => {
        const row = e.target.closest('[data-tx]');
        const t = row && findTx(row.dataset.tx);
        if (t) pushPage(root, txDetailHTML(t), page => wireDetail(page, t));
      });
      draw();
    }, { tall: true });
  }

  // ---------- card settings ----------
  function openCardSheet() {
    Sheet.show(root => {
      const c = user.data.card;
      root.innerHTML = `
        <div class="sheet-title">Your card</div>
        <div class="card mini-card" id="miniCard">${cardHTML()}</div>
        <div class="list-group">
          <label class="lrow has-icon"><span class="lr-icon" style="background:#32ade6">${icon('snow')}</span><span class="lr-text">Freeze card</span><input type="checkbox" ${SWITCH} id="freeze" ${c.frozen ? 'checked' : ''}></label>
          <button class="lrow has-icon" type="button" id="reveal"><span class="lr-icon" style="background:var(--blue)">${icon('eye')}</span><span class="lr-text">Show card details</span>${icon('chev', 'i chev')}</button>
        </div>
        <div class="small-label">Card colour</div>
        <div class="swatches">${THEMES.map(th => `<button class="swatch theme-${th}${th === c.theme ? ' sel' : ''}" type="button" data-theme="${th}" aria-label="${th}"></button>`).join('')}</div>`;
      const mini = $('#miniCard', root);
      paintCard(mini);

      $('#freeze', root).addEventListener('change', e => {
        c.frozen = e.target.checked;
        save();
        paintCard(mini);
        paintCard(cardEl);
        notify(c.frozen
          ? { title: 'Card frozen', sub: 'Card payments are paused', icon: 'snow', color: '#32ade6' }
          : { title: 'Card unfrozen', sub: 'You can use your card again', icon: 'check', color: 'var(--green)' });
      });

      $('#reveal', root).addEventListener('click', async () => {
        await Sheet.hide();
        if (user.faceId && !(await faceId())) return;
        revealUntil = Date.now() + 30000;
        paintCard(cardEl);
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
        flipCard(true);
        notify({ title: 'Card details shown', sub: 'Hidden again in 30 seconds', icon: 'eye', color: 'var(--blue)' });
        clearTimeout(revealTimer);
        revealTimer = setTimeout(() => {
          revealUntil = 0;
          if (user) paintCard(cardEl);
          flipCard(false);
        }, 30000);
      });

      $('.swatches', root).addEventListener('click', e => {
        const b = e.target.closest('[data-theme]');
        if (!b) return;
        c.theme = b.dataset.theme;
        save();
        $$('.swatch', root).forEach(x => x.classList.toggle('sel', x === b));
        paintCard(mini);
        paintCard(cardEl);
        mini.animate([{ transform: 'scale(0.96)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
        haptic();
      });
    });
  }

  // ---------- profile ----------
  function openProfile() {
    Sheet.show(root => {
      const since = new Date(user.created).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      root.innerHTML = `
        <div class="profile-head">
          <span class="avatar xl">${esc(initials(user.name))}</span>
          <div class="p-name">${esc(user.name)}</div>
          <div class="p-mail">${esc(user.email)}</div>
          <div class="p-since">Member since ${since}</div>
        </div>
        <div class="list-group">
          <label class="lrow has-icon"><span class="lr-icon" style="background:var(--green)">${icon('face')}</span><span class="lr-text">Face ID</span><input type="checkbox" ${SWITCH} id="faceSw" ${user.faceId ? 'checked' : ''}></label>
          <button class="lrow has-icon" type="button" id="resetBtn"><span class="lr-icon" style="background:var(--orange)">${icon('reset')}</span><span class="lr-text">Reset demo data</span>${icon('chev', 'i chev')}</button>
        </div>
        <div class="list-group"><button class="lrow danger" type="button" id="logoutBtn">Log out</button></div>
        <div class="list-group"><button class="lrow danger" type="button" id="deleteBtn">Delete account</button></div>
        <p class="fine">Demo app · Your data is stored only on this device.</p>`;

      $('#faceSw', root).addEventListener('change', async e => {
        const sw = e.target;
        if (sw.checked) {
          sw.disabled = true;
          const ok = await faceId();
          sw.disabled = false;
          if (!ok) { sw.checked = false; return; }
          user.faceId = true;
        } else {
          user.faceId = false;
          notify({ title: 'Face ID turned off', sub: 'You’ll use your password instead', icon: 'face', color: '#636366' });
        }
        save();
      });

      $('#resetBtn', root).addEventListener('click', async () => {
        const ok = await alertDialog({
          title: 'Reset demo data?',
          message: 'Your balance and activity will go back to the starting demo data.',
          actions: [{ label: 'Cancel', value: false }, { label: 'Reset', value: true, style: 'destructive' }],
        });
        if (!ok) return;
        user.data = seedData(user.data.card);
        save();
        await Sheet.hide();
        refresh();
        notify({ title: 'Demo data reset', sub: 'Balance and activity restored', icon: 'reset', color: 'var(--orange)' });
      });

      $('#logoutBtn', root).addEventListener('click', async () => {
        const ok = await alertDialog({
          title: 'Log out?',
          message: user.faceId ? 'You can sign back in with Face ID or your password.' : 'You’ll need your password to sign back in.',
          actions: [{ label: 'Cancel', value: false }, { label: 'Log out', value: true, style: 'destructive' }],
        });
        if (!ok) return;
        busy = true;
        await exitBank();
        store.logout();
        user = null;
        showAuth('login');
        busy = false;
      });

      $('#deleteBtn', root).addEventListener('click', async () => {
        const ok = await alertDialog({
          title: 'Delete account?',
          message: 'This removes your account and all of its data from this device.',
          actions: [{ label: 'Cancel', value: false }, { label: 'Delete', value: true, style: 'destructive' }],
        });
        if (!ok) return;
        busy = true;
        await exitBank();
        store.remove();
        user = null;
        showAuth('welcome');
        busy = false;
      });
    });
  }

  // ---------- wiring ----------
  $('.actions').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'card') openCardSheet();
    else openAmountSheet(b.dataset.act);
  });
  $('#avatarBtn').addEventListener('click', openProfile);
  $('#seeAll').addEventListener('click', openAll);

  async function lock() {
    if (busy || !user) return;
    busy = true;
    await exitBank();
    if (user.faceId) {
      await wait(120);
      if (await faceId()) enterBank();
      else showAuth('login');
    } else {
      store.logout();
      user = null;
      showAuth('login');
    }
    busy = false;
  }
  $$('.lock-btn').forEach(b => b.addEventListener('click', lock));

  // Lock again after a minute in the background, like a real banking app
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 60000 && bank.classList.contains('on')) lock();
  });

  addEventListener('resize', measure);

  // ======================================================================
  // Boot
  // ======================================================================
  $$('.sw').forEach(upgradeSwitch);

  (async () => {
    measure();
    await wait(350);
    const u = store.user;
    if (!u) {
      showAuth(store.lastUser ? 'login' : 'welcome');
    } else if (u.faceId) {
      busy = true;
      const ok = await faceId();
      busy = false;
      if (ok) enterBank();
      else showAuth('login');
    } else {
      enterBank();
    }
  })();
})();
