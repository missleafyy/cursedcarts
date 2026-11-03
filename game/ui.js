// Carl's Cursed Cartridges: drawing, input, every screen. Immediate-mode UI on a 1672x941 canvas (the storefront's own size).
// House style comes from the storefront: rusted metal frames (textured from the PNG itself), dark CRT glass,
// terminal-green text, neon-pink headers, keypad-style buttons.
(function () {
const S = window.Sprout, D = window.DATA, G = window.G;
const W = 1672, H = 941, CELL = 30;
const cv = document.getElementById('screen'), ctx = cv.getContext('2d');
const INK = '#120d17', GLASS = '#1a1320', GLASS2 = '#241a2c', CREAM = '#d8cdbd', DIM = '#8d7f94', PINK = '#d9538f', LIME = '#9fd86f', CRT = '#86d99a', RED = '#e0553f', AMBER = '#d9a441', RUST = '#7a4a3a';
Object.assign(S.font.colors, { normal: [CREAM, INK], white: ['#efe6d6', INK], pink: [PINK, INK], green: [LIME, INK], crt: [CRT, '#0c1a12'], red: [RED, INK], yellow: [AMBER, INK], gray: [DIM, INK], dark: [INK, null], blue: [CRT, INK] });

// ---- layout of things painted in the storefront PNG
const R = {
  door: [8, 95, 192, 600], keypad: [207, 328, 52, 78], alarm: [208, 258, 44, 42], fuse: [230, 103, 58, 92], poster: [345, 80, 125, 190],
  case: [272, 285, 253, 315], sign: [505, 0, 1025, 92], window: [566, 110, 724, 424], shutter: [1322, 100, 303, 445],
  bell: [1027, 610, 86, 70], tablet: [1115, 557, 190, 132], phone: [1292, 565, 100, 138], terminal: [1387, 487, 280, 242], sticky: [1515, 703, 66, 58],
  sticker: [35, 672, 100, 53], barcode: [135, 683, 100, 45], trash: [88, 790, 167, 151], server: [1246, 794, 110, 126], tower: [1365, 785, 195, 156],
  t_buy: [1468, 538, 60, 18], t_sell: [1472, 556, 60, 17], t_inv: [1470, 573, 95, 17], t_disp: [1466, 590, 90, 17],
};
const GR = {
  stock: { x: 268, y: 744, label: 'STOCK' }, stock2: { x: 268, y: 744, label: 'BACK SHELF' }, mat: { x: 268, y: 594, label: 'COUNTER' },
  stash: { x: 330, y: 92, label: 'BEHIND THE POSTER' }, trash: { x: 98, y: 628, label: 'TRASH' }, server: { x: 1045, y: 800, label: 'RACK BAY' },
};
const CASE = i => [295 + 63.5 * (i % 3), 332 + 85 * Math.floor(i / 3), 67, 56];
const inR = (r, x = M.x, y = M.y) => x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3];

// ---- assets: the user's PNGs, drawn as they are
const IMG = {};
function load() {
  const list = { rail: 'art/layers/rail.png', lot: 'art/raw/garbage_lot.png', plate: 'art/raw/plate.png', press: 'art/raw/press.png', bg: 'art/raw/storefront.png', room: 'art/raw/ass_room.png', shutter: 'art/layers/shutter.png' };
  for (const k of ['carl', 'linda', 'ghost', 'tiny', 'kid', 'robed', 'monitor', 'dennis', 'wick', 'sister', 'leafy', 'stringer', 'pat', 'vane', 'dealer']) list['c_' + k] = `art/cast/${k}.png`;
  const arts = new Set(Object.values(D.ITEMS).map(i => i.art));
  for (const u of ['window','crt','clip','win_x','win_x2','tab_pink','tab_off','tab_tan','tray','b_tan','b_pink','b_green','p_tan','p_pink','p_green','x_pink','c_empty','c_pink','c_green','meter','grid','paper','note','plate','i_cart','i_box','i_gear','i_trash','i_heart','i_star','i_recycle', 'speech', 'st_plate', 'st_gauge', 'bar_green', 'bar_orange', 'bar_pink', 'terminal', 'sheet_big', 'sheet_pad', 'sheet_rule', ...['tan', 'green', 'pink'].flatMap(c => ['n', 'h', 'p'].map(t => `btn_${c}_${t}`)), 'set_panel', 'sl_empty', 'sl_green', 'sl_pink', 'knob_n', 'knob_h', 'knob_p', ...['master', 'music', 'sfx', 'mute'].flatMap(n => ['ai_' + n + '_on', 'ai_' + n + '_off']), 'stamp_circle_d', 'stamp_rect_d', 'stamp_circle_p', 'stamp_rect_p', 'check_off', 'check_on', 'tip_plate', 'cursor', 'phone', 'app_mail', 'app_rep', 'app_sheet', 'pk_lucky', 'pk_coins', 'pk_door', 'pk_human', 'pk_lease', 'pk_badge', 'sw_on', 'sw_off', 'mute_on', 'mute_off', 'repo_sheet', 'identifier', 'pa_off', 'pa_on', 'pa_bar', 'ad_pretzel', 'ad_escal', 'ad_handheld', 'ad_point', 'ad_suits', 'ad_burst']) list['u_' + u] = `art/ui/${u}.png`;
  for (const a of ['room', 'evap_off', 'evap_on', 'plate_off', 'plate_on', 'press_idle', 'press_run', 'press_jam', 'storage', 'rack', 'scan_off', 'scan_on', 'r_base', 'r_solv', 'r_stab', 'r_fill', 'jar_pharma', 'jar_street', 'jar_cut', 'jar_junk', 'dial', 'needle', 'ti_chem', 'ti_reag', 'ti_press', 'crate_shut', 'crate_open', 'tray', 'flask_empty', 'flask_mix', 'flask_boil', 'flask_burnt', ...[0, 1, 2, 3, 4, 5].flatMap(i => ['smoke_l' + i, 'smoke_d' + i])]) list['l_' + a] = `art/lab/${a}.png`;
  for (const a of ['jar_pharma', 'jar_street', 'jar_cut', 'jar_junk']) list['i_' + a] = `art/lab/${a}.png`;
  for (let i = 0; i < 8; i++) list['w' + i] = `art/layers/walk${i}.png`;
  for (const a of arts) list['i_' + a] = `art/items/${a}.png`;
  return Promise.all(Object.entries(list).map(([k, src]) => new Promise(res => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => { console.warn('missing ' + src); res(); }; im.src = src; })));
}
let rustH = null, rustV = null;
function buildTextures() {
  const mk = (sx, sy, w, h) => { const c = S.canvas(w, h); c.getContext('2d').drawImage(IMG.bg, sx, sy, w, h, 0, 0, w, h); return ctx.createPattern(c, 'repeat'); };
  rustH = mk(600, 0, 400, 18);    // rust strip off the sign board
  rustV = mk(1296, 120, 18, 400);  // rust strip off the window post
}

// ---- input
const M = { x: 0, y: 0, down: false, pressed: false, released: false, right: false };
function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; }
addEventListener('resize', fit);
const toMouse = e => { const r = cv.getBoundingClientRect(); M.x = (e.clientX - r.left) * W / r.width; M.y = (e.clientY - r.top) * H / r.height; };
addEventListener('mousemove', toMouse);
addEventListener('mousedown', e => { toMouse(e); S.audio.unlock(); if (e.button === 2) M.right = true; else { M.down = M.pressed = true; } });
addEventListener('mouseup', e => { toMouse(e); if (e.button !== 2) { M.down = false; M.released = true; } });
addEventListener('contextmenu', e => e.preventDefault());
const keys = new Set();
addEventListener('keydown', e => { S.audio.unlock(); keys.add(e.code); if (e.code === 'Tab') e.preventDefault(); if (e.code === 'F11') { e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } });

// ---- primitives
let mOff = null;   // offset of the popup being drawn; its dim backdrop stays put
const rect = (x, y, w, h, c) => { ctx.fillStyle = c; if (mOff && !x && !y && w === W && h === H) ctx.fillRect(-mOff[0], -mOff[1], w, h); else ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
const proxy = { img: (im, x, y) => ctx.drawImage(im, x, y) };
let termGlow = null;   // phosphor glow while drawing on the terminal's screen
let AB = null;   // text audit: the box the current text must stay inside
const box = (x, y, w, h, n, m = 10) => { AB = [x + m, y + m, w - 2 * m, h - 2 * m, n || modal || 'ui']; };
function T(str, x, y, o = {}) {
  let sc = o.s || 2; if (o.fit) { const fw = S.font.width(str); if (fw * sc > o.fit) sc = o.fit / fw; }
  if (window.__audit && AB) { const tw = S.font.width(str) * sc, x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x; if (x0 < AB[0] - 1 || x0 + tw > AB[0] + AB[2] + 1 || y < AB[1] - 1 || y + 9 * sc > AB[1] + AB[3] + 1) window.__audit.push(`${AB[4]}: "${String(str).slice(0, 46)}" at ${Math.round(x0)},${Math.round(y)} w${Math.round(tw)} box ${AB.slice(0, 4).map(Math.round)}`); }
  ctx.save(); if (termGlow) { ctx.shadowColor = termGlow; ctx.shadowBlur = 10; } ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(sc, sc);
  const w = S.font.draw(proxy, str, 0, 0, { color: o.color || 'normal', align: o.align }); ctx.restore(); return w * sc;
}
function TW(str, x, y, w, o = {}) {  // wrapped; returns height
  const sc = o.s || 2, lh = (o.lh || 11) * sc, lines = S.font.wrap(String(str), (w - 14) / sc);
  lines.forEach((l, i) => T(l, x, y + i * lh, o)); return lines.length * lh;
}
const wrapH = (str, w, sc = 2) => S.font.wrap(String(str), w / sc).length * 11 * sc;
// the one panel: rust frame, rivets, CRT glass
function panel(x, y, w, h, title, o = {}) {
  const b = o.thin ? 6 : 12;
  ctx.save(); ctx.fillStyle = rustH; ctx.translate(x, y); ctx.fillRect(0, 0, w, b); ctx.fillRect(0, h - b, w, b); ctx.fillStyle = rustV; ctx.fillRect(0, 0, b, h); ctx.fillRect(w - b, 0, b, h); ctx.restore();
  rect(x, y, w, 2, INK); rect(x, y + h - 2, w, 2, INK); rect(x, y, 2, h, INK); rect(x + w - 2, y, 2, h, INK);
  rect(x + b, y + b, w - 2 * b, h - 2 * b, o.fill || GLASS); rect(x + b, y + b, w - 2 * b, 2, INK); rect(x + b, y + b, 2, h - 2 * b, INK);
  if (!o.thin) for (const [a, c] of [[x + 3, y + 3], [x + w - 9, y + 3], [x + 3, y + h - 9], [x + w - 9, y + h - 9]]) { rect(a, c, 6, 6, '#3d2b35'); rect(a + 1, c + 1, 2, 2, '#a07a62'); }
  if (title) { T(title, x + b + 12, y + b + 10, { color: o.titleColor || 'pink', s: o.ts || 3 }); rect(x + b + 12, y + b + 10 + 11 * (o.ts || 3), w - 2 * b - 24, 2, PINK); }
}
// THE RULE: official things are paper forms in ink (bill of sale, ledger, newspaper, rules). Electronic things stay on their own screens.
const PINK_INK = '#2b2130', PAPER = '#d3c8ae', PAPER2 = '#c2b69c', PAPER_EDGE = '#8d8170';
const SCREEN_COLS = Object.assign({}, S.font.colors);
const INK_COLS = { normal: ['#2b2130', null], white: ['#2b2130', null], pink: ['#a01f58', null], green: ['#2c6e3c', null], crt: ['#2c5a48', null], red: ['#a32a1e', null], yellow: ['#7a4e10', null], gray: ['#4d3f46', null], blue: ['#2c5a48', null] };
let inked = false;
const TERM_COLS = { normal: ['#b6ffc4', null], white: ['#d8ffe0', null], crt: ['#b6ffc4', null], green: ['#7dff9e', null], gray: ['#5fa877', null], yellow: ['#ffd76a', null], pink: ['#ff7fb0', null], red: ['#ff7a66', null], blue: ['#b6ffc4', null] };
function termInk() { Object.assign(S.font.colors, TERM_COLS); termGlow = '#5dff9aa0'; }
function ink(on) { inked = on; termGlow = null; if (!on) AB = null; Object.assign(S.font.colors, on ? INK_COLS : SCREEN_COLS); }
// nine-slice over Leafy's UI sheet. cols [left, centreStart, centreEnd, right], rows the same; borders scale by k, centre stretches.
function nine(im, x, y, w, h, c, r, k = 1, top = 0, smooth = false) {
  const IW = im.width, IH = im.height, L = c[0] * k, R2 = c[3] * k, T2 = (r[0] - top) * k, B = r[3] * k, mw = w - L - R2, mh = h - T2 - B;
  const sx = [[0, c[0]], [c[1], c[2] - c[1]], [IW - c[3], c[3]]], dx = [[x, L], [x + L, mw], [x + w - R2, R2]];
  const sy = [[top, r[0] - top], [r[1], r[2] - r[1]], [IH - r[3], r[3]]], dy = [[y, T2], [y + T2, mh], [y + h - B, B]];
  ctx.imageSmoothingEnabled = smooth; ctx.imageSmoothingQuality = 'high';
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.drawImage(im, sx[i][0], sy[j][0], sx[i][1], sy[j][1], dx[i][0], dy[j][0], dx[i][1], dy[j][1]);
}
// Your paper sheets. Big forms use a whole sheet; small slips are nine-sliced from the big sheet so their edges stay torn, not squashed.
// the flat part of sheet_big: clear of the curled corners, tears and bottom fold
const SHEET = (x, y, w, h) => { const ty = y + Math.max(22, h * .055), ry = ty + 30, top = Math.max(ry + 12, y + h * .15); return { l: x + w * .09, r: x + w * .93, ty, ry, top, bot: y + h * .9, tx: x + w * .16 }; };
function paper(x, y, w, h, title, sub, kind) {
  ctx.save(); ctx.shadowColor = '#0a0710a0'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 6;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (h >= 300 || kind) ctx.drawImage(IMG['u_sheet_' + (kind || 'big')], x, y, w, h);
  else {
    const im = IMG.u_sheet_big, k = Math.min(.55, Math.max(.28, h / 170));
    ctx.shadowColor = 'transparent';
    nine(im, x, y, w, h, [60, 200, 380, 60], [46, 200, 360, 50], k, 12, true);
    ctx.drawImage(im, 110, 120, 270, 240, x + 60 * k, y + 34 * k, w - 120 * k, h - 84 * k);
  }
  ctx.restore();
  ink(true); box(x, y, w, h, title || (modal ? modal : 'slip'), h < 120 ? 4 : 10);
  if (title && !kind && h >= 300) { const q = SHEET(x, y, w, h); T(title, q.tx, q.ty, { s: 3, color: 'normal' }); if (sub) T(sub, q.r, q.ty + 6, { align: 'right', color: 'gray' }); rect(q.tx, q.ry, q.r - q.tx, 3, PINK_INK); }
  else if (title) { const tx = kind === 'rule' ? x + 44 : x + Math.max(50, w * .14); T(title, tx, y + 26, { s: 3, color: 'normal' }); if (sub) T(sub, x + w - 46, y + 32, { align: 'right', color: 'gray' }); rect(x + 44, y + 56, w - 66, 3, PINK_INK); }
  if (window.__audit && !kind && h >= 300) { const q = SHEET(x, y, w, h); AB = [q.l, q.top, q.r - q.l, q.bot - q.top]; }
}
const S_hash = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
function stampMark(text, x, y) {   // your stamp art; SOLD gets the dark round one, BOUGHT the pink box
  const round = text === 'SOLD', im = round ? IMG.u_stamp_circle_d : IMG.u_stamp_rect_p, w = round ? 100 : 136, h = w * im.height / im.width;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.17); ctx.globalAlpha = .9; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -w / 2, -h / 2, w, h);
  ctx.imageSmoothingEnabled = false; ctx.scale(2, 2); S.font.draw(proxy, text, 0, -5, { color: round ? '#8f2a40' : '#d84c86', align: 'center', shadow: false }); ctx.restore();
}
function formRow(x, y, w, label, val, o = {}) { T(label, x, y, { color: o.color || 'gray' }); T(val, x + w, y, { align: 'right', color: o.vcolor || 'normal' }); rect(x, y + 20, w, 1, PAPER_EDGE); }
function checkbox(x, y, on) { const im = on ? IMG.u_check_on : IMG.u_check_off, k = 26 / IMG.u_check_off.width; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x, y + 26 - im.height * k, im.width * k, im.height * k); }
// keypad buttons, same three key colours as the Prop Pills terminal
let hot = false;
function btn(x, y, w, h, label, o = {}) {
  const dis = o.disabled, over = !dis && !G_held && !lockBtn && !underBill() && inR([x, y, w, h]);
  (window.__btns = window.__btns || []).push({ label, x, y, w, h, dis });
  const kind = o.kind || 'tan', tone = kind === 'dark' ? 'tan' : kind, down = over && M.down, im = IMG[`u_btn_${tone}_${dis || down ? 'p' : over ? 'h' : 'n'}`];
  const k = Math.min(.22, h / 235), ink2 = dis ? '#4a3f48' : { tan: '#2b2130', pink: '#fff0f4', green: '#07170d' }[tone];
  ctx.save(); if (dis) ctx.globalAlpha = .6;
  nine(im, x, y, w, h, [62, 110, im.width - 110, 62], [62, 90, im.height - 90, 62], k, 0, true);
  ctx.restore();
  const lw = S.font.width(label), avail = w - 16, sc = Math.min(o.s || 2, avail / Math.max(1, lw)); if (window.__audit && lw * (o.s || 2) > avail) window.__audit.push(`shrunk button "${label}" ${lw * (o.s || 2)} in ${w}`);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x + w / 2), Math.round(y + (h - 9 * sc) / 2 + (down ? 2 : 0))); ctx.scale(sc, sc);
  S.font.draw(proxy, label, 0, 0, { color: ink2, align: 'center', shadow: false }); ctx.restore();
  if (over) hot = true;
  if (over && M.released && pressedOn && inR([x, y, w, h], pressedOn.x, pressedOn.y)) { S.sfx('select'); M.released = false; return true; }
  return false;
}
let pressedOn = null, G_held = null;
function hotspot(r, label, sub) {
  if (G_held || modal || underBill()) return false;
  const over = inR(r);
  if (over) { hot = true; ctx.strokeStyle = LIME; ctx.lineWidth = 2; ctx.strokeRect(r[0], r[1], r[2], r[3]); tip = { title: label, lines: sub ? [sub] : [] }; }
  if (over && M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { M.released = false; S.sfx('cursor'); return true; }
  return false;
}
let tip = null;
function fitImg(im, x, y, w, h, pad = 2) { const a = Math.min((w - pad * 2) / im.width, (h - pad * 2) / im.height), dw = im.width * a, dh = im.height * a; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); }

function drawItem(it, px, py, cell = CELL) {
  const def = D.ITEMS[it.id], im = IMG['i_' + (it.art || def.art)]; if (!im) return;
  const [w, h] = G.dims(it);
  ctx.save(); ctx.translate(px + w * cell / 2, py + h * cell / 2); if (it.rot % 2) ctx.rotate(Math.PI / 2); if (it.flip) ctx.scale(-1, 1); fitImg(im, -def.w * cell / 2, -def.h * cell / 2, def.w * cell, def.h * cell); ctx.restore();
  if (it.curse) { rect(px + 2, py + 2, 18, 18, it.curse >= 4 ? '#ff2a4a' : PINK); T(String(it.curse), px + 6, py + 2, { color: 'white' }); }
  if (it.heat > 0 && it.owned) rect(px + 12, py + 2, 8, 8, RED);
  if (it.labelled) rect(px + 22, py + 2, 8, 8, AMBER);
}

// ---- screens state
let termTab = 'buy', lab = null, scr = 'title', modal = null, ass = null, shutterT = 1, shutterGoal = 1, frame = 0, clientT = 0, clientLine = '', stockPage = 'stock', showTrash = false, toast = null, toastT = 0, held = null, heldFrom = null, heldRot = 0, aEstimate = 0, reportPage = 0, talkI = 0, talkReply = null, modalData = {}, seenHints = {};
const say = t => { toast = t; toastT = 200; };

// ---- client helpers
function artOf(c) { return c.art || c.shape; }
const nameOf = c => c.name;
const ENTER = 110, LEAVE = 100, MENU_X = 1296, MENU_W = 366;
let gone = null, sp = { text: '', n: 0 }, lockBtn = false;
function arrive() { clientT = 0; talkI = 0; talkReply = null; gone = null; sp = { text: '', n: 0 }; const c = G.client; if (!c) return; S.sfx('step'); aEstimate = 0; c.tries = 0; c.menuT = 0;
  if (c.intent === 'appraise') { const it = G.makeItem(G.pick(D.CARTS.concat(D.ODDS))); G.place(it, 'mat'); c.appr = it; c.fee = 0; const ref = G.base(it) * (1 + G.trueCond(it)[1] / 100); c.truth = Math.round(ref); aEstimate = Math.round(G.base(it)); }
  if (c.intent === 'swap') { const [it] = G.goods('junk', 1); G.place(it, 'mat'); }
  if (c.talk) stepTalk(); }
function stepTalk() { const c = G.client; while (c.talk && talkI < c.talk.length && c.talk[talkI].run) { talkReply = c.talk[talkI].run(G); talkI++; return; } }
// send the current customer away: they walk off, and the window stays empty until you call the next one
function leave() { const c = G.client; if (c) { gone = { k: artOf(c), t: 0 }; c.dismissed = true; } G.endClient(); sp = { text: '', n: 0 }; S.sfx('step'); }
function callNext() { if (gone) return; G.next(); if (G.client) arrive(); }
function drawPerson(k, cx, bob) {
  const a = D.CAST[k], im = IMG['c_' + k]; if (!im || !a) return;
  const w = im.width * a.scale, h = im.height * a.scale;
  ctx.save(); ctx.beginPath(); ctx.rect(R.window[0], R.window[1], R.window[2], R.window[3]); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.drawImage(im, cx - w / 2, a.feet - h + bob, w, h); ctx.restore();
}
function drawClient() {
  if (gone) { gone.t++; const a = D.CAST[gone.k], walk = a && a.hover ? Math.sin(frame / 30) * 8 : -Math.abs(Math.sin(gone.t / 10)) * 7; drawPerson(gone.k, 760 + gone.t * (720 / LEAVE), walk); if (gone.t >= LEAVE) gone = null; }
  const c = G.client; if (!c) return;
  const k = artOf(c), a = D.CAST[k]; if (!a) return;
  clientT++;
  const e = Math.min(1, clientT / ENTER), ease = 1 - Math.pow(1 - e, 1.6);
  const bob = a.hover ? Math.sin(frame / 30) * 8 : (e < 1 ? -Math.abs(Math.sin(clientT / 10)) * 7 : 0);
  drawPerson(k, 760 - (1 - ease) * 380, bob);
}
const arrived = () => clientT >= ENTER;

// ---- what a seller is offering: held up in the window, in front of them. Hover to read, click to look closer.
function offerRects() {
  const c = G.client; if (!c || c.talk || c.walked || !arrived() || shutterT > .02) return [];
  const list = G.matTheirs(), n = list.length; if (!n) return [];
  const size = n <= 2 ? 90 : Math.min(76, Math.floor(350 / n)), gap = 8, tw = n * size + (n - 1) * gap, x0 = 748 - tw / 2;
  return list.map((it, i) => ({ it, r: [x0 + i * (size + gap), 526 - size, size, size] }));
}
function drawOffered() {
  const c = G.client;
  for (const { it, r } of offerRects()) {
    const pop = Math.min(1, (clientT - ENTER) / 10), lift = (1 - pop) * 40 + Math.sin(frame / 40) * 2;
    ctx.save(); ctx.beginPath(); ctx.rect(R.window[0], R.window[1], R.window[2], R.window[3]); ctx.clip();
    ctx.globalAlpha = pop; fitImg(IMG['i_' + D.ITEMS[it.id].art], r[0], r[1] + lift, r[2], r[3], 0); ctx.restore();
    const t = '$' + G.buyPrice(it, c), tw = S.font.width(t) * 2 + 12, tx = r[0] + r[2] / 2 - tw / 2;
    rect(tx, r[1] + r[3] - 22, tw, 20, '#6d1f42'); T(t, tx + 6, r[1] + r[3] - 21, { color: 'white' });
    if (inR(r) && !G_held && !modal) { ctx.strokeStyle = LIME; ctx.lineWidth = 2; ctx.strokeRect(r[0], r[1], r[2], r[3]); hot = true; }
  }
}

// ---- little speech box beside the customer, printed a letter at a time
function speechText(c) {
  if (c.talk) { if (talkReply) return talkReply; const st = c.talk[talkI]; return st && st.t || ''; }
  if (c.walked) return '{red}They walked out.{/}';
  return (c.note ? '{red}' + c.note + '{/}\n' : '') + (c.lastReply || c.line);
}
// Text like Probably Stolen's (Febucci TextAnimator, its strings use <wave> and <slide>): letters arrive one at a time,
// small pop and fade as they land, and emphasised words keep moving. {pink}/{yellow}/{green} wave, {red} slides.
const TEXT_SPEED = .2;   // letters per frame
function typed(str, x, y, w, count, age) {
  const lh = 22, lines = S.font.wrap(String(str), (w - 14) / 2); let left = count, first = 0;
  lines.forEach((l, i) => {
    if (left <= 0) return;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(y + i * lh)); ctx.scale(2, 2);
    S.font.draw(proxy, l, 0, 0, { color: 'normal', count: left, first, fx: (n, c) => {
      const t = Math.min(1, age(n) / 9), e = 1 - (1 - t) * (1 - t); ctx.globalAlpha = t;
      let dx = 0, dy = (1 - e) * 5;
      if (c === 'red') dx += Math.sin(frame * .07 + n * .45) * 1;
      else if (c) dy += Math.sin(frame * .09 + n * .55) * 1;
      return { dx, dy };
    } });
    ctx.restore(); const len = S.font.length(l); left -= len; first += len;
  }); return lines.length * lh; }
function drawSpeech() {
  const c = G.client, text = speechText(c);
  if (text !== sp.text) sp = { text, n: 0 };
  const total = S.font.length(text);
  if (sp.n < total) {
    if (sp.wait > 0) sp.wait--;
    else {
      const plain = String(text).replace(/\{[^}]*\}/g, ''), was = Math.floor(sp.n);
      sp.n = Math.min(total, sp.n + TEXT_SPEED); const now = Math.floor(sp.n);
      if (now > was) { const ch = plain[now - 1]; if (ch && ch !== ' ' && now % 2 === 0) { const tk = G.client && G.client.talk && G.client.talk[talkI]; S.voice(tk && tk.who || (G.client ? artOf(G.client) : 'x'), ch); }; if ('.!?'.includes(ch)) sp.wait = 20; else if (',:;'.includes(ch)) sp.wait = 9; }
    }
  }
  const done = sp.n >= total;
  const carl = c.talk && !talkReply && c.talk[talkI] && c.talk[talkI].who === 'carl';
  const x = 946, w = 330, y = 122, st = c.talk && !talkReply && c.talk[talkI];
  const choices = done && st && st.choices;
  const btnH = done && c.talk ? (choices ? choices.length * 40 + 6 : 44) : (done && c.walked ? 44 : 0);
  const textH = S.font.wrap(String(text), (w - 48 - 14) / 2).length * 22;
  const h = 52 + textH + btnH + 54;
  if (window.__audit && y + h > 534) window.__audit.push(`speech too tall (${y + h}): ${String(text).slice(0, 50)}`);
  const sim = IMG.u_speech; nine(sim, x, y, w, h, [290, 400, 1100, 90], [90, 200, 450, 230], .25, 0, true); box(x, y, w, h, 'speech', 0);
  T(carl ? '{yellow}CARL{/}' : nameOf(c), x + 26, y + 22, { color: 'pink' });
  typed(text, x + 26, y + 44, w - 48, Math.ceil(sp.n), n => (sp.n - n) / TEXT_SPEED);
  // click anywhere on the box to finish printing
  if (!done && !modal && M.released && pressedOn && inR([x, y, w, h], pressedOn.x, pressedOn.y)) { sp.n = total; M.released = false; }
  let by = y + 50 + textH;
  if (!done) { ink(false); return; }
  if (c.talk) {
    if (choices) choices.forEach((ch, i) => { const dis = ch.ok && !ch.ok(); if (btn(x + 24, by + i * 40, w - 48, 36, ch.t, { kind: i === 0 ? 'pink' : 'tan', disabled: dis })) { talkReply = ch.fn(G) || ''; talkI++; if (!talkReply) { stepTalk(); if (!talkReply && talkI >= c.talk.length) leave(); } } });
    else if (btn(x + w - 158, by, 134, 36, talkReply && talkI >= c.talk.length || talkI >= c.talk.length - 1 && !talkReply ? 'GOODBYE' : 'NEXT', { kind: 'green' })) {
      if (talkReply) { talkReply = null; if (talkI >= c.talk.length) leave(); else stepTalk(); }
      else { talkI++; stepTalk(); if (!talkReply && talkI >= c.talk.length) leave(); }
    }
  } else if (c.walked && btn(x + w - 158, by, 134, 36, 'OK', { kind: 'green' })) leave();
  ink(false);
}
// ---- the offer menu: slides out over the shutter once they've said their piece
function wantsText(c) { return (c.want || []).map(t => ({ CART: 'CARTS', ODD: 'ODDWARE', PILL: 'PILLS', FOOD: 'FOOD', JUNK: 'GARBAGE', WEAPON: 'GUNS', AMMO: 'AMMO', CURSED: 'CURSED' }[t])).join(', '); }
let billOff = [0, 0], billR = null, billDrag = null, billDue = false, billOn = false;
const underBill = () => !billOn && !billDrag && billR && G.client && inR(billR);
function drawMenu() {
  const c = G.client; billR = null; if (c.talk || c.walked) return;
  if (sp.n < S.font.length(sp.text) && !c.menuT) return;
  c.menuT = Math.min(20, (c.menuT || 0) + 1);
  const w0 = MENU_W, both = c.want && G.matOwned().length && G.matTheirs().length, h = both ? 590 : 398, w = MENU_W, keep = (billOff = [Math.max(-MENU_X + 2, Math.min(W - MENU_X - w0 - 2, billOff[0])), Math.max(-90, Math.min(H - 92 - h - 2, billOff[1]))]), x = MENU_X + billOff[0], y = 92 + billOff[1] + Math.pow(1 - c.menuT / 20, 2) * 500, hot0 = hot; hot = false;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 8, 0, w + 20, H); ctx.clip();
  paper(x, y, w, h, c.intent === 'appraise' ? 'APPRAISAL' : c.intent === 'swap' ? 'SWAP SLIP' : 'BILL OF SALE', null, 'rule');
  billBody(c, x, y, w, h);
  if (c.mark) stampMark(c.mark[0], x + w * .7, y + h * .54);
  ink(false); ctx.restore();
  billR = [x, y, w, h];   // drag it by any blank part of the sheet
  if (billDrag) { if (M.down) { billOff = [M.x - billDrag[0], M.y - billDrag[1]]; } else billDrag = null; M.released = false; hot = true; }
  else if (M.pressed && !hot && !modal && !held && inR(billR)) { billDrag = [M.x - billOff[0], M.y - billOff[1]]; pressedOn = null; M.pressed = false; }
  hot = hot || hot0;
}
// The bill is a real form on your ruled sheet: every row sits on one of its printed lines, and the columns follow its printed verticals.
const RULE_L = 44, RULE_C1 = .705, RULE_C2 = .798, RULE_R = 22;
function billBody(c, x, y, w, h) {
  const line = n => y + h * (87 + 37.2 * n) / 563, pitch = h * 37.2 / 563;   // printed line n on the sheet
  const on = n => Math.round(line(n) - 20);                                   // text top that sits on printed line n
  const lx = x + RULE_L, rx = x + w - RULE_R, vx = lx + 122, fw = rx - lx;
  const field = (n, l, v, col) => { T(l, lx, on(n), { color: 'gray' }); T(v, vx, on(n), { color: col || 'normal', fit: rx - vx }); };
  let n = 1;
  field(n++, 'CUSTOMER', c.fac ? D.FACTIONS[c.fac].name : 'UNKNOWN');
  field(n++, 'FUNDS', c.budget ? '$' + Math.floor(c.budget) : 'NOT SPENDING', c.budget ? 'green' : 'gray');
  if (c.want) {   // long lists take a second printed line rather than shrinking
    const parts = wantsText(c).split(', '); let a = '', b2 = '';
    for (const q of parts) { const t = (a ? a + ', ' : '') + q; if (!b2 && S.font.width(t) * 2 <= rx - vx) a = t; else b2 = (b2 ? b2 + ', ' : '') + q; }
    field(n++, 'WANTS', a); if (b2) { T(b2, vx, on(n), { fit: rx - vx }); n++; }
  }
  // pinned to the bottom of the sheet
  let by = y + h - 54; const hh = 34;
  const rowsTo = yy => Math.floor((yy - line(n)) / pitch);
  if (c.intent === 'appraise') { billRows(c, x, w, line, on, pitch, n, by - 134); return drawAppraise(c, lx, by, fw); }
  if (c.intent === 'swap') { billRows(c, x, w, line, on, pitch, n, by - 92); return drawSwap(c, lx, by, fw); }
  if (btn(lx, by, fw, 36, c.dealt ? 'FILE IT' : 'NO DEAL', { kind: c.dealt ? 'green' : 'tan' })) { leave(); return; }
  const theirs = G.matTheirs(), mine = G.matOwned();
  if (theirs.length) {
    const tot = G.buyTotal(c); by -= 40;
    if (btn(lx, by, fw, 36, `STAMP: BUY  $${tot}`, { kind: 'pink', disabled: tot > G.cash })) { if (G.doBuy(c)) { S.sfx('stamp'); S.sfx('till'); c.mark = ['BOUGHT', '#a01f58']; c.lastReply = 'Pleasure. Do not call me.'; } }
    by -= 36; haggleRow(c, 'buy', lx, by, fw);
    if (!c.buyOffered && G.leanHas(c)) { by -= 38; const stolen = theirs.some(i => i.stolen); if (btn(lx, by, fw, 34, stolen ? 'LEAN ON THEM: IT IS STOLEN' : `LEAN ON THEM: ${G.files} FILE${G.files === 1 ? '' : 'S'}`, { kind: 'pink' })) { G.lean(c); S.sfx('exclaim'); c.lastReply = 'You would not. Fine. FINE. Take it.'; } if (inR([lx, by, fw, 34])) tip = { title: 'BLACKMAIL: 40% OFF, ALWAYS WORKS', lines: ['-8 standing with their group, and it goes on your record.', 'Files come from catching lies today. They expire tonight.'] }; }
  }
  if (c.want && mine.length) {
    const tot = G.sellTotal(c), cap = Math.min(tot, Math.floor(c.budget)); by -= 40;
    if (tot > 0) { if (btn(lx, by, fw, 36, `STAMP: SELL  $${cap}${cap < tot ? ' MAX' : ''}`, { kind: 'green' })) { G.doSell(c); S.sfx('stamp'); S.sfx('till'); c.mark = ['SOLD', '#2c6e3c']; c.lastReply = 'Yeah. This will do.'; } }
    else T('{gray}NOTHING THEY WILL TAKE{/}', lx, by + 9);
    by -= 36; haggleRow(c, 'sell', lx, by, fw);
  }
  billRows(c, x, w, line, on, pitch, n, by - 4);
  if (c.want && !mine.length && !theirs.length && !c.dealt) { T('{gray}DRAG GOODS TO THE COUNTER{/}', lx, on(n + 1), { fit: fw }); T('{gray}TO LIST THEM HERE{/}', lx, on(n + 2), { fit: fw }); }
}
function billRows(c, x, w, line, on, pitch, n, yEnd) {
  const list = G.matTheirs().concat(G.matOwned()), lx = x + RULE_L, rx = x + w - RULE_R;
  if (!list.length) return;
  T('{gray}ITEM{/}', lx, on(n)); T('{gray}CASH{/}', rx, on(n), { align: 'right' }); n++;
  const tall = pitch >= 34, rows = Math.max(0, Math.floor((yEnd - line(n - 1)) / pitch));
  const more = list.length > rows, show = more ? Math.max(0, rows - 1) : list.length;
  list.slice(0, show).forEach((it, i) => {
    const def = D.ITEMS[it.id], top = line(n + i - 1), r = [x + 30, top, w - 44, pitch];
    fitImg(IMG['i_' + (it.art || def.art)], lx, top + 3, 30, pitch - 6, 0);
    const ok = it.owned ? G.accepts(c, it) === true : true, price = it.owned ? G.sellPrice(it, c) : G.buyPrice(it, c);
    const money = ok ? (it.owned ? '+$' : '-$') + price : 'NO', nx = lx + 34, nw = rx - nx - S.font.width(money) * 2 - 12, cond = G.condOf(it)[0];
    if (tall) { T(def.name, nx, Math.round(top + 2), { fit: nw }); T(`{gray}${cond}{/}`, nx, Math.round(top + 19), { fit: nw }); }
    else if (S.font.width(def.name + ' ' + cond) * 2 <= nw) T(`${def.name} {gray}${cond}{/}`, nx, on(n + i));
    else T(def.name, nx, on(n + i), { fit: nw });
    T(money, rx, tall ? Math.round(top + 10) : on(n + i), { align: 'right', color: !ok ? 'red' : it.owned ? 'green' : 'pink' });
    if (!G_held && !modal && inR(r)) {
      hot = true; itemTip(it);
      if (M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { M.released = false; if (it.owned) { if (G.stockPlace(it)) S.sfx('drop'); } else { modal = 'accuse'; modalData = { it, clue: G.clue(it) }; } }
    }
  });
  if (more) T(`{gray}+${list.length - show} MORE ON THE COUNTER{/}`, lx, on(n + show), { fit: rx - lx });
}
function haggleRow(c, side, x, y, w) {
  if (c[side + 'Offered']) { const d = side === 'sell' ? c.sellDeal : c.buyDeal; T(d ? `{yellow}DEAL ${d > 0 ? '+' : ''}${d}%{/}` : '{gray}HAGGLE REFUSED{/}', x, y + 8); return; }
  const lw = 58, gap = 4, bw = (w - lw - gap * 3) / 4, h = 32;
  T(`{gray}${side === 'sell' ? 'SELL' : 'BUY'}{/}`, x, y + 8);
  [10, 25, 50].forEach((p, i) => {
    const o = G.odds(p, c), bx = x + lw + i * (bw + gap);
    if (btn(bx, y, bw, h, `${p}%`, {})) { const r = G.haggle(side, p, c); S.sfx(r === 'accept' ? 'coin' : r === 'walk' ? 'cancel' : 'bump'); c.lastReply = r === 'accept' ? 'Fine. FINE.' : r === 'refuse' ? 'No. Same price or nothing.' : null; }
    if (inR([bx, y, bw, h])) tip = { title: `${side === 'sell' ? 'MARK UP' : 'ASK OFF'} ${p}%: ${o.acc}% YES`, lines: [`${o.refuse}% refuse, ${o.walk}% walk out (-3 rep)`, 'One try per customer.'] };
  });
  const bx = x + lw + 3 * (bw + gap);
  if (btn(bx, y, bw, h, side === 'sell' ? 'CUT' : 'PAY+', {})) { G.sweeten(side, 10, c); S.sfx('dial'); c.lastReply = side === 'sell' ? 'Now we are talking.' : 'Why, thank you!'; }
  if (inR([bx, y, bw, h])) tip = { title: side === 'sell' ? 'CUT YOUR PRICE 10%' : 'PAY THEM 10% MORE', lines: ['Always accepted. Builds rep.'] };
}
function drawAppraise(c, x, by, w) {
  const it = c.appr, can = c.tries < 3;
  T('{gray}ESTIMATE{/}', x, by - 122); T('$' + aEstimate, x + w, by - 128, { s: 3, align: 'right' });
  const b = (w - 24) / 4;
  [[-25, '-25'], [-5, '-5'], [5, '+5'], [25, '+25']].forEach(([d, l], i) => { if (btn(x + i * (b + 8), by - 92, b, 36, l)) aEstimate = Math.max(5, aEstimate + d); });
  if (c.done) { if (btn(x, by, w, 42, 'GOODBYE', { kind: 'green' })) leave(); return; }
  if (btn(x, by - 46, w, 42, 'GIVE ESTIMATE', { kind: 'green', disabled: !can })) {
    const r = aEstimate / c.truth, e = Math.abs(1 - r);
    if (r < .5 || r > 1.5 || e > .25) { c.tries++; c.lastReply = (r < 1 ? 'That low? ' : 'That high? ') + ['Try again.', 'One more try.', 'I am leaving.'][c.tries - 1]; S.sfx('bump'); if (c.tries >= 3) { c.done = true; G.remove(it); G.repChange(c.fac, -1); } }
    else { const pct = e <= .05 ? 15 : e <= .10 ? 12 : e <= .15 ? 10 : 8, fee = 20 + Math.round(aEstimate * pct / 100); G.cash += fee; G.stats.sold += fee; G.remove(it); c.done = true; c.dealt = true; G.repChange(c.fac, 1); c.lastReply = `${e <= .05 ? 'Perfect' : e <= .15 ? 'Good' : 'Close enough'}. Here is $${fee} for your time.`; S.sfx('coin'); }
  }
  if (btn(x, by, w, 42, 'NO DEAL', {})) leave();
}
function drawSwap(c, x, by, w) {
  const mine = G.matOwned(), theirs = G.matTheirs();
  if (c.dealt) { if (btn(x, by, w, 42, 'THANKS, BYE', { kind: 'green' })) leave(); return; }
  const a = mine[0], b = theirs[0];
  if (a && b) {
    const ok = G.shelf(a) >= G.shelf(b) * .85 && mine.length === 1;
    T(ok ? '{green}THEY WILL TAKE IT{/}' : '{red}YOURS MUST MATCH IN VALUE{/}', x, by - 76, { fit: w });
    if (btn(x, by - 46, w, 42, 'SWAP', { kind: 'pink', disabled: !ok })) { G.remove(a); b.owned = true; G.stockPlace(b); c.dealt = true; c.lastReply = 'Nobody touched a wallet. Beautiful.'; S.sfx('coin'); }
  } else T('{gray}PUT ONE OF YOURS ON THE COUNTER{/}', x, by - 34, { fit: w });
  if (btn(x, by, w, 42, 'NO DEAL', {})) leave();
}
// ---- grids
function gridAt(name) { const g = GR[name], [c, r] = G.GRIDS[name]; return [g.x, g.y, c * CELL, r * CELL]; }
const gridVisible = n => n === 'stock' ? stockPage === 'stock' : n === 'stock2' ? stockPage === 'stock2' : n === 'mat' ? !!(G.client && !G.client.talk) : n === 'stash' ? G.posterPulled : n === 'trash' ? showTrash : n === 'server' ? true : false;
function drawGrid(name) {
  if (!gridVisible(name)) return;
  const g = GR[name], [c, r] = G.GRIDS[name], w = c * CELL, h = r * CELL;
  const counter = name === 'mat';
  if (counter) { ctx.globalAlpha = .28; rect(g.x - 2, g.y - 2, w + 4, h + 4, INK); ctx.globalAlpha = 1; ctx.fillStyle = '#0d0a1040'; for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) if ((x + y) % 2 === 0) ctx.fillRect(g.x + x * CELL, g.y + y * CELL, CELL, CELL); }
  else {
    { const im = IMG.l_storage; nine(im, g.x - 16, g.y - 16, w + 32, h + 32, [46, 60, im.width - 60, 46], [50, 60, im.height - 60, 50], .34, 0, true); }
    ctx.imageSmoothingEnabled = true; for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) ctx.drawImage(IMG.l_storage, 197, 194, 146, 138, g.x + x * CELL, g.y + y * CELL, CELL, CELL);
    const lw = S.font.width(g.label) * 2 + 24; plate(g.x - 12, g.y - 36, lw, 26); T(g.label, g.x, g.y - 31);
  }
  
  for (const it of G.inGrid(name)) {
    if (held === it) continue;
    const px = g.x + it.x * CELL, py = g.y + it.y * CELL, [iw, ih] = G.dims(it);
    drawItem(it, px, py);
    if (counter && G.client) {
      const lab = it.owned ? (G.accepts(G.client, it) === true ? G.sellPrice(it, G.client) : null) : G.buyPrice(it, G.client);
      if (lab != null) { const t = '$' + lab; const tw = S.font.width(t) * 2 + 6; rect(px + 2, py + iw * 0 + ih * CELL - 20, tw, 18, it.owned ? '#1f5433' : '#6d1f42'); T(t, px + 5, py + ih * CELL - 19, { color: 'white' }); }
    }
  }
}
function itemAt(mx, my) {
  for (const o of offerRects()) if (inR(o.r, mx, my)) return o.it;
  for (const name of Object.keys(GR)) {
    if (!gridVisible(name)) continue; const g = GR[name];
    const cx = Math.floor((mx - g.x) / CELL), cy = Math.floor((my - g.y) / CELL); for (const it of G.inGrid(name)) if (G.cellsOf(it).some(c => it.x + c[0] === cx && it.y + c[1] === cy)) return it;
  }
  for (let i = 0; i < 9; i++) if (inR(CASE(i), mx, my) && G.caseSlots[i]) return G.byUid(G.caseSlots[i]);
  return null;
}
function itemTip(it) {
  const def = D.ITEMS[it.id], cond = G.condOf(it), lines = [];
  const known = it.tested || it.exposed;
  lines.push(`{yellow}${def.type === 'JUNK' ? 'GARBAGE' : (it.owned && !known ? 'Label: ' : 'Label: ') + cond[0]}{/}${known && it.fake !== it.real ? `  {red}really ${G.trueCond(it)[0]}{/}` : ''}`);
  if (def.illegal) lines.push(it.restricted ? `{green}Legal under permit{/} (+${D.CURSE_MARKUP[def.illegal] / 2}%)` : `{red}ILLEGAL level ${def.illegal}{/} (+${D.CURSE_MARKUP[def.illegal]}% and crime to sell)`);
  else if (it.curseKnown) lines.push(it.curse ? `{pink}${D.CURSE[it.curse]}{/} (+${D.CURSE_MARKUP[it.curse]}% and crime to sell)` : '{green}Tested clean{/}');
  else if (def.type === 'CART') lines.push('{gray}Curse unknown. Test it on the tower.{/}');
  if (it.heat > 0) lines.push(`{red}Stolen: ${it.heat}% chance found{/}`);
  lines.push(def.blurb);
  lines.push(`Base $${def.v}, shelf $${G.shelf(it)}`);
  if (it.owned) lines.push('{gray}Right-click for more.{/}');
  tip = { title: def.name, lines, art: it.art || def.art };
}

// ---- drag and drop
// ---- right-click menu
let ctxm = null;
function menuFor(it) {
  const o = [], def = D.ITEMS[it.id], clientUp = G.client && !G.client.talk;
  if (!it.owned) { o.push({ t: 'INSPECT', fn: () => { modal = 'inspect'; modalData = { it }; } }); if (clientUp && G.items.includes(it)) o.push({ t: 'LOOK CLOSER', fn: () => { modal = 'accuse'; modalData = { it, clue: G.clue(it) }; } }); return o; }
  for (const a of G.itemActs(it)) o.push({ t: a.t, gold: true, fn: () => { const m = a.fn(); if (m) say(m); S.sfx(a.snd || 'select'); } });
  o.push({ t: 'INSPECT', fn: () => { modal = 'inspect'; modalData = { it }; } });
  if (['CART', 'ODD', 'FOOD', 'PILL', 'WEAPON', 'AMMO'].includes(def.type)) o.push({ t: `TEST ON RIG (${Math.max(0, G.testsLeft)} LEFT)`, fn: () => { say(G.test(it)); S.sfx(it.curse >= 3 ? 'hit' : 'select'); } });
  if (def.type !== 'JUNK' && G.isOpen('label')) o.push({ t: 'PRINT A NEW LABEL', fn: () => { modal = 'label'; modalData = { it }; } });
  const mv = (t, g, fail) => o.push({ t, fn: () => { if (G.moveTo(it, g)) iSfx(it, 'put'); else { say(fail); S.sfx('bump'); } } });
  if (it.grid !== 'mat' && clientUp) mv('PUT ON COUNTER', 'mat', 'No room on the counter.');
  if (!['stock', 'stock2'].includes(it.grid)) mv('BACK TO STOCK', 'stock', 'No room in stock.');
  if (def.type === 'CART' && it.grid !== 'case') { const free = G.caseSlots.indexOf(null); if (free >= 0) o.push({ t: 'PUT IN THE CASE', fn: () => { if (it.grid === 'mat' || GR[it.grid]) { it.grid = 'case'; it.slot = free; G.caseSlots[free] = it.uid; iSfx(it, 'put'); } } }); }
  if (def.type === 'CART' && it.grid !== 'server') mv('PUT IN RACK BAY', 'server', 'The rack bay is full.');
  if (it.grid !== 'case' && D.SHAPES[it.id]) o.push({ t: 'FLIP', fn: () => { it.flip = !it.flip; if (!G.fits(it, it.grid, it.x, it.y)) { it.flip = !it.flip; say('No room to flip it there.'); S.sfx('bump'); } } });
  if (def.w !== def.h && it.grid !== 'case') o.push({ t: 'ROTATE', fn: () => { it.rot ^= 1; if (!G.fits(it, it.grid, it.x, it.y)) { it.rot ^= 1; say('No room to turn it there.'); S.sfx('bump'); } else iSfx(it, 'grab'); } });
  if (it.grid !== 'trash') mv('THROW AWAY', 'trash', 'The trash can is full.');
  return o;
}
function drawCtxMenu() {
  if (!ctxm) return;
  const it = ctxm.it, rows = ctxm.rows, rh = 34, w = Math.max(250, ...rows.map(r => S.font.width(r.t) * 2 + 56)), h = rh * rows.length + 62, im = IMG.u_tip_plate;
  let x = ctxm.x, y = ctxm.y; if (x + w > W - 6) x = W - 6 - w; if (y + h > H - 6) y = H - 6 - h;
  nine(im, x, y, w, h, [80, 140, im.width - 140, 80], [80, 130, im.height - 130, 80], .3, 0, true);
  ink(false); termInk(); termGlow = null;
  T(D.ITEMS[it.id].name, x + 22, y + 14, { color: 'yellow', fit: w - 44 }); rect(x + 22, y + 34, w - 44, 1, '#2f7a4c');
  rows.forEach((r, i) => { const ry = y + 40 + i * rh, q = [x + 14, ry, w - 28, rh - 2], o = inR(q); if (o) { rect(q[0], q[1], q[2], q[3], '#7dff9e24'); hot = true; } T(r.t, x + 22, ry + 7, { color: o ? 'white' : r.gold ? 'green' : 'normal', fit: w - 44 }); r.q = q; });
  ink(false); tip = null;
}
function ctxClick() {   // runs first in the frame so a click on the menu never picks up what is under it
  if (!ctxm) return false;
  if (M.pressed) { const hit = ctxm.rows.find(r => r.q && inR(r.q)); if (tut && hit && hit.t !== 'OPEN') { M.pressed = false; M.down = false; pressedOn = null; return true; } const m = ctxm; ctxm = null; M.pressed = false; M.down = false; pressedOn = null; if (hit && G.items.includes(m.it)) hit.fn(); return true; }
  if (keys.has('Escape')) { ctxm = null; keys.delete('Escape'); }
  return false;
}
function grab(it) { held = it; heldFrom = { grid: it.grid, x: it.x, y: it.y, rot: it.rot, slot: it.slot }; G_held = it; iSfx(it, 'grab'); }
const iSfx = (it, k) => S.sfx(`${k}_${D.materialOf(it.id)}`);
// the squares a held item takes up: snapped to the grid under it, green if it fits, red if not
function drawFootprint(it, w, h) {
  let x = M.x - w * CELL / 2, y = M.y - h * CELL / 2, col = '#fff6c8';
  for (const name of Object.keys(GR)) {
    if (!gridVisible(name)) continue; const g = GR[name], [c, r] = G.GRIDS[name];
    if (M.x < g.x - CELL || M.y < g.y - CELL || M.x > g.x + c * CELL + CELL || M.y > g.y + r * CELL + CELL) continue;
    const gx = Math.max(0, Math.min(c - w, Math.round((x - g.x) / CELL))), gy = Math.max(0, Math.min(r - h, Math.round((y - g.y) / CELL)));
    x = g.x + gx * CELL; y = g.y + gy * CELL; col = G.fits(it, name, gx, gy) && (name !== 'server' || D.ITEMS[it.id].type === 'CART') ? LIME : '#ff5a6a'; break;
  }
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.globalAlpha = .55; ctx.beginPath();
  const cs = G.cellsOf(it), on = new Set(cs.map(c => c[0] + ',' + c[1]));
  for (const [cx, cy] of cs) ctx.rect(x + cx * CELL + .5, y + cy * CELL + .5, CELL - 1, CELL - 1);
  ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.beginPath();
  for (const [cx, cy] of cs) { const X = x + cx * CELL, Y = y + cy * CELL; if (!on.has(cx + ',' + (cy - 1))) { ctx.moveTo(X, Y); ctx.lineTo(X + CELL, Y); } if (!on.has(cx + ',' + (cy + 1))) { ctx.moveTo(X, Y + CELL); ctx.lineTo(X + CELL, Y + CELL); } if (!on.has((cx - 1) + ',' + cy)) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + CELL); } if (!on.has((cx + 1) + ',' + cy)) { ctx.moveTo(X + CELL, Y); ctx.lineTo(X + CELL, Y + CELL); } }
  ctx.stroke(); ctx.restore();
}
function dropTarget() {
  const it = held; const [w, h] = G.dims(it);
  // action targets
  if (inR(R.tower) && !modal) { if (['CART', 'ODD', 'FOOD', 'PILL', 'WEAPON', 'AMMO'].includes(D.ITEMS[it.id].type)) { const m = G.test(it); say(m); S.sfx(it.curse >= 3 ? 'hit' : 'blip'); } return restore(); }
  if (inR(R.barcode)) { if (!G.isOpen('label')) { say('The barcode reader is not hooked up yet. Someone will tell you when it is.'); restore(); return; } modal = 'label'; modalData = { it }; restore(); return; }
  if (inR(R.trash) && !showTrash) { if (G.place(it, 'trash')) { fromCase(it); held = G_held = null; say('In the trash. The janitor empties it nightly.'); iSfx(it, 'put'); return; } say('Trash can is full.'); return restore(); }
  for (let i = 0; i < 9; i++) if (inR(CASE(i)) && D.ITEMS[it.id].type === 'CART' && !G.caseSlots[i]) { fromCase(it); it.grid = 'case'; it.slot = i; G.caseSlots[i] = it.uid; held = G_held = null; iSfx(it, 'put'); return; }
  for (const name of Object.keys(GR)) {
    if (!gridVisible(name)) continue; const g = GR[name];
    const gx = Math.round((M.x - w * CELL / 2 - g.x) / CELL), gy = Math.round((M.y - h * CELL / 2 - g.y) / CELL);
    if (M.x < g.x - CELL || M.y < g.y - CELL || M.x > g.x + G.GRIDS[name][0] * CELL + CELL || M.y > g.y + G.GRIDS[name][1] * CELL + CELL) continue;
    if (name === 'server' && !['CART'].includes(D.ITEMS[it.id].type)) { say('The rack bay only reads cartridges.'); return restore(); }
    const cx = Math.max(0, Math.min(G.GRIDS[name][0] - w, gx)), cy = Math.max(0, Math.min(G.GRIDS[name][1] - h, gy));
    if (G.fits(it, name, cx, cy)) { fromCase(it); it.grid = name; it.x = cx; it.y = cy; held = G_held = null; iSfx(it, 'put'); return; }
  }
  restore();
}
function fromCase(it) { if (heldFrom && heldFrom.grid === 'case') G.caseSlots[heldFrom.slot] = null; }
function restore() { const it = held, h = heldFrom; if (it && G.items.includes(it)) { it.grid = h.grid; it.x = h.x; it.y = h.y; it.rot = h.rot; it.slot = h.slot; } held = G_held = null; }

// ---- HUD
function plate(x, y, w, h) { nine(IMG.u_plate, x, y, w, h, [28, 40, 190, 28], [30, 40, 65, 18], .7); }
function plateMeterUnused(x, y, w, h, frac) {
  const im = IMG.u_meter, k = h / im.height; nine(im, x, y, w, h, [30, 400, 500, 30], [10, 20, 40, 10], k);
  const n = Math.round(frac * 10), inner = w - 60 * k, seg = inner / 10;
  for (let i = 0; i < n; i++) ctx.drawImage(im, 38, 12, 28, 38, x + 30 * k + i * seg, y + 12 * k, seg - 1, 38 * k);
}
function heatGauge(x, y, w, h, frac) {
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const g = IMG.u_st_gauge, bar = IMG[frac > .8 ? 'u_bar_pink' : frac > .4 ? 'u_bar_orange' : 'u_bar_green'];
  ctx.drawImage(g, x, y, w, h);
  const ix = x + w * .058, iw = w * .884, iy = y + h * .2, ih = h * .6, fw = iw * Math.max(0, Math.min(1, frac));
  if (fw > 0) { ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, fw, ih); ctx.clip(); ctx.drawImage(bar, ix, iy, iw, ih); ctx.restore(); }
}
function drawHud() {
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.u_st_plate, 4, 2, 500, 112);
  ink(true); box(36, 16, 436, 84, 'status plate', 0);
  const dow = G.DAYS[G.day % 7], rd = (7 - G.day % 7) % 7;
  T(`DAY ${G.day}  ${dow}`, 46, 20); T('$' + Math.floor(G.cash), 462, 18, { s: 3, align: 'right', color: G.cash < G.rent ? 'red' : 'green' });
  T(rd === 0 ? `{red}RENT $${G.rent + G.arrears} TODAY{/}` : `RENT $${G.rent + G.arrears} IN ${rd}D`, 46, 44);
  T('HEAT', 46, 72); heatGauge(104, 66, 184, 30, G.evidence / 100);
  T(`QUEUE ${G.queue.length}`, 298, 72); if (G.grace) T('{yellow}GRACE{/}', 466, 72, { align: 'right' });
  ink(false);
  G.events.forEach((e, i) => { const t = `${e.def.name}  ${e.left}D`, tw = S.font.width(t) * 2 + 28; plate(8, 116 + i * 30, tw, 28); T('{yellow}' + t + '{/}', 22, 122 + i * 30); });
}
const hint = () => {
  if (G.tut) return null;
  if (G.phase === 'morning') return 'Click the shutter on the window to open up.';
  if (G.phase === 'evening') return 'Shop is shut. A.S.S. door to scavenge, or END DAY for the ledger.';
  if (!G.client && G.queue.length) return null;
  if (!G.client) return 'Queue is empty. Click the graffiti shutter to close for the day.';
  if (G.client.want && !G.matOwned().length) return 'Drag stock onto the counter to offer it. R rotates.';
  return null;
};

// ---- the storefront
// crowd: 8-frame walkers on two depth layers, like the study's Walker system
const walkers = [];
const WALL_L = 637, WALL_R = 1245;   // the mall's side walls in your plate: people come out from behind them
function spawnWalker(any) {
  const far = Math.random() < .5, dir = Math.random() < .5 ? 1 : -1;
  walkers.push({ far, dir, x: any ? WALL_L + 40 + Math.random() * (WALL_R - WALL_L - 80) : (dir > 0 ? WALL_L - 50 : WALL_R + 50), s: far ? .6 + Math.random() * .06 : .95 + Math.random() * .1, v: (far ? .42 : .75) * (.85 + Math.random() * .3), t: Math.random() * 80, y: far ? 408 + Math.random() * 6 : 468 + Math.random() * 30 });
}
function drawWalker(w) {
  const im = IMG['w' + (Math.floor(w.t) % 8)]; if (!im) return;
  const dw = im.width * w.s, dh = im.height * w.s;
  ctx.save(); ctx.translate(w.x, w.y); if (w.dir < 0) ctx.scale(-1, 1); ctx.drawImage(im, -dw / 2, -dh, dw, dh); ctx.restore();
}
function stepWalkers() {
  if (!walkers.length) for (let i = 0; i < 4; i++) spawnWalker(true);
  if (walkers.length < 5 && Math.random() < .006) spawnWalker(false);
  walkers.sort((a, b) => a.y - b.y);
  for (let i = walkers.length - 1; i >= 0; i--) { const w = walkers[i]; w.x += w.v * w.dir; w.t += w.v * .28; if (w.x < WALL_L - 60 || w.x > WALL_R + 60) walkers.splice(i, 1); }
  ctx.save(); ctx.beginPath(); ctx.rect(WALL_L, 110, WALL_R - WALL_L, 430); ctx.clip();
  walkers.filter(w => w.far).forEach(drawWalker);
  ctx.drawImage(IMG.rail, WALL_L, 358);       // the railing stands in front of the lower floor
  walkers.filter(w => !w.far).forEach(drawWalker);
  ctx.restore();
}
// ---- ads taped to the shutters: four roll up with the main one, two stay on the side panel
const ADS_MAIN = [['pretzel', 590, 124, 150, -.04], ['escal', 925, 118, 165, .03], ['point', 596, 342, 170, .03], ['handheld', 1105, 352, 165, -.03]];
const ADS_SIDE = [['suits', 1338, 118, 150, -.03], ['burst', 1432, 300, 180, .04]];
function drawAd(n, x, y, size, rot) { const im = IMG['u_ad_' + n], h = size * im.height / im.width; ctx.save(); ctx.translate(x + size / 2, y + h / 2); ctx.rotate(rot); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -size / 2, -h / 2, size, h); ctx.restore(); }
function drawAdText() {   // the blank burst is the mall's sale sign: it shows what Linda last moved
  const e = [...G.events].reverse().find(v => v.def.market || v.def.cursed), a = ADS_SIDE[1], im = IMG.u_ad_burst, h = a[3] * im.height / im.width, cx = a[1] + a[3] / 2, cy = a[2] + h / 2, fx = e ? G.paEffect(e.def).split('  ')[0].split(' ') : ['BUY', 'NOW'];
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a[4]); ink(true); T(fx[0], 0, -19, { align: 'center', fit: 96, color: 'normal' }); T(fx.slice(1).join(' ') || ' ', 0, 1, { align: 'center', fit: 96, color: 'normal' }); ink(false); ctx.restore();
}
function drawStore() {
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(IMG.bg, 0, 0);
  // case slots hold what you actually put there; a slot that no longer matches the painted cart gets covered
  for (let i = 0; i < 9; i++) {
    const r = CASE(i), it = G.caseSlots[i] && G.byUid(G.caseSlots[i]);
    if (it && it.id === D.CASE_ART[i] && held !== it) continue;
    rect(r[0] - 3, r[1], r[2] + 5, r[3] - 2, '#1f1720');
    if (it && held !== it) fitImg(IMG['i_' + D.ITEMS[it.id].art], r[0], r[1], r[2], r[3]);
    else { T('{gray}EMPTY{/}', r[0] + r[2] / 2, r[1] + 22, { align: 'center', s: 2 }); }
  }
  if (G.posterPulled) { ctx.save(); ctx.translate(470, 80); ctx.rotate(.22); ctx.drawImage(IMG.bg, 345, 80, 125, 190, -6, -6, 125, 190); ctx.restore(); }
  // the mall through the window: your empty plate, then people walking in it
  const PS = 1672 / 1443, wr = R.window;
  ctx.save(); ctx.beginPath(); ctx.rect(wr[0] + 3, wr[1] + 3, wr[2] - 6, wr[3] - 6); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.drawImage(IMG.plate, 114, 0, 1443, 790, 0, 0, 1672, 790 * PS);
  stepWalkers(); ctx.restore();
  drawClient();
  // the shutter: your painted shutter slid across the window
  const tgt = shutterGoal; shutterT += Math.sign(tgt - shutterT) * Math.min(.035, Math.abs(tgt - shutterT));
  if (shutterT > 0) { ctx.save(); ctx.beginPath(); ctx.rect(R.window[0], R.window[1], R.window[2], R.window[3]); ctx.clip(); const hh = R.window[3] * shutterT; for (const k of [0, 1]) ctx.drawImage(IMG.shutter, 0, 0, 303, 372, R.window[0] + k * R.window[2] / 2, R.window[1] + hh - R.window[3], R.window[2] / 2, R.window[3]); const up = hh - R.window[3]; for (const a of ADS_MAIN) drawAd(a[0], a[1], a[2] + up, a[3], a[4]); ctx.restore(); }
  for (const a of ADS_SIDE) drawAd(a[0], a[1], a[2], a[3], a[4]);
  drawAdText();
  if (!G.services.power && G.phase !== 'title') { /* power cut last night */ }
  if (G.client && shutterT < .02) { drawOffered(); if (arrived()) { drawSpeech(); billDue = !!G.client; } else if (!modal && M.released && inR(R.window)) { clientT = ENTER; M.released = false; } }
  if (!G.client && !gone && G.phase === 'day' && shutterT < .02 && G.queue.length) { if (btn(R.window[0] + 222, 448, 280, 56, `NEXT CUSTOMER  (${G.queue.length})`, { kind: 'green' })) callNext(); }
  // bell pulses when it can be rung
  if (!modal && G.phase === 'day' && !G.client && G.queue.length && frame % 60 < 30) { ctx.strokeStyle = LIME; ctx.lineWidth = 2; ctx.strokeRect(R.bell[0], R.bell[1], R.bell[2], R.bell[3]); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.l_rack, 1246, 794, 110, 126);
  settingsIcon();
  drawGrid('stock'); drawGrid('stock2'); drawGrid('mat'); drawGrid('stash'); drawGrid('trash'); drawGrid('server');
  if (!G_held && !modal && btn(356, 704, 74, 30, 'SORT')) { if (!G.sortGrid(stockPage)) say('It will not all fit neatly. Nothing moved.'); else S.sfx('clunk'); }
  if (G.upgrades.shelf && !G_held && btn(268 + 22 * CELL + 20, 744, 74, 34, stockPage === 'stock' ? 'PAGE 2' : 'PAGE 1')) stockPage = stockPage === 'stock' ? 'stock2' : 'stock';
  drawHud();

  // click targets
  if (modal) return;
  const day = G.phase === 'day', morning = G.phase === 'morning', evening = G.phase === 'evening';
  if (hotspot(R.bell, 'SERVICE BELL', day ? (G.queue.length ? 'Next customer' : 'Nobody waiting') : 'Shop is closed')) { S.sfx('bell'); if (day && !G.client && !gone && G.queue.length) callNext(); }
  if (hotspot(R.tablet, 'OFFERS', 'Stock deals, requests, upgrades')) { modal = 'offers'; modalData = { tab: 0 }; }
  if (hotspot(R.phone, 'PHONE', G.unread ? `${G.unread} new` : 'Messages and standing')) { modal = 'phone'; modalData = { tab: null }; G.unread = 0; }
  if (!inR(R.sticky) && hotspot(R.terminal, 'PROP PILLS TERMINAL', 'Pills, reagents and the back lab.')) { modal = 'terminal'; modalData = { tab: termTab, grade: 2, claim: 2 }; }
  if (hotspot(R.sticky, 'STICKY NOTE', hint() || 'Nothing to do but sell.')) { modal = 'help'; modalData = { page: 0 }; }
  if (hotspot(R.sticker, 'SHOP RULES', 'How this works')) { modal = 'help'; modalData = { page: 0 }; }
  if (hotspot(R.barcode, 'LABEL PRINTER', 'Drag goods here to reprint the condition label')) say('Drag something onto the barcode reader.');
  if (hotspot(R.tower, 'BEIGE TOWER', `Drag goods here to test. ${G.testsLeft} tests left today.`)) say('Drag a cartridge onto the tower to test it.');
  if (hotspot(R.server, 'RACK UNIT', 'Carts in the RACK BAY get read overnight and lose one curse level. Needs power.')) {}
  if (hotspot(R.trash, 'TRASH CAN', 'Drop things in. Click to open. Janitor empties it.')) showTrash = !showTrash;
  if (G.posterPulled) { if (btn(330, 248, 152, 34, 'PUT IT BACK')) { G.posterPulled = false; S.sfx('paper'); } } else if (hotspot(R.poster, 'CROOKED POSTER', 'Something behind it. Leave it pulled and inspectors search there too.')) { G.posterPulled = true; S.sfx('door'); }
  if (hotspot(R.fuse, 'FUSE BOX', G.services.power ? 'Mall Power is on. Turn it off in the closing panel.' : 'No power: test rig, rack and terminal sales are dark.')) {}
  if (hotspot(R.alarm, 'HEAT', `Evidence ${Math.round(G.evidence)}/100. Crime on file: ${G.totalCrime()}.`)) {}
  if (hotspot(R.keypad, 'REPORT TO MALL COPS', G.wanted ? `BOLO: ${G.wanted.alias}, $${G.wanted.reward}` : 'Report the person at your counter. Wrong = -$50.')) { if (G.client && day) { say(G.report()); S.sfx('exclaim'); } else say('Nobody to report.'); }
  if (hotspot(R.sign, "CARL'S CURSED CARTRIDGES", 'Buy. Swap. Trade. Prop Pills. Oddware.')) { modal = 'help'; modalData = { page: 0 }; }
  if (hotspot(R.door, 'A.S.S. EMPLOYEES ONLY', evening ? 'Search the dumpster for things to sell. Costs 1 customer tomorrow.' : 'Only after closing.')) { if (evening && !G.isOpen('lot')) say('The door is stuck. Wick says tomorrow.'); else if (evening) { if (!G.wentOut) G.goOut(); ass = { log: ['The back door opens on the dumpster. Dig for things to sell.'], found: [] }; S.sfx('shutteropen'); } else say('Close up first.'); }
  if (morning && inR(R.window) && hotspot(R.window, 'OPEN THE SHUTTER', 'Start the day')) { shutterGoal = 0; G.openShutter(); S.sfx('door'); }
  if (day && !G.client && hotspot(R.shutter, 'CLOSE FOR THE DAY', G.queue.length ? 'Sends the queue home.' : 'Pull the shutter')) {
    if (G.client) say('Finish with the customer first.');
    else if (G.queue.some(c => c.undismissable)) say('Somebody in the queue won\'t be sent away. Ring the bell.');
    else { G.closeDay(); shutterGoal = 1; S.sfx('shutterclose'); }
  }
  drawPA();
  drawIdentifierRest();
  const h = hint(); if (h) { const tw = S.font.width(h) * 2 + 24; paper(W / 2 + 90 - tw / 2 - 20, 546, tw + 40, 32); T(h, W / 2 + 90, 553, { align: 'center' }); ink(false); }
  if (evening && !modal && btn(R.window[0] + 222, 448, 280, 56, 'END DAY', { kind: 'green' })) { modal = 'close'; modalData = {}; }
  // the bill goes on last, above everything else in the shop
  drawPABar();
  if (billDue && G.client) { billOn = true; drawMenu(); billOn = false; } billDue = false;
}

// ---- modal windows
let lastModal = null, modalT = 0;
const mPos = {}; let mBox = null, mDrag = null;
function drawModal() {   // any popup can be dragged by any part of it that is not a control
  if (!modal || !MODALS[modal]) { lastModal = null; mDrag = null; return; }
  const name = modal, o = mPos[name] || (mPos[name] = [0, 0]), down = M.pressed;
  if (mDrag) { if (M.down) { o[0] = M.x - mDrag[0]; o[1] = M.y - mDrag[1]; if (mBox) { o[0] = Math.max(100 - mBox[0] - mBox[2], Math.min(W - 100 - mBox[0], o[0])); o[1] = Math.max(-mBox[1], Math.min(H - 80 - mBox[1], o[1])); } } else mDrag = null; M.released = false; }
  const po = pressedOn; if (po) pressedOn = { x: po.x - o[0], y: po.y - o[1] };
  const hot0 = hot; hot = false; mBox = null; M.x -= o[0]; M.y -= o[1]; mOff = o; ctx.save(); ctx.translate(o[0], o[1]);
  MODALS[name]();
  ctx.restore(); mOff = null; const inside = !mBox || inR(mBox); M.x += o[0]; M.y += o[1];
  if (po && pressedOn) pressedOn = po;
  if (down && !hot && modal === name && inside && !slDrag && M.pressed && !(tut && tut.box && inR(tut.box))) { mDrag = [M.x - o[0], M.y - o[1]]; pressedOn = null; }
  hot = hot || hot0 || !!mDrag; ink(false);
}
function mHead(title, w = 860, h = 560, device = false, sub) {
  if (modal !== lastModal) { lastModal = modal; modalT = 0; S.sfx('paper'); }
  modalT = Math.min(14, modalT + 1);
  const x = (W - w) / 2, y = (H - h) / 2 + Math.pow(1 - modalT / 14, 2) * 500;
  rect(0, 0, W, H, '#0a071070'); mBox = device === 'clip' ? [x, y, 672, h] : [x, y, w, h];
  const body = (ix, iy, iw, ih) => ({ x: ix, y: iy, w: iw, h: ih, X: x + 8, Y: y, W: w - 16, H: h - 14 });
  if (device === 'crt') { box(x + 50, y + 40, w - 100, h - 120, title, 0); nine(IMG.u_crt, x, y, w, h, [115, 118, 142, 245], [45, 100, 200, 75], 1.3); T(title, x + 62, y + 50, { s: 3, color: 'crt' }); const r = body(x + 62, y + 96, w - 124, h - 190); r.Y = y; r.H = h - 86; r.X = x + 46; r.W = w - 92; return r; }
  if (device === 'clip') { box(x + 78, y + 200, 516, 660, title, 0); const k = 2.8, im = IMG.u_clip, cw = 240 * k; ctx.imageSmoothingEnabled = false; ctx.drawImage(im, 0, 0, 240, 333, x, y, cw, 333 * k); ctx.imageSmoothingEnabled = true; ctx.drawImage(IMG[title === 'LEDGER' ? 'u_sheet_rule' : 'u_sheet_pad'], x + 68, y + 165, 536, 695); ctx.imageSmoothingEnabled = false; ctx.drawImage(im, 60, 0, 120, 82, x + 60 * k, y, 120 * k, 82 * k); ink(true); T(title, x + 96, y + 232, { s: 3 }); if (sub) T(sub, x + cw - 96, y + 240, { align: 'right', color: 'gray' }); rect(x + 92, y + 264, cw - 184, 3, PINK_INK); return { x: x + 96, y: y + 276, w: cw - 192, h: 570, X: x + 96, Y: y + 180, W: cw - 192, H: 685 }; }
  if (device === 'x') { box(x + 16, y, w - 32, h - 34, title, 0); nine(IMG.u_win_x, x, y, w, h, [90, 100, 340, 70], [50, 70, 120, 35], 1.2); T(title, x + 44, y + 16, { s: 3, color: 'pink' }); const xr = [x + w - 62, y + 12, 48, 44]; if (!lockModalX && inR(xr)) { hot = true; if (M.released) { M.released = false; modal = null; } } return { x: x + 44, y: y + 76, w: w - 88, h: h - 110, X: x + 16, Y: y, W: w - 32, H: h - 34 }; }
  if (device) { box(x + 30, y + 10, w - 60, h - 40, title, 0); nine(IMG.u_window, x, y, w, h, [240, 240, 530, 265], [85, 120, 220, 40], 1); T(title, x + 190, y + 28, { s: 3, color: 'pink' }); return { x: x + 46, y: y + 100, w: w - 92, h: h - 150, X: x + 20, Y: y, W: w - 40, H: h - 24 }; }
  paper(x, y, w, h, title, sub); const q = SHEET(x, y, w, h); return { x: q.l, y: q.top, w: q.r - q.l, h: q.bot - q.top, X: q.l, Y: y, W: q.r - q.l + 30, H: q.bot - y + 20 };
}
const lockModalX = false;
function mClose(b) { if (btn(b.X + b.W - 170, b.Y + b.H - 62, 140, 42, 'CLOSE')) modal = null; }
function tabs(b, list, key = 'tab') { let x = b.x; list.forEach(([id, l]) => { const on = modalData[key] === id, w = S.font.width(l) * 2 + 44, h = 40, r = [x, b.y, w, h], im = on ? IMG.u_tab_pink : IMG.u_tab_off; nine(im, x, b.y, w, h, [18, 30, im.width - 30, 18], [14, 20, 34, 6], 1); T(l, x + w / 2, b.y + 12, { align: 'center', color: on ? 'white' : 'normal' }); if (!lockBtn && inR(r)) { hot = true; if (M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { modalData[key] = id; M.released = false; S.sfx('select'); } } x += w + 4; }); return b.y + 52; }

// ---- settings: your control box. Each row: icon plate (click to mute that channel) and a 15-step slider.
const SL_GAPS = [109, 197, 294, 392, 496, 597, 693, 791, 887, 981, 1072, 1172, 1276, 1372, 1469, 1556];
let slDrag = null;
function settingsIcon() {
  const r = [1606, 14, 54, 54], v = S.vol, im = v.muted ? IMG.u_ai_mute_on : IMG.u_ai_master_on, over = !modal && !G_held && inR(r);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, r[0], r[1], r[2], r[3]);
  if (over) { hot = true; tip = { title: 'SETTINGS', lines: ['Sound levels. ESC opens this too.'] }; if (M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { M.released = false; S.sfx('select'); modal = 'settings'; modalData = {}; } }
}
const GUIDE = [
  ['FIRST DAY', ['You run {yellow}Unit 9{/}, a cartridge shop in a dying mall. You are a normal human man. Buy low, sell high, and pay rent every Sunday.',
    '{yellow}1.{/} Click the {yellow}window{/} to open the shutter.', '{yellow}2.{/} Press {yellow}NEXT CUSTOMER{/}, ring the {yellow}bell{/}, or hit SPACE.', '{yellow}3.{/} Read what they want on the {yellow}bill of sale{/}.', '{yellow}4.{/} Drag your goods onto the counter, or look at what they brought.', '{yellow}5.{/} Press the {yellow}STAMP{/} button to make the deal.', '{yellow}6.{/} When you are done, click the {yellow}shutter{/} to close for the day.', 'Then pay your bills on the ledger and sleep.'], 'u_stamp_circle_d'],
  ['THE COUNTER', ['{yellow}Selling:{/} drag something from STOCK or the case onto the counter. The bill shows what you get in green. Press {yellow}STAMP: SELL{/}.', '{yellow}Buying:{/} their goods sit on the counter. The bill shows what you pay in pink. Press {yellow}STAMP: BUY{/}.', 'A customer can only pay up to their {yellow}FUNDS{/}, and only buys what they {yellow}WANT{/}.', '{yellow}NO DEAL{/} sends them away. Nothing lost but the customer.', 'Keep the {yellow}display case{/} full. It brings people in off the walkway, and they may ask for what they see.'], 'i_cart_homealone'],
  ['HAGGLING', ['You get {yellow}one try per customer{/} on each side of the deal. Pick 10%, 25% or 50%.', 'Hover a button to see the odds: how often they say yes, refuse, or walk out.', 'Greedy asks can lose the customer and cost you {red}standing{/}. At normal standing, 50% almost never works.', '{yellow}CUT{/} and {yellow}PAY+{/} always work. They cost you money and build goodwill.', 'Your {yellow}standing{/} with each group is on your phone. It changes who shows up, and how they treat you.'], 'u_btn_tan_n'],
  ['YOUR STOCK', ['Space is the game. {yellow}Everything takes up squares{/}, and stock is small. A cart is 1 square. A big box is 4.', '{yellow}Drag{/} to move things. {yellow}R{/} or right-click while holding turns them.', '{yellow}Right-click{/} anything for its menu: open it, use it, test it, print a label, move it, or throw it away.', 'Boxes like {yellow}BOX LOT{/} can be opened, but sealed things are often worth more.', 'Trash goes in the {yellow}can{/}. Food spoils overnight, so sell it fast. The {yellow}back shelf{/} upgrade gives you a second page.'], 'i_odd_boxlot'],
  ['CURSES', ['Some carts are {pink}cursed{/}. They sell for more, and selling them books {red}crime{/}.', 'Drag a cart to the {yellow}beige tower{/} to test it. You get a few tests a day. A very cursed cart can fry the rig until tomorrow.', 'Leave carts in the {yellow}RACK BAY{/} overnight to read them and burn off one curse level. It needs Mall Power.', 'Labels can lie: sellers fake the condition, and so can you. Click their item and call it out if you are sure. Wrong guesses cost standing.', 'To reprint your own, drag an item to the {yellow}barcode reader{/}. Customers who check will catch you.'], 'i_cart_blink'],
  ['HEAT', ['The bar on your status plate is {red}evidence{/}. Crime builds it, and at 100 {yellow}New Face{/} comes in person.', 'Under 300 crime is a fine. Above that, you go to a room. Far above that, you get discontinued.', '{yellow}Surprise inspections{/} search your shelves and seize what they find.', 'The {yellow}crooked poster{/} hides a stash. Leave it pulled and inspectors search there too.', 'Stolen goods cool off a little every night. Bribes exist. So do consequences.'], 'u_st_gauge'],
  ['PROP PILLS', ['Click the {yellow}terminal{/}. You can buy boxes of pills, or set it to sell them overnight. {yellow}DISP{/} prints a jar into stock, with any label you dare.', 'To make your own, press the {yellow}flask key{/} on the terminal to go to the back lab:', '{yellow}1.{/} Order reagents. They come by crate in the morning.', '{yellow}2.{/} Drag them into the flask and set the heat. It cooks overnight.', '{yellow}3.{/} Drag the flask to the evaporator. It dries overnight.', '{yellow}4.{/} Drag the tray to the pill press. It fills a jar overnight.', '{yellow}5.{/} Drag the jar onto the scanner, then press SHELVE.'], 'l_jar_pharma'],
  ['NIGHT', ['Closing brings up the {yellow}ledger{/}. Tick the services you will pay for: power, janitor, insurance. Then {yellow}STAMP: SLEEP{/}.', 'No power means no rack, no lab and no pill sales. No janitor means garbage piles up. People notice who you stop paying.', 'The {yellow}A.S.S. DOOR{/} leads to the dumpster. Search it for things to sell. It costs one customer tomorrow, and each search is riskier.', 'Read the morning {yellow}report{/}. It tells you what happened while you slept.'], 'u_check_on'],
  ['STARTS + DEBT', ['{yellow}Before you sign:{/} pick how you got here, then spend 3 points on perks. Flaws give points back.', 'On a Sunday, {yellow}Big Invoice{/} will pay your way in: a down payment, then a set fee each week with no rent. Finish and the unit is yours.', 'Miss a payment and they take your 3 best things. Miss three and you are out.', '{yellow}Off-duty mercs{/} sometimes order a gun and ammo by a set day. Have both in stock when they come back.', 'Catch a lie, or see a stolen item on the counter, and you can {yellow}LEAN ON THEM{/} for 40% off. It costs standing and goes on your record.', 'The {yellow}identifier{/} on the counter tells you the truth about 3 things a day. Click it, then click an item.'], 'u_pk_lease'],
  ['INSPECTIONS', ['{yellow}New Face{/} searches everything except the stash behind a hung poster. The worst thing found decides what happens.', 'Curse {yellow}4{/}: you go to a room. Curse {yellow}3{/}: a fine for everything found. Curse {yellow}2{/} or stolen goods: all of it is seized. Curse {yellow}1{/}: a warning. Clean: +3 standing.', 'A cursed cart in your case brings him that day. {yellow}New Face\'s Grace{/} saves you once. Leroy dresses as him, but only has eight screens: report him for cash.', 'Click a cart a seller holds to put it on the {yellow}tray{/}. Drag the {yellow}identifier{/} and the cart around, looking through its ring, compare it to the {yellow}GUIDE{/}, then confront them with the exact issue. A wrong reason costs 2 standing.']],
  ['THE MALL PA', ['{yellow}Linda{/} makes announcements over the speaker on the wall. A chime plays and her words type out of it, onto the bar beside it.', 'They are not just flavor. Her news changes prices, sometimes for days, sometimes just for today. The end of each one tells you what changed.', 'Sell carts when she says they are hot. Buy them when she says they are cheap.', 'Hover the speaker to see what is in effect. Click it to hear the last one again.'], 'u_pa_on'],
  ['RENT + WINNING', ['{yellow}Linda{/} comes every Sunday. Rent goes up every Sunday. If you cannot pay, you get thrown out once your grace runs out.', '{yellow}To win:{/} pay Linda the full buyout price on a Sunday and the unit is yours.', 'People will come to your window over the weeks. Listen to them. What you do with the little cart with the grin on it decides how your story ends.', 'Your {yellow}phone{/} has mail and standing. {yellow}NOTES{/} on the ledger keeps what you have learned.', 'If anyone asks you to press something, think about who is asking.'], 'i_cart_evil'],
];
const MODALS = {
  settings() {
    if (modal !== lastModal) { lastModal = modal; modalT = 0; S.sfx('crt'); }
    rect(0, 0, W, H, '#0a0710a0');
    const im = IMG.u_set_panel, x = 276, w = 1120, k = w / im.width, h = im.height * k, y = 86, v = S.vol; mBox = [x, y, w, h];
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x, y, w, h);
    T('SETTINGS', x + 440, y + 72, { s: 3, color: 'white' });
    const rows = [['master', 'MASTER', 260], ['music', 'MUSIC', 417], ['sfx', 'EFFECTS', 575]], px = x + 157 * k, pw = 287 * k, wx = x + 457 * k, ww = 972 * k, wh = 126 * k;
    const icon = (n, on, ry) => { const q = [px + 10, ry + (wh - 66) / 2, 66, 66], o = inR(q); ctx.drawImage(IMG[`u_ai_${n}_${on ? 'on' : 'off'}`], q[0], q[1], q[2], q[3]); if (o) hot = true; return o && M.released && pressedOn && inR(q, pressedOn.x, pressedOn.y); };
    for (const [key, label, ry0] of rows) {
      const ry = y + ry0 * k, mk = key === 'music' ? 'muteM' : key === 'sfx' ? 'muteS' : 'muted', off = v[mk];
      if (icon(key, !off, ry)) { M.released = false; v[mk] = !off; S.applyVol(true); S.sfx('select'); }
      T(label, px + 84, ry + wh / 2 - 9, { fit: pw - 92 });
      const sw = ww - 16, sc = sw / IMG.u_sl_empty.width, sh = IMG.u_sl_empty.height * sc, sx = wx + 8, sy = ry + (wh - sh) / 2, val = v[key];
      ctx.drawImage(IMG.u_sl_empty, sx, sy, sw, sh);
      if (val > 0) { const f = off ? IMG.u_sl_pink : IMG.u_sl_green, cw = SL_GAPS[val]; ctx.drawImage(f, 0, 0, cw, f.height, sx, sy, cw * sc, sh); }
      const well = [wx, ry, ww, wh], ov = inR(well) && !slDrag;
      if (M.pressed && inR(well)) slDrag = key;
      if (slDrag === key) { let b = 0, d = 1e9; SL_GAPS.forEach((g, i) => { const e = Math.abs(sx + g * sc - M.x); if (e < d) { d = e; b = i; } }); if (b !== val) { v[key] = b; S.applyVol(); S.sfx('dial'); } if (!M.down || M.released) { slDrag = null; S.applyVol(true); if (key === 'sfx') S.sfx('stamp'); } }
      const kn = slDrag === key ? IMG.u_knob_p : ov ? IMG.u_knob_h : IMG.u_knob_n, kh = sh * .96, kw = kn.width * kh / kn.height; ctx.drawImage(kn, sx + SL_GAPS[v[key]] * sc - kw / 2, sy + (sh - kh) / 2, kw, kh);
      if (ov) hot = true;
    }
    { const ry = y + 735 * k, wr = [wx, ry, ww, wh], m = v.muted, sw = ww - 16, sc = sw / IMG.u_sl_empty.width, sh = IMG.u_sl_empty.height * sc, sx = wx + 8, sy = ry + (wh - sh) / 2;
      const key = [px + 8, ry + (wh - 76) / 2, 70, 76], ko = inR(key); ctx.drawImage(m ? IMG.u_mute_on : IMG.u_mute_off, key[0], key[1], key[2], key[3]); if (ko) { hot = true; if (M.released && pressedOn && inR(key, pressedOn.x, pressedOn.y)) { M.released = false; v.muted = !m; S.applyVol(true); S.sfx('clunk'); } }
      T('MUTE', px + 84, ry + wh / 2 - 9, { fit: pw - 92 });
      [['muted', 'ALL'], ['muteM', 'MUSIC'], ['muteS', 'EFFECTS']].forEach(([mk, lab], i) => {
        const sh2 = Math.min(wh + 6, 96), sw2 = sh2 * IMG.u_sw_on.width / IMG.u_sw_on.height, qx = wx + 40 + i * (ww / 3), q = [qx, ry + (wh - sh2) / 2, sw2, sh2], hit = [qx, q[1], ww / 3 - 50, sh2], o = inR(hit), on = !v[mk];
        ctx.drawImage(on ? IMG.u_sw_on : IMG.u_sw_off, q[0], q[1], q[2], q[3]); T(lab, qx + sw2 + 12, ry + wh / 2 - 9, { color: on ? 'green' : 'gray' });
        if (o) { hot = true; if (M.released && pressedOn && inR(hit, pressedOn.x, pressedOn.y)) { M.released = false; v[mk] = on; S.applyVol(true); S.sfx('clunk'); } }
      }); }
    if (btn(W / 2 - 210, y + h + 6, 200, 42, 'DONE', {})) { modal = null; slDrag = null; }
    if (btn(W / 2 + 10, y + h + 6, 200, 42, 'RULE BOOK', {})) { modal = 'help'; modalData = { page: 0 }; slDrag = null; }
  },
  terminal() {
    if (modal !== lastModal) { lastModal = modal; modalT = 0; S.sfx('crt'); }
    modalT = Math.min(14, modalT + 1); rect(0, 0, W, H, '#0a071070');
    const k = .835, tx = (W - 1399 * k) / 2, ty = 2 + Math.pow(1 - modalT / 14, 2) * 500; mBox = [tx, ty, 1399 * k, 1124 * k];
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.u_terminal, tx, ty, 1399 * k, 1124 * k);
    const key = (r, label, fn, o = {}) => {   // the keys painted on your terminal are the real buttons
      const q = [tx + r[0] * k, ty + r[1] * k, r[2] * k, r[3] * k], over = inR(q);
      if (o.on) { ctx.strokeStyle = LIME; ctx.lineWidth = 3; ctx.strokeRect(q[0], q[1], q[2], q[3]); }
      if (over) { hot = true; rect(q[0], q[1], q[2], q[3], M.down ? '#0a071060' : '#ffffff22'); tip = o.tip ? { title: o.tip, lines: [] } : tip; }
      if (label) { const lc = o.ink || '#2b2130', lit = lc === '#2b2130' ? '#f0dfc0a0' : '#0a0710c0'; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(q[0] + q[2] / 2), Math.round(q[1] + q[3] / 2 - 10 + (over && M.down ? 2 : 0))); ctx.save(); ctx.translate(0, lc === '#2b2130' ? 2 : -2); ctx.scale(2, 2); S.font.draw(proxy, label, 0, 0, { color: lit, align: 'center', shadow: false }); ctx.restore(); ctx.scale(2, 2); S.font.draw(proxy, label, 0, 0, { color: lc, align: 'center', shadow: false }); ctx.restore(); }
      if (over && M.released && pressedOn && inR(q, pressedOn.x, pressedOn.y)) { M.released = false; S.sfx(fn ? 'select' : 'blip'); if (fn) fn(); }
    };
    const TABS = [['buy', 'BUY'], ['sell', 'SELL'], ['inv', 'INV'], ['disp', 'DISP']];
    [[392, 745, 94, 86], [497, 745, 94, 86], [602, 745, 94, 86], [705, 745, 96, 86]].forEach((r, i) => key(r, TABS[i][1], () => { modalData.tab = TABS[i][0]; }, { on: modalData.tab === TABS[i][0] }));
    const iconKey = (r, icon, tipT, fn, on) => { key(r, '', fn, { on, tip: tipT }); const sz = 64, cx = tx + (r[0] + r[2] / 2) * k, cy = ty + (r[1] + r[3] / 2) * k; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG['l_' + icon], cx - sz / 2, cy - sz / 2, sz, sz); };
    iconKey([378, 838, 106, 96], 'ti_press', G.isOpen('lab') ? 'Lab status' : 'Back lab: opens day 6', () => { if (G.isOpen('lab')) modalData.tab = 'lab'; }, modalData.tab === 'lab');
    iconKey([492, 838, 104, 96], 'ti_reag', G.isOpen('lab') ? 'Order reagents' : 'Reagents: opens day 6', () => { if (G.isOpen('lab')) modalData.tab = 'chem'; }, modalData.tab === 'chem');
    iconKey([603, 838, 98, 96], 'ti_chem', 'Go to the back lab', () => { modal = null; lab = {}; S.sfx('door'); });
    key([707, 838, 102, 96], '', null);
    [[165, 748, 88, 86, -5], [255, 748, 86, 86, -1], [150, 838, 86, 96, 1], [238, 838, 96, 96, 5]].forEach(r => key(r, (r[4] > 0 ? '+' : '') + r[4], () => { G.vend.price = Math.max(1, G.vend.price + r[4]); modalData.tab = 'sell'; }, { ink: '#e8dfc8', tip: 'Overnight pill price' }));
    key([862, 757, 148, 78], 'NEXT', () => { const l = TABS.map(t => t[0]).concat(['chem', 'lab']); modalData.tab = l[(l.indexOf(modalData.tab) + 1) % l.length]; });
    key([872, 852, 152, 80], G.vend.on ? 'ON' : 'OFF', () => { G.vend.on = !G.vend.on; }, { tip: 'Sell pills overnight' });
    key([1050, 748, 225, 190], 'EXIT', () => { modal = null; }, { ink: '#fff0f4' });
    if (!modal) return;
    termTab = modalData.tab;
    const b = { x: tx + 292 * k, w: 680 }; let y = ty + 130 * k; box(tx + 280 * k, ty + 120 * k, 710, 420, 'terminal ' + modalData.tab, 0);
    termInk();
    const RULE = '#2f7a4c', names = D.COND.PILL, tab = modalData.tab, X = b.x, RX = b.x + b.w;
    const line = yy => rect(X, yy, b.w, 1, RULE);
    const PAGE = { buy: 'SUPPLIER', sell: 'OVERNIGHT SALES', inv: 'INVENTORY', disp: 'DISPENSE A JAR', chem: 'REAGENTS', lab: 'BACK LAB' }[tab];
    T('PROP PILLS', X, y, { s: 3, color: 'white' }); T('v2.4', X + 212, y + 8, { color: 'gray' }); T('$' + Math.floor(G.cash), RX, y, { s: 3, align: 'right', color: 'yellow' }); y += 34;
    rect(X, y, b.w, 2, '#5fa877'); y += 10;
    const pw = T(`> ${PAGE}`, X, y, { color: 'green' }); if (frame % 60 < 36) rect(X + pw + 6, y + 2, 10, 15, '#7dff9e'); y += 28;
    const pick = (label, cur, kind, text, set) => { T(label, X, y, { color: 'gray' }); y += 22; const bw = (b.w - 16) / 5; [0, 1, 2, 3, 4].forEach(i => { if (btn(X + i * (bw + 4), y, bw, 34, text(i), { kind: cur === i ? kind : 'tan' })) set(i); }); y += 44; };
    const gradeBtn = i => `${names[i][0].split(' ')[0]} ${G.pills[i]}`, labelBtn = i => names[i][0].split(' ')[0];
    if (tab === 'buy') {
      T('GRADE', X, y, { color: 'gray' }); T('BOX OF 5', X + 250, y, { color: 'gray' }); T('ON HAND', X + 400, y, { color: 'gray' }); y += 24; line(y - 4);
      [[1, 'PHARMA', 110], [2, 'STREET', 60], [3, 'CUT', 30]].forEach(([g, n, c]) => { T(n, X, y + 10); T(`$${c}`, X + 250, y + 10, { color: 'yellow' }); T(`${G.pills[g]}`, X + 400, y + 10); if (btn(RX - 120, y, 120, 38, 'ORDER', { kind: 'green', disabled: G.cash < c })) { G.cash -= c; G.pills[g] += 5; S.sfx('coin'); } y += 46; line(y - 4); });
      y += 8; T('Your money. Their pills.', X, y, { color: 'gray' });
    }
    if (tab === 'sell') {
      T('STATUS', X, y + 8, { color: 'gray' }); T(G.vend.on ? 'SELLING' : 'OFF', X + 100, y + 8, { color: G.vend.on ? 'green' : 'red' });
      T('PRICE', X + 260, y + 8, { color: 'gray' }); T(`$${G.vend.price}`, X + 340, y + 8, { color: 'yellow' });
      if (btn(RX - 150, y, 150, 36, G.vend.on ? 'TURN OFF' : 'TURN ON', { kind: G.vend.on ? 'tan' : 'green' })) G.vend.on = !G.vend.on; y += 46;
      pick('REAL GRADE', G.vend.grade, 'green', gradeBtn, i => { G.vend.grade = i; });
      pick('LABEL SAYS', G.vend.claim, 'pink', labelBtn, i => { G.vend.claim = i; });
      [[-5, '-5'], [-1, '-1'], [1, '+1'], [5, '+5']].forEach(([d, l], i) => { if (btn(X + i * 70, y, 64, 32, l)) G.vend.price = Math.max(1, G.vend.price + d); });
      TW(G.vend.claim < G.vend.grade ? '{red}LABEL LIES.{/} {gray}Complaints become FRAUD.{/}' : '{gray}Runs at night. Needs power.{/}', X + 300, y + 6, 380);
    }
    if (tab === 'inv') {
      T('GRADE', X, y, { color: 'gray' }); T('COUNT', X + 340, y, { color: 'gray' }); T('PRICE', RX, y, { align: 'right', color: 'gray' }); y += 24; line(y - 4);
      names.forEach((n, i) => { T(n[0], X, y + 4); T(`${G.pills[i]}`, X + 340, y + 4, { color: G.pills[i] ? 'green' : 'gray' }); T(`${n[1] > 0 ? '+' : ''}${n[1]}%`, RX, y + 4, { align: 'right', color: n[1] < 0 ? 'red' : 'yellow' }); y += 34; line(y - 4); });
    }
    if (tab === 'chem') {
      T('REAGENT', X, y, { color: 'gray' }); T('COST', X + 290, y, { color: 'gray' }); T('SHELF', X + 380, y, { color: 'gray' }); y += 24; line(y - 4);
      for (const k in D.REAGENTS) { const q = D.REAGENTS[k], due = (G.lab.crate[k] || 0); T(q.name, X, y + 10); T('$' + q.cost, X + 290, y + 10, { color: 'yellow' }); T(`${G.lab.stock[k]}${due ? ` {green}+${due}{/}` : ''}`, X + 380, y + 10); if (btn(RX - 120, y, 120, 38, 'ORDER', { kind: 'green', disabled: G.cash < q.cost })) { G.labOrder(k); S.sfx('coin'); } y += 46; line(y - 4); }
      y += 8; T('Crate comes to the back lab in the morning.', X, y, { color: 'gray' });
    }
    if (tab === 'lab') {
      const l = G.lab, row = (n, v, c) => { T(n, X, y + 4, { color: 'gray' }); T(v, X + 200, y + 4, { color: c || 'normal', fit: b.w - 200 }); y += 32; line(y - 4); };
      row('FLASK', !l.flask ? 'EMPTY' : l.flask.st === 'burnt' ? 'BURNT' : l.flask.st === 'cooked' ? 'COOKED: MOVE IT' : `MIXING AT ${l.temp}C`, l.flask && l.flask.st === 'burnt' ? 'red' : null);
      row('EVAPORATOR', l.evap ? 'RUNNING TONIGHT' : 'IDLE'); row('POWDER TRAY', l.tray ? 'READY TO PRESS' : 'EMPTY', l.tray ? 'green' : null);
      row('PILL PRESS', !G.upgrades.press ? 'NOT INSTALLED' : l.jam ? 'JAMMED' : l.press ? 'PRESSING TONIGHT' : 'IDLE', l.jam ? 'red' : null);
      row('JAR', l.jar ? 'WAITING FOR THE SCANNER' : l.scan ? 'ON THE SCANNER' : 'NONE', l.jar ? 'yellow' : null);
      if (btn(X, y + 6, 200, 42, 'OPEN LAB', { kind: 'green' })) { modal = null; lab = {}; S.sfx('door'); return; }
    }
    if (tab === 'disp') {
      pick('REAL GRADE', modalData.grade, 'green', gradeBtn, i => { modalData.grade = i; });
      pick('LABEL SAYS', modalData.claim, 'pink', labelBtn, i => { modalData.claim = i; });
      if (btn(X, y, 220, 42, 'DISPENSE', { kind: 'pink', disabled: G.pills[modalData.grade] <= 0 })) { const it = G.dispense(modalData.grade, modalData.claim); say(it ? 'One jar, into stock.' : 'No room in stock.'); }
      TW(modalData.claim < modalData.grade ? '{red}LABEL LIES.{/} {gray}Your call. Drag the jar to the counter to sell.{/}' : '{gray}Prints a jar into your stock. Drag it to the counter to sell.{/}', X + 236, y - 2, b.w - 236);
    }
    // the glass: scanlines and a slow bright band over everything on the screen
    ctx.save(); ctx.beginPath(); [[275, 125], [1115, 125], [1155, 622], [245, 622]].forEach((q, i) => i ? ctx.lineTo(tx + q[0] * k, ty + q[1] * k) : ctx.moveTo(tx + q[0] * k, ty + q[1] * k)); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#04100a38'; for (let sy = Math.floor(ty + 120 * k); sy < ty + 625 * k; sy += 3) ctx.fillRect(tx + 240 * k, sy, 920 * k, 1);
    const band = ty + 125 * k + ((frame * .7) % 460); ctx.fillStyle = '#7dff9e0c'; ctx.fillRect(tx + 240 * k, band, 920 * k, 40);
    ctx.restore();
  },
  offers() {
    const b = mHead('OFFERS', 1300, 800, true);
    let y = tabs(b, [[0, 'STOCK DEALS'], [1, 'REQUESTS'], [2, 'UPGRADES']]);
    if (modalData.tab === 0) {
      G.offers.forEach((o, i) => {
        if (o.gone) return;
        if (o.item) { fitImg(IMG['i_' + D.ITEMS[o.item.id].art], b.x, y, 62, 62); T(D.ITEMS[o.item.id].name, b.x + 78, y + 8, { color: 'crt' }); T(`{gray}${G.condOf(o.item)[0]}, shelf $${G.shelf(o.item)}{/}`, b.x + 78, y + 34); }
        else { fitImg(IMG.i_pill_jar, b.x, y, 62, 62); T(`5 ${D.COND.PILL[o.pills][0]} PROP PILLS`, b.x + 78, y + 8, { color: 'crt' }); T('{gray}Into the terminal{/}', b.x + 78, y + 34); }
        if (btn(b.x + b.w - 170, y + 8, 170, 42, `BUY $${o.cost}`, { kind: 'green', disabled: G.cash < o.cost })) {
          if (o.item) { o.item.owned = true; if (G.stockPlace(o.item)) { G.cash -= o.cost; o.gone = true; S.sfx('coin'); } else { say('No room in stock.'); G.remove(o.item); } }
          else { G.cash -= o.cost; G.pills[o.pills] += o.n; o.gone = true; S.sfx('coin'); }
        }
        y += 74;
      });
      T('{gray}New deals every other day.{/}', b.x, b.Y + b.H - 54);
    } else if (modalData.tab === 1) {
      if (!G.requests.length) T('{gray}No requests right now.{/}', b.x, y);
      G.requests.forEach(r => { fitImg(IMG['i_' + D.ITEMS[r.id].art], b.x, y, 62, 62); T(D.ITEMS[r.id].name, b.x + 78, y + 8, { color: 'crt' }); T(`{gray}${D.FACTIONS[r.fac].name} pays $${r.reward}{/}`, b.x + 78, y + 34); const has = G.items.some(i => i.owned && i.id === r.id && ['stock', 'stock2'].includes(i.grid)); if (btn(b.x + b.w - 170, y + 8, 170, 42, 'DELIVER', { kind: 'pink', disabled: !has })) { if (G.fulfil(r)) S.sfx('coin'); } y += 74; });
    } else {
      const col = (b.w - 16) / 2; let row = 0;
      const ups = D.UPGRADES.filter(u => !u.req || G.upgrades[u.req]), pages = Math.ceil(ups.length / 8); modalData.upPage = (modalData.upPage || 0) % pages;
      if (pages > 1 && btn(b.x + b.w - 150, b.Y + b.H - 66, 130, 42, `PAGE ${modalData.upPage + 1}/${pages}`)) modalData.upPage = (modalData.upPage + 1) % pages;
      ups.slice(modalData.upPage * 8, modalData.upPage * 8 + 8).forEach(u => {
        const own = G.upgrades[u.id] && !u.repeat, cost = u.id === 'grace' ? G.graceCost : u.id === 'secgrace' ? (G.secGraceCost || u.cost) : u.cost, x = b.x + (row % 2) * (col + 16), yy = y + Math.floor(row / 2) * 122; row++;
        rect(x, yy, col, 116, GLASS2); T(u.name, x + 10, yy + 8, { color: 'crt' }); TW(u.desc, x + 10, yy + 30, col - 130, { color: 'gray' });
        if (btn(x + col - 112, yy + 20, 104, 42, own ? 'OWNED' : '$' + cost, { kind: 'pink', disabled: own || G.cash < cost || (u.reqRep && G.rep.cops < u.reqRep) || (u.id === 'scrub' && G.scrubCd > 0) })) { if (G.buyUpgrade(u)) S.sfx('save'); }
      });
    }
    mClose(b);
  },
  phone() {
    if (modal !== lastModal) { lastModal = modal; modalT = 0; S.sfx('phone'); }
    modalT = Math.min(14, modalT + 1);
    rect(0, 0, W, H, '#0a071070');
    const k = .6, im = IMG.u_phone, pw = 1024 * k, ph = 1536 * k, px = (W - pw) / 2, py = 2 + Math.pow(1 - modalT / 14, 2) * 500;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(im, px, py, pw, ph);
    const sx = px + 170 * k, sy = py + 172 * k, sw = 690 * k, sh = 1180 * k, tab = modalData.tab, bx = sx + 12, bw = sw - 24;
    const home = [px + 430 * k, py + 1392 * k, 165 * k, 78 * k];
    const pressedHere = (r) => M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y) && inR(r);
    if (inR(home)) { hot = true; if (pressedHere(home)) { M.released = false; S.sfx('select'); if (tab == null) { modal = null; return; } modalData.tab = null; return; } }
    if (M.released && pressedOn && !inR([px + 110 * k, py, 810 * k, ph]) && !inR([px + 110 * k, py, 810 * k, ph], pressedOn.x, pressedOn.y)) { M.released = false; modal = null; return; }
    box(sx, sy, sw, sh, 'phone ' + modalData.tab, 0); let y = sy + 12;
    T(`DAY ${G.day}  ${G.DAYS[G.day % 7]}`, bx, y, { color: 'gray' }); T('$' + Math.floor(G.cash), bx + bw, y, { align: 'right', color: 'green' }); y += 28;
    if (tab == null) {
      T('CARL PHONE', sx + sw / 2, y + 6, { s: 3, align: 'center', color: 'pink' }); y += 56;
      const apps = [['app_mail', 'MAIL', 0], ['app_rep', 'STANDING', 1], ['app_sheet', 'SHEET', 2]], sz = 118, gap = (sw - sz * 2) / 3;
      apps.forEach(([a, l, id], i) => {
        const ax = sx + gap + (i % 2) * (sz + gap), ay = y + Math.floor(i / 2) * (sz + 50), r = [ax, ay, sz, sz], over = inR(r), a2 = IMG['u_' + a];
        ctx.drawImage(a2, ax, ay + (over && M.down ? 2 : 0), sz, sz); if (over) { hot = true; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12; ctx.drawImage(a2, ax, ay, sz, sz); ctx.restore(); }
        T(l, ax + sz / 2, ay + sz + 6, { align: 'center' });
        if (pressedHere(r)) { M.released = false; S.sfx('select'); modalData.tab = id; }
      });
      T('{gray}HOME BUTTON: PUT IT AWAY{/}', sx + sw / 2, sy + sh - 28, { align: 'center' });
      return;
    }
    T(['MAIL', 'STANDING', 'SHEET'][tab], bx, y, { s: 3, color: 'pink' }); y += 38; rect(bx, y, bw, 2, PINK); y += 10;
    const bottom = sy + sh - 60;
    if (tab === 0) for (const m of G.mail.slice(0, 9)) { if (y > bottom - 50) break; T(`{gray}D${m.day}{/} {pink}${m.title}{/}`, bx, y); y += 20; y += TW(m.body, bx, y, bw) + 10; }
    if (tab === 1) for (const f in D.FACTIONS) {
      const v = Math.round(G.rep[f]); T(D.FACTIONS[f].name, bx, y, { color: 'crt' }); T((v > 0 ? '+' : '') + v, bx + bw, y, { align: 'right', color: v < 0 ? 'red' : 'green' }); y += 20;
      rect(bx, y, bw, 10, INK); rect(bx + bw / 2, y, 1, 10, '#6d5e63'); rect(bx + bw / 2 + Math.min(0, v) / 400 * bw, y + 2, Math.abs(v) / 400 * bw, 6, v < 0 ? RED : LIME); y += 16;
      const act = D.PERKS[f].filter(p => p[0] > 0 ? v >= p[0] : v <= p[0]).map(p => p[1]).join(', ');
      y += (act ? TW(act, bx, y, bw, { color: 'yellow' }) : 0) + 8;
    }
    if (tab === 2) for (const s2 of [`Evidence ${Math.round(G.evidence)}/100`, `Crime: curse ${G.crime.CURSE}, fencing ${G.crime.FENCING}, fraud ${G.crime.FRAUD}, bribery ${G.crime.BRIBERY}`, 'Under 300 crime at 100 evidence: a fine. 300 to 1499: a room. 1500+: discontinued.', `Attractiveness ${G.attract()}, ${G.customerCount()} walk-ins a day`, `Sold $${G.stats.sold}, bought $${G.stats.bought}, rent paid $${G.stats.rent}`, `Buy the unit: $${G.price()}`]) y += TW(s2, bx, y, bw) + 10;
    if (btn(bx, sy + sh - 50, 130, 40, 'BACK', {})) modalData.tab = null;
  },
  label() {
    const it = modalData.it, def = D.ITEMS[it.id], b = mHead('LABEL PRINTER', 720, 480);
    let y = b.y;
    fitImg(IMG['i_' + def.art], b.x, y, 110, 110); T(def.name, b.x + 124, y + 4, { color: 'crt' }); y += TW(`Label says ${G.condOf(it)[0]}. Customers who check can catch a lie: -4 rep and the true price. Lies that stick build a FRAUD file.`, b.x + 124, y + 30, b.w - 136, {}) + 44;
    const list = D.COND[def.type];
    list.forEach((c, i) => { if (btn(b.x + (i % 3) * 200, y + Math.floor(i / 3) * 48, 192, 42, c[0], { kind: i === it.fake ? 'pink' : 'tan' })) { G.relabel(it, i); S.sfx('stamp'); } });
    mClose(b);
  },
  close() {
  const b = mHead('LEDGER', 672, 932, 'clip', `DAY ${G.day}  ${G.DAYS[G.day % 7]}`);
    let y = b.y;
    formRow(b.x, y, b.w, 'CASH ON HAND', '$' + Math.floor(G.cash)); y += 34;
    T('{gray}TICK WHAT YOU WILL PAY FOR TONIGHT{/}', b.x, y); y += 26;
    for (const k in D.SERVICES) {
      const s = D.SERVICES[k]; if (s.needs && !G.upgrades[s.needs]) continue;
      const on = G.services[k], r = [b.x, y, b.w, 22 + wrapH(s.desc, b.w - 50)];
      checkbox(b.x, y + 4, on);
      T(s.name, b.x + 36, y, { color: 'normal' }); T((on ? '-$' : '$') + G.serviceCost(k), b.x + b.w, y, { align: 'right', color: on ? 'red' : 'gray' }); const dh = TW('{gray}' + s.desc + '{/}', b.x + 36, y + 20, b.w - 36);
      rect(b.x, y + 22 + dh, b.w, 1, PAPER_EDGE);
      if (inR(r)) { hot = true; if (M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { G.services[k] = !on; S.sfx('stamp'); M.released = false; } }
      y += 28 + wrapH(s.desc, b.w - 50);
    }
    const f = G.feesTotal(), bal = G.cash - f, ry = b.Y + b.H - 170;
    rect(b.x, ry - 6, b.w, 3, PINK_INK);
    formRow(b.x, ry + 2, b.w, 'TONIGHT', '-$' + f, { vcolor: 'red' });
    T('BALANCE', b.x, ry + 32, { s: 3 }); T('$' + Math.floor(bal), b.x + b.w, ry + 32, { s: 3, align: 'right', color: bal < 0 ? 'red' : 'green' });
    const rd = (7 - G.day % 7) % 7 || 7; T(`{gray}Rent $${G.rent + G.arrears} due in ${rd} day${rd > 1 ? 's' : ''}{/}`, b.x, ry + 68);
    if (btn(b.x + b.w - 190, b.Y + b.H - 66 - 38, 190, 34, 'BACK LAB', {})) { modal = null; lab = { back: 'close' }; S.sfx('door'); return; }
    if (btn(b.x, b.Y + b.H - 66, 176, 46, 'A.S.S. DOOR', {})) { modal = null; if (!G.wentOut) G.goOut(); ass = { log: ['The back door opens on the dumpster. Dig for things to sell.'], found: [] }; S.sfx('door'); }
    if (btn(b.x + 182, b.Y + b.H - 66, 100, 46, 'NOTES', {})) { modal = 'notes'; modalData = { back: 'close' }; return; }
    if (btn(b.x + b.w - 190, b.Y + b.H - 66, 190, 46, 'STAMP: SLEEP', { kind: 'pink', disabled: f > G.cash })) { S.sfx('stamp'); S.sfx('night'); modal = null; ass = null; if (G.tut) { tutFinish(); return; } G.endNight(); if (G.phase !== 'over') { modal = 'report'; G.save(); } }
  },
  report() {
    const b = mHead('THE FUTURE TIMES', 860, 620, false, 'FREE WITH RENT');
    let y = b.y;
    T(`{gray}DAY ${G.day}, ${G.DAYS[G.day % 7]}. PUBLISHED BY THE MALL OF THE FUTURE. SHUT UP.{/}`, b.x, y); y += 26;
    const evNew = G.news || G.mail.find(m => m.day === G.day && D.EVENTS.some(e => e.name === m.title));
    if (evNew) { T(evNew.title, b.x, y, { s: 3, color: 'red' }); y += 36; y += TW(evNew.body, b.x, y, b.w) + 10; }
    else { T(G.day === 1 ? 'NEW TENANT IN UNIT 9' : 'NOTHING HAPPENS AGAIN', b.x, y, { s: 3 }); y += 42; }
    rect(b.x, y, b.w, 1, PINK_INK); y += 8;
    T('{gray}POLICE BLOTTER: YOUR SHOP{/}', b.x, y); y += 24;
    const log = G.log.length ? G.log : ['A quiet night. Too quiet. Then a normal amount of quiet.'];
    const cy = b.Y + b.H - 136;
    for (const l of log.slice(0, 9)) { if (y + wrapH(l, b.w - 14) > cy - 6) break; y += TW(l, b.x, y, b.w) + 6; }
    for (let i = 0; i < 7; i++) { const d = G.day + i, sun = d % 7 === 0, cw = (b.w - 36) / 7, cx = b.x + i * (cw + 6); rect(cx, cy, cw, 48, i === 0 ? PAPER_EDGE : PAPER2); T(`{${sun ? 'red' : 'gray'}}${G.DAYS[d % 7]}{/}`, cx + 8, cy + 4); T(sun ? 'RENT' : String(d), cx + 8, cy + 25, { color: sun ? 'red' : 'normal' }); }
    if (btn(b.X + b.W - 280, b.Y + b.H - 66, 254, 46, 'TO THE COUNTER', { kind: 'green' })) modal = null;
  },
  dennis() {
    const b = mHead("DENNIS'S HANDHELD", 960, 720, 'crt'); let y = b.y;
    const logs = STORY.LOGS.slice(0, G.story.logRead), st = G.story;
    if (!logs.length) T('NO BATTERY. COME BACK ANOTHER NIGHT.', b.x, y, { color: 'crt' });
    logs.forEach((l, i) => { y += TW(l.t, b.x, y, b.w - 20, { color: i === logs.length - 1 ? 'crt' : 'gray' }) + 10; });
    if (modalData.done) { y += 6; y += TW(modalData.done, b.x, y, b.w, { color: 'yellow' }) + 4; }
    else if (logs.length === STORY.LOGS.length && STORY.hasGrin(G) && !st.grinEnd) {
      TW('You have the cart with you. It is warm. It would take one button.', b.x, b.Y + b.H - 118, b.w - 20, { color: 'yellow' });
      if (btn(b.x, b.Y + b.H - 66, 260, 46, 'PRESS START', { kind: 'pink' })) {
        STORY.pressStart(G); S.sfx('grin');
        modalData.done = 'The screen goes white. Then: PLAYER SCAN. Then, for a long time, nothing. Then: ERROR. PLAYER IS NOT A HUMAN MAN. "I am," says Carl. EJECTING ALL SAVE DATA. Behind you the garbage shifts, and someone in the dark asks what year it is. Eleven someones.';
      }
    }
    if (btn(b.X + b.W - 200, b.Y + b.H - 66, 170, 46, 'CLOSE', {})) modal = null;
  },
  notes() {
    const b = mHead("CLIPBOARD", 672, 932, 'clip', `DAY ${G.day}`); let y = b.y;
    let room = b.Y + b.H - 80 - y; const list = []; for (const n of [...G.story.notes].reverse()) { const nh = wrapH(n.t, b.w - 64 - 14) + 6; if (nh > room) break; room -= nh; list.unshift(n); }
    if (!list.length) T('{gray}Nobody has told you anything yet.{/}', b.x, y);
    for (const n of list) { T(`{gray}D${n.day}{/}`, b.x, y); y += TW(n.t, b.x + 64, y, b.w - 64) + 6; }
    if (btn(b.X + b.W - 200, b.Y + b.H - 66, 170, 46, 'CLOSE', {})) { modal = modalData.back || null; }
  },
  lease() {
    const b = mHead('COMMERCIAL LEASE', 860, 700, false, 'FORM 9-C'); let y = b.y;
    y += TW('Tenant agrees to pay rent each Sunday, which rises each Sunday, to the Mall of the Future. Tenant is a normal human man. Select terms:', b.x, y, b.w - 12) + 18;
    for (const k of ['cozy', 'normal', 'hard']) { const d = D.DIFF[k]; if (btn(b.x, y, b.w, 46, `${d.name}  -  BUYOUT $${d.price}`, { kind: k === 'normal' ? 'pink' : 'tan' })) { modal = 'newrun'; modalData = { diff: k, sc: 'std', perks: [] }; return; } T('{gray}' + d.desc + '{/}', b.x, y + 50, { fit: b.w }); y += 88; }
    mClose(b);
  },
  newrun() {
    const d = modalData, b = mHead('SELECT TERMS', 1180, 800, false, D.DIFF[d.diff].name), lx = b.x, rx = b.x + 470, rw = b.w - 470; let y = b.y;
    const spent = d.perks.reduce((a, k) => a + D.START_PERKS[k].cost, 0), left = 3 - spent;
    T('HOW YOU GOT HERE', lx, y, { color: 'pink' }); y += 30;
    for (const [k, sc] of Object.entries(D.SCENARIOS)) { if (btn(lx, y, 440, 42, sc.name, { kind: d.sc === k ? 'pink' : 'tan' })) d.sc = k; TW('{gray}' + sc.desc + '{/}', lx, y + 46, 430); y += 106; }
    T('PERKS AND FLAWS', rx, b.y, { color: 'pink' }); T(`POINTS ${left}`, rx + rw, b.y, { align: 'right', color: left < 0 ? 'red' : 'green' });
    Object.entries(D.START_PERKS).forEach(([k, p], i) => {
      const sz = 112, cw = rw / 3, x = rx + (i % 3) * cw + (cw - sz) / 2, yy = b.y + 34 + Math.floor(i / 3) * 196, q = [x, yy, sz, sz], on = d.perks.includes(k), o = inR(q);
      ctx.imageSmoothingEnabled = true; ctx.save(); if (!on) ctx.globalAlpha = o ? 1 : .72; ctx.drawImage(IMG['u_' + p.art], x, yy, sz, sz); ctx.restore();
      if (on) { ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.strokeRect(x - 2, yy - 2, sz + 4, sz + 4); }
      T(p.name, x + sz / 2, yy + sz + 6, { align: 'center', fit: cw - 8, color: on ? 'green' : 'normal' }); T(p.cost > 0 ? `COST ${p.cost}` : `GIVES ${-p.cost}`, x + sz / 2, yy + sz + 28, { align: 'center', color: p.cost > 0 ? 'gray' : 'red' });
      if (o) { hot = true; tip = { title: p.name, lines: [p.desc] }; if (M.released && pressedOn && inR(q, pressedOn.x, pressedOn.y)) { M.released = false; if (on) d.perks = d.perks.filter(q2 => q2 !== k); else if (p.cost <= left) d.perks.push(k); else { S.sfx('bump'); return; } S.sfx('stamp'); } }
    });
    if (btn(lx, b.Y + b.H - 62, 170, 42, 'BACK')) { modal = null; return; }
    if (btn(b.X + b.W - 280, b.Y + b.H - 62, 250, 42, 'SIGN THE LEASE', { kind: 'green', disabled: left < 0 })) { G.tut = false; tut = null; G.newGame(d.diff); G.applyStart(d.sc, d.perks); G.morning(); scr = 'play'; shutterT = shutterGoal = 1; modal = 'report'; G.save(); }
  },
  repo() {
    const n = modalData || {}, im = IMG.u_repo_sheet, h = 800, w = h * im.width / im.height, x = (W - w) / 2, y = (H - h) / 2; rect(0, 0, W, H, '#0a071070'); mBox = [x, y, w, h];
    if (modal !== lastModal) { lastModal = modal; S.sfx('exclaim'); }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, x, y, w, h); ink(true);
    const l = x + w * .11, r = w * .78; let ty = y + h * .28; T('REPOSSESSED', l, ty, { s: 3, color: 'normal' }); ty += 40;
    ty += TW(`BIG INVOICE collected on missed payment ${n.missed} of 3. Taken from your unit:`, l, ty, r) + 14;
    for (const t of n.items || []) { T('- ' + t, l, ty, { color: 'pink', fit: r }); ty += 26; }
    if (!(n.items || []).length) { T('Nothing worth the truck. They noted that too.', l, ty, { fit: r, color: 'gray' }); }
    if (btn(x + w * .34, y + h * .84 - 44, w * .3, 42, 'SIGN')) { modal = null; }
  },
  inspect() {
    if (D.ITEMS[modalData.it.id].type === 'CART') return cartGlass(modalData.it);
    const it = modalData.it, def = D.ITEMS[it.id], b = mHead('INSPECT', 720, 480); let y = b.y; const keep = tip; itemTip(it); const t = tip; tip = keep;
    fitImg(IMG['i_' + (it.art || def.art)], b.x, y, 170, 170); T(def.name, b.x + 190, y, { color: 'pink', fit: b.w - 190 }); T(`{gray}SIZE ${def.w}x${def.h}{/}`, b.x + 190, y + 24); let ly = y + 54;
    for (const l of t.lines) ly += TW(l, b.x + 190, ly, b.w - 190) + 6;
    mClose(b);
  },
  help() {
    if (!modalData || modalData.page == null) modalData = { page: 0 };
    const b = mHead('', 1180, 800), P = GUIDE, cur = P[modalData.page], lx = b.x, cx = b.x + 236, cw = b.w - 236; let y = b.y;
    P.forEach((p, i) => { if (btn(lx, b.y + i * 48, 214, 42, p[0], { kind: i === modalData.page ? 'pink' : 'tan' })) modalData.page = i; });
    T(cur[0], cx, y, { s: 3, color: 'pink' }); y += 38;
    const pic = cur[2] && IMG[cur[2]]; if (pic) { fitImg(pic, cx + cw - 150, y, 150, 150); }
    for (const l of cur[1]) y += TW(l, cx, y, pic && y < b.y + 200 ? cw - 170 : cw) + 12;
    if (modalData.page > 0 && btn(cx, b.Y + b.H - 62, 130, 42, 'BACK')) modalData.page--;
    if (modalData.page < P.length - 1 && btn(cx + 140, b.Y + b.H - 62, 130, 42, 'NEXT', { kind: 'green' })) modalData.page++;
    mClose(b);
  },
  accuse() {
    if (D.ITEMS[modalData.it.id].type === 'CART') return cartGlass(modalData.it);
    const it = modalData.it, def = D.ITEMS[it.id], b = mHead('LOOK CLOSER', 720, 440); let y = b.y;
    fitImg(IMG['i_' + def.art], b.x, y, 150, 150); T(def.name, b.x + 170, y, { color: 'crt' }); T(`Label: ${G.condOf(it)[0]}`, b.x + 170, y + 24);
    TW(modalData.clue || 'Looks like what it says. Hard to tell without a test rig.', b.x + 170, y + 56, b.w - 170, { color: 'yellow' });
    if (it.exposed) T('{red}Called out. Price dropped.{/}', b.x, y + 170);
    else if (!it.tested && btn(b.x, y + 170, 280, 42, 'THAT LABEL IS A LIE', { kind: 'pink' })) { const ok = G.accuse(it); G.client.lastReply = ok ? 'Okay. Okay! Knock some off.' : 'Excuse me?! That is exactly what it is. (-2 rep)'; S.sfx(ok ? 'coin' : 'bump'); modal = null; }
    mClose(b);
  },
};

// ---- A.S.S. back room (your room PNG). The dark viewport shows the Lot.
// the A.S.S.: parked on the Lot. Its big window looks out at your garbage painting; the clipboard holds Carl's notes.
const SPOTS = [
  { id: 'crate', r: [0, 335, 285, 195], n: 'HAZARD CRATE', d: 'Odd things and ammo, maybe.', b: { odd: 2, ammo: 3 } },
  { id: 'crt', r: [40, 600, 310, 290], n: 'DEAD MONITOR', d: 'Somebody left a slot full.', b: { cart: 3, odd: 2 } },
  { id: 'rubble', r: [290, 470, 240, 120], n: 'BROKEN CONCRETE', d: 'Mostly concrete.', b: { junk: 2, pill: 2 } },
  { id: 'racks', r: [520, 370, 360, 170], n: 'WRECKED RACKS', d: 'Old mall fixtures.', b: { odd: 2, junk: 2 } },
  { id: 'locked', r: [960, 440, 240, 150], n: 'LOCKED CRATE', d: 'The lock is not a good lock.', b: { cart: 2, ammo: 3 } },
  { id: 'box', r: [1180, 170, 490, 280], n: 'SHIPPING CONTAINER', d: 'STILL IN TRANSIT, apparently.', b: { odd: 3, food: 2 } },
  { id: 'barrel', r: [1205, 460, 285, 150], n: 'RUST BARREL', d: 'It sloshes. Pills float.', b: { pill: 4 } },
  { id: 'tarp', r: [1000, 620, 300, 230], n: 'GREEN TARP', d: 'Something is keeping fresh under it.', b: { food: 3 } },
  { id: 'strap', r: [1300, 760, 372, 180], n: 'STRAPPED CRATE', d: 'Someone meant to come back for this.', b: { cart: 2, food: 2 } },
];
const DEVICE = [695, 640, 155, 75];
function lotLog(r) {
  if (r.hurt) ass.log.push(`{red}Something in the dumpster bit you. -$${r.hurt} for stitches.{/}`);
  if (r.items.length) r.items.forEach(i => { ass.found.push(i); ass.log.push(`Found: ${D.ITEMS[i.id].name}.`); });
  else if (r.pill != null) ass.log.push(`A loose ${D.COND.PILL[r.pill][0]} Prop Pill. Into the terminal.`);
  else if (r.full) ass.log.push('Found something. No room in stock. Left it.');
  else ass.log.push('Nothing. It is garbage all the way down.');
}
const logsReady = () => STORY.LOGS.filter(l => l.day <= G.day).length;
const newLog = () => G.story.logRead < logsReady() && G.story.logNight !== G.day;
// ---- the back lab: your room, your machines. Drag things along the bench; everything advances one stage a night.
const LAB = {
  r: { base: [24, 572, 118, 142], solv: [142, 526, 88, 190], stab: [230, 572, 62, 142], fill: [294, 610, 120, 106] },
  plate: [430, 530, 252, 196], flask: [482, 408, 148, 248], dial: [582, 214, 170, 172], evap: [700, 440, 256, 292], tray: [846, 668, 150, 66],
  press: [975, 462, 256, 272], jar: [1190, 632, 62, 106], scan: [1252, 452, 292, 290], pan: [1278, 606, 66, 112], screen: [1385, 508, 134, 92], crate: [1290, 792, 160, 144],
};
const pic = (n, r, lit) => { ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; if (lit) ctx.filter = 'brightness(1.3)'; ctx.drawImage(IMG['l_' + n], r[0], r[1], r[2], r[3]); ctx.restore(); };
const JARS = ['jar_pharma', 'jar_pharma', 'jar_street', 'jar_cut', 'jar_junk'];
function labHint() {
  const l = G.lab, f = l.flask;
  if (l.scan) return 'Scanner has read it. SHELVE sends the pills to your terminal.';
  if (l.jar) return 'Drag the finished jar onto the scanner tray.';
  if (l.jam) return 'The press is jammed. Fix it before the next batch.';
  if (l.tray && !G.upgrades.press) return 'Dry powder is ready. You need a pill press: $350.';
  if (l.tray && !l.press) return 'Drag the powder tray onto the pill press. It runs tonight.';
  if (f && f.st === 'cooked') return l.evap || l.tray ? 'Cooked. The evaporator line is still busy.' : 'Cooked. Drag the flask to the evaporator. It dries overnight.';
  if (f && f.st === 'burnt') return 'Burnt. Dump it and start again.';
  if (l.press || l.evap) { if (!f) return 'Machines run tonight. You can start another flask.'; }
  if (!f) return 'Drag reagents into the flask: one BASE POWDER and one SOLVENT at least.';
  if (!G.labReady(f)) return f.base ? 'Needs one SOLVENT for every BASE POWDER.' : 'Needs BASE POWDER.';
  const w = G.labWindow(f); if (!l.temp) return 'Turn the heat up. It cooks overnight.';
  if (l.temp >= w.burn) return 'This will burn. Turn it down.';
  return l.temp >= w.lo && l.temp <= w.hi ? 'Good heat. Sleep on it.' : l.temp < w.lo ? 'Runs cool: weak pills. Sweet spot is in the yellow.' : 'Runs hot: losing purity.';
}
function drawLab() {
  const l = G.lab, f = l.flask, d = lab.drag;
  ctx.drawImage(IMG.l_room, 0, 0, W, H);
  drawHud();
  const hover = r => !d && inR(r), tipFor = (r, title, line) => { if (hover(r)) { hot = true; tip = { title, lines: line ? [line] : [] }; } };
  const grab = (r, kind) => { if (!d && M.pressed && inR(r)) { lab.drag = { kind }; S.sfx('cursor'); M.pressed = false; } };
  // heat plate + dial
  pic(l.temp > 0 ? 'plate_on' : 'plate_off', LAB.plate);
  pic('dial', LAB.dial);
  { const c = [LAB.dial[0] + 424 * LAB.dial[2] / 847, LAB.dial[1] + 489 * LAB.dial[3] / 855], k = LAB.dial[2] / 847, a = l.temp ? -109 + (l.temp - 60) * 218 / 100 : -109;
    ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(a * Math.PI / 180); ctx.imageSmoothingEnabled = true; ctx.drawImage(IMG.l_needle, -65 * k, -452 * k, 130 * k, 514 * k); ctx.restore(); }
  if (btn(LAB.dial[0] - 52, LAB.dial[1] + 62, 46, 40, '-')) { l.temp = l.temp <= 60 ? 0 : l.temp - 5; S.sfx('dial'); }
  if (btn(LAB.dial[0] + LAB.dial[2] + 6, LAB.dial[1] + 62, 46, 40, '+')) { l.temp = l.temp ? Math.min(160, l.temp + 5) : 60; S.sfx('dial'); }
  { const t = l.temp ? l.temp + 'C' : 'OFF', w = S.font.width(t) * 2 + 28; plate(LAB.dial[0] + LAB.dial[2] / 2 - w / 2, LAB.dial[1] + LAB.dial[3] + 2, w, 26); T(t, LAB.dial[0] + LAB.dial[2] / 2, LAB.dial[1] + LAB.dial[3] + 7, { align: 'center' }); }
  // machines
  pic(l.evap ? 'evap_on' : 'evap_off', LAB.evap, d && d.kind === 'flask' && !l.evap && !l.tray);
  tipFor(LAB.evap, 'EVAPORATOR', l.evap ? 'Running tonight. Leaves a tray of powder.' : 'Takes a cooked flask. Dries it overnight.');
  const owned = G.upgrades.press;
  ctx.save(); if (!owned) ctx.globalAlpha = .55; pic(l.jam ? 'press_jam' : l.press ? 'press_run' : 'press_idle', LAB.press, d && d.kind === 'tray' && owned && !l.press && !l.jam && !l.jar); ctx.restore();
  tipFor(LAB.press, 'PILL PRESS', !owned ? 'Not installed yet.' : l.jam ? 'Jammed.' : l.press ? 'Pressing tonight.' : 'Takes a powder tray. Fills a jar overnight.');
  if (!owned) { const u = D.UPGRADES.find(q => q.id === 'press'); if (btn(LAB.press[0] + 48, LAB.press[1] + 120, 160, 42, `BUY $${u.cost}`, { kind: 'pink', disabled: G.cash < u.cost })) { G.buyUpgrade(u); S.sfx('till'); } }
  if (l.jam && btn(LAB.press[0] + 48, LAB.press[1] + 120, 160, 42, 'FIX $25', { kind: 'pink', disabled: G.cash < 25 })) { G.labFix(); S.sfx('clunk'); }
  pic(l.scan ? 'scan_on' : 'scan_off', LAB.scan, d && d.kind === 'jar' && !l.scan);
  tipFor(LAB.scan, 'PURITY SCANNER', l.scan ? null : 'Drop a jar on the tray to read its real grade.');
  // reagents, labels show what's on the shelf
  for (const k in LAB.r) {
    const r = LAB.r[k], q = D.REAGENTS[k], n = l.stock[k];
    ctx.save(); if (!n) ctx.globalAlpha = .4; pic('r_' + k, r); ctx.restore();
    ink(true); T(`${n}`, r[0] + r[2] / 2, r[1] + r[3] * (k === 'solv' ? .47 : k === 'stab' ? .68 : k === 'fill' ? .72 : .6), { align: 'center' }); ink(false);
    tipFor(r, q.name, q.tip); if (n) grab(r, 'r_' + k);
  }
  // flask on the plate
  const showFlask = !(d && d.kind === 'flask');
  const fArt = !f ? 'flask_empty' : f.st === 'burnt' ? 'flask_burnt' : (f.st === 'raw' && (f.base || f.solv || f.fill || f.stab) && l.temp >= 100) ? 'flask_boil' : (f.base || f.solv || f.fill || f.stab) ? 'flask_mix' : 'flask_empty';
  if (showFlask) pic(fArt, LAB.flask, d && d.kind.startsWith('r_'));
  if (f && f.st === 'burnt') { const i = Math.floor(frame / 10) % 6; ctx.imageSmoothingEnabled = true; ctx.drawImage(IMG['l_smoke_d' + i], LAB.flask[0] - 8, LAB.flask[1] - 110, 165, 165); }
  const flaskHit = [LAB.flask[0], LAB.flask[1] + 60, LAB.flask[2], LAB.flask[3] - 60];
  if (f) tipFor(flaskHit, 'FLASK', f.st === 'cooked' ? 'Cooked. Purity unknown until it is scanned.' : f.st === 'burnt' ? 'Ruined.' : `Base ${f.base}, solvent ${f.solv}, stabilizer ${f.stab}, filler ${f.fill}`);
  if (f && f.st === 'cooked') grab(flaskHit, 'flask');
  if (f && btn(LAB.plate[0] + 66, LAB.plate[1] + LAB.plate[3] + 2, 120, 34, 'DUMP')) { G.labDump(); S.sfx('pour'); }
  // tray + jars
  if (l.tray && !(d && d.kind === 'tray')) { pic('tray', LAB.tray); tipFor(LAB.tray, 'POWDER TRAY', 'Drag it onto the pill press.'); grab(LAB.tray, 'tray'); }
  if (l.jar && !(d && d.kind === 'jar')) { pic(JARS[l.jar.grade], LAB.jar); tipFor(LAB.jar, `JAR OF ${l.jar.n} PILLS`, 'Drag it onto the scanner tray.'); grab(LAB.jar, 'jar'); }
  if (l.scan) {
    pic(JARS[l.scan.grade], LAB.pan);
    termInk(); termGlow = null; const s = LAB.screen; T('PURITY', s[0] + 6, s[1] + 4, { color: 'gray' }); T(`${l.scan.pur}%`, s[0] + 6, s[1] + 22, { s: 3, color: 'green' }); T(D.COND.PILL[l.scan.grade][0], s[0] + 6, s[1] + 56, { color: 'yellow', fit: s[2] - 10 }); ink(false);
    if (btn(LAB.scan[0] + 56, LAB.scan[1] + LAB.scan[3] + 2, 200, 38, `SHELVE ${l.scan.n}`, { kind: 'green' })) { G.labShelve(); S.sfx('jar'); }
  }
  // crate under the bench
  if (l.arrived) { pic('crate_shut', [LAB.crate[0], LAB.crate[1], 156, 141]); const r = [LAB.crate[0], LAB.crate[1], 156, 141]; tipFor(r, 'REAGENT CRATE', 'Click to open.'); if (hover(r) && M.released && pressedOn && inR(r, pressedOn.x, pressedOn.y)) { M.released = false; G.labOpenCrate(); S.sfx('crate'); } }
  else if (l.crateOpen) pic('crate_open', [LAB.crate[0], LAB.crate[1], 214, 141]);
  // next-step plate
  { const im = IMG.u_tip_plate, x = 290, y = 806, w = 980, h = 92; nine(im, x, y, w, h, [80, 140, im.width - 140, 80], [80, 130, im.height - 130, 80], .3, 0, true); termInk(); termGlow = null; TW(labHint(), x + 28, y + 28, w - 56); ink(false); }
  if (btn(36, 842, 220, 50, lab.back ? 'BACK TO LEDGER' : 'BACK TO SHOP', { fit: 1 })) { if (lab.back) modal = lab.back; lab = null; S.sfx('door'); return; }
  if (keys.has('Escape')) { if (lab.back) modal = lab.back; lab = null; return; }
  // carrying something
  if (d) {
    const a = d.kind === 'flask' ? fArt : d.kind === 'tray' ? 'tray' : d.kind === 'jar' ? JARS[l.jar.grade] : d.kind, s = d.kind === 'tray' ? [150, 66] : d.kind === 'flask' ? [110, 184] : d.kind === 'jar' ? [62, 106] : [LAB.r[d.kind.slice(2)][2], LAB.r[d.kind.slice(2)][3]];
    pic(a, [M.x - s[0] / 2, M.y - s[1] / 2, s[0], s[1]]);
    if (M.released) {
      lab.drag = null; let err = null, ok = false;
      if (d.kind.startsWith('r_') && (inR(flaskHit) || inR(LAB.plate))) { err = G.labAdd(d.kind.slice(2)); ok = !err; }
      else if (d.kind === 'flask' && inR(LAB.evap)) ok = G.labToEvap();
      else if (d.kind === 'tray' && inR(LAB.press)) { if (!owned) err = 'No press yet.'; else if (l.jar) err = 'Move the finished jar first.'; else ok = G.labToPress(); }
      else if (d.kind === 'jar' && inR(LAB.scan)) ok = G.labToScan();
      if (ok) S.sfx(d.kind.startsWith('r_') ? 'glass' : d.kind === 'flask' ? 'pour' : d.kind === 'tray' ? 'clunk' : 'scan'); else if (err) { say(err); S.sfx('bump'); }
      M.released = false;
    }
  }
}
function drawRoom() { drawLot(); }
function drawLot() {
  ctx.drawImage(IMG.lot, 0, 0);
  drawHud();
  for (const sp2 of SPOTS) {
    const done = G.lotDone[sp2.id];
    if (done) { paper(sp2.r[0] + sp2.r[2] / 2 - 56, sp2.r[1] + sp2.r[3] / 2 - 14, 112, 28); T('PICKED', sp2.r[0] + sp2.r[2] / 2, sp2.r[1] + sp2.r[3] / 2 - 9, { align: 'center', color: 'gray' }); ink(false); continue; }
    if (G.searchLeft <= 0) continue;
    if (hotspot(sp2.r, sp2.n, sp2.d)) { G.lotDone[sp2.id] = true; const r = G.search(sp2.b); S.sfx('rummage'); lotLog(r); }
  }
  if (newLog() && frame % 60 < 36) { ctx.strokeStyle = LIME; ctx.lineWidth = 2; ctx.strokeRect(DEVICE[0], DEVICE[1], DEVICE[2], DEVICE[3]); }
  if (hotspot(DEVICE, 'BROKEN HANDHELD', newLog() ? 'There is a new entry.' : G.story.logRead ? 'Dennis. The screen is cracked.' : 'It is still on.')) { modal = 'dennis'; modalData = {}; if (newLog()) { G.story.logRead++; G.story.logNight = G.day; } }
  paper(510, 8, 652, 138);
  T(`THE DUMPSTER   ${G.searchLeft} SEARCHES LEFT`, 530, 22, { color: 'pink' });
  let y = 46; const logs = []; let lr = 88; for (const l of [...ass.log].reverse()) { const lh2 = wrapH(l, 376); if (lh2 > lr) break; lr -= lh2 + 2; logs.unshift(l); } for (const l of logs) y += TW(l, 530, y, 390) + 2;
  ass.found.slice(-8).forEach((it, i) => fitImg(IMG['i_' + D.ITEMS[it.id].art], 930 + (i % 4) * 54, 40 + Math.floor(i / 4) * 50, 50, 48));
  ink(false);
  paper(690, 868, 292, 62);
  if (btn(702, 878, 268, 42, 'BACK INSIDE', {})) { ass = null; modal = null; S.sfx('door'); ink(false); return; }
  ink(false);
}

// ---- title, ending
function drawTitle() {
  ctx.drawImage(IMG.bg, 0, 0); rect(0, 0, W, H, '#0a0710b0');
  const k = 1.5, sw = 1025 * k, sh = 92 * k, sx = (W - sw) / 2; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.bg, 505, 0, 1025, 92, sx, 52, sw, sh);   // the sign painted on your storefront
  const im = IMG.u_tip_plate, items = G.hasSave() ? 4 : 3, w = 480, rh = 66, h = items * rh + 72, x = (W - w) / 2, y = 268;
  nine(im, x, y, w, h, [80, 140, im.width - 140, 80], [80, 130, im.height - 130, 80], .3, 0, true); ink(false);
  let yy = y + 36; const row = (t, kind) => { const hit = btn(x + 36, yy, w - 72, 52, t, { kind, s: 3 }); yy += rh; return hit; };
  if (G.hasSave() && row('CONTINUE', 'green')) { G.loadSave(); scr = 'play'; shutterT = shutterGoal = 1; modal = 'report'; }
  if (row('NEW GAME', G.hasSave() ? 'tan' : 'green')) { modal = 'lease'; modalData = {}; }
  if (row('PLAY THE TUTORIAL', 'tan')) tutStart();
  if (row('RULE BOOK', 'tan')) { modal = 'help'; modalData = { page: 0 }; }
  ink(false);
}
function drawOver() {
  drawStore(); const e = window.ENDINGS[G.over] || ['OVER', ''], b = mHead(e[0], 900, 700, false); let y = b.y;
  y += TW(e[1], b.x, y, b.w - 12) + 12;
  for (const l of STORY.epilogue(G)) y += TW(l, b.x, y, b.w - 12, { color: 'gray' }) + 6;
  y += 10; rect(b.x, y, b.w, 1, PINK_INK); y += 8;
  for (const s of [`Survived ${G.day} day${G.day > 1 ? 's' : ''}`, `Sold $${G.stats.sold}   Bought $${G.stats.bought}`, `Rent paid $${G.stats.rent}`, `Best sale $${G.stats.best}`, `Cursed goods sold ${G.stats.cursedSold}`, `Customers ${G.stats.customers}   Crime on your sheet ${G.totalCrime()}`, `Sold to the Committee ${G.story.informed || 0} time${G.story.informed === 1 ? '' : 's'}`, `Net worth $${G.netWorth()}`]) { T(s, b.x, y); y += 24; }
  if (btn(b.X + b.W - 260, b.Y + b.H - 66, 230, 46, 'BACK TO TITLE', { kind: 'pink' })) { G.wipeSave(); scr = 'title'; G.over = null; modal = null; }
  ink(false);
}
function drawTip() {
  if (!tip) return;
  const w = 350, pad = 24, lines = tip.lines || [], artH = tip.art ? 84 : 0; ink(false); termInk(); termGlow = null;
  let h = 56 + artH; for (const l of lines) h += wrapH(l, w - pad * 2) + 4;
  let x = M.x + 18, y = M.y + 18; if (x + w > W - 4) x = M.x - w - 18; if (y + h > H - 4) y = H - h - 4;
  const im = IMG.u_tip_plate; nine(im, x, y, w, h, [80, 140, im.width - 140, 80], [80, 130, im.height - 130, 80], .3, 0, true);
  let ty = y + 20; T(tip.title, x + pad, ty, { color: 'pink', fit: w - pad * 2 }); ty += 24;
  if (tip.art) { fitImg(IMG['i_' + tip.art], x + pad, ty, 80, 80); ty += 84; }
  for (const l of lines) ty += TW(l, x + pad, ty, w - pad * 2) + 4;
  ink(false);
}
function drawCursor() { const im = IMG.u_cursor, h = 42, d = M.down ? 1 : 0; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, M.x + d, M.y + d, h * im.width / im.height, h); ctx.restore(); }

// ---- save
const KEY = 'cursedcarts-save';
G.save = () => { if (G.tut) return; try { const o = {}; for (const k in G) if (typeof G[k] !== 'function' && !['rules', 'GRIDS', 'DAYS', 'client', 'queue'].includes(k)) o[k] = G[k]; o.events = G.events.map(e => ({ id: e.def.id, left: e.left })); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { console.warn(e); } };
G.hasSave = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
G.loadSave = () => { const o = JSON.parse(localStorage.getItem(KEY)); Object.assign(G, o); G.story = G.story || { seen: {}, news: {}, notes: [], logRead: 0 }; G.lotDone = G.lotDone || {}; G.paQueue = []; G.fixUids(); G.reflow && setTimeout(G.reflow); G.lab = G.lab || {stock:{base:1,solv:1,stab:1,fill:1},crate:{},crateOpen:false,temp:0,flask:null,evap:null,tray:null,press:null,jam:false,jar:null,scan:null}; G.rules = D.DIFF[G.diff]; G.events = o.events.map(e => ({ def: D.EVENTS.find(x => x.id === e.id), left: e.left })); G.client = null; G.queue = []; G.phase = 'morning'; G.items.forEach(i => { if (i.grid === 'mat') G.stockPlace(i); }); };
G.reflow = () => { for (const g of ['stock', 'stock2', 'mat', 'stash', 'trash', 'server']) { const all = G.inGrid(g); all.forEach(i => { i.grid = null; i.rot = 0; }); for (const i of all) if (!G.place(i, g) && !G.stockPlace(i) && !G.place(i, 'stock2') && !G.place(i, 'trash')) G.remove(i); } };
G.wipeSave = () => { try { localStorage.removeItem(KEY); } catch (e) {} };

// ---- the PA: speaker on the wall, Linda's scrolling bar under the window
let paNow = null; const PAR = [473, 104, 112, 92], PAB = [588, 98, 700, 73];
function paPages(line, w) { const out = []; let cur = ''; for (const word of line.split(' ')) { const t = cur ? cur + ' ' + word : word; if (S.font.width(t) * 2 > w && cur) { out.push(cur); cur = word; } else cur = t; } if (cur) out.push(cur); return out; }
function drawPA() {
  const b = PAB, sx = b[0] + b[2] * .125, sw = b[2] * .81;
  if (!paNow && G.paQueue && G.paQueue.length && G.phase === 'day' && shutterT < .02 && !modal) { const q = G.paQueue.shift(); paNow = Object.assign(q, { pages: paPages(q.line, sw - 16), page: 0, n: 0, hold: 0, t: 0 }); G.paLast = { line: q.line, fx: q.fx, left: q.left }; S.sfx('pa'); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(paNow ? IMG.u_pa_on : IMG.u_pa_off, PAR[0], PAR[1], PAR[2], PAR[3]);
  const act = G.events.map(e => `{yellow}${e.def.name}:{/} ${G.paEffect(e.def)} (${e.left} DAY${e.left === 1 ? '' : 'S'} LEFT)`);
  if (hotspot([PAR[0], PAR[1], 84, PAR[3]], 'MALL PA', act.length ? act.join('  /  ') : 'Quiet. Enjoy it. Click to hear the last one again.') && G.paLast && !paNow) G.paQueue.push(Object.assign({}, G.paLast));
}
// ---- the glass: move it over a cart. Each part of the cart tells you something, and you confront a seller with one specific reason.
const CART_R = { LOGO: [.22, .12, .56, .4], LETTERING: [.2, .52, .6, .24], SEAL: [.78, .05, .22, .3], SHELL: [0, .05, .2, .9], PINS: [.2, .78, .6, .22] };
function cartGlass(it) {
  // as the study's InspectionUIManager: a tray, a small item and a glass you move yourself. Nothing is explained; you look, and you compare to the guide.
  const def = D.ITEMS[it.id], im = IMG['i_' + (it.art || def.art)], b = mHead('INSPECT', 1180, 720); G.cartTells(it); const d = modalData;
  const TR = [b.x, b.y + 2, 640, b.Y + b.H - b.y - 44], cw0 = 190, ch0 = cw0 * im.height / im.width;
  if (!d.cp) { d.cp = [TR[2] / 2 - cw0 / 2, TR[3] - ch0 - 40]; d.gp = [120, 120]; }
  { const s = IMG.l_storage; nine(s, TR[0] - 10, TR[1] - 10, TR[2] + 20, TR[3] + 20, [46, 60, s.width - 60, 46], [50, 60, s.height - 60, 50], .34, 0, true); rect(TR[0] + 4, TR[1] + 4, TR[2] - 8, TR[3] - 8, '#1a1320'); }
  const R0 = 96, Z = 2.8, idI = IMG.u_identifier, idK = (R0 + 3) / 298.5, idX = 436.5 * idK, idY = 432.0 * idK, idW = idI.width * idK, idH = idI.height * idK, cx = () => TR[0] + d.cp[0], cy = () => TR[1] + d.cp[1], gx = () => TR[0] + d.gp[0], gy = () => TR[1] + d.gp[1];
  const onGlass = (x, y) => Math.hypot(x - gx(), y - gy()) < R0 + 8 || (x >= gx() - idX && y >= gy() - idY && x < gx() - idX + idW && y < gy() - idY + idH * .7), onCart = (x, y) => x >= cx() && y >= cy() && x < cx() + cw0 && y < cy() + ch0;
  const inTray = inR(TR);
  if (inTray) hot = true;
  if (M.down && !d.drag && pressedOn && inR(TR, pressedOn.x, pressedOn.y)) { if (onGlass(pressedOn.x, pressedOn.y)) d.drag = ['gp', pressedOn.x - gx(), pressedOn.y - gy()]; else if (onCart(pressedOn.x, pressedOn.y)) d.drag = ['cp', pressedOn.x - cx(), pressedOn.y - cy()]; }
  if (!M.down) d.drag = null;
  if (d.drag) { hot = true; const w = d.drag[0] === 'cp' ? cw0 : 0, h = d.drag[0] === 'cp' ? ch0 : 0; d[d.drag[0]] = [Math.max(0, Math.min(TR[2] - w, M.x - d.drag[1] - TR[0])), Math.max(0, Math.min(TR[3] - h, M.y - d.drag[2] - TR[1]))]; }
  ctx.imageSmoothingEnabled = false; ctx.drawImage(im, cx(), cy(), cw0, ch0);
  const lx = gx(), ly = gy(), px = (lx - cx()) / cw0, py = (ly - cy()) / ch0; let zone = null;
  if (px >= 0 && py >= 0 && px < 1 && py < 1) for (const z in CART_R) { const r = CART_R[z]; if (px >= r[0] && py >= r[1] && px < r[0] + r[2] && py < r[1] + r[3]) { zone = z; break; } }
  ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, R0, 0, Math.PI * 2); ctx.clip(); rect(lx - R0, ly - R0, R0 * 2, R0 * 2, '#120c18'); ctx.drawImage(im, lx - (lx - cx()) * Z, ly - (ly - cy()) * Z, cw0 * Z, ch0 * Z); ctx.restore();
  const rx = b.x + 670, rw = b.w - 670; let y = b.y + 2;
  T(def.name, rx, y, { color: 'pink', fit: rw }); y += 28; T(`Label says: ${G.condOf(it)[0]}`, rx, y, { fit: rw }); y += 36;
  if (d.guide) {
    T('WHAT A REAL ONE LOOKS LIKE', rx, y, { fit: rw }); y += 28;
    for (const l of ['{yellow}LOGO:{/} stamped in, straight.', '{yellow}LETTERING:{/} one typeface, one print.', '{yellow}SEAL:{/} flat, never lifted.', '{yellow}SHELL:{/} wear matches the grade.', '{yellow}PINS:{/} wear matches the shell.']) y += TW(l, rx, y, rw) + 6;
    if (btn(rx, b.Y + b.H - 118, 190, 42, 'BACK TO TRAY')) d.guide = false;
  } else {
    y += TW(zone ? G.cartLook(it, zone) : ' ', rx, y, rw, { color: 'yellow' }) + 8; y = Math.max(y, b.y + 160);
    if (!it.owned && G.client && !G.client.talk && G.items.includes(it)) {
      if (it.exposed) T('{red}Called out. Price dropped.{/}', rx, y);
      else if (it.confronted) T('{gray}You already confronted them about this.{/}', rx, y);
      else {
        T('ISSUE:', rx, y); y += 26;
        G.CART_ZONES.forEach((z, i) => { if (btn(rx + (i % 2) * (rw / 2 + 2), y + Math.floor(i / 2) * 46, rw / 2 - 2, 40, z, { kind: d.pick === z ? 'pink' : 'tan' })) d.pick = z; });
        y += 142;
        if (btn(rx, y, rw, 44, 'CONFRONT', { kind: 'pink', disabled: !d.pick })) { const ok = G.accuse(it, G.client, d.pick); G.client.lastReply = ok ? 'Okay. Okay! Knock some off.' : 'Excuse me?! There is nothing wrong with that. (-2 rep)'; S.sfx(ok ? 'coin' : 'bump'); modal = null; }
      }
    }
    if (btn(rx, b.Y + b.H - 118, 150, 42, 'GUIDE')) d.guide = true;
  }
  mClose(b);
  ink(false);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(idI, lx - idX, ly - idY, idW, idH); ctx.imageSmoothingEnabled = false;
}
function drawPABar() {   // drawn over the shop: the bar pushes out of the speaker, and the words type out of it like anyone else talking
  if (!paNow) return;
  const p = paNow, b = PAB, im = IMG.u_pa_bar, sx = b[0] + b[2] * .125, sw = b[2] * .81, sy = b[1] + b[3] * .2, sh = b[3] * .59; if (!modal) p.t = Math.min(16, p.t + 1);
  ctx.save(); ctx.beginPath(); ctx.rect(b[0] - 4, b[1] - 4, (b[2] + 8) * p.t / 16, b[3] + 8); ctx.clip(); ctx.imageSmoothingEnabled = true; ctx.drawImage(im, b[0], b[1], b[2], b[3]); termInk();
  const onFx = p.page >= p.pages.length, cur = onFx ? `${p.fx}  (${p.left})` : p.pages[p.page], len = onFx ? cur.length : cur.length;
  if (onFx) T(cur, sx + sw / 2, sy + sh / 2 - 9, { align: 'center', color: 'yellow', fit: sw - 12 });
  else {
    if (!modal && p.t >= 16) { if (p.n < len) { p.n += .55; if (Math.floor(p.n) % 2 === 0 && cur[Math.floor(p.n)] !== ' ') S.voice('linda', cur[Math.floor(p.n)] || 'a'); } else p.hold++; }
    T(cur.slice(0, Math.ceil(p.n)), sx + 8, sy + sh / 2 - 9, { color: 'normal' });
    if (p.hold > 60 + cur.length * 1.2) { p.page++; p.n = 0; p.hold = 0; }
  }
  ink(false); ctx.restore();
  if (onFx && !modal) { p.hold++; if (p.hold > 280) paNow = null; }
  if (paNow && hotspot(b, 'LINDA ON THE PA', 'Click to move on.')) { if (onFx) paNow = null; else if (p.n < len) p.n = len; else { p.page++; p.n = 0; p.hold = 0; } }
}
// ---- the identifier: sits on the counter, pick it up, click things to learn the truth
let idHeld = false; const IDR = [936, 618, 88, 44];
function drawIdentifierRest() {
  const im = IMG.u_identifier; if (!idHeld) { ctx.imageSmoothingEnabled = true; ctx.drawImage(im, IDR[0], IDR[1], IDR[2], IDR[3]); if (hotspot(IDR, 'IDENTIFIER', `Pick it up and click anything to learn the truth. ${G.idLeft} charge${G.idLeft === 1 ? '' : 's'} left today.`)) { idHeld = true; S.sfx('clunk'); } }
}
function idFrame() {
  if (!idHeld) return;
  if (M.right || keys.has('Escape') || modal || held) { idHeld = false; M.right = false; keys.delete('Escape'); S.sfx('clunk'); return; }
  if (M.pressed) { const it = itemAt(M.x, M.y); M.pressed = false; M.down = false; pressedOn = null; if (it) { say(G.identify(it)); S.sfx('scan'); } else { idHeld = false; S.sfx('clunk'); } }
}
function drawIdentifierHeld() {
  if (!idHeld) return; const im = IMG.u_identifier, w = 280, k = w / im.width, h = im.height * k, cx = 462 * k, cy = 420 * k;
  ctx.imageSmoothingEnabled = true; ctx.drawImage(im, M.x - cx, M.y - cy, w, h);
}
// ---- the playable tutorial: one practice day in the real shop. Nothing here is saved.
let tut = null;
const BILL0 = [1300, 96, 360, 392], NEXTR = () => [R.window[0] + 222, 448, 280, 56];
const inGrids = (it, ...g) => it && G.items.includes(it) && g.includes(it.grid);
function tutClient(k) {
  if (k === 'a') return Object.assign(G.genClient('regular'), { budget: 400, startBudget: 400, noCurseNow: false, line: 'Got anything that still boots?' });
  tut.cart = __mk('cart_static', { curse: 2 }); tut.cart.real = 3; tut.cart.fake = 1;   // the label lies
  return Object.assign(G.genClient('rat', { line: 'Found this behind the pretzel stand. You want it?' }), { carry: [tut.cart] });
}
function tutQueue() { return [tutClient('a'), tutClient('b'), STORY.mercOrder(G)]; }
const TSTEPS = [
  { id: 'hi', text: 'This is a practice day. Nothing you do here is saved. Follow the {yellow}green outlines{/}. Press NEXT when you are ready.', next: true, only: [] },
  { id: 'open', text: 'Your shop is shut. Click the {yellow}shutter{/} in the window to open up.', mark: () => [R.window], done: () => G.phase === 'day' },
  { id: 'call', text: 'Customers wait in a queue. Press {yellow}NEXT CUSTOMER{/}. You can also ring the bell.', mark: () => [NEXTR()], extra: () => [R.bell], done: () => G.client && !G.client.talk },
  { id: 'bill', c: 'a', text: 'The {yellow}bill of sale{/} is your deal sheet. It shows who they are, their funds, and what they want. This one wants a cartridge.', mark: () => [billR || BILL0], next: true, only: [] },
  { id: 'movebill', c: 'a', text: 'In the way? {yellow}Drag the bill{/} by any blank part of the sheet and drop it somewhere else. It stays there. Every paper popup moves the same way.', mark: () => [billR || BILL0], done: () => !billDrag && (billOff[0] || billOff[1]) },
  { id: 'offer', c: 'a', text: 'Drag {yellow}your cartridge{/} from STOCK up onto the {yellow}counter{/}. The green outline shows the squares it takes up.', mark: () => [gridAt('stock'), gridAt('mat')], done: () => G.matOwned().some(i => G.accepts(G.client, i) === true) },
  { id: 'haggle', c: 'a', text: 'Now it is on the bill. Press {yellow}10%{/} to ask for more money. You get one try per customer. Today it always works. Normally it is a roll, and hovering shows the odds.', mark: () => [billR || BILL0], done: () => G.client.sellOffered || G.client.dealt },
  { id: 'sell', c: 'a', text: 'Press {yellow}STAMP: SELL{/} to close the deal.', mark: () => [billR || BILL0], done: () => G.client.dealt },
  { id: 'file', text: 'Sold. Press {yellow}FILE IT{/} to send them on their way.', mark: () => [billR || BILL0], done: () => !G.client },
  { id: 'call2', text: 'Next one. Press {yellow}NEXT CUSTOMER{/}.', mark: () => [NEXTR()], extra: () => [R.bell], done: () => G.client && !G.client.talk },
  { id: 'id1', c: 'b', text: 'This one is selling a cart. Is the label honest? Click the {yellow}identifier{/} on the counter to pick it up.', mark: () => [IDR], done: () => idHeld },
  { id: 'id2', c: 'b', text: 'Now click {yellow}their cart{/}. The ring tells you the truth about it. You get 3 charges a day.', mark: () => offerRects().map(o => o.r), extra: () => [gridAt('mat')], done: () => tut.cart.identified },
  { id: 'id3', c: 'b', text: 'The label lies, and it is cursed too. {yellow}Right-click{/} to put the identifier down.', right: true, done: () => !idHeld },
  { id: 'lean', c: 'b', text: 'A caught lie earns you a {yellow}file{/} for today. Press {yellow}LEAN ON THEM{/} to force 20% off. It works on most people, but it costs standing and goes on your record.', mark: () => [billR || BILL0], done: () => G.client.buyOffered || G.client.dealt },
  { id: 'buy', c: 'b', text: 'Their price just dropped. Press {yellow}STAMP: BUY{/}.', mark: () => [billR || BILL0], done: () => G.client.dealt },
  { id: 'file2', cart: 1, text: 'Press {yellow}FILE IT{/}. The cart is yours now, and it may not be what it seems.', mark: () => [billR || BILL0], done: () => !G.client },
  { id: 'test', cart: 1, text: 'Drag the new cart onto the {yellow}beige tower{/}. The rig runs it and shows you what the curse does. You only get a few tests a day.', mark: () => [R.tower], extra: () => [gridAt('stock'), gridAt('mat')], done: () => tut.cart.tested },
  { id: 'cursed', cart: 1, text: 'It is {pink}cursed{/}. Cursed carts sell for more, but selling them books {red}crime{/}, and crime builds heat.', next: true, only: [] },
  { id: 'rack', cart: 1, text: 'Drag it into the {yellow}RACK BAY{/}. Overnight, the rack reads a cart and burns off one curse level.', mark: () => [gridAt('server')], extra: () => [gridAt('stock'), gridAt('mat')], done: () => tut.cart.grid === 'server' },
  { id: 'rclick', box: 1, text: '{yellow}Right-click{/} the {yellow}BOX LOT{/} in stock. Everything has a menu like this.', mark: () => [tutItemR(tut.lot)], right: true, done: () => ctxm && ctxm.it === tut.lot },
  { id: 'opn', box: 1, text: 'Pick {yellow}OPEN{/}. The box leaves and its contents land in your stock.', mark: () => ctxm && ctxm.rows[0].q ? [ctxm.rows[0].q] : [], menu: true, back: 'rclick', done: () => !G.items.includes(tut.lot) },
  { id: 'turn', text: 'Space matters. Grab the {yellow}long item{/}, then press {yellow}R{/} or right-click while holding to turn it. Set it down.', mark: () => [tutItemR(tut.long)], extra: () => [gridAt('stock')], done: () => !held && tut.long.rot !== tut.longRot },
  { id: 'case', text: 'Drag a cart into the empty {yellow}display case{/} slot. Carts on show bring people to your window.', mark: () => [CASE(8)], extra: () => [gridAt('stock')], done: () => G.caseSlots[8] },
  { id: 'call3', text: 'One more. Press {yellow}NEXT CUSTOMER{/}.', mark: () => [NEXTR()], extra: () => [R.bell], done: () => G.client },
  { id: 'merc', text: 'An {yellow}off-duty merc{/} wants a gun and ammo by a set day, for good money. Answer them, then press {yellow}GOODBYE{/}. If you say yes, have both in stock when they return.', mark: () => [R.window], extra: () => [BILL0], done: () => !G.client },
  { id: 'pa', text: 'That is {yellow}Linda on the PA{/}. What she announces moves prices right away, shown at the end and on the bill. Hover the speaker on the wall to see what is active.', when: () => { if (!tut.paDone) { tut.paDone = true; G.paFlash('fl_cart'); } }, next: true, only: [] },
  { id: 'term', text: 'Click the {yellow}terminal{/}. It sells Prop Pills, and its flask key leads to your back lab.', mark: () => [R.terminal], done: () => modal === 'terminal' },
  { id: 'term2', at: 'side', text: 'Buy boxes, sell overnight, or print jars here. The rule book covers the lab.', next: true, only: [], leave: () => { modal = null; } },
  { id: 'close', text: 'The queue is empty. Click the {yellow}shutter{/} to close for the day.', mark: () => [R.shutter], done: () => G.phase === 'evening' },
  { id: 'later', text: 'For real, a new game lets you pick how you got here, then spend {yellow}3 points{/} on perks. Flaws give points back.', next: true, only: [] },
  { id: 'later2', text: 'On Sundays {yellow}Linda{/} wants rent. {yellow}Big Invoice{/} can pay your way in with weekly payments instead. Miss one and they take your 3 best things. Miss three and you are out.', next: true, only: [] },
  { id: 'endday', text: 'Closed, but the day is not over. You could still search the dumpster out back. Press {yellow}END DAY{/} when you are ready for the ledger.', mark: () => [NEXTR()], done: () => modal === 'close' },
  { id: 'dragp', text: 'Popups move too. {yellow}Drag the ledger{/} by any blank part.', when: () => { if (!modal) { modal = 'close'; modalData = {}; } }, free: true, done: () => mPos.close && (mPos.close[0] || mPos.close[1]) && !mDrag },
  { id: 'night', at: 'side', text: 'Tick the bills you will pay. Power runs your rack and lab. Press {yellow}STAMP: SLEEP{/} to finish. For real, rent is due every Sunday.', when: () => { if (!modal) { modal = 'close'; modalData = {}; } }, free: true },
];
function tutItemR(it) { if (!it || !it.grid || !GR[it.grid]) return [0, 0, 0, 0]; const g = GR[it.grid], [w, h] = G.dims(it); return [g.x + it.x * CELL, g.y + it.y * CELL, w * CELL, h * CELL]; }
function tutStart() {
  G.newGame('cozy'); G.tut = true; G.morning(); G.testsLeft = 9;
  for (const i of [...G.items]) if (i.grid !== 'case' || i.slot === 8) G.remove(i);
  G.caseSlots[8] = null; G.cash = Math.max(G.cash, 500);
  const long = Object.keys(D.ITEMS).find(k => D.ITEMS[k].w > D.ITEMS[k].h && D.ITEMS[k].type === 'ODD');
  billOff = [0, 0]; delete mPos.close; idHeld = false; tut = { i: 0 }; G.stockPlace(__mk('cart_moon', { owned: true })); tut.lot = __mk('odd_boxlot', { owned: true }); G.stockPlace(tut.lot); tut.long = __mk(long, { owned: true }); G.stockPlace(tut.long); tut.longRot = tut.long.rot;
  scr = 'play'; modal = null; lab = null; ass = null; shutterT = shutterGoal = 1; ctxm = null;
}
function tutFinish() { toast = null; G.tut = false; tut = { over: true }; scr = 'title'; shutterT = shutterGoal = 1; G.client = null; G.queue = []; }
function tutQuit() { idHeld = false; toast = null; held = G_held = null; ctxm = null; modal = null; G.tut = false; tut = null; scr = 'title'; G.client = null; G.queue = []; shutterT = shutterGoal = 1; }
function tutGoto(id) { tut.i = TSTEPS.findIndex(s => s.id === id); }
function tutTick() {
  if (!tut || tut.over) return; const s = TSTEPS[tut.i]; G.testsLeft = Math.max(G.testsLeft, 3);
  if (s.c && !G.client && !gone) { idHeld = false; G.queue.unshift(tutClient(s.c)); tutGoto(s.c === 'a' ? 'call' : 'call2'); return; }   // sent them away: they come back
  if (s.c && !G.client) return;
  if (s.cart && !held && (!G.items.includes(tut.cart) || tut.cart.grid === 'trash')) { tut.cart.owned = true; G.stockPlace(tut.cart); }
  if (s.box && !held && !ctxm && tut.lot.grid !== 'stock' && G.items.includes(tut.lot)) G.stockPlace(tut.lot);
  if (s.back && !ctxm && !s.done()) { tutGoto(s.back); return; }
  if (s.when) s.when();
  if (s.id && s.id.startsWith('id')) G.idLeft = Math.max(G.idLeft, 1);
  if (s.done && s.done()) { tut.i++; S.sfx('select'); }
}
function tutGate() {   // practice day: only what the step points at can be clicked
  if (tut && tut.box && pressedOn && inR(tut.box, pressedOn.x, pressedOn.y) && M.released) { tut.rel = true; M.released = false; }   // a click on the panel never reaches what is under it
  if (!tut || tut.over || scr !== 'play') return; const s = TSTEPS[tut.i];
  const onPanel = tut.box && inR(tut.box);
  if (modal && s.free) { if (onPanel && M.pressed) M.pressed = false; if (M.right) M.right = false; return; }
  if (modal || ctxm || held) { if (onPanel) M.pressed = false; if (!s.right && !held && !s.menu) M.right = false; return; }
  if (M.right && !s.right) M.right = false;
  if (M.pressed) {
    const ok = onPanel ? false : !s.only && [...(s.mark ? s.mark() : []), ...(s.extra ? s.extra() : [])].some(r => inR(r));
    if (!ok) { M.pressed = false; M.down = false; if (!onPanel) pressedOn = null; }
  }
}
function drawTut() {
  if (!tut) return; if (tut.rel) { M.released = true; tut.rel = false; } const im = IMG.u_tip_plate, ni = (x, y, w, h) => nine(im, x, y, w, h, [80, 140, im.width - 140, 80], [80, 130, im.height - 130, 80], .3, 0, true);
  if (tut.over) {   // back on the lease
    const x = 40, y = 330, w = 380, h = 216; tut.box = [x, y, w, h]; ni(x, y, w, h); termInk(); TW('{yellow}PRACTICE OVER.{/} Press {yellow}NEW GAME{/} to open up for real. The {yellow}RULE BOOK{/} has everything else.', x + 24, y + 22, w - 48); ink(false);
    if (!modal && btn(x + 24, y + h - 62, w - 48, 40, 'GOT IT', { kind: 'green' })) tut = null;
    return;
  }
  if (scr !== 'play') return;
  tutTick(); const s = TSTEPS[tut.i], p = .55 + .45 * Math.sin(frame * .12);
  ctx.save(); ctx.strokeStyle = LIME; ctx.globalAlpha = p; ctx.lineWidth = 4; if (!held) for (const r of (s.mark ? s.mark() : [])) if (r[2]) ctx.strokeRect(r[0] - 3, r[1] - 3, r[2] + 6, r[3] + 6); ctx.restore();
  const side = true, w = 248, x = 6, y = 112;
  termInk(); const lines = Math.ceil(S.font.width(s.text.replace(/\{[^}]*\}/g, '')) * 2 / (w - 56)) + 1; ink(false); const h = 96 + lines * 24 + (side ? 90 : 0);
  tut.box = [x, y, w, h]; ni(x, y, w, h); termInk();
  T(`PRACTICE ${tut.i + 1}/${TSTEPS.length}`, x + 24, y + 14, { color: 'green', fit: w - 48 }); rect(x + 24, y + 36, w - 48, 1, '#2f7a4c');
  TW(s.text, x + 24, y + 44, w - 48); ink(false);
  const bw = side ? w - 48 : 130;
  if (s.next && btn(x + 24, y + h - 96 + (side ? 0 : 42), bw, 36, 'NEXT', { kind: 'green' })) { if (s.leave) s.leave(); tut.i++; }
  if (btn(side ? x + 24 : x + w - 24 - 130, y + h - 54, side ? bw : 130, 36, 'QUIT', {})) tutQuit();
}

// ---- frame
function frameFn() {
  frame++; hot = false; tip = null; window.__btns = []; S.audio.update();
  if (M.pressed) pressedOn = { x: M.x, y: M.y };
  tutGate();
  if (scr === 'title') { lockBtn = !!modal; drawTitle(); lockBtn = false; settingsIcon(); drawModal(); if (keys.has('Escape')) modal = modal ? null : 'settings'; }
  else if (G.phase === 'over' || G.over) drawOver();
  else if (lab) drawLab();
  else if (ass) { lockBtn = !!modal; drawRoom(); lockBtn = false; drawModal(); if (keys.has('Escape') && modal) modal = null; }
  else {
    G.caseRepair();
    idFrame();
    if (G.repoNotice && !modal) { modal = 'repo'; modalData = G.repoNotice; G.repoNotice = null; }
    ctxClick();
    if (M.right && !held && !modal && !underBill()) { const it = itemAt(M.x, M.y); ctxm = it ? { it, x: M.x + 8, y: M.y + 4, rows: menuFor(it) } : null; if (it) S.sfx('select'); M.right = false; }
    if (modal || held) ctxm = null;
    // pick up / drop
    if (!G.client) billR = null;
    if (!modal && M.pressed && !held && !(billR && inR(billR)) && !idHeld) {
      const it = itemAt(M.x, M.y);
      if (it && it.owned) grab(it);
      else if (it && G.client && !G.client.talk) { modal = 'accuse'; modalData = { it, clue: G.clue(it) }; M.pressed = false; pressedOn = null; }
    }
    lockBtn = !!modal; drawStore(); lockBtn = false;
    if (!modal && !held && !underBill()) { const it = itemAt(M.x, M.y); if (it && !tip) itemTip(it); if (it) { /* item hover wins */ itemTip(it); } }
    if (held) {
      if (keys.has('KeyR') || M.right) { held.rot ^= 1; iSfx(held, 'grab'); keys.delete('KeyR'); }
      if (keys.has('KeyF')) { held.flip = !held.flip; iSfx(held, 'grab'); keys.delete('KeyF'); }
      const [w, h] = G.dims(held); drawItem(held, M.x - w * CELL / 2, M.y - h * CELL / 2); drawFootprint(held, w, h);
      if (M.released) dropTarget();
    }
    drawModal();
    if (keys.has('Escape') && modal && modal !== 'report') modal = null; else if (keys.has('Escape') && !modal && !held) { modal = 'settings'; modalData = {}; }
    if (keys.has('Space') && !modal && G.phase === 'day' && !G.client && !gone && G.queue.length) callNext();
  }
  if (toast && toastT > 0 && !modal) { toastT--; const tw = S.font.width(toast) * 2 + 40; paper(W / 2 - tw / 2, 124, tw, 34); T(toast, W / 2, 132, { align: 'center' }); ink(false); }
  if (!G_held && !ctxm) drawTip();
  drawCtxMenu();
  drawTut();
  if (scr === 'play') drawIdentifierHeld();
  drawCursor(); cv.style.cursor = 'none';
  { const open = 1 - shutterT, inner = !lab && !ass && scr !== 'title';
    S.soundScene(lab ? { lab: .8, music: .1, muffle: 500 } : ass ? { lot: .9, music: .05, muffle: 350 } : scr === 'title' ? { music: .5, mall: .35, muffle: 9000 } : { mall: .25 + .55 * open, music: .3 + .4 * open, muffle: 650 + 8500 * open * open }); }
  M.pressed = false; M.released = false; M.right = false; keys.delete('Escape'); keys.delete('Space'); keys.delete('KeyR');
}
function loop() { if (!window.__manual) frameFn(); requestAnimationFrame(loop); }

window.UI = { finishSpeech: () => { sp.n = 1e9; }, ctx: () => ctxm, tut: () => tut, tutQueue: () => tutQueue(), tutStart: () => tutStart(), modal: () => modal, lab: o => { lab = o; }, speech: (c, i) => { G.client = c; talkI = i; talkReply = null; gone = null; sp = { text: speechText(c), n: 1e9 }; clientT = 999; c.menuT = 20; }, step: () => frameFn(), go: s => scr = s, set: o => { if (o.data) modalData = o.data; if ('modal' in o) modal = o.modal; if ('ass' in o) ass = o.ass; if ('shutter' in o) shutterT = shutterGoal = o.shutter; if ('arrive' in o) arrive(); } };

load().then(() => {
  buildTextures(); fit();
  const P = S.params;
  if (P.has('smoke')) setTimeout(() => window.__smoke && 0, 0);
  if (P.has('auto')) window.BOT(+P.get('auto') || 60);
  if (P.has('eval')) { G.newGame('normal'); G.morning(); scr = 'play'; try { eval(P.get('eval')); } catch (e) { console.error(e); } }
  requestAnimationFrame(loop);
});

// ---- headless balance bot: plays the sim without the UI, ?auto=DAYS
window.BOT = function (days) {
  const runs = []; const N = 20;
  for (let r = 0; r < N; r++) {
    let peak = 0; G.newGame('normal'); G.morning();
    for (const i of G.items.slice()) if (i.grid === 'case') { G.remove(i); G.stockPlace(i); }
    while (!G.over && G.day <= days) {
      if (G.day >= 2 && !G.wentOut) { G.goOut(); while (G.searchLeft > 0 && G.searchN < 3) G.search(); G.wentOut = true; }
      if (G.cash > 150 && G.items.length < 24) for (const o of G.offers) if (!o.gone && o.item && G.cash > o.cost + G.rent) { o.item.owned = true; if (G.stockPlace(o.item)) { G.cash -= o.cost; o.gone = true; } else G.remove(o.item); }
      G.openShutter();
      while (G.queue.length && !G.over) {
        G.next(); const c = G.client; if (!c) break;
        if (c.talk) { for (const st of c.talk) { if (st.run) st.run(G); else if (st.choices) { const ch = c.isStringer ? st.choices[st.choices.length - 1] : st.choices.find(x => !x.ok || x.ok()); ch.fn(G); } if (G.over) break; } continue; }
        if (c.want && c.intent !== 'pill') { for (const it of G.items.filter(i => i.owned && ['stock', 'stock2'].includes(i.grid) && G.accepts(c, i) === true && !i.curse && !i.heat).sort((a, b) => G.base(b) - G.base(a)).slice(0, 3)) G.place(it, 'mat'); if (G.matOwned().length) { G.haggle('sell', 10, c); if (!c.walked) G.doSell(c); } }
        if (c.carry && !c.walked && G.buyTotal(c) < G.cash * .4 && !G.matTheirs().some(i => i.curse || i.heat)) { const lie = G.matTheirs().find(i => i.fake < i.real); if (!lie) { if (G.odds(25, c).acc >= 50) G.haggle('buy', 25, c); if (!c.walked) G.doBuy(c); } }
        if (c.intent === 'pill' && G.pills[2]) { const it = G.dispense(2, 2); if (it) { G.place(it, 'mat'); G.doSell(c); } }
      }
      G.endClient(); G.closeDay(); peak = Math.max(peak, G.cash);
      if (G.cash > G.price()) { G.buyStore(); break; }
      G.services.ins = G.cash > 300;
      if (G.feesTotal() > G.cash) { G.services.ins = G.services.jan = G.services.power = false; }
      G.endNight();
    }
    runs.push(`${G.over || 'alive'} d${G.day} $${Math.floor(G.cash)} stock${G.items.length} crime${G.totalCrime()} sold${G.stats.sold} peak${peak}`);
  }
  console.log('BOT ' + runs.join(' | '));
  G.over = null; G.newGame('normal');
};
})();
