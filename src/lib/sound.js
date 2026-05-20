const Sound = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  play(type) {
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      switch(type) {
        case "tap": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(400, now+0.1);
          g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.1);
          o.start(now); o.stop(now+0.1); break;
        }
        case "select": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(660, now+0.12);
          g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
          o.start(now); o.stop(now+0.15); break;
        }
        case "save": {
          [523, 659, 784, 1047].forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "sine";
            const t = now + i * 0.08;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t+0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.25);
            o.start(t); o.stop(t+0.25);
          }); break;
        }
        case "levelup": {
          [523,659,784,1047,1319].forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "triangle";
            const t = now + i * 0.1;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t+0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.3);
            o.start(t); o.stop(t+0.3);
          }); break;
        }
        case "milestone": {
          const freqs = [392,494,587,740,880,1047];
          freqs.forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "sine";
            const t = now + i * 0.07;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t+0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.28);
            o.start(t); o.stop(t+0.28);
          }); break;
        }
        case "unlock": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o2.connect(g2); g2.connect(ctx.destination); o2.type = "sine";
          o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(880, now+0.4);
          g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.5);
          o2.frequency.setValueAtTime(330, now+0.1); o2.frequency.exponentialRampToValueAtTime(1320, now+0.5);
          g2.gain.setValueAtTime(0.15, now+0.1); g2.gain.exponentialRampToValueAtTime(0.001, now+0.6);
          o.start(now); o.stop(now+0.5);
          o2.start(now+0.1); o2.stop(now+0.6); break;
        }
        case "swipe": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(600, now+0.08);
          g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.1);
          o.start(now); o.stop(now+0.1); break;
        }
        default: break;
      }
    } catch(e) {}
  }
};

export default Sound;
