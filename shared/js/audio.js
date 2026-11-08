let audioContext;

export async function playInstructionAudio(source, settings) {
  if (!source || !settings.soundEnabled || settings.soundVolume <= 0) {
    return false;
  }

  try {
    const instructionAudio = new Audio(source);
    instructionAudio.volume = Math.min(settings.soundVolume * 4, 1);
    await instructionAudio.play();
    return true;
  } catch (error) {
    console.warn("Optional scenario audio could not be played.", error);
    return false;
  }
}

async function playToneSequence(settings, frequencies, noteInterval) {
  if (!settings.soundEnabled || settings.soundVolume <= 0) {
    return;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    console.warn("This browser does not support optional game audio.");
    return;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContextConstructor();
    }
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    frequencies.forEach((frequency, index) => {
      oscillator.frequency.setValueAtTime(frequency, now + index * noteInterval);
    });
    gain.gain.setValueAtTime(settings.soundVolume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + frequencies.length * noteInterval + 0.12);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + frequencies.length * noteInterval + 0.12);
  } catch (error) {
    console.warn("Optional game audio could not be played.", error);
  }
}

export function playPositiveSound(settings) {
  return playToneSequence(settings, [660, 784], 0.09);
}

export function playCompletionSound(settings) {
  return playToneSequence(settings, [523, 659, 784], 0.12);
}

async function playBellSequence(settings, frequencies, noteInterval, decaySeconds) {
  if (!settings.soundEnabled || settings.soundVolume <= 0) {
    return;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    console.warn("This browser does not support optional game audio.");
    return;
  }

  try {
    if (!audioContext) {
      audioContext = new AudioContextConstructor();
    }
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const now = audioContext.currentTime;
    const partials = [
      [1, 0.16],
      [2.76, 0.045],
      [5.4, 0.018],
    ];
    frequencies.forEach((frequency, index) => {
      const startTime = now + index * noteInterval;
      for (const [ratio, volume] of partials) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const peakGain = settings.soundVolume * volume;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency * ratio, startTime);
        gain.gain.setValueAtTime(peakGain, startTime);
        gain.gain.exponentialRampToValueAtTime(peakGain * 0.01, startTime + decaySeconds);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + decaySeconds);
      }
    });
  } catch (error) {
    console.warn("Optional game audio could not be played.", error);
  }
}

export function playMatchBellSound(settings) {
  return playBellSequence(settings, [784, 988], 0.12, 0.3);
}

export function playMatchCompletionBellSound(settings) {
  return playBellSequence(settings, [659, 784, 988, 1175], 0.13, 0.42);
}
