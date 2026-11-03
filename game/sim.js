// Carl's Cursed Cartridges: simulation. No drawing here, so tools can run it with a bot (?auto).
(function () {
const D = window.DATA;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const roll = p => Math.random() * 100 < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const GRIDS = { stock: [22, 6], stock2: [22, 6], mat: [22, 4], stash: [6, 6], trash: [6, 6], server: [6, 4] };
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

let uid = 1;
const newLab = () => ({ stock: { base: 1, solv: 1, stab: 1, fill: 1 }, crate: {}, crateOpen: false, temp: 0, flask: null, evap: null, tray: null, press: null, jam: false, jar: null, scan: null });
const PURITY_GRADE = p => p >= 90 ? 0 : p >= 70 ? 1 : p >= 40 ? 2 : p >= 20 ? 3 : 4;
window.__mk = (...a) => makeItem(...a);
function makeItem(id, o = {}) {
  const def = D.ITEMS[id], conds = D.COND[def.type];
  const real = o.real != null ? o.real : (def.type === 'CART' ? pick([1, 2, 2, 2, 3, 3, 4]) : def.type === 'PILL' ? 2 : def.type === 'FOOD' ? pick([0, 1, 1, 2]) : def.type === 'JUNK' ? 0 : def.type === 'AMMO' ? pick([0, 1, 1, 1, 2]) : pick([1, 2, 2, 3, 3]));
  const it = { uid: uid++, id, x: 0, y: 0, rot: 0, grid: null, real, fake: o.fake != null ? o.fake : real, exposed: false,
    curse: o.curse || 0, curseKnown: true, heat: 0, owned: !!o.owned, tested: !!o.tested, labelled: false };
  if (def.illegal) { it.curseKnown = true; if (G.upgrades && G.upgrades.permit) { it.restricted = true; it.curse = 0; } else it.curse = def.illegal; }
  if (o.grin) it.grin = true;
  if (o.stolen) { it.stolen = true; const b = def.v; it.heat = b <= 17 ? 0 : b < 50 ? 25 : b < 85 ? 50 : b < 140 ? 75 : 100; }
  return it;
}
const dims = it => { const d = D.ITEMS[it.id]; return it.rot % 2 ? [d.h, d.w] : [d.w, d.h]; };
// the squares an item really covers: its PNG's shape, mirrored if flipped, then turned
const cellCache = {};
function cellsOf(it) {
  const key = it.id + (it.rot % 2) + (it.flip ? 1 : 0); if (cellCache[key]) return cellCache[key];
  const d = D.ITEMS[it.id], sh = D.SHAPES && D.SHAPES[it.id], out = [];
  for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) { if (sh && sh[y][x] !== '#') continue; const fx = it.flip ? d.w - 1 - x : x; out.push(it.rot % 2 ? [d.h - 1 - y, fx] : [fx, y]); }
  return cellCache[key] = out;
}

const G = window.G = {
  DAYS, GRIDS, makeItem, dims, cellsOf, roll, rnd, pick,
  newGame(diff = 'normal') {
    const r = D.DIFF[diff];
    Object.assign(G, {
      diff, rules: r, day: 1, cash: r.cash, rent: 150, arrears: 0, grace: r.grace ? 1 : 0, graceCost: 100,
      rep: { food: 0, upper: 0, cops: 0, dock: 0, picket: 0 },
      crime: { CURSE: 0, FENCING: 0, FRAUD: 0, BRIBERY: 0 }, evidence: 0, inspectIn: rnd(4, 6), officerDue: false, informDays: 0,
      garbage: 0, vandal: false, services: { power: true, jan: true, ins: false, inform: false, ref: false },
      dayNoIns: 0, items: [], caseSlots: Array(9).fill(null), upgrades: {}, scrubCd: 0, posterPulled: false,
      pills: { 0: 0, 1: 0, 2: 6, 3: 0, 4: 0 }, vend: { on: false, price: 35, claim: 2, grade: 2 }, lab: newLab(),
      mail: [], unread: 0, events: [], eventCd: {}, queue: [], client: null, phase: 'morning', log: [], over: null,
      story: { seen: {}, news: {}, notes: [], logRead: 0 }, news: null, lotDone: {}, testsLeft: 2, searchLeft: 0, wound: 0, wentOut: false, requests: [], offers: [], ghostLoan: 0, ghostLoanDay: 0,
      paQueue: [], paLast: null, paToday: false,
      perks: [], scenario: 'std', mort: null, repoNotice: null, order: null, files: 0, idLeft: 3,
      wanted: null, stats: { sold: 0, bought: 0, rent: 0, flips: 0, cursedSold: 0, best: 0, curses: 0, customers: 0 }, flags: {}, serverDone: [],
    });
    // the nine cartridges painted in the case are Carl's opening stock
    D.CASE_ART.forEach((id, i) => { const it = makeItem(id, { owned: true, real: 2 }); it.grid = 'case'; it.slot = i; G.items.push(it); G.caseSlots[i] = it.uid; });
    G.place(makeItem('cart_static', { owned: true, real: 3 }), 'stock');
    G.place(makeItem('odd_cd', { owned: true, real: 2 }), 'stock');
    G.place(makeItem('f_noodles', { owned: true, real: 1 }), 'stock');
    G.place(makeItem('f_energy', { owned: true, real: 1 }), 'stock');
    G.rollOffers();
    G.sendMail('NOTICE FROM THE LANDLORD', 'Rent is due every Sunday. It goes up every Sunday. Buy the unit outright or be evicted from it. Shut up. - L.');
    G.sendMail('PARCEL TRACKING', 'TO: CARL\'S PARENTS. STATUS: STILL IN TRANSIT.');
    G.log = ['You bought a cartridge shop from a man who ran away from it.', 'Nine carts in the case. Six Prop Pills in the terminal.'];
  },

  // -------------------------------------------- inventories
  inGrid: g => G.items.filter(i => i.grid === g),
  byUid: u => G.items.find(i => i.uid === u),
  fits(it, grid, x, y) {
    const [gw, gh] = GRIDS[grid], [w, h] = dims(it);
    if (x < 0 || y < 0 || x + w > gw || y + h > gh) return false;
    const taken = new Set();
    for (const o of G.inGrid(grid)) { if (o === it) continue; for (const [cx, cy] of cellsOf(o)) taken.add((o.x + cx) + ',' + (o.y + cy)); }
    for (const [cx, cy] of cellsOf(it)) if (taken.has((x + cx) + ',' + (y + cy))) return false;
    return true;
  },
  // first-fit brute force, both rotations (the study's auto-placer)
  place(it, grid) {
    if (!G.items.includes(it)) G.items.push(it);
    const old = it.grid; it.grid = null;
    const r0 = it.rot, f0 = !!it.flip;
    for (const [rot, flip] of [[r0, f0], [r0, !f0], [r0 ^ 1, f0], [r0 ^ 1, !f0]]) {
      it.rot = rot; it.flip = flip;
      const [gw, gh] = GRIDS[grid];
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (G.fits(it, grid, x, y)) { it.x = x; it.y = y; it.grid = grid; return true; }
    }
    it.rot = r0; it.flip = f0; it.grid = old; return false;
  },
  // tidy a grid: by type, biggest first. If it somehow will not all fit, nothing moves.
  sortGrid(grid) {
    const all = G.inGrid(grid), was = all.map(i => [i, i.x, i.y, i.rot, i.flip]), order = ['CART', 'ODD', 'PILL', 'FOOD', 'WEAPON', 'AMMO', 'JUNK'];
    const size = i => cellsOf(i).length, ty = i => { const n = order.indexOf(D.ITEMS[i.id].type); return n < 0 ? 9 : n; };
    all.forEach(i => { i.grid = null; }); let ok = true;
    for (const i of all.slice().sort((a, b) => size(b) - size(a) || ty(a) - ty(b) || (a.id < b.id ? -1 : 1))) if (!G.place(i, grid)) { ok = false; break; }
    if (!ok) for (const [i, x, y, r, f] of was) { i.grid = grid; i.x = x; i.y = y; i.rot = r; i.flip = f; }
    return ok;
  },
  remove(it) { if (it.grid === 'case') G.caseSlots[it.slot] = null; G.items = G.items.filter(i => i !== it); },
  stockPlace(it) { return G.place(it, 'stock') || (G.upgrades.shelf && G.place(it, 'stock2')); },
  netWorth() { return G.cash + G.items.filter(i => i.owned).reduce((s, i) => s + G.base(i), 0); },
  base: it => D.ITEMS[it.id].v,

  // -------------------------------------------- price: ((base * (1+innate)) * (1+market)) * deal
  condOf(it) { return D.COND[D.ITEMS[it.id].type][it.exposed ? it.real : it.fake]; },
  trueCond(it) { return D.COND[D.ITEMS[it.id].type][it.real]; },
  marketMod(it) {
    let m = 0; const t = D.ITEMS[it.id].type;
    for (const e of G.events) { const d = e.def; if (d.market && d.market[t]) m += d.market[t]; if (d.cursed && it.curse && it.curseKnown && !D.ITEMS[it.id].illegal) m += d.cursed; }
    if (it.curse && it.curseKnown) m += D.CURSE_MARKUP[it.curse];
    if (it.restricted) m += D.CURSE_MARKUP[D.ITEMS[it.id].illegal] / 2;
    return m;
  },
  shelf(it) { return Math.max(0, Math.round(G.base(it) * (1 + G.condOf(it)[1] / 100) * Math.max(0, 1 + G.marketMod(it) / 100))); },
  sellPrice(it, c) {
    let m = G.rules.markup; if (c && c.fac === 'upper' && G.rep.upper >= 20) m += 15; if (c && c.bonus) m += c.bonus;
    const deal = c ? 1 + (c.sellDeal || 0) / 100 : 1;
    return Math.max(0, Math.round(G.shelf(it) * (1 + m / 100) * deal));
  },
  buyPrice(it, c) {
    let v = G.shelf(it);
    if (it.heat > 0) v *= 1 - (it.heat <= 25 ? .10 : it.heat <= 50 ? .15 : it.heat <= 75 ? .20 : .25);
    return Math.max(1, Math.round(v * (1 + ((c && c.buyDeal) || 0) / 100)));   // pawn margin on what you pay
  },

  // -------------------------------------------- reputation
  repChange(f, v) {
    if (!f || !G.rep || G.rep[f] == null) return;
    const r = G.rules; G.rep[f] = clamp(G.rep[f] + (v > 0 ? v * r.repGain : v * r.repLoss), -200, 200);
    const over = D.FACTIONS[f].over;
    if (over && G.rep[f] <= -100) G.flags.morningOver = over;
  },
  repBonus(f) { const b = (G.rep[f] || 0) / 6; return b < 0 ? b * 2 : b; },

  // -------------------------------------------- the one-shot haggle, exact study formula
  odds(p, c) {
    if (G.tut) return { acc: 100, refuse: 0, walk: 0 };
    const rb = G.repBonus(c.fac), ev = c.fromEvent ? 15 : 0;
    const acc = clamp(100 - 2 * p + rb + ev + (G.hasPerk('lucky') ? 8 : 0), 0, 100), stay = clamp(100 - 1.2 * p + rb + ev, 0, 100);
    return { acc: Math.round(acc), refuse: Math.round(Math.max(0, stay - acc)), walk: Math.round(100 - Math.max(acc, stay)) };
  },
  haggle(side, p, c = G.client) {  // side 'sell' = markup on your goods; 'buy' = demand discount on theirs
    const flag = side + 'Offered'; if (c[flag]) return 'used';
    c[flag] = true;
    const o = G.odds(p, c), r = Math.random() * 100;
    if (r < o.acc) {
      if (side === 'sell') { c.sellDeal = p; c.budget *= 1 - ({ 10: .10, 25: .15, 50: .20, 75: .25 }[p] || 0); G.repChange(c.fac, -({ 10: .5, 25: 1.5, 50: 3, 75: 5 }[p] || 0) / 4); }
      else c.buyDeal = -p;
      return 'accept';
    }
    if (r < o.acc + o.refuse) return 'refuse';
    G.repChange(c.fac, -3); c.walked = true; G.returnTheirs(c);
    return 'walk';
  },
  // always-accepted sweeteners
  sweeten(side, p, c = G.client) {
    const flag = side + 'Offered'; if (c[flag]) return; c[flag] = true;
    if (side === 'sell') { c.sellDeal = -p; c.budget += c.budget * (2 * p / 100); G.repChange(c.fac, ({ 10: .65, 25: 1.2 }[p] || 0)); }
    else c.buyDeal = p;
  },

  // -------------------------------------------- crime and heat
  commit(type, v, c) {
    const f = c && c.fac; if (f === 'dock') v /= 2; if (f === 'picket') v = G.rep.picket >= 40 ? 0 : v / 3;
    G.crime[type] = (G.crime[type] || 0) + Math.round(v);
  },
  totalCrime() { return Object.values(G.crime).reduce((a, b) => a + b, 0); },
  traffic() { return G.crime.CURSE + G.crime.FENCING; },

  // -------------------------------------------- deals at the counter
  matOwned: () => G.inGrid('mat').filter(i => i.owned),
  matTheirs: () => G.inGrid('mat').filter(i => !i.owned),
  accepts(c, it) {
    const t = D.ITEMS[it.id].type, w = c.want || [];
    if (c.noCurseNow && it.curse && it.curseKnown) return 'no cursed goods';
    if (w.includes('CURSED') && !w.includes(t)) return it.curse && it.curseKnown && !D.ITEMS[it.id].illegal ? true : 'wants something known cursed';
    if (c.minCond != null && G.condOf(it)[1] < c.minCond) return 'wants better condition';
    return w.includes(t) ? true : 'not looking for that';
  },
  sellTotal(c = G.client) { let s = 0; for (const it of G.matOwned()) if (G.accepts(c, it) === true) s += G.sellPrice(it, c); return s; },
  buyTotal(c = G.client) { return G.matTheirs().reduce((s, it) => s + G.buyPrice(it, c), 0); },
  doSell(c = G.client) {
    const out = [];
    for (const it of G.matOwned()) {
      if (G.accepts(c, it) !== true) continue;
      // exposure: the customer checks the label against the truth
      if (it.fake !== it.real && !it.exposed && (c.checks || c.fac === 'cops' || (c.fac === 'food' && roll(35)))) {
        it.exposed = true; G.repChange(c.fac, -4); out.push(`Caught it: "${D.ITEMS[it.id].name}" is really ${G.trueCond(it)[0]}. (-4 rep)`);
      }
      let p = G.sellPrice(it, c); const full = p;
      if (p > c.budget) p = Math.floor(c.budget);
      if (p <= 0) continue;
      c.budget -= p; G.cash += p; G.stats.sold += p; G.stats.best = Math.max(G.stats.best, p);
      if (it.curse) { G.commit('CURSE', it.curseKnown ? p : p / 2, c); G.stats.cursedSold++; }
      if (D.ITEMS[it.id].curseLike) G.commit('FENCING', p / 2, c);
      if (it.heat) G.commit('FENCING', p * it.heat / 100, c);
      if (it.fake !== it.real && !it.exposed && G.condOf(it)[1] > G.trueCond(it)[1]) G.flags.fraudTrack = (G.flags.fraudTrack || 0) + p;
      G.repChange(c.fac, (full !== p ? 2 : 1) * p / 400 * D.FACTIONS[c.fac || 'food'].mult * 2);
      G.remove(it); c.dealt = true;
    }
    if (out.length) c.note = out.join('\n');
    return out;
  },
  doBuy(c = G.client) {
    const list = G.matTheirs(), total = G.buyTotal(c);
    if (total > G.cash) return false;
    { const was = list.map(i => [i, i.grid, i.x, i.y, i.rot]), done = []; let ok = true;   // everything must fit before any money moves
      for (const it of list) { it.grid = null; }
      for (const it of list) { if (G.stockPlace(it)) done.push(it); else { ok = false; break; } }
      if (!ok) { for (const [i, g, x, y, r] of was) { i.grid = g; i.x = x; i.y = y; i.rot = r; } c.lastReply = 'You have nowhere to put it. Make room on your shelf first.'; return false; } }
    G.cash -= total; G.stats.bought += total;
    if (c.intent === 'trade') c.budget += total * .5;
    let mult = 1; for (const it of list) if (it.heat) mult = Math.max(mult, 1.5);
    G.repChange(c.fac, total * mult / 400 * 2);
    for (const it of list) { it.owned = true; c.dealt = true; }
    return true;
  },
  returnTheirs(c) { for (const it of G.matTheirs()) G.remove(it); },
  // catching a seller's fake label. Wrong accusation: -2 rep.
  accuse(it, c = G.client, zone) {
    if (zone) { it.confronted = true; if (G.cartTells(it).includes(zone)) { it.exposed = true; it.tested = true; c.buyDeal = (c.buyDeal || 0) - 15; G.files++; return true; } G.repChange(c.fac, -2); return false; }
    if (it.fake !== it.real) { it.exposed = true; it.tested = true; c.buyDeal = (c.buyDeal || 0) - 15; G.files++; return true; }
    G.repChange(c.fac, -2); it.tested = true; return false;
  },
  clue(it) {  // what you can see by looking, without a test rig
    if (it.fake > it.real) return null;
    if (it.fake < it.real) return pick(['Label print is fresh. The cart is not.', 'The sticker sits over an older sticker.', 'Whoever wrote that grade has never seen one.']);
    return Math.random() < .2 ? 'Corner of the label is lifting. Could be nothing.' : null;
  },

  // -------------------------------------------- beige tower: test a cart, reveals condition + curse
  test(it) {
    if (!G.services.power) return 'NO POWER';
    if (G.testsLeft <= 0) return 'RIG IS OVERHEATING. TRY TOMORROW.';
    G.testsLeft--; it.tested = true; it.exposed = it.fake !== it.real ? it.exposed : it.exposed; it.curseKnown = true;
    let msg = `${D.ITEMS[it.id].name}: really ${G.trueCond(it)[0]}. ${D.CURSE[it.curse]}.`;
    if (it.grin) { G.story.sawStart = true; msg = 'A little man waves at you on the screen. It says: PRESS START TO PAY RENT. On Sunday, you could.'; }
    if (it.curse >= 3) { G.flags.rigFried = true; G.testsLeft = 0; msg += ' The rig screamed and shut off.'; }
    return msg;
  },
  relabel(it, idx) { it.fake = idx; it.labelled = true; it.exposed = false; },

  // -------------------------------------------- daily flow
  attract() {
    let a = 250 + (G.upgrades.neon ? 150 : 0) + (G.upgrades.neon2 ? 150 : 0) ;
    if (G.garbage > 2) a -= G.garbage * 12;
    return a;
  },
  customerCount() {
    let n = 0 + (G.story.scuff === 'hired' ? 1 : 0) + (G.hasPerk('door') ? 1 : 0); const a = G.attract();
    if (!G.vandal) { if (a >= 200) n++; if (a >= 250) n++; if (a >= 500) n++; }
    if (G.rep.food >= 20) n++; if (G.rep.food <= -20) n--;
    if (G.wentOut) n--;
    for (const e of G.events) if (e.def.fewer) n -= e.def.fewer;
    return clamp(n, 0, 6);
  },
  genClient(key, extra = {}) {
    const d = D.CLIENTS[key], c = Object.assign({ key, budget: 0 }, d, extra);
    if (d.budget) c.budget = rnd(d.budget[0], d.budget[1]) * 1.4 * (G.attract() >= 450 ? 1.25 : 1) * (1 + Math.floor(G.day / 21) * .15);
    c.line = pick(d.say); c.startBudget = c.budget;
    if (d.noCurse && roll(d.noCurse * 100)) c.noCurseNow = true;
    if (d.goods) c.carry = G.goods(d.goods, rnd(d.n[0], d.n[1]));
    // Pat's art only ever deals food; the cart dealer only ever deals carts
    { const w = c.want || [], ty = (c.carry || []).map(i => D.ITEMS[i.id].type), only = t => (w.length ? w.every(x => x === t) : true) && (ty.length ? ty.every(x => x === t) : true) && (w.length || ty.length);
      if (!c.art) { if (only('FOOD')) c.shape = 'pat'; else if (only('CART')) c.shape = key === 'trader' || key === 'regular' ? 'dealer' : c.shape; else if (c.shape === 'dealer' || c.shape === 'pat') c.shape = 'vane'; } }
    return c;
  },
  goods(kind, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = kind === 'gun' ? (roll(45) ? pick(D.GUNS) : pick(D.AMMO)) : kind === 'linda' ? pick(D.LINDA) : kind === 'odd' ? pick(D.ODDS) : kind === 'food' ? pick(D.FOODS) : kind === 'junk' ? (roll(45) ? pick(D.CARTS) : roll(55) ? pick(D.ODDS) : pick(D.FOODS)) : pick(D.CARTS);
      const o = {};
      if ((kind === 'hot' || kind === 'linda' || (kind === 'gun' && roll(50))) && G.isOpen('stolen')) o.stolen = true;
      if (!G.isOpen('curse')) {} else if (kind === 'cursed') { o.curse = rnd(1, Math.min(4, 1 + Math.floor(G.day / 8))); o.curseKnown = true; }
      else if (D.ITEMS[id].type === 'CART' && roll(22)) o.curse = rnd(1, Math.min(4, 1 + Math.floor(G.day / 10)));   // hidden curse
      const it = makeItem(id, o);
      if (roll(25) && D.ITEMS[id].type !== 'JUNK') it.fake = Math.max(0, it.real - rnd(1, 2));   // sellers lie about condition too
      out.push(it);
    }
    return out;
  },
  pickClient() {
    let f = 'food';
    const dock = G.rep.dock < -40 ? 0 : G.rep.dock < 0 ? 4 : G.rep.dock < 25 ? 10 : G.rep.dock < 50 ? 16 : 22;
    const up = G.rep.upper <= -40 ? 5 : G.rep.upper >= 50 ? 22 : G.rep.upper >= 25 ? 18 : 14;
    const pk = G.rep.picket < 0 ? 2 : 5;
    const r = Math.random() * 100;
    if (r < dock) f = 'dock'; else if (r < dock + up) f = 'upper'; else if (r < dock + up + pk) f = 'picket';
    const pool0 = D.POOL[f].filter(k => { const d = D.CLIENTS[k]; if (['gun', 'cursed'].includes(d.goods) || (d.want || []).includes('CURSED')) return G.isOpen('curse'); if (d.goods === 'hot' || d.goods === 'linda') return G.isOpen('stolen'); return true; });
    const pool = (pool0.length ? pool0 : D.POOL.food).map(k => [k, D.CLIENTS[k].w]);
    let t = pool.reduce((s, p) => s + p[1], 0) * Math.random();
    for (const [k, w] of pool) { if ((t -= w) <= 0) return k; }
    return pool[0][0];
  },
  morning() {  // called at the start of each day before the shutter opens
    G.phase = 'morning'; G.unlockMail(); if (window.STORY) window.STORY.morning(G);
    if (G.story.scuff === 'hired' && G.day > 1) { if (G.cash >= 8) { G.cash -= 8; G.log.push('Pee Kid: $8 for flyers.'); } else G.story.scuff = 'no'; }
    G.files = 0; G.idLeft = 3; G.paToday = false;
    G.testsLeft = (G.upgrades.ram ? 4 : 2) - (G.flags.rigFried ? 1 : 0); G.flags.rigFried = false;
    if (G.flags.morningOver) G.gameOver(G.flags.morningOver);
  },
  openShutter() {
    G.phase = 'day';
    G.commitTrackers();
    G.buildQueue();
    G.wentOut = false;
  },
  commitTrackers() { if ((G.flags.fraudTrack || 0) >= 300) { G.commit('FRAUD', 80); G.flags.fraudTrack = 0; G.sendMail('COMPLAINT', 'Somebody filed about a mislabeled cartridge. FRAUD went on your sheet.'); } },
  buildQueue() {
    if (G.tut) { G.queue = window.UI.tutQueue(); return; }
    const q = []; const dow = G.day % 7;
    if (window.STORY) for (const c of window.STORY.forDay(G.day, G)) q.push(c);
    if (G.officerDue) { q.unshift(window.STORY.officer(G)); G.officerDue = false; }
    if (G.inspectNow) { q.push(window.STORY.inspector(G)); G.inspectNow = false; }
    // case shoppers: each displayed cart can draw someone in
    for (const uid of G.caseSlots) {
      const it = uid && G.byUid(uid);
      if (it && roll(8 + G.base(it) / 8)) { const c = G.genClient('regular', { name: 'WINDOW SHOPPER', want: [D.ITEMS[it.id].type], budget: G.shelf(it) * 1.5, line: `That ${D.ITEMS[it.id].name} in your case. How much?`, fromCase: it.uid, noCurseNow: false }); q.push(c); if (q.length > 2) break; }
    }
    // serious curses on display bring the cops
    if (G.caseSlots.some(u => { const i = u && G.byUid(u); return i && (i.curse >= 2 || (i.heat > 0 && G.base(i) >= 85)); }) && !q.some(c => c.inspect)) q.push(window.STORY.inspector(G, true));
    const n = G.customerCount() - q.filter(c => !c.scripted).length;
    for (let i = 0; i < n; i++) q.push(G.genClient(G.pickClient()));
    if (G.services.ref && G.flags.refNext) { q.push(G.genClient('regular')); q.push(G.genClient('rat')); }
    if (G.rep.dock >= 20 && dow === 1) q.push(G.genClient('fence'));
    if (G.wanted && G.wanted.fakeInsp) { if (roll(35)) q.push(window.STORY.fakeInspector(G)); } else if (G.wanted && roll(35)) { const w = G.genClient(G.wanted.as, { wantedId: G.wanted.id, name: G.wanted.alias }); q.push(w); }
    // shortage and surplus follow the PA; a supplier comes midweek; someone goes through your can
    { const mods = {}; for (const e of G.events) for (const t in e.def.market || {}) mods[t] = (mods[t] || 0) + e.def.market[t]; const kinds = { CART: 'cart', ODD: 'odd', FOOD: 'food', WEAPON: 'gun' };
      for (const t in mods) { const nm = { CART: 'CARTS', ODD: 'ODDWARE', FOOD: 'FOOD', PILL: 'PILLS', WEAPON: 'GUNS', AMMO: 'AMMO' }[t];
        if (mods[t] >= 30) q.push(G.genClient('regular', { name: 'SHORTAGE BUYER', want: [t], bonus: 15, budget: 200 + G.day * 6, line: `I heard the PA. I need ${nm} before everyone else does. I will pay over.`, noCurseNow: true }));
        else if (mods[t] <= -30 && kinds[t] && (t !== 'WEAPON' || G.isOpen('curse'))) { const c = G.genClient('regular', { name: 'SURPLUS SELLER', intent: 'sell', line: `I heard the PA too. I am getting out of ${nm}. Take the lot, cheap.`, carry: G.goods(kinds[t], 3), buyDeal: -15 }); c.want = []; q.push(c); } } }
    if (G.day >= 7 && dow === 3) { const food = G.day % 14 === 3, c = G.genClient('regular', { name: food ? 'FOOD DEALER' : 'CART DEALER', intent: 'sell', line: 'Weekly run. All or nothing, at wholesale. Fifteen off.', want: [], carry: G.goods(food ? 'food' : 'cart', 4), buyDeal: -15 }); c.want = []; q.push(c); }
    if (G.day >= 5 && roll(18)) q.push(window.STORY.canDiver(G));
    if (G.day >= 6 && G.day - (G.story.stringerDay || 0) >= 6 && roll(35)) q.push(window.STORY.stringer(G));
    if (G.order && G.day >= G.order.due) q.unshift(window.STORY.mercBack(G));
    else if (!G.order && G.isOpen('curse') && roll(25)) q.push(window.STORY.mercOrder(G));
    if (dow === 0) { q.push(window.STORY.merchant(G)); q.push(window.STORY.landlord(G)); }
    G.queue = q; G.stats.customers += q.length;
  },
  next() {
    G.endClient();
    if (!G.queue.length) { G.client = null; return null; }
    const c = G.queue.shift(); G.client = c; c.arriveT = 0; if (window.STORY) window.STORY.reached(G, c);
    if (c.carry) for (const it of c.carry) { if (!G.place(it, 'mat')) G.remove(it); }
    if (c.fromCase) { const it = G.byUid(c.fromCase); if (it) { /* they point at it; move it to the mat if you agree */ } }
    return c;
  },
  endClient() {
    const c = G.client; if (!c) return;
    if (!G.tut && !G.paToday && G.day >= 2 && G.phase === 'day' && roll(30)) G.paFlash();
    G.returnTheirs(c);
    // leftover owned goods go back to stock
    for (const it of G.matOwned()) G.stockPlace(it);   // no room: it stays on the counter
    G.client = null;
  },
  closeDay() {
    G.endClient(); G.queue = []; G.phase = 'evening';
    G.flags.refNext = false;
  },
  serviceCost(k) { const s = D.SERVICES[k]; let c = s.cost(G) * G.rules.svc; if (k === 'power') for (const e of G.events) if (e.def.power) c *= e.def.power; return Math.floor(c); },
  feesTotal() { let t = 0; for (const k in G.services) if (G.services[k]) t += G.serviceCost(k); return t; },

  // -------------------------------------------- night: ordered batch, like the study's EndNight
  endNight() {
    const log = [];
    // services
    for (const k in G.services) if (G.services[k]) G.cash -= G.serviceCost(k);
    if (G.services.ref) G.flags.refNext = true;
    // janitor
    if (G.services.jan) {
      G.garbage = 0; if (G.vandal) { G.vandal = false; log.push('Janitor scrubbed the vandalism off.'); }
      G.story.janStreak = (G.story.janStreak || 0) + 1; G.story.janSkip = 0;
      const tr = G.inGrid('trash'); { const keep = tr.filter(i => !i.grin && D.ITEMS[i.id].type !== 'JUNK' && !D.ITEMS[i.id].illegal).sort((a, b) => G.base(b) - G.base(a))[0]; if (keep) G.story.wickItem = { id: keep.id, real: keep.real, fake: keep.fake }; }
      if (tr.length) { tr.forEach(G.remove); log.push(`Janitor emptied the can (${tr.length} thing${tr.length > 1 ? 's' : ''}).`); }
    } else { G.story.janSkip = (G.story.janSkip || 0) + 1; G.story.janStreak = 0; G.garbage = Math.min(10, G.garbage + 2); if (G.garbage > 2) log.push('Trash is piling up. Fewer people want to come in.'); }
    // insurance / burglary
    if (G.services.ins || G.rep.cops >= 100) G.dayNoIns = 0;
    else {
      G.dayNoIns++;
      const chance = 33 + 5 * G.dayNoIns - (G.rep.cops >= 40 ? 16 : 0);
      if (G.day > 3 && roll(chance)) {
        const pool = G.items.filter(i => i.owned && ['stock', 'stock2', 'case'].includes(i.grid)).filter(i => !i.grin);
        if (pool.length) { const v = pick(pool); G.remove(v); G.stats.curses; log.push(`{red}BURGLED:{/} ${D.ITEMS[v.id].name} is gone.`); }
      }
    }
    // vandalism from angry factions
    for (const f in G.rep) if (G.rep[f] <= -20 && roll(Math.abs(G.rep[f]) / 5 * (f === 'picket' && G.rep[f] <= -40 ? 2 : 1))) { G.vandal = true; log.push(`${D.FACTIONS[f].name} tagged your shutter.`); }
    { const l = G.lab, got = Object.keys(l.crate); if (got.length) { l.arrived = l.arrived || {}; for (const k of got) l.arrived[k] = (l.arrived[k] || 0) + l.crate[k]; l.crate = {}; l.crateOpen = false; log.push('A crate of reagents came to the back lab.'); } }
    // machines tick, power only
    if (G.services.power) {
      for (const it of G.inGrid('server')) {
        if (it.curse > 0) { it.curse--; it.curseKnown = true; log.push(`Rack unit dumped ${D.ITEMS[it.id].name}: now ${D.CURSE[it.curse]}.`); }
        else if (!it.tested) { it.tested = true; it.curseKnown = true; log.push(`Rack unit read ${D.ITEMS[it.id].name}: clean.`); }
      }
      G.labNight(log);
    } else log.push('No power. The rack unit and the lab sat dark.');
    // vending
    if (G.vend.on && G.services.power) {
      let sold = 0, g = G.vend.grade;
      const claimV = D.COND.PILL[G.vend.claim][1], fair = 30 * (1 + claimV / 100);
      const demand = rnd(1, 3) + (G.vend.price < fair ? 2 : 0) - (G.vend.price > fair * 1.5 ? 2 : 0);
      for (let i = 0; i < demand && G.pills[g] > 0; i++) { G.pills[g]--; sold++; }
      if (sold) {
        G.cash += sold * G.vend.price; G.stats.sold += sold * G.vend.price;
        log.push(`Terminal sold ${sold} pill${sold > 1 ? 's' : ''} overnight for $${sold * G.vend.price}.`);
        if (G.vend.claim < g) G.flags.fraudTrack = (G.flags.fraudTrack || 0) + sold * G.vend.price;
      }
    }
    // curses act up
    for (const it of G.items) if (it.owned && it.curse && roll(it.curse * 4) && it.grid !== 'server') {
      G.stats.curses++;
      log.push('{pink}' + pick(D.CURSE_NIGHT).replace('{n}', D.ITEMS[it.id].name) + '{/}');
      if (it.curse >= 2) G.cash = Math.max(0, G.cash - it.curse * 3);
      break;
    }
    // food spoils
    for (const it of G.items) if (D.ITEMS[it.id].type === 'FOOD' && it.owned && roll(40) && it.real < 3) { it.real++; if (it.fake < it.real - 1 && !it.labelled) it.fake = it.real; else if (!it.labelled) it.fake = it.real; }
    // stolen goods cool off
    for (const it of G.items) if (it.heat > 0) it.heat = Math.max(0, it.heat - 18);
    G.log = log;
    G.newDay();
  },
  newDay() {
    G.day++;
    if (G.scrubCd > 0) G.scrubCd--;
    if (G.upgrades.permit && G.rep.cops < 0) { G.upgrades.permit = false; G.setPermit(false); G.sendMail('PERMIT REVOKED', 'Your standing with the Mall Cops went negative. Every gun and round in the shop is illegal again.'); }
    // events
    G.events = G.events.filter(e => --e.left > 0);
    for (const k in G.eventCd) if (--G.eventCd[k] <= 0) delete G.eventCd[k];
    const fire = e => { G.events.push({ def: e, left: e.days }); G.eventCd[e.id] = e.days + 7; G.sendMail(e.name, e.news); G.paSay(e); };
    if (G.eventNext) { const e = D.EVENTS.find(x => x.id === G.eventNext); G.eventNext = null; if (e) fire(e); }
    const chance = G.day <= 4 ? 0 : [50, 35, 25, 0][Math.min(3, G.events.length)];
    if (roll(chance)) {
      const opts = D.EVENTS.filter(e => !e.flash && !G.eventCd[e.id] && !G.events.some(x => x.def === e));
      let t = opts.reduce((s, e) => s + e.w, 0) * Math.random();
      for (const e of opts) if ((t -= e.w) <= 0) { if (G.rep.upper >= 60) { G.eventNext = e.id; G.eventCd[e.id] = e.days + 8; G.log.push(`{yellow}Upper Deck gossip:{/} tomorrow, ${e.name}. ${G.paEffect(e)}.`); } else fire(e); break; }
    }
    // crime decays while evidence < 80, then evidence climbs by total crime
    if (G.evidence < 80) for (const k in G.crime) G.crime[k] = Math.max(0, G.crime[k] - 20);
    const t = G.totalCrime();
    let ev = t < 100 ? 0 : t < 300 ? 2 : t < 850 ? 6 : t < 1200 ? 9 : t < 1500 ? 12 : t < 2500 ? 20 : 33;
    if (G.rep.cops >= 60) ev /= 2; else if (G.rep.cops <= -60) ev *= 1.5; else if (G.rep.cops <= -20) ev *= 1.2;
    G.evidence = Math.min(100, G.evidence + ev);
    if (G.evidence >= 100) { G.officerDue = true; }
    if (G.evidence > 90 && !G.officerDue) G.log.push('{red}Your server\'s red light is solid. Evidence is nearly complete.{/}');
    // inspection countdown
    if (G.traffic() >= 50 && G.rep.cops < 100) {
      G.inspectIn -= G.events.some(e => e.def.sweep) ? 2 : 1;
      if (G.inspectIn <= 0) {
        G.inspectNow = true; const x = G.traffic();
        G.inspectIn = x >= 750 ? rnd(1, 2) : x >= 600 ? 2 : x >= 450 ? rnd(2, 3) : x >= 300 ? 3 : x >= 150 ? rnd(3, 4) : rnd(3, 5);
        if (G.rep.cops >= 60) G.inspectIn += rnd(2, 4);
      } else if (G.inspectIn <= 3 && G.services.inform) G.log.push(`{yellow}Informant:{/} inspection in ${G.inspectIn} day${G.inspectIn > 1 ? 's' : ''}.`);
      else if (G.inspectIn <= 2 && G.rep.dock >= 60) G.log.push(`{yellow}Loading Dock tip:{/} inspection in ${G.inspectIn} day${G.inspectIn > 1 ? 's' : ''}.`);
      else if (G.inspectIn <= 1 && G.rep.food >= 60) G.log.push('{yellow}Food Court says:{/} New Face is coming tomorrow.');
    }
    // daily offers, requests
    if (G.day % 2 === 1) G.rollOffers();
    if (G.day > 8 && roll(14) && G.requests.length < 3) G.addRequest();
    if (G.day >= 6 && !G.wanted && roll(5 + G.day / 4)) G.addWanted();
    if (G.ghostLoan && G.day >= G.ghostLoanDay + 25) { const p = G.ghostLoan * 4; G.cash += p; G.log.push(`{green}Spooky Ghost paid you back. $${p} in old bills. They are damp.{/}`); G.ghostLoan = 0; }
    G.morning();
  },
  rollOffers() {
    G.offers = [];
    for (let i = 0; i < 3; i++) {
      const it = makeItem(roll(55) ? pick(D.CARTS) : roll(50) ? pick(D.ODDS) : pick(D.FOODS), { real: D.ITEMS.x ? 2 : 1 });
      G.offers.push({ item: it, cost: Math.round(G.shelf(it) * .75) });
    }
    const pk = roll(50) ? 2 : 1;
    G.offers.push({ pills: pk, n: 5, cost: pk === 1 ? 110 : 60 });
  },
  addRequest() {
    const id = pick(D.CARTS), real = rnd(1, 2);
    G.requests.push({ id, minReal: real + 1, reward: Math.round(D.ITEMS[id].v * rnd(18, 28) / 10), fac: pick(['upper', 'food', 'picket']), left: 10 });
    G.sendMail('MARKETPLACE REQUEST', `Somebody wants ${D.ITEMS[id].name}. See OFFERS.`);
  },
  fulfil(r) {
    const it = G.items.find(i => i.owned && i.id === r.id && ['stock', 'stock2'].includes(i.grid)); if (!it) return false;
    G.remove(it); G.cash += r.reward; G.stats.sold += r.reward; G.repChange(r.fac, 2); if (it.curse) G.commit('CURSE', r.reward / 2);
    G.requests = G.requests.filter(x => x !== r); return true;
  },
  addWanted() {
    if (G.isOpen('stolen') && roll(25)) { G.wanted = { id: uid++, fakeInsp: true, as: 'regular', alias: 'LEROY', reward: 300, days: 12 }; G.sendMail('MALL COPS: BOLO', 'Wanted: Leroy, posing as New Face. He only has eight screens. Reward $300 for reporting him at your window. Reporting the real one costs $50.'); return; }
    const as = pick(['fence', 'rat', 'trader']), alias = pick(['SHORT MAN IN A HAT', 'MAN WITH NO RECEIPT', 'PERSON OF SOME INTEREST', 'GENTLEMAN AT LARGE']);
    G.wanted = { id: uid++, as, alias, reward: rnd(100, 450), days: 12 };
    G.sendMail('MALL COPS: BOLO', `Wanted: ${alias}. Reward $${G.wanted.reward} on a correct report. Use the red keypad by the door while they are at your counter. A wrong report costs $50.`);
  },
  report(c = G.client) {
    if (!c) return 'NOBODY HERE';
    if (c.wantedId && G.wanted && c.wantedId === G.wanted.id) { const r = G.wanted.reward; G.cash += r; G.repChange('cops', 5); G.repChange(c.fac, -8); G.wanted = null; G.returnTheirs(c); c.walked = true; c.note = 'Two Mall Cops walked them away.'; return `CORRECT. +$${r}.`; }
    if (G.matTheirs().some(i => i.curse && i.curseKnown)) { G.cash += 50; G.repChange('cops', 2); G.repChange(c.fac, -8); G.returnTheirs(c); c.walked = true; c.note = 'Two Mall Cops walked them away.'; return 'CURSED GOODS REPORTED. +$50.'; }
    if (G.cash >= 100) G.cash -= 50; G.repChange('cops', -8); return 'WRONGFUL REPORT. -$50.';
  },
  // inspection, as the study's ContrabandHelper.StartInspection. Worst level decides: critical, high, mid, stolen, low, none.
  inspect(personality, fromCase, fakeInsp) {
    const scope = ['stock', 'stock2', 'mat', 'case', 'server']; if (personality !== 2) scope.push('trash'); if (G.posterPulled) scope.push('stash');
    const flagged = G.items.filter(i => i.owned && scope.includes(i.grid) && (i.curse > 0 || i.heat > 0));
    const found = flagged.filter(i => i.curse > 0 || roll(i.heat));
    const concealed = !G.posterPulled && G.inGrid('stash').some(i => i.curse > 0 || i.heat > 0);
    let lucky = false;
    if (found.length && roll(G.hasPerk('lucky') ? 25 : 5)) { lucky = true; found.length = 0; }
    const band = i => { if (!i.heat) return 0; const v = G.base(i); return v <= 17 ? 0 : v < 50 ? 1 : v < 85 ? 2 : v < 140 ? 3 : 4; };
    let loss = Math.min(25, found.reduce((s, i) => s + 1 + i.curse + band(i), 0));
    let worst = found.reduce((w, i) => Math.max(w, i.curse), 0); const stolen = found.some(i => i.heat > 0);
    if (fakeInsp) { loss = 0; if (worst >= 3) worst = 2; }
    let level = worst === 4 ? 'critical' : worst === 3 ? 'high' : worst === 2 ? 'mid' : stolen ? 'stolen' : worst === 1 ? 'low' : 'none';
    const r = { found: found.slice(), level, worst, stolen, concealed, lucky, fine: 0 };
    if (level === 'none') { if (!fromCase && !concealed && !lucky && !fakeInsp) G.repChange('cops', 3); return r; }
    r.names = found.slice(0, 3).map(i => D.ITEMS[i.id].name).join(', ') + (found.length > 3 ? ` and ${found.length - 3} more` : '');
    const useGrace = () => { if (!G.upgrades.secgrace) return false; G.upgrades.secgrace = false; G.secGraceCost = (G.secGraceCost || 300) + 100; r.graced = true; return true; };
    if (level === 'critical' && !useGrace()) { r.arrest = true; return r; }
    if (level === 'high') { r.fine = found.reduce((s, i) => s + G.base(i), 0); if (G.cash < r.fine) { r.fine = 0; if (!useGrace()) { r.arrest = true; return r; } } else G.cash -= r.fine; }
    G.repChange('cops', -loss);
    if (level !== 'low') { found.forEach(i => { if (i.grin) return; G.dropFrom(i); }); G.sendMail('INSPECTION SLIP', `Seized: ${r.names}.${r.fine ? ` Fine: $${r.fine}.` : ''} Standing -${loss}.`); }
    return r;
  },
  // a cart under the glass. A liar's cart has one or two tells; the pins and shell also show its true wear.
  CART_ZONES: ['LOGO', 'LETTERING', 'SEAL', 'SHELL', 'PINS'],
  cartTells(it) {
    if (it.tells) return it.tells;
    const z = G.CART_ZONES.slice().sort(() => Math.random() - .5);
    return it.tells = it.fake < it.real ? z.slice(0, rnd(1, 2)) : [];
  },
  cartLook(it, zone) {
    const bad = G.cartTells(it).includes(zone), n = it.uid % 3, w = it.real;
    if (zone === 'LOGO') return bad ? ['This logo is a sticker over an older logo.', 'The logo sits a little crooked, and it is the wrong shade.', 'The logo is printed flat. Real ones are stamped in.'][n] : 'The logo is stamped in, straight and clean.';
    if (zone === 'LETTERING') return bad ? ['The grade on the label is in a different typeface to the title.', 'Someone reprinted this label. The ink sits on top of the old print.', 'The letters on the label do not line up with each other.'][n] : 'The label print is even, and it all matches.';
    if (zone === 'SEAL') return bad ? ['The seal has been cut and glued back.', 'The seal is a new sticker on an old cart.', 'There is residue around the seal. It has come off before.'][n] : 'The seal is flat and has never been lifted.';
    if (zone === 'SHELL') return (bad ? 'This wear does not match the label. ' : '') + ['The shell is spotless.', 'The shell has light scuffs.', 'The shell is worn at the corners.', 'The shell is chewed and cracked.', 'The shell is barely holding together.'][Math.min(4, w)];
    return (bad ? 'These pins were polished for show, but only the front. ' : '') + ['The pins are bright.', 'The pins are clean.', 'The pins are a little dull.', 'The pins are going green.', 'The pins are mostly corrosion.'][Math.min(4, w)];
  },
  bribeCost() { return clamp(100 + 2 * G.day - 2 * G.rep.cops, 40, 400); },

  // A.S.S. door: scavenging the Lot. Risk climbs per attempt in a visit.
  goOut() { G.wentOut = true; G.searchLeft = 5; G.searchN = 0; G.lotDone = {}; },
  search(bias) {
    if (G.searchLeft <= 0) return null; G.searchLeft--; G.searchN++;
    const r = { items: [] };
    if (roll(G.searchN * 4 + G.wound * 2) && !(G.day < 3)) { const dm = rnd(10, 25); G.cash = Math.max(0, G.cash - dm); r.hurt = dm; G.searchLeft = Math.max(0, G.searchLeft - 1); }
    const table = D.LOOT.map(([k, w]) => [k, w * ((bias && bias[k]) || 1)]);
    let t = table.reduce((s, l) => s + l[1], 0) * Math.random(), got = 'nothing';
    for (const [k, w] of table) if ((t -= w) <= 0) { got = k; break; }
    const add = (id, real) => { const it = makeItem(id, { owned: true, real }); if (roll(10) && D.ITEMS[id].type === 'CART') it.curse = rnd(1, 2); if (G.stockPlace(it)) r.items.push(it); else { G.remove(it); r.full = true; } };
    if (got === 'cart') add(pick(D.CARTS), rnd(3, 4));
    else if (got === 'odd') add(pick(D.ODDS), rnd(2, 4));
    else if (got === 'food') add(pick(D.FOODS), rnd(1, 3));
    else if (got === 'junk') add(pick(D.JUNK), 0);
    else if (got === 'ammo') add(pick(D.AMMO), 1);
    else if (got === 'pill') { const k = roll(30) ? 3 : 2; G.pills[k]++; r.pill = k; }
    return r;
  },

  // terminal: dispense puts a pill on your stock grid with whatever label you dare print
  dispense(grade, claim) {
    if (G.pills[grade] <= 0) return false;
    const it = makeItem('pill', { owned: true, real: grade, fake: claim, curseKnown: true, tested: true });
    it.art = ['jar_pharma', 'jar_pharma', 'jar_street', 'jar_cut', 'jar_junk'][grade];
    if (!G.stockPlace(it)) { G.remove(it); return false; }
    G.pills[grade]--; return it;
  },
  // ---- the back lab: flask -> evaporator -> tray -> press -> scanner -> terminal. One stage a night, like every machine here.
  labOrder(k) { const c = D.REAGENTS[k].cost; if (G.cash < c) return false; G.cash -= c; const l = G.lab; l.crate[k] = (l.crate[k] || 0) + 1; return true; },
  labOpenCrate() { const l = G.lab; if (!l.arrived) return false; for (const k in l.arrived) l.stock[k] += l.arrived[k]; l.arrived = null; l.crateOpen = true; return true; },
  labAdd(k) {
    const l = G.lab; if (l.stock[k] <= 0) return 'None on the shelf. Order more on the terminal.';
    const f = l.flask = l.flask || { base: 0, solv: 0, stab: 0, fill: 0, st: 'raw' };
    if (f.st !== 'raw') return 'That flask is finished. Move it on first.';
    if ((k === 'base' || k === 'fill') && f[k] >= 2) return 'Two is the most this flask takes.';
    if ((k === 'solv' && f.solv >= 2) || (k === 'stab' && f.stab >= 1)) return 'That is enough of that.';
    l.stock[k]--; f[k]++; return null;
  },
  labDump() { G.lab.flask = null; },
  labReady(f) { return f && f.st === 'raw' && f.base > 0 && f.solv >= f.base; },
  labWindow(f) { return f && f.stab ? { lo: 105, hi: 140, burn: 155 } : { lo: 115, hi: 130, burn: 138 }; },
  labToEvap() { const l = G.lab; if (!l.flask || l.flask.st !== 'cooked' || l.evap || l.tray) return false; l.evap = l.flask; l.flask = null; return true; },
  labToPress() { const l = G.lab; if (!G.upgrades.press || !l.tray || l.press || l.jam || l.jar) return false; l.press = l.tray; l.tray = null; return true; },
  labToScan() { const l = G.lab; if (!l.jar || l.scan) return false; l.scan = l.jar; l.jar = null; return true; },
  labShelve() { const l = G.lab; if (!l.scan) return false; G.pills[l.scan.grade] += l.scan.n; l.scan = null; return true; },
  labFix() { const l = G.lab; if (!l.jam || G.cash < 25) return false; G.cash -= 25; l.jam = false; return true; },
  labNight(log) {
    const l = G.lab, ran = {}; G.labWindow1(log, 1); G.labTick(log, ran); G.labWindow1(log, 2); G.labTick(log, ran); G.labWindow1(log, 3);
  },
  labWindow1(log, w) {   // a hopper moves things between machines. No cost, no power. Three windows a night.
    const l = G.lab, u = G.upgrades;
    if (u.hop3 && l.jar && !l.scan && G.labToScan()) log.push('Hopper moved a jar to the scanner.');
    if (u.hop2 && l.tray && !l.press && G.labToPress()) log.push('Hopper moved the dry tray into the press.');
    if (u.hop1 && l.flask && l.flask.st === 'cooked' && G.labToEvap()) log.push('Hopper moved the flask to the evaporator.');
  },
  labTick(log, ran) {    // each machine runs once a night, whichever pass finds it loaded
    const l = G.lab; let n;
    if (!ran.press && (n = l.press)) {
      ran.press = true; l.press = null; const jam = 8 + 10 * n.fill, yieldN = n.base * 6 + n.fill * 3, grade = PURITY_GRADE(n.pur);
      if (roll(jam)) { l.jam = true; const left = Math.ceil(yieldN / 2); l.jar = { n: left, pur: n.pur, grade }; log.push(`The pill press jammed. ${left} pills survived.`); }
      else { l.jar = { n: yieldN, pur: n.pur, grade }; log.push(`The pill press filled a jar with ${yieldN} pills. Scan it.`); }
    }
    if (!ran.evap && (n = l.evap) && !l.tray) { ran.evap = true; l.evap = null; l.tray = n; log.push('The evaporator left a tray of dry powder.'); }
    const f = l.flask;
    if (!ran.flask && G.labReady(f) && l.temp > 0) {
      ran.flask = true;
      const w = G.labWindow(f), T = l.temp;
      if (T >= w.burn) { f.st = 'burnt'; G.evidence = Math.min(100, G.evidence + 4); log.push('The flask burned overnight. The whole mall smelled it.'); }
      else {
        const q = T < w.lo ? Math.max(.3, 1 - (w.lo - T) / 60) : T > w.hi ? Math.max(.5, 1 - (T - w.hi) / 30) : 1;
        f.pur = Math.max(5, Math.min(99, Math.round(88 * q - 15 * f.fill - (f.stab ? 0 : 6) + rnd(-4, 4)))); f.st = 'cooked'; log.push('The flask cooked overnight. Move it to the evaporator.');
      }
    }
  },
  // ---- right-click: things an item can do. Each returns the line to say, or false to do nothing.
  unpack(it, make, msg) {   // the box leaves first, so its own squares count as room
    const spot = { grid: it.grid, x: it.x, y: it.y, slot: it.slot }, list = make(); it.grid = null; const done = [];
    for (const n of list) { if (G.stockPlace(n)) done.push(n); else { G.items.includes(n) && G.remove(n); done.forEach(G.remove); Object.assign(it, spot); return 'No room in stock to unpack that.'; } }
    if (spot.grid === 'case') G.caseSlots[spot.slot] = null;
    it.grid = spot.grid; G.remove(it); return msg;
  },
  itemActs(it) {
    const id = it.id, def = D.ITEMS[id], o = [], mk = (k, x = {}) => makeItem(k, Object.assign({ owned: true }, x));
    const cartRoll = () => pick(D.CARTS.filter(k => k !== 'cart_evil')), once = (msg, fn) => () => { if (it.usedDay === G.day) return 'Already did that today.'; it.usedDay = G.day; return fn ? fn() : msg; };
    const look = (t, msg) => o.push({ t, fn: () => msg, snd: 'select' });
    if (def.type === 'FOOD') o.push({ t: 'EAT', snd: 'grab_food', fn: () => { G.dropFrom(it); return `You ate the ${def.name}. A normal thing for a human man to do.`; } });
    if (id === 'pill') o.push({ t: 'POUR BACK IN TERMINAL', snd: 'jar', fn: () => { G.pills[it.real]++; G.dropFrom(it); return 'Back in the terminal, under its real grade.'; } });
    else if (def.type === 'PILL' && id !== 'pill_maybe') o.push({ t: 'TAKE ONE', snd: 'jar', fn: () => { G.dropFrom(it); return 'Nothing happens. It is gone now, though. That is the whole effect.'; } });
    if (id === 'pill_maybe') o.push({ t: 'OPEN', snd: 'paper', fn: () => G.unpack(it, () => [mk(pick(['pill_blister', 'pill_kitty', 'pill_loz', 'pill_stars', 'odd_loose'])), mk(pick(['odd_loose', 'odd_loose', 'pill_blister']))], 'It was a couple of things. It could have been anything.') });
    if (id === 'odd_boxlot') o.push({ t: 'OPEN', snd: 'crate', fn: () => G.unpack(it, () => { const b = [mk(cartRoll()), mk(cartRoll()), mk(cartRoll())]; b[rnd(0, 2)].curse = rnd(1, 3); return b; }, 'Three carts. One of them is trouble. Test them.') });
    if (id === 'odd_stack') o.push({ t: 'PRY APART', snd: 'clunk', fn: () => G.unpack(it, () => [mk(cartRoll()), mk(cartRoll()), mk(cartRoll())], 'Three carts, slightly sticky. They were worth more glued.') });
    if (id === 'odd_rx') o.push({ t: 'OPEN', snd: 'jar', fn: () => G.unpack(it, () => [mk('odd_loose'), mk('odd_loose'), mk('odd_loose')], 'Three handfuls of loose pills. Occupant will not be needing them.') });
    if (id === 'odd_mint') o.push({ t: 'OPEN (RUINS IT)', snd: 'crate', fn: () => G.unpack(it, () => [mk('odd_procon'), mk(cartRoll())], 'You opened it. It is no longer mint. The box is gone too. You do not remember throwing it away.') });
    if (id === 'odd_display') o.push({ t: 'TAKE THE CART OUT', snd: 'grab_cart', fn: () => G.unpack(it, () => [mk(cartRoll(), { curse: 1 })], 'The spot is empty now. It was holding it for someone. They will be upset.') });
    if (D.ITEMS[id].type === 'JUNK') o.push({ t: 'RUMMAGE', snd: 'rummage', fn: () => G.unpack(it, () => roll(25) ? [mk('odd_loose')] : [], 'You went through it.') });
    if (id === 'l_bag') o.push({ t: 'OPEN', snd: 'paper', fn: () => { if (it.used) return 'Empty now. Very nice lining.'; it.used = true; G.cash += 40; return 'A breath mint and $40. You kept the $40.'; } });
    if (id === 'l_phone') look('READ', 'One unread message, with a heart on it. It has been there a long time. You close it again.');
    if (id === 'odd_blowkit') o.push({ t: 'CLEAN A CART', snd: 'glass', fn: () => { const c = G.items.filter(i => i.owned && !i.grin && D.ITEMS[i.id].type === 'CART' && i.real > 0 && i.grid !== 'case').sort((a, b) => b.real - a.real)[0]; if (!c) return 'Nothing in stock needs cleaning.'; c.real--; if (c.fake > c.real) c.fake = c.real; G.dropFrom(it); return `${D.ITEMS[c.id].name} cleaned up a whole grade. The kit is used up.`; } });
    if (id === 'odd_guide') o.push({ t: 'READ', snd: 'paper', fn: () => { if (it.used) return 'You have read it. The last 40 pages have changed.'; it.used = true; let n = 0; for (const c of G.items) if (c.owned && D.ITEMS[c.id].type === 'CART' && !c.grin && !c.tested) { c.tested = true; if (c.fake !== c.real) c.exposed = true; n++; } return `The handwritten pages describe your stock. ${n} cart${n === 1 ? '' : 's'} now show their true grade.`; } });
    if (id === 'odd_3d') o.push({ t: 'PUT ON', snd: 'select', fn: once(null, () => { const l = G.matTheirs().filter(i => i.fake !== i.real); return !G.matTheirs().length ? 'Nothing on the counter to look at.' : l.length ? `One eye says these labels lie: ${l.map(i => D.ITEMS[i.id].name).join(', ')}.` : 'One eye sees everything on the counter is as labeled. The other eye disagrees, but it is broken.'; }) });
    if (id === 'odd_egg') o.push({ t: 'FEED', snd: 'grab_food', fn: () => { const f = G.items.find(i => i.owned && D.ITEMS[i.id].type === 'FOOD' && ['stock', 'stock2'].includes(i.grid)); if (!f) return 'It wants food. You have none. It knows.'; G.remove(f); return `It ate the ${D.ITEMS[f.id].name}. It is still dead. It is still hungry.`; } });
    if (id === 'odd_remote') o.push({ t: 'PRESS THE BUTTON', snd: 'select', fn: once('Somewhere in the mall, a TV changes channel. Somebody screams, then says never mind.') });
    if (id === 'odd_chatty') look('TURN ON', 'It says: AND THEN YOU WALK LEFT FOR A WHILE.');
    if (id === 'odd_crt') look('WATCH', 'One channel. It is a shop. There is a green man in it, watching a TV.');
    if (id === 'odd_walkie') look('LISTEN', 'A heartbeat. It speeds up when you pick it up.');
    if (id === 'odd_mp3' || id === 'odd_phones') look('LISTEN', 'Eleven thousand songs, and all of them are this one.');
    if (id === 'odd_tape') look('PLAY SIDE B', 'Someone breathing, in key.');
    if (id === 'odd_ring') look('OPEN', 'Someone meant to give this to someone. You close it.');
    if (id === 'odd_diary') look('OPEN', 'Locked. Something flutters against the lid.');
    if (id === 'odd_floppy') look('READ', 'The drive reads half of it. The half says DO NOT.');
    if (id === 'odd_leaky') look('WIPE IT', 'It keeps your progress on your hands now.');
    return o;
  },
  // after a reload: ids must stay unique, or a new item can impersonate one in the case
  fixUids() { for (const i of G.items) i.curseKnown = true; const seen = new Set(), order = [...G.items.filter(i => i.grid === 'case'), ...G.items.filter(i => i.grid !== 'case')]; let top = 0; for (const i of G.items) top = Math.max(top, i.uid); uid = Math.max(uid, top + 1); for (const i of order) { if (seen.has(i.uid)) i.uid = uid++; seen.add(i.uid); } G.caseRepair(true); },
  // the case slots always agree with the items in them
  caseRepair(rebuild) {
    const bad = G.caseSlots.some((u, i) => { if (!u) return false; const it = G.byUid(u); return !it || it.grid !== 'case' || it.slot !== i; }) || G.items.some(i => i.grid === 'case' && G.caseSlots[i.slot] !== i.uid);
    if (!bad && !rebuild) return false;
    G.caseSlots = Array(9).fill(null);
    for (const it of G.items) if (it.grid === 'case') { if (it.slot != null && !G.caseSlots[it.slot]) G.caseSlots[it.slot] = it.uid; else { const f = G.caseSlots.indexOf(null); if (f >= 0) { it.slot = f; G.caseSlots[f] = it.uid; } else { it.grid = null; G.stockPlace(it) || G.place(it, 'trash'); } } }
    return bad;
  },
  dropFrom(it) { if (it.grid === 'case') G.caseSlots[it.slot] = null; G.remove(it); },
  moveTo(it, grid) { const was = it.grid, slot = it.slot, ok = grid === 'stock' ? G.stockPlace(it) : G.place(it, grid); if (ok && was === 'case') G.caseSlots[slot] = null; return ok; },
  // Linda on the PA. What she says is what the market does.
  paEffect(d) { const L = { CART: 'CARTS', ODD: 'ODDWARE', PILL: 'PILLS', FOOD: 'FOOD', WEAPON: 'GUNS', AMMO: 'AMMO' }, o = []; for (const k in d.market || {}) o.push(`${L[k]} ${d.market[k] > 0 ? '+' : ''}${d.market[k]}%`); if (d.cursed) o.push(`CURSED +${d.cursed}%`); if (d.sweep) o.push('INSPECTIONS SOONER'); if (d.power) o.push(`POWER x${d.power}`); if (d.fewer) o.push('FEWER SHOPPERS'); return o.join('  ') || 'NO EFFECT ON PRICES'; },
  paSay(d) { const n = { 2: 'two', 3: 'three', 4: 'four', 7: 'seven' }[d.days]; (G.paQueue = G.paQueue || []).push({ line: (d.pa || d.news) + (d.flash ? '' : ` This lasts ${n} days.`), fx: G.paEffect(d), left: d.flash ? 'TODAY' : `${d.days} DAYS` }); },
  paFlash(id) { const l = D.EVENTS.filter(e => e.flash && !G.events.some(x => x.def === e)), d = id ? D.EVENTS.find(e => e.id === id) : pick(l); if (!d) return; G.paToday = true; G.events.push({ def: d, left: d.days }); G.paSay(d); },
  // the shop opens up over two weeks, as people tell you about it
  isOpen(k) { return G.tut || G.scenario !== 'std' && k !== 'lot' || G.day >= ({ lot: 2, label: 4, lab: 6, curse: 9, stolen: 13 })[k]; },
  unlockMail() { const m = { 2: ['THE BACK DOOR', 'Your A.S.S. door opens onto the dumpster. After closing, you can dig for stock. It costs you a customer in the morning. - Wick'], 4: ['LABEL PRINTER', 'The barcode reader on your counter prints condition labels. Drag goods onto it. I am telling you so that I can watch. - New Face'], 6: ['BACK LAB', 'The flask key on your terminal opens the back lab. Prop Pills, one stage a night, unless you buy hoppers. - Yoko'], 9: ['THE LOADING DOCK', 'Word reached the dock. People with guns and cursed carts will start stopping by. Curses show a number. At 4, New Face takes you to a room. - Spooky Ghost'], 13: ['HOT GOODS', 'You will start seeing things that fell off something. They pay well. They cool off in a few nights. Lean on the sellers if you like. - Wick'] }[G.day]; if (m && !G.tut) G.sendMail(m[0], m[1]); },
  hasPerk: k => (G.perks || []).includes(k),
  applyStart(sc, perks) {
    G.scenario = sc; G.perks = perks.slice();
    if (sc === 'pills') { G.upgrades.press = true; G.pills[2] += 12; for (const k in G.lab.stock) G.lab.stock[k] += 2; G.cash = 250; }
    if (sc === 'fence') { for (let i = 0; i < 4; i++) G.stockPlace(makeItem(pick(D.CARTS), { owned: true, stolen: true })); G.rep.cops = -30; G.rep.dock = 30; G.evidence = 25; }
    if (sc === 'rock') { for (const i of [...G.items]) G.remove(i); G.caseSlots = G.caseSlots.map(() => null); G.cash = 0; G.place(makeItem('cart_static', { owned: true, real: 3 }), 'stock'); }
    if (G.hasPerk('coins')) G.cash += 200;
    if (G.hasPerk('human')) G.rep.cops -= 20;
    if (G.hasPerk('lease')) G.rent = Math.floor(G.rent * 1.25);
    if (G.hasPerk('badge')) G.evidence += 25;
  },
  // the identifier: the truth about one thing, a few times a day
  identify(it) {
    if (G.idLeft <= 0) return 'The identifier is out of charge until tomorrow.';
    G.idLeft--; const def = D.ITEMS[it.id], lie = it.fake !== it.real; it.identified = true;
    if (def.type === 'CART' || it.curse) it.curseKnown = true;
    if (lie && !it.owned) G.files++;
    return `${def.name}: really ${G.trueCond(it)[0]}${lie ? ', and the label LIES' : ''}. ${it.curse ? 'CURSED.' : 'No curse.'}`;
  },
  // leaning on a seller with what you have on them
  leanHas(c) { return G.files > 0 || G.matTheirs().some(i => i.stolen); },
  lean(c) { if (!G.matTheirs().some(i => i.stolen)) G.files--; c.buyOffered = true; G.commit('BRIBERY', 20, c); const r = G.rep[c.fac] || 0, a = 60 + (r < 0 ? r / 2 : r / 4) + (c.fromEvent ? 15 : 0); if (G.tut || roll(a)) { c.buyDeal = -20; G.repChange(c.fac, -6); return true; } G.repChange(c.fac, -5); return false; },
  // Big Invoice: finance the buyout
  mortTerms() { const p = G.price(), down = Math.max(100, Math.round(p / 6 / 100) * 100), weeks = 12, L = p - down, interest = Math.floor(L * .5 / 52 * weeks); return { down, weeks, weekly: Math.ceil((L + interest) / weeks) }; },
  signMort() { const t = G.mortTerms(); if (G.cash < t.down) return false; G.cash -= t.down; G.mort = { left: t.weeks, weekly: t.weekly, missed: 0 }; G.arrears = 0; G.sendMail('BIG INVOICE', `Your paper is ours. $${t.weekly} a week for ${t.weeks} weeks, no rent. Miss one and we come for your best stock. Miss three and we come for the unit.`); return true; },
  mortPay() { const m = G.mort; if (G.cash < m.weekly) return false; G.cash -= m.weekly; G.stats.rent += m.weekly; m.left--; if (m.left <= 0) { G.flags.owned = true; G.gameOver('buyout'); } return true; },
  mortMiss() {
    const m = G.mort; m.missed++;
    const take = G.items.filter(i => i.owned && !i.grin).sort((a, b) => G.base(b) - G.base(a)).slice(0, 3);
    G.repoNotice = { items: take.map(i => D.ITEMS[i.id].name), missed: m.missed };
    take.forEach(G.dropFrom);
    if (m.missed >= 3) { G.repoNotice = null; G.gameOver('rent'); }
  },
  sendMail(title, body) { G.mail.unshift({ title, body, day: G.day }); G.unread++; if (G.mail.length > 30) G.mail.pop(); },
  gameOver(id) { G.over = id; G.phase = 'over'; },
  payRent() { const t = G.rent + G.arrears; if (G.cash < t) return false; G.cash -= t; G.stats.rent += t; G.arrears = 0; G.raiseRent(); return true; },
  raiseRent() { if (!G.story.rentFrozen) G.rent = Math.floor(G.rent * G.rules.rentMul); },
  missRent() {
    if (G.grace > 0) { G.grace--; G.arrears += G.rent; G.raiseRent(); return true; }
    G.gameOver('rent'); return false;
  },
  price() { const r = G.rules, p = r.price + Math.max(0, Math.min((G.day - 50) * 50, Math.round(r.price * .4))); return G.story.grinEnd === 'linda' ? Math.floor(p * .75) : p; },
  buyStore() { if (G.cash < G.price()) return false; G.cash -= G.price(); G.flags.owned = true; G.gameOver('buyout'); return true; },
  lindaItem() { return G.items.find(i => i.owned && D.ITEMS[i.id].linda && i.grid !== 'trash'); },
  setPermit(on) { for (const it of G.items) if (D.ITEMS[it.id].illegal) { it.restricted = on; it.curse = on ? 0 : D.ITEMS[it.id].illegal; } },
  buyUpgrade(u) {
    let c = u.cost; if (u.id === 'grace') c = G.graceCost; if (u.id === 'secgrace') c = G.secGraceCost || u.cost;
    if (u.reqRep && G.rep.cops < u.reqRep) return false;
    if (G.cash < c) return false; if (u.id === 'scrub' && G.scrubCd > 0) return false;
    G.cash -= c;
    if (u.id === 'grace') { G.grace++; G.graceCost *= 2; }
    else if (u.id === 'scrub') { G.evidence = 0; G.scrubCd = u.cd; u.cost += 0; }
    else { G.upgrades[u.id] = true; if (u.id === 'permit') G.setPermit(true); }
    return true;
  },
};
})();
