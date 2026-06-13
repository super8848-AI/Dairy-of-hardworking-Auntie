/* ============ 游戏音效 & BGM（Web Audio，无外部资源） ============ */

const GameAudio = (() => {
  let ctx = null;
  let bgmGain = null;
  let sfxGain = null;
  let bgmTimer = null;
  let bgmStep = 0;
  let muted = false;
  let started = false;

  const MELODY = [
    [523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.18],
    [784, 0.12], [659, 0.12], [523, 0.12], [392, 0.18],
    [440, 0.12], [554, 0.12], [659, 0.12], [880, 0.18],
    [659, 0.12], [554, 0.12], [440, 0.12], [349, 0.22],
  ];

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    bgmGain = ctx.createGain();
    sfxGain = ctx.createGain();
    bgmGain.gain.value = 0.07;
    sfxGain.gain.value = 0.22;
    bgmGain.connect(ctx.destination);
    sfxGain.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    if (!started) {
      started = true;
      startBgm();
    }
  }

  function tone(freq, dur, type = "square", vol = 0.15, when = 0, dest = sfxGain) {
    const c = ensure();
    if (!c || muted) return;
    const t = when || c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function playBgmNote() {
    if (muted || !ctx) return;
    const [freq, dur] = MELODY[bgmStep % MELODY.length];
    tone(freq, dur, "triangle", 0.12, ctx.currentTime, bgmGain);
    if (bgmStep % 4 === 0) tone(freq / 2, dur * 1.2, "sine", 0.06, ctx.currentTime, bgmGain);
    bgmStep++;
  }

  function startBgm() {
    if (bgmTimer) return;
    playBgmNote();
    bgmTimer = setInterval(playBgmNote, 220);
  }

  function stopBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function playCash() {
    resume();
    if (muted || !ctx) return;
    const t = ctx.currentTime;
    tone(880, 0.08, "sine", 0.2, t);
    tone(1175, 0.1, "sine", 0.16, t + 0.04);
    tone(1568, 0.12, "triangle", 0.1, t + 0.08);
  }

  function playCoin() {
    resume();
    if (muted || !ctx) return;
    const t = ctx.currentTime;
    [1400, 1800, 2200].forEach((f, i) => tone(f, 0.06, "sine", 0.08 - i * 0.015, t + i * 0.03));
  }

  function playFlee() {
    resume();
    if (muted || !ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) tone(400 - i * 40, 0.08, "sawtooth", 0.06, t + i * 0.06);
  }

  function playExpose() {
    resume();
    if (muted || !ctx) return;
    tone(220, 0.25, "sawtooth", 0.12);
    tone(185, 0.35, "sawtooth", 0.1, ctx.currentTime + 0.1);
  }

  function toggleMute() {
    muted = !muted;
    if (bgmGain) bgmGain.gain.value = muted ? 0 : 0.07;
    if (sfxGain) sfxGain.gain.value = muted ? 0 : 0.22;
    return muted;
  }

  function isMuted() {
    return muted;
  }

  document.addEventListener(
    "pointerdown",
    () => resume(),
    { once: true }
  );

  return { resume, playCash, playCoin, playFlee, playExpose, toggleMute, isMuted, stopBgm };
})();
