function isFilled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeWord(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function validateQuestion(question, level, questionIds) {
  const problems = [];
  const id = isFilled(question?.id) ? question.id : "(pergunta sem id)";
  if (!isFilled(question?.id)) problems.push(`${level.id}: pergunta sem id`);
  else if (questionIds.has(question.id)) problems.push(`${id}: id de pergunta repetido`);
  else questionIds.add(question.id);

  if (question?.level !== level.id) problems.push(`${id}: nível diferente de ${level.id}`);
  if (!isFilled(question?.imageId)) problems.push(`${id}: sem identificador de imagem`);
  if (!isFilled(question?.image)) problems.push(`${id}: sem imagem`);
  if (!isFilled(question?.imageQuery)) problems.push(`${id}: sem consulta de imagem`);
  if (!isFilled(question?.alt)) problems.push(`${id}: sem texto alternativo`);
  if (!isFilled(question?.sentence)) problems.push(`${id}: sem frase completa`);
  if (!isFilled(question?.difficulty)) problems.push(`${id}: sem dificuldade`);

  const words = Array.isArray(question?.words) ? question.words : [];
  if (words.length !== level.wordCount) {
    problems.push(`${id}: precisa de ${level.wordCount} palavras`);
  }
  if (words.some((word) => !isFilled(word))) problems.push(`${id}: palavra vazia`);
  const normalizedWords = words.filter(isFilled).map(normalizeWord);
  if (new Set(normalizedWords).size !== normalizedWords.length) {
    problems.push(`${id}: palavras repetidas`);
  }
  if (isFilled(question?.sentence)
    && normalizeWord(question.sentence) !== normalizeWord(words.join(" "))) {
    problems.push(`${id}: a frase precisa corresponder às palavras na ordem correta`);
  }

  const alternativeOrders = question?.alternativeOrders ?? [];
  if (!Array.isArray(alternativeOrders)) {
    problems.push(`${id}: ordens alternativas precisam ser uma lista`);
  } else {
    for (const [orderIndex, order] of alternativeOrders.entries()) {
      const validWords = Array.isArray(order) && order.every(isFilled);
      const normalizedOrder = validWords ? order.map(normalizeWord) : [];
      if (!validWords || normalizedOrder.length !== words.length
        || new Set(normalizedOrder).size !== words.length
        || normalizedOrder.some((word) => !normalizedWords.includes(word))) {
        problems.push(`${id}: ordem alternativa ${orderIndex + 1} não usa cada palavra uma vez`);
      }
    }
  }
  return problems;
}

export function validateContent(content) {
  if (content === null || typeof content !== "object") {
    return ["content.json precisa ser um objeto"];
  }
  const levels = Array.isArray(content.levels) ? content.levels : [];
  if (!isFilled(content.title) || levels.length === 0) {
    return ["content.json precisa de título e pelo menos um nível"];
  }

  const problems = [];
  const levelIds = new Set();
  const questionIds = new Set();
  for (const level of levels) {
    if (!isFilled(level?.id)) {
      problems.push("(nível sem id): todo nível precisa de id");
      continue;
    }
    if (levelIds.has(level.id)) problems.push(`${level.id}: id de nível repetido`);
    levelIds.add(level.id);
    if (!isFilled(level.label) || !isFilled(level.description)) {
      problems.push(`${level.id}: nível sem nome ou descrição`);
    }
    if (!Number.isInteger(level.wordCount) || level.wordCount < 2) {
      problems.push(`${level.id}: quantidade de palavras inválida`);
    }
    const questions = Array.isArray(level.questions) ? level.questions : [];
    if (!Number.isInteger(level.questionsPerRound)
      || level.questionsPerRound < 1
      || level.questionsPerRound > questions.length) {
      problems.push(`${level.id}: perguntas insuficientes para uma rodada`);
    }
    for (const question of questions) {
      problems.push(...validateQuestion(question, level, questionIds));
    }
  }
  return problems;
}

export function pickQuestions(questions, count, random = Math.random) {
  if (!Array.isArray(questions) || !Number.isInteger(count) || count < 1 || count > questions.length) {
    throw new RangeError("A rodada precisa de perguntas suficientes para o número pedido.");
  }
  const shuffled = questions.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function acceptableOrders(question) {
  const words = question.words;
  const indexes = new Map(words.map((word, index) => [normalizeWord(word), index]));
  return [
    words.map((_, index) => index),
    ...(question.alternativeOrders ?? []).map((order) => order.map((word) => indexes.get(normalizeWord(word)))),
  ];
}

function questionState(question, roundIndex, questions, levelId, random) {
  const bankOrder = question.words.map((_, index) => index);
  for (let index = bankOrder.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [bankOrder[index], bankOrder[swapWith]] = [bankOrder[swapWith], bankOrder[index]];
  }
  return {
    levelId,
    phase: "playing",
    questions,
    rounds: questions.length,
    roundIndex,
    bankOrder,
    placements: Array(question.words.length).fill(null),
    candidateOrders: acceptableOrders(question),
    mistakes: 0,
    feedback: "",
    feedbackKind: "",
    lastAttempt: null,
  };
}

export function createSession(level, random = Math.random) {
  const problems = validateContent({ title: "Jogo", levels: [level] });
  if (problems.length > 0) throw new TypeError(`Nível inválido: ${problems[0]}`);
  const questions = pickQuestions(level.questions, level.questionsPerRound, random);
  return questionState(questions[0], 0, questions, level.id, random);
}

export function currentQuestion(state) {
  return state.questions[state.roundIndex];
}

export function findNextEmptySlot(placements) {
  return placements.findIndex((placement) => placement === null);
}

export function placeWord(state, wordIndex, slotIndex) {
  if (state.phase !== "playing") return state;
  const question = currentQuestion(state);
  if (!Number.isInteger(wordIndex) || wordIndex < 0 || wordIndex >= question.words.length) {
    throw new RangeError("A palavra escolhida não existe nesta pergunta.");
  }
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new RangeError("O espaço escolhido não existe nesta pergunta.");
  }
  if (state.placements.includes(wordIndex)) {
    throw new RangeError("Essa palavra já está em um espaço.");
  }
  if (state.placements[slotIndex] !== null) {
    throw new RangeError("Esse espaço já está preenchido.");
  }

  const matchingOrders = state.candidateOrders.filter((order) => order[slotIndex] === wordIndex);
  if (matchingOrders.length === 0) {
    return {
      ...state,
      mistakes: state.mistakes + 1,
      feedback: "Tudo bem! Essa palavra voltou para a lista. Tente outro espaço.",
      feedbackKind: "error",
      lastAttempt: { wordIndex, slotIndex },
    };
  }

  const placements = state.placements.slice();
  placements[slotIndex] = wordIndex;
  const complete = placements.every((placement) => placement !== null);
  return {
    ...state,
    phase: complete ? "correct" : "playing",
    placements,
    candidateOrders: matchingOrders,
    feedback: complete
      ? "Muito bem! A frase está completa."
      : "Isso! Essa palavra está no lugar certo.",
    feedbackKind: "success",
    lastAttempt: null,
  };
}

export function nextRound(state, random = Math.random) {
  if (state.phase !== "correct") return state;
  if (state.roundIndex + 1 === state.rounds) return { ...state, phase: "complete" };
  const nextIndex = state.roundIndex + 1;
  return questionState(state.questions[nextIndex], nextIndex, state.questions, state.levelId, random);
}
