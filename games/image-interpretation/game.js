export function createSession(scenes, rounds) {
  if (!Array.isArray(scenes) || !Number.isInteger(rounds) || rounds < 1 || rounds > scenes.length) {
    throw new RangeError("A session needs enough scenes for the requested rounds.");
  }
  for (const scene of scenes.slice(0, rounds)) {
    if (!scene.id || !scene.image || !scene.alt || !scene.hint || !Array.isArray(scene.options)
      || scene.options.length !== 3 || new Set(scene.options.map((option) => option.id)).size !== 3
      || scene.options.some((option) => !option.id || !option.text)
      || scene.options.filter((option) => option.id === scene.answer).length !== 1) {
      throw new TypeError("Each scene must have an image, a hint and three distinct options with one answer.");
    }
  }
  return { phase: "playing", scenes, rounds, roundIndex: 0, mistakes: 0, selectedId: null, feedback: "" };
}

export function chooseAnswer(state, optionId) {
  if (state.phase !== "playing") return state;
  const scene = state.scenes[state.roundIndex];
  if (!scene.options.some((option) => option.id === optionId)) {
    throw new RangeError("The chosen answer is not in this scene.");
  }
  if (optionId === scene.answer) {
    return { ...state, phase: "correct", selectedId: optionId, feedback: "Muito bem! Essa frase combina com a imagem." };
  }
  return {
    ...state,
    mistakes: state.mistakes + 1,
    selectedId: optionId,
    feedback: state.mistakes % 2 === 0
      ? "Vamos olhar a imagem de novo?"
      : "Vamos tentar outra frase?",
  };
}

export function nextRound(state) {
  if (state.phase !== "correct") return state;
  if (state.roundIndex + 1 === state.rounds) return { ...state, phase: "complete" };
  return { ...state, phase: "playing", roundIndex: state.roundIndex + 1, mistakes: 0, selectedId: null, feedback: "" };
}
