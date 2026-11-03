// Carl's Cursed Cartridges: all game content. Numbers follow ~/probably-stolen-study unless noted.
(function () {
const D = window.DATA = {};

D.DIFF = {
  cozy:   { name: 'BARGAIN BIN', desc: 'Rent climbs slowly. Rep comes easy. Grace on rent.', cash: 700, rentMul: 1.025, markup: 20, grace: true,  price: 3000,  repGain: 1.5, repLoss: .5, svc: 1 },
  normal: { name: 'MARK UP',     desc: 'The intended game.',                                 cash: 550, rentMul: 1.05,  markup: 15, grace: true,  price: 5000, repGain: 1,   repLoss: 1,  svc: 1 },
  hard:   { name: 'RED INK',     desc: 'No markup, no grace, double fees. Linda is thrilled.', cash: 400, rentMul: 1.1,   markup: 0,  grace: false, price: 10000, repGain: .75, repLoss: 1.25, svc: 2 },
};

// shapes are in grid cells. art = file in art/items. v = base value.
D.ITEMS = {
  cart_moon:   { name: 'MOON LOT 64',       type: 'CART', art: 'cart_moon',   w: 2, h: 2, v: 60,  blurb: 'Park on the moon. You will never find your car.' },
  cart_eye:    { name: 'EYE SPY 2',         type: 'CART', art: 'cart_eye',    w: 2, h: 2, v: 90,  blurb: 'The sequel watches you back.' },
  cart_static: { name: 'STATIC: THE GAME',  type: 'CART', art: 'cart_static', w: 2, h: 2, v: 40,  blurb: 'Critics agree it is on.' },
  cart_pod:    { name: 'POD PAL',           type: 'CART', art: 'cart_pod',    w: 2, h: 2, v: 70,  blurb: 'Raise one. It raises you.' },
  cart_spiral: { name: 'HYPNO TENNIS',      type: 'CART', art: 'cart_spiral', w: 2, h: 2, v: 85,  blurb: 'You are getting very good at tennis.' },
  cart_ruins:  { name: 'RHYOLITE TYCOON',   type: 'CART', art: 'cart_ruins',  w: 2, h: 2, v: 55,  blurb: 'Build a boom town. Watch it leave.' },
  cart_cross:  { name: 'SUNDAY ZAPPER',     type: 'CART', art: 'cart_cross',  w: 2, h: 2, v: 45,  blurb: 'Light gun sold separately. Forgiveness too.' },
  cart_volt:   { name: 'VOLT WITCH',        type: 'CART', art: 'cart_volt',   w: 2, h: 2, v: 110, blurb: 'Hums when unplugged.' },
  cart_smile:  { name: 'SMILE.EXE',         type: 'CART', art: 'cart_smile',  w: 2, h: 2, v: 150, blurb: 'It is so happy you came back.' },
  cart_evil:   { name: 'GRIN CART',         type: 'CART', art: 'cart_evil',   w: 2, h: 2, v: 130, blurb: 'Taped shut. The tape is on the inside.' },
  pill:        { name: 'PROP PILLS',        type: 'PILL', art: 'pill_jar',    w: 1, h: 2, v: 30,  blurb: 'Recalled for working better than a placebo.' },
  pill_b:      { name: 'PROP PILLS (RX)',   type: 'PILL', art: 'pill_bottle', w: 1, h: 2, v: 42,  blurb: 'Same pills. The label has more legal words.' },
  // food: spoils overnight
  f_noodles:   { name: 'CUP NOODLES',    type: 'FOOD', art: 'noodles',  w: 2, h: 2, v: 14, blurb: 'Lid does not close. Nobody knows why.' },
  f_ramen:     { name: 'EYE RAMEN',      type: 'FOOD', art: 'ramen',    w: 2, h: 2, v: 18, blurb: 'The fishcake is a coincidence.' },
  f_energy:    { name: 'VOLT COLA',      type: 'FOOD', art: 'energy',   w: 1, h: 2, v: 12, blurb: 'Banned in the Upper Deck for tasting like a battery.' },
  f_bun:       { name: 'DEAD CAT BUN',   type: 'FOOD', art: 'bun',      w: 2, h: 2, v: 10, blurb: 'The cat on it is fine. It is a logo.' },
  f_choc:      { name: 'BITTEN CHOCOLATE', type: 'FOOD', art: 'choc',   w: 2, h: 2, v: 11, blurb: 'Sold as found.' },
  f_juice:     { name: 'BERRY BOX',      type: 'FOOD', art: 'juice',    w: 2, h: 2, v: 8,  blurb: 'Contains the concept of strawberry.' },
  f_fries:     { name: 'FOOD COURT FRIES', type: 'FOOD', art: 'fries',  w: 2, h: 2, v: 12, blurb: 'Still warm. Do not ask from what.' },
  f_burger:    { name: 'GARF BURGER',    type: 'FOOD', art: 'burger',   w: 2, h: 2, v: 22, blurb: 'A diner classic, smuggled in.' },
  f_pizza:     { name: 'PIZZA, ONE',     type: 'FOOD', art: 'pizza',    w: 2, h: 2, v: 20, blurb: 'A box the size of a pizza. A slice.' },
  f_donut:     { name: 'PINK DONUT',     type: 'FOOD', art: 'donut',    w: 2, h: 2, v: 13, blurb: 'Every Mall Cop can smell this.' },
  f_chips:     { name: 'TRI CHIPS',      type: 'FOOD', art: 'chips',    w: 2, h: 2, v: 9,  blurb: 'Mostly air, legally.' },
  f_bar:       { name: 'X-BAR',          type: 'FOOD', art: 'bar',      w: 2, h: 1, v: 10, blurb: 'Flavor undisclosed.' },
  f_pop:       { name: 'MELT POP',       type: 'FOOD', art: 'popsicle', w: 1, h: 2, v: 9,  blurb: 'Clock is ticking.' },
  f_sushi:     { name: 'ESCALATOR SUSHI', type: 'FOOD', art: 'sushi',   w: 2, h: 2, v: 34, blurb: 'It went around a lot.' },
  // oddware
  odd_tama:    { name: 'POCKET CORPSE',  type: 'ODD', art: 'tama',       w: 2, h: 2, v: 95,  blurb: 'A virtual pet. X for eyes from the factory.' },
  odd_crt:     { name: 'WATCHING TV',    type: 'ODD', art: 'crt',        w: 3, h: 3, v: 190, blurb: 'One channel. It is looking at you.' },
  odd_mp3:     { name: 'MEOWPOD',        type: 'ODD', art: 'mp3',        w: 2, h: 2, v: 120, blurb: 'Eleven thousand songs. All the same song.' },
  odd_ds:      { name: 'FLIP HANDHELD',  type: 'ODD', art: 'ds_clean',   w: 2, h: 2, v: 140, blurb: 'The screen is a spiderweb. Still plays.' },
  odd_ds2:     { name: 'CRACKED FLIP',   type: 'ODD', art: 'ds_cracked', w: 2, h: 2, v: 75,  blurb: 'Same, but the crack has a crack.' },
  odd_vhs:     { name: 'EYE TAPE',       type: 'ODD', art: 'vhs',        w: 3, h: 2, v: 55,  blurb: 'Be kind. Rewind. It is watching.' },
  odd_cd:      { name: 'SHINY DISC',     type: 'ODD', art: 'cd',         w: 2, h: 2, v: 35,  blurb: 'Case says Greatest Hits. Disc says No.' },
  odd_walkie:  { name: 'HEARTBEAT RADIO', type: 'ODD', art: 'walkie',    w: 2, h: 2, v: 85,  blurb: 'Nobody on the line. It has a pulse.' },
  odd_plush:   { name: 'STITCHY',        type: 'ODD', art: 'plush',      w: 2, h: 2, v: 65,  blurb: 'Loved, past tense.' },
  odd_phones:  { name: 'CAT HEADPHONES', type: 'ODD', art: 'headphones', w: 2, h: 2, v: 70,  blurb: 'Audio only in the left ear. It is a voice.' },
  odd_goggles: { name: 'SPLIT VISOR',    type: 'ODD', art: 'goggles',    w: 2, h: 2, v: 110, blurb: 'Security spec. Shows you what is behind you.' },
  odd_goggles2:{ name: 'LOOTER VISOR',   type: 'ODD', art: 'goggles_new',w: 3, h: 2, v: 125, blurb: 'Crack across the good eye.' },
  odd_battery: { name: 'WARM CELL',      type: 'ODD', art: 'battery',    w: 2, h: 2, v: 60,  blurb: 'Do not lick. Everyone licks.' },
  odd_circuit: { name: 'CAT BOARD',      type: 'ODD', art: 'circuit',    w: 2, h: 2, v: 90,  blurb: 'A logic board with a face. Bad logic.' },
  odd_ring:    { name: 'SATURN CHARM',   type: 'ODD', art: 'ringbox',    w: 2, h: 2, v: 220, blurb: 'Boxed. Someone meant to give this to someone.' },
  odd_glow:    { name: 'GLOW STICK',     type: 'ODD', art: 'glowstick',  w: 1, h: 2, v: 18,  blurb: 'Has been glowing since opening day.' },
  odd_id:      { name: 'MALL ACCESS ID', type: 'ODD', art: 'mall_id',    w: 2, h: 2, v: 150, curseLike: 1, blurb: 'Face scratched out. Doors still open.' },
  odd_coupon:  { name: 'OFFER CARD',     type: 'ODD', art: 'coupon',     w: 2, h: 1, v: 40,  blurb: 'Good for one offer. It does not say of what.' },
  cart_tape:   { name: 'SUNSET RACER', type: 'CART', art: 'x_cart', w: 2, h: 2, v: 75, blurb: 'Label says the sun never sets. It has.' },
  odd_stack:   { name: 'CART STACK', type: 'ODD', art: 'x_stack', w: 2, h: 2, v: 145, blurb: 'Three carts glued together. Nobody can say why.' },
  odd_grinboy: { name: 'GRIN BOY', type: 'ODD', art: 'x_handheld', w: 2, h: 3, v: 170, blurb: 'Comes with a stand. It is always already on.' },
  odd_cam:     { name: 'OLD CAMCORDER', type: 'ODD', art: 'x_cam', w: 3, h: 2, v: 150, blurb: 'Has one tape in it. Do not watch the tape.' },
  odd_tape:    { name: 'PINK MIXTAPE', type: 'ODD', art: 'x_tape', w: 2, h: 1, v: 25, blurb: 'Side B is someone breathing, in key.' },
  odd_lava:    { name: 'LAVA LAMP', type: 'ODD', art: 'x_lava', w: 2, h: 4, v: 175, blurb: 'Not plugged in. Has not been since you got it.' },
  odd_crystal: { name: 'MALL CRYSTAL', type: 'ODD', art: 'x_crystal', w: 2, h: 2, v: 130, blurb: 'Cures nothing. Sold with a certificate.' },
  odd_dome:    { name: 'DREAM CAP DOME', type: 'ODD', art: 'x_dome', w: 2, h: 3, v: 210, curseLike: 1, blurb: 'They glow. They are growing. Mall Cops would like a word.' },
  odd_pet:     { name: 'POCKET KITTY', type: 'ODD', art: 'x_tama', w: 2, h: 2, v: 90, blurb: 'Still alive, unlike the other one. So far.' },
  odd_lighter: { name: 'STAR LIGHTER', type: 'ODD', art: 'x_lighter', w: 1, h: 2, v: 30, blurb: 'Lights on the third try. Every time.' },
  odd_diary:   { name: 'BUTTERFLY CASE', type: 'ODD', art: 'x_butterfly', w: 2, h: 2, v: 50, blurb: 'Locked. Something flutters inside.' },
  odd_photos:  { name: 'PHOTOS OF NOBODY', type: 'ODD', art: 'x_photos', w: 3, h: 1, v: 40, blurb: 'Instant photos of the mall. A figure gets closer in each.' },
  odd_sticher: { name: 'STITCHES', type: 'ODD', art: 'x_plush', w: 3, h: 3, v: 95, blurb: 'Priced to go. It keeps coming back to the shop.' },
  odd_rx:      { name: 'THREE BOTTLES', type: 'ODD', art: 'x_bottles', w: 2, h: 2, v: 85, blurb: 'Prescribed to someone named Occupant.' },
  odd_jar:     { name: 'SAMPLE JAR', type: 'ODD', art: 'x_jar', w: 1, h: 1, v: 20, blurb: 'Free sample. Do not ask of what.' },
  odd_loose:   { name: 'LOOSE PILLS', type: 'ODD', art: 'x_loose', w: 1, h: 1, v: 10, blurb: 'Counter pills. Five-second rule applies.' },
  // weapons and ammo: illegal (contraband level) unless you hold the permit
  g_ray:      { name: 'RAY PISTOL',     type: 'WEAPON', art: 'g_ray',      w: 3, h: 2, v: 140, illegal: 1, blurb: 'Goes zap. Mostly at the user.' },
  g_revolver: { name: 'GLOW REVOLVER',  type: 'WEAPON', art: 'g_revolver', w: 3, h: 3, v: 190, illegal: 2, blurb: 'Six shots. Two chambers. Do not do the math.' },
  g_rifle:    { name: 'CAT-EYE RIFLE',  type: 'WEAPON', art: 'g_rifle',    w: 5, h: 2, v: 280, illegal: 3, blurb: 'The scope shows who is looking back.' },
  g_plasma:   { name: 'SLIME CANNON',   type: 'WEAPON', art: 'g_plasma',   w: 5, h: 3, v: 420, illegal: 3, blurb: 'The dome is not decorative. It is hungry.' },
  a_rounds:   { name: 'LOOSE ROUNDS',   type: 'AMMO', art: 'a_rounds',  w: 1, h: 1, v: 14, illegal: 1, blurb: 'Three of them. Pointy.' },
  a_rounds2:  { name: 'STUBBY ROUNDS',  type: 'AMMO', art: 'a_rounds2', w: 1, h: 1, v: 12, illegal: 1, blurb: 'Three of them. Less pointy, same problem.' },
  a_box:      { name: 'CARTON OF AMMO', type: 'AMMO', art: 'a_box',     w: 2, h: 1, v: 34, illegal: 1, blurb: 'Cat logo. Childproof, allegedly.' },
  a_open:     { name: 'OPEN AMMO CASE', type: 'AMMO', art: 'a_open',    w: 2, h: 2, v: 62, illegal: 1, blurb: 'Twelve rounds, lined up like teeth.' },
  a_shells:   { name: 'BOX OF SLUGS',   type: 'AMMO', art: 'a_shells',  w: 2, h: 2, v: 58, illegal: 1, blurb: 'Lid taped. Tape losing.' },
  a_crate:    { name: 'AMMO CRATE',     type: 'AMMO', art: 'a_crate',   w: 2, h: 2, v: 110, illegal: 2, blurb: 'Heavy. Do not shake it to check.' },
  a_cell:     { name: 'POWER CELL',     type: 'AMMO', art: 'a_cell',    w: 1, h: 2, v: 26, illegal: 1, blurb: 'Ray pistol food. Faintly warm.' },
  a_cellbox:  { name: 'CELL CASE',      type: 'AMMO', art: 'a_cellbox', w: 2, h: 2, v: 92, illegal: 1, blurb: 'Four cells. Hums in B-flat.' },
  a_cellcrate:{ name: 'SEALED CELL BOX', type: 'AMMO', art: 'a_cellcrate', w: 2, h: 2, v: 125, illegal: 2, blurb: 'Latch stays lit. Nobody has opened it twice.' },
  a_batcrate: { name: 'CELL CARRIER',   type: 'AMMO', art: 'a_batcrate', w: 2, h: 2, v: 105, illegal: 2, blurb: 'Carry handle. Look natural.' },
  a_rocket:   { name: 'SMALL ROCKET',   type: 'AMMO', art: 'a_rocket',  w: 1, h: 2, v: 130, illegal: 3, blurb: 'Small is relative.' },
  a_rocketcrate: { name: 'ROCKET CRATE', type: 'AMMO', art: 'a_rocketcrate', w: 2, h: 2, v: 300, illegal: 3, blurb: 'Rocket sold separately. It is in the crate. Separately.' },
  // Linda's things. Hot, expensive, and she knows they are gone.
  l_badge:     { name: "LINDA'S BADGE",   type: 'ODD', art: 'l_badge',   w: 2, h: 2, v: 320, linda: true, blurb: 'Opens every door in the mall. Photo looks annoyed.' },
  l_perfume:   { name: "LINDA'S PERFUME", type: 'ODD', art: 'l_perfume', w: 2, h: 2, v: 260, linda: true, blurb: 'Notes of leather, contempt and an eviction.' },
  l_compact:   { name: "LINDA'S COMPACT", type: 'ODD', art: 'l_compact', w: 2, h: 2, v: 180, linda: true, blurb: 'The mirror cracked from looking at Carl.' },
  l_bag:       { name: "LINDA'S HANDBAG", type: 'ODD', art: 'l_bag',     w: 3, h: 3, v: 480, linda: true, blurb: 'Quilted. Chained. Worth more than your unit.' },
  l_phone:     { name: "LINDA'S FLIP",    type: 'ODD', art: 'l_phone',   w: 2, h: 3, v: 240, linda: true, blurb: 'One unread message with a heart on it. From who?' },
  // garbage: what you actually find in the Lot
  j_can:       { name: 'CRUSHED CAN',    type: 'JUNK', art: 'crushed_can', w: 1, h: 2, v: 2,  blurb: 'Empty, but insistent.' },
  j_shell:     { name: 'CLAMSHELL',      type: 'JUNK', art: 'clamshell',   w: 2, h: 2, v: 2,  blurb: 'Smells like a burger that left.' },
  j_chips:     { name: 'EMPTY CHIPS',    type: 'JUNK', art: 'chips_empty', w: 2, h: 2, v: 1,  blurb: 'The crumbs are the good part.' },
  j_tote:      { name: 'TORN TOTE',      type: 'JUNK', art: 'torn_bag',    w: 2, h: 2, v: 4,  blurb: 'Dead cat logo. Dead tote.' },
  j_bag:       { name: 'MALL BAG',       type: 'JUNK', art: 'bag',         w: 2, h: 2, v: 5,  blurb: 'Collectors pay for these, for some reason.' },
  j_cup:       { name: 'OLD SLUSH',      type: 'JUNK', art: 'cup',         w: 2, h: 2, v: 3,  blurb: 'Something has been growing inside.' },
  j_scrap:     { name: 'POSTER SCRAP',   type: 'JUNK', art: 'poster_scrap',w: 2, h: 2, v: 6,  blurb: 'A piece of the future.' },
  // ---- Leafy's second batch: carts
  cart_homealone: { name: 'HOME ALONE FOREVER', type: 'CART', art: 'cart_homealone', w: 1, h: 1, v: 70, blurb: 'You win by staying inside.' },
  cart_uponly:    { name: 'UP ONLY', type: 'CART', art: 'cart_uponly', w: 1, h: 1, v: 65, blurb: 'There are 9,000 levels and no way down.' },
  cart_pretzel:   { name: 'PRETZEL PAL', type: 'CART', art: 'cart_pretzel', w: 1, h: 1, v: 80, blurb: "Feed him. He remembers if you don't." },
  cart_valet:     { name: 'DOUBLE MOON VALET', type: 'CART', art: 'cart_valet', w: 1, h: 1, v: 75, blurb: 'Park cars until one of them parks you.' },
  cart_blink:     { name: 'DO NOT BLINK', type: 'CART', art: 'cart_blink', w: 1, h: 1, v: 100, blurb: 'The game pauses when you do.' },
  cart_sequel:    { name: 'SEQUEL NOTES: THE GAME', type: 'CART', art: 'cart_sequel', w: 1, h: 1, v: 50, blurb: 'Every level was improved by a committee.' },
  cart_pocket:    { name: 'POCKET THING', type: 'CART', art: 'cart_pocket', w: 1, h: 1, v: 120, blurb: 'Hatched from an egg. Nobody says whose.' },
  cart_grave:     { name: 'HIGH SCORE GRAVE', type: 'CART', art: 'cart_grave', w: 1, h: 1, v: 95, blurb: 'Your initials are already on the board.' },
  // pills you buy and resell as they are
  pill_blister:   { name: 'PROP PILLS BLISTER', type: 'PILL', art: 'pill_blister', w: 1, h: 1, v: 22, blurb: 'Four missing. Nobody remembers why.' },
  pill_kitty:     { name: 'KITTY CHEWABLES', type: 'PILL', art: 'pill_kitty', w: 1, h: 1, v: 38, blurb: "The cat's eyes are not reassuring." },
  pill_loz:       { name: 'PROP LOZENGES', type: 'PILL', art: 'pill_loz', w: 1, h: 1, v: 28, blurb: 'For a sore throat or an unwanted confession.' },
  pill_reserve:   { name: 'PROP PILL RESERVE', type: 'PILL', art: 'pill_reserve', w: 2, h: 1, v: 340, blurb: 'Aged in an Upper Deck cellar. Just the one.' },
  pill_maybe:     { name: 'BAG OF MAYBE', type: 'PILL', art: 'pill_maybe', w: 1, h: 1, v: 12, blurb: 'Could be anything. Priced like it could be nothing.' },
  pill_stars:     { name: 'PROP STARS JR.', type: 'PILL', art: 'pill_stars', w: 1, h: 1, v: 32, blurb: 'Fun shapes. Same warnings.' },
  // gadgets
  odd_chatty:     { name: 'CHATTY BOY', type: 'ODD', art: 'odd_chatty', w: 2, h: 2, v: 180, blurb: 'It only speaks during the boring parts.' },
  odd_zapper:     { name: 'PINK ZAPPER', type: 'ODD', art: 'odd_zapper', w: 2, h: 1, v: 70, blurb: 'It fires at the TV. Usually.' },
  odd_procon:     { name: 'THE PRO CONTROLLER', type: 'ODD', art: 'odd_procon', w: 2, h: 1, v: 110, blurb: '47 buttons. One of them is load-bearing.' },
  odd_floppy:     { name: 'BITTEN FLOPPY', type: 'ODD', art: 'odd_floppy', w: 1, h: 1, v: 24, blurb: 'Something tried to read it.' },
  odd_egg:        { name: 'FOREVER EGG', type: 'ODD', art: 'odd_egg', w: 1, h: 1, v: 60, blurb: "It died and it's still asking for food." },
  odd_leaky:      { name: 'LEAKY SAVE', type: 'ODD', art: 'odd_leaky', w: 1, h: 1, v: 55, blurb: 'Your progress is getting on everything.' },
  odd_3d:         { name: 'HALF 3D GLASSES', type: 'ODD', art: 'odd_3d', w: 2, h: 1, v: 45, blurb: 'One eye sees a little too much.' },
  odd_remote:     { name: 'THE REMOTE', type: 'ODD', art: 'odd_remote', w: 1, h: 2, v: 90, blurb: "Nobody has found out what it's for." },
  // shop finds
  odd_boxlot:     { name: 'BOX LOT', type: 'ODD', art: 'odd_boxlot', w: 2, h: 2, v: 150, blurb: 'Buy them all. One of them is trouble.' },
  odd_display:    { name: 'LONELY DISPLAY', type: 'ODD', art: 'odd_display', w: 2, h: 2, v: 130, blurb: "It's holding that spot for someone." },
  odd_blowkit:    { name: 'BLOW KIT', type: 'ODD', art: 'odd_blowkit', w: 1, h: 1, v: 35, blurb: 'Officially discouraged. Officially works.' },
  odd_guide:      { name: 'THE STRATEGY GUIDE', type: 'ODD', art: 'odd_guide', w: 2, h: 2, v: 140, blurb: 'The last 40 pages are handwritten.' },
  odd_mint:       { name: 'MINT IN BOX', type: 'ODD', art: 'odd_mint', w: 2, h: 2, v: 360, blurb: "It's too clean. It wasn't there yesterday." },
  odd_clearance:  { name: 'CLEARANCE SIGN', type: 'ODD', art: 'odd_clearance', w: 1, h: 2, v: 30, blurb: "The shop's not closing. Someone just said so." },
};
// One scale for the whole shop: a cart is 1x1. Anything not listed here is 1x1 too.
{ const SIZE = { pill: [1, 1], pill_b: [1, 1], f_noodles: [1, 1], f_pizza: [2, 2], f_sushi: [2, 1], f_bar: [1, 1], f_juice: [1, 1], f_pop: [1, 1], f_energy: [1, 1],
    odd_crt: [2, 2], odd_vhs: [2, 1], odd_coupon: [1, 1], odd_stack: [2, 2], odd_grinboy: [1, 2], odd_cam: [2, 1], odd_tape: [1, 1], odd_lava: [1, 2], odd_dome: [2, 2], odd_photos: [2, 1], odd_sticher: [2, 2], odd_goggles2: [2, 1], odd_goggles: [2, 1], odd_ring: [1, 1], odd_rx: [2, 1], odd_phones: [2, 1], odd_plush: [1, 2], odd_walkie: [1, 2], odd_glow: [1, 1], odd_lighter: [1, 1],
    g_ray: [2, 1], g_revolver: [2, 1], g_rifle: [3, 1], g_plasma: [3, 2], a_box: [2, 1], a_open: [2, 1], a_crate: [2, 2], a_cellcrate: [2, 2], a_batcrate: [2, 1], a_rocket: [1, 2], a_rocketcrate: [2, 2], a_shells: [1, 1], a_cellbox: [2, 1],
    l_bag: [2, 2], l_phone: [1, 2], j_tote: [2, 2], j_bag: [1, 2], j_can: [1, 1], j_scrap: [2, 1] };
  const FIXED = /^(cart_(homealone|uponly|pretzel|valet|blink|sequel|pocket|grave)|pill_(blister|kitty|loz|reserve|maybe|stars)|odd_(chatty|zapper|procon|floppy|egg|leaky|3d|remote|boxlot|display|blowkit|guide|mint|clearance))$/;
  for (const k in D.ITEMS) { if (FIXED.test(k)) continue; const z = SIZE[k] || [1, 1]; D.ITEMS[k].w = z[0]; D.ITEMS[k].h = z[1]; } }
D.GUNS = Object.keys(D.ITEMS).filter(k => D.ITEMS[k].type === 'WEAPON');
D.AMMO = Object.keys(D.ITEMS).filter(k => D.ITEMS[k].type === 'AMMO');
D.LINDA = Object.keys(D.ITEMS).filter(k => D.ITEMS[k].linda);
D.CARTS = Object.keys(D.ITEMS).filter(k => k.startsWith('cart_'));
D.ODDS = Object.keys(D.ITEMS).filter(k => k.startsWith('odd_') || /^pill_(blister|kitty|loz|reserve|maybe|stars)$/.test(k));
D.FOODS = Object.keys(D.ITEMS).filter(k => k.startsWith('f_'));
D.JUNK = Object.keys(D.ITEMS).filter(k => k.startsWith('j_'));
D.CASE_ART = ['cart_moon','cart_eye','cart_static','cart_pod','cart_spiral','cart_ruins','cart_cross','cart_volt','cart_smile'];

// fake/real condition: price follows the label until somebody exposes it
D.COND = {
  CART: [['MINT', 25], ['BOXED', 12], ['LOOSE', 0], ['SUN-FADED', -12], ['CHEWED', -25], ['BOOTLEG', -75]],
  ODD:  [['NEW', 25], ['CLEAN', 12], ['USED', 0], ['SCUFFED', -12], ['BROKEN', -50]],
  WEAPON: [['NEW', 25], ['EXCELLENT', 12], ['GOOD', 0], ['FAIR', -12], ['POOR', -25]],
  AMMO: [['FACTORY', 10], ['GOOD', 0], ['DUD LOT', -50]],
  FOOD: [['VERY FRESH', 15], ['FRESH', 0], ['STALE', -15], ['SPOILED', -50]],
  JUNK: [['GARBAGE', 0]],
  PILL: [['LAB PURE', 135], ['PHARMA', 85], ['STREET', 0], ['CUT', -45], ['STARCH', -95]],
};
D.CURSE = ['CLEAN', 'HEXED', 'CURSED', 'DAMNED', 'UNSPEAKABLE'];   // = contraband levels 0..4
D.CURSE_MARKUP = [0, 35, 70, 100, 150];
D.CURSE_NIGHT = [
  '{n} rearranged your stock while you slept.',
  '{n} played itself all night. The power bill noticed.',
  '{n} left a tiny wet footprint on the counter.',
  'Somebody in the vents kept asking for {n} by name.',
];

// reputation. Perks are thresholds, lost if you fall back. Past -100 on a game-over faction ends the run.
D.FACTIONS = {
  food:   { name: 'FOOD COURT',   desc: 'Regulars and mall rats',  mult: .66, over: 'mob' },
  upper:  { name: 'UPPER DECK',   desc: 'Collectors, up the escalator', mult: 1.2, over: 'hitman' },
  cops:   { name: 'MALL COPS',    desc: 'Containment, on a budget', mult: 1, over: 'jailed' },
  dock:   { name: 'LOADING DOCK', desc: 'Fences. No questions.', mult: 1, over: null },
  picket: { name: 'THE PICKETS',  desc: 'On strike since opening', mult: 1, over: 'bomb' },
};
D.PERKS = {
  food:   [[20, '+1 customer a day (referrals)'], [60, 'Tips: warned before inspections'], [-20, '-1 customer a day (poor reviews)']],
  upper:  [[20, 'Sell +15% to the Upper Deck'], [60, 'Gossip: see events early'], [-40, 'Tourists stay away']],
  cops:   [[40, 'Burglars avoid you'], [60, 'Evidence climbs half as fast'], [100, 'No more inspections'], [-20, 'Evidence x1.2'], [-60, 'Evidence x1.5']],
  dock:   [[20, 'Extra fence each Monday'], [60, 'Report tips on inspections'], [-40, 'Fences won\'t deal with you']],
  picket: [[40, 'Crime from Pickets is ignored'], [-40, 'Pickets vandalize more']],
};

D.SERVICES = {
  power:  { name: 'MALL POWER',    desc: 'Lights, test rig, rack unit, pill press.', cost: g => Math.floor(g.day / 10) + 5 },
  jan:    { name: 'JANITOR',       desc: 'Empties the trash can. Skip it and garbage piles up.', cost: g => Math.floor(g.day / 10) + 3 + (g.vandal ? 72 : 0) },
  ins:    { name: 'INSURANCE',     desc: 'Stops burglary.', cost: g => Math.floor(g.netWorth() / 400) + 3 },
  inform: { name: 'MALL INFORMANT', desc: 'Warns you 3 days before inspections.', cost: () => 10, needs: 'informant' },
  ref:    { name: 'FLYER KID',     desc: '+1 buyer and +1 seller tomorrow.', cost: () => 15, needs: 'referral' },
};

D.REAGENTS = {
  base: { name: 'BASE POWDER', cost: 45, tip: 'The active stuff. Up to 2 in a flask. Each one makes 6 pills.' },
  solv: { name: 'SOLVENT', cost: 15, tip: 'One for every base powder or nothing dissolves.' },
  stab: { name: 'STABILIZER', cost: 20, tip: 'Widens the safe heat, and lets it run hotter before it burns.' },
  fill: { name: 'FILLER', cost: 8, tip: 'Up to 2. Each adds 3 pills, costs 15 purity and risks a press jam.' },
};
D.UPGRADES = [
  { id: 'neon',     name: 'FIX THE NEON',    cost: 500,  desc: '+150 attractiveness. The sign stops buzzing in Morse.' },
  { id: 'neon2',    name: 'MOP THE WINDOW',  cost: 750,  req: 'neon', desc: '+150 attractiveness. People can see in now.' },
  { id: 'shelf',    name: 'BACK SHELF',      cost: 400,  desc: 'A second page of stock grid.' },
  { id: 'ram',      name: 'RIG MORE RAM',    cost: 300,  desc: 'Test 2 more cartridges a day on the beige tower.' },
  { id: 'informant',name: 'INFORMANT DEAL',  cost: 300,  desc: 'Unlocks the Mall Informant nightly service.' },
  { id: 'referral', name: 'FLYER KID DEAL',  cost: 200,  desc: 'Unlocks the Flyer Kid nightly service.' },
  { id: 'hop1',     name: 'HOPPER: FLASK TO DRYER', cost: 150, desc: 'Back lab. A cooked flask moves to the evaporator the same night, and can dry before morning.' },
  { id: 'hop2',     name: 'HOPPER: TRAY TO PRESS', cost: 150, desc: 'Back lab. A dry tray moves into the press overnight. Needs the press.' },
  { id: 'hop3',     name: 'HOPPER: JAR TO SCANNER', cost: 150, desc: 'Back lab. A finished jar moves to the scanner overnight.' },
  { id: 'press',    name: 'PILL PRESS',  cost: 350,  desc: 'Installs the pill press in the back lab. Overnight: dry powder becomes jars.' },
  { id: 'grace',    name: 'LINDA\'S GRACE',  cost: 100,  repeat: true, desc: 'One free pass on a missed rent. Doubles in price.' },
  { id: 'permit',   name: 'WEAPONS PERMIT', cost: 600,  reqRep: 20, desc: 'Needs Mall Cops +20. Guns and ammo go legal, at half the markup. Lost if your standing goes negative.' },
  { id: 'secgrace', name: 'NEW FACE\'S GRACE', cost: 300, desc: 'One inspection that would have jailed you does not. Used up when it saves you, then costs $100 more.' },
  { id: 'scrub',    name: 'EVIDENCE SCRUB',  cost: 500,  repeat: true, cd: 14, desc: 'Sets evidence to 0. Cools down for 14 days.' },
];

D.EVENTS = [
  { id: 'tourney', name: 'ARCADE TOURNAMENT', days: 4, w: 15, market: { CART: 30 }, pa: "Attention shoppers. Arcade tournament. Cartridges are suddenly valuable. Do not ask me why. Shut up.", news: 'Tournament at the ARCADE. Carts sell hot.' },
  { id: 'flea',    name: 'FLEA MARKET',       days: 3, w: 15, market: { CART: -25 }, pa: "Attention. The flea market is in the atrium. Cartridges are now worth nothing. Neither are the people selling them.", news: 'Flea market in the atrium. Cartridges are everywhere and cheap.' },
  { id: 'recall',  name: 'PROP PILL RECALL',  days: 4, w: 15, market: { PILL: -35 }, pa: "Attention. Prop Pills have been recalled. Again. Nobody knows what for. Stop buying them. Or do. Shut up.", news: 'Prop Pills recalled again. Nobody knows what for.' },
  { id: 'flu',     name: 'ESCALATOR FLU',     days: 4, w: 15, market: { PILL: 50 }, pa: "Attention. Escalator Flu is going around. Pill prices are up. Please stop licking the handrails.", news: 'Escalator Flu going around. Pills are moving.' },
  { id: 'gadget',  name: 'TECH+ CLOSEOUT',    days: 3, w: 12, market: { ODD: -30 }, pa: "Attention. Tech Plus is dumping stock. Oddware is cheap. I already took what I wanted.", news: 'TECH+ is dumping stock. Oddware prices fall.' },
  { id: 'shortage',name: 'FUTURE WEAR BOOM',  days: 3, w: 12, market: { ODD: 35 }, pa: "Attention. Future Wear children are wearing old tech as jewelry. Oddware is up. I hate them.", news: 'FUTURE WEAR kids want old tech as jewelry. Oddware up.' },
  { id: 'tour',    name: 'GHOST TOUR',        days: 3, w: 10, cursed: 40, pa: "Attention. A ghost tour is booked in. Cursed goods pay more. Tourists, please do not feed the tenants.", news: 'A ghost tour is booked in. Cursed stock pays 40% more.' },
  { id: 'sweep',   name: 'COMMITTEE SWEEP',   days: 3, w: 8,  sweep: true, pa: "Attention tenants. The Sequel Committee is sweeping. Expect inspectors sooner. I gave them your name.", news: 'Sequel Committee sweep. Inspections come faster.' },
  { id: 'brown',   name: 'BROWNOUT',          days: 2, w: 7,  power: 2, pa: "Attention. Rolling brownouts. Power costs double. You will be billed for this announcement.", news: 'Rolling brownouts. Power costs double.' },
  { id: 'strike',  name: 'PICKET LINE',       days: 3, w: 8,  fewer: 1, pa: "Attention. There is a picket line at the doors. Fewer shoppers. Do not make eye contact. They can smell lease agreements.", news: 'Pickets at the doors. Fewer shoppers.' },
  { id: 'lunch',   name: 'LUNCH RUSH',        days: 3, w: 12, market: { FOOD: 40 }, pa: "Attention. Food court lunch rush. Snacks are selling high. Nobody here has ever been full.", news: 'Food court queue is out the door. Snacks sell high.' },
  { id: 'turf',    name: 'DOCK TURF WAR',     days: 4, w: 9,  market: { WEAPON: 40, AMMO: 40 }, pa: "Attention. The Loading Dock is shooting at itself. Guns and ammo are up. Please shop elsewhere in the building.", news: 'Loading Dock is shooting at itself. Guns and ammo are up.' },
  { id: 'none1',   name: 'MUZAK OUTAGE',      days: 2, w: 10, pa: "Attention. The muzak is off. This is what the mall sounds like. I am so sorry.", news: 'The muzak is off. Nobody can remember how the mall felt before.' },
  { id: 'none2',   name: 'UP ONLY WEEK',      days: 7, w: 10, pa: "Attention. Up Only is now enforced on all escalators. Nobody is coming down. This does not affect prices. It affects you.", news: 'Mall Cops enforce UP ONLY on all escalators. Nobody is coming down.' },
  // same-day announcements: Linda says it, prices move right then
  { id: 'fl_cart',  flash: true, name: 'TOP SHELF DAY', days: 1, w: 0, market: { CART: 20 }, pa: 'Attention shoppers. For the rest of today cartridges are fashionable. Unit 9 will charge you more. Good.', news: 'Carts up today.' },
  { id: 'fl_cartd', flash: true, name: 'CART AMNESTY',   days: 1, w: 0, market: { CART: -15 }, pa: 'Attention. Mall Cops found a crate of cartridges in a fountain. Prices are down today. They are damp.', news: 'Carts down today.' },
  { id: 'fl_food',  flash: true, name: 'FRYER FIRE',     days: 1, w: 0, market: { FOOD: 30 }, pa: 'Attention. The fryer is on fire again. Whatever food you have left is worth more today. Shut up and eat it.', news: 'Food up today.' },
  { id: 'fl_foodd', flash: true, name: 'PRETZEL SURPLUS', days: 1, w: 0, market: { FOOD: -30 }, pa: 'Attention. There are too many pretzels. Food prices are down today. Please stop them.', news: 'Food down today.' },
  { id: 'fl_pill',  flash: true, name: 'CHEST COLD DRILL', days: 1, w: 0, market: { PILL: 25 }, pa: 'Attention. This is a chest cold drill. Everybody act sick and buy pills today. This is not a drill.', news: 'Pills up today.' },
  { id: 'fl_odd',   flash: true, name: 'COLLECTOR ON FLOOR', days: 1, w: 0, market: { ODD: 25 }, pa: 'Attention. A collector is loose on the second floor. Oddware is up today. Do not approach. Do sell to him.', news: 'Oddware up today.' },
  { id: 'fl_oddd',  flash: true, name: 'E-WASTE PICKUP',  days: 1, w: 0, market: { ODD: -20 }, pa: 'Attention. The e-waste truck is here. Oddware is worth less today. So is everything. Shut up.', news: 'Oddware down today.' },
  { id: 'fl_gun',   flash: true, name: 'SECURITY AUDIT',  days: 1, w: 0, market: { WEAPON: -25, AMMO: -25 }, pa: 'Attention. Security audit today. Everyone is getting rid of their guns very quickly. Prices are down.', news: 'Guns down today.' },
  { id: 'fl_ghost', flash: true, name: 'SPECTRAL COUPON', days: 1, w: 0, cursed: 25, pa: 'Attention. A spectral coupon is in effect. Cursed goods pay more today. I do not make the rules. I do, actually.', news: 'Cursed goods up today.' },
];

// generic customers: art = silhouette of the shape listed until proper customer PNGs exist.
// intent: buy, sell, trade (both, budget converts), swap, appraise, pill
D.CLIENTS = {
  regular:  { name: 'CART DEALER', fac: 'food',  intent: 'buy',  want: ['CART'], budget: [60, 160], shape: 'dealer',     w: 100, noCurse: .35, say: ['Psst. I buy carts. Got anything that still boots?', 'Coat has two empty pockets. Show me a cart.', 'Anything that isn\'t Static? I have a buyer. I have a guy.'] },
  rat:      { name: 'MALL RAT',           fac: 'food',  intent: 'sell', goods: 'junk', n: [1, 2], shape: 'kid', w: 100, say: ['Found this behind the pretzel stand. You want it?', 'Dead guy\'s locker. Legally. Probably.'] },
  sick:     { name: 'SNIFFLING SHOPPER',  fac: 'food',  intent: 'pill', want: ['PILL'], budget: [60, 140], shape: 'robed', w: 80, say: ['You still dispense those Prop Pills?', 'My doctor said placebo. Yours work better.'] },
  trader:   { name: 'CART TRADER',        fac: 'food',  intent: 'trade', goods: 'cart', n: [1, 2], budget: [40, 110], want: ['CART'], shape: 'dealer', w: 90, say: ['Carts only. Put yours on the counter, and I will open the coat.'] },
  swapper:  { name: 'SWAP MEET GUY',      fac: 'food',  intent: 'swap', shape: 'ghost', w: 80, say: ['Straight swap. Mine for yours. Nobody touches a wallet.'] },
  tinker:   { name: 'ODDWARE TINKERER',   fac: 'food',  intent: 'buy', want: ['ODD'], budget: [120, 300], shape: 'ghost', w: 70, noCurse: .2, say: ['I need parts. Don\'t tell me what it used to be.'] },
  junker:   { name: 'TECH+ RETURNS CLERK', fac: 'food', intent: 'sell', goods: 'odd', n: [1, 2], shape: 'robed', w: 60, say: ['These fell off a shelf. Into my bag.'] },
  appraiser:{ name: 'ESTATE HEIR',        fac: 'upper', intent: 'appraise', shape: 'vane', w: 60, say: ['What would you say this is worth? I\'ll pay you for the opinion.'] },
  collector:{ name: 'UPPER DECK COLLECTOR', fac: 'upper', intent: 'buy', want: ['CART'], budget: [200, 480], minCond: 0, checks: true, noCurse: .5, shape: 'vane', w: 70, say: ['Only clean copies. I will check the label.', 'I collect. You would not understand.'] },
  tourist:  { name: 'LOST TOURIST',       fac: 'upper', intent: 'buy', want: ['CART', 'ODD', 'PILL'], budget: [120, 340], shape: 'vane', w: 40, bonus: 15, say: ['Is this a real mall? I\'ll take a souvenir.'] },
  thrill:   { name: 'CURSE SHOPPER',      fac: 'dock',  intent: 'buy', want: ['CURSED'], budget: [160, 420], shape: 'ghost', w: 70, say: ['Anything that bites? I\'ll pay extra if it bites.'] },
  fence:    { name: 'LOADING DOCK FENCE', fac: 'dock',  intent: 'sell', goods: 'hot', n: [1, 3], shape: 'ghost', w: 80, say: ['Fell off a truck. The truck was also stolen.'] },
  lindaFence: { name: 'NERVOUS VALET', fac: 'dock', intent: 'sell', goods: 'linda', n: [1, 1], shape: 'ghost', w: 18, say: ['This fell out of a very expensive car. You never saw me. It never saw me.'] },
  merc:     { name: 'OFF-DUTY MERC', fac: 'dock', intent: 'buy', want: ['WEAPON', 'AMMO'], budget: [180, 520], shape: 'ghost', w: 60, say: ['Need something that makes a point. Or fires one.', 'Got ammo? I have a thing on Thursday.'] },
  gunrunner: { name: 'BACK-DOOR GUNRUNNER', fac: 'dock', intent: 'sell', goods: 'gun', n: [1, 2], shape: 'ghost', w: 45, say: ['Mall Cops lost these. I found them before they looked.'] },
  guard:    { name: 'KIOSK GUARD', fac: 'food', intent: 'buy', want: ['AMMO'], budget: [40, 140], noCurse: 0, shape: 'kid', w: 35, say: ['The kiosk gives me a gun but no bullets. Budget thing.'] },
  hexer:    { name: 'DOCK HEXER',         fac: 'dock',  intent: 'sell', goods: 'cursed', n: [1, 1], shape: 'ghost', w: 50, say: ['It keeps coming back to me. You take it.'] },
  hungry:   { name: 'FOOD COURT WORKER',     fac: 'food',  intent: 'buy', want: ['FOOD'], budget: [25, 70], shape: 'pat', w: 110, say: ['Food court line is forty minutes. What have you got?', 'Is that food? Is it food-adjacent?'] },
  scav:     { name: 'FOOD DEALER',      fac: 'food',  intent: 'sell', goods: 'food', n: [1, 3], shape: 'pat', w: 70, say: ['Fell off the food court. Best by is more of a suggestion.'] },
  recycler: { name: 'BOTTLE DEPOSIT WOMAN', fac: 'picket', intent: 'buy', want: ['JUNK'], budget: [15, 45], shape: 'robed', w: 45, say: ['I pay for garbage. Do not make it weird.'] },
  picket:   { name: 'STRIKING CLERK',     fac: 'picket', intent: 'trade', goods: 'cart', n: [1, 1], budget: [40, 120], want: ['CART', 'PILL'], shape: 'kid', w: 50, say: ['Strike fund\'s thin. Trade you?'] },
};
D.POOL = { food: ['regular', 'rat', 'sick', 'trader', 'swapper', 'tinker', 'junker', 'hungry', 'scav', 'guard'], upper: ['collector', 'tourist', 'appraiser'], dock: ['thrill', 'fence', 'hexer', 'lindaFence', 'merc', 'gunrunner'], picket: ['picket', 'recycler'] };

// the grid is 30px cells now; every size table above is in the old 60px cells
for (const k in D.ITEMS) { D.ITEMS[k].w *= 2; D.ITEMS[k].h *= 2; }
D.CAST = {
  linda:   { name: 'CEO LINDA',  scale: .8,  feet: 870, say: {} },
  ghost:   { name: 'SPOOKY GHOST', scale: .85, feet: 720, hover: true },
  tiny:    { name: 'TINY SPOOKY',  scale: 1.1, feet: 515, hover: true },
  kid:     { name: 'PEE KID',      scale: .9,  feet: 880 },
  robed:   { name: 'YOKO', scale: .88, feet: 880 },
  monitor: { name: 'NEW FACE', scale: .84, feet: 880 },
  carl:    { name: 'CARL', scale: .9, feet: 880 },
  dennis:  { name: 'DENNIS', scale: .9, feet: 880 },
  wick:    { name: 'WICK', scale: .84, feet: 880 },
  sister:  { name: 'SISTER SAVE-STATE', scale: .86, feet: 880 },
  leafy:   { name: 'LEAFY', scale: .88, feet: 880 },
  stringer: { name: 'COMMITTEE STRINGER', scale: .5, feet: 880 },
  dealer:  { name: 'CART DEALER', scale: .5, feet: 880 },
  pat:     { name: 'PAT', scale: .5, feet: 880 },
  vane:    { name: 'VANE', scale: .5, feet: 880 },
};

D.LOOT = [ // A.S.S. door: scavenging the Lot. Weights normalised at roll time.
  ['cart', 14], ['odd', 16], ['food', 18], ['junk', 34], ['pill', 12], ['ammo', 6], ['nothing', 6],
];
// what each item sounds like when lifted and set down (art/sound grab_x / put_x)
D.MATERIAL_TYPE = { CART: 'cart', FOOD: 'food', JUNK: 'crinkle', PILL: 'pills', WEAPON: 'gun', AMMO: 'metal', ODD: 'gadget' };
D.MATERIAL = {};
for (const [m, ids] of Object.entries({
  heavy: 'odd_crt odd_dome odd_lava odd_clearance', soft: 'odd_plush l_bag j_tote odd_diary',
  paper: 'odd_id odd_coupon odd_photos odd_guide odd_floppy f_bun f_burger', crinkle: 'f_chips f_fries f_bar f_choc f_noodles j_chips j_bag j_cup',
  can: 'f_energy f_juice f_pop j_can odd_battery a_cell', glass: 'l_perfume l_compact odd_crystal odd_jar odd_glow',
  pills: 'odd_rx odd_loose', metal: 'odd_ring l_badge odd_lighter odd_circuit odd_sticher j_shell j_scrap',
  box: 'a_box a_open a_crate a_cellbox a_cellcrate a_batcrate a_rocket a_rocketcrate odd_boxlot odd_stack odd_display odd_mint odd_blowkit',
  cart: 'odd_vhs odd_cd odd_tape',
})) for (const id of ids.split(' ')) { if (!D.ITEMS[id]) console.warn('MATERIAL unknown', id); D.MATERIAL[id] = m; }
D.materialOf = id => D.MATERIAL[id] || D.MATERIAL_TYPE[D.ITEMS[id].type] || 'gadget';
// starts: scenarios, then 3 points of perks with flaws paying points back
D.SCENARIOS = {
  std:   { name: 'THE LEASE',    desc: 'Standard start. Nine carts and a dream.' },
  pills: { name: 'PILL DEALER',  desc: 'You start with the press and extra stock, but only $250.' },
  fence: { name: 'DOCK FENCE',   desc: 'Hot stock, dock friends, and the Mall Cops already know you.' },
  rock:  { name: 'ROCK BOTTOM',  desc: '$0. An empty case. One bad cart.' },
};
D.START_PERKS = {
  lucky: { name: 'LUCKY SHEET', art: 'pk_lucky', cost: 2, desc: 'Haggles land more often, and searches miss your stuff more.' },
  coins: { name: 'NEST EGG',    art: 'pk_coins', cost: 1, desc: 'Start with $200 more.' },
  door:  { name: 'GOOD SPOT',   art: 'pk_door',  cost: 2, desc: 'One extra customer every day.' },
  human: { name: 'ACTUALLY HUMAN', art: 'pk_human', cost: -1, desc: 'Nobody buys it. Mall Cops start at -20 standing.' },
  lease: { name: 'BAD LEASE',   art: 'pk_lease', cost: -2, desc: 'Rent starts 25% higher.' },
  badge: { name: 'KNOWN TO NEW FACE', art: 'pk_badge', cost: -1, desc: 'Start with 25 evidence on file.' },
};
})();
