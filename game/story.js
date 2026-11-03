// Scripted visitors. A talk step: { t: line, who: 'carl' optional, choices: [{ t, fn(G) returning optional reply line }] }
(function () {
const D = window.DATA;
const cast = (art, extra) => Object.assign({ art, name: D.CAST[art].name, scripted: true, intent: 'talk', budget: 0 }, extra);

const S = window.STORY = {
  // The story is a list of scenes with a first-possible day. A scene only counts once the person actually reaches your window,
  // so closing early just moves them to tomorrow. Choices write to G.story, and later scenes and the epilogue read it.
  forDay(day, G) {
    const st = G.story, q = [];
    for (const b of S.BEATS) {
      if (q.length >= (day <= 1 ? 3 : 2)) break;
      if (st.seen[b.id] && !b.repeat) continue;
      if (day < b.day || (b.when && !b.when(G, st))) continue;
      const c = b.make(G, st); c.beat = b.id; q.push(c);
    }
    return q;
  },
  reached(G, c) { if (c.beat) { G.story.seen[c.beat] = G.day; const b = S.BEATS.find(x => x.id === c.beat); if (b && b.note) G.story.notes.push({ day: G.day, t: typeof b.note === 'function' ? b.note(G) : b.note }); } },
  hasGrin: G => G.items.some(i => i.grin && i.owned),
  giveGrin(g) { const it = g.makeItem('cart_evil', { curse: 1, real: 2, fake: 0, owned: true, grin: true, curseKnown: true }); if (!g.stockPlace(it)) { g.remove(it); return false; } return true; },
  loseGrin(g) { g.items.filter(i => i.grin).forEach(i => g.remove(i)); },
  // the morning paper
  morning(G) {
    G.news = null; const st = G.story;
    for (const n of [...S.NEWS.filter(x => x.when), ...S.NEWS.filter(x => !x.when)]) { if (G.day < n.day || st.news[n.id] || (n.when && !n.when(G, st))) continue; st.news[n.id] = G.day; G.news = { title: n.title, body: n.body }; break; }
  },
  pressStart(g) { g.story.grinEnd = 'free'; S.loseGrin(g); g.story.rentFrozen = true; g.repChange('upper', -20); g.repChange('food', 10); g.sendMail('PARCEL TRACKING', 'TO: CARL\'S PARENTS. STATUS: STILL IN TRANSIT. ALSO: ELEVEN MEN ARE IN THE FOOD COURT ASKING WHAT YEAR IT IS.'); },
  mercOrder(G) {
    const any = l => l[Math.floor(Math.random() * l.length)], gun = any(D.GUNS), ammo = any(D.AMMO), pay = Math.round((D.ITEMS[gun].v + D.ITEMS[ammo].v) * 1.8), due = G.day + 7;
    const c = G.genClient('gunrunner', { name: 'OFF-DUTY MERC', scripted: true, intent: 'talk', budget: 0 }); c.carry = null; delete c.goods;
    c.talk = [{ t: `Off the clock. I need a build: one ${D.ITEMS[gun].name} and ${D.ITEMS[ammo].name}, here by day ${due}. $${pay} on delivery. Yes or no.`, choices: [
      { t: 'Deal', fn: g => { g.order = { gun, ammo, due, pay }; g.sendMail('ORDER: OFF-DUTY MERC', `One ${D.ITEMS[gun].name}, one ${D.ITEMS[ammo].name}. Day ${due}. $${pay}. Have them in stock. Do not be late.`); return 'Day ' + due + '. Do not make me come looking.'; } },
      { t: 'Not my line', fn: () => 'Your loss. Literally. It was a lot of money.' },
    ] }];
    return c;
  },
  mercBack(G) {
    const o = G.order, find = id => G.items.find(i => i.owned && i.id === id && i.grid !== 'server'), g1 = find(o.gun), a1 = find(o.ammo);
    const c = G.genClient('gunrunner', { name: 'OFF-DUTY MERC', scripted: true, intent: 'talk', budget: 0 }); c.carry = null; delete c.goods;
    const cs = [{ t: 'It is not ready', fn: g => { g.order = null; g.repChange('dock', -10); return 'Then you are a person who says yes and means no. The docks will hear. (-10 Dock)'; } }];
    if (g1 && a1) cs.unshift({ t: `Hand it over: +$${o.pay}`, fn: g => { g.dropFrom(g1); g.dropFrom(a1); g.cash += o.pay; g.stats.sold += o.pay; g.commit('FENCING', 40, { fac: 'dock' }); g.repChange('dock', 5); g.order = null; return 'Clean work. Nobody saw anything, and neither did you.'; } });
    c.talk = [{ t: `Day ${o.due}. My ${D.ITEMS[o.gun].name} and ${D.ITEMS[o.ammo].name}. Where are they?`, choices: cs }];
    return c;
  },
  canDiver(G) {
    const c = G.genClient('regular', { name: 'CAN DIVER', scripted: true, intent: 'talk', budget: 0 }); c.carry = null; delete c.goods; const tr = G.inGrid('trash');
    c.talk = [{ t: tr.length >= 2 ? `Your can. I saw ${tr.length} things in it. Let me have the lot and you get one good thing out of my coat.` : 'I trade for what is in your can. Bin two things or more and I will come back.', choices: tr.length >= 2 ? [
      { t: 'Swap the can', fn: g => { const list = g.inGrid('trash'); list.forEach(g.remove); const it = g.makeItem(g.pick([...D.ODDS, ...D.CARTS]), { owned: true }); if (!g.stockPlace(it)) { g.remove(it); return 'You have no room for it. I keep both. Thanks for the can.'; } return `Here: ${D.ITEMS[it.id].name}. It is in your stock. Nothing in my coat is stolen, that I can prove.`; } },
      { t: 'Leave my can alone', fn: () => 'It is a free mall. It is not. Bye.' },
    ] : undefined }];
    return c;
  },
  // someone pays you for what you know
  stringer(G) {
    const st = G.story, c = G.genClient('tourist', { name: 'COMMITTEE STRINGER', art: 'stringer', scripted: true, intent: 'talk', budget: 0, fac: 'upper' }); c.carry = null; delete c.goods; c.isStringer = true;
    const base = 50 + G.day * 3, asks = [
      { q: 'Who brings you bad labels? I want names.', who: 'dock', pay: base + 40, need: () => G.files > 0, after: g => { g.files--; } },
      { q: 'What do you actually owe Linda? Rent, arrears, the real number.', who: 'upper', pay: base },
      { q: 'When do New Face\'s screens look away from your window?', who: 'cops', pay: base + 30 },
      { q: 'What are the regulars saying at the pretzel stand?', who: 'food', pay: base - 15 },
      { q: 'Who goes to those Thursday meetings behind the pretzels?', who: 'picket', pay: base + 10 },
    ].filter(a => !a.need || a.need());
    let a = asks[(st.stringerN || 0) % asks.length];
    if (S.hasGrin(G) && !st.grinEnd && !st.toldCommittee && (st.stringerN || 0) >= 2) a = { q: 'One question, and I am told to go high. Where is the cart with the little grin?', who: null, pay: 400 + G.day * 5, grin: true };
    st.stringerN = (st.stringerN || 0) + 1; st.stringerDay = G.day;
    const talk = [];
    if (st.liedTo) { const caught = G.roll(40), fine = st.liedTo; st.liedTo = 0; talk.push(caught ? { t: 'What you sold me last time was fiction. We have writers for that.', choices: [{ t: `Refund $${Math.min(fine, G.cash)}`, fn: g => { g.cash -= Math.min(fine, g.cash); g.repChange('upper', -3); return 'Noted. In your file. There is a file.'; } }] } : { t: 'Last time checked out. Good.' }); }
    talk.push({ t: (st.stringerN === 1 ? 'Sequel Committee, research side. I always pay exactly what I promise. ' : 'Me again. Same envelope. ') + a.q, choices: [
      { t: `Tell them: +$${a.pay}`, fn: g => { g.cash += a.pay; if (a.who) g.repChange(a.who, -6); g.commit('BRIBERY', 15); if (a.after) a.after(g); st.informed = (st.informed || 0) + 1; if (a.grin) { st.toldCommittee = true; g.evidence = Math.min(100, g.evidence + 10); } return a.grin ? 'Wonderful. It will test very well.' : 'It helps to know. Nobody saw this. Everybody did.'; } },
      { t: `Make something up: +$${Math.round(a.pay / 2)}`, fn: g => { const p = Math.round(a.pay / 2); g.cash += p; st.liedTo = p; return 'Half now. If it checks out, we never speak of it.'; } },
      { t: 'Send them away', fn: g => { if (a.who) g.repChange(a.who, 2); return 'Of course. I was never here. Please note that I was here.'; } },
    ] });
    c.talk = talk; return c;
  },
  landlord(G) {
    if (G.mort) { const m = G.mort; return cast('linda', { fac: 'upper', isLandlord: true, undismissable: true, talk: [
      { t: `Big Invoice owns your paper, and I collect for them now. I hate it. $${m.weekly}, ${m.left} week${m.left === 1 ? '' : 's'} to go. ${m.missed} missed. Three and you are out.`, choices: [
        { t: `Pay $${m.weekly}`, ok: () => G.cash >= m.weekly, fn: g => { g.mortPay(); return g.over ? 'That is the last one. It is yours. I hate this.' : `${g.mort.left} to go. Shut up.`; } },
        { t: "I can't pay", fn: g => { g.mortMiss(); return g.over ? 'Three. They took the unit. Out.' : 'They already sent the truck. Read your notice.'; } },
      ] } ] }); }
    const pay = G.rent + G.arrears;
    const cs = [
      { t: `Pay $${pay}`, ok: () => G.cash >= pay, fn: g => { g.payRent(); return `Paid. Next week it's $${g.rent}. You're welcome.`; } },
      { t: 'I can\'t pay', fn: g => { const ok = g.missRent(); return ok ? 'Grace used. It goes on your tab, and it still goes up.' : 'Then you are not my problem any more. Out.'; } },
    ];
    const li = G.lindaItem();
    if (li) cs.unshift({ t: 'Give back her ' + D.ITEMS[li.id].name.replace("LINDA'S ", ''), fn: g => { g.remove(li); g.arrears = 0; g.rent = Math.floor(g.rent * g.rules.rentMul); g.repChange('upper', 6); return 'Where did you. No. Do not tell me. This week is free. Shut up.'; } });
    if (G.story.sawStart && S.hasGrin(G) && !G.story.grinEnd) cs.push({ t: 'PRESS START', fn: g => {
      g.story.presses = (g.story.presses || 0) + 1; g.cash += pay; g.payRent();
      if (g.story.presses >= 3 && !g.story.leafyGone) { g.story.leafyGone = true; g.story.notes.push({ day: g.day, t: 'The vines pulled back through the wall. The stall next door is empty. A little sign says BACK SOON.' }); g.sendMail('NEXT DOOR', 'The vines in your back room have gone. The stall next door is empty. There is a little sign. BACK SOON.'); }
      const v = g.items.filter(i => i.owned && !i.grin && i.grid !== 'case').sort((a, b) => g.base(b) - g.base(a))[0];
      if (v) { g.sendMail('STOCK COUNT', `The Grin Cart is warm. Your ${D.ITEMS[v.id].name} is gone. Nobody touched it.`); g.remove(v); }
      return 'Paid. In full. In warm coins. I did not see you do that, and I would like you to stop asking me to not see it.'; } });
    { const t = G.mortTerms(); if (G.cash >= t.down) cs.push({ t: `Big Invoice: $${t.down} down`, fn: g => { g.signMort(); return `Twelve weeks of $${t.weekly}, no rent. Then it is yours. If you miss one, they take your best stock. I did not recommend them. Shut up.`; } }); }
    if (G.cash >= G.price()) cs.unshift({ t: `Buy the store: $${G.price()}`, fn: g => { g.buyStore(); return 'Fine. It\'s yours. I hate this.'; } });
    return cast('linda', { fac: 'upper', isLandlord: true, undismissable: true, talk: [
      { t: `Sunday. You owe me $${pay}.${G.arrears ? ' Including arrears.' : ''} Shut up and pay it.`, choices: cs },
    ] });
  },
  merchant(G) {
    const c = G.genClient('tourist', { name: 'TRAVELING ODDWARE MERCHANT', fac: null, intent: 'trade', want: ['CART', 'ODD', 'PILL'], budget: 300 + G.day * 10, carry: G.goods('junk', 2), line: 'Rent day! Everybody sells on rent day. Show me what you have, then I show you mine.', shape: 'robed', noCurseNow: false });
    c.fac = 'food'; return c;
  },
  inspector(G, fromCase) {
    const personality = G.crime.BRIBERY >= 500 ? 0 : G.rnd(0, 2), fake = () => { G.cash -= G.cash >= 100 ? 50 : 0; G.repChange('cops', -8); };
    return cast('monitor', { fac: 'cops', inspect: true, personality, undismissable: true, fromCase, talk: [
      { t: (fromCase ? 'I can see your display case from the food court, on all nine screens.' : 'Surprise inspection. I said I would. I have it on all nine screens that I said so.') + ' Hands where I can log them.', choices: [
        { t: 'Go ahead', fn: () => 'Thank you.' },
        { t: 'Report an impostor', fn: () => { fake(); return 'I am the real one. That is $50 and a note in your file. We continue.'; } },
      ] },
      personality === 1 ? { t: `Of course, for $${G.bribeCost()} my screens could all be looking at the pretzels.`, choices: [
        { t: `Bribe $${G.bribeCost()}`, ok: () => G.cash >= G.bribeCost(), fn: g => { g.cash -= g.bribeCost(); g.commit('BRIBERY', g.bribeCost()); g.flags.bribed = true; return 'What inspection?'; } },
        { t: 'Go ahead, search', fn: () => 'As you like.' },
      ] } : { t: personality === 2 ? 'Let\'s make this quick. I am not touching your trash.' : 'Every shelf. Every drawer. Stand still.' },
      { run: g => S.runInspect(g, personality, fromCase) },
    ] });
  },
  fakeInspector(G) {   // Leroy: a costume, a real search, and no paperwork behind it
    const id = G.wanted.id;
    return cast('monitor', { fac: 'food', inspect: true, personality: 0, fromCase: false, wantedId: id, talk: [
      { t: 'Surprise inspection. I have it on all eight of my screens. Hands where I can log them.', choices: [
        { t: 'Go ahead', fn: () => 'Good. Very official of you.' },
        { t: 'Report an impostor', fn: g => { const r = g.wanted ? g.wanted.reward : 300; g.cash += r; g.repChange('cops', 5); g.wanted = null; g.flags.leroyCaught = true; return `Two Mall Cops walked him away. His screens were cereal boxes. +$${r}.`; } },
      ] },
      { run: g => { if (g.flags.leroyCaught) { g.flags.leroyCaught = false; return 'New Face left a note: I would like the record to show that I have nine.'; } g.wanted = null; return S.runInspect(g, 0, false, true); } },
    ] });
  },
  runInspect(g, personality, fromCase, fakeInsp) {
    if (g.flags.bribed) { g.flags.bribed = false; return 'Have a compliant day.'; }
    const r = g.inspect(personality, fromCase, fakeInsp);
    if (r.lucky) return 'Your luck held: every screen glitched at once. Clear, I suppose.';
    if (r.arrest) { g.gameOver('jailed'); return r.level === 'critical' ? 'That is an UNSPEAKABLE. In a mall. You are coming with me.' : `That is $${r.found.reduce((s, i) => s + g.base(i), 0)} in fines, and you do not have it. Come along.`; }
    if (r.graced) return `Found ${r.names}. By rights you go to a room. I am using up the one favor you bought. Seized.`;
    if (r.level === 'none') return r.concealed ? 'Clean. The poster\'s crooked, but that\'s not illegal yet.' : fromCase ? 'Clean. I will keep watching that case.' : 'Clean. Disappointing. +3 standing.';
    const names = r.found.slice(0, 3).map(i => D.ITEMS[i.id].name).join(', ') + (r.found.length > 3 ? ` and ${r.found.length - 3} more` : '');
    if (r.fine) return `Found ${names}. Fine: $${r.fine}. Seized.`;
    if (r.level === 'low') return `Found ${names}. Hexed only. Consider this your warning.`;
    return `Found ${names}. Seized. Your standing with us just dropped.`;
  },
  officer(G) {
    const t = G.totalCrime();
    let step;
    if (G.evidence < 95 || t === 0) step = { run: g => { g.evidence = 0; g.repChange('cops', -5); return 'The case fell apart. I will remember this.'; } };
    else if (t < 300) step = { t: `The evidence is complete. ${t} in crime. The fine is $${t}.`, choices: [
      { t: `Pay $${t}`, ok: () => G.cash >= t, fn: g => { g.cash -= t; g.repChange('cops', -10); for (const k in g.crime) g.crime[k] = 0; g.evidence = 0; return 'Paid. Your sheet is clean. For now.'; } },
      { t: 'I can\'t pay', fn: g => { g.gameOver('jailed'); return 'Then you are coming with me.'; } },
    ] };
    else if (t < 1500) step = { run: g => { g.gameOver('jailed'); return `${t} in crime. There is no fine for that. There is a room for that.`; } };
    else step = { run: g => { g.gameOver('sequel'); return 'The Sequel Committee has reviewed your case. You have been discontinued.'; } };
    return cast('monitor', { fac: 'cops', undismissable: true, isOfficer: true, talk: [{ t: 'All my screens agree. It\'s time.' }, step] });
  },
};
window.ENDINGS = {
  buyout: ['SOLD. TO THE GREEN IDIOT.', 'You own the hole now. Linda signed with a pen she then threw away. The rent stops.', true],
  rent: ['EVICTED', 'Linda had the locks changed while you were still inside. The shop is a vape kiosk by Tuesday.'],
  jailed: ['CONTAINED', 'New Face walked you up the down escalator. There is a room in the Mall of the Future with no store in it.'],
  sequel: ['DISCONTINUED', 'The Sequel Committee cancelled you. They are developing a version that tests better.'],
  mob: ['FOOD COURT JUSTICE', 'The regulars came for you with trays. There is no appeal in the food court.'],
  hitman: ['A QUIET CANCELLATION', 'The Upper Deck does not shout. A nice man came down the escalator, which is against the rules.'],
  bomb: ['GENERAL STRIKE', 'The package on your counter was not for your parents.'],
};

const has = S.hasGrin, say = (who, extra) => cast(who, extra);
S.LOGS = [
  { day: 3, t: "DAY 1. Bought a cartridge shop from a man who ran away from it. Great price. Rent seems fine. Linda seems nice. - DENNIS" },
  { day: 8, t: "DAY 30. Bought a cart off a ghost. Little grin on the label. Sold it Tuesday. It was back in my stock Wednesday. Sold it again. Good margins." },
  { day: 14, t: "DAY 44. Short on rent. Put the grin cart in the beige tower. Screen says PRESS START TO PAY RENT. Ha ha. Pressed start." },
  { day: 20, t: "DAY 45. Rent paid. I did not pay it. My good amp is gone. Linda took the money and looked at the wall the whole time." },
  { day: 26, t: "DAY 59. Pressed it four times now. The screen has a little man on it. He asked how the shop is doing. I said fine. He said he ran away too." },
  { day: 32, t: "DAY 60. It does not stop at amps. It wants a human man. If you find this and you are a human man, do not press start. I am going to go ahead and press s" },
];
S.BEATS = [
  // ---- week one: everybody introduces themselves
  { id: 'linda1', day: 1, note: 'Rent every Sunday. It rises every Sunday. Or buy the unit.', make: G => say('linda', { fac: 'upper', talk: [
    { t: 'CEO Linda. I run the Mall of the Future. You rent a hole in it.' },
    { who: 'carl', t: 'Hi. I am a normal human man and I would like a normal amount of time to pay.' },
    { t: 'Shut up, green idiot. Rent is every Sunday. It rises every Sunday.' },
    { t: 'Or buy this unit outright. $' + G.price() + '. Then I never have to look at you. Everyone wins.' },
    { t: 'Press {yellow}NEXT CUSTOMER{/} to serve people. Pull your {yellow}SHUTTER{/} when you are done.' },
  ] }) },
  { id: 'scuff1', day: 1, make: G => say('kid', { intent: 'buy', want: ['CART'], fac: 'food', budget: 120, noCurseNow: true,
    line: 'Hi! Is there a bathroom? No? Okay. Do you have something good? I have $120. Drag a cart from your stock or your case onto the counter.' }) },
  { id: 'ghost1', day: 1, note: 'A ghost sold, or tried to sell, me a cart with a grin on it.', make: G => say('ghost', { intent: 'sell', fac: 'dock', carry: [G.makeItem('cart_evil', { curse: 1, real: 2, fake: 0, grin: true })],
    line: 'BEHOLD! A cartridge! Mint, it says so! It only screams a {pink}little{/}. Name a price, I owe alimony.' }) },
  { id: 'relay1', day: 2, make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'New Face. I came here to fix a timeline and Linda gave me a job instead. The Mall Cops\' screens, Containment Division. I saw your window on nine of them.' },
    { t: 'Those screens also carry {yellow}CrackyReads{/}. The show stays on the air as long as I keep watching for her. That is the arrangement.' },
    { t: 'Selling a cursed cart books a {red}crime{/}. Crime builds {red}evidence{/}. At 100 evidence I come in person.' },
    { t: 'Fine under 300 crime. Above that, you go to a room. I also do surprise inspections.' },
    { who: 'carl', t: 'Nobody clip that.' },
    { t: 'Test what you buy on your beige tower. I can see that too.' },
  ] }) },
  { id: 'archive1', day: 3, make: G => say('robed', { fac: 'upper', talk: [
    { t: 'I am Yoko. I keep CrackyReads running, and I catalog what comes through this mall that nobody should play. Your poster is hung crooked, by the way.' },
    { t: 'People used to keep things behind that poster. {yellow}Things New Face would rather not count.{/}' },
    { t: 'Keep your case full. A full case brings people like me in off the walkway.' },
  ] }) },
  { id: 'tiny1', day: 4, make: G => say('tiny', { intent: 'buy', want: ['CART', 'PILL'], fac: 'food', budget: 45, noCurseNow: false,
    line: 'boo. my dad says you buy his stuff. i have $45. i want one he hasn\'t touched.' }) },
  { id: 'ghost2', day: 5, note: 'Spooky Ghost asked for a loan. Alimony.', make: G => say('ghost', { fac: 'dock', talk: [
    { t: 'CARL. Old friend. The spooky alimony is due and the court accepts only {pink}legal tender{/}.' },
    { t: 'Lend me $50 and I will repay you {green}four-fold{/} in, oh, twenty-five days. Ghost\'s honor.', choices: [
      { t: 'Lend $50', ok: () => G.cash >= 50, fn: g => { g.cash -= 50; g.ghostLoan = 50; g.ghostLoanDay = g.day; return 'A prince! A green prince! I will haunt you only gently.'; } },
      { t: 'Lend $150', ok: () => G.cash >= 150, fn: g => { g.cash -= 150; g.ghostLoan = 150; g.ghostLoanDay = g.day; return 'Do not tell my ex how much.'; } },
      { t: 'No', fn: () => 'Then I shall float on. Sadly. With a lot of eye contact.' },
    ] },
  ] }) },
  { id: 'archive2', day: 6, note: 'The last tenant was called Dennis. He "ran". There is a broken handheld out in the dumpster.', make: G => say('robed', { fac: 'upper', talk: [
    { t: 'A question for my records. Did the last tenant leave a forwarding address?' },
    { who: 'carl', t: 'He ran away from the shop. I saw him. He was very fast.' },
    { t: 'That was not the last tenant. That was the man who sold it to you. {yellow}Dennis{/} had it before him. Nobody saw Dennis go.' },
    { t: 'He kept a log on a handheld. He threw things out the back. {yellow}Look in the dumpster{/}, through your A.S.S. door.' },
  ] }) },
  // ---- the cart comes back. It always comes back.
  { id: 'grinback', day: 9, repeat: true, when: (G, st) => !has(G) && !st.grinEnd && G.day - (st.seen.grinback || 0) >= 4, make: (G, st) => say('ghost', { fac: 'dock', talk: [
    { t: st.seen.grinback ? 'Me again. It was in my sheet this morning. I have checked the terms and I do not have to keep it.' : 'Remember the little grin? I sold it twice since. It keeps being in my sheet when I wake up. I do not sleep. It is a figure of speech.' },
    { run: g => S.giveGrin(g) ? 'It is in your stock now. No charge. Please stop looking at me like that. {pink}Test it, if you want. I never did.{/}' : 'You have no room for it. I will come back. It will make me.' },
  ] }) },
  { id: 'scuff2', day: 8, make: G => say('kid', { fac: 'food', talk: [
    { t: 'Hey Mr. Carl? The arcade guy says old cart labels lie. Like the sticker says Mint but it\'s chewed.' },
    { t: 'You can tell by looking, sometimes. And if you call out a fake, they knock the price down.' },
    { t: 'But if you\'re wrong they get real mad. So. Be right.' },
    { who: 'carl', t: 'I am right about most things. I am a human man.' },
  ] }) },
  { id: 'tiny2', day: 11, make: G => say('tiny', { fac: 'food', talk: [
    { t: 'my dad sleeps in the vending machine by the dock now. he says it\'s for the view.' },
    { t: 'i go to mom\'s on weekends. mom is a coat rack. she\'s nice.' },
    { who: 'carl', t: 'I have parents. They are getting a parcel.' },
    { t: 'ok.' },
  ] }) },
  { id: 'archive3', day: 12, make: G => say('robed', { intent: 'buy', want: ['CART'], fac: 'upper', budget: 400, checks: true, noCurseNow: false,
    line: 'I will pay well for a cart in your case. I read every label. Do not insult me with a sticker.' }) },
  { id: 'relay2', day: 14, note: 'New Face says nobody has ever been seen leaving Unit 9.', make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'Nothing official. The barcode reader on your counter prints labels. I know what you could do with it. {red}I am choosing to know.{/}' },
    { t: 'I pulled the footage on Unit 9. Eleven tenants. All paid up. {yellow}None of them on camera leaving.{/}' },
    { who: 'carl', t: 'One ran away. I saw him.' },
    { t: 'That one, yes. He had the sense to sell before he pressed anything. Pressed what, I could not tell you. It is outside my screens.' },
  ] }) },
  // ---- Pee Kid grows up
  { id: 'scuff3', day: 15, note: 'The arcade closed. Pee Kid asked me for a job.', make: G => say('kid', { fac: 'food', talk: [
    { t: 'The arcade\'s a vape kiosk now. They kept the claw machine. It has vapes in it.' },
    { t: 'I could hand out flyers for you? I\'d bring people in. $8 a day. I\'m really fast at flyers.', choices: [
      { t: 'Hire Pee Kid: $8/day', fn: g => { g.story.scuff = 'hired'; g.repChange('food', 5); return 'Yes! Okay! I made these already. They say CARTS and then an arrow.'; } },
      { t: 'Can\'t afford it', fn: g => { g.story.scuff = 'no'; return 'That\'s okay. The pretzel guy said maybe. He said it very quietly.'; } },
    ] },
  ] }) },
  { id: 'relay3', day: 17, note: 'New Face is looking for a flip phone he remembers and has never seen. His screens went pink.', make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'Unrelated to anything. Has a flip phone crossed your counter? Quilted case. Possibly one unread message.' },
    { who: 'carl', t: 'Is it evidence?' },
    { t: 'It is. Of a kind. I remember it. That is not the same as having been there. Disregard that my screens have gone this color.' },
  ] }) },
  { id: 'ghost3', day: 18, make: G => say('ghost', { intent: 'trade', want: ['CURSED', 'CART'], fac: 'dock', budget: 300,
    carry: G.goods('cursed', 1), line: 'A trade, between professionals! You give me something terrible, I give you something worse.' }) },
  { id: 'tiny3', day: 21, make: G => say('tiny', { fac: 'food', talk: [
    { t: 'my dad says he paid you back. did he.' },
    { who: 'carl', t: G.ghostLoan ? 'Not yet.' : 'I do not think that is the question you want to ask.' },
    { t: 'ok. he paid me in compliments too.' },
  ] }) },
  { id: 'scuff4', day: 24, when: (G, st) => st.scuff === 'hired', make: G => say('kid', { fac: 'food', talk: [
    { t: 'Mr. Carl, a lady asked if I work for the green guy. I said you\'re a human man like you told me to.' },
    { t: 'She said "of course he is" and wrote something down for a long time.' },
    { who: 'carl', t: 'Good job. Here is a pretzel. It is from the dumpster.' },
  ] }) },
  // ---- custody
  { id: 'ghost4', day: 25, note: 'Spooky Ghost asked me to speak at the custody hearing.', make: G => say('ghost', { fac: 'dock', talk: [
    { t: 'No show today. I have a hearing. Tiny. Whether I keep the weekdays.' },
    { t: 'They want someone to say I am a {pink}stable presence{/}. I am a sheet, Carl. But you have a lease. That counts for a lot, downstairs.', choices: [
      { t: 'I\'ll speak for you', fn: g => { g.story.custody = 'helped'; g.repChange('dock', 10); g.repChange('cops', -3); return 'I would cry, but it stains. Thank you. Wear something. A shirt.'; } },
      { t: 'I have a shop to run', fn: g => { g.story.custody = 'no'; return 'Of course you do. Yes. It is a very nice shop.'; } },
    ] },
  ] }) },
  { id: 'archive4', day: 27, when: (G, st) => !st.grinEnd, note: 'Yoko knows about the grin. She has a shelf ready.', make: G => say('robed', { fac: 'upper', talk: [
    { t: 'Helping you does not mean doing what you say. I have been cataloging your unit for a long time. I have a shelf with a gap in it the exact size of one cartridge.' },
    { t: 'It has a little grin on the label. Keep it safe. Do not put it in the tower. {yellow}Do not press anything it asks you to press.{/}' },
  ] }) },
  { id: 'linda2', day: 28, note: 'Linda is missing some things. A badge, a bag.', make: G => say('linda', { fac: 'upper', talk: [
    { t: 'Four weeks. Most people in that hole last two. I am not impressed; I am recalculating.' },
    { t: 'Also, things of mine have gone missing. A badge, a bag. If they cross your counter, I will be generous on a Sunday. Once each.' },
    { t: 'If this becomes a success I will need to take credit. Do not make me do paperwork.' },
  ] }) },
  { id: 'relay4', day: 31, note: 'The unread message on Linda\'s phone is from Spooky Ghost: BACK SUNDAY. He never came back.', make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'The message on the flip phone is from Spooky Ghost. A heart and two words: BACK SUNDAY. He sent it from the road, before she was Linda. I remember him sending it. I have never met him.' },
    { t: 'She has never read it. She does not go in on Sundays. I can see everything, and that is the problem with my job.', choices: [
      { t: 'Delete it', fn: g => { g.story.relay = 'moved'; return 'Yes. Correct. Off all nine screens. I will still remember it. Somebody who was me did.'; } },
      { t: 'Send it again', fn: g => { g.story.relay = 'sent'; g.repChange('cops', 5); return 'A second heart. That is reckless. I have sent it. I have also fined myself.'; } },
    ] },
  ] }) },
  { id: 'ghost5', day: 32, when: (G, st) => !!st.custody, make: (G, st) => say('tiny', { fac: 'food', talk: st.custody === 'helped' ? [
    { t: 'i get dad on weekdays. the judge said he is stable. he isn\'t. he did a bow.' },
    { t: 'here. this is for the shop. it\'s from him. it\'s from me, i paid for it.' },
    { run: g => { g.cash += 75; return 'it\'s $75. it\'s damp.'; } },
  ] : [
    { t: 'i\'m at mom\'s all week now. she doesn\'t say anything. she\'s very tall.' },
    { t: 'it\'s ok. you had a shop to run. dad told me.' },
  ] }) },
  { id: 'scuff5', day: 33, when: (G, st) => st.scuff !== undefined, make: (G, st) => say('kid', { fac: 'food', talk: st.scuff === 'hired' ? [
    { t: 'Mr. Carl? Everybody at school says you\'re an alien. I told them you have a lease.' },
    { who: 'carl', t: 'I am a normal human man.' },
    { t: 'I know. I just think if you weren\'t, that would also be okay. Anyway here\'s your flyers.' },
  ] : [
    { t: 'I got the pretzel job. It\'s fine. I\'m not allowed to say the word "salt".' },
    { t: 'I bought a cart with my first pay. Not from you. No offense. It\'s just you looked busy.' },
  ] }) },
  // ---- the reveals, in order, before anyone makes an offer. Every path gets them, including PRESS START.
  { id: 'ghost6', day: 29, note: 'The grin on the cart is Spooky Ghost\'s grin. He and Face built it to take him back to before he met Linda.', make: (G, st) => say('ghost', { fac: 'dock', talk: [
    { t: st.grinEnd === 'free' ? 'You pressed it enough. It opened. Do you know what you opened? Look at the grin on the label. Now look at me. Fangs and all. I posed.' : 'No show. Look at the little grin on that cart, Carl. Now look at me. Fangs and all. It is a very good likeness. I posed.' },
    { t: 'Face and I built a way back. I wanted one Monday: the one where I never meet her. She saw us coming. {pink}We landed in the eighties department, and the machine landed in Unit 9.{/}' },
    { who: 'carl', t: 'You sold me your time machine.' },
    { t: 'I owe alimony! To her! The first ex-wife is your landlord. It is the worst magic trick I have ever done, and I cannot stop doing it.' },
  ] }) },
  { id: 'linda3', day: 30, when: (G, st) => st.seen.ghost6, note: 'Linda caught the machine. Rent rises past what anyone can pay so someone presses start. She never goes in on Sundays: he left on a Sunday.', make: (G, st) => say('linda', { fac: 'upper', talk: [
    { t: 'The ghost talked. Of course he talked. He cannot do anything else.' },
    { t: 'Yes, I caught his machine. Why do you think rent rises every Sunday? It has to rise {red}past{/} what a person can pay. That is the whole design.' },
    { t: st.grinEnd === 'free' ? 'Then you pressed it until it opened, and eleven men walked into my food court. Nobody pays for Unit 9 now. I noticed.' : 'Somebody short on rent presses start. It takes their Mondays, and the Mall gets paid.' },
    { t: 'I never go in on Sundays. He left on a Sunday. Shut up. I did not say that.' },
  ] }) },
  { id: 'relay5', day: 31, when: (G, st) => st.seen.linda3, note: 'The little man in the cart is what is left of Old Face. He got me out of Nevada.', make: (G, st) => say('monitor', { fac: 'cops', talk: [
    { t: st.sawStart ? 'The little man on your tower. Four shades of green. I can see him now.' : 'There is a little man in that cart. Dennis saw him. Vane has him on their wall at night.' },
    { t: '{yellow}That is Old Face.{/} What is left of him, after Linda tried to take the system. Face built the machine. Part of him is still running it.' },
    { t: 'I have his memories. A small green person coming out from under Nevada, and someone holding a door. I remember holding it. I was never there.' },
    { who: 'carl', t: 'A human man came out of Nevada, with no help. I have no further comment.' },
    { t: 'He asks how the shop is doing because he wants to know.' },
  ] }) },
  // ---- the cart comes due: three people want it
  { id: 'offerA', day: 34, when: (G, st) => has(G) && !st.grinEnd && st.seen.ghost6 && st.seen.linda3 && st.seen.relay5, note: 'Yoko offered $900 for the Grin Cart.', make: G => say('robed', { fac: 'upper', talk: [
    { t: 'It is time. I know what is in that cartridge. Eleven tenants. I would keep them on a shelf, in the dark, in perfect condition, forever. That is the kindest thing I know how to do.' },
    { t: '$900. It would never be sold again. It would never be played.', choices: [
      { t: 'Sell it: $900', fn: g => { g.story.grinEnd = 'archive'; S.loseGrin(g); g.cash += 900; return 'Thank you. I will label it correctly. No one has ever done that for them.'; } },
      { t: 'Not yet', fn: () => 'I will wait. It is most of what I do.' },
    ] },
  ] }) },
  { id: 'offerR', day: 36, when: (G, st) => has(G) && !st.grinEnd && st.seen.offerA, note: 'New Face offered to clear my sheet for the Grin Cart.', make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'I finally found what my screens could not see. It is in your stock. It is smiling at camera four.' },
    { t: 'Hand it in as evidence. I wipe your sheet. All of it. Eleven missing persons, closed, with no one found, in a box, in a room.', choices: [
      { t: 'Hand it in', fn: g => { g.story.grinEnd = 'relay'; S.loseGrin(g); for (const k in g.crime) g.crime[k] = 0; g.evidence = 0; g.repChange('cops', 15); return 'Case closed. It is the worst case I have ever closed. Have a compliant day.'; } },
      { t: 'Not yet', fn: () => 'I will keep watching. You knew that.' },
    ] },
  ] }) },
  { id: 'offerL', day: 38, when: (G, st) => has(G) && !st.grinEnd && st.seen.offerR, note: 'Linda wants the cart back, to put in the next hole.', make: G => say('linda', { fac: 'upper', talk: [
    { t: 'Give it here. You know what it is now. Everybody made sure you knew.' },
    { t: 'Give it back and I put it in the next hole. You get a quarter off the buyout, and you never think about this. Shut up. It is a good offer.', choices: [
      { t: 'Give it to Linda', fn: g => { g.story.grinEnd = 'linda'; S.loseGrin(g); g.repChange('upper', 15); return 'Good. There is a new tenant coming to Unit 14. He seems nice. Do not wave.'; } },
      { t: 'No', fn: g => { g.story.lindaRefused = true; g.repChange('upper', -5); return 'Then I hope you can keep paying. You cannot. See you Sunday.'; } },
    ] },
  ] }) },
  // ---- one story: the trap, the show, and who is really on the screen
  { id: 'stream1', day: 10, note: 'CrackyReads goes out from inside the Mall. It stays on the air only while Linda gets her ads.', make: G => say('monitor', { fac: 'cops', talk: [
    { t: 'Off the record, which is impossible here. CrackyReads needs a sponsor this week, or Linda takes the show off the air. And I live in that system.' },
    { who: 'carl', t: 'Am I on it right now?' },
    { t: 'You are on it most days. It does well. $40 and I read your shop on the air.', choices: [
      { t: 'Sponsor the show: $40', ok: () => G.cash >= 40, fn: g => { g.cash -= 40; g.story.sponsor = true; g.repChange('food', 6); return 'CrackyReads is brought to you by Unit 9. Unit 9: it is a shop. I will workshop that.'; } },
      { t: 'Nobody clip that', fn: () => 'Somebody clipped that.' },
    ] },
  ] }) },
  { id: 'stream2', day: 22, note: 'I keep CrackyReads on in the shop. There is a reason. It is a normal reason.', make: G => say('kid', { fac: 'food', talk: [
    { t: 'Mr. Carl? Why do you always have CrackyReads on? You never look at it.' },
    { who: 'carl', t: 'It is not for me to look at. It is so I can be looked at.' },
    { t: 'By who?' },
    { who: 'carl', t: 'Two specific people. They could be scrolling. They are getting a parcel.' },
    { t: 'Okay. Also, is there a bathroom?' },
  ] }) },
  // ---- Pat: eleven years in the food court, saving for one cartridge
  { id: 'pat1', day: 3, note: 'Pat from the food court comes to my counter because nobody here asks them for extra salt.', make: G => say('pat', { fac: 'food', talk: [
    { t: 'I\'m on break. I\'m just going to stand here. Nobody asks me for extra salt over here.' },
    { who: 'carl', t: 'That tray has food on it.' },
    { t: 'It\'s not for anyone. The order got called. They never came back. That was a while ago.' },
    { t: 'How much is a cartridge? Don\'t say. I\'m saving up.' },
  ] }) },
  { id: 'pat2', day: 12, note: 'Pat is saving for one cartridge, a few dollars at a time. I am holding it for them.', make: G => say('pat', { fac: 'food', talk: [
    { t: 'Eleven years. My name tag went blank. I only found out when somebody read it.' },
    { t: 'Could you hold this? It\'s $12. If I keep it I\'ll spend it on the vending machine. It\'s for a cartridge.', choices: [
      { t: 'Hold it for Pat', fn: g => { g.cash += 12; g.story.patHeld = 12; return 'Okay. Don\'t tell me how much more it is.'; } },
      { t: 'Keep your money', fn: () => 'Yeah. Probably smart. Okay.' },
    ] },
  ] }) },
  { id: 'pat3', day: 24, make: (G, st) => { const cart = G.items.filter(i => i.owned && !i.grin && !i.curse && D.ITEMS[i.id].type === 'CART' && ['stock', 'stock2'].includes(i.grid)).sort((a, b) => G.base(a) - G.base(b))[0]; return say('pat', { fac: 'food', talk: [
    { t: st.patHeld ? `Today's the day. You've got my $${st.patHeld}, and I brought ${st.patHeld + 8} more. Which one can I have?` : 'Today\'s the day. I brought $20. Which one can I have?', choices: [
      { t: cart ? "Sell Pat your cheapest cart" : "No clean carts in stock", ok: () => !!cart, fn: g => { g.dropFrom(cart); g.cash += st.patHeld ? 8 : 20; st.patHeld = 0; st.patCart = true; return 'This one. Okay. I\'m going to go look at it for a while.'; } },
      { t: 'Not today', fn: () => 'That\'s fine. I\'ll be on break again. I\'m always on break again.' },
    ] },
  ] }); } },
  { id: 'pat4', day: 27, when: (G, st) => st.patCart, note: 'Pat\'s cartridge did not boot. They thanked me. They keep it on the tray.', make: G => say('pat', { fac: 'food', talk: [
    { t: 'It didn\'t boot.' },
    { who: 'carl', t: 'I do not do returns. I am a normal human man with a policy.' },
    { t: 'No, I know. Thank you. I keep it on the tray now. It looks good next to the cup.' },
  ] }) },
  { id: 'pat5', day: 38, when: (G, st) => st.seen.pat1 && st.seen.dennis1, note: 'The order on Pat\'s tray was for Dennis. Eleven years. Pat gave it to him.', make: G => say('pat', { fac: 'food', talk: [
    { t: 'That guy Dennis came to the counter. Asked if I knew how his shop was doing.' },
    { t: 'The order on my tray. The one nobody came back for. It has a name on the receipt. It says DENNIS.' },
    { t: 'Eleven years. I gave it to him. It was cold. He said thanks anyway. I know how that goes.' },
  ] }) },
  // ---- the cart dealer: the grin has been through his coat before
  { id: 'dealer1', day: 20, note: 'The cart dealer has bought and sold the Grin Cart before. It always finds its way back to Unit 9.', make: G => say('dealer', { fac: 'food', talk: [
    { t: 'Psst. You have the one with the little grin. I can tell. You have the look.' },
    { t: 'I have bought that cart nine times. Sold it nine times. It is never in my coat in the morning. It is always back in Unit 9.' },
    { who: 'carl', t: 'Why do you keep buying it?' },
    { t: 'Margins. Also it asks how my business is doing, and nobody else asks.' },
  ] }) },
  // ---- Vane: came down the escalator once, by accident
  { id: 'vane1', day: 10, make: G => say('vane', { intent: 'buy', want: ['CART'], fac: 'upper', budget: 500, checks: true, noCurseNow: true,
    line: 'I came down the escalator by accident. Vane. I am here to save what is in your case from people like you. Show me a cart. I read every label.' }) },
  { id: 'vane2', day: 26, note: 'Vane owns hundreds of carts and has never played one. One of them has started playing itself.', make: G => say('vane', { fac: 'upper', talk: [
    { t: 'A dealer once sold my family a fake. I found out in public. That is what the magnifier is for. No, I will not shake your hand.' },
    { who: 'carl', t: 'Do you play them?' },
    { t: 'I own hundreds. I have never played one. Playing is how things get ruined.' },
    { t: 'One of them has started playing itself. It is on my wall at night. A little man keeps asking how my collection is doing.' },
  ] }) },
  { id: 'vane3', day: 35, when: (G, st) => st.seen.vane2, note: 'Vane sold me the cart that plays itself.', make: G => say('vane', { fac: 'upper', talk: [
    { t: 'It is still playing. I have not slept. You people take anything. $60, and it leaves my house tonight.', choices: [
      { t: 'Take it: +$60', fn: g => { const it = g.makeItem('cart_static', { owned: true, curse: 1, real: 3 }); if (!g.stockPlace(it)) { g.remove(it); return 'You have no room. Of course you have no room.'; } g.cash += 60; g.repChange('upper', 4); return 'Do not tell me if it stops.'; } },
      { t: 'Ask who else it talks to', fn: g => { g.repChange('upper', -2); return 'It asked about Unit 9. By name. I would like you to leave my sight, and I came to you.'; } },
    ] },
  ] }) },
  // ---- Wick: forty years, eleven clean-outs. Keeps talking only if you keep paying.
  { id: 'wick1', day: 4, note: 'Wick empties the can. Forty years. Has cleaned out Unit 9 eleven times.', make: G => say('wick', { fac: 'dock', talk: [
    { t: 'I do your can. Forty years I\'ve done this can. Pay for the {yellow}janitor{/} at closing, or don\'t. The can doesn\'t mind.' },
    { who: 'carl', t: 'Did you know the last tenant?' },
    { t: 'Cleaned this unit out eleven times. I never ask where they went. I ask if they left a deposit.' },
    { t: 'Did you leave a deposit?' },
  ] }) },
  { id: 'wickback', day: 10, repeat: true, when: (G, st) => st.wickItem && !st.wickCold && st.janStreak >= 3 && G.day - (st.seen.wickback || 0) >= 5, make: (G, st) => {
    const n = st.wickN || 0, f = st.wickItem || { id: 'odd_loose', real: 2, fake: 2 }, name = D.ITEMS[f.id].name;
    const warn = ['Don\'t put anything that smiles in that beige tower.', 'Rent only goes the one way. I\'ve read a lot of those notices. They come out of a lot of cans.', 'Eleven clean-outs. Never found a body. Never found a deposit. Found a lot of amps.', 'That Sister saves chairs for everybody. I\'ve moved those chairs. Some are warm.', 'Somebody\'s going to ask you to press something. It\'s always somebody nice.'][n % 5];
    return say('wick', { fac: 'dock', talk: [
      { t: `Found your ${name} in the can. Still good. People throw out all sorts when they think they're leaving.` },
      { run: g => { const it = g.makeItem(f.id, { owned: true, real: f.real, fake: f.fake }); g.story.wickItem = null; g.story.wickN = n + 1; if (!g.stockPlace(it)) { g.remove(it); return 'No room on your shelf. It\'s back in the can then. Not my can to argue with.'; } return 'It\'s in your stock.'; } },
      { t: warn },
    ] });
  } },
  { id: 'wickcold', day: 8, when: (G, st) => st.seen.wick1 && st.janSkip >= 3 && !st.wickCold, note: 'I stopped paying for the janitor. Wick stopped talking to me.', make: G => say('wick', { fac: 'dock', talk: [
    { who: 'carl', t: 'Hello. You have not been doing my can.' },
    { t: '...' },
    { who: 'carl', t: 'I am a paying customer. Generally.' },
    { run: g => { g.story.wickCold = true; return '...'; } },
  ] }) },
  // ---- Leafy: next door, the only thing in the mall still growing
  { id: 'leafy1', day: 7, note: 'Leafy runs the plant and repair stall next door. The vines in my back room are theirs.', make: G => say('leafy', { fac: 'food', talk: [
    { t: 'Hi! Leafy, from next door. Plants and cartridge repair. I am also why there are vines in your back room. They came through a crack. They didn\'t ask. Sorry!' },
    { who: 'carl', t: 'Hello, neighbor. I am a normal human man.' },
    { t: 'Sure you are! Love the skin. Bring me junk from the Lot and I\'ll fix your carts. You\'re the first new face here who didn\'t try to sell me a loan.' },
    { t: 'Oh, and wave! I\'m live. There are six of them. Say hi to Gary.' },
    { who: 'carl', t: 'Nobody clip that.' },
  ] }) },
  { id: 'leafyswap', day: 13, repeat: true, when: (G, st) => st.seen.leafy1 && !st.leafyGone && !st.grinEnd && G.day - (st.seen.leafyswap || 0) >= 6, make: (G, st) => {
    const gossip = ['Pee Kid asked Linda who pays for the flyers. In front of people. Clear little voice.', 'New Face\'s screens went pink on Tuesday. I got it on stream. One viewer noticed. Hi Gary.', 'Linda never goes in on Sundays. Eleven years of footage. Not one Sunday.', 'The ghost comes by to look at the ferns. He says they\'re the only thing here that doesn\'t want anything.'][(st.leafyN || 0) % 4];
    const junk = G.items.find(i => i.owned && D.ITEMS[i.id].type === 'JUNK' && i.grid !== 'trash'), cart = G.items.filter(i => i.owned && !i.grin && D.ITEMS[i.id].type === 'CART' && i.real > 0 && i.grid !== 'case').sort((a, b) => b.real - a.real)[0];
    return say('leafy', { fac: 'food', talk: [
      { t: gossip },
      { t: 'Got any junk off the Lot? I\'ll swap you. One piece of garbage, one cart fixed up a whole grade.', choices: [
        { t: 'Swap: fix my cart', ok: () => !!(junk && cart), fn: g => { g.story.leafyN = (g.story.leafyN || 0) + 1; g.remove(junk); cart.real--; if (cart.fake > cart.real) cart.fake = cart.real; g.repChange('food', 2); return `Done. Your ${D.ITEMS[cart.id].name} works better now. I also put a tiny bit of moss in it. Don't worry about the moss.`; } },
        { t: 'Not today', fn: g => { g.story.leafyN = (g.story.leafyN || 0) + 1; return 'No worries. The vine says hi. It doesn\'t, it\'s a vine.'; } },
      ] },
    ] });
  } },
  // ---- Sister Save-State: the cart is a door
  { id: 'sister1', day: 16, note: 'Sister Save-State says the Grin Cart is a door. She has saved me a chair.', make: G => say('sister', { fac: 'picket', talk: [
    { t: 'There you are! Oh, it is so good to see you. I am Sister Save-State. We meet Thursdays behind the pretzels.' },
    { t: 'We have a chair saved for you. We have saved it at every meeting. The little grin is not a curse, friend. {pink}It is a door.{/}' },
    { who: 'carl', t: 'I have not told you my name.' },
    { t: 'No! Isn\'t that wonderful?', choices: [
      { t: 'I\'ll sit in the chair', fn: g => { g.story.sister = 'sat'; g.cash += 60; return 'We passed the cartridge around for you. Sixty dollars! Everyone was so happy you came. You did not leave the shop. That is fine.'; } },
      { t: 'I have a shop to run', fn: g => { g.story.sister = 'no'; return 'Of course you do! We will keep it warm.'; } },
    ] },
  ] }) },
  { id: 'sister2', day: 23, make: G => say('sister', { intent: 'buy', want: ['CURSED'], fac: 'picket', budget: 600, noCurseNow: false,
    line: 'Friend! We need vessels. Anything that hums, anything that screams a little. {pink}I pay very well for cursed stock.{/} Show me.' }) },
  { id: 'sister3', day: 30, when: (G, st) => !st.grinEnd, note: 'Sister Save-State keeps telling me to PRESS START.', make: (G, st) => say('sister', { fac: 'picket', talk: [
    { t: 'You look tired, friend! Sunday is coming. There is an easy way through Sunday. The beige tower knows it.' },
    { t: st.presses ? 'You have already touched the door. Didn\'t it open so nicely? {pink}PRESS START.{/} Everyone is waiting.' : 'Put the little grin in the tower and read the screen. {pink}PRESS START.{/} That is all we have ever asked of anybody.' },
  ] }) },
  { id: 'sister4', day: 21, when: (G, st) => st.presses >= 3, note: 'They have started calling me Dennis.', make: G => say('sister', { fac: 'picket', talk: [
    { t: 'Dennis! You came! Oh, everyone, it is Dennis!' },
    { who: 'carl', t: 'I am Carl. I am a normal human man.' },
    { t: 'Of course you are, Dennis. Your chair is right here. Your name is on it now. We wrote it on for you.' },
  ] }) },
  // ---- week five: Dennis at the window, then Leafy's footage
  { id: 'dennis1', day: 29, when: (G, st) => st.grinEnd !== 'free', note: 'Dennis came to the window. He asked why I am in his shop. He thinks it is his first week.', make: G => say('dennis', { fac: 'food', talk: [
    { t: 'Hi! Sorry, who are you? Why are you in my shop?' },
    { who: 'carl', t: 'This is my shop. I have a lease.' },
    { t: 'Ha! No, I bought it Monday. Great price. Rent seems fine. Linda seems nice. It\'s my first week.' },
    { who: 'carl', t: 'What is on your name tag?' },
    { t: 'Oh, that little guy? Don\'t know. Won\'t come off. Listen, if a ghost sells you a cart with a grin on it, {yellow}don\'t put it in the tower{/}. I don\'t know why I know that. Good luck with your shop! With my shop.' },
  ] }) },
  { id: 'leafy2', day: 31, when: (G, st) => !st.leafyGone && st.seen.leafy1, note: 'Leafy has Dennis on an old stream, walking into Unit 9 and never coming out. There is a vine under the door.', make: G => say('leafy', { fac: 'food', talk: [
    { t: 'Okay, weird question. I\'ve streamed this mall for years, and I have hours New Face\'s screens never caught. Six people watched it. I just watched it again.' },
    { t: 'That guy Dennis? He\'s on there. Walking into Unit 9. I scrubbed through every night after. {yellow}He never comes out.{/}' },
    { t: 'Last minute of the footage. Look, down at the bottom. That green bit, going under his door.' },
    { who: 'carl', t: 'That is a vine.' },
    { t: 'Yeah. That\'s mine. It got there first. I don\'t know what that means. I thought you should know, since you\'re in there.' },
  ] }) },
  { id: 'dennis2', day: 37, when: (G, st) => st.grinEnd !== 'free' && st.seen.dennis1, note: 'Dennis cannot remember how he got out. Or whether he did.', make: (G, st) => say('dennis', { fac: 'food', talk: [
    { t: 'Hi! Sorry, who are you? Why are you in my shop? Ha. No, wait. We did this.' },
    { t: 'I remember the screen. A little man. He asked how the shop was doing. I said fine, and then it was Monday and I had just bought a shop.' },
    { who: 'carl', t: 'How did you get out?' },
    { t: 'Out of what? I mean, I know what you mean. I can\'t remember. {yellow}I can\'t remember if I did.{/} How\'s the shop doing?' },
    { who: 'carl', t: st.presses ? 'I would like you to stop asking that.' : 'Fine.' },
    { t: 'That\'s what I said.' },
  ] }) },
  // ---- the one person who doesn't want to buy it
  { id: 'leafy3', day: 40, when: (G, st) => has(G) && !st.grinEnd && !st.leafyGone && st.seen.leafy2, note: 'Leafy never asked to buy the Grin Cart. Leafy said there is a gap on a shelf.', make: G => say('leafy', { fac: 'food', talk: [
    { t: 'Everybody wants that cart. Yoko, New Face, Linda. I don\'t! I want it nowhere. I won\'t press anything, and I\'m not buying it.' },
    { t: 'But Yoko has that gap on her shelf, right? The exact size? Nobody ever said what had to go in it. I have good soil and a key I found in a fern.' },
    { t: 'You could give it to me, and it goes down in the dirt, and something grows on top. It won\'t fix anything. It just stops being a hole.', choices: [
      { t: 'Trust Leafy with it', fn: g => { g.story.grinEnd = 'leafy'; S.loseGrin(g); g.repChange('food', 15); return 'Okay! Off-stream, I promise. Gary will be furious. I\'ll bring you a cutting.'; } },
      { t: 'Not yet', fn: () => 'That\'s fine. I\'m next door. I\'m always next door.' },
    ] },
  ] }) },
  { id: 'scuff6', day: 41, when: (G, st) => st.grinEnd === 'free', make: (G, st) => say('kid', { fac: 'food', talk: [
    { t: 'There\'s a man in the food court named Dennis? He keeps asking if the shop\'s doing okay. He seems really happy about it.' },
    { who: 'carl', t: 'Tell him it is fine.' },
    { t: 'He said you\'d say that.' },
  ] }) },
];
S.BEATS.push(
  { id: 'seq1', day: 43, when: (G, st) => !!st.grinEnd, note: 'The Sequel Committee is developing Mall of the Future 2. They want Unit 9 in it.', make: G => say('stringer', { fac: 'upper', talk: [
    { t: 'Big week. The Committee is developing {yellow}Mall of the Future 2{/}. A version that tests better. Nicer landlord. A human shopkeeper.' },
    { t: 'We would like to option Unit 9. $300 now. You would not have to do anything. That is the appeal.', choices: [
      { t: 'Sign the option: +$300', fn: g => { g.cash += 300; g.story.sequel = 'signed'; return 'Wonderful. Somebody will be in touch. It will not be me. It will be someone who tests better.'; } },
      { t: 'No', fn: g => { g.story.sequel = 'no'; g.repChange('upper', 3); return 'Of course. We will cast around you.'; } },
    ] },
  ] }) },
  { id: 'seq2', day: 46, when: (G, st) => st.seen.seq1, note: 'There is a man in the mall who looks like me, but human, in sunglasses. The Committee calls him HU-MAN.', make: G => say('kid', { fac: 'food', talk: [
    { t: 'Mr. Carl, there is a man who looks like you but human. Square chin. Sunglasses. He shouted BY THE POWER OF NEVADA at the escalator.' },
    { t: 'A man in a white suit was writing down everything he did. He said the man tested very well.' },
    { who: 'carl', t: 'I am the normal human man here.' },
    { t: 'I know. I asked him where the bathroom was and he did not know. You always know.' },
  ] }) },
  { id: 'seq3', day: 50, when: (G, st) => st.seen.seq2, note: 'The Committee wants Linda nicer for the sequel. She asked me whose side I am on.', make: G => say('linda', { fac: 'upper', talk: [
    { t: 'The Committee wants my mall for their sequel. They want me {yellow}nicer{/}. They tested me. I tested badly. I am very good at it.' },
    { t: 'They want HU-MAN in your unit. You are an alien. Shut up, I know. So whose side are you on?', choices: [
      { t: 'Yours, Linda', fn: g => { g.story.seqSide = 'linda'; g.repChange('upper', 10); g.arrears = 0; return 'Good. This Sunday is free. If you tell anyone I was nice, I raise it.'; } },
      { t: 'Committee pays more', fn: g => { g.story.seqSide = 'committee'; g.cash += 200; g.repChange('upper', -10); return 'Then enjoy being written out. They will do it nicely. That is the worst part.'; } },
    ] },
  ] }) },
  { id: 'seq4', day: 54, when: (G, st) => st.seen.seq3, note: 'Yoko pulled the CrackyReads tapes. The sequel is the cart again, bigger.', make: G => say('robed', { fac: 'upper', talk: [
    { t: 'I pulled the CrackyReads tapes. The Committee\'s sequel is the cart again. Bigger. A whole mall that presses start for everyone, every Sunday.' },
    { t: 'Helping you does not mean doing what you say. But I will put it on the air if you say so. It would end the sequel. It might end the show.', choices: [
      { t: 'Put it on the air', fn: g => { g.story.leak = true; g.repChange('food', 10); g.repChange('upper', -5); return 'Done. New Face is reading it out in his calm voice. Linda is pretending she did not ask for this.'; } },
      { t: 'Keep the show safe', fn: g => { g.story.leak = false; return 'Then I will keep the tapes. On the shelf. Correctly labeled.'; } },
    ] },
  ] }) },
  { id: 'seq5', day: 58, when: (G, st) => st.seen.seq4, note: 'Pee Kid followed the money. He calls himself a detective now.', make: (G, st) => say('kid', { fac: 'food', talk: st.leak ? [
    { t: 'Mr. Carl, I followed the money. Who pays for the flyers, who pays for the paper. It was always the Committee. They were writing all of us.' },
    { t: 'But the sequel got cancelled. HU-MAN is selling sunglasses at the food court now. He seems relieved.' },
    { who: 'carl', t: 'You are a good detective.' },
    { t: 'I know. Also I found the bathroom. It was in Unit 9 the whole time. Just kidding.' },
  ] : [
    { t: 'Mr. Carl, I followed the money. It was always the Committee. They were writing all of us.' },
    { t: 'They start filming the sequel Monday. HU-MAN has a lease on the unit across from yours. He waved.' },
    { who: 'carl', t: 'Do not wave back.' },
    { t: 'I did not. I am a detective now. Detectives do not wave.' },
  ] }) },
);
S.NEWS = [
  { id: 'n17', day: 59, when: (G, st) => st.seen.seq4 && st.leak, title: 'SEQUEL CANCELLED LIVE ON CRACKYREADS', body: 'A Committee plan to make the whole Mall press start was read out on air. The Committee has asked for notes on the notes.' },
  { id: 'n18', day: 59, when: (G, st) => st.seen.seq4 && st.leak === false, title: 'MALL OF THE FUTURE 2 IN PRODUCTION', body: 'Starring HU-MAN, a normal human shopkeeper. Tested very well. Filming in the Unit across from Unit 9.' },
  { id: 'n15', day: 11, title: 'CRACKYREADS RENEWED, AGAIN', body: 'Management confirms the show will keep broadcasting from inside the Mall, as it cannot leave. Ad inventory is sold through Sunday.' },
  { id: 'n16', day: 2, when: (G, st) => st.toldCommittee, title: 'SEQUEL COMMITTEE OPTIONS "THE GRIN"', body: 'A version that tests better is in development. A source close to Unit 9 was paid in cash.' },
  { id: 'n1', day: 1, title: 'NEW TENANT IN UNIT 9', body: 'Management welcomes a new small business. Management declines to say what happened to the old one.' },
  { id: 'n3', day: 7, title: 'RENT RISES, AS PLANNED', body: 'Tenants are reminded that this is a good thing, and to shut up.' },
  { id: 'n4', day: 16, title: 'ARCADE REBORN AS VAPE KIOSK', body: 'The claw machine remains. Regulars describe the new prizes as "a mist".' },
  { id: 'n5', day: 26, title: 'SPOOKY ALIMONY CASE ENTERS FINAL WEEK', body: 'Court asks defendant to stop vanishing during testimony.' },
  { id: 'n6', day: 33, when: (G, st) => st.custody === 'helped', title: 'GHOST KEEPS THE WEEKDAYS', body: 'A local shopkeeper called him "a stable presence" under oath. The shopkeeper also stated he is a human man. Court noted both.' },
  { id: 'n7', day: 2, when: (G, st) => st.grinEnd === 'free', title: 'ELEVEN MEN FOUND IN FOOD COURT', body: 'None can say how they got there. All of them insist they have a shop. Management is not available for comment. Rent, it says here, has stopped rising in Unit 9.' },
  { id: 'n8', day: 2, when: (G, st) => st.grinEnd === 'linda', title: 'UNIT 14 GETS NEW OWNER', body: 'Great price, says the previous one, while running.' },
  { id: 'n9', day: 2, when: (G, st) => st.grinEnd === 'relay', title: 'COLD CASE CLOSED', body: 'New Face closes eleven files. No arrests. The Inspector has asked for his screens to be turned to the wall.' },
  { id: 'n10', day: 2, when: (G, st) => st.grinEnd === 'archive', title: 'PRIVATE COLLECTION GROWS', body: 'A new acquisition, condition: unplayed. The shelf is said to hum, a little.' },
  { id: 'n11', day: 40, when: (G, st) => st.relay === 'sent', title: 'FLIP PHONE LIGHTS UP IN LOST AND FOUND', body: 'Two unread messages. The Lost and Found has declined to look.' },
  { id: 'n13', day: 2, when: (G, st) => st.grinEnd === 'leafy', title: 'PRIVATE COLLECTION SPROUTS', body: 'A collector reports a seedling on a shelf that was being saved for something else. She has catalogued it. Condition: growing.' },
  { id: 'n14', day: 2, when: (G, st) => st.leafyGone, title: 'STALL NEXT TO UNIT 9 VACANT', body: 'The only plant in the Mall of the Future has been removed by its owner. A sign says BACK SOON. Management is calling it a refresh.' },
  { id: 'n12', day: 50, title: 'PARCEL UPDATE', body: 'A parcel addressed to the parents of a Unit 9 tenant remains STILL IN TRANSIT.' },
];
S.epilogue = G => {
  const st = G.story, o = [];
  o.push({ leafy: 'Something is growing in the gap on Yoko\'s shelf. It has small green leaves and very good soil. Nobody has dug it up. Leafy waters it on Tuesdays and streams it to six people.', archive: 'The Grin Cart sits on Yoko\'s shelf, in perfect condition. It is correctly labeled. It hums.', relay: 'The Grin Cart is in a box in a room. New Face has it on one small screen, and he checks it most nights.', linda: 'The Grin Cart went to Unit 14. You did not wave. You think about it less than you thought you would.', free: 'Eleven men got out of the Grin Cart. Dennis comes by some days to ask how the shop is doing. It is fine.' }[st.grinEnd] || (S.hasGrin(G) ? 'They found the Grin Cart among your things. It was smiling. It went back on the shelf in Unit 9, for whoever is next.' : 'Nobody ever did find out about the cart. It turned up in somebody\'s stock on Wednesday.'));
  if (st.scuff) o.push(st.scuff === 'hired' ? 'Pee Kid still hands out flyers, and keeps asking who paid for the paper. Somebody called him a detective. He did not correct them.' : 'Pee Kid works the pretzel stand. Pee Kid is not allowed to say the word salt.');
  if (st.custody) o.push(st.custody === 'helped' ? 'Spooky Ghost has Tiny on weekdays. Both of them describe this as "a lot".' : 'Tiny lives at the coat rack. Tiny still comes by. Tiny does not say why.');
  if (st.seen.seq4) o.push(st.leak ? 'The sequel never happened. HU-MAN sells sunglasses at the food court. Sometimes he asks how your shop is doing.' : 'Mall of the Future 2 is filming across the walkway. HU-MAN waves every morning. You do not wave back.');
  if (st.seqSide) o.push(st.seqSide === 'linda' ? 'Linda still raises the rent every Sunday. She has never once mentioned the free one.' : 'Linda has not spoken to you since you sided with the Committee. The rent notices are typed now.');
  if (st.seen.pat5) o.push('Dennis finally got his order. Pat got a new tray.');
  if (st.sponsor) o.push('CrackyReads still reads your shop on the air. It still says: it is a shop.');
  if (st.informed >= 3 || st.toldCommittee) o.push('The Sequel Committee has a thick file on the Mall of the Future. You wrote most of it, for cash.');
  if (st.patCart) o.push('Pat still carries the tray. There is a cup, some food for nobody, and a cartridge that does not boot.');
  if (st.seen.vane2) o.push('Vane went back up the escalator. The collection is still on the wall at night. It is doing fine, it says.');
  if (st.relay) o.push(st.relay === 'sent' ? 'There are two hearts on a flip phone in the Lost and Found. One day the battery will die, or it will not.' : 'New Face took the message off his screens. He still remembers it. He was never there.');
  if (st.wickCold) o.push('Wick still empties your can. Wick does not look up.');
  else if (st.seen.wick1) o.push('Wick has cleaned out twelve units now. You are still in yours. Wick asked about your deposit anyway.');
  if (st.presses >= 3) o.push('The chair at the meeting still has your name on it. The name is Dennis.');
  else if (st.seen.sister1) o.push('Sister Save-State still saves you a chair. She is the only person who is always happy to see you, and you have decided not to think about that.');
  if (st.leafyGone) o.push('The sign next door still says BACK SOON.');
  else if (st.seen.leafy1) o.push('There is a vine in your back room. You have started watering it. Neither of you has mentioned this.');
  o.push('The parcel is still in transit.');
  return o;
};
})();
