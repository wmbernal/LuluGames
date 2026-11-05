const GAME_PHASES = Object.freeze({
  READY: "ready",
  ONE_FLIPPED: "oneFlipped",
  CHECKING: "checking",
  PEEKING: "peeking",
  FINISHED: "finished",
});

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

export function createDeck(mode, pairCount, random = Math.random) {
  if (!mode || !Array.isArray(mode.pairs) || !Number.isInteger(pairCount) || pairCount < 1) {
    throw new TypeError("A valid pair mode and positive pair count are required.");
  }
  if (mode.pairs.length < pairCount) {
    throw new RangeError("The selected mode does not contain enough pairs.");
  }

  const chosenPairs = shuffleCards(mode.pairs, random).slice(0, pairCount);
  const cards = chosenPairs.flatMap((pair) => {
    if (!pair.pairId || !Array.isArray(pair.cards) || pair.cards.length < 1 || pair.cards.length > 2) {
      throw new TypeError(`Pair "${pair.pairId ?? "unknown"}" must have one or two card faces.`);
    }

    const faces = pair.cards.length === 1 ? [pair.cards[0], pair.cards[0]] : pair.cards;
    if (faces.length !== 2 || faces.some((face) => !face.image || !face.label)) {
      throw new TypeError(`Pair "${pair.pairId}" must define card images and labels.`);
    }

    return faces.map((face, index) => ({
      id: `${pair.pairId}-${index + 1}`,
      pairId: pair.pairId,
      image: face.image,
      label: face.label,
      faceUp: false,
      matched: false,
    }));
  });
  return shuffleCards(cards, random);
}

export function createGameState(deck, peek = false) {
  if (!Array.isArray(deck) || deck.length < 2 || deck.length % 2 !== 0) {
    throw new TypeError("A game deck must contain at least one pair.");
  }
  return {
    phase: peek ? GAME_PHASES.PEEKING : GAME_PHASES.READY,
    cards: deck.map((card) => ({ ...card, faceUp: peek, matched: false })),
    openCardIds: [],
    matchedPairs: 0,
    totalPairs: deck.length / 2,
    hintCardId: null,
    feedback: "",
  };
}

export function flipCard(state, cardId) {
  if (![GAME_PHASES.READY, GAME_PHASES.ONE_FLIPPED].includes(state.phase)) {
    return state;
  }
  const card = state.cards.find((entry) => entry.id === cardId);
  if (!card || card.faceUp || card.matched) {
    return state;
  }

  const cards = state.cards.map((entry) => (
    entry.id === cardId ? { ...entry, faceUp: true } : entry
  ));
  if (state.phase === GAME_PHASES.READY) {
    return {
      ...state,
      phase: GAME_PHASES.ONE_FLIPPED,
      cards,
      openCardIds: [cardId],
      hintCardId: null,
      feedback: "",
    };
  }

  const firstCardId = state.openCardIds[0];
  const firstCard = cards.find((entry) => entry.id === firstCardId);
  if (firstCard.pairId !== card.pairId) {
    return {
      ...state,
      phase: GAME_PHASES.CHECKING,
      cards,
      openCardIds: [firstCardId, cardId],
      hintCardId: null,
      feedback: "",
    };
  }

  const matchedCards = cards.map((entry) => (
    entry.pairId === card.pairId ? { ...entry, matched: true } : entry
  ));
  const matchedPairs = state.matchedPairs + 1;
  return {
    ...state,
    phase: matchedPairs === state.totalPairs ? GAME_PHASES.FINISHED : GAME_PHASES.READY,
    cards: matchedCards,
    openCardIds: [],
    matchedPairs,
    hintCardId: null,
    feedback: "Você encontrou um par!",
  };
}

export function resolveMismatch(state) {
  if (state.phase !== GAME_PHASES.CHECKING) {
    return state;
  }
  const openIds = new Set(state.openCardIds);
  return {
    ...state,
    phase: GAME_PHASES.READY,
    cards: state.cards.map((card) => (
      openIds.has(card.id) ? { ...card, faceUp: false } : card
    )),
    openCardIds: [],
    hintCardId: null,
    feedback: "",
  };
}

export function endPeek(state) {
  if (state.phase !== GAME_PHASES.PEEKING) {
    return state;
  }
  return {
    ...state,
    phase: GAME_PHASES.READY,
    cards: state.cards.map((card) => ({ ...card, faceUp: false })),
    feedback: "",
  };
}

export function getHintCardId(state) {
  const availableCard = state.cards.find((card) => !card.matched && !card.faceUp);
  if (availableCard) {
    return availableCard.id;
  }
  return state.cards.find((card) => !card.matched)?.id ?? null;
}

export function isGameFinished(state) {
  return state.phase === GAME_PHASES.FINISHED;
}
