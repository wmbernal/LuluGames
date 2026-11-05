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

export async function playPositiveSound(settings) {
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
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.setValueAtTime(784, now + 0.09);
    gain.gain.setValueAtTime(settings.soundVolume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  } catch (error) {
    console.warn("Optional game audio could not be played.", error);
  }
}
