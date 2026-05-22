// Shared AudioContext — browsers suspend audio until the user has interacted
// with the page. We resume it on the first gesture so subsequent playDing()
// calls (triggered by socket events) are never blocked.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

function unlockAudio() {
  getCtx();
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('keydown', unlockAudio);
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);
  document.addEventListener('keydown', unlockAudio);
}

export function playDing() {
  if (typeof window === 'undefined') return;
  try {
    const ac = getCtx();

    const note = (freq: number, vol: number, startAt: number, duration: number) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const t = ac.currentTime + startAt;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.start(t);
      osc.stop(t + duration);
    };

    // Two-tone ding-dong (D6 → B5)
    note(1174.66, 0.35, 0,    1.0);
    note(987.77,  0.28, 0.22, 1.2);
  } catch {
    // AudioContext unavailable — silent fail
  }
}
