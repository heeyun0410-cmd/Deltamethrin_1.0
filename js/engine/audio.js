/* =====================================================================
   DELTAMETHRIN — 오디오
   WebAudio 로 BGM/효과음을 합성합니다.
   ASSETS.BGM / ASSETS.SFX 에 파일 경로가 지정되면 그 파일을 우선 재생합니다.
   ===================================================================== */
const Audio2 = (() => {
  let ctx = null, master, bgmBus, sfxBus, verb, noiseBuf;
  let vol = { bgm: .7, sfx: .8 };
  let current = { id: null, stop: null, el: null };

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = vol.bgm;
    sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx;
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.4);
    const verbGain = ctx.createGain(); verbGain.gain.value = .55;
    verb.connect(verbGain); verbGain.connect(master);
    bgmBus.connect(master); sfxBus.connect(master);
    bgmBus.connect(verb); sfxBus.connect(verb);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  const now = () => ctx.currentTime;

  // ---------- 합성 도구 ----------
  function osc(type, f, g0, dest, t0 = now()) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = 0;
    g.gain.setTargetAtTime(g0, t0, 1.2);
    o.connect(g); g.connect(dest); o.start(t0);
    return { o, g, stop: (t = .8) => { g.gain.setTargetAtTime(0, now(), t / 3); o.stop(now() + t * 2); } };
  }
  function noise(dest, { type = 'bandpass', f = 1000, q = 1, g = .2, dur = .3, a = .01, pan = 0, t0 = now() } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const gg = ctx.createGain(); gg.gain.setValueAtTime(0, t0); gg.gain.linearRampToValueAtTime(g, t0 + a); gg.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    s.connect(fl); fl.connect(gg);
    if (p) { p.pan.value = pan; gg.connect(p); p.connect(dest); } else gg.connect(dest);
    s.start(t0, Math.random()); s.stop(t0 + dur + .05);
    return fl;
  }
  function tone(dest, { type = 'sine', f = 440, g = .2, dur = .4, a = .005, t0 = now(), slide = 0 } = {}) {
    const o = ctx.createOscillator(), gg = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t0 + dur);
    gg.gain.setValueAtTime(0, t0); gg.gain.linearRampToValueAtTime(g, t0 + a); gg.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(gg); gg.connect(dest); o.start(t0); o.stop(t0 + dur + .05);
  }
  function bell(dest, f = 220, g = .25, t0 = now()) {
    [1, 2.01, 2.76, 4.07, 5.43].forEach((m, i) => tone(dest, { f: f * m, g: g / (i + 1.4), dur: 5 - i * .7, a: .002, t0 }));
  }
  // 반복 스케줄러
  function loop(fn, ms) { fn(); const id = setInterval(fn, ms); return () => clearInterval(id); }
  function pad(dest, freqs, type = 'triangle', g = .05) {
    const parts = freqs.map(f => { const p = osc(type, f, g, dest); p.o.detune.value = (Math.random() - .5) * 10; return p; });
    return () => parts.forEach(p => p.stop(2));
  }
  function chant(dest, g = .06) {
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 700; fl.Q.value = 4; fl.connect(dest);
    const fl2 = ctx.createBiquadFilter(); fl2.type = 'bandpass'; fl2.frequency.value = 1150; fl2.Q.value = 6; fl2.connect(dest);
    const notes = [146.8, 146.8, 164.8, 146.8, 130.8, 146.8];
    let i = 0;
    return loop(() => {
      const t0 = now();
      for (let k = 0; k < 4; k++) {
        const f = notes[(i + k) % notes.length];
        [0, 3, 7].forEach(dt => {
          const o = ctx.createOscillator(), gg = ctx.createGain();
          o.type = 'sawtooth'; o.frequency.value = f * (1 + dt * .0007); o.detune.value = dt * 3;
          gg.gain.setValueAtTime(0, t0 + k * .75); gg.gain.linearRampToValueAtTime(g, t0 + k * .75 + .08); gg.gain.linearRampToValueAtTime(0, t0 + k * .75 + .7);
          o.connect(gg); gg.connect(fl); gg.connect(fl2); o.start(t0 + k * .75); o.stop(t0 + k * .75 + .75);
        });
      }
      i++;
    }, 3000);
  }

  const BGM = {
    title: d => { const a = pad(d, [55, 82.4, 110.3], 'sine', .07); const b = loop(() => bell(d, 196, .08), 9000); return () => { a(); b(); }; },
    prayer: d => { const a = pad(d, [73.4, 110], 'sine', .06); const b = chant(d, .05); return () => { a(); b(); }; },
    daily: d => {
      const chords = [[110, 164.8, 220, 261.6], [98, 146.8, 196, 246.9], [87.3, 130.8, 174.6, 220], [98, 146.8, 196, 233.1]];
      let stop = null, i = 0;
      const c = loop(() => { if (stop) stop(); stop = pad(d, chords[i++ % chords.length], 'triangle', .028); }, 7000);
      const b = loop(() => bell(d, 392, .03), 14000);
      return () => { c(); b(); stop && stop(); };
    },
    quiet: d => { const a = pad(d, [130.8, 196], 'sine', .035); const b = loop(() => tone(d, { f: 783.99 * (Math.random() < .5 ? 1 : 1.122), g: .025, dur: 3, a: .4 }), 6000); return () => { a(); b(); }; },
    cathedral: d => { const a = pad(d, [65.4, 98, 130.8, 196, 261.6], 'sine', .035); const b = loop(() => bell(d, 130.8, .05), 12000); return () => { a(); b(); }; },
    whisper: d => { const a = pad(d, [61.7, 65.4], 'sine', .06); const b = loop(() => { for (let k = 0; k < 5; k++) noise(d, { f: 1800 + Math.random() * 2500, q: 2, g: .05, dur: .3 + Math.random() * .5, a: .08, pan: Math.random() * 2 - 1, t0: now() + Math.random() * 1.5 }); }, 1800); return () => { a(); b(); }; },
    death: d => { const a = pad(d, [41.2, 43.65, 61.7, 92.5], 'sawtooth', .018); const l = ctx.createBiquadFilter(); return () => { a(); }; },
    purify: d => { const a = pad(d, [49, 73.4], 'sine', .07); const b = loop(() => { const t = now(); for (let k = 0; k < 4; k++) { tone(d, { f: 55, g: .22, dur: .35, t0: t + k * .5, slide: -20 }); noise(d, { f: 4000, q: 8, g: .06, dur: .05, t0: t + k * .5 + .25 }); } }, 2000); return () => { a(); b(); }; },
    purify_prayer: d => { const a = BGM.purify(d); const b = chant(d, .025); return () => { a(); b(); }; },
    machine: d => { const a = pad(d, [60, 120, 180.3], 'sawtooth', .012); const b = loop(() => { noise(d, { f: 2500, q: 10, g: .05, dur: .06 }); }, 900); return () => { a(); b(); }; },
    mother_room: d => { const a = BGM.machine(d); const b = pad(d, [261.6, 329.6, 392, 523.3], 'sine', .022); const c = chant(d, .02); return () => { a(); b(); c(); }; },
    heartbeat: d => { const a = pad(d, [36.7, 55], 'sine', .05); const b = loop(() => { const t = now(); tone(d, { f: 60, g: .4, dur: .25, t0: t, slide: -25 }); tone(d, { f: 52, g: .3, dur: .25, t0: t + .28, slide: -20 }); }, 1400); return () => { a(); b(); }; },
    wings: d => { const a = pad(d, [41.2, 58.3, 87.3], 'sawtooth', .014); const b = loop(() => { for (let k = 0; k < 6; k++) noise(d, { f: 3000 + Math.random() * 3000, q: 1, g: .04, dur: .08, t0: now() + Math.random() }); }, 1100); return () => { a(); b(); }; },
    final: d => pad(d, [55], 'sine', .012),
    ending: d => {
      const chords = [[130.8, 196, 246.9, 329.6], [110, 164.8, 220, 261.6], [116.5, 174.6, 233.1, 293.7]];
      let stop = null, i = 0;
      const c = loop(() => { if (stop) stop(); stop = pad(d, chords[i++ % chords.length], 'sine', .03); }, 9000);
      return () => { c(); stop && stop(); };
    }
  };

  const SFX = {
    text: d => tone(d, { type: 'square', f: 1800 + Math.random() * 200, g: .012, dur: .03 }),
    click: d => tone(d, { type: 'triangle', f: 660, g: .08, dur: .08 }),
    confirm: d => { tone(d, { f: 523, g: .1, dur: .2 }); tone(d, { f: 784, g: .08, dur: .35, t0: now() + .06 }); },
    warn: d => { tone(d, { type: 'sawtooth', f: 110, g: .15, dur: .6 }); tone(d, { type: 'sawtooth', f: 116.5, g: .15, dur: .6 }); },
    bell: d => bell(d, 220, .28),
    bell_low: d => bell(d, 110, .3),
    bell_far: d => bell(d, 330, .08),
    whisper: d => { for (let k = 0; k < 4; k++) noise(d, { f: 2400 + Math.random() * 2000, q: 2, g: .07, dur: .4, a: .1, pan: Math.random() * 2 - 1, t0: now() + k * .15 }); },
    paper: d => { noise(d, { type: 'highpass', f: 2500, g: .15, dur: .18 }); noise(d, { type: 'highpass', f: 3500, g: .1, dur: .12, t0: now() + .12 }); },
    machine: d => { tone(d, { type: 'sawtooth', f: 60, g: .1, dur: 1.2 }); },
    wing: d => { for (let k = 0; k < 14; k++) noise(d, { f: 2000 + Math.random() * 4000, q: 1.5, g: .09, dur: .05 + Math.random() * .05, t0: now() + k * .04 + Math.random() * .03 }); },
    glitch: d => { for (let k = 0; k < 10; k++) { tone(d, { type: 'square', f: 80 + Math.random() * 900, g: .05, dur: .04, t0: now() + k * .035 }); } noise(d, { type: 'lowpass', f: 6000, g: .12, dur: .4 }); },
    knock: d => { [0, .22].forEach(t => { tone(d, { f: 140, g: .35, dur: .12, t0: now() + t, slide: -60 }); noise(d, { type: 'lowpass', f: 800, g: .2, dur: .08, t0: now() + t }); }); },
    door: d => { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 8; o.type = 'sawtooth'; o.frequency.setValueAtTime(90, now()); o.frequency.linearRampToValueAtTime(140, now() + .5); o.frequency.linearRampToValueAtTime(70, now() + 1.1); g.gain.setValueAtTime(0, now()); g.gain.linearRampToValueAtTime(.12, now() + .1); g.gain.linearRampToValueAtTime(0, now() + 1.2); o.connect(f); f.connect(g); g.connect(d); o.start(); o.stop(now() + 1.3); },
    thud: d => { tone(d, { f: 70, g: .7, dur: .9, slide: -40 }); noise(d, { type: 'lowpass', f: 400, g: .4, dur: .4 }); },
    applause: d => { for (let k = 0; k < 60; k++) noise(d, { f: 1500 + Math.random() * 3000, q: 1, g: .05, dur: .03, t0: now() + Math.random() * 2.2, pan: Math.random() * 2 - 1 }); },
    applause_fade: d => { for (let k = 0; k < 30; k++) noise(d, { f: 1500 + Math.random() * 3000, q: 1, g: .05 * (1 - k / 30), dur: .03, t0: now() + k * .04, pan: Math.random() * 2 - 1 }); },
    steps: d => { for (let k = 0; k < 5; k++) tone(d, { f: 90, g: .2 * (1 - k * .17), dur: .1, t0: now() + k * .45, slide: -30 }); },
    step3d: d => tone(d, { f: 85, g: .12, dur: .1, slide: -30 }),
    tear: d => noise(d, { type: 'highpass', f: 1500, g: .25, dur: .45, a: .05 }),
    pen: d => { for (let k = 0; k < 8; k++) noise(d, { f: 5000, q: 6, g: .04, dur: .05, t0: now() + k * .07 }); },
    box_open: d => { tone(d, { f: 300, g: .12, dur: .1 }); SFX.door(d); },
    burn: d => { for (let k = 0; k < 40; k++) noise(d, { f: 1200 + Math.random() * 2000, q: 2, g: .04, dur: .05, t0: now() + Math.random() * 3 }); noise(d, { type: 'lowpass', f: 500, g: .08, dur: 3, a: .5 }); },
    item: d => { tone(d, { f: 880, g: .06, dur: .3 }); tone(d, { f: 1318, g: .05, dur: .5, t0: now() + .08 }); },
    prayer_low: d => { const s = chant(d, .04); setTimeout(s, 3100); },
    hold: d => tone(d, { type: 'sine', f: 220, g: .03, dur: .08 })
  };

  function stopBgm(fade = 1.2) {
    if (current.stop) { try { current.stop(); } catch (e) { } }
    if (current.el) { const el = current.el; const iv = setInterval(() => { el.volume = Math.max(0, el.volume - .08); if (el.volume <= 0) { el.pause(); clearInterval(iv); } }, 80); }
    current = { id: null, stop: null, el: null };
  }
  function bgm(id) {
    if (current.id === id) return;
    stopBgm();
    current.id = id;
    if (!id) return;
    const file = (typeof ASSETS !== 'undefined') && ASSETS.BGM[id];
    if (file) { const el = new Audio(file); el.loop = true; el.volume = vol.bgm; el.play().catch(() => { }); current.el = el; return; }
    if (!ctx || !BGM[id]) return;
    const bus = ctx.createGain(); bus.gain.value = 0; bus.connect(bgmBus);
    bus.gain.setTargetAtTime(1, now(), .8);
    const s = BGM[id](bus);
    current.stop = () => { bus.gain.setTargetAtTime(0, now(), .5); setTimeout(() => { try { s && s(); } catch (e) { } bus.disconnect(); }, 2500); };
  }
  function sfx(id) {
    const file = (typeof ASSETS !== 'undefined') && ASSETS.SFX[id];
    if (file) { const el = new Audio(file); el.volume = vol.sfx; el.play().catch(() => { }); return; }
    if (!ctx || !SFX[id] || ctx.state !== 'running') return;
    try { SFX[id](sfxBus); } catch (e) { }
  }
  function setVolume(k, v) {
    vol[k] = v;
    if (ctx) { (k === 'bgm' ? bgmBus : sfxBus).gain.setTargetAtTime(v, now(), .05); }
    if (k === 'bgm' && current.el) current.el.volume = v;
  }
  function restart() { const id = current.id; current.id = null; bgm(id); }
  return { init, bgm, sfx, setVolume, stopBgm, restart, get id() { return current.id; } };
})();
