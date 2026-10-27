// Web Audio API notification sound generator for real-time order alerts
// Generates clean, pleasant retail notification chimes with zero external audio assets

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Checks whether audio notifications are enabled in user settings
 */
export function isAudioAlertEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('babyzone_audio_enabled') !== 'false';
  } catch {
    return true;
  }
}

/**
 * Toggles audio notifications on/off
 */
export function setAudioAlertEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('babyzone_audio_enabled', enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Play a high-quality three-tone retail chime when a new order is received
 * Notes: D5 (587.33 Hz) -> A5 (880.00 Hz) -> D6 (1174.66 Hz)
 */
export function playOrderAlertChime() {
  if (!isAudioAlertEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (freq, startTime, duration, gainLevel = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and pleasant exponential release
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    const now = ctx.currentTime + 0.05;
    playTone(587.33, now, 0.22, 0.28);        // D5
    playTone(880.00, now + 0.14, 0.26, 0.32); // A5
    playTone(1174.66, now + 0.28, 0.45, 0.24); // D6
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

/**
 * Play a subtle soft double-tone for general real-time updates (status, review, etc.)
 */
export function playUpdateChime() {
  if (!isAudioAlertEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.log(e)
  }
}
