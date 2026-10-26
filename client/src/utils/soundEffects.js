/**
 * soundEffects.js
 * Native Web Audio API sound synthesizer for SQI Quiz.
 * Zero external audio files, instant playback, zero network latency.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isMuted() {
  try {
    return localStorage.getItem('sqi_muted') === 'true';
  } catch {
    return false;
  }
}

export function setMuted(muted) {
  try {
    localStorage.setItem('sqi_muted', muted ? 'true' : 'false');
  } catch {}
}

export function toggleMuted() {
  const current = isMuted();
  setMuted(!current);
  return !current;
}

/**
 * Play a synthesized tone with envelope
 */
function playTone(freq, type = 'sine', duration = 0.15, gainValue = 0.1, delay = 0) {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Player joined lobby chime (subtle ascending two-tone)
 */
export function playLobbyJoin() {
  if (isMuted()) return;
  playTone(523.25, 'sine', 0.12, 0.08, 0);       // C5
  playTone(783.99, 'sine', 0.20, 0.08, 0.08);    // G5
}

/**
 * Countdown tick for final seconds
 */
export function playTick(urgent = false) {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(urgent ? 880 : 587, now);

  gain.gain.setValueAtTime(urgent ? 0.15 : 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Game start exaggerated 5-second countdown beep
 */
export function playStartCountdownTick(count) {
  if (isMuted()) return;
  if (count > 1) {
    playTone(440, 'triangle', 0.15, 0.16, 0); // A4
  } else if (count === 1) {
    playTone(659.25, 'triangle', 0.22, 0.20, 0); // E5
  } else {
    // GO!
    playTone(523.25, 'sine', 0.2, 0.18, 0);
    playTone(659.25, 'sine', 0.25, 0.2, 0.06);
    playTone(1046.5, 'sine', 0.45, 0.25, 0.12);
  }
}

/**
 * Score physical count-up rolling tick
 */
export function playScoreTick() {
  if (isMuted()) return;
  playTone(500 + Math.random() * 250, 'sine', 0.04, 0.05, 0);
}

/**
 * Thrilling overtake sound when a player climbs up in standings
 */
export function playOvertake() {
  if (isMuted()) return;
  playTone(392.00, 'triangle', 0.20, 0.16, 0);     // G4
  playTone(523.25, 'triangle', 0.25, 0.18, 0.10);  // C5
  playTone(659.25, 'sine',     0.35, 0.22, 0.20);  // E5
  playTone(1046.50, 'sine',    0.55, 0.26, 0.32);  // C6
}

/**
 * Suspenseful Drumroll tension for podium reveal
 */
export function playDrumroll(duration = 1.6) {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const steps = Math.floor(duration * 20);
  for (let i = 0; i < steps; i++) {
    const delay = (i / steps) * duration;
    const freq = 120 + Math.random() * 60;
    const gainVal = 0.03 + (i / steps) * 0.07;
    playTone(freq, 'triangle', 0.035, gainVal, delay);
  }
}

/**
 * Single place spotlight hit on podium
 */
export function playPodiumSpotlight(rank) {
  if (isMuted()) return;
  if (rank === 3) {
    playTone(440, 'triangle', 0.35, 0.18, 0);
    playTone(554.37, 'sine', 0.4, 0.15, 0.08);
  } else if (rank === 2) {
    playTone(554.37, 'triangle', 0.35, 0.18, 0);
    playTone(659.25, 'sine', 0.45, 0.18, 0.08);
  } else if (rank === 1) {
    playFanfare();
  }
}

/**
 * Question reveal chime (rich major chord)
 */
export function playReveal() {
  if (isMuted()) return;
  playTone(440.00, 'triangle', 0.4, 0.10, 0);     // A4
  playTone(554.37, 'sine',     0.5, 0.12, 0.06);  // C#5
  playTone(659.25, 'sine',     0.6, 0.14, 0.12);  // E5
  playTone(880.00, 'sine',     0.8, 0.15, 0.18);  // A5
}

/**
 * Tactile answer lock-in pop for player
 */
export function playLockIn() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Question intro subtle suspense tone (Kahoot-style question announcement)
 */
export function playQuestionIntro() {
  if (isMuted()) return;
  playTone(329.63, 'sine', 0.25, 0.12, 0);       // E4
  playTone(493.88, 'sine', 0.40, 0.14, 0.12);    // B4
}

/**
 * Options pop in sound when question options reveal
 */
export function playOptionsPop() {
  if (isMuted()) return;
  playTone(523.25, 'triangle', 0.12, 0.14, 0);     // C5
  playTone(659.25, 'triangle', 0.15, 0.16, 0.05);  // E5
  playTone(783.99, 'sine',     0.22, 0.18, 0.10);  // G5
}

/**
 * Podium Victory Fanfare
 */
export function playFanfare() {
  if (isMuted()) return;
  const notes = [
    { f: 523.25, d: 0.15, delay: 0 },     // C5
    { f: 659.25, d: 0.15, delay: 0.12 },  // E5
    { f: 783.99, d: 0.20, delay: 0.24 },  // G5
    { f: 1046.50, d: 0.60, delay: 0.40 }, // C6
  ];

  notes.forEach((n) => {
    playTone(n.f, 'triangle', n.d, 0.18, n.delay);
  });
}
