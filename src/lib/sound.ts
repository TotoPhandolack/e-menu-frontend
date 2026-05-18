// Synthesise a bell-like "ding" using Web Audio API — no audio file needed.
export function playDing() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();

    const note = (freq: number, vol: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const t = ctx.currentTime + startAt;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.start(t);
      osc.stop(t + duration);
    };

    // Two-tone ding-dong (D6 → B5)
    note(1174.66, 0.35, 0,    1.0);
    note(987.77,  0.28, 0.22, 1.2);

    setTimeout(() => ctx.close(), 2000);
  } catch {
    // AudioContext blocked or unavailable — silent fail
  }
}
