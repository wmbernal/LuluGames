export function shuffleCards(cards, random = Math.random) {
  const shuffledCards = [...cards];
  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomValue = random();
    if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
      throw new RangeError("The random source must return a value between zero and one.");
    }
    const swapIndex = Math.floor(randomValue * (index + 1));
    [shuffledCards[index], shuffledCards[swapIndex]] = [shuffledCards[swapIndex], shuffledCards[index]];
  }
  return shuffledCards;
}

export function createMatchBoard(theme, roundIndex = 0, random = Math.random) {
  if (!theme?.id || !theme?.label || !Array.isArray(theme.rounds)) {
    throw new TypeError("A theme with matching rounds is required.");
  }
  if (!Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex >= theme.rounds.length) {
    throw new RangeError("The selected theme does not have this round.");
  }
  const pairs = theme.rounds[roundIndex];
  if (pairs.length !== 6) {
    throw new TypeError("Each theme round must contain exactly six picture pairs.");
  }

  const leftCards = [];
  const rightCards = [];

  for (const pair of pairs) {
    if (
      !pair.pairId
      || !Array.isArray(pair.cards)
      || pair.cards.length !== 2
      || pair.cards.some((card) => !card.icon || !card.label)
    ) {
      throw new TypeError(`Pair "${pair.pairId ?? "unknown"}" must define two labeled pictures.`);
    }
    leftCards.push({
      ...pair.cards[0],
      pairId: pair.pairId,
      matched: false,
      id: `${pair.pairId}-left`,
    });
    rightCards.push({
      ...pair.cards[1],
      pairId: pair.pairId,
      matched: false,
      id: `${pair.pairId}-right`,
    });
  }

  return {
    phase: "playing",
    themeId: theme.id,
    themeLabel: theme.label,
    leftCards: shuffleCards(leftCards, random),
    rightCards: shuffleCards(rightCards, random),
    matchedPairs: 0,
    totalPairs: 6,
    feedback: "",
  };
}

export function matchCards(state, firstCardId, secondCardId) {
  if (state.phase !== "playing" || firstCardId === secondCardId) {
    return state;
  }
  const firstCard = [...state.leftCards, ...state.rightCards].find((card) => card.id === firstCardId);
  const secondCard = [...state.leftCards, ...state.rightCards].find((card) => card.id === secondCardId);
  if (!firstCard || !secondCard || firstCard.matched || secondCard.matched) {
    return state;
  }
  if (state.leftCards.some((card) => card.id === firstCardId)
    === state.leftCards.some((card) => card.id === secondCardId)) {
    return {
      ...state,
      feedback: "Escolha uma carta de cada lado.",
      feedbackType: "neutral",
    };
  }
  if (firstCard.pairId !== secondCard.pairId) {
    return {
      ...state,
      feedback: "Essa combinação não corresponde. Tente outra.",
      feedbackType: "neutral",
    };
  }

  const matchedIds = new Set([firstCardId, secondCardId]);
  const matchedPairs = state.matchedPairs + 1;
  const leftCard = state.leftCards.find((card) => matchedIds.has(card.id));
  const rightCard = state.rightCards.find((card) => matchedIds.has(card.id));
  const updateMatches = (cards) => cards.map((card) => (
    matchedIds.has(card.id) ? { ...card, matched: true } : card
  ));
  return {
    ...state,
    phase: matchedPairs === state.totalPairs ? "finished" : "playing",
    leftCards: updateMatches(state.leftCards),
    rightCards: updateMatches(state.rightCards),
    matchedPairs,
    feedback: `${leftCard.label} combina com ${rightCard.label}.`,
    feedbackType: "positive",
  };
}

export function isGameFinished(state) {
  return state.phase === "finished";
}
