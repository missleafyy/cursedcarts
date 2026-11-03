// Rendered sounds (tools/make_sounds.py). Replaces the chip synth: S.sfx(name), S.voice(character), S.soundScene({...}).
(function () {
const S = window.Sprout, DATA = window.SOUND_DATA || {};
const KEY = 'cursedcarts-audio';
const VOLS = S.vol = { master: 15, music: 11, sfx: 15, muteM: false, muteS: false, muted: false };
try { Object.assign(VOLS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
let ac = null; const buf = {}, count = {}, last = {}; let sfxBus, ambBus, musicBus, musicLP, master, voiceWet, started = false, lastVoice = 0;
const LOOPS = { muzak: null, amb_mall: null, amb_lab: null, amb_lot: null };
const VOL = { select: .5, pickup: .55, drop: .6, coin: .6, till: .7, stamp: .9, door: .7, shutteropen: .65, shutterclose: .7, bell: .6, step: .4, bump: .55, cancel: .6, exclaim: .6, curse: .6, save: .55, paper: .45, crt: .5, phone: .6, glass: .55, pour: .55, clunk: .7, scan: .45, crate: .7, dial: .4, rummage: .6, grin: .85, jar: .55, night: .55 };
const ALIAS = { cursor: 'select', pickup: 'select', blip: 'dial', hit: 'curse' };
// pitch of the little talking grains; radio = heard through a speaker
const VOICES = { carl: { r: .66 }, linda: { r: 1.18, gap: .9 }, ghost: { r: 1.0, wob: .16 }, tiny: { r: 1.75 }, kid: { r: 1.5 }, robed: { r: .86 }, monitor: { r: .92, radio: true }, dennis: { r: 1.04 }, wick: { r: .72, gap: 1.25 }, sister: { r: 1.36 }, leafy: { r: 1.42 } };
function init() {
  if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .18;
  master = ac.createGain(); master.gain.value = S.audio.muted ? 0 : .9; master.connect(comp); comp.connect(ac.destination);
  sfxBus = ac.createGain(); sfxBus.connect(master); ambBus = ac.createGain(); ambBus.connect(master);
  musicLP = ac.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 9000; musicLP.Q.value = .4; musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(musicLP); musicLP.connect(master);
  S.applyVol();
  for (const n in DATA) { const bin = atob(DATA[n]), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); const k = n.replace(/\d+$/, ''); ac.decodeAudioData(a.buffer, b => { buf[n] = b; if (!(n in LOOPS)) count[k] = (count[k] || 0) + 1; if (n in LOOPS) startLoop(n); S.soundsLoaded = (S.soundsLoaded || 0) + 1; }, () => console.warn('sound failed: ' + n)); }
}
function startLoop(n) {
  const src = ac.createBufferSource(); src.buffer = buf[n]; src.loop = true; const g = ac.createGain(); g.gain.value = 0; src.connect(g);
  if (n === 'muzak') g.connect(musicBus), g.gain.value = 1; else if (n === 'amb_mall') { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; g.connect(lp); lp.connect(ambBus); LOOPS.mallLP = lp; } else g.connect(ambBus);
  src.start(); LOOPS[n] = g;
}
function play(n, o = {}) {
  if (!ac || ac.state !== 'running') return;
  n = ALIAS[n] || n; const c = count[n]; if (!c) return;
  const b = buf[n + '0'];   // one action, one sound: no variants if (!b) return;
  const src = ac.createBufferSource(); src.buffer = b; src.playbackRate.value = o.rate || 1;
  const g = ac.createGain(); g.gain.value = (o.vol ?? 1) * (VOL[n] ?? .6); src.connect(g); g.connect(sfxBus); src.start();
}
S.sfx = n => play(n);
S.voice = (who, ch) => {
  if (!ac || ac.state !== 'running') return;
  const now = ac.currentTime, v = VOICES[who] || { r: .85 + (String(who).length % 5) * .12 }; if (now - lastVoice < .06 * (v.gap || 1)) return; lastVoice = now;
  const code = String(ch || 'a').toLowerCase().charCodeAt(0), k = (v.radio ? 'r' : 'v') + (code % 5), b = buf[k]; if (!b) return;   // the same letter always makes the same sound
  const src = ac.createBufferSource(); src.buffer = b; src.playbackRate.value = v.r * (1 + (v.wob ? Math.sin(code) * v.wob : 0));
  const g = ac.createGain(); g.gain.value = .34; src.connect(g); g.connect(sfxBus); src.start();
};
// called every frame: where are we, and how much of the mall comes through the shutter?
S.soundScene = o => {
  if (!ac || ac.state !== 'running') return; const t = ac.currentTime, set = (p, v, tc = .5) => p.setTargetAtTime(v, t, tc);
  if (LOOPS.amb_mall) set(LOOPS.amb_mall.gain, o.mall ?? 0);
  if (LOOPS.amb_lab) set(LOOPS.amb_lab.gain, o.lab ?? 0);
  if (LOOPS.amb_lot) set(LOOPS.amb_lot.gain, o.lot ?? 0);
  if (LOOPS.mallLP) set(LOOPS.mallLP.frequency, o.muffle ?? 9000);
  set(musicLP.frequency, o.muffle ?? 9000); set(musicBus.gain, (o.music ?? 0) * (VOLS.muteM ? 0 : VOLS.music / 11), .8);
};
const unlock0 = S.audio.unlock.bind(S.audio);
S.audio.unlock = () => { init(); if (ac && ac.state === 'suspended') ac.resume(); };
S.applyVol = save => { if (master) { master.gain.value = VOLS.muted || S.audio.muted ? 0 : VOLS.master / 15 * .9; const f = VOLS.muteS ? 0 : VOLS.sfx / 15; sfxBus.gain.value = f; ambBus.gain.value = f; } if (save) try { localStorage.setItem(KEY, JSON.stringify(VOLS)); } catch (e) {} };
S.audio.setMute = m => { S.audio.muted = m; S.applyVol(); };
S.audio.update = () => {}; S.music = () => {};
S.soundLevel = () => { if (!ac) return 'no ctx'; if (!S._an) { S._an = ac.createAnalyser(); S._an.fftSize = 8192; master.connect(S._an); } const d = new Float32Array(8192); S._an.getFloatTimeDomainData(d); let e = 0; for (const v of d) e += v * v; return ac.state + ' rms=' + Math.sqrt(e / d.length).toFixed(4); };
S.soundHas = n => { n = ALIAS[n] || n; return !!count[n]; };
S.soundInit = init; init();
})();
